// import bcrypt from "bcryptjs"
// import { SignJWT, jwtVerify } from "jose"
// import { sql } from "@/lib/db"
// import { Resend } from "resend"
// import { jwtDecode } from "jwt-decode"
// import { type NextRequest } from "next/server"
// import { promises as dns } from "dns"
// import crypto from "crypto"
 
// const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
 
// // Lazy Resend client — only created when actually needed
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
//   privileges?: string[]
//   is_super_admin?: boolean
// }
 
// export interface AuthResult {
//   success: boolean
//   user?: User
//   token?: string
//   message?: string
//   requiresVerification?: boolean
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
//     privileges: user.privileges,
//     is_super_admin: user.is_super_admin,
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
 
// // ─── EMAIL DOMAIN VALIDATION ─────────────────────────────────────────────────
 
// export async function checkEmailDomainExists(email: string): Promise<boolean> {
//   try {
//     const domain = email.split("@")[1]
//     if (!domain) return false
//     const mxRecords = await dns.resolveMx(domain)
//     return mxRecords.length > 0
//   } catch {
//     try {
//       const domain = email.split("@")[1]
//       const aRecords = await dns.resolve4(domain)
//       return aRecords.length > 0
//     } catch {
//       return false
//     }
//   }
// }
 
// // ─── VERIFICATION TOKEN ───────────────────────────────────────────────────────
 
// export function generateVerificationToken(): string {
//   // Cryptographically secure random token
//   return crypto.randomBytes(32).toString("hex")
// }
 
// // ─── SEND VERIFICATION EMAIL ──────────────────────────────────────────────────
 
// export async function sendVerificationEmail(user: User, token: string): Promise<void> {
//   try {
//     const resend = getResendClient()
//     const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
//     const verifyUrl = `${baseUrl}/verify-email?token=${token}`
 
//     await resend.emails.send({
//       from: "BBMI <no-reply@brushedbybetty.com>",
//       to: user.email,
//       subject: "Please verify your email — BBMI",
//       html: `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>Verify your email</title>
// </head>
// <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
//     <tr>
//       <td align="center">
//         <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
 
//           <!-- Header -->
//           <tr>
//             <td style="background-color:#1E3A5F;padding:36px 40px;text-align:center;">
//               <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:bold;letter-spacing:2px;">BBMI</h1>
//               <p style="color:#A8D0F0;margin:6px 0 0;font-size:14px;">Brushed By Betty Makeup Institute</p>
//             </td>
//           </tr>
 
//           <!-- Body -->
//           <tr>
//             <td style="padding:40px;">
//               <h2 style="color:#1E3A5F;margin:0 0 16px;font-size:22px;">
//                 Hi ${user.full_name}, please verify your email ✉️
//               </h2>
//               <p style="color:#444444;font-size:15px;line-height:1.7;margin:0 0 16px;">
//                 Thank you for creating your BBMI account! To complete your registration and access all courses, please verify your email address by clicking the button below.
//               </p>
 
//               <!-- Verify Button -->
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td align="center" style="padding:24px 0 32px;">
//                     <a href="${verifyUrl}"
//                       style="background-color:#B87333;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">
//                       Verify My Email
//                     </a>
//                   </td>
//                 </tr>
//               </table>
 
//               <!-- Link fallback -->
//               <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EBF3FB;border-left:4px solid #2E6DA4;border-radius:4px;margin-bottom:28px;">
//                 <tr>
//                   <td style="padding:16px 20px;">
//                     <p style="color:#444444;font-size:13px;margin:0 0 8px;">If the button doesn't work, copy and paste this link into your browser:</p>
//                     <p style="color:#2E6DA4;font-size:13px;margin:0;word-break:break-all;">${verifyUrl}</p>
//                   </td>
//                 </tr>
//               </table>
 
//               <p style="color:#888888;font-size:13px;line-height:1.6;margin:0 0 8px;">
//                 ⏳ This link expires in <strong>24 hours</strong>.
//               </p>
//               <p style="color:#888888;font-size:13px;line-height:1.6;margin:0;">
//                 If you didn't create a BBMI account, you can safely ignore this email.
//               </p>
//             </td>
//           </tr>
 
