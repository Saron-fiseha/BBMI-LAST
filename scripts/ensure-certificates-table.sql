-- Ensure certificates table exists with proper structure
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    training_id INTEGER NOT NULL,
    enrollment_id INTEGER NOT NULL,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    verification_code VARCHAR(20) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    training_title VARCHAR(255) NOT NULL,
    instructor_name VARCHAR(255) NOT NULL,
    completion_date VARCHAR(50) NOT NULL,
    pdf_url TEXT,
    pdf_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_training_id ON certificates(training_id);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);

-- Ensure enrollments table has certificate tracking columns
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS certificate_issued BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMP NULL;

-- Add sample data if certificates table is empty (for testing)
INSERT INTO certificates (
    user_id, training_id, enrollment_id, certificate_number, verification_code,
    user_name, training_title, instructor_name, completion_date, pdf_generated
) 
SELECT 1, 1, 1, 'BBMI-202501-0001', 'VERIFY123456', 'Test User', 'Sample Training', 'Ms Betelhem', 'January 1, 2025', true
WHERE NOT EXISTS (SELECT 1 FROM certificates LIMIT 1);
