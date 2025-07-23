import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const instructorId = params.id;

  try {
    // 1️⃣ Get instructor details
    const instructorResult = await sql`
      SELECT
        id,
        full_name,
        email,
        phone,
        specialties,
        position,
        experience_years,
        students_count,
        rating,
        bio,
        social_links,
        cover_photo,
        profile_picture,
        certifications,
        achievements,
        location
      FROM instructors
      WHERE id = ${instructorId}
      LIMIT 1
    `;

    if (instructorResult.length === 0) {
      return NextResponse.json(
        { success: false, error: "Instructor not found" },
        { status: 404 }
      );
    }

    const instructor = instructorResult[0];

    // Parse JSON string if necessary
    let specialties: string[] = [];
    try {
      specialties = instructor.specialties
        ? JSON.parse(instructor.specialties)
        : [];
    } catch {
      specialties = [];
    }

    let socialLinks = instructor.social_links;
    if (typeof socialLinks === "string") {
      try {
        socialLinks = JSON.parse(socialLinks);
      } catch {
        socialLinks = null;
      }
    }

    const instructorData = {
      id: instructor.id,
      name: instructor.full_name,
      email: instructor.email,
      phone: instructor.phone,
      specialties,
      position: instructor.position,
      experienceYears: instructor.experience_years,
      studentsCount: instructor.students_count,
      rating: instructor.rating,
      bio: instructor.bio,
      socialLinks,
      coverPhoto: instructor.cover_photo,
      profilePicture: instructor.profile_picture,
      certifications: instructor.certifications,
      achievements: instructor.achievements,
      location: instructor.location
    };

    // 2️⃣ Get instructor's trainings
    const trainingsResult = await sql`
      SELECT
        id,
        name,
        description,
        image_url,
        level,
        duration,
        price,
        discount,
        modules,
        course_code
      FROM trainings
      WHERE instructor_id = ${instructorId}
      ORDER BY name ASC
    `;

    return NextResponse.json({
      success: true,
      instructor: instructorData,
      trainings: trainingsResult
    });
  } catch (error) {
    console.error("Error fetching instructor:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
