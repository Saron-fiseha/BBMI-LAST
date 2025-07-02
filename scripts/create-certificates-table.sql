-- Create certificates table if it doesn't exist
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    certificate_code VARCHAR(100) UNIQUE NOT NULL,
    verification_code VARCHAR(100) UNIQUE NOT NULL,
    instructor_name VARCHAR(255) NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_certificates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_certificates_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_code ON certificates(certificate_code);

-- Update enrollments table to track certificate status
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS certificate_issued BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS certificate_date TIMESTAMP NULL;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_certificates_updated_at();

-- Insert sample certificate data for testing (optional)
INSERT INTO certificates (user_id, course_id, certificate_code, verification_code, instructor_name)
VALUES 
    (1, 1, 'BBMI-DEMO-2024-001', 'VER-DEMO123ABC', 'Demo Instructor'),
    (1, 2, 'BBMI-DEMO-2024-002', 'VER-DEMO456DEF', 'Sample Teacher')
ON CONFLICT (certificate_code) DO NOTHING;

-- Update corresponding enrollments to mark certificates as issued
UPDATE enrollments 
SET certificate_issued = TRUE, certificate_date = CURRENT_TIMESTAMP
WHERE user_id = 1 AND course_id IN (1, 2) AND progress = 100;
