"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface Session {
  id: number;
  title: string;
  description: string;
  instructor_name: string;
  instructor_id: number;
  category: string;
  scheduled_at: string;
  duration: number;
  session_type: "live" | "recorded" | "workshop";
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  location: string;
  max_participants: number;
  current_participants: number;
  meeting_url?: string;
  materials_url?: string;
  is_enrolled: boolean;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Instructor {
  id: number;
  name: string;
  email: string;
  specialization?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
];

// Helper functions for date/time formatting
const getDateFromScheduledAt = (scheduled_at: string) => {
  return new Date(scheduled_at).toISOString().split("T")[0];
};

const getTimeFromScheduledAt = (scheduled_at: string) => {
  return new Date(scheduled_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const getEndTime = (scheduled_at: string, duration: number) => {
  const end = new Date(new Date(scheduled_at).getTime() + duration * 60000);
  return end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function CalendarPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedInstructor, setSelectedInstructor] = useState("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
      fetchCategories();
      fetchInstructors();
    }
  }, [user?.id]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/student?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else {
        throw new Error("Failed to load sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        setCategories([
          { id: 1, name: "Bridal Makeup" },
          { id: 2, name: "Color Theory" },
          { id: 3, name: "Special Effects" },
          { id: 4, name: "Fashion Makeup" },
          { id: 5, name: "Airbrush Makeup" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([
        { id: 1, name: "Bridal Makeup" },
        { id: 2, name: "Color Theory" },
        { id: 3, name: "Special Effects" },
        { id: 4, name: "Fashion Makeup" },
        { id: 5, name: "Airbrush Makeup" },
      ]);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch("/api/instructors/available");
      if (response.ok) {
        const data = await response.json();
        setInstructors(data.instructors || []);
      } else {
        setInstructors([
          {
            id: 1,
            name: "Sarah Martinez",
            email: "sarah@bbmi.com",
            specialization: "Bridal Makeup",
          },
          {
            id: 2,
            name: "Emma Wilson",
            email: "emma@bbmi.com",
            specialization: "Color Theory",
          },
          {
            id: 3,
            name: "Michael Chen",
            email: "michael@bbmi.com",
            specialization: "Special Effects",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setInstructors([
        {
          id: 1,
          name: "Sarah Martinez",
          email: "sarah@bbmi.com",
          specialization: "Bridal Makeup",
        },
        {
          id: 2,
          name: "Emma Wilson",
          email: "emma@bbmi.com",
          specialization: "Color Theory",
        },
        {
          id: 3,
          name: "Michael Chen",
          email: "michael@bbmi.com",
          specialization: "Special Effects",
        },
      ]);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getSessionsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return sessions.filter(
      (session) => getDateFromScheduledAt(session.scheduled_at) === dateString
    );
  };

  const hasSessionsOnDate = (date: Date) => {
    return getSessionsForDate(date).length > 0;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateYear = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setFullYear(prev.getFullYear() - 1);
      } else {
        newDate.setFullYear(prev.getFullYear() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 border border-gray-100"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const sessionsOnDate = getSessionsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

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
        </div>
      );
    }

    return days;
  };

  const getFilteredSessions = () => {
    let filtered = sessions;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.title.toLowerCase().includes(searchLower) ||
          session.instructor_name.toLowerCase().includes(searchLower) ||
          session.category.toLowerCase().includes(searchLower) ||
          session.description.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (session) => session.category === selectedCategory
      );
    }

    if (selectedInstructor !== "all") {
      filtered = filtered.filter(
        (session) => session.instructor_name === selectedInstructor
      );
    }

    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      filtered = filtered.filter(
        (session) => getDateFromScheduledAt(session.scheduled_at) === dateString
      );
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "live":
        return <Video className="h-4 w-4" />;
      case "recorded":
        return <Play className="h-4 w-4" />;
      case "workshop":
        return <Users className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const handleJoinSession = (session: Session) => {
    if (session.meeting_url) {
      window.open(session.meeting_url, "_blank");
      toast({
        title: "Joining Session",
        description: `Opening ${session.title} in a new window.`,
      });
    } else {
      toast({
        title: "No Meeting Link",
        description: "This session doesn't have a meeting link available.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 px-6 pt-6 pb-8">
        <DashboardHeader
          heading="Calendar"
          text="Loading your training calendar..."
        />
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 pt-6 pb-8">
      <DashboardHeader
        heading="Calendar"
        text="View your training sessions and schedule"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Training Calendar
          </CardTitle>
          <CardDescription>
            View and manage your upcoming training sessions. Click on calendar
            dates to see scheduled sessions for that day.
          </CardDescription>
        </CardHeader>
      </Card>

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

          <Select
            value={selectedInstructor}
            onValueChange={setSelectedInstructor}
          >
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

          {(searchTerm ||
            selectedCategory !== "all" ||
            selectedInstructor !== "all" ||
            selectedDate) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedInstructor("all");
                setSelectedDate(null);
              }}
              className="px-3"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateYear("prev")}
                    className="px-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                    className="px-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                    className="px-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateYear("next")}
                    className="px-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-center text-sm font-medium text-gray-600"
                  >
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>

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

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? (
                  <>
                    Sessions for{" "}
                    <span className="text-blue-600">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </>
                ) : (
                  "Select a Date"
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedDate
                  ? `${getSessionsForDate(selectedDate).length} session${
                      getSessionsForDate(selectedDate).length !== 1 ? "s" : ""
                    } scheduled`
                  : "Click on a calendar date to view sessions"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDate && getSessionsForDate(selectedDate).length > 0 ? (
                getSessionsForDate(selectedDate).map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{session.title}</h4>
                      <Badge
                        variant="outline"
                        className={getStatusColor(session.status)}
                      >
                        {session.status.charAt(0).toUpperCase() +
                          session.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {getTimeFromScheduledAt(session.scheduled_at)} -{" "}
                          {getEndTime(session.scheduled_at, session.duration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{session.instructor_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(session.session_type)}
                        <span className="capitalize">
                          {session.session_type}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      {session.status === "scheduled" &&
                        session.meeting_url && (
                          <Button
                            size="sm"
                            className="flex-1 text-xs gap-1"
                            onClick={() => handleJoinSession(session)}
                          >
                            <Video className="h-4 w-4" />
                            Join
                          </Button>
                        )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setSelectedSession(session)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : selectedDate ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mb-3" />
                  <h4 className="font-medium mb-1">No Sessions Scheduled</h4>
                  <p className="text-sm text-muted-foreground">
                    There are no training sessions scheduled for this date
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mb-3" />
                  <h4 className="font-medium mb-1">Select a Date</h4>
                  <p className="text-sm text-muted-foreground">
                    Click on a calendar date to view scheduled sessions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Training Sessions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Browse and manage all available training sessions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                {getFilteredSessions().length} session
                {getFilteredSessions().length !== 1 ? "s" : ""} available
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {getFilteredSessions().length > 0 ? (
            <div className="space-y-4">
              {getFilteredSessions().map((session) => (
                <div
                  key={session.id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          {session.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={getStatusColor(session.status)}
                        >
                          {session.status.charAt(0).toUpperCase() +
                            session.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{session.instructor_name}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(session.session_type)}
                          <span className="capitalize">
                            {session.session_type}
                          </span>
                        </div>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">
                          {session.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {session.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="font-medium">
                          {new Date(session.scheduled_at).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getTimeFromScheduledAt(session.scheduled_at)} -{" "}
                          {getEndTime(session.scheduled_at, session.duration)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSession(session)}
                        >
                          Details
                        </Button>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {/* <div>
                                <span className="font-medium">Date:</span>
                                <p>{new Date(session.session_date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="font-medium">Time:</span>
                                <p>
                                  {session.start_time} - {session.end_time}
                                </p>
                              </div> */}
                              <div>
                                <span className="font-medium">Instructor:</span>
                                <p>{session.instructor_name}</p>
                              </div>
                              {/* <div>
                                <span className="font-medium">Location:</span>
                                <p>{session.location}</p>
                              </div> */}
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

                        {session.status === "scheduled" &&
                          session.meeting_url && (
                            <Button
                              size="sm"
                              onClick={() => handleJoinSession(session)}
                              className="gap-1"
                            >
                              <Video className="h-4 w-4" />
                              Join
                            </Button>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{session.location || "Online"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {session.current_participants}/
                          {session.max_participants} spots
                        </span>
                      </div>
                    </div>

                    {session.materials_url && (
                      <Button variant="link" size="sm" className="h-auto p-0">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Materials
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <CalendarIcon className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Sessions Found</h3>
              <p className="text-sm text-muted-foreground max-w-md text-center">
                {searchTerm ||
                selectedCategory !== "all" ||
                selectedInstructor !== "all" ||
                selectedDate
                  ? "No sessions match your current filters. Try adjusting your search criteria."
                  : "There are currently no training sessions scheduled."}
              </p>
              {(searchTerm ||
                selectedCategory !== "all" ||
                selectedInstructor !== "all" ||
                selectedDate) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedInstructor("all");
                    setSelectedDate(null);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Details Modal */}
      {selectedSession && (
        <Dialog
          open={!!selectedSession}
          onOpenChange={() => setSelectedSession(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedSession.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedSession.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Date</p>
                  <p>
                    {new Date(selectedSession.scheduled_at).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Time</p>
                  <p>
                    {getTimeFromScheduledAt(selectedSession.scheduled_at)} -{" "}
                    {getEndTime(
                      selectedSession.scheduled_at,
                      selectedSession.duration
                    )}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Instructor
                  </p>
                  <p>{selectedSession.instructor_name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Location</p>
                  <p>{selectedSession.location || "Online"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Type</p>
                  <p className="capitalize">{selectedSession.session_type}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <p className="capitalize">{selectedSession.status}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Participants
                  </p>
                  <p>
                    {selectedSession.current_participants}/
                    {selectedSession.max_participants} spots filled
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Category</p>
                  <p>{selectedSession.category}</p>
                </div>
              </div>

              {selectedSession.status === "scheduled" &&
                selectedSession.meeting_url && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleJoinSession(selectedSession)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Session
                  </Button>
                )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
