-- Add user_id column to instructors table
ALTER TABLE instructors 
ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Add foreign key constraint for user_id
ALTER TABLE instructors 
ADD CONSTRAINT fk_instructors_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_instructors_user_id ON instructors(user_id);

-- Update existing instructors with user_id from users table where email matches
UPDATE instructors 
SET user_id = (
    SELECT u.id 
    FROM users u 
    WHERE u.email = instructors.email 
    AND u.role = 'instructor'
    LIMIT 1
)
WHERE user_id IS NULL;

-- Create trigger to automatically sync instructors when users with role 'instructor' are created
CREATE OR REPLACE FUNCTION sync_instructor_from_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'instructor' THEN
        INSERT INTO instructors (
            user_id, 
            name,               
            email, 
            phone, 
            specialization, 
            experience, 
            status, 
            password_hash, 
            created_at, 
            updated_at
        ) VALUES (
            NEW.id, 
            NEW.full_name,     
            NEW.email, 
            NEW.phone, 
            'General', 
            0, 
            'active', 
            NEW.password_hash, 
            NOW(), 
            NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
            user_id = NEW.id,
            name = NEW.full_name,  
            phone = NEW.phone,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT on users table


-- Create triggeDROP TRIGGER IF EXISTS trigger_sync_instructor_from_user ON users;
CREATE TRIGGER trigger_sync_instructor_from_user
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_instructor_from_user();r to automatically create user when instructor is created
CREATE OR REPLACE FUNCTION sync_user_from_instructor()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        INSERT INTO users (
            full_name,         
            email, 
            phone, 
            role, 
            password_hash, 
            created_at, 
            updated_at
        ) VALUES (
            NEW.name,         
            NEW.phone, 
            'instructor', 
            NEW.password_hash, 
            NOW(), 
            NOW()
        )
        RETURNING id INTO NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT on instructors table
DROP TRIGGER IF EXISTS trigger_sync_user_from_instructor ON instructors;
CREATE TRIGGER trigger_sync_user_from_instructor
    BEFORE INSERT ON instructors
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_from_instructor();
