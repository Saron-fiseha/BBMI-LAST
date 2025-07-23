"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PulsatingButton } from "@/components/magicui/pulsating-button"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { ShinyButton } from "@/components/magicui/shiny-button"
import { Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import type { Course } from "@/lib/types"
import { LoadingSpinner } from "@/components/loading-spinner"
import router from "next/router"

export function FeaturedCourses() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses?limit=3") // Fetch top 3 courses
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Course[] = await response.json()
        setFeaturedCourses(data)
      } catch (err) {
        console.error("Failed to fetch featured courses:", err)
        setError("Failed to load courses. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

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
            {/* --- Image with Badge --- */}
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

            {/* --- Card Header --- */}
            <CardHeader className="bg-white">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">
                  {course.title || "Untitled Course"}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-golden-300 text-golden-300" />
                  <span>{(course.average_rating || 0).toFixed(1)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {course.description || "No description available"}
              </p>
            </CardHeader>

            {/* --- Card Content --- */}
            <CardContent className="space-y-4 bg-white">
              <div className="flex justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-golden-300" />
                  <span>{`${course.duration_hours || 0} hours`}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-golden-300" />
                  <span>{`${course.students || 0} students`}</span>
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
                        ${((Number(course.price) || 0) * (1 - course.discount / 100)).toFixed(2)}
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

            {/* --- Card Footer --- */}
            <CardFooter className="bg-white flex gap-2">
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
            {featuredCourses?.length === 0 ? "No courses available." : "Loading courses..."}
          </p>
        </div>
      )}
    </div>

    <div className="text-center mt-12">
      <ShinyButton
        href="/courses"
        size="lg"
        className="bg-[#ffe6ff] hover:bg-[#b38600] px-8 py-4"
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-black">
          Browse All Courses
        </span>
      </ShinyButton>
    </div>
  </div>
</section>
  )
}

 