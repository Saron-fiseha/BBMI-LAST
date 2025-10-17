import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    // This query now correctly uses the 'trainings' table (aliased as 't')
    // and joins with 'instructors' to fetch the name.
    const trainingsResult = await sql`
      SELECT
        t.id,
        t.name AS title, -- Alias 'name' to 'title' to match your frontend 'Course' interface
        t.description,
        t.price,
        t.duration,
        t.level,
        t.image_url,
        t.category_id,
        c.name AS category_name,
        t.discount,
        t.max_trainees,
        t.modules,
        t.course_code,
        t.status,
        t.created_at,
        t.updated_at,
        -- Fetch the instructor's name from the instructors table ---
        i.full_name AS instructor_name
      FROM trainings t -- Using the correct table name here
      LEFT JOIN instructors i ON t.instructor_id = i.user_id
      LEFT JOIN categories c ON t.category_id = c.id
      
      ORDER BY t.created_at DESC
    `;

    // The frontend expects the data under a key named 'courses', so we will keep that name in the JSON response.
    return NextResponse.json({ courses: trainingsResult });

  } catch (error) {
    console.error("Error fetching trainings:", error);
    return NextResponse.json(
      { error: "Failed to fetch trainings" },
      { status: 500 }
    );
  }
}