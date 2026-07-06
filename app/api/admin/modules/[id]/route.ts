import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"
const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("🗑️ API: Deleting module:", params.id)

  try {
    const result = await sql`
      DELETE FROM modules 
      WHERE id = ${params.id}
      RETURNING id
    `

    if (result.length === 0) {
      console.log("❌ API: Module not found for deletion:", params.id)
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    console.log("✅ API: Module deleted successfully:", params.id)
    return NextResponse.json({ success: true, id: params.id })
  } catch (error) {
    console.error("❌ API: Error deleting module:", error)
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 })
  }
}
