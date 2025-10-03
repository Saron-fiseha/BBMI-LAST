// // C:\Users\Hp\Documents\BBMI-LMS\app\courses\[id]\page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
// import Image from "next/image";
// import { SiteHeader } from "@/components/site-header";
// import { SiteFooter } from "@/components/site-footer";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { useAuth } from "@/hooks/use-auth";
// import { useToast } from "@/hooks/use-toast";
// import { PlayCircle, CheckCircle } from "lucide-react";

// import { CourseHeader } from "@/components/course-details/course-header";
// import { OverviewSection } from "@/components/course-details/overview-section";
// import { CurriculumSection } from "@/components/course-details/curriculum-section";
// import { InstructorSection } from "@/components/course-details/instructor-section";
// import { ReviewsSection } from "@/components/course-details/reviews-section";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";

// // --- Interfaces ---
// interface Instructor {
//   id: string;
//   name: string;
//   title: string;
//   bio: string;
//   experience: string;
//   instructor_rating: number;
//   total_students: number;
//   image_url: string;
// }

// interface Module {
//   id: string;
//   name: string;
//   description?: string;
//   duration_minutes?: number;
//   is_previewable?: boolean;
// }

// interface Review {
//   id: string;
//   rating: number;
//   comment: string;
//   created_at: string;
//   user_name: string;
//   user_image_url: string;
// }

// interface Training {
//   id: string;
//   name: string;
//   description: string;
//   overview: string;
//   what_you_will_learn: string[];
//   requirements: string[];
//   price: number;
//   duration: number;
//   level: string;
//   image_url: string;
//   sample_video_url?: string;
//   discount: number | null;
//   // student_count: number;
//   // lessons_count: number;
//   modules_count: number;
//   category_name: string;
// }

// interface TrainingDetails {
//   training: Training;
//   instructor: Instructor;
//   modules: Module[];
//   reviews: Review[];
// }

// // --- StickySidebar ---
// const StickySidebar = ({
//   training,
//   isEnrolled,
//   checkingEnrollment,
//   enrolling,
//   handleEnrollClick,
// }: {
//   training: Training;
//   isEnrolled: boolean;
//   checkingEnrollment: boolean;
//   enrolling: boolean;
//   handleEnrollClick: () => void;
// }) => {
//   const discountedPrice = training.discount
//     ? training.price * (1 - training.discount / 100)
//     : training.price;

//   return (
//     <Card className="overflow-hidden shadow-lg sticky top-24">
//       <div className="relative aspect-video group">
//         <Image
//           src={training.image_url || "/placeholder.svg"}
//           alt={training.name}
//           fill
//           className="object-cover transition-transform duration-300 group-hover:scale-105"
//         />
//         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//           <PlayCircle className="h-16 w-16 text-white/80" />
//         </div>
//       </div>
//       <CardContent className="p-6">
//         <div className="flex justify-between items-center mb-4">
//           <div className="text-3xl font-bold">
//             ${Number(discountedPrice || 0).toFixed(2)}
//           </div>
//           <Badge variant="outline">{training.level}</Badge>
//         </div>

//         <Button
//           onClick={handleEnrollClick}
//           disabled={checkingEnrollment || enrolling}
//           className="w-full mb-4 bg-custom-copper hover:bg-custom-copper text-white font-bold"
//           size="lg"
//         >
//           {checkingEnrollment
//             ? "Checking..."
//             : enrolling
//               ? "Enrolling..."
//               : isEnrolled
//                 ? "Go to Training"
//                 : "Enroll Now"}
//         </Button>

//         <ul className="space-y-2.5 text-sm text-muted-foreground mt-6">
//           <li className="flex items-center gap-3">
//             <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
//             <span>1 year free access to the training</span>
//           </li>
//           <li className="flex items-center gap-3">
//             <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
//             <span>Access on desktop and mobile</span>
//           </li>
//           <li className="flex items-center gap-3">
//             <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
//             <span>Certificate of completion</span>
//           </li>
//         </ul>
//       </CardContent>
//     </Card>
//   );
// };

// // --- Main Page ---
// export default function TrainingPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const [details, setDetails] = useState<TrainingDetails | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { isAuthenticated, user } = useAuth(); // Access user from useAuth
//   const { toast } = useToast();
//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [checkingEnrollment, setCheckingEnrollment] = useState(false);
//   const [enrolling, setEnrolling] = useState(false);
//   const router = useRouter();
//   const searchParams = useSearchParams(); // Get URL query parameters

