import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || ""
    const status = searchParams.get("status") || "all"
    const gender = searchParams.get("gender") || searchParams.get("sex") || "all"

    console.log("Exporting students with filters:", { search, status, gender })

    let query = sql`
      SELECT 
        s.roll_number,
        s.id_number,
        u.full_name as name,
        u.email,
        COALESCE(u.phone, '') as phone,
        COALESCE(u.age, 0) as age,
        COALESCE(u.sex, '') as gender,
        COUNT(DISTINCT e.training_id) AS courses_enrolled,
        COUNT(DISTINCT e.training_id) FILTER (WHERE e.status = 'completed') AS courses_completed,
        ROUND(COALESCE(SUM(mp.time_spent_minutes), 0)::numeric / 60.0, 1) AS total_hours,
        s.status,
        s.join_date,
        s.last_active
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN enrollments e ON u.id = e.user_id
      LEFT JOIN module_progress mp ON u.id = mp.user_id
      WHERE u.role = 'student'
    `

    if (search) {
      query = sql`
        ${query}
        AND (u.full_name ILIKE ${`%${search}%`} OR u.email ILIKE ${`%${search}%`})
      `
    }
    if (status !== "all") {
      query = sql`
        ${query}
        AND s.status = ${status}
      `
    }
    if (gender !== "all") {
      query = sql`
        ${query}
        AND u.sex = ${gender}
      `
    }

    query = sql`
      ${query}
      GROUP BY s.id, s.roll_number, s.id_number, u.full_name, u.email, u.phone, u.age, u.sex, s.join_date, s.last_active, s.status
      ORDER BY s.roll_number ASC
    `

    const students = await query

    // Generate CSV content
    const csvHeaders = [
      "Roll Number",
      "ID Number",
      "Name",
      "Email",
      "Phone",
      "Age",
      "Gender",
      "Courses Enrolled",
      "Courses Completed",
      "Total Hours",
      "Status",
      "Join Date",
      "Last Active",
    ]

    const csvRows = students.map((student: any) => [
      student.roll_number || "",
      student.id_number || "",
      student.name || "",
      student.email || "",
      student.phone || "",
      student.age || "",
      student.gender || "",
      student.courses_enrolled || 0,
      student.courses_completed || 0,
      student.total_hours || 0,
      student.status || "",
      student.join_date ? new Date(student.join_date).toLocaleDateString() : "",
      student.last_active ? new Date(student.last_active).toLocaleDateString() : "",
    ])

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field: any) => `"${field}"`).join(",")).join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="students-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Students export error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export students",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
