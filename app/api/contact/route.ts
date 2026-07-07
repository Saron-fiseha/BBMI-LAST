// deploy test - verifying auto-deploy workflow
import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set.")
    return NextResponse.json(
      { success: false, error: "Server configuration error: RESEND_API_KEY is missing." },
      { status: 500 },
    )
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 })
    }

    await resend.emails.send({
  from: "Brushed By Betty <contact@brushedbybetty.com>",
  to: "betelhemesknder19@gmail.com",
  replyTo: email, // lets you hit "Reply" and respond directly to the customer
  subject: `New Contact Form Submission: ${subject}`,
  html: `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `,
})

    return NextResponse.json({ success: true, message: "Message sent successfully!" }, { status: 200 })
  } catch (error: any) {
    console.error("Failed to send email:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to send message." }, { status: 500 })
  }
}
