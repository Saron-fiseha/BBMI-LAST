-- Create enrollments table if it doesn't exist
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    progress DECIMAL(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
    payment_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Create student activities table for tracking recent activities
CREATE TABLE IF NOT EXISTS student_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table if it doesn't exist
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    price DECIMAL(10,2) DEFAULT 0.00,
    duration_hours INTEGER DEFAULT 0,
    level VARCHAR(20) DEFAULT 'Beginner',
    instructor_id INTEGER,
    category_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO courses (title, description, price, duration_hours, level) VALUES
('Basic Makeup Techniques', 'Learn fundamental makeup application techniques', 99.99, 10, 'Beginner'),
('Advanced Contouring', 'Master the art of contouring and highlighting', 149.99, 15, 'Intermediate'),
('Bridal Makeup Mastery', 'Complete guide to bridal makeup', 199.99, 20, 'Advanced')
ON CONFLICT DO NOTHING;

-- Insert sample enrollments for testing (user_id = 1)
INSERT INTO enrollments (user_id, course_id, status, progress, payment_amount, payment_status) VALUES
(1, 1, 'active', 65.5, 99.99, 'completed'),
(1, 2, 'active', 30.0, 149.99, 'completed'),
(1, 3, 'completed', 100.0, 199.99, 'completed')
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Insert sample activities
INSERT INTO student_activities (user_id, type, title, description) VALUES
(1, 'enrollment', 'Enrolled in Basic Makeup Techniques', 'Started learning makeup fundamentals'),
(1, 'progress', 'Progress update in Advanced Contouring', 'Completed 30% of the course'),
(1, 'completion', 'Completed Bridal Makeup Mastery', 'Course completed successfully!')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_student_activities_user_id ON student_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_created_at ON student_activities(created_at);
