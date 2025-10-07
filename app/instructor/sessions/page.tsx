"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { InstructorLayout } from "@/components/instructor/instructor-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Play,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface Session {
  id: string;
  title: string;
  description?: string;
  training_id?: string;
  training_title?: string;
  scheduled_at: string;
  duration: number;
  students: number;
  status: string;
  meeting_url?: string;
}

interface Training {
  id: string;
  name: string;
  title: string;
}

export default function InstructorSessions() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    training_id: "none",
    scheduled_at: "",
    duration: 60,
    meeting_url: "",
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "instructor")) {
      router.push(user ? "/dashboard" : "/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "instructor") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem("auth_token");

      // Fetch sessions
      const sessionsResponse = await fetch("/api/instructor/sessions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData);
      }

      // Fetch trainings (courses) for the dropdown
      const trainingsResponse = await fetch("/api/instructor/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (trainingsResponse.ok) {
        const trainingsData = await trainingsResponse.json();
        // Map the response to match our Training interface
        const mappedTrainings = trainingsData.map((training: any) => ({
          id: training.id.toString(),
          name: training.title || training.name,
          title: training.title || training.name,
        }));
        setTrainings(mappedTrainings);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load sessions data.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/instructor/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: result.note || "Session scheduled successfully!",
        });
        setIsCreateDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          training_id: "none",
          scheduled_at: "",
          duration: 60,
          meeting_url: "",
        });
        fetchData();
      } else {
        throw new Error(result.error || "Failed to create session");
      }
    } catch (error: any) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to schedule session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `/api/instructor/sessions/${selectedSession.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Session updated successfully!",
        });
        setIsEditDialogOpen(false);
        setSelectedSession(null);
        fetchData();
      } else {
        throw new Error(result.error || "Failed to update session");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to update session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`/api/instructor/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Session deleted successfully!",
        });
        fetchData();
      } else {
        throw new Error(result.error || "Failed to delete session");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartSession = (session: Session) => {
    if (session.meeting_url) {
      // Open the meeting URL in a new tab
      window.open(session.meeting_url, "_blank", "noopener,noreferrer");

      // Update session status to 'live'
      updateSessionStatus(session.id, "live");

      toast({
        title: "Session Started",
        description: `${session.title} is now live!`,
      });
    } else {
      // Generate a meeting room or show instructions
      toast({
        title: "Meeting URL Required",
        description: "Please add a meeting URL to start the session.",
        variant: "destructive",
      });
    }
  };

  const updateSessionStatus = async (sessionId: string, status: string) => {
    try {
      const token = localStorage.getItem("auth_token");

      await fetch(`/api/instructor/sessions/${sessionId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      fetchData(); // Refresh the sessions list
    } catch (error) {
      console.error("Error updating session status:", error);
    }
  };

  const openEditDialog = (session: Session) => {
    setSelectedSession(session);
    setFormData({
      title: session.title,
      description: session.description || "",
      training_id: session.training_id || "none",
      scheduled_at: new Date(session.scheduled_at).toISOString().slice(0, 16),
      duration: session.duration,
      meeting_url: session.meeting_url || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDetailsDialog = (session: Session) => {
    setSelectedSession(session);
    setIsDetailsDialogOpen(true);
  };

  if (loading || !user || user.role !== "instructor") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-500";
      case "scheduled":
        return "bg-blue-500";
      case "completed":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const isSessionLive = (session: Session) => {
    const now = new Date();
    const sessionStart = new Date(session.scheduled_at);
    const sessionEnd = new Date(
      sessionStart.getTime() + session.duration * 60000
    );

    return (
      now >= sessionStart && now <= sessionEnd && session.status !== "completed"
    );
  };

  return (
    <InstructorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Live Sessions</h1>
            <p className="text-muted-foreground">
              Schedule and manage your live teaching sessions
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule New Session</DialogTitle>
                <DialogDescription>
                  Create a new live session for your students.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Live Q&A: Hair Styling Techniques"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="training">Training (Optional)</Label>
                  <Select
                    value={formData.training_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, training_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a training" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific training</SelectItem>
                      {trainings.map((training) => (
                        <SelectItem key={training.id} value={training.id}>
                          {training.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduled_at">Date & Time</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduled_at: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: Number.parseInt(e.target.value),
                      })
                    }
                    min="15"
                    max="180"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="What will you cover in this session?"
                  />
                </div>
                <div>
                  <Label htmlFor="meeting_url">Meeting URL (Optional)</Label>
                  <Input
                    id="meeting_url"
                    value={formData.meeting_url}
                    onChange={(e) =>
                      setFormData({ ...formData, meeting_url: e.target.value })
                    }
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Schedule Session</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sessions List */}
        {loadingData ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <div className="grid gap-4">
            {sessions.map((session) => {
              const { date, time } = formatDateTime(session.scheduled_at);
              const isLive = isSessionLive(session);

              return (
                <Card
                  key={session.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Video className="h-5 w-5 text-blue-500" />
                          {session.title}
                          {isLive && (
                            <Badge className="bg-red-500 text-white animate-pulse">
                              LIVE
                            </Badge>
                          )}
                          <Badge
                            className={`text-white ${getStatusColor(session.status)}`}
                          >
                            {session.status.toUpperCase()}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {time} ({session.duration} min)
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {session.students} enrolled
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(session)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Session
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{session.title}
                                "? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSession(session.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {session.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {session.description}
                      </p>
                    )}
                    {session.training_title && (
                      <p className="text-sm font-medium mb-4">
                        Training: {session.training_title}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStartSession(session)}
                        disabled={session.status === "completed"}
                        className={
                          isLive ? "bg-green-500 hover:bg-green-600" : ""
                        }
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {isLive ? "Join Live Session" : "Start Session"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailsDialog(session)}
                      >
                        View Details
                      </Button>
                      {session.meeting_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={session.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Join Meeting
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No sessions scheduled
              </h3>
              <p className="text-muted-foreground mb-4 text-center">
                Schedule your first live session to connect with your students
                in real-time
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Your First Session
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Edit Session Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Session</DialogTitle>
              <DialogDescription>
                Update your session details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSession} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Session Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-training">Training (Optional)</Label>
                <Select
                  value={formData.training_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, training_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a training" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific training</SelectItem>
                    {trainings.map((training) => (
                      <SelectItem key={training.id} value={training.id}>
                        {training.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-scheduled_at">Date & Time</Label>
                <Input
                  id="edit-scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_at: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: Number.parseInt(e.target.value),
                    })
                  }
                  min="15"
                  max="180"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-meeting_url">Meeting URL (Optional)</Label>
                <Input
                  id="edit-meeting_url"
                  value={formData.meeting_url}
                  onChange={(e) =>
                    setFormData({ ...formData, meeting_url: e.target.value })
                  }
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Session</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Session Details Dialog */}
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Session Details
              </DialogTitle>
            </DialogHeader>
            {selectedSession && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedSession.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      className={`text-white ${getStatusColor(selectedSession.status)}`}
                    >
                      {selectedSession.status.toUpperCase()}
                    </Badge>
                    {isSessionLive(selectedSession) && (
                      <Badge className="bg-red-500 text-white animate-pulse">
                        LIVE NOW
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Date
                    </Label>
                    <p>{formatDateTime(selectedSession.scheduled_at).date}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Time
                    </Label>
                    <p>{formatDateTime(selectedSession.scheduled_at).time}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Duration
                    </Label>
                    <p>{selectedSession.duration} minutes</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Enrolled Students
                    </Label>
                    <p>{selectedSession.students} students</p>
                  </div>
                </div>

                {selectedSession.training_title && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Training
                    </Label>
                    <p>{selectedSession.training_title}</p>
                  </div>
                )}

                {selectedSession.description && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Description
                    </Label>
                    <p className="text-sm">{selectedSession.description}</p>
                  </div>
                )}

                {selectedSession.meeting_url && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Meeting URL
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={selectedSession.meeting_url}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            selectedSession.meeting_url!
                          )
                        }
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleStartSession(selectedSession)}
                    disabled={selectedSession.status === "completed"}
                    className={
                      isSessionLive(selectedSession)
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isSessionLive(selectedSession)
                      ? "Join Live Session"
                      : "Start Session"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openEditDialog(selectedSession)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Session
                  </Button>
                  {selectedSession.meeting_url && (
                    <Button variant="outline" asChild>
                      <a
                        href={selectedSession.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Meeting
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </InstructorLayout>
  );
}
