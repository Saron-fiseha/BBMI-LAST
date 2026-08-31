// // C:\Users\Hp\Documents\BBMI-LMS\app\courses\[id]\lessons\page.tsx
// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { SiteHeader } from "@/components/site-header";
// import { SiteFooter } from "@/components/site-footer";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { useAuth } from "@/hooks/use-auth";
// import { useToast } from "@/hooks/use-toast";
// import YouTube from "react-youtube";
// import Link from "next/link";
// import { ReviewsSection } from "@/components/reviews/reviews-section";

// // We will no longer need to import DocumentViewer or related icons for the viewer
// // import DocumentViewer from "@/components/document-viewer";
// // import { X } from "lucide-react"; // No longer needed for document viewer close

// import {
//   Play,
//   Pause,
//   Maximize,
//   CheckCircle,
//   Clock,
//   ArrowLeft,
//   Award,
//   Star,
//   Lock,
//   Eye,
//   Loader2,
//   Minimize,
// } from "lucide-react";

// // --- Interfaces (Keep these as they are) ---
// interface Document {
//   id: string;
//   file_name: string;
//   file_url: string;
// }

// interface Module {
//   id: string;
//   title: string;
//   description: string;
//   content: string;
//   video_url: string | null;
//   duration: number;
//   order_index: number;
//   is_preview: boolean;
//   status: "not_started" | "in_progress" | "completed";
//   progress_percentage: number;
//   time_spent_minutes: number;
//   document: Document | null;
// }

// interface Certificate {
//   certificate_number: string;
//   verification_code: string;
//   created_at: string;
//   pdf_url: string;
// }

// interface ProgressData {
//   success: boolean;
//   enrollment: {
//     id: string;
//     training_id: string;
//     status: string;
//     progress_percentage: number;
//     enrolled_at: string;
//     completed_at: string | null;
//     last_accessed: string;
//     certificate_issued: boolean;
//     training_title: string;
//   };
//   modules: Module[];
//   statistics: {
//     total_modules: number;
//     completed_modules: number;
//     in_progress_modules: number;
//     total_time_spent: number;
//     avg_module_progress: number;
//     completion_rate: number;
//   };
//   certificate: Certificate | null;
//   documents: Document[];
// }

// interface Quiz {
//   id: string;
//   question_text: string;
//   options: string[];
//   correct_answer_index: number;
// }
// // --- ModulesPage Component ---
// export default function ModulesPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const [progressData, setProgressData] = useState<ProgressData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedModule, setSelectedModule] = useState<Module | null>(null);
//   const [updatingProgress, setUpdatingProgress] = useState(false);
//   const [downloadingCertificate, setDownloadingCertificate] = useState(false);

//   const [quizzes, setQuizzes] = useState<Quiz[]>([]);
//   const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
//   const [showCorrectAnswers, setShowCorrectAnswers] = useState<{
//     [key: string]: boolean;
//   }>({});
//   const [loadingQuizzes, setLoadingQuizzes] = useState(false);
//   const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

//   const { user, isAuthenticated } = useAuth();
//   const { toast } = useToast();
//   const router = useRouter();

//   // --- YouTube Player State and Refs ---
//   const playerRef = useRef<any>(null); // Ref for the YouTube player instance
//   const videoContainerRef = useRef<HTMLDivElement>(null); // Ref for the div wrapping the YouTube player
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [volume, setVolume] = useState(100);
//   const [duration, setDuration] = useState(0);
//   const [isFullscreen, setIsFullscreen] = useState(false);

//   // --- Data Fetching ---
//   useEffect(() => {
//     const fetchProgressData = async () => {
//       if (!isAuthenticated) {
//         router.push("/login");
//         return;
//       }
//       try {
//         setLoading(true);
//         const resolvedParams = await params;
//         const response = await fetch(`/api/progress/${resolvedParams.id}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
//           },
//         });
//         if (!response.ok) throw new Error("Failed to fetch progress data");
//         const data = await response.json();
//         setProgressData(data);

//         if (data.modules && data.modules.length > 0) {
//           const firstAvailableModule = data.modules.find(
//             (module: Module) =>
//               module.is_preview ||
//               module.status === "completed" ||
//               data.modules
//                 .filter((m: Module) => m.order_index < module.order_index)
//                 .every((m: Module) => m.status === "completed")
//           );
//           setSelectedModule(firstAvailableModule || data.modules[0]);
//         }
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "Failed to load training data"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProgressData();
//   }, [params, isAuthenticated, router]);

//   useEffect(() => {
//     if (
//       !loading &&
//       progressData &&
//       typeof window !== "undefined" &&
//       window.location.hash
//     ) {
//       const targetId = window.location.hash.substring(1);
//       const targetElement = document.getElementById(targetId);

//       if (targetElement) {
//         requestAnimationFrame(() => {
//           targetElement.scrollIntoView({
//             behavior: "smooth",
//             block: "start",
//           });
//           history.replaceState(null, "", window.location.pathname);
//         });
//       }
//     }
//   }, [loading, progressData]);

//   // Fetch quizzes for the training
//   useEffect(() => {
//     if (!progressData) return;
//     const fetchQuizzes = async () => {
//       setLoadingQuizzes(true);
//       try {
//         const response = await fetch(
//           `/api/admin/quiz?trainingId=${progressData.enrollment.training_id}`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
//             },
//           }
//         );
//         if (!response.ok) throw new Error("Failed to fetch quizzes");
//         const data: Quiz[] = await response.json();
//         setQuizzes(data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoadingQuizzes(false);
//       }
//     };
//     fetchQuizzes();
//   }, [progressData]);

