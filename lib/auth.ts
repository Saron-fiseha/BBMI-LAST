
// // auth.ts

// import bcrypt from "bcryptjs"
// import { SignJWT, jwtVerify } from "jose"
// import { sql } from "@/lib/db"
// import { Resend } from "resend"
// import {jwtDecode} from "jwt-decode" // ✅ Add this
// import { type NextRequest } from "next/server"; // <-- ADD THIS IMPORT AT THE TOP


// const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

// // Lazy Resend client — only created when actually needed (avoids build-time crash when key is missing)
// function getResendClient() {
//   const apiKey = process.env.RESEND_API_KEY
//   if (!apiKey) throw new Error("RESEND_API_KEY is not set. Cannot send emails.")
//   return new Resend(apiKey)
// }

// export interface User {
//   id: number
//   full_name: string
//   email: string
//   phone?: string
//   age?: number
//   sex?: string
//   role: "student" | "instructor" | "admin"
//   profile_picture?: string
//   email_verified: boolean
// }

// export interface AuthResult {
//   success: boolean
//   user?: User
//   token?: string
//   message?: string
// }

// export async function hashPassword(password: string): Promise<string> {
//   return bcrypt.hash(password, 12)
// }

// export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
//   return bcrypt.compare(password, hashedPassword)
// }

// const secretKey = new TextEncoder().encode(JWT_SECRET)

// export async function generateToken(user: User): Promise<string> {
//   return new SignJWT({
//     id: user.id,
//     email: user.email,
//     role: user.role,
//     full_name: user.full_name,
//   })
//     .setProtectedHeader({ alg: "HS256" })
//     .setExpirationTime("7d")
//     .sign(secretKey)
// }

// export async function verifyToken(token: string): Promise<any | null> {
//   try {
//     if (!token) return null

//     const cleanToken = token.trim().replace(/^Bearer\s+/i, "")
//     const tokenParts = cleanToken.split(".")
//     if (tokenParts.length !== 3) return null

//     const { payload } = await jwtVerify(cleanToken, secretKey)
//     return payload
//   } catch (error) {
//     console.error("Token verification failed:", error)
//     return null
//   }
// }

// export async function registerUser(userData: {
//   full_name: string
//   email: string
//   phone?: string
//   age?: number
//   sex?: string
//   password: string
//   profile_picture?: string
// }): Promise<AuthResult> {
//   try {
//     const existingUser = await sql`
//       SELECT id FROM users WHERE email = ${userData.email.toLowerCase()}
//     `
//     if (existingUser.length > 0) {
//       return { success: false, message: "User with this email already exists" }
//     }

//     const hashedPassword = await hashPassword(userData.password)
//     const result = await sql`
//       INSERT INTO users (full_name, email, phone, age, sex, password_hash, profile_picture, role, email_verified)
//       VALUES (
//         ${userData.full_name}, 
//         ${userData.email.toLowerCase()}, 
//         ${userData.phone || null}, 
//         ${userData.age || null}, 
//         ${userData.sex || null}, 
//         ${hashedPassword}, 
//         ${userData.profile_picture || null}, 
//         'student', 
//         false
//       )
//       RETURNING id, full_name, email, phone, age, sex, role, profile_picture, email_verified
//     `

//     const user = result[0] as User
//     const token = await generateToken(user)

//     return { success: true, user, token }
//   } catch (error) {
//     console.error("Registration error:", error)
//     return { success: false, message: "Registration failed. Please try again." }
//   }
// }

// export async function loginUser(email: string, password: string): Promise<AuthResult> {
//   try {
//     const result = await sql`
//       SELECT id, full_name, email, phone, age, sex, password_hash, role, profile_picture, email_verified
//       FROM users 
//       WHERE email = ${email.toLowerCase()}
//     `

//     if (result.length === 0) {
//       return { success: false, message: "Invalid email or password" }
//     }

//     const user = result[0]
//     const isValidPassword = await verifyPassword(password, user.password_hash)
//     if (!isValidPassword) {
//       return { success: false, message: "Invalid email or password" }
//     }

   

//     const { password_hash, ...userWithoutPassword } = user
//     const token = await generateToken(userWithoutPassword as User)

//     return {
//       success: true,
//       user: userWithoutPassword as User,
//       token,
//     }
//   } catch (error) {
//     console.error("Login error:", error)
//     return { success: false, message: "Login failed. Please try again." }
//   }
// }

// export async function getUserFromToken(token: string): Promise<User | null> {
//   try {
//     const decoded = await verifyToken(token)
//     if (!decoded) return null

//     const result = await sql`
//       SELECT id, full_name, email, phone, age, sex, role, profile_picture, email_verified
//       FROM users 
//       WHERE id = ${decoded.id}
//     `
//     if (result.length > 0) return result[0] as User
//     return null
//   } catch (error) {
//     console.error("Token verification error:", error)
//     return null
//   }
// }

// export function generateResetToken(): string {
//   return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
// }

// // const resend = new Resend(process.env.RESEND_API_KEY)

// export async function createResetToken(email: string): Promise<{ success: boolean; message: string }> {
//   try {
//     const users = await sql`
//       SELECT id FROM users WHERE email = ${email.toLowerCase()}
//     `
//     if (users.length === 0) {
//       return { success: false, message: "Email is not registered in our system." }
//     }

//     const resetToken = generateResetToken()
//     const expiresAt = new Date(Date.now() + 3600000)

//     try {
//       await sql`
//         UPDATE users 
//         SET reset_token = ${resetToken}, reset_token_expires = ${expiresAt}
//         WHERE email = ${email.toLowerCase()}
//       `
//     } catch (dbErr) {
//       console.warn("Could not update reset_token columns on users table:", dbErr)
//     }

//     const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
//     const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

//     try {
//       const resend = getResendClient()
//       if (resend) {
//         await resend.emails.send({
//           from: "onboarding@resend.dev",
//           to: email,
//           subject: "Reset your BBMI password",
//           html: `
//              <p>Hi,</p>
//              <p>You requested a password reset. Click the link below to reset your password:</p>
//              <p><a href="${resetUrl}">${resetUrl}</a></p>
//              <p>This link will expire in 1 hour.</p>
//              <p>If you didn't request this, you can ignore this email.</p>
//            `,
//         })
//       }
//     } catch (mailErr) {
//       console.warn("Mailer not configured or failed to send email. Password reset link:", resetUrl)
//       return {
//         success: true,
//         message: `Password reset link generated (email not sent due to missing RESEND_API_KEY): ${resetUrl}`,
//       }
//     }

//     return {
//       success: true,
//       message: "Password reset link sent! Please check your email inbox or spam folder.",
//     }
//   } catch (error) {
//     console.error("Error generating password reset token:", error)
//     return {
//       success: false,
//       message: "Failed to generate password reset token. Please try again.",
//     }
//   }
// }

// export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
//   try {
//     const hashedPassword = await hashPassword(newPassword)
//     const result = await sql`
//       UPDATE users 
//       SET password_hash = ${hashedPassword}, reset_token = NULL, reset_token_expires = NULL
//       WHERE reset_token = ${token} AND reset_token_expires > NOW()
//       RETURNING id
//     `
//     return result.length > 0
//   } catch (error) {
//     console.error("Password reset error:", error)
//     return false
//   }
// }

// // ✅ NEW — decode token client-side for session restoration
// export function decodeTokenLocally(token: string): Partial<User> | null {
//   try {
//     const decoded = jwtDecode<Partial<User>>(token)
//     return decoded
//   } catch (err) {
//     console.error("Client-side token decode error:", err)
//     return null
//   }
// }


// export async function getAuth(request: NextRequest): Promise<{ user: User | null }> {
//   const token = request.headers.get("authorization")?.split(" ")[1];

//   if (!token) {
//     return { user: null };
//   }

//   const user = await getUserFromToken(token);
//   return { user };
// }

// auth.ts

import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { sql } from "@/lib/db"
import { Resend } from "resend"
import { jwtDecode } from "jwt-decode"
import { type NextRequest } from "next/server"
import { promises as dns } from "dns"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

// Lazy Resend client — only created when actually needed
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is not set. Cannot send emails.")
  return new Resend(apiKey)
}

export interface User {
  id: number
  full_name: string
  email: string
  phone?: string
  age?: number
  sex?: string
  role: "student" | "instructor" | "admin"
  profile_picture?: string
  email_verified: boolean
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  message?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

const secretKey = new TextEncoder().encode(JWT_SECRET)

export async function generateToken(user: User): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey)
}

export async function verifyToken(token: string): Promise<any | null> {
  try {
    if (!token) return null
    const cleanToken = token.trim().replace(/^Bearer\s+/i, "")
    const tokenParts = cleanToken.split(".")
    if (tokenParts.length !== 3) return null
    const { payload } = await jwtVerify(cleanToken, secretKey)
    return payload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// ─── EMAIL DOMAIN VALIDATION ────────────────────────────────────────────────

/**
 * Checks whether the domain of an email address has valid MX records,
 * meaning it is a real domain that can actually receive emails.
 */
export async function checkEmailDomainExists(email: string): Promise<boolean> {
  try {
    const domain = email.split("@")[1]
    if (!domain) return false
    // Try MX records first (preferred — means domain accepts email)
    const mxRecords = await dns.resolveMx(domain)
    return mxRecords.length > 0
  } catch {
    // If MX lookup fails, fall back to A record check
    try {
      const domain = email.split("@")[1]
      const aRecords = await dns.resolve4(domain)
      return aRecords.length > 0
    } catch {
      return false
    }
  }
}

// ─── WELCOME EMAIL ───────────────────────────────────────────────────────────

export async function sendWelcomeEmail(user: User): Promise<void> {
  try {
    const resend = getResendClient()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    await resend.emails.send({
      from: "BBMI <no-reply@brushedbybetty.com>",
      to: user.email,
      subject: "Welcome to BBMI — Brushed By Betty Makeup Institute! 🎉",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to BBMI</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1E3A5F;padding:36px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:bold;letter-spacing:2px;">BBMI</h1>
              <p style="color:#A8D0F0;margin:6px 0 0;font-size:14px;">Brushed By Betty Makeup Institute</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#1E3A5F;margin:0 0 16px;font-size:22px;">
                Welcome, ${user.full_name}! 🎉
              </h2>
              <p style="color:#444444;font-size:15px;line-height:1.7;margin:0 0 16px;">
                We're thrilled to have you join the BBMI community. Your account has been created successfully and you're now ready to start your professional beauty journey.
              </p>
              <p style="color:#444444;font-size:15px;line-height:1.7;margin:0 0 24px;">
                BBMI is dedicated to helping makeup artists succeed in their professional careers by improving makeup techniques and knowledge in marketing, photography, and entrepreneurship.
              </p>

              <!-- What's next box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EBF3FB;border-left:4px solid #2E6DA4;border-radius:4px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#1E3A5F;font-weight:bold;font-size:15px;margin:0 0 12px;">What you can do next:</p>
                    <p style="color:#444444;font-size:14px;margin:6px 0;">✅ &nbsp;Browse our professional makeup courses</p>
                    <p style="color:#444444;font-size:14px;margin:6px 0;">✅ &nbsp;Enroll in your first course and start learning</p>
                    <p style="color:#444444;font-size:14px;margin:6px 0;">✅ &nbsp;Earn certificates to showcase your skills</p>
                    <p style="color:#444444;font-size:14px;margin:6px 0;">✅ &nbsp;Connect with instructors and fellow students</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${baseUrl}/courses"
                      style="background-color:#B87333;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">
                      Explore Courses
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#444444;font-size:15px;line-height:1.7;margin:0 0 8px;">
                If you have any questions, feel free to reach out to us at any time. We're here to support your journey every step of the way.
              </p>
              <p style="color:#444444;font-size:15px;line-height:1.7;margin:0;">
                Welcome aboard,<br/>
                <strong style="color:#1E3A5F;">The BBMI Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="color:#999999;font-size:12px;margin:0 0 6px;">
                © ${new Date().getFullYear()} Brushed By Betty Makeup Institute. All rights reserved.
              </p>
              <p style="color:#999999;font-size:12px;margin:0;">
                <a href="${baseUrl}" style="color:#2E6DA4;text-decoration:none;">brushedbybetty.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })
  } catch (error) {
    // Never let a failed welcome email break registration
    console.error("Failed to send welcome email:", error)
  }
}

// ─── REGISTER ────────────────────────────────────────────────────────────────

export async function registerUser(userData: {
  full_name: string
  email: string
  phone?: string
  age?: number
  sex?: string
  password: string
  profile_picture?: string
}): Promise<AuthResult> {
  try {
    // Check if email domain is real (has MX or A records)
    const domainIsReal = await checkEmailDomainExists(userData.email)
    if (!domainIsReal) {
      return {
        success: false,
        message: "This email address does not appear to be valid. Please use a real email address.",
      }
    }

    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${userData.email.toLowerCase()}
    `
    if (existingUser.length > 0) {
      return { success: false, message: "User with this email already exists" }
    }

    const hashedPassword = await hashPassword(userData.password)
    const result = await sql`
      INSERT INTO users (full_name, email, phone, age, sex, password_hash, profile_picture, role, email_verified)
      VALUES (
        ${userData.full_name},
        ${userData.email.toLowerCase()},
        ${userData.phone || null},
        ${userData.age || null},
        ${userData.sex || null},
        ${hashedPassword},
        ${userData.profile_picture || null},
        'student',
        false
      )
      RETURNING id, full_name, email, phone, age, sex, role, profile_picture, email_verified
    `

    const user = result[0] as User
    const token = await generateToken(user)

    // Send welcome email — runs after successful registration, never blocks it
    await sendWelcomeEmail(user)

    return { success: true, user, token }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "Registration failed. Please try again." }
  }
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await sql`
      SELECT id, full_name, email, phone, age, sex, password_hash, role, profile_picture, email_verified
      FROM users 
      WHERE email = ${email.toLowerCase()}
    `

    if (result.length === 0) {
      return { success: false, message: "Invalid email or password" }
    }

    const user = result[0]
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return { success: false, message: "Invalid email or password" }
    }

    const { password_hash, ...userWithoutPassword } = user
    const token = await generateToken(userWithoutPassword as User)

    return { success: true, user: userWithoutPassword as User, token }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "Login failed. Please try again." }
  }
}

// ─── OTHER AUTH FUNCTIONS (unchanged) ────────────────────────────────────────

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const decoded = await verifyToken(token)
    if (!decoded) return null

    const result = await sql`
      SELECT id, full_name, email, phone, age, sex, role, profile_picture, email_verified
      FROM users 
      WHERE id = ${decoded.id}
    `
    if (result.length > 0) return result[0] as User
    return null
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function createResetToken(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const users = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `
    if (users.length === 0) {
      return { success: false, message: "Email is not registered in our system." }
    }

    const resetToken = generateResetToken()
    const expiresAt = new Date(Date.now() + 3600000)

    try {
      await sql`
        UPDATE users 
        SET reset_token = ${resetToken}, reset_token_expires = ${expiresAt}
        WHERE email = ${email.toLowerCase()}
      `
    } catch (dbErr) {
      console.warn("Could not update reset_token columns on users table:", dbErr)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    try {
      const resend = getResendClient()
      await resend.emails.send({
        from: "BBMI <no-reply@brushedbybetty.com>",
        to: email,
        subject: "Reset your BBMI password",
        html: `
          <p>Hi,</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can ignore this email.</p>
        `,
      })
    } catch (mailErr) {
      console.warn("Mailer failed. Password reset link:", resetUrl)
      return {
        success: true,
        message: `Password reset link generated (email not sent): ${resetUrl}`,
      }
    }

    return {
      success: true,
      message: "Password reset link sent! Please check your email inbox or spam folder.",
    }
  } catch (error) {
    console.error("Error generating password reset token:", error)
    return { success: false, message: "Failed to generate password reset token. Please try again." }
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  try {
    const hashedPassword = await hashPassword(newPassword)
    const result = await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}, reset_token = NULL, reset_token_expires = NULL
      WHERE reset_token = ${token} AND reset_token_expires > NOW()
      RETURNING id
    `
    return result.length > 0
  } catch (error) {
    console.error("Password reset error:", error)
    return false
  }
}

export function decodeTokenLocally(token: string): Partial<User> | null {
  try {
    const decoded = jwtDecode<Partial<User>>(token)
    return decoded
  } catch (err) {
    console.error("Client-side token decode error:", err)
    return null
  }
}

export async function getAuth(request: NextRequest): Promise<{ user: User | null }> {
  const token = request.headers.get("authorization")?.split(" ")[1]
  if (!token) return { user: null }
  const user = await getUserFromToken(token)
  return { user }
}