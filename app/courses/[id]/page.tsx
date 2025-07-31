// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { SiteHeader } from "@/components/site-header";
// import { SiteFooter } from "@/components/site-footer";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Clock, Users, Star, CheckCircle } from "lucide-react";
// import { usePathname } from "next/navigation";

// // Disable static generation and caching
// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";

// interface Training {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   duration: number;
//   level: string;
//   image_url: string;
//   instructor_name: string;
//   discount: number | null;
//   modules: number;
//   max_trainees: number;
//   course_code: string;
//   status: string;
//   category_id: string;
//   created_at: string;
//   updated_at: string;
// }

// export default function TrainingPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const [training, setTraining] = useState<Training | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         // Await the params Promise
//         const resolvedParams = await params;
//         const response = await fetch(`/api/courses/${resolvedParams.id}`, {
//           cache: "no-store", // Ensure fresh data
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch");
//         }

//         const data = await response.json();
//         if (data.error) {
//           setError(data.error);
//         } else {
//           setTraining(data.training);
//         }
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "Failed to load training"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [params]);

//   if (loading) {
//     return (
//       <div className="flex min-h-screen flex-col">
//         <SiteHeader />
//         <main className="flex-1 flex items-center justify-center">
//           <p>Loading...</p>
//         </main>
//         <SiteFooter />
//       </div>
//     );
//   }

//   if (error || !training) {
//     return (
//       <div className="flex min-h-screen flex-col">
//         <SiteHeader />
//         <main className="flex-1 flex items-center justify-center">
//           <p className="text-destructive">
//             Error: {error || "Training not found"}
//           </p>
//         </main>
//         <SiteFooter />
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen flex-col">
//       <SiteHeader />
//       <main className="flex-1">
//         <div className="bg-muted py-12">
//           <div className="container">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
//               <div>
//                 <Badge className="mb-4">{training.level}</Badge>
//                 <h1 className="text-3xl md:text-4xl font-bold mb-4">
//                   {training.name}
//                 </h1>
//                 <p className="text-muted-foreground mb-6">
//                   {training.description}
//                 </p>
//                 <div className="flex flex-wrap gap-4 mb-6">
//                   {training.duration && (
//                     <div className="flex items-center">
//                       <Clock className="h-4 w-4 mr-1" />
//                       <span>{training.duration} weeks</span>
//                     </div>
//                   )}
//                   {training.modules && (
//                     <div className="flex items-center">
//                       <Users className="h-4 w-4 mr-1" />
//                       <span>{training.modules} modules</span>
//                     </div>
//                   )}
//                   {training.max_trainees && (
//                     <div className="flex items-center">
//                       <Users className="h-4 w-4 mr-1" />
//                       <span>Max {training.max_trainees} trainees</span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex items-center mb-6">
//                   {training.instructor_name && (
//                     <div className="mr-3">
//                       <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
//                         <Image
//                           src={training.image_url || "/placeholder.svg"}
//                           alt={training.instructor_name}
//                           width={40}
//                           height={40}
//                           className="object-cover"
//                         />
//                       </div>
//                     </div>
//                   )}
//                   <div>
//                     <p className="font-medium">{training.instructor_name}</p>
//                     <p className="text-sm text-muted-foreground">Instructor</p>
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <Card className="overflow-hidden">
//                   <div className="aspect-video relative">
//                     <Image
//                       src={training.image_url || "/placeholder.svg"}
//                       alt={training.name}
//                       fill
//                       className="object-cover"
//                     />
//                   </div>
//                   <CardContent className="p-6">
//                     <div className="flex justify-between items-center mb-6">
//                       <div className="text-3xl font-bold">
//                         ${training.price}
//                       </div>
//                       <Badge variant="outline">{training.level}</Badge>
//                     </div>
//                     <Button className="w-full mb-4" size="lg">
//                       Enroll Now
//                     </Button>
//                     <ul className="space-y-2 text-sm">
//                       <li className="flex items-center">
//                         <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
//                         Full lifetime access
//                       </li>
//                       <li className="flex items-center">
//                         <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
//                         Access on mobile and desktop
//                       </li>
//                       <li className="flex items-center">
//                         <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
//                         Certificate of completion
//                       </li>
//                       <li className="flex items-center">
//                         <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
//                         30-day money-back guarantee
//                       </li>
//                     </ul>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="container py-12">
//           <h2 className="text-2xl font-bold mb-6">Training Details</h2>
//           <ul className="space-y-2 text-muted-foreground">
//             {training.discount !== null && (
//               <li>Discount: {training.discount}%</li>
//             )}
//             {training.course_code && (
//               <li>Course Code: {training.course_code}</li>
//             )}
//             {training.category_id && (
//               <li>Category ID: {training.category_id}</li>
//             )}
//             {training.status && <li>Status: {training.status}</li>}
//             <li>
//               Created at: {new Date(training.created_at).toLocaleDateString()}
//             </li>
//             <li>
//               Last updated: {new Date(training.updated_at).toLocaleDateString()}
//             </li>
//           </ul>
//         </div>
//       </main>
//       <SiteFooter />
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { SiteHeader } from "@/components/site-header";
// import { SiteFooter } from "@/components/site-footer";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Clock, Users, CheckCircle } from "lucide-react";
// import { useAuth } from "@/hooks/use-auth";
// import { useToast } from "@/hooks/use-toast";
// import Link from "next/link";