//   // --- Module Logic ---
//   const canAccessModule = (module: Module): boolean => {
//     if (!progressData) return false;
//     return (
//       module.is_preview ||
//       module.status === "completed" ||
//       progressData.modules
//         .filter((m) => m.order_index < module.order_index)
//         .every((m: Module) => m.status === "completed")
//     );
//   };

//   const markModuleComplete = async (moduleId: string) => {
//     if (!progressData || updatingProgress) return;
//     setUpdatingProgress(true);
//     try {
//       const response = await fetch("/api/progress/update", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
//         },
//         body: JSON.stringify({
//           trainingId: progressData.enrollment.training_id,
//           moduleId,
//           status: "completed",
//           progressPercentage: 100,
//           timeSpent: 5,
//         }),
//       });
//       const data = await response.json();
//       if (data.success) {
//         setProgressData((prev) => {
//           if (!prev) return prev;

//           const updatedModules = prev.modules.map((module) =>
//             module.id === moduleId
//               ? {
//                   ...module,
//                   status: "completed" as const,
//                   progress_percentage: 100,
//                 }
//               : module
//           );

//           const newEnrollmentProgress = data.overallProgress;
//           const newCompletedModules = data.completedModules;
//           const newTotalModules = data.totalModules;

//           return {
//             ...prev,
//             modules: updatedModules,
//             enrollment: {
//               ...prev.enrollment,
//               progress_percentage: newEnrollmentProgress,
//               status: data.trainingCompleted ? "completed" : "active",
//               completed_at: data.trainingCompleted
//                 ? new Date().toISOString()
//                 : prev.enrollment.completed_at,
//             },
//             statistics: {
//               ...prev.statistics,
//               completed_modules: newCompletedModules,
//               in_progress_modules: newTotalModules - newCompletedModules,
//               avg_module_progress: newEnrollmentProgress,
//               completion_rate: newEnrollmentProgress,
//             },
//             certificate:
//               data.certificateGenerated && !prev.certificate
//                 ? {
//                     certificate_number: data.certificateNumber,
//                     verification_code: "N/A",
//                     created_at: new Date().toISOString(),
//                     pdf_url: "",
//                   }
//                 : prev.certificate,
//           };
//         });
//         toast({ title: "Module Completed ✅" });
//         if (data.trainingCompleted && data.certificateGenerated) {
//           toast({
//             title: "Congratulations!",
//             description:
//               "You have completed the training and your certificate is ready!",
//           });
//         }
//       }
//     } catch (error) {
//       console.error(error);
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error ? error.message : "Failed to update progress",
//         variant: "destructive",
//       });
//     } finally {
//       setUpdatingProgress(false);
//     }
//   };

//   const handleVideoEnd = async () => {
//     if (selectedModule && selectedModule.status !== "completed") {
//       await markModuleComplete(selectedModule.id);
//     }
//   };

//   const downloadCertificate = async () => {
//     if (!progressData?.certificate) return;

//     setDownloadingCertificate(true);
//     try {
//       const response = await fetch("/api/certificates/generate-pdf", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           studentName: user?.full_name || "Student",
//           courseName: progressData.enrollment.training_title,
//           instructorName: "Ms Betelhem",
//           completionDate: new Date(
//             progressData.certificate.created_at
//           ).toLocaleDateString("en-US", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           }),
//           certificateId: progressData.certificate.certificate_number,
//           trainingDescription: `professional ${progressData.enrollment.training_title.toLowerCase()} techniques`,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to generate certificate");
//       }

//       const htmlContent = await response.text();

//       const newWindow = window.open("", "_blank");
//       if (newWindow) {
//         newWindow.document.write(htmlContent);
//         newWindow.document.close();

//         newWindow.onload = () => {
//           setTimeout(() => {
//             newWindow.print();
//           }, 500);
//         };
//       }
//     } catch (error) {
//       console.error("Certificate download error:", error);
//       toast({
//         title: "Download Failed",
//         description:
//           error instanceof Error
//             ? error.message
//             : "Failed to generate certificate",
//         variant: "destructive",
//       });
//     } finally {
//       setDownloadingCertificate(false);
//     }
//   };

//   const getYouTubeVideoId = (url: string | null | undefined): string => {
//     if (!url || typeof url !== "string") return "";
//     if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
//     try {
//       const parsedUrl = new URL(url);
//       if (parsedUrl.hostname.includes("youtube.com")) {
//         if (parsedUrl.searchParams.has("v"))
//           return parsedUrl.searchParams.get("v") || "";
//         const embedMatch = parsedUrl.pathname.match(
//           /\/embed\/([a-zA-Z0-9_-]{11})/
//         );
//         if (embedMatch) return embedMatch[1];
//         const shortsMatch = parsedUrl.pathname.match(
//           /\/shorts\/([a-zA-Z0-9_-]{11})/
//         );
//         if (shortsMatch) return shortsMatch[1];
//       }
//       if (parsedUrl.hostname.includes("youtu.be")) {
//         const id = parsedUrl.pathname.replace("/", "");
//         if (id.length === 11) return id;
//       }
//     } catch {
//       return "";
//     }
//     return "";
//   };

//   // --- Player Controls and Fullscreen Logic ---
//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       setIsFullscreen(!!document.fullscreenElement);
//     };
//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//     };
//   }, []);

//   const toggleFullscreen = useCallback(() => {
//     if (!videoContainerRef.current) return;

