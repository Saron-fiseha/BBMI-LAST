import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("📋 Fetching conversations for instructor:", user.id)

    // Get conversations where the instructor is a participant
    const conversations = await sql`
      SELECT 
        c.id,
        c.subject,
        c.updated_at,
        u.id as other_user_id,
        u.full_name as other_user_name,
        u.avatar_url as other_user_avatar,
        u.email as other_user_email,
        m.content as last_message,
        m.sender_id as last_message_sender_id,
        COALESCE(unread.count, 0) as unread_count,
        CASE 
          WHEN c.updated_at > NOW() - INTERVAL '1 hour' THEN 'Just now'
          WHEN c.updated_at > NOW() - INTERVAL '1 day' THEN EXTRACT(HOUR FROM NOW() - c.updated_at) || ' hours ago'
          ELSE EXTRACT(DAY FROM NOW() - c.updated_at) || ' days ago'
        END as time_ago
      FROM conversations c
      JOIN users u ON (
        CASE 
          WHEN c.user1_id = ${user.id} THEN u.id = c.user2_id
          ELSE u.id = c.user1_id
        END
      )
      LEFT JOIN LATERAL (
        SELECT content, sender_id
        FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) m ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) as count
        FROM messages 
        WHERE conversation_id = c.id 
        AND sender_id != ${user.id}
        AND read_at IS NULL
      ) unread ON true
      WHERE c.user1_id = ${user.id} OR c.user2_id = ${user.id}
      ORDER BY c.updated_at DESC
    `

    const formattedConversations = conversations.map((conv: any) => ({
      id: conv.id.toString(),
      subject: conv.subject,
      other_user: {
        id: conv.other_user_id.toString(),
        name: conv.other_user_name,
        email: conv.other_user_email,
        avatar: conv.other_user_avatar || "/placeholder.svg?height=40&width=40",
      },
      last_message: conv.last_message || "No messages yet",
      last_message_from_me: conv.last_message_sender_id === user.id,
      unread_count: Number.parseInt(conv.unread_count) || 0,
      updated_at: conv.updated_at,
      time_ago: conv.time_ago,
    }))

    console.log("✅ Found conversations from database:", formattedConversations.length)
    return NextResponse.json(formattedConversations)
  } catch (error: any) {
    console.error("❌ Error fetching conversations:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch conversations",
        details: error.message || "Database error occurred",
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversation_id, content } = await req.json()

    if (!conversation_id || !content) {
      return NextResponse.json({ error: "Missing conversation_id or content" }, { status: 400 })
    }

    console.log("📤 Sending message:", { conversation_id, content: content.substring(0, 50) + "..." })

    // Verify instructor has access to this conversation
    const conversationAccess = await sql`
      SELECT id FROM conversations 
      WHERE id = ${conversation_id} 
      AND (user1_id = ${user.id} OR user2_id = ${user.id})
    `

    if (conversationAccess.length === 0) {
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 })
    }

    const now = new Date().toISOString()

    // Add message to database
    await sql`
      INSERT INTO messages (conversation_id, sender_id, content, created_at)
      VALUES (${conversation_id}, ${user.id}, ${content}, ${now})
    `

    // Update conversation timestamp
    await sql`
      UPDATE conversations 
      SET updated_at = ${now}
      WHERE id = ${conversation_id}
    `

    console.log("✅ Message sent successfully")
    return NextResponse.json({ message: "Message sent successfully" })
  } catch (error: any) {
    console.error("❌ Error sending message:", error)
    return NextResponse.json(
      {
        error: "Failed to send message",
        details: error.message || "Database error occurred",
      },
      { status: 500 },
    )
  }
}
