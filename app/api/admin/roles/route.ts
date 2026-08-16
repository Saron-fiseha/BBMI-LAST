import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuth(request)
    if (!user || user.role !== "admin" || !user.is_super_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all admins
    const admins = await sql`
      SELECT id, full_name, email, role, privileges, is_super_admin
      FROM users 
      WHERE role = 'admin'
      ORDER BY id ASC
    `
    
    // Fetch all users for the dropdown
    const allUsers = await sql`
      SELECT id, full_name, email, role 
      FROM users
      ORDER BY full_name ASC
    `

    return NextResponse.json({ admins, allUsers })
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user } = await getAuth(request)
    if (!user || user.role !== "admin" || !user.is_super_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, privileges } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Update the user to be an admin with the specified privileges
    // Ensure they don't become a super_admin this way
    await sql`
      UPDATE users 
      SET 
        role = 'admin', 
        privileges = ${JSON.stringify(privileges)}::jsonb,
        is_super_admin = false
      WHERE id = ${userId}
    `

    return NextResponse.json({ success: true, message: "Roles updated successfully" })
  } catch (error) {
    console.error("Error updating role:", error)
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user } = await getAuth(request)
    if (!user || user.role !== "admin" || !user.is_super_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Revoke admin rights by changing role back to student
    await sql`
      UPDATE users 
      SET 
        role = 'student', 
        privileges = '[]'::jsonb,
        is_super_admin = false
      WHERE id = ${userId} AND is_super_admin = false
    `

    return NextResponse.json({ success: true, message: "Admin rights revoked" })
  } catch (error) {
    console.error("Error revoking role:", error)
    return NextResponse.json({ error: "Failed to revoke role" }, { status: 500 })
  }
}
