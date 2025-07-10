-- Ensure trainings table exists with all necessary columns for instructor dashboard
CREATE TABLE IF NOT EXISTS trainings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INTEGER REFERENCES users(id),
    price DECIMAL(10,2) DEFAULT 0,
    duration INTEGER, -- in minutes
    category_id INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add instructor_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainings' AND column_name = 'instructor_id') THEN
        ALTER TABLE trainings ADD COLUMN instructor_id INTEGER REFERENCES users(id);
    END IF;
    
    -- Add price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainings' AND column_name = 'price') THEN
        ALTER TABLE trainings ADD COLUMN price DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add duration column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainings' AND column_name = 'duration') THEN
        ALTER TABLE trainings ADD COLUMN duration INTEGER;
    END IF;
    
    -- Add category_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainings' AND column_name = 'category_id') THEN
        ALTER TABLE trainings ADD COLUMN category_id INTEGER;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainings' AND column_name = 'status') THEN
        ALTER TABLE trainings ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;
END $$;

-- Ensure enrollments table exists
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES trainings(id),
    status VARCHAR(50) DEFAULT 'active',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure reviews table exists
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES trainings(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure sessions table exists
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    instructor_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing (only if tables are empty)
INSERT INTO trainings (title, description, instructor_id, price, duration, status)
SELECT 
    'Advanced Hair Styling',
    'Master advanced hair styling techniques',
    (SELECT id FROM users WHERE role = 'instructor' LIMIT 1),
    299.99,
    120,
    'active'
WHERE NOT EXISTS (SELECT 1 FROM trainings);

INSERT INTO trainings (title, description, instructor_id, price, duration, status)
SELECT 
    'Professional Makeup Artistry',
    'Learn professional makeup techniques',
    (SELECT id FROM users WHERE role = 'instructor' LIMIT 1),
    399.99,
    180,
    'active'
WHERE NOT EXISTS (SELECT 1 FROM trainings WHERE title = 'Professional Makeup Artistry');

-- Insert sample enrollments
INSERT INTO enrollments (user_id, course_id, status)
SELECT 
    (SELECT id FROM users WHERE role = 'student' LIMIT 1),
    (SELECT id FROM trainings LIMIT 1),
    'active'
WHERE NOT EXISTS (SELECT 1 FROM enrollments);

-- Insert sample reviews
INSERT INTO reviews (user_id, course_id, rating, comment)
SELECT 
    (SELECT id FROM users WHERE role = 'student' LIMIT 1),
    (SELECT id FROM trainings LIMIT 1),
    5,
    'Excellent training! Learned so much.'
WHERE NOT EXISTS (SELECT 1 FROM reviews);

-- Insert sample sessions
INSERT INTO sessions (instructor_id, title, description, scheduled_at, status)
SELECT 
    (SELECT id FROM users WHERE role = 'instructor' LIMIT 1),
    'Hair Styling Workshop',
    'Hands-on hair styling practice session',
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    'scheduled'
WHERE NOT EXISTS (SELECT 1 FROM sessions);
