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

    // Base query for counting total instructors from users table
    let totalQuery = sql`
      SELECT COUNT(u.id) as total
      FROM users u
      LEFT JOIN instructors i ON u.id = i.user_id
      WHERE u.role = 'instructor'
    `;

    // Base query for fetching instructor data from users table
    let dataQuery = sql`
      SELECT 
        COALESCE(i.id, u.id) as id,
        COALESCE(i.specialties, 'Not Specified') as specialization,
        COALESCE(i.experience, 0) as experience,
        COALESCE(i.status, 'active') as status,
        u.full_name as name,
        u.email,
        u.phone,\n        u.age,\n        u.sex as gender,
        u.id as user_id,
        TO_CHAR(u.created_at, 'YYYY-MM-DD') as join_date,
        
        (
          SELECT COUNT(*)
          FROM trainings t
          WHERE t.instructor_id = u.id
        ) AS trainings_count,
        
        (
          SELECT COUNT(DISTINCT e.user_id)
          FROM trainings t
          LEFT JOIN enrollments e ON t.id = e.training_id
          WHERE t.instructor_id = u.id
        ) AS students_count

      FROM users u
      LEFT JOIN instructors i ON u.id = i.user_id
      WHERE u.role = 'instructor'
    `;

    // Apply filters to both queries
    const filters = [];
    if (search) {
      filters.push(sql`(u.full_name ILIKE ${'%' + search + '%'} OR u.email ILIKE ${'%' + search + '%'})`);
    }
    if (status !== "all") {
      filters.push(sql`COALESCE(i.status, 'active') = ${status}`);
    }
    if (specializationFilter !== "all") {
      filters.push(sql`COALESCE(i.specialties, 'Not Specified') = ${specializationFilter}`);
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
    
    dataQuery = sql`${dataQuery} ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const instructors = await dataQuery;

    
    const specsResult = await sql`SELECT DISTINCT specialties FROM instructors WHERE specialties IS NOT NULL AND specialties != ''`;
    const uniqueSpecializations = specsResult.map(row => row.specialties);
    
    return NextResponse.json({
      instructors,
      specializations: uniqueSpecializations,
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
    const { name, email, phone, specialization, experience, status, password, age, gender } = body;

    console.log("🚀 Creating new instructor user:", { name, email });

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await sql`
      INSERT INTO users (full_name, email, phone, age, sex, role, password_hash, email_verified)
      VALUES (${name}, ${email}, ${phone || null}, ${age || null}, ${gender || null}, 'instructor', ${passwordHash}, true)
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
    const { id: userId, name, email, phone, age, gender, specialization, experience, status } = body;

    console.log("🔄 Updating instructor:", { userId, name });

    const userRecord = await sql`SELECT id FROM users WHERE id = ${userId} AND role = 'instructor'`;
    if (userRecord.length === 0) {
      return NextResponse.json({ error: "Instructor not found in users table" }, { status: 404 });
    }

    // Update the users table
    await sql`
      UPDATE users 
      SET 
        full_name = ${name}, 
        email = ${email}, 
        phone = ${phone || null},
        age = ${age || null},
        sex = ${gender || null},
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    // Upsert the instructors table
    const instructorRecord = await sql`SELECT id FROM instructors WHERE user_id = ${userId}`;
    let updatedInstructor;
    if (instructorRecord.length > 0) {
      updatedInstructor = await sql`
        UPDATE instructors 
        SET 
          full_name = ${name}, 
          email = ${email}, 
          phone = ${phone || null}, 
          specialties = ${specialization},
          experience = ${experience}, 
          status = ${status},
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
        RETURNING *
      `;
    } else {
      updatedInstructor = await sql`
        INSERT INTO instructors (user_id, full_name, email, phone, specialties, experience, status)
        VALUES (${userId}, ${name}, ${email}, ${phone || null}, ${specialization}, ${experience}, ${status})
        RETURNING *
      `;
    }
    
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