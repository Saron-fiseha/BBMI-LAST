// // import { type NextRequest, NextResponse } from "next/server"
// // import { getUserFromToken } from "@/lib/auth"
// // import { sql } from "@/lib/db"
// // import bcrypt from "bcryptjs"

// // export async function POST(request: NextRequest) {


  
// //   try {
// //     const token = request.headers.get("authorization")?.replace("Bearer ", "")

// //     if (!token) {
// //       return NextResponse.json({ error: "No token provided" }, { status: 401 })
// //     }

// //     const user = await getUserFromToken(token)
// //     if (!user || user.role !== "instructor") {
// //       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
// //     }

// //     const body = await request.json()
// //     const { currentPassword, newPassword } = body

// //     if (!currentPassword || !newPassword) {
// //       return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
// //     }

// //     if (newPassword.length < 8) {
// //       return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 })
// //     }

// //     try {
// //       // Get current password hash
// //       // const userResult = await sql`
// //       //   SELECT password FROM users WHERE id = ${user.id}
// //       // `
// //       const tableName = user.role === "instructor" ? "instructors" : "users"

// // const userResult = await sql`
// //   SELECT password FROM ${sql.raw(tableName)} WHERE id = ${user.id}
// // `


// //       if (userResult.length === 0) {
// //         return NextResponse.json({ error: "User not found" }, { status: 404 })
// //       }



// //     const currentPasswordHash = userResult[0].password

// // console.log("User ID from token:", user.id)
// // console.log("User role from token:", user.role)



// //       // Verify current password
// //       const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash)
// //       if (!isCurrentPasswordValid) {
// //         return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
// //       }

// //       // Hash new password
// //       const saltRounds = 12
// //       const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)



// //       // Update password
// //       // await sql`
// //       //   UPDATE users 
// //       //   SET password = ${newPasswordHash}, updated_at = NOW()
// //       //   WHERE id = ${user.id}
// //       // `
// //       await sql`
// //   UPDATE ${sql.raw(tableName)} 
// //   SET password = ${newPasswordHash}, updated_at = NOW()
// //   WHERE id = ${user.id}
// // `



// //       return NextResponse.json({ message: "Password changed successfully" })
// //     } catch (dbError) {
// //       console.error("Database error:", dbError)
// //       return NextResponse.json({ error: "Database error" }, { status: 500 })
// //     }
// //   } catch (error) {
// //     console.error("Error changing password:", error)
// //     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
// //   }
// // }
// import { type NextRequest, NextResponse } from "next/server"
// import { getUserFromToken } from "@/lib/auth"
// import { sql } from "@/lib/db"
// import bcrypt from "bcryptjs"


// export async function POST(request: NextRequest) {
//   try {
//     // Get token from header
//     const token = request.headers.get("authorization")?.replace("Bearer ", "")
//     if (!token) {
//       return NextResponse.json({ error: "No token provided" }, { status: 401 })
//     }

//     // Decode and verify user from token
//     const user = await getUserFromToken(token)
//     if (!user || !user.role) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     console.log("User found in DB:", user.email, "Role:", user.role)
//     console.log("User ID from token:", user.id)
//     console.log("User role from token:", user.role)

//     // Parse request body
//     const body = await request.json()
//     const { currentPassword, newPassword } = body

//     if (!currentPassword || !newPassword) {
//       return NextResponse.json(
//         { error: "Current password and new password are required" },
//         { status: 400 }
//       )
//     }

//     if (newPassword.length < 8) {
//       return NextResponse.json(
//         { error: "New password must be at least 8 characters long" },
//         { status: 400 }
//       )
//     }

//     // ✅ Determine the table dynamically
//     const tableName = user.role === "instructor" ? "instructors" : "users"

//     // ✅ Get current password hash
//   const userResult = await sql`
//   SELECT password FROM users WHERE id = ${user.id}
// `




//     if (userResult.length === 0) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 })
//     }

//     const passwordFromDB = userResult[0].password
//     console.log("Password from DB:", passwordFromDB)

//     if (!passwordFromDB) {
//       return NextResponse.json(
//         { error: "This account does not have a password set. Please contact support." },
//         { status: 400 }
//       )
//     }

//     // ✅ Ensure the hash is a string
//     const currentPasswordHash = typeof passwordFromDB === "string"
//       ? passwordFromDB
//       : Buffer.isBuffer(passwordFromDB)
//         ? passwordFromDB.toString("utf-8")
//         : String(passwordFromDB)

// console.log("=== Password Change Debug ===");
// console.log("INPUT currentPassword:", JSON.stringify(currentPassword));
// console.log("DB HASH currentPasswordHash:", currentPasswordHash);
// console.log("LENGTH of currentPasswordHash:", currentPasswordHash.length);
// console.log("BYTES of currentPasswordHash:", Buffer.from(currentPasswordHash, 'utf8'));


//     // ✅ Verify current password
//     const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash)
//     if (!isCurrentPasswordValid) {
//       return NextResponse.json(
//         { error: "Current password is incorrect" },
//         { status: 400 }
//       )
//     }

//     // ✅ Hash new password
//     const saltRounds = 12
//     const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

// console.log("Received currentPassword:", JSON.stringify(currentPassword))
// console.log("Received newPassword:", JSON.stringify(newPassword))
// console.log("=== DEBUG compare input ===");
// console.log("Input currentPassword:", JSON.stringify(currentPassword));
// console.log("Stored password hash:", currentPasswordHash);


//     // ✅ Update password in the correct table
//  await sql`
//   UPDATE users SET password = ${newPasswordHash}, updated_at = NOW()
//   WHERE id = ${user.id}
// `



//     return NextResponse.json({ message: "Password changed successfully" })

//   } catch (error) {
//     console.error("Error changing password:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { verifyToken } from "@/lib/auth-utils"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    console.log("Changing password for instructor ID:", decoded.id)

    // Get current password hash
    const result = await sql`
      SELECT password_hash 
      FROM users 
      WHERE id = ${decoded.id} AND role = 'instructor'
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
    }

    const instructor = result[0]

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, instructor.password_hash)
    if (!isCurrentPasswordValid) {
      console.log("Current password verification failed")
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await sql`
      UPDATE users 
      SET 
        password_hash = ${newPasswordHash},
        updated_at = NOW()
      WHERE id = ${decoded.id} AND role = 'instructor'
    `

    console.log("Instructor password updated successfully")
    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Error changing instructor password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