// // Disable static generation and caching
// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";

// interface Training {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   duration: number;
//   level: string;
//   image_url: string;
//   instructor_name: string;
//   discount: number | null;
//   modules: number;
//   max_trainees: number;
//   course_code: string;
//   status: string;
//   category_id: string;
//   created_at: string;
//   updated_at: string;
// }

// export default function TrainingPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const [training, setTraining] = useState<Training | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { user, isAuthenticated } = useAuth();
//   const { toast } = useToast();
//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [checkingEnrollment, setCheckingEnrollment] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         // Await the params Promise
//         const resolvedParams = await params;
//         const response = await fetch(`/api/courses/${resolvedParams.id}`, {
//           cache: "no-store", // Ensure fresh data
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch");
//         }

//         const data = await response.json();
//         if (data.error) {
//           setError(data.error);
//         } else {
//           setTraining(data.training);
//         }
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "Failed to load training"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [params]);

//   // Add this useEffect to check enrollment status
//   useEffect(() => {
//     const checkEnrollment = async () => {
//       if (!isAuthenticated || !training) return;

//       setCheckingEnrollment(true);
//       try {
//         const response = await fetch(`/api/progress/${training.id}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
//           },
//         });

//         if (response.ok) {
//           setIsEnrolled(true);
//         }
//       } catch (error) {
//         // User is not enrolled, which is fine
//       } finally {
//         setCheckingEnrollment(false);
//       }
//     };

//     checkEnrollment();
//   }, [isAuthenticated, training]);

//   const handleEnrollClick = () => {
//     // Check authentication first
//     if (!isAuthenticated) {
//       toast({
//         title: "Authentication Required",
//         description: "Please login to enroll in this training.",
//         variant: "destructive",
//       });
//       router.push("/login");
//       return;
//     }

//     // If already enrolled, go to lessons
//     if (isEnrolled) {
//       if (training) {
//         router.push(`/courses/${training.id}/lessons`);
//       }
//       return;
//     }

//     // Redirect to payment page
//     if (training) {
//       router.push(`/courses/${training.id}/payment`);
//     }
//   };

