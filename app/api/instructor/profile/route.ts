import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      // Get instructor profile with better error handling
      const profile = await sql`
        SELECT *
        FROM users 
        WHERE id = ${user.id} AND role = 'instructor'
      `
      // const profile = await sql`
      //   SELECT 
      //     id, full_name, email, phone, position, bio, profile_picture, cover_photo,
      //     specialization, experience_years, location, specialties, certifications,
      //     achievements, social_links, created_at
      //   FROM users 
      //   WHERE id = ${user.id} AND role = 'instructor'
      // `

      if (profile.length === 0) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 })
      }

      const instructorProfile = profile[0]

      // Get stats with better error handling and default values
      let stats = {
        total_trainings: 0,
        total_students: 0,
        average_rating: 0,
        total_earnings: 0,
      }

      try {
        // First check if trainings table exists and has data
        const trainingsExist = await sql`
          SELECT COUNT(*) as count FROM information_schema.tables 
          WHERE table_name = 'trainings' AND table_schema = current_schema()
        `

        if (trainingsExist[0]?.count > 0) {
          const statsResult = await sql`
            SELECT 
              COUNT(DISTINCT t.id) as total_trainings,
              COUNT(DISTINCT e.user_id) as total_students,
              COALESCE(AVG(CAST(r.rating AS DECIMAL)), 0) as average_rating,
              COALESCE(SUM(CAST(t.price AS DECIMAL)), 0) as total_earnings
            FROM users u
            LEFT JOIN trainings t ON u.id = t.instructor_id
            LEFT JOIN enrollments e ON t.id = e.training_id AND e.status = 'active'
            LEFT JOIN reviews r ON t.id = r.training_id
            WHERE u.id = ${user.id}
            GROUP BY u.id
          `

          if (statsResult.length > 0) {
            stats = {
              total_trainings: Number(statsResult[0].total_trainings || 0),
              total_students: Number(statsResult[0].total_students || 0),
              average_rating: Number(Number(statsResult[0].average_rating || 0).toFixed(1)),
              total_earnings: Number(statsResult[0].total_earnings || 0),
            }
          }
        }
      } catch (statsError) {
        console.log("Stats query failed, using defaults:", statsError)
        // Keep default stats values
      }

      // Parse JSON fields safely
      const parseJsonField = (field: any, defaultValue: any) => {
        if (!field) return defaultValue
        if (typeof field === "object") return field
        try {
          return JSON.parse(field)
        } catch {
          return defaultValue
        }
      }

      const formattedProfile = {
        id: instructorProfile.id.toString(),
        name: instructorProfile.full_name || "",
        email: instructorProfile.email || "",
        phone: instructorProfile.phone || "",
        position: instructorProfile.position || "",
        bio: instructorProfile.bio || "",
        profile_picture: instructorProfile.profile_picture || "/placeholder.svg?height=120&width=120",
        cover_photo: instructorProfile.cover_photo || "",
        specialization: instructorProfile.specialization || "",
        experience_years: Number(instructorProfile.experience_years || 0),
        location: instructorProfile.location || "",
        specialties: parseJsonField(instructorProfile.specialties, []),
        certifications: parseJsonField(instructorProfile.certifications, []),
        achievements: parseJsonField(instructorProfile.achievements, []),
        social_links: parseJsonField(instructorProfile.social_links, {}),
        stats: stats,
      }

      return NextResponse.json(formattedProfile)
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching instructor profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      position,
      bio,
      experience_years,
      location,
      specialties,
      certifications,
      achievements,
      social_links,
    } = body

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 })
    }

    if (!position?.trim()) {
      return NextResponse.json({ error: "Position/title is required" }, { status: 400 })
    }

    if (!bio?.trim() || bio.length < 50) {
      return NextResponse.json({ error: "Biography is required and must be at least 50 characters" }, { status: 400 })
    }

    try {
      await sql`
        UPDATE users 
        SET 
          full_name = ${name.trim()},
          phone = ${phone?.trim() || ""},
          position = ${position.trim()},
          bio = ${bio.trim()},
          experience_years = ${Number(experience_years) || 0},
          location = ${location?.trim() || ""},
          specialties = ${JSON.stringify(specialties || [])},
          certifications = ${JSON.stringify(certifications || [])},
          achievements = ${JSON.stringify(achievements || [])},
          social_links = ${JSON.stringify(social_links || {})},
          updated_at = NOW()
        WHERE id = ${user.id}
      `

      return NextResponse.json({ message: "Profile updated successfully" })
    } catch (dbError) {
      console.error("Database update error:", dbError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating instructor profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
