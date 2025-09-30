// import { type NextRequest, NextResponse } from "next/server"
// import { neon } from "@neondatabase/serverless"

// const sql = neon(process.env.DATABASE_URL!)

// export async function GET() {
//   console.log("🔍 API: Fetching modules...")
//   try {
//     const modules = await sql`
//       SELECT 
//         m.*,
//       COALESCE(t.name, 'No Program') as program_name
//       FROM modules m
//       LEFT JOIN trainings t ON m.training_id::text = t.id::text
//       ORDER BY m.created_at DESC
//     `

//     console.log("✅ API: Query successful, found modules:", modules.length)

//     return NextResponse.json(
//       modules.map((module) => ({
//         id: module.id,
//         name: module.name,
//         description: module.description,
//         moduleCode: module.code,
//         programId: module.training_id,
//         programName: module.program_name,
//         videoId: module.video_url,
//         duration: module.duration,
//         order: module.order_index,
//         status: module.status,
//         createdAt: module.created_at,
//       })),
//     )
//   } catch (error) {
//     console.error("❌ API: Error fetching modules:", error)
//     return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest) {
//   console.log("📝 API: Creating new module...")
//   try {
//     const body = await request.json()
//     const { name, description, moduleCode, programId, programName, videoId, duration, order, status } = body

//     console.log("📊 API: Module data received:", { name, moduleCode, status })

//     const result = await sql`
//       INSERT INTO modules (
//         name, description, code, training_id, video_url, 
//         duration, order_index, status, created_at, updated_at
//       )
//       VALUES (
//         ${name}, ${description}, ${moduleCode}, ${programId}, ${videoId},
//         ${duration}, ${order}, ${status || "draft"}, NOW(), NOW()
//       )
//       RETURNING *
//     `

//     const newModule = result[0]
//     console.log("✅ API: Module created successfully:", newModule.id)

//     return NextResponse.json({
//       id: newModule.id,
//       name: newModule.name,
//       description: newModule.description,
//       moduleCode: newModule.code,
//       programId: newModule.training_id,
//       programName: programName,
//       videoId: newModule.video_url,
//       duration: newModule.duration,
//       order: newModule.order_index,
//       status: newModule.status,
//       createdAt: newModule.created_at,
//     })
//   } catch (error) {
//     console.error("❌ API: Error creating module:", error)
//     return NextResponse.json({ error: "Failed to create module" }, { status: 500 })
//   }
// }

// export async function PUT(request: NextRequest) {
//   console.log("🔄 API: Updating module...")
//   try {
//     const body = await request.json()
//     const { id, name, description, moduleCode, programId, programName, videoId, duration, order, status } = body

//     console.log("📊 API: Update data received:", { id, name, moduleCode, status })

//     const result = await sql`
//       UPDATE modules 
//       SET 
//         name = ${name},
//         description = ${description},
//         code = ${moduleCode},
//         training_id = ${programId},
//         video_url = ${videoId},
//         duration = ${duration},
//         order_index = ${order},
//         status = ${status},
//         updated_at = NOW()
//       WHERE id = ${id}
//       RETURNING *
//     `

//     if (result.length === 0) {
//       console.log("❌ API: Module not found for update:", id)
//       return NextResponse.json({ error: "Module not found" }, { status: 404 })
//     }

//     const updatedModule = result[0]
//     console.log("✅ API: Module updated successfully:", updatedModule.id)

//     return NextResponse.json({
//       id: updatedModule.id,
//       name: updatedModule.name,
//       description: updatedModule.description,
//       moduleCode: updatedModule.code,
//       programId: updatedModule.training_id,
//       programName: programName,
//       videoId: updatedModule.video_url,
//       duration: updatedModule.duration,
//       order: updatedModule.order_index,
//       status: updatedModule.status,
//       createdAt: updatedModule.created_at,
//     })
//   } catch (error) {
//     console.error("❌ API: Error updating module:", error)
//     return NextResponse.json({ error: "Failed to update module" }, { status: 500 })
//   }
// }
import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Type for module
type Module = {
  id: string
  name: string
  description: string | null
  moduleCode: string
  programId: string | null
  programName: string
  videoId: string | null
  duration: number | null
  order: number | null
  status: string
  createdAt: string
}

export async function GET() {
  try {
    const modules = await sql`
      SELECT 
        m.*,
        COALESCE(t.name, 'No Program') AS program_name
      FROM modules m
      LEFT JOIN trainings t ON m.training_id::text = t.id::text
      ORDER BY m.created_at DESC
    `
    return NextResponse.json(
      modules.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        moduleCode: m.code,
        programId: m.training_id,
        programName: m.program_name,
        videoId: m.video_url,
        duration: m.duration,
        order: m.order_index,
        status: m.status,
        createdAt: m.created_at,
      })),
    )
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, moduleCode, programId, videoId, duration, order, status } = body

    // Validation
    if (!name || !moduleCode) {
      return NextResponse.json({ error: "Module name and code are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO modules (
        name, description, code, training_id, video_url, duration, order_index, status, created_at, updated_at
      )
      VALUES (
        ${name}, ${description ?? null}, ${moduleCode}, ${programId ?? null}, ${videoId ?? null},
        ${duration ?? null}, ${order ?? null}, ${status ?? "draft"}, NOW(), NOW()
      )
      RETURNING *
    `

    const newModule = result[0]

    // Fetch program name from DB
    const program = programId
      ? await sql`SELECT name FROM trainings WHERE id = ${programId}`
      : []

    return NextResponse.json<Module>({
      id: newModule.id,
      name: newModule.name,
      description: newModule.description,
      moduleCode: newModule.code,
      programId: newModule.training_id,
      programName: program[0]?.name ?? "No Program",
      videoId: newModule.video_url,
      duration: newModule.duration,
      order: newModule.order_index,
      status: newModule.status,
      createdAt: newModule.created_at,
    })
  } catch (error) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: "Failed to create module" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, moduleCode, programId, videoId, duration, order, status } = body

    if (!id) return NextResponse.json({ error: "Module ID is required" }, { status: 400 })

    // Fetch existing module
    const existing = await sql`SELECT * FROM modules WHERE id = ${id}`
    if (existing.length === 0) return NextResponse.json({ error: "Module not found" }, { status: 404 })

    const current = existing[0]

    const result = await sql`
      UPDATE modules
      SET
        name = ${name ?? current.name},
        description = ${description ?? current.description},
        code = ${moduleCode ?? current.code},
        training_id = ${programId ?? current.training_id},
        video_url = ${videoId ?? current.video_url},
        duration = ${duration ?? current.duration},
        order_index = ${order ?? current.order_index},
        status = ${status ?? current.status},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    const updatedModule = result[0]

    const program = updatedModule.training_id
      ? await sql`SELECT name FROM trainings WHERE id = ${updatedModule.training_id}`
      : []

    return NextResponse.json<Module>({
      id: updatedModule.id,
      name: updatedModule.name,
      description: updatedModule.description,
      moduleCode: updatedModule.code,
      programId: updatedModule.training_id,
      programName: program[0]?.name ?? "No Program",
      videoId: updatedModule.video_url,
      duration: updatedModule.duration,
      order: updatedModule.order_index,
      status: updatedModule.status,
      createdAt: updatedModule.created_at,
    })
  } catch (error) {
    console.error("API PUT error:", error)
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 })
  }
}
