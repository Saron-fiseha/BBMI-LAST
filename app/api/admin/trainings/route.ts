import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching trainings...")

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || "all"
    const status = searchParams.get("status") || "all"

    console.log("📊 Query params:", { search, category, status })

    let trainings

    // Build query based on filters using proper tagged template syntax
    if (search && category !== "all" && status !== "all") {
      trainings = await sql`
        SELECT 
          t.*,
          COALESCE(c.name, 'Unknown') as category_name,
          COALESCE(t.modules, 0) as modules_count,
          0 as current_trainees
        FROM trainings t
        LEFT JOIN categories c ON t.category_id::text = c.id::text
        WHERE (t.name ILIKE ${`%${search}%`} OR t.course_code ILIKE ${`%${search}%`})
        AND t.category_id = ${category}
        AND t.status = ${status}
        ORDER BY t.created_at DESC
      `
    } else if (search && category !== "all") {
      trainings = await sql`
        SELECT 
          t.*,
          COALESCE(c.name, 'Unknown') as category_name,
          COALESCE(t.modules, 0) as modules_count,
          0 as current_trainees
        FROM trainings t
        LEFT JOIN categories c ON t.category_id::text = c.id::text
        WHERE (t.name ILIKE ${`%${search}%`} OR t.course_code ILIKE ${`%${search}%`})
        AND t.category_id = ${category}
        ORDER BY t.created_at DESC
      `
    } else if (search && status !== "all") {
      trainings = await sql`
        SELECT 
          t.*,
          COALESCE(c.name, 'Unknown') as category_name,
          COALESCE(t.modules, 0) as modules_count,
          0 as current_trainees
        FROM trainings t
        LEFT JOIN categories c ON t.category_id::text = c.id::text
        WHERE (t.name ILIKE ${`%${search}%`} OR t.course_code ILIKE ${`%${search}%`})
        AND t.status = ${status}
        ORDER BY t.created_at DESC
      `
    } else if (category !== "all" && status !== "all") {
      trainings = await sql`
        SELECT 
          t.*,
          COALESCE(c.name, 'Unknown') as category_name,
          COALESCE(t.modules, 0) as modules_count,
          0 as current_trainees
        FROM trainings t
        LEFT JOIN categories c ON t.category_id::text = c.id::text
        WHERE t.category_id = ${category}
        AND t.status = ${status}
        ORDER BY t.created_at DESC
      `
    } else if (search) {
      trainings = await sql`
        SELECT 
          t.*,
          COALESCE(c.name, 'Unknown') as category_name,
          COALESCE(t.modules, 0) as modules_count,
          0 as current_trainees
        FROM trainings t
        LEFT JOIN categories c ON t.category_id::text = c.id::text
        WHERE t.name ILIKE ${`%${search}%`} OR t.course_code ILIKE ${`%${search}%`}
        ORDER BY t.created_at DESC
      `
    } else if (category !== "all") {
      trainings = await sql`
        SELECT 
          t.*,
          COALESCE(c.name, 'Unknown') as category_name,
          COALESCE(t.modules, 0) as modules_count,
          0 as current_trainees
        FROM trainings t
        LEFT JOIN categories c ON t.category_id::text = c.id::text
        WHERE t.category_id = ${category}
        ORDER BY t.created_at DESC
      `
    } else if (status !== "all") {
      trainings = await sql`
        SELECT 
          t.*,
          COALESCE(c.name, 'Unknown') as category_name,
          COALESCE(t.modules, 0) as modules_count,
          0 as current_trainees
        FROM trainings t
        LEFT JOIN categories c ON t.category_id::text = c.id::text
        WHERE t.status = ${status}
        ORDER BY t.created_at DESC
      `
    } else {
      trainings = await sql`
        SELECT 
          t.*,
          COALESCE(c.name, 'Unknown') as category_name,
          COALESCE(t.modules, 0) as modules_count,
          0 as current_trainees
        FROM trainings t
        LEFT JOIN categories c ON t.category_id::text = c.id::text
        ORDER BY t.created_at DESC
      `
    }

    console.log(`✅ Query successful, found ${trainings.length} trainings`)
    return NextResponse.json({ trainings })
  } catch (error) {
    console.error("❌ Trainings fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch trainings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Creating new training...")

    const {
      name,
      description,
      image_url,
      course_code,
      category_id,
      price,
      discount,
      max_trainees,
      instructor_id,
      instructor_name,
    } = await request.json()

    console.log("📝 Training data:", { name, course_code, category_id, price, instructor_name })

    // Validate required fields
    if (!name || !description || !course_code || !category_id) {
      console.log("❌ Validation failed: Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get level from category
    const categoryData = await sql`
      SELECT level FROM categories WHERE id = ${category_id}
    `
    const level = categoryData[0]?.level || "beginner"

    const training = await sql`
      INSERT INTO trainings (
        name, 
        description, 
        image_url, 
        course_code, 
        category_id, 
        price, 
        discount, 
        max_trainees, 
        instructor_id,
        instructor_name,
        level,
        modules,
        duration,
        status
      )
      VALUES (
        ${name}, 
        ${description}, 
        ${image_url || ""}, 
        ${course_code}, 
        ${category_id}, 
        ${price || 0}, 
        ${discount || 0}, 
        ${max_trainees || 0},
        ${instructor_id || null},
        ${instructor_name || ""},
        ${level},
        0,
        0,
        'draft'
      )
      RETURNING *
    `

    console.log("✅ Training created successfully:", training[0].id)
    return NextResponse.json({ training: training[0] })
  } catch (error) {
    console.error("❌ Training creation error:", error)
    return NextResponse.json({ error: "Failed to create training" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("🔄 Updating training...")

    const {
      id,
      name,
      description,
      image_url,
      course_code,
      category_id,
      price,
      discount,
      max_trainees,
      status,
      instructor_id,
      instructor_name,
    } = await request.json()

    console.log("📝 Update data:", { id, name, course_code, category_id, instructor_name })

    // Validate required fields
    if (!id || !name || !description || !course_code || !category_id) {
      console.log("❌ Validation failed: Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get level from category
    const categoryData = await sql`
      SELECT level FROM categories WHERE id = ${category_id}
    `
    const level = categoryData[0]?.level || "beginner"

    // Get current module count and duration
    const moduleStats = await sql`
      SELECT 
        COUNT(*) as module_count,
        COALESCE(SUM(duration), 0) as total_duration
      FROM modules 
      WHERE training_id = ${id}
    `
    const modules = moduleStats[0]?.module_count || 0
    const duration = moduleStats[0]?.total_duration || 0

    const training = await sql`
      UPDATE trainings 
      SET name = ${name}, 
          description = ${description}, 
          image_url = ${image_url || ""}, 
          course_code = ${course_code}, 
          category_id = ${category_id}, 
          price = ${price || 0},
          discount = ${discount || 0}, 
          max_trainees = ${max_trainees || 0}, 
          status = ${status || "draft"},
          instructor_id = ${instructor_id || null},
          instructor_name = ${instructor_name || ""},
          level = ${level},
          modules = ${modules},
          duration = ${duration},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (training.length === 0) {
      console.log("❌ Training not found for update")
      return NextResponse.json({ error: "Training not found" }, { status: 404 })
    }

    console.log("✅ Training updated successfully:", training[0].id)
    return NextResponse.json({ training: training[0] })
  } catch (error) {
    console.error("❌ Training update error:", error)
    return NextResponse.json({ error: "Failed to update training" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("🗑️ Deleting training...")

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Training ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM trainings WHERE id = ${id}`

    console.log("✅ Training deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Training deletion error:", error)
    return NextResponse.json({ error: "Failed to delete training" }, { status: 500 })
  }
}
