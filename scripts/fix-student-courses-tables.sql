-- Ensure basic tables exist with proper structure
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    duration_hours INTEGER DEFAULT 10,
    category VARCHAR(100) DEFAULT 'General',
    level VARCHAR(50) DEFAULT 'Beginner',
    rating DECIMAL(3,2) DEFAULT 4.0,
    modules_count INTEGER DEFAULT 5,
    instructor_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS module_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id, module_id)
);

-- Insert sample data for testing
INSERT INTO categories (name, description) VALUES 
('Web Development', 'Frontend and backend web technologies'),
('Mobile Development', 'iOS and Android app development'),
('Data Science', 'Analytics, machine learning, and data visualization'),
('Design', 'UI/UX design and graphic design'),
('Business', 'Business strategy and management')
ON CONFLICT (name) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (id, title, description, category, level, duration_hours, modules_count, instructor_id) VALUES 
(1, 'Introduction to Web Development', 'Learn HTML, CSS, and JavaScript fundamentals', 'Web Development', 'Beginner', 20, 10, 1),
(2, 'Advanced React Development', 'Master React hooks, context, and advanced patterns', 'Web Development', 'Advanced', 30, 15, 1),
(3, 'Mobile App Development', 'Build native mobile apps with React Native', 'Mobile Development', 'Intermediate', 25, 12, 1)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    level = EXCLUDED.level,
    duration_hours = EXCLUDED.duration_hours,
    modules_count = EXCLUDED.modules_count;

-- Insert sample enrollments for testing (user_id = 1)
INSERT INTO enrollments (user_id, course_id, payment_status, last_accessed) VALUES 
(1, 1, 'completed', NOW() - INTERVAL '2 days'),
(1, 2, 'completed', NOW() - INTERVAL '1 day'),
(1, 3, 'pending', NOW() - INTERVAL '5 days')
ON CONFLICT (user_id, course_id) DO UPDATE SET
    payment_status = EXCLUDED.payment_status,
    last_accessed = EXCLUDED.last_accessed;

-- Insert sample module progress
INSERT INTO module_progress (user_id, course_id, module_id, completed, completed_at) VALUES 
(1, 1, 1, true, NOW() - INTERVAL '3 days'),
(1, 1, 2, true, NOW() - INTERVAL '2 days'),
(1, 1, 3, true, NOW() - INTERVAL '1 day'),
(1, 2, 1, true, NOW() - INTERVAL '5 days'),
(1, 2, 2, true, NOW() - INTERVAL '4 days')
ON CONFLICT (user_id, course_id, module_id) DO UPDATE SET
    completed = EXCLUDED.completed,
    completed_at = EXCLUDED.completed_at;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_user_course ON module_progress(user_id, course_id);
