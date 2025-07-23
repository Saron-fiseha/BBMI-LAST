import { sql } from '@/lib/db';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const instructor = searchParams.get("instructor")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") ?? "10")
    const offset = Number.parseInt(searchParams.get("offset") ?? "0")

    // Validate limit and offset
    if (isNaN(limit)) throw new Error("Invalid limit parameter")
    if (isNaN(offset)) throw new Error("Invalid offset parameter")

    let text = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.price,
        t.duration_hours,
        t.level,
        t.image_url,
        t.video_url,
        t.category_id,
        t.instructor_id,
        t.discount,
        t.average_rating,
        COALESCE(enr.student_count, 0) AS students
      FROM trainings t
      LEFT JOIN (
        SELECT training_id, COUNT(*) AS student_count
        FROM enrollments
        GROUP BY training_id
      ) enr ON enr.training_id = t.id
      WHERE 1 = 1`
    const params: (string | number)[] = []
    let paramIndex = 1

    if (category) {
      params.push(`%${category}%`)
      text += ` AND t.category_id IN (
                  SELECT id FROM categories WHERE name ILIKE $${paramIndex}
               )`
      paramIndex++
    }
    if (instructor) {
      params.push(`%${instructor}%`)
      text += ` AND t.instructor_id IN (
                  SELECT id FROM users WHERE full_name ILIKE $${paramIndex}
               )`
      paramIndex++
    }
    if (search) {
      params.push(`%${search}%`, `%${search}%`)
      text += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex + 1})`
      paramIndex += 2
    }

    text += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    // Debug logging (remove in production)
    console.log("Final query:", text)
    console.log("Query parameters:", params)

    const rows = await sql(text, params)
    return NextResponse.json(rows, { status: 200 })
  } catch (error) {
    console.error("Courses fetch error:", error)
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
        // Include stack trace in development only
        ...(process.env.NODE_ENV === "development" && { stack: error instanceof Error ? error.stack : undefined })
      }, 
      { status: 500 }
    )
  }
}