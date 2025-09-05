-- Add notification triggers for new messages
-- This script adds triggers to automatically create notifications when new messages are received

CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
  recipient_id INTEGER;
  message_preview TEXT;
BEGIN
  -- Get sender name
  SELECT full_name INTO sender_name 
  FROM users 
  WHERE id = NEW.sender_id;

  -- Get recipient ID from conversation
  SELECT 
    CASE 
      WHEN c.user1_id = NEW.sender_id THEN c.user2_id
      ELSE c.user1_id
    END INTO recipient_id
  FROM conversations c 
  WHERE c.id = NEW.conversation_id;

  -- Create message preview (first 50 characters)
  message_preview := LEFT(NEW.content, 50);

  -- Create notification for recipient
  IF recipient_id IS NOT NULL AND recipient_id != NEW.sender_id THEN
    INSERT INTO notifications (
      user_id, title, message, type, related_id, related_type, metadata
    ) VALUES (
      recipient_id,
      'New Message',
      'New message from ' || sender_name || ': ' || message_preview || 
      CASE WHEN LENGTH(NEW.content) > 50 THEN '...' ELSE '' END,
      'info',
      NEW.conversation_id,
      'message',
      json_build_object(
        'senderName', sender_name,
        'messagePreview', message_preview,
        'conversationId', NEW.conversation_id,
        'messageId', NEW.id
      )::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new message creation
DROP TRIGGER IF EXISTS trigger_message_notification ON messages;
CREATE TRIGGER trigger_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();