//   // --- Fetch Training ---
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const resolvedParams = await params;
//         const response = await fetch(`/api/courses/${resolvedParams.id}`, {
//           cache: "no-store",
//         });
//         if (!response.ok) throw new Error("Failed to fetch training data");
//         const data = await response.json();
//         if (data.error) setError(data.error);
//         else setDetails(data);
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "An unknown error occurred"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [params]);

//   // --- Check Enrollment & Expiry ---
//   useEffect(() => {
//     const checkEnrollmentStatus = async () => {
//       // 1. Prioritize 'enrolled=true' from the URL (redirect from verify API)
//       const enrolledFromUrl = searchParams.get("enrolled");
//       const paymentFailedFromUrl = searchParams.get("paymentFailed");
//       const paymentErrorFromUrl = searchParams.get("paymentError");

//       if (enrolledFromUrl === "true") {
//         setIsEnrolled(true);
//         toast({
//           title: "Enrollment Successful! 🎉",
//           description: "You have successfully enrolled in this course.",
//         });
//         // Clean up the URL
//         const newSearchParams = new URLSearchParams(searchParams.toString());
//         newSearchParams.delete("enrolled");
//         router.replace(
//           `${window.location.pathname}?${newSearchParams.toString()}`,
//           { scroll: false }
//         );
//         return; // Exit early as enrollment is confirmed
//       }

//       if (paymentFailedFromUrl === "true") {
//         toast({
//           title: "Payment Failed",
//           description: "Your payment could not be processed. Please try again.",
//           variant: "destructive",
//         });
//         const newSearchParams = new URLSearchParams(searchParams.toString());
//         newSearchParams.delete("paymentFailed");
//         router.replace(
//           `${window.location.pathname}?${newSearchParams.toString()}`,
//           { scroll: false }
//         );
//       }

//       if (paymentErrorFromUrl) {
//         toast({
//           title: "Payment Error",
//           description: `An error occurred during payment verification: ${paymentErrorFromUrl}. Please contact support.`,
//           variant: "destructive",
//         });
//         const newSearchParams = new URLSearchParams(searchParams.toString());
//         newSearchParams.delete("paymentError");
//         router.replace(
//           `${window.location.pathname}?${newSearchParams.toString()}`,
//           { scroll: false }
//         );
//       }

//       // 2. Proceed with API call if not confirmed via URL or if user state changes
//       if (!isAuthenticated || !details || !user || !user.id) {
//         // Ensure user.id is available for the API call
//         setIsEnrolled(false);
//         setCheckingEnrollment(false);
//         return;
//       }
//       setCheckingEnrollment(true);

//       try {
//         const userId = user.id; // Get userId from the authenticated user object

//         const response = await fetch(
//           `/api/enrollments/student?userId=${userId}&trainingId=${details.training.id}`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
//             },
//           }
//         );

//         if (!response.ok) {
//           setIsEnrolled(false);
//           return;
//         }

//         const data = await response.json();
//         const enrollment = data.enrollments?.[0];

//         if (enrollment && enrollment.access_expires_at) {
//           const expiryTime = new Date(enrollment.access_expires_at).getTime();
//           const now = Date.now();

//           if (expiryTime > now) {
//             setIsEnrolled(true);
//           } else {
//             setIsEnrolled(false);
//           }
//         } else {
//           setIsEnrolled(false);
//         }
//       } catch (err) {
//         console.error("Error checking enrollment:", err);
//         setIsEnrolled(false);
//       } finally {
//         setCheckingEnrollment(false);
//       }
//     };

//     // Include all relevant dependencies that might change enrollment status
//     checkEnrollmentStatus();
//   }, [isAuthenticated, details, searchParams, user, router, toast]);

//   // --- Free Enrollment ---
//   const handleFreeEnrollment = async () => {
//     if (!details) return;
//     setEnrolling(true);
//     try {
//       // Ensure user.id is available before making the free enrollment call
//       if (!user || !user.id) {
//         toast({
//           title: "Error",
//           description: "User ID not available for enrollment.",
//           variant: "destructive",
//         });
//         setEnrolling(false);
//         return;
//       }

//       const response = await fetch("/api/enrollments/free", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
//         },
//         body: JSON.stringify({
//           trainingId: details.training.id,
//           userId: user.id,
//         }), // Ensure userId is passed for free enrollment too
//       });

