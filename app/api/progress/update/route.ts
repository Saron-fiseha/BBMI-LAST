
// import { type NextRequest, NextResponse } from "next/server"
// import { sql } from "@/lib/db"
// import { checkAndGenerateCertificate } from "@/lib/certificate-generator"
// import { getUserFromToken } from "@/lib/auth" 


// export async function POST(request: NextRequest) {
//   try {
//     const authHeader = request.headers.get("authorization")
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const body = await request.json()
//     const { trainingId, moduleId, status, progressPercentage, timeSpent } = body

//     if (!trainingId || !moduleId) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
//     }

//     // Get user from token (simplified - in production use proper JWT verification)
//     // const token = authHeader.split(" ")[1]
//     // const userResult = await sql`
//     //   SELECT id FROM users WHERE auth_token = ${token} LIMIT 1
//     // `

//     // if (userResult.length === 0) {
//     //   return NextResponse.json({ error: "Invalid token" }, { status: 401 })
//     // }

//     // const userId = userResult[0].id
    
    
// const token = authHeader?.split(" ")[1]

// if (!token) {
//   return NextResponse.json({ error: "Missing or malformed token" }, { status: 401 })
// }

// const user = await getUserFromToken(token)

// if (!user) {
//   return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
// }

// const userId = user.id




//     // Get enrollment
//     const enrollment = await sql`
//       SELECT * FROM enrollments 
//       WHERE user_id = ${userId} AND training_id = ${trainingId}
//       LIMIT 1
//     `

//     if (enrollment.length === 0) {
//       return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
//     }

//     const enrollmentId = enrollment[0].id

//     // Update or create module progress
//     await sql`
//       INSERT INTO module_progress (
//         enrollment_id, user_id, module_id, status, progress_percentage, time_spent_minutes, last_accessed
//       ) VALUES (
//         ${enrollmentId},${user.id}, ${moduleId}, ${status}, ${progressPercentage || 0}, ${timeSpent || 0}, CURRENT_TIMESTAMP
//       )
//       ON CONFLICT (enrollment_id, module_id) 
//       DO UPDATE SET 
//         status = EXCLUDED.status,
//         progress_percentage = EXCLUDED.progress_percentage,
//         time_spent_minutes = EXCLUDED.time_spent_minutes,
//         last_accessed = EXCLUDED.last_accessed
//     `

//     // Calculate overall progress
//     const progressStats = await sql`
//       SELECT 
//         COUNT(*) as total_modules,
//         COUNT(CASE WHEN mp.status = 'completed' THEN 1 END) as completed_modules,
//         AVG(COALESCE(mp.progress_percentage, 0)) as avg_progress
//       FROM modules m
//       LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.enrollment_id = ${enrollmentId}
//       WHERE m.training_id = ${trainingId}
//     `

//     const stats = progressStats[0]
//     const overallProgress = Math.round((stats.completed_modules / stats.total_modules) * 100)
//     const trainingCompleted = overallProgress === 100

//     // Update enrollment progress
//     // await sql`
//     //   UPDATE enrollments 
//     //   SET 
//     //     progress_percentage = ${overallProgress},
//     //     status = ${trainingCompleted ? "completed" : "active"},
//     //     completed_at = ${trainingCompleted ? "CURRENT_TIMESTAMP" : null},
//     //     last_accessed = CURRENT_TIMESTAMP
//     //   WHERE id = ${enrollmentId}
//     // `
//     await sql`
//   UPDATE enrollments
//   SET
//     progress_percentage = ${overallProgress},
//     status = ${trainingCompleted ? "completed" : "active"},
//     completed_at = ${trainingCompleted ? sql`CURRENT_TIMESTAMP` : null},
//     last_accessed = CURRENT_TIMESTAMP
//   WHERE id = ${enrollmentId}
// `


//     let certificateGenerated = false
//     let certificateNumber = null

