-- Create function to update category training count
CREATE OR REPLACE FUNCTION update_category_training_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the category's training count
    UPDATE categories 
    SET trainings_count = (
        SELECT COUNT(*) 
        FROM trainings t 
        WHERE t.category_id = COALESCE(NEW.category_id, OLD.category_id)
    )
    WHERE id = COALESCE(NEW.category_id, OLD.category_id);
    
    -- If category_id changed, update both old and new categories
    IF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
        UPDATE categories 
        SET trainings_count = (
            SELECT COUNT(*) 
            FROM trainings t 
            WHERE t.category_id = OLD.category_id
        )
        WHERE id = OLD.category_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for trainings table
DROP TRIGGER IF EXISTS trigger_update_category_training_count_insert ON trainings;
CREATE TRIGGER trigger_update_category_training_count_insert
    AFTER INSERT ON trainings
    FOR EACH ROW
    EXECUTE FUNCTION update_category_training_count();

DROP TRIGGER IF EXISTS trigger_update_category_training_count_update ON trainings;
CREATE TRIGGER trigger_update_category_training_count_update
    AFTER UPDATE ON trainings
    FOR EACH ROW
    EXECUTE FUNCTION update_category_training_count();

DROP TRIGGER IF EXISTS trigger_update_category_training_count_delete ON trainings;
CREATE TRIGGER trigger_update_category_training_count_delete
    AFTER DELETE ON trainings
    FOR EACH ROW
    EXECUTE FUNCTION update_category_training_count();

-- Initialize existing categories with correct training counts
UPDATE categories 
SET trainings_count = (
    SELECT COUNT(*) 
    FROM trainings t 
    WHERE t.category_id = categories.id
);
