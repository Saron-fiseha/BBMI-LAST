import { type NextRequest, NextResponse } from "next/server"
import { generateCertificateHTML, type CertificateData } from "@/lib/certificate-generator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentName, courseName, instructorName, completionDate, certificateId, trainingDescription } = body

    const certificateData: CertificateData = {
      userName: studentName,
      trainingTitle: courseName,
      completionDate: completionDate,
      certificateNumber: certificateId,
      verificationCode: `VERIFY-${certificateId}`,
      instructorName: instructorName || "Ms Betelhem",
      trainingDescription: trainingDescription,
    }

    // Generate HTML certificate
    const htmlContent = generateCertificateHTML(certificateData)

    // For now, return HTML content that can be printed as PDF by the browser
    // In production, you might want to use puppeteer or similar to generate actual PDF
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="BBMI-Certificate-${certificateId}.html"`,
      },
    })
  } catch (error) {
    console.error("Certificate generation error:", error)
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 })
  }
}
