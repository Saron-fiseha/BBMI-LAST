-- Create sessions table for instructor live sessions
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
    INDEX idx_status (status),
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- Create session_bookings table for student enrollments in sessions
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
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_student (session_id, student_id)
);

-- Insert sample sessions for testing
INSERT IGNORE INTO sessions (title, description, instructor_id, scheduled_at, duration, status) VALUES
('Hair Styling Fundamentals - Live Q&A', 'Interactive session covering basic hair styling techniques with live demonstrations', 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 90, 'scheduled'),
('Advanced Color Theory Workshop', 'Deep dive into color theory and application techniques for professional stylists', 1, DATE_ADD(NOW(), INTERVAL 5 DAY), 120, 'scheduled'),
('Business Skills for Beauty Professionals', 'Learn how to build and grow your beauty business', 1, DATE_ADD(NOW(), INTERVAL 7 DAY), 60, 'scheduled');

-- Insert sample session bookings
INSERT IGNORE INTO session_bookings (session_id, student_id, status) VALUES
(1, 2, 'confirmed'),
(1, 3, 'confirmed'),
(2, 2, 'confirmed'),
(3, 3, 'confirmed');

-- Update sessions table to show correct student counts
UPDATE sessions s 
SET s.max_participants = (
    SELECT COUNT(*) + 10 
    FROM session_bookings sb 
    WHERE sb.session_id = s.id AND sb.status = 'confirmed'
) 
WHERE s.id IN (1, 2, 3);
