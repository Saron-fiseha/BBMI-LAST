// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import { useRouter } from "next/navigation";
// // // import Image from "next/image";
// // // import { SiteHeader } from "@/components/site-header";
// // // import { SiteFooter } from "@/components/site-footer";
// // // import { Button } from "@/components/ui/button";
// // // import { Card, CardContent } from "@/components/ui/card";
// // // import { Badge } from "@/components/ui/badge";
// // // import { Clock, Users, CheckCircle, Gift } from "lucide-react";
// // // import { useAuth } from "@/hooks/use-auth";
// // // import { useToast } from "@/hooks/use-toast";
// // // import { ShinyButton } from "@/components/magicui/shiny-button";

// // // // Disable static generation and caching
// // // export const dynamic = "force-dynamic";
// // // export const fetchCache = "force-no-store";

// // // interface Training {
// // //   id: string;
// // //   name: string;
// // //   description: string;
// // //   price: number;
// // //   duration: number;
// // //   level: string;
// // //   image_url: string;
// // //   instructor_name: string;
// // //   discount: number | null;
// // //   modules: number;
// // //   max_trainees: number;
// // //   course_code: string;
// // //   status: string;
// // //   category_id: string;
// // //   created_at: string;
// // //   updated_at: string;
// // // }

// // // export default function TrainingPage({
// // //   params,
// // // }: {
// // //   params: Promise<{ id: string }>;
// // // }) {
// // //   const [training, setTraining] = useState<Training | null>(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string | null>(null);
// // //   const { user, isAuthenticated } = useAuth();
// // //   const { toast } = useToast();
// // //   const [isEnrolled, setIsEnrolled] = useState(false);
// // //   const [checkingEnrollment, setCheckingEnrollment] = useState(false);
// // //   const [enrolling, setEnrolling] = useState(false);
// // //   const router = useRouter();

// // //   useEffect(() => {
// // //     const fetchData = async () => {
// // //       try {
// // //         setLoading(true);
// // //         // Await the params Promise
// // //         const resolvedParams = await params;
// // //         const response = await fetch(`/api/courses/${resolvedParams.id}`, {
// // //           cache: "no-store", // Ensure fresh data
// // //         });

// // //         if (!response.ok) {
// // //           throw new Error("Failed to fetch");
// // //         }

// // //         const data = await response.json();
// // //         if (data.error) {
// // //           setError(data.error);
// // //         } else {
// // //           setTraining(data.training);
// // //         }
// // //       } catch (err) {
// // //         setError(
// // //           err instanceof Error ? err.message : "Failed to load training"
// // //         );
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     fetchData();
// // //   }, [params]);

// // //   // Check enrollment status
// // //   useEffect(() => {
// // //     const checkEnrollment = async () => {
// // //       if (!isAuthenticated || !training) return;

// // //       setCheckingEnrollment(true);
// // //       try {
// // //         const response = await fetch(`/api/progress/${training.id}`, {
// // //           headers: {
// // //             Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
// // //           },
// // //         });

// // //         if (response.ok) {
// // //           setIsEnrolled(true);
// // //         }
// // //       } catch (error) {
// // //         // User is not enrolled, which is fine
// // //       } finally {
// // //         setCheckingEnrollment(false);
// // //       }
// // //     };

// // //     checkEnrollment();
// // //   }, [isAuthenticated, training]);

// // //   const handleFreeEnrollment = async () => {
// // //     if (!training) return;

// // //     setEnrolling(true);
// // //     try {
// // //       const response = await fetch("/api/enrollments/free", {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
// // //         },
// // //         body: JSON.stringify({
// // //           trainingId: training.id,
// // //         }),
// // //       });

// // //       const data = await response.json();

// // //       if (data.success) {
// // //         setIsEnrolled(true);
// // //         toast({
// // //           title: "Enrollment Successful! 🎉",
// // //           description:
// // //             "You can now access all course materials and start learning.",
// // //         });
// // //         router.push(`/courses/${training.id}/lessons`);
// // //       } else {
// // //         throw new Error(data.message || "Enrollment failed");
// // //       }
// // //     } catch (error) {
// // //       toast({
// // //         title: "Enrollment Failed",
// // //         description:
// // //           error instanceof Error
// // //             ? error.message
// // //             : "Failed to enroll in training",
// // //         variant: "destructive",
// // //       });
// // //     } finally {
// // //       setEnrolling(false);
// // //     }
// // //   };