//       const data = await response.json();

//       if (data.success) {
//         if (data.alreadyEnrolled) {
//           setIsEnrolled(true);
//           toast({
//             title: "Access Active! 🎉",
//             description: "You are already enrolled. Continue your training.",
//           });
//         } else {
//           setIsEnrolled(true);
//           toast({
//             title: "Enrollment Successful! 🎉",
//             description: "You can now access the training.",
//           });
//         }

//         // Navigate to lessons page
//         router.push(`/courses/${details.training.id}/lessons`);
//       } else {
//         toast({
//           title: "Enrollment Failed",
//           description: data.message || "Could not enroll.",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Enrollment Failed",
//         description:
//           error instanceof Error ? error.message : "Could not enroll.",
//         variant: "destructive",
//       });
//     } finally {
//       setEnrolling(false);
//     }
//   };

//   // --- Button Click ---
//   const handleEnrollClick = () => {
//     if (!isAuthenticated) {
//       toast({
//         title: "Authentication Required",
//         description: "Please login to enroll.",
//         variant: "destructive",
//       });
//       router.push("/login");
//       return;
//     }
//     if (isEnrolled && details) {
//       router.push(`/courses/${details.training.id}/lessons`); // Go to lessons if already enrolled
//       return;
//     }
//     if (details) {
//       if (Number(details.training.price) === 0) {
//         handleFreeEnrollment();
//       } else {
//         router.push(`/courses/${details.training.id}/payment`); // Go to payment if not free and not enrolled
//       }
//     }
//   };

//   // --- Loading/Error States ---
//   if (loading) {
//     return (
//       <div className="flex min-h-screen flex-col">
//         <SiteHeader />
//         <main className="flex-1 flex items-center justify-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-custom-copper"></div>
//         </main>
//         <SiteFooter />
//       </div>
//     );
//   }

//   if (error || !details) {
//     return (
//       <div className="flex min-h-screen flex-col">
//         <SiteHeader />
//         <main className="flex-1 flex flex-col items-center justify-center text-center">
//           <h2 className="text-2xl font-semibold mb-2 text-destructive">
//             Something went wrong
//           </h2>
//           <p className="text-muted-foreground">
//             {error || "Training could not be found."}
//           </p>
//           <Button onClick={() => router.push("/courses")} className="mt-4">
//             Back to Trainings
//           </Button>
//         </main>
//         <SiteFooter />
//       </div>
//     );
//   }

//   // --- Render ---
//   // Use non-null assertion (!) because we've handled null/error cases above
//   const { training, instructor, modules, reviews } = details!;
//   const avgRating =
//     reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

//   function getYouTubeEmbedUrl(url: string) {
//     try {
//       const parsed = new URL(url);
//       let videoId = "";
//       if (
//         parsed.hostname.includes("youtube.com") &&
//         parsed.searchParams.get("v")
//       ) {
//         videoId = parsed.searchParams.get("v")!;
//       } else if (parsed.hostname === "youtu.be") {
//         videoId = parsed.pathname.slice(1);
//       } else if (parsed.pathname.includes("/embed/")) {
//         videoId = parsed.pathname.split("/embed/")[1];
//       } else if (parsed.pathname.includes("/shorts/")) {
//         videoId = parsed.pathname.split("/shorts/")[1];
//       }
//       if (videoId) {
//         const params = new URLSearchParams({
//           autoplay: "1",
//           mute: "0",
//           controls: "0",
//           showinfo: "0",
//           rel: "0",
//           modestbranding: "1",
//           iv_load_policy: "3",
//           loop: "1",
//           playlist: videoId,
//         });
//         return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
//       }
//       return url;
//     } catch {
//       return url;
//     }
//   }

//   return (
//     <div className="flex min-h-screen flex-col bg-white">
//       <SiteHeader />
//       <main className="flex-1 py-12">
//         <div className="container">
//           <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
//             <div className="lg:col-span-2">
//               <CourseHeader
//                 categoryName={training.category_name}
//                 name={training.name}
//                 description={training.description}
//                 avgRating={avgRating}
//                 totalReviews={reviews.length}
//                 duration={training.duration}
//                 modulesCount={training.modules_count}
//                 instructor={
//                   instructor
//                     ? {
//                         name: instructor.name,
//                         title: instructor.title,
//                         image_url: instructor.image_url,
//                       }
//                     : {
//                         name: "Unknown Instructor",
//                         title: "",
//                         image_url: "/placeholder.svg",
//                       }
//                 }
//               />

