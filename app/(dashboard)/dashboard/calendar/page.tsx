"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Video,
  MapPin,
  Users,
  ExternalLink,
  Loader2,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { parseUTCTimestamp } from "@/lib/date-utils";

interface DayCell {
  date: Date | null;
  sessions: any[];
}

export default function TrainingCalendarDashboard() {
  const { user, loading: authLoading } = useAuth();

  // State hooks
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  // Data State Hooks
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Constants
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch real sessions from the backend API — using the actual logged-in
  // user's id from useAuth() instead of a non-existent localStorage key.
  useEffect(() => {
  if (authLoading) return;
  if (!user) {
    setLoading(false);
    setError("Please log in to view your schedule.");
    return;
  }

  const userId = user.id; // captured here so TS knows it's non-null below

  async function fetchSessions() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `/api/sessions/student?userId=${userId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
        const data = await response.json();

        if (response.ok && data.success) {
          setSessions(data.sessions || []);
        } else {
          setError(data.error || "Failed to load scheduled sessions.");
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setError("Network error loading schedule. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [user, authLoading]);

  // Dynamically extract unique categories and instructors from active sessions
  const categories = useMemo(() => {
    const unique = Array.from(new Set(sessions.map((s) => s.category).filter(Boolean)));
    return unique.map((cat, idx) => ({ id: String(idx), name: cat }));
  }, [sessions]);

  const instructors = useMemo(() => {
    const unique = Array.from(
      new Set(sessions.map((s) => s.full_name || s.instructor_name).filter(Boolean))
    );
    return unique.map((inst, idx) => ({ id: String(idx), name: inst }));
  }, [sessions]);

  // Date & Time formatting helpers — all session timestamps are stored as
  // UTC instants, so we always parse with parseUTCTimestamp first, then
  // let the browser's locale formatting convert to the viewer's local time.
  const getTimeFromScheduledAt = (dateStr: string) => {
    if (!dateStr) return "";
    return parseUTCTimestamp(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEndTime = (dateStr: string, durationMinutes: number) => {
    if (!dateStr) return "";
    const start = parseUTCTimestamp(dateStr);
    const end = new Date(start.getTime() + (durationMinutes || 60) * 60000);
    return end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    return <Video className="h-4 w-4" />;
  };

  const handleJoinSession = (session: any) => {
    if (session.meeting_url) {
      window.open(session.meeting_url, "_blank");
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const navigateYear = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  // Filter Active Calculation
  const isFiltered = Boolean(
    searchTerm ||
    selectedCategory !== "all" ||
    selectedInstructor !== "all" ||
    selectedDate
  );

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedInstructor("all");
    setSelectedDate(null);
  };

  // Session Filtering Logic
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const instName = session.full_name || session.instructor_name || "";
      const catName = session.category || "";

      const matchesSearch =
        searchTerm === "" ||
        session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || catName === selectedCategory;

      const matchesInstructor =
        selectedInstructor === "all" || instName === selectedInstructor;

      const matchesDate =
        !selectedDate ||
        parseUTCTimestamp(session.scheduled_at).toDateString() ===
          selectedDate.toDateString();

      return matchesSearch && matchesCategory && matchesInstructor && matchesDate;
    });
  }, [searchTerm, selectedCategory, selectedInstructor, selectedDate, sessions]);

  const selectedDateSessions = useMemo(
    () =>
      selectedDate
        ? sessions.filter(
            (session) =>
              parseUTCTimestamp(session.scheduled_at).toDateString() ===
              selectedDate.toDateString()
          )
        : [],
    [selectedDate, sessions]
  );

  // Build the actual month grid — real day cells (this was completely
  // missing before; only the weekday header row was rendered).
  const monthGrid = useMemo<DayCell[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay(); // 0 = Sun ... 6 = Sat
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: DayCell[] = [];

    // Leading blanks so day 1 lines up under the correct weekday
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ date: null, sessions: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const daySessions = sessions.filter(
        (s) =>
          parseUTCTimestamp(s.scheduled_at).toDateString() ===
          date.toDateString()
      );
      cells.push({ date, sessions: daySessions });
    }

    // Trailing blanks to complete the final week row
    const trailing = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < trailing; i++) {
      cells.push({ date: null, sessions: [] });
    }

    return cells;
  }, [currentDate, sessions]);

  const today = new Date();

  return (
    <div className="space-y-6 px-6 pt-6 pb-8 pl-16 lg:pl-6">
      {/* Inline Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          View your training sessions and schedule
        </p>
      </div>

      {/* Header Info Card */}
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

      {/* Search & Filter Controls */}
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

          {isFiltered && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="px-3"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {(loading || authLoading) && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600 font-medium">Fetching scheduled sessions...</span>
        </div>
      )}

      {/* Error Message Alert */}
      {!loading && !authLoading && error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Main Grid: Calendar & Day Sessions */}
      {!loading && !authLoading && !error && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar View */}
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
                      aria-label="Previous Year"
                      className="px-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                      aria-label="Previous Month"
                      className="px-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentDate(new Date());
                        setSelectedDate(new Date());
                      }}
                      className="px-3"
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                      aria-label="Next Month"
                      className="px-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateYear("next")}
                      aria-label="Next Year"
                      className="px-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="h-9 flex items-center justify-center text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {day}
                    </div>
                  ))}

                  {monthGrid.map((cell, idx) => {
                    if (!cell.date) {
                      return <div key={`blank-${idx}`} className="h-16 sm:h-20" />;
                    }

                    const isToday =
                      cell.date.toDateString() === today.toDateString();
                    const isSelected =
                      selectedDate &&
                      cell.date.toDateString() === selectedDate.toDateString();
                    const hasSessions = cell.sessions.length > 0;

                    return (
                      <button
                        key={cell.date.toISOString()}
                        onClick={() => setSelectedDate(cell.date)}
                        className={[
                          "h-16 sm:h-20 rounded-lg border flex flex-col items-center justify-start pt-2 gap-1 transition-colors text-sm",
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : isToday
                            ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700",
                        ].join(" ")}
                      >
                        <span
                          className={
                            isSelected
                              ? "font-semibold"
                              : isToday
                              ? "font-semibold"
                              : ""
                          }
                        >
                          {cell.date.getDate()}
                        </span>
                        {hasSessions && (
                          <span
                            className={[
                              "flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full",
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-green-100 text-green-700",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "h-1.5 w-1.5 rounded-full",
                                isSelected ? "bg-white" : "bg-green-500",
                              ].join(" ")}
                            />
                            {cell.sessions.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded" />
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded" />
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Has Sessions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Day Sessions Sidebar */}
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
                    ? `${selectedDateSessions.length} session${
                        selectedDateSessions.length !== 1 ? "s" : ""
                      } scheduled`
                    : "Click on a calendar date to view sessions"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDate && selectedDateSessions.length > 0 ? (
                  selectedDateSessions.map((session) => (
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
                          {session.status
                            ? session.status.charAt(0).toUpperCase() + session.status.slice(1)
                            : "Scheduled"}
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
                          <span>{session.full_name || session.instructor_name || "Instructor"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(session.session_type)}
                          <span className="capitalize">
                            {session.session_type || "Live"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        {session.meeting_url && (
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
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground mb-3" />
                    <h4 className="font-medium mb-1">
                      {selectedDate ? "No Sessions Scheduled" : "Select a Date"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate
                        ? "There are no training sessions scheduled for this date."
                        : "Click on a calendar date to view scheduled sessions."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* All Filtered Sessions List */}
      {!loading && !authLoading && !error && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Training Sessions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Browse and manage all available training sessions
                </p>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {filteredSessions.length} session
                {filteredSessions.length !== 1 ? "s" : ""} available
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSessions.length > 0 ? (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{session.title}</h3>
                          <Badge
                            variant="outline"
                            className={getStatusColor(session.status)}
                          >
                            {session.status
                              ? session.status.charAt(0).toUpperCase() + session.status.slice(1)
                              : "Scheduled"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{session.full_name || session.instructor_name || "Instructor"}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(session.session_type)}
                            <span className="capitalize">
                              {session.session_type || "Live"}
                            </span>
                          </div>
                          {session.category && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="text-xs">
                                {session.category}
                              </Badge>
                            </>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">
                          {session.description}
                        </p>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-3">
                        <div className="text-left md:text-right">
                          <div className="font-medium">
                            {session.scheduled_at
                              ? parseUTCTimestamp(session.scheduled_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "Date TBD"}
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

                          {session.meeting_url && (
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
                            {session.current_participants || session.students || 0}/
                            {session.max_participants || 50} spots
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
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No Sessions Found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {isFiltered
                    ? "No sessions match your current filters. Try adjusting your search criteria."
                    : "There are currently no training sessions scheduled."}
                </p>
                {isFiltered && (
                  <Button variant="outline" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                {selectedSession.description || "No description provided."}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Date</p>
                  <p>
                    {selectedSession.scheduled_at
                      ? parseUTCTimestamp(selectedSession.scheduled_at).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
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
                  <p className="font-medium text-muted-foreground">Instructor</p>
                  <p>{selectedSession.full_name || selectedSession.instructor_name || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Location</p>
                  <p>{selectedSession.location || "Online"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Type</p>
                  <p className="capitalize">{selectedSession.session_type || "Live"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <p className="capitalize">{selectedSession.status || "Scheduled"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Participants</p>
                  <p>
                    {selectedSession.current_participants || selectedSession.students || 0}/
                    {selectedSession.max_participants || 50} spots filled
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Category</p>
                  <p>{selectedSession.category || "General"}</p>
                </div>
              </div>

              {selectedSession.meeting_url && (
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