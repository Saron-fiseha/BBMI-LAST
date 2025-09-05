import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { verifyToken } from "@/lib/auth-utils"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get("image") as File
    const userId = formData.get("userId") as string

    // Security check: Ensure the user is updating their own profile
    if (decoded.id.toString() !== userId) {
      return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 })
    }

    if (!file) return NextResponse.json({ success: false, error: "File is required" }, { status: 400 })
    if (!file.type.startsWith("image/")) return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ success: false, error: "File size exceeds 5MB" }, { status: 400 })

    const uploadsDir = join(process.cwd(), "public", "uploads", "profiles")
    if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true })

    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const fileName = `profile-${userId}-${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)
    const imageUrl = `/uploads/profiles/${fileName}`

    await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

    await sql`UPDATE users SET profile_picture = ${imageUrl}, updated_at = NOW() WHERE id = ${userId}`

    return NextResponse.json({ success: true, imageUrl })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json({ success: false, error: "Failed to upload image" }, { status: 500 })
  }
}