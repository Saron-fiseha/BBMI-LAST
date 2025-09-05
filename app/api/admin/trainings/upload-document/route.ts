// app/api/admin/trainings/upload-document/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const trainingId = formData.get("trainingId")?.toString();

    if (!file || !trainingId) {
      return NextResponse.json({ error: "Missing file or trainingId" }, { status: 400 });
    }

    // Save to server
    const uploadsDir = path.join(process.cwd(), "public/uploads/documents");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, file.name);
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    // Insert DB record
    await sql`INSERT INTO documents (training_id, file_name, file_url)
              VALUES (${trainingId}, ${file.name}, ${"/uploads/documents/" + file.name})`;

    return NextResponse.json({ success: true, filePath: "/uploads/documents/" + file.name });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
