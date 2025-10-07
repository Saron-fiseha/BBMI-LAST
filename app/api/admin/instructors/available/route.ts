
import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching ALL available instructors for admin panel...")

    // This query now fetches ALL users with the role 'instructor'
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
      ORDER BY u.full_name ASC
    `

    console.log(`✅ Found ${instructors.length} total instructors`)
    return NextResponse.json({ instructors })
    
  } catch (error) {
    console.error("❌ Error fetching available instructors:", error)
    return NextResponse.json({ error: "Failed to fetch instructors" }, { status: 500 })
  }
}


