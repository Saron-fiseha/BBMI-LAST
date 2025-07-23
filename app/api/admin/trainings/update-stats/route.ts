import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Updating training stats...")

    const { training_id } = await request.json()

    if (!training_id) {
      return NextResponse.json({ error: "Training ID is required" }, { status: 400 })
    }

    // Calculate module count and total duration
    const moduleStats = await sql`
      SELECT 
        COUNT(*) as module_count,
        COALESCE(SUM(duration), 0) as total_duration
      FROM modules 
      WHERE training_id = ${training_id}
    `

    const modules = moduleStats[0]?.module_count || 0
    const duration = moduleStats[0]?.total_duration || 0

    // Update training with new stats
    await sql`
      UPDATE trainings 
      SET 
        modules = ${modules},
        duration = ${duration},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${training_id}
    `

    console.log(`✅ Updated training ${training_id} stats: ${modules} modules, ${duration} minutes`)
    return NextResponse.json({
      success: true,
      modules,
      duration,
    })
  } catch (error) {
    console.error("❌ Error updating training stats:", error)
    return NextResponse.json({ error: "Failed to update training stats" }, { status: 500 })
  }
}
