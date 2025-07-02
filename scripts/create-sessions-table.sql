-- Create sessions table for training sessions
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_name VARCHAR(255) NOT NULL,
    instructor_id INTEGER REFERENCES users(id),
    category VARCHAR(100) NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    session_type VARCHAR(20) DEFAULT 'live' CHECK (session_type IN ('live', 'recorded', 'workshop')),
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    location VARCHAR(255),
    max_participants INTEGER DEFAULT 20,
    current_participants INTEGER DEFAULT 0,
    meeting_link TEXT,
    materials_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_instructor ON sessions(instructor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_category ON sessions(category);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_updated_at();

-- Insert sample sessions data
INSERT INTO sessions (
    title, 
    description, 
    instructor_name, 
    instructor_id, 
    category, 
    session_date, 
    start_time, 
    end_time, 
    duration_minutes, 
    session_type, 
    status, 
    location, 
    max_participants, 
    current_participants,
    meeting_link
) VALUES 
(
    'Advanced Bridal Makeup Techniques',
    'Learn professional bridal makeup techniques including long-wear formulas and photography-ready looks.',
    'Sarah Martinez',
    1,
    'Bridal Makeup',
    '2024-01-15',
    '10:00',
    '12:00',
    120,
    'live',
    'upcoming',
    'Studio A',
    15,
    12,
    'https://zoom.us/j/123456789'
),
(
    'Color Theory Masterclass',
    'Deep dive into color theory and its application in makeup artistry.',
    'Emma Wilson',
    2,
    'Color Theory',
    '2024-01-16',
    '14:00',
    '16:30',
    150,
    'workshop',
    'upcoming',
    'Main Hall',
    20,
    18,
    NULL
),
(
    'Special Effects Makeup Workshop',
    'Create stunning special effects looks using professional techniques and products.',
    'Michael Chen',
    3,
    'Special Effects',
    '2024-01-17',
    '09:00',
    '17:00',
    480,
    'workshop',
    'upcoming',
    'Studio B',
    10,
    8,
    NULL
),
(
    'Fashion Makeup Fundamentals',
    'Master the basics of fashion makeup for runway and editorial work.',
    'Sarah Martinez',
    1,
    'Fashion Makeup',
    '2024-01-18',
    '13:00',
    '15:00',
    120,
    'live',
    'upcoming',
    'Studio A',
    12,
    10,
    'https://zoom.us/j/987654321'
),
(
    'Airbrush Makeup Techniques',
    'Learn professional airbrush makeup application for flawless results.',
    'Emma Wilson',
    2,
    'Airbrush Makeup',
    '2024-01-19',
    '11:00',
    '14:00',
    180,
    'workshop',
    'upcoming',
    'Studio C',
    8,
    6,
    NULL
);
