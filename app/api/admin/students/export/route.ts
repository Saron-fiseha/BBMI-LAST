import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || ""
    const status = searchParams.get("status") || "all"
    const gender = searchParams.get("sex") || "all"

    console.log("Exporting students with filters:", { search, status, gender })

    let students

    // Apply the same filters as the main GET route
    if (search && status !== "all" && gender !== "all") {
      students = await sql`
        SELECT 
          s.roll_number,
          s.id_number,
          u.full_name,
          u.email,
          u.phone,
          u.age,
          u.sex,
          s.courses_enrolled,
          s.courses_completed,
          s.total_hours,
          s.status,
          s.join_date,
          s.last_active
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.role = 'student'
          AND (u.full_name ILIKE ${`%${search}%`} OR u.email ILIKE ${`%${search}%`})
          AND s.status = ${status}
          AND u.sex = ${gender}
        ORDER BY s.roll_number ASC
      `
    } else if (search && status !== "all") {
      students = await sql`
        SELECT 
          s.roll_number,
          s.id_number,
          u.full_name,
          u.email,
          u.phone,
          u.age,
          u.sex,
          s.courses_enrolled,
          s.courses_completed,
          s.total_hours,
          s.status,
          s.join_date,
          s.last_active
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.role = 'student'
          AND (u.full_name ILIKE ${`%${search}%`} OR u.email ILIKE ${`%${search}%`})
          AND s.status = ${status}
        ORDER BY s.roll_number ASC
      `
    } else if (search && gender !== "all") {
      students = await sql`
        SELECT 
          s.roll_number,
          s.id_number,
          u.full_name,
          u.email,
          u.phone,
          u.age,
          u.sex,
          s.courses_enrolled,
          s.courses_completed,
          s.total_hours,
          s.status,
          s.join_date,
          s.last_active
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.role = 'student'
          AND (u.full_name ILIKE ${`%${search}%`} OR u.email ILIKE ${`%${search}%`})
          AND u.sex = ${gender}
        ORDER BY s.roll_number ASC
      `
    } else if (status !== "all" && gender !== "all") {
      students = await sql`
        SELECT 
          s.roll_number,
          s.id_number,
          u.full_name,
          u.email,
          u.phone,
          u.age,
          u.sex,
          s.courses_enrolled,
          s.courses_completed,
          s.total_hours,
          s.status,
          s.join_date,
          s.last_active
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.role = 'student'
          AND s.status = ${status}
          AND u.sex = ${gender}
        ORDER BY s.roll_number ASC
      `
    } else if (search) {
      students = await sql`
        SELECT 
          s.roll_number,
          s.id_number,
          u.full_name,
          u.email,
          u.phone,
          u.age,
          u.sex,
          s.courses_enrolled,
          s.courses_completed,
          s.total_hours,
          s.status,
          s.join_date,
          s.last_active
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.role = 'student'
          AND (u.full_name ILIKE ${`%${search}%`} OR u.email ILIKE ${`%${search}%`})
        ORDER BY s.roll_number ASC
      `
    } else if (status !== "all") {
      students = await sql`
        SELECT 
          s.roll_number,
          s.id_number,
          u.full_name,
          u.email,
          u.phone,
          u.age,
          u.sex,
          s.courses_enrolled,
          s.courses_completed,
          s.total_hours,
          s.status,
          s.join_date,
          s.last_active
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.role = 'student'
          AND s.status = ${status}
        ORDER BY s.roll_number ASC
      `
    } else if (gender !== "all") {
      students = await sql`
        SELECT 
          s.roll_number,
          s.id_number,
          u.full_name,
          u.email,
          u.phone,
          u.age,
          u.sex,
          s.courses_enrolled,
          s.courses_completed,
          s.total_hours,
          s.status,
          s.join_date,
          s.last_active
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.role = 'student'
          AND u.sex = ${gender}
        ORDER BY s.roll_number ASC
      `
    } else {
      students = await sql`
        SELECT 
          s.roll_number,
          s.id_number,
          u.full_name,
          u.email,
          u.phone,
          u.age,
          u.sex,
          s.courses_enrolled,
          s.courses_completed,
          s.total_hours,
          s.status,
          s.join_date,
          s.last_active
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.role = 'student'
        ORDER BY s.roll_number ASC
      `
    }

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

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

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
