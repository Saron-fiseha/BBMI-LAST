import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const conversationId = params.id
    const studentId = user.id

    console.log("📨 Fetching messages for conversation:", conversationId, "student:", studentId)

    // Verify student has access to this conversation
    const conversationAccess = await sql`
      SELECT id FROM conversations 
      WHERE id = ${conversationId} 
      AND (user1_id = ${studentId} OR user2_id = ${studentId})
    `

    if (conversationAccess.length === 0) {
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 })
    }

    // Get all messages for this conversation
    const messages = await sql`
      SELECT 
        m.id,
        m.sender_id,
        m.content,
        m.created_at,
        m.read_at,
        u.full_name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${conversationId}
      ORDER BY m.created_at ASC
    `

    // Format messages with time ago
    const formattedMessages = messages.map((message: any) => ({
      id: message.id.toString(),
      sender_id: message.sender_id.toString(),
      sender_name: message.sender_name,
      content: message.content,
      created_at: message.created_at,
      read_at: message.read_at,
      is_read: !!message.read_at,
      time_ago: formatTimeAgo(new Date(message.created_at)),
      is_from_me: message.sender_id === studentId,
    }))

    // Mark messages as read by student (messages sent TO the student)
    await sql`
      UPDATE messages 
      SET read_at = NOW() 
      WHERE conversation_id = ${conversationId} 
      AND sender_id != ${studentId} 
      AND read_at IS NULL
    `

    console.log("✅ Returning messages from database:", formattedMessages.length)
    return NextResponse.json(formattedMessages)
  } catch (error: any) {
    console.error("❌ Error fetching messages:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch messages",
        details: error.message || "Database error occurred",
      },
      { status: 500 },
    )
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return date.toLocaleDateString()
}
