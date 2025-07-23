import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

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
      from: "onboarding@resend.dev", // Use a verified domain if you have one, otherwise 'onboarding@resend.dev' is a safe default
      to: "robelbira@gmail.com", // The target email address
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
