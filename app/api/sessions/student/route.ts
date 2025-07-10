import { type NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const category = searchParams.get("category");
    const instructor = searchParams.get("instructor");
    const search = searchParams.get("search");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    let query = sql`
      SELECT
        s.id,
        s.title,
        s.description,
        i.name AS instructor_name,
        s.instructor_id,
        c.name AS category,
        s.scheduled_at,
        s.duration,
        s.session_type,
        s.status,
        s.max_participants,
        s.current_participants,
        s.meeting_url,
        CASE WHEN e.user_id IS NOT NULL THEN true ELSE false END AS is_enrolled
      FROM sessions s
      LEFT JOIN enrollments e ON s.id = e.training_id AND e.user_id = ${userId}
      LEFT JOIN instructors i ON s.instructor_id = i.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.status = 'scheduled' AND s.scheduled_at >= CURRENT_DATE
    `;

    if (date) {
      // Filter by date (just the date part of scheduled_at)
      query = sql`${query} AND DATE(s.scheduled_at) = ${date}`;
    }

    if (category && category !== "all") {
      query = sql`${query} AND c.name = ${category}`;
    }

    if (instructor && instructor !== "all") {
      query = sql`${query} AND i.name = ${instructor}`;
    }

    if (search) {
      const pattern = `%${search}%`;
      query = sql`
        ${query}
        AND (
          s.title ILIKE ${pattern} OR
          s.description ILIKE ${pattern} OR
          i.name ILIKE ${pattern} OR
          c.name ILIKE ${pattern}
        )
      `;
    }

    query = sql`${query} ORDER BY s.scheduled_at ASC`;

    const sessions = await query;

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
    });
  } catch (error) {
    console.error("Sessions fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}
