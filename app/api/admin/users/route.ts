import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || "all"
    const status = searchParams.get("status") || "all"

    let users

    // Build query based on filters
    if (search.trim() && role !== "all" && status !== "all") {
      // All three filters
      users = await sql`
        SELECT id, full_name, email, phone, age, sex, role, status, profile_picture, created_at
        FROM users 
        WHERE (full_name ILIKE ${`%${search.trim()}%`} OR email ILIKE ${`%${search.trim()}%`})
        AND role = ${role} AND status = ${status}
        ORDER BY created_at DESC
      `
    } else if (search.trim() && role !== "all") {
      // Search + role filter
      users = await sql`
        SELECT id, full_name, email, phone, age, sex, role, status,  profile_picture, created_at
        FROM users 
        WHERE (full_name ILIKE ${`%${search.trim()}%`} OR email ILIKE ${`%${search.trim()}%`})
        AND role = ${role}
        ORDER BY created_at DESC
      `
    } else if (search.trim() && status !== "all") {
      // Search + status filter
      users = await sql`
        SELECT id, full_name, email, phone, age, sex, role, status,  profile_picture, created_at
        FROM users 
        WHERE (full_name ILIKE ${`%${search.trim()}%`} OR email ILIKE ${`%${search.trim()}%`})
        AND status = ${status}
        ORDER BY created_at DESC
      `
    } else if (role !== "all" && status !== "all") {
      // Role + status filter
      users = await sql`
        SELECT id, full_name, email, phone, age, sex, role, status,  profile_picture, created_at
        FROM users 
        WHERE role = ${role} AND status = ${status}
        ORDER BY created_at DESC
      `
    } else if (search.trim()) {
      // Search only
      users = await sql`
        SELECT id, full_name, email, phone, age, sex, role, status,  profile_picture, created_at
        FROM users 
        WHERE full_name ILIKE ${`%${search.trim()}%`} OR email ILIKE ${`%${search.trim()}%`}
        ORDER BY created_at DESC
      `
    } else if (role !== "all") {
      // Role filter only
      users = await sql`
        SELECT id, full_name, email, phone, age, sex, role, status,  profile_picture, created_at
        FROM users 
        WHERE role = ${role}
        ORDER BY created_at DESC
      `
    } else if (status !== "all") {
      // Status filter only
      users = await sql`
        SELECT id, full_name, email, phone, age, sex, role, status,  profile_picture, created_at
        FROM users 
        WHERE status = ${status}
        ORDER BY created_at DESC
      `
    } else {
      // No filters
      users = await sql`
        SELECT id, full_name, email, phone, age, sex, role, status,  profile_picture, created_at
        FROM users 
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json({
      success: true,
      users: users || [],
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        users: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, age, gender, password, role = "student", status = "active", image_url } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email, and password are required",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 400 },
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Insert new user
    const result = await sql`
      INSERT INTO users (full_name, email, phone, age, sex, password_hash, role, status,  profile_picture) 
      VALUES (${name}, ${email}, ${phone || null}, ${age || null}, ${gender || null}, ${hashedPassword}, ${role}, ${status}, ${image_url || null})
      RETURNING id, full_name, email, phone, age, sex, role, status,  profile_picture, created_at
    `

    return NextResponse.json({
      success: true,
      user: result[0],
      message: "User created successfully",
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
      },
      { status: 500 },
    )
  }
}