//               {training.sample_video_url && (
//                 <div className="mt-8 w-full rounded-lg overflow-hidden shadow-lg relative">
//                   <div className="aspect-video w-full">
//                     <iframe
//                       src={getYouTubeEmbedUrl(training.sample_video_url)}
//                       title="Training Preview Video"
//                       frameBorder="0"
//                       allow="autoplay; encrypted-media; picture-in-picture"
//                       allowFullScreen
//                       className="w-full h-full pointer-events-none"
//                     ></iframe>
//                     <div className="absolute inset-0 z-10"></div>
//                   </div>
//                 </div>
//               )}

//               <Tabs defaultValue="overview" className="w-full mt-12">
//                 <TabsList className="border-b justify-start rounded-none bg-transparent p-0 h-auto">
//                   <TabsTrigger value="overview">Overview</TabsTrigger>
//                   <TabsTrigger value="curriculum">Course Content</TabsTrigger>
//                   <TabsTrigger value="instructor">Instructor</TabsTrigger>
//                   <TabsTrigger value="reviews">Reviews</TabsTrigger>
//                 </TabsList>
//                 <div className="py-8">
//                   <TabsContent value="overview">
//                     <OverviewSection
//                       whatYouWillLearn={training.what_you_will_learn || []}
//                       requirements={training.requirements || []}
//                       description={training.overview}
//                       whoIsFor={[]}
//                     />
//                   </TabsContent>
//                   <TabsContent value="curriculum">
//                     <CurriculumSection modules={modules} />
//                   </TabsContent>
//                   <TabsContent value="instructor">
//                     <InstructorSection instructor={instructor} />
//                   </TabsContent>
//                   <TabsContent value="reviews">
//                     <ReviewsSection reviews={reviews} />
//                   </TabsContent>
//                 </div>
//               </Tabs>
//             </div>

//             <div className="order-last lg:order-last mb-8 lg:mb-0">
//               <StickySidebar
//                 training={training}
//                 isEnrolled={isEnrolled}
//                 checkingEnrollment={checkingEnrollment}
//                 enrolling={enrolling}
//                 handleEnrollClick={handleEnrollClick}
//               />
//             </div>
//           </div>
//         </div>
//       </main>
//       <SiteFooter />
//     </div>
//   );
// }

// C:\Users\Hp\Documents\BBMI-LMS\app\courses\[id]\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PlayCircle, CheckCircle } from "lucide-react";

import { CourseHeader } from "@/components/course-details/course-header";
import { OverviewSection } from "@/components/course-details/overview-section";
import { CurriculumSection } from "@/components/course-details/curriculum-section";
import { InstructorSection } from "@/components/course-details/instructor-section";
import { ReviewsSection } from "@/components/course-details/reviews-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// --- Interfaces ---
interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  experience: string;
  instructor_rating: number;
  total_students: number;
  image_url: string;
}

interface Module {
  id: string;
  name: string;
  description?: string;
  duration_minutes?: number;
  is_previewable?: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  user_image_url: string;
}

interface Training {
  id: string;
  name: string;
  description: string;
  overview: string;
  what_you_will_learn: string[];
  requirements: string[];
  price: number;
  duration: number;
  level: string;
  image_url: string;
  sample_video_url?: string;
  discount: number | null;
  // student_count: number;
  // lessons_count: number;
  modules_count: number;
  category_name: string;
}

interface TrainingDetails {
  training: Training;
  instructor: Instructor;
  modules: Module[];
  reviews: Review[];
}

