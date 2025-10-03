// pages/courses.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// --- UI Components ---
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShinyButton } from "@/components/magicui/shiny-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Users,
  Search,
  CheckCircle,
  CalendarDays,
  BarChart,
  GraduationCap,
} from "lucide-react";

// --- Types ---

// Define a type for Categories to hold both ID and Name
interface Category {
  id: number;
  name: string;
}

// Updated Course interface with new fields requested by user
interface Course {
  id: number;
  title: string;
  description: string;
  instructor_name: string | null;
  price: number;
  duration: number; // Duration in minutes
  level: string;
  image_url: string;
  category_id: number;
  category_name: string; // This MUST come from your API now
  discount: number; // Percentage discount (e.g., 20 for 20%)
  max_trainees: number;
  modules: number;
  course_code: string;
  status: string;
  provides_certification: boolean;
  one_year_access: boolean;
}

// --- Helper Functions ---
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// --- New Component: CourseCard ---
interface CourseCardProps {
  course: Course;
  onEnrollClick: (courseId: number) => void;
}

function CourseCard({ course, onEnrollClick }: CourseCardProps) {
  const discountedPrice = course.price * (1 - course.discount / 100);
  const hasDiscount = course.discount > 0;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 group border border-transparent hover:border-custom-copper">
      {/* Image and Badges */}

      <div className="relative h-72 w-full overflow-hidden">
        <img
          src={course.image_url || "/placeholder.svg?height=200&width=300"}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {hasDiscount && (
          <Badge
            variant="destructive"
            className="absolute top-3 left-3 text-sm font-bold"
          >
            {course.discount}% OFF
          </Badge>
        )}
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 bg-white text-gray-800 shadow capitalize"
        >
          {course.level}
        </Badge>
      </div>

      {/* Content Area */}
      <CardHeader className="flex-grow">
        <CardDescription className="text-custom-copper font-medium text-sm capitalize">
          {course.category_name}
        </CardDescription>
        <CardTitle className="text-lg font-bold line-clamp-2 leading-tight">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-3 text-gray-600 pt-1">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow">
        {/* Price Display */}
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-extrabold text-gray-900">
            ${discountedPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-md font-medium text-gray-400 line-through">
              {/* ${course.price.toFixed(2)}$ */}
              {(Number(course.price) || 0).toFixed(2)}
            </span>
          )}
        </div>

        {/* Key Features Section */}
        <div className="space-y-2 border-t pt-3">
          <FeatureItem icon={Clock} text={formatDuration(course.duration)} />
          {course.provides_certification && (
            <FeatureItem icon={GraduationCap} text="Certification Included" />
          )}
          {course.one_year_access && (
            <FeatureItem icon={CalendarDays} text="1 Year Access" />
          )}
        </div>
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="grid grid-cols-2 gap-3 mt-auto">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/courses/${course.id}`}>View Details</Link>
        </Button>
        <ShinyButton
          onClick={() => onEnrollClick(course.id)}
          className="w-full"
        >
          Enroll Now
        </ShinyButton>
      </CardFooter>
    </Card>
  );
}

// Helper component for card features
function FeatureItem({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center text-sm text-gray-700">
      <Icon className="h-4 w-4 mr-2 text-custom-tan flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}

// --- Main Page Component ---
export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all"); // Now controlled by Tabs
  const [levelFilter, setLevelFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, categoryFilter, levelFilter]);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        const fetchedCourses: Course[] = data.courses || [];

        // IMPORTANT: Your backend API MUST return `category_name` within each course object.
        // If your API currently doesn't, you will need to update your backend or fetch
        // categories separately and map them here.
        const processedCourses = fetchedCourses.map((course, index) => ({
          ...course,
          // Fallback if API doesn't provide category_name, for development only.
          // In production, `course.category_name` should be guaranteed by your API.
          category_name:
            course.category_name || `Category ${course.category_id}`,
          // Mocking provides_certification and one_year_access if not from API
          provides_certification:
            course.provides_certification !== undefined
              ? course.provides_certification
              : index % 2 === 0,
          one_year_access:
            course.one_year_access !== undefined
              ? course.one_year_access
              : true,
        }));

        setCourses(processedCourses);

        // Extract unique categories from courses for Tabs and Filters
        // Ensures category.name is present for display in tabs.
        const uniqueCategories = Array.from(
          new Map(
            processedCourses.map((course) => [
              course.category_id,
              { id: course.category_id, name: course.category_name },
            ])
          ).values()
        );
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast({ title: "Error fetching data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((course) =>
        [
          course.title,
          course.description,
          course.instructor_name,
          course.category_name,
        ].some(
          // Added category_name to search
          (field) =>
            String(field || "")
              .toLowerCase()
              .includes(query)
        )
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (course) => course.category_id.toString() === categoryFilter
      );
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter((course) => course.level === levelFilter);
    }

    setFilteredCourses(filtered);
  };

  const handleEnrollClick = (courseId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to enroll in courses.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    router.push(`/courses/${courseId}`);
  };

  const levels = Array.from(new Set(courses.map((course) => course.level)));

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* --- Hero Section --- */}
        <BlurFade delay={0.2}>
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              Unlock Your Potential
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Discover expert-led training programs designed to elevate your
              career. Browse by category or search for specific skills.
            </p>
          </section>
        </BlurFade>
        {/* --- Filters and Search --- */}
        <BlurFade delay={0.3}>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by training title, description, instructor, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full md:w-48 h-12 capitalize">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level} value={level} className="capitalize">
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </BlurFade>
        {/* --- Category Tabs --- */}
        <div className="mb-40 md:mb-10">
          <BlurFade delay={0.4}>
            <Tabs
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              className="w-full"
            >
              {/* Added styling to TabsList for a more prominent and professional look */}
              {/* <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:flex md:w-auto bg-white p-1 rounded-lg shadow-sm"> */}
              {/* <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:flex md:w-auto md:justify-start bg-white p-1 rounded-lg shadow-sm"> */}
              <TabsList className="flex flex-wrap justify-start gap-2 w-full p-1 bg-white rounded-lg shadow-sm">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-custom-copper data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 ease-in-out"
                >
                  All Categories
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id.toString()}
                    className="capitalize data-[state=active]:bg-custom-copper data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 ease-in-out"
                  >
                    {category.name} {/* Displaying the actual category name */}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </BlurFade>
        </div>
        {/* --- Trainings Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {filteredCourses.map((course, index) => (
            <BlurFade key={course.id} delay={0.1 * index}>
              <CourseCard course={course} onEnrollClick={handleEnrollClick} />
            </BlurFade>
          ))}
        </div>
        {filteredCourses.length === 0 && !loading && (
          <BlurFade delay={0.2}>
            <div className="text-center py-16 col-span-full">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Trainings Found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria to find the perfect
                course for you.
              </p>
            </div>
          </BlurFade>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

// --- Loading Skeleton Component ---
function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-12">
          {/* Skeleton Hero */}
          <div className="space-y-3 text-center mx-auto max-w-xl">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-5 bg-gray-200 rounded w-full"></div>
            <div className="h-5 bg-gray-200 rounded w-5/6 mx-auto"></div>
          </div>
          {/* Skeleton Filters */}
          <div className="flex gap-4">
            <div className="h-12 bg-gray-200 rounded flex-1"></div>
            <div className="h-12 bg-gray-200 rounded w-48"></div>
          </div>
          {/* Skeleton Tabs */}
          <div className="flex space-x-4 p-1 bg-gray-200 rounded-lg shadow-sm">
            {" "}
            {/* Updated for new TabsList styling */}
            <div className="h-10 bg-gray-300 rounded-lg w-28"></div>
            <div className="h-10 bg-gray-300 rounded-lg w-28 opacity-70"></div>
            <div className="h-10 bg-gray-300 rounded-lg w-28 opacity-70"></div>
          </div>
          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="space-y-3 p-4 border border-gray-200 rounded-lg"
              >
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-1/2 mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
