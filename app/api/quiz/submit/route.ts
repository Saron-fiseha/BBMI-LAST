import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getUserFromToken } from "@/lib/auth"

export const dynamic = "force-dynamic"
const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { trainingId, score, totalQuestions } = body

    if (!trainingId || score === undefined || !totalQuestions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const gradeStr = `${score}/${totalQuestions}`
    console.log(`Saving quiz score for user ${user.id} in training ${trainingId}: ${gradeStr}`)

    // Update enrollment grade
    const updated = await sql`
      UPDATE enrollments 
      SET grade = ${gradeStr}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user.id} AND training_id = ${trainingId}
      RETURNING id, user_id, training_id, grade
    `

    return NextResponse.json({
      success: true,
      grade: gradeStr,
      updated: updated.length > 0
    })
  } catch (error) {
    console.error("Error submitting quiz score:", error)
    return NextResponse.json({ error: "Failed to submit quiz score" }, { status: 500 })
  }
}
