// C:\Users\Hp\Documents\BBMI-LMS\app\api\certificates\student\route.ts
import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

  if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', certificates: [], total: 0 },
        { status: 400 }
      );
    }

    // Fetch certificates with detailed course and enrollment information
  const certificates = await sql`
  SELECT 
    cert.id,
    cert.user_id,
    cert.training_id,
    cert.training_name as course_title,
    cert.certificate_number, -- <-- DIRECTLY USING NEW COLUMN NAME
    cert.verification_code,
    cert.issue_date,
    cert.instructor_name,
    t.category_id as course_category,
    t.level as course_level,
    t.duration,
    u.full_name as student_name,
    u.email as student_email,
    enr.certificate_issued_at, -- <-- DIRECTLY USING NEW COLUMN NAME
    enr.progress,
    enr.grade,
    
    -- Calculate modules information
    (SELECT COUNT(*) FROM modules WHERE training_id = t.id) as total_modules,
    (SELECT COUNT(DISTINCT mp.module_id) 
     FROM module_progress mp 
     JOIN modules m ON mp.module_id = m.id 
     WHERE mp.user_id = ${userId} AND m.training_id = t.id AND mp.completed = true
    ) as completed_modules,
    
    -- Get skills/topics covered
    COALESCE(
      (SELECT array_agg(DISTINCT m.name) 
       FROM modules m 
       WHERE m.training_id = t.id
      ), 
      ARRAY[]::text[]
    ) as skills_learned
    
  FROM certificates cert
  JOIN trainings t ON cert.training_id = t.id
  JOIN users u ON cert.user_id = u.id
  JOIN enrollments enr ON enr.user_id = cert.user_id AND enr.training_id = cert.training_id
  WHERE cert.user_id = ${userId}
  ORDER BY cert.issue_date DESC
`

    // Format the certificates data
    const formattedCertificates = certificates.map((cert) => ({
      ...cert,
      verification_url: `${process.env.NEXT_PUBLIC_APP_URL}/verify/${cert.verification_code}`,
      skills_learned: cert.skills_learned || [],
    }))

    return NextResponse.json({
      certificates: formattedCertificates,
      total: formattedCertificates.length,
    })
  } catch (error) {
    console.error("Student certificates error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch certificates",
        certificates: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}