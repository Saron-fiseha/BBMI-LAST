-- Add notification triggers for certificate generation
-- This script adds triggers to automatically create notifications when certificates are generated

CREATE OR REPLACE FUNCTION create_certificate_notification()
RETURNS TRIGGER AS $$
DECLARE
  training_name TEXT;
BEGIN
  -- Get training name
  SELECT name INTO training_name 
  FROM trainings 
  WHERE id = NEW.training_id;

  -- Create certificate notification
  INSERT INTO notifications (
    user_id, title, message, type, related_id, related_type, metadata
  ) VALUES (
    NEW.user_id,
    'Certificate Ready',
    'Your certificate for ' || training_name || ' is ready for download!',
    'success',
    NEW.training_id,
    'certificate',
    json_build_object(
      'trainingTitle', training_name,
      'certificateNumber', NEW.certificate_number,
      'verificationCode', NEW.verification_code
    )::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for certificate creation
DROP TRIGGER IF EXISTS trigger_certificate_notification ON certificates;
CREATE TRIGGER trigger_certificate_notification
  AFTER INSERT ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION create_certificate_notification();