// --- StickySidebar ---
const StickySidebar = ({
  training,
  isEnrolled,
  checkingEnrollment,
  enrolling,
  handleEnrollClick,
}: {
  training: Training;
  isEnrolled: boolean;
  checkingEnrollment: boolean;
  enrolling: boolean;
  handleEnrollClick: () => void;
}) => {
  const discountedPrice = training.discount
    ? training.price * (1 - training.discount / 100)
    : training.price;

  return (
    // Changed `sticky top-24` to `lg:sticky lg:top-24`
    <Card className="overflow-hidden shadow-lg lg:sticky lg:top-24">
      <div className="relative aspect-video group">
        <Image
          src={training.image_url || "/placeholder.svg"}
          alt={training.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle className="h-16 w-16 text-white/80" />
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-3xl font-bold">
            ${Number(discountedPrice || 0).toFixed(2)}
          </div>
          <Badge variant="outline">{training.level}</Badge>
        </div>

        <Button
          onClick={handleEnrollClick}
          disabled={checkingEnrollment || enrolling}
          className="w-full mb-4 bg-custom-copper hover:bg-custom-copper text-white font-bold"
          size="lg"
        >
          {checkingEnrollment
            ? "Checking..."
            : enrolling
              ? "Enrolling..."
              : isEnrolled
                ? "Go to Training"
                : "Enroll Now"}
        </Button>

        <ul className="space-y-2.5 text-sm text-muted-foreground mt-6">
          <li className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>1 year free access to the training</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Access on desktop and mobile</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Certificate of completion</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

// --- Main Page ---
export default function TrainingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [details, setDetails] = useState<TrainingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth(); // Access user from useAuth
  const { toast } = useToast();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // Get URL query parameters

  // --- Fetch Training ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const response = await fetch(`/api/courses/${resolvedParams.id}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch training data");
        const data = await response.json();
        if (data.error) setError(data.error);
        else setDetails(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params]);

  // --- Check Enrollment & Expiry ---
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      // 1. Prioritize 'enrolled=true' from the URL (redirect from verify API)
      const enrolledFromUrl = searchParams.get("enrolled");
      const paymentFailedFromUrl = searchParams.get("paymentFailed");
      const paymentErrorFromUrl = searchParams.get("paymentError");

      if (enrolledFromUrl === "true") {
        setIsEnrolled(true);
        toast({
          title: "Enrollment Successful! 🎉",
          description: "You have successfully enrolled in this course.",
        });
        // Clean up the URL
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete("enrolled");
        router.replace(
          `${window.location.pathname}?${newSearchParams.toString()}`,
          { scroll: false }
        );
        return; // Exit early as enrollment is confirmed
      }

      if (paymentFailedFromUrl === "true") {
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete("paymentFailed");
        router.replace(
          `${window.location.pathname}?${newSearchParams.toString()}`,
          { scroll: false }
        );
      }

      if (paymentErrorFromUrl) {
        toast({
          title: "Payment Error",
          description: `An error occurred during payment verification: ${paymentErrorFromUrl}. Please contact support.`,
          variant: "destructive",
        });
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete("paymentError");
        router.replace(
          `${window.location.pathname}?${newSearchParams.toString()}`,
          { scroll: false }
        );
      }

      // 2. Proceed with API call if not confirmed via URL or if user state changes
      if (!isAuthenticated || !details || !user || !user.id) {
        // Ensure user.id is available for the API call
        setIsEnrolled(false);
        setCheckingEnrollment(false);
        return;
      }
      setCheckingEnrollment(true);

      try {
        const userId = user.id; // Get userId from the authenticated user object

        const response = await fetch(
          `/api/enrollments/student?userId=${userId}&trainingId=${details.training.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (!response.ok) {
          setIsEnrolled(false);
          return;
        }

        const data = await response.json();
        const enrollment = data.enrollments?.[0];

        if (enrollment && enrollment.access_expires_at) {
          const expiryTime = new Date(enrollment.access_expires_at).getTime();
          const now = Date.now();

          if (expiryTime > now) {
            setIsEnrolled(true);
          } else {
            setIsEnrolled(false);
          }
        } else {
          setIsEnrolled(false);
        }
      } catch (err) {
        console.error("Error checking enrollment:", err);
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    // Include all relevant dependencies that might change enrollment status
    checkEnrollmentStatus();
  }, [isAuthenticated, details, searchParams, user, router, toast]);

  // --- Free Enrollment ---
  const handleFreeEnrollment = async () => {
    if (!details) return;
    setEnrolling(true);
    try {
      // Ensure user.id is available before making the free enrollment call
      if (!user || !user.id) {
        toast({
          title: "Error",
          description: "User ID not available for enrollment.",
          variant: "destructive",
        });
        setEnrolling(false);
        return;
      }

      const response = await fetch("/api/enrollments/free", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          trainingId: details.training.id,
          userId: user.id,
        }), // Ensure userId is passed for free enrollment too
      });

      const data = await response.json();

      if (data.success) {
        if (data.alreadyEnrolled) {
          setIsEnrolled(true);
          toast({
            title: "Access Active! 🎉",
            description: "You are already enrolled. Continue your training.",
          });
        } else {
          setIsEnrolled(true);
          toast({
            title: "Enrollment Successful! 🎉",
            description: "You can now access the training.",
          });
        }

        // Navigate to lessons page
        router.push(`/courses/${details.training.id}/lessons`);
      } else {
        toast({
          title: "Enrollment Failed",
          description: data.message || "Could not enroll.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description:
          error instanceof Error ? error.message : "Could not enroll.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  // --- Button Click ---
  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to enroll.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    if (isEnrolled && details) {
      router.push(`/courses/${details.training.id}/lessons`); // Go to lessons if already enrolled
      return;
    }
    if (details) {
      if (Number(details.training.price) === 0) {
        handleFreeEnrollment();
      } else {
        router.push(`/courses/${details.training.id}/payment`); // Go to payment if not free and not enrolled
      }
    }
  };

  // --- Loading/Error States ---
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-custom-copper"></div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-semibold mb-2 text-destructive">
            Something went wrong
          </h2>
          <p className="text-muted-foreground">
            {error || "Training could not be found."}
          </p>
          <Button onClick={() => router.push("/courses")} className="mt-4">
            Back to Trainings
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // --- Render ---
  // Use non-null assertion (!) because we've handled null/error cases above
  const { training, instructor, modules, reviews } = details!;
  const avgRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

  function getYouTubeEmbedUrl(url: string) {
    try {
      const parsed = new URL(url);
      let videoId = "";
      if (
        parsed.hostname.includes("youtube.com") &&
        parsed.searchParams.get("v")
      ) {
        videoId = parsed.searchParams.get("v")!;
      } else if (parsed.hostname === "youtu.be") {
        videoId = parsed.pathname.slice(1);
      } else if (parsed.pathname.includes("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1];
      } else if (parsed.pathname.includes("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1];
      }
      if (videoId) {
        const params = new URLSearchParams({
          autoplay: "1",
          mute: "0",
          controls: "0",
          showinfo: "0",
          rel: "0",
          modestbranding: "1",
          iv_load_policy: "3",
          loop: "1",
          playlist: videoId,
        });
        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              <CourseHeader
                categoryName={training.category_name}
                name={training.name}
                description={training.description}
                avgRating={avgRating}
                totalReviews={reviews.length}
                duration={training.duration}
                modulesCount={training.modules_count}
                instructor={
                  instructor
                    ? {
                        name: instructor.name,
                        title: instructor.title,
                        image_url: instructor.image_url,
                      }
                    : {
                        name: "Unknown Instructor",
                        title: "",
                        image_url: "/placeholder.svg",
                      }
                }
              />

              {training.sample_video_url && (
                <div className="mt-8 w-full rounded-lg overflow-hidden shadow-lg relative">
                  <div className="aspect-video w-full">
                    <iframe
                      src={getYouTubeEmbedUrl(training.sample_video_url)}
                      title="Training Preview Video"
                      frameBorder="0"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full pointer-events-none"
                    ></iframe>
                    <div className="absolute inset-0 z-10"></div>
                  </div>
                </div>
              )}

              <Tabs defaultValue="overview" className="w-full mt-12">
                {/* Added overflow-x-auto and whitespace-nowrap for horizontal scrolling on smaller screens */}
                <TabsList className="border-b justify-start rounded-none bg-transparent p-0 h-auto overflow-x-auto whitespace-nowrap">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Content</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <div className="py-8">
                  <TabsContent value="overview">
                    <OverviewSection
                      whatYouWillLearn={training.what_you_will_learn || []}
                      requirements={training.requirements || []}
                      description={training.overview}
                      whoIsFor={[]}
                    />
                  </TabsContent>
                  <TabsContent value="curriculum">
                    <CurriculumSection modules={modules} />
                  </TabsContent>
                  <TabsContent value="instructor">
                    <InstructorSection instructor={instructor} />
                  </TabsContent>
                  <TabsContent value="reviews">
                    <ReviewsSection reviews={reviews} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* The sidebar now appears below the main content on small screens, and is sticky on large screens. */}
            <div className="order-last lg:order-last mb-8 lg:mb-0">
              <StickySidebar
                training={training}
                isEnrolled={isEnrolled}
                checkingEnrollment={checkingEnrollment}
                enrolling={enrolling}
                handleEnrollClick={handleEnrollClick}
              />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
