-- Complete schema for instructor functionality
-- This script creates all necessary tables and relationships

-- Ensure users table has instructor-specific columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS specialization VARCHAR(255),
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS certifications JSON,
ADD COLUMN IF NOT EXISTS social_links JSON,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS availability JSON,
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);

-- Create courses table if not exists
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER,
  price DECIMAL(10,2) DEFAULT 0,
  duration INTEGER DEFAULT 0, -- in minutes
  level VARCHAR(50) DEFAULT 'beginner',
  thumbnail_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enrollments table if not exists
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  progress_percentage INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  UNIQUE(user_id, course_id)
);

-- Create reviews table if not exists
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  instructor_reply TEXT,
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Create sessions table if not exists
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP NOT NULL,
  duration INTEGER DEFAULT 60, -- in minutes
  meeting_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create session_bookings table if not exists
CREATE TABLE IF NOT EXISTS session_bookings (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'confirmed',
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, user_id)
);

-- Create conversations table if not exists
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id)
);

-- Create messages table if not exists
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_sessions_instructor ON sessions(instructor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled ON sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Insert sample data for testing
INSERT INTO users (full_name, email, password_hash, role, bio, specialization, experience_years, location, hourly_rate) 
VALUES 
  ('Sarah Beauty Expert', 'sarah@instructor.com', '$2b$10$example', 'instructor', 
   'Passionate beauty instructor with over 10 years of experience in the industry.', 
   'Hair Styling & Makeup Artistry', 10, 'New York, NY', 150.00)
ON CONFLICT (email) DO NOTHING;

-- Get the instructor ID for sample data
DO $$
DECLARE
    instructor_id INTEGER;
BEGIN
    SELECT id INTO instructor_id FROM users WHERE email = 'sarah@instructor.com';
    
    IF instructor_id IS NOT NULL THEN
        -- Insert sample courses
        INSERT INTO courses (title, description, instructor_id, price, duration, level, status) VALUES
        ('Advanced Hair Styling Techniques', 'Master advanced hair styling techniques for professional results', instructor_id, 299.00, 120, 'advanced', 'published'),
        ('Professional Makeup Artistry', 'Complete guide to professional makeup application', instructor_id, 249.00, 90, 'intermediate', 'published'),
        ('Bridal Beauty Essentials', 'Everything you need to know about bridal makeup and hair', instructor_id, 199.00, 75, 'beginner', 'published')
        ON CONFLICT DO NOTHING;
        
        -- Insert sample students
        INSERT INTO users (full_name, email, password_hash, role) VALUES
        ('Student One', 'student1@test.com', '$2b$10$example', 'student'),
        ('Student Two', 'student2@test.com', '$2b$10$example', 'student'),
        ('Student Three', 'student3@test.com', '$2b$10$example', 'student')
        ON CONFLICT (email) DO NOTHING;
        
        -- Insert sample enrollments and reviews
        INSERT INTO enrollments (user_id, course_id, progress_percentage) 
        SELECT u.id, c.id, 75
        FROM users u, courses c 
        WHERE u.email LIKE 'student%@test.com' AND c.instructor_id = instructor_id
        ON CONFLICT (user_id, course_id) DO NOTHING;
        
        INSERT INTO reviews (user_id, course_id, rating, comment)
        SELECT u.id, c.id, 5, 'Amazing course! Learned so much.'
        FROM users u, courses c 
        WHERE u.email = 'student1@test.com' AND c.instructor_id = instructor_id
        LIMIT 1
        ON CONFLICT (user_id, course_id) DO NOTHING;
    END IF;
END $$;

-- Update last_login for sample users to show activity
UPDATE users SET last_login = NOW() - INTERVAL '2 hours' WHERE email LIKE 'student%@test.com';

COMMIT;
