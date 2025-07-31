import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

// GET - Fetch portfolio items with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || "all"
    const status = searchParams.get("status") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    console.log("🔍 Fetching portfolio items with params:", { search, category, status, page, limit })

    // Build count query using tagged template
    let countQuery = sql`
      SELECT COUNT(*) as total 
      FROM portfolio_items 
      WHERE 1=1
    `

    if (search) {
      countQuery = sql`
        ${countQuery}
        AND (title ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})
      `
    }

    if (category !== "all") {
      countQuery = sql`
        ${countQuery}
        AND category = ${category}
      `
    }

    if (status !== "all") {
      countQuery = sql`
        ${countQuery}
        AND status = ${status}
      `
    }

    const totalResult = await countQuery
    const total = Number.parseInt(totalResult[0].total)
    const totalPages = Math.ceil(total / limit)

    // Build main query using tagged template
    let mainQuery = sql`
      SELECT 
        id, title, description, category, file_path, file_type, status, featured, created_at, updated_at
      FROM portfolio_items 
      WHERE 1=1
    `

    if (search) {
      mainQuery = sql`
        ${mainQuery}
        AND (title ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})
      `
    }

    if (category !== "all") {
      mainQuery = sql`
        ${mainQuery}
        AND category = ${category}
      `
    }

    if (status !== "all") {
      mainQuery = sql`
        ${mainQuery}
        AND status = ${status}
      `
    }

    // Add pagination
    mainQuery = sql`
      ${mainQuery}
      ORDER BY created_at DESC 
      LIMIT ${limit} 
      OFFSET ${offset}
    `

    const portfolioItems = await mainQuery

    console.log(`✅ Found ${portfolioItems.length} portfolio items`)

    return NextResponse.json({
      success: true,
      portfolioItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching portfolio items:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch portfolio items",
      },
      { status: 500 },
    )
  }
}

// POST - Create new portfolio item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, file_path, file_type, status, featured } = body

    console.log("🚀 Creating portfolio item:", { title, category })

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, description and category are required",
        },
        { status: 400 },
      )
    }

    // Create portfolio item using properly formatted SQL template
    const portfolioItem = await sql`
      INSERT INTO portfolio_items 
        (title, description, category, file_path, file_type, status, featured, created_at, updated_at)
      VALUES 
        (${title}, ${description}, ${category}, ${file_path || null}, ${file_type || "image"}, 
         ${status || "published"}, ${featured || false}, 
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id, title, description, category, file_path, file_type, status, featured, created_at, updated_at
    `

    console.log("✅ Portfolio item created successfully")
    return NextResponse.json({
      success: true,
      message: "Portfolio item created successfully",
      portfolioItem: portfolioItem[0],
    })
  } catch (error) {
    console.error("❌ Error creating portfolio item:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create portfolio item",
      },
      { status: 500 },
    )
  }
}

// PUT - Update portfolio item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, category, file_path, file_type, status, featured } = body

    console.log("🔄 Updating portfolio item:", { id, title })

    // Update query
    const updateQuery = sql`
      UPDATE portfolio_items 
      SET 
        title = ${title}, 
        description = ${description}, 
        category = ${category}, 
        file_path = ${file_path || null},
        file_type = ${file_type || "image"},
        status = ${status}, 
        featured = ${featured || false}, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, title, description, category, file_path, file_type, status, featured, created_at, updated_at
    `

    const portfolioItem = await updateQuery

    if (portfolioItem.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Portfolio item not found",
        },
        { status: 404 },
      )
    }

    console.log("✅ Portfolio item updated successfully")
    return NextResponse.json({
      success: true,
      message: "Portfolio item updated successfully",
      portfolioItem: portfolioItem[0],
    })
  } catch (error) {
    console.error("❌ Error updating portfolio item:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update portfolio item",
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete portfolio item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Portfolio item ID is required",
        },
        { status: 400 },
      )
    }

    console.log("🗑️ Deleting portfolio item:", id)

    await sql`DELETE FROM portfolio_items WHERE id = ${id}`

    console.log("✅ Portfolio item deleted successfully")
    return NextResponse.json({
      success: true,
      message: "Portfolio item deleted successfully",
    })
  } catch (error) {
    console.error("❌ Error deleting portfolio item:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete portfolio item",
      },
      { status: 500 },
    )
  }
}
