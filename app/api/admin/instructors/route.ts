// import { type NextRequest, NextResponse } from "next/server"
// import { neon } from "@neondatabase/serverless"
// import bcrypt from "bcryptjs"

// const sql = neon(process.env.DATABASE_URL!)

// export const dynamic = "force-dynamic"

// // GET - Fetch instructors from users table with instructor role and real-time counts
// // route.ts - Updated GET handler
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const search = searchParams.get("search") || "";
//     const status = searchParams.get("status") || "all";
//     const page = Number.parseInt(searchParams.get("page") || "1");
//     const limit = Number.parseInt(searchParams.get("limit") || "10");
//     const offset = (page - 1) * limit;

//     // First verify database connection
//     await sql`SELECT 1`;
//     console.log("✅ Database connection verified");

//     // Get total count
//     let totalQuery = sql`SELECT COUNT(*) as total FROM users WHERE role = 'instructor'`;
//     if (search) {
//       totalQuery = sql`${totalQuery} AND (full_name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`})`;
//     }
//     const totalResult = await totalQuery;
//     const total = Number(totalResult[0]?.total) || 0;
//     const totalPages = Math.ceil(total / limit);

//     // Get instructors data
//     let query = sql`
//       SELECT 
//         id as user_id,
//         full_name as name,
//         email,
//         phone,
//         'active' as status,
//         '' as specialization,
//         0 as experience,
//         0 as trainings_count,
//         0 as students_count,
//         TO_CHAR(created_at, 'YYYY-MM-DD') as join_date,
//         0 as upcoming_sessions
//       FROM users 
//       WHERE role = 'instructor'
//     `;

//     if (search) {
//       query = sql`${query} AND (full_name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`})`;
//     }

//     query = sql`${query} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

//     const instructors = await query;

//     return NextResponse.json({
//       instructors,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Detailed error:", error);
//     return NextResponse.json(
//       { 
//         error: "Failed to fetch instructors",
//         details: error instanceof Error ? error.message : String(error)
//       }, 
//       { status: 500 }
//     );
//   }
// }

// // POST - Create new instructor (creates user first, then instructor record)
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { name, email, phone, specialization, experience, status, password } = body

//     console.log("🚀 Creating new instructor user:", { name, email, specialization })

//     // Hash password
//     const passwordHash = await bcrypt.hash(password, 10)

//     // Create user with instructor role first
//     const user = await sql`
//       INSERT INTO users (full_name, email, phone, role, password_hash, created_at, updated_at)
//       VALUES (${name}, ${email}, ${phone}, 'instructor', ${passwordHash}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
//       RETURNING id
//     `

//     const userId = user[0].id

//     // Create instructor record linked to user
//     const instructor = await sql`
//       INSERT INTO instructors (
//         user_id, full_name, email, phone, specialization, experience, 
//         status, password_hash, trainings_count, students_count,
//         created_at, updated_at
//       )
//       VALUES (
//         ${userId}, ${name}, ${email}, ${phone}, ${specialization}, ${experience}, 
//         ${status}, ${passwordHash}, 0, 0,
//         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
//       )
//       RETURNING *
//     `

//     console.log("✅ Instructor user created successfully with user_id:", userId)
//     return NextResponse.json({ instructor: { ...instructor[0], user_id: userId } })
//   } catch (error) {
//     console.error("❌ Error creating instructor:", error)
//     return NextResponse.json({ error: "Failed to create instructor" }, { status: 500 })
//   }
// }

// // PUT - Update instructor (updates both user and instructor records)
// export async function PUT(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { id, name, email, phone, specialization, experience, status, password } = body

//     console.log("🔄 Updating instructor user:", { id, name, email })

//     // Hash password if provided
//     let passwordHash = null
//     if (password) {
//       passwordHash = await bcrypt.hash(password, 10)
//     }

//     // Get user_id from instructor
//     const instructorRecord = await sql`
//       SELECT user_id FROM instructors WHERE id = ${id}
//     `

//     if (instructorRecord.length === 0) {
//       return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
//     }

