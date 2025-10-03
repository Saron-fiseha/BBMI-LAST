// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { PulsatingButton } from "@/components/magicui/pulsating-button";
// import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
// import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
// import { ShinyButton } from "@/components/magicui/shiny-button";
// import { Clock, Users, Star } from "lucide-react";
// import Image from "next/image";
// import type { Course } from "@/lib/types";
// import { LoadingSpinner } from "@/components/loading-spinner";
// import router from "next/router";

// export function FeaturedCourses() {
//   const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const response = await fetch("/api/courses"); // fetch all trainings
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const json = await response.json();
//         console.log("Raw API response courses:", json.courses);
//         // ✅ Sort by created_at (if available) and take top 3
//         const sorted = [...json.courses]
//           .filter((c) => c.created_at) // Ensure it's defined
//           .sort(
//             (a, b) =>
//               new Date(b.created_at!).getTime() -
//               new Date(a.created_at!).getTime()
//           );
//         console.log("Sorted courses (with created_at):", sorted);
//         const top3 = sorted.slice(0, 3);
//         console.log("Top 3 most recent courses:", top3);
//         setFeaturedCourses(top3);
//       } catch (err) {
//         console.error("Failed to fetch featured courses:", err);
//         setError("Failed to load courses. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCourses();
//   }, []);

//   // --- Loading and Error states remain the same ---
//   if (loading) {
//     return (
//       <section className="py-20 bg-gray-50 flex justify-center items-center min-h-[400px]">
//         <LoadingSpinner />
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section className="py-20 bg-gray-50 text-center text-red-500">
//         <p>{error}</p>
//       </section>
//     );
//   }

//   return (
//     <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-pink-50 via-white to-purple-50 text-black">
//       <div className="container px-4 md:px-6">
//         <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
//           <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
//             Our Featured Courses
//           </h2>
//           <p className="max-w-[900px] text-golden-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
//             Explore our most popular and highly-rated courses designed to
//             elevate your skills.
//           </p>
//         </div>

//         <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
//           {Array.isArray(featuredCourses) && featuredCourses.length > 0 ? (
//             featuredCourses.map((course) => (
//               <Card
//                 key={course.id}
//                 className="flex flex-col h-full bg-white border-golden-600 text-black shadow-lg hover:shadow-golden-500/30 transition-shadow duration-300"
//               >
//                 {/* --- Image with Badge --- */}
//                 <div className="relative">
//                   <Image
//                     src={
//                       course.image_url ||
//                       "/placeholder.svg?height=200&width=300"
//                     }
//                     alt={course.title || "Course thumbnail"}
//                     width={300}
//                     height={200}
//                     className="w-full h-64 object-cover"
//                   />
//                   {/* <Badge className="absolute top-4 left-4 bg-amber-600 text-black rounded-full">
//                     {course.category_id || "Unspecified"}
//                   </Badge> */}
//                 </div>

//                 {/* --- Card Header --- */}
//                 <CardHeader className="bg-white">
//                   <div className="flex justify-between items-start">
//                     <CardTitle className="text-xl">
//                       {course.title || "Untitled Course"}
//                     </CardTitle>
//                     <div className="flex items-center gap-1">
//                       <Star className="w-4 h-4 fill-golden-300 text-golden-300" />
//                       <span>{(course.average_rating || 0).toFixed(1)}</span>
//                     </div>
//                   </div>
//                   <p className="text-sm text-gray-600 mt-2">
//                     {course.description || "No description available"}
//                   </p>
//                 </CardHeader>

//                 {/* --- Card Content --- */}
//                 <CardContent className="space-y-4 bg-white">
//                   <div className="flex justify-between text-sm text-gray-600">
//                     <div className="flex items-center gap-1">
//                       <Clock className="w-4 h-4 text-golden-300" />
//                       <span>{`${course.duration_hours || 0} hours`}</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Users className="w-4 h-4 text-golden-300" />
//                       <span>{`${course.students || 0} students`}</span>
//                     </div>
//                   </div>

//                   {/* --- Pricing --- */}
//                   <div className="flex items-center justify-between">
//                     <div className="text-2xl font-bold text-golden-400">
//                       {course.discount && course.discount > 0 ? (
//                         <div className="flex items-center gap-2">
//                           <span className="line-through text-gray-500 text-lg">
//                             ${(Number(course.price) || 0).toFixed(2)}
//                           </span>
//                           <span>
//                             $
//                             {(
//                               (Number(course.price) || 0) *
//                               (1 - course.discount / 100)
//                             ).toFixed(2)}
//                           </span>
//                           <Badge className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
//                             {course.discount}% OFF
//                           </Badge>
//                         </div>
//                       ) : (
//                         <span>${(Number(course.price) || 0).toFixed(2)}</span>
//                       )}
//                     </div>
//                   </div>
//                 </CardContent>

