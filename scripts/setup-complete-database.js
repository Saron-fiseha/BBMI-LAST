// Load environment variables from .env file
require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

async function setupCompleteDatabase() {
  try {
    console.log("🚀 Setting up complete database schema...");

    // Get database URL from environment
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
      console.error("❌ DATABASE_URL environment variable is not set");
      console.log(
        "💡 Please set your DATABASE_URL in your .env file or environment variables"
      );
      console.log("🔍 Current working directory:", process.cwd());
      console.log("🔍 Looking for .env file in:", process.cwd() + "/.env");
      process.exit(1);
    }

    console.log("✅ Database URL found, connecting...");
    const sql = neon(DATABASE_URL);

    // Test connection first
    console.log("🔌 Testing database connection...");
    await sql`SELECT 1 as test`;
    console.log("✅ Database connection successful!");

    // Create sessions table
    console.log("📋 Creating sessions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          course_id INTEGER,
          instructor_id INTEGER NOT NULL,
          scheduled_at TIMESTAMP NOT NULL,
          duration INTEGER DEFAULT 60,
          meeting_url VARCHAR(500),
          status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
          max_participants INTEGER DEFAULT 50,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create session_bookings table
    console.log("📋 Creating session_bookings table...");
    await sql`
      CREATE TABLE IF NOT EXISTS session_bookings (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'attended', 'no_show')),
          booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          notes TEXT,
          UNIQUE(session_id, student_id)
      )
    `;

    // Create indexes for better performance
    console.log("🔍 Creating indexes...");
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_sessions_instructor_id ON sessions(instructor_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_session_bookings_session_id ON session_bookings(session_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_session_bookings_student_id ON session_bookings(student_id)`;
    } catch (indexError) {
      console.log("ℹ️ Some indexes may already exist, continuing...");
    }

    // Insert sample data (only if no sessions exist)
    console.log("📊 Adding sample data...");
    const existingSessions = await sql`SELECT COUNT(*) as count FROM sessions`;
    const sessionCount = Number.parseInt(existingSessions[0].count) || 0;

    if (sessionCount === 0) {
      await sql`
        INSERT INTO sessions (title, description, instructor_id, scheduled_at, duration, status) VALUES
        ('Hair Styling Fundamentals - Live Q&A', 'Interactive session covering basic hair styling techniques', 1, NOW() + INTERVAL '2 days', 90, 'scheduled'),
        ('Advanced Color Theory Workshop', 'Deep dive into color theory and application techniques', 1, NOW() + INTERVAL '5 days', 120, 'scheduled'),
        ('Business Skills for Beauty Professionals', 'Learn how to build and grow your beauty business', 1, NOW() + INTERVAL '7 days', 60, 'scheduled')
      `;
      console.log("✅ Sample sessions created");
    } else {
      console.log(
        `ℹ️ Sessions table already has ${sessionCount} sessions, skipping sample data insertion`
      );
    }

    console.log("✅ Database setup completed successfully!");
    console.log(
      "🎯 You can now create real sessions that will be stored in the database"
    );
    console.log("🔄 Refresh your instructor sessions page to see the changes");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    console.log(
      "💡 Make sure your DATABASE_URL is correct and your database is accessible"
    );
    console.log("🔧 Check your .env file or environment variables");
    console.log("🌐 Your DATABASE_URL should start with 'postgresql://'");
    process.exit(1);
  }
}

// Run the setup
setupCompleteDatabase();