//     const userId = instructorRecord[0].user_id

//     // Update user record
//     if (passwordHash) {
//       await sql`
//         UPDATE users 
//         SET full_name = ${name}, email = ${email}, phone = ${phone}, 
//             password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
//         WHERE id = ${userId}
//       `
//     } else {
//       await sql`
//         UPDATE users 
//         SET full_name = ${name}, email = ${email}, phone = ${phone}, 
//             updated_at = CURRENT_TIMESTAMP
//         WHERE id = ${userId}
//       `
//     }

//     // Update instructor record
//     let instructor
//     if (passwordHash) {
//       instructor = await sql`
//         UPDATE instructors 
//         SET full_name = ${name}, email = ${email}, phone = ${phone}, specialization = ${specialization}, 
//             experience = ${experience}, status = ${status}, password_hash = ${passwordHash}, 
//             updated_at = CURRENT_TIMESTAMP
//         WHERE id = ${id}
//         RETURNING *
//       `
//     } else {
//       instructor = await sql`
//         UPDATE instructors 
//         SET full_name = ${name}, email = ${email}, phone = ${phone}, specialization = ${specialization}, 
//             experience = ${experience}, status = ${status}, updated_at = CURRENT_TIMESTAMP
//         WHERE id = ${id}
//         RETURNING *
//       `
//     }

//     console.log("✅ Instructor user updated successfully")
//     return NextResponse.json({ instructor: instructor[0] })
//   } catch (error) {
//     console.error("❌ Error updating instructor:", error)
//     return NextResponse.json({ error: "Failed to update instructor" }, { status: 500 })
//   }
// }

// // DELETE - Delete instructor (removes both instructor and user records)
// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get("id")

//     if (!id) {
//       return NextResponse.json({ error: "Instructor ID is required" }, { status: 400 })
//     }

//     console.log("🗑️ Deleting instructor user:", id)

//     // Get user_id from instructor
//     const instructorRecord = await sql`
//       SELECT user_id FROM instructors WHERE id = ${id}
//     `

//     if (instructorRecord.length === 0) {
//       return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
//     }

//     const userId = instructorRecord[0].user_id

//     // Delete instructor record first
//     await sql`DELETE FROM instructors WHERE id = ${id}`

//     // Delete user record
//     if (userId) {
//       await sql`DELETE FROM users WHERE id = ${userId}`
//     }

//     console.log("✅ Instructor user deleted successfully")
//     return NextResponse.json({ message: "Instructor and user account deleted successfully" })
//   } catch (error) {
//     console.error("❌ Error deleting instructor:", error)
//     return NextResponse.json({ error: "Failed to delete instructor" }, { status: 500 })
//   }
// }


import { type NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL!);

// Ensure the route is always dynamically rendered
export const dynamic = "force-dynamic";

