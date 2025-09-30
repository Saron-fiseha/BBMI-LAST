// // // // "use client";

// // // // import { useEffect, useState } from "react";
// // // // import { useRouter } from "next/navigation";
// // // // import { SiteHeader } from "@/components/site-header";
// // // // import { SiteFooter } from "@/components/site-footer";
// // // // import { Button } from "@/components/ui/button";
// // // // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // // // import { Badge } from "@/components/ui/badge";
// // // // import { Progress } from "@/components/ui/progress";
// // // // import { useAuth } from "@/hooks/use-auth";
// // // // import { useToast } from "@/hooks/use-toast";
// // // // import YouTube from "react-youtube";
// // // // import {
// // // //   Play,
// // // //   CheckCircle,
// // // //   Clock,
// // // //   ArrowLeft,
// // // //   BookOpen,
// // // //   Award,
// // // //   Lock,
// // // //   Eye,
// // // //   Download,
// // // //   Loader2,
// // // //   Trophy,
// // // //   Star,
// // // // } from "lucide-react";
// // // // import Link from "next/link";
// // // // import { Alert, AlertDescription } from "@/components/ui/alert";

// // // // interface Module {
// // // //   id: string;
// // // //   title: string;
// // // //   description: string;
// // // //   content: string;
// // // //   video_url: string | null;
// // // //   duration: number;
// // // //   order_index: number;
// // // //   is_preview: boolean;
// // // //   status: "not_started" | "in_progress" | "completed";
// // // //   progress_percentage: number;
// // // //   time_spent_minutes: number;
// // // // }

// // // // interface Certificate {
// // // //   certificate_number: string;
// // // //   verification_code: string;
// // // //   created_at: string;
// // // //   pdf_url: string;
// // // // }

// // // // interface ProgressData {
// // // //   success: boolean;
// // // //   enrollment: {
// // // //     id: string;
// // // //     training_id: string;
// // // //     status: string;
// // // //     progress_percentage: number;
// // // //     enrolled_at: string;
// // // //     completed_at: string | null;
// // // //     last_accessed: string;
// // // //     certificate_issued: boolean;
// // // //     training_title: string;
// // // //   };
// // // //   modules: Module[];
// // // //   statistics: {
// // // //     total_modules: number;
// // // //     completed_modules: number;
// // // //     in_progress_modules: number;
// // // //     total_time_spent: number;
// // // //     avg_module_progress: number;
// // // //     completion_rate: number;
// // // //   };
// // // //   certificate: Certificate | null;
// // // // }

// // // // export default function ModulesPage({
// // // //   params,
// // // // }: {
// // // //   params: Promise<{ id: string }>;
// // // // }) {
// // // //   const [progressData, setProgressData] = useState<ProgressData | null>(null);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const [selectedModule, setSelectedModule] = useState<Module | null>(null);
// // // //   const [updatingProgress, setUpdatingProgress] = useState(false);
// // // //   const [downloadingCertificate, setDownloadingCertificate] = useState(false);
// // // //   const [showCertificateAlert, setShowCertificateAlert] = useState(false);

// // // //   const { user, isAuthenticated } = useAuth();
// // // //   const { toast } = useToast();
// // // //   const router = useRouter();

// // // //   useEffect(() => {
// // // //     const fetchProgressData = async () => {
// // // //       if (!isAuthenticated) {
// // // //         router.push("/login");
// // // //         return;
// // // //       }

// // // //       try {
// // // //         setLoading(true);
// // // //         const resolvedParams = await params;
// // // //         const response = await fetch(`/api/progress/${resolvedParams.id}`, {
// // // //           headers: {
// // // //             Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
// // // //           },
// // // //         });

// // // //         if (!response.ok) {
// // // //           if (response.status === 403) {
// // // //             router.push(`/courses/${resolvedParams.id}`);
// // // //             return;
// // // //           }
// // // //           throw new Error("Failed to fetch progress data");
// // // //         }

// // // //         const data = await response.json();
// // // //         console.log("Progress data received:", data);
// // // //         setProgressData(data);

// // // //         // Show certificate alert if training is completed
// // // //         if (data.enrollment.status === "completed" && data.certificate) {
// // // //           setShowCertificateAlert(true);
// // // //         }

// // // //         // Set first available module as selected
// // // //         if (data.modules && data.modules.length > 0) {
// // // //           const firstAvailableModule = data.modules.find(
// // // //             (module: Module) =>
// // // //               module.is_preview ||
// // // //               module.status === "completed" ||
// // // //               data.modules
// // // //                 .filter((m: Module) => m.order_index < module.order_index)
// // // //                 .every((m: Module) => m.status === "completed")
// // // //           );
// // // //           setSelectedModule(firstAvailableModule || data.modules[0]);
// // // //         }
// // // //       } catch (err) {
// // // //         console.error("Error fetching progress data:", err);
// // // //         setError(
// // // //           err instanceof Error ? err.message : "Failed to load training data"
// // // //         );
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     fetchProgressData();
// // // //   }, [params, isAuthenticated, router]);

// // // //   const getYouTubeVideoId = (url: string): string => {
// // // //     const trimmed = url.trim();

// // // //     // If it's exactly 11 characters and matches YouTube video ID pattern, return as-is
// // // //     if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
// // // //       return trimmed;
// // // //     }
// // // //     // Else, try to extract from full or short YouTube URL
// // // //     const regex =
// // // //       /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|embed|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
// // // //     const match = url.match(regex);
// // // //     return match ? match[1] : "";
// // // //   };

// // // //   const canAccessModule = (module: Module): boolean => {
// // // //     if (!progressData) return false;

// // // //     return (
// // // //       module.is_preview ||
// // // //       module.status === "completed" ||
// // // //       progressData.modules
// // // //         .filter((m) => m.order_index < module.order_index)
// // // //         .every((m) => m.status === "completed")
// // // //     );
// // // //   };

// // // //   const markModuleComplete = async (moduleId: string) => {
// // // //     if (!progressData || updatingProgress) return;

// // // //     setUpdatingProgress(true);
// // // //     try {
// // // //       console.log("Marking module complete:", moduleId);

// // // //       const response = await fetch("/api/progress/update", {
// // // //         method: "POST",
// // // //         headers: {
// // // //           "Content-Type": "application/json",
// // // //           Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
// // // //         },
// // // //         body: JSON.stringify({
// // // //           trainingId: progressData.enrollment.training_id,
// // // //           moduleId,
// // // //           status: "completed",
// // // //           progressPercentage: 100,
// // // //           timeSpent: 5,
// // // //         }),
// // // //       });

// // // //       const data = await response.json();
// // // //       console.log("Progress update response:", data);

// // // //       if (data.success) {
// // // //         // Update local state
// // // //         setProgressData((prev) => {
// // // //           if (!prev) return prev;

// // // //           const updatedModules = prev.modules.map((module) =>
// // // //             module.id === moduleId
// // // //               ? {
// // // //                   ...module,
// // // //                   status: "completed" as const,
// // // //                   progress_percentage: 100,
// // // //                 }
// // // //               : module
// // // //           );

// // // //           return {
// // // //             ...prev,
// // // //             modules: updatedModules,
// // // //             enrollment: {
// // // //               ...prev.enrollment,
// // // //               progress_percentage:
// // // //                 data.overallProgress || prev.enrollment.progress_percentage,
// // // //               status: data.trainingCompleted
// // // //                 ? "completed"
// // // //                 : prev.enrollment.status,
// // // //               certificate_issued:
// // // //                 data.certificateGenerated || prev.enrollment.certificate_issued,
// // // //             },
// // // //             statistics: {
// // // //               ...prev.statistics,
// // // //               completed_modules:
// // // //                 data.completedModules || prev.statistics.completed_modules,
// // // //               completion_rate:
// // // //                 data.overallProgress || prev.statistics.completion_rate,
// // // //             },
// // // //           };
// // // //         });

// // // //         toast({
// // // //           title: "Module Completed! ✅",
// // // //           description: "Great progress! Keep learning.",
// // // //         });

// // // //         if (data.trainingCompleted) {
// // // //           toast({
// // // //             title: "🎉 Training Completed!",
// // // //             description: data.certificateGenerated
// // // //               ? "Congratulations! Your certificate has been generated."
// // // //               : "Congratulations! Training completed successfully.",
// // // //           });

// // // //           if (data.certificateGenerated) {
// // // //             setShowCertificateAlert(true);
// // // //             // Refresh data to get certificate after a short delay
// // // //             setTimeout(() => {
// // // //               window.location.reload();
// // // //             }, 2000);
// // // //           }
// // // //         }
// // // //       } else {
// // // //         throw new Error(data.message || "Failed to update progress");
// // // //       }
// // // //     } catch (error) {
// // // //       console.error("Error updating progress:", error);
// // // //       toast({
// // // //         title: "Error",
// // // //         description:
// // // //           error instanceof Error ? error.message : "Failed to update progress",
// // // //         variant: "destructive",
// // // //       });
// // // //     } finally {
// // // //       setUpdatingProgress(false);
// // // //     }
// // // //   };

// // // //   const handleVideoEnd = async () => {
// // // //     if (
// // // //       selectedModule &&
// // // //       selectedModule.status !== "completed" &&
// // // //       !updatingProgress
// // // //     ) {
// // // //       console.log("Video ended, marking module complete");
// // // //       await markModuleComplete(selectedModule.id);
// // // //     }
// // // //   };

// // // //   const downloadCertificate = async () => {
// // // //     if (!progressData?.certificate) return;

// // // //     setDownloadingCertificate(true);
// // // //     try {
// // // //       const response = await fetch("/api/certificates/generate-pdf", {
// // // //         method: "POST",
// // // //         headers: {
// // // //           "Content-Type": "application/json",
// // // //         },
// // // //         body: JSON.stringify({
// // // //           studentName: user?.full_name || user?.full_name || "Student",
// // // //           courseName: progressData.enrollment.training_title,
// // // //           instructorName: "Ms Betelhem",
// // // //           completionDate: new Date(
// // // //             progressData.certificate.created_at
// // // //           ).toLocaleDateString("en-US", {
// // // //             year: "numeric",
// // // //             month: "long",
// // // //             day: "numeric",
// // // //           }),
// // // //           certificateId: progressData.certificate.certificate_number,
// // // //           trainingDescription: `professional ${progressData.enrollment.training_title.toLowerCase()} techniques`,
// // // //         }),
// // // //       });

// // // //       if (!response.ok) {
// // // //         throw new Error("Failed to generate certificate");
// // // //       }

// // // //       const htmlContent = await response.text();

// // // //       // Open certificate in new window for printing/saving
// // // //       const newWindow = window.open("", "_blank");
// // // //       if (newWindow) {
// // // //         newWindow.document.write(htmlContent);
// // // //         newWindow.document.close();

// // // //         // Trigger print dialog after content loads
// // // //         newWindow.onload = () => {
// // // //           setTimeout(() => {
// // // //             newWindow.print();
// // // //           }, 500);
// // // //         };
// // // //       }

// // // //       toast({
// // // //         title: "Certificate Generated! 🎓",
// // // //         description:
// // // //           "Your BBMI certificate has been opened in a new window. You can print or save it as PDF.",
// // // //       });
// // // //     } catch (error) {
// // // //       console.error("Certificate download error:", error);
// // // //       toast({
// // // //         title: "Download Failed",
// // // //         description:
// // // //           error instanceof Error
// // // //             ? error.message
// // // //             : "Failed to generate certificate",
// // // //         variant: "destructive",
// // // //       });
// // // //     } finally {
// // // //       setDownloadingCertificate(false);
// // // //     }
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="min-h-screen flex flex-col">
// // // //         <SiteHeader />
// // // //         <main className="flex-1 flex items-center justify-center">
// // // //           <div className="text-center">
// // // //             <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
// // // //             <p>Loading training modules...</p>
// // // //           </div>
// // // //         </main>
// // // //         <SiteFooter />
// // // //       </div>
// // // //     );
// // // //   }

// // // //   if (error || !progressData) {
// // // //     return (
// // // //       <div className="min-h-screen flex flex-col">
// // // //         <SiteHeader />
// // // //         <main className="flex-1 flex items-center justify-center">
// // // //           <Card className="w-full max-w-md">
// // // //             <CardContent className="pt-6 text-center">
// // // //               <p className="text-destructive mb-4">
// // // //                 {error || "Training data not found"}
// // // //               </p>
// // // //               <Button asChild>
// // // //                 <Link href="/courses">Back to Courses</Link>
// // // //               </Button>
// // // //             </CardContent>
// // // //           </Card>
// // // //         </main>
// // // //         <SiteFooter />
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="min-h-screen flex flex-col">
// // // //       <SiteHeader />
// // // //       <main className="flex-1">
// // // //         {/* Certificate Completion Alert */}
// // // //         {showCertificateAlert && progressData.certificate && (
// // // //           <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
// // // //             <div className="container py-4">
// // // //               <Alert className="border-yellow-300 bg-yellow-50">
// // // //                 <Trophy className="h-5 w-5 text-yellow-600" />
// // // //                 <AlertDescription className="text-yellow-800">
// // // //                   <div className="flex items-center justify-between">
// // // //                     <div>
// // // //                       <strong>🎉 Congratulations!</strong> You have successfully
// // // //                       completed the training and earned your BBMI certificate!
// // // //                     </div>
// // // //                     <Button
// // // //                       onClick={downloadCertificate}
// // // //                       disabled={downloadingCertificate}
// // // //                       className="bg-yellow-600 hover:bg-yellow-700 text-white ml-4"
// // // //                       size="sm"
// // // //                     >
// // // //                       {downloadingCertificate ? (
// // // //                         <>
// // // //                           <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// // // //                           Generating...
// // // //                         </>
// // // //                       ) : (
// // // //                         <>
// // // //                           <Download className="h-4 w-4 mr-2" />
// // // //                           Download Certificate
// // // //                         </>
// // // //                       )}
// // // //                     </Button>
// // // //                   </div>
// // // //                 </AlertDescription>
// // // //               </Alert>
// // // //             </div>
// // // //           </div>
// // // //         )}

