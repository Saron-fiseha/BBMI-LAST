import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("Fetching categories...")

    const categories = await sql`
      SELECT id, name, 
      (SELECT COUNT(*) FROM trainings WHERE category_id = categories.id) as course_count as course_count
      FROM categories 
      ORDER BY name
    `

    console.log("Categories result:", categories)

    

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Categories API error:", error)

    

    // return NextResponse.json({ categories: defaultCategories })
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
