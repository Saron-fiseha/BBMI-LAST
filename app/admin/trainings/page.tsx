// "use client";

// import type React from "react";
// import { useState, useEffect, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Plus,
//   Edit,
//   Trash2,
//   Search,
//   Loader2,
//   X,
//   AlertCircle,
//   Upload,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { QuizManager } from "@/components/admin/QuizManager";

// // --- Interfaces ---
// interface Training {
//   id: string;
//   name: string;
//   description: string;
//   image_url: string;
//   course_code: string;
//   category_id: string;
//   category_name: string;
//   price: number;
//   discount: number;
//   max_trainees: number;
//   instructor_name: string;
//   instructor_id: string;
//   status: "active" | "inactive" | "draft";
//   level: string;
//   overview: string;
//   what_you_will_learn: string; // Stored as JSON string
//   requirements: string; // Stored as JSON string
//   who_is_for: string; // Stored as JSON string
//   duration: number;
//   sample_video_url: string; // ADDED: Sample video URL
// }

// interface Category {
//   id: string;
//   name: string;
// }
// interface Instructor {
//   id: string;
//   name: string;
//   email: string;
// }

// // --- Helper functions ---
// const parseJsonStringForTextarea = (
//   jsonString: string | undefined | null
// ): string => {
//   if (!jsonString) return "";
//   try {
//     const array = JSON.parse(jsonString);
//     return Array.isArray(array) ? array.join("\n") : "";
//   } catch {
//     return typeof jsonString === "string" ? jsonString : "";
//   }
// };

// const getStatusColor = (status: string) => {
//   switch (status) {
//     case "active":
//       return "bg-green-100 text-green-800 border-green-200";
//     case "inactive":
//       return "bg-gray-100 text-gray-800 border-gray-200";
//     case "draft":
//       return "bg-yellow-100 text-yellow-800 border-yellow-200";
//     default:
//       return "bg-gray-100 text-gray-800 border-gray-200";
//   }
// };

// export default function TrainingsPage() {
//   const { toast } = useToast();
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // --- State Declarations ---
//   const [trainings, setTrainings] = useState<Training[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [instructors, setInstructors] = useState<Instructor[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<"details" | "quiz">("details");

//   const [searchQuery, setSearchQuery] = useState(
//     searchParams.get("search") || ""
//   );
//   const [filterCategory, setFilterCategory] = useState(
//     searchParams.get("category") || "all"
//   );
//   const [filterStatus, setFilterStatus] = useState(
//     searchParams.get("status") || "all"
//   );
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [showEditForm, setShowEditForm] = useState(false);
//   const [editingTraining, setEditingTraining] =
//     useState<Partial<Training> | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [uploadingFile, setUploadingFile] = useState(false);
//   const [uploadingDocument, setUploadingDocument] = useState(false); // ADDED: New state for document upload

//   const initialNewTrainingState = {
//     name: "",
//     description: "",
//     image_url: "",
//     course_code: "",
//     category_id: "",
//     price: 0,
//     discount: 0,
//     max_trainees: 5,
//     instructor_id: "",
//     instructor_name: "",
//     status: "draft" as "active" | "inactive" | "draft",
//     level: "Beginner",
//     overview: "",
//     what_you_will_learn: "",
//     requirements: "",
//     who_is_for: "",
//     duration: 0,
//     sample_video_url: "", // ADDED: Initial state for sample video URL
//   };
//   const [newTraining, setNewTraining] = useState(initialNewTrainingState);

//   // --- Data Fetching ---
//   const fetchDependencies = useCallback(async () => {
//     try {
//       const [catResponse, instResponse] = await Promise.all([
//         fetch("/api/admin/categories", { cache: "no-store" }),
//         fetch("/api/admin/instructors/available", { cache: "no-store" }),
//       ]);
//       if (catResponse.ok)
//         setCategories((await catResponse.json()).categories || []);
//       if (instResponse.ok)
//         setInstructors((await instResponse.json()).instructors || []);
//     } catch (e) {
//       toast({
//         title: "Error",
//         description: "Could not load categories or instructors.",
//         variant: "destructive",
//       });
//     }
//   }, [toast]);

