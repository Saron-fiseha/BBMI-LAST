
// // import { type NextRequest, NextResponse } from "next/server"
// // import { sql } from "@/lib/db"
// // import { getUserFromToken } from "@/lib/auth"
// // import { getCertificateByUserAndTraining } from "@/lib/certificate-generator"

// // export async function GET(request: NextRequest, { params }: { params: Promise<{ trainingId: string }> }) {
// //   try {
// //     const authHeader = request.headers.get("authorization")
// //     if (!authHeader?.startsWith("Bearer ")) {
// //       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
// //     }

// //     const token = authHeader.split(" ")[1]
// //     const user = await getUserFromToken(token)

// //     if (!user) {
// //       return NextResponse.json({ error: "Invalid token" }, { status: 401 })
// //     }

// //     const resolvedParams = await params
// //     const trainingId = Number.parseInt(resolvedParams.trainingId)

// //     // Get enrollment data
// //     const enrollment = await sql`
// //       SELECT e.*, t.name as training_title, t.description as training_description
// //       FROM enrollments e
// //       JOIN trainings t ON e.training_id = t.id
// //       WHERE e.user_id = ${user.id} AND e.training_id = ${trainingId}
// //       LIMIT 1
// //     `

// //     if (enrollment.length === 0) {
// //       return NextResponse.json({ error: "Enrollment not found" }, { status: 403 })
// //     }

// //     const enrollmentData = enrollment[0]

// //     // Get modules with progress
// //     const modules = await sql`
// //       SELECT 
// //         m.*,
// //         COALESCE(mp.status, 'not_started') as status,
// //         COALESCE(mp.progress_percentage, 0) as progress_percentage,
// //         COALESCE(mp.time_spent_minutes, 0) as time_spent_minutes
// //       FROM modules m
// //       LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.enrollment_id = ${enrollmentData.id}
// //       WHERE m.training_id = ${trainingId}
// //       ORDER BY m.order_index ASC
// //     `

// //     // Calculate statistics
// //     const totalModules = modules.length
// //     const completedModules = modules.filter((m: any) => m.status === "completed").length
// //     const inProgressModules = modules.filter((m: any) => m.status === "in_progress").length
// //     const totalTimeSpent = modules.reduce((sum: number, m: any) => sum + Number(m.time_spent_minutes), 0)

// //     // Get certificate if exists
// //     let certificate = null
// //     if (enrollmentData.certificate_issued) {
// //       certificate = await getCertificateByUserAndTraining(user.id, trainingId)
// //     }

// //     const progressData = {
// //       success: true,
// //       enrollment: {
// //         id: enrollmentData.id,
// //         training_id: enrollmentData.training_id,
// //         status: enrollmentData.status,
// //         progress_percentage: enrollmentData.progress_percentage || 0,
// //         enrolled_at: enrollmentData.enrolled_at,
// //         completed_at: enrollmentData.completed_at,
// //         last_accessed: enrollmentData.last_accessed,
// //         certificate_issued: enrollmentData.certificate_issued || false,
// //         training_title: enrollmentData.training_title,
// //         training_description: enrollmentData.training_description,
// //       },
// //       modules: modules.map((m: any) => ({
// //         id: m.id.toString(),
// //         title: m.name,
// //         description: m.description || "",
// //         content: m.content || "",
// //         video_url: m.video_url,
// //         duration: m.duration || 0,
// //         order_index: m.order_index,
// //         is_preview: m.is_preview || false,
// //         status: m.status,
// //         progress_percentage: Number(m.progress_percentage),
// //         time_spent_minutes: Number(m.time_spent_minutes),
// //       })),
// //       statistics: {
// //         total_modules: totalModules,
// //         completed_modules: completedModules,
// //         in_progress_modules: inProgressModules,
// //         total_time_spent: totalTimeSpent,
// //         avg_module_progress:
// //           totalModules > 0
// //             ? Math.round(modules.reduce((sum: number, m: any) => sum + Number(m.progress_percentage), 0) / totalModules)
// //             : 0,
// //         completion_rate: enrollmentData.progress_percentage || 0,
// //       },
// //       certificate: certificate
// //         ? {
// //             certificate_number: certificate.certificate_number,
// //             verification_code: certificate.verification_code,
// //             created_at: certificate.created_at,
// //             pdf_url: certificate.pdf_url,
// //           }
// //         : null,
// //     }

// //     return NextResponse.json(progressData)
// //   } catch (error) {
// //     console.error("Error fetching progress data:", error)
// //     return NextResponse.json({ error: "Failed to fetch progress data" }, { status: 500 })
// //   }
// // }

// import { NextResponse } from "next/server";
// import { sql } from "@/lib/db";
// import { getAuth } from "@/lib/auth"; // Using your server-side auth helper
// import { type NextRequest } from "next/server";

// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";

// export async function GET(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     const { user } = await getAuth(request);
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const trainingId = context.params.id;

//     // 🔄 THIS IS THE CORE LOGIC FOR ACCESS CONTROL 🔄
//     const enrollmentResult = await sql`
//       SELECT 
//         id, 
//         status, 
//         progress_percentage, 
//         enrolled_at, 
//         completed_at, 
//         last_accessed, 
//         certificate_issued,
//         access_expires_at -- ✅ Fetch the expiration date
//       FROM enrollments
//       WHERE user_id = ${user.id} AND training_id = ${trainingId}
//     `;

//     if (enrollmentResult.length === 0) {
//       // User is not enrolled at all.
//       return NextResponse.json(
//         { error: "You are not enrolled in this training." },
//         { status: 403 } // 403 Forbidden
//       );
//     }

//     const enrollment = enrollmentResult[0];

//     // ✅ CHECK IF ACCESS HAS EXPIRED
//     if (new Date(enrollment.access_expires_at) < new Date()) {
//       return NextResponse.json(
//         { error: "Your one-year access to this training has expired. Please re-enroll to continue." },
//         { status: 403 } // 403 Forbidden
//       );
//     }

//     // --- If access is valid, proceed to fetch all training data ---

//     const trainingTitleResult = await sql`SELECT name FROM trainings WHERE id = ${trainingId}`;
//     enrollment.training_title = trainingTitleResult[0]?.name || "Untitled Training";

//     const modulesResult = await sql`
//         SELECT 
//             m.id, 
//             m.name as title, 
//             m.description, 
//             m.content, 
//             m.video_url, 
//             m.duration, 
//             m.order_index, 
//             m.is_preview,
//             m.document_id,
//             d.file_name,
//             d.file_url,
//             COALESCE(mp.status, 'not_started') as status,
//             COALESCE(mp.progress_percentage, 0) as progress_percentage,
//             COALESCE(mp.time_spent_minutes, 0) as time_spent_minutes
//         FROM modules m
//         LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.user_id = ${user.id}
//         LEFT JOIN documents d ON m.document_id = d.id
//         WHERE m.training_id = ${trainingId}
//         ORDER BY m.order_index ASC
//     `;
    
//     // Format modules to include nested document object
//     interface ModuleResult {
//       id: number;
//       title: string;
//       description: string | null;
//       content: string | null;
//       video_url: string | null;
//       duration: number | null;
//       order_index: number;
//       is_preview: boolean | null;
//       document_id: number | null;
//       file_name: string | null;
//       file_url: string | null;
//       status: string;
//       progress_percentage: number;
//       time_spent_minutes: number;
//     }

//     interface Module {
//       id: number;
//       title: string;
//       description: string | null;
//       content: string | null;
//       video_url: string | null;
//       duration: number | null;
//       order_index: number;
//       is_preview: boolean | null;
//       status: string;
//       progress_percentage: number;
//       time_spent_minutes: number;
//       document: {
//         id: number;
//         file_name: string | null;
//         file_url: string | null;
//       } | null;
//     }

//     const modules: Module[] = modulesResult.map((m: ModuleResult): Module => {
//       const { document_id, file_name, file_url, ...moduleData } = m;
//       return {
//         ...moduleData,
//         document: document_id ? { id: document_id, file_name, file_url } : null,
//       };
//     });

//     const statsResult = await sql`
//         SELECT
//             COUNT(*) as total_modules,
//             COUNT(CASE WHEN mp.status = 'completed' THEN 1 END) as completed_modules,
//             SUM(mp.time_spent_minutes) as total_time_spent
//         FROM modules m
//         LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.user_id = ${user.id}
//         WHERE m.training_id = ${trainingId}
//     `;

//     const stats = statsResult[0];
//     const completion_rate = stats.total_modules > 0 ? (stats.completed_modules / stats.total_modules) * 100 : 0;

//     const certificateResult = await sql`
//         SELECT certificate_number, verification_code, created_at, pdf_url
//         FROM certificates
//         WHERE user_id = ${user.id} AND training_id = ${trainingId}
//     `;
    
//     return NextResponse.json({
//       success: true,
//       enrollment: {
//         ...enrollment,
//         training_id: trainingId,
//       },
//       modules,
//       statistics: {
//         total_modules: Number(stats.total_modules),
//         completed_modules: Number(stats.completed_modules),
//         in_progress_modules: Number(stats.total_modules) - Number(stats.completed_modules),
//         total_time_spent: Number(stats.total_time_spent) || 0,
//         avg_module_progress: completion_rate,
//         completion_rate,
//       },
//       certificate: certificateResult[0] || null,
//     });

//   } catch (error) {
//     console.error("Error fetching progress details:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch progress details" },
//       { status: 500 }
//     );
//   }
// }

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