// // //   // const handleEnrollClick = () => {
// // //   //   // Check authentication first
// // //   //   if (!isAuthenticated) {
// // //   //     toast({
// // //   //       title: "Authentication Required",
// // //   //       description: "Please login to enroll in this training.",
// // //   //       variant: "destructive",
// // //   //     });
// // //   //     router.push("/login");
// // //   //     return;
// // //   //   }

// // //   //   // If already enrolled, go to lessons
// // //   //   if (isEnrolled) {
// // //   //     if (training) {
// // //   //       router.push(`/courses/${training.id}/lessons`);
// // //   //     }
// // //   //     return;
// // //   //   }

// // //   //   // Check if training is free
// // //   //   if (training && training.price === 0) {
// // //   //     console.log("Training price:", training.price, typeof training.price);
// // //   //     handleFreeEnrollment();
// // //   //     return;
// // //   //   }

// // //   //   // Redirect to payment page for paid courses
// // //   //   if (training) {
// // //   //     router.push(`/courses/${training.id}/payment`);
// // //   //   }
// // //   // };

// // //   const handleEnrollClick = () => {
// // //     if (!isAuthenticated) {
// // //       toast({
// // //         title: "Authentication Required",
// // //         description: "Please login to enroll in this training.",
// // //         variant: "destructive",
// // //       });
// // //       router.push("/login");
// // //       return;
// // //     }

// // //     if (isEnrolled && training) {
// // //       router.push(`/courses/${training.id}/lessons`);
// // //       return;
// // //     }

// // //     if (training) {
// // //       // ✅ Debug training price value and type
// // //       console.log("Training price:", training.price, typeof training.price);

// // //       // Make sure to convert to number before comparing
// // //       if (Number(training.price) === 0) {
// // //         console.log("Handling free enrollment...");
// // //         handleFreeEnrollment();
// // //         return;
// // //       }

// // //       // Otherwise, redirect to payment page
// // //       router.push(`/courses/${training.id}/payment`);
// // //     }
// // //   };

// // //   // Handle enrollment success from payment
// // //   useEffect(() => {
// // //     const urlParams = new URLSearchParams(window.location.search);
// // //     if (urlParams.get("enrolled") === "true") {
// // //       toast({
// // //         title: "Enrollment Successful! 🎉",
// // //         description:
// // //           "You can now access all course materials and start learning.",
// // //       });

// // //       // Clean up URL
// // //       window.history.replaceState({}, "", window.location.pathname);
// // //     }
// // //   }, [toast]);

// // //   if (loading) {
// // //     return (
// // //       <div className="flex min-h-screen flex-col">
// // //         <SiteHeader />
// // //         <main className="flex-1 flex items-center justify-center">
// // //           <p>Loading...</p>
// // //         </main>
// // //         <SiteFooter />
// // //       </div>
// // //     );
// // //   }

// // //   if (error || !training) {
// // //     return (
// // //       <div className="flex min-h-screen flex-col">
// // //         <SiteHeader />
// // //         <main className="flex-1 flex items-center justify-center">
// // //           <p className="text-destructive">
// // //             Error: {error || "Training not found"}
// // //           </p>
// // //         </main>
// // //         <SiteFooter />
// // //       </div>
// // //     );
// // //   }

// // //   const isFree = training.price === 0;
// // //   const discountedPrice =
// // //     training.discount && training.discount > 0
// // //       ? training.price * (1 - training.discount / 100)
// // //       : training.price;

