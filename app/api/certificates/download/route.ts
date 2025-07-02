import { type NextRequest, NextResponse } from "next/server"
import { createCanvas, loadImage } from "canvas"
import path from "path"
import fs from "fs"
import { Buffer } from "buffer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentName, courseName, instructorName, completionDate, certificateCode, grade, duration, skills } = body

    // Create canvas with certificate dimensions (matching the template)
    const width = 1200
    const height = 900
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext("2d")

    // Load the certificate template
    const templatePath = path.join(process.cwd(), "public", "certificate-template.png")

    if (!fs.existsSync(templatePath)) {
      throw new Error("Certificate template not found")
    }

    const templateImage = await loadImage(templatePath)

    // Draw the template as background
    ctx.drawImage(templateImage, 0, 0, width, height)

    // Set up text rendering
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Student Name (Golden script font) - positioned to match template
    ctx.fillStyle = "#D4AF37" // Gold color matching template
    ctx.font = "bold 48px serif"
    ctx.shadowColor = "rgba(0,0,0,0.3)"
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    ctx.fillText(studentName, width / 2, height * 0.45)

    // Reset shadow
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Course description text - positioned to match template
    ctx.fillStyle = "#1e3a8a" // Navy blue matching template
    ctx.font = "16px Arial, sans-serif"

    const courseText = `In recognition of exceptional skill in ${courseName.toLowerCase()}, including long-wear techniques, client consultation, and personalized beauty enhancement. Proudly awarded by BBMI on ${new Date(completionDate).toLocaleDateString()}.`

    // Word wrap for course description
    const maxWidth = 600
    const words = courseText.split(" ")
    let line = ""
    const lines = []

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " "
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && n > 0) {
        lines.push(line)
        line = words[n] + " "
      } else {
        line = testLine
      }
    }
    lines.push(line)

    // Draw course description lines
    const lineHeight = 24
    const startY = height * 0.58 - ((lines.length - 1) * lineHeight) / 2

    lines.forEach((line, index) => {
      ctx.fillText(line.trim(), width / 2, startY + index * lineHeight)
    })

    // Convert canvas to PNG buffer
    const pngBuffer = canvas.toBuffer("image/png")

    // Create a proper PDF using a simple PDF structure
    const pdfDoc = createSimplePDF(pngBuffer, width, height)

    return new NextResponse(pdfDoc, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="BBMI-Certificate-${certificateCode}.pdf"`,
        "Content-Length": pdfDoc.length.toString(),
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

function createSimplePDF(imageBuffer: Buffer, width: number, height: number): Buffer {
  // Calculate PDF dimensions (A4 landscape: 842 x 595 points)
  const pdfWidth = 842
  const pdfHeight = 595

  // Calculate image scaling to fit PDF page
  const scaleX = pdfWidth / width
  const scaleY = pdfHeight / height
  const scale = Math.min(scaleX, scaleY)

  const scaledWidth = width * scale
  const scaledHeight = height * scale

  // Center the image on the page
  const x = (pdfWidth - scaledWidth) / 2
  const y = (pdfHeight - scaledHeight) / 2

  // Create PDF content
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${pdfWidth} ${pdfHeight}]
/Contents 4 0 R
/Resources <<
  /XObject <<
    /Im1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 58
>>
stream
q
${scaledWidth} 0 0 ${scaledHeight} ${x} ${y} cm
/Im1 Do
Q
endstream
endobj

5 0 obj
<<
/Type /XObject
/Subtype /Image
/Width ${width}
/Height ${height}
/ColorSpace /DeviceRGB
/BitsPerComponent 8
/Filter /DCTDecode
/Length ${imageBuffer.length}
>>
stream
`

  // Convert PNG to JPEG for better PDF compatibility
  const jpegBuffer = convertPNGToJPEG(imageBuffer)

  const pdfEnd = `
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000289 00000 n 
0000000397 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${600 + jpegBuffer.length}
%%EOF`

  // Combine PDF parts
  const pdfBuffer = Buffer.concat([Buffer.from(pdfContent, "utf8"), jpegBuffer, Buffer.from(pdfEnd, "utf8")])

  return pdfBuffer
}

function convertPNGToJPEG(pngBuffer: Buffer): Buffer {
  try {
    // Create a new canvas to convert PNG to JPEG
    const { createCanvas, loadImage } = require("canvas")

    const dataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;

    // This is a synchronous operation for the conversion
    const img = new Image()
     img.src = dataUrl;

    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(img, 0, 0)

    // Convert to JPEG with high quality
    return canvas.toBuffer("image/jpeg", { quality: 0.95 })
  } catch (error) {
    console.error("PNG to JPEG conversion failed:", error)
    // Return original buffer if conversion fails
    return pngBuffer
  }
}