//   const fetchTrainings = useCallback(
//     async (search: string, category: string, status: string) => {
//       setLoading(true);
//       setError(null);
//       try {
//         const params = new URLSearchParams({ search, category, status });
//         const response = await fetch(
//           `/api/admin/trainings?${params.toString()}`,
//           { cache: "no-store" }
//         );
//         if (!response.ok) {
//           const errorData = await response
//             .json()
//             .catch(() => ({ error: "An unknown API error occurred." }));
//           throw new Error(
//             errorData.error || `Failed to fetch: Status ${response.status}`
//           );
//         }
//         const data = await response.json();
//         setTrainings(data.trainings || []);
//       } catch (e) {
//         const errorMessage =
//           e instanceof Error ? e.message : "An unknown error occurred";
//         setError(errorMessage);
//         setTrainings([]);
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   useEffect(() => {
//     const search = searchParams.get("search") || "";
//     const category = searchParams.get("category") || "all";
//     const status = searchParams.get("status") || "all";
//     fetchTrainings(search, category, status);
//   }, [searchParams, fetchTrainings]);

//   useEffect(() => {
//     fetchDependencies();
//   }, [fetchDependencies]);

//   // --- Event Handlers ---
//   const handleFileUpload = async (file: File) => {
//     setUploadingFile(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await fetch("/api/admin/trainings/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       if (!response.ok || !data.success) {
//         throw new Error(data.error || "Failed to upload file");
//       }

//       const imagePath = data.filePath;
//       if (showEditForm && editingTraining) {
//         setEditingTraining({ ...editingTraining, image_url: imagePath });
//       } else {
//         setNewTraining({ ...newTraining, image_url: imagePath });
//       }
//       toast({ title: "Success", description: "Image uploaded." });
//     } catch (error) {
//       toast({
//         title: "Upload Error",
//         description:
//           error instanceof Error ? error.message : "An error occurred.",
//         variant: "destructive",
//       });
//     } finally {
//       setUploadingFile(false);
//     }
//   };

//   // ADDED: New handler for document upload
//   const handleDocumentUpload = async (file: File) => {
//     setUploadingDocument(true);
//     try {
//       if (!editingTraining?.id) {
//         // Documents can only be uploaded for existing trainings (which have an ID)
//         throw new Error(
//           "Cannot upload document without a training ID. Please save the training first."
//         );
//       }
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("trainingId", editingTraining.id); // Associate with the current training being edited

//       const response = await fetch("/api/admin/trainings/upload-document", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       if (!response.ok || !data.success) {
//         throw new Error(data.error || "Failed to upload document");
//       }

//       toast({
//         title: "Success",
//         description: `Document '${file.name}' uploaded successfully.`,
//       });
//       // To display uploaded documents, you would typically refetch the training's documents
//       // or update a local state that holds document information.
//       // For this request, we're only implementing the upload functionality.
//     } catch (error) {
//       toast({
//         title: "Document Upload Error",
//         description:
//           error instanceof Error
//             ? error.message
//             : "An error occurred during document upload.",
//         variant: "destructive",
//       });
//     } finally {
//       setUploadingDocument(false);
//     }
//   };

//   const handleCreateTraining = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true);
//     try {
//       const response = await fetch("/api/admin/trainings", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newTraining),
//       });
//       const data = await response.json();
//       if (!response.ok)
//         throw new Error(data.error || "Failed to create training");
//       toast({
//         title: "Success",
//         description: "Training created successfully.",
//       });
//       setShowCreateForm(false);
//       setNewTraining(initialNewTrainingState);
//       fetchTrainings(searchQuery, filterCategory, filterStatus);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error ? error.message : "Could not create training.",
//         variant: "destructive",
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleEditTraining = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!editingTraining) return;
//     setSubmitting(true);
//     try {
//       const response = await fetch("/api/admin/trainings", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(editingTraining),
//       });
//       const data = await response.json();
//       if (!response.ok)
//         throw new Error(data.error || "Failed to update training");
//       toast({
//         title: "Success",
//         description: "Training updated successfully.",
//       });
//       setShowEditForm(false);
//       setEditingTraining(null);
//       fetchTrainings(searchQuery, filterCategory, filterStatus);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error ? error.message : "Could not update training.",
//         variant: "destructive",
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDeleteTraining = async (trainingId: string) => {
//     if (
//       !confirm(
//         "Are you sure you want to delete this training? This cannot be undone."
//       )
//     )
//       return;
//     try {
//       const response = await fetch(`/api/admin/trainings?id=${trainingId}`, {
//         method: "DELETE",
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || "Failed to delete");
//       toast({ title: "Success", description: "Training has been deleted." });
//       fetchTrainings(searchQuery, filterCategory, filterStatus);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error ? error.message : "Could not delete training.",
//         variant: "destructive",
//       });
//     }
//   };

//   const openEditForm = (training: Training) => {
//     setEditingTraining({
//       ...training,
//       what_you_will_learn: parseJsonStringForTextarea(
//         training.what_you_will_learn
//       ),
//       requirements: parseJsonStringForTextarea(training.requirements),
//       who_is_for: parseJsonStringForTextarea(training.who_is_for),
//       sample_video_url: training.sample_video_url || "", // ADDED: Initialize sample video URL
//     });
//     setShowEditForm(true);
//   };

//   const renderFormFields = (
//     data: typeof newTraining | Partial<Training>,
//     setData: (d: any) => void
//   ) => (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Training Name *
//           </label>
//           <Input
//             value={data.name}
//             onChange={(e) => setData({ ...data, name: e.target.value })}
//             required
//             disabled={submitting}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Course Code *
//           </label>
//           <Input
//             value={data.course_code}
//             onChange={(e) => setData({ ...data, course_code: e.target.value })}
//             required
//             disabled={submitting}
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-1">
//           Short Description *
//         </label>
//         <Textarea
//           value={data.description}
//           onChange={(e) => setData({ ...data, description: e.target.value })}
//           rows={3}
//           required
//           disabled={submitting}
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-1">Training Image</label>
//         <div className="flex items-center gap-4">
//           <input
//             type="file"
//             id="file-upload"
//             className="hidden"
//             accept="image/*"
//             onChange={(e) => {
//               if (e.target.files && e.target.files[0]) {
//                 handleFileUpload(e.target.files[0]);
//               }
//             }}
//             disabled={uploadingFile || submitting}
//           />
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => document.getElementById("file-upload")?.click()}
//             disabled={uploadingFile || submitting}
//           >
//             {uploadingFile ? (
//               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//             ) : (
//               <Upload className="h-4 w-4 mr-2" />
//             )}
//             {uploadingFile ? "Uploading..." : "Upload Image"}
//           </Button>
//           {data.image_url && (
//             <div className="relative w-24 h-16 rounded-md border overflow-hidden">
//               <Image
//                 src={data.image_url}
//                 alt="Preview"
//                 layout="fill"
//                 objectFit="cover"
//               />
//               <Button
//                 type="button"
//                 size="icon"
//                 variant="destructive"
//                 className="absolute top-0 right-0 h-5 w-5 opacity-75 hover:opacity-100"
//                 onClick={() => setData({ ...data, image_url: "" })}
//                 disabled={submitting}
//               >
//                 <X className="h-3 w-3" />
//               </Button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ADDED: Sample Video URL Field */}
//       <div>
//         <label className="block text-sm font-medium mb-1">
//           Sample Video URL
//         </label>
//         <Input
//           value={data.sample_video_url}
//           onChange={(e) =>
//             setData({ ...data, sample_video_url: e.target.value })
//           }
//           placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
//           disabled={submitting}
//         />
//       </div>

