-- First, ensure the users table has all required columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Update existing users to have default status
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Drop existing students table if it exists (to recreate with proper structure)
DROP TABLE IF EXISTS students CASCADE;

-- Drop existing sequences and functions
DROP SEQUENCE IF EXISTS students_roll_seq CASCADE;
DROP FUNCTION IF EXISTS generate_student_identifiers() CASCADE;

-- Create students table with proper structure
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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
CREATE SEQUENCE students_roll_seq START 1;

-- Create function to auto-generate roll number and id_number
CREATE OR REPLACE FUNCTION generate_student_identifiers()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate roll number if not provided
    IF NEW.roll_number IS NULL THEN
        NEW.roll_number := nextval('students_roll_seq');
    END IF;
    
    -- Generate id_number (ST-01, ST-02, etc.)
    IF NEW.id_number IS NULL THEN
        NEW.id_number := 'ST-' || LPAD(NEW.roll_number::text, 2, '0');
    END IF;
    
    -- Set updated_at timestamp
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate identifiers
CREATE TRIGGER trigger_generate_student_identifiers
    BEFORE INSERT OR UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION generate_student_identifiers();

-- Add indexes for better performance
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_gender ON users(gender);

-- Insert sample students for existing users with role 'student'
INSERT INTO students (user_id, courses_enrolled, courses_completed, total_hours, last_active, status)
SELECT 
    u.id as user_id,
    FLOOR(RANDOM() * 5 + 1)::INTEGER as courses_enrolled,
    FLOOR(RANDOM() * 3)::INTEGER as courses_completed,
    FLOOR(RANDOM() * 100 + 10)::INTEGER as total_hours,
    CURRENT_TIMESTAMP - INTERVAL '1 day' * FLOOR(RANDOM() * 30) as last_active,
    'active' as status
FROM users u
WHERE u.role = 'student'
ON CONFLICT (user_id) DO NOTHING;

-- Verify the setup
SELECT 'Students table created successfully' as status;
SELECT COUNT(*) as student_count FROM students;
