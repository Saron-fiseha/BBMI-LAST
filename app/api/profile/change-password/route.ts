// app/api/profile/change-password/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyToken } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function PUT(request: NextRequest) {
  try {
    // Accept header names flexibly and tolerate "Bearer " casing
    const authHeader =
      request.headers.get("authorization") ??
      request.headers.get("Authorization") ??
      "";

    const token = authHeader.replace(/^[Bb]earer\s+/, "").trim();
    if (!token) {
      console.info("change-password: missing token");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.info("change-password: invalid token");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const { currentPassword, newPassword } = body as { currentPassword?: string; newPassword?: string };

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Both currentPassword and newPassword are required" }, { status: 400 });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json({ success: false, error: "New password must be at least 8 characters" }, { status: 400 });
    }

    const userResult = await sql`SELECT password FROM users WHERE id = ${decoded.id}`;
    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    const userFromDb = userResult[0];

    if (!userFromDb.password || typeof userFromDb.password !== "string") {
      return NextResponse.json({
        success: false,
        error: "No password set on the account. Use 'Forgot Password' to set one.",
      }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(currentPassword, userFromDb.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE users SET password = ${hashedNewPassword}, updated_at = NOW() WHERE id = ${decoded.id}`;

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
