// import { NextResponse } from "next/server"
// import { neon } from "@neondatabase/serverless"

// const sql = neon(process.env.DATABASE_URL!)

// export async function GET() {
//   try {
//     const instructors = await sql`
//       SELECT 
//         id, 
//         full_name AS name, 
//         email, 
        
//         bio,
//         profile_picture,
//         created_at
//       FROM users 
//       WHERE role = 'instructor' 
      
//       ORDER BY name ASC
//     `
//     // const instructors = await sql`
//     //   SELECT 
//     //     id, 
//     //     full_name AS name, 
//     //     email, 
//     //     specialization,
//     //     bio,
//     //     profile_picture,
//     //     created_at
//     //   FROM users 
//     //   WHERE role = 'instructor' 
//     //   AND active = true
//     //   ORDER BY name ASC
//     // `

//     return NextResponse.json({
//       success: true,
//       instructors: instructors || [],
//     })
//   } catch (error) {
//     console.error("Instructors fetch error:", error)

//     // Return mock data as fallback
//     const mockInstructors = [
//       {
//         id: 1,
//         name: "Sarah Martinez",
//         email: "sarah@bbmi.com",
//         specialization: "Bridal Makeup",
//         bio: "Expert in bridal and special occasion makeup with 10+ years experience",
//       },
//       {
//         id: 2,
//         name: "Emma Wilson",
//         email: "emma@bbmi.com",
//         specialization: "Color Theory",
//         bio: "Color theory specialist and makeup artist educator",
//       },
//       {
//         id: 3,
//         name: "Michael Chen",
//         email: "michael@bbmi.com",
//         specialization: "Special Effects",
//         bio: "Professional special effects and theatrical makeup artist",
//       },
//     ]

//     return NextResponse.json({
//       success: true,
//       instructors: mockInstructors,
//     })
//   }
// }
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const instructors = await sql`
      SELECT 
        id,
        full_name,
        email,
        bio,
        profile_picture,
       specialties,
        experience_years,
        total_students,
        courses_teaching,
        rating,
        created_at
      FROM instructors
      ORDER BY full_name ASC
    `;

    return NextResponse.json({
      success: true,
      instructors: instructors || [],
    });
  } catch (error) {
    console.error("Instructors fetch error:", error);

    // Return mock data as fallback
    const mockInstructors = [
      {
        id: 1,
        name: "Sarah Martinez",
        email: "sarah@bbmi.com",
        bio: "Expert in bridal and special occasion makeup with 10+ years experience",
        profile_picture: null,
        specialties: ["Bridal Makeup", "Special Occasions"],
        experience: "10+ years",
        students: 800,
        courses: 6,
        rating: 4.8,
      },
      {
        id: 2,
        name: "Michael Chen",
        email: "michael@bbmi.com",
        bio: "Professional special effects and theatrical makeup artist",
        profile_picture: null,
        specialties: ["Special Effects", "Editorial Makeup"],
        experience: "12+ years",
        students: 950,
        courses: 5,
        rating: 4.9,
      },
    ];

    return NextResponse.json({
      success: true,
      instructors: mockInstructors,
    });
  }
}
