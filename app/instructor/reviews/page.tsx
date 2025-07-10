// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Progress } from "@/components/ui/progress"
// import { Star, MessageSquare, TrendingUp } from "lucide-react"
// import { useAuth } from "@/hooks/use-auth"
// import { toast } from "sonner"
// import { InstructorLayout } from "@/components/instructor/instructor-layout"

// interface Review {
//   id: string
//   student_name: string
//   student_avatar: string
//   course_title: string
//   rating: number
//   comment: string
//   created_at: string
//   instructor_reply: string | null
//   replied_at: string | null
//   time_ago: string
// }

// interface ReviewStats {
//   total_reviews: number
//   average_rating: number
//   rating_distribution: {
//     5: number
//     4: number
//     3: number
//     2: number
//     1: number
//   }
// }

// export default function InstructorReviewsPage() {
//   const [reviews, setReviews] = useState<Review[]>([])
//   const [stats, setStats] = useState<ReviewStats | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [replyingTo, setReplyingTo] = useState<string | null>(null)
//   const [replyText, setReplyText] = useState("")
//   const { user } = useAuth()

//   useEffect(() => {
//     fetchReviews()
//   }, [])

//   const fetchReviews = async () => {
//     try {
//       const token = localStorage.getItem("token")
//       const response = await fetch("/api/instructor/reviews", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })

//       if (response.ok) {
//         const data = await response.json()
//         setReviews(data.reviews)
//         setStats(data.stats)
//       }
//     } catch (error) {
//       console.error("Error fetching reviews:", error)
//       toast.error("Failed to load reviews")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleReply = async (reviewId: string) => {
//     if (!replyText.trim()) return

//     try {
//       const token = localStorage.getItem("token")
//       const response = await fetch("/api/instructor/reviews", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           review_id: reviewId,
//           reply: replyText,
//         }),
//       })

//       if (response.ok) {
//         toast.success("Reply added successfully")
//         setReplyingTo(null)
//         setReplyText("")
//         fetchReviews() // Refresh reviews
//       } else {
//         toast.error("Failed to add reply")
//       }
//     } catch (error) {
//       console.error("Error adding reply:", error)
//       toast.error("Failed to add reply")
//     }
//   }

//   const renderStars = (rating: number) => {
//     return Array.from({ length: 5 }, (_, i) => (
//       <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
//     ))
//   }

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h1 className="text-3xl font-bold">Reviews & Ratings</h1>
//         </div>
//         <div className="grid gap-6 md:grid-cols-3">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <Card key={i}>
//               <CardHeader className="animate-pulse">
//                 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                 <div className="h-8 bg-gray-200 rounded w-1/2"></div>
//               </CardHeader>
//             </Card>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   return (
//   <InstructorLayout>
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Reviews & Ratings</h1>
//           <p className="text-muted-foreground">Manage student feedback and ratings</p>
//         </div>
//       </div>

//       {/* Stats Overview */}
//       {stats && (
//         <div className="grid gap-6 md:grid-cols-3">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
//               <MessageSquare className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats.total_reviews}</div>
//               <p className="text-xs text-muted-foreground">Across all courses</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
//               <Star className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold flex items-center gap-2">
//                 {stats.average_rating}
//                 <div className="flex">{renderStars(Math.round(stats.average_rating))}</div>
//               </div>
//               <p className="text-xs text-muted-foreground">Out of 5 stars</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
//               <TrendingUp className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats.rating_distribution[5] + stats.rating_distribution[4]}%</div>
//               <p className="text-xs text-muted-foreground">4+ star reviews</p>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Rating Distribution */}
//       {stats && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Rating Distribution</CardTitle>
//             <CardDescription>Breakdown of ratings across all your courses</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {[5, 4, 3, 2, 1].map((rating) => (
//               <div key={rating} className="flex items-center gap-4">
//                 <div className="flex items-center gap-1 w-16">
//                   <span className="text-sm font-medium">{rating}</span>
//                   <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                 </div>
//                 <Progress
//                   value={stats.rating_distribution[rating as keyof typeof stats.rating_distribution]}
//                   className="flex-1"
//                 />
//                 <span className="text-sm text-muted-foreground w-12">
//                   {stats.rating_distribution[rating as keyof typeof stats.rating_distribution]}%
//                 </span>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       )}

//       {/* Reviews List */}
//       <div className="space-y-4">
//         <h2 className="text-xl font-semibold">Recent Reviews</h2>
//         {reviews.length === 0 ? (
//           <Card>
//             <CardContent className="flex flex-col items-center justify-center py-12">
//               <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
//               <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
//               <p className="text-muted-foreground text-center">
//                 Reviews from your students will appear here once they start rating your courses.
//               </p>
//             </CardContent>
//           </Card>
//         ) : (
//           reviews.map((review) => (
//             <Card key={review.id}>
//               <CardContent className="pt-6">
//                 <div className="flex items-start gap-4">
//                   <Avatar>
//                     <AvatarImage src={review.student_avatar || "/placeholder.svg"} />
//                     <AvatarFallback>{review.student_name.charAt(0)}</AvatarFallback>
//                   </Avatar>
//                   <div className="flex-1 space-y-2">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h4 className="font-semibold">{review.student_name}</h4>
//                         <p className="text-sm text-muted-foreground">{review.course_title}</p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <div className="flex">{renderStars(review.rating)}</div>
//                         <span className="text-sm text-muted-foreground">{review.time_ago}</span>
//                       </div>
//                     </div>
//                     <p className="text-sm">{review.comment}</p>