// // // //         {/* Header Section */}
// // // //         <div className="bg-muted py-8">
// // // //           <div className="container">
// // // //             <Button variant="ghost" asChild className="mb-4">
// // // //               <Link href={`/courses/${progressData.enrollment.training_id}`}>
// // // //                 <ArrowLeft className="h-4 w-4 mr-2" />
// // // //                 Back to Course
// // // //               </Link>
// // // //             </Button>

// // // //             <div className="flex items-start justify-between">
// // // //               <div className="flex-1">
// // // //                 <h1 className="text-3xl font-bold mb-2">
// // // //                   {progressData.enrollment.training_title}
// // // //                 </h1>

// // // //                 <div className="flex items-center gap-4 mb-4">
// // // //                   <Badge
// // // //                     variant={
// // // //                       progressData.enrollment.status === "completed"
// // // //                         ? "default"
// // // //                         : "secondary"
// // // //                     }
// // // //                   >
// // // //                     {progressData.enrollment.status === "completed" ? (
// // // //                       <div className="flex items-center">
// // // //                         <Star className="h-3 w-3 mr-1" />
// // // //                         Completed
// // // //                       </div>
// // // //                     ) : (
// // // //                       progressData.enrollment.status
// // // //                     )}
// // // //                   </Badge>
// // // //                   <div className="flex items-center text-sm text-muted-foreground">
// // // //                     <BookOpen className="h-4 w-4 mr-1" />
// // // //                     {progressData.statistics.completed_modules} of{" "}
// // // //                     {progressData.statistics.total_modules} modules completed
// // // //                   </div>
// // // //                 </div>

// // // //                 <div className="max-w-md">
// // // //                   <div className="flex justify-between text-sm mb-2">
// // // //                     <span>Overall Progress</span>
// // // //                     <span>
// // // //                       {Math.round(progressData.enrollment.progress_percentage)}%
// // // //                     </span>
// // // //                   </div>
// // // //                   <Progress
// // // //                     value={progressData.enrollment.progress_percentage}
// // // //                     className="h-2"
// // // //                   />
// // // //                 </div>
// // // //               </div>

// // // //               {/* Certificate Section */}
// // // //               {progressData.certificate && (
// // // //                 <div className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
// // // //                   <div className="relative">
// // // //                     <Award className="h-16 w-16 text-yellow-500 mx-auto mb-3" />
// // // //                     <div className="absolute -top-1 -right-1">
// // // //                       <Star className="h-6 w-6 text-yellow-400 fill-current" />
// // // //                     </div>
// // // //                   </div>
// // // //                   <h3 className="font-bold text-lg text-yellow-800 mb-1">
// // // //                     Training Completed!
// // // //                   </h3>
// // // //                   <p className="text-sm text-yellow-700 mb-3">
// // // //                     Certificate #{progressData.certificate.certificate_number}
// // // //                   </p>
// // // //                   <Button
// // // //                     onClick={downloadCertificate}
// // // //                     disabled={downloadingCertificate}
// // // //                     className="bg-yellow-600 hover:bg-yellow-700 text-white"
// // // //                     size="sm"
// // // //                   >
// // // //                     {downloadingCertificate ? (
// // // //                       <>
// // // //                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// // // //                         Generating...
// // // //                       </>
// // // //                     ) : (
// // // //                       <>
// // // //                         <Award className="h-4 w-4 mr-2" />
// // // //                         View Certificate
// // // //                       </>
// // // //                     )}
// // // //                   </Button>
// // // //                 </div>
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //         </div>

// // // //         {/* Content Section */}
// // // //         <div className="container py-8">
// // // //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// // // //             {/* Modules Sidebar */}
// // // //             <div className="lg:col-span-1">
// // // //               <Card>
// // // //                 <CardHeader>
// // // //                   <CardTitle className="flex items-center">
// // // //                     <BookOpen className="h-5 w-5 mr-2" />
// // // //                     Training Modules
// // // //                   </CardTitle>
// // // //                 </CardHeader>
// // // //                 <CardContent className="p-0">
// // // //                   <div className="space-y-1">
// // // //                     {progressData.modules
// // // //                       .sort((a, b) => a.order_index - b.order_index)
// // // //                       .map((module) => {
// // // //                         const isCompleted = module.status === "completed";
// // // //                         const isSelected = selectedModule?.id === module.id;
// // // //                         const canAccess = canAccessModule(module);

// // // //                         return (
// // // //                           <button
// // // //                             key={module.id}
// // // //                             onClick={() =>
// // // //                               canAccess && setSelectedModule(module)
// // // //                             }
// // // //                             disabled={!canAccess}
// // // //                             className={`w-full text-left p-4 border-b transition-colors ${
// // // //                               isSelected
// // // //                                 ? "bg-primary/10 border-primary"
// // // //                                 : canAccess
// // // //                                   ? "hover:bg-muted"
// // // //                                   : "opacity-50 cursor-not-allowed"
// // // //                             }`}
// // // //                           >
// // // //                             <div className="flex items-start justify-between">
// // // //                               <div className="flex-1 min-w-0">
// // // //                                 <div className="flex items-center gap-2 mb-1">
// // // //                                   {!canAccess ? (
// // // //                                     <Lock className="h-4 w-4 text-muted-foreground" />
// // // //                                   ) : module.is_preview ? (
// // // //                                     <Eye className="h-4 w-4 text-blue-500" />
// // // //                                   ) : isCompleted ? (
// // // //                                     <CheckCircle className="h-4 w-4 text-green-500" />
// // // //                                   ) : (
// // // //                                     <Play className="h-4 w-4 text-muted-foreground" />
// // // //                                   )}
// // // //                                   <span className="font-medium text-sm truncate">
// // // //                                     {module.title}
// // // //                                   </span>
// // // //                                 </div>
// // // //                                 <div className="flex items-center text-xs text-muted-foreground">
// // // //                                   <Clock className="h-3 w-3 mr-1" />
// // // //                                   {Math.floor(module.duration / 60)}m
// // // //                                   {module.is_preview && (
// // // //                                     <Badge
// // // //                                       variant="outline"
// // // //                                       className="ml-2 text-xs"
// // // //                                     >
// // // //                                       Preview
// // // //                                     </Badge>
// // // //                                   )}
// // // //                                 </div>
// // // //                                 {module.progress_percentage > 0 &&
// // // //                                   module.status !== "completed" && (
// // // //                                     <div className="mt-2">
// // // //                                       <Progress
// // // //                                         value={module.progress_percentage}
// // // //                                         className="h-1"
// // // //                                       />
// // // //                                     </div>
// // // //                                   )}
// // // //                               </div>
// // // //                             </div>
// // // //                           </button>
// // // //                         );
// // // //                       })}
// // // //                   </div>
// // // //                 </CardContent>
// // // //               </Card>
// // // //             </div>

// // // //             {/* Module Content */}
// // // //             <div className="lg:col-span-2">
// // // //               {selectedModule ? (
// // // //                 <Card>
// // // //                   <CardHeader>
// // // //                     <div className="flex items-start justify-between">
// // // //                       <div>
// // // //                         <CardTitle className="mb-2">
// // // //                           {selectedModule.title}
// // // //                         </CardTitle>
// // // //                         <p className="text-muted-foreground">
// // // //                           {selectedModule.description}
// // // //                         </p>
// // // //                       </div>
// // // //                       <div className="flex items-center gap-2">
// // // //                         <Clock className="h-4 w-4 text-muted-foreground" />
// // // //                         <span className="text-sm text-muted-foreground">
// // // //                           {Math.floor(selectedModule.duration / 60)} minutes
// // // //                         </span>
// // // //                       </div>
// // // //                     </div>
// // // //                   </CardHeader>
// // // //                   <CardContent>
// // // //                     {/* Video Player */}
// // // //                     {selectedModule.video_url?.trim() && (
// // // //                       <div className="aspect-video rounded-lg mb-6 overflow-hidden">
// // // //                         <YouTube
// // // //                           videoId={getYouTubeVideoId(selectedModule.video_url)}
// // // //                           className="w-full h-full"
// // // //                           onEnd={handleVideoEnd}
// // // //                           opts={{
// // // //                             width: "100%",
// // // //                             height: "100%",
// // // //                             playerVars: {
// // // //                               autoplay: 0,
// // // //                               controls: 1,
// // // //                               rel: 0,
// // // //                             },
// // // //                           }}
// // // //                         />
// // // //                       </div>
// // // //                     )}

// // // //                     {/* Module Content */}
// // // //                     <div className="prose max-w-none mb-6">
// // // //                       <div
// // // //                         dangerouslySetInnerHTML={{
// // // //                           __html: selectedModule.content,
// // // //                         }}
// // // //                       />
// // // //                     </div>

// // // //                     {/* Module Status */}
// // // //                     <div className="flex justify-between items-center pt-6 border-t">
// // // //                       <div className="text-sm text-muted-foreground">
// // // //                         {selectedModule.status === "completed" ? (
// // // //                           <div className="flex items-center text-green-600">
// // // //                             <CheckCircle className="h-4 w-4 mr-2" />
// // // //                             Module completed
// // // //                           </div>
// // // //                         ) : selectedModule.is_preview ? (
// // // //                           "Preview module - no progress tracking"
// // // //                         ) : (
// // // //                           `Progress: ${selectedModule.progress_percentage}%`
// // // //                         )}
// // // //                       </div>

// // // //                       {!selectedModule.is_preview &&
// // // //                         selectedModule.status !== "completed" && (
// // // //                           <Button
// // // //                             onClick={() =>
// // // //                               markModuleComplete(selectedModule.id)
// // // //                             }
// // // //                             disabled={updatingProgress}
// // // //                           >
// // // //                             {updatingProgress ? (
// // // //                               <>
// // // //                                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// // // //                                 Updating...
// // // //                               </>
// // // //                             ) : (
// // // //                               "Mark Complete"
// // // //                             )}
// // // //                           </Button>
// // // //                         )}
// // // //                     </div>
// // // //                   </CardContent>
// // // //                 </Card>
// // // //               ) : (
// // // //                 <Card>
// // // //                   <CardContent className="pt-6 text-center">
// // // //                     <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
// // // //                     <h3 className="text-lg font-medium mb-2">
// // // //                       Select a Module
// // // //                     </h3>
// // // //                     <p className="text-muted-foreground">
// // // //                       Choose a module from the sidebar to start learning.
// // // //                     </p>
// // // //                   </CardContent>
// // // //                 </Card>
// // // //               )}
// // // //             </div>
// // // //           </div>

// // // //           {/* Statistics Card */}
// // // //           <Card className="mt-8">
// // // //             <CardHeader>
// // // //               <CardTitle>Learning Statistics</CardTitle>
// // // //             </CardHeader>
// // // //             <CardContent>
// // // //               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// // // //                 <div className="text-center">
// // // //                   <div className="text-2xl font-bold text-blue-600">
// // // //                     {progressData.statistics.total_modules}
// // // //                   </div>
// // // //                   <div className="text-sm text-muted-foreground">
// // // //                     Total Modules
// // // //                   </div>
// // // //                 </div>
// // // //                 <div className="text-center">
// // // //                   <div className="text-2xl font-bold text-green-600">
// // // //                     {progressData.statistics.completed_modules}
// // // //                   </div>
// // // //                   <div className="text-sm text-muted-foreground">Completed</div>
// // // //                 </div>
// // // //                 <div className="text-center">
// // // //                   <div className="text-2xl font-bold text-purple-600">
// // // //                     {Math.round(progressData.enrollment.progress_percentage)}%
// // // //                   </div>
// // // //                   <div className="text-sm text-muted-foreground">Progress</div>
// // // //                 </div>
// // // //                 <div className="text-center">
// // // //                   <div className="text-2xl font-bold text-orange-600">
// // // //                     {Math.floor(progressData.statistics.total_time_spent / 60)}h{" "}
// // // //                     {progressData.statistics.total_time_spent % 60}m
// // // //                   </div>
// // // //                   <div className="text-sm text-muted-foreground">
// // // //                     Time Spent
// // // //                   </div>
// // // //                 </div>
// // // //               </div>
// // // //             </CardContent>
// // // //           </Card>
// // // //         </div>
// // // //       </main>
// // // //       <SiteFooter />
// // // //     </div>
// // // //   );
// // // // }

// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import { useRouter } from "next/navigation";
// // // import { SiteHeader } from "@/components/site-header";
// // // import { SiteFooter } from "@/components/site-footer";
// // // import { Button } from "@/components/ui/button";
// // // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // // import { Badge } from "@/components/ui/badge";
// // // import { Progress } from "@/components/ui/progress";
// // // import { useAuth } from "@/hooks/use-auth";
// // // import { useToast } from "@/hooks/use-toast";
// // // import YouTube from "react-youtube";
// // // import {
// // //   Play,
// // //   CheckCircle,
// // //   Clock,
// // //   ArrowLeft,
// // //   BookOpen,
// // //   Award,
// // //   Lock,
// // //   Eye,
// // //   Download,
// // //   Loader2,
// // //   Trophy,
// // //   Star,
// // //   FileText, // Import FileText icon
// // //   X, // Import X icon
// // // } from "lucide-react";
// // // import Link from "next/link";
// // // import { Alert, AlertDescription } from "@/components/ui/alert";

