import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    console.log("Auth header:", authHeader)

    if (!authHeader) {
      console.log("No authorization header provided")
      return NextResponse.json({ error: "No authorization header provided" }, { status: 401 })
    }

    // Extract token
    const token = authHeader.replace("Bearer ", "")
    console.log("Extracted token:", token ? "Token present" : "No token")

    if (!token) {
      console.log("No token in authorization header")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Get user from token
    console.log("Attempting to get user from token...")
    const user = await getUserFromToken(token)
    console.log("User from token:", user ? { id: user.id, role: user.role } : "No user found")

    if (!user) {
      console.log("Invalid token - no user found")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (user.role !== "instructor") {
      console.log("User role is not instructor:", user.role)
      return NextResponse.json({ error: "Access denied - instructor role required" }, { status: 403 })
    }

    const instructorId = user.id
    console.log("Fetching trainings for instructor ID:", instructorId)

    // Define the training type based on your database schema
    type TrainingRow = {
      id: number | string
      title: string
      description: string
      instructor_id: string
      duration_hours: number
      price: number
      level: string
      status: string
      thumbnail_url?: string
      created_at: string
      updated_at: string
      student_count?: number
      avg_rating?: number
      review_count?: number
    }

    // Get instructor's trainings with enrollment and rating data
    const trainings = await sql<TrainingRow[]>`
      SELECT 
        t.*,
        COALESCE(enrollment_stats.student_count, 0) as student_count,
        COALESCE(rating_stats.avg_rating, 0) as avg_rating,
        COALESCE(rating_stats.review_count, 0) as review_count
      FROM trainings t
      LEFT JOIN (
        SELECT 
          training_id, 
          COUNT(*) as student_count
        FROM enrollments
        WHERE status = 'active'
        GROUP BY training_id
      ) enrollment_stats ON t.id = enrollment_stats.training_id
      LEFT JOIN (
        SELECT 
          training_id,
          AVG(rating) as avg_rating,
          COUNT(*) as review_count
        FROM reviews
        WHERE training_id IS NOT NULL
        GROUP BY training_id
      ) rating_stats ON t.id = rating_stats.training_id
      WHERE t.instructor_id = ${instructorId}
      ORDER BY t.created_at DESC
    `

    console.log("Found trainings:", trainings.length)

    // Format the response to match what the frontend expects
    const formattedCourses = trainings.map((training: TrainingRow) => {
      const students = Number(training.student_count || 0)
      const price = Number(training.price || 0)
      const earnings = price * students

      return {
        id: training.id.toString(),
        title: training.title,
        description: training.description,
        students: students,
        rating: Number(Number(training.avg_rating || 0).toFixed(1)),
        review_count: Number(training.review_count || 0),
        earnings: `$${earnings.toLocaleString()}`,
        image: training.thumbnail_url || `/placeholder.svg?height=200&width=300`,
        status: training.status || "draft",
        price: price,
        duration: Number(training.duration_hours || 0) * 60, // Convert hours to minutes for display
        level: training.level || "beginner",
        created_at: training.created_at,
        updated_at: training.updated_at,
      }
    })

    return NextResponse.json(formattedCourses)
  } catch (error) {
    console.error("Error fetching instructor trainings:", error)

    // Check if it's a database connection error
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }

    // Return error response for debugging
    return NextResponse.json(
      {
        error: "Failed to fetch trainings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}



// import { type NextRequest, NextResponse } from "next/server"
// import { getUserFromToken } from "@/lib/auth"
// import { sql } from "@/lib/db"

// export async function GET(request: NextRequest) {
//   try {
//     const token = request.headers.get("authorization")?.replace("Bearer ", "")

//     if (!token) {
//       return NextResponse.json({ error: "No token provided" }, { status: 401 })
//     }

//     const user = await getUserFromToken(token)
//     if (!user || user.role !== "instructor") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const instructorId = user.id

//     // Define the course type
//     type CourseRow = {
//       id: number | string;
//       title: string;
//       description: string;
//       students: number;
//       rating: number;
//       review_count: number;
//       earnings_amount: number;
//       thumbnail_url?: string;
//       status?: string;
//       price: number;
//       duration?: number;
//       level?: string;
//       created_at: string;
//       updated_at: string;
//     };

//     // Get instructor's courses with enrollment and rating data
//     const courses = await sql<CourseRow[]>`
//       SELECT 
//         c.*,
//         COALESCE(enrollment_stats.student_count, 0) as students,
//         COALESCE(rating_stats.avg_rating, 0) as rating,
//         COALESCE(rating_stats.review_count, 0) as review_count,
//         COALESCE(c.price * enrollment_stats.student_count, 0) as earnings_amount
//       FROM courses c
//       LEFT JOIN (
//         SELECT 
//           course_id, 
//           COUNT(*) as student_count
//         FROM enrollments
//         WHERE status = 'active'
//         GROUP BY course_id
//       ) enrollment_stats ON c.id = enrollment_stats.course_id
//       LEFT JOIN (
//         SELECT 
//           course_id,
//           AVG(rating) as avg_rating,
//           COUNT(*) as review_count
//         FROM reviews
//         GROUP BY course_id
//       ) rating_stats ON c.id = rating_stats.course_id
//       WHERE c.instructor_id = ${instructorId}
//       ORDER BY c.created_at DESC
//     `;

//     // Format the response
//     const formattedCourses = courses.map((course: CourseRow) => ({
//       id: course.id.toString(),
//       title: course.title,
//       description: course.description,
//       students: Number(course.students || 0),
//       rating: Number(Number(course.rating || 0).toFixed(1)),
//       review_count: Number(course.review_count || 0),
//       earnings: `$${(course.earnings_amount || 0).toLocaleString()}`,
//       image: course.thumbnail_url || `/placeholder.svg?height=200&width=300`,
//       status: course.status || "draft",
//       price: Number(course.price || 0),
//       duration: Number(course.duration || 0),
//       level: course.level || "beginner",
//       created_at: course.created_at,
//       updated_at: course.updated_at,
//     }))

//     return NextResponse.json(formattedCourses)
//   } catch (error) {
//     console.error("Error fetching instructor courses:", error)

//     // Return mock data as fallback
//     return NextResponse.json([
//       {
//         id: "1",
//         title: "Advanced Hair Styling Techniques",
//         description: "Master advanced hair styling techniques for professional results",
//         students: 324,
//         rating: 4.8,
//         review_count: 45,
//         earnings: "$9,720",
//         image: "/placeholder.svg?height=200&width=300",
//         status: "published",
//         price: 299,
//         duration: 120,
//         level: "advanced",
//         created_at: "2024-01-15",
//         updated_at: "2024-06-20",
//       },
//     ])
//   }
// }