//   // Add this useEffect to handle enrollment success
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     if (urlParams.get("enrolled") === "true") {
//       toast({
//         title: "Enrollment Successful! 🎉",
//         description:
//           "You can now access all course materials and start learning.",
//       });

//       // Clean up URL
//       window.history.replaceState({}, "", window.location.pathname);
//     }
//   }, [toast]);

//   if (loading) {
//     return (
//       <div className="flex min-h-screen flex-col">
//         <SiteHeader />
//         <main className="flex-1 flex items-center justify-center">
//           <p>Loading...</p>
//         </main>
//         <SiteFooter />
//       </div>
//     );
//   }

//   if (error || !training) {
//     return (
//       <div className="flex min-h-screen flex-col">
//         <SiteHeader />
//         <main className="flex-1 flex items-center justify-center">
//           <p className="text-destructive">
//             Error: {error || "Training not found"}
//           </p>
//         </main>
//         <SiteFooter />
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen flex-col">
//       <SiteHeader />
//       <main className="flex-1">
//         <div className="bg-muted py-12">
//           <div className="container">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
//               <div>
//                 <Badge className="mb-4">{training.level}</Badge>
//                 <h1 className="text-3xl md:text-4xl font-bold mb-4">
//                   {training.name}
//                 </h1>
//                 <p className="text-muted-foreground mb-6">
//                   {training.description}
//                 </p>
//                 <div className="flex flex-wrap gap-4 mb-6">
//                   {training.duration && (
//                     <div className="flex items-center">
//                       <Clock className="h-4 w-4 mr-1" />
//                       <span>{training.duration} weeks</span>
//                     </div>
//                   )}
//                   {training.modules && (
//                     <div className="flex items-center">
//                       <Users className="h-4 w-4 mr-1" />
//                       <span>{training.modules} modules</span>
//                     </div>
//                   )}
//                   {training.max_trainees && (
//                     <div className="flex items-center">
//                       <Users className="h-4 w-4 mr-1" />
//                       <span>Max {training.max_trainees} trainees</span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex items-center mb-6">
//                   {training.instructor_name && (
//                     <div className="mr-3">
//                       <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
//                         <Image
//                           src={training.image_url || "/placeholder.svg"}
//                           alt={training.instructor_name}
//                           width={40}
//                           height={40}
//                           className="object-cover"
//                         />
//                       </div>
//                     </div>
//                   )}
//                   <div>
//                     <p className="font-medium">{training.instructor_name}</p>
//                     <p className="text-sm text-muted-foreground">Instructor</p>
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <Card className="overflow-hidden">
//                   <div className="aspect-video relative">
//                     <Image
//                       src={training.image_url || "/placeholder.svg"}
//                       alt={training.name}
//                       fill
//                       className="object-cover"
//                     />
//                   </div>
//                   <CardContent className="p-6">
//                     <div className="flex justify-between items-center mb-6">
//                       <div className="text-3xl font-bold">
//                         ${training.price}
//                       </div>
//                       <Badge variant="outline">{training.level}</Badge>
//                     </div>
//                     <div className="flex space-x-2">
//                       {/* <Button
//                         asChild
//                         variant="outline"
//                         className="flex-1 bg-transparent"
//                       >
//                         <Link href={`/courses/${training.id}`}>
//                           View Details
//                         </Link>
//                       </Button> */}

//                       <Button
//                         onClick={handleEnrollClick}
//                         disabled={checkingEnrollment}
//                         className="flex-1"
//                       >
//                         {checkingEnrollment
//                           ? "Checking..."
//                           : isEnrolled
//                             ? "Continue Learning"
//                             : "Enroll Now"}
//                       </Button>
//                     </div>
//                     <ul className="space-y-2 text-sm">
//                       <li className="flex items-center">
//                         <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
//                         Full lifetime access
//                       </li>
//                       <li className="flex items-center">
//                         <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
//                         Access on mobile and desktop
//                       </li>
//                       <li className="flex items-center">
//                         <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
//                         Certificate of completion
//                       </li>
//                       <li className="flex items-center">
//                         <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
//                         30-day money-back guarantee
//                       </li>
//                     </ul>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="container py-12">
//           <h2 className="text-2xl font-bold mb-6">Training Details</h2>
//           <ul className="space-y-2 text-muted-foreground">
//             {training.discount !== null && (
//               <li>Discount: {training.discount}%</li>
//             )}
//             {training.course_code && (
//               <li>Course Code: {training.course_code}</li>
//             )}
//             {training.category_id && (
//               <li>Category ID: {training.category_id}</li>
//             )}
//             {training.status && <li>Status: {training.status}</li>}
//             <li>
//               Created at: {new Date(training.created_at).toLocaleDateString()}
//             </li>
//             <li>
//               Last updated: {new Date(training.updated_at).toLocaleDateString()}
//             </li>
//           </ul>
//         </div>
//       </main>
//       <SiteFooter />
//     </div>
//   );

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, CheckCircle, Gift } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ShinyButton } from "@/components/magicui/shiny-button";