// // //   return (
// // //     <div className="flex min-h-screen flex-col">
// // //       <SiteHeader />
// // //       <main className="flex-1">
// // //         <div className="bg-muted py-12">
// // //           <div className="container">
// // //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
// // //               <div>
// // //                 <div className="flex items-center gap-2 mb-4">
// // //                   <Badge className=" mb-0 bg-amber-700 text-white ">
// // //                     {training.level}
// // //                   </Badge>
// // //                   {isFree && (
// // //                     <Badge
// // //                       variant="secondary"
// // //                       className="bg-green-100 text-green-800 mb-0"
// // //                     >
// // //                       <Gift className="h-3 w-3 mr-1" />
// // //                       FREE
// // //                     </Badge>
// // //                   )}
// // //                 </div>
// // //                 <h1 className="text-3xl md:text-4xl font-bold mb-4">
// // //                   {training.name}
// // //                 </h1>
// // //                 <p className="text-muted-foreground mb-6">
// // //                   {training.description}
// // //                 </p>
// // //                 <div className="flex flex-wrap gap-4 mb-6">
// // //                   {training.duration && (
// // //                     <div className="flex items-center">
// // //                       <Clock className="h-4 w-4 mr-1" />
// // //                       <span>{training.duration} weeks</span>
// // //                     </div>
// // //                   )}
// // //                   {training.modules && (
// // //                     <div className="flex items-center">
// // //                       <Users className="h-4 w-4 mr-1" />
// // //                       <span>{training.modules} modules</span>
// // //                     </div>
// // //                   )}
// // //                   {training.max_trainees && (
// // //                     <div className="flex items-center">
// // //                       <Users className="h-4 w-4 mr-1" />
// // //                       <span>Max {training.max_trainees} trainees</span>
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //                 <div className="flex items-center mb-6">
// // //                   {training.instructor_name && (
// // //                     <div className="mr-3">
// // //                       <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
// // //                         <Image
// // //                           src={training.image_url || "/placeholder.svg"}
// // //                           alt={training.instructor_name}
// // //                           width={40}
// // //                           height={40}
// // //                           className="object-cover"
// // //                         />
// // //                       </div>
// // //                     </div>
// // //                   )}
// // //                   <div>
// // //                     <p className="font-medium">{training.instructor_name}</p>
// // //                     <p className="text-sm text-muted-foreground">Instructor</p>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //               <div>
// // //                 <Card className="overflow-hidden">
// // //                   <div className="aspect-video relative">
// // //                     <Image
// // //                       src={training.image_url || "/placeholder.svg"}
// // //                       alt={training.name}
// // //                       fill
// // //                       className="object-cover"
// // //                     />
// // //                   </div>
// // //                   <CardContent className="p-6">
// // //                     <div className="flex justify-between items-center mb-6">
// // //                       <div className="text-3xl font-bold">
// // //                         {isFree ? (
// // //                           <span className="text-green-600">FREE</span>
// // //                         ) : (
// // //                           <>
// // //                             {training.discount && training.discount > 0 ? (
// // //                               <div className="flex items-center gap-2">
// // //                                 <span className="text-lg line-through text-muted-foreground">
// // //                                   ETB {Number(training.price).toFixed(2)}
// // //                                 </span>
// // //                                 <span>ETB {discountedPrice.toFixed(2)}</span>
// // //                               </div>
// // //                             ) : (
// // //                               <span>
// // //                                 ETB {Number(training?.price ?? 0).toFixed(2)}
// // //                               </span>
// // //                             )}
// // //                           </>
// // //                         )}
// // //                       </div>
// // //                       <Badge variant="outline">{training.level}</Badge>
// // //                     </div>

// // //                     <ShinyButton
// // //                       onClick={handleEnrollClick}
// // //                       disabled={checkingEnrollment || enrolling}
// // //                       className="w-full mb-4"
// // //                       size="lg"
// // //                     >
// // //                       {checkingEnrollment
// // //                         ? "Checking..."
// // //                         : enrolling
// // //                           ? "Enrolling..."
// // //                           : isEnrolled
// // //                             ? "Continue Learning"
// // //                             : isFree
// // //                               ? "Start Learning Free"
// // //                               : "Enroll Now"}
// // //                     </ShinyButton>

