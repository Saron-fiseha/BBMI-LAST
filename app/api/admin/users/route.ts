import { type NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = "force-dynamic";

// GET - Fetch users with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";
    const status = searchParams.get("status") || "all";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    console.log("🔍 Fetching users with params:", { search, role, status, page, limit });

    // Build count query using tagged template
    let countQuery = sql`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE 1=1
    `;

    if (search) {
      countQuery = sql`
        ${countQuery}
        AND (full_name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`})
      `;
    }

    if (role !== "all") {
      countQuery = sql`
        ${countQuery}
        AND role = ${role}
      `;
    }

    if (status !== "all") {
      countQuery = sql`
        ${countQuery}
        AND status = ${status}
      `;
    }

    const totalResult = await countQuery;
    const total = Number.parseInt(totalResult[0].total);
    const totalPages = Math.ceil(total / limit);

    // Build main query using tagged template
    let mainQuery = sql`
      SELECT 
        id, full_name, email, phone, age, sex, role, status, created_at
      FROM users 
      WHERE 1=1
    `;

    if (search) {
      mainQuery = sql`
        ${mainQuery}
        AND (full_name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`})
      `;
    }

    if (role !== "all") {
      mainQuery = sql`
        ${mainQuery}
        AND role = ${role}
      `;
    }

    if (status !== "all") {
      mainQuery = sql`
        ${mainQuery}
        AND status = ${status}
      `;
    }

    // Add pagination
    mainQuery = sql`
      ${mainQuery}
      ORDER BY created_at DESC 
      LIMIT ${limit} 
      OFFSET ${offset}
    `;

    const users = await mainQuery;

    console.log(`✅ Found ${users.length} users`);

    return NextResponse.json({
      success: true,
      users,
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
    console.error("❌ Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, age, gender, password, role, status } = body;

    console.log("🚀 Creating user:", { name, email, role });

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email and password are required",
        },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user using properly formatted SQL template
    const user = await sql`
      INSERT INTO users 
        (full_name, email, phone, age, sex, role, status, password_hash, created_at, updated_at)
      VALUES 
        (${name}, ${email}, ${phone || null}, ${age || null}, ${gender || null}, 
         ${role || 'user'}, ${status || 'active'}, ${passwordHash}, 
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id, full_name, email, phone, age, sex, role, status, created_at
    `;

    console.log("✅ User created successfully");
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: user[0],
    });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
      },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone, age, gender, password, role, status} = body;

    console.log("🔄 Updating user:", { id, name, email });

    // Start with base update query
    let updateQuery = sql`
      UPDATE users 
      SET 
        full_name = ${name}, 
        email = ${email}, 
        phone = ${phone}, 
        age = ${age}, 
        sex = ${gender},
        role = ${role}, 
        status = ${status}, 
        updated_at = CURRENT_TIMESTAMP
    `;

    // Conditionally add password update
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updateQuery = sql`
        ${updateQuery},
        password_hash = ${passwordHash}
      `;
    }

    // Complete the query
    updateQuery = sql`
      ${updateQuery}
      WHERE id = ${id}
      RETURNING id, full_name, email, phone, age, sex, role, status, created_at
    `;

    const user = await updateQuery;

    if (user.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    console.log("✅ User updated successfully");
    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: user[0],
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 }
      );
    }

    console.log("🗑️ Deleting user:", id);

    await sql`DELETE FROM users WHERE id = ${id}`;

    console.log("✅ User deleted successfully");
    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}