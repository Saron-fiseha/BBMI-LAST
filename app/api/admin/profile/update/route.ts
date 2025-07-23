import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, email, phone, bio } = await request.json()

    if (!userId || !name || !email) {
      return NextResponse.json({ success: false, error: "User ID, name, and email are required" }, { status: 400 })
    }

    // Check if email is already taken by another user
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${userId}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, error: "Email is already taken by another user" }, { status: 400 })
    }

    // Update user profile
    const result = await sql`
      UPDATE users 
      SET full_name = ${name}, email = ${email}, phone = ${phone || null}, 
          updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, full_name, email, phone, profile_picture
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: result[0],
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 })
  }
}
