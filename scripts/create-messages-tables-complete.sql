-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    subject VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(sender_id, read_at) WHERE read_at IS NULL;

-- Insert some sample students for testing
INSERT INTO users (full_name, email, password_hash, role, created_at, updated_at) 
VALUES 
    ('Student 1', 'student1@example.com', '$2b$10$dummy.hash.for.testing', 'student', NOW(), NOW()),
    ('Student 2', 'student2@example.com', '$2b$10$dummy.hash.for.testing', 'student', NOW(), NOW()),
    ('Sarah Johnson', 'sarah@example.com', '$2b$10$dummy.hash.for.testing', 'student', NOW(), NOW()),
    ('Michael Chen', 'michael@example.com', '$2b$10$dummy.hash.for.testing', 'student', NOW(), NOW()),
    ('Emma Rodriguez', 'emma@example.com', '$2b$10$dummy.hash.for.testing', 'student', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create some sample conversations for testing
DO $$
DECLARE
    instructor_id INTEGER;
    student1_id INTEGER;
    student2_id INTEGER;
    conv1_id INTEGER;
    conv2_id INTEGER;
BEGIN
    -- Get instructor ID (assuming there's at least one instructor)
    SELECT id INTO instructor_id FROM users WHERE role = 'instructor' LIMIT 1;
    
    -- Get student IDs
    SELECT id INTO student1_id FROM users WHERE email = 'sarah@example.com';
    SELECT id INTO student2_id FROM users WHERE email = 'michael@example.com';
    
    IF instructor_id IS NOT NULL AND student1_id IS NOT NULL THEN
        -- Create first conversation
        INSERT INTO conversations (user1_id, user2_id, subject, created_at, updated_at)
        VALUES (instructor_id, student1_id, 'Question about Hair Styling', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour')
        ON CONFLICT DO NOTHING
        RETURNING id INTO conv1_id;
        
        -- Add messages to first conversation
        IF conv1_id IS NOT NULL THEN
            INSERT INTO messages (conversation_id, sender_id, content, created_at)
            VALUES 
                (conv1_id, student1_id, 'Hi! I have a question about the curling technique from lesson 3.', NOW() - INTERVAL '2 hours'),
                (conv1_id, instructor_id, 'Of course! Which specific part are you struggling with?', NOW() - INTERVAL '1 hour 30 minutes'),
                (conv1_id, student1_id, 'I''m having trouble getting the right curl direction.', NOW() - INTERVAL '1 hour');
        END IF;
    END IF;
    
    IF instructor_id IS NOT NULL AND student2_id IS NOT NULL THEN
        -- Create second conversation
        INSERT INTO conversations (user1_id, user2_id, subject, created_at, updated_at)
        VALUES (instructor_id, student2_id, 'Makeup Color Theory Help', NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 hours')
        ON CONFLICT DO NOTHING
        RETURNING id INTO conv2_id;
        
        -- Add messages to second conversation
        IF conv2_id IS NOT NULL THEN
            INSERT INTO messages (conversation_id, sender_id, content, created_at)
            VALUES 
                (conv2_id, student2_id, 'Could you recommend some practice exercises for color matching?', NOW() - INTERVAL '1 day'),
                (conv2_id, instructor_id, 'I recommend starting with the color wheel exercises from module 2.', NOW() - INTERVAL '6 hours');
        END IF;
    END IF;
END $$;

-- Success message
SELECT 'Messages tables created successfully! Sample conversations and students added for testing.' as result;