/**
 * GET - Fetch instructors with real-time data by joining users and instructors tables.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const specializationFilter = searchParams.get("specialization") || "all";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Base query for counting total instructors
    let totalQuery = sql`
      SELECT COUNT(i.id) as total
      FROM instructors i
      JOIN users u ON i.user_id = u.id -- CORRECTED: Fixed typo from user-id
      WHERE u.role = 'instructor'
    `;

    // Base query for fetching instructor data with real-time counts
let dataQuery = sql`
  SELECT 
    i.id,
    i.specialties as specialization,
    i.experience,
    i.status,
    i.full_name as name,
    i.email,
    i.phone,
    i.user_id,
    TO_CHAR(i.join_date, 'YYYY-MM-DD') as join_date,

   (
  SELECT COUNT(*)
  FROM trainings t
  WHERE t.instructor_id = i.user_id -- ✅ match against user_id
) AS trainings_count,

(
  SELECT COUNT(DISTINCT e.user_id)
  FROM trainings t
  LEFT JOIN enrollments e ON t.id = e.training_id
  WHERE t.instructor_id = i.user_id -- ✅ match against user_id
) AS students_count


  FROM instructors i
  JOIN users u ON i.user_id = u.id
  WHERE u.role = 'instructor'
`;


    // Apply filters to both queries
    const filters = [];
    if (search) {
      filters.push(sql`(i.full_name ILIKE ${`%${search}%`} OR i.email ILIKE ${`%${search}%`})`);
    }
    if (status !== "all") {
      filters.push(sql`i.status = ${status}`);
    }
    if (specializationFilter !== "all") {
      filters.push(sql`i.specialties = ${specializationFilter}`);
    }

    if (filters.length > 0) {
      // Join the SQL fragments with AND
      const whereClause = filters.reduce((prev, curr, idx) => idx === 0 ? curr : sql`${prev} AND ${curr}`);
      totalQuery = sql`${totalQuery} AND ${whereClause}`;
      dataQuery = sql`${dataQuery} AND ${whereClause}`;
    }
    
    const totalResult = await totalQuery;
    const total = Number(totalResult[0]?.total) || 0;
    const totalPages = Math.ceil(total / limit);
    
    dataQuery = sql`${dataQuery} ORDER BY i.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const instructors = await dataQuery;

    return NextResponse.json({
      instructors,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching instructors:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch instructors";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * POST - Create a new instructor.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, specialization, experience, status, password } = body;

    console.log("🚀 Creating new instructor user:", { name, email });

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await sql`
      INSERT INTO users (full_name, email, phone, role, password_hash)
      VALUES (${name}, ${email}, ${phone || null}, 'instructor', ${passwordHash})
      RETURNING id
    `;
    const userId = userResult[0].id;
    console.log(`✅ User created with ID: ${userId}. Trigger will now sync instructor.`);
    
    // The trigger creates the basic instructor row.
    // This UPDATE statement populates it with the specific details from the form.
    const instructorResult = await sql`
      UPDATE instructors
      SET 
        specialties = ${specialization},
        experience = ${experience},
        status = ${status}
      WHERE user_id = ${userId}
      RETURNING *
    `;
    
    console.log("✅ Instructor record synced and updated successfully.");
    return NextResponse.json({ instructor: instructorResult[0] }, { status: 201 });

  } catch (error) {
    console.error("❌ Error creating instructor:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create instructor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * PUT - Update an existing instructor's details.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone, specialization, experience, status, password } = body;

    console.log("🔄 Updating instructor:", { id, name });

    const instructorRecord = await sql`SELECT user_id FROM instructors WHERE id = ${id}`;
    if (instructorRecord.length === 0) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }
    const userId = instructorRecord[0].user_id;

    // Update the users table (which contains the password)
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    await sql`
      UPDATE users 
      SET 
        full_name = ${name}, 
        email = ${email}, 
        phone = ${phone || null},
        ${passwordHash ? sql`password_hash = ${passwordHash},` : sql``}
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    // Update the instructors table (which does NOT contain a password)
    const updatedInstructor = await sql`
      UPDATE instructors 
      SET 
        full_name = ${name}, 
        email = ${email}, 
        phone = ${phone || null}, 
        specialties = ${specialization},
        experience = ${experience}, 
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    console.log("✅ Instructor updated successfully.");
    return NextResponse.json({ instructor: updatedInstructor[0] });

  } catch (error) {
    console.error("❌ Error updating instructor:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update instructor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE - Delete an instructor from both the instructors and users tables.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Instructor ID is required" }, { status: 400 });
    }

    console.log("🗑️ Deleting instructor:", id);

    const instructorRecord = await sql`SELECT user_id FROM instructors WHERE id = ${id}`;
    if (instructorRecord.length === 0) {
      // If no record, it might already be deleted, so we can return success.
      return NextResponse.json({ message: "Instructor already deleted or not found." });
    }
    const userId = instructorRecord[0].user_id;
    
    // It's safer to delete the instructor record first, then the user record.
    await sql`DELETE FROM instructors WHERE id = ${id}`;
    await sql`DELETE FROM users WHERE id = ${userId}`;

    console.log("✅ Instructor and associated user deleted successfully.");
    return NextResponse.json({ message: "Instructor deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting instructor:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete instructor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}