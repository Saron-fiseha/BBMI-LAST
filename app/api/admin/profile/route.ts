import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth-utils"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

// function verifyToken(token: string) {
//   try {
//     const payload = JSON.parse(atob(token))

//     // Check expiration
//     if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
//       return null
//     }

//     return {
//       id: payload.id,
//       email: payload.email,
//       name: payload.name,
//       role: payload.role,
//     }
//   } catch (error) {
//     console.error("Token verification failed:", error)
//     return null
//   }
// }

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

     console.log("Fetching profile for admin ID:", decoded.id)

    const result = await sql`
      SELECT id, full_name, email, phone, profile_picture
      FROM users 
      WHERE id = ${decoded.id} AND role = 'admin'
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    const admin = result[0]
    return NextResponse.json({
      id: admin.id,
      name: admin.full_name || "",
      email: admin.email || "",
      phone: admin.phone || "",
      bio: "", // Bio field doesn't exist in current schema, keeping empty
      avatar: admin.profile_picture || "/placeholder.svg?height=100&width=100",
    })

  } 
  catch (error) {
    console.error("Error fetching admin profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const { name, email, phone, bio, } = await request.json()

    console.log("Updating profile for admin ID:", decoded.id)
    console.log("Update data:", { name, email, phone })
    
    await sql`
      UPDATE users 
      SET 
        full_name = ${name},
        email = ${email},
        phone = ${phone},
        updated_at = NOW()
      WHERE id = ${decoded.id} AND role = 'admin'
    `

    console.log("Profile updated successfully")
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Error updating admin profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