//     if (!document.fullscreenElement) {
//       videoContainerRef.current
//         .requestFullscreen()
//         .then(() => setIsFullscreen(true))
//         .catch((err) =>
//           console.error(
//             `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`
//           )
//         );
//     } else {
//       document
//         .exitFullscreen()
//         .then(() => setIsFullscreen(false))
//         .catch((err) =>
//           console.error(
//             `Error attempting to disable fullscreen mode: ${err.message} (${err.name})`
//           )
//         );
//     }
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (playerRef.current && playerRef.current.getCurrentTime) {
//         const currentTime = playerRef.current.getCurrentTime();
//         const total = playerRef.current.getDuration();
//         setDuration(total);
//         if (total > 0) {
//           setProgress((currentTime / total) * 100);
//         }
//       }
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   // --- Quiz Logic ---
//   const handleAnswerSelect = (
//     quizId: string,
//     selectedIdx: number,
//     correctIdx: number
//   ) => {
//     setQuizAnswers((prev) => ({ ...prev, [quizId]: selectedIdx }));
//     setShowCorrectAnswers((prev) => ({
//       ...prev,
//       [quizId]: selectedIdx !== correctIdx,
//     }));
//   };

//   const handleNextQuiz = () => {
//     if (currentQuizIndex < quizzes.length - 1)
//       setCurrentQuizIndex(currentQuizIndex + 1);
//   };

//   const handlePrevQuiz = () => {
//     if (currentQuizIndex > 0) setCurrentQuizIndex(currentQuizIndex - 1);
//   };

//   const totalScore = quizzes.filter(
//     (q) => quizAnswers[q.id] === q.correct_answer_index
//   ).length;

//   // --- Document Opener Handler ---
//   const handleViewDocumentClick = () => {
//     if (!progressData?.documents?.length) {
//       toast({
//         title: "No Document Found",
//         description: "There is no document available for this training.",
//         variant: "destructive",
//       });
//       return;
//     }

//     const documentUrl = progressData.documents[0].file_url;
//     window.open(documentUrl, "_blank");
//   };

//   // --- Render Logic ---
//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   if (error || !progressData)
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Error: {error || "Training not found"}
//       </div>
//     );

//   const currentQuiz = quizzes[currentQuizIndex];

//   return (
//     <div className="min-h-screen flex flex-col">
//       <SiteHeader />

//       <main className="flex-1 container py-8">
//         <Button variant="ghost" asChild className="mb-4">
//           <Link href={`/courses/${progressData.enrollment.training_id}`}>
//             <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
//           </Link>
//         </Button>

//         <div className="max-w-md">
//           <div className="flex justify-between text-sm mb-2">
//             <span>Overall Progress</span>
//             <span>
//               {Math.round(progressData.enrollment.progress_percentage)}%
//             </span>
//           </div>
//           <Progress
//             value={progressData.enrollment.progress_percentage}
//             className="h-2"
//           />
//         </div>

//         {progressData?.certificate && (
//           <div className="flex justify-end mt-6">
//             <div className="relative bg-gradient-to-br from-custom-copper to-custom-copper p-6 rounded-lg border border-custom-copper w-full max-w-sm flex flex-col items-center">
//               <div className="absolute -top-1 -right-1">
//                 <Star className="h-6 w-6 text-white fill-current" />
//               </div>

//               <Award className="h-16 w-16 text-white mb-3" />

//               <h3 className="font-bold text-lg bg-custom-copper text-white mb-1 text-center">
//                 Training Completed!
//               </h3>
//               <p className="text-sm text-white mb-3 text-center">
//                 Certificate #{progressData.certificate.certificate_number}
//               </p>

//               <Button
//                 onClick={downloadCertificate}
//                 disabled={downloadingCertificate}
//                 className="bg-custom-copper hover:bg-custom-copper text-white"
//                 size="sm"
//               >
//                 {downloadingCertificate ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Award className="h-4 w-4 mr-2" />
//                     View Certificate
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
//           <div className="lg:col-span-1">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Training Modules</CardTitle>
//               </CardHeader>
//               <CardContent className="p-0 border-t md:border-t-0 max-h-[70vh] overflow-y-auto lg:max-h-[calc(100vh-180px)]">
//                 <div className="space-y-1">
//                   {progressData.modules
//                     .sort((a, b) => a.order_index - b.order_index)
//                     .map((module) => {
//                       const isCompleted = module.status === "completed";
//                       const isSelected = selectedModule?.id === module.id;
//                       const canAccess = canAccessModule(module);
//                       return (
//                         <button
//                           key={module.id}
//                           onClick={() => canAccess && setSelectedModule(module)}
//                           disabled={!canAccess}
//                           className={`w-full text-left p-4 border-b transition-colors ${
//                             isSelected
//                               ? "bg-primary/10 border-primary"
//                               : canAccess
//                                 ? "hover:bg-muted"
//                                 : "opacity-50 cursor-not-allowed"
//                           }`}
//                         >
//                           <div className="flex items-start justify-between">
//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-center gap-2 mb-1">
//                                 {!canAccess ? (
//                                   <Lock className="h-4 w-4 text-muted-foreground" />
//                                 ) : module.is_preview ? (
//                                   <Eye className="h-4 w-4 text-blue-500" />
//                                 ) : isCompleted ? (
//                                   <CheckCircle className="h-4 w-4 text-green-500" />
//                                 ) : (
//                                   <Play className="h-4 w-4 text-muted-foreground" />
//                                 )}
//                                 <span className="font-medium text-sm truncate">
//                                   {module.title}
//                                 </span>
//                               </div>
//                               <div className="flex items-center text-xs text-muted-foreground">
//                                 <Clock className="h-3 w-3 mr-1" />
//                                 {Math.floor(module.duration / 60)}m
//                                 {module.is_preview && (
//                                   <Badge
//                                     variant="outline"
//                                     className="ml-2 text-xs"
//                                   >
//                                     Preview
//                                   </Badge>
//                                 )}
//                               </div>
//                               {module.progress_percentage > 0 &&
//                                 module.status !== "completed" && (
//                                   <div className="mt-2">
//                                     <Progress
//                                       value={module.progress_percentage}
//                                       className="h-1"
//                                     />
//                                   </div>
//                                 )}
//                             </div>
//                           </div>
//                         </button>
//                       );
//                     })}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           <div className="lg:col-span-2">
//             {selectedModule ? (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>{selectedModule.title}</CardTitle>
//                   <p className="text-muted-foreground">
//                     {selectedModule.description}
//                   </p>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   {selectedModule.video_url && (
//                     <div
//                       ref={videoContainerRef}
//                       className={`relative w-full max-w-full ${
//                         isFullscreen
//                           ? "fixed inset-0 z-[9999] bg-black flex items-center justify-center"
//                           : ""
//                       }`}
//                     >
//                       <div
//                         className={`relative ${
//                           isFullscreen ? "w-full h-full" : "aspect-video"
//                         }`}
//                       >
//                         <YouTube
//                           videoId={getYouTubeVideoId(
//                             selectedModule.video_url || ""
//                           )}
//                           opts={{
//                             width: "100%",
//                             height: "100%",
//                             host: "https://www.youtube-nocookie.com",
//                             playerVars: {
//                               controls: 0,
//                               disablekb: 1,
//                               fs: 0,
//                               modestbranding: 1,
//                               rel: 0,
//                               iv_load_policy: 3,
//                               showinfo: 0,
//                               playsinline: 1,
//                               // NOTE: `loop` + `playlist` (pointing at the
//                               // same video) were intentionally removed.
//                               // That combination makes YouTube's player
//                               // loop the video forever, so it never
//                               // cleanly reaches the "ended" state —
//                               // react-youtube's onEnd callback below
//                               // never reliably fired, so module
//                               // completion (and certificate generation)
//                               // never triggered even after watching the
//                               // full video. Without looping, the player
//                               // reaches a real "ended" state and onEnd
//                               // fires correctly.
//                             },
//                           }}
//                           onReady={(e) => {
//                             playerRef.current = e.target;
//                             playerRef.current.setVolume(volume);
//                           }}
//                           onEnd={handleVideoEnd}
//                           className="absolute inset-0"
//                         />
//                         <div className="absolute inset-0 z-10 bg-transparent pointer-events-auto"></div>
//                       </div>

//                       <div
//                         className={`flex flex-wrap items-center justify-between mt-2 gap-4 ${
//                           isFullscreen
//                             ? "absolute bottom-4 left-4 right-4 z-[9999] bg-black/50 p-4 rounded-lg"
//                             : ""
//                         } sm:flex-nowrap`}
//                       >
//                         <Button
//                           size="sm"
//                           className="bg-custom-copper hover:bg-custom-copper text-white flex-shrink-0"
//                           onClick={() => {
//                             if (!playerRef.current) return;
//                             if (isPlaying) {
//                               playerRef.current.pauseVideo();
//                             } else {
//                               playerRef.current.playVideo();
//                             }
//                             setIsPlaying(!isPlaying);
//                           }}
//                         >
//                           {isPlaying ? (
//                             <Pause className="h-4 w-4" />
//                           ) : (
//                             <Play className="h-4 w-4" />
//                           )}
//                         </Button>

//                         <input
//                           type="range"
//                           min={0}
//                           max={100}
//                           value={progress}
//                           onChange={(e) => {
//                             const val = Number(e.target.value);
//                             setProgress(val);
//                             if (playerRef.current && duration) {
//                               playerRef.current.seekTo(
//                                 (val / 100) * duration,
//                                 true
//                               );
//                             }
//                           }}
//                           className="flex-1 h-1 rounded-lg bg-custom-copper hover:bg-custom-copper accent-primary min-w-[100px]"
//                         />

//                         <input
//                           type="range"
//                           min={0}
//                           max={100}
//                           value={volume}
//                           onChange={(e) => {
//                             const val = Number(e.target.value);
//                             setVolume(val);
//                             if (playerRef.current)
//                               playerRef.current.setVolume(val);
//                           }}
//                           className="w-24 h-1 rounded-lg bg-custom-copper hover:bg-custom-copper accent-primary flex-shrink-0"
//                         />

//                         <Button
//                           size="sm"
//                           className="bg-custom-copper hover:bg-custom-copper text-white flex-shrink-0"
//                           onClick={toggleFullscreen}
//                         >
//                           {isFullscreen ? (
//                             <Minimize className="h-4 w-4" />
//                           ) : (
//                             <Maximize className="h-4 w-4" />
//                           )}
//                         </Button>
//                       </div>
//                     </div>
//                   )}
//                   <div
//                     className="prose max-w-none"
//                     dangerouslySetInnerHTML={{ __html: selectedModule.content }}
//                   />

//                   <Button
//                     className="bg-custom-copper hover:bg-custom-copper text-white"
//                     onClick={handleViewDocumentClick}
//                   >
//                     View Document
//                   </Button>

//                   {/* Mark as Complete — explicit fallback so completion
//                       doesn't depend solely on the YouTube "ended" event
//                       firing (and works for modules with no video at all,
//                       which previously had no way to be completed). */}
//                   {selectedModule.status !== "completed" ? (
//                     <Button
//                       onClick={() => markModuleComplete(selectedModule.id)}
//                       disabled={updatingProgress}
//                       className="bg-green-600 hover:bg-green-700 text-white"
//                     >
//                       {updatingProgress ? (
//                         <>
//                           <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                           Marking Complete...
//                         </>
//                       ) : (
//                         <>
//                           <CheckCircle className="h-4 w-4 mr-2" />
//                           Mark as Complete
//                         </>
//                       )}
//                     </Button>
//                   ) : (
//                     <div className="flex items-center gap-2 text-green-600 font-medium">
//                       <CheckCircle className="h-4 w-4" />
//                       Module Completed
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             ) : (
//               <p>Select a module to view its content.</p>
//             )}

//             {progressData.enrollment.progress_percentage === 100 && (
//               <div className="mt-8">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Training Quiz</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     {loadingQuizzes ? (
//                       <div className="text-center py-4">
//                         <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
//                         Loading quizzes...
//                       </div>
//                     ) : quizzes.length === 0 ? (
//                       <p className="text-muted-foreground">
//                         No quizzes available for this training.
//                       </p>
//                     ) : (
//                       <>
//                         {currentQuiz ? (
//                           <div className="mb-6 border rounded-lg p-4 shadow-sm">
//                             <p className="font-medium mb-2">
//                               Question {currentQuizIndex + 1} of{" "}
//                               {quizzes.length}:
//                             </p>
//                             <p className="mb-4">{currentQuiz.question_text}</p>
//                             <div className="flex flex-col gap-2">
//                               {currentQuiz.options.map((option, idx) => {
//                                 const selected =
//                                   quizAnswers[currentQuiz.id] === idx;
//                                 const showCorrect =
//                                   showCorrectAnswers[currentQuiz.id];
//                                 const isCorrect =
//                                   currentQuiz.correct_answer_index === idx;
//                                 const bgColor = selected
//                                   ? isCorrect
//                                     ? "bg-green-100 border-green-400"
//                                     : "bg-red-100 border-red-400"
//                                   : showCorrect && isCorrect
//                                     ? "bg-green-50 border-green-300"
//                                     : "hover:bg-muted";
//                                 return (
//                                   <button
//                                     key={idx}
//                                     onClick={() =>
//                                       handleAnswerSelect(
//                                         currentQuiz.id,
//                                         idx,
//                                         currentQuiz.correct_answer_index
//                                       )
//                                     }
//                                     disabled={
//                                       quizAnswers[currentQuiz.id] !== undefined
//                                     }
//                                     className={`text-left p-2 border rounded ${bgColor}`}
//                                   >
//                                     {option}
//                                     {selected && isCorrect && (
//                                       <span className="ml-2 text-green-700 font-semibold">
//                                         ✅
//                                       </span>
//                                     )}
//                                     {selected && !isCorrect && (
//                                       <span className="ml-2 text-red-700 font-semibold">
//                                         ❌
//                                       </span>
//                                     )}
//                                     {showCorrect && !selected && isCorrect && (
//                                       <span className="ml-2 text-green-700 font-semibold">
//                                         ✅
//                                       </span>
//                                     )}
//                                   </button>
//                                 );
//                               })}
//                             </div>

//                             <div className="mt-4 flex justify-between">
//                               <Button
//                                 onClick={handlePrevQuiz}
//                                 disabled={currentQuizIndex === 0}
//                               >
//                                 Previous
//                               </Button>
//                               {currentQuizIndex < quizzes.length - 1 ? (
//                                 <Button onClick={handleNextQuiz}>Next</Button>
//                               ) : Object.keys(quizAnswers).length ===
//                                 quizzes.length ? (
//                                 <div className="font-semibold text-center">
//                                   Your Score: {totalScore} / {quizzes.length} 🎉
//                                 </div>
//                               ) : (
//                                 <div />
//                               )}
//                             </div>
//                           </div>
//                         ) : null}
//                       </>
//                     )}
//                   </CardContent>
//                 </Card>
//               </div>
//             )}

//             {progressData.enrollment.progress_percentage === 100 && (
//               <div id="reviews-section" className="mt-8">
//                 <ReviewsSection
//                   courseId={progressData.enrollment.training_id}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </main>

//       <Card className="mt-8 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
//         <CardHeader>
//           <CardTitle>Learning Statistics</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-custom-brown">
//                 {progressData.statistics.total_modules}
//               </div>
//               <div className="text-sm text-muted-foreground">Total Modules</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-charcoal-gray">
//                 {progressData.statistics.completed_modules}
//               </div>
//               <div className="text-sm text-muted-foreground">Completed</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-light-rose">
//                 {Math.round(progressData.enrollment.progress_percentage)}%
//               </div>
//               <div className="text-sm text-muted-foreground">Progress</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-custom-copper">
//                 {Math.floor(progressData.statistics.total_time_spent / 60)}h{" "}
//                 {progressData.statistics.total_time_spent % 60}m
//               </div>
//               <div className="text-sm text-muted-foreground">Time Spent</div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <SiteFooter />
//     </div>
//   );
// }
// C:\Users\Hp\Documents\BBMI-LMS\app\courses\[id]\lessons\page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import YouTube from "react-youtube";
import Link from "next/link";
import { ReviewsSection } from "@/components/reviews/reviews-section";

import {
  Play,
  Pause,
  Maximize,
  CheckCircle,
  Clock,
  ArrowLeft,
  Award,
  Star,
  Lock,
  Eye,
  Loader2,
  Minimize,
} from "lucide-react";

// --- Interfaces ---
interface Document {
  id: string;
  file_name: string;
  file_url: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  video_url: string | null;
  duration: number;
  order_index: number;
  is_preview: boolean;
  status: "not_started" | "in_progress" | "completed";
  progress_percentage: number;
  time_spent_minutes: number;
  document: Document | null;
}

interface Certificate {
  certificate_number: string;
  verification_code: string;
  created_at: string;
  pdf_url: string;
}

interface ProgressData {
  success: boolean;
  enrollment: {
    id: string;
    training_id: string;
    status: string;
    progress_percentage: number;
    enrolled_at: string;
    completed_at: string | null;
    last_accessed: string;
    certificate_issued: boolean;
    training_title: string;
  };
  modules: Module[];
  statistics: {
    total_modules: number;
    completed_modules: number;
    in_progress_modules: number;
    total_time_spent: number;
    avg_module_progress: number;
    completion_rate: number;
  };
  certificate: Certificate | null;
  documents: Document[];
}

interface Quiz {
  id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
}
// --- ModulesPage Component ---
export default function ModulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<{
    [key: string]: boolean;
  }>({});
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // --- YouTube Player State and Refs ---
  const playerRef = useRef<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Data Fetching ---
  // Extracted as a reusable, stable function (not just inline in a
  // useEffect) so it can also be called after a module is completed —
  // this refetches the AUTHORITATIVE progress/certificate data from the
  // server instead of hand-splicing a partial/fake certificate object
  // into local state. That hand-splicing was the source of the "N/A"
  // placeholder verification code seen right after generating a
  // certificate: the real record (with its real verification_code) only
  // existed in the database, never in local state, until this refetch.
  const fetchProgressData = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/progress/${resolvedParams.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch progress data");
      const data = await response.json();
      setProgressData(data);

      if (data.modules && data.modules.length > 0) {
        setSelectedModule((prevSelected) => {
          // Keep the currently-viewed module selected across a refresh
          // (e.g. right after marking it complete) instead of jumping
          // back to the first available module every time.
          if (prevSelected) {
            const stillExists = data.modules.find(
              (m: Module) => m.id === prevSelected.id
            );
            if (stillExists) return stillExists;
          }
          const firstAvailableModule = data.modules.find(
            (module: Module) =>
              module.is_preview ||
              module.status === "completed" ||
              data.modules
                .filter((m: Module) => m.order_index < module.order_index)
                .every((m: Module) => m.status === "completed")
          );
          return firstAvailableModule || data.modules[0];
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load training data"
      );
    }
  }, [params, isAuthenticated, router]);

  useEffect(() => {
    setLoading(true);
    fetchProgressData().finally(() => setLoading(false));
  }, [fetchProgressData]);

  useEffect(() => {
    if (
      !loading &&
      progressData &&
      typeof window !== "undefined" &&
      window.location.hash
    ) {
      const targetId = window.location.hash.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        requestAnimationFrame(() => {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          history.replaceState(null, "", window.location.pathname);
        });
      }
    }
  }, [loading, progressData]);

  // Fetch quizzes for the training
  useEffect(() => {
    if (!progressData) return;
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      try {
        const response = await fetch(
          `/api/admin/quiz?trainingId=${progressData.enrollment.training_id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch quizzes");
        const data: Quiz[] = await response.json();
        setQuizzes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, [progressData]);

  // --- Module Logic ---
  const canAccessModule = (module: Module): boolean => {
    if (!progressData) return false;
    return (
      module.is_preview ||
      module.status === "completed" ||
      progressData.modules
        .filter((m) => m.order_index < module.order_index)
        .every((m: Module) => m.status === "completed")
    );
  };

  const markModuleComplete = async (moduleId: string) => {
    if (!progressData || updatingProgress) return;
    setUpdatingProgress(true);
    try {
      const response = await fetch("/api/progress/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          trainingId: progressData.enrollment.training_id,
          moduleId,
          status: "completed",
          progressPercentage: 100,
          timeSpent: 5,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Module Completed ✅" });
        if (data.trainingCompleted && data.certificateGenerated) {
          toast({
            title: "Congratulations!",
            description:
              "You have completed the training and your certificate is ready!",
          });
        }

        // Re-fetch the authoritative progress/certificate data from the
        // server rather than hand-building a partial certificate object
        // locally. This is what actually fixes the "N/A"/inconsistent
        // verification code problem — the real certificate row (with
        // its real certificate_number and verification_code) only
        // exists in the database, so we go get it rather than guessing.
        await fetchProgressData();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update progress",
        variant: "destructive",
      });
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleVideoEnd = async () => {
    if (selectedModule && selectedModule.status !== "completed") {
      await markModuleComplete(selectedModule.id);
    }
  };

  // View Certificate — now calls the exact same endpoint the dashboard
  // Certificates page uses (/api/certificates/html-content), instead of
  // the old /api/certificates/generate-pdf route. That route built its
  // own certificate HTML from whatever fields the frontend happened to
  // have in memory, including a FABRICATED verification code
  // (`VERIFY-${certificateId}`) that never matched the real stored
  // value, and used a relative logo path. Routing through html-content
  // guarantees this "View" button always renders identically to the
  // dashboard's "View" button, from the same server-side data.
  const viewCertificate = async () => {
    if (!progressData?.certificate) return;

    setDownloadingCertificate(true);
    try {
      const response = await fetch(
        `/api/certificates/html-content?verificationCode=${encodeURIComponent(
          progressData.certificate.verification_code
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch certificate");
      }

      const htmlContent = await response.text();

      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      } else {
        toast({
          title: "Blocked",
          description: "Pop-ups blocked. Please allow pop-ups for this site.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Certificate view error:", error);
      toast({
        title: "View Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load certificate",
        variant: "destructive",
      });
    } finally {
      setDownloadingCertificate(false);
    }
  };

  const getYouTubeVideoId = (url: string | null | undefined): string => {
    if (!url || typeof url !== "string") return "";
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes("youtube.com")) {
        if (parsedUrl.searchParams.has("v"))
          return parsedUrl.searchParams.get("v") || "";
        const embedMatch = parsedUrl.pathname.match(
          /\/embed\/([a-zA-Z0-9_-]{11})/
        );
        if (embedMatch) return embedMatch[1];
        const shortsMatch = parsedUrl.pathname.match(
          /\/shorts\/([a-zA-Z0-9_-]{11})/
        );
        if (shortsMatch) return shortsMatch[1];
      }
      if (parsedUrl.hostname.includes("youtu.be")) {
        const id = parsedUrl.pathname.replace("/", "");
        if (id.length === 11) return id;
      }
    } catch {
      return "";
    }
    return "";
  };

  // --- Player Controls and Fullscreen Logic ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) =>
          console.error(
            `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`
          )
        );
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) =>
          console.error(
            `Error attempting to disable fullscreen mode: ${err.message} (${err.name})`
          )
        );
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setDuration(total);
        if (total > 0) {
          setProgress((currentTime / total) * 100);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Quiz Logic ---
  const handleAnswerSelect = (
    quizId: string,
    selectedIdx: number,
    correctIdx: number
  ) => {
    setQuizAnswers((prev) => ({ ...prev, [quizId]: selectedIdx }));
    setShowCorrectAnswers((prev) => ({
      ...prev,
      [quizId]: selectedIdx !== correctIdx,
    }));
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < quizzes.length - 1)
      setCurrentQuizIndex(currentQuizIndex + 1);
  };

  const handlePrevQuiz = () => {
    if (currentQuizIndex > 0) setCurrentQuizIndex(currentQuizIndex - 1);
  };

  const totalScore = quizzes.filter(
    (q) => quizAnswers[q.id] === q.correct_answer_index
  ).length;

  // --- Document Opener Handler ---
  const handleViewDocumentClick = () => {
    if (!progressData?.documents?.length) {
      toast({
        title: "No Document Found",
        description: "There is no document available for this training.",
        variant: "destructive",
      });
      return;
    }

    const documentUrl = progressData.documents[0].file_url;
    window.open(documentUrl, "_blank");
  };

  // --- Render Logic ---
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  if (error || !progressData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error: {error || "Training not found"}
      </div>
    );

  const currentQuiz = quizzes[currentQuizIndex];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 container py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/courses/${progressData.enrollment.training_id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
          </Link>
        </Button>

        <div className="max-w-md">
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>
              {Math.round(progressData.enrollment.progress_percentage)}%
            </span>
          </div>
          <Progress
            value={progressData.enrollment.progress_percentage}
            className="h-2"
          />
        </div>

        {progressData?.certificate && (
          <div className="flex justify-end mt-6">
            <div className="relative bg-gradient-to-br from-custom-copper to-custom-copper p-6 rounded-lg border border-custom-copper w-full max-w-sm flex flex-col items-center">
              <div className="absolute -top-1 -right-1">
                <Star className="h-6 w-6 text-white fill-current" />
              </div>

              <Award className="h-16 w-16 text-white mb-3" />

              <h3 className="font-bold text-lg bg-custom-copper text-white mb-1 text-center">
                Training Completed!
              </h3>
              <p className="text-sm text-white mb-3 text-center">
                Certificate #{progressData.certificate.certificate_number}
              </p>

              <Button
                onClick={viewCertificate}
                disabled={downloadingCertificate}
                className="bg-custom-copper hover:bg-custom-copper text-white"
                size="sm"
              >
                {downloadingCertificate ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    View Certificate
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Training Modules</CardTitle>
              </CardHeader>
              <CardContent className="p-0 border-t md:border-t-0 max-h-[70vh] overflow-y-auto lg:max-h-[calc(100vh-180px)]">
                <div className="space-y-1">
                  {progressData.modules
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((module) => {
                      const isCompleted = module.status === "completed";
                      const isSelected = selectedModule?.id === module.id;
                      const canAccess = canAccessModule(module);
                      return (
                        <button
                          key={module.id}
                          onClick={() => canAccess && setSelectedModule(module)}
                          disabled={!canAccess}
                          className={`w-full text-left p-4 border-b transition-colors ${
                            isSelected
                              ? "bg-primary/10 border-primary"
                              : canAccess
                                ? "hover:bg-muted"
                                : "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {!canAccess ? (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                ) : module.is_preview ? (
                                  <Eye className="h-4 w-4 text-blue-500" />
                                ) : isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Play className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="font-medium text-sm truncate">
                                  {module.title}
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {Math.floor(module.duration / 60)}m
                                {module.is_preview && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-xs"
                                  >
                                    Preview
                                  </Badge>
                                )}
                              </div>
                              {module.progress_percentage > 0 &&
                                module.status !== "completed" && (
                                  <div className="mt-2">
                                    <Progress
                                      value={module.progress_percentage}
                                      className="h-1"
                                    />
                                  </div>
                                )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedModule ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedModule.title}</CardTitle>
                  <p className="text-muted-foreground">
                    {selectedModule.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedModule.video_url && (
                    <div
                      ref={videoContainerRef}
                      className={`relative w-full max-w-full ${
                        isFullscreen
                          ? "fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                          : ""
                      }`}
                    >
                      <div
                        className={`relative ${
                          isFullscreen ? "w-full h-full" : "aspect-video"
                        }`}
                      >
                        <YouTube
                          videoId={getYouTubeVideoId(
                            selectedModule.video_url || ""
                          )}
                          opts={{
                            width: "100%",
                            height: "100%",
                            host: "https://www.youtube-nocookie.com",
                            playerVars: {
                              controls: 0,
                              disablekb: 1,
                              fs: 0,
                              modestbranding: 1,
                              rel: 0,
                              iv_load_policy: 3,
                              showinfo: 0,
                              playsinline: 1,
                              // `loop` + `playlist` intentionally removed —
                              // that combination prevented the player from
                              // ever reaching a real "ended" state, so
                              // onEnd below never fired reliably.
                            },
                          }}
                          onReady={(e) => {
                            playerRef.current = e.target;
                            playerRef.current.setVolume(volume);
                          }}
                          onEnd={handleVideoEnd}
                          className="absolute inset-0"
                        />
                        <div className="absolute inset-0 z-10 bg-transparent pointer-events-auto"></div>
                      </div>

                      <div
                        className={`flex flex-wrap items-center justify-between mt-2 gap-4 ${
                          isFullscreen
                            ? "absolute bottom-4 left-4 right-4 z-[9999] bg-black/50 p-4 rounded-lg"
                            : ""
                        } sm:flex-nowrap`}
                      >
                        <Button
                          size="sm"
                          className="bg-custom-copper hover:bg-custom-copper text-white flex-shrink-0"
                          onClick={() => {
                            if (!playerRef.current) return;
                            if (isPlaying) {
                              playerRef.current.pauseVideo();
                            } else {
                              playerRef.current.playVideo();
                            }
                            setIsPlaying(!isPlaying);
                          }}
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>

                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={progress}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setProgress(val);
                            if (playerRef.current && duration) {
                              playerRef.current.seekTo(
                                (val / 100) * duration,
                                true
                              );
                            }
                          }}
                          className="flex-1 h-1 rounded-lg bg-custom-copper hover:bg-custom-copper accent-primary min-w-[100px]"
                        />

                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={volume}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setVolume(val);
                            if (playerRef.current)
                              playerRef.current.setVolume(val);
                          }}
                          className="w-24 h-1 rounded-lg bg-custom-copper hover:bg-custom-copper accent-primary flex-shrink-0"
                        />

                        <Button
                          size="sm"
                          className="bg-custom-copper hover:bg-custom-copper text-white flex-shrink-0"
                          onClick={toggleFullscreen}
                        >
                          {isFullscreen ? (
                            <Minimize className="h-4 w-4" />
                          ) : (
                            <Maximize className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedModule.content }}
                  />

                  <Button
                    className="bg-custom-copper hover:bg-custom-copper text-white"
                    onClick={handleViewDocumentClick}
                  >
                    View Document
                  </Button>

                  {/* Mark as Complete — explicit fallback so completion
                      doesn't depend solely on the YouTube "ended" event
                      firing (and works for modules with no video at all,
                      which previously had no way to be completed). */}
                  {selectedModule.status !== "completed" ? (
                    <Button
                      onClick={() => markModuleComplete(selectedModule.id)}
                      disabled={updatingProgress}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {updatingProgress ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Marking Complete...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Module Completed
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <p>Select a module to view its content.</p>
            )}

            {progressData.enrollment.progress_percentage === 100 && (
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Training Quiz</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingQuizzes ? (
                      <div className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading quizzes...
                      </div>
                    ) : quizzes.length === 0 ? (
                      <p className="text-muted-foreground">
                        No quizzes available for this training.
                      </p>
                    ) : (
                      <>
                        {currentQuiz ? (
                          <div className="mb-6 border rounded-lg p-4 shadow-sm">
                            <p className="font-medium mb-2">
                              Question {currentQuizIndex + 1} of{" "}
                              {quizzes.length}:
                            </p>
                            <p className="mb-4">{currentQuiz.question_text}</p>
                            <div className="flex flex-col gap-2">
                              {currentQuiz.options.map((option, idx) => {
                                const selected =
                                  quizAnswers[currentQuiz.id] === idx;
                                const showCorrect =
                                  showCorrectAnswers[currentQuiz.id];
                                const isCorrect =
                                  currentQuiz.correct_answer_index === idx;
                                const bgColor = selected
                                  ? isCorrect
                                    ? "bg-green-100 border-green-400"
                                    : "bg-red-100 border-red-400"
                                  : showCorrect && isCorrect
                                    ? "bg-green-50 border-green-300"
                                    : "hover:bg-muted";
                                return (
                                  <button
                                    key={idx}
                                    onClick={() =>
                                      handleAnswerSelect(
                                        currentQuiz.id,
                                        idx,
                                        currentQuiz.correct_answer_index
                                      )
                                    }
                                    disabled={
                                      quizAnswers[currentQuiz.id] !== undefined
                                    }
                                    className={`text-left p-2 border rounded ${bgColor}`}
                                  >
                                    {option}
                                    {selected && isCorrect && (
                                      <span className="ml-2 text-green-700 font-semibold">
                                        ✅
                                      </span>
                                    )}
                                    {selected && !isCorrect && (
                                      <span className="ml-2 text-red-700 font-semibold">
                                        ❌
                                      </span>
                                    )}
                                    {showCorrect && !selected && isCorrect && (
                                      <span className="ml-2 text-green-700 font-semibold">
                                        ✅
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="mt-4 flex justify-between">
                              <Button
                                onClick={handlePrevQuiz}
                                disabled={currentQuizIndex === 0}
                              >
                                Previous
                              </Button>
                              {currentQuizIndex < quizzes.length - 1 ? (
                                <Button onClick={handleNextQuiz}>Next</Button>
                              ) : Object.keys(quizAnswers).length ===
                                quizzes.length ? (
                                <div className="font-semibold text-center">
                                  Your Score: {totalScore} / {quizzes.length} 🎉
                                </div>
                              ) : (
                                <div />
                              )}
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {progressData.enrollment.progress_percentage === 100 && (
              <div id="reviews-section" className="mt-8">
                <ReviewsSection
                  courseId={progressData.enrollment.training_id}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Card className="mt-8 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <CardHeader>
          <CardTitle>Learning Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-custom-brown">
                {progressData.statistics.total_modules}
              </div>
              <div className="text-sm text-muted-foreground">Total Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-charcoal-gray">
                {progressData.statistics.completed_modules}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-light-rose">
                {Math.round(progressData.enrollment.progress_percentage)}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-custom-copper">
                {Math.floor(progressData.statistics.total_time_spent / 60)}h{" "}
                {progressData.statistics.total_time_spent % 60}m
              </div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SiteFooter />
    </div>
  );
}