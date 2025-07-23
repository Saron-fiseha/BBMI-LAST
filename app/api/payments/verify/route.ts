// import { type NextRequest, NextResponse } from "next/server"
// import { sql } from "@/lib/db"
// import { getUserFromToken } from "@/lib/auth"
// import { telebirrService } from "@/lib/telebirr"

// export async function POST(request: NextRequest) {
//   try {
//     // Get user from token
//     const authHeader = request.headers.get("authorization")
//     const token = authHeader?.replace(/^Bearer\s+/i, "") || ""
//     const user = await getUserFromToken(token)
//     if (!user) {
//       return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
//     }

//     const { paymentId } = await request.json()

//     if (!paymentId) {
//       return NextResponse.json({ success: false, message: "Payment ID is required" }, { status: 400 })
//     }

//     // Get payment record
//     const payment = await sql`
//       SELECT * FROM payments 
//       WHERE id = ${paymentId} AND user_id = ${user.id}
//     `

//     if (payment.length === 0) {
//       return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 })
//     }

//     const paymentData = payment[0]

//     // If payment is already completed, return success
//     if (paymentData.status === "completed") {
//       return NextResponse.json({
//         success: true,
//         status: "completed",
//         message: "Payment completed successfully",
//       })
//     }

//     // If payment has Telebirr transaction ID, verify with Telebirr
//     if (paymentData.telebirr_transaction_id) {
//       const verificationResult = await telebirrService.verifyPayment(paymentData.telebirr_transaction_id)

//       if (verificationResult.success) {
//         // Update payment status
//         await sql`
//           UPDATE payments 
//           SET 
//             status = 'completed',
//             completed_at = CURRENT_TIMESTAMP,
//             payment_data = ${JSON.stringify({
//               ...JSON.parse(paymentData.payment_data || "{}"),
//               verificationResult,
//               verifiedAt: new Date().toISOString(),
//             })}
//           WHERE id = ${paymentId}
//         `

//         // Check if enrollment exists, if not create it
//         const enrollment = await sql`
//           SELECT id FROM enrollments 
//           WHERE user_id = ${user.id} AND training_id = ${paymentData.training_id}
//         `

//         if (enrollment.length === 0) {
//           // Create enrollment
//           await sql`
//             INSERT INTO enrollments (
//               user_id,
//               training_id,
//               payment_id,
//               status,
//               progress_percentage,
//               enrolled_at
//             ) VALUES (
//               ${user.id},
//               ${paymentData.training_id},
//               ${paymentId},
//               'active',
//               0,
//               CURRENT_TIMESTAMP
//             )
//           `

//           // Initialize lesson progress
//           const lessons = await sql`
//             SELECT id FROM training_lessons
//             WHERE training_id = ${paymentData.training_id}
//           `

//           for (const lesson of lessons) {
//             await sql`
//               INSERT INTO lesson_progress (
//                 user_id,
//                 training_id,
//                 lesson_id,
//                 status,
//                 progress_percentage
//               ) VALUES (
//                 ${user.id},
//                 ${paymentData.training_id},
//                 ${lesson.id},
//                 'not_started',
//                 0
//               )
//               ON CONFLICT (user_id, training_id, lesson_id) DO NOTHING
//             `
//           }
//         }

//         return NextResponse.json({
//           success: true,
//           status: "completed",
//           message: "Payment verified and enrollment created",
//         })
//       } else {
//         return NextResponse.json({
//           success: false,
//           status: paymentData.status,
//           message: verificationResult.error || "Payment verification failed",
//         })
//       }
//     }

//     // Return current payment status
//     return NextResponse.json({
//       success: paymentData.status === "completed",
//       status: paymentData.status,
//       message: `Payment status: ${paymentData.status}`,
//     })
//   } catch (error) {
//     console.error("Payment verification error:", error)
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Internal server error",
//       },
//       { status: 500 },
//     )
//   }
// }

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { telebirrService } from "@/lib/telebirr"

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace(/^Bearer\s+/i, "") || ""
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const { paymentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json({ success: false, message: "Payment ID is required" }, { status: 400 })
    }

    // Get payment record
    const payment = await sql`
      SELECT * FROM payments 
      WHERE id = ${paymentId} AND user_id = ${user.id}
    `

    if (payment.length === 0) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 })
    }

    const paymentData = payment[0]

    // If payment is already completed, return success
    if (paymentData.status === "completed") {
      return NextResponse.json({
        success: true,
        status: "completed",
        message: "Payment completed successfully",
      })
    }

    // If payment has Telebirr transaction ID, verify with Telebirr
    if (paymentData.telebirr_transaction_id) {
      const verificationResult = await telebirrService.verifyPayment(paymentData.telebirr_transaction_id)

      if (verificationResult.success) {
        // Update payment status
        await sql`
          UPDATE payments 
          SET 
            status = 'completed',
            completed_at = CURRENT_TIMESTAMP,
            payment_data = ${JSON.stringify({
              ...JSON.parse(paymentData.payment_data || "{}"),
              verificationResult,
              verifiedAt: new Date().toISOString(),
            })}
          WHERE id = ${paymentId}
        `

        // Check if enrollment exists, if not create it
        const enrollment = await sql`
          SELECT id FROM enrollments 
          WHERE user_id = ${user.id} AND training_id = ${paymentData.training_id}
        `

        if (enrollment.length === 0) {
          // Create enrollment
          await sql`
            INSERT INTO enrollments (
              user_id,
              training_id,
              payment_id,
              status,
              progress_percentage,
              enrolled_at
            ) VALUES (
              ${user.id},
              ${paymentData.training_id},
              ${paymentId},
              'active',
              0,
              CURRENT_TIMESTAMP
            )
          `

          // Initialize lesson progress
          const lessons = await sql`
            SELECT id FROM training_lessons
            WHERE training_id = ${paymentData.training_id}
          `

          for (const lesson of lessons) {
            await sql`
              INSERT INTO lesson_progress (
                user_id,
                training_id,
                lesson_id,
                status,
                progress_percentage
              ) VALUES (
                ${user.id},
                ${paymentData.training_id},
                ${lesson.id},
                'not_started',
                0
              )
              ON CONFLICT (user_id, training_id, lesson_id) DO NOTHING
            `
          }
        }

        return NextResponse.json({
          success: true,
          status: "completed",
          message: "Payment verified and enrollment created",
        })
      } else {
        return NextResponse.json({
          success: false,
          status: paymentData.status,
          message: verificationResult.error || "Payment verification failed",
        })
      }
    }

    // Return current payment status
    return NextResponse.json({
      success: paymentData.status === "completed",
      status: paymentData.status,
      message: `Payment status: ${paymentData.status}`,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
