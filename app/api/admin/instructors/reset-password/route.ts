import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
export const dynamic = "force-dynamic"

// POST - Reset instructor password directly in the database (no email required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { instructorId, newPassword } = body

    if (!instructorId || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Update password and ensure email is verified so the user can log in
    const result = await sql`
      UPDATE users
      SET 
        password_hash = ${passwordHash},
        email_verified = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${instructorId}
      RETURNING full_name, email
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
    }

    const user = result[0]
    console.log(`Password reset for: ${user.full_name} (${user.email})`)

    return NextResponse.json({
      message: "Password reset successfully",
      name: user.full_name,
      email: user.email,
      success: true,
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
