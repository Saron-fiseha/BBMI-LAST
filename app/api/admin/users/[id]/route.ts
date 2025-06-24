import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function PUT(request: NextRequest) {
  try {
    // Get the ID from the URL path
    const id = request.nextUrl.pathname.split('/').pop()
    const body = await request.json()
    const { name, email, phone, age, gender, password, role, status, image_url } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and email are required",
        },
        { status: 400 },
      )
    }

    // Check if email is already taken by another user
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

    // Update user with or without password
    let result
    if (password && password.trim()) {
      // Update with new password
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
      // Update without changing password
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if user exists
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

    // Delete user
    await sql`DELETE FROM users WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      message: `User ${existingUser[0].name} deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      { status: 500 },
    )
  }
}
