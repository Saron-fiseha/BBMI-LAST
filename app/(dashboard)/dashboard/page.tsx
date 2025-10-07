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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Award,
  Calendar,
  PlayCircle,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Target,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  totalCertificates: number;
  averageProgress: number;
}

interface RecentActivity {
  id: number;
  type:
    | "course_started"
    | "lesson_completed"
    | "certificate_earned"
    | "course_completed";
  title: string;
  description: string;
  date: string;
  courseId?: number;
}

interface EnrolledCourse {
  id: number;
  name: string; // Changed to 'name' to match backend output 't.name'
  instructor: string;
  progress: number;
  total_lessons: number; // Changed to 'total_lessons'
  completed_lessons: number; // Changed to 'completed_lessons'
  next_lesson: string; // Changed to 'next_lesson'
  last_accessed: string; // Changed to 'last_accessed'
  category_id: string; // Changed to 'category_id'
  level: string;
  duration: number;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalCertificates: 0,
    averageProgress: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]); // Keeping for now as it's commented out in JSX
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard statistics
      const statsResponse = await fetch(
        `/api/dashboard/student-stats?userId=${user?.id}`
      );
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      } else {
        console.error(
          "Failed to fetch stats:",
          statsResponse.status,
          statsResponse.statusText
        );
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics.",
          variant: "destructive",
        });
      }

      // Fetch recent activity (keeping API call, but UI is commented out)
      const activityResponse = await fetch(
        `/api/dashboard/student-activity?userId=${user?.id}`
      );
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities);
      } else {
        console.warn(
          "Failed to fetch recent activity:",
          activityResponse.status,
          activityResponse.statusText
        );
        // Do not toast for activity if UI is commented out, just log
      }

      // Fetch enrolled courses
      const coursesResponse = await fetch(
        `/api/dashboard/student-courses?userId=${user?.id}`
      );
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setEnrolledCourses(coursesData.courses);
      } else {
        console.error(
          "Failed to fetch courses:",
          coursesResponse.status,
          coursesResponse.statusText
        );
        toast({
          title: "Error",
          description: "Failed to load enrolled courses.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "course_started":
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case "lesson_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "certificate_earned":
        return <Award className="h-4 w-4 text-yellow-600" />;
      case "course_completed":
        return <GraduationCap className="h-4 w-4 text-purple-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Added responsive padding-left for loading state to account for mobile menu button */}
        <div className="px-6 pt-6 pl-16 lg:pl-6">
          <DashboardHeader
            heading="Dashboard"
            text="Loading your dashboard..."
          />
        </div>
        <div className="px-6 animate-pulse space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(3)].map(
              (
                _,
                i // Only 3 cards now
              ) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  const inProgressCoursesCount = stats.totalCourses - stats.completedCourses;

  return (
    // Main container with consistent padding for all screen sizes
    <div className="space-y-6 px-6 pt-6 pb-8">
      {/* Dashboard Header */}
      {/* Added responsive padding-left to make space for the mobile menu button */}
      <div className="pl-16 lg:pl-0">
        <DashboardHeader
          heading="Dashboard"
          text="Overview of your learning journey"
        />
      </div>

      {/* Welcome Section - Text content will wrap naturally */}
      <div>
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.full_name || "Student"}! 👋
              </h1>
              <p className="text-gray-600">
                Continue your learning journey and achieve your beauty goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Responsive grid: 1 column on small, 2 on medium, 3 on large */}
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {inProgressCoursesCount} in progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCourses}</div>
              <p className="text-xs text-muted-foreground">Courses finished</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Certificates
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCertificates}
              </div>
              <p className="text-xs text-muted-foreground">
                Achievements earned
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid - Stacks on small/medium, 3 columns on large */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Courses - Takes full width on small/medium, 2 columns on large */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Continue Learning</CardTitle>
                  <CardDescription>Pick up where you left off</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/courses">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledCourses?.slice(0, 3).map((course) => (
                // Responsive course card: Stacks content on small, side-by-side on 'sm' and up
                <div
                  key={course.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{course.name}</h4>
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Instructor: {course.instructor}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      {" "}
                      {/* Added flex-wrap for smaller text details */}
                      <span>
                        {course.completed_lessons}/{course.total_lessons}{" "}
                        lessons
                      </span>
                      <span>•</span>
                      <span>Next: {course.next_lesson}</span>
                    </div>
                    <Progress
                      value={course.progress}
                      className="h-2"
                    />
                  </div>
                  {/* Button: Full width on small, auto width on 'sm' and up */}
                  <Button
                    className="bg-custom-copper hover:bg-custom-copper w-full sm:w-auto"
                    size="sm"
                    asChild
                  >
                    <Link href={`/courses/${course.id}`}>Continue</Link>
                  </Button>
                </div>
              ))}

              {!enrolledCourses?.length && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No courses yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start your learning journey today
                  </p>
                  <Button asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Takes full width on small/medium, 1 column on large */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Quick Actions Buttons: Stacks on small, 2 columns on medium and up */}
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-20 flex-col bg-transparent"
                  asChild
                >
                  <Link href="/courses">
                    <BookOpen className="h-6 w-6 mb-2" />
                    Browse Courses
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col bg-transparent"
                  asChild
                >
                  <Link href="/dashboard/certificates">
                    <Award className="h-6 w-6 mb-2" />
                    My Certificates
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col bg-transparent"
                  asChild
                >
                  <Link href="/dashboard/calendar">
                    <Calendar className="h-6 w-6 mb-2" />
                    Schedule
                  </Link>
                </Button>
                {/* <Button
                  variant="outline"
                  className="h-20 flex-col bg-transparent"
                  asChild
                >
                  <Link href="/instructors">
                    <Users className="h-6 w-6 mb-2" />
                    Find Instructors
                  </Link>
                </Button> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