//                 {/* --- Card Footer --- */}
//                 <CardFooter className="bg-white flex gap-2">
//                   <ShinyButton
//                     href={`/courses/${course.id}`}
//                     className="text-sm px-6 py-3"
//                   >
//                     View Course
//                   </ShinyButton>
//                   <Button
//                     variant="ghost"
//                     className="text-black hover:text-white hover:bg-[#330033] px-6 py-3 text-sm"
//                     onClick={() => router.push(`/payment/${course.id}`)}
//                   >
//                     Enroll Now
//                   </Button>
//                 </CardFooter>
//               </Card>
//             ))
//           ) : (
//             <div className="col-span-full text-center py-12">
//               <p className="text-gray-500">
//                 {featuredCourses?.length === 0
//                   ? "No courses available."
//                   : "Loading courses..."}
//               </p>
//             </div>
//           )}
//         </div>

//         <div className="text-center mt-12">
//           <ShinyButton
//             href="/courses"
//             size="lg"
//             className="bg-[#ffe6ff] hover:bg-[#b38600] px-8 py-4"
//           >
//             <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-black">
//               Browse All Courses
//             </span>
//           </ShinyButton>
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription, // Corrected: Import CardDescription
  CardFooter, // Corrected: Import CardFooter
  CardHeader, // Corrected: Import CardHeader
  CardTitle, // Corrected: Import CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShinyButton } from "@/components/magicui/shiny-button";
import {
  Clock,
  Users,
  Search, // Not used, can be removed if not needed elsewhere
  CheckCircle, // Not used, can be removed if not needed elsewhere
  CalendarDays,
  BarChart, // Not used, can be removed if not needed elsewhere
  GraduationCap,
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"; // Added for consistency with CoursesPage

// --- Types (Copied from app/courses/page.tsx and extended for featured) ---

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
  // Fields from the old featured course type that might still be in API response
  created_at?: string;
  average_rating?: number;
  students?: number; // Old field, mapped to max_trainees or ignored
  duration_hours?: number; // Old field, mapped to duration
}

// --- Helper Functions (Copied from app/courses/page.tsx) ---
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// --- New Component: CourseCard (Copied from app/courses/page.tsx, with import corrections) ---
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
      {/* Corrected: Use imported components directly */}
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
      {/* Corrected: Use imported components directly */}
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

// Helper component for card features (Copied from app/courses/page.tsx)
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

export function FeaturedCourses() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses"); // fetch all trainings
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        // console.log("Raw API response courses:", json.courses);

        const fetchedCourses: any[] = json.courses || [];

        // Process courses to fit the new Course interface requirements
        const processedCourses = fetchedCourses
          .filter((c) => c.created_at) // Ensure it's defined for sorting
          .sort(
            (a, b) =>
              new Date(b.created_at!).getTime() -
              new Date(a.created_at!).getTime()
          )
          .slice(0, 3) // Take top 3 most recent
          .map((course, index) => ({
            id: course.id,
            title: course.title || "Untitled Course",
            description: course.description || "No description available.",
            instructor_name: course.instructor_name || null,
            price: course.price || 0,
            duration: course.duration_hours ? course.duration_hours * 60 : 120, // Convert hours to minutes, default 120min
            level:
              course.level ||
              (index % 3 === 0
                ? "beginner"
                : index % 3 === 1
                  ? "intermediate"
                  : "advanced"), // Mock level if not from API
            image_url:
              course.image_url || "/placeholder.svg?height=200&width=300",
            category_id: course.category_id || 1, // Default category ID
            category_name:
              course.category_name || `Category ${course.category_id || 1}`, // Mock category name
            discount: course.discount || 0,
            max_trainees: course.students || 50, // Use old 'students' field for max_trainees
            modules: course.modules || 5, // Mock modules
            course_code: course.course_code || `BBMI-${course.id}`, // Mock course code
            status: course.status || "published", // Mock status
            provides_certification:
              course.provides_certification !== undefined
                ? course.provides_certification
                : index % 2 === 0, // Mock certification
            one_year_access:
              course.one_year_access !== undefined
                ? course.one_year_access
                : true, // Mock access
            created_at: course.created_at,
            average_rating: course.average_rating,
            students: course.students,
            duration_hours: course.duration_hours,
          }));

        setFeaturedCourses(processedCourses);
      } catch (err) {
        console.error("Failed to fetch featured courses:", err);
        setError("Failed to load courses. Please try again later.");
        toast({
          title: "Error fetching featured courses",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // --- Loading and Error states remain the same ---
  if (loading) {
    return (
      <section className="py-20 bg-gray-50 flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50 text-center text-red-500">
        <p>{error}</p>
      </section>
    );
  }

  // Simple handler for enrollment click in featured section, just navigates
  const handleEnrollClick = (courseId: number) => {
    router.push(`/courses/${courseId}`);
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-pink-50 via-white to-purple-50 text-black">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
            Our Featured Courses
          </h2>
          <p className="max-w-[900px] text-golden-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Explore our most popular and highly-rated courses designed to
            elevate your skills.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(featuredCourses) && featuredCourses.length > 0 ? (
            featuredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnrollClick={handleEnrollClick}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                {featuredCourses?.length === 0
                  ? "No featured courses available at this time."
                  : "Loading courses..."}
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
  );
}