// // //                     <ul className="space-y-2 text-sm">
// // //                       <li className="flex items-center">
// // //                         <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
// // //                         Full lifetime access
// // //                       </li>
// // //                       <li className="flex items-center">
// // //                         <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
// // //                         Access on mobile and desktop
// // //                       </li>
// // //                       <li className="flex items-center">
// // //                         <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
// // //                         Certificate of completion
// // //                       </li>
// // //                       {!isFree && (
// // //                         <li className="flex items-center">
// // //                           <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
// // //                           30-day money-back guarantee
// // //                         </li>
// // //                       )}
// // //                     </ul>
// // //                   </CardContent>
// // //                 </Card>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //         <div className="container py-12">
// // //           <h2 className="text-2xl font-bold mb-6">Training Details</h2>
// // //           <ul className="space-y-2 text-muted-foreground">
// // //             {training.discount !== null && training.discount > 0 && (
// // //               <li>Discount: {training.discount}%</li>
// // //             )}
// // //             {training.course_code && (
// // //               <li>Course Code: {training.course_code}</li>
// // //             )}
// // //             {training.category_id && (
// // //               <li>Category ID: {training.category_id}</li>
// // //             )}
// // //             {training.status && <li>Status: {training.status}</li>}
// // //             <li>
// // //               Created at: {new Date(training.created_at).toLocaleDateString()}
// // //             </li>
// // //             <li>
// // //               Last updated: {new Date(training.updated_at).toLocaleDateString()}
// // //             </li>
// // //           </ul>
// // //         </div>
// // //       </main>
// // //       <SiteFooter />
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useEffect, useState } from "react";
// // import { useRouter } from "next/navigation";
// // import Image from "next/image";
// // import { SiteHeader } from "@/components/site-header";
// // import { SiteFooter } from "@/components/site-footer";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Badge } from "@/components/ui/badge";
// // import { useAuth } from "@/hooks/use-auth";
// // import { useToast } from "@/hooks/use-toast";
// // import { PlayCircle, CheckCircle } from "lucide-react";

// // // Import the section components you created
// // import { CourseHeader } from "@/components/course-details/course-header";
// // import { OverviewSection } from "@/components/course-details/overview-section";
// // import { CurriculumSection } from "@/components/course-details/curriculum-section";
// // import { InstructorSection } from "@/components/course-details/instructor-section";
// // import { ReviewsSection } from "@/components/course-details/reviews-section";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// // export const dynamic = "force-dynamic";
// // export const fetchCache = "force-no-store";

// // // --- Interfaces to match the new API structure ---
// // interface Instructor {
// //   id: string;
// //   name: string;
// //   title: string;
// //   bio: string;
// //   experience: string;
// //   instructor_rating: number;
// //   total_students: number;
// //   image_url: string;
// // }

// // interface Module {
// //   id: string;
// //   name: string; // The main change: from 'title' to 'name'
// //   description?: string;
// //   duration_minutes?: number;
// //   is_previewable?: boolean;
// // }

// // interface Review {
// //   id: string;
// //   rating: number;
// //   comment: string;
// //   created_at: string;
// //   user_name: string;
// //   user_image_url: string;
// // }

// // interface Training {
// //   id: string;
// //   name: string;
// //   description: string;
// //   overview: string; // HTML content for description
// //   what_you_will_learn: string[]; // JSON array
// //   requirements: string[]; // JSON array
// //   price: number;
// //   duration: number; // in weeks
// //   level: string;
// //   image_url: string;
// //   sample_video_url?: string;
// //   discount: number | null;
// //   student_count: number;
// //   lessons_count: number;
// //   modules_count: number;
// //   category_name: string;
// // }

// // interface TrainingDetails {
// //   training: Training;
// //   instructor: Instructor;
// //   modules: Module[];
// //   reviews: Review[];
// // }

// // // --- Sticky Sidebar Component (New Version) ---
// // const StickySidebar = ({
// //   training,
// //   isEnrolled,
// //   checkingEnrollment,
// //   enrolling,
// //   handleEnrollClick,
// // }: {
// //   training: Training;
// //   isEnrolled: boolean;
// //   checkingEnrollment: boolean;
// //   enrolling: boolean;
// //   handleEnrollClick: () => void;
// // }) => {
// //   const discountedPrice = training.discount
// //     ? training.price * (1 - training.discount / 100)
// //     : training.price;

// //   return (
// //     <Card className="overflow-hidden shadow-lg sticky top-24">
// //       <div className="relative aspect-video group">
// //         <Image
// //           src={training.image_url || "/placeholder.svg"}
// //           alt={training.name}
// //           fill
// //           className="object-cover transition-transform duration-300 group-hover:scale-105"
// //         />
// //         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
// //           <PlayCircle className="h-16 w-16 text-white/80" />
// //         </div>
// //       </div>
// //       <CardContent className="p-6">
// //         <div className="flex justify-between items-center mb-4">
// //           <div className="text-3xl font-bold">
// //             {/* ${discountedPrice.toFixed(2)} */}$
// //             {Number(discountedPrice || 0).toFixed(2)}
// //           </div>
// //           <Badge variant="outline">{training.level}</Badge>
// //         </div>

