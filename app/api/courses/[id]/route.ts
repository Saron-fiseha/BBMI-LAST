import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise
    const params = await context.params;
    const id = params.id;

    const result = await sql`
      SELECT
        id,
        name,
        description,
        price,
        duration,
        level,
        image_url,
        instructor_name,
        discount,
        modules,
        max_trainees,
        course_code,
        status,
        category_id,
        created_at,
        updated_at
      FROM trainings
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }

    return NextResponse.json({ training: result[0] });
  } catch (error) {
    console.error("Error fetching training:", error);
    return NextResponse.json(
      { error: "Failed to fetch training" },
      { status: 500 }
    );
  }
}
