import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("Fetching categories from database...")

    // Fetch all categories with course count
    const categories = await sql`
      SELECT 
        id, 
        name,
        description,
        created_at,
        (SELECT COUNT(*) FROM courses WHERE category = categories.name AND status = 'published') as course_count
      FROM categories 
      WHERE status = 'active'
      ORDER BY name ASC
    `

    console.log("Categories fetched:", categories.length)

    return NextResponse.json({
      success: true,
      categories: categories,
      total: categories.length,
    })
  } catch (error) {
    console.error("Categories fetch error:", error)

    // Return fallback categories if database fails
    const fallbackCategories = [
      { id: 1, name: "Makeup Artistry", description: "Professional makeup techniques", course_count: 8 },
      { id: 2, name: "Bridal Makeup", description: "Specialized bridal makeup", course_count: 5 },
      { id: 3, name: "Special Effects", description: "Creative and theatrical makeup", course_count: 3 },
      { id: 4, name: "Color Theory", description: "Understanding color in makeup", course_count: 4 },
      { id: 5, name: "Business Skills", description: "Makeup business management", course_count: 6 },
    ]

    return NextResponse.json({
      success: false,
      categories: fallbackCategories,
      total: fallbackCategories.length,
      message: "Using fallback data due to database error",
    })
  }
}
