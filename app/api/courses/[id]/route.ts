// // import { NextResponse } from "next/server";
// // import { sql } from "@/lib/db";

// // export const dynamic = 'force-dynamic';
// // export const fetchCache = 'force-no-store';

// // export async function GET(
// //   request: Request,
// //   context: { params: Promise<{ id: string }> }
// // ) {
// //   try {
// //     // Await the params Promise
// //     const params = await context.params;
// //     const id = params.id;

// //     const result = await sql`
// //       SELECT
// //         id,
// //         name,
// //         description,
// //         price,
// //         duration,
// //         level,
// //         image_url,
// //         instructor_name,
// //         discount,
// //         modules,
// //         max_trainees,
// //         course_code,
// //         status,
// //         category_id,
// //         created_at,
// //         updated_at
// //       FROM trainings
// //       WHERE id = ${id}
// //     `;

// //     if (result.length === 0) {
// //       return NextResponse.json({ error: "Training not found" }, { status: 404 });
// //     }

// //     return NextResponse.json({ training: result[0] });
// //   } catch (error) {
// //     console.error("Error fetching training:", error);
// //     return NextResponse.json(
// //       { error: "Failed to fetch training" },
// //       { status: 500 }
// //     );
// //   }
// // // }
// // import { NextResponse } from "next/server";
// // import { sql } from "@/lib/db";

// // export const dynamic = 'force-dynamic';
// // export const fetchCache = 'force-no-store';

// // // NOTE: This is a sample structure. Adjust based on your actual database schema.
// // // We are assuming you have tables for instructors, modules, lessons, and reviews.
// // // You might need to add an 'instructor_id' to your 'trainings' table.

// // export async function GET(
// //   request: Request,
// //   context: { params: Promise<{ id: string }> }
// // ) {
// //   try {
// //     const params = await context.params;
// //     const id = params.id;

// //     // Fetch main training details
// //     const trainingResult = await sql`
// //       SELECT
// //         t.id,
// //         t.name,
// //         t.description,
// //         t.overview, -- NEW
// //         t.what_you_will_learn, -- NEW
// //         t.requirements, -- NEW
// //         t.who_is_for, -- NEW
// //         t.price,
// //         t.duration,
// //         t.level,
// //         t.image_url,
// //         t.instructor_id, -- Assuming this exists
// //         t.discount,
// //         t.modules AS modules_count,
// //         t.max_trainees,
// //         t.course_code,
// //         t.status,
// //         t.category_id,
// //         t.created_at,
// //         t.updated_at,
// //         t.student_count,  -- NEW
// //         c.name as category_name
// //       FROM trainings t
// //       LEFT JOIN categories c ON t.category_id = c.id
// //       WHERE t.id = ${id}
// //     `;

// //     if (trainingResult.length === 0) {
// //       return NextResponse.json({ error: "Training not found" }, { status: 404 });
// //     }
// //     const training = trainingResult[0];

// //     try {
// //       // If what_you_will_learn is a string, parse it. If null/undefined, default to '[]'.
// //       training.what_you_will_learn = JSON.parse(training.what_you_will_learn || '[]');
// //     } catch (e) {
// //       console.error("Failed to parse what_you_will_learn:", e);
// //       training.what_you_will_learn = []; // Default to empty array on error
// //     }

// //     try {
// //       training.requirements = JSON.parse(training.requirements || '[]');
// //     } catch (e) {
// //       console.error("Failed to parse requirements:", e);
// //       training.requirements = [];
// //     }
// //     // --- FIX ENDS HERE ---

// //     // Fetch instructor details (assuming an 'instructors' table)
// //     const instructorResult = await sql`
// //       SELECT
// //         id,
// //         full_name,
// //         bio,
// //         experience,
// //         specialties,
// //         profile_picture,
// //         total_students,
// //         students_count,
// //         rating
// //       FROM instructors
// //       WHERE id = ${training.instructor_id}
// //     `;


    
// //     const instructor = instructorResult[0] || { name: "N/A" }; // Fallback

// //     // Fetch course modules and lessons
// //     const modulesResult = await sql`
// //   SELECT
// //     m.id,
// //     m.name,
// //     m.order_index,
// //     m.duration,  -- if you have duration stored in modules
// //     m.description  -- if you have description stored in modules
// //   FROM modules m
// //   WHERE m.training_id = ${id}
// //   ORDER BY m.order_index ASC
// // `;

