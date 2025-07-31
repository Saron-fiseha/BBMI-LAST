"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import type { Course } from "@/lib/types" 
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation" 
import { ShinyButton } from "@/components/magicui/shiny-button"


export function FeaturedCourses() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses/featured-courses") 

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const responseData = await response.json()
        
        if (responseData && Array.isArray(responseData.courses)) {
          setFeaturedCourses(responseData.courses)
        } else {
            console.error("API response did not contain a valid 'courses' array:", responseData)
            setFeaturedCourses([])
        }

      } catch (err) {
        console.error("Failed to fetch featured courses:", err)
        setError("Failed to load courses. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // --- Loading and Error states remain the same ---
  if (loading) {
    return (
      <section className="py-20 bg-gray-50 flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50 text-center text-red-500">
        <p>{error}</p>
      </section>
    )
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-pink-50 via-white to-purple-50 text-black">
      <div className="container px-4 md:px-6">
        {/* --- Header Section --- */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
            Our Featured Courses
          </h2>
          <p className="max-w-[900px] text-golden-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Explore our most popular and highly-rated courses designed to elevate your skills.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(featuredCourses) && featuredCourses.length > 0 ? (
            featuredCourses.map((course) => (
              <Card
                key={course.id}
                className="flex flex-col h-full bg-white border-golden-600 text-black shadow-lg hover:shadow-golden-500/30 transition-shadow duration-300"
              >
                <div className="relative">
                  <Image
                    src={course.image_url || "/placeholder.svg?height=200&width=300"}
                    alt={course.title || "Course thumbnail"}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-amber-600 text-black rounded-full">
                    {course.category_id || "Unspecified"}
                  </Badge>
                </div>

                {/* --- CARD HEADER (UPDATED) --- */}
                <CardHeader className="bg-white">
                  <CardTitle className="text-xl">
                    {course.title || "Untitled Course"}
                  </CardTitle>
                  
                  {/* FIX: New container for instructor and rating */}
                  <div className="flex justify-between items-center text-sm text-gray-500 pt-2">
                    <p className="font-medium text-gray-700">
                      By {course.instructor_id || "TBA"}
                    </p>
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">
                        {(course.average_rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <CardDescription className="pt-2 text-sm text-gray-600">
                    {course.description || "No description available"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 bg-white">
                  {/* --- Course stats --- */}
                  <div className="flex justify-between text-sm text-gray-600 border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-golden-300" />
                      <span>{`${course.duration || 0} hours`}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-golden-300" />
                      <span>{`${course.max_trainees || 0} students`}</span>
                    </div>
                  </div>

                  {/* --- Pricing --- */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-golden-400">
                      {course.discount && course.discount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-gray-500 text-lg">
                            ${(Number(course.price) || 0).toFixed(2)}
                          </span>
                          <span>
                            ${((Number(course.price) || 0) * (1 - (course.discount || 0) / 100)).toFixed(2)}
                          </span>
                          <Badge className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            {course.discount}% OFF
                          </Badge>
                        </div>
                      ) : (
                        <span>${(Number(course.price) || 0).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-white flex gap-2 mt-auto pt-4 border-t">
                    <ShinyButton href={`/courses/${course.id}`} className="text-sm px-6 py-3">
                        View Course
                    </ShinyButton>
                    <Button 
                        variant="ghost" 
                        className="text-black hover:text-white hover:bg-[#330033] px-6 py-3 text-sm"
                        onClick={() => router.push(`/payment/${course.id}`)}
                    >
                        Enroll Now
                    </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                No featured courses are available at the moment.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
            <Link href="/courses">
                <ShinyButton
                    size="lg"
                    className="bg-[#ffe6ff] hover:bg-[#b38600] px-8 py-4"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-black">
                    Browse All Courses
                    </span>
                </ShinyButton>
            </Link>
        </div>
      </div>
    </section>
  )
}