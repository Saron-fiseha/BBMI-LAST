import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    const body = await request.json()
    const { name, email, phone, age, gender, password, role, status, image_url } = body

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and email are required",
        },
        { status: 400 },
      )
    }

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email} AND id != ${id}`

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is already taken by another user",
        },
        { status: 400 },
      )
    }

    let result
    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 12)
      result = await sql`
        UPDATE users 
        SET full_name = ${name}, email = ${email}, phone = ${phone || null}, age = ${age || null}, 
            sex = ${gender || null}, password_hash = ${hashedPassword}, role = ${role}, 
            status = ${status},  profile_picture = ${image_url || null}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, full_name, email, phone, age, sex, role, status,  profile_picture, created_at
      `
    } else {
      result = await sql`
        UPDATE users 
        SET full_name = ${name}, email = ${email}, phone = ${phone || null}, age = ${age || null}, 
            sex = ${gender || null}, role = ${role}, status = ${status}, 
             profile_picture = ${image_url || null}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, full_name, email, phone, age, sex, role, status,  profile_picture, created_at
      `
    }

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      user: result[0],
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams?.id || request.nextUrl.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const existingUser = await sql`SELECT id, full_name FROM users WHERE id = ${id}`

    if (existingUser.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    const userName = existingUser[0].full_name

    // 1. Clean up dependent child records across all related tables
    await sql`
      DELETE FROM certificates 
      WHERE user_id = ${id} 
         OR enrollment_id IN (SELECT id FROM enrollments WHERE user_id = ${id})
    `

    await sql`
      DELETE FROM module_progress 
      WHERE user_id = ${id} 
         OR enrollment_id IN (SELECT id FROM enrollments WHERE user_id = ${id})
    `

    await sql`DELETE FROM lesson_progress WHERE user_id = ${id}`
    await sql`DELETE FROM student_activities WHERE user_id = ${id}`
    await sql`DELETE FROM reviews WHERE user_id = ${id}`
    await sql`DELETE FROM payments WHERE user_id = ${id}`
    await sql`DELETE FROM enrollments WHERE user_id = ${id}`
    await sql`DELETE FROM students WHERE user_id = ${id}`

    await sql`
      DELETE FROM instructor_sessions 
      WHERE instructor_id IN (SELECT id FROM instructors WHERE user_id = ${id})
    `
    await sql`DELETE FROM instructors WHERE user_id = ${id}`

    await sql`UPDATE trainings SET instructor_id = NULL WHERE instructor_id = ${id}`

    await sql`DELETE FROM messages WHERE sender_id = ${id}`
    await sql`DELETE FROM conversations WHERE user1_id = ${id} OR user2_id = ${id}`
    await sql`DELETE FROM notifications WHERE user_id = ${id}`

    // 2. Delete the user
    await sql`DELETE FROM users WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      message: `User ${userName} deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
