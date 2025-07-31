-- Create portfolio_items table for Brushed By Betty
CREATE TABLE IF NOT EXISTS portfolio_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('makeup', 'skincare', 'haircare', 'nails', 'training')),
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_status ON portfolio_items(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio_items(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON portfolio_items(created_at DESC);

-- Insert sample data for Brushed By Betty
INSERT INTO portfolio_items (title, description, category, image_url, status, featured) VALUES
('Glamorous Evening Makeup', 'A stunning evening look featuring bold eyes and perfect contouring. This transformation showcases advanced makeup techniques taught in our professional courses.', 'makeup', '/placeholder.svg?height=400&width=600', 'published', true),
('Bridal Beauty Transformation', 'Complete bridal makeover including skincare prep, flawless foundation, and romantic styling. Perfect example of our bridal specialist training program.', 'makeup', '/placeholder.svg?height=400&width=600', 'published', true),
('Advanced Skincare Treatment', 'Professional facial treatment demonstrating our skincare certification program. Includes deep cleansing, exfoliation, and hydrating mask application.', 'skincare', '/placeholder.svg?height=400&width=600', 'published', false),
('Creative Hair Styling', 'Innovative hair styling techniques featuring braids, curls, and updos. Showcases skills from our comprehensive hair styling course.', 'haircare', '/placeholder.svg?height=400&width=600', 'published', false),
('Nail Art Masterpiece', 'Intricate nail art design demonstrating advanced techniques taught in our nail technician certification program.', 'nails', '/placeholder.svg?height=400&width=600', 'published', false),
('Student Training Session', 'Behind-the-scenes look at our hands-on training environment where students learn from industry professionals.', 'training', '/placeholder.svg?height=400&width=600', 'published', true),
('Natural Everyday Look', 'Fresh, natural makeup perfect for daily wear. Demonstrates techniques from our beginner-friendly makeup courses.', 'makeup', '/placeholder.svg?height=400&width=600', 'published', false),
('Anti-Aging Skincare', 'Specialized anti-aging treatment showcasing advanced skincare techniques and product knowledge from our esthetics program.', 'skincare', '/placeholder.svg?height=400&width=600', 'published', false);
