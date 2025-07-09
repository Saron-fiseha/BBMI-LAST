import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Students API route called")

    // Get authorization token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid authorization header")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)

    if (!user) {
      console.log("❌ Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (user.role !== "instructor") {
      console.log("❌ User is not an instructor:", user.role)
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    console.log("✅ Instructor authenticated:", user.email)

    try {
      // Query to get students enrolled in instructor's courses
      // const students = await sql`
      //   SELECT DISTINCT
      //     u.id,
      //     u.full_name as name,
      //     u.email,
      //     u.profile_picture as avatar,
      //     COUNT(DISTINCT e.training_id) as enrolled_courses,
      //     COALESCE(AVG(e.progress), 0) as total_progress,
      //     'active' as status,
      //     MIN(e.enrolled_at) as enrollment_date,
      //     CASE 
      //       WHEN MAX(e.enrolled_at) > NOW() - INTERVAL '7 days' THEN 'This week'
      //       WHEN MAX(e.enrolled_at) > NOW() - INTERVAL '30 days' THEN 'This month'
      //       ELSE 'Earlier'
      //     END as last_active,
      //     ARRAY_AGG(
      //       JSON_BUILD_OBJECT(
      //         'id', t.id,
      //         'title', t.name,
      //         'progress', COALESCE(e.progress, 0),
      //         'status', e.status,
      //         'enrolled_at', e.enrolled_at
      //       )
      //     ) as trainings
      //   FROM users u
      //   JOIN enrollments e ON u.id = e.user_id
      //   JOIN trainings t ON e.training_id = t.id
      //   WHERE t.instructor_id = ${user.id}
      //     AND u.role = 'student'
      //   GROUP BY u.id, u.full_name, u.email, u.profile_picture
      //   ORDER BY MIN(e.enrolled_at) DESC
      // `
      const students = await sql`
  SELECT
    u.id,
    u.full_name as name,
    u.email,
    u.profile_picture as avatar,
    COUNT(DISTINCT e.training_id) as enrolled_courses,
    COALESCE(AVG(e.progress), 0) as total_progress,
    'active' as status,
    MIN(e.enrolled_at) as enrollment_date,
    CASE 
      WHEN MAX(e.enrolled_at) > NOW() - INTERVAL '7 days' THEN 'This week'
      WHEN MAX(e.enrolled_at) > NOW() - INTERVAL '30 days' THEN 'This month'
      ELSE 'Earlier'
    END as last_active,
    ARRAY_AGG(
      JSON_BUILD_OBJECT(
        'id', t.id,
        'title', t.name,
        'progress', COALESCE(e.progress, 0),
        'status', e.status,
        'enrolled_at', e.enrolled_at
      )
    ) as trainings
  FROM users u
  JOIN enrollments e ON u.id = e.user_id
  JOIN trainings t ON e.training_id = t.id
  WHERE t.instructor_id = ${user.id}
    AND u.role = 'student'
  GROUP BY u.id, u.full_name, u.email, u.profile_picture
  ORDER BY MIN(e.enrolled_at) DESC
`


      console.log(`✅ Found ${students.length} students`)
      return NextResponse.json(students)
    } catch (dbError) {
      console.log("⚠️ Database query failed, returning empty array:", dbError)
      // Return empty array if database query fails
      return NextResponse.json([])
    }
  } catch (error) {
    console.error("💥 Students API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

