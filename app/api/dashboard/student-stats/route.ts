import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get enrolled courses count
    const enrolledCoursesResult = await sql`
      SELECT COUNT(*) as count
      FROM enrollments
      WHERE user_id = ${userId}
        AND status = 'active'
    `

    // Get completed courses count
    const completedCoursesResult = await sql`
      SELECT COUNT(*) as count
      FROM enrollments
      WHERE user_id = ${userId}
        AND status = 'completed'
    `

    // Get average progress
    const avgProgressResult = await sql`
      SELECT AVG(progress) as avg_progress
      FROM enrollments
      WHERE user_id = ${userId}
        AND status IN ('active', 'completed')
    `

    // Get total investment
    const totalInvestmentResult = await sql`
      SELECT COALESCE(SUM(payment_amount), 0) as total_investment
      FROM enrollments
      WHERE user_id = ${userId}
        AND payment_status = 'completed'
    `

    // Calculate monthly growth (mock for now)
    const monthlyGrowth = "+15%"

    const stats = {
      totalCourses: Number(enrolledCoursesResult[0]?.count || 0),
      completedCourses: Number(completedCoursesResult[0]?.count || 0),
      averageProgress: Math.round(Number(avgProgressResult[0]?.avg_progress || 0)),
      totalInvestment: Number(totalInvestmentResult[0]?.total_investment || 0),
      monthlyGrowth,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Student dashboard stats error (falling back to empty):", error)

    // Safe fallback so the UI can still render
    return NextResponse.json({
      stats: {
        totalCourses: 0,
        averageProgress: 0,
        completedCourses: 0,
        totalInvestment: 0,
        monthlyGrowth: "+0%",
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId, paymentAmount } = body

    if (!userId || !courseId) {
      return NextResponse.json({ error: "User ID and Course ID required" }, { status: 400 })
    }

    // Create new enrollment
    const result = await sql`
      INSERT INTO enrollments (user_id, course_id, payment_amount, status, progress, created_at)
      VALUES (${userId}, ${courseId}, ${paymentAmount || 0}, 'active', 0, NOW())
      RETURNING id
    `

    return NextResponse.json({ success: true, enrollmentId: result[0]?.id })
  } catch (error) {
    console.error("Error creating enrollment:", error)
    return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId, progress, status } = body

    if (!userId || !courseId) {
      return NextResponse.json({ error: "User ID and Course ID required" }, { status: 400 })
    }

    // Update enrollment progress
    await sql`
      UPDATE enrollments
      SET progress = ${progress || 0},
          status = ${status || "active"},
          updated_at = NOW(),
          completed_at = ${status === "completed" ? "NOW()" : null}
      WHERE user_id = ${userId} AND course_id = ${courseId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating enrollment:", error)
    return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const courseId = searchParams.get("courseId")

    if (!userId || !courseId) {
      return NextResponse.json({ error: "User ID and Course ID required" }, { status: 400 })
    }

    // Delete enrollment
    await sql`
      DELETE FROM enrollments
      WHERE user_id = ${userId} AND course_id = ${courseId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting enrollment:", error)
    return NextResponse.json({ error: "Failed to delete enrollment" }, { status: 500 })
  }
}
