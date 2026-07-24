
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
export const dynamic = "force-dynamic"

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
