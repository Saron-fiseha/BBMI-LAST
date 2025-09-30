import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || ""
    const status = searchParams.get("status") || "all"
    const gender = searchParams.get("gender") || "all"

    console.log("🔍 Fetching students with filters:", { search, status, gender })

    // Ensure all student users have corresponding student records
    await ensureStudentRecords()

    let students

    // Build query based on filters - fetch from both tables with JOIN
    if (search && status !== "all" && gender !== "all") {
     students = await sql`
  SELECT 
    s.id::text,
    s.roll_number,
    s.id_number,
    u.full_name,
    u.email,
    COALESCE(u.phone, '') as phone,
    COALESCE(u.age, 0) as age,
    COALESCE(u.sex, '') as gender,
    u.role,
  COUNT(DISTINCT e.training_id) AS courses_enrolled,
COUNT(mp.id) FILTER (WHERE mp.status = 'completed') AS courses_completed,
COALESCE(SUM(mp.time_spent_minutes), 0) AS total_minutes,
CASE 
 WHEN COUNT(DISTINCT e.training_id) > 0
 THEN ROUND( (COUNT(DISTINCT mp.training_id) FILTER (WHERE mp.status = 'completed')::decimal 
                 / COUNT(DISTINCT e.training_id)) * 100, 2 )
    ELSE 0
END AS progress_percent,
    s.join_date,
    s.last_active,
    s.status
  FROM students s
  JOIN users u ON s.user_id = u.id
  LEFT JOIN enrollments e ON s.id = e.user_id          -- from enrollments
  LEFT JOIN module_progress mp ON s.id = mp.user_id  -- join with progress
  WHERE u.role = 'student'
  GROUP BY s.id, s.roll_number, s.id_number, u.full_name, u.email, u.phone, u.age, u.sex, u.role, s.join_date, s.last_active, s.status
  ORDER BY s.roll_number ASC
`

    } else if (search && status !== "all") {
      students = await sql`
  SELECT 
    s.id::text,
    s.roll_number,
    s.id_number,
    u.full_name,
    u.email,
    COALESCE(u.phone, '') as phone,
    COALESCE(u.age, 0) as age,
    COALESCE(u.sex, '') as gender,
    u.role,
  COUNT(DISTINCT e.training_id) AS courses_enrolled,
COUNT(mp.id) FILTER (WHERE mp.status = 'completed') AS courses_completed,
COALESCE(SUM(mp.time_spent_minutes), 0) AS total_minutes,
CASE 
 WHEN COUNT(DISTINCT e.training_id) > 0
 THEN ROUND( (COUNT(DISTINCT mp.training_id) FILTER (WHERE mp.status = 'completed')::decimal 
                 / COUNT(DISTINCT e.training_id)) * 100, 2 )
    ELSE 0
END AS progress_percent,
    s.join_date,
    s.last_active,
    s.status
  FROM students s
  JOIN users u ON s.user_id = u.id
  LEFT JOIN enrollments e ON s.id = e.user_id          -- from enrollments
  LEFT JOIN module_progress mp ON s.id = mp.user_id  -- join with progress
  WHERE u.role = 'student'
  GROUP BY s.id, s.roll_number, s.id_number, u.full_name, u.email, u.phone, u.age, u.sex, u.role, s.join_date, s.last_active, s.status
  ORDER BY s.roll_number ASC
`

    } else if (search && gender !== "all") {
      students = await sql`
  SELECT 
    s.id::text,
    s.roll_number,
    s.id_number,
    u.full_name,
    u.email,
    COALESCE(u.phone, '') as phone,
    COALESCE(u.age, 0) as age,
    COALESCE(u.sex, '') as gender,
    u.role,
  COUNT(DISTINCT e.training_id) AS courses_enrolled,
COUNT(mp.id) FILTER (WHERE mp.status = 'completed') AS courses_completed,
COALESCE(SUM(mp.time_spent_minutes), 0) AS total_minutes,
CASE 
 WHEN COUNT(DISTINCT e.training_id) > 0
 THEN ROUND( (COUNT(DISTINCT mp.training_id) FILTER (WHERE mp.status = 'completed')::decimal 
                 / COUNT(DISTINCT e.training_id)) * 100, 2 )
    ELSE 0
END AS progress_percent,
    s.join_date,
    s.last_active,
    s.status
  FROM students s
  JOIN users u ON s.user_id = u.id
  LEFT JOIN enrollments e ON s.id = e.user_id          -- from enrollments
  LEFT JOIN module_progress mp ON s.id = mp.user_id  -- join with progress
  WHERE u.role = 'student'
  GROUP BY s.id, s.roll_number, s.id_number, u.full_name, u.email, u.phone, u.age, u.sex, u.role, s.join_date, s.last_active, s.status
  ORDER BY s.roll_number ASC
`

    } else if (status !== "all" && gender !== "all") {
     students = await sql`
  SELECT 
    s.id::text,
    s.roll_number,
    s.id_number,
    u.full_name,
    u.email,
    COALESCE(u.phone, '') as phone,
    COALESCE(u.age, 0) as age,
    COALESCE(u.sex, '') as gender,
    u.role,
  COUNT(DISTINCT e.training_id) AS courses_enrolled,
COUNT(mp.id) FILTER (WHERE mp.status = 'completed') AS courses_completed,
COALESCE(SUM(mp.time_spent_minutes), 0) AS total_minutes,
CASE 
 WHEN COUNT(DISTINCT e.training_id) > 0
 THEN ROUND( (COUNT(DISTINCT mp.training_id) FILTER (WHERE mp.status = 'completed')::decimal 
                 / COUNT(DISTINCT e.training_id)) * 100, 2 )
    ELSE 0
END AS progress_percent,
    s.join_date,
    s.last_active,
    s.status
  FROM students s
  JOIN users u ON s.user_id = u.id
  LEFT JOIN enrollments e ON s.id = e.user_id          -- from enrollments
  LEFT JOIN module_progress mp ON s.id = mp.user_id  -- join with progress
  WHERE u.role = 'student'
  GROUP BY s.id, s.roll_number, s.id_number, u.full_name, u.email, u.phone, u.age, u.sex, u.role, s.join_date, s.last_active, s.status
  ORDER BY s.roll_number ASC
`

    } else if (search) {
    students = await sql`
  SELECT 
    s.id::text,
    s.roll_number,
    s.id_number,
    u.full_name,
    u.email,
    COALESCE(u.phone, '') as phone,
    COALESCE(u.age, 0) as age,
    COALESCE(u.sex, '') as gender,
    u.role,
  COUNT(DISTINCT e.training_id) AS courses_enrolled,
COUNT(mp.id) FILTER (WHERE mp.status = 'completed') AS courses_completed,
COALESCE(SUM(mp.time_spent_minutes), 0) AS total_minutes,
CASE 
 WHEN COUNT(DISTINCT e.training_id) > 0
 THEN ROUND( (COUNT(DISTINCT mp.training_id) FILTER (WHERE mp.status = 'completed')::decimal 
                 / COUNT(DISTINCT e.training_id)) * 100, 2 )
    ELSE 0
END AS progress_percent,
    s.join_date,
    s.last_active,
    s.status
  FROM students s
  JOIN users u ON s.user_id = u.id
  LEFT JOIN enrollments e ON s.id = e.user_id          -- from enrollments
  LEFT JOIN module_progress mp ON s.id = mp.user_id  -- join with progress
  WHERE u.role = 'student'
  GROUP BY s.id, s.roll_number, s.id_number, u.full_name, u.email, u.phone, u.age, u.sex, u.role, s.join_date, s.last_active, s.status
  ORDER BY s.roll_number ASC
`
    } else if (status !== "all") {
    students = await sql`
  SELECT 
    s.id::text,
    s.roll_number,
    s.id_number,
    u.full_name,
    u.email,
    COALESCE(u.phone, '') as phone,
    COALESCE(u.age, 0) as age,
    COALESCE(u.sex, '') as gender,
    u.role,
  COUNT(DISTINCT e.training_id) AS courses_enrolled,
COUNT(mp.id) FILTER (WHERE mp.status = 'completed') AS courses_completed,
COALESCE(SUM(mp.time_spent_minutes), 0) AS total_minutes,
CASE 
 WHEN COUNT(DISTINCT e.training_id) > 0
 THEN ROUND( (COUNT(DISTINCT mp.training_id) FILTER (WHERE mp.status = 'completed')::decimal 
                 / COUNT(DISTINCT e.training_id)) * 100, 2 )
    ELSE 0
END AS progress_percent,
    s.join_date,
    s.last_active,
    s.status
  FROM students s
  JOIN users u ON s.user_id = u.id
  LEFT JOIN enrollments e ON s.id = e.user_id          -- from enrollments
  LEFT JOIN module_progress mp ON s.id = mp.user_id  -- join with progress
  WHERE u.role = 'student'
  GROUP BY s.id, s.roll_number, s.id_number, u.full_name, u.email, u.phone, u.age, u.sex, u.role, s.join_date, s.last_active, s.status
  ORDER BY s.roll_number ASC
`

    } else if (gender !== "all") {
    students = await sql`
  SELECT 
    s.id::text,
    s.roll_number,
    s.id_number,
    u.full_name,
    u.email,
    COALESCE(u.phone, '') as phone,
    COALESCE(u.age, 0) as age,
    COALESCE(u.sex, '') as gender,
    u.role,
  COUNT(DISTINCT e.training_id) AS courses_enrolled,
COUNT(mp.id) FILTER (WHERE mp.status = 'completed') AS courses_completed,
COALESCE(SUM(mp.time_spent_minutes), 0) AS total_minutes,
CASE 
 WHEN COUNT(DISTINCT e.training_id) > 0
 THEN ROUND( (COUNT(DISTINCT mp.training_id) FILTER (WHERE mp.status = 'completed')::decimal 
                 / COUNT(DISTINCT e.training_id)) * 100, 2 )
    ELSE 0
END AS progress_percent,
    s.join_date,
    s.last_active,
    s.status
  FROM students s
  JOIN users u ON s.user_id = u.id
  LEFT JOIN enrollments e ON s.id = e.user_id          -- from enrollments
  LEFT JOIN module_progress mp ON s.id = mp.user_id  -- join with progress
  WHERE u.role = 'student'
  GROUP BY s.id, s.roll_number, s.id_number, u.full_name, u.email, u.phone, u.age, u.sex, u.role, s.join_date, s.last_active, s.status
  ORDER BY s.roll_number ASC
`
    } else {
      // No filters - get all students
    students = await sql`
  SELECT 
    s.id::text,
    s.roll_number,
    s.id_number,
    u.full_name,
    u.email,
    COALESCE(u.phone, '') as phone,
    COALESCE(u.age, 0) as age,
    COALESCE(u.sex, '') as gender,
    u.role,
  COUNT(DISTINCT e.training_id) AS courses_enrolled,
COUNT(mp.id) FILTER (WHERE mp.status = 'completed') AS courses_completed,
COALESCE(SUM(mp.time_spent_minutes), 0) AS total_minutes,
CASE 
 WHEN COUNT(DISTINCT e.training_id) > 0
 THEN ROUND( (COUNT(DISTINCT mp.training_id) FILTER (WHERE mp.status = 'completed')::decimal 
                 / COUNT(DISTINCT e.training_id)) * 100, 2 )
    ELSE 0
END AS progress_percent,
    s.join_date,
    s.last_active,
    s.status
  FROM students s
  JOIN users u ON s.user_id = u.id
  LEFT JOIN enrollments e ON s.id = e.user_id          -- from enrollments
  LEFT JOIN module_progress mp ON s.id = mp.user_id  -- join with progress
  WHERE u.role = 'student'
  GROUP BY s.id, s.roll_number, s.id_number, u.full_name, u.email, u.phone, u.age, u.sex, u.role, s.join_date, s.last_active, s.status
  ORDER BY s.roll_number ASC
`
    }

    console.log("✅ Successfully fetched", students.length, "students")

    return NextResponse.json({
      success: true,
      students: students || [],
    })
  } catch (error) {
    console.error("❌ Students fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch students",
        details: error instanceof Error ? error.message : "Unknown error",
        students: [],
      },
      { status: 500 },
    )
  }
}

