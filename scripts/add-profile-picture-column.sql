-- Add profile_picture column to users table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'profile_picture'
    ) THEN
        ALTER TABLE users ADD COLUMN profile_picture TEXT;
        RAISE NOTICE 'Added profile_picture column to users table';
    ELSE
        RAISE NOTICE 'profile_picture column already exists in users table';
    END IF;
END $$;

