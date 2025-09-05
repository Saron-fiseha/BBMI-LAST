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


// import { type NextRequest, NextResponse } from "next/server"
// import { sql } from "@/lib/db"

// export async function GET(request: NextRequest) {
//   try {
//     // Fetch all trainings
//     const trainings = await sql`
//       SELECT
//         id,
//         name AS title,
//         description,
//         price,
//         duration,
//         level,
//         image_url,
//         instructor_name,
//         category_id,
//         discount,
//         max_trainees,
//         modules,
//         course_code,
//         status,
//         created_at,
//         updated_at
//       FROM trainings
//       ORDER BY created_at DESC
//     `

//     return NextResponse.json({ courses: trainings })
//   } catch (error) {
//     console.error("Trainings fetch error:", error)
//     return NextResponse.json({ courses: [] }, { status: 500 })
//   }
// }

// import { type NextRequest, NextResponse } from "next/server";
// import { sql } from "@/lib/db";

// export async function GET(request: NextRequest) {
//   try {
//     const trainings = await sql`
//       SELECT
//         t.id,
//         t.name AS title,
//         t.description,
//         t.price,
//         t.duration,
//         t.level,
//         t.image_url,
//         i.full_name AS instructor_name, -- --- THE FIX: Get the name from the instructors table ---
//         t.category_id,
//         t.discount,
//         t.max_trainees,
//         t.modules,
//         t.course_code,
//         t.status,
//         t.created_at,
//         t.updated_at
//       FROM trainings t
//       LEFT JOIN instructors i ON t.instructor_id = i.id -- --- THE FIX: Join the tables ---
//       ORDER BY t.created_at DESC
//     `;

//     return NextResponse.json({ courses: trainings });
//   } catch (error) {
//     console.error("Trainings fetch error:", error);
//     return NextResponse.json({ courses: [] }, { status: 500 });
//   }
// }

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