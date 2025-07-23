// import { NextRequest, NextResponse } from "next/server";
// import { getUserFromToken } from "@/lib/auth";
// import { sql } from "@/lib/db";

// interface User {
//   id: number | string;
//   role: string;
// }

// interface ImageFile extends Blob {
//   name: string;
//   type: string;
//   size: number;
//   arrayBuffer(): Promise<ArrayBuffer>;
// }

// interface FormDataWithImage extends FormData {
//   get(name: "image"): ImageFile | null;
//   get(name: "type"): string | null;
// }

// export async function POST(request: NextRequest): Promise<NextResponse> {
//   try {
//     const token: string | undefined = request.headers.get("authorization")?.replace("Bearer ", "");

//     if (!token) {
//       return NextResponse.json({ error: "No token provided" }, { status: 401 });
//     }

//     const user: User | null = await getUserFromToken(token);
//     if (!user || user.role !== "instructor") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const formData: FormDataWithImage = await request.formData() as FormDataWithImage;
//     const image: ImageFile | null = formData.get("image");
//     const type: string | null = formData.get("type");

//     if (!image) {
//       return NextResponse.json({ error: "No image provided" }, { status: 400 });
//     }

//     if (!type || !["profile", "cover"].includes(type)) {
//       return NextResponse.json(
//         { error: "Invalid image type" },
//         { status: 400 }
//       );
//     }

//     // Validate file type
//     const allowedTypes: string[] = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(image.type)) {
//       return NextResponse.json(
//         { error: "Invalid file type. Only JPEG, PNG, and GIF are allowed." },
//         { status: 400 }
//       );
//     }

//     // Validate file size (5MB max)
//     const maxSize: number = 5 * 1024 * 1024;
//     if (image.size > maxSize) {
//       return NextResponse.json(
//         { error: "File size too large. Maximum 5MB allowed." },
//         { status: 400 }
//       );
//     }

//     try {
//       // Convert image to base64 for storage
//       const bytes: ArrayBuffer = await image.arrayBuffer();
//       const buffer: Buffer = Buffer.from(bytes);
//       const base64Image: string = `data:${image.type};base64,${buffer.toString("base64")}`;

//       // Update the user's profile with the new image
//       const column: string = type === "profile" ? "profile_picture" : "cover_photo";

//       // await sql`
//       //   UPDATE users 
//       //   SET ${sql(column)} = ${base64Image}, updated_at = NOW()
//       //   WHERE id = ${user.id}
//       // `;
     
//       if (column !== "profile_picture" && column !== "cover_photo") {
//         throw new Error("Invalid column");
//       }
      
//       // Use string interpolation ONLY for the validated column name
//       const query = `
//         UPDATE users
//         SET ${column} = $1, updated_at = NOW()
//         WHERE id = $2
//       `;
      
//       await sql.query(query, [base64Image, user.id]);

      


//       return NextResponse.json({
//         imageUrl: base64Image,
//         message: `${type === "profile" ? "Profile" : "Cover"} photo updated successfully`,
//       });
//     } catch (dbError: unknown) {
//       console.error("Database error:", dbError);
//       return NextResponse.json({ error: "Database error" }, { status: 500 });
//     }
//   } catch (error: unknown) {
//     console.error("Error uploading image:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { sql } from "@/lib/db";

interface User {
  id: number | string;
  role: string;
}

interface ImageFile extends Blob {
  name: string;
  type: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface FormDataWithImage extends FormData {
  get(name: "image"): ImageFile | null;
  get(name: "type"): string | null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const user: User | null = await getUserFromToken(token);
    if (!user || user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData() as FormDataWithImage;
    const image = formData.get("image");
    const type = formData.get("type");

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!type || !["profile", "cover"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid image type" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed." },
        { status: 400 }
      );
    }

    try {
      // Convert image to base64 for storage
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = `data:${image.type};base64,${buffer.toString("base64")}`;

      // Determine column to update
      const column = type === "profile" ? "profile_picture" : "cover_photo";

      if (column !== "profile_picture" && column !== "cover_photo") {
        throw new Error("Invalid column");
      }

      // Update instructors table
      const query = `
        UPDATE instructors
        SET ${column} = $1, updated_at = NOW()
        WHERE user_id = $2
      `;

      await sql.query(query, [base64Image, user.id]);

      return NextResponse.json({
        imageUrl: base64Image,
        message: `${type === "profile" ? "Profile" : "Cover"} photo updated successfully`,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
