import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth-utils"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { currentPassword, newPassword } = await request.json()

    const userResult = await sql`SELECT password FROM users WHERE id = ${decoded.id}`
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const userFromDb = userResult[0];

    // --- THE FIX ---
    // Check if the user has a password set in the database before attempting to compare.
    if (!userFromDb.password || typeof userFromDb.password !== 'string') {
        return NextResponse.json({
            success: false,
            // Provide a clear error message for this specific case.
            error: "No password is set for this account. Please use the 'Forgot Password' feature to set one." 
        }, { status: 400 }); // 400 Bad Request is appropriate here.
    }

    const isMatch = await bcrypt.compare(currentPassword, userFromDb.password)
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    await sql`UPDATE users SET password = ${hashedNewPassword}, updated_at = NOW() WHERE id = ${decoded.id}`

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}