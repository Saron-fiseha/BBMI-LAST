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
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Fixed query with correct parameter ordering
    const queryText = `
      SELECT id, title, message, type, read, created_at, related_id, related_type, link
      FROM notifications 
      WHERE user_id = $1 
      AND (read = FALSE OR (read = TRUE AND created_at > NOW() - INTERVAL '7 days'))
      ORDER BY created_at DESC 
      LIMIT $2
    `
    
    const queryParams = [user.id, limit]

    const { rows: notifications } = await sql.query(queryText, queryParams)

    const unreadCountResult = await sql`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ${user.id} AND read = FALSE
    `
    const unreadCount = Number.parseInt(unreadCountResult[0].count)

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Failed to fetch notifications: ${errorMsg}` }, { status: 500 })
  }
}