// //         <Button
// //           onClick={handleEnrollClick}
// //           disabled={checkingEnrollment || enrolling}
// //           className="w-full mb-4 bg-amber-600 hover:bg-amber-700 text-white font-bold"
// //           size="lg"
// //         >
// //           {checkingEnrollment
// //             ? "Checking..."
// //             : enrolling
// //               ? "Enrolling..."
// //               : isEnrolled
// //                 ? "Go to Training"
// //                 : "Enroll Now"}
// //         </Button>

// //         <ul className="space-y-2.5 text-sm text-muted-foreground mt-6">
// //           <li className="flex items-center gap-3">
// //             <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
// //             <span>One year access</span>
// //           </li>
// //           <li className="flex items-center gap-3">
// //             <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
// //             <span>Access on mobile and desktop</span>
// //           </li>
// //           <li className="flex items-center gap-3">
// //             <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
// //             <span>Certificate of completion</span>
// //           </li>
// //           <li className="flex items-center gap-3">
// //             <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
// //             <span>Read-only access to course documents</span>
// //           </li>
// //         </ul>
// //       </CardContent>
// //     </Card>
// //   );
// // };

// // // --- Main Page Component ---
// // export default function TrainingPage({
// //   params,
// // }: {
// //   params: Promise<{ id: string }>;
// // }) {
// //   const [details, setDetails] = useState<TrainingDetails | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const { isAuthenticated } = useAuth();
// //   const { toast } = useToast();
// //   const [isEnrolled, setIsEnrolled] = useState(false);
// //   const [checkingEnrollment, setCheckingEnrollment] = useState(false);
// //   const [enrolling, setEnrolling] = useState(false);
// //   const router = useRouter();

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         setLoading(true);
// //         const resolvedParams = await params;
// //         const response = await fetch(`/api/courses/${resolvedParams.id}`, {
// //           cache: "no-store",
// //         });
// //         if (!response.ok) throw new Error("Failed to fetch training data");
// //         const data = await response.json();
// //         console.log("API Response Data:", data);
// //         if (data.error) setError(data.error);
// //         else setDetails(data);
// //       } catch (err) {
// //         setError(
// //           err instanceof Error ? err.message : "An unknown error occurred"
// //         );
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, [params]);

// //   useEffect(() => {
// //     const checkEnrollment = async () => {
// //       if (!isAuthenticated || !details) return;

// //       setCheckingEnrollment(true);
// //       try {
// //         const response = await fetch(`/api/progress/${details.training.id}`, {
// //           headers: {
// //             Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
// //           },
// //         });
// //         if (response.ok) setIsEnrolled(true);
// //       } catch (error) {
// //         // Not enrolled is the default state
// //       } finally {
// //         setCheckingEnrollment(false);
// //       }
// //     };
// //     checkEnrollment();
// //   }, [isAuthenticated, details]);

// //   // const handleFreeEnrollment = async () => {
// //   //   if (!details) return;
// //   //   setEnrolling(true);
// //   //   try {
// //   //     const response = await fetch("/api/enrollments/free", {
// //   //       method: "POST",
// //   //       headers: {
// //   //         "Content-Type": "application/json",
// //   //         Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
// //   //       },
// //   //       body: JSON.stringify({ trainingId: details.training.id }),
// //   //     });
// //   //     const data = await response.json();
// //   //     if (data.success) {
// //   //       setIsEnrolled(true);
// //   //       toast({
// //   //         title: "Enrollment Successful! 🎉",
// //   //         description: "You can now access the training.",
// //   //       });
// //   //       // router.push(`/courses/${details.training.id}/lessons`);
// //   //       router.push(
// //   //         `/courses/${details.training.id}/lessons?enrollment=success`
// //   //       );
// //   //     } else {
// //   //       throw new Error(data.message || "Enrollment failed");
// //   //     }
// //   //   } catch (error) {
// //   //     toast({
// //   //       title: "Enrollment Failed",
// //   //       description:
// //   //         error instanceof Error ? error.message : "Could not enroll.",
// //   //       variant: "destructive",
// //   //     });
// //   //   } finally {
// //   //     setEnrolling(false);
// //   //   }
// //   // };

