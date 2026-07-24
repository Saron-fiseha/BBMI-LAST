import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || ""
    const role = searchParams.get("role") || "all"
    const status = searchParams.get("status") || "all"

    let query = sql`
      SELECT full_name, email, phone, age, sex, role, status, created_at
      FROM users
      WHERE 1=1
    `

    if (search) {
      query = sql`
        ${query}
        AND (full_name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`})
      `
    }
    if (role !== "all") {
      query = sql`
        ${query}
        AND role = ${role}
      `
    }
    if (status !== "all") {
      query = sql`
        ${query}
        AND status = ${status}
      `
    }

    query = sql`
      ${query}
      ORDER BY created_at DESC
    `

    const users = await query

    // Create CSV content
    const headers = ["Name", "Email", "Phone", "Age", "Gender", "Role", "Status", "Join Date"]
    const csvContent = [
      headers.join(","),
      ...users.map((user: any) =>
        [
          `"${user.full_name || user.name || ""}"`,
          `"${user.email || ""}"`,
          `"${user.phone || ""}"`,
          `"${user.age || ""}"`,
          `"${user.sex || user.gender || ""}"`,
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
        "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().split("T")[0]}.csv"`,
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

