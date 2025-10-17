import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest, context: { params: Promise<{ certificateNumber: string }> }) {
  try {
    // Get user from token
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace(/^Bearer\s+/i, "") || ""
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const params = await context.params
    const certificateNumber = params.certificateNumber

    // Get certificate
    const certificate = await sql`
      SELECT 
        c.*,
        t.name as training_title
      FROM certificates c
      JOIN trainings t ON c.training_id = t.id
      WHERE c.certificate_number = ${certificateNumber} 
      AND c.user_id = ${user.id}
    `

    if (certificate.length === 0) {
      return NextResponse.json({ success: false, message: "Certificate not found" }, { status: 404 })
    }

    const certData = certificate[0]

    if (!certData.pdf_url) {
      return NextResponse.json({ success: false, message: "Certificate PDF not available" }, { status: 404 })
    }

    // Extract base64 data from data URL
    const base64Data = certData.pdf_url.replace("data:application/pdf;base64,", "")
    const pdfBuffer = Buffer.from(base64Data, "base64")

    // Return PDF file
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificate-${certificateNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Certificate download error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