//       {/* ADDED: Document Upload Field (Enabled only for editing existing trainings) */}
//       <div>
//         <label className="block text-sm font-medium mb-1">
//           Upload Documents
//         </label>
//         <div className="flex items-center gap-4">
//           <input
//             type="file"
//             id="document-upload"
//             className="hidden"
//             accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" // Common document types
//             onChange={(e) => {
//               if (e.target.files && e.target.files[0]) {
//                 handleDocumentUpload(e.target.files[0]);
//               }
//             }}
//             // Disable if submitting, currently uploading, or in create mode (no training ID yet)
//             disabled={uploadingDocument || submitting || !showEditForm}
//           />
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => document.getElementById("document-upload")?.click()}
//             disabled={uploadingDocument || submitting || !showEditForm}
//           >
//             {uploadingDocument ? (
//               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//             ) : (
//               <Upload className="h-4 w-4 mr-2" />
//             )}
//             {uploadingDocument ? "Uploading Document..." : "Upload Document"}
//           </Button>
//           {!showEditForm && (
//             <span className="text-sm text-gray-500">
//               Documents can be added after creating the training.
//             </span>
//           )}
//           {/* Future improvement: Display a list of uploaded documents here */}
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-1">
//           Detailed Overview
//         </label>
//         <Textarea
//           value={data.overview}
//           onChange={(e) => setData({ ...data, overview: e.target.value })}
//           rows={5}
//           placeholder="Provide a detailed overview of the training."
//           disabled={submitting}
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             What You'll Learn (one per line)
//           </label>
//           <Textarea
//             value={data.what_you_will_learn}
//             onChange={(e) =>
//               setData({ ...data, what_you_will_learn: e.target.value })
//             }
//             placeholder="e.g., Master advanced techniques..."
//             rows={6}
//             disabled={submitting}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Requirements (one per line)
//           </label>
//           <Textarea
//             value={data.requirements}
//             onChange={(e) => setData({ ...data, requirements: e.target.value })}
//             placeholder="e.g., Basic knowledge of subject..."
//             rows={6}
//             disabled={submitting}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Who This Is For (one per line)
//           </label>
//           <Textarea
//             value={data.who_is_for}
//             onChange={(e) => setData({ ...data, who_is_for: e.target.value })}
//             placeholder="e.g., Aspiring professionals..."
//             rows={6}
//             disabled={submitting}
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">Category *</label>
//           <Select
//             value={data.category_id}
//             onValueChange={(value) => setData({ ...data, category_id: value })}
//             disabled={submitting}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select category" />
//             </SelectTrigger>
//             <SelectContent>
//               {categories.map((c) => (
//                 <SelectItem key={c.id} value={c.id}>
//                   {c.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Instructor</label>
//           <Select
//             value={data.instructor_id || ""}
//             onValueChange={(value) =>
//               setData({
//                 ...data,
//                 instructor_id: value,
//                 instructor_name:
//                   instructors.find((i) => i.id === value)?.name || "",
//               })
//             }
//             disabled={submitting}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select instructor" />
//             </SelectTrigger>
//             <SelectContent>
//               {instructors.map((i) => (
//                 <SelectItem key={i.id} value={String(i.id)}>
//                   {i.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Level *</label>
//           <Select
//             value={data.level}
//             onValueChange={(value) => setData({ ...data, level: value })}
//             disabled={submitting}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select level" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="Beginner">Beginner</SelectItem>
//               <SelectItem value="Intermediate">Intermediate</SelectItem>
//               <SelectItem value="Advanced">Advanced</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">Price ($)</label>
//           <Input
//             type="number"
//             value={data.price}
//             onChange={(e) =>
//               setData({ ...data, price: Number(e.target.value) })
//             }
//             min="0"
//             step="0.01"
//             disabled={submitting}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Discount (%)</label>
//           <Input
//             type="number"
//             value={data.discount}
//             onChange={(e) =>
//               setData({ ...data, discount: Number(e.target.value) })
//             }
//             min="0"
//             max="100"
//             disabled={submitting}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Max Trainees</label>
//           <Input
//             type="number"
//             value={data.max_trainees}
//             onChange={(e) =>
//               setData({ ...data, max_trainees: Number(e.target.value) })
//             }
//             min="0"
//             disabled={submitting}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Duration (minutes)
//           </label>
//           <Input
//             type="number"
//             value={data.duration}
//             onChange={(e) =>
//               setData({ ...data, duration: Number(e.target.value) })
//             }
//             min="0"
//             disabled={submitting}
//           />
//         </div>
//       </div>
//       <div>
//         <label className="block text-sm font-medium mb-1">Status *</label>
//         <Select
//           value={data.status}
//           onValueChange={(value: "active" | "inactive" | "draft") =>
//             setData({ ...data, status: value })
//           }
//           disabled={submitting}
//         >
//           <SelectTrigger className="w-full md:w-1/3">
//             <SelectValue placeholder="Select status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="draft">Draft</SelectItem>
//             <SelectItem value="active">Active</SelectItem>
//             <SelectItem value="inactive">Inactive</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen w-full bg-ivory">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 animate-spin text-mustard mx-auto mb-4" />
//           <p className="text-lg text-deep-purple">Loading Trainings...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-6 bg-ivory min-h-screen">
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-charcoal">Trainings</h1>
//           <p className="text-muted-foreground">
//             Manage all available training courses.
//           </p>
//         </div>
//         <Button
//           onClick={() => setShowCreateForm(true)}
//           className="bg-mustard hover:bg-mustard/90 text-ivory mt-4 sm:mt-0"
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Add New Training
//         </Button>
//       </div>

