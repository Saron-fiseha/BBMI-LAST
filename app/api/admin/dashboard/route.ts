// import { NextResponse } from "next/server"
// import { neon } from "@neondatabase/serverless"

// const sql = neon(process.env.DATABASE_URL!)

// export async function GET() {
//   try {
//     // Get total counts
//     const totalStudents = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`
//     const totalInstructors = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'instructor'`
//     const totalCourses = await sql`SELECT COUNT(*) as count FROM trainings WHERE status = 'active'`
//     const totalEnrollments = await sql`SELECT COUNT(*) as count FROM enrollments`

//     // Get revenue data
//     const revenue = await sql`
//       SELECT SUM(payment_amount) as total_revenue 
//       FROM enrollments 
//       WHERE payment_status = 'completed'
//     `

//     // Get monthly data
//     const monthlyData = await sql`
//       SELECT 
//         DATE_TRUNC('month', enrolled_at) as month,
//         COUNT(*) as students,
//         SUM(payment_amount) as revenue
//       FROM enrollments
//       WHERE enrolled_at >= CURRENT_DATE - INTERVAL '12 months'
//       GROUP BY DATE_TRUNC('month', enrolled_at)
//       ORDER BY month
//     `

//     // Get course distribution
//     // const courseDistribution = await sql`
//     //   SELECT 
//     //     c.title,
//     //     COUNT(e.id) as students,
//     //     c.price
//     //   FROM courses c
//     //   LEFT JOIN enrollments e ON c.id = e.course_id
//     //   GROUP BY c.id, c.title, c.price
//     //   ORDER BY students DESC
//     //   LIMIT 10
//     // `
//     const courseDistribution = await sql`
//       SELECT 
//         t.name,
//         COUNT(e.id) as students,
//         t.price
//       FROM trainings t
//       LEFT JOIN enrollments e ON t.id = e.training_id
//       GROUP BY t.id, t.name, t.price
//       ORDER BY students DESC
//       LIMIT 10
//     `

//     // Get category stats
//     const categoryStats = await sql`
//       SELECT 
//         cat.name,
//         COUNT(t.id) as courses,
//         COUNT(m.id) as modules
//       FROM categories cat
//       LEFT JOIN trainings t ON cat.id = t.category_id
//       LEFT JOIN modules m ON t.id = m.training_id
//       GROUP BY cat.id, cat.name
//       ORDER BY courses DESC
//     `

//     return NextResponse.json({
//       stats: {
//         totalStudents: Number.parseInt(totalStudents[0].count),
//         totalInstructors: Number.parseInt(totalInstructors[0].count),
//         totalCourses: Number.parseInt(totalCourses[0].count),
//         totalEnrollments: Number.parseInt(totalEnrollments[0].count),
//         totalRevenue: Number.parseFloat(revenue[0].total_revenue || 0),
//       },
//       monthlyData,
//       courseDistribution,
//       categoryStats,
//     })
//   } catch (error) {
//     console.error("Admin dashboard error:", error)
//     return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
//   }
// }
import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get total counts
    const totalStudents = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`
    const totalInstructors = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'instructor'`
    const totalTrainings = await sql`SELECT COUNT(*) as count FROM trainings WHERE status = 'active'` // Changed to trainings
    const totalEnrollments = await sql`SELECT COUNT(*) as count FROM enrollments`
    const totalCategories = await sql`SELECT COUNT(*) as count FROM categories` // New stat
    const totalModules = await sql`SELECT COUNT(*) as count FROM modules` // New stat

    // Get revenue data
    const revenue = await sql`
      SELECT SUM(payment_amount) as total_revenue 
      FROM enrollments 
      WHERE payment_status = 'completed'
    `

    // Get monthly data for students and revenue
    const monthlyData = await sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', enrolled_at), 'Mon') as month, -- Format to short month name
        COUNT(id) as students,
        SUM(CASE WHEN payment_status = 'completed' THEN payment_amount ELSE 0 END) as revenue
      FROM enrollments
      WHERE enrolled_at >= CURRENT_DATE - INTERVAL '6 months' -- Adjust interval as needed
      GROUP BY DATE_TRUNC('month', enrolled_at)
      ORDER BY DATE_TRUNC('month', enrolled_at)
    `

    // Get course distribution (students per training for Pie Chart)
    let studentsPerTrainingDistribution = await sql`
  SELECT 
    t.name,
    COUNT(DISTINCT e.user_id) as students
  FROM trainings t
  LEFT JOIN enrollments e 
    ON t.id = e.training_id
  GROUP BY t.id, t.name
  HAVING COUNT(DISTINCT e.user_id) > 0
  ORDER BY students DESC
`

// If no trainings have enrollments, return a fallback row
if (studentsPerTrainingDistribution.length === 0) {
  studentsPerTrainingDistribution = [{ name: "No enrollments yet", students: 1 }]
}



    // Get category stats (modules and trainings by category for Bar Chart)
    const categoryStats = await sql`
      SELECT 
        cat.name,
        COUNT(DISTINCT t.id) as trainings_count, -- Count distinct trainings
        COUNT(m.id) as modules_count
      FROM categories cat
      LEFT JOIN trainings t ON cat.id = t.category_id
      LEFT JOIN modules m ON t.id = m.training_id
      GROUP BY cat.id, cat.name
      ORDER BY trainings_count DESC
    `

    return NextResponse.json({
      stats: {
        totalStudents: Number.parseInt(totalStudents[0]?.count || '0'),
        totalInstructors: Number.parseInt(totalInstructors[0]?.count || '0'),
        totalTrainings: Number.parseInt(totalTrainings[0]?.count || '0'), // Updated stat
        totalEnrollments: Number.parseInt(totalEnrollments[0]?.count || '0'),
        totalCategories: Number.parseInt(totalCategories[0]?.count || '0'), // New stat
        totalModules: Number.parseInt(totalModules[0]?.count || '0'), // New stat
        totalRevenue: Number.parseFloat(revenue[0]?.total_revenue || '0'),
      },
      monthlyData: monthlyData.map(row => ({
        month: row.month,
        students: Number.parseInt(row.students || '0'),
        revenue: Number.parseFloat(row.revenue || '0'),
      })),
      studentsPerTrainingDistribution: studentsPerTrainingDistribution.map(row => ({
        name: row.name,
        students: Number.parseInt(row.students || '0'),
      })),
      categoryOverviewData: categoryStats.map(row => ({
        name: row.name,
        trainings: Number.parseInt(row.trainings_count || '0'),
        modules: Number.parseInt(row.modules_count || '0'),
      })),
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}