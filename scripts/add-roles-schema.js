require('dotenv').config({path: '.env.local'});
const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    console.log("Adding columns...");
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS privileges JSONB DEFAULT '[]'::jsonb`;
    
    // Set current admins as super admin
    console.log("Setting existing admins as super admins...");
    const res = await sql`UPDATE users SET is_super_admin = true WHERE role = 'admin'`;
    console.log(`Updated existing admins.`);
    console.log("Migration successful.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
