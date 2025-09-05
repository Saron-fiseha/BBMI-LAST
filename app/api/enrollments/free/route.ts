// import { type NextRequest, NextResponse } from "next/server"
// import { sql } from "@/lib/db"
// import { getUserFromToken } from "@/lib/auth"

// import { type NextRequest, NextResponse } from "next/server"
// import { sql } from "@/lib/db"
// import { getUserFromToken } from "@/lib/auth"

// export async function POST(request: NextRequest) {
//   try {
//     // Get user from token
//     const authHeader = request.headers.get("authorization")
//     const token = authHeader?.replace(/^Bearer\s+/i, "") || ""
//     const user = await getUserFromToken(token)
//     if (!user) {
//       return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
//     }

//     const { trainingId } = await request.json()

//     if (!trainingId) {
//       return NextResponse.json({ success: false, message: "Training ID is required" }, { status: 400 })
//     }

//     // Get training details and verify it's free
//     const training = await sql`
//       SELECT id, name, price, instructor_name
//       FROM trainings 
//       WHERE id = ${trainingId}
//     `

//     if (training.length === 0) {
//       return NextResponse.json({ success: false, message: "Training not found" }, { status: 404 })
//     }

//     const trainingData = training[0]

//     // Verify the training is free
//     if (trainingData.price > 0) {
//       return NextResponse.json({ success: false, message: "This training requires payment" }, { status: 400 })
//     }

//     // Check if user is already enrolled
//     const existingEnrollment = await sql`
//       SELECT id FROM enrollments 
//       WHERE user_id = ${user.id} AND training_id = ${trainingId}
//     `

//     if (existingEnrollment.length > 0) {
//       return NextResponse.json(
//         { success: false, message: "You are already enrolled in this training" },
//         { status: 400 },
//       )
//     }

//     // Create enrollment record for free course
//     // const enrollmentResult = await sql`
//     //   INSERT INTO enrollments (
//     //     user_id,
//     //     training_id,
//     //     status,
//     //     progress,
//     //     enrolled_at
//     //   ) VALUES (
//     //     ${user.id},
//     //     ${trainingId},
//     //     'active',
//     //     0.00,
//     //     CURRENT_TIMESTAMP,
//     //     CURRENT_TIMESTAMP + INTERVAL '5 minutes' -- ✅ SET EXPIRATION TO 1 YEAR FROM NOW
//     //   )
//     //   RETURNING id, user_id, training_id, status, enrolled_at
//     // `
// const enrollmentResult = await sql`
//   INSERT INTO enrollments (
//     user_id,
//     training_id,
//     status,
//     progress,
//     enrolled_at,
//     access_expires_at
//   ) VALUES (
//     ${user.id},
//     ${trainingId},
//     'active',
//     0.00,
//     CURRENT_TIMESTAMP,
//     CURRENT_TIMESTAMP + INTERVAL '2 minutes'
//   )
//   RETURNING id, user_id, training_id, status, enrolled_at, access_expires_at
// `

//     const enrollment = enrollmentResult[0]

//     // Create a payment record for tracking (even for free courses)
//     await sql`
//       INSERT INTO payments (
//         user_id,
//         training_id,
//         amount,
//         currency,
//         payment_method,
//         status,
//         payment_data
//       ) VALUES (
//         ${user.id},
//         ${trainingId},
//         0.00,
//         'ETB',
//         'free',
//         'completed',
//         ${JSON.stringify({
//           type: "free_enrollment",
//           trainingName: trainingData.name,
//           enrollmentId: enrollment.id,
//         })}
//       )
//     `

//     return NextResponse.json({
//       success: true,
//       enrollment: {
//         id: enrollment.id,
//         trainingId: enrollment.training_id,
//         status: enrollment.status,
//         enrolledAt: enrollment.enrolled_at,
//       },
//       message: "Successfully enrolled in free training",
//     })
//   } catch (error) {
//     console.error("Free enrollment error:", error)
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Internal server error",
//       },
//       { status: 500 },
//     )
//   }
// }

// // import { type NextRequest, NextResponse } from "next/server";
// // import { sql } from "@/lib/db";
// // import { getUserFromToken } from "@/lib/auth";

// // export async function POST(request: NextRequest) {
// //   try {
// //     const authHeader = request.headers.get("authorization");
// //     const token = authHeader?.replace(/^Bearer\s+/i, "") || "";
// //     const user = await getUserFromToken(token);
// //     if (!user) {
// //       return NextResponse.json(
// //         { success: false, message: "Authentication required" },
// //         { status: 401 }
// //       );
// //     }

// //     const { trainingId } = await request.json();
// //     if (!trainingId) {
// //       return NextResponse.json(
// //         { success: false, message: "Training ID is required" },
// //         { status: 400 }
// //       );
// //     }

// //     const training = await sql`
// //       SELECT id, name, price, instructor_name
// //       FROM trainings 
// //       WHERE id = ${trainingId}
// //     `;
// //     if (training.length === 0) {
// //       return NextResponse.json(
// //         { success: false, message: "Training not found" },
// //         { status: 404 }
// //       );
// //     }
// //     const trainingData = training[0];
// //     if (trainingData.price > 0) {
// //       return NextResponse.json(
// //         { success: false, message: "This training requires payment" },
// //         { status: 400 }
// //       );
// //     }