//           <!-- Footer -->
//           <tr>
//             <td style="background-color:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #eeeeee;">
//               <p style="color:#999999;font-size:12px;margin:0 0 6px;">
//                 © ${new Date().getFullYear()} Brushed By Betty Makeup Institute. All rights reserved.
//               </p>
//               <p style="color:#999999;font-size:12px;margin:0;">
//                 <a href="${baseUrl}" style="color:#2E6DA4;text-decoration:none;">brushedbybetty.com</a>
//               </p>
//             </td>
//           </tr>
 
//         </table>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>
//       `,
//     })
//   } catch (error) {
//     console.error("Failed to send verification email:", error)
//     throw error // re-throw so caller knows it failed
//   }
// }
 
// // ─── SEND WELCOME EMAIL (sent after verification, not registration) ───────────
 
// export async function sendWelcomeEmail(user: User): Promise<void> {
//   try {
//     const resend = getResendClient()
//     const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
 
//     await resend.emails.send({
//       from: "BBMI <no-reply@brushedbybetty.com>",
//       to: user.email,
//       subject: "Welcome to BBMI — You're all set! 🎉",
//       html: `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>Welcome to BBMI</title>
// </head>
// <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
//     <tr>
//       <td align="center">
//         <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
 
//           <!-- Header -->
//           <tr>
//             <td style="background-color:#1E3A5F;padding:36px 40px;text-align:center;">
//               <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:bold;letter-spacing:2px;">BBMI</h1>
//               <p style="color:#A8D0F0;margin:6px 0 0;font-size:14px;">Brushed By Betty Makeup Institute</p>
//             </td>
//           </tr>
 
//           <!-- Body -->
//           <tr>
//             <td style="padding:40px;">
//               <h2 style="color:#1E3A5F;margin:0 0 16px;font-size:22px;">
//                 Welcome, ${user.full_name}! Your email is verified 🎉
//               </h2>
//               <p style="color:#444444;font-size:15px;line-height:1.7;margin:0 0 16px;">
//                 Your account is now fully active. You're ready to start your professional beauty journey with BBMI!
//               </p>
 
//               <!-- What's next box -->
//               <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EBF3FB;border-left:4px solid #2E6DA4;border-radius:4px;margin-bottom:28px;">
//                 <tr>
//                   <td style="padding:20px 24px;">
//                     <p style="color:#1E3A5F;font-weight:bold;font-size:15px;margin:0 0 12px;">What you can do now:</p>
//                     <p style="color:#444444;font-size:14px;margin:6px 0;">✅ &nbsp;Browse our professional makeup courses</p>
//                     <p style="color:#444444;font-size:14px;margin:6px 0;">✅ &nbsp;Enroll in your first course and start learning</p>
//                     <p style="color:#444444;font-size:14px;margin:6px 0;">✅ &nbsp;Earn certificates to showcase your skills</p>
//                     <p style="color:#444444;font-size:14px;margin:6px 0;">✅ &nbsp;Connect with instructors and fellow students</p>
//                   </td>
//                 </tr>
//               </table>
 
//               <!-- CTA Button -->
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td align="center" style="padding:8px 0 32px;">
//                     <a href="${baseUrl}/courses"
//                       style="background-color:#B87333;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">
//                       Explore Courses
//                     </a>
//                   </td>
//                 </tr>
//               </table>
 
//               <p style="color:#444444;font-size:15px;line-height:1.7;margin:0;">
//                 Welcome aboard,<br/>
//                 <strong style="color:#1E3A5F;">The BBMI Team</strong>
//               </p>
//             </td>
//           </tr>
 
//           <!-- Footer -->
//           <tr>
//             <td style="background-color:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #eeeeee;">
//               <p style="color:#999999;font-size:12px;margin:0 0 6px;">
//                 © ${new Date().getFullYear()} Brushed By Betty Makeup Institute. All rights reserved.
//               </p>
//               <p style="color:#999999;font-size:12px;margin:0;">
//                 <a href="${baseUrl}" style="color:#2E6DA4;text-decoration:none;">brushedbybetty.com</a>
//               </p>
//             </td>
//           </tr>
 
//         </table>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>
//       `,
//     })
//   } catch (error) {
//     // Never let a failed welcome email break anything
//     console.error("Failed to send welcome email:", error)
//   }
// }
 
// // ─── REGISTER ────────────────────────────────────────────────────────────────
 
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
//     // Check if email domain is real
//     const domainIsReal = await checkEmailDomainExists(userData.email)
//     if (!domainIsReal) {
//       return {
//         success: false,
//         message: "This email address does not appear to be valid. Please use a real email address.",
//       }
//     }
 
