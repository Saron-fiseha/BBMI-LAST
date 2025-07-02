-- Ensure trainings table exists with proper structure
CREATE TABLE IF NOT EXISTS trainings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    duration_hours INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    level VARCHAR(50) DEFAULT 'beginner',
    status VARCHAR(50) DEFAULT 'draft',
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_trainings_updated_at ON trainings;
CREATE TRIGGER update_trainings_updated_at
    BEFORE UPDATE ON trainings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create enrollments table if it doesn't exist
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    training_id INTEGER REFERENCES trainings(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress INTEGER DEFAULT 0
);

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    training_id INTEGER REFERENCES trainings(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample trainings for instructors (only if they don't exist)
INSERT INTO trainings (title, description, instructor_id, duration_hours, price, level, status, thumbnail_url)
SELECT 
    'Advanced Hair Styling Techniques',
    'Master advanced hair styling techniques for professional results. Learn cutting-edge methods used by top stylists.',
    u.id,
    8,
    299.00,
    'advanced',
    'published',
    '/placeholder.svg?height=200&width=300'
FROM users u 
WHERE u.role = 'instructor' 
AND NOT EXISTS (
    SELECT 1 FROM trainings t 
    WHERE t.instructor_id = u.id 
    AND t.title = 'Advanced Hair Styling Techniques'
)
LIMIT 1;

INSERT INTO trainings (title, description, instructor_id, duration_hours, price, level, status, thumbnail_url)
SELECT 
    'Professional Makeup Artistry',
    'Complete course on professional makeup techniques for various occasions and skin types.',
    u.id,
    12,
    399.00,
    'intermediate',
    'published',
    '/placeholder.svg?height=200&width=300'
FROM users u 
WHERE u.role = 'instructor' 
AND NOT EXISTS (
    SELECT 1 FROM trainings t 
    WHERE t.instructor_id = u.id 
    AND t.title = 'Professional Makeup Artistry'
)
LIMIT 1;

INSERT INTO trainings (title, description, instructor_id, duration_hours, price, level, status, thumbnail_url)
SELECT 
    'Nail Art Fundamentals',
    'Learn the basics of nail art design and application techniques.',
    u.id,
    6,
    199.00,
    'beginner',
    'draft',
    '/placeholder.svg?height=200&width=300'
FROM users u 
WHERE u.role = 'instructor' 
AND NOT EXISTS (
    SELECT 1 FROM trainings t 
    WHERE t.instructor_id = u.id 
    AND t.title = 'Nail Art Fundamentals'
)
LIMIT 1;

-- Add some sample enrollments
INSERT INTO enrollments (user_id, training_id, status, progress)
SELECT 
    s.id as user_id,
    t.id as training_id,
    'active',
    FLOOR(RANDOM() * 100)
FROM users s
CROSS JOIN trainings t
WHERE s.role = 'student'
AND NOT EXISTS (
    SELECT 1 FROM enrollments e 
    WHERE e.user_id = s.id AND e.training_id = t.id
)
LIMIT 20;

-- Add some sample reviews
INSERT INTO reviews (user_id, training_id, rating, comment)
SELECT 
    e.user_id,
    e.training_id,
    FLOOR(RANDOM() * 2 + 4), -- Random rating between 4-5
    CASE 
        WHEN RANDOM() < 0.5 THEN 'Great course! Very informative and well structured.'
        ELSE 'Excellent instructor and content. Highly recommended!'
    END
FROM enrollments e
WHERE NOT EXISTS (
    SELECT 1 FROM reviews r 
    WHERE r.user_id = e.user_id AND r.training_id = e.training_id
)
LIMIT 10;

-- Display summary
SELECT 
    'Trainings created' as summary,
    COUNT(*) as count
FROM trainings
UNION ALL
SELECT 
    'Enrollments created' as summary,
    COUNT(*) as count
FROM enrollments
UNION ALL
SELECT 
    'Reviews created' as summary,
    COUNT(*) as count
FROM reviews;
