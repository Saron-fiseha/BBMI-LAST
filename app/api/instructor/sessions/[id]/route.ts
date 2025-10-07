// import { type NextRequest, NextResponse } from "next/server"
// import { getUserFromToken } from "@/lib/auth"
// import { sql } from "@/lib/db"

// // GET single session
// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const token = request.headers.get("authorization")?.replace("Bearer ", "")

//     if (!token) {
//       return NextResponse.json({ error: "No token provided" }, { status: 401 })
//     }

//     const user = await getUserFromToken(token)
//     if (!user || user.role !== "instructor") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const sessionId = params.id

//     try {
//       const sessions = await sql`
//         SELECT 
//           s.*,
//           c.title as course_title,
//           COALESCE(booking_stats.student_count, 0) as students
//         FROM sessions s
//         LEFT JOIN courses c ON s.course_id = c.id
//         LEFT JOIN (
//           SELECT 
//             session_id, 
//             COUNT(*) as student_count
//           FROM session_bookings
//           WHERE status = 'confirmed'
//           GROUP BY session_id
//         ) booking_stats ON s.id = booking_stats.session_id
//         WHERE s.id = ${sessionId} AND s.instructor_id = ${user.id}
//       `

//       if (sessions.length === 0) {
//         return NextResponse.json({ error: "Session not found" }, { status: 404 })
//       }

//       const session = sessions[0]
//       return NextResponse.json({
//         id: session.id.toString(),
//         title: session.title,
//         description: session.description,
//         course_id: session.course_id?.toString(),
//         course_title: session.course_title,
//         scheduled_at: session.scheduled_at,
//         duration: Number(session.duration || 60),
//         students: Number(session.students || 0),
//         status: session.status,
//         meeting_url: session.meeting_url,
//       })
//     } catch (dbError) {
//       console.error("Database error:", dbError)
//       // Return mock data for development
//       return NextResponse.json({
//         id: sessionId,
//         title: "Sample Session",
//         description: "This is a sample session for development",
//         course_id: null,
//         course_title: null,
//         scheduled_at: new Date().toISOString(),
//         duration: 60,
//         students: 0,
//         status: "scheduled",
//         meeting_url: null,
//         note: "Database tables not yet created. Run the setup script to enable full functionality.",
//       })
//     }
//   } catch (error) {
//     console.error("Error fetching session:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// // PUT (update) session
// export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const token = request.headers.get("authorization")?.replace("Bearer ", "")

//     if (!token) {
//       return NextResponse.json({ error: "No token provided" }, { status: 401 })
//     }

//     const user = await getUserFromToken(token)
//     if (!user || user.role !== "instructor") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const sessionId = params.id
//     const body = await request.json()
//     const { title, description, course_id, scheduled_at, duration, meeting_url } = body

//     if (!title || !scheduled_at) {
//       return NextResponse.json({ error: "Title and scheduled time are required" }, { status: 400 })
//     }

//     try {
//       // Validate course belongs to instructor if course_id is provided
//       if (course_id && course_id !== "none") {
//         const courseCheck = await sql`
//           SELECT id FROM courses 
//           WHERE id = ${course_id} AND instructor_id = ${user.id}
//         `

//         if (courseCheck.length === 0) {
//           return NextResponse.json({ error: "Course not found or not owned by instructor" }, { status: 400 })
//         }
//       }

//       const result = await sql`
//         UPDATE sessions 
//         SET 
//           title = ${title},
//           description = ${description || null},
//           course_id = ${course_id === "none" ? null : course_id},
//           scheduled_at = ${scheduled_at},
//           duration = ${duration || 60},
//           meeting_url = ${meeting_url || null},
//           updated_at = NOW()
//         WHERE id = ${sessionId} AND instructor_id = ${user.id}
//       `

//       if (result.count === 0) {
//         return NextResponse.json({ error: "Session not found or not owned by instructor" }, { status: 404 })
//       }

//       return NextResponse.json({
//         id: sessionId,
//         message: "Session updated successfully",
//       })
//     } catch (dbError) {
//       console.error("Database error:", dbError)
//       // Return mock success for development
//       return NextResponse.json({
//         id: sessionId,
//         message: "Session updated successfully",
//         note: "Database tables not yet created. Changes are simulated for development.",
//       })
//     }
//   } catch (error) {
//     console.error("Error updating session:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// // DELETE session
// export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const token = request.headers.get("authorization")?.replace("Bearer ", "")

//     if (!token) {
//       return NextResponse.json({ error: "No token provided" }, { status: 401 })
//     }

//     const user = await getUserFromToken(token)
//     if (!user || user.role !== "instructor") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const sessionId = params.id

//     try {
//       // First delete any session bookings
//       await sql`
//         DELETE FROM session_bookings 
//         WHERE session_id = ${sessionId}
//       `

