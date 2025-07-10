-- Create sessions table with training_id instead of course_id
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    training_id INTEGER,
    instructor_id INTEGER NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    duration INTEGER DEFAULT 60,
    meeting_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    max_participants INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create session_bookings table
CREATE TABLE IF NOT EXISTS session_bookings (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'attended', 'no_show')),
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(session_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_instructor_id ON sessions(instructor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_training_id ON sessions(training_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_session_bookings_session_id ON session_bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_student_id ON session_bookings(student_id);

-- Insert sample sessions for testing
INSERT INTO sessions (title, description, instructor_id, training_id, scheduled_at, duration, status) VALUES
('Hair Styling Fundamentals - Live Q&A', 'Interactive session covering basic hair styling techniques', 11, 1, NOW() + INTERVAL '2 days', 90, 'scheduled'),
('Advanced Color Theory Workshop', 'Deep dive into color theory and application techniques', 11, 2, NOW() + INTERVAL '5 days', 120, 'scheduled'),
('Business Skills for Beauty Professionals', 'Learn how to build and grow your beauty business', 11, NULL, NOW() + INTERVAL '7 days', 60, 'scheduled')
ON CONFLICT DO NOTHING;
