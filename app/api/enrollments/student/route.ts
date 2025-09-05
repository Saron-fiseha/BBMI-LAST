// import { type NextRequest, NextResponse } from "next/server"
// import { neon } from "@neondatabase/serverless"

// const sql = neon(process.env.DATABASE_URL!)

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const userId = searchParams.get("userId")

//     if (!userId) {
//       return NextResponse.json({ error: "User ID required" }, { status: 400 })
//     }

//    const enrollments = await sql`
//   SELECT 
//     e.*,
//     t.name,
//     t.description,
//     t.image_url,
//     t.duration,
//     t.modules,
//     t.instructor_name,
//     (
//       SELECT name FROM modules 
//       WHERE training_id = t.id AND order_index > 
//       (SELECT COALESCE(MAX(m2.order_index), 0) 
//        FROM modules m2 
//        JOIN module_progress mp ON m2.id = mp.module_id 
//        WHERE mp.user_id = e.user_id 
//        AND mp.course_id = t.id 
//        AND mp.completed = true)
//       ORDER BY order_index 
//       LIMIT 1
//     ) as next_lesson
//   FROM enrollments e
//   JOIN trainings t ON e.training_id = t.id
//   LEFT JOIN users u ON t.instructor_id = u.id
//   WHERE e.user_id = ${userId}
//   AND e.access_expires_at > NOW()
//   ORDER BY e.last_accessed DESC
// `;


//     return NextResponse.json({ enrollments })
//   } catch (error) {
//     console.error("Student enrollments error:", error)
//     return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
//   }
// }
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

interface Enrollment {
  id: number;
  user_id: number;
  training_id: number;
  status: string;
  enrolled_at: string; // or Date if you parse it
  access_expires_at: string; // or Date if you parse it
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userIdRaw = url.searchParams.get("userId");
    const trainingIdRaw = url.searchParams.get("trainingId");

    // Validate & parse IDs
    const userId = userIdRaw ? parseInt(userIdRaw, 10) : null;
    const trainingId = trainingIdRaw ? parseInt(trainingIdRaw, 10) : null;

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing userId" },
        { status: 400 }
      );
    }

    if (!trainingId || isNaN(trainingId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing trainingId" },
        { status: 400 }
      );
    }

    // Fetch enrollments
    const enrollments = await sql`
      SELECT e.*,
             t.name AS training_name
      FROM enrollments e
      JOIN trainings t ON t.id = e.training_id
      WHERE e.user_id = ${userId} AND e.training_id = ${trainingId};
    `;

    return NextResponse.json({
  success: true,
  enrollments: enrollments.map((e: Enrollment) => ({
    id: e.id,
    training_id: e.training_id,
    user_id: e.user_id,
    status: e.status,
    enrolled_at: e.enrolled_at,
    access_expires_at: e.access_expires_at,
  })),
});

  } catch (error) {
    console.error("Student enrollments error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