//     // Generate certificate if training is completed
//     if (trainingCompleted && !enrollment[0].certificate_issued) {
//       try {
//         certificateNumber = await checkAndGenerateCertificate(userId, Number.parseInt(trainingId))
//         if (certificateNumber) {
//           certificateGenerated = true
//         }
//       } catch (error) {
//         console.error("Certificate generation failed:", error)
//         // Don't fail the progress update if certificate generation fails
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       overallProgress,
//       completedModules: stats.completed_modules,
//       totalModules: stats.total_modules,
//       trainingCompleted,
//       certificateGenerated,
//       certificateNumber,
//       message: trainingCompleted
//         ? "Congratulations! Training completed successfully!"
//         : "Progress updated successfully",
//     })
//   } catch (error) {
//     console.error("Progress update error:", error)
//     return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
//   }
// }

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { checkAndGenerateCertificate } from "@/lib/certificate-generator"

export async function POST(request: NextRequest) {
  try {
    console.log("Progress update request received")

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("No authorization header")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = await getUserFromToken(token)

    if (!user) {
      console.log("Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("User authenticated:", user.id)

    const body = await request.json()
    const { trainingId, moduleId, status, progressPercentage, timeSpent } = body

    console.log("Request body:", body)

    if (!trainingId || !moduleId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get enrollment
    const enrollment = await sql`
      SELECT * FROM enrollments 
      WHERE user_id = ${user.id} AND training_id = ${trainingId}
      LIMIT 1
    `

    console.log("Enrollment found:", enrollment)

    if (enrollment.length === 0) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    const enrollmentId = enrollment[0].id

    // Update or create module progress
    await sql`
      INSERT INTO module_progress (
        enrollment_id, user_id, module_id, status, progress_percentage, time_spent_minutes, last_accessed
      ) VALUES (
        ${enrollmentId}, ${user.id} , ${moduleId}, ${status}, ${progressPercentage || 0}, ${timeSpent || 0}, CURRENT_TIMESTAMP
      )
      ON CONFLICT (enrollment_id, module_id) 
      DO UPDATE SET 
        status = EXCLUDED.status,
        progress_percentage = EXCLUDED.progress_percentage,
        time_spent_minutes = EXCLUDED.time_spent_minutes,
        last_accessed = EXCLUDED.last_accessed
    `

    console.log("Module progress updated")

    // Calculate overall progress
    const progressStats = await sql`
      SELECT 
        COUNT(*) as total_modules,
        COUNT(CASE WHEN mp.status = 'completed' THEN 1 END) as completed_modules,
        AVG(COALESCE(mp.progress_percentage, 0)) as avg_progress
      FROM modules m
      LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.enrollment_id = ${enrollmentId}
      WHERE m.training_id = ${trainingId}
    `

    const stats = progressStats[0]
    const overallProgress = Math.round((Number(stats.completed_modules) / Number(stats.total_modules)) * 100)
    const trainingCompleted = overallProgress >= 100

    console.log("Progress stats:", {
      totalModules: stats.total_modules,
      completedModules: stats.completed_modules,
      overallProgress,
      trainingCompleted,
    })

    // Update enrollment progress
    await sql`
      UPDATE enrollments 
      SET 
        progress_percentage = ${overallProgress},
        status = ${trainingCompleted ? "completed" : "active"},
        completed_at = ${trainingCompleted ? sql`CURRENT_TIMESTAMP` : null},
        last_accessed = CURRENT_TIMESTAMP
      WHERE id = ${enrollmentId}
    `

    console.log("Enrollment updated")

    let certificateGenerated = false
    let certificateNumber = null

    // Generate certificate if training is completed and not already issued
    if (trainingCompleted && !enrollment[0].certificate_issued) {
      try {
        console.log("Attempting to generate certificate...")
        certificateNumber = await checkAndGenerateCertificate(user.id, Number.parseInt(trainingId))
        if (certificateNumber) {
          certificateGenerated = true
          console.log("Certificate generated successfully:", certificateNumber)
        } else {
          console.log("Certificate not generated - may already exist or user not eligible")
        }
      } catch (error) {
        console.error("Certificate generation failed:", error)
        // Don't fail the progress update if certificate generation fails
      }
    } else if (trainingCompleted && enrollment[0].certificate_issued) {
      console.log("Certificate already issued for this enrollment")
    }

    return NextResponse.json({
      success: true,
      overallProgress,
      completedModules: Number(stats.completed_modules),
      totalModules: Number(stats.total_modules),
      trainingCompleted,
      certificateGenerated,
      certificateNumber,
      message: trainingCompleted
        ? "Congratulations! Training completed successfully!"
        : "Progress updated successfully",
    })
  } catch (error) {
    console.error("Progress update error:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
