import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { sql } from "@/lib/db"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)

    if (!user || user.role !== "instructor") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching dashboard data for instructor:", user.id)

    // Get total trainings count
    const trainingsResult = await sql`
      SELECT COUNT(*) as count 
      FROM trainings 
      WHERE instructor_id = ${user.id}
    `
    const totalTrainings = Number(trainingsResult[0]?.count || 0)

    // Get total students enrolled in instructor's trainings
    const studentsResult = await sql`
      SELECT COUNT(DISTINCT e.user_id) as count
      FROM enrollments e
      INNER JOIN trainings t ON e.training_id = t.id
      WHERE t.instructor_id = ${user.id}
    `
    const totalStudents = Number(studentsResult[0]?.count || 0)

    // Get average rating from reviews (using course_id instead of training_id)
    const ratingsResult = await sql`
      SELECT AVG(r.rating) as avg_rating
      FROM reviews r
      INNER JOIN trainings t ON r.training_id = t.id
      WHERE t.instructor_id = ${user.id}
    `
    const averageRating = Number(ratingsResult[0]?.avg_rating || 0)

    // Get upcoming sessions count (next 7 days)
    const upcomingSessionsResult = await sql`
      SELECT COUNT(*) as count
      FROM sessions s
      WHERE s.instructor_id = ${user.id}
      AND s.scheduled_at >= CURRENT_DATE
      AND s.scheduled_at <= CURRENT_DATE + INTERVAL '7 days'
      AND s.status IN ('scheduled', 'confirmed')
    `
    const upcomingSessions = Number(upcomingSessionsResult[0]?.count || 0)

    // Get recent enrollments - using training created_at since enrollment doesn't have created_at
    const recentEnrollments = await sql`
      SELECT 
        'enrollment' as type,
        u.full_name as student_name,
        t.name as training_title,
        t.created_at as created_at
      FROM enrollments e
      INNER JOIN trainings t ON e.training_id = t.id
      INNER JOIN users u ON e.user_id = u.id
      WHERE t.instructor_id = ${user.id}
      ORDER BY t.created_at DESC
      LIMIT 5
    `

    // Get recent reviews (using course_id and name)
    const recentReviews = await sql`
      SELECT 
        'review' as type,
        u.full_name as student_name,
        t.name as training_title,
        r.rating,
        r.comment,
        r.created_at
      FROM reviews r
      INNER JOIN trainings t ON r.training_id = t.id
      INNER JOIN users u ON r.user_id = u.id
      WHERE t.instructor_id = ${user.id}
      ORDER BY r.created_at DESC
      LIMIT 5
    `

    // Get recent sessions - using name instead of title
    const recentSessions = await sql`
      SELECT 
        'session' as type,
        s.title as session_title,
        s.scheduled_at as session_date,
        s.status,
        s.created_at
      FROM sessions s
      WHERE s.instructor_id = ${user.id}
      ORDER BY s.created_at DESC
      LIMIT 5
    `

    // Combine and sort recent activities
    interface EnrollmentActivity {
      type: "enrollment";
      student_name: string;
      training_title: string;
      created_at: string | Date;
    }

    interface ReviewActivity {
      type: "review";
      student_name: string;
      training_title: string;
      rating: number;
      comment: string | null;
      created_at: string | Date;
    }

    interface SessionActivity {
      type: "session";
      session_title: string;
      session_date: string | Date;
      status: string;
      created_at: string | Date;
    }

    interface ActivityItem {
      type: string;
      title: string;
      description: string;
      date: string;
      timestamp: number;
    }

    const allActivities: ActivityItem[] = [
      ...(recentEnrollments as EnrollmentActivity[]).map((item) => ({
      type: item.type,
      title: `New enrollment in ${item.training_title}`,
      description: `${item.student_name} enrolled`,
      date: new Date(item.created_at).toLocaleDateString(),
      timestamp: new Date(item.created_at).getTime(),
      })),
      ...(recentReviews as ReviewActivity[]).map((item) => ({
      type: item.type,
      title: `New review for ${item.training_title}`,
      description: `${item.student_name} rated ${item.rating}/5: ${item.comment || "No comment"}`,
      date: new Date(item.created_at).toLocaleDateString(),
      timestamp: new Date(item.created_at).getTime(),
      })),
      ...(recentSessions as SessionActivity[]).map((item) => ({
      type: item.type,
      title: `Session ${item.status}`,
      description: `${item.session_title} on ${new Date(item.session_date).toLocaleDateString()}`,
      date: new Date(item.created_at).toLocaleDateString(),
      timestamp: new Date(item.created_at).getTime(),
      })),
    ]

    const recentActivity = allActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(({ timestamp, ...activity }) => activity)

    // Get instructor's trainings with enrollment counts - using name instead of title
    const trainingsWithStats = await sql`
      SELECT 
        t.id,
        t.name as title,
        t.description,
        t.level,
        t.duration,
        t.price,
        t.status,
        COUNT(e.id) as enrollment_count,
        AVG(r.rating) as avg_rating
      FROM trainings t
      LEFT JOIN enrollments e ON t.id = e.training_id
      LEFT JOIN reviews r ON t.id = r.training_id
      WHERE t.instructor_id = ${user.id}
      GROUP BY t.id, t.name, t.description, t.level, t.duration, t.price, t.status
      ORDER BY t.created_at DESC
      LIMIT 5
    `

    interface DashboardStats {
      totalTrainings: number;
      totalStudents: number;
      averageRating: number;
      upcomingSessions: number;
    }

    interface TrainingWithStats {
      id: number;
      title: string;
      description: string;
      level: string;
      duration_hours: number;
      price: number;
      status: string;
      enrollment_count: number;
      avg_rating: number;
      duration?: number;
    }

    interface DashboardData {
      stats: DashboardStats;
      recentActivity: Omit<ActivityItem, "timestamp">[];
      trainings: TrainingWithStats[];
    }

    const dashboardData: DashboardData = {
      stats: {
        totalTrainings,
        totalStudents,
        averageRating: Math.round(averageRating * 10) / 10,
        upcomingSessions,
      },
      recentActivity,
      trainings: (trainingsWithStats as TrainingWithStats[]).map((training) => ({
        ...training,
        duration: Number(training.duration_hours || 0),
        enrollment_count: Number(training.enrollment_count || 0),
        avg_rating: training.avg_rating ? Math.round(Number(training.avg_rating) * 10) / 10 : 0,
      })),
    }

    console.log("Dashboard data prepared:", {
      totalTrainings,
      totalStudents,
      averageRating,
      upcomingSessions,
      activitiesCount: recentActivity.length,
    })

    return NextResponse.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error("Instructor dashboard API error:", error)

    // Return fallback data to prevent complete failure
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalTrainings: 0,
          totalStudents: 0,
          averageRating: 0,
          upcomingSessions: 0,
        },
        recentActivity: [],
        trainings: [],
      },
    })
  }
}
