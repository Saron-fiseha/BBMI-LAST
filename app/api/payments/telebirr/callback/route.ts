// import { type NextRequest, NextResponse } from "next/server"
// import { sql } from "@/lib/db"
// import { telebirrService, type TelebirrCallbackData } from "@/lib/telebirr"

// export async function POST(request: NextRequest) {
//   try {
//     const callbackData: TelebirrCallbackData = await request.json()

//     // Verify callback signature
//     const isValidSignature = telebirrService.verifyCallback(callbackData)
//     if (!isValidSignature) {
//       console.error("Invalid callback signature")
//       return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 })
//     }

//     // Find payment record
//     const payment = await sql`
//       SELECT p.*, u.id as user_id, u.full_name, u.email
//       FROM payments p
//       JOIN users u ON p.user_id = u.id
//       WHERE p.telebirr_transaction_id = ${callbackData.transactionId}
//     `

//     if (payment.length === 0) {
//       console.error("Payment not found for transaction:", callbackData.transactionId)
//       return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 })
//     }

//     const paymentData = payment[0]

//     // Update payment status based on callback
//     let newStatus: string
//     let completedAt: Date | null = null

//     switch (callbackData.status) {
//       case "SUCCESS":
//         newStatus = "completed"
//         completedAt = new Date()
//         break
//       case "FAILED":
//         newStatus = "failed"
//         break
//       case "CANCELLED":
//         newStatus = "cancelled"
//         break
//       default:
//         newStatus = "failed"
//     }

//     // Update payment record
//     await sql`
//       UPDATE payments 
//       SET 
//         status = ${newStatus},
//         telebirr_reference_number = ${callbackData.referenceNumber},
//         completed_at = ${completedAt},
//         payment_data = ${JSON.stringify({
//           ...JSON.parse(paymentData.payment_data || "{}"),
//           callbackData,
//           processedAt: new Date().toISOString(),
//         })}
//       WHERE id = ${paymentData.id}
//     `

//     // If payment successful, create enrollment
//     if (callbackData.status === "SUCCESS") {
//       try {
//         // Create enrollment record
//         const enrollmentResult = await sql`
//           INSERT INTO enrollments (
//             user_id,
//             training_id,
//             payment_id,
//             status,
//             progress_percentage,
//             enrolled_at
//           ) VALUES (
//             ${paymentData.user_id},
//             ${paymentData.training_id},
//             ${paymentData.id},
//             'active',
//             0,
//             CURRENT_TIMESTAMP
//           )
//           RETURNING id
//         `

//         const enrollmentId = enrollmentResult[0].id

//         // Get training lessons to initialize progress tracking
//         const lessons = await sql`
//           SELECT id, order_index
//           FROM training_lessons
//           WHERE training_id = ${paymentData.training_id}
//           ORDER BY order_index
//         `

//         // Initialize lesson progress records
//         for (const lesson of lessons) {
//           await sql`
//             INSERT INTO lesson_progress (
//               user_id,
//               training_id,
//               lesson_id,
//               status,
//               progress_percentage
//             ) VALUES (
//               ${paymentData.user_id},
//               ${paymentData.training_id},
//               ${lesson.id},
//               'not_started',
//               0
//             )
//             ON CONFLICT (user_id, training_id, lesson_id) DO NOTHING
//           `
//         }

//         console.log(
//           `Enrollment created successfully for user ${paymentData.user_id}, training ${paymentData.training_id}`,
//         )
//       } catch (enrollmentError) {
//         console.error("Error creating enrollment:", enrollmentError)
//         // Don't fail the callback, but log the error
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Callback processed successfully",
//     })
//   } catch (error) {
//     console.error("Callback processing error:", error)
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
import { telebirrService, type TelebirrCallbackData } from "@/lib/telebirr"

export async function POST(request: NextRequest) {
  try {
    const callbackData: TelebirrCallbackData = await request.json()

    // Verify callback signature
    const isValidSignature = telebirrService.verifyCallback(callbackData)
    if (!isValidSignature) {
      console.error("Invalid callback signature")
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 })
    }

    // Find payment record
    const payment = await sql`
      SELECT p.*, u.id as user_id, u.full_name, u.email
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE p.telebirr_transaction_id = ${callbackData.transactionId}
    `

    if (payment.length === 0) {
      console.error("Payment not found for transaction:", callbackData.transactionId)
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 })
    }

    const paymentData = payment[0]

    // Update payment status based on callback
    let newStatus: string
    let completedAt: Date | null = null

    switch (callbackData.status) {
      case "SUCCESS":
        newStatus = "completed"
        completedAt = new Date()
        break
      case "FAILED":
        newStatus = "failed"
        break
      case "CANCELLED":
        newStatus = "cancelled"
        break
      default:
        newStatus = "failed"
    }

    // Update payment record
    await sql`
      UPDATE payments 
      SET 
        status = ${newStatus},
        telebirr_reference_number = ${callbackData.referenceNumber},
        completed_at = ${completedAt},
        payment_data = ${JSON.stringify({
          ...JSON.parse(paymentData.payment_data || "{}"),
          callbackData,
          processedAt: new Date().toISOString(),
        })}
      WHERE id = ${paymentData.id}
    `

    // If payment successful, create enrollment
    if (callbackData.status === "SUCCESS") {
      try {
        // Create enrollment record
        const enrollmentResult = await sql`
          INSERT INTO enrollments (
            user_id,
            training_id,
            payment_id,
            status,
            progress_percentage,
            enrolled_at
          ) VALUES (
            ${paymentData.user_id},
            ${paymentData.training_id},
            ${paymentData.id},
            'active',
            0,
            CURRENT_TIMESTAMP
          )
          RETURNING id
        `

        const enrollmentId = enrollmentResult[0].id

        // Get training lessons to initialize progress tracking
        const lessons = await sql`
          SELECT id, order_index
          FROM training_lessons
          WHERE training_id = ${paymentData.training_id}
          ORDER BY order_index
        `

        // Initialize lesson progress records
        for (const lesson of lessons) {
          await sql`
            INSERT INTO lesson_progress (
              user_id,
              training_id,
              lesson_id,
              status,
              progress_percentage
            ) VALUES (
              ${paymentData.user_id},
              ${paymentData.training_id},
              ${lesson.id},
              'not_started',
              0
            )
            ON CONFLICT (user_id, training_id, lesson_id) DO NOTHING
          `
        }

        console.log(
          `Enrollment created successfully for user ${paymentData.user_id}, training ${paymentData.training_id}`,
        )
      } catch (enrollmentError) {
        console.error("Error creating enrollment:", enrollmentError)
        // Don't fail the callback, but log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: "Callback processed successfully",
    })
  } catch (error) {
    console.error("Callback processing error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
