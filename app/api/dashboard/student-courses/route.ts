import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Fetch enrolled courses with detailed information
    const courses = await sql`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.level,
        c.duration as duration,
        c.image_url as image,
        enr.progress,
        enr.status,
        enr.enrollment_date,
        enr.last_accessed,
        enr.completion_date,
        enr.grade,
        enr.certificate_issued as certificate_eligible,
        
        -- Instructor information
        COALESCE(u.full_name, 'BBMI Instructor') as instructor,
        c.instructor_id,
        
        -- Lesson/Module information
        (SELECT COUNT(*) FROM modules WHERE training_id = c.id) as total_lessons,
        (SELECT COUNT(DISTINCT mp.module_id) 
         FROM module_progress mp 
         JOIN modules m ON mp.module_id = m.id 
         WHERE mp.user_id = ${userId} AND m.training_id = c.id AND mp.completed = true
        ) as completed_lessons,
        
        -- Next lesson information
        (SELECT m.name 
         FROM modules m 
         LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.user_id = ${userId}
         WHERE m.training_id = c.id AND (mp.completed IS NULL OR mp.completed = false)
         ORDER BY m.order_index ASC 
         LIMIT 1
        ) as next_lesson,
        
        (SELECT m.id 
         FROM modules m 
         LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.user_id = ${userId}
         WHERE m.training_id = c.id AND (mp.completed IS NULL OR mp.completed = false)
         ORDER BY m.order_index ASC 
         LIMIT 1
        ) as next_lesson_id
        
      FROM enrollments enr
      JOIN courses c ON enr.training_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE enr.user_id = ${userId}
      ORDER BY enr.last_accessed DESC, enr.enrollment_date DESC
    `

    // Format the response data
    const formattedCourses = courses.map((course) => ({
      ...course,
      status: course.progress >= 100 ? "completed" : course.progress > 0 ? "in-progress" : "active",
      next_lesson: course.next_lesson || (course.progress >= 100 ? "Course Completed" : "Getting Started"),
      total_lessons: course.total_lessons || 0,
      completed_lessons: course.completed_lessons || 0,
    }))

    return NextResponse.json({
      success: true,
      courses: formattedCourses,
      total: formattedCourses.length,
    })
  } catch (error) {
    console.error("Student courses fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        courses: [],
        total: 0,
        error: "Failed to fetch enrolled courses",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId, action } = await request.json()

    if (!userId || !courseId) {
      return NextResponse.json({ error: "User ID and Course ID required" }, { status: 400 })
    }

    if (action === "continue") {
      // Update last accessed time
      await sql`
        UPDATE enrollments 
        SET last_accessed = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND course_id = ${courseId}
      `

      return NextResponse.json({ success: true, message: "Last accessed updated" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Student courses update error:", error)
    return NextResponse.json({ error: "Failed to update course data" }, { status: 500 })
  }
}
