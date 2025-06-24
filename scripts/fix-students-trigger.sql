-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_generate_student_identifiers ON students;
DROP FUNCTION IF EXISTS generate_student_identifiers();
DROP SEQUENCE IF EXISTS students_roll_seq;

-- Create sequence for roll numbers
CREATE SEQUENCE students_roll_seq START 1;

-- Create improved function to generate roll number and id_number
CREATE OR REPLACE FUNCTION generate_student_identifiers()
RETURNS TRIGGER AS $$
BEGIN
    -- Always generate roll number if it's NULL
    IF NEW.roll_number IS NULL THEN
        NEW.roll_number := nextval('students_roll_seq');
    END IF;
    
    -- Always generate id_number if it's NULL
    IF NEW.id_number IS NULL THEN
        NEW.id_number := 'ST-' || LPAD(NEW.roll_number::text, 2, '0');
    END IF;
    
    -- Update timestamp
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires BEFORE INSERT
CREATE TRIGGER trigger_generate_student_identifiers
    BEFORE INSERT ON students
    FOR EACH ROW
    EXECUTE FUNCTION generate_student_identifiers();

-- Reset sequence to start from the next available number
SELECT setval('students_roll_seq', COALESCE((SELECT MAX(roll_number) FROM students), 0) + 1, false);

-- Test the trigger by inserting a test record (will be deleted)
DO $$
DECLARE
    test_user_id INTEGER;
BEGIN
    -- Create a temporary test user
    INSERT INTO users (name, email, password, role, status, created_at, updated_at)
    VALUES ('Test User', 'test@example.com', 'test_password', 'student', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id INTO test_user_id;
    
    -- Test the trigger
    INSERT INTO students (user_id, status, join_date, last_active, created_at, updated_at)
    VALUES (test_user_id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    
    -- Clean up test data
    DELETE FROM students WHERE user_id = test_user_id;
    DELETE FROM users WHERE id = test_user_id;
    
    RAISE NOTICE 'Trigger test completed successfully';
END $$;

-- Show current state
SELECT 'Trigger setup completed' as status;
