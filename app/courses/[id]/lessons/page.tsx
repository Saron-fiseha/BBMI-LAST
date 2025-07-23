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
// } from "lucide-react";
// import Link from "next/link";
// import { Alert, AlertDescription } from "@/components/ui/alert";

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
// }

// interface Training {
//   id: string;
//   name: string;
//   description: string;
//   instructor_name: string;
//   level: string;
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
//           setShowCertificateAlert(true);

//           // Poll every 3 seconds for certificate until it's available
//           const pollCertificate = setInterval(async () => {
//             const res = await fetch(
//               `/api/progress/${progressData.enrollment.training_id}`,
//               {
//                 headers: {
//                   Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
//                 },
//               }
//             );
//             const refreshedData = await res.json();

//             if (refreshedData.certificate) {
//               setProgressData(refreshedData);
//               clearInterval(pollCertificate);
//             }
//           }, 3000);
//         }
//         // if (data.trainingCompleted) {
//         //   toast({
//         //     title: "🎉 Training Completed!",
//         //     description:
//         //       "Congratulations! Your certificate is being generated.",
//         //   });

//         //   setShowCertificateAlert(true);

//         //   // Refresh data to get certificate after a short delay
//         //   setTimeout(() => {
//         //     window.location.reload();
//         //   }, 3000);
//         // }
//       } else {
//         throw new Error(data.message || "Failed to update progress");
//       }
//     } catch (error) {
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
//           grade: "Completed",
//           duration: `${Math.floor(progressData.statistics.total_time_spent / 60)} hours`,
//           skills: ["Professional Training", "Skill Development"],
//           trainingDescription: `professional ${progressData.enrollment.training_title.toLowerCase()} techniques`,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to download certificate");
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `BBMI-Certificate-${progressData.certificate.certificate_number}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);

//       toast({
//         title: "Certificate Downloaded! 🎓",
//         description: "Your BBMI certificate has been downloaded successfully.",
//       });
//     } catch (error) {
//       toast({
//         title: "Download Failed",
//         description:
//           error instanceof Error
//             ? error.message
//             : "Failed to download certificate",
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

//   return (
//     <div className="min-h-screen flex flex-col">
//       <SiteHeader />
//       <main className="flex-1">
//         {/* Certificate Completion Alert */}
//         {showCertificateAlert && progressData.certificate && (
//           <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
//             <div className="container py-4">
//               <Alert className="border-yellow-300 bg-yellow-50">
//                 <Trophy className="h-5 w-5 text-yellow-600" />
//                 <AlertDescription className="text-yellow-800">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <strong>🎉 Congratulations!</strong> You have successfully
//                       completed the training and earned your BBMI certificate!
//                     </div>
//                     <Button
//                       onClick={downloadCertificate}
//                       disabled={downloadingCertificate}
//                       className="bg-yellow-600 hover:bg-yellow-700 text-white ml-4"
//                       size="sm"
//                     >
//                       {downloadingCertificate ? (
//                         <>
//                           <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                           Downloading...
//                         </>
//                       ) : (
//                         <>
//                           <Download className="h-4 w-4 mr-2" />
//                           Download Certificate
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 </AlertDescription>
//               </Alert>
//             </div>
//           </div>
//         )}

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
//                         Downloading...
//                       </>
//                     ) : (
//                       <>
//                         <Download className="h-4 w-4 mr-2" />
//                         Download Certificate
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
//         </div>
//       </main>
//       <SiteFooter />
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
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
import {
  Play,
  CheckCircle,
  Clock,
  ArrowLeft,
  BookOpen,
  Award,
  Lock,
  Eye,
  Download,
  Loader2,
  Trophy,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
}

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
  const [showCertificateAlert, setShowCertificateAlert] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

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

        if (!response.ok) {
          if (response.status === 403) {
            router.push(`/courses/${resolvedParams.id}`);
            return;
          }
          throw new Error("Failed to fetch progress data");
        }

        const data = await response.json();
        console.log("Progress data received:", data);
        setProgressData(data);

        // Show certificate alert if training is completed
        if (data.enrollment.status === "completed" && data.certificate) {
          setShowCertificateAlert(true);
        }

        // Set first available module as selected
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
        console.error("Error fetching progress data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load training data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [params, isAuthenticated, router]);

  const getYouTubeVideoId = (url: string): string => {
    const regex =
      /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|embed|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  const canAccessModule = (module: Module): boolean => {
    if (!progressData) return false;

    return (
      module.is_preview ||
      module.status === "completed" ||
      progressData.modules
        .filter((m) => m.order_index < module.order_index)
        .every((m) => m.status === "completed")
    );
  };

  const markModuleComplete = async (moduleId: string) => {
    if (!progressData || updatingProgress) return;

    setUpdatingProgress(true);
    try {
      console.log("Marking module complete:", moduleId);

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
      console.log("Progress update response:", data);

      if (data.success) {
        // Update local state
        setProgressData((prev) => {
          if (!prev) return prev;

          const updatedModules = prev.modules.map((module) =>
            module.id === moduleId
              ? {
                  ...module,
                  status: "completed" as const,
                  progress_percentage: 100,
                }
              : module
          );

          return {
            ...prev,
            modules: updatedModules,
            enrollment: {
              ...prev.enrollment,
              progress_percentage:
                data.overallProgress || prev.enrollment.progress_percentage,
              status: data.trainingCompleted
                ? "completed"
                : prev.enrollment.status,
              certificate_issued:
                data.certificateGenerated || prev.enrollment.certificate_issued,
            },
            statistics: {
              ...prev.statistics,
              completed_modules:
                data.completedModules || prev.statistics.completed_modules,
              completion_rate:
                data.overallProgress || prev.statistics.completion_rate,
            },
          };
        });

        toast({
          title: "Module Completed! ✅",
          description: "Great progress! Keep learning.",
        });

        if (data.trainingCompleted) {
          toast({
            title: "🎉 Training Completed!",
            description: data.certificateGenerated
              ? "Congratulations! Your certificate has been generated."
              : "Congratulations! Training completed successfully.",
          });

          if (data.certificateGenerated) {
            setShowCertificateAlert(true);
            // Refresh data to get certificate after a short delay
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      } else {
        throw new Error(data.message || "Failed to update progress");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
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
    if (
      selectedModule &&
      selectedModule.status !== "completed" &&
      !updatingProgress
    ) {
      console.log("Video ended, marking module complete");
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
          studentName: user?.full_name || user?.full_name || "Student",
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

      // Open certificate in new window for printing/saving
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();

        // Trigger print dialog after content loads
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print();
          }, 500);
        };
      }

      toast({
        title: "Certificate Generated! 🎓",
        description:
          "Your BBMI certificate has been opened in a new window. You can print or save it as PDF.",
      });
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading training modules...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-destructive mb-4">
                {error || "Training data not found"}
              </p>
              <Button asChild>
                <Link href="/courses">Back to Courses</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Certificate Completion Alert */}
        {showCertificateAlert && progressData.certificate && (
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
            <div className="container py-4">
              <Alert className="border-yellow-300 bg-yellow-50">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>🎉 Congratulations!</strong> You have successfully
                      completed the training and earned your BBMI certificate!
                    </div>
                    <Button
                      onClick={downloadCertificate}
                      disabled={downloadingCertificate}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white ml-4"
                      size="sm"
                    >
                      {downloadingCertificate ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          View Certificate
                        </>
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-muted py-8">
          <div className="container">
            <Button variant="ghost" asChild className="mb-4">
              <Link href={`/courses/${progressData.enrollment.training_id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Link>
            </Button>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {progressData.enrollment.training_title}
                </h1>

                <div className="flex items-center gap-4 mb-4">
                  <Badge
                    variant={
                      progressData.enrollment.status === "completed"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {progressData.enrollment.status === "completed" ? (
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        Completed
                      </div>
                    ) : (
                      progressData.enrollment.status
                    )}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {progressData.statistics.completed_modules} of{" "}
                    {progressData.statistics.total_modules} modules completed
                  </div>
                </div>

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
              </div>

              {/* Certificate Section */}
              {progressData.certificate && (
                <div className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                  <div className="relative">
                    <Award className="h-16 w-16 text-yellow-500 mx-auto mb-3" />
                    <div className="absolute -top-1 -right-1">
                      <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-yellow-800 mb-1">
                    Training Completed!
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Certificate #{progressData.certificate.certificate_number}
                  </p>
                  <Button
                    onClick={downloadCertificate}
                    disabled={downloadingCertificate}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
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
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Modules Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Training Modules
                  </CardTitle>
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
                            onClick={() =>
                              canAccess && setSelectedModule(module)
                            }
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

            {/* Module Content */}
            <div className="lg:col-span-2">
              {selectedModule ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">
                          {selectedModule.title}
                        </CardTitle>
                        <p className="text-muted-foreground">
                          {selectedModule.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(selectedModule.duration / 60)} minutes
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Video Player */}
                    {selectedModule.video_url?.trim() && (
                      <div className="aspect-video rounded-lg mb-6 overflow-hidden">
                        <YouTube
                          videoId={getYouTubeVideoId(selectedModule.video_url)}
                          className="w-full h-full"
                          onEnd={handleVideoEnd}
                          opts={{
                            width: "100%",
                            height: "100%",
                            playerVars: {
                              autoplay: 0,
                              controls: 1,
                              rel: 0,
                            },
                          }}
                        />
                      </div>
                    )}

                    {/* Module Content */}
                    <div className="prose max-w-none mb-6">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedModule.content,
                        }}
                      />
                    </div>

                    {/* Module Status */}
                    <div className="flex justify-between items-center pt-6 border-t">
                      <div className="text-sm text-muted-foreground">
                        {selectedModule.status === "completed" ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Module completed
                          </div>
                        ) : selectedModule.is_preview ? (
                          "Preview module - no progress tracking"
                        ) : (
                          `Progress: ${selectedModule.progress_percentage}%`
                        )}
                      </div>

                      {!selectedModule.is_preview &&
                        selectedModule.status !== "completed" && (
                          <Button
                            onClick={() =>
                              markModuleComplete(selectedModule.id)
                            }
                            disabled={updatingProgress}
                          >
                            {updatingProgress ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Mark Complete"
                            )}
                          </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Select a Module
                    </h3>
                    <p className="text-muted-foreground">
                      Choose a module from the sidebar to start learning.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Statistics Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Learning Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {progressData.statistics.total_modules}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Modules
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {progressData.statistics.completed_modules}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(progressData.enrollment.progress_percentage)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.floor(progressData.statistics.total_time_spent / 60)}h{" "}
                    {progressData.statistics.total_time_spent % 60}m
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Time Spent
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
