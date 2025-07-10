"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Search,
  Users,
  Star,
  DollarSign,
  Clock,
  Calendar,
  BarChart3,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Course {
  id: string
  title: string
  description: string
  students: number
  rating: number
  review_count: number
  earnings: string
  image: string
  status: string
  price: number
  duration: number
  level: string
  created_at: string
  updated_at: string
}

export default function InstructorCourses() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")

  useEffect(() => {
    if (!loading && (!user || user.role !== "instructor")) {
      router.push(user ? "/dashboard" : "/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === "instructor") {
      fetchCourses()
    }
  }, [user])

  const fetchCourses = async () => {
    try {
      setLoadingData(true)
      setError(null)

      // Get token from localStorage - use consistent key
      const token = localStorage.getItem("auth_token")
      console.log("Token from localStorage:", token ? "Token present" : "No token found")

      if (!token) {
        throw new Error("No authentication token found. Please log in again.")
      }

      console.log("Making request to /api/instructor/courses")
      const response = await fetch("/api/instructor/courses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", errorData)

        if (response.status === 401) {
          // Token might be expired, redirect to login
          localStorage.removeItem("auth_token")
          router.push("/login")
          return
        }

        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Courses data received:", data)
      setCourses(data)
    } catch (error) {
      console.error("Error fetching courses:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load courses"
      setError(errorMessage)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  const handleRetry = () => {
    fetchCourses()
  }

  if (loading || !user || user.role !== "instructor") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your courses...</p>
        </div>
      </div>
    )
  }

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || course.status === statusFilter
    const matchesLevel = levelFilter === "all" || course.level === levelFilter
    return matchesSearch && matchesStatus && matchesLevel
  })

  // Calculate summary stats
  const totalStudents = courses.reduce((sum, course) => sum + course.students, 0)
  const totalEarnings = courses.reduce((sum, course) => {
    const earnings = Number.parseFloat(course.earnings.replace(/[$,]/g, ""))
    return sum + earnings
  }, 0)
  const averageRating =
    courses.length > 0 ? courses.reduce((sum, course) => sum + course.rating, 0) / courses.length : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "intermediate":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Show error state
  if (error && !loadingData) {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
            <p className="text-muted-foreground">View your course portfolio and performance metrics</p>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Failed to Load Courses</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">{error}</p>
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Summary Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
              <p className="text-muted-foreground">View your course portfolio and performance metrics</p>
            </div>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{courses.length}</p>
                    <p className="text-xs text-muted-foreground">Total Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{totalStudents.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Avg. Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by title or description..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Courses Display */}
        {loadingData ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <div className="animate-pulse">
                  <div className="flex flex-col lg:flex-row">
                    <div className="w-full lg:w-80 h-48 bg-gray-200 rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"></div>
                    <div className="flex-1 p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, j) => (
                          <div key={j} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                <div className="flex flex-col lg:flex-row">
                  {/* Course Image */}
                  <div className="w-full lg:w-80 h-48 lg:h-auto">
                    <img
                      src={course.image || "/placeholder.svg?height=300&width=400"}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Course Details */}
                  <div className="flex-1 p-6">
                    <div className="space-y-4">
                      {/* Title and Badges */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-start gap-2">
                          <h2 className="text-2xl font-bold flex-1 min-w-0">{course.title}</h2>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(course.status)}>
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </Badge>
                            <Badge className={getLevelColor(course.level)}>
                              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                      </div>

                      {/* Course Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${course.price}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-lg font-semibold text-blue-600">{course.students}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Enrolled Students</p>
                        </div>

                        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Star className="h-4 w-4 text-yellow-600" />
                            <span className="text-lg font-semibold text-yellow-600">
                              {course.rating > 0 ? course.rating.toFixed(1) : "N/A"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {course.review_count} review{course.review_count !== 1 ? "s" : ""}
                          </p>
                        </div>

                        <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <BarChart3 className="h-4 w-4 text-green-600" />
                            <span className="text-lg font-semibold text-green-600">{course.earnings}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Total Earnings</p>
                        </div>

                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                            <span className="text-lg font-semibold text-purple-600 capitalize">{course.level}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Difficulty Level</p>
                        </div>
                      </div>

                      {/* Last Updated */}
                      <div className="pt-2 border-t text-xs text-muted-foreground">
                        <span>Last updated: {new Date(course.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || statusFilter !== "all" || levelFilter !== "all"
                  ? "No courses found"
                  : "No courses available"}
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchQuery || statusFilter !== "all" || levelFilter !== "all"
                  ? "Try adjusting your search criteria or filters to find the courses you're looking for."
                  : "Your courses will appear here once they are created and assigned to you."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}


// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { useAuth } from "@/hooks/use-auth"
// import { InstructorLayout } from "@/components/instructor/instructor-layout"
// import { Card, CardContent } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Badge } from "@/components/ui/badge"
// import { BookOpen, Search, Users, Star, DollarSign, Eye, Clock } from "lucide-react"
// import { toast } from "@/hooks/use-toast"
// import Link from "next/link"

// interface Course {
//   id: string
//   title: string
//   description: string
//   students: number
//   rating: number
//   review_count: number
//   earnings: string
//   image: string
//   status: string
//   price: number
//   duration: number
//   level: string
//   created_at: string
//   updated_at: string
// }

// export default function InstructorCourses() {
//   const { user, loading } = useAuth()
//   const router = useRouter()
//   const [courses, setCourses] = useState<Course[]>([])
//   const [loadingData, setLoadingData] = useState(true)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [statusFilter, setStatusFilter] = useState("all")

//   useEffect(() => {
//     if (!loading && (!user || user.role !== "instructor")) {
//       router.push(user ? "/dashboard" : "/login")
//     }
//   }, [user, loading, router])

//   useEffect(() => {
//     if (user && user.role === "instructor") {
//       fetchCourses()
//     }
//   }, [user])

//   const fetchCourses = async () => {
//     try {
//       setLoadingData(true)
//       const response = await fetch("/api/instructor/courses", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       })

//       if (response.ok) {
//         const data = await response.json()
//         setCourses(data)
//       } else {
//         throw new Error("Failed to fetch courses")
//       }
//     } catch (error) {
//       console.error("Error fetching courses:", error)
//       toast({
//         title: "Error",
//         description: "Failed to load courses. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoadingData(false)
//     }
//   }

//   if (loading || !user || user.role !== "instructor") {
//     return <div className="flex items-center justify-center min-h-screen">Loading...</div>
//   }

//   // Filter courses
//   const filteredCourses = courses.filter((course) => {
//     const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
//     const matchesStatus = statusFilter === "all" || course.status === statusFilter
//     return matchesSearch && matchesStatus
//   })

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "published":
//         return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
//       case "draft":
//         return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
//       case "archived":
//         return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
//       default:
//         return "bg-gray-100 text-gray-800"
//     }
//   }

//   const getLevelColor = (level: string) => {
//     switch (level.toLowerCase()) {
//       case "beginner":
//         return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
//       case "intermediate":
//         return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
//       case "advanced":
//         return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
//       default:
//         return "bg-gray-100 text-gray-800"
//     }
//   }

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
//             <p className="text-muted-foreground">View and manage your course performance</p>
//           </div>
//           <div className="flex items-center gap-2">
//             <Badge variant="secondary" className="text-sm">
//               <BookOpen className="mr-1 h-3 w-3" />
//               {courses.length} Total Courses
//             </Badge>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="relative flex-1">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search courses..."
//               className="pl-8"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-full md:w-[180px]">
//               <SelectValue placeholder="Filter by status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Courses</SelectItem>
//               <SelectItem value="published">Published</SelectItem>
//               <SelectItem value="draft">Draft</SelectItem>
//               <SelectItem value="archived">Archived</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Courses Grid */}
//         {loadingData ? (
//           <div className="grid gap-6">
//             {[...Array(3)].map((_, i) => (
//               <Card key={i}>
//                 <div className="flex flex-col md:flex-row">
//                   <div className="w-full md:w-1/4 lg:w-1/5 animate-pulse">
//                     <div className="h-32 bg-gray-200 rounded-l-lg"></div>
//                   </div>
//                   <div className="w-full md:w-3/4 lg:w-4/5 p-6 animate-pulse">
//                     <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
//                     <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
//                     <div className="h-4 bg-gray-200 rounded w-2/3"></div>
//                   </div>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         ) : filteredCourses.length > 0 ? (
//           <div className="grid gap-6">
//             {filteredCourses.map((course) => (
//               <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
//                 <div className="flex flex-col md:flex-row">
//                   <div className="w-full md:w-1/4 lg:w-1/5">
//                     <img
//                       src={course.image || "/placeholder.svg"}
//                       alt={course.title}
//                       className="h-full w-full object-cover min-h-[200px] md:min-h-[150px]"
//                     />
//                   </div>
//                   <div className="w-full md:w-3/4 lg:w-4/5 p-6">
//                     <div className="flex justify-between items-start mb-4">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-2">
//                           <h3 className="text-xl font-bold">{course.title}</h3>
//                           <Badge className={getStatusColor(course.status)}>
//                             {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
//                           </Badge>
//                           <Badge className={getLevelColor(course.level)}>
//                             {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
//                           </Badge>
//                         </div>
//                         <p className="text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
//                         <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                           <span className="flex items-center gap-1">
//                             <Clock className="h-4 w-4" />
//                             {course.duration} min
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <DollarSign className="h-4 w-4" />${course.price}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//                       <div className="flex items-center gap-2">
//                         <Users className="h-4 w-4 text-blue-500" />
//                         <div>
//                           <p className="text-sm font-medium">{course.students}</p>
//                           <p className="text-xs text-muted-foreground">Students</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Star className="h-4 w-4 text-yellow-500" />
//                         <div>
//                           <p className="text-sm font-medium">
//                             {course.rating > 0 ? `${course.rating}/5` : "No ratings"}
//                           </p>
//                           <p className="text-xs text-muted-foreground">
//                             {course.review_count} review{course.review_count !== 1 ? "s" : ""}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <DollarSign className="h-4 w-4 text-green-500" />
//                         <div>
//                           <p className="text-sm font-medium">{course.earnings}</p>
//                           <p className="text-xs text-muted-foreground">Earnings</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <BookOpen className="h-4 w-4 text-purple-500" />
//                         <div>
//                           <p className="text-sm font-medium">{course.level}</p>
//                           <p className="text-xs text-muted-foreground">Level</p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex flex-wrap gap-2">
//                       <Link href={`/courses/${course.id}`}>
//                         <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
//                           <Eye className="mr-2 h-4 w-4" />
//                           View Course
//                         </button>
//                       </Link>
//                       <Link href={`/instructor/courses/${course.id}/students`}>
//                         <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
//                           <Users className="mr-2 h-4 w-4" />
//                           View Students
//                         </button>
//                       </Link>
//                     </div>

//                     <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
//                       <div className="flex justify-between">
//                         <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
//                         <span>Updated: {new Date(course.updated_at).toLocaleDateString()}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           <Card>
//             <CardContent className="flex flex-col items-center justify-center py-12">
//               <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
//               <h3 className="text-lg font-semibold mb-2">
//                 {searchQuery || statusFilter !== "all" ? "No courses found" : "No courses yet"}
//               </h3>
//               <p className="text-muted-foreground mb-4 text-center">
//                 {searchQuery || statusFilter !== "all"
//                   ? "Try adjusting your search or filter criteria"
//                   : "Your courses will appear here once they are created"}
//               </p>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </>
//   )
// }
