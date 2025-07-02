import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId } = await request.json()

    if (!userId || !courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID and Course ID are required",
        },
        { status: 400 },
      )
    }

    // Check if course is completed (100% progress)
    const enrollment = await sql`
      SELECT 
        enr.*,
        c.title as course_title,
        c.duration_hours,
        u.name as student_name,
        u.email as student_email
      FROM enrollments enr
      JOIN courses c ON enr.course_id = c.id
      JOIN users u ON enr.user_id = u.id
      WHERE enr.user_id = ${userId} 
        AND enr.course_id = ${courseId} 
        AND enr.progress = 100
        AND enr.status = 'completed'
    `

    if (enrollment.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Course must be 100% completed to generate certificate",
        },
        { status: 400 },
      )
    }

    // Check if certificate already exists
    const existingCertificate = await sql`
      SELECT * FROM certificates 
      WHERE user_id = ${userId} AND course_id = ${courseId}
    `

    if (existingCertificate.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Certificate already exists",
        certificate: existingCertificate[0],
      })
    }

    // Get course instructor information
    const courseInfo = await sql`
      SELECT 
        c.*,
        u.name as instructor_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ${courseId}
    `

    if (courseInfo.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        { status: 404 },
      )
    }

    // Generate unique certificate codes
    const timestamp = Date.now()
    const certificateCode = `BBMI-${courseId}-${userId}-${timestamp}`
    const verificationCode = `VER-${Math.random().toString(36).substring(2, 15).toUpperCase()}`

    // Create certificate record
    const newCertificate = await sql`
      INSERT INTO certificates (
        user_id, 
        course_id, 
        certificate_code, 
        verification_code, 
        instructor_name,
        issue_date
      )
      VALUES (
        ${userId}, 
        ${courseId}, 
        ${certificateCode}, 
        ${verificationCode}, 
        ${courseInfo[0].instructor_name || "BBMI Instructor"},
        NOW()
      )
      RETURNING *
    `

    // Update enrollment with certificate information
    await sql`
      UPDATE enrollments 
      SET 
        certificate_issued = true,
        certificate_date = NOW()
      WHERE user_id = ${userId} AND course_id = ${courseId}
    `

    return NextResponse.json({
      success: true,
      message: "Certificate generated successfully",
      certificate: newCertificate[0],
    })
  } catch (error) {
    console.error("Certificate generation error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate certificate",
      },
      { status: 500 },
    )
  }
}
