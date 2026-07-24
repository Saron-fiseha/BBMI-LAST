
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuth } from "@/lib/auth"; // Using your server-side auth helper
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(
  request: NextRequest,
  context: { params: { trainingId: string } }
) {
  try {
    const { user } = await getAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trainingId } = await context.params;

    // --- Access Control Logic ---
    const enrollmentResult = await sql`
      SELECT 
        id, 
        status, 
        progress_percentage, 
        enrolled_at, 
        completed_at, 
        last_accessed, 
        certificate_issued
      FROM enrollments
      WHERE user_id = ${user.id} AND training_id = ${trainingId}
    `;

    if (enrollmentResult.length === 0) {
      return NextResponse.json(
        { error: "You are not enrolled in this training." },
        { status: 403 }
      );
    }

    const enrollment = enrollmentResult[0];

    const trainingTitleResult = await sql`SELECT name FROM trainings WHERE id = ${trainingId}`;
    (enrollment as any).training_title = trainingTitleResult[0]?.name || "Untitled Training";

    // ✅ --- CORRECTED MODULES QUERY --- ✅
    // Removed references to m.document_id and the LEFT JOIN on the documents table.
    const modulesResult = await sql`
        SELECT 
            m.id, 
            m.name as title, 
            m.description, 
            m.content, 
            m.video_url, 
            m.duration, 
            m.order_index, 
            m.is_preview,
            COALESCE(mp.status, 'not_started') as status,
            COALESCE(mp.progress_percentage, 0) as progress_percentage,
            COALESCE(mp.time_spent_minutes, 0) as time_spent_minutes
        FROM modules m
        LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.user_id = ${user.id}
        WHERE m.training_id = ${trainingId}
        ORDER BY m.order_index ASC
    `;
    
    // ✅ The .map function is now simpler as it doesn't need to construct a document object.
    interface ModuleResult {
      id: number;
      title: string;
      description: string | null;
      content: string | null;
      video_url: string | null;
      duration: number | null;
      order_index: number;
      is_preview: boolean | null;
      status: string;
      progress_percentage: number;
      time_spent_minutes: number;
    }

    interface Module extends ModuleResult {
      document: null;
    }

    const modules: Module[] = modulesResult.map((m: ModuleResult): Module => {
      return {
        ...m,
        document: null, // Ensure the 'document' property is present but null, as the frontend expects.
      };
    });

    const statsResult = await sql`
        SELECT
            COUNT(*) as total_modules,
            COUNT(CASE WHEN mp.status = 'completed' THEN 1 END) as completed_modules,
            SUM(mp.time_spent_minutes) as total_time_spent
        FROM modules m
        LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.user_id = ${user.id}
        WHERE m.training_id = ${trainingId}
    `;

    const stats = statsResult[0];
    const completion_rate = Number(stats.total_modules) > 0 ? (Number(stats.completed_modules) / Number(stats.total_modules)) * 100 : 0;

    const certificateResult = await sql`
        SELECT certificate_number, verification_code, created_at
        FROM certificates
        WHERE user_id = ${user.id} AND training_id = ${trainingId}
    `;



    // --- Fetch training documents ---
const documentsResult = await sql`
  SELECT id, file_name, file_url
  FROM documents
  WHERE training_id = ${trainingId}
  ORDER BY created_at ASC
`;

// Map to your Document type
interface Document {
  id: string;
  file_name: string;
  file_url: string;
}

const documents: Document[] = documentsResult.map((d: Document) => ({
  id: d.id,
  file_name: d.file_name,
  file_url: d.file_url,
}));
    
    return NextResponse.json({
      success: true,
      enrollment: {
        ...enrollment,
        training_id: trainingId,
      },
      modules,
      statistics: {
        total_modules: Number(stats.total_modules),
        completed_modules: Number(stats.completed_modules),
        in_progress_modules: Number(stats.total_modules) - Number(stats.completed_modules),
        total_time_spent: Number(stats.total_time_spent) || 0,
        avg_module_progress: completion_rate,
        completion_rate,
      },
      certificate: certificateResult[0] || null,
      documents,
    });

  } catch (error) {
    console.error("Error fetching progress details:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress details" },
      { status: 500 }
    );
  }
}