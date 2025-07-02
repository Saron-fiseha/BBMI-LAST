-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id INT,
    instructor_id INT NOT NULL,
    scheduled_at DATETIME NOT NULL,
    duration INT DEFAULT 60,
    meeting_url VARCHAR(500),
    status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    max_participants INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_status (status)
);

-- Create session_bookings table
CREATE TABLE IF NOT EXISTS session_bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'attended', 'no_show') DEFAULT 'confirmed',
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    INDEX idx_session_id (session_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_session_student (session_id, student_id)
);

-- Insert sample data
INSERT IGNORE INTO sessions (title, description, instructor_id, scheduled_at, duration, status) VALUES
('Hair Styling Fundamentals - Live Q&A', 'Interactive session covering basic hair styling techniques', 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 90, 'scheduled'),
('Advanced Color Theory Workshop', 'Deep dive into color theory and application techniques', 1, DATE_ADD(NOW(), INTERVAL 5 DAY), 120, 'scheduled'),
('Business Skills for Beauty Professionals', 'Learn how to build and grow your beauty business', 1, DATE_ADD(NOW(), INTERVAL 7 DAY), 60, 'scheduled');
