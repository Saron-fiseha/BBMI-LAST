import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    const body = await request.json()
    const { name, email, phone, age, gender, password, status } = body

    console.log("Updating student with ID:", id, "Data:", { name, email, phone, age, gender, status })

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 })
    }

    const student = await sql`
      SELECT user_id FROM students WHERE id = ${id}
    `

    if (student.length === 0) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    const userId = student[0].user_id

    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.trim()} AND id != ${userId}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 })
    }

    if (password?.trim()) {
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams?.id || request.nextUrl.pathname.split('/').pop()

    console.log("Deleting student with ID:", id)

    // Check if the ID belongs to students.id or users.id
    const studentById = await sql`SELECT id, user_id FROM students WHERE id = ${id}`
    let userId: string | number | null = null
    let studentRecordId: string | number | null = null

    if (studentById.length > 0) {
      studentRecordId = studentById[0].id
      userId = studentById[0].user_id
    } else {
      // Fallback: check if id was passed as user_id directly
      const studentByUserId = await sql`SELECT id, user_id FROM students WHERE user_id = ${id}`
      if (studentByUserId.length > 0) {
        studentRecordId = studentByUserId[0].id
        userId = id
      } else {
        const userDirect = await sql`SELECT id FROM users WHERE id = ${id}`
        if (userDirect.length > 0) {
          userId = id
        } else {
          return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
        }
      }
    }

    // 1. Clean up dependent child records for userId
    if (userId) {
      await sql`
        DELETE FROM certificates 
        WHERE user_id = ${userId} 
           OR enrollment_id IN (SELECT id FROM enrollments WHERE user_id = ${userId})
      `

      await sql`
        DELETE FROM module_progress 
        WHERE user_id = ${userId} 
           OR enrollment_id IN (SELECT id FROM enrollments WHERE user_id = ${userId})
      `

      await sql`DELETE FROM lesson_progress WHERE user_id = ${userId}`
      await sql`DELETE FROM student_activities WHERE user_id = ${userId}`
      await sql`DELETE FROM reviews WHERE user_id = ${userId}`
      await sql`DELETE FROM payments WHERE user_id = ${userId}`
      await sql`DELETE FROM enrollments WHERE user_id = ${userId}`
      await sql`DELETE FROM students WHERE user_id = ${userId} OR id = ${id}`
      await sql`DELETE FROM notifications WHERE user_id = ${userId}`
      await sql`DELETE FROM messages WHERE sender_id = ${userId}`
      await sql`DELETE FROM conversations WHERE user1_id = ${userId} OR user2_id = ${userId}`
      await sql`DELETE FROM users WHERE id = ${userId}`
    } else if (studentRecordId) {
      await sql`DELETE FROM students WHERE id = ${studentRecordId}`
    }

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
