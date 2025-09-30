import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

// POST - Reset instructor password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { instructorId, newPassword, email } = body

    if (!instructorId || !newPassword || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Step 1: Get the user_id for this instructor
    const instructorRecord = await sql`
      SELECT user_id, full_name, email 
      FROM instructors 
      WHERE id = ${instructorId} AND email = ${email}
    `

    if (instructorRecord.length === 0) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
    }

    const instructor = instructorRecord[0]

    // Step 2: Update the password in the users table
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${instructor.user_id}
    `

    // Step 3: Simulate email notification
    console.log(`Password reset email would be sent to: ${instructor.email}`)
    console.log(`New password for ${instructor.full_name}: ${newPassword}`)

    const emailContent = {
      to: instructor.email,
      subject: "Password Reset - Beauty Salon LMS",
      body: `
        Dear ${instructor.full_name},
        
        Your password has been reset by an administrator.
        Your new temporary password is: ${newPassword}
        
        Please log in and change your password immediately.
        
        Best regards,
        Beauty Salon LMS Team
      `,
    }

    return NextResponse.json({
      message: "Password reset successfully",
      instructor: { name: instructor.full_name, email: instructor.email },
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