// // // // Interface for the document
// // // interface Document {
// // //   id: string;
// // //   file_name: string;
// // //   file_url: string;
// // // }

// // // interface Module {
// // //   id: string;
// // //   title: string;
// // //   description: string;
// // //   content: string;
// // //   video_url: string | null;
// // //   duration: number;
// // //   order_index: number;
// // //   is_preview: boolean;
// // //   status: "not_started" | "in_progress" | "completed";
// // //   progress_percentage: number;
// // //   time_spent_minutes: number;
// // //   document: Document | null; // Add document to module
// // // }

// // // interface Certificate {
// // //   certificate_number: string;
// // //   verification_code: string;
// // //   created_at: string;
// // //   pdf_url: string;
// // // }

// // // interface ProgressData {
// // //   success: boolean;
// // //   enrollment: {
// // //     id: string;
// // //     training_id: string;
// // //     status: string;
// // //     progress_percentage: number;
// // //     enrolled_at: string;
// // //     completed_at: string | null;
// // //     last_accessed: string;
// // //     certificate_issued: boolean;
// // //     training_title: string;
// // //   };
// // //   modules: Module[];
// // //   statistics: {
// // //     total_modules: number;
// // //     completed_modules: number;
// // //     in_progress_modules: number;
// // //     total_time_spent: number;
// // //     avg_module_progress: number;
// // //     completion_rate: number;
// // //   };
// // //   certificate: Certificate | null;
// // // }

// // // // DocumentViewer component
// // // const DocumentViewer = ({
// // //   document,
// // //   onClose,
// // // }: {
// // //   document: Document;
// // //   onClose: () => void;
// // // }) => {
// // //   useEffect(() => {
// // //     const handleContextMenu = (e: MouseEvent) => e.preventDefault();
// // //     const handleKeyDown = (e: KeyboardEvent) => {
// // //       if (e.key === "PrintScreen") {
// // //         e.preventDefault();
// // //       }
// // //     };

// // //     window.addEventListener("contextmenu", handleContextMenu);
// // //     window.addEventListener("keydown", handleKeyDown);

// // //     return () => {
// // //       window.removeEventListener("contextmenu", handleContextMenu);
// // //       window.removeEventListener("keydown", handleKeyDown);
// // //     };
// // //   }, []);

