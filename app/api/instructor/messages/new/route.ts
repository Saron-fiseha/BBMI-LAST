import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Starting new conversation creation...")

    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("👤 Instructor user:", { id: user.id, name: user.full_name })

    const { recipient_id_or_name, subject, message } = await req.json()
    console.log("📝 Request data:", { recipient_id_or_name, subject, message })

    if (!recipient_id_or_name || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Look for user by ID or name (can be student or instructor)
    console.log("🔍 Looking for user:", recipient_id_or_name)

    const recipients = await sql`
      SELECT id, full_name, email, role FROM users 
      WHERE (id::text = ${recipient_id_or_name} OR full_name ILIKE ${`%${recipient_id_or_name}%`} OR email ILIKE ${`%${recipient_id_or_name}%`})
      AND id != ${user.id}
      LIMIT 1
    `

    if (recipients.length === 0) {
      console.log("❌ User not found:", recipient_id_or_name)
      return NextResponse.json(
        {
          error: "User not found. Please make sure the user is registered in the system.",
        },
        { status: 404 },
      )
    }

    const recipient = recipients[0]
    console.log("🎯 Found recipient:", recipient)

    // Check if conversation already exists
    const existing = await sql`
      SELECT id FROM conversations
      WHERE (user1_id = ${user.id} AND user2_id = ${recipient.id})
         OR (user1_id = ${recipient.id} AND user2_id = ${user.id})
      LIMIT 1
    `

    if (existing.length > 0) {
      console.log("⚠️ Conversation already exists:", existing[0].id)
      return NextResponse.json(
        {
          error: "Conversation already exists with this user",
          conversation_id: existing[0].id,
        },
        { status: 400 },
      )
    }

    // Create conversation
    const now = new Date().toISOString()
    console.log("💬 Creating conversation...")

    const conversations = await sql`
      INSERT INTO conversations (user1_id, user2_id, subject, created_at, updated_at)
      VALUES (${user.id}, ${recipient.id}, ${subject}, ${now}, ${now})
      RETURNING id
    `

    const conversation = conversations[0]
    console.log("✅ Created conversation:", conversation.id)

    // Add first message
    console.log("💌 Adding first message...")
    await sql`
      INSERT INTO messages (conversation_id, sender_id, content, created_at)
      VALUES (${conversation.id}, ${user.id}, ${message}, ${now})
    `

    console.log("✅ Message added successfully")

    const newConversation = {
      id: conversation.id.toString(),
      subject: subject,
      other_user: {
        id: recipient.id.toString(),
        name: recipient.full_name,
        email: recipient.email,
        avatar: "/placeholder.svg?height=40&width=40",
      },
      last_message: message,
      last_message_from_me: true,
      unread_count: 0,
      updated_at: now,
      time_ago: "Just now",
    }

    console.log("🎉 Returning new conversation:", newConversation)

    return NextResponse.json({
      message: "Conversation started successfully",
      conversation_id: conversation.id,
      conversation: newConversation,
    })
  } catch (error) {
    console.error("💥 Error starting new conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
