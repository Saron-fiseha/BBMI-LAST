import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // UPDATED QUERY:
    // - Now includes 'created_at' in the sorting logic.
    const query = `
      SELECT 
        id, name AS title, description, price, 
        duration, level, image_url, instructor_name, 
        category_id, discount, max_trainees, modules, 
        course_code, status, average_rating, 
        created_at, updated_at 
      FROM trainings 
      ORDER BY 
        average_rating DESC, -- 1. Highest rating first
        max_trainees DESC,   -- 2. Then most trainees
        created_at DESC      -- 3. Finally, the newest ones
      LIMIT 6
    `;

    const result = await sql.unsafe(query);
    
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