// //     // 🔄 UPDATE THIS LOGIC: Check for an existing *active* enrollment
// //     const existingEnrollment = await sql`
// //       SELECT id FROM enrollments 
// //       WHERE user_id = ${user.id} 
// //         AND training_id = ${trainingId}
// //         AND access_expires_at > NOW() -- Check if access is currently valid
// //     `;
// //     if (existingEnrollment.length > 0) {
// //       return NextResponse.json(
// //         { success: false, message: "You already have active access to this training" },
// //         { status: 400 }
// //       );
// //     }

// //     // 🔄 UPDATE THIS INSERT STATEMENT
// //     const enrollmentResult = await sql`
// //       INSERT INTO enrollments (
// //         user_id,
// //         training_id,
// //         status,
// //         progress,
// //         enrolled_at,
// //         access_expires_at -- ✅ ADD THIS
// //       ) VALUES (
// //         ${user.id},
// //         ${trainingId},
// //         'in_progress', -- A better default status
// //         0.00,
// //         CURRENT_TIMESTAMP,
// //         CURRENT_TIMESTAMP + INTERVAL '5 minutes' -- ✅ SET EXPIRATION TO 1 YEAR FROM NOW
// //       )
// //       RETURNING id, user_id, training_id, status, enrolled_at, access_expires_at
// //     `;
// //     const enrollment = enrollmentResult[0];

// //     // Create a payment record for tracking
// //     await sql`
// //       INSERT INTO payments (
// //         user_id, training_id, amount, currency, payment_method, status, payment_data
// //       ) VALUES (
// //         ${user.id}, ${trainingId}, 0.00, 'ETB', 'free', 'completed',
// //         ${JSON.stringify({
// //           type: "free_enrollment",
// //           trainingName: trainingData.name,
// //           enrollmentId: enrollment.id,
// //         })}
// //       )
// //     `;

// //     return NextResponse.json({
// //       success: true,
// //       enrollment,
// //       message: "Successfully enrolled in free training",
// //     });
// //   } catch (error) {
// //     console.error("Free enrollment error:", error);
// //     return NextResponse.json(
// //       { success: false, message: "Internal server error" },
// //       { status: 500 }
// //     );
// //   }
// // }
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { createEnrollmentNotification } from "@/lib/notification-service"


export async function POST(request: NextRequest) {
  try {
    // --- Get user from token ---
    const authHeader = request.headers.get("authorization");
    const token = (authHeader?.replace(/^Bearer\s+/i, "") || "").trim();
    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // --- Get trainingId from request body ---
    const { trainingId } = await request.json();
    if (!trainingId) {
      return NextResponse.json(
        { success: false, message: "Training ID is required" },
        { status: 400 }
      );
    }

    // --- Get training details ---
    const training = await sql`
      SELECT id, name, price, instructor_name
      FROM trainings 
      WHERE id = ${trainingId}
    `;
    if (training.length === 0) {
      return NextResponse.json(
        { success: false, message: "Training not found" },
        { status: 404 }
      );
    }

    const trainingData = training[0];
    if (trainingData.price > 0) {
      return NextResponse.json(
        { success: false, message: "This training requires payment" },
        { status: 400 }
      );
    }

    // --- Check existing enrollment ---
    const existingEnrollments = await sql`
      SELECT * FROM enrollments
      WHERE user_id = ${user.id} AND training_id = ${trainingId};
    `;

    let enrollment;
    let alreadyEnrolled = false;
    const now = new Date();

      // --- THE FIX: Create a notification after all database operations are successful ---
    await createEnrollmentNotification(user.id, trainingData.id, trainingData.name);
    
    if (existingEnrollments.length > 0) {
      enrollment = existingEnrollments[0];
      if (new Date(enrollment.access_expires_at) < now) {
        // Expired → extend access
        const updated = await sql`
          UPDATE enrollments
          SET enrolled_at = CURRENT_TIMESTAMP,
              access_expires_at = CURRENT_TIMESTAMP + interval '1 year'
          WHERE id = ${enrollment.id}
          RETURNING *;
        `;
        enrollment = updated[0];
      } else {
        // Still active
        alreadyEnrolled = true;
      }
    } else {
      // --- Fresh enrollment ---
      const inserted = await sql`
        INSERT INTO enrollments (
          user_id,
          training_id,
          status,
          progress,
          enrolled_at,
          access_expires_at
        ) VALUES (
          ${user.id},
          ${trainingId},
          'active',
          0.00,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP + interval '1 year'
        )
        RETURNING *;
      `;
      enrollment = inserted[0];

      // --- Create a payment record for tracking ---
      await sql`
        INSERT INTO payments (
          user_id,
          training_id,
          amount,
          currency,
          payment_method,
          status,
          payment_data
        ) VALUES (
          ${user.id},
          ${trainingId},
          0.00,
          'ETB',
          'free',
          'completed',
          ${JSON.stringify({
            type: "free_enrollment",
            trainingName: trainingData.name,
            enrollmentId: enrollment.id,
          })}
        )
      `;
    }

    // --- Return enrollment info ---
    return NextResponse.json({
      success: true,
      alreadyEnrolled,
      enrollment: {
        id: enrollment.id,
        trainingId: enrollment.training_id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolled_at,
        expiresAt: enrollment.access_expires_at,
      },
      message: alreadyEnrolled
        ? "You are already enrolled and access is active."
        : "Successfully enrolled in free training",
    });
  } catch (error) {
    console.error("Free enrollment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

