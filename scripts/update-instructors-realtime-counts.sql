-- Add new columns to instructors table for real-time counts
ALTER TABLE instructors 
ADD COLUMN IF NOT EXISTS trainings_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS students_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trainings_instructor_id ON trainings(instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_training_id ON enrollments(training_id);

-- Function to update instructor training and student counts
CREATE OR REPLACE FUNCTION update_instructor_counts()
RETURNS TRIGGER AS $$
DECLARE
    instructor_record RECORD;
BEGIN
    -- Get the instructor_id from the affected training
    IF TG_OP = 'DELETE' THEN
        -- Update counts for the deleted training's instructor
        UPDATE instructors 
        SET 
            trainings_count = (
                SELECT COUNT(*) 
                FROM trainings t 
                WHERE t.instructor_id = OLD.instructor_id
            ),
            students_count = (
                SELECT COUNT(DISTINCT e.student_id)
                FROM trainings t
                LEFT JOIN enrollments e ON t.id = e.training_id
                WHERE t.instructor_id = OLD.instructor_id
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.instructor_id;
        
        RETURN OLD;
    ELSE
        -- Update counts for the new/updated training's instructor
        UPDATE instructors 
        SET 
            trainings_count = (
                SELECT COUNT(*) 
                FROM trainings t 
                WHERE t.instructor_id = NEW.instructor_id
            ),
            students_count = (
                SELECT COUNT(DISTINCT e.student_id)
                FROM trainings t
                LEFT JOIN enrollments e ON t.id = e.training_id
                WHERE t.instructor_id = NEW.instructor_id
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.instructor_id;
        
        -- If instructor_id changed, also update the old instructor
        IF TG_OP = 'UPDATE' AND OLD.instructor_id != NEW.instructor_id THEN
            UPDATE instructors 
            SET 
                trainings_count = (
                    SELECT COUNT(*) 
                    FROM trainings t 
                    WHERE t.instructor_id = OLD.instructor_id
                ),
                students_count = (
                    SELECT COUNT(DISTINCT e.student_id)
                    FROM trainings t
                    LEFT JOIN enrollments e ON t.id = e.training_id
                    WHERE t.instructor_id = OLD.instructor_id
                ),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = OLD.instructor_id;
        END IF;
        
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update instructor student counts when enrollments change
CREATE OR REPLACE FUNCTION update_instructor_student_counts()
RETURNS TRIGGER AS $$
DECLARE
    training_instructor_id INTEGER;
BEGIN
    -- Get instructor_id from the training
    IF TG_OP = 'DELETE' THEN
        SELECT instructor_id INTO training_instructor_id 
        FROM trainings WHERE id = OLD.training_id;
    ELSE
        SELECT instructor_id INTO training_instructor_id 
        FROM trainings WHERE id = NEW.training_id;
    END IF;
    
    -- Update student count for the instructor
    IF training_instructor_id IS NOT NULL THEN
        UPDATE instructors 
        SET 
            students_count = (
                SELECT COUNT(DISTINCT e.student_id)
                FROM trainings t
                LEFT JOIN enrollments e ON t.id = e.training_id
                WHERE t.instructor_id = training_instructor_id
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = training_instructor_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for trainings table
DROP TRIGGER IF EXISTS trigger_update_instructor_counts_insert ON trainings;
CREATE TRIGGER trigger_update_instructor_counts_insert
    AFTER INSERT ON trainings
    FOR EACH ROW
    EXECUTE FUNCTION update_instructor_counts();

DROP TRIGGER IF EXISTS trigger_update_instructor_counts_update ON trainings;
CREATE TRIGGER trigger_update_instructor_counts_update
    AFTER UPDATE ON trainings
    FOR EACH ROW
    EXECUTE FUNCTION update_instructor_counts();

DROP TRIGGER IF EXISTS trigger_update_instructor_counts_delete ON trainings;
CREATE TRIGGER trigger_update_instructor_counts_delete
    AFTER DELETE ON trainings
    FOR EACH ROW
    EXECUTE FUNCTION update_instructor_counts();

-- Create triggers for enrollments table
DROP TRIGGER IF EXISTS trigger_update_instructor_student_counts_insert ON enrollments;
CREATE TRIGGER trigger_update_instructor_student_counts_insert
    AFTER INSERT ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_instructor_student_counts();

DROP TRIGGER IF EXISTS trigger_update_instructor_student_counts_delete ON enrollments;
CREATE TRIGGER trigger_update_instructor_student_counts_delete
    AFTER DELETE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_instructor_student_counts();

-- Initialize existing instructor counts
UPDATE instructors 
SET 
    trainings_count = (
        SELECT COUNT(*) 
        FROM trainings t 
        WHERE t.instructor_id = instructors.id
    ),
    students_count = (
        SELECT COUNT(DISTINCT e.student_id)
        FROM trainings t
        LEFT JOIN enrollments e ON t.id = e.training_id
        WHERE t.instructor_id = instructors.id
    ),
    updated_at = CURRENT_TIMESTAMP;

-- Enhanced sync function to handle users with instructor role
CREATE OR REPLACE FUNCTION sync_instructor_from_user_enhanced()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'instructor' THEN
        INSERT INTO instructors (
            user_id, name, email, phone, specialization, 
            experience, status, password_hash, trainings_count, 
            students_count, created_at, updated_at
        ) VALUES (
            NEW.id, NEW.full_name, NEW.email, NEW.phone, 
            COALESCE(NEW.specialization, 'General'), 
            0, 'active', NEW.password_hash, 0, 0, NOW(), NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
            user_id = NEW.id,
            name = NEW.full_name,
            phone = NEW.phone,
            specialization = COALESCE(NEW.specialization, instructors.specialization),
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the trigger for users table
DROP TRIGGER IF EXISTS trigger_sync_instructor_from_user ON users;
CREATE TRIGGER trigger_sync_instructor_from_user
    AFTER INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_instructor_from_user_enhanced();
