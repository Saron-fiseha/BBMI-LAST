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
      return NextResponse.json({ error: "Unauthorized - Instructor access required" }, { status: 401 })
    }

    const instructorId = user.id
    console.log("Fetching reviews for instructor ID:", instructorId)

    try {
      // Get all reviews for instructor's courses with detailed information
      const reviews = await sql`
        SELECT 
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          r.instructor_reply,
          r.replied_at,
          u.full_name as student_name,
          u.profile_picture as student_avatar,
          t.name as training_name,
          t.id as training_id
        FROM reviews r
        JOIN trainings t ON r.training_id = t.id
        JOIN users u ON r.user_id = u.id
        WHERE t.instructor_id = ${instructorId}
        ORDER BY r.created_at DESC
      `

      console.log("Found reviews:", reviews.length)

      // Get comprehensive rating statistics
      const ratingStats = await sql`
        SELECT 
          AVG(r.rating)::NUMERIC(3,1) as avg_rating,
          COUNT(r.id) as total_reviews,
          COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star,
          COUNT(CASE WHEN r.rating = 4 THEN 1 END) as four_star,
          COUNT(CASE WHEN r.rating = 3 THEN 1 END) as three_star,
          COUNT(CASE WHEN r.rating = 2 THEN 1 END) as two_star,
          COUNT(CASE WHEN r.rating = 1 THEN 1 END) as one_star
        FROM reviews r
        JOIN trainings t ON r.training_id = t.id
        WHERE t.instructor_id = ${instructorId}
      `

      const stats = ratingStats[0] || {}
      const totalReviews = Number(stats.total_reviews || 0)

      // Format reviews with time calculations
      const formattedReviews = reviews.map((review: any) => ({
        id: review.id.toString(),
        student_name: review.student_name || "Anonymous Student",
        student_avatar: review.student_avatar,
        course_title: review.course_title || "Unknown Course",
        course_id: review.course_id,
        rating: Number(review.rating),
        comment: review.comment || "",
        created_at: review.created_at,
        instructor_reply: review.instructor_reply,
        replied_at: review.replied_at,
        time_ago: formatTimeAgo(new Date(review.created_at)),
      }))

      // Calculate rating distribution percentages
      const ratingDistribution = {
        5: totalReviews > 0 ? Math.round((Number(stats.five_star || 0) / totalReviews) * 100) : 0,
        4: totalReviews > 0 ? Math.round((Number(stats.four_star || 0) / totalReviews) * 100) : 0,
        3: totalReviews > 0 ? Math.round((Number(stats.three_star || 0) / totalReviews) * 100) : 0,
        2: totalReviews > 0 ? Math.round((Number(stats.two_star || 0) / totalReviews) * 100) : 0,
        1: totalReviews > 0 ? Math.round((Number(stats.one_star || 0) / totalReviews) * 100) : 0,
      }

      const responseData = {
        reviews: formattedReviews,
        stats: {
          total_reviews: totalReviews,
          average_rating: Number(Number(stats.avg_rating || 0).toFixed(1)),
          rating_distribution: ratingDistribution,
        },
      }

      console.log("Sending response:", {
        reviewCount: formattedReviews.length,
        avgRating: responseData.stats.average_rating,
        totalReviews: responseData.stats.total_reviews,
      })

      return NextResponse.json(responseData)
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Return empty data structure instead of mock data
      return NextResponse.json({
        reviews: [],
        stats: {
          total_reviews: 0,
          average_rating: 0,
          rating_distribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
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
      return NextResponse.json({ error: "Unauthorized - Instructor access required" }, { status: 401 })
    }

    const body = await request.json()
    const { review_id, reply } = body

    if (!review_id || !reply?.trim()) {
      return NextResponse.json({ error: "Review ID and reply content are required" }, { status: 400 })
    }

    try {
      // Verify the review belongs to one of the instructor's courses
      const reviewCheck = await sql`
        SELECT r.id 
        FROM reviews r
        JOIN trainings t ON r.training_id = t.id
        WHERE r.id = ${review_id} AND t.instructor_id = ${user.id}
      `

      if (reviewCheck.length === 0) {
        return NextResponse.json({ error: "Review not found or unauthorized" }, { status: 404 })
      }

      // Update the review with instructor reply
      await sql`
        UPDATE reviews 
        SET instructor_reply = ${reply.trim()}, replied_at = NOW()
        WHERE id = ${review_id}
      `

      console.log("Reply added to review:", review_id)
      return NextResponse.json({ message: "Reply added successfully" })
    } catch (dbError) {
      console.error("Database error when adding reply:", dbError)
      return NextResponse.json({ error: "Failed to add reply" }, { status: 500 })
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
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
