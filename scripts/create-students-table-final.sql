-- First, check if students table exists and drop it if needed
DROP TABLE IF EXISTS students CASCADE;
DROP SEQUENCE IF EXISTS students_roll_seq CASCADE;
DROP FUNCTION IF EXISTS generate_student_identifiers() CASCADE;

-- Ensure users table has all required columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Update existing users to have default status if null
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Create students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roll_number INTEGER UNIQUE NOT NULL,
    id_number VARCHAR(20) UNIQUE NOT NULL,
    courses_enrolled INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    total_hours INTEGER DEFAULT 0,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for roll numbers
CREATE SEQUENCE students_roll_seq START 1;

-- Create function to generate roll number and id_number
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
    
    -- Update timestamp
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_generate_student_identifiers
    BEFORE INSERT OR UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION generate_student_identifiers();

-- Create indexes for performance
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Insert sample students for existing users with role 'student'
INSERT INTO students (user_id, courses_enrolled, courses_completed, total_hours, status)
SELECT 
    u.id,
    FLOOR(RANDOM() * 5 + 1)::INTEGER,
    FLOOR(RANDOM() * 3)::INTEGER,
    FLOOR(RANDOM() * 100 + 10)::INTEGER,
    'active'
FROM users u
WHERE u.role = 'student'
ON CONFLICT (user_id) DO NOTHING;

-- If no students exist, create some sample data
INSERT INTO users (name, email, password, role, status, created_at) VALUES
('John Doe', 'john.doe@example.com', 'hashed_password', 'student', 'active', CURRENT_TIMESTAMP),
('Jane Smith', 'jane.smith@example.com', 'hashed_password', 'student', 'active', CURRENT_TIMESTAMP),
('Mike Johnson', 'mike.johnson@example.com', 'hashed_password', 'student', 'inactive', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Create student records for the sample users
INSERT INTO students (user_id, courses_enrolled, courses_completed, total_hours, status)
SELECT 
    u.id,
    FLOOR(RANDOM() * 5 + 1)::INTEGER,
    FLOOR(RANDOM() * 3)::INTEGER,
    FLOOR(RANDOM() * 100 + 10)::INTEGER,
    u.status
FROM users u
WHERE u.role = 'student' AND u.email IN ('john.doe@example.com', 'jane.smith@example.com', 'mike.johnson@example.com')
ON CONFLICT (user_id) DO NOTHING;

-- Verify the setup
SELECT 'Students table created successfully' as message;
SELECT COUNT(*) as total_students FROM students;
SELECT COUNT(*) as total_users_with_student_role FROM users WHERE role = 'student';