// // //   return (
// // //     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
// // //       <div className="bg-white rounded-lg w-11/12 h-5/6 relative flex flex-col">
// // //         <div className="flex justify-between items-center p-4 border-b">
// // //           <h2 className="text-lg font-semibold">{document.file_name}</h2>
// // //           <Button variant="ghost" size="icon" onClick={onClose}>
// // //             <X className="h-6 w-6" />
// // //           </Button>
// // //         </div>
// // //         <div className="flex-1 p-4 overflow-hidden relative">
// // //           <iframe
// // //             src={document.file_url}
// // //             className="w-full h-full border-0"
// // //             title={document.file_name}
// // //           ></iframe>
// // //           <div className="absolute inset-0 bg-transparent"></div>{" "}
// // //           {/* Screenshot prevention overlay */}
// // //         </div>
// // //         <div className="p-4 border-t text-center text-sm text-muted-foreground">
// // //           This document is read-only. Downloading and screenshots are disabled.
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default function ModulesPage({
// // //   params,
// // // }: {
// // //   params: Promise<{ id: string }>;
// // // }) {
// // //   const [progressData, setProgressData] = useState<ProgressData | null>(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string | null>(null);
// // //   const [selectedModule, setSelectedModule] = useState<Module | null>(null);
// // //   const [updatingProgress, setUpdatingProgress] = useState(false);
// // //   const [downloadingCertificate, setDownloadingCertificate] = useState(false);
// // //   const [showCertificateAlert, setShowCertificateAlert] = useState(false);
// // //   const [showDocumentViewer, setShowDocumentViewer] = useState(false); // State for document viewer

// // //   const { user, isAuthenticated } = useAuth();
// // //   const { toast } = useToast();
// // //   const router = useRouter();

// // //   useEffect(() => {
// // //     const fetchProgressData = async () => {
// // //       if (!isAuthenticated) {
// // //         router.push("/login");
// // //         return;
// // //       }

// // //       try {
// // //         setLoading(true);
// // //         const resolvedParams = await params;
// // //         const response = await fetch(`/api/progress/${resolvedParams.id}`, {
// // //           headers: {
// // //             Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
// // //           },
// // //         });

// // //         if (!response.ok) {
// // //           if (response.status === 403) {
// // //             router.push(`/courses/${resolvedParams.id}`);
// // //             return;
// // //           }
// // //           throw new Error("Failed to fetch progress data");
// // //         }

// // //         const data = await response.json();
// // //         console.log("Progress data received:", data);
// // //         setProgressData(data);

// // //         // Show certificate alert if training is completed
// // //         if (data.enrollment.status === "completed" && data.certificate) {
// // //           setShowCertificateAlert(true);
// // //         }

// // //         // Set first available module as selected
// // //         if (data.modules && data.modules.length > 0) {
// // //           const firstAvailableModule = data.modules.find(
// // //             (module: Module) =>
// // //               module.is_preview ||
// // //               module.status === "completed" ||
// // //               data.modules
// // //                 .filter((m: Module) => m.order_index < module.order_index)
// // //                 .every((m: Module) => m.status === "completed")
// // //           );
// // //           setSelectedModule(firstAvailableModule || data.modules[0]);
// // //         }
// // //       } catch (err) {
// // //         console.error("Error fetching progress data:", err);
// // //         setError(
// // //           err instanceof Error ? err.message : "Failed to load training data"
// // //         );
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     fetchProgressData();
// // //   }, [params, isAuthenticated, router]);

// // //   const getYouTubeVideoId = (url: string): string => {
// // //     const trimmed = url.trim();

// // //     // If it's exactly 11 characters and matches YouTube video ID pattern, return as-is
// // //     if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
// // //       return trimmed;
// // //     }
// // //     // Else, try to extract from full or short YouTube URL
// // //     const regex =
// // //       /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|embed|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
// // //     const match = url.match(regex);
// // //     return match ? match[1] : "";
// // //   };

// // //   const canAccessModule = (module: Module): boolean => {
// // //     if (!progressData) return false;

// // //     return (
// // //       module.is_preview ||
// // //       module.status === "completed" ||
// // //       progressData.modules
// // //         .filter((m) => m.order_index < module.order_index)
// // //         .every((m) => m.status === "completed")
// // //     );
// // //   };

// // //   const markModuleComplete = async (moduleId: string) => {
// // //     if (!progressData || updatingProgress) return;

// // //     setUpdatingProgress(true);
// // //     try {
// // //       console.log("Marking module complete:", moduleId);

// // //       const response = await fetch("/api/progress/update", {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
// // //         },
// // //         body: JSON.stringify({
// // //           trainingId: progressData.enrollment.training_id,
// // //           moduleId,
// // //           status: "completed",
// // //           progressPercentage: 100,
// // //           timeSpent: 5,
// // //         }),
// // //       });

// // //       const data = await response.json();
// // //       console.log("Progress update response:", data);

// // //       if (data.success) {
// // //         // Update local state
// // //         setProgressData((prev) => {
// // //           if (!prev) return prev;

// // //           const updatedModules = prev.modules.map((module) =>
// // //             module.id === moduleId
// // //               ? {
// // //                   ...module,
// // //                   status: "completed" as const,
// // //                   progress_percentage: 100,
// // //                 }
// // //               : module
// // //           );

// // //           return {
// // //             ...prev,
// // //             modules: updatedModules,
// // //             enrollment: {
// // //               ...prev.enrollment,
// // //               progress_percentage:
// // //                 data.overallProgress || prev.enrollment.progress_percentage,
// // //               status: data.trainingCompleted
// // //                 ? "completed"
// // //                 : prev.enrollment.status,
// // //               certificate_issued:
// // //                 data.certificateGenerated || prev.enrollment.certificate_issued,
// // //             },
// // //             statistics: {
// // //               ...prev.statistics,
// // //               completed_modules:
// // //                 data.completedModules || prev.statistics.completed_modules,
// // //               completion_rate:
// // //                 data.overallProgress || prev.statistics.completion_rate,
// // //             },
// // //           };
// // //         });

// // //         toast({
// // //           title: "Module Completed! ✅",
// // //           description: "Great progress! Keep learning.",
// // //         });

// // //         if (data.trainingCompleted) {
// // //           toast({
// // //             title: "🎉 Training Completed!",
// // //             description: data.certificateGenerated
// // //               ? "Congratulations! Your certificate has been generated."
// // //               : "Congratulations! Training completed successfully.",
// // //           });

// // //           if (data.certificateGenerated) {
// // //             setShowCertificateAlert(true);
// // //             // Refresh data to get certificate after a short delay
// // //             setTimeout(() => {
// // //               window.location.reload();
// // //             }, 2000);
// // //           }
// // //         }
// // //       } else {
// // //         throw new Error(data.message || "Failed to update progress");
// // //       }
// // //     } catch (error) {
// // //       console.error("Error updating progress:", error);
// // //       toast({
// // //         title: "Error",
// // //         description:
// // //           error instanceof Error ? error.message : "Failed to update progress",
// // //         variant: "destructive",
// // //       });
// // //     } finally {
// // //       setUpdatingProgress(false);
// // //     }
// // //   };

// // //   const handleVideoEnd = async () => {
// // //     if (
// // //       selectedModule &&
// // //       selectedModule.status !== "completed" &&
// // //       !updatingProgress
// // //     ) {
// // //       console.log("Video ended, marking module complete");
// // //       await markModuleComplete(selectedModule.id);
// // //     }
// // //   };

// // //   const downloadCertificate = async () => {
// // //     if (!progressData?.certificate) return;

// // //     setDownloadingCertificate(true);
// // //     try {
// // //       const response = await fetch("/api/certificates/generate-pdf", {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //         },
// // //         body: JSON.stringify({
// // //           studentName: user?.full_name || user?.full_name || "Student",
// // //           courseName: progressData.enrollment.training_title,
// // //           instructorName: "Ms Betelhem",
// // //           completionDate: new Date(
// // //             progressData.certificate.created_at
// // //           ).toLocaleDateString("en-US", {
// // //             year: "numeric",
// // //             month: "long",
// // //             day: "numeric",
// // //           }),
// // //           certificateId: progressData.certificate.certificate_number,
// // //           trainingDescription: `professional ${progressData.enrollment.training_title.toLowerCase()} techniques`,
// // //         }),
// // //       });

// // //       if (!response.ok) {
// // //         throw new Error("Failed to generate certificate");
// // //       }

// // //       const htmlContent = await response.text();

// // //       // Open certificate in new window for printing/saving
// // //       const newWindow = window.open("", "_blank");
// // //       if (newWindow) {
// // //         newWindow.document.write(htmlContent);
// // //         newWindow.document.close();

// // //         // Trigger print dialog after content loads
// // //         newWindow.onload = () => {
// // //           setTimeout(() => {
// // //             newWindow.print();
// // //           }, 500);
// // //         };
// // //       }

// // //       toast({
// // //         title: "Certificate Generated! 🎓",
// // //         description:
// // //           "Your BBMI certificate has been opened in a new window. You can print or save it as PDF.",
// // //       });
// // //     } catch (error) {
// // //       console.error("Certificate download error:", error);
// // //       toast({
// // //         title: "Download Failed",
// // //         description:
// // //           error instanceof Error
// // //             ? error.message
// // //             : "Failed to generate certificate",
// // //         variant: "destructive",
// // //       });
// // //     } finally {
// // //       setDownloadingCertificate(false);
// // //     }
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="min-h-screen flex flex-col">
// // //         <SiteHeader />
// // //         <main className="flex-1 flex items-center justify-center">
// // //           <div className="text-center">
// // //             <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
// // //             <p>Loading training modules...</p>
// // //           </div>
// // //         </main>
// // //         <SiteFooter />
// // //       </div>
// // //     );
// // //   }

// // //   if (error || !progressData) {
// // //     return (
// // //       <div className="min-h-screen flex flex-col">
// // //         <SiteHeader />
// // //         <main className="flex-1 flex items-center justify-center">
// // //           <Card className="w-full max-w-md">
// // //             <CardContent className="pt-6 text-center">
// // //               <p className="text-destructive mb-4">
// // //                 {error || "Training data not found"}
// // //               </p>
// // //               <Button asChild>
// // //                 <Link href="/courses">Back to Courses</Link>
// // //               </Button>
// // //             </CardContent>
// // //           </Card>
// // //         </main>
// // //         <SiteFooter />
// // //       </div>
// // //     );
// // //   }

// // //   // Functions to handle document viewer
// // //   const openDocumentViewer = () => setShowDocumentViewer(true);
// // //   const closeDocumentViewer = () => setShowDocumentViewer(false);

// // //   return (
// // //     <div className="min-h-screen flex flex-col">
// // //       <SiteHeader />

// // //       {/* Document Viewer Modal */}
// // //       {showDocumentViewer && selectedModule?.document && (
// // //         <DocumentViewer
// // //           document={selectedModule.document}
// // //           onClose={closeDocumentViewer}
// // //         />
// // //       )}

// // //       <main className="flex-1">
// // //         {/* Certificate Completion Alert */}
// // //         {showCertificateAlert && progressData.certificate && (
// // //           <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
// // //             <div className="container py-4">
// // //               <Alert className="border-yellow-300 bg-yellow-50">
// // //                 <Trophy className="h-5 w-5 text-yellow-600" />
// // //                 <AlertDescription className="text-yellow-800">
// // //                   <div className="flex items-center justify-between">
// // //                     <div>
// // //                       <strong>🎉 Congratulations!</strong> You have successfully
// // //                       completed the training and earned your BBMI certificate!
// // //                     </div>
// // //                     <Button
// // //                       onClick={downloadCertificate}
// // //                       disabled={downloadingCertificate}
// // //                       className="bg-yellow-600 hover:bg-yellow-700 text-white ml-4"
// // //                       size="sm"
// // //                     >
// // //                       {downloadingCertificate ? (
// // //                         <>
// // //                           <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// // //                           Generating...
// // //                         </>
// // //                       ) : (
// // //                         <>
// // //                           <Download className="h-4 w-4 mr-2" />
// // //                           Download Certificate
// // //                         </>
// // //                       )}
// // //                     </Button>
// // //                   </div>
// // //                 </AlertDescription>
// // //               </Alert>
// // //             </div>
// // //           </div>
// // //         )}

// // //         {/* Header Section */}
// // //         <div className="bg-muted py-8">
// // //           <div className="container">
// // //             <Button variant="ghost" asChild className="mb-4">
// // //               <Link href={`/courses/${progressData.enrollment.training_id}`}>
// // //                 <ArrowLeft className="h-4 w-4 mr-2" />
// // //                 Back to Course
// // //               </Link>
// // //             </Button>

// // //             <div className="flex items-start justify-between">
// // //               <div className="flex-1">
// // //                 <h1 className="text-3xl font-bold mb-2">
// // //                   {progressData.enrollment.training_title}
// // //                 </h1>

// // //                 <div className="flex items-center gap-4 mb-4">
// // //                   <Badge
// // //                     variant={
// // //                       progressData.enrollment.status === "completed"
// // //                         ? "default"
// // //                         : "secondary"
// // //                     }
// // //                   >
// // //                     {progressData.enrollment.status === "completed" ? (
// // //                       <div className="flex items-center">
// // //                         <Star className="h-3 w-3 mr-1" />
// // //                         Completed
// // //                       </div>
// // //                     ) : (
// // //                       progressData.enrollment.status
// // //                     )}
// // //                   </Badge>
// // //                   <div className="flex items-center text-sm text-muted-foreground">
// // //                     <BookOpen className="h-4 w-4 mr-1" />
// // //                     {progressData.statistics.completed_modules} of{" "}
// // //                     {progressData.statistics.total_modules} modules completed
// // //                   </div>
// // //                 </div>

// // //                 <div className="max-w-md">
// // //                   <div className="flex justify-between text-sm mb-2">
// // //                     <span>Overall Progress</span>
// // //                     <span>
// // //                       {Math.round(progressData.enrollment.progress_percentage)}%
// // //                     </span>
// // //                   </div>
// // //                   <Progress
// // //                     value={progressData.enrollment.progress_percentage}
// // //                     className="h-2"
// // //                   />
// // //                 </div>
// // //               </div>

// // //               {/* Certificate Section */}
// // //               {progressData.certificate && (
// // //                 <div className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
// // //                   <div className="relative">
// // //                     <Award className="h-16 w-16 text-yellow-500 mx-auto mb-3" />
// // //                     <div className="absolute -top-1 -right-1">
// // //                       <Star className="h-6 w-6 text-yellow-400 fill-current" />
// // //                     </div>
// // //                   </div>
// // //                   <h3 className="font-bold text-lg text-yellow-800 mb-1">
// // //                     Training Completed!
// // //                   </h3>
// // //                   <p className="text-sm text-yellow-700 mb-3">
// // //                     Certificate #{progressData.certificate.certificate_number}
// // //                   </p>
// // //                   <Button
// // //                     onClick={downloadCertificate}
// // //                     disabled={downloadingCertificate}
// // //                     className="bg-yellow-600 hover:bg-yellow-700 text-white"
// // //                     size="sm"
// // //                   >
// // //                     {downloadingCertificate ? (
// // //                       <>
// // //                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// // //                         Generating...
// // //                       </>
// // //                     ) : (
// // //                       <>
// // //                         <Award className="h-4 w-4 mr-2" />
// // //                         View Certificate
// // //                       </>
// // //                     )}
// // //                   </Button>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Content Section */}
// // //         <div className="container py-8">
// // //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// // //             {/* Modules Sidebar */}
// // //             <div className="lg:col-span-1">
// // //               <Card>
// // //                 <CardHeader>
// // //                   <CardTitle className="flex items-center">
// // //                     <BookOpen className="h-5 w-5 mr-2" />
// // //                     Training Modules
// // //                   </CardTitle>
// // //                 </CardHeader>
// // //                 <CardContent className="p-0">
// // //                   <div className="space-y-1">
// // //                     {progressData.modules
// // //                       .sort((a, b) => a.order_index - b.order_index)
// // //                       .map((module) => {
// // //                         const isCompleted = module.status === "completed";
// // //                         const isSelected = selectedModule?.id === module.id;
// // //                         const canAccess = canAccessModule(module);

// // //                         return (
// // //                           <button
// // //                             key={module.id}
// // //                             onClick={() =>
// // //                               canAccess && setSelectedModule(module)
// // //                             }
// // //                             disabled={!canAccess}
// // //                             className={`w-full text-left p-4 border-b transition-colors ${
// // //                               isSelected
// // //                                 ? "bg-primary/10 border-primary"
// // //                                 : canAccess
// // //                                   ? "hover:bg-muted"
// // //                                   : "opacity-50 cursor-not-allowed"
// // //                             }`}
// // //                           >
// // //                             <div className="flex items-start justify-between">
// // //                               <div className="flex-1 min-w-0">
// // //                                 <div className="flex items-center gap-2 mb-1">
// // //                                   {!canAccess ? (
// // //                                     <Lock className="h-4 w-4 text-muted-foreground" />
// // //                                   ) : module.is_preview ? (
// // //                                     <Eye className="h-4 w-4 text-blue-500" />
// // //                                   ) : isCompleted ? (
// // //                                     <CheckCircle className="h-4 w-4 text-green-500" />
// // //                                   ) : (
// // //                                     <Play className="h-4 w-4 text-muted-foreground" />
// // //                                   )}
// // //                                   <span className="font-medium text-sm truncate">
// // //                                     {module.title}
// // //                                   </span>
// // //                                 </div>
// // //                                 <div className="flex items-center text-xs text-muted-foreground">
// // //                                   <Clock className="h-3 w-3 mr-1" />
// // //                                   {Math.floor(module.duration / 60)}m
// // //                                   {module.is_preview && (
// // //                                     <Badge
// // //                                       variant="outline"
// // //                                       className="ml-2 text-xs"
// // //                                     >
// // //                                       Preview
// // //                                     </Badge>
// // //                                   )}
// // //                                 </div>
// // //                                 {module.progress_percentage > 0 &&
// // //                                   module.status !== "completed" && (
// // //                                     <div className="mt-2">
// // //                                       <Progress
// // //                                         value={module.progress_percentage}
// // //                                         className="h-1"
// // //                                       />
// // //                                     </div>
// // //                                   )}
// // //                               </div>
// // //                             </div>
// // //                           </button>
// // //                         );
// // //                       })}
// // //                   </div>
// // //                 </CardContent>
// // //               </Card>
// // //             </div>

// // //             {/* Module Content */}
// // //             <div className="lg:col-span-2">
// // //               {selectedModule ? (
// // //                 <Card>
// // //                   <CardHeader>
// // //                     <div className="flex items-start justify-between">
// // //                       <div>
// // //                         <CardTitle className="mb-2">
// // //                           {selectedModule.title}
// // //                         </CardTitle>
// // //                         <p className="text-muted-foreground">
// // //                           {selectedModule.description}
// // //                         </p>
// // //                       </div>
// // //                       <div className="flex items-center gap-2">
// // //                         <Clock className="h-4 w-4 text-muted-foreground" />
// // //                         <span className="text-sm text-muted-foreground">
// // //                           {Math.floor(selectedModule.duration / 60)} minutes
// // //                         </span>
// // //                       </div>
// // //                     </div>
// // //                   </CardHeader>
// // //                   <CardContent>
// // //                     {/* Video Player */}
// // //                     {selectedModule.video_url?.trim() && (
// // //                       <div className="aspect-video rounded-lg mb-6 overflow-hidden">
// // //                         <YouTube
// // //                           videoId={getYouTubeVideoId(selectedModule.video_url)}
// // //                           className="w-full h-full"
// // //                           onEnd={handleVideoEnd}
// // //                           opts={{
// // //                             width: "100%",
// // //                             height: "100%",
// // //                             playerVars: {
// // //                               autoplay: 0,
// // //                               controls: 1,
// // //                               rel: 0,
// // //                             },
// // //                           }}
// // //                         />
// // //                       </div>
// // //                     )}

// // //                     {/* Module Content */}
// // //                     <div className="prose max-w-none mb-6">
// // //                       <div
// // //                         dangerouslySetInnerHTML={{
// // //                           __html: selectedModule.content,
// // //                         }}
// // //                       />
// // //                     </div>

// // //                     {/* Document Viewer Button */}
// // //                     {selectedModule.document && (
// // //                       <div className="mb-6">
// // //                         <Button
// // //                           variant="outline"
// // //                           onClick={openDocumentViewer}
// // //                           className="w-full"
// // //                         >
// // //                           <FileText className="h-4 w-4 mr-2" />
// // //                           View Training Document
// // //                         </Button>
// // //                       </div>
// // //                     )}

// // //                     {/* Module Status */}
// // //                     <div className="flex justify-between items-center pt-6 border-t">
// // //                       <div className="text-sm text-muted-foreground">
// // //                         {selectedModule.status === "completed" ? (
// // //                           <div className="flex items-center text-green-600">
// // //                             <CheckCircle className="h-4 w-4 mr-2" />
// // //                             Module completed
// // //                           </div>
// // //                         ) : selectedModule.is_preview ? (
// // //                           "Preview module - no progress tracking"
// // //                         ) : (
// // //                           `Progress: ${selectedModule.progress_percentage}%`
// // //                         )}
// // //                       </div>

// // //                       {!selectedModule.is_preview &&
// // //                         selectedModule.status !== "completed" && (
// // //                           <Button
// // //                             onClick={() =>
// // //                               markModuleComplete(selectedModule.id)
// // //                             }
// // //                             disabled={updatingProgress}
// // //                           >
// // //                             {updatingProgress ? (
// // //                               <>
// // //                                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// // //                                 Updating...
// // //                               </>
// // //                             ) : (
// // //                               "Mark Complete"
// // //                             )}
// // //                           </Button>
// // //                         )}
// // //                     </div>
// // //                   </CardContent>
// // //                 </Card>
// // //               ) : (
// // //                 <Card>
// // //                   <CardContent className="pt-6 text-center">
// // //                     <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
// // //                     <h3 className="text-lg font-medium mb-2">
// // //                       Select a Module
// // //                     </h3>
// // //                     <p className="text-muted-foreground">
// // //                       Choose a module from the sidebar to start learning.
// // //                     </p>
// // //                   </CardContent>
// // //                 </Card>
// // //               )}
// // //             </div>
// // //           </div>

// // //           {/* Statistics Card */}
// // //           <Card className="mt-8">
// // //             <CardHeader>
// // //               <CardTitle>Learning Statistics</CardTitle>
// // //             </CardHeader>
// // //             <CardContent>
// // //               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// // //                 <div className="text-center">
// // //                   <div className="text-2xl font-bold text-blue-600">
// // //                     {progressData.statistics.total_modules}
// // //                   </div>
// // //                   <div className="text-sm text-muted-foreground">
// // //                     Total Modules
// // //                   </div>
// // //                 </div>
// // //                 <div className="text-center">
// // //                   <div className="text-2xl font-bold text-green-600">
// // //                     {progressData.statistics.completed_modules}
// // //                   </div>
// // //                   <div className="text-sm text-muted-foreground">Completed</div>
// // //                 </div>
// // //                 <div className="text-center">
// // //                   <div className="text-2xl font-bold text-purple-600">
// // //                     {Math.round(progressData.enrollment.progress_percentage)}%
// // //                   </div>
// // //                   <div className="text-sm text-muted-foreground">Progress</div>
// // //                 </div>
// // //                 <div className="text-center">
// // //                   <div className="text-2xl font-bold text-orange-600">
// // //                     {Math.floor(progressData.statistics.total_time_spent / 60)}h{" "}
// // //                     {progressData.statistics.total_time_spent % 60}m
// // //                   </div>
// // //                   <div className="text-sm text-muted-foreground">
// // //                     Time Spent
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             </CardContent>
// // //           </Card>
// // //         </div>
// // //       </main>
// // //       <SiteFooter />
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useEffect, useState } from "react";
// // import { useRouter, useSearchParams } from "next/navigation";
// // import { SiteHeader } from "@/components/site-header";
// // import { SiteFooter } from "@/components/site-footer";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Badge } from "@/components/ui/badge";
// // import { Progress } from "@/components/ui/progress";
// // import { useAuth } from "@/hooks/use-auth";
// // import { useToast } from "@/hooks/use-toast";
// // import YouTube from "react-youtube";
// // import {
// //   Play,
// //   CheckCircle,
// //   Clock,
// //   ArrowLeft,
// //   BookOpen,
// //   Award,
// //   Lock,
// //   Eye,
// //   Download,
// //   Loader2,
// //   Trophy,
// //   Star,
// //   FileText,
// //   X,
// // } from "lucide-react";
// // import Link from "next/link";
// // import { Alert, AlertDescription } from "@/components/ui/alert";
// // import { ReviewsSection } from "@/components/reviews/reviews-section";

// // // Interface for the document
// // interface Document {
// //   id: string;
// //   file_name: string;
// //   file_url: string;
// // }

// // interface Module {
// //   id: string;
// //   title: string;
// //   description: string;
// //   content: string;
// //   video_url: string | null;
// //   duration: number;
// //   order_index: number;
// //   is_preview: boolean;
// //   status: "not_started" | "in_progress" | "completed";
// //   progress_percentage: number;
// //   time_spent_minutes: number;
// //   document: Document | null; // Add document to module
// // }

// // interface Certificate {
// //   certificate_number: string;
// //   verification_code: string;
// //   created_at: string;
// //   pdf_url: string;
// // }

// // interface ProgressData {
// //   success: boolean;
// //   enrollment: {
// //     id: string;
// //     training_id: string;
// //     status: string;
// //     progress_percentage: number;
// //     enrolled_at: string;
// //     completed_at: string | null;
// //     last_accessed: string;
// //     certificate_issued: boolean;
// //     training_title: string;
// //   };
// //   modules: Module[];
// //   statistics: {
// //     total_modules: number;
// //     completed_modules: number;
// //     in_progress_modules: number;
// //     total_time_spent: number;
// //     avg_module_progress: number;
// //     completion_rate: number;
// //   };
// //   certificate: Certificate | null;
// // }

// // // DocumentViewer component
// // const DocumentViewer = ({
// //   document,
// //   onClose,
// // }: {
// //   document: Document;
// //   onClose: () => void;
// // }) => {
// //   useEffect(() => {
// //     const handleContextMenu = (e: MouseEvent) => e.preventDefault();
// //     const handleKeyDown = (e: KeyboardEvent) => {
// //       if (e.key === "PrintScreen") {
// //         e.preventDefault();
// //       }
// //     };

// //     window.addEventListener("contextmenu", handleContextMenu);
// //     window.addEventListener("keydown", handleKeyDown);

// //     return () => {
// //       window.removeEventListener("contextmenu", handleContextMenu);
// //       window.removeEventListener("keydown", handleKeyDown);
// //     };
// //   }, []);

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
// //       <div className="bg-white rounded-lg w-11/12 h-5/6 relative flex flex-col">
// //         <div className="flex justify-between items-center p-4 border-b">
// //           <h2 className="text-lg font-semibold">{document.file_name}</h2>
// //           <Button variant="ghost" size="icon" onClick={onClose}>
// //             <X className="h-6 w-6" />
// //           </Button>
// //         </div>
// //         <div className="flex-1 p-4 overflow-hidden relative">
// //           <iframe
// //             src={document.file_url}
// //             className="w-full h-full border-0"
// //             title={document.file_name}
// //           ></iframe>
// //           <div className="absolute inset-0 bg-transparent"></div>{" "}
// //           {/* Screenshot prevention overlay */}
// //         </div>
// //         <div className="p-4 border-t text-center text-sm text-muted-foreground">
// //           This document is read-only. Downloading and screenshots are disabled.
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// // export default function ModulesPage({
// //   params,
// // }: {
// //   params: Promise<{ id: string }>;
// // }) {
// //   const [progressData, setProgressData] = useState<ProgressData | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [selectedModule, setSelectedModule] = useState<Module | null>(null);
// //   const [updatingProgress, setUpdatingProgress] = useState(false);
// //   const [downloadingCertificate, setDownloadingCertificate] = useState(false);
// //   const [showCertificateAlert, setShowCertificateAlert] = useState(false);
// //   const [showDocumentViewer, setShowDocumentViewer] = useState(false); // State for document viewer

// //   const { user, isAuthenticated } = useAuth();
// //   const { toast } = useToast();
// //   const router = useRouter();
// //   const searchParams = useSearchParams();

// //   // useEffect(() => {
// //   //   const fetchProgressData = async () => {
// //   //     if (!isAuthenticated) {
// //   //       router.push("/login");
// //   //       return;
// //   //     }

// //   //     try {
// //   //       setLoading(true);
// //   //       setError(null);
// //   //       const resolvedParams = await params;
// //   //       const response = await fetch(`/api/progress/${resolvedParams.id}`, {
// //   //         headers: {
// //   //           Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
// //   //         },
// //   //       });

// //   //       // if (!response.ok) {
// //   //       //   if (response.status === 403) {
// //   //       //     router.push(`/courses/${resolvedParams.id}`);
// //   //       //     return;
// //   //       //   }
// //   //       //   throw new Error("Failed to fetch progress data");
// //   //       // }
// //   //       // ✅ --- THIS IS THE CRITICAL CHANGE --- ✅
// //   //       if (!response.ok) {
// //   //         // Instead of redirecting, we will now throw an error
// //   //         // that will be caught and displayed on this page.
// //   //         const errorData = await response.json();
// //   //         throw new Error(errorData.error || "Failed to fetch progress data");
// //   //       }

// //   //       const data = await response.json();
// //   //       console.log("Progress data received:", data);
// //   //       setProgressData(data);

// //   //       // Show certificate alert if training is completed
// //   //       if (data.enrollment.status === "completed" && data.certificate) {
// //   //         setShowCertificateAlert(true);
// //   //       }

// //   //       // Set first available module as selected
// //   //       if (data.modules && data.modules.length > 0) {
// //   //         const firstAvailableModule = data.modules.find(
// //   //           (module: Module) =>
// //   //             module.is_preview ||
// //   //             module.status === "completed" ||
// //   //             data.modules
// //   //               .filter((m: Module) => m.order_index < module.order_index)
// //   //               .every((m: Module) => m.status === "completed")
// //   //         );
// //   //         setSelectedModule(firstAvailableModule || data.modules[0]);
// //   //       }
// //   //     } catch (err) {
// //   //       console.error("Error fetching progress data:", err);
// //   //       setError(
// //   //         err instanceof Error ? err.message : "Failed to load training data"
// //   //       );
// //   //     } finally {
// //   //       setLoading(false);
// //   //     }
// //   //   };

// //   //   fetchProgressData();
// //   // }, [params, isAuthenticated, router]);
// //   useEffect(() => {
// //     // Helper function to fetch data, so we can call it multiple times
// //     const doFetch = async () => {
// //       const resolvedParams = await params;
// //       return await fetch(`/api/progress/${resolvedParams.id}`, {
// //         headers: {
// //           Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
// //         },
// //       });
// //     };

// //     const fetchProgressData = async () => {
// //       if (!isAuthenticated) {
// //         router.push("/login");
// //         return;
// //       }

// //       try {
// //         setLoading(true);
// //         setError(null);

// //         // --- NEW RETRY LOGIC ---
// //         let response = await doFetch(); // First attempt

// //         const enrollmentStatus = searchParams.get("enrollment");

// //         // Check for the specific race condition:
// //         // 1. API returned an "Access Denied" error
// //         // 2. We know we *just* enrolled (from the URL parameter)
// //         if (
// //           !response.ok &&
// //           response.status === 403 &&
// //           enrollmentStatus === "success"
// //         ) {
// //           // This is the race condition. Wait 750ms and try ONE more time.
// //           await delay(750);
// //           response = await doFetch(); // Second attempt
// //         }
// //         // --- END OF RETRY LOGIC ---

// //         // Now, we check the response for the final time.
// //         if (!response.ok) {
// //           const errorData = await response.json();
// //           setError(errorData.error || "Failed to fetch progress data");
// //           return; // Stop here and show the error card
// //         }

// //         // --- Success ---
// //         // This code will only run if the fetch (or the retry) was successful.
// //         const data = await response.json();
// //         setProgressData(data);

// //         // Set certificate alert
// //         if (data.enrollment.status === "completed" && data.certificate) {
// //           setShowCertificateAlert(true);
// //         }

// //         // Set first available module as selected
// //         if (data.modules && data.modules.length > 0) {
// //           const firstAvailableModule = data.modules.find(
// //             (module: Module) =>
// //               module.is_preview ||
// //               module.status === "completed" ||
// //               data.modules
// //                 .filter((m: Module) => m.order_index < module.order_index)
// //                 .every((m: Module) => m.status === "completed")
// //           );
// //           setSelectedModule(firstAvailableModule || data.modules[0]);
// //         }
// //       } catch (err) {
// //         console.error("Error fetching progress data:", err);
// //         setError(
// //           err instanceof Error ? err.message : "Failed to load training data"
// //         );
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchProgressData();
// //   }, [params, isAuthenticated, router, searchParams]);

// //   const getYouTubeVideoId = (url: string): string => {
// //     const trimmed = url.trim();

// //     // If it's exactly 11 characters and matches YouTube video ID pattern, return as-is
// //     if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
// //       return trimmed;
// //     }
// //     // Else, try to extract from full or short YouTube URL
// //     const regex =
// //       /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|embed|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
// //     const match = url.match(regex);
// //     return match ? match[1] : "";
// //   };

// //   const canAccessModule = (module: Module): boolean => {
// //     if (!progressData) return false;

// //     return (
// //       module.is_preview ||
// //       module.status === "completed" ||
// //       progressData.modules
// //         .filter((m) => m.order_index < module.order_index)
// //         .every((m) => m.status === "completed")
// //     );
// //   };

// //   const markModuleComplete = async (moduleId: string) => {
// //     if (!progressData || updatingProgress) return;

// //     setUpdatingProgress(true);
// //     try {
// //       console.log("Marking module complete:", moduleId);

// //       const response = await fetch("/api/progress/update", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
// //         },
// //         body: JSON.stringify({
// //           trainingId: progressData.enrollment.training_id,
// //           moduleId,
// //           status: "completed",
// //           progressPercentage: 100,
// //           timeSpent: 5,
// //         }),
// //       });

// //       const data = await response.json();
// //       console.log("Progress update response:", data);

// //       if (data.success) {
// //         // Update local state
// //         setProgressData((prev) => {
// //           if (!prev) return prev;

// //           const updatedModules = prev.modules.map((module) =>
// //             module.id === moduleId
// //               ? {
// //                   ...module,
// //                   status: "completed" as const,
// //                   progress_percentage: 100,
// //                 }
// //               : module
// //           );

// //           return {
// //             ...prev,
// //             modules: updatedModules,
// //             enrollment: {
// //               ...prev.enrollment,
// //               progress_percentage:
// //                 data.overallProgress || prev.enrollment.progress_percentage,
// //               status: data.trainingCompleted
// //                 ? "completed"
// //                 : prev.enrollment.status,
// //               certificate_issued:
// //                 data.certificateGenerated || prev.enrollment.certificate_issued,
// //             },
// //             statistics: {
// //               ...prev.statistics,
// //               completed_modules:
// //                 data.completedModules || prev.statistics.completed_modules,
// //               completion_rate:
// //                 data.overallProgress || prev.statistics.completion_rate,
// //             },
// //           };
// //         });

// //         toast({
// //           title: "Module Completed! ✅",
// //           description: "Great progress! Keep learning.",
// //         });

// //         if (data.trainingCompleted) {
// //           toast({
// //             title: "🎉 Training Completed!",
// //             description: data.certificateGenerated
// //               ? "Congratulations! Your certificate has been generated."
// //               : "Congratulations! Training completed successfully.",
// //           });

// //           if (data.certificateGenerated) {
// //             setShowCertificateAlert(true);
// //             // Refresh data to get certificate after a short delay
// //             setTimeout(() => {
// //               window.location.reload();
// //             }, 2000);
// //           }
// //         }
// //       } else {
// //         throw new Error(data.message || "Failed to update progress");
// //       }
// //     } catch (error) {
// //       console.error("Error updating progress:", error);
// //       toast({
// //         title: "Error",
// //         description:
// //           error instanceof Error ? error.message : "Failed to update progress",
// //         variant: "destructive",
// //       });
// //     } finally {
// //       setUpdatingProgress(false);
// //     }
// //   };

// //   const handleVideoEnd = async () => {
// //     if (
// //       selectedModule &&
// //       selectedModule.status !== "completed" &&
// //       !updatingProgress
// //     ) {
// //       console.log("Video ended, marking module complete");
// //       await markModuleComplete(selectedModule.id);
// //     }
// //   };

// //   const downloadCertificate = async () => {
// //     if (!progressData?.certificate) return;

// //     setDownloadingCertificate(true);
// //     try {
// //       const response = await fetch("/api/certificates/generate-pdf", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           studentName: user?.full_name || user?.full_name || "Student",
// //           courseName: progressData.enrollment.training_title,
// //           instructorName: "Ms Betelhem",
// //           completionDate: new Date(
// //             progressData.certificate.created_at
// //           ).toLocaleDateString("en-US", {
// //             year: "numeric",
// //             month: "long",
// //             day: "numeric",
// //           }),
// //           certificateId: progressData.certificate.certificate_number,
// //           trainingDescription: `professional ${progressData.enrollment.training_title.toLowerCase()} techniques`,
// //         }),
// //       });

// //       if (!response.ok) {
// //         throw new Error("Failed to generate certificate");
// //       }

// //       const htmlContent = await response.text();

// //       // Open certificate in new window for printing/saving
// //       const newWindow = window.open("", "_blank");
// //       if (newWindow) {
// //         newWindow.document.write(htmlContent);
// //         newWindow.document.close();

// //         // Trigger print dialog after content loads
// //         newWindow.onload = () => {
// //           setTimeout(() => {
// //             newWindow.print();
// //           }, 500);
// //         };
// //       }

// //       toast({
// //         title: "Certificate Generated! 🎓",
// //         description:
// //           "Your BBMI certificate has been opened in a new window. You can print or save it as PDF.",
// //       });
// //     } catch (error) {
// //       console.error("Certificate download error:", error);
// //       toast({
// //         title: "Download Failed",
// //         description:
// //           error instanceof Error
// //             ? error.message
// //             : "Failed to generate certificate",
// //         variant: "destructive",
// //       });
// //     } finally {
// //       setDownloadingCertificate(false);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex flex-col">
// //         <SiteHeader />
// //         <main className="flex-1 flex items-center justify-center">
// //           <div className="text-center">
// //             <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
// //             <p>Loading training modules...</p>
// //           </div>
// //         </main>
// //         <SiteFooter />
// //       </div>
// //     );
// //   }

// //   // if (error || !progressData) {
// //   //   return (
// //   //     <div className="min-h-screen flex flex-col">
// //   //       <SiteHeader />
// //   //       <main className="flex-1 flex items-center justify-center">
// //   //         <Card className="w-full max-w-md">
// //   //           <CardContent className="pt-6 text-center">
// //   //             <p className="text-destructive mb-4">
// //   //               {error || "Training data not found"}
// //   //             </p>
// //   //             <Button asChild>
// //   //               <Link href="/courses">Back to Courses</Link>
// //   //             </Button>
// //   //           </CardContent>
// //   //         </Card>
// //   //       </main>
// //   //       <SiteFooter />
// //   //     </div>
// //   //   );
// //   // }

// //   if (error || !progressData) {
// //     return (
// //       <div className="min-h-screen flex flex-col">
// //         <SiteHeader />
// //         <main className="flex-1 flex items-center justify-center">
// //           <Card className="w-full max-w-md text-center">
// //             <CardHeader>
// //               <CardTitle className="text-destructive">Access Denied</CardTitle>
// //             </CardHeader>
// //             <CardContent className="pt-2">
// //               <p className="text-muted-foreground mb-6">
// //                 {error ||
// //                   "Could not load training data. You may not have access."}
// //               </p>
// //               <div className="flex gap-4 justify-center">
// //                 {/* ✅ ADD A "TRY AGAIN" BUTTON */}
// //                 <Button
// //                   variant="outline"
// //                   onClick={() => window.location.reload()}
// //                 >
// //                   Try Again
// //                 </Button>
// //                 <Button asChild>
// //                   <Link href="/courses">Back to Courses</Link>
// //                 </Button>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </main>
// //         <SiteFooter />
// //       </div>
// //     );
// //   }

// //   // Functions to handle document viewer
// //   const openDocumentViewer = () => setShowDocumentViewer(true);
// //   const closeDocumentViewer = () => setShowDocumentViewer(false);

// //   return (
// //     <div className="min-h-screen flex flex-col">
// //       <SiteHeader />

// //       {/* Document Viewer Modal */}
// //       {showDocumentViewer && selectedModule?.document && (
// //         <DocumentViewer
// //           document={selectedModule.document}
// //           onClose={closeDocumentViewer}
// //         />
// //       )}

// //       <main className="flex-1">
// //         {/* Certificate Completion Alert */}
// //         {/* {showCertificateAlert && progressData.certificate && (
// //           <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
// //             <div className="container py-4">
// //               <Alert className="border-yellow-300 bg-yellow-50">
// //                 <Trophy className="h-5 w-5 text-yellow-600" />
// //                 <AlertDescription className="text-yellow-800">
// //                   <div className="flex items-center justify-between">
// //                     <div>
// //                       <strong>🎉 Congratulations!</strong> You have successfully
// //                       completed the training and earned your BBMI certificate!
// //                     </div>
// //                     <Button
// //                       onClick={downloadCertificate}
// //                       disabled={downloadingCertificate}
// //                       className="bg-yellow-600 hover:bg-yellow-700 text-white ml-4"
// //                       size="sm"
// //                     >
// //                       {downloadingCertificate ? (
// //                         <>
// //                           <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// //                           Generating...
// //                         </>
// //                       ) : (
// //                         <>
// //                           <Download className="h-4 w-4 mr-2" />
// //                           Download Certificate
// //                         </>
// //                       )}
// //                     </Button>
// //                   </div>
// //                 </AlertDescription>
// //               </Alert>
// //             </div>
// //           </div>
// //         )} */}

// //         {/* Header Section */}
// //         <div className="bg-muted py-8">
// //           <div className="container">
// //             <Button variant="ghost" asChild className="mb-4">
// //               <Link href={`/courses/${progressData.enrollment.training_id}`}>
// //                 <ArrowLeft className="h-4 w-4 mr-2" />
// //                 Back to Course
// //               </Link>
// //             </Button>

// //             <div className="flex items-start justify-between">
// //               <div className="flex-1">
// //                 <h1 className="text-3xl font-bold mb-2">
// //                   {progressData.enrollment.training_title}
// //                 </h1>

// //                 <div className="flex items-center gap-4 mb-4">
// //                   <Badge
// //                     variant={
// //                       progressData.enrollment.status === "completed"
// //                         ? "default"
// //                         : "secondary"
// //                     }
// //                   >
// //                     {progressData.enrollment.status === "completed" ? (
// //                       <div className="flex items-center">
// //                         <Star className="h-3 w-3 mr-1" />
// //                         Completed
// //                       </div>
// //                     ) : (
// //                       progressData.enrollment.status
// //                     )}
// //                   </Badge>
// //                   <div className="flex items-center text-sm text-muted-foreground">
// //                     <BookOpen className="h-4 w-4 mr-1" />
// //                     {progressData.statistics.completed_modules} of{" "}
// //                     {progressData.statistics.total_modules} modules completed
// //                   </div>
// //                 </div>

// //                 <div className="max-w-md">
// //                   <div className="flex justify-between text-sm mb-2">
// //                     <span>Overall Progress</span>
// //                     <span>
// //                       {Math.round(progressData.enrollment.progress_percentage)}%
// //                     </span>
// //                   </div>
// //                   <Progress
// //                     value={progressData.enrollment.progress_percentage}
// //                     className="h-2"
// //                   />
// //                 </div>
// //               </div>

// //               {/* Certificate Section */}
// //               {progressData.certificate && (
// //                 <div className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
// //                   <div className="relative">
// //                     <Award className="h-16 w-16 text-yellow-500 mx-auto mb-3" />
// //                     <div className="absolute -top-1 -right-1">
// //                       <Star className="h-6 w-6 text-yellow-400 fill-current" />
// //                     </div>
// //                   </div>
// //                   <h3 className="font-bold text-lg text-yellow-800 mb-1">
// //                     Training Completed!
// //                   </h3>
// //                   <p className="text-sm text-yellow-700 mb-3">
// //                     Certificate #{progressData.certificate.certificate_number}
// //                   </p>
// //                   <Button
// //                     onClick={downloadCertificate}
// //                     disabled={downloadingCertificate}
// //                     className="bg-yellow-600 hover:bg-yellow-700 text-white"
// //                     size="sm"
// //                   >
// //                     {downloadingCertificate ? (
// //                       <>
// //                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// //                         Generating...
// //                       </>
// //                     ) : (
// //                       <>
// //                         <Award className="h-4 w-4 mr-2" />
// //                         View Certificate
// //                       </>
// //                     )}
// //                   </Button>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Content Section */}
// //         <div className="container py-8">
// //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// //             {/* Modules Sidebar */}
// //             <div className="lg:col-span-1">
// //               <Card>
// //                 <CardHeader>
// //                   <CardTitle className="flex items-center">
// //                     <BookOpen className="h-5 w-5 mr-2" />
// //                     Training Modules
// //                   </CardTitle>
// //                 </CardHeader>
// //                 <CardContent className="p-0">
// //                   <div className="space-y-1">
// //                     {progressData.modules
// //                       .sort((a, b) => a.order_index - b.order_index)
// //                       .map((module) => {
// //                         const isCompleted = module.status === "completed";
// //                         const isSelected = selectedModule?.id === module.id;
// //                         const canAccess = canAccessModule(module);

// //                         return (
// //                           <button
// //                             key={module.id}
// //                             onClick={() =>
// //                               canAccess && setSelectedModule(module)
// //                             }
// //                             disabled={!canAccess}
// //                             className={`w-full text-left p-4 border-b transition-colors ${
// //                               isSelected
// //                                 ? "bg-primary/10 border-primary"
// //                                 : canAccess
// //                                   ? "hover:bg-muted"
// //                                   : "opacity-50 cursor-not-allowed"
// //                             }`}
// //                           >
// //                             <div className="flex items-start justify-between">
// //                               <div className="flex-1 min-w-0">
// //                                 <div className="flex items-center gap-2 mb-1">
// //                                   {!canAccess ? (
// //                                     <Lock className="h-4 w-4 text-muted-foreground" />
// //                                   ) : module.is_preview ? (
// //                                     <Eye className="h-4 w-4 text-blue-500" />
// //                                   ) : isCompleted ? (
// //                                     <CheckCircle className="h-4 w-4 text-green-500" />
// //                                   ) : (
// //                                     <Play className="h-4 w-4 text-muted-foreground" />
// //                                   )}
// //                                   <span className="font-medium text-sm truncate">
// //                                     {module.title}
// //                                   </span>
// //                                 </div>
// //                                 <div className="flex items-center text-xs text-muted-foreground">
// //                                   <Clock className="h-3 w-3 mr-1" />
// //                                   {Math.floor(module.duration / 60)}m
// //                                   {module.is_preview && (
// //                                     <Badge
// //                                       variant="outline"
// //                                       className="ml-2 text-xs"
// //                                     >
// //                                       Preview
// //                                     </Badge>
// //                                   )}
// //                                 </div>
// //                                 {module.progress_percentage > 0 &&
// //                                   module.status !== "completed" && (
// //                                     <div className="mt-2">
// //                                       <Progress
// //                                         value={module.progress_percentage}
// //                                         className="h-1"
// //                                       />
// //                                     </div>
// //                                   )}
// //                               </div>
// //                             </div>
// //                           </button>
// //                         );
// //                       })}
// //                   </div>
// //                 </CardContent>
// //               </Card>
// //             </div>

// //             {/* Module Content */}
// //             <div className="lg:col-span-2">
// //               {selectedModule ? (
// //                 <Card>
// //                   <CardHeader>
// //                     <div className="flex items-start justify-between">
// //                       <div>
// //                         <CardTitle className="mb-2">
// //                           {selectedModule.title}
// //                         </CardTitle>
// //                         <p className="text-muted-foreground">
// //                           {selectedModule.description}
// //                         </p>
// //                       </div>
// //                       <div className="flex items-center gap-2">
// //                         <Clock className="h-4 w-4 text-muted-foreground" />
// //                         <span className="text-sm text-muted-foreground">
// //                           {Math.floor(selectedModule.duration / 60)} minutes
// //                         </span>
// //                       </div>
// //                     </div>
// //                   </CardHeader>
// //                   <CardContent>
// //                     {/* Video Player */}
// //                     {selectedModule.video_url?.trim() && (
// //                       <div className="aspect-video rounded-lg mb-6 overflow-hidden">
// //                         <YouTube
// //                           videoId={getYouTubeVideoId(selectedModule.video_url)}
// //                           className="w-full h-full"
// //                           onEnd={handleVideoEnd}
// //                           opts={{
// //                             width: "100%",
// //                             height: "100%",
// //                             playerVars: {
// //                               autoplay: 0,
// //                               controls: 1,
// //                               rel: 0,
// //                             },
// //                           }}
// //                         />
// //                       </div>
// //                     )}

// //                     {/* Module Content */}
// //                     <div className="prose max-w-none mb-6">
// //                       <div
// //                         dangerouslySetInnerHTML={{
// //                           __html: selectedModule.content,
// //                         }}
// //                       />
// //                     </div>

// //                     {/* Document Viewer Button */}
// //                     {selectedModule.document && (
// //                       <div className="mb-6">
// //                         <Button
// //                           variant="outline"
// //                           onClick={openDocumentViewer}
// //                           className="w-full bg-transparent"
// //                         >
// //                           <FileText className="h-4 w-4 mr-2" />
// //                           View Training Document
// //                         </Button>
// //                       </div>
// //                     )}

// //                     {/* Module Status */}
// //                     <div className="flex justify-between items-center pt-6 border-t">
// //                       <div className="text-sm text-muted-foreground">
// //                         {selectedModule.status === "completed" ? (
// //                           <div className="flex items-center text-green-600">
// //                             <CheckCircle className="h-4 w-4 mr-2" />
// //                             Module completed
// //                           </div>
// //                         ) : selectedModule.is_preview ? (
// //                           "Preview module - no progress tracking"
// //                         ) : (
// //                           `Progress: ${selectedModule.progress_percentage}%`
// //                         )}
// //                       </div>

// //                       {!selectedModule.is_preview &&
// //                         selectedModule.status !== "completed" && (
// //                           <Button
// //                             onClick={() =>
// //                               markModuleComplete(selectedModule.id)
// //                             }
// //                             disabled={updatingProgress}
// //                           >
// //                             {updatingProgress ? (
// //                               <>
// //                                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// //                                 Updating...
// //                               </>
// //                             ) : (
// //                               "Mark Complete"
// //                             )}
// //                           </Button>
// //                         )}
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               ) : (
// //                 <Card>
// //                   <CardContent className="pt-6 text-center">
// //                     <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
// //                     <h3 className="text-lg font-medium mb-2">
// //                       Select a Module
// //                     </h3>
// //                     <p className="text-muted-foreground">
// //                       Choose a module from the sidebar to start learning.
// //                     </p>
// //                   </CardContent>
// //                 </Card>
// //               )}
// //             </div>
// //           </div>

// //           {/* Statistics Card */}
// //           <Card className="mt-8">
// //             <CardHeader>
// //               <CardTitle>Learning Statistics</CardTitle>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //                 <div className="text-center">
// //                   <div className="text-2xl font-bold text-blue-600">
// //                     {progressData.statistics.total_modules}
// //                   </div>
// //                   <div className="text-sm text-muted-foreground">
// //                     Total Modules
// //                   </div>
// //                 </div>
// //                 <div className="text-center">
// //                   <div className="text-2xl font-bold text-green-600">
// //                     {progressData.statistics.completed_modules}
// //                   </div>
// //                   <div className="text-sm text-muted-foreground">Completed</div>
// //                 </div>
// //                 <div className="text-center">
// //                   <div className="text-2xl font-bold text-purple-600">
// //                     {Math.round(progressData.enrollment.progress_percentage)}%
// //                   </div>
// //                   <div className="text-sm text-muted-foreground">Progress</div>
// //                 </div>
// //                 <div className="text-center">
// //                   <div className="text-2xl font-bold text-orange-600">
// //                     {Math.floor(progressData.statistics.total_time_spent / 60)}h{" "}
// //                     {progressData.statistics.total_time_spent % 60}m
// //                   </div>
// //                   <div className="text-sm text-muted-foreground">
// //                     Time Spent
// //                   </div>
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>

// //           {progressData.enrollment.status === "completed" && (
// //             <div className="mt-8">
// //               <ReviewsSection courseId={progressData.enrollment.training_id} />
// //             </div>
// //           )}
// //         </div>
// //       </main>
// //       <SiteFooter />
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";
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
// import {
//   Play,
//   CheckCircle,
//   Clock,
//   ArrowLeft,
//   BookOpen,
//   Award,
//   Lock,
//   Eye,
//   Download,
//   Loader2,
//   Trophy,
//   Star,
//   FileText,
//   X,
// } from "lucide-react";
// import Link from "next/link";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { ReviewsSection } from "@/components/reviews/reviews-section";

// // Interface for the document
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
//   document: Document | null; // Add document to module
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
// }

// // DocumentViewer component
// const DocumentViewer = ({
//   document,
//   onClose,
// }: {
//   document: Document;
//   onClose: () => void;
// }) => {
//   useEffect(() => {
//     const handleContextMenu = (e: MouseEvent) => e.preventDefault();
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "PrintScreen") {
//         e.preventDefault();
//       }
//     };

//     window.addEventListener("contextmenu", handleContextMenu);
//     window.addEventListener("keydown", handleKeyDown);

//     return () => {
//       window.removeEventListener("contextmenu", handleContextMenu);
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg w-11/12 h-5/6 relative flex flex-col">
//         <div className="flex justify-between items-center p-4 border-b">
//           <h2 className="text-lg font-semibold">{document.file_name}</h2>
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <X className="h-6 w-6" />
//           </Button>
//         </div>
//         <div className="flex-1 p-4 overflow-hidden relative">
//           <iframe
//             src={document.file_url}
//             className="w-full h-full border-0"
//             title={document.file_name}
//           ></iframe>
//           <div className="absolute inset-0 bg-transparent"></div>{" "}
//           {/* Screenshot prevention overlay */}
//         </div>
//         <div className="p-4 border-t text-center text-sm text-muted-foreground">
//           This document is read-only. Downloading and screenshots are disabled.
//         </div>
//       </div>
//     </div>
//   );
// };

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
//   const [showCertificateAlert, setShowCertificateAlert] = useState(false);
//   const [showDocumentViewer, setShowDocumentViewer] = useState(false); // State for document viewer

//   const { user, isAuthenticated } = useAuth();
//   const { toast } = useToast();
//   const router = useRouter();

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

//         if (!response.ok) {
//           if (response.status === 403) {
//             router.push(`/courses/${resolvedParams.id}`);
//             return;
//           }
//           throw new Error("Failed to fetch progress data");
//         }

//         const data = await response.json();
//         console.log("Progress data received:", data);
//         setProgressData(data);

//         // Show certificate alert if training is completed
//         if (data.enrollment.status === "completed" && data.certificate) {
//           setShowCertificateAlert(true);
//         }

//         // Set first available module as selected
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
//         console.error("Error fetching progress data:", err);
//         setError(
//           err instanceof Error ? err.message : "Failed to load training data"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProgressData();
//   }, [params, isAuthenticated, router]);

//   const getYouTubeVideoId = (url: string): string => {
//     const trimmed = url.trim();

//     // If it's exactly 11 characters and matches YouTube video ID pattern, return as-is
//     if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
//       return trimmed;
//     }
//     // Else, try to extract from full or short YouTube URL
//     const regex =
//       /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|embed|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
//     const match = url.match(regex);
//     return match ? match[1] : "";
//   };

//   const canAccessModule = (module: Module): boolean => {
//     if (!progressData) return false;

//     return (
//       module.is_preview ||
//       module.status === "completed" ||
//       progressData.modules
//         .filter((m) => m.order_index < module.order_index)
//         .every((m) => m.status === "completed")
//     );
//   };

//   const markModuleComplete = async (moduleId: string) => {
//     if (!progressData || updatingProgress) return;

//     setUpdatingProgress(true);
//     try {
//       console.log("Marking module complete:", moduleId);

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
//       console.log("Progress update response:", data);

//       if (data.success) {
//         // Update local state
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

//           return {
//             ...prev,
//             modules: updatedModules,
//             enrollment: {
//               ...prev.enrollment,
//               progress_percentage:
//                 data.overallProgress || prev.enrollment.progress_percentage,
//               status: data.trainingCompleted
//                 ? "completed"
//                 : prev.enrollment.status,
//               certificate_issued:
//                 data.certificateGenerated || prev.enrollment.certificate_issued,
//             },
//             statistics: {
//               ...prev.statistics,
//               completed_modules:
//                 data.completedModules || prev.statistics.completed_modules,
//               completion_rate:
//                 data.overallProgress || prev.statistics.completion_rate,
//             },
//           };
//         });

//         toast({
//           title: "Module Completed! ✅",
//           description: "Great progress! Keep learning.",
//         });

//         if (data.trainingCompleted) {
//           toast({
//             title: "🎉 Training Completed!",
//             description: data.certificateGenerated
//               ? "Congratulations! Your certificate has been generated."
//               : "Congratulations! Training completed successfully.",
//           });

//           if (data.certificateGenerated) {
//             setShowCertificateAlert(true);
//             // Refresh data to get certificate after a short delay
//             setTimeout(() => {
//               window.location.reload();
//             }, 2000);
//           }
//         }
//       } else {
//         throw new Error(data.message || "Failed to update progress");
//       }
//     } catch (error) {
//       console.error("Error updating progress:", error);
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
//     if (
//       selectedModule &&
//       selectedModule.status !== "completed" &&
//       !updatingProgress
//     ) {
//       console.log("Video ended, marking module complete");
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
//           studentName: user?.full_name || user?.full_name || "Student",
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

//       // Open certificate in new window for printing/saving
//       const newWindow = window.open("", "_blank");
//       if (newWindow) {
//         newWindow.document.write(htmlContent);
//         newWindow.document.close();

//         // Trigger print dialog after content loads
//         newWindow.onload = () => {
//           setTimeout(() => {
//             newWindow.print();
//           }, 500);
//         };
//       }

//       toast({
//         title: "Certificate Generated! 🎓",
//         description:
//           "Your BBMI certificate has been opened in a new window. You can print or save it as PDF.",
//       });
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

//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <SiteHeader />
//         <main className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
//             <p>Loading training modules...</p>
//           </div>
//         </main>
//         <SiteFooter />
//       </div>
//     );
//   }

//   if (error || !progressData) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <SiteHeader />
//         <main className="flex-1 flex items-center justify-center">
//           <Card className="w-full max-w-md">
//             <CardContent className="pt-6 text-center">
//               <p className="text-destructive mb-4">
//                 {error || "Training data not found"}
//               </p>
//               <Button asChild>
//                 <Link href="/courses">Back to Courses</Link>
//               </Button>
//             </CardContent>
//           </Card>
//         </main>
//         <SiteFooter />
//       </div>
//     );
//   }

//   // Functions to handle document viewer
//   const openDocumentViewer = () => setShowDocumentViewer(true);
//   const closeDocumentViewer = () => setShowDocumentViewer(false);

//   return (
//     <div className="min-h-screen flex flex-col">
//       <SiteHeader />

//       {/* Document Viewer Modal */}
//       {showDocumentViewer && selectedModule?.document && (
//         <DocumentViewer
//           document={selectedModule.document}
//           onClose={closeDocumentViewer}
//         />
//       )}

//       <main className="flex-1">
//         {/* Header Section */}
//         <div className="bg-muted py-8">
//           <div className="container">
//             <Button variant="ghost" asChild className="mb-4">
//               <Link href={`/courses/${progressData.enrollment.training_id}`}>
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Back to Course
//               </Link>
//             </Button>

//             <div className="flex items-start justify-between">
//               <div className="flex-1">
//                 <h1 className="text-3xl font-bold mb-2">
//                   {progressData.enrollment.training_title}
//                 </h1>

//                 <div className="flex items-center gap-4 mb-4">
//                   <Badge
//                     variant={
//                       progressData.enrollment.status === "completed"
//                         ? "default"
//                         : "secondary"
//                     }
//                   >
//                     {progressData.enrollment.status === "completed" ? (
//                       <div className="flex items-center">
//                         <Star className="h-3 w-3 mr-1" />
//                         Completed
//                       </div>
//                     ) : (
//                       progressData.enrollment.status
//                     )}
//                   </Badge>
//                   <div className="flex items-center text-sm text-muted-foreground">
//                     <BookOpen className="h-4 w-4 mr-1" />
//                     {progressData.statistics.completed_modules} of{" "}
//                     {progressData.statistics.total_modules} modules completed
//                   </div>
//                 </div>

//                 <div className="max-w-md">
//                   <div className="flex justify-between text-sm mb-2">
//                     <span>Overall Progress</span>
//                     <span>
//                       {Math.round(progressData.enrollment.progress_percentage)}%
//                     </span>
//                   </div>
//                   <Progress
//                     value={progressData.enrollment.progress_percentage}
//                     className="h-2"
//                   />
//                 </div>
//               </div>

//               {/* Certificate Section */}
//               {progressData.certificate && (
//                 <div className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
//                   <div className="relative">
//                     <Award className="h-16 w-16 text-yellow-500 mx-auto mb-3" />
//                     <div className="absolute -top-1 -right-1">
//                       <Star className="h-6 w-6 text-yellow-400 fill-current" />
//                     </div>
//                   </div>
//                   <h3 className="font-bold text-lg text-yellow-800 mb-1">
//                     Training Completed!
//                   </h3>
//                   <p className="text-sm text-yellow-700 mb-3">
//                     Certificate #{progressData.certificate.certificate_number}
//                   </p>
//                   <Button
//                     onClick={downloadCertificate}
//                     disabled={downloadingCertificate}
//                     className="bg-yellow-600 hover:bg-yellow-700 text-white"
//                     size="sm"
//                   >
//                     {downloadingCertificate ? (
//                       <>
//                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                         Generating...
//                       </>
//                     ) : (
//                       <>
//                         <Award className="h-4 w-4 mr-2" />
//                         View Certificate
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Content Section */}
//         <div className="container py-8">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Modules Sidebar */}
//             <div className="lg:col-span-1">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center">
//                     <BookOpen className="h-5 w-5 mr-2" />
//                     Training Modules
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-0">
//                   <div className="space-y-1">
//                     {progressData.modules
//                       .sort((a, b) => a.order_index - b.order_index)
//                       .map((module) => {
//                         const isCompleted = module.status === "completed";
//                         const isSelected = selectedModule?.id === module.id;
//                         const canAccess = canAccessModule(module);

