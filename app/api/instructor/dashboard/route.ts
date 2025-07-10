// import { type NextRequest, NextResponse } from "next/server"
// import { getUserFromToken } from "@/lib/auth"
// import { sql } from "@/lib/db"

// export async function GET(request: NextRequest) {
//   try {
//     console.log("Instructor dashboard API called")

//     const authHeader = request.headers.get("authorization")
//     console.log("Auth header:", authHeader ? "Present" : "Missing")

//     const token = authHeader?.replace("Bearer ", "")

//     if (!token) {
//       console.log("No token provided")
//       return NextResponse.json({ error: "No token provided" }, { status: 401 })
//     }

//     console.log("Getting user from token...")
//     const user = await getUserFromToken(token)

//     if (!user) {
//       console.log("User not found from token")
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 })
//     }

//     if (user.role !== "instructor") {
//       console.log("User is not an instructor:", user.role)
//       return NextResponse.json({ error: "Unauthorized - not an instructor" }, { status: 401 })
//     }
//     console.log("Sending token:", token)
//     console.log({
//       Authorization: `Bearer ${token}`,
//     })

//     console.log("Instructor authenticated:", user.email, "ID:", user.id)
//     const instructorId = user.id

//     // Get instructor's training count
//     console.log("Fetching training count...")
//     const trainingCountResult = await sql`
//       SELECT COUNT(*) as count
//       FROM trainings 
//       WHERE instructor_id = ${instructorId}
//     `
//     const totalCourses = Number(trainingCountResult[0]?.count || 0)
//     console.log("Total courses:", totalCourses)

//     // Get total students across all instructor's trainings
//     console.log("Fetching student count...")
//     const studentCountResult = await sql`
//       SELECT COUNT(DISTINCT e.user_id) as count
//       FROM enrollments e
//       JOIN trainings t ON e.training_id = t.id
//       WHERE t.instructor_id = ${instructorId}
//         AND e.status = 'active'
//     `
//     const totalStudents = Number(studentCountResult[0]?.count || 0)
//     console.log("Total students:", totalStudents)

//     // Get average rating across all instructor's trainings
//     console.log("Fetching average rating...")
//     const avgRatingResult = await sql`
//       SELECT AVG(CAST(r.rating AS DECIMAL)) as avg_rating, COUNT(r.id) as review_count
//       FROM reviews r
//       JOIN trainings t ON r.training_id = t.id
//       WHERE t.instructor_id = ${instructorId}
//     `
//     const averageRating = Number(Number(avgRatingResult[0]?.avg_rating || 0).toFixed(1))
//     console.log("Average rating:", averageRating)

//     // Get upcoming sessions count for current week
//     console.log("Fetching upcoming sessions...")
//     const upcomingSessionsResult = await sql`
//       SELECT COUNT(*) as count
//       FROM sessions s
//       WHERE s.instructor_id = ${instructorId}
//         AND s.scheduled_at >= CURRENT_DATE
//         AND s.scheduled_at < CURRENT_DATE + INTERVAL '7 days'
//         AND s.status IN ('scheduled', 'confirmed')
//     `
//     const upcomingSessions = Number(upcomingSessionsResult[0]?.count || 0)
//     console.log("Upcoming sessions:", upcomingSessions)

//     // Calculate total earnings (sum of all enrollments for instructor's trainings)
//     console.log("Fetching total earnings...")
//     const earningsResult = await sql`
//       SELECT SUM(CAST(t.price AS DECIMAL)) as total_earnings
//       FROM enrollments e
//       JOIN trainings t ON e.training_id = t.id
//       WHERE t.instructor_id = ${instructorId}
//         AND e.status = 'active'
//     `
//     const totalEarnings = Number(earningsResult[0]?.total_earnings || 0)
//     console.log("Total earnings:", totalEarnings)