// Helper function to ensure all student users have corresponding student records
async function ensureStudentRecords() {
  try {
    console.log("🔧 Checking for missing student records...")

    // Find users with role 'student' who don't have student records
    const usersWithoutStudentRecords = await sql`
      SELECT u.id, u.full_name, u.email,u.sex, COALESCE(u.status, 'active') as status
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.role = 'student' AND s.id IS NULL
    `

    if (usersWithoutStudentRecords.length > 0) {
      console.log(`🔧 Creating ${usersWithoutStudentRecords.length} missing student records...`)

      // Create student records one by one
      for (const user of usersWithoutStudentRecords) {
        try {
          console.log(`Creating student record for user: ${user.name} (ID: ${user.id})`)

          // Get next roll number manually
          const nextRollNumber = await sql`SELECT COALESCE(MAX(roll_number), 0) + 1 as next_roll FROM students`
          const rollNumber = nextRollNumber[0].next_roll
          const idNumber = `ST-${rollNumber.toString().padStart(2, "0")}`

          const newStudent = await sql`
            INSERT INTO students (user_id, roll_number, id_number, status, join_date, last_active, created_at, updated_at)
            VALUES (
              ${user.id}, 
              ${rollNumber},
              ${idNumber},
              ${user.status}, 
              CURRENT_TIMESTAMP, 
              CURRENT_TIMESTAMP, 
              CURRENT_TIMESTAMP, 
              CURRENT_TIMESTAMP
            )
            RETURNING id, roll_number, id_number
          `

          console.log(`✅ Created student record: Roll ${newStudent[0].roll_number}, ID ${newStudent[0].id_number}`)
        } catch (insertError) {
          console.error(`❌ Failed to create student record for user ${user.id}:`, insertError)
        }
      }

      console.log("✅ Finished creating missing student records")
    } else {
      console.log("✅ All student users already have corresponding student records")
    }
  } catch (error) {
    console.error("❌ Error ensuring student records:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, age, gender, password, status } = body

    console.log("➕ Creating new student:", { name, email, phone, age, gender, status })

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ success: false, error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.trim()}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Check if users table has password_hash column
    const tableStructure = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password_hash'
    `

    if (tableStructure.length === 0) {
      console.error("❌ password_hash column does not exist in users table")
      return NextResponse.json(
        { success: false, error: "Database schema error: password_hash column missing. Please run database setup." },
        { status: 500 },
      )
    }

    // Step 1: Create user record with password_hash column
    const newUser = await sql`
      INSERT INTO users (full_name, email, phone, age, sex, password_hash, role, status, created_at, updated_at)
      VALUES (
        ${name.trim()}, 
        ${email.trim()}, 
        ${phone?.trim() || null}, 
        ${age ? Number.parseInt(age.toString()) : null}, 
        ${gender || null}, 
        ${hashedPassword}, 
        'student', 
        ${status || "active"}, 
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING id
    `

    if (newUser.length === 0) {
      throw new Error("Failed to create user")
    }

    const userId = newUser[0].id
    console.log("✅ Created user with ID:", userId)

    // Step 2: Create student record with manual roll number generation
    const nextRollNumber = await sql`SELECT COALESCE(MAX(roll_number), 0) + 1 as next_roll FROM students`
    const rollNumber = nextRollNumber[0].next_roll
    const idNumber = `ST-${rollNumber.toString().padStart(2, "0")}`

    const newStudent = await sql`
      INSERT INTO students (user_id, roll_number, id_number, status, join_date, last_active, created_at, updated_at)
      VALUES (
        ${userId}, 
        ${rollNumber},
        ${idNumber},
        ${status || "active"}, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING id, roll_number, id_number
    `

    console.log("✅ Created student:", newStudent[0])

    return NextResponse.json({
      success: true,
      message: "Student created successfully",
      student: {
        id: newStudent[0].id.toString(),
        user_id: userId,
        roll_number: newStudent[0].roll_number,
        id_number: newStudent[0].id_number,
      },
    })
  } catch (error) {
    console.error("❌ Student creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create student",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Password hashing function
async function hashPassword(password: string): Promise<string> {
  try {
    const bcrypt = await import("bcryptjs")
    return await bcrypt.hash(password, 12)
  } catch {
    const crypto = await import("crypto")
    return crypto
      .createHash("sha256")
      .update(password + "beautysalon_salt_2024")
      .digest("hex")
  }
}