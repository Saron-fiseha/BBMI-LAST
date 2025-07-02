import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const instructors = await sql`
      SELECT 
        id, 
        name, 
        email, 
        specialization,
        bio,
        profile_picture,
        created_at
      FROM users 
      WHERE role = 'instructor' 
      AND active = true
      ORDER BY name ASC
    `

    return NextResponse.json({
      success: true,
      instructors: instructors || [],
    })
  } catch (error) {
    console.error("Instructors fetch error:", error)

    // Return mock data as fallback
    const mockInstructors = [
      {
        id: 1,
        name: "Sarah Martinez",
        email: "sarah@bbmi.com",
        specialization: "Bridal Makeup",
        bio: "Expert in bridal and special occasion makeup with 10+ years experience",
      },
      {
        id: 2,
        name: "Emma Wilson",
        email: "emma@bbmi.com",
        specialization: "Color Theory",
        bio: "Color theory specialist and makeup artist educator",
      },
      {
        id: 3,
        name: "Michael Chen",
        email: "michael@bbmi.com",
        specialization: "Special Effects",
        bio: "Professional special effects and theatrical makeup artist",
      },
    ]

    return NextResponse.json({
      success: true,
      instructors: mockInstructors,
    })
  }
}
