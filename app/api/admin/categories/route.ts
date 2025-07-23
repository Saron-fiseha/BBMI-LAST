import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

// GET - Fetch categories with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "all";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    console.log("🔍 Fetching categories with params:", { search, level, page, limit });

    // Build count query using tagged template
    let countQuery = sql`
      SELECT COUNT(*) as total 
      FROM categories 
      WHERE 1=1
    `;

    if (search) {
      countQuery = sql`
        ${countQuery}
        AND (name ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})
      `;
    }

    if (level !== "all") {
      countQuery = sql`
        ${countQuery}
        AND level = ${level}
      `;
    }

    const totalResult = await countQuery;
    const total = Number.parseInt(totalResult[0].total);
    const totalPages = Math.ceil(total / limit);

    // Build main query using tagged template
    let mainQuery = sql`
      SELECT 
        id, name, description, image_url, level, 
        COALESCE(trainings_count, 0) as trainings_count,
        status, created_at
      FROM categories 
      WHERE 1=1
    `;

    if (search) {
      mainQuery = sql`
        ${mainQuery}
        AND (name ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})
      `;
    }

    if (level !== "all") {
      mainQuery = sql`
        ${mainQuery}
        AND level = ${level}
      `;
    }

    // Add pagination
    mainQuery = sql`
      ${mainQuery}
      ORDER BY created_at DESC 
      LIMIT ${limit} 
      OFFSET ${offset}
    `;

    const categories = await mainQuery;

    console.log(`✅ Found ${categories.length} categories`);

    return NextResponse.json({
      success: true,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, image_url, level } = body

    console.log("🚀 Creating category:", { name, level })

    const category = await sql`
      INSERT INTO categories (name, description, image_url, level, status, created_at, updated_at)
      VALUES (${name}, ${description}, ${image_url || ""}, ${level}, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `

    console.log("✅ Category created successfully")
    return NextResponse.json({
      success: true,
      category: category[0],
    })
  } catch (error) {
    console.error("❌ Error creating category:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
      },
      { status: 500 },
    )
  }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, image_url, level, status } = body

    console.log("🔄 Updating category:", { id, name })

    const category = await sql`
      UPDATE categories 
      SET name = ${name}, description = ${description}, image_url = ${image_url}, 
          level = ${level}, status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (category.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 },
      )
    }

    console.log("✅ Category updated successfully")
    return NextResponse.json({
      success: true,
      category: category[0],
    })
  } catch (error) {
    console.error("❌ Error updating category:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update category",
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        { status: 400 },
      )
    }

    console.log("🗑️ Deleting category:", id)

    await sql`DELETE FROM categories WHERE id = ${id}`

    console.log("✅ Category deleted successfully")
    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("❌ Error deleting category:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete category",
      },
      { status: 500 },
    )
  }
}
