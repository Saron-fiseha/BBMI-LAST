import { NextRequest, NextResponse } from "next/server";
import { neon, NeonDbError } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = "force-dynamic";

interface Quiz {
  id?: string;
  training_id: string; // Changed to string here, but depends on DB type
  question_text: string;
  options: string[]; // array of strings
  correct_answer_index: number;
}

// --- GET: Fetch all questions for a training ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trainingId = searchParams.get("trainingId");

  if (!trainingId) {
    return NextResponse.json({ error: "trainingId is required" }, { status: 400 });
  }

  try {
    const rows: Record<string, any>[] = await sql`
      SELECT id, training_id, question_text, options, correct_answer_index
      FROM quiz
      WHERE training_id = ${parseInt(trainingId)} -- Keep parseInt if training_id is INT, remove if UUID
      ORDER BY id ASC;
    `;

    const quiz: Quiz[] = rows.map((row) => ({
      id: row.id.toString(), // ID from DB (UUID) is already a string, but .toString() is harmless
      training_id: row.training_id.toString(), // Assuming training_id might also be a UUID in the DB, adjust if it's INT
      question_text: row.question_text,
      options: row.options,
      correct_answer_index: row.correct_answer_index,
    }));

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    const errorMessage = error instanceof NeonDbError ? error.message : "Failed to fetch quiz";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- POST: Create a new question ---
export async function POST(req: NextRequest) {
  try {
    const data: Quiz = await req.json();

    if (!data.training_id || !data.question_text || !data.options || data.correct_answer_index == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const rows: Record<string, any>[] = await sql`
      INSERT INTO quiz (training_id, question_text, options, correct_answer_index)
      VALUES (${parseInt(data.training_id)}, ${data.question_text}, ${JSON.stringify(data.options)}::json, ${data.correct_answer_index})
      RETURNING id, training_id, question_text, options, correct_answer_index;
    `;

    const newQuestion: Quiz = {
      id: rows[0].id.toString(),
      training_id: rows[0].training_id.toString(),
      question_text: rows[0].question_text,
      options: rows[0].options,
      correct_answer_index: rows[0].correct_answer_index,
    };

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error("Error creating quiz question:", error);
    const errorMessage = error instanceof NeonDbError ? error.message : "Failed to create quiz question";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- PUT: Update an existing question ---
export async function PUT(req: NextRequest) {
  try {
    const data: Quiz & { id?: string } = await req.json();

    if (!data.id) {
      return NextResponse.json({ error: "Question id is required" }, { status: 400 });
    }

    const rows: Record<string, any>[] = await sql`
      UPDATE quiz
      SET question_text = ${data.question_text},
          options = ${JSON.stringify(data.options)}::json,
          correct_answer_index = ${data.correct_answer_index},
          updated_at = NOW()
      WHERE id = ${data.id} -- REMOVED: parseInt() - Pass UUID string directly
      RETURNING id, training_id, question_text, options, correct_answer_index;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Quiz question not found" }, { status: 404 });
    }

    const updatedQuestion: Quiz = {
      id: rows[0].id.toString(),
      training_id: rows[0].training_id.toString(),
      question_text: rows[0].question_text,
      options: rows[0].options,
      correct_answer_index: rows[0].correct_answer_index,
    };

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating quiz question:", error);
    const errorMessage = error instanceof NeonDbError ? error.message : "Failed to update quiz question";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- DELETE: Delete a question ---
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Question id is required" }, { status: 400 });
  }

  try {
    const rows: Record<string, any>[] = await sql`
      DELETE FROM quiz WHERE id = ${id} RETURNING id; -- REMOVED: parseInt() - Pass UUID string directly
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Quiz question not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: rows[0].id.toString() });
  } catch (error) {
    console.error("Error deleting quiz question:", error);
    const errorMessage = error instanceof NeonDbError ? error.message : "Failed to delete quiz question";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}