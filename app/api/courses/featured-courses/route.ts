import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const query = `
      SELECT
        id, name AS title, description, price,
        duration, level, image_url, instructor_name,
        category_id, discount, max_trainees, modules,
        course_code, status, average_rating,
        created_at, updated_at
      FROM trainings
      WHERE created_at IS NOT NULL -- Ensure we only consider courses with a creation date
      ORDER BY
        created_at DESC      -- Sort by creation date, newest first
      LIMIT 3                  -- Get only the top 3 most recent
    `;

    const result = await sql.unsafe(query);

    // Ensure result.rows is used if 'sql' returns an object with a 'rows' property
    const featuredTrainings = Array.isArray(result) ? result : result.rows || [];

    return NextResponse.json({ courses: featuredTrainings });

  } catch (error) {
    console.error("API Error: Failed to fetch featured courses.", error);
    return NextResponse.json(
      { courses: [], message: "An error occurred while fetching courses." },
      { status: 500 }
    );
  }
}
