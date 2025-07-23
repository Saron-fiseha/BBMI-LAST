
// import { type NextRequest, NextResponse } from "next/server";
// import { sql } from "@/lib/db";
// import { getUserFromToken } from "@/lib/auth";

// export async function GET(
//   request: NextRequest,
//   context: { params: Promise<{ trainingId: string }> }
// ) {
//   try {
//     const authHeader = request.headers.get("authorization");
//     const token = authHeader?.replace(/^Bearer\s+/i, "") || "";
//     const user = await getUserFromToken(token);

//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "Authentication required" },
//         { status: 401 }
//       );
//     }

//     const params = await context.params;
//     const trainingId = Number(params.trainingId);

//     if (isNaN(trainingId)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid training ID" },
//         { status: 400 }
//       );
//     }

//     const enrollment = await sql`
//       SELECT e.*, t.name as training_title
//       FROM enrollments e
//       JOIN trainings t ON e.training_id = t.id
//       WHERE e.user_id = ${user.id} AND e.training_id = ${trainingId}
//     `;

//     if (enrollment.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "You are not enrolled in this training",
//         },
//         { status: 403 }
//       );
//     }

//     const enrollmentData = enrollment[0];

//     // Updated: Fetch all modules for training, LEFT JOIN progress
//     const modules = await sql`
//       SELECT
//         m.id,
//         m.name as title,
//         m.description,
//         m.content,
//         m.video_url,
//         m.duration,
//         m.order_index,
//         m.is_preview,
//         COALESCE(mp.status, 'not_started') as status,
//         COALESCE(mp.progress_percentage, 0) as progress_percentage,
//         COALESCE(mp.time_spent_minutes, 0) as time_spent_minutes
//       FROM modules m
//       LEFT JOIN module_progress mp
//         ON mp.module_id = m.id AND mp.user_id = ${user.id}
//       WHERE m.training_id = ${trainingId}
//       ORDER BY m.order_index
//     `;

//     const stats = await sql`
//       SELECT 
//         COUNT(*) as total_modules,
//         COUNT(CASE WHEN mp.status = 'completed' THEN 1 END) as completed_modules,
//         COUNT(CASE WHEN mp.status = 'in_progress' THEN 1 END) as in_progress_modules,
//         SUM(mp.time_spent_minutes) as total_time_spent,
//         AVG(mp.progress_percentage) as avg_module_progress
//       FROM module_progress mp
//       WHERE mp.user_id = ${user.id} AND mp.training_id = ${trainingId}
//     `;

//     const statistics = stats[0];

//     const certificate = await sql`
//       SELECT certificate_code, verification_code, issue_date
//       FROM certificates
//       WHERE user_id = ${user.id} AND training_id = ${trainingId}
//     `;

//     return NextResponse.json({
//       success: true,
//       enrollment: {
//         id: enrollmentData.id,
//         training_id: enrollmentData.training_id,
//         status: enrollmentData.status,
//         progress_percentage: enrollmentData.progress_percentage,
//         enrolled_at: enrollmentData.enrolled_at,
//         completed_at: enrollmentData.completed_at,
//         last_accessed: enrollmentData.last_accessed,
//         certificate_issued: enrollmentData.certificate_issued,
//         training_title: enrollmentData.training_title,
//       },
//       modules,
//       statistics: {
//         total_modules: Number.parseInt(statistics.total_modules),
//         completed_modules: Number.parseInt(statistics.completed_modules),
//         in_progress_modules: Number.parseInt(statistics.in_progress_modules),
//         total_time_spent: Number.parseInt(statistics.total_time_spent || 0),
//         avg_module_progress: Number.parseFloat(statistics.avg_module_progress || 0),
//         completion_rate: Math.round(
//           (Number.parseInt(statistics.completed_modules) /
//             Number.parseInt(statistics.total_modules)) *
//             100
//         ),
//       },
//       certificate: certificate.length > 0 ? certificate[0] : null,
//     });
//   } catch (error) {
//     console.error("🔥 Progress fetch error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Internal server error",
//       },
//       { status: 500 }
//     );
//   }
// }
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { getCertificateByUserAndTraining } from "@/lib/certificate-generator"

export async function GET(request: NextRequest, { params }: { params: Promise<{ trainingId: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const resolvedParams = await params
    const trainingId = Number.parseInt(resolvedParams.trainingId)

    // Get enrollment data
    const enrollment = await sql`
      SELECT e.*, t.name as training_title, t.description as training_description
      FROM enrollments e
      JOIN trainings t ON e.training_id = t.id
      WHERE e.user_id = ${user.id} AND e.training_id = ${trainingId}
      LIMIT 1
    `

    if (enrollment.length === 0) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 403 })
    }

    const enrollmentData = enrollment[0]

    // Get modules with progress
    const modules = await sql`
      SELECT 
        m.*,
        COALESCE(mp.status, 'not_started') as status,
        COALESCE(mp.progress_percentage, 0) as progress_percentage,
        COALESCE(mp.time_spent_minutes, 0) as time_spent_minutes
      FROM modules m
      LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.enrollment_id = ${enrollmentData.id}
      WHERE m.training_id = ${trainingId}
      ORDER BY m.order_index ASC
    `

    // Calculate statistics
    const totalModules = modules.length
    const completedModules = modules.filter((m: any) => m.status === "completed").length
    const inProgressModules = modules.filter((m: any) => m.status === "in_progress").length
    const totalTimeSpent = modules.reduce((sum: number, m: any) => sum + Number(m.time_spent_minutes), 0)

    // Get certificate if exists
    let certificate = null
    if (enrollmentData.certificate_issued) {
      certificate = await getCertificateByUserAndTraining(user.id, trainingId)
    }

    const progressData = {
      success: true,
      enrollment: {
        id: enrollmentData.id,
        training_id: enrollmentData.training_id,
        status: enrollmentData.status,
        progress_percentage: enrollmentData.progress_percentage || 0,
        enrolled_at: enrollmentData.enrolled_at,
        completed_at: enrollmentData.completed_at,
        last_accessed: enrollmentData.last_accessed,
        certificate_issued: enrollmentData.certificate_issued || false,
        training_title: enrollmentData.training_title,
        training_description: enrollmentData.training_description,
      },
      modules: modules.map((m: any) => ({
        id: m.id.toString(),
        title: m.name,
        description: m.description || "",
        content: m.content || "",
        video_url: m.video_url,
        duration: m.duration || 0,
        order_index: m.order_index,
        is_preview: m.is_preview || false,
        status: m.status,
        progress_percentage: Number(m.progress_percentage),
        time_spent_minutes: Number(m.time_spent_minutes),
      })),
      statistics: {
        total_modules: totalModules,
        completed_modules: completedModules,
        in_progress_modules: inProgressModules,
        total_time_spent: totalTimeSpent,
        avg_module_progress:
          totalModules > 0
            ? Math.round(modules.reduce((sum: number, m: any) => sum + Number(m.progress_percentage), 0) / totalModules)
            : 0,
        completion_rate: enrollmentData.progress_percentage || 0,
      },
      certificate: certificate
        ? {
            certificate_number: certificate.certificate_number,
            verification_code: certificate.verification_code,
            created_at: certificate.created_at,
            pdf_url: certificate.pdf_url,
          }
        : null,
    }

    return NextResponse.json(progressData)
  } catch (error) {
    console.error("Error fetching progress data:", error)
    return NextResponse.json({ error: "Failed to fetch progress data" }, { status: 500 })
  }
}