//     // Check if email already exists
//     const existingUser = await sql`
//       SELECT id FROM users WHERE email = ${userData.email.toLowerCase()}
//     `
//     if (existingUser.length > 0) {
//       return { success: false, message: "User with this email already exists" }
//     }
 
//     const hashedPassword = await hashPassword(userData.password)
 
//     // Generate verification token — expires in 24 hours
//     const verificationToken = generateVerificationToken()
//     const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
 
//     // Insert user with status = pending_verification and email_verified = false
//     const result = await sql`
//       INSERT INTO users (
//         full_name, email, phone, age, sex, password_hash, profile_picture,
//         role, email_verified, is_super_admin, privileges, status,
//         verification_token, verification_token_expires
//       )
//       VALUES (
//         ${userData.full_name},
//         ${userData.email.toLowerCase()},
//         ${userData.phone || null},
//         ${userData.age || null},
//         ${userData.sex || null},
//         ${hashedPassword},
//         ${userData.profile_picture || null},
//         'student',
//         false,
//         false,
//         '[]'::jsonb,
//         'pending_verification',
//         ${verificationToken},
//         ${verificationExpires}
//       )
//       RETURNING id, full_name, email, phone, age, sex, role, profile_picture, email_verified, is_super_admin, privileges
//     `
 
//     const user = result[0] as User
 
//     // Send verification email — if this fails, we still return success
//     // so the user knows their account was created, but log the error
//     try {
//       await sendVerificationEmail(user, verificationToken)
//     } catch (emailError) {
//       console.error("Verification email failed to send:", emailError)
//       // Still return success — user can request resend from login page
//     }
 
//     // Note: we do NOT generate a JWT token here — user must verify first
//     return {
//       success: true,
//       message: "Account created! Please check your email to verify your account before logging in.",
//       requiresVerification: true,
//     }
//   } catch (error) {
//     console.error("Registration error:", error)
//     return { success: false, message: "Registration failed. Please try again." }
//   }
// }
 
// // ─── VERIFY EMAIL TOKEN ───────────────────────────────────────────────────────
 
// export async function verifyEmailToken(token: string): Promise<{
//   success: boolean
//   message: string
//   user?: User
// }> {
//   try {
//     // Find user with this token that hasn't expired
//     const result = await sql`
//       SELECT id, full_name, email, phone, age, sex, role, profile_picture, email_verified
//       FROM users
//       WHERE verification_token = ${token}
//         AND verification_token_expires > NOW()
//         AND email_verified = false
//     `
 
//     if (result.length === 0) {
//       // Check if token exists but is expired
//       const expiredCheck = await sql`
//         SELECT id FROM users
//         WHERE verification_token = ${token}
//           AND email_verified = false
//       `
//       if (expiredCheck.length > 0) {
//         return {
//           success: false,
//           message: "This verification link has expired. Please request a new one.",
//         }
//       }
//       // Token doesn't exist at all, or already verified
//       return {
//         success: false,
//         message: "This verification link is invalid or has already been used.",
//       }
//     }
 
//     const user = result[0] as User
 
//     // Mark email as verified, set status to active, clear token
//     await sql`
//       UPDATE users
//       SET
//         email_verified = true,
//         status = 'active',
//         verification_token = NULL,
//         verification_token_expires = NULL
//       WHERE id = ${user.id}
//     `
 
//     // Send welcome email now that they're verified
//     await sendWelcomeEmail({ ...user, email_verified: true })
 
//     return {
//       success: true,
//       message: "Your email has been verified successfully! You can now log in.",
//       user: { ...user, email_verified: true },
//     }
//   } catch (error) {
//     console.error("Email verification error:", error)
//     return { success: false, message: "Verification failed. Please try again." }
//   }
// }
 
// // ─── RESEND VERIFICATION EMAIL ────────────────────────────────────────────────
 
// export async function resendVerificationEmail(email: string): Promise<{
//   success: boolean
//   message: string
// }> {
//   try {
//     const result = await sql`
//       SELECT id, full_name, email, phone, age, sex, role, profile_picture, email_verified
//       FROM users
//       WHERE email = ${email.toLowerCase()}
//         AND email_verified = false
//     `
 
//     if (result.length === 0) {
//       // Don't reveal whether email exists or is already verified
//       return {
//         success: true,
//         message: "If this email exists and is unverified, a new verification link has been sent.",
//       }
//     }
 
//     const user = result[0] as User
 
//     // Generate a fresh token
//     const verificationToken = generateVerificationToken()
//     const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
 
//     await sql`
//       UPDATE users
//       SET
//         verification_token = ${verificationToken},
//         verification_token_expires = ${verificationExpires}
//       WHERE id = ${user.id}
//     `
 
//     await sendVerificationEmail(user, verificationToken)
 
//     return {
//       success: true,
//       message: "A new verification link has been sent to your email.",
//     }
//   } catch (error) {
//     console.error("Resend verification error:", error)
//     return { success: false, message: "Failed to resend verification email. Please try again." }
//   }
// }
 
// // ─── LOGIN ────────────────────────────────────────────────────────────────────
 
// export async function loginUser(email: string, password: string): Promise<AuthResult> {
//   try {
//     const result = await sql`
//       SELECT id, full_name, email, phone, age, sex, password_hash, role, profile_picture, email_verified, is_super_admin, privileges, status
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
 
//     // Block login if email not verified
//     if (!user.email_verified || user.status === "pending_verification") {
//       return {
//         success: false,
//         message: "Please verify your email before logging in. Check your inbox for the verification link.",
//         requiresVerification: true,
//       }
//     }
 
//     const { password_hash, status, ...userWithoutSensitive } = user
//     const token = await generateToken(userWithoutSensitive as User)
 
//     return { success: true, user: userWithoutSensitive as User, token }
//   } catch (error) {
//     console.error("Login error:", error)
//     return { success: false, message: "Login failed. Please try again." }
//   }
// }
 
// // ─── OTHER AUTH FUNCTIONS (unchanged) ────────────────────────────────────────
 
// export async function getUserFromToken(token: string): Promise<User | null> {
//   try {
//     const decoded = await verifyToken(token)
//     if (!decoded) return null
//     const result = await sql`
//       SELECT id, full_name, email, phone, age, sex, role, profile_picture, email_verified, is_super_admin, privileges
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
//       await resend.emails.send({
//         from: "BBMI <no-reply@brushedbybetty.com>",
//         to: email,
//         subject: "Reset your BBMI password",
//         html: `
//           <p>Hi,</p>
//           <p>You requested a password reset. Click the link below to reset your password:</p>
//           <p><a href="${resetUrl}">${resetUrl}</a></p>
//           <p>This link will expire in 1 hour.</p>
//           <p>If you didn't request this, you can ignore this email.</p>
//         `,
//       })
//     } catch (mailErr) {
//       console.warn("Mailer failed. Password reset link:", resetUrl)
//       return {
//         success: true,
//         message: `Password reset link generated (email not sent): ${resetUrl}`,
//       }
//     }
 
//     return {
//       success: true,
//       message: "Password reset link sent! Please check your email inbox or spam folder.",
//     }
//   } catch (error) {
//     console.error("Error generating password reset token:", error)
//     return { success: false, message: "Failed to generate password reset token. Please try again." }
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
//   const token = request.headers.get("authorization")?.split(" ")[1]
//   if (!token) return { user: null }
//   const user = await getUserFromToken(token)
//   return { user }
// }
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { sql } from "@/lib/db"
import { Resend } from "resend"
import { jwtDecode } from "jwt-decode"
import { type NextRequest } from "next/server"
import { promises as dns } from "dns"
import crypto from "crypto"

// Lazy Resend client — only created when actually needed
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is not set. Cannot send emails.")
  return new Resend(apiKey)
}

