import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { verifyToken } from "@/lib/auth-utils"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    // --- FIX ---
    // REMOVED: const { userId } = await request.json()
    // REMOVED: The unnecessary security check.
    // We will now ONLY use the trusted ID from the token.

    const userResult = await sql`SELECT profile_picture FROM users WHERE id = ${decoded.id}` // USE decoded.id
    if (userResult.length === 0) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })

    const currentImage = userResult[0].profile_picture
    if (currentImage && !currentImage.includes("placeholder.svg")) {
      const filePath = join(process.cwd(), "public", currentImage)
      if (existsSync(filePath)) await unlink(filePath)
    }

    await sql`UPDATE users SET profile_picture = NULL, updated_at = NOW() WHERE id = ${decoded.id}` // USE decoded.id

    return NextResponse.json({ success: true, message: "Profile picture removed" })
  } catch (error) {
    console.error("Image delete error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete image" }, { status: 500 })
  }
}