//                     {/* Instructor Reply */}
//                     {review.instructor_reply && (
//                       <div className="mt-4 p-3 bg-muted rounded-lg">
//                         <div className="flex items-center gap-2 mb-2">
//                           <Avatar className="h-6 w-6">
//                             <AvatarImage src={user?.profile_picture || "/placeholder.svg"} />
//                             <AvatarFallback>{user?.full_name?.charAt(0) || "U"}</AvatarFallback>
//                           </Avatar>
//                           <span className="text-sm font-medium">You replied</span>
//                           <span className="text-xs text-muted-foreground">
//                             {new Date(review.replied_at!).toLocaleDateString()}
//                           </span>
//                         </div>
//                         <p className="text-sm">{review.instructor_reply}</p>
//                       </div>
//                     )}

//                     {/* Reply Form */}
//                     {!review.instructor_reply && (
//                       <div className="mt-4">
//                         {replyingTo === review.id ? (
//                           <div className="space-y-2">
//                             <Textarea
//                               placeholder="Write your reply..."
//                               value={replyText}
//                               onChange={(e) => setReplyText(e.target.value)}
//                               className="min-h-[80px]"
//                             />
//                             <div className="flex gap-2">
//                               <Button size="sm" onClick={() => handleReply(review.id)}>
//                                 Send Reply
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => {
//                                   setReplyingTo(null)
//                                   setReplyText("")
//                                 }}
//                               >
//                                 Cancel
//                               </Button>
//                             </div>
//                           </div>
//                         ) : (
//                           <Button size="sm" variant="outline" onClick={() => setReplyingTo(review.id)}>
//                             Reply
//                           </Button>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         )}
//       </div>
//     </div>
//     </InstructorLayout>
//   )
  
  
// }
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Star, MessageSquare, TrendingUp, Calendar, User, BookOpen } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { InstructorLayout } from "@/components/instructor/instructor-layout"

interface Review {
  id: string
  student_name: string
  student_avatar: string
  course_title: string
  rating: number
  comment: string
  created_at: string
  instructor_reply: string | null
  replied_at: string | null
  time_ago: string
}

interface ReviewStats {
  total_reviews: number
  average_rating: number
  rating_distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export default function InstructorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("auth_token")

      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch("/api/instructor/reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
        setStats(data.stats || null)
        console.log("Reviews loaded:", data.reviews?.length || 0)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to load reviews")
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply")
      return
    }

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/instructor/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          review_id: reviewId,
          reply: replyText,
        }),
      })

      if (response.ok) {
        toast.success("Reply added successfully")
        setReplyingTo(null)
        setReplyText("")
        fetchReviews() // Refresh reviews
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to add reply")
      }
    } catch (error) {
      console.error("Error adding reply:", error)
      toast.error("Failed to add reply")
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <InstructorLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Reviews & Ratings</h1>
              <p className="text-muted-foreground">Loading your reviews...</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </InstructorLayout>
    )
  }

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reviews & Ratings</h1>
            <p className="text-muted-foreground">
              {stats
                ? `Manage feedback from ${stats.total_reviews} student reviews`
                : "Manage student feedback and ratings"}
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_reviews}</div>
                <p className="text-xs text-muted-foreground">Across all your courses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {stats.average_rating}
                  <div className="flex">{renderStars(Math.round(stats.average_rating))}</div>
                </div>
                <p className="text-xs text-muted-foreground">Out of 5 stars</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rating_distribution[5] + stats.rating_distribution[4]}%</div>
                <p className="text-xs text-muted-foreground">4+ star reviews</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rating Distribution */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <CardDescription>Breakdown of ratings across all your courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress
                    value={stats.rating_distribution[rating as keyof typeof stats.rating_distribution]}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">
                    {stats.rating_distribution[rating as keyof typeof stats.rating_distribution]}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Reviews</h2>
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reviews Given Yet</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  You haven't received any reviews from students yet. Reviews will appear here once students start
                  rating your courses.
                </p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={review.student_avatar || "/placeholder.svg?height=48&width=48"} />
                      <AvatarFallback className="bg-primary/10">
                        {review.student_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      {/* Review Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold text-lg">{review.student_name}</h4>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>{review.course_title}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 font-medium">{review.rating}/5</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{review.time_ago}</span>
                          </div>
                        </div>
                      </div>

                      {/* Review Comment */}
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm leading-relaxed">{review.comment}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Posted on {formatDate(review.created_at)}
                        </div>
                      </div>

                      {/* Instructor Reply */}
                      {review.instructor_reply && (
                        <div className="ml-4 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user?.profile_picture || "/placeholder.svg?height=24&width=24"} />
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {user?.full_name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase() || "I"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">Your Reply</span>
                            <span className="text-xs text-muted-foreground">{formatDate(review.replied_at!)}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{review.instructor_reply}</p>
                        </div>
                      )}

                      {/* Reply Form */}
                      {!review.instructor_reply && (
                        <div className="mt-4">
                          {replyingTo === review.id ? (
                            <div className="space-y-3">
                              <Textarea
                                placeholder="Write a thoughtful reply to this student's review..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="min-h-[100px] resize-none"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleReply(review.id)} disabled={!replyText.trim()}>
                                  Send Reply
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReplyingTo(null)
                                    setReplyText("")
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReplyingTo(review.id)}
                              className="mt-2"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Reply to Review
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </InstructorLayout>
  )
}

