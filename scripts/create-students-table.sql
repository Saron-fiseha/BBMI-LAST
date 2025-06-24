-- Create students table for comprehensive student management
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    roll_number INTEGER UNIQUE,
    id_number VARCHAR(20) UNIQUE,
    courses_enrolled INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    total_hours INTEGER DEFAULT 0,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for roll numbers starting from 1
CREATE SEQUENCE IF NOT EXISTS students_roll_seq START 1;

-- Create function to auto-generate roll number and id_number
CREATE OR REPLACE FUNCTION generate_student_identifiers()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate roll number
    IF NEW.roll_number IS NULL THEN
        NEW.roll_number := nextval('students_roll_seq');
    END IF;
    
    -- Generate id_number (ST-01, ST-02, etc.)
    IF NEW.id_number IS NULL THEN
        NEW.id_number := 'ST-' || LPAD(NEW.roll_number::text, 2, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate identifiers
DROP TRIGGER IF EXISTS trigger_generate_student_identifiers ON students;
CREATE TRIGGER trigger_generate_student_identifiers
    BEFORE INSERT ON students
    FOR EACH ROW
    EXECUTE FUNCTION generate_student_identifiers();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);

-- Update users table to add missing columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Update existing users to have default status
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Add indexes to users table for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);

-- Insert sample data for testing (optional)
-- This will create corresponding student records for existing users with role 'student'
INSERT INTO students (user_id, courses_enrolled, courses_completed, total_hours, last_active, status)
SELECT 
    id as user_id,
    FLOOR(RANDOM() * 5 + 1) as courses_enrolled,
    FLOOR(RANDOM() * 3) as courses_completed,
    FLOOR(RANDOM() * 100 + 10) as total_hours,
    CURRENT_TIMESTAMP - INTERVAL '1 day' * FLOOR(RANDOM() * 30) as last_active,
    'active' as status
FROM users 
WHERE role = 'student' OR role IS NULL
ON CONFLICT (user_id) DO NOTHING;
