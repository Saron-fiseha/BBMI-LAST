import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 })
    }

    const fileNameLower = file.name.toLowerCase()
    const allowedImageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    const allowedVideoExts = [".mp4", ".webm", ".ogg", ".avi", ".mov", ".mkv", ".flv", ".wmv", ".m4v", ".3gp"]
    const isImage = file.type.startsWith("image/") || allowedImageExts.some((ext) => fileNameLower.endsWith(ext))
    const isVideo = file.type.startsWith("video/") || allowedVideoExts.some((ext) => fileNameLower.endsWith(ext))

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, OGG, AVI, MOV, MKV)",
        },
        { status: 400 },
      )
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File size too large. Maximum size is 100MB" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${timestamp}_${originalName}`

    // Determine file type
    const fileType = isVideo ? "video" : "image"

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", "portfolio")
    await mkdir(uploadDir, { recursive: true })

    // Write file
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Return the public URL path
    const publicPath = `/uploads/portfolio/${filename}`

    console.log("✅ File uploaded successfully:", publicPath)

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      filePath: publicPath,
      fileType: fileType,
      originalName: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error("❌ Error uploading file:", error)
    return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 })
  }
}
    