// Disable static generation and caching
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface Training {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  level: string;
  image_url: string;
  instructor_name: string;
  discount: number | null;
  modules: number;
  max_trainees: number;
  course_code: string;
  status: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export default function TrainingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Await the params Promise
        const resolvedParams = await params;
        const response = await fetch(`/api/courses/${resolvedParams.id}`, {
          cache: "no-store", // Ensure fresh data
        });

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setTraining(data.training);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load training"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!isAuthenticated || !training) return;

      setCheckingEnrollment(true);
      try {
        const response = await fetch(`/api/progress/${training.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        if (response.ok) {
          setIsEnrolled(true);
        }
      } catch (error) {
        // User is not enrolled, which is fine
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [isAuthenticated, training]);

  const handleFreeEnrollment = async () => {
    if (!training) return;

    setEnrolling(true);
    try {
      const response = await fetch("/api/enrollments/free", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          trainingId: training.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEnrolled(true);
        toast({
          title: "Enrollment Successful! 🎉",
          description:
            "You can now access all course materials and start learning.",
        });
        router.push(`/courses/${training.id}/lessons`);
      } else {
        throw new Error(data.message || "Enrollment failed");
      }
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to enroll in training",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  // const handleEnrollClick = () => {
  //   // Check authentication first
  //   if (!isAuthenticated) {
  //     toast({
  //       title: "Authentication Required",
  //       description: "Please login to enroll in this training.",
  //       variant: "destructive",
  //     });
  //     router.push("/login");
  //     return;
  //   }

  //   // If already enrolled, go to lessons
  //   if (isEnrolled) {
  //     if (training) {
  //       router.push(`/courses/${training.id}/lessons`);
  //     }
  //     return;
  //   }

  //   // Check if training is free
  //   if (training && training.price === 0) {
  //     console.log("Training price:", training.price, typeof training.price);
  //     handleFreeEnrollment();
  //     return;
  //   }

  //   // Redirect to payment page for paid courses
  //   if (training) {
  //     router.push(`/courses/${training.id}/payment`);
  //   }
  // };

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to enroll in this training.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (isEnrolled && training) {
      router.push(`/courses/${training.id}/lessons`);
      return;
    }

    if (training) {
      // ✅ Debug training price value and type
      console.log("Training price:", training.price, typeof training.price);

      // Make sure to convert to number before comparing
      if (Number(training.price) === 0) {
        console.log("Handling free enrollment...");
        handleFreeEnrollment();
        return;
      }

      // Otherwise, redirect to payment page
      router.push(`/courses/${training.id}/payment`);
    }
  };

  // Handle enrollment success from payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("enrolled") === "true") {
      toast({
        title: "Enrollment Successful! 🎉",
        description:
          "You can now access all course materials and start learning.",
      });

      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-destructive">
            Error: {error || "Training not found"}
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const isFree = training.price === 0;
  const discountedPrice =
    training.discount && training.discount > 0
      ? training.price * (1 - training.discount / 100)
      : training.price;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="bg-muted py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className=" mb-0 bg-amber-700 text-white " >{training.level}</Badge>
                  {isFree && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 mb-0"
                    >
                      <Gift className="h-3 w-3 mr-1" />
                      FREE
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {training.name}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {training.description}
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  {training.duration && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{training.duration} weeks</span>
                    </div>
                  )}
                  {training.modules && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{training.modules} modules</span>
                    </div>
                  )}
                  {training.max_trainees && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Max {training.max_trainees} trainees</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center mb-6">
                  {training.instructor_name && (
                    <div className="mr-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        <Image
                          src={training.image_url || "/placeholder.svg"}
                          alt={training.instructor_name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{training.instructor_name}</p>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                  </div>
                </div>
              </div>
              <div>
                <Card className="overflow-hidden">
                  <div className="aspect-video relative">
                    <Image
                      src={training.image_url || "/placeholder.svg"}
                      alt={training.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-3xl font-bold">
                        {isFree ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          <>
                            {training.discount && training.discount > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="text-lg line-through text-muted-foreground">
                                  ETB {Number(training.price).toFixed(2)}
                                </span>
                                <span>ETB {discountedPrice.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span>
                                ETB {Number(training?.price ?? 0).toFixed(2)}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <Badge variant="outline">{training.level}</Badge>
                    </div>

                    <ShinyButton
                      onClick={handleEnrollClick}
                      disabled={checkingEnrollment || enrolling}
                      className="w-full mb-4"
                      size="lg"
                    >
                      {checkingEnrollment
                        ? "Checking..."
                        : enrolling
                          ? "Enrolling..."
                          : isEnrolled
                            ? "Continue Learning"
                            : isFree
                              ? "Start Learning Free"
                              : "Enroll Now"}
                    </ShinyButton>

                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Full lifetime access
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Access on mobile and desktop
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Certificate of completion
                      </li>
                      {!isFree && (
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          30-day money-back guarantee
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        <div className="container py-12">
          <h2 className="text-2xl font-bold mb-6">Training Details</h2>
          <ul className="space-y-2 text-muted-foreground">
            {training.discount !== null && training.discount > 0 && (
              <li>Discount: {training.discount}%</li>
            )}
            {training.course_code && (
              <li>Course Code: {training.course_code}</li>
            )}
            {training.category_id && (
              <li>Category ID: {training.category_id}</li>
            )}
            {training.status && <li>Status: {training.status}</li>}
            <li>
              Created at: {new Date(training.created_at).toLocaleDateString()}
            </li>
            <li>
              Last updated: {new Date(training.updated_at).toLocaleDateString()}
            </li>
          </ul>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
