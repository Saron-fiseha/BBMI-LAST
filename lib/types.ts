import { z } from "zod"

export interface User {
  id: string
  name: string
  email: string
  image?: string
  role: "admin" | "instructor" | "student"
}

export interface Course {
   id: string
  title: string
  description: string
  price: number
  duration_hours: number
  level: "Beginner" | "Intermediate" | "Advanced"
  image_url: string | null
  category_id: string
  instructor_id: string | null
  discount?: number | null //  NEW  – percentage (0-100)
  average_rating?: number | null //  Already stored by triggers, may be NULL
  students?: number | null //  Optional: populated by a VIEW or join
}

export interface Lesson {
  id: string
  title: string
  description: string
  courseId: string
  videoUrl?: string
  duration: number
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  status: "active" | "completed" | "cancelled"
  progress: number
  createdAt: Date
  updatedAt: Date
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  issueDate: Date
  verificationCode: string
}

export interface Payment {
  id: string
  userId: string
  courseId: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  paymentMethod: string
  transactionId: string
  createdAt: Date
}

export interface Review {
  id: string
  userId: string
  courseId: string
  rating: number
  comment?: string
  createdAt: Date
}

export interface Appointment {
  id: string
  userId: string
  instructorId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  status: "scheduled" | "cancelled" | "completed"
  createdAt: Date
  updatedAt: Date
}

export interface Instructor {
  id: string
  name: string
  title: string
  bio: string
  image?: string
  specialties: string[]
  experience: string
  students: number
  courses: number
  rating: number
}


// Validation schema for creating a new course/training.
// (Used by POST /api/courses)
export const NewCourseSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  price: z.number().nonnegative(),
  duration_hours: z.number().positive(),
  level: z.string().min(2).max(50),
  image_url: z.string().url().nullable().optional(),
  video_url: z.string().url().nullable().optional(),
  category_id: z.number().int(),
  instructor_id: z.number().int().nullable().optional(),
  discount: z.number().min(0).max(100).optional().default(0),
})

export type NewCourseInput = z.infer<typeof NewCourseSchema>
