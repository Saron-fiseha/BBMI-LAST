import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get recent activity
    const recentActivity = await sql`
      (
      SELECT 
  'enrollment' as type,
  CONCAT('Enrolled in ', t.name) as title,
  CONCAT('Started learning ', t.name) as description,
  e.created_at as activity_time,
  e.id::text as activity_id
FROM enrollments e
JOIN trainings t ON e.training_id = t.id
WHERE e.user_id = ${userId}
ORDER BY e.created_at DESC
LIMIT 3

UNION ALL

(
  SELECT 
    'progress' as type,
    CONCAT('Progress update in ', t.name) as title,
    CONCAT('Completed ', ROUND(e.progress), '% of the training') as description,
    e.updated_at as activity_time,
    e.id::text as activity_id
  FROM enrollments e
  JOIN trainings t ON e.training_id = t.id
  WHERE e.user_id = ${userId}
    AND e.progress > 0
  ORDER BY e.updated_at DESC
  LIMIT 2
)

UNION ALL

(
  SELECT 
    'completion' as type,
    CONCAT('Completed ', t.name) as title,
    'Training completed successfully!' as description,
    e.completed_at as activity_time,
    e.id::text as activity_id
  FROM enrollments e
  JOIN trainings t ON e.training_id = t.id
  WHERE e.user_id = ${userId}
    AND e.status = 'completed'
  ORDER BY e.completed_at DESC
  LIMIT 2
)

ORDER BY activity_time DESC
LIMIT 5
    `

    type Activity = {
      type: string
      title: string
      description: string
      activity_time: string | Date
      activity_id: string
    }

    const formattedActivity = recentActivity.map((activity: Activity) => ({
      id: activity.activity_id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      time: formatTimeAgo(new Date(activity.activity_time)),
    }))

    return NextResponse.json({ recentActivity: formattedActivity })
  } catch (error) {
    console.error("Student activity error:", error)
    return NextResponse.json({ recentActivity: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, description } = body

    if (!userId || !type || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Log activity (you can create an activities table for this)
    const result = await sql`
      INSERT INTO student_activities (user_id, type, title, description, created_at)
      VALUES (${userId}, ${type}, ${title}, ${description}, NOW())
      RETURNING id
    `

    return NextResponse.json({ success: true, activityId: result[0]?.id })
  } catch (error) {
    console.error("Error logging activity:", error)
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 })
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return date.toLocaleDateString()
}
