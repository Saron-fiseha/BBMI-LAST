import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "Item ID is required" }, { status: 400 })
    }

    // Fetch the single portfolio item that is 'published'
    const result = await sql`
      SELECT id, title, description, category, file_path, file_type, status, featured, created_at, updated_at
      FROM portfolio_items
      WHERE id = ${id} AND status = 'published'
    `

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Portfolio item not found or is not published",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      portfolioItem: result[0],
    })
  } catch (error) {
    console.error("Error fetching portfolio item:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch portfolio item",
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, description, category, file_path, file_type, status, featured } = body

    if (!title || !description || !category) {
      return NextResponse.json({ success: false, error: "Title, description and category are required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE portfolio_items
      SET title = ${title}, description = ${description}, category = ${category},
          file_path = ${file_path || null}, file_type = ${file_type || "image"}, status = ${status},
          featured = ${featured || false}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, description, category, file_path, file_type, status, featured, created_at, updated_at
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Portfolio item not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      portfolioItem: result[0],
      message: "Portfolio item updated successfully",
    })
  } catch (error) {
    console.error("Error updating portfolio item:", error)
    return NextResponse.json({ success: false, error: "Failed to update portfolio item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const existingItem = await sql`SELECT id, title FROM portfolio_items WHERE id = ${id}`

    if (existingItem.length === 0) {
      return NextResponse.json({ success: false, error: "Portfolio item not found" }, { status: 404 })
    }

    await sql`DELETE FROM portfolio_items WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      message: `Portfolio item "${existingItem[0].title}" deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting portfolio item:", error)
    return NextResponse.json({ success: false, error: "Failed to delete portfolio item" }, { status: 500 })
  }
}