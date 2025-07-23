import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching available instructors...")

    // Fetch instructors from users table with role 'instructor'
    const instructors = await sql`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.status,
        u.created_at
      FROM users u
      WHERE u.role = 'instructor'
      AND u.status = 'active'
      ORDER BY u.full_name ASC
    `

    console.log(`✅ Found ${instructors.length} available instructors`)
    return NextResponse.json({ instructors })
  } catch (error) {
    console.error("❌ Error fetching available instructors:", error)
    return NextResponse.json({ error: "Failed to fetch instructors" }, { status: 500 })
  }
}