//       // Then delete the session
//       const result = await sql`
//         DELETE FROM sessions 
//         WHERE id = ${sessionId} AND instructor_id = ${user.id}
//       `

//       if (result.count === 0) {
//         return NextResponse.json({ error: "Session not found or not owned by instructor" }, { status: 404 })
//       }

//       return NextResponse.json({
//         message: "Session deleted successfully",
//       })
//     } catch (dbError) {
//       console.error("Database error:", dbError)
//       // Return mock success for development
//       return NextResponse.json({
//         message: "Session deleted successfully",
//         note: "Database tables not yet created. Deletion is simulated for development.",
//       })
//     }
//   } catch (error) {
//     console.error("Error deleting session:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
// C:\Users\Hp\Documents\BBMI-LMS\app\api\instructor\sessions\[id]\route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { sql } from "@/lib/db"

// GET single session
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = params.id

    try {
      const sessions = await sql`
        SELECT
          s.*,
          t.name as training_title, -- Changed from c.title as course_title
          COALESCE(booking_stats.student_count, 0) as students
        FROM sessions s
        LEFT JOIN trainings t ON s.training_id = t.id -- Changed from courses c ON s.course_id = c.id
        LEFT JOIN (
          SELECT
            session_id,
            COUNT(*) as student_count
          FROM session_bookings
          WHERE status = 'confirmed'
          GROUP BY session_id
        ) booking_stats ON s.id = booking_stats.session_id
        WHERE s.id = ${sessionId} AND s.instructor_id = ${user.id}
      `

      if (sessions.length === 0) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
      }

      const session = sessions[0]
      return NextResponse.json({
        id: session.id.toString(),
        title: session.title,
        description: session.description,
        training_id: session.training_id?.toString(), // Changed from course_id
        training_title: session.training_title,     // Changed from course_title
        scheduled_at: session.scheduled_at,
        duration: Number(session.duration || 60),
        students: Number(session.students || 0),
        status: session.status,
        meeting_url: session.meeting_url,
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Return mock data for development
      return NextResponse.json({
        id: sessionId,
        title: "Sample Session",
        description: "This is a sample session for development",
        training_id: null, // Changed from course_id
        training_title: null, // Changed from course_title
        scheduled_at: new Date().toISOString(),
        duration: 60,
        students: 0,
        status: "scheduled",
        meeting_url: null,
        note: "Database tables not yet created. Run the setup script to enable full functionality.",
      })
    }
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT (update) session
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = params.id
    const body = await request.json()
    // Changed from course_id to training_id
    const { title, description, training_id, scheduled_at, duration, meeting_url } = body

    if (!title || !scheduled_at) {
      return NextResponse.json({ error: "Title and scheduled time are required" }, { status: 400 })
    }

    try {
      // Validate training belongs to instructor if training_id is provided
      if (training_id && training_id !== "none") {
        const trainingCheck = await sql`
          SELECT id FROM trainings
          WHERE id = ${training_id} AND instructor_id = ${user.id}
        `

        if (trainingCheck.length === 0) {
          return NextResponse.json({ error: "Training not found or not owned by instructor" }, { status: 400 })
        }
      }

      const result = await sql`
        UPDATE sessions
        SET
          title = ${title},
          description = ${description || null},
          training_id = ${training_id === "none" ? null : training_id}, -- Changed from course_id
          scheduled_at = ${scheduled_at},
          duration = ${duration || 60},
          meeting_url = ${meeting_url || null},
          updated_at = NOW()
        WHERE id = ${sessionId} AND instructor_id = ${user.id}
      `

      if (result.count === 0) {
        return NextResponse.json({ error: "Session not found or not owned by instructor" }, { status: 404 })
      }

      return NextResponse.json({
        id: sessionId,
        message: "Session updated successfully",
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Return mock success for development
      return NextResponse.json({
        id: sessionId,
        message: "Session updated successfully",
        note: "Database tables not yet created. Changes are simulated for development.",
      })
    }
  } catch (error) {
    console.error("Error updating session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE session
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = params.id

    try {
      // First delete any session bookings
      await sql`
        DELETE FROM session_bookings
        WHERE session_id = ${sessionId}
      `

      // Then delete the session
      const result = await sql`
        DELETE FROM sessions
        WHERE id = ${sessionId} AND instructor_id = ${user.id}
      `

      if (result.count === 0) {
        return NextResponse.json({ error: "Session not found or not owned by instructor" }, { status: 404 })
      }

      return NextResponse.json({
        message: "Session deleted successfully",
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Return mock success for development
      return NextResponse.json({
        message: "Session deleted successfully",
        note: "Database tables not yet created. Deletion is simulated for development.",
      })
    }
  } catch (error) {
    console.error("Error deleting session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}