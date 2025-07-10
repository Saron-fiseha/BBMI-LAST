-- Add new columns to trainings table
ALTER TABLE trainings 
ADD COLUMN IF NOT EXISTS instructor_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS instructor_id INTEGER,
ADD COLUMN IF NOT EXISTS modules INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level VARCHAR(50);

-- Add foreign key constraint for instructor_id
ALTER TABLE trainings 
ADD CONSTRAINT fk_trainings_instructor 
FOREIGN KEY (instructor_id) REFERENCES users(id);

-- Update existing trainings with level from categories
UPDATE trainings 
SET level = (
    SELECT c.level 
    FROM categories c 
    WHERE c.id = trainings.category_id
)
WHERE level IS NULL;

-- Update existing trainings with module count and duration
UPDATE trainings 
SET 
    modules = (
        SELECT COUNT(*) 
        FROM modules m 
        WHERE m.training_id = trainings.id
    ),
    duration = (
        SELECT COALESCE(SUM(m.duration), 0) 
        FROM modules m 
        WHERE m.training_id = trainings.id
    );