//                         return (
//                           <button
//                             key={module.id}
//                             onClick={() =>
//                               canAccess && setSelectedModule(module)
//                             }
//                             disabled={!canAccess}
//                             className={`w-full text-left p-4 border-b transition-colors ${
//                               isSelected
//                                 ? "bg-primary/10 border-primary"
//                                 : canAccess
//                                   ? "hover:bg-muted"
//                                   : "opacity-50 cursor-not-allowed"
//                             }`}
//                           >
//                             <div className="flex items-start justify-between">
//                               <div className="flex-1 min-w-0">
//                                 <div className="flex items-center gap-2 mb-1">
//                                   {!canAccess ? (
//                                     <Lock className="h-4 w-4 text-muted-foreground" />
//                                   ) : module.is_preview ? (
//                                     <Eye className="h-4 w-4 text-blue-500" />
//                                   ) : isCompleted ? (
//                                     <CheckCircle className="h-4 w-4 text-green-500" />
//                                   ) : (
//                                     <Play className="h-4 w-4 text-muted-foreground" />
//                                   )}
//                                   <span className="font-medium text-sm truncate">
//                                     {module.title}
//                                   </span>
//                                 </div>
//                                 <div className="flex items-center text-xs text-muted-foreground">
//                                   <Clock className="h-3 w-3 mr-1" />
//                                   {Math.floor(module.duration / 60)}m
//                                   {module.is_preview && (
//                                     <Badge
//                                       variant="outline"
//                                       className="ml-2 text-xs"
//                                     >
//                                       Preview
//                                     </Badge>
//                                   )}
//                                 </div>
//                                 {module.progress_percentage > 0 &&
//                                   module.status !== "completed" && (
//                                     <div className="mt-2">
//                                       <Progress
//                                         value={module.progress_percentage}
//                                         className="h-1"
//                                       />
//                                     </div>
//                                   )}
//                               </div>
//                             </div>
//                           </button>
//                         );
//                       })}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Module Content */}
//             <div className="lg:col-span-2">
//               {selectedModule ? (
//                 <Card>
//                   <CardHeader>
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <CardTitle className="mb-2">
//                           {selectedModule.title}
//                         </CardTitle>
//                         <p className="text-muted-foreground">
//                           {selectedModule.description}
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Clock className="h-4 w-4 text-muted-foreground" />
//                         <span className="text-sm text-muted-foreground">
//                           {Math.floor(selectedModule.duration / 60)} minutes
//                         </span>
//                       </div>
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     {/* Video Player */}
//                     {selectedModule.video_url?.trim() && (
//                       <div className="aspect-video rounded-lg mb-6 overflow-hidden">
//                         <YouTube
//                           videoId={getYouTubeVideoId(selectedModule.video_url)}
//                           className="w-full h-full"
//                           onEnd={handleVideoEnd}
//                           opts={{
//                             width: "100%",
//                             height: "100%",
//                             playerVars: {
//                               autoplay: 0,
//                               controls: 1,
//                               rel: 0,
//                             },
//                           }}
//                         />
//                       </div>
//                     )}

