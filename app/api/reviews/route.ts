import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { getAuth } from "@/lib/auth"; // Use the new server-side helper

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// POST function to create a new review
export async function POST(request: NextRequest) { // <-- Use NextRequest
  try {
    // Get the authenticated user from the request token (SERVER-SIDE)
    const { user } = await getAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      trainingId,
      rating,
      comment,
    }: { trainingId: string; rating: number; comment: string } =
      await request.json();

    // --- Validation ---
    if (!trainingId || !rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // --- Check if the user is enrolled and has completed the course ---
    const enrollmentCheck = await sql`
      SELECT status FROM enrollments
      WHERE user_id = ${user.id} AND training_id = ${trainingId}
    `;

    if (
      enrollmentCheck.length === 0 ||
      enrollmentCheck[0].status !== "completed"
    ) {
      return NextResponse.json(
        { error: "You must complete the course to leave a review." },
        { status: 403 }
      );
    }

    // --- Check if the user has already reviewed this training ---
    const existingReview = await sql`
      SELECT id FROM reviews WHERE user_id = ${user.id} AND training_id = ${trainingId}
    `;

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: "You have already submitted a review for this training." },
        { status: 409 } // 409 Conflict
      );
    }

    // --- Insert the new review and return it ---
    const result = await sql`
      INSERT INTO reviews (user_id, training_id, rating, comment)
      VALUES (${user.id}, ${trainingId}, ${rating}, ${comment})
      RETURNING id, rating, comment, created_at
    `;
    
    const newReview = result[0];

    return NextResponse.json({ 
        success: true, 
        message: "Review submitted successfully!",
        // Return the created review so the frontend can display it immediately
        review: { 
            ...newReview,
            user_name: user.full_name, // Add user's name from the token
            user_image_url: user.profile_picture, // Add user's image from the token
        }
    });

  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

// GET function to fetch reviews for a specific course
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const trainingId = searchParams.get('trainingId');

        if (!trainingId) {
            return NextResponse.json({ error: "Training ID is required" }, { status: 400 });
        }

        const reviews = await sql`
            SELECT
                r.id, r.rating, r.comment, r.created_at,
                u.full_name as user_name,
                u.profile_picture as user_image_url
            FROM reviews r
            JOIN users u ON u.id = r.user_id
            WHERE r.training_id = ${trainingId}
            ORDER BY r.created_at DESC
        `;

        return NextResponse.json(reviews);

    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}