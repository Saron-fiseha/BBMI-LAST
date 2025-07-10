import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Get user profile data
    const result = await sql`
      SELECT id, full_name, email, phone, age, sex, profile_picture, role, created_at
      FROM users 
      WHERE id = ${userId}
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: result[0],
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 })
  }
}
