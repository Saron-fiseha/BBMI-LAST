-- Add notification triggers for new sessions
-- This script adds triggers to automatically create notifications when new sessions are created

CREATE OR REPLACE FUNCTION create_session_notification()
RETURNS TRIGGER AS $$
DECLARE
  instructor_name TEXT;
  enrolled_user_id INTEGER;
BEGIN
  -- Get instructor name
  SELECT full_name INTO instructor_name 
  FROM instructors 
  WHERE id = NEW.instructor_id;

  -- Create notifications for all enrolled users in related trainings
  FOR enrolled_user_id IN 
    SELECT DISTINCT e.user_id 
    FROM enrollments e 
    WHERE e.training_id = NEW.training_id 
    AND e.status = 'active'
  LOOP
    INSERT INTO notifications (
      user_id, title, message, type, related_id, related_type, metadata
    ) VALUES (
      enrolled_user_id,
      'New Session Available',
      'New session "' || NEW.title || '" scheduled with ' || instructor_name,
      'info',
      NEW.id,
      'session',
      json_build_object(
        'sessionTitle', NEW.title,
        'instructorName', instructor_name,
        'scheduledAt', NEW.scheduled_at,
        'sessionType', NEW.session_type
      )::jsonb
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new session creation
DROP TRIGGER IF EXISTS trigger_session_notification ON sessions;
CREATE TRIGGER trigger_session_notification
  AFTER INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION create_session_notification();
