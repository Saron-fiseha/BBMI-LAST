import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    const result = await loginUser(email.toLowerCase(), password)

    console.log("Login result:", { success: result.success, role: result.user?.role })

    if (result.success) {
      // Create response with token in cookie as well
      const response = NextResponse.json(result)

      // Set cookie for server-side middleware
      response.cookies.set("auth_token", result.token!, {
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      return response
    } else {
      return NextResponse.json(result, { status: 401 })
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// import { type NextRequest, NextResponse } from "next/server"
// import { getUserByEmail, verifyPassword, generateToken } from "@/lib/auth"

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password } = await request.json()

//     if (!email || !password) {
//       return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
//     }

//     // // Get user by email
//     // const user = await getUserByEmail(email)
//     // if (!user) {
//     //   return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
//     // }
//     // console.log('User object from getUserByEmail:', user)

//     // Get password from database
//     const { sql } = await import("@/lib/db")
//     const userWithPassword = await sql`
//      SELECT id, email, password FROM users WHERE email = ${email} LIMIT 1
//     `
//     // if (!userWithPassword.length || userWithPassword[0].password === undefined) {
//     //   console.error('Password not found for user:', user.id)
//     //   return NextResponse.json(
//     //     { success: false, message: "Authentication error" },
//     //     { status: 500 }
//     //   )
//     // }
  

//     if (userWithPassword.length === 0) {
//       return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
//     }

//     const dbUser = userWithPassword[0]
//     const dbPassword = dbUser.password

//     // Debug logs
//     console.log('User from DB:', { 
//       id: dbUser.id, 
//       email: dbUser.email,
//       hasPassword: !!dbPassword,
//       passwordType: typeof dbPassword
//     })

//     if (!dbPassword) {
//       console.error('No password stored for user:', dbUser.id)
//       return NextResponse.json(
//         { success: false, message: "Authentication configuration error" },
//         { status: 500 }
//       )
//     }

//     // Verify password
//     const isValidPassword = await verifyPassword(password, dbPassword)
//     if (!isValidPassword) {
//       return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
//     }

//     // Generate token
//     const token = generateToken(dbUser)

//     return NextResponse.json({
//       success: true,
//       token,
//       user: {
//         id: dbUser.id,
//         email: dbUser.email,
//         full_name: dbUser.full_name,
//         role: dbUser.role,
//         profile_picture: dbUser.profile_picture,
//       },
//     })
//   } catch (error) {
//     console.error("Login error:", error)
//     return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 })
//   }
// }
