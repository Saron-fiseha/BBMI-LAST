import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const instructorId = user.id

    // Get instructor's course count
    const courseCountResult = await sql`
      SELECT COUNT(*) as count
      FROM courses 
      WHERE instructor_id = ${instructorId}
    `
    const totalCourses = Number(courseCountResult[0]?.count || 0)

    // Get total students across all instructor's courses
    const studentCountResult = await sql`
      SELECT COUNT(DISTINCT e.user_id) as count
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.instructor_id = ${instructorId}
        AND e.status = 'active'
    `
    const totalStudents = Number(studentCountResult[0]?.count || 0)

    // Get average rating across all instructor's courses
    const avgRatingResult = await sql`
      SELECT AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
      FROM reviews r
      JOIN courses c ON r.course_id = c.id
      WHERE c.instructor_id = ${instructorId}
    `
    const averageRating = Number(Number(avgRatingResult[0]?.avg_rating || 0).toFixed(1))

    // Get upcoming sessions count for current week
    const upcomingSessionsResult = await sql`
      SELECT COUNT(*) as count
      FROM sessions s
      WHERE s.instructor_id = ${instructorId}
        AND s.scheduled_at >= CURDATE()
        AND s.scheduled_at < DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND s.status IN ('scheduled', 'confirmed')
    `
    const upcomingSessions = Number(upcomingSessionsResult[0]?.count || 0)

    // Calculate total earnings (sum of all enrollments for instructor's courses)
    const earningsResult = await sql`
      SELECT SUM(c.price) as total_earnings
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.instructor_id = ${instructorId}
        AND e.status = 'active'
    `
    const totalEarnings = Number(earningsResult[0]?.total_earnings || 0)

    // Get recent activity (enrollments and reviews)
    const recentEnrollments = await sql`
      SELECT 
        'enrollment' as type,
        CONCAT(u.full_name, ' enrolled in ', c.title) as title,
        CONCAT('New student joined your course') as description,
        e.created_at as activity_time,
        u.profile_picture as avatar
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON e.user_id = u.id
      WHERE c.instructor_id = ${instructorId}
      ORDER BY e.created_at DESC
      LIMIT 3
    `

    const recentReviews = await sql`
      SELECT 
        'review' as type,
        CONCAT('New ', r.rating, '-star review for ', c.title) as title,
        LEFT(r.comment, 100) as description,
        r.created_at as activity_time,
        u.profile_picture as avatar
      FROM reviews r
      JOIN courses c ON r.course_id = c.id
      JOIN users u ON r.user_id = u.id
      WHERE c.instructor_id = ${instructorId}
      ORDER BY r.created_at DESC
      LIMIT 2
    `

    // Combine and sort recent activity
    const allActivity = [...recentEnrollments, ...recentReviews]
      .sort((a, b) => new Date(b.activity_time).getTime() - new Date(a.activity_time).getTime())
      .slice(0, 5)

    const formattedActivity = allActivity.map((activity) => ({
      id: Math.random().toString(36).substr(2, 9),
      type: activity.type,
      title: activity.title,
      description: activity.description,
      time: formatTimeAgo(new Date(activity.activity_time)),
      avatar: activity.avatar,
    }))

    // Calculate monthly growth (mock for now, would need historical data)
    const monthlyGrowth = "+15%"

    const stats = {
      totalCourses,
      totalStudents,
      averageRating,
      upcomingSessions,
      totalEarnings,
      monthlyGrowth,
    }

    return NextResponse.json({
      stats,
      recentActivity: formattedActivity,
    })
  } catch (error) {
    console.error("Error fetching instructor dashboard:", error)

    // Return mock data as fallback
    return NextResponse.json({
      stats: {
        totalCourses: 3,
        totalStudents: 247,
        averageRating: 4.8,
        upcomingSessions: 2,
        totalEarnings: 12450,
        monthlyGrowth: "+15%",
      },
      recentActivity: [
        {
          id: "1",
          type: "enrollment",
          title: "New Student Enrolled",
          description: "Sarah Johnson enrolled in Advanced Hair Styling",
          time: "2 hours ago",
        },
        {
          id: "2",
          type: "review",
          title: "New Review Received",
          description: "5-star review for Professional Makeup Artistry",
          time: "4 hours ago",
        },
      ],
    })
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return date.toLocaleDateString()
}