// //     // Fetch reviews (assuming a 'reviews' table)
// //     const reviewsResult = await sql`
// //       SELECT
// //         r.id,
// //         r.rating,
// //         r.comment,
// //         r.created_at,
// //         u.full_name as user_name,
// //         u.profile_picture as user_image_url
// //       FROM reviews r
// //       JOIN users u ON u.id = r.user_id
// //       WHERE r.training_id = ${id}
// //       ORDER BY r.created_at DESC
// //       LIMIT 10
// //     `;

// //     return NextResponse.json({
// //       training,
// //       instructor,
// //       modules: modulesResult,
// //       reviews: reviewsResult,
// //     });

// //   } catch (error) {
// //     console.error("Error fetching training details:", error);
// //     return NextResponse.json(
// //       { error: "Failed to fetch training details" },
// //       { status: 500 }
// //     );
// //   }
// // }

// import { NextResponse } from "next/server";
// import { sql } from "@/lib/db";

// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';

// export async function GET(
//   request: Request,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const params = await context.params;
//     const id = params.id;

//     // Fetch main training details
//     const trainingResult = await sql`
//       SELECT
//         t.id, t.name, t.description, t.overview, t.what_you_will_learn,
//         t.requirements, t.who_is_for, t.price, t.duration, t.level,
//         t.image_url, t.instructor_id, t.discount, t.modules AS modules_count,
//         t.max_trainees, t.course_code, t.status, t.category_id,
//         t.created_at, t.updated_at, t.student_count,
//         c.name as category_name
//       FROM trainings t
//       LEFT JOIN categories c ON t.category_id = c.id
//       WHERE t.id = ${id}
//     `;

//     if (trainingResult.length === 0) {
//       return NextResponse.json({ error: "Training not found" }, { status: 404 });
//     }
//     const training = trainingResult[0];

//     // Safely parse JSON fields
//     try {
//       training.what_you_will_learn = JSON.parse(training.what_you_will_learn || '[]');
//       training.requirements = JSON.parse(training.requirements || '[]');
//     } catch (e) {
//       console.error("Failed to parse JSON fields:", e);
//       training.what_you_will_learn = [];
//       training.requirements = [];
//     }

//    const instructorResult = await sql`
//   SELECT
//     i.id,
//     i.full_name,
//     i.position,
//     i.bio,
//     i.experience, -- Using the 'experience' integer column
//     i.rating,
//     i.total_students,
//     i.profile_picture,
//     i.specialties,     -- Fetching as a single string
//     i.certifications,  -- Fetching as a single string
//     i.achievements,    -- Fetching as a single string
//     i.social_links     -- Fetching the correct jsonb column
//   FROM instructors i
//   WHERE i.user_id = ${training.instructor_id}
// `;

// let instructorData = instructorResult[0] || null;

// // This block will format the raw database data into the perfect structure for the frontend
// if (instructorData) {
//   // Helper to safely split comma-separated strings from the DB into arrays for the frontend
//   const splitStringToArray = (str) => {
//     if (typeof str === 'string' && str.trim() !== '') {
//       return str.split(',').map(item => item.trim()); // Splits by comma and trims whitespace
//     }
//     return []; // Return an empty array if the DB field is null or empty
//   };
  
//   // Helper to safely parse JSONB data
//   const safeJsonParse = (data) => {
//     // The driver often auto-parses JSONB, so if it's an object, we're good.
//     if (typeof data === 'object' && data !== null) {
//       return data;
//     }
//     // If it's a string, try to parse it. Otherwise, return empty object.
//     try {
//       return JSON.parse(data || '{}');
//     } catch {
//       return {};
//     }
//   };

//   // Create the final instructor object with names matching the frontend component
//   const instructor = {
//     name: instructorData.full_name,
//     title: instructorData.position,
//     bio: instructorData.bio,
//     // Format the integer experience into a user-friendly string
//     experience: `${instructorData.experience || 0}+ Years Experience`, 
//     instructor_rating: instructorData.rating || 0,
//     total_students: instructorData.total_students || 0,
//     image_url: instructorData.profile_picture,
//     // Transform DB strings into arrays
//     specialties: splitStringToArray(instructorData.specialties),
//     certifications: splitStringToArray(instructorData.certifications),
//     achievements: splitStringToArray(instructorData.achievements),
//     // Use the correct column name and safely parse it
//     social_media: safeJsonParse(instructorData.social_links),
//   };
  


//     // Fetch course modules and lessons
//     const modulesResult = await sql`
//       SELECT id, name, order_index, duration, description
//       FROM modules
//       WHERE training_id = ${id}
//       ORDER BY order_index ASC
//     `;

//     // Fetch reviews
//     const reviewsResult = await sql`
//       SELECT
//         r.id, r.rating, r.comment, r.created_at,
//         u.full_name as user_name,
//         u.profile_picture as user_image_url
//       FROM reviews r
//       JOIN users u ON u.id = r.user_id
//       WHERE r.training_id = ${id}
//       ORDER BY r.created_at DESC
//       LIMIT 10
//     `;

//     return NextResponse.json({
//       training,
//       instructor,
//       modules: modulesResult,
//       reviews: reviewsResult,
//     });

//   } catch (error) {
//     console.error("Error fetching training details:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch training details" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    // Fetch main training details
    const trainingResult = await sql`
      SELECT
        t.id, t.name, t.description, t.overview, t.what_you_will_learn,
        t.requirements, t.who_is_for, t.price, t.duration, t.level,
        t.image_url, t.instructor_id, t.discount, t.modules AS modules_count,
        t.max_trainees, t.course_code, t.status, t.category_id,
        t.created_at, t.updated_at, t.student_count,t.sample_video_url, 
        c.name as category_name
      FROM trainings t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ${id}
    `;

    if (trainingResult.length === 0) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }
    const training = trainingResult[0];

    // Safely parse JSON fields for the training object
    try {
      training.what_you_will_learn = JSON.parse(training.what_you_will_learn || '[]');
      training.requirements = JSON.parse(training.requirements || '[]');
    } catch (e) {
      console.error("Failed to parse training JSON fields:", e);
      training.what_you_will_learn = [];
      training.requirements = [];
    }

    // --- START: CORRECTED INSTRUCTOR FETCH AND TRANSFORMATION LOGIC ---

    // 1. Fetch instructor data using the CORRECT column names from your database
    const instructorResult = await sql`
      SELECT
        i.id,
        i.full_name,
        i.position,
        i.bio,
        i.experience,
        i.rating,
        i.total_students,
        i.profile_picture,
        i.specialties,
        i.certifications,
        i.achievements,
        i.social_links 
      FROM instructors i
      WHERE i.user_id = ${training.instructor_id}
    `;

    let finalInstructor = null;
    const rawInstructorData = instructorResult[0];

    // 2. If an instructor is found, transform the raw data into the structure the frontend needs
    if (rawInstructorData) {
      // Helper to safely split comma-separated strings from the DB into arrays
      const splitStringToArray = (str: string | null | undefined): string[] => {
        if (typeof str === 'string' && str.trim() !== '') {
          return str.split(',').map(item => item.trim());
        }
        return [];
      };
      
      // Helper to safely handle JSONB data from the database
      const safeJsonParse = (data: any): object => {
        if (typeof data === 'object' && data !== null) {
          return data; // Already a valid object
        }
        return {}; // Default to an empty object if data is not a valid object
      };

      // 3. Create the final object with property names matching the frontend component
      finalInstructor = {
        name: rawInstructorData.full_name,
        title: rawInstructorData.position,
        bio: rawInstructorData.bio,
        experience: `${rawInstructorData.experience || 0}+ Years Experience`,
        instructor_rating: rawInstructorData.rating || 0,
        total_students: rawInstructorData.total_students || 0,
        image_url: rawInstructorData.profile_picture,
        specialties: splitStringToArray(rawInstructorData.specialties),
        certifications: splitStringToArray(rawInstructorData.certifications),
        achievements: splitStringToArray(rawInstructorData.achievements),
        social_media: safeJsonParse(rawInstructorData.social_links),
      };
    }
    
    // --- END: CORRECTED INSTRUCTOR LOGIC ---


    // Fetch course modules (ensure your modules table has these columns)
    const modulesResult = await sql`
      SELECT id, name, description, duration
      FROM modules
      WHERE training_id = ${id}
      ORDER BY order_index ASC
    `;

    // Fetch reviews
    const reviewsResult = await sql`
      SELECT
        r.id, r.rating, r.comment, r.created_at,
        u.full_name as user_name,
        u.profile_picture as user_image_url
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.training_id = ${id}
      ORDER BY r.created_at DESC
      LIMIT 10
    `;

    // 4. Return the final, correctly formatted data to the frontend
    return NextResponse.json({
      training,
      instructor: finalInstructor, // Use the transformed instructor object
      modules: modulesResult,
      reviews: reviewsResult,
    });

  } catch (error) {
    console.error("Error fetching training details:", error);
    return NextResponse.json(
      { error: "Failed to fetch training details" },
      { status: 500 }
    );
  }
}