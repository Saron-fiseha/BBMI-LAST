import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const verificationCode = decodeURIComponent(params.code)

    // Query the database for the certificate
    const certificates = await sql`
      SELECT 
        c.*,
        u.name as student_name,
        co.title as course_title,
        co.category as course_category,
        co.level as course_level,
        i.name as instructor_name
      FROM certificates c
      JOIN users u ON c.user_id = u.id
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN instructors i ON co.instructor_id = i.id
      WHERE c.verification_code = ${verificationCode}
      LIMIT 1
    `

    if (certificates.length === 0) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    const certificate = certificates[0]

    // Return certificate verification data
    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        student_name: certificate.student_name,
        course_title: certificate.course_title,
        course_category: certificate.course_category,
        course_level: certificate.course_level,
        instructor_name: certificate.instructor_name,
        completion_date: certificate.completion_date,
        issue_date: certificate.issue_date,
        certificate_code: certificate.certificate_code,
        verification_code: certificate.verification_code,
        grade: certificate.grade,
        duration_hours: certificate.duration_hours,
        verified: true,
        verification_date: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Certificate verification error:", error)
    return NextResponse.json(
      {
        error: "Verification failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