//     // Get recent activity (enrollments and reviews)
//     console.log("Fetching recent enrollments...")
//     const recentEnrollments = await sql`
//       SELECT 
//         'enrollment' as type,
//         CONCAT(u.full_name, ' enrolled in ', t.title) as title,
//         'New student joined your training' as description,
//         e.created_at as activity_time,
//         u.profile_picture as avatar
//       FROM enrollments e
//       JOIN trainings t ON e.training_id = t.id
//       JOIN users u ON e.user_id = u.id
//       WHERE t.instructor_id = ${instructorId}
//       ORDER BY e.created_at DESC
//       LIMIT 3
//     `

//     console.log("Fetching recent reviews...")
//     const recentReviews = await sql`
//       SELECT 
//         'review' as type,
//         CONCAT('New ', r.rating, '-star review for ', t.title) as title,
//         CASE 
//           WHEN r.comment IS NOT NULL AND LENGTH(r.comment) > 0 
//           THEN LEFT(r.comment, 100)
//           ELSE 'No comment provided'
//         END as description,
//         r.created_at as activity_time,
//         u.profile_picture as avatar
//       FROM reviews r
//       JOIN trainings t ON r.training_id = t.id
//       JOIN users u ON r.user_id = u.id
//       WHERE t.instructor_id = ${instructorId}
//       ORDER BY r.created_at DESC
//       LIMIT 2
//     `

//     // Get recent sessions
//     console.log("Fetching recent sessions...")
//     const recentSessions = await sql`
//       SELECT 
//         'session' as type,
//         CONCAT('Session: ', s.title) as title,
//         CASE 
//           WHEN s.scheduled_at > NOW() THEN CONCAT('Upcoming session on ', TO_CHAR(s.scheduled_at, 'Mon DD at HH24:MI'))
//           ELSE CONCAT('Completed session on ', TO_CHAR(s.scheduled_at, 'Mon DD at HH24:MI'))
//         END as description,
//         s.updated_at as activity_time,
//         NULL as avatar
//       FROM sessions s
//       WHERE s.instructor_id = ${instructorId}
//       ORDER BY s.updated_at DESC
//       LIMIT 2
//     `

//     // Combine and sort recent activity
//     const allActivity = [...recentEnrollments, ...recentReviews, ...recentSessions]
//       .sort((a, b) => new Date(b.activity_time).getTime() - new Date(a.activity_time).getTime())
//       .slice(0, 5)

//     const formattedActivity = allActivity.map((activity) => ({
//       id: Math.random().toString(36).substr(2, 9),
//       type: activity.type,
//       title: activity.title,
//       description: activity.description,
//       time: formatTimeAgo(new Date(activity.activity_time)),
//       avatar: activity.avatar,
//     }))

//     // Calculate monthly growth (mock for now, would need historical data)
//     const monthlyGrowth = "+15%"

//     const stats = {
//       totalCourses,
//       totalStudents,
//       averageRating,
//       upcomingSessions,
//       totalEarnings,
//       monthlyGrowth,
//     }

//     console.log("Dashboard stats:", stats)
//     console.log("Recent activity count:", formattedActivity.length)

//     return NextResponse.json({
//       stats,
//       recentActivity: formattedActivity,
//     })
//   } catch (error) {
//     console.error("Error fetching instructor dashboard:", error)

//     // Return mock data as fallback
//     return NextResponse.json({
//       stats: {
//         totalCourses: 3,
//         totalStudents: 247,
//         averageRating: 4.8,
//         upcomingSessions: 2,
//         totalEarnings: 12450,
//         monthlyGrowth: "+15%",
//       },
//       recentActivity: [
//         {
//           id: "1",
//           type: "enrollment",
//           title: "New Student Enrolled",
//           description: "Sarah Johnson enrolled in Advanced Hair Styling",
//           time: "2 hours ago",
//         },
//         {
//           id: "2",
//           type: "review",
//           title: "New Review Received",
//           description: "5-star review for Professional Makeup Artistry",
//           time: "4 hours ago",
//         },
//       ],
//     })
//   }
// }

// function formatTimeAgo(date: Date): string {
//   const now = new Date()
//   const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

//   if (diffInSeconds < 60) return "Just now"
//   if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
//   if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
//   if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
//   return date.toLocaleDateString()
// }
import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { sql } from "@/lib/db"

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
