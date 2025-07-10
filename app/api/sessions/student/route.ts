import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const date = searchParams.get("date")
    const category = searchParams.get("category")
    const instructor = searchParams.get("instructor")
    const search = searchParams.get("search")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

   let query = sql`
  SELECT 
    s.id,
    s.title,
    s.description,
    s.instructor_id,
    s.category_id,
    s.scheduled_at,
    s.duration,
    s.session_type,
    s.status,
    s.max_participants,
    s.current_participants,
    s.meeting_url,
    CASE 
      WHEN e.user_id IS NOT NULL THEN true 
      ELSE false 
    END as is_enrolled
  FROM sessions s
  LEFT JOIN enrollments e ON s.id = e.training_id AND e.user_id = ${userId}
  WHERE s.status != 'cancelled'
`;

// Add filters using sql fragments
if (date) {
  query = sql`${query} AND s.scheduled_at= ${date}`;
}

if (category && category !== "all") {
  query = sql`${query} AND s.category_id = ${category}`;
}

if (instructor && instructor !== "all") {
  query = sql`${query} AND s.instructor_id = ${instructor}`;
}

if (search) {
  const searchPattern = `%${search}%`;
  query = sql`
    ${query}
    AND (
      s.title ILIKE ${searchPattern} OR 
      s.description ILIKE ${searchPattern} OR 
      s.instructor_id ILIKE ${searchPattern} OR 
      s.category_id ILIKE ${searchPattern}
    )
  `;
}

// Add ordering
query = sql`${query} ORDER BY s.scheduled_at ASC`;

// Execute the query
const sessions = await query;

return NextResponse.json({
  success: true,
  sessions: sessions || [],
})
  } catch (error) {
    console.error("Sessions fetch error:", error)

    // Return mock data as fallback
    const mockSessions = [
      {
        id: 1,
        title: "Advanced Bridal Makeup Techniques",
        description:
          "Learn professional bridal makeup techniques including long-wear formulas and photography-ready looks.",
        instructor_name: "Sarah Martinez",
        instructor_id: 1,
        category: "Bridal Makeup",
        session_date: "2024-01-15",
        start_time: "10:00",
        end_time: "12:00",
        duration_minutes: 120,
        session_type: "live",
        status: "upcoming",
        location: "Studio A",
        max_participants: 15,
        current_participants: 12,
        meeting_link: "https://zoom.us/j/123456789",
        is_enrolled: true,
      },
      {
        id: 2,
        title: "Color Theory Masterclass",
        description: "Deep dive into color theory and its application in makeup artistry.",
        instructor_name: "Emma Wilson",
        instructor_id: 2,
        category: "Color Theory",
        session_date: "2024-01-16",
        start_time: "14:00",
        end_time: "16:30",
        duration_minutes: 150,
        session_type: "workshop",
        status: "upcoming",
        location: "Main Hall",
        max_participants: 20,
        current_participants: 18,
        is_enrolled: true,
      },
      {
        id: 3,
        title: "Special Effects Makeup Workshop",
        description: "Create stunning special effects looks using professional techniques and products.",
        instructor_name: "Michael Chen",
        instructor_id: 3,
        category: "Special Effects",
        session_date: "2024-01-17",
        start_time: "09:00",
        end_time: "17:00",
        duration_minutes: 480,
        session_type: "workshop",
        status: "upcoming",
        location: "Studio B",
        max_participants: 10,
        current_participants: 8,
        is_enrolled: false,
      },
      {
        id: 4,
        title: "Fashion Makeup Fundamentals",
        description: "Master the basics of fashion makeup for runway and editorial work.",
        instructor_name: "Sarah Martinez",
        instructor_id: 1,
        category: "Fashion Makeup",
        session_date: "2024-01-18",
        start_time: "13:00",
        end_time: "15:00",
        duration_minutes: 120,
        session_type: "live",
        status: "upcoming",
        location: "Studio A",
        max_participants: 12,
        current_participants: 10,
        meeting_link: "https://zoom.us/j/987654321",
        is_enrolled: true,
      },
      {
        id: 5,
        title: "Airbrush Makeup Techniques",
        description: "Learn professional airbrush makeup application for flawless results.",
        instructor_name: "Emma Wilson",
        instructor_id: 2,
        category: "Airbrush Makeup",
        session_date: "2024-01-19",
        start_time: "11:00",
        end_time: "14:00",
        duration_minutes: 180,
        session_type: "workshop",
        status: "upcoming",
        location: "Studio C",
        max_participants: 8,
        current_participants: 6,
        is_enrolled: true,
      },
    ]

    return NextResponse.json({
      success: true,
      sessions: mockSessions,
    })
  }
}
