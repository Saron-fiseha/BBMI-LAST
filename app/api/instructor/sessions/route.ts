import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const instructorId = user.id

    try {
      // Get instructor's sessions with course information
      const sessions = await sql`
        SELECT 
          s.*,
          c.title as course_title,
          COALESCE(booking_stats.student_count, 0) as students
        FROM sessions s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN (
          SELECT 
            session_id, 
            COUNT(*) as student_count
          FROM session_bookings
          WHERE status = 'confirmed'
          GROUP BY session_id
        ) booking_stats ON s.id = booking_stats.session_id
        WHERE s.instructor_id = ${instructorId}
          AND s.scheduled_at > NOW()
          AND s.status IN ('scheduled', 'confirmed')
        ORDER BY s.scheduled_at ASC
      `

      // Format the response
      const formattedSessions = sessions.map((session: any) => {
        const scheduledDate = new Date(session.scheduled_at)
        return {
          id: session.id.toString(),
          title: session.title || `Live Session: ${session.course_title || "General Session"}`,
          description: session.description,
          course_id: session.course_id?.toString(),
          course_title: session.course_title,
          scheduled_at: session.scheduled_at,
          date: scheduledDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: scheduledDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          students: Number(session.students || 0),
          status: session.status,
          duration: Number(session.duration || 60),
          meeting_url: session.meeting_url,
        }
      })

      return NextResponse.json(formattedSessions)
    } catch (dbError: any) {
      console.error("Database error:", dbError)

      // If tables don't exist, return empty array
      if (
        dbError.message?.includes("doesn't exist") ||
        dbError.message?.includes("relation") ||
        dbError.code === "ER_NO_SUCH_TABLE"
      ) {
        console.log("Sessions table doesn't exist, returning empty array")
        return NextResponse.json([])
      }

      throw dbError
    }
  } catch (error) {
    console.error("Error fetching instructor sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, course_id, scheduled_at, duration, meeting_url } = body

    if (!title || !scheduled_at) {
      return NextResponse.json({ error: "Title and scheduled time are required" }, { status: 400 })
    }

    try {
      // Validate course belongs to instructor if course_id is provided
      if (course_id && course_id !== "none") {
        const courseCheck = await sql`
          SELECT id FROM courses 
          WHERE id = ${course_id} AND instructor_id = ${user.id}
        `

        if (courseCheck.length === 0) {
          return NextResponse.json({ error: "Course not found or not owned by instructor" }, { status: 400 })
        }
      }

      // Try to insert the session
      const result = await sql`
        INSERT INTO sessions (
          title, description, course_id, instructor_id, scheduled_at, 
          duration, meeting_url, status, created_at, updated_at
        ) VALUES (
          ${title}, 
          ${description || null}, 
          ${course_id === "none" ? null : course_id}, 
          ${user.id}, 
          ${scheduled_at}, 
          ${duration || 60}, 
          ${meeting_url || null}, 
          'scheduled', 
          NOW(), 
          NOW()
        )
      `

      return NextResponse.json(
        {
          id: result.insertId || Date.now().toString(),
          message: "Session scheduled successfully",
        },
        { status: 201 },
      )
    } catch (dbError: any) {
      console.error("Database error:", dbError)

      // Check if it's a table doesn't exist error
      if (
        dbError.message?.includes("doesn't exist") ||
        dbError.message?.includes("relation") ||
        dbError.code === "ER_NO_SUCH_TABLE"
      ) {
        // Return success with mock data for development
        console.log("Sessions table doesn't exist, returning mock success")
        return NextResponse.json(
          {
            id: Date.now().toString(),
            message: "Session scheduled successfully (development mode)",
            note: "Database tables not yet created. Run the setup script to enable full functionality.",
          },
          { status: 201 },
        )
      }

      // For other database errors, throw to be caught by outer catch
      throw dbError
    }
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" && typeof error === "object" && error !== null && "message" in error ? (error as { message?: string }).message : undefined,
      },
      { status: 500 },
    )
  }
}
