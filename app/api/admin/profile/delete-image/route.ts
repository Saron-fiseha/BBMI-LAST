import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Get current profile picture path
    const userResult = await sql`
      SELECT profile_picture FROM users WHERE id = ${userId}
    `

    if (userResult.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const currentImage = userResult[0].profile_picture

    // Delete file from filesystem if it exists and is not a placeholder
    if (currentImage && !currentImage.includes("placeholder.svg")) {
      const filePath = join(process.cwd(), "public", currentImage)
      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    }

    // Update database to remove profile picture
    await sql`
      UPDATE users 
      SET profile_picture = NULL, updated_at = NOW()
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: "Profile picture removed successfully",
    })
  } catch (error) {
    console.error("Image delete error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete image" }, { status: 500 })
  }
}
