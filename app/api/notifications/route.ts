import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]
    if (!token || token === "null" || token === "undefined") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const notifications = await sql`
      SELECT id, title, message, type, read, created_at, related_id, related_type, link
      FROM notifications 
      WHERE user_id = ${user.id} 
      AND (read = FALSE OR (read = TRUE AND created_at > NOW() - INTERVAL '7 days'))
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `

    const unreadCountResult = await sql`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ${user.id} AND read = FALSE
    `
    const unreadCount = Number.parseInt(unreadCountResult[0]?.count || "0", 10)

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Failed to fetch notifications: ${errorMsg}` }, { status: 500 })
  }
}
