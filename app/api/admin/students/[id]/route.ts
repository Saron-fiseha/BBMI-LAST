import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest) {
  try {
     // Get the ID from the URL path
    const id = request.nextUrl.pathname.split('/').pop()
    const body = await request.json()
    const { name, email, phone, age, gender, password, status } = body

    console.log("Updating student with ID:", id, "Data:", { name, email, phone, age, gender, status })

    // Validate required fields
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 })
    }

    // Get the student's user_id
    const student = await sql`
      SELECT user_id FROM students WHERE id = ${id}
    `

    if (student.length === 0) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    const userId = student[0].user_id

    // Check if email already exists for other users
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.trim()} AND id != ${userId}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 })
    }

    // Update user record using password_hash column
    if (password?.trim()) {
      // Update with new password
      const hashedPassword = await hashPassword(password)
      await sql`
        UPDATE users 
        SET full_name = ${name.trim()}, 
            email = ${email.trim()}, 
            phone = ${phone?.trim() || null}, 
            age = ${age ? Number.parseInt(age.toString()) : null}, 
            sex = ${gender || null},
            password_hash = ${hashedPassword},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `
    } else {
      // Update without changing password
      await sql`
        UPDATE users 
        SET full_name = ${name.trim()}, 
            email = ${email.trim()}, 
            phone = ${phone?.trim() || null}, 
            age = ${age ? Number.parseInt(age.toString()) : null}, 
            sex = ${gender || null},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `
    }

    // Update student record
    await sql`
      UPDATE students 
      SET status = ${status || "active"},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
    })
  } catch (error) {
    console.error("Student update error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update student",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log("Deleting student with ID:", id)

    // Get the student's user_id
    const student = await sql`
      SELECT user_id FROM students WHERE id = ${id}
    `

    if (student.length === 0) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    const userId = student[0].user_id

    // Delete student record first (due to foreign key constraint)
    await sql`
      DELETE FROM students WHERE id = ${id}
    `

    // Delete user record
    await sql`
      DELETE FROM users WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    })
  } catch (error) {
    console.error("Student deletion error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete student",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Simple password hashing function
async function hashPassword(password: string): Promise<string> {
  try {
    const bcrypt = await import("bcryptjs")
    return await bcrypt.hash(password, 12)
  } catch {
    const crypto = await import("crypto")
    return crypto
      .createHash("sha256")
      .update(password + "beautysalon_salt_2024")
      .digest("hex")
  }
}
