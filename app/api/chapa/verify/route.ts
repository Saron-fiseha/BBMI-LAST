// C:\Users\Hp\Documents\BBMI-LMS\app\api\chapa\verify\route.ts
import { NextResponse } from "next/server";
import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(req: Request) {
  console.log("Raw incoming URL in verify route:", req.url);

  const correctedUrlString = req.url.replace(/&amp%3B/g, '&');
  console.log("Corrected URL string for parsing:", correctedUrlString);

  const url = new URL(correctedUrlString);
  const searchParams = url.searchParams;

  const tx_ref = searchParams.get("tx_ref");
  const courseIdParam = searchParams.get("courseId");
  const userIdParam = searchParams.get("userId");

  console.log("Parsed query parameters:", { tx_ref, courseIdParam, userIdParam });

  if (!tx_ref || !courseIdParam || !userIdParam) {
    console.error("Missing required query parameters for verification (after correction):", { tx_ref, courseIdParam, userIdParam });
    // Return an error JSON instead of redirecting
    return NextResponse.json({ success: false, message: "Missing payment reference or user/course ID." }, { status: 400 });
  }

  const courseId = parseInt(courseIdParam, 10);
  const userId = parseInt(userIdParam, 10);

  if (isNaN(courseId) || isNaN(userId)) {
    console.error("Invalid courseId or userId provided (after parsing):", { courseIdParam, userIdParam });
    return NextResponse.json({ success: false, message: "Invalid user or course ID format." }, { status: 400 });
  }

  let client: PoolClient | undefined;

  try {
    const chapaRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await chapaRes.json();
    console.log("Chapa verification response:", data);

    if (data.status === "success" && data.data?.status === "success") {
      const paymentAmount = data.data.amount || 0;

      client = await pool.connect();
      await client.query('BEGIN');

      const accessExpiresAt = new Date();
      accessExpiresAt.setFullYear(accessExpiresAt.getFullYear() + 1);

      const existingEnrollmentQuery = `
        SELECT id, access_expires_at FROM enrollments
        WHERE user_id = $1 AND training_id = $2;
      `;
      const existingEnrollmentResult = await client.query(existingEnrollmentQuery, [userId, courseId]);
      const existingEnrollment = existingEnrollmentResult.rows[0];

      if (existingEnrollment) {
        const updateEnrollmentQuery = `
          UPDATE enrollments
          SET access_expires_at = $1, payment_status = $2, status = $3, payment_amount = $4, updated_at = NOW(),
              last_accessed = NOW()
          WHERE id = $5
          RETURNING *;
        `;
        await client.query(updateEnrollmentQuery, [
          accessExpiresAt.toISOString(),
          'completed',
          'active',
          paymentAmount,
          existingEnrollment.id
        ]);
        console.log(`Updated enrollment for user ${userId} in course ${courseId}.`);
      } else {
        const createEnrollmentQuery = `
          INSERT INTO enrollments (user_id, training_id, enrollment_date, access_expires_at, payment_status, status, payment_amount, progress, progress_percentage)
          VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8)
          RETURNING *;
        `;
        await client.query(createEnrollmentQuery, [
          userId,
          courseId,
          accessExpiresAt.toISOString(),
          'completed',
          'active',
          paymentAmount,
          0,
          0
        ]);
        console.log(`Created new enrollment for user ${userId} in course ${courseId}.`);
      }

      await client.query('COMMIT');
      console.log("Database transaction committed successfully.");

      // <--- IMPORTANT: Return JSON success response instead of redirecting
      return NextResponse.json({ success: true, message: "Payment verified and enrollment processed." });

    } else {
      console.error("Chapa reported payment not successful or data incomplete:", data);
      if (client) await client.query('ROLLBACK');
      // <--- IMPORTANT: Return JSON failure response
      return NextResponse.json({ success: false, message: data.message || "Payment not successful." }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Chapa verify API or database transaction error:", err);
    if (client) await client.query('ROLLBACK');
    // <--- IMPORTANT: Return JSON error response
    return NextResponse.json({ success: false, message: "Internal server error during payment verification." }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}