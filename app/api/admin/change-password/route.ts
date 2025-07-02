import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { verifyToken } from "@/lib/auth-utils"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    console.log("Changing password for admin ID:", decoded.id)

    // Get current password hash
    const result = await sql`
      SELECT password_hash 
      FROM users 
      WHERE id = ${decoded.id} AND role = 'admin'
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    const admin = result[0]

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password_hash)
    if (!isCurrentPasswordValid) {
      console.log("Current password verification failed")
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await sql`
      UPDATE users 
      SET 
        password_hash = ${newPasswordHash},
        updated_at = NOW()
      WHERE id = ${decoded.id} AND role = 'admin'
    `

    console.log("Password updated successfully")
    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
