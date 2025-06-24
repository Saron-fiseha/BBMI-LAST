import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Fetch all users for export
    const users = await sql`
      SELECT full_name, email, phone, age, sex, role, status, created_at
      FROM users 
      ORDER BY created_at DESC
    `

    // Create CSV content
    const headers = ["Name", "Email", "Phone", "Age", "Gender", "Role", "Status", "Join Date"]
    const csvContent = [
      headers.join(","),
      ...users.map((user: { name: any; email: any; phone: any; age: any; gender: any; role: any; status: any; created_at: string | number | Date }) =>
        [
          `"${user.name || ""}"`,
          `"${user.email || ""}"`,
          `"${user.phone || ""}"`,
          `"${user.age || ""}"`,
          `"${user.gender || ""}"`,
          `"${user.role || ""}"`,
          `"${user.status || ""}"`,
          `"${user.created_at ? new Date(user.created_at).toLocaleDateString() : ""}"`,
        ].join(","),
      ),
    ].join("\n")

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="users-export.csv"',
      },
    })
  } catch (error) {
    console.error("Error exporting users:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export users",
      },
      { status: 500 },
    )
  }
}
