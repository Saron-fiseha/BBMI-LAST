// import { type NextRequest, NextResponse } from "next/server"
// import { sql } from "@/lib/db"

// export async function GET() {
//   try {
//     const courses = await sql`
//       SELECT 
//         id,
//         title,
//         description,
//         price,
//         duration,
//         level,
//         image_url,
//         instructor_id,
//         created_at
//       FROM courses
//       ORDER BY created_at DESC
//     `
//     return NextResponse.json({ courses })
//   } catch (error) {
//     console.error("Courses fetch error:", error)
//     // Graceful fallback so the UI doesn’t break in preview mode
//     return NextResponse.json({ courses: [] })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { title, description, price, duration, level, image_url, instructor_id } = body

//     const result = await sql`
//       INSERT INTO courses (title, description, price, duration, level, image_url, instructor_id)
//       VALUES (${title}, ${description}, ${price}, ${duration}, ${level}, ${image_url}, ${instructor_id})
//       RETURNING *
//     `

//     return NextResponse.json(result[0])
//   } catch (error) {
//     console.error("Course creation error:", error)
//     return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
//   }
// }
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Fetch all trainings
    const trainings = await sql`
      SELECT
        id,
        name AS title,
        description,
        price,
        duration,
        level,
        image_url,
        instructor_name,
        category_id,
        discount,
        max_trainees,
        modules,
        course_code,
        status,
        created_at,
        updated_at
      FROM trainings
      ORDER BY created_at DESC
    `

    return NextResponse.json({ courses: trainings })
  } catch (error) {
    console.error("Trainings fetch error:", error)
    return NextResponse.json({ courses: [] }, { status: 500 })
  }
}
