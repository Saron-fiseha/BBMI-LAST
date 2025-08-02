-- Update existing portfolio_items table to add file upload support
ALTER TABLE portfolio_items 
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_type VARCHAR(10) DEFAULT 'image' CHECK (file_type IN ('image', 'video'));

-- Update existing image_url data to file_path if exists
UPDATE portfolio_items 
SET file_path = image_url, file_type = 'image' 
WHERE image_url IS NOT NULL AND file_path IS NULL;

-- Drop the old image_url column if it exists
ALTER TABLE portfolio_items DROP COLUMN IF EXISTS image_url;

-- Create index for file_type
CREATE INDEX IF NOT EXISTS idx_portfolio_file_type ON portfolio_items(file_type);
