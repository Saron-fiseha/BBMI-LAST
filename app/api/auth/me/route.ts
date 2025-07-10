// import { type NextRequest, NextResponse } from "next/server"
// import { getUserFromToken } from "@/lib/auth"

// export async function GET(request: NextRequest) {
//   try {
//     const authHeader = request.headers.get("authorization")

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 })
//     }

//     const token = authHeader.substring(7)
//     const user = await getUserFromToken(token)

//     if (user) {
//       return NextResponse.json({ success: true, user })
//     } else {
//       return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
//     }
//   } catch (error) {
//     console.error("Auth me API error:", error)
//     return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
//   }
// }
import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        profile_picture: user.profile_picture,
      },
    })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 401 })
  }
}
