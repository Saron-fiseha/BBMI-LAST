-- Ensure students table exists with proper structure
-- Drop and recreate if needed to ensure consistency

DROP TABLE IF EXISTS students CASCADE;
DROP SEQUENCE IF EXISTS students_roll_seq CASCADE;
DROP FUNCTION IF EXISTS generate_student_identifiers() CASCADE;

-- Create students table with all required columns
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
    
    -- Update timestamp
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generation
CREATE TRIGGER trigger_generate_student_identifiers
    BEFORE INSERT OR UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION generate_student_identifiers();

-- Create indexes for better performance
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Insert some sample data for testing
INSERT INTO users (name, email, password, role, phone, age, gender, status, created_at, updated_at) VALUES
('John Doe', 'john.doe@example.com', 'hashed_password_123', 'student', '+1234567890', 25, 'male', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Jane Smith', 'jane.smith@example.com', 'hashed_password_456', 'student', '+1234567891', 23, 'female', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mike Johnson', 'mike.johnson@example.com', 'hashed_password_789', 'student', '+1234567892', 27, 'male', 'inactive', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
WHERE u.role = 'student'
ON CONFLICT (user_id) DO NOTHING;

-- Verify setup
SELECT 'Database setup completed successfully' as message;
SELECT COUNT(*) as total_students FROM students;
SELECT COUNT(*) as total_student_users FROM users WHERE role = 'student';

-- Show sample data
SELECT 
    s.roll_number,
    s.id_number,
    u.name,
    u.email,
    u.phone,
    u.age,
    u.gender,
    s.courses_enrolled,
    s.courses_completed,
    s.total_hours,
    s.status
FROM students s
JOIN users u ON s.user_id = u.id
ORDER BY s.roll_number
LIMIT 5;
