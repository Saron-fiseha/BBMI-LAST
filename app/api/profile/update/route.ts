import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth-utils" // Assuming you have this utility

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

// GET - Fetch the logged-in student's profile
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT id, full_name, email, phone, profile_picture
      FROM users 
      WHERE id = ${decoded.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    const student = result[0]
    return NextResponse.json({ success: true, user: student })
  } catch (error) {
    console.error("Error fetching student profile:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update the logged-in student's profile
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, phone, bio } = await request.json()

    // Check if email is already taken by another user
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${decoded.id}
    `
    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, error: "Email is already taken" }, { status: 409 })
    }
    
    await sql`
      UPDATE users 
      SET 
        full_name = ${name},
        email = ${email},
        phone = ${phone},
        updated_at = NOW()
      WHERE id = ${decoded.id}
    `

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Error updating student profile:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}