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
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  User,
  PlayCircle,
  CheckCircle,
  Award,
  Calendar,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- Helper Functions ---
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  if (minutes % 60 === 0) {
    return `${hours}h`;
  } else {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
};

interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  instructor: string;
  instructor_id: number;
  category: string;
  level: string;
  duration: number;
  progress: number;
  status: "active" | "completed" | "paused" | "in-progress";
  enrollment_date: string;
  last_accessed: string;
  completion_date?: string;
  total_lessons: number;
  completed_lessons: number;
  next_lesson: string;
  next_lesson_id?: number;
  certificate_eligible: boolean;
  grade?: string;
  image?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  course_count: number;
}

interface FilterOptions {
  categories: Category[];
  levels: string[];
  statuses: string[];
  instructors: string[];
}

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<EnrolledCourse[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    levels: [],
    statuses: [],
    instructors: [],
  });
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedInstructor, setSelectedInstructor] = useState("all");

  useEffect(() => {
    fetchCategories();
    if (user?.id) {
      fetchEnrolledCourses();
    }
  }, [user?.id]);

  useEffect(() => {
    filterCourses();
  }, [
    courses,
    searchTerm,
    selectedCategory,
    selectedLevel,
    selectedStatus,
    selectedInstructor,
  ]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch("/api/dashboard/categories");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.categories) {
        setFilterOptions((prev) => ({
          ...prev,
          categories: data.categories,
        }));
      } else {
        console.warn("Categories API returned no data, using fallback");
      }
    } catch (error) {
      console.error("Categories fetch error:", error);
      toast({
        title: "Warning",
        description:
          "Could not load categories from database. Using default categories.",
        variant: "default",
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/dashboard/student-courses?userId=${user?.id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.courses && data.courses.length > 0) {
        setCourses(data.courses);

        // Extract filter options from courses
        const levels = [
          ...new Set(
            data.courses.map((course: EnrolledCourse) => course.level)
          ),
        ];
        const statuses = [
          ...new Set(
            data.courses.map((course: EnrolledCourse) => course.status)
          ),
        ];
        const instructors = [
          ...new Set(
            data.courses.map((course: EnrolledCourse) => course.instructor)
          ),
        ];

        // setFilterOptions((prev) => ({
        //   ...prev,
        //   levels: levels.filter(Boolean),
        //   statuses: ["active", "completed", "paused", "in-progress"], // Standard statuses
        //   instructors: instructors.filter(Boolean),
        // }))
      } else {
        // Sample data for demonstration
        const sampleCourses: EnrolledCourse[] = [
          {
            id: 1,
            title: "Professional Bridal Makeup",
            description:
              "Master the art of bridal makeup with advanced techniques and long-lasting formulas.",
            instructor: "Sarah Martinez",
            instructor_id: 2,
            category: "Bridal Makeup",
            level: "Intermediate",
            duration: 18,
            progress: 75,
            status: "in-progress",
            enrollment_date: "2024-01-15",
            last_accessed: "2024-01-20",
            total_lessons: 12,
            completed_lessons: 9,
            next_lesson: "Advanced Eye Techniques",
            next_lesson_id: 10,
            certificate_eligible: false,
            image: "/placeholder.svg?height=200&width=300",
          },
          {
            id: 2,
            title: "Color Theory Fundamentals",
            description:
              "Understanding color theory and its application in professional makeup artistry.",
            instructor: "Emma Wilson",
            instructor_id: 3,
            category: "Color Theory",
            level: "Beginner",
            duration: 12,
            progress: 100,
            status: "completed",
            enrollment_date: "2023-12-01",
            last_accessed: "2023-12-15",
            completion_date: "2023-12-15",
            total_lessons: 8,
            completed_lessons: 8,
            next_lesson: "Course Completed",
            certificate_eligible: true,
            grade: "A+",
            image: "/placeholder.svg?height=200&width=300",
          },
          {
            id: 3,
            title: "Special Effects Makeup",
            description:
              "Learn creative and theatrical makeup techniques including prosthetics.",
            instructor: "Mike Thompson",
            instructor_id: 4,
            category: "Special Effects",
            level: "Advanced",
            duration: 24,
            progress: 30,
            status: "active",
            enrollment_date: "2024-01-10",
            last_accessed: "2024-01-18",
            total_lessons: 16,
            completed_lessons: 5,
            next_lesson: "Basic Prosthetic Application",
            next_lesson_id: 6,
            certificate_eligible: false,
            image: "/placeholder.svg?height=200&width=300",
          },
        ];
        setCourses(sampleCourses);
        setFilterOptions((prev) => ({
          ...prev,
          levels: ["Beginner", "Intermediate", "Advanced"],
          statuses: ["active", "completed", "paused", "in-progress"],
          instructors: ["Sarah Martinez", "Emma Wilson", "Mike Thompson"],
        }));
      }
    } catch (error) {
      console.error("Courses fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchLower) ||
          course.instructor.toLowerCase().includes(searchLower) ||
          course.category.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (course) => course.category === selectedCategory
      );
    }

    // Level filter
    if (selectedLevel !== "all") {
      filtered = filtered.filter((course) => course.level === selectedLevel);
    }

    // Status filter
    if (selectedStatus !== "all") {
      if (selectedStatus === "in-progress") {
        filtered = filtered.filter(
          (course) =>
            course.status === "in-progress" ||
            course.status === "active" ||
            (course.progress > 0 && course.progress < 100)
        );
      } else {
        filtered = filtered.filter(
          (course) => course.status === selectedStatus
        );
      }
    }

    // Instructor filter
    if (selectedInstructor !== "all") {
      filtered = filtered.filter(
        (course) => course.instructor === selectedInstructor
      );
    }

    setFilteredCourses(filtered);
  };

  const continueCourse = async (courseId: number, lessonId?: number) => {
    try {
      // Update last accessed time
      await fetch("/api/dashboard/student-courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          courseId: courseId,
          action: "continue",
        }),
      });

      // Navigate to course or specific lesson
      if (lessonId) {
        router.push(`/courses/${courseId}/lessons`);
      } else {
        router.push(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error("Continue course error:", error);
      router.push(`/courses/${courseId}/lessons`);
    }
  };

  const handleBrowseCourses = () => {
    router.push("/courses");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "active":
      case "in-progress":
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case "paused":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case "in-progress":
        return (
          <Badge className="bg-purple-100 text-purple-800">In Progress</Badge>
        );
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="px-6 pt-6">
          <DashboardHeader
            heading="My Courses"
            text="Loading your courses..."
          />
        </div>
        <div className="px-6 animate-pulse space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Dashboard Header */}
      <div className="px-6 pt-6">
        <DashboardHeader
          heading="My Courses"
          text="Overview of your learning journey"
        />
      </div>

      {/* Welcome Section */}
      <div className="px-6">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">
            Manage and track your learning progress
          </p>
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span>{courses.length} Enrolled Courses</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>
                {courses.filter((c) => c.status === "completed").length}{" "}
                Completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="px-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses, instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  filterOptions.categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name} ({category.course_count})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {filterOptions.levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>

            {/* <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Instructor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instructors</SelectItem>
                {filterOptions.instructors.map((instructor) => (
                  <SelectItem key={instructor} value={instructor}>
                    {instructor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={course.image || "/placeholder.svg?height=200&width=300"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  {getStatusBadge(course.status)}
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-white">
                    {course.level}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(course.duration)}</span>{" "}
                    {/* UPDATED LINE */}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {course.completed_lessons}/{course.total_lessons} lessons
                    </span>
                    {course.status === "completed" && course.grade && (
                      <span className="font-semibold text-green-600">
                        Grade: {course.grade}
                      </span>
                    )}
                  </div>
                </div>

                {/* Next Lesson or Status */}
                {course.status !== "completed" && (
                  <div className="text-sm">
                    <span className="text-gray-600">Next: </span>
                    <span className="font-medium">{course.next_lesson}</span>
                  </div>
                )}

                {/* Last Accessed */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Last accessed:{" "}
                    {new Date(course.last_accessed).toLocaleDateString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {course.status === "completed" ? (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        asChild
                      >
                        <Link
                          href={`/courses/${course.id}/lessons#reviews-section`}
                        >
                          {" "}
                          {/* CORRECTED PATH */}
                          <BookOpen className="h-4 w-4 mr-2" />
                          Review
                        </Link>
                      </Button>
                      {course.certificate_eligible && (
                        <Button variant="outline" asChild>
                          <Link href="/dashboard/certificates">
                            <Award className="h-4 w-4 mr-2" />
                            Certificate
                          </Link>
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={() =>
                        continueCourse(course.id, course.next_lesson_id)
                      }
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Browse More Courses */}
        {filteredCourses.length > 0 && (
          <div className="mt-8 text-center">
            <Button onClick={handleBrowseCourses} variant="outline" size="lg">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse More Courses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && !loading && (
        <div className="px-6">
          <Card>
            <div className="text-center py-16">
              <GraduationCap className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {searchTerm ||
                selectedCategory !== "all" ||
                selectedLevel !== "all" ||
                selectedStatus !== "all" ||
                selectedInstructor !== "all"
                  ? "No courses found"
                  : "No Enrolled Courses"}
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {searchTerm ||
                selectedCategory !== "all" ||
                selectedLevel !== "all" ||
                selectedStatus !== "all" ||
                selectedInstructor !== "all"
                  ? "Try adjusting your search or filter criteria to find courses."
                  : "Start your learning journey by enrolling in courses that match your interests and goals."}
              </p>
              <Button
                onClick={handleBrowseCourses}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Available Courses
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
