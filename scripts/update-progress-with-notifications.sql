-- Add notification triggers for progress updates
-- This script adds triggers to automatically create notifications when progress milestones are reached

CREATE OR REPLACE FUNCTION create_progress_notification()
RETURNS TRIGGER AS $$
DECLARE
  training_name TEXT;
  milestone INTEGER;
BEGIN
  -- Get training name
  SELECT name INTO training_name 
  FROM trainings 
  WHERE id = NEW.training_id;

  -- Check if this is a milestone (25%, 50%, 75%, 100%)
  IF NEW.progress_percentage >= 25 AND (OLD.progress_percentage IS NULL OR OLD.progress_percentage < 25) THEN
    milestone := 25;
  ELSIF NEW.progress_percentage >= 50 AND (OLD.progress_percentage IS NULL OR OLD.progress_percentage < 50) THEN
    milestone := 50;
  ELSIF NEW.progress_percentage >= 75 AND (OLD.progress_percentage IS NULL OR OLD.progress_percentage < 75) THEN
    milestone := 75;
  ELSIF NEW.progress_percentage >= 100 AND (OLD.progress_percentage IS NULL OR OLD.progress_percentage < 100) THEN
    milestone := 100;
  END IF;

  -- Create notification for milestone
  IF milestone IS NOT NULL THEN
    INSERT INTO notifications (
      user_id, title, message, type, related_id, related_type, metadata
    ) VALUES (
      NEW.user_id,
      CASE 
        WHEN milestone = 100 THEN 'Course Completed!'
        ELSE 'Course Progress'
      END,
      CASE 
        WHEN milestone = 100 THEN 'Congratulations! You''ve completed the ' || training_name || ' course!'
        ELSE 'You''ve completed ' || milestone || '% of ' || training_name || ' course!'
      END,
      'success',
      NEW.training_id,
      'progress',
      json_build_object(
        'progressPercentage', NEW.progress_percentage,
        'trainingTitle', training_name,
        'milestone', milestone
      )::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for enrollment progress updates
DROP TRIGGER IF EXISTS trigger_progress_notification ON enrollments;
CREATE TRIGGER trigger_progress_notification
  AFTER UPDATE OF progress_percentage ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION create_progress_notification();
