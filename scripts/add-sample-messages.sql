-- Add sample messages to existing conversations
INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES 
-- Conversation 1 (Sarah Johnson - Hair Styling)
(1, 101, 'Hi! I have a question about the advanced hair styling technique you showed in lesson 3. I''m having trouble with the layering method.', NOW() - INTERVAL '4 hours'),
(1, (SELECT id FROM users WHERE role = 'instructor' LIMIT 1), 'Of course! The layering technique can be tricky at first. Let me break it down for you step by step. First, make sure you''re sectioning the hair properly...', NOW() - INTERVAL '3 hours 45 minutes'),
(1, 101, 'Thank you so much for the detailed explanation! I''ll practice the sectioning technique you mentioned. Should I start with dry or wet hair?', NOW() - INTERVAL '3 hours 30 minutes'),
(1, (SELECT id FROM users WHERE role = 'instructor' LIMIT 1), 'For practice, I''d recommend starting with slightly damp hair - it''s more manageable. Also, don''t forget to use sectioning clips!', NOW() - INTERVAL '3 hours'),

-- Conversation 2 (Michael Chen - Color Theory)
(2, 102, 'Could you recommend some practice exercises for color matching? I''m struggling with warm and cool tones.', NOW() - INTERVAL '6 hours'),
(2, (SELECT id FROM users WHERE role = 'instructor' LIMIT 1), 'Great question! Color matching is fundamental. I recommend starting with the basic color wheel exercises. Try mixing primary colors first...', NOW() - INTERVAL '5 hours 30 minutes'),
(2, 102, 'That''s really helpful! I''ll start with the color wheel exercises. Do you have any specific brand recommendations for practice palettes?', NOW() - INTERVAL '5 hours'),
(2, (SELECT id FROM users WHERE role = 'instructor' LIMIT 1), 'For practice palettes, I recommend starting with basic drugstore brands like L''Oreal or Maybelline. They''re affordable and great for learning!', NOW() - INTERVAL '4 hours 30 minutes'),

-- Conversation 3 (Emma Rodriguez - Bridal Consultation)
(3, 103, 'I''d like to book a bridal consultation. Do you have any availability next week?', NOW() - INTERVAL '1 day'),
(3, (SELECT id FROM users WHERE role = 'instructor' LIMIT 1), 'Yes, I have availability! Let me check my schedule. I have openings on Tuesday and Thursday afternoons. What time works best?', NOW() - INTERVAL '23 hours'),
(3, 103, 'Tuesday afternoon would be perfect! How about 2 PM? Also, should I bring any specific inspiration photos?', NOW() - INTERVAL '22 hours'),
(3, (SELECT id FROM users WHERE role = 'instructor' LIMIT 1), 'Perfect! Tuesday at 2 PM works great. Yes, definitely bring inspiration photos - they help me understand your vision better. See you then!', NOW() - INTERVAL '21 hours');

-- Update conversation timestamps to match latest messages
UPDATE conversations SET updated_at = NOW() - INTERVAL '3 hours' WHERE id = 1;
UPDATE conversations SET updated_at = NOW() - INTERVAL '4 hours 30 minutes' WHERE id = 2;
UPDATE conversations SET updated_at = NOW() - INTERVAL '21 hours' WHERE id = 3;
