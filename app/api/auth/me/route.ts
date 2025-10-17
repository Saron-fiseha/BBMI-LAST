import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "No or invalid token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1]; // cleaner token extraction
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
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
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 });
  }
}
