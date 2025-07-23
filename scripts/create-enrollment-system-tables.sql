-- -- Create payments table for Telebirr transactions
-- CREATE TABLE IF NOT EXISTS payments (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     training_id INTEGER NOT NULL,
--     amount DECIMAL(10,2) NOT NULL,
--     currency VARCHAR(3) DEFAULT 'ETB',
--     telebirr_transaction_id VARCHAR(255) UNIQUE,
--     telebirr_reference_number VARCHAR(255),
--     payment_method VARCHAR(50) DEFAULT 'telebirr',
--     status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
--     payment_data JSONB DEFAULT '{}',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     completed_at TIMESTAMP
-- );

-- -- Update enrollments table for comprehensive enrollment tracking
-- DROP TABLE IF EXISTS enrollments CASCADE;
-- CREATE TABLE enrollments (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     training_id INTEGER NOT NULL,
--     payment_id INTEGER REFERENCES payments(id),
--     status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'suspended')),
--     progress_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
--     enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     completed_at TIMESTAMP,
--     last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     certificate_issued BOOLEAN DEFAULT FALSE,
--     certificate_issued_at TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(user_id, training_id)
-- );

-- -- Create lesson progress tracking table
-- CREATE TABLE IF NOT EXISTS lesson_progress (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     training_id INTEGER NOT NULL,
--     lesson_id INTEGER NOT NULL,
--     status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
--     progress_percentage DECIMAL(5,2) DEFAULT 0.00,
--     time_spent_minutes INTEGER DEFAULT 0,
--     started_at TIMESTAMP,
--     completed_at TIMESTAMP,
--     last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(user_id, training_id, lesson_id)
-- );

-- -- Create certificates table
-- CREATE TABLE IF NOT EXISTS certificates (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     training_id INTEGER NOT NULL,
--     enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
--     certificate_number VARCHAR(100) UNIQUE NOT NULL,
--     verification_code VARCHAR(100) UNIQUE NOT NULL,
--     user_name VARCHAR(255) NOT NULL,
--     training_title VARCHAR(255) NOT NULL,
--     instructor_name VARCHAR(255) NOT NULL,
--     completion_date DATE NOT NULL,
--     issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     pdf_url TEXT,
--     pdf_generated BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(user_id, training_id)
-- );

-- -- Create training lessons table (if not exists)
-- CREATE TABLE IF NOT EXISTS training_lessons (
--     id SERIAL PRIMARY KEY,
--     training_id INTEGER NOT NULL,
--     title VARCHAR(255) NOT NULL,
--     description TEXT,
--     content TEXT,
--     video_url TEXT,
--     duration_minutes INTEGER DEFAULT 0,
--     order_index INTEGER NOT NULL,
--     is_required BOOLEAN DEFAULT TRUE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Create indexes for better performance
-- CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
-- CREATE INDEX IF NOT EXISTS idx_payments_training_id ON payments(training_id);
-- CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
-- CREATE INDEX IF NOT EXISTS idx_payments_telebirr_transaction_id ON payments(telebirr_transaction_id);

-- CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
-- CREATE INDEX IF NOT EXISTS idx_enrollments_training_id ON enrollments(training_id);
-- CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
-- CREATE INDEX IF NOT EXISTS idx_enrollments_payment_id ON enrollments(payment_id);

-- CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_training ON lesson_progress(user_id, training_id);
-- CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
-- CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress(status);

-- CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
-- CREATE INDEX IF NOT EXISTS idx_certificates_training_id ON certificates(training_id);
-- CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);

-- CREATE INDEX IF NOT EXISTS idx_training_lessons_training_id ON training_lessons(training_id);
-- CREATE INDEX IF NOT EXISTS idx_training_lessons_order ON training_lessons(training_id, order_index);

-- -- Insert sample lessons for existing trainings
-- INSERT INTO training_lessons (training_id, title, description, duration_minutes, order_index) VALUES
-- (1, 'Introduction to Advanced Makeup', 'Learn the fundamentals of advanced makeup techniques', 45, 1),
-- (1, 'Color Theory and Application', 'Understanding color theory in makeup artistry', 60, 2),
-- (1, 'Contouring Techniques', 'Master the art of contouring and highlighting', 75, 3),
-- (1, 'Eye Makeup Mastery', 'Advanced eye makeup techniques and styles', 90, 4),
-- (1, 'Final Project and Assessment', 'Complete your final makeup project', 120, 5),

-- (2, 'Hair Cutting Fundamentals', 'Basic hair cutting techniques and tools', 60, 1),
-- (2, 'Styling Techniques', 'Various hair styling methods and approaches', 75, 2),
-- (2, 'Color Application', 'Hair coloring techniques and safety', 90, 3),
-- (2, 'Advanced Styling', 'Complex styling for special occasions', 105, 4),

-- (3, 'Skin Analysis Basics', 'Understanding different skin types and conditions', 40, 1),
-- (3, 'Facial Treatment Techniques', 'Professional facial treatment methods', 80, 2),
-- (3, 'Product Knowledge', 'Understanding skincare products and ingredients', 50, 3),
-- (3, 'Advanced Treatments', 'Specialized skincare treatments', 90, 4)
-- ON CONFLICT DO NOTHING;

-- -- Create trigger to update updated_at timestamp
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = CURRENT_TIMESTAMP;
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- -- Apply triggers to tables
-- DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
-- CREATE TRIGGER update_payments_updated_at
--     BEFORE UPDATE ON payments
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
-- CREATE TRIGGER update_enrollments_updated_at
--     BEFORE UPDATE ON enrollments
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;
-- CREATE TRIGGER update_lesson_progress_updated_at
--     BEFORE UPDATE ON lesson_progress
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
-- CREATE TRIGGER update_certificates_updated_at
--     BEFORE UPDATE ON certificates
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- -- Success message
-- SELECT 'Enrollment system tables created successfully!' as result;


-- Create enrollments table

-- Create enrollments table
-- Create enrollment system tables
-- Run this script to set up the complete enrollment system

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    training_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'suspended')),
    progress DECIMAL(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, training_id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    training_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    telebirr_transaction_id VARCHAR(255),
    telebirr_reference_number VARCHAR(255),
    payment_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent INTEGER DEFAULT 0, -- in seconds
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, lesson_id)
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    training_id UUID NOT NULL,
    enrollment_id UUID NOT NULL,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    pdf_path VARCHAR(500),
    pdf_url VARCHAR(500),
    verification_code VARCHAR(100) UNIQUE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, training_id)
);

-- Create lessons table (if not exists)
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    video_url VARCHAR(500),
    duration INTEGER DEFAULT 0, -- in seconds
    order_index INTEGER NOT NULL,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID NOT NULL,
    lesson_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL,
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 3,
    time_limit INTEGER, -- in minutes
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL,
    quiz_id UUID NOT NULL,
    answers JSONB NOT NULL,
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    attempt_number INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_taken INTEGER -- in seconds
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_training_id ON enrollments(training_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_training_id ON payments(training_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_telebirr_transaction_id ON payments(telebirr_transaction_id);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment_id ON lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_training_id ON certificates(training_id);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);

CREATE INDEX IF NOT EXISTS idx_lessons_training_id ON lessons(training_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(order_index);

CREATE INDEX IF NOT EXISTS idx_quizzes_training_id ON quizzes(training_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_enrollment_id ON quiz_attempts(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);

-- Add triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample lessons for existing trainings
INSERT INTO lessons (training_id, title, description, content, duration, order_index, is_preview)
SELECT 
    t.id,
    'Introduction to ' || t.name,
    'Welcome to the ' || t.name || ' course. In this lesson, you will learn the fundamentals.',
    'This is the introductory content for ' || t.name || '. Here you will discover the key concepts and objectives of this training program.',
    1800, -- 30 minutes
    1,
    true
FROM trainings t
WHERE NOT EXISTS (
    SELECT 1 FROM lessons l WHERE l.training_id = t.id
)
LIMIT 10;

-- Insert additional lessons
INSERT INTO lessons (training_id, title, description, content, duration, order_index, is_preview)
SELECT 
    t.id,
    'Core Concepts of ' || t.name,
    'Deep dive into the core concepts and principles.',
    'In this lesson, we explore the fundamental principles and core concepts that form the foundation of ' || t.name || '.',
    2700, -- 45 minutes
    2,
    false
FROM trainings t
WHERE EXISTS (
    SELECT 1 FROM lessons l WHERE l.training_id = t.id AND l.order_index = 1
)
LIMIT 10;

-- Insert final lessons
INSERT INTO lessons (training_id, title, description, content, duration, order_index, is_preview)
SELECT 
    t.id,
    'Practical Applications and Summary',
    'Apply what you have learned and review key takeaways.',
    'In this final lesson, we will apply the concepts learned throughout the course and summarize the key takeaways from ' || t.name || '.',
    3600, -- 60 minutes
    3,
    false
FROM trainings t
WHERE EXISTS (
    SELECT 1 FROM lessons l WHERE l.training_id = t.id AND l.order_index = 2
)
LIMIT 10;

-- Insert sample quizzes
INSERT INTO quizzes (training_id, title, description, questions, passing_score, max_attempts, order_index)
SELECT 
    t.id,
    'Final Assessment for ' || t.name,
    'Test your knowledge of the key concepts covered in this training.',
    '[
        {
            "id": 1,
            "question": "What is the main objective of this training?",
            "type": "multiple_choice",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 0,
            "points": 25
        },
        {
            "id": 2,
            "question": "Which concept is most important?",
            "type": "multiple_choice",
            "options": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
            "correct_answer": 1,
            "points": 25
        },
        {
            "id": 3,
            "question": "How would you apply this knowledge?",
            "type": "multiple_choice",
            "options": ["Method A", "Method B", "Method C", "Method D"],
            "correct_answer": 2,
            "points": 25
        },
        {
            "id": 4,
            "question": "What is the best practice?",
            "type": "multiple_choice",
            "options": ["Practice A", "Practice B", "Practice C", "Practice D"],
            "correct_answer": 3,
            "points": 25
        }
    ]'::jsonb,
    70,
    3,
    1
FROM trainings t
WHERE NOT EXISTS (
    SELECT 1 FROM quizzes q WHERE q.training_id = t.id
)
LIMIT 10;

COMMIT;
