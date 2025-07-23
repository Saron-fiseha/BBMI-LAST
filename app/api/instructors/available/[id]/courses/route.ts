import { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Query the trainings table for this instructor
    const result = await sql`
      SELECT
        id,
        name,
        description,
        category_id,
        level,
        duration,
        
        price,
        discount,
        status,
        image_url,
        created_at,
        updated_at
      FROM trainings
      WHERE instructor_id = ${id}
    `;

    // students,
    //     rating,

    return Response.json({
      success: true,
      trainings: result,
    });
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return Response.json(
      { success: false, message: "Error fetching trainings." },
      { status: 500 }
    );
  }
}
