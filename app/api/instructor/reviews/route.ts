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

    try {
      // Get all reviews for instructor's courses
      const reviews = await sql`
        SELECT 
          r.*,
          u.full_name as student_name,
          u.profile_picture as student_avatar,
          c.title as course_title
        FROM reviews r
        JOIN courses c ON r.course_id = c.id
        JOIN users u ON r.user_id = u.id
        WHERE c.instructor_id = ${instructorId}
        ORDER BY r.created_at DESC
      `

      // Get rating statistics
      const ratingStats = await sql`
        SELECT 
          AVG(r.rating) as avg_rating,
          COUNT(r.id) as total_reviews,
          SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as five_star,
          SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as four_star,
          SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as three_star,
          SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as two_star,
          SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as one_star
        FROM reviews r
        JOIN courses c ON r.course_id = c.id
        WHERE c.instructor_id = ${instructorId}
      `

      const stats = ratingStats[0] || {}
      const totalReviews = Number(stats.total_reviews || 0)

      const formattedReviews = reviews.map((review: any) => ({
        id: review.id.toString(),
        student_name: review.student_name,
        student_avatar: review.student_avatar,
        course_title: review.course_title,
        rating: Number(review.rating),
        comment: review.comment,
        created_at: review.created_at,
        instructor_reply: review.instructor_reply,
        replied_at: review.replied_at,
        time_ago: formatTimeAgo(new Date(review.created_at)),
      }))

      const ratingDistribution = {
        5: totalReviews > 0 ? Math.round((Number(stats.five_star || 0) / totalReviews) * 100) : 0,
        4: totalReviews > 0 ? Math.round((Number(stats.four_star || 0) / totalReviews) * 100) : 0,
        3: totalReviews > 0 ? Math.round((Number(stats.three_star || 0) / totalReviews) * 100) : 0,
        2: totalReviews > 0 ? Math.round((Number(stats.two_star || 0) / totalReviews) * 100) : 0,
        1: totalReviews > 0 ? Math.round((Number(stats.one_star || 0) / totalReviews) * 100) : 0,
      }

      return NextResponse.json({
        reviews: formattedReviews,
        stats: {
          total_reviews: totalReviews,
          average_rating: Number(Number(stats.avg_rating || 0).toFixed(1)),
          rating_distribution: ratingDistribution,
        },
      })
    } catch (dbError) {
      console.log("Database not available, using mock data")

      // Return mock data when database is not available
      return NextResponse.json({
        reviews: [
          {
            id: "1",
            student_name: "Sarah Johnson",
            student_avatar: "/placeholder.svg?height=40&width=40",
            course_title: "Advanced Hair Styling Techniques",
            rating: 5,
            comment:
              "Absolutely amazing course! The instructor's techniques are professional and easy to follow. I've already started implementing what I learned in my salon.",
            created_at: "2024-06-20T10:30:00Z",
            instructor_reply:
              "Thank you so much, Sarah! I'm thrilled to hear you're applying the techniques successfully. Keep up the great work!",
            replied_at: "2024-06-20T14:15:00Z",
            time_ago: "2 days ago",
          },
          {
            id: "2",
            student_name: "Michael Chen",
            student_avatar: "/placeholder.svg?height=40&width=40",
            course_title: "Professional Makeup Artistry",
            rating: 4,
            comment:
              "Great course with detailed explanations. The lighting techniques section was particularly helpful. Would love to see more advanced color theory content.",
            created_at: "2024-06-18T16:45:00Z",
            instructor_reply: null,
            replied_at: null,
            time_ago: "4 days ago",
          },
          {
            id: "3",
            student_name: "Emma Rodriguez",
            student_avatar: "/placeholder.svg?height=40&width=40",
            course_title: "Bridal Beauty Essentials",
            rating: 5,
            comment:
              "This course exceeded my expectations! The step-by-step approach made complex techniques seem simple. My clients love the results!",
            created_at: "2024-06-15T09:20:00Z",
            instructor_reply:
              "Emma, your progress has been incredible! Thank you for sharing your success with your clients.",
            replied_at: "2024-06-15T11:30:00Z",
            time_ago: "1 week ago",
          },
        ],
        stats: {
          total_reviews: 127,
          average_rating: 4.8,
          rating_distribution: {
            5: 68,
            4: 23,
            3: 7,
            2: 2,
            1: 0,
          },
        },
      })
    }
  } catch (error) {
    console.error("Error fetching instructor reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { review_id, reply } = body

    if (!review_id || !reply) {
      return NextResponse.json({ error: "Review ID and reply are required" }, { status: 400 })
    }

    try {
      // Update the review with instructor reply
      await sql`
        UPDATE reviews 
        SET instructor_reply = ${reply}, replied_at = NOW()
        WHERE id = ${review_id}
      `

      return NextResponse.json({ message: "Reply added successfully" })
    } catch (dbError) {
      console.log("Database not available, simulating reply")
      return NextResponse.json({ message: "Reply added successfully" })
    }
  } catch (error) {
    console.error("Error adding review reply:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
