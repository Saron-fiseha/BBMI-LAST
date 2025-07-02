-- Add realistic messages for the sample conversations

-- Messages for Sarah Johnson conversation (Hair Styling)
INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES
(1, 2, 'Hi! I have a question about the advanced hair styling technique you showed in lesson 3. I''m having trouble with the layering method.', NOW() - INTERVAL '4 hours'),
(1, 1, 'Hi Sarah! I''d be happy to help. Which specific part of the layering technique are you struggling with? Is it the sectioning or the actual cutting technique?', NOW() - INTERVAL '3 hours 45 minutes'),
(1, 2, 'It''s mainly the sectioning. I can''t seem to get the sections even, and it affects the final result.', NOW() - INTERVAL '3 hours 30 minutes'),
(1, 1, 'That''s a common challenge! Try using the triangle sectioning method I demonstrated. Start with a center part, then create triangular sections working outward. Would you like me to send you a video reference?', NOW() - INTERVAL '3 hours 15 minutes'),
(1, 2, 'Yes, that would be amazing! Thank you so much for your help. You''re such a great instructor! 😊', NOW() - INTERVAL '3 hours');

-- Messages for Michael Chen conversation (Color Theory)
INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES
(2, 3, 'Hello! I''m working on color theory and I''m confused about complementary colors for skin tones. Could you help me understand this better?', NOW() - INTERVAL '6 hours'),
(2, 1, 'Of course! Color theory for skin tones is crucial. Are you working with warm, cool, or neutral undertones specifically?', NOW() - INTERVAL '5 hours 40 minutes'),
(2, 3, 'I''m mainly struggling with warm undertones. I can''t seem to find the right balance.', NOW() - INTERVAL '5 hours 25 minutes'),
(2, 1, 'For warm undertones, focus on golden, peachy, and coral shades. Avoid colors with blue or purple bases as they can clash. Try practicing with oranges, warm browns, and golden yellows first.', NOW() - INTERVAL '5 hours 10 minutes'),
(2, 3, 'That makes so much sense! Could you recommend some specific practice exercises?', NOW() - INTERVAL '5 hours');

-- Messages for Emma Rodriguez conversation (Bridal Consultation)
INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES
(3, 4, 'Hi! I''m getting married next month and would love to book a bridal consultation with you. Are you available for appointments?', NOW() - INTERVAL '1 day'),
(3, 1, 'Congratulations on your upcoming wedding! I''d love to help you look stunning on your special day. What date were you thinking for the consultation?', NOW() - INTERVAL '23 hours 30 minutes'),
(3, 4, 'Thank you! I was hoping for next Tuesday around 2 PM if that works for you. I''d like to discuss both hair and makeup for the wedding.', NOW() - INTERVAL '23 hours'),
(3, 1, 'Perfect! Tuesday at 2 PM works great for me. I''ll block out 2 hours so we can cover both hair and makeup thoroughly. Looking forward to meeting you!', NOW() - INTERVAL '22 hours 45 minutes'),
(3, 4, 'Perfect! I''ll see you next Tuesday at 2 PM. Thank you so much! 💕', NOW() - INTERVAL '22 hours 30 minutes');

-- Update conversation timestamps to match latest messages
UPDATE conversations SET updated_at = NOW() - INTERVAL '3 hours' WHERE id = 1;
UPDATE conversations SET updated_at = NOW() - INTERVAL '5 hours' WHERE id = 2;
UPDATE conversations SET updated_at = NOW() - INTERVAL '22 hours 30 minutes' WHERE id = 3;
