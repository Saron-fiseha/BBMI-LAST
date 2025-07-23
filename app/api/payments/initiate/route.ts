// import { type NextRequest, NextResponse } from "next/server"
// import { sql } from "@/lib/db"
// import { getUserFromToken } from "@/lib/auth"
// import { telebirrService, generateOrderId, formatAmountForTelebirr } from "@/lib/telebirr"

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

//     // Get training details
//     const training = await sql`
//       SELECT id, name, price, instructor_name
//       FROM trainings 
//       WHERE id = ${trainingId}
//     `

//     if (training.length === 0) {
//       return NextResponse.json({ success: false, message: "Training not found" }, { status: 404 })
//     }

//     const trainingData = training[0]

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

//     // Generate unique order ID
//     const orderId = generateOrderId(user.id, trainingId)
//     const amount = formatAmountForTelebirr(trainingData.price)

//     // Create payment record
//     const paymentResult = await sql`
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
//         ${amount},
//         'ETB',
//         'telebirr',
//         'pending',
//         ${JSON.stringify({ orderId, trainingName: trainingData.name })}
//       )
//       RETURNING id, amount, currency
//     `

//     const payment = paymentResult[0]

//     // Initiate Telebirr payment
//     const telebirrResponse = await telebirrService.initiatePayment({
//       amount: payment.amount,
//       currency: payment.currency,
//       orderId,
//       description: `Payment for ${trainingData.name}`,
//       customerName: user.full_name,
//       customerEmail: user.email,
//       customerPhone: user.phone || "",
//     })

//     if (telebirrResponse.success) {
//       // Update payment record with Telebirr transaction details
//       await sql`
//         UPDATE payments 
//         SET 
//           telebirr_transaction_id = ${telebirrResponse.transactionId},
//           telebirr_reference_number = ${telebirrResponse.referenceNumber},
//           status = 'processing',
//           payment_data = ${JSON.stringify({
//             ...JSON.parse(payment.payment_data || "{}"),
//             telebirrTransactionId: telebirrResponse.transactionId,
//             telebirrReferenceNumber: telebirrResponse.referenceNumber,
//           })}
//         WHERE id = ${payment.id}
//       `

//       return NextResponse.json({
//         success: true,
//         paymentId: payment.id,
//         paymentUrl: telebirrResponse.paymentUrl,
//         transactionId: telebirrResponse.transactionId,
//         referenceNumber: telebirrResponse.referenceNumber,
//         message: "Payment initiated successfully",
//       })
//     } else {
//       // Update payment status to failed
//       await sql`
//         UPDATE payments 
//         SET status = 'failed',
//             payment_data = ${JSON.stringify({
//               ...JSON.parse(payment.payment_data || "{}"),
//               error: telebirrResponse.error,
//             })}
//         WHERE id = ${payment.id}
//       `

//       return NextResponse.json(
//         {
//           success: false,
//           message: telebirrResponse.error || "Payment initiation failed",
//         },
//         { status: 400 },
//       )
//     }
//   } catch (error) {
//     console.error("Payment initiation error:", error)
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
import { telebirrService, generateOrderId, formatAmountForTelebirr } from "@/lib/telebirr"

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace(/^Bearer\s+/i, "") || ""
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const { trainingId } = await request.json()

    if (!trainingId) {
      return NextResponse.json({ success: false, message: "Training ID is required" }, { status: 400 })
    }

    // Get training details
    const training = await sql`
      SELECT id, name, price, instructor_name
      FROM trainings 
      WHERE id = ${trainingId}
    `

    if (training.length === 0) {
      return NextResponse.json({ success: false, message: "Training not found" }, { status: 404 })
    }

    const trainingData = training[0]

    // Check if user is already enrolled
    const existingEnrollment = await sql`
      SELECT id FROM enrollments 
      WHERE user_id = ${user.id} AND training_id = ${trainingId}
    `

    if (existingEnrollment.length > 0) {
      return NextResponse.json(
        { success: false, message: "You are already enrolled in this training" },
        { status: 400 },
      )
    }

    // Generate unique order ID
    const orderId = generateOrderId(String(user.id), String(trainingId))
    const amount = formatAmountForTelebirr(trainingData.price)

    
    // Create payment record
    const paymentResult = await sql`
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
        ${amount},
        'ETB',
        'telebirr',
        'pending',
        ${JSON.stringify({ orderId, trainingName: trainingData.name })}
      )
      RETURNING id, amount, currency
    `

    const payment = paymentResult[0]

    // Initiate Telebirr payment
    const telebirrResponse = await telebirrService.initiatePayment({
      amount: payment.amount,
      currency: payment.currency,
      orderId,
      description: `Payment for ${trainingData.name}`,
      customerName: user.full_name,
      customerEmail: user.email,
      customerPhone: user.phone || "",
    })

    if (telebirrResponse.success) {
      // Update payment record with Telebirr transaction details
      await sql`
        UPDATE payments 
        SET 
          telebirr_transaction_id = ${telebirrResponse.transactionId},
          telebirr_reference_number = ${telebirrResponse.referenceNumber},
          status = 'processing',
          payment_data = ${JSON.stringify({
            ...JSON.parse(payment.payment_data || "{}"),
            telebirrTransactionId: telebirrResponse.transactionId,
            telebirrReferenceNumber: telebirrResponse.referenceNumber,
          })}
        WHERE id = ${payment.id}
      `

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        paymentUrl: telebirrResponse.paymentUrl,
        transactionId: telebirrResponse.transactionId,
        referenceNumber: telebirrResponse.referenceNumber,
        message: "Payment initiated successfully",
      })
    } else {
      // Update payment status to failed
      await sql`
        UPDATE payments 
        SET status = 'failed',
            payment_data = ${JSON.stringify({
              ...JSON.parse(payment.payment_data || "{}"),
              error: telebirrResponse.error,
            })}
        WHERE id = ${payment.id}
      `

      return NextResponse.json(
        {
          success: false,
          message: telebirrResponse.error || "Payment initiation failed",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Payment initiation error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
