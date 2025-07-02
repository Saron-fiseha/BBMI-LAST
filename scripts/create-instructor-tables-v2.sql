-- Create sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_id INT,
  instructor_id INT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  duration INT DEFAULT 60,
  meeting_url VARCHAR(500),
  status ENUM('scheduled', 'confirmed', 'cancelled', 'completed') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_instructor_scheduled (instructor_id, scheduled_at),
  INDEX idx_status (status)
);

-- Create session_bookings table for tracking student enrollments in sessions
CREATE TABLE IF NOT EXISTS session_bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_session_user (session_id, user_id)
);

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_course_review (user_id, course_id),
  INDEX idx_course_rating (course_id, rating)
);

-- Create enrollments table if it doesn't exist
CREATE TABLE IF NOT EXISTS enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_course (user_id, course_id),
  INDEX idx_course_status (course_id, status),
  INDEX idx_user_status (user_id, status)
);

-- Create instructor_profiles table for extended instructor information
CREATE TABLE IF NOT EXISTS instructor_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  bio TEXT,
  location VARCHAR(255),
  specialties JSON,
  experience_years INT DEFAULT 0,
  certifications JSON,
  social_links JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_instructor_profile (user_id)
);

-- Add missing columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) NULL;

-- Add missing columns to courses table if they don't exist
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS instructor_id INT NULL,
ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS duration INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;

-- Add foreign key constraint for instructor_id if it doesn't exist
ALTER TABLE courses 
ADD CONSTRAINT fk_courses_instructor 
FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL;

-- Insert sample data for testing
INSERT IGNORE INTO users (id, full_name, email, password_hash, role, email_verified, created_at) VALUES
(1, 'Betty Smith', 'betty@brushedbybetty.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3/Hm', 'instructor', true, '2024-01-01 00:00:00'),
(2, 'Sarah Johnson', 'sarah@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3/Hm', 'student', true, '2024-02-01 00:00:00'),
(3, 'Emily Chen', 'emily@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3/Hm', 'student', true, '2024-02-15 00:00:00');

-- Insert sample courses
INSERT IGNORE INTO courses (id, title, description, instructor_id, price, duration, level, status, created_at) VALUES
(1, 'Advanced Hair Styling Techniques', 'Master advanced hair styling techniques for professional results', 1, 299.00, 120, 'advanced', 'published', '2024-01-15 00:00:00'),
(2, 'Professional Makeup Artistry', 'Complete guide to professional makeup techniques', 1, 399.00, 180, 'intermediate', 'published', '2024-02-10 00:00:00'),
(3, 'Bridal Hair & Makeup Masterclass', 'Specialized techniques for bridal beauty', 1, 499.00, 240, 'advanced', 'draft', '2024-06-15 00:00:00');

-- Insert sample enrollments
INSERT IGNORE INTO enrollments (user_id, course_id, status, progress_percentage, enrolled_at) VALUES
(2, 1, 'active', 75.00, '2024-03-01 00:00:00'),
(2, 2, 'active', 45.00, '2024-03-15 00:00:00'),
(3, 1, 'completed', 100.00, '2024-02-20 00:00:00'),
(3, 2, 'active', 30.00, '2024-04-01 00:00:00');

-- Insert sample reviews
INSERT IGNORE INTO reviews (user_id, course_id, rating, comment, created_at) VALUES
(2, 1, 5, 'Absolutely amazing course! Betty\'s techniques are professional and easy to follow.', '2024-06-15 10:30:00'),
(3, 1, 5, 'This course exceeded my expectations. The step-by-step tutorials are incredibly detailed.', '2024-06-10 14:20:00'),
(3, 2, 4, 'Great course with lots of practical tips. Would love to see more content on color techniques.', '2024-06-08 16:45:00');

-- Insert sample sessions
INSERT IGNORE INTO sessions (id, title, description, course_id, instructor_id, scheduled_at, duration, status) VALUES
(1, 'Live Q&A: Hair Styling Tips', 'Interactive session to answer your hair styling questions', 1, 1, '2024-12-30 14:00:00', 60, 'scheduled'),
(2, 'Makeup Masterclass Live Demo', 'Live demonstration of professional makeup techniques', 2, 1, '2024-12-28 16:00:00', 90, 'scheduled');

-- Insert sample instructor profile
INSERT IGNORE INTO instructor_profiles (user_id, bio, location, specialties, experience_years, certifications, social_links) VALUES
(1, 'Professional makeup artist and hair stylist with over 10 years of experience. Passionate about teaching and helping others discover their beauty potential.', 'Los Angeles, CA', '["Hair Styling", "Makeup Artistry", "Bridal Beauty", "Color Theory"]', 10, '["Certified Makeup Artist", "Advanced Hair Styling Certificate", "Bridal Beauty Specialist"]', '{"website": "https://brushedbybetty.com", "instagram": "@brushedbybetty", "linkedin": "betty-smith-mua"}');
