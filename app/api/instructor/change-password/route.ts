import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 })
    }

    try {
      // Get current password hash
      const userResult = await sql`
        SELECT password FROM users WHERE id = ${user.id}
      `

      if (userResult.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const currentPasswordHash = userResult[0].password

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash)
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      // Hash new password
      const saltRounds = 12
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

      // Update password
      await sql`
        UPDATE users 
        SET password = ${newPasswordHash}, updated_at = NOW()
        WHERE id = ${user.id}
      `

      return NextResponse.json({ message: "Password changed successfully" })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
