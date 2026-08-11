import { type NextRequest, NextResponse } from "next/server"
import { resendVerificationEmail } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    const result = await resendVerificationEmail(email)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Resend verification API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}