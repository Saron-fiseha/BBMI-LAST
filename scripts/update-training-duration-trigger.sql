-- Create function to update training duration when modules change
CREATE OR REPLACE FUNCTION update_training_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the training's duration and module count
    UPDATE trainings 
    SET 
        duration = (
            SELECT COALESCE(SUM(m.duration), 0) 
            FROM modules m 
            WHERE m.training_id = COALESCE(NEW.training_id, OLD.training_id)
        ),
        modules = (
            SELECT COUNT(*) 
            FROM modules m 
            WHERE m.training_id = COALESCE(NEW.training_id, OLD.training_id)
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.training_id, OLD.training_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for modules table
DROP TRIGGER IF EXISTS trigger_update_training_duration_insert ON modules;
CREATE TRIGGER trigger_update_training_duration_insert
    AFTER INSERT ON modules
    FOR EACH ROW
    EXECUTE FUNCTION update_training_duration();

DROP TRIGGER IF EXISTS trigger_update_training_duration_update ON modules;
CREATE TRIGGER trigger_update_training_duration_update
    AFTER UPDATE ON modules
    FOR EACH ROW
    EXECUTE FUNCTION update_training_duration();

DROP TRIGGER IF EXISTS trigger_update_training_duration_delete ON modules;
CREATE TRIGGER trigger_update_training_duration_delete
    AFTER DELETE ON modules
    FOR EACH ROW
    EXECUTE FUNCTION update_training_duration();