// //   const handleFreeEnrollment = async () => {
// //     if (!details) return;
// //     setEnrolling(true);
// //     try {
// //       const response = await fetch("/api/enrollments/free", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
// //         },
// //         body: JSON.stringify({ trainingId: details.training.id }),
// //       });
// //       const data = await response.json();

// //       if (data.success) {
// //         setIsEnrolled(true);
// //         toast({
// //           title: "Enrollment Successful! 🎉",
// //           description: "Redirecting you to the training...",
// //         });
// //         router.push(
// //           `/courses/${details.training.id}/lessons?enrollment=success`
// //         );
// //       } else {
// //         // ✅ --- THIS IS THE KEY LOGIC CHANGE --- ✅
// //         // Check for the specific "already enrolled" message from the API.
// //         if (
// //           data.message &&
// //           data.message.toLowerCase().includes("already have active access")
// //         ) {
// //           // This is not a real error. It's a "success" from the user's perspective.
// //           setIsEnrolled(true); // Correct the UI state.
// //           toast({
// //             title: "Already Enrolled!",
// //             description: "Taking you to your training...",
// //           });
// //           // Redirect the user just as if they had clicked "Go to Training".
// //           router.push(`/courses/${details.training.id}/lessons`);
// //         } else {
// //           // This is a real, unexpected error.
// //           throw new Error(data.message || "Enrollment failed");
// //         }
// //       }
// //     } catch (error) {
// //       toast({
// //         title: "Enrollment Failed",
// //         description:
// //           error instanceof Error ? error.message : "Could not enroll.",
// //         variant: "destructive",
// //       });
// //     } finally {
// //       setEnrolling(false);
// //     }
// //   };

// //   const handleEnrollClick = () => {
// //     if (!isAuthenticated) {
// //       toast({
// //         title: "Authentication Required",
// //         description: "Please login to enroll.",
// //         variant: "destructive",
// //       });
// //       router.push("/login");
// //       return;
// //     }
// //     if (isEnrolled && details) {
// //       router.push(`/courses/${details.training.id}/lessons`);
// //       return;
// //     }
// //     if (details) {
// //       if (Number(details.training.price) === 0) {
// //         handleFreeEnrollment();
// //       } else {
// //         router.push(`/courses/${details.training.id}/payment`);
// //       }
// //     }
// //   };

// //   useEffect(() => {
// //     const urlParams = new URLSearchParams(window.location.search);
// //     if (urlParams.get("enrolled") === "true") {
// //       toast({
// //         title: "Payment Successful! 🎉",
// //         description: "Welcome to the training!",
// //       });
// //       // Clean up URL
// //       window.history.replaceState({}, "", window.location.pathname);
// //     }
// //   }, [toast]);

// //   if (loading) {
// //     return (
// //       <div className="flex min-h-screen flex-col">
// //         <SiteHeader />
// //         <main className="flex-1 flex items-center justify-center">
// //           <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600"></div>
// //         </main>
// //         <SiteFooter />
// //       </div>
// //     );
// //   }

// //   if (error || !details) {
// //     return (
// //       <div className="flex min-h-screen flex-col">
// //         <SiteHeader />
// //         <main className="flex-1 flex flex-col items-center justify-center text-center">
// //           <h2 className="text-2xl font-semibold mb-2 text-destructive">
// //             Something went wrong
// //           </h2>
// //           <p className="text-muted-foreground">
// //             {error || "Training could not be found."}
// //           </p>
// //           <Button onClick={() => router.push("/courses")} className="mt-4">
// //             Back to Trainings
// //           </Button>
// //         </main>
// //         <SiteFooter />
// //       </div>
// //     );
// //   }

// //   const { training, instructor, modules, reviews } = details;
// //   const avgRating =
// //     reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

// //   // --- NEW, IMPROVED FUNCTION ---
// //   function getYouTubeEmbedUrl(url: string) {
// //     try {
// //       const parsed = new URL(url);
// //       let videoId = "";

// //       if (
// //         parsed.hostname.includes("youtube.com") &&
// //         parsed.searchParams.get("v")
// //       ) {
// //         videoId = parsed.searchParams.get("v")!;
// //       } else if (parsed.hostname === "youtu.be") {
// //         videoId = parsed.pathname.slice(1);
// //       } else if (parsed.pathname.includes("/embed/")) {
// //         videoId = parsed.pathname.split("/embed/")[1];
// //       } else if (parsed.pathname.includes("/shorts/")) {
// //         videoId = parsed.pathname.split("/shorts/")[1];
// //       }

