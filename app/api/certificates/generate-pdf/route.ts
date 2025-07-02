import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentName, courseName, instructorName, completionDate, certificateId, grade, duration, skills } = body

    // For now, return a simple response indicating PDF generation
    // In a real implementation, you would use a PDF library like jsPDF or Puppeteer
    const pdfContent = `
      Certificate of Completion
      
      This is to certify that ${studentName} has successfully completed
      ${courseName}
      
      Instructor: ${instructorName}
      Completion Date: ${completionDate}
      Certificate ID: ${certificateId}
      Grade: ${grade}
      Duration: ${duration} hours
      
      Skills Acquired: ${skills.join(", ")}
      
      Betty Beauty Makeup Institute
    `

    // Create a simple text file as PDF placeholder
    const blob = new Blob([pdfContent], { type: "application/pdf" })

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${certificateId}-Certificate.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
