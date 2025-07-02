"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Search,
  Filter,
  CalendarIcon,
  Clock,
  MapPin,
  User,
  Video,
  Users,
  ChevronLeft,
  ChevronRight,
  Play,
  ExternalLink,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

interface Session {
  id: number
  title: string
  description: string
  instructor_name: string
  instructor_id: number
  category: string
  session_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  session_type: "live" | "recorded" | "workshop"
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  location: string
  max_participants: number
  current_participants: number
  meeting_link?: string
  materials_link?: string
  is_enrolled: boolean
}

interface Category {
  id: number
  name: string
  description?: string
}

interface Instructor {
  id: number
  name: string
  email: string
  specialization?: string
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function CalendarPage() {
  const { toast } = useToast()
  const { user } = useAuth()

  // State management
  const [sessions, setSessions] = useState<Session[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedInstructor, setSelectedInstructor] = useState("all")

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchSessions()
      fetchCategories()
      fetchInstructors()
    }
  }, [user?.id])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sessions/student?userId=${user?.id}`)

      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      } else {
        // Mock data for demonstration
        const mockSessions: Session[] = [
          {
            id: 1,
            title: "Advanced Bridal Makeup Techniques",
            description:
              "Learn professional bridal makeup techniques including long-wear formulas and photography-ready looks.",
            instructor_name: "Sarah Martinez",
            instructor_id: 1,
            category: "Bridal Makeup",
            session_date: "2024-01-15",
            start_time: "10:00",
            end_time: "12:00",
            duration_minutes: 120,
            session_type: "live",
            status: "upcoming",
            location: "Studio A",
            max_participants: 15,
            current_participants: 12,
            meeting_link: "https://zoom.us/j/123456789",
            is_enrolled: true,
          },
          {
            id: 2,
            title: "Color Theory Masterclass",
            description: "Deep dive into color theory and its application in makeup artistry.",
            instructor_name: "Emma Wilson",
            instructor_id: 2,
            category: "Color Theory",
            session_date: "2024-01-16",
            start_time: "14:00",
            end_time: "16:30",
            duration_minutes: 150,
            session_type: "workshop",
            status: "upcoming",
            location: "Main Hall",
            max_participants: 20,
            current_participants: 18,
            is_enrolled: true,
          },
          {
            id: 3,
            title: "Special Effects Makeup Workshop",
            description: "Create stunning special effects looks using professional techniques and products.",
            instructor_name: "Michael Chen",
            instructor_id: 3,
            category: "Special Effects",
            session_date: "2024-01-17",
            start_time: "09:00",
            end_time: "17:00",
            duration_minutes: 480,
            session_type: "workshop",
            status: "upcoming",
            location: "Studio B",
            max_participants: 10,
            current_participants: 8,
            is_enrolled: false,
          },
          {
            id: 4,
            title: "Fashion Makeup Fundamentals",
            description: "Master the basics of fashion makeup for runway and editorial work.",
            instructor_name: "Sarah Martinez",
            instructor_id: 1,
            category: "Fashion Makeup",
            session_date: "2024-01-18",
            start_time: "13:00",
            end_time: "15:00",
            duration_minutes: 120,
            session_type: "live",
            status: "upcoming",
            location: "Studio A",
            max_participants: 12,
            current_participants: 10,
            meeting_link: "https://zoom.us/j/987654321",
            is_enrolled: true,
          },
          {
            id: 5,
            title: "Airbrush Makeup Techniques",
            description: "Learn professional airbrush makeup application for flawless results.",
            instructor_name: "Emma Wilson",
            instructor_id: 2,
            category: "Airbrush Makeup",
            session_date: "2024-01-19",
            start_time: "11:00",
            end_time: "14:00",
            duration_minutes: 180,
            session_type: "workshop",
            status: "upcoming",
            location: "Studio C",
            max_participants: 8,
            current_participants: 6,
            is_enrolled: true,
          },
        ]
        setSessions(mockSessions)
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load sessions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      } else {
        // Mock categories
        setCategories([
          { id: 1, name: "Bridal Makeup" },
          { id: 2, name: "Color Theory" },
          { id: 3, name: "Special Effects" },
          { id: 4, name: "Fashion Makeup" },
          { id: 5, name: "Airbrush Makeup" },
        ])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([
        { id: 1, name: "Bridal Makeup" },
        { id: 2, name: "Color Theory" },
        { id: 3, name: "Special Effects" },
        { id: 4, name: "Fashion Makeup" },
        { id: 5, name: "Airbrush Makeup" },
      ])
    }
  }

  const fetchInstructors = async () => {
    try {
      const response = await fetch("/api/instructors/available")
      if (response.ok) {
        const data = await response.json()
        setInstructors(data.instructors || [])
      } else {
        // Mock instructors
        setInstructors([
          { id: 1, name: "Sarah Martinez", email: "sarah@bbmi.com", specialization: "Bridal Makeup" },
          { id: 2, name: "Emma Wilson", email: "emma@bbmi.com", specialization: "Color Theory" },
          { id: 3, name: "Michael Chen", email: "michael@bbmi.com", specialization: "Special Effects" },
        ])
      }
    } catch (error) {
      console.error("Error fetching instructors:", error)
      setInstructors([
        { id: 1, name: "Sarah Martinez", email: "sarah@bbmi.com", specialization: "Bridal Makeup" },
        { id: 2, name: "Emma Wilson", email: "emma@bbmi.com", specialization: "Color Theory" },
        { id: 3, name: "Michael Chen", email: "michael@bbmi.com", specialization: "Special Effects" },
      ])
    }
  }

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getSessionsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return sessions.filter((session) => session.session_date === dateString)
  }

  const hasSessionsOnDate = (date: Date) => {
    return getSessionsForDate(date).length > 0
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateYear = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setFullYear(prev.getFullYear() - 1)
      } else {
        newDate.setFullYear(prev.getFullYear() + 1)
      }
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 border border-gray-100"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const sessionsOnDate = getSessionsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = selectedDate?.toDateString() === date.toDateString()

      days.push(
        <div
          key={day}
          className={`h-12 border border-gray-100 cursor-pointer transition-colors relative ${
            isToday ? "bg-blue-100 text-blue-800 font-semibold" : ""
          } ${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-50"}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="p-1 text-sm">
            {day}
            {sessionsOnDate.length > 0 && (
              <div className="absolute bottom-1 right-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            )}
          </div>
        </div>,
      )
    }

    return days
  }

  const getFilteredSessions = () => {
    let filtered = sessions

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (session) =>
          session.title.toLowerCase().includes(searchLower) ||
          session.instructor_name.toLowerCase().includes(searchLower) ||
          session.category.toLowerCase().includes(searchLower) ||
          session.description.toLowerCase().includes(searchLower),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((session) => session.category === selectedCategory)
    }

    if (selectedInstructor !== "all") {
      filtered = filtered.filter((session) => session.instructor_name === selectedInstructor)
    }

    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0]
      filtered = filtered.filter((session) => session.session_date === dateString)
    }

    return filtered
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "live":
        return <Video className="h-4 w-4" />
      case "recorded":
        return <Play className="h-4 w-4" />
      case "workshop":
        return <Users className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const handleJoinSession = (session: Session) => {
    if (session.meeting_link) {
      window.open(session.meeting_link, "_blank")
      toast({
        title: "Joining Session",
        description: `Opening ${session.title} in a new window.`,
      })
    } else {
      toast({
        title: "No Meeting Link",
        description: "This session doesn't have a meeting link available.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-6 pt-6 pb-8">
        <DashboardHeader heading="Calendar" text="Loading your training calendar..." />
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-6 pt-6 pb-8">
      <DashboardHeader heading="Calendar" text="View your training sessions and schedule" />

      {/* Description Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Training Calendar
          </CardTitle>
          <CardDescription>
            View and manage your upcoming training sessions. Click on calendar dates to see scheduled sessions for that
            day.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search and Filter Section */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search sessions, instructors, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Instructor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Instructors</SelectItem>
              {instructors.map((instructor) => (
                <SelectItem key={instructor.id} value={instructor.name}>
                  {instructor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchTerm || selectedCategory !== "all" || selectedInstructor !== "all" || selectedDate) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedInstructor("all")
                setSelectedDate(null)
              }}
              className="px-3"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Calendar and Sessions Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateYear("prev")} className="px-2">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="px-2">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="px-3">
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="px-2">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateYear("next")} className="px-2">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {/* Day headers */}
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-center text-sm font-medium text-gray-600"
                  >
                    {day}
                  </div>
                ))}
                {/* Calendar days */}
                {renderCalendar()}
              </div>

              {/* Calendar Legend */}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Has Sessions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions for Selected Date */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate
                  ? `Sessions for ${selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}`
                  : "Select a Date"}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {selectedDate
                  ? `${getSessionsForDate(selectedDate).length} session${getSessionsForDate(selectedDate).length !== 1 ? "s" : ""} scheduled`
                  : "Click on a calendar date to view sessions"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDate && getSessionsForDate(selectedDate).length > 0 ? (
                getSessionsForDate(selectedDate).map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm leading-tight">{session.title}</h4>
                      <Badge className={`text-xs ${getStatusColor(session.status)}`}>{session.status}</Badge>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {session.start_time} - {session.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{session.instructor_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(session.session_type)}
                        <span className="capitalize">{session.session_type}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {session.is_enrolled && session.status === "upcoming" && session.meeting_link && (
                        <Button size="sm" className="flex-1 text-xs" onClick={() => handleJoinSession(session)}>
                          <Video className="h-3 w-3 mr-1" />
                          Join
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>{session.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">{session.description}</p>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Date:</span>
                                <p>{new Date(session.session_date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="font-medium">Time:</span>
                                <p>
                                  {session.start_time} - {session.end_time}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Instructor:</span>
                                <p>{session.instructor_name}</p>
                              </div>
                              <div>
                                <span className="font-medium">Location:</span>
                                <p>{session.location}</p>
                              </div>
                              <div>
                                <span className="font-medium">Category:</span>
                                <p>{session.category}</p>
                              </div>
                              <div>
                                <span className="font-medium">Participants:</span>
                                <p>
                                  {session.current_participants}/{session.max_participants}
                                </p>
                              </div>
                            </div>

                            {session.is_enrolled && session.status === "upcoming" && session.meeting_link && (
                              <Button className="w-full" onClick={() => handleJoinSession(session)}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Join Session
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))
              ) : selectedDate ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No sessions scheduled for this date</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Click on a calendar date to view sessions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <p className="text-sm text-gray-600">
            {getFilteredSessions().length} session{getFilteredSessions().length !== 1 ? "s" : ""} found
          </p>
        </CardHeader>
        <CardContent>
          {getFilteredSessions().length > 0 ? (
            <div className="grid gap-4">
              {getFilteredSessions().map((session) => (
                <div key={session.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{session.description}</p>
                    </div>
                    <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span>{new Date(session.session_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>
                        {session.start_time} - {session.end_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{session.instructor_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{session.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(session.session_type)}
                        <span className="capitalize">{session.session_type}</span>
                      </div>
                      <Badge variant="secondary">{session.category}</Badge>
                      <span>
                        {session.current_participants}/{session.max_participants} participants
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {session.is_enrolled && session.status === "upcoming" && session.meeting_link && (
                        <Button size="sm" onClick={() => handleJoinSession(session)}>
                          <Video className="h-4 w-4 mr-2" />
                          Join Session
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>{session.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">{session.description}</p>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Date:</span>
                                <p>{new Date(session.session_date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="font-medium">Time:</span>
                                <p>
                                  {session.start_time} - {session.end_time}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Instructor:</span>
                                <p>{session.instructor_name}</p>
                              </div>
                              <div>
                                <span className="font-medium">Location:</span>
                                <p>{session.location}</p>
                              </div>
                              <div>
                                <span className="font-medium">Category:</span>
                                <p>{session.category}</p>
                              </div>
                              <div>
                                <span className="font-medium">Participants:</span>
                                <p>
                                  {session.current_participants}/{session.max_participants}
                                </p>
                              </div>
                            </div>

                            {session.is_enrolled && session.status === "upcoming" && session.meeting_link && (
                              <Button className="w-full" onClick={() => handleJoinSession(session)}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Join Session
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Sessions Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory !== "all" || selectedInstructor !== "all" || selectedDate
                  ? "Try adjusting your search or filter criteria."
                  : "No training sessions are currently scheduled."}
              </p>
              {(searchTerm || selectedCategory !== "all" || selectedInstructor !== "all" || selectedDate) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedInstructor("all")
                    setSelectedDate(null)
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