// //       if (videoId) {
// //         // These parameters create the cleanest possible look
// //         const params = new URLSearchParams({
// //           autoplay: "1", // Autoplay the video
// //           mute: "0", // Mute video on autoplay (required by most browsers for autoplay to work)
// //           controls: "0", // Hide all player controls (play/pause bar, volume)
// //           showinfo: "0", // Hide info like title and uploader (important for your request)
// //           rel: "0", // Don't show related videos at the end
// //           modestbranding: "1", // Use a more subtle YouTube logo
// //           iv_load_policy: "3", // Hide video annotations
// //           loop: "1", // Loop the video
// //           playlist: videoId, // 'loop' requires 'playlist' to be set to the video ID
// //         });
// //         return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
// //       }
// //       return url;
// //     } catch {
// //       return url;
// //     }
// //   }

// //   return (
// //     <div className="flex min-h-screen flex-col bg-white">
// //       <SiteHeader />
// //       <main className="flex-1 py-12">
// //         <div className="container">
// //           <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
// //             {/* --- Left Column (Main Content) --- */}
// //             <div className="lg:col-span-2">
// //               <CourseHeader
// //                 categoryName={training.category_name}
// //                 name={training.name}
// //                 description={training.description}
// //                 avgRating={avgRating}
// //                 totalReviews={reviews.length}
// //                 studentCount={training.student_count}
// //                 duration={training.duration}
// //                 // lessonsCount={training.lessons_count}
// //                 modulesCount={training.modules_count}
// //                 instructor={
// //                   instructor
// //                     ? {
// //                         name: instructor.name,
// //                         title: instructor.title,
// //                         image_url: instructor.image_url,
// //                       }
// //                     : {
// //                         name: "Unknown Instructor",
// //                         title: "",
// //                         image_url: "/placeholder.svg",
// //                       }
// //                 }
// //               />
// //               {/* --- CHANGE 2: ADD THE VIDEO PLAYER SECTION HERE --- */}
// //               {/* This block will only render if a video URL exists for the training */}
// //               {/* Video Player Section */}
// //               {training.sample_video_url && (
// //                 <div className="mt-8 w-full rounded-lg overflow-hidden shadow-lg relative">
// //                   <div className="aspect-video w-full">
// //                     <iframe
// //                       src={getYouTubeEmbedUrl(training.sample_video_url)}
// //                       title="Training Preview Video"
// //                       frameBorder="0"
// //                       allow="autoplay; encrypted-media; picture-in-picture"
// //                       allowFullScreen
// //                       className="w-full h-full pointer-events-none" // blocks all iframe interaction
// //                     ></iframe>
// //                     {/* Transparent overlay to block hover/click */}
// //                     <div className="absolute inset-0 z-10"></div>
// //                   </div>
// //                 </div>
// //               )}

// //               <Tabs defaultValue="overview" className="w-full mt-12">
// //                 <TabsList className="border-b justify-start rounded-none bg-transparent p-0 h-auto">
// //                   <TabsTrigger
// //                     value="overview"
// //                     className="data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:text-amber-600 rounded-none pb-3 text-base"
// //                   >
// //                     Overview
// //                   </TabsTrigger>
// //                   <TabsTrigger
// //                     value="curriculum"
// //                     className="data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:text-amber-600 rounded-none pb-3 text-base"
// //                   >
// //                     Course Content
// //                   </TabsTrigger>
// //                   <TabsTrigger
// //                     value="instructor"
// //                     className="data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:text-amber-600 rounded-none pb-3 text-base"
// //                   >
// //                     Instructor
// //                   </TabsTrigger>
// //                   <TabsTrigger
// //                     value="reviews"
// //                     className="data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:text-amber-600 rounded-none pb-3 text-base"
// //                   >
// //                     Reviews
// //                   </TabsTrigger>
// //                 </TabsList>