// Lazy JWT secret — checked only when a token is actually being created or
// verified, never at module-load/build time. This intentionally has NO
// fallback string: if JWT_SECRET is missing, every login/auth call fails
// loudly with a clear error instead of silently signing tokens with a
// secret that's visible to anyone who has read the source code.
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is not set. Refusing to sign or verify tokens — " +
      "using a hardcoded fallback secret would let anyone with access to the source code " +
      "forge valid login tokens for any user."
    )
  }
  return new TextEncoder().encode(secret)
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
  privileges?: string[]
  is_super_admin?: boolean
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  message?: string
  requiresVerification?: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(user: User): Promise<string> {
  const secretKey = getJwtSecret()
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    privileges: user.privileges,
    is_super_admin: user.is_super_admin,
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
    const secretKey = getJwtSecret()
    const { payload } = await jwtVerify(cleanToken, secretKey)
    return payload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// ─── EMAIL DOMAIN VALIDATION ─────────────────────────────────────────────────

export async function checkEmailDomainExists(email: string): Promise<boolean> {
  try {
    const domain = email.split("@")[1]
    if (!domain) return false
    const mxRecords = await dns.resolveMx(domain)
    return mxRecords.length > 0
  } catch {
    try {
      const domain = email.split("@")[1]
      const aRecords = await dns.resolve4(domain)
      return aRecords.length > 0
    } catch {
      return false
    }
  }
}

// ─── VERIFICATION TOKEN ───────────────────────────────────────────────────────

export function generateVerificationToken(): string {
  // Cryptographically secure random token
  return crypto.randomBytes(32).toString("hex")
}

// ─── SEND VERIFICATION EMAIL ──────────────────────────────────────────────────

export async function sendVerificationEmail(user: User, token: string): Promise<void> {
  try {
    const resend = getResendClient()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`

    await resend.emails.send({
      from: "BBMI <no-reply@brushedbybetty.com>",
      to: user.email,
      subject: "Please verify your email — BBMI",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email</title>
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
                Hi ${user.full_name}, please verify your email ✉️
              </h2>
              <p style="color:#444444;font-size:15px;line-height:1.7;margin:0 0 16px;">
                Thank you for creating your BBMI account! To complete your registration and access all courses, please verify your email address by clicking the button below.
              </p>

              <!-- Verify Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:24px 0 32px;">
                    <a href="${verifyUrl}"
                      style="background-color:#B87333;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">
                      Verify My Email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EBF3FB;border-left:4px solid #2E6DA4;border-radius:4px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#444444;font-size:13px;margin:0 0 8px;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="color:#2E6DA4;font-size:13px;margin:0;word-break:break-all;">${verifyUrl}</p>
                  </td>
                </tr>
              </table>

              <p style="color:#888888;font-size:13px;line-height:1.6;margin:0 0 8px;">
                ⏳ This link expires in <strong>24 hours</strong>.
              </p>
              <p style="color:#888888;font-size:13px;line-height:1.6;margin:0;">
                If you didn't create a BBMI account, you can safely ignore this email.
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
    console.error("Failed to send verification email:", error)
    throw error // re-throw so caller knows it failed
  }
}

// ─── SEND WELCOME EMAIL (sent after verification, not registration) ───────────

export async function sendWelcomeEmail(user: User): Promise<void> {
  try {
    const resend = getResendClient()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    await resend.emails.send({
      from: "BBMI <no-reply@brushedbybetty.com>",
      to: user.email,
      subject: "Welcome to BBMI — You're all set! 🎉",
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
                Welcome, ${user.full_name}! Your email is verified 🎉
              </h2>
              <p style="color:#444444;font-size:15px;line-height:1.7;margin:0 0 16px;">
                Your account is now fully active. You're ready to start your professional beauty journey with BBMI!
              </p>

              <!-- What's next box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EBF3FB;border-left:4px solid #2E6DA4;border-radius:4px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#1E3A5F;font-weight:bold;font-size:15px;margin:0 0 12px;">What you can do now:</p>
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
    // Never let a failed welcome email break anything
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
    // Check if email domain is real
    const domainIsReal = await checkEmailDomainExists(userData.email)
    if (!domainIsReal) {
      return {
        success: false,
        message: "This email address does not appear to be valid. Please use a real email address.",
      }
    }

    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${userData.email.toLowerCase()}
    `
    if (existingUser.length > 0) {
      return { success: false, message: "User with this email already exists" }
    }

    const hashedPassword = await hashPassword(userData.password)

    // Generate verification token — expires in 24 hours
    const verificationToken = generateVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Insert user with status = pending_verification and email_verified = false
    const result = await sql`
      INSERT INTO users (
        full_name, email, phone, age, sex, password_hash, profile_picture,
        role, email_verified, is_super_admin, privileges, status,
        verification_token, verification_token_expires
      )
      VALUES (
        ${userData.full_name},
        ${userData.email.toLowerCase()},
        ${userData.phone || null},
        ${userData.age || null},
        ${userData.sex || null},
        ${hashedPassword},
        ${userData.profile_picture || null},
        'student',
        false,
        false,
        '[]'::jsonb,
        'pending_verification',
        ${verificationToken},
        ${verificationExpires}
      )
      RETURNING id, full_name, email, phone, age, sex, role, profile_picture, email_verified, is_super_admin, privileges
    `

    const user = result[0] as User

    // Send verification email — if this fails, we still return success
    // so the user knows their account was created, but log the error
    try {
      await sendVerificationEmail(user, verificationToken)
    } catch (emailError) {
      console.error("Verification email failed to send:", emailError)
      // Still return success — user can request resend from login page
    }

    // Note: we do NOT generate a JWT token here — user must verify first
    return {
      success: true,
      message: "Account created! Please check your email to verify your account before logging in.",
      requiresVerification: true,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "Registration failed. Please try again." }
  }
}

// ─── VERIFY EMAIL TOKEN ───────────────────────────────────────────────────────

export async function verifyEmailToken(token: string): Promise<{
  success: boolean
  message: string
  user?: User
}> {
  try {
    // Find user with this token that hasn't expired
    const result = await sql`
      SELECT id, full_name, email, phone, age, sex, role, profile_picture, email_verified
      FROM users
      WHERE verification_token = ${token}
        AND verification_token_expires > NOW()
        AND email_verified = false
    `

    if (result.length === 0) {
      // Check if token exists but is expired
      const expiredCheck = await sql`
        SELECT id FROM users
        WHERE verification_token = ${token}
          AND email_verified = false
      `
      if (expiredCheck.length > 0) {
        return {
          success: false,
          message: "This verification link has expired. Please request a new one.",
        }
      }
      // Token doesn't exist at all, or already verified
      return {
        success: false,
        message: "This verification link is invalid or has already been used.",
      }
    }

    const user = result[0] as User

    // Mark email as verified, set status to active, clear token
    await sql`
      UPDATE users
      SET
        email_verified = true,
        status = 'active',
        verification_token = NULL,
        verification_token_expires = NULL
      WHERE id = ${user.id}
    `

    // Send welcome email now that they're verified
    await sendWelcomeEmail({ ...user, email_verified: true })

    return {
      success: true,
      message: "Your email has been verified successfully! You can now log in.",
      user: { ...user, email_verified: true },
    }
  } catch (error) {
    console.error("Email verification error:", error)
    return { success: false, message: "Verification failed. Please try again." }
  }
}

// ─── RESEND VERIFICATION EMAIL ────────────────────────────────────────────────

export async function resendVerificationEmail(email: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    const result = await sql`
      SELECT id, full_name, email, phone, age, sex, role, profile_picture, email_verified
      FROM users
      WHERE email = ${email.toLowerCase()}
        AND email_verified = false
    `

    if (result.length === 0) {
      // Don't reveal whether email exists or is already verified
      return {
        success: true,
        message: "If this email exists and is unverified, a new verification link has been sent.",
      }
    }

    const user = result[0] as User

    // Generate a fresh token
    const verificationToken = generateVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await sql`
      UPDATE users
      SET
        verification_token = ${verificationToken},
        verification_token_expires = ${verificationExpires}
      WHERE id = ${user.id}
    `

    await sendVerificationEmail(user, verificationToken)

    return {
      success: true,
      message: "A new verification link has been sent to your email.",
    }
  } catch (error) {
    console.error("Resend verification error:", error)
    return { success: false, message: "Failed to resend verification email. Please try again." }
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await sql`
      SELECT id, full_name, email, phone, age, sex, password_hash, role, profile_picture, email_verified, is_super_admin, privileges, status
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

    // Block login if email not verified
    if (!user.email_verified || user.status === "pending_verification") {
      return {
        success: false,
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        requiresVerification: true,
      }
    }

    const { password_hash, status, ...userWithoutSensitive } = user
    const token = await generateToken(userWithoutSensitive as User)

    return { success: true, user: userWithoutSensitive as User, token }
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
      SELECT id, full_name, email, phone, age, sex, role, profile_picture, email_verified, is_super_admin, privileges
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
  // Cryptographically secure random token — this token grants password
  // reset access, so it must be unpredictable in the same way the email
  // verification token is. Math.random() is NOT safe for this purpose.
  return crypto.randomBytes(32).toString("hex")
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