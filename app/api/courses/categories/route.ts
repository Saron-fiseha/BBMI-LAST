import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("Fetching categories...")

    const categories = await sql`
      SELECT id, name, 
      (SELECT COUNT(*) FROM courses WHERE category = categories.name) as course_count
      FROM categories 
      ORDER BY name
    `

    console.log("Categories result:", categories)

    // If no categories found, return default categories
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        { id: 1, name: "Web Development", course_count: 5 },
        { id: 2, name: "Mobile Development", course_count: 3 },
        { id: 3, name: "Data Science", course_count: 4 },
        { id: 4, name: "Design", course_count: 2 },
        { id: 5, name: "Business", course_count: 3 },
      ]

      console.log("No categories found, returning defaults")
      return NextResponse.json({ categories: defaultCategories })
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Categories API error:", error)

    // Return default categories on error
    const defaultCategories = [
      { id: 1, name: "Technology", course_count: 8 },
      { id: 2, name: "Business", course_count: 5 },
      { id: 3, name: "Design", course_count: 3 },
      { id: 4, name: "Marketing", course_count: 4 },
    ]

    return NextResponse.json({ categories: defaultCategories })
  }
}