//       {error && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             <strong>Error:</strong> {error}
//             <Button
//               variant="outline"
//               size="sm"
//               className="ml-4"
//               onClick={() =>
//                 fetchTrainings(searchQuery, filterCategory, filterStatus)
//               }
//             >
//               Retry
//             </Button>
//           </AlertDescription>
//         </Alert>
//       )}

//       <div className="bg-white border border-mustard/20 rounded-lg shadow-sm">
//         <div className="p-4 border-b">
//           {/* Filters UI can go here if needed */}
//         </div>

//         <div className="w-full overflow-x-auto">
//           <div className="max-h-[60vh] overflow-y-auto">
//             <Table className="min-w-[1200px]">
//               <TableHeader className="sticky top-0 bg-gray-50 z-10">
//                 <TableRow>
//                   <TableHead className="w-[350px]">Training</TableHead>
//                   <TableHead>Code</TableHead>
//                   <TableHead>Category</TableHead>
//                   <TableHead>Instructor</TableHead>
//                   <TableHead>Price</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {trainings.length === 0 && !error ? (
//                   <TableRow>
//                     <TableCell colSpan={7} className="text-center h-48">
//                       No Trainings Found.
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   trainings.map((training) => (
//                     <TableRow key={training.id}>
//                       <TableCell>
//                         <div className="flex items-center gap-3">
//                           <Image
//                             src={training.image_url || "/placeholder.svg"}
//                             alt={training.name}
//                             width={40}
//                             height={40}
//                             className="rounded-md object-cover"
//                           />
//                           <span className="font-bold">{training.name}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>{training.course_code}</TableCell>
//                       <TableCell>{training.category_name}</TableCell>
//                       <TableCell>{training.instructor_name || "N/A"}</TableCell>
//                       <TableCell>
//                         {training.price != null
//                           ? `$${Number(training.price).toFixed(2)}`
//                           : "N/A"}
//                       </TableCell>
//                       <TableCell>
//                         <Badge className={getStatusColor(training.status)}>
//                           {training.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex gap-2 justify-end">
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             onClick={() => openEditForm(training)}
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="destructive"
//                             size="icon"
//                             onClick={() => handleDeleteTraining(training.id)}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </div>

//       {(showCreateForm || (showEditForm && editingTraining)) && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] shadow-xl flex flex-col">
//             <div className="p-6 border-b flex justify-between items-center">
//               <h2 className="text-2xl font-bold">
//                 {showEditForm ? "Edit Training" : "Create New Training"}
//               </h2>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => {
//                   setShowCreateForm(false);
//                   setShowEditForm(false);
//                   setEditingTraining(null);
//                 }}
//                 disabled={submitting}
//               >
//                 <X className="h-5 w-5" />
//               </Button>
//             </div>
//             {/* <div className="overflow-y-auto flex-grow">
//               <form
//                 id="training-form"
//                 onSubmit={
//                   showEditForm ? handleEditTraining : handleCreateTraining
//                 }
//                 className="p-6"
//               >
//                 {renderFormFields(
//                   showEditForm ? editingTraining! : newTraining,
//                   showEditForm ? setEditingTraining : setNewTraining
//                 )}
//               </form>
//             </div> */}
//             <div className="overflow-y-auto flex-grow">
//               <form
//                 id="training-form"
//                 onSubmit={
//                   showEditForm ? handleEditTraining : handleCreateTraining
//                 }
//                 className="p-6"
//               >
//                 {/* Tabs */}
//                 <div className="flex border-b mb-4">
//                   <button
//                     type="button"
//                     className={`px-4 py-2 ${
//                       activeTab === "details"
//                         ? "border-b-2 border-mustard font-semibold"
//                         : "text-muted-foreground"
//                     }`}
//                     onClick={() => setActiveTab("details")}
//                   >
//                     Training Details
//                   </button>
//                   {showEditForm && (
//                     <button
//                       type="button"
//                       className={`px-4 py-2 ${
//                         activeTab === "quiz"
//                           ? "border-b-2 border-mustard font-semibold"
//                           : "text-muted-foreground"
//                       }`}
//                       onClick={() => setActiveTab("quiz")}
//                     >
//                       Quiz
//                     </button>
//                   )}
//                 </div>

//                 {/* Tab Content */}
//                 {activeTab === "details" &&
//                   renderFormFields(
//                     showEditForm ? editingTraining! : newTraining,
//                     showEditForm ? setEditingTraining : setNewTraining
//                   )}

//                 {activeTab === "quiz" &&
//                   showEditForm &&
//                   editingTraining?.id && (
//                     <div className="mt-4">
//                       <QuizManager trainingId={editingTraining.id} />
//                     </div>
//                   )}
//               </form>
//             </div>

//             <div className="flex justify-end space-x-2 p-4 border-t bg-gray-50 rounded-b-lg">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   setShowCreateForm(false);
//                   setShowEditForm(false);
//                   setEditingTraining(null);
//                 }}
//                 disabled={submitting}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 form="training-form"
//                 disabled={submitting || uploadingFile || uploadingDocument}
//                 className="bg-mustard hover:bg-mustard/90 text-ivory"
//               >
//                 {submitting ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : showEditForm ? (
//                   "Save Changes"
//                 ) : (
//                   "Create Training"
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Search, // Imported for search functionality
  Loader2,
  X,
  AlertCircle,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QuizManager } from "@/components/admin/QuizManager";

// --- Interfaces ---
interface Training {
  id: string;
  name: string;
  description: string;
  image_url: string;
  course_code: string;
  category_id: string;
  category_name: string;
  price: number;
  discount: number;
  max_trainees: number;
  instructor_name: string;
  instructor_id: string;
  status: "active" | "inactive" | "draft";
  level: string;
  overview: string;
  what_you_will_learn: string; // Stored as JSON string
  requirements: string; // Stored as JSON string
  who_is_for: string; // Stored as JSON string
  duration: number;
  sample_video_url: string; // Sample video URL
}

interface Category {
  id: string;
  name: string;
}

interface Instructor {
  id: string;
  full_name: string; // Updated to 'full_name' to match database schema
  email: string;
}

// --- Helper functions ---
const parseJsonStringForTextarea = (
  jsonString: string | undefined | null
): string => {
  if (!jsonString) return "";
  try {
    const array = JSON.parse(jsonString);
    return Array.isArray(array) ? array.join("\n") : "";
  } catch {
    return typeof jsonString === "string" ? jsonString : "";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "draft":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Debounce function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function TrainingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- State Declarations ---
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "quiz">("details");

  // Filter/Search States - these will be updated from URL in useEffect
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [filterCategory, setFilterCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [filterStatus, setFilterStatus] = useState(
    searchParams.get("status") || "all"
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTraining, setEditingTraining] =
    useState<Partial<Training> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const initialNewTrainingState = {
    name: "",
    description: "",
    image_url: "",
    course_code: "",
    category_id: "",
    price: 0,
    discount: 0,
    max_trainees: 5,
    instructor_id: "",
    instructor_name: "",
    status: "draft" as "active" | "inactive" | "draft",
    level: "Beginner",
    overview: "",
    what_you_will_learn: "",
    requirements: "",
    who_is_for: "",
    duration: 0,
    sample_video_url: "",
  };
  const [newTraining, setNewTraining] = useState(initialNewTrainingState);

  // Update URL when filters change
  const updateURL = useCallback(
    (newParams: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Debounced search function that calls updateURL
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      updateURL({ search: search, page: "1" }); // Reset page to 1 on new search
    }, 300),
    [updateURL]
  );

  // --- Data Fetching ---
  const fetchDependencies = useCallback(async () => {
    try {
      const [catResponse, instResponse] = await Promise.all([
        fetch("/api/admin/categories", { cache: "no-store" }),
        fetch("/api/admin/instructors/available", { cache: "no-store" }),
      ]);
      if (catResponse.ok) {
        // Ensure category IDs are strings when setting state to match Select component's expectation
        const fetchedCategories = (await catResponse.json()).categories || [];
        setCategories(
          fetchedCategories.map((cat: any) => ({ ...cat, id: String(cat.id) }))
        );
      }
      if (instResponse.ok) {
        setInstructors((await instResponse.json()).instructors || []);
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not load categories or instructors.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // fetchTrainings now relies on the actual URL parameters
  const fetchTrainings = useCallback(
    async (search: string, category: string, status: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ search, category, status });
        const response = await fetch(
          `/api/admin/trainings?${params.toString()}`,
          { cache: "no-store" }
        );
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "An unknown API error occurred." }));
          throw new Error(
            errorData.error || `Failed to fetch: Status ${response.status}`
          );
        }
        const data = await response.json();
        setTrainings(data.trainings || []);
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : "An unknown error occurred";
        setError(errorMessage);
        setTrainings([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Effect to fetch data when URL params change (driven by searchParams)
  useEffect(() => {
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const status = searchParams.get("status") || "all";

    // Keep local states in sync with URL for input/select values
    setSearchQuery(search);
    setFilterCategory(category);
    setFilterStatus(status);

    fetchTrainings(search, category, status);
  }, [searchParams, fetchTrainings]); // Re-run when searchParams or fetchTrainings changes

  // Fetch dependencies once on mount
  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  // Handler for search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value); // Update local state immediately for UI responsiveness
    debouncedSearch(value); // Debounced call to update URL
  };

  // Handler for category filter change
  const handleCategoryChange = (category: string) => {
    setFilterCategory(category);
    updateURL({ category: category, page: "1" }); // Reset page to 1 on filter change
  };

  // Handler for status filter change
  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    updateURL({ status: status, page: "1" }); // Reset page to 1 on filter change
  };

  // --- Event Handlers for Forms and Actions ---
  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/trainings/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload file");
      }

      const imagePath = data.filePath;
      if (showEditForm && editingTraining) {
        setEditingTraining({ ...editingTraining, image_url: imagePath });
      } else {
        setNewTraining({ ...newTraining, image_url: imagePath });
      }
      toast({ title: "Success", description: "Image uploaded." });
    } catch (error) {
      toast({
        title: "Upload Error",
        description:
          error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    setUploadingDocument(true);
    try {
      if (!editingTraining?.id) {
        throw new Error(
          "Cannot upload document without a training ID. Please save the training first."
        );
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("trainingId", editingTraining.id);

      const response = await fetch("/api/admin/trainings/upload-document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload document");
      }

      toast({
        title: "Success",
        description: `Document '${file.name}' uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Document Upload Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during document upload.",
        variant: "destructive",
      });
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTraining),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to create training");
      toast({
        title: "Success",
        description: "Training created successfully.",
      });
      setShowCreateForm(false);
      setNewTraining(initialNewTrainingState);
      // Re-fetch trainings based on current URL params
      const currentSearch = searchParams.get("search") || "";
      const currentCategory = searchParams.get("category") || "all";
      const currentStatus = searchParams.get("status") || "all";
      fetchTrainings(currentSearch, currentCategory, currentStatus);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Could not create training.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTraining) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/trainings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTraining),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update training");
      toast({
        title: "Success",
        description: "Training updated successfully.",
      });
      setShowEditForm(false);
      setEditingTraining(null);
      // Re-fetch trainings based on current URL params
      const currentSearch = searchParams.get("search") || "";
      const currentCategory = searchParams.get("category") || "all";
      const currentStatus = searchParams.get("status") || "all";
      fetchTrainings(currentSearch, currentCategory, currentStatus);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Could not update training.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTraining = async (trainingId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this training? This cannot be undone."
      )
    )
      return;
    try {
      const response = await fetch(`/api/admin/trainings?id=${trainingId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete");
      toast({ title: "Success", description: "Training has been deleted." });
      // Re-fetch trainings based on current URL params
      const currentSearch = searchParams.get("search") || "";
      const currentCategory = searchParams.get("category") || "all";
      const currentStatus = searchParams.get("status") || "all";
      fetchTrainings(currentSearch, currentCategory, currentStatus);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Could not delete training.",
        variant: "destructive",
      });
    }
  };

  const openEditForm = (training: Training) => {
    setEditingTraining({
      ...training,
      what_you_will_learn: parseJsonStringForTextarea(
        training.what_you_will_learn
      ),
      requirements: parseJsonStringForTextarea(training.requirements),
      who_is_for: parseJsonStringForTextarea(training.who_is_for),
      sample_video_url: training.sample_video_url || "",
    });
    setShowEditForm(true);
  };

  // --- Render Form Fields Helper ---
  const renderFormFields = (
    data: typeof newTraining | Partial<Training>,
    setData: (d: any) => void
  ) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Training Name *
          </label>
          <Input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Course Code *
          </label>
          <Input
            value={data.course_code}
            onChange={(e) => setData({ ...data, course_code: e.target.value })}
            required
            disabled={submitting}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Short Description *
        </label>
        <Textarea
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          rows={3}
          required
          disabled={submitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Training Image</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            disabled={uploadingFile || submitting}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={uploadingFile || submitting}
          >
            {uploadingFile ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploadingFile ? "Uploading..." : "Upload Image"}
          </Button>
          {data.image_url && (
            <div className="relative w-24 h-16 rounded-md border overflow-hidden">
              <Image
                src={data.image_url}
                alt="Preview"
                layout="fill"
                objectFit="cover"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-0 right-0 h-5 w-5 opacity-75 hover:opacity-100"
                onClick={() => setData({ ...data, image_url: "" })}
                disabled={submitting}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Sample Video URL
        </label>
        <Input
          value={data.sample_video_url}
          onChange={(e) =>
            setData({ ...data, sample_video_url: e.target.value })
          }
          placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          disabled={submitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Upload Documents
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="document-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleDocumentUpload(e.target.files[0]);
              }
            }}
            disabled={uploadingDocument || submitting || !showEditForm}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("document-upload")?.click()}
            disabled={uploadingDocument || submitting || !showEditForm}
          >
            {uploadingDocument ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploadingDocument ? "Uploading Document..." : "Upload Document"}
          </Button>
          {!showEditForm && (
            <span className="text-sm text-gray-500">
              Documents can be added after creating the training.
            </span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Detailed Overview
        </label>
        <Textarea
          value={data.overview}
          onChange={(e) => setData({ ...data, overview: e.target.value })}
          rows={5}
          placeholder="Provide a detailed overview of the training."
          disabled={submitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            What You'll Learn (one per line)
          </label>
          <Textarea
            value={data.what_you_will_learn}
            onChange={(e) =>
              setData({ ...data, what_you_will_learn: e.target.value })
            }
            placeholder="e.g., Master advanced techniques..."
            rows={6}
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Requirements (one per line)
          </label>
          <Textarea
            value={data.requirements}
            onChange={(e) => setData({ ...data, requirements: e.target.value })}
            placeholder="e.g., Basic knowledge of subject..."
            rows={6}
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Who This Is For (one per line)
          </label>
          <Textarea
            value={data.who_is_for}
            onChange={(e) => setData({ ...data, who_is_for: e.target.value })}
            placeholder="e.g., Aspiring professionals..."
            rows={6}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <Select
            value={data.category_id}
            onValueChange={(value) => {
              // Ensure the value being set in state is a string
              setData({ ...data, category_id: String(value) });
            }}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                // Ensure SelectItem value is a string, matching the state
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instructor</label>
          <Select
            value={data.instructor_id || ""}
            onValueChange={(value) => {
              const selectedInstructor = instructors.find(
                (i) => String(i.id) === value
              );
              setData({
                ...data,
                instructor_id: value,
                instructor_name: selectedInstructor
                  ? selectedInstructor.full_name
                  : "",
              });
            }}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select instructor" />
            </SelectTrigger>
            <SelectContent>
              {instructors.map((i) => (
                <SelectItem key={i.id} value={String(i.id)}>
                  {i.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Level *</label>
          <Select
            value={data.level}
            onValueChange={(value) => setData({ ...data, level: value })}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price ($)</label>
          <Input
            type="number"
            value={data.price}
            onChange={(e) =>
              setData({ ...data, price: Number(e.target.value) })
            }
            min="0"
            step="0.01"
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Discount (%)</label>
          <Input
            type="number"
            value={data.discount}
            onChange={(e) =>
              setData({ ...data, discount: Number(e.target.value) })
            }
            min="0"
            max="100"
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Trainees</label>
          <Input
            type="number"
            value={data.max_trainees}
            onChange={(e) =>
              setData({ ...data, max_trainees: Number(e.target.value) })
            }
            min="0"
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Duration (minutes)
          </label>
          <Input
            type="number"
            value={data.duration}
            onChange={(e) =>
              setData({ ...data, duration: Number(e.target.value) })
            }
            min="0"
            disabled={submitting}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status *</label>
        <Select
          value={data.status}
          onValueChange={(value: "active" | "inactive" | "draft") =>
            setData({ ...data, status: value })
          }
          disabled={submitting}
        >
          <SelectTrigger className="w-full md:w-1/3">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // --- Main Component Render ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-ivory">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-mustard mx-auto mb-4" />
          <p className="text-lg text-deep-purple">Loading Trainings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-ivory min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Trainings</h1>
          <p className="text-muted-foreground">
            Manage all available training courses.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-mustard hover:bg-mustard/90 text-ivory mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Training
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() =>
                fetchTrainings(searchQuery, filterCategory, filterStatus)
              }
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white border border-mustard/20 rounded-lg shadow-sm">
        {/* Search and Filter Bar */}
        <div className="p-4 border-b flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-deep-purple" />
            <Input
              placeholder="Search trainings by name or code..."
              className="pl-8 border-mustard/20 focus:border-mustard"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Select value={filterCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-ivory border-mustard/20">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-ivory border-mustard/20">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="max-h-[60vh] overflow-y-auto">
            <Table className="min-w-[1200px]">
              <TableHeader className="sticky top-0 bg-gray-50 z-10">
                <TableRow>
                  <TableHead className="w-[350px]">Training</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainings.length === 0 && !error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-48">
                      No Trainings Found.
                    </TableCell>
                  </TableRow>
                ) : (
                  trainings.map((training) => (
                    <TableRow key={training.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={training.image_url || "/placeholder.svg"}
                            alt={training.name}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                          />
                          <span className="font-bold">{training.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{training.course_code}</TableCell>
                      <TableCell>{training.category_name}</TableCell>
                      <TableCell>{training.instructor_name || "N/A"}</TableCell>
                      <TableCell>
                        {training.price != null
                          ? `$${Number(training.price).toFixed(2)}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(training.status)}>
                          {training.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditForm(training)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteTraining(training.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {(showCreateForm || (showEditForm && editingTraining)) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] shadow-xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {showEditForm ? "Edit Training" : "Create New Training"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                  setEditingTraining(null);
                }}
                disabled={submitting}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-grow">
              <form
                id="training-form"
                onSubmit={
                  showEditForm ? handleEditTraining : handleCreateTraining
                }
                className="p-6"
              >
                {/* Tabs */}
                <div className="flex border-b mb-4">
                  <button
                    type="button"
                    className={`px-4 py-2 ${
                      activeTab === "details"
                        ? "border-b-2 border-mustard font-semibold"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setActiveTab("details")}
                  >
                    Training Details
                  </button>
                  {showEditForm && (
                    <button
                      type="button"
                      className={`px-4 py-2 ${
                        activeTab === "quiz"
                          ? "border-b-2 border-mustard font-semibold"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("quiz")}
                    >
                      Quiz
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                {activeTab === "details" &&
                  renderFormFields(
                    showEditForm ? editingTraining! : newTraining,
                    showEditForm ? setEditingTraining : setNewTraining
                  )}

                {activeTab === "quiz" &&
                  showEditForm &&
                  editingTraining?.id && (
                    <div className="mt-4">
                      <QuizManager trainingId={editingTraining.id} />
                    </div>
                  )}
              </form>
            </div>

            <div className="flex justify-end space-x-2 p-4 border-t bg-gray-50 rounded-b-lg">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                  setEditingTraining(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="training-form"
                disabled={submitting || uploadingFile || uploadingDocument}
                className="bg-mustard hover:bg-mustard/90 text-ivory"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : showEditForm ? (
                  "Save Changes"
                ) : (
                  "Create Training"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