// //                 <div className="py-8">
// //                   <TabsContent value="overview">
// //                     <OverviewSection
// //                       whatYouWillLearn={training.what_you_will_learn || []}
// //                       requirements={training.requirements || []}
// //                       description={training.overview}
// //                       whoIsFor={[]} // Add this field to your DB if needed
// //                     />
// //                   </TabsContent>
// //                   <TabsContent value="curriculum">
// //                     <CurriculumSection modules={modules} />
// //                   </TabsContent>
// //                   <TabsContent value="instructor">
// //                     <InstructorSection instructor={instructor} />
// //                   </TabsContent>
// //                   <TabsContent value="reviews">
// //                     <ReviewsSection reviews={reviews} />
// //                   </TabsContent>
// //                 </div>
// //               </Tabs>
// //             </div>

// //             {/* --- Right Column (Sticky Sidebar) --- */}
// //             <div className="order-first lg:order-last mb-8 lg:mb-0">
// //               <StickySidebar
// //                 training={training}
// //                 isEnrolled={isEnrolled}
// //                 checkingEnrollment={checkingEnrollment}
// //                 enrolling={enrolling}
// //                 handleEnrollClick={handleEnrollClick}
// //               />
// //             </div>
// //           </div>
// //         </div>
// //       </main>
// //       <SiteFooter />
// //     </div>
// //   );
// // }
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
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
//   student_count: number;
//   lessons_count: number;
//   modules_count: number;
//   category_name: string;
// }

// interface TrainingDetails {
//   training: Training;
//   instructor: Instructor;
//   modules: Module[];
//   reviews: Review[];
// }

// // --- Sidebar ---
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
//           className="w-full mb-4 bg-amber-600 hover:bg-amber-700 text-white font-bold"
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
//   const { isAuthenticated } = useAuth();
//   const { toast } = useToast();
//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [checkingEnrollment, setCheckingEnrollment] = useState(false);
//   const [enrolling, setEnrolling] = useState(false);
//   const router = useRouter();

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
//     const checkEnrollment = async () => {
//       if (!isAuthenticated || !details) return;
//       setCheckingEnrollment(true);

//       try {
//         const userId = localStorage.getItem("user_id");
//         if (!userId) return;

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
//             setIsEnrolled(true); // ✅ Show "Go to Training"
//           } else {
//             setIsEnrolled(false); // expired → "Enroll Now"
//           }
//         } else {
//           setIsEnrolled(false); // no enrollment → "Enroll Now"
//         }
//       } catch (err) {
//         setIsEnrolled(false);
//       } finally {
//         setCheckingEnrollment(false); // ✅ Ensure button re-renders
//       }
//     };

//     checkEnrollment();
//   }, [isAuthenticated, details]);

//   // --- Free Enrollment ---
//   const handleFreeEnrollment = async () => {
//     if (!details) return;
//     setEnrolling(true);
//     try {
//       const response = await fetch("/api/enrollments/free", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
//         },
//         body: JSON.stringify({ trainingId: details.training.id }),
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
//       router.push(`/courses/${details.training.id}/lessons`);
//       return;
//     }
//     if (details) {
//       if (Number(details.training.price) === 0) {
//         handleFreeEnrollment();
//       } else {
//         router.push(`/courses/${details.training.id}/payment`);
//       }
//     }
//   };

//   // --- Payment toast ---
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     if (urlParams.get("enrolled") === "true") {
//       toast({
//         title: "Payment Successful! 🎉",
//         description: "Welcome to the training!",
//       });
//       window.history.replaceState({}, "", window.location.pathname);
//     }
//   }, [toast]);

//   // --- Loading/Error States ---
//   if (loading) {
//     return (
//       <div className="flex min-h-screen flex-col">
//         <SiteHeader />
//         <main className="flex-1 flex items-center justify-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600"></div>
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
//   const { training, instructor, modules, reviews } = details;
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
//                 studentCount={training.student_count}
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

//             <div className="order-first lg:order-last mb-8 lg:mb-0">
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
  student_count: number;
  lessons_count: number;
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
    <Card className="overflow-hidden shadow-lg sticky top-24">
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
          className="w-full mb-4 bg-amber-600 hover:bg-amber-700 text-white font-bold"
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600"></div>
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
                studentCount={training.student_count}
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
                <TabsList className="border-b justify-start rounded-none bg-transparent p-0 h-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Course Content</TabsTrigger>
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

            <div className="order-first lg:order-last mb-8 lg:mb-0">
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