//                     {/* Module Content */}
//                     <div className="prose max-w-none mb-6">
//                       <div
//                         dangerouslySetInnerHTML={{
//                           __html: selectedModule.content,
//                         }}
//                       />
//                     </div>

//                     {/* Document Viewer Button */}
//                     {selectedModule.document && (
//                       <div className="mb-6">
//                         <Button
//                           variant="outline"
//                           onClick={openDocumentViewer}
//                           className="w-full bg-transparent"
//                         >
//                           <FileText className="h-4 w-4 mr-2" />
//                           View Training Document
//                         </Button>
//                       </div>
//                     )}

//                     {/* Module Status */}
//                     <div className="flex justify-between items-center pt-6 border-t">
//                       <div className="text-sm text-muted-foreground">
//                         {selectedModule.status === "completed" ? (
//                           <div className="flex items-center text-green-600">
//                             <CheckCircle className="h-4 w-4 mr-2" />
//                             Module completed
//                           </div>
//                         ) : selectedModule.is_preview ? (
//                           "Preview module - no progress tracking"
//                         ) : (
//                           `Progress: ${selectedModule.progress_percentage}%`
//                         )}
//                       </div>

//                       {!selectedModule.is_preview &&
//                         selectedModule.status !== "completed" && (
//                           <Button
//                             onClick={() =>
//                               markModuleComplete(selectedModule.id)
//                             }
//                             disabled={updatingProgress}
//                           >
//                             {updatingProgress ? (
//                               <>
//                                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                                 Updating...
//                               </>
//                             ) : (
//                               "Mark Complete"
//                             )}
//                           </Button>
//                         )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 <Card>
//                   <CardContent className="pt-6 text-center">
//                     <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                     <h3 className="text-lg font-medium mb-2">
//                       Select a Module
//                     </h3>
//                     <p className="text-muted-foreground">
//                       Choose a module from the sidebar to start learning.
//                     </p>
//                   </CardContent>
//                 </Card>
//               )}
//             </div>
//           </div>

