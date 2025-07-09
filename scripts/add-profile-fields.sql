-- Add missing profile fields to users table
DO $$ 
BEGIN 
    -- Add position column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'position') THEN
        ALTER TABLE users ADD COLUMN position TEXT;
    END IF;

    -- Add cover_photo column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'cover_photo') THEN
        ALTER TABLE users ADD COLUMN cover_photo TEXT;
    END IF;

    -- Add specialties column (JSON array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'specialties') THEN
        ALTER TABLE users ADD COLUMN specialties JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add achievements column (JSON array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'achievements') THEN
        ALTER TABLE users ADD COLUMN achievements JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Ensure certifications column exists (might already exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'certifications') THEN
        ALTER TABLE users ADD COLUMN certifications JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Ensure social_links column exists (might already exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'social_links') THEN
        ALTER TABLE users ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Ensure location column exists (might already exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'location') THEN
        ALTER TABLE users ADD COLUMN location TEXT;
    END IF;

    -- Ensure experience_years column exists (might already exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'experience_years') THEN
        ALTER TABLE users ADD COLUMN experience_years INTEGER DEFAULT 0;
    END IF;

    -- Ensure bio column exists (might already exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;

    -- Ensure specialization column exists (might already exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'specialization') THEN
        ALTER TABLE users ADD COLUMN specialization TEXT;
    END IF;

    -- Ensure profile_picture column exists (might already exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_picture') THEN
        ALTER TABLE users ADD COLUMN profile_picture TEXT;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;

    -- Ensure password_hash column exists (should already exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT;
    END IF;

END $$;

-- Create user activity logs table for password changes
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
