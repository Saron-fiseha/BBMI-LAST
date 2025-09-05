// import { type NextRequest, NextResponse } from "next/server"
// import { sql } from "@/lib/db"
// import { getUserFromToken } from "@/lib/auth"

// export async function GET(request: NextRequest) {
//   try {
//     const authHeader = request.headers.get("authorization")
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const token = authHeader.split(" ")[1]
//     const user = await getUserFromToken(token)

//     if (!user) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 })
//     }

//     const { searchParams } = new URL(request.url)
//     const limit = Number.parseInt(searchParams.get("limit") || "20")
//     const unreadOnly = searchParams.get("unread_only") === "true"

//     // Build query based on parameters
//     let query = sql`
//       SELECT 
//         id,
//         title,
//         message,
//         type,
//         read,
//         created_at,
//         related_id,
//         related_type,
//         metadata
//       FROM notifications 
//       WHERE user_id = ${user.id}
//     `

//     if (unreadOnly) {
//       query = sql`${query} AND read = FALSE`
//     }

//     query = sql`${query} ORDER BY created_at DESC LIMIT ${limit}`

//     const notifications = await query`
//     SELECT id, title, message, type, read, created_at, link
//       FROM notifications 
//       WHERE 
//         user_id = ${user.id} AND
//         (read = FALSE OR (read = TRUE AND updated_at > NOW() - INTERVAL '7 days'))
//       ORDER BY created_at DESC 
//       LIMIT ${limit}
//     `;

//     // Get unread count
//     const unreadCountResult = await sql`
//       SELECT COUNT(*) as count 
//       FROM notifications 
//       WHERE user_id = ${user.id} AND read = FALSE
//     `

//     const unreadCount = Number.parseInt(unreadCountResult[0].count)

//     return NextResponse.json({
//       success: true,
//       notifications: notifications.map((notification: any) => ({
//         id: notification.id,
//         title: notification.title,
//         message: notification.message,
//         type: notification.type,
//         read: notification.read,
//         created_at: notification.created_at,
//         related_id: notification.related_id,
//         related_type: notification.related_type,
//         metadata: notification.metadata,
//       })),
//       unreadCount,
//     })
//   } catch (error) {
//     console.error("Error fetching notifications:", error)
//     return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
//   }
// }

// import { type NextRequest, NextResponse } from "next/server"
// import { sql } from "@/lib/db"
// import { getUserFromToken } from "@/lib/auth"

// export async function GET(request: NextRequest) {
//   try {
//     const authHeader = request.headers.get("authorization")
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }
//     const token = authHeader.split(" ")[1]
//     const user = await getUserFromToken(token)
//     if (!user) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 })
//     }

//     const { searchParams } = new URL(request.url)
//     const limit = Number.parseInt(searchParams.get("limit") || "10")

//     // --- THE FIX ---
//     // We build the query string and parameters array dynamically and safely.

//     let queryText = `
//       SELECT id, title, message, type, read, created_at, link
//       FROM notifications 
//       WHERE user_id = $1 
//       AND (read = FALSE OR (read = TRUE AND updated_at > NOW() - INTERVAL '7 days'))
//       ORDER BY created_at DESC 
//       LIMIT $2
//     `;
    
//     // The parameters must be in the same order as the placeholders ($1, $2, etc.)
//     const queryParams = [user.id, limit];

//     // Execute the query with the constructed text and parameters
//     const { rows: notifications } = await sql.query(queryText, queryParams);

//     // Unread count remains the same
//     const unreadCountResult = await sql`
//       SELECT COUNT(*) as count 
//       FROM notifications 
//       WHERE user_id = ${user.id} AND read = FALSE
//     `;
//     const unreadCount = Number.parseInt(unreadCountResult[0].count);

//     return NextResponse.json({
//       success: true,
//       notifications,
//       // : notifications.map((n: any) => ({ ...n, link: n.link })),
//       unreadCount,
//     })
//   } catch (error) {
//     console.error("Error fetching notifications:", error)
//     // Add the error message to the response for better debugging
//     const errorMsg = typeof error === "object" && error !== null && "message" in error
//       ? (error as { message: string }).message
//       : String(error);
//     return NextResponse.json({ error: `Failed to fetch notifications: ${errorMsg}` }, { status: 500 })
//   }
// }
// import { type NextRequest, NextResponse } from "next/server"
// import { sql } from "@/lib/db"
// import { getUserFromToken } from "@/lib/auth"

// export async function GET(request: NextRequest) {
//   try {
//     const authHeader = request.headers.get("authorization")
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }
//     const token = authHeader.split(" ")[1]
//     const user = await getUserFromToken(token)
//     if (!user) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 })
//     }

//     const { searchParams } = new URL(request.url)
//     const limit = Number.parseInt(searchParams.get("limit") || "10")

//     // Fixed query with correct parameter ordering
//     const queryText = `
//       SELECT id, title, message, type, read, created_at, related_id, related_type, link
//       FROM notifications 
//       WHERE user_id = $1 
//       AND (read = FALSE OR (read = TRUE AND created_at > NOW() - INTERVAL '7 days'))
//       ORDER BY created_at DESC 
//       LIMIT $2
//     `
    
//     const queryParams = [user.id, limit]

//     const { rows: notifications } = await sql.query(queryText, queryParams)

//     const unreadCountResult = await sql`
//       SELECT COUNT(*) as count 
//       FROM notifications 
//       WHERE user_id = ${user.id} AND read = FALSE
//     `
//     const unreadCount = Number.parseInt(unreadCountResult[0].count)

//     return NextResponse.json({
//       success: true,
//       notifications,
//       unreadCount,
//     })
//   } catch (error) {
//     console.error("Error fetching notifications:", error)
//     const errorMsg = error instanceof Error ? error.message : String(error)
//     return NextResponse.json({ error: `Failed to fetch notifications: ${errorMsg}` }, { status: 500 })
//   }
// }

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

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
