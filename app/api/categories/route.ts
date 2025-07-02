import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const categories = await sql`
      SELECT id, name, description, created_at
      FROM categories 
      WHERE active = true
      ORDER BY name ASC
    `

    return NextResponse.json({
      success: true,
      categories: categories || [],
    })
  } catch (error) {
    console.error("Categories fetch error:", error)

    // Return mock data as fallback
    const mockCategories = [
      { id: 1, name: "Bridal Makeup", description: "Professional bridal makeup techniques" },
      { id: 2, name: "Color Theory", description: "Understanding color in makeup artistry" },
      { id: 3, name: "Special Effects", description: "Creative and dramatic makeup effects" },
      { id: 4, name: "Fashion Makeup", description: "Editorial and runway makeup styles" },
      { id: 5, name: "Airbrush Makeup", description: "Professional airbrush techniques" },
    ]

    return NextResponse.json({
      success: true,
      categories: mockCategories,
    })
  }
}
