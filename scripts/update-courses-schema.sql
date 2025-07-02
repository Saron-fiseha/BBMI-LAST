-- Add missing columns to courses table if they don't exist
DO $$ 
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'category') THEN
        ALTER TABLE courses ADD COLUMN category VARCHAR(100) DEFAULT 'General';
    END IF;
    
    -- Add level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'level') THEN
        ALTER TABLE courses ADD COLUMN level VARCHAR(50) DEFAULT 'Beginner';
    END IF;
    
    -- Add rating column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'rating') THEN
        ALTER TABLE courses ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.0;
    END IF;
    
    -- Add modules_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'modules_count') THEN
        ALTER TABLE courses ADD COLUMN modules_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('Programming', 'Software development and programming courses'),
    ('Design', 'UI/UX and graphic design courses'),
    ('Business', 'Business and entrepreneurship courses'),
    ('Marketing', 'Digital marketing and advertising courses'),
    ('Data Science', 'Data analysis and machine learning courses'),
    ('General', 'General and miscellaneous courses')
ON CONFLICT (name) DO NOTHING;

-- Create module_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS module_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module_id)
);

-- Create modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    video_url TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update sample data
UPDATE courses SET 
    category = 'Programming',
    level = 'Intermediate',
    rating = 4.5,
    modules_count = 10
WHERE category IS NULL OR category = '';

-- Insert sample modules for existing courses
INSERT INTO modules (course_id, name, description, order_index, duration_minutes) 
SELECT 
    id as course_id,
    'Introduction to ' || title as name,
    'Getting started with ' || title as description,
    1 as order_index,
    30 as duration_minutes
FROM courses 
WHERE NOT EXISTS (SELECT 1 FROM modules WHERE modules.course_id = courses.id)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_user_course ON module_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_order ON modules(course_id, order_index);