//           {/* Statistics Card */}
//           <Card className="mt-8">
//             <CardHeader>
//               <CardTitle>Learning Statistics</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">
//                     {progressData.statistics.total_modules}
//                   </div>
//                   <div className="text-sm text-muted-foreground">
//                     Total Modules
//                   </div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-green-600">
//                     {progressData.statistics.completed_modules}
//                   </div>
//                   <div className="text-sm text-muted-foreground">Completed</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-purple-600">
//                     {Math.round(progressData.enrollment.progress_percentage)}%
//                   </div>
//                   <div className="text-sm text-muted-foreground">Progress</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-orange-600">
//                     {Math.floor(progressData.statistics.total_time_spent / 60)}h{" "}
//                     {progressData.statistics.total_time_spent % 60}m
//                   </div>
//                   <div className="text-sm text-muted-foreground">
//                     Time Spent
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {progressData.enrollment.status === "completed" && (
//             <div className="mt-8">
//               <ReviewsSection courseId={progressData.enrollment.training_id} />
//             </div>
//           )}
//         </div>
//       </main>
//       <SiteFooter />
//     </div>
//   );
// }
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

import DocumentViewer from "@/components/document-viewer";

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
  X,
  Loader2,
  Minimize, // Added for exiting fullscreen icon
} from "lucide-react";

// --- Interfaces (Keep these as they are) ---
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
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
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
  const playerRef = useRef<any>(null); // Ref for the YouTube player instance
  const videoContainerRef = useRef<HTMLDivElement>(null); // Ref for the div wrapping the YouTube player
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      try {
        setLoading(true);
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
          const firstAvailableModule = data.modules.find(
            (module: Module) =>
              module.is_preview ||
              module.status === "completed" ||
              data.modules
                .filter((m: Module) => m.order_index < module.order_index)
                .every((m: Module) => m.status === "completed")
          );
          setSelectedModule(firstAvailableModule || data.modules[0]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load training data"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, [params, isAuthenticated, router]);

  useEffect(() => {
    // Only attempt to scroll if data is loaded and there's a hash in the URL
    if (!loading && progressData && typeof window !== 'undefined' && window.location.hash) {
      const targetId = window.location.hash.substring(1); // Remove the '#'
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // Use requestAnimationFrame for smoother scrolling, ensures layout is stable
        requestAnimationFrame(() => {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start', // or 'center', 'end'
          });
          // Remove the hash from the URL to prevent re-scrolling on subsequent updates
          // and for cleaner URLs after initial navigation.
          // Optional: You might want to keep the hash if users are expected to copy/share direct links.
          // If you decide to keep it, just remove this line.
          history.replaceState(null, '', window.location.pathname);
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
        setProgressData((prev) => {
          if (!prev) return prev;

          // 1. Update the specific module's status
          const updatedModules = prev.modules.map((module) =>
            module.id === moduleId
              ? {
                  ...module,
                  status: "completed" as const,
                  progress_percentage: 100,
                }
              : module
          );

          // 2. Update overall enrollment progress and statistics using data from API response
          const newEnrollmentProgress = data.overallProgress;
          const newCompletedModules = data.completedModules;
          const newTotalModules = data.totalModules; // This should be consistent, but good to get from API

          return {
            ...prev,
            modules: updatedModules,
            enrollment: {
              ...prev.enrollment,
              progress_percentage: newEnrollmentProgress,
              status: data.trainingCompleted ? "completed" : "active",
              completed_at: data.trainingCompleted
                ? new Date().toISOString()
                : prev.enrollment.completed_at,
            },
            statistics: {
              ...prev.statistics,
              completed_modules: newCompletedModules,
              // Update in_progress_modules based on new completed count
              in_progress_modules: newTotalModules - newCompletedModules,
              avg_module_progress: newEnrollmentProgress, // Same as completion_rate for overall
              completion_rate: newEnrollmentProgress,
            },
            // If a certificate was just generated, you might want to update it here
            // based on the `data.certificateGenerated` and `data.certificateNumber`
            // and potentially a full `certificate` object if your API returned it.
            certificate:
              data.certificateGenerated && !prev.certificate
                ? {
                    certificate_number: data.certificateNumber,
                    verification_code: "N/A", // API doesn't return this, would need re-fetch or adjustment
                    created_at: new Date().toISOString(),
                    pdf_url: "", // API doesn't return this, would need re-fetch or adjustment
                  }
                : prev.certificate,
          };
        });
        toast({ title: "Module Completed ✅" });
        // Optional: If a certificate was just generated, you might want to show a more specific toast
        if (data.trainingCompleted && data.certificateGenerated) {
          toast({
            title: "Congratulations!",
            description:
              "You have completed the training and your certificate is ready!",
          });
        }
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

  const downloadCertificate = async () => {
    if (!progressData?.certificate) return;

    setDownloadingCertificate(true);
    try {
      const response = await fetch("/api/certificates/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: user?.full_name || "Student",
          courseName: progressData.enrollment.training_title,
          instructorName: "Ms Betelhem",
          completionDate: new Date(
            progressData.certificate.created_at
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          certificateId: progressData.certificate.certificate_number,
          trainingDescription: `professional ${progressData.enrollment.training_title.toLowerCase()} techniques`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate certificate");
      }

      const htmlContent = await response.text();

      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();

        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print();
          }, 500);
        };
      }
    } catch (error) {
      console.error("Certificate download error:", error);
      toast({
        title: "Download Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate certificate",
        variant: "destructive",
      });
    } finally {
      setDownloadingCertificate(false);
    }
  };

  const getYouTubeVideoId = (url: string | null | undefined): string => {
    if (!url || typeof url !== "string") return "";
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url; // Already an ID
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

  // Handle fullscreen state change
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
      // Enter fullscreen
      videoContainerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) =>
          console.error(
            `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`
          )
        );
    } else {
      // Exit fullscreen
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

  // Update progress bar
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
    }, 1000); // Update every second
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
            <div className="relative bg-gradient-to-br from-custom-copper to-custom-tan p-6 rounded-lg border border-custom-copper w-full max-w-sm flex flex-col items-center">
              {/* Star at top-right */}
              <div className="absolute -top-1 -right-1">
                <Star className="h-6 w-6 text-custom-copper fill-current" />
              </div>

              {/* Centered Award Icon */}
              <Award className="h-16 w-16 text-custom-copper mb-3" />

              {/* Text */}
              <h3 className="font-bold text-lg text-custom-copper mb-1 text-center">
                Training Completed!
              </h3>
              <p className="text-sm text-custom-copper mb-3 text-center">
                Certificate #{progressData.certificate.certificate_number}
              </p>

              {/* Button */}
              <Button
                onClick={downloadCertificate}
                disabled={downloadingCertificate}
                className="bg-custom-copper hover:bg-custom-copper
                 text-white"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Training Modules</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
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
                            height: "100%", // Changed to 100%
                            playerVars: {
                              controls: 0,
                              disablekb: 1,
                              fs: 0,
                              modestbranding: 1,
                              rel: 0,
                              iv_load_policy: 3,
                            },
                          }}
                          onReady={(e) => {
                            playerRef.current = e.target;
                            playerRef.current.setVolume(volume);
                          }}
                          onEnd={handleVideoEnd}
                          // This div needs to correctly apply width/height 100%
                          className="absolute inset-0"
                        />
                        {/* Overlay to block clicks on the player */}
                        <div className="absolute inset-0 z-10 bg-transparent pointer-events-auto"></div>
                      </div>

                      {/* Custom LMS Controls */}
                      <div
                        className={`flex items-center justify-between mt-2 gap-4 ${
                          isFullscreen
                            ? "absolute bottom-4 left-4 right-4 z-[9999] bg-black/50 p-4 rounded-lg"
                            : ""
                        }`}
                      >
                        {/* Play/Pause Button */}
                        <Button
                          size="sm"
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

                        {/* Progress Bar */}
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
                          className="flex-1 h-1 rounded-lg bg-gray-300 accent-primary"
                        />

                        {/* Volume Slider */}
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
                          className="w-24 h-1 rounded-lg bg-gray-300 accent-primary"
                        />

                        {/* Fullscreen Button */}
                        <Button size="sm" onClick={toggleFullscreen}>
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

                  {/* <Button
                    onClick={() => document && setShowDocumentViewer(true)}
                    disabled={!document}
                  >
                    View Document
                  </Button> */}

                  {/* <Button
                    onClick={() => {
                      setSelectedModule({
                        ...selectedModule,
                        document: {
                          id: "2",
                          file_name: "Software_Development.pdf",
                          file_url:
                            "/uploads/documents/Software_Development.pdf",
                        },
                      });
                      setShowDocumentViewer(true);
                    }}
                  >
                    View Document
                  </Button> */}
                  <Button
                    onClick={() => {
                      if (!progressData?.documents?.length) {
                        toast({
                          title: "No Document Found",
                          description:
                            "There is no document available for this training.",
                          variant: "destructive",
                        });
                        return;
                      }

                      setSelectedModule((prev) => ({
                        ...prev!,
                        document: progressData.documents[0], // always show first training document
                      }));
                      setShowDocumentViewer(true);
                    }}
                  >
                    View Document
                  </Button>

                  {/* {!selectedModule.is_preview &&
                    selectedModule.status !== "completed" && (
                      <Button
                        onClick={() => markModuleComplete(selectedModule.id)}
                        disabled={updatingProgress}
                      >
                        {updatingProgress ? "Updating..." : "Mark Complete"}
                      </Button>
                    )} */}
                </CardContent>
              </Card>
            ) : (
              <p>Select a module to view its content.</p>
            )}

            {/* Professional Quiz */}
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

                            {/* Navigation */}
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

            {/* Reviews */}
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

      {showDocumentViewer && selectedModule?.document && (
        <DocumentViewer
          document={selectedModule.document}
          onClose={() => setShowDocumentViewer(false)}
          userName={user?.full_name || "Authorized User"}
        />
      )}
      {/* {showDocumentViewer && document && (
        <DocumentViewer
          document={document}
          onClose={() => setShowDocumentViewer(false)}
        />
      )} */}

      {/* Learning Statistics Card */}
      <Card className="mt-4">
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
