// // // // // "use client"

// // // // // import type React from "react"
// // // // // import { useState, useEffect, useCallback } from "react"
// // // // // import { Button } from "@/components/ui/button"
// // // // // import { Input } from "@/components/ui/input"
// // // // // import { Textarea } from "@/components/ui/textarea"
// // // // // import { Badge } from "@/components/ui/badge"
// // // // // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// // // // // import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// // // // // import { Plus, Edit, Trash2, Search, Download, Loader2, X, AlertCircle, ChevronLeft, ChevronRight, Clock, Users, BookOpen } from "lucide-react"
// // // // // import { useToast } from "@/hooks/use-toast"
// // // // // import { Alert, AlertDescription } from "@/components/ui/alert"
// // // // // import { useRouter, useSearchParams } from "next/navigation"
// // // // // import Image from "next/image"

// // // // // interface Training {
// // // // //   id: string
// // // // //   name: string
// // // // //   description: string
// // // // //   image_url: string
// // // // //   course_code: string
// // // // //   category_id: string
// // // // //   category_name: string
// // // // //   price: number
// // // // //   discount: number
// // // // //   max_trainees: number
// // // // //   current_trainees: number
// // // // //   modules_count: number
// // // // //   modules: number
// // // // //   duration: number
// // // // //   level: string
// // // // //   instructor_name: string
// // // // //   instructor_id: string
// // // // //   status: "active" | "inactive" | "draft"
// // // // //   created_at: string
// // // // // }

// // // // // interface Category {
// // // // //   id: string
// // // // //   name: string
// // // // // }

// // // // // interface Instructor {
// // // // //   id: string
// // // // //   name: string
// // // // //   email: string
// // // // //   phone: string
// // // // //   status: string
// // // // // }

// // // // // interface PaginationInfo {
// // // // //   page: number
// // // // //   limit: number
// // // // //   total: number
// // // // //   totalPages: number
// // // // //   hasNext: boolean
// // // // //   hasPrev: boolean
// // // // // }

// // // // // export default function TrainingsPage() {
// // // // //   const { toast } = useToast()
// // // // //   const router = useRouter()
// // // // //   const searchParams = useSearchParams()

// // // // //   const [trainings, setTrainings] = useState<Training[]>([])
// // // // //   const [categories, setCategories] = useState<Category[]>([])
// // // // //   const [instructors, setInstructors] = useState<Instructor[]>([])
// // // // //   const [loading, setLoading] = useState(true)
// // // // //   const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
// // // // //   const [filterCategory, setFilterCategory] = useState(searchParams.get("category") || "all")
// // // // //   const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all")
// // // // //   const [showCreateForm, setShowCreateForm] = useState(false)
// // // // //   const [showEditForm, setShowEditForm] = useState(false)
// // // // //   const [editingTraining, setEditingTraining] = useState<Training | null>(null)
// // // // //   const [submitting, setSubmitting] = useState(false)
// // // // //   const [error, setError] = useState<string | null>(null)
// // // // //   const [pagination, setPagination] = useState<PaginationInfo>({
// // // // //     page: 1,
// // // // //     limit: 10,
// // // // //     total: 0,
// // // // //     totalPages: 0,
// // // // //     hasNext: false,
// // // // //     hasPrev: false,
// // // // //   })

// // // // //   const [uploadingFile, setUploadingFile] = useState(false)
// // // // //   const [uploadingEditFile, setUploadingEditFile] = useState(false)

// // // // //   const [newTraining, setNewTraining] = useState({
// // // // //     name: "",
// // // // //     description: "",
// // // // //     image_url: "",
// // // // //     course_code: "",
// // // // //     category_id: "",
// // // // //     price: 0,
// // // // //     discount: 0,
// // // // //     max_trainees: 0,
// // // // //     instructor_id: "",
// // // // //     instructor_name: "",
// // // // //     status: "draft" as "active" | "inactive" | "draft",
// // // // //   })

// // // // //   // Update URL when filters change
// // // // //   const updateURL = useCallback(
// // // // //     (newParams: Record<string, string>) => {
// // // // //       const params = new URLSearchParams(searchParams)
// // // // //       Object.entries(newParams).forEach(([key, value]) => {
// // // // //         if (value && value !== "all" && value !== "") {
// // // // //           params.set(key, value)
// // // // //         } else {
// // // // //           params.delete(key)
// // // // //         }
// // // // //       })
// // // // //       router.push(`?${params.toString()}`, { scroll: false })
// // // // //     },
// // // // //     [router, searchParams],
// // // // //   )

// // // // //   // Debounced search
// // // // //   const debouncedSearch = useCallback(
// // // // //     debounce((search: string) => {
// // // // //       updateURL({ search, page: "1" })
// // // // //     }, 300),
// // // // //     [updateURL],
// // // // //   )

// // // // //   function debounce(func: Function, wait: number) {
// // // // //     let timeout: NodeJS.Timeout
// // // // //     return function executedFunction(...args: any[]) {
// // // // //       const later = () => {
// // // // //         clearTimeout(timeout)
// // // // //         func(...args)
// // // // //       }
// // // // //       clearTimeout(timeout)
// // // // //       timeout = setTimeout(later, wait)
// // // // //     }
// // // // //   }

// // // // //   // Fetch trainings from database with pagination
// // // // //   const fetchTrainings = async (search: string, category: string, status: string, page = 1) => {
// // // // //     try {
// // // // //       setLoading(true)
// // // // //       setError(null)
// // // // //       console.log("🔍 Fetching trainings with pagination...")

// // // // //       const params = new URLSearchParams({
// // // // //         search,
// // // // //         category,
// // // // //         status,
// // // // //         page: page.toString(),
// // // // //         limit: "10",
// // // // //       })

// // // // //       const response = await fetch(`/api/admin/trainings?${params.toString()}`, {
// // // // //         method: "GET",
// // // // //         headers: {
// // // // //           "Content-Type": "application/json",
// // // // //         },
// // // // //         cache: "no-store",
// // // // //       })

// // // // //       console.log("📡 Response status:", response.status)

// // // // //       if (!response.ok) {
// // // // //         const errorText = await response.text()
// // // // //         console.error("❌ Response not ok:", errorText)
// // // // //         throw new Error(`HTTP ${response.status}: ${errorText}`)
// // // // //       }

// // // // //       const data = await response.json()
// // // // //       console.log("📊 Received data:", data)

// // // // //       if (data.success === false) {
// // // // //         throw new Error(data.error || "Failed to fetch trainings")
// // // // //       }

// // // // //       const trainingsData = data.trainings || []
// // // // //       console.log("✅ Trainings loaded:", trainingsData.length)

// // // // //       setTrainings(trainingsData)
// // // // //       setPagination(
// // // // //         data.pagination || {
// // // // //           page: 1,
// // // // //           limit: 10,
// // // // //           total: 0,
// // // // //           totalPages: 0,
// // // // //           hasNext: false,
// // // // //           hasPrev: false,
// // // // //         },
// // // // //       )
// // // // //     } catch (error) {
// // // // //       console.error("❌ Error fetching trainings:", error)
// // // // //       const errorMessage = error instanceof Error ? error.message : "Failed to fetch trainings"
// // // // //       setError(errorMessage)
// // // // //       toast({
// // // // //         title: "Error",
// // // // //         description: errorMessage,
// // // // //         variant: "destructive",
// // // // //       })
// // // // //       setTrainings([])
// // // // //     } finally {
// // // // //       setLoading(false)
// // // // //     }
// // // // //   }

// // // // //   const fetchCategories = async () => {
// // // // //     try {
// // // // //       console.log("🔍 Fetching categories...")
// // // // //       const response = await fetch("/api/admin/categories")

// // // // //       if (response.ok) {
// // // // //         const data = await response.json()
// // // // //         console.log("✅ Categories fetched successfully:", data.categories?.length || 0)
// // // // //         setCategories(data.categories || [])
// // // // //       } else {
// // // // //         console.error("❌ Failed to fetch categories")
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.error("❌ Error fetching categories:", error)
// // // // //     }
// // // // //   }

// // // // //   const fetchInstructors = async () => {
// // // // //   try {
// // // // //     console.log("🔍 Fetching instructors...");
// // // // //     const response = await fetch("/api/admin/instructors/available", {
// // // // //       headers: {
// // // // //         'Content-Type': 'application/json',
// // // // //       },
// // // // //       cache: 'no-store' // Important for dynamic data in Next.js
// // // // //     });

// // // // //     if (!response.ok) {
// // // // //       const errorData = await response.json().catch(() => null);
// // // // //       console.error("❌ Failed to fetch instructors", {
// // // // //         status: response.status,
// // // // //         statusText: response.statusText,
// // // // //         error: errorData?.message || 'No additional error info'
// // // // //       });
// // // // //       setInstructors([]); // Reset to empty array on failure
// // // // //       return;
// // // // //     }

// // // // //     const data = await response.json();
// // // // //     if (!data.instructors) {
// // // // //       console.warn("⚠️ Instructors data is missing in response");
// // // // //     }

// // // // //     console.log("✅ Instructors fetched successfully:", data.instructors?.length || 0);
// // // // //     setInstructors(data.instructors || []);

// // // // //   } catch (error) {
// // // // //     console.error("❌ Network error fetching instructors:", error);
// // // // //     setInstructors([]); // Fallback to empty array
// // // // //   }
// // // // // };

// // // // //   // Handle page change
// // // // //   const handlePageChange = (newPage: number) => {
// // // // //     updateURL({ page: newPage.toString() })
// // // // //   }

// // // // //   // Handle filter changes
// // // // //   const handleCategoryChange = (category: string) => {
// // // // //     setFilterCategory(category)
// // // // //     updateURL({ category, page: "1" })
// // // // //   }

// // // // //   const handleStatusChange = (status: string) => {
// // // // //     setFilterStatus(status)
// // // // //     updateURL({ status, page: "1" })
// // // // //   }

// // // // //   // Handle search change
// // // // //   const handleSearchChange = (search: string) => {
// // // // //     setSearchQuery(search)
// // // // //     debouncedSearch(search)
// // // // //   }

// // // // //   // Effect to fetch data when URL params change
// // // // //   useEffect(() => {
// // // // //     const page = Number.parseInt(searchParams.get("page") || "1")
// // // // //     const search = searchParams.get("search") || ""
// // // // //     const category = searchParams.get("category") || "all"
// // // // //     const status = searchParams.get("status") || "all"

// // // // //     setSearchQuery(search)
// // // // //     setFilterCategory(category)
// // // // //     setFilterStatus(status)

// // // // //     fetchTrainings(search, category, status, page)
// // // // //     fetchCategories()
// // // // //     fetchInstructors()
// // // // //   }, [searchParams])

// // // // //   const handleFileUpload = async (file: File, isEdit = false) => {
// // // // //     try {
// // // // //       if (isEdit) {
// // // // //         setUploadingEditFile(true)
// // // // //       } else {
// // // // //         setUploadingFile(true)
// // // // //       }

// // // // //       const formData = new FormData()
// // // // //       formData.append("file", file)

// // // // //       const response = await fetch("/api/admin/trainings/upload", {
// // // // //         method: "POST",
// // // // //         body: formData,
// // // // //       })

// // // // //       const data = await response.json()

// // // // //       if (!response.ok || !data.success) {
// // // // //         throw new Error(data.error || "Failed to upload file")
// // // // //       }

// // // // //       if (isEdit && editingTraining) {
// // // // //         setEditingTraining({
// // // // //           ...editingTraining,
// // // // //           image_url: data.filePath,
// // // // //         })
// // // // //       } else {
// // // // //         setNewTraining({
// // // // //           ...newTraining,
// // // // //           image_url: data.filePath,
// // // // //         })
// // // // //       }

// // // // //       toast({
// // // // //         title: "Success",
// // // // //         description: "Image uploaded successfully",
// // // // //       })
// // // // //     } catch (error) {
// // // // //       console.error("Error uploading file:", error)
// // // // //       const errorMessage = error instanceof Error ? error.message : "Failed to upload file"
// // // // //       toast({
// // // // //         title: "Error",
// // // // //         description: errorMessage,
// // // // //         variant: "destructive",
// // // // //       })
// // // // //     } finally {
// // // // //       if (isEdit) {
// // // // //         setUploadingEditFile(false)
// // // // //       } else {
// // // // //         setUploadingFile(false)
// // // // //       }
// // // // //     }
// // // // //   }

// // // // //   const handleCreateTraining = async (e: React.FormEvent) => {
// // // // //     e.preventDefault()

// // // // //     if (!newTraining.name || !newTraining.description || !newTraining.course_code || !newTraining.category_id) {
// // // // //       toast({
// // // // //         title: "Validation Error",
// // // // //         description: "Please fill in all required fields",
// // // // //         variant: "destructive",
// // // // //       })
// // // // //       return
// // // // //     }

// // // // //     try {
// // // // //       setSubmitting(true)
// // // // //       setError(null)

// // // // //       console.log("📝 Creating training with data:", newTraining)

// // // // //       const response = await fetch("/api/admin/trainings", {
// // // // //         method: "POST",
// // // // //         headers: {
// // // // //           "Content-Type": "application/json",
// // // // //         },
// // // // //         body: JSON.stringify(newTraining),
// // // // //       })

// // // // //       console.log("📡 Create response status:", response.status)

// // // // //       const data = await response.json()
// // // // //       console.log("📊 Parsed response data:", data)

// // // // //       if (!response.ok || data.success === false) {
// // // // //         throw new Error(data.error || `HTTP ${response.status}`)
// // // // //       }

// // // // //       console.log("🎉 Training created successfully:", data.training)

// // // // //       // Reset form
// // // // //       setNewTraining({
// // // // //         name: "",
// // // // //         description: "",
// // // // //         image_url: "",
// // // // //         course_code: "",
// // // // //         category_id: "",
// // // // //         price: 0,
// // // // //         discount: 0,
// // // // //         max_trainees: 0,
// // // // //         instructor_id: "",
// // // // //         instructor_name: "",
// // // // //         status: "draft",
// // // // //       })

// // // // //       // Close form
// // // // //       setShowCreateForm(false)

// // // // //       toast({
// // // // //         title: "Success",
// // // // //         description: "Training created successfully",
// // // // //       })

// // // // //       // Refresh current page
// // // // //       const currentPage = Number.parseInt(searchParams.get("page") || "1")
// // // // //       fetchTrainings(searchQuery, filterCategory, filterStatus, currentPage)
// // // // //     } catch (error) {
// // // // //       console.error("❌ Error creating training:", error)
// // // // //       const errorMessage = error instanceof Error ? error.message : "Failed to create training"
// // // // //       setError(errorMessage)
// // // // //       toast({
// // // // //         title: "Error",
// // // // //         description: errorMessage,
// // // // //         variant: "destructive",
// // // // //       })
// // // // //     } finally {
// // // // //       setSubmitting(false)
// // // // //     }
// // // // //   }

// // // // //   const handleEditTraining = async (e: React.FormEvent) => {
// // // // //     e.preventDefault()
// // // // //     if (!editingTraining) return

// // // // //     try {
// // // // //       setSubmitting(true)
// // // // //       const response = await fetch("/api/admin/trainings", {
// // // // //         method: "PUT",
// // // // //         headers: { "Content-Type": "application/json" },
// // // // //         body: JSON.stringify({
// // // // //           ...editingTraining,
// // // // //           name: editingTraining.name,
// // // // //           description: editingTraining.description,
// // // // //           image_url: editingTraining.image_url,
// // // // //           course_code: editingTraining.course_code,
// // // // //           category_id: editingTraining.category_id,
// // // // //           price: editingTraining.price,
// // // // //           discount: editingTraining.discount,
// // // // //           max_trainees: editingTraining.max_trainees,
// // // // //           instructor_id: editingTraining.instructor_id,
// // // // //           status: editingTraining.status,
// // // // //         }),
// // // // //       })

// // // // //       const data = await response.json()

// // // // //       if (!response.ok || data.success === false) {
// // // // //         throw new Error(data.error || data.details || "Failed to update training")
// // // // //       }

// // // // //       setShowEditForm(false)
// // // // //       setEditingTraining(null)

// // // // //       toast({
// // // // //         title: "Success",
// // // // //         description: "Training updated successfully",
// // // // //       })

// // // // //       // Refresh current page
// // // // //       const currentPage = Number.parseInt(searchParams.get("page") || "1")
// // // // //       fetchTrainings(searchQuery, filterCategory, filterStatus, currentPage)
// // // // //     } catch (error) {
// // // // //       console.error("Error updating training:", error)
// // // // //       const errorMessage = error instanceof Error ? error.message : "Failed to update training"
// // // // //       toast({
// // // // //         title: "Error",
// // // // //         description: errorMessage,
// // // // //         variant: "destructive",
// // // // //       })
// // // // //     } finally {
// // // // //       setSubmitting(false)
// // // // //     }
// // // // //   }

// // // // //   const handleDeleteTraining = async (trainingId: string) => {
// // // // //     if (!confirm("Are you sure you want to delete this training?")) return

// // // // //     try {
// // // // //       const response = await fetch(`/api/admin/trainings?id=${trainingId}`, {
// // // // //         method: "DELETE",
// // // // //       })

// // // // //       const data = await response.json()

// // // // //       if (!response.ok || data.success === false) {
// // // // //         throw new Error(data.error || "Failed to delete training")
// // // // //       }

// // // // //       toast({
// // // // //         title: "Success",
// // // // //         description: "Training deleted successfully",
// // // // //       })

// // // // //       // Refresh current page
// // // // //       const currentPage = Number.parseInt(searchParams.get("page") || "1")
// // // // //       fetchTrainings(searchQuery, filterCategory, filterStatus, currentPage)
// // // // //     } catch (error) {
// // // // //       console.error("Error deleting training:", error)
// // // // //       const errorMessage = error instanceof Error ? error.message : "Failed to delete training"
// // // // //       toast({
// // // // //         title: "Error",
// // // // //         description: errorMessage,
// // // // //         variant: "destructive",
// // // // //       })
// // // // //     }
// // // // //   }

// // // // //   const exportTrainings = () => {
// // // // //     const csvContent =
// // // // //       "data:text/csv;charset=utf-8," +
// // // // //       "No,Name,Code,Category,Instructor,Level,Price,Discount,Trainees,Modules,Duration,Status,Created\n" +
// // // // //       trainings
// // // // //         .map(
// // // // //           (t, index) =>
// // // // //             `${index + 1},"${t.name}","${t.course_code}","${t.category_name}","${t.instructor_name || "N/A"}","${t.level || "N/A"}",${t.price},${t.discount},${t.current_trainees}/${t.max_trainees},${t.modules || 0},${t.duration || 0},"${t.status}","${new Date(t.created_at).toLocaleDateString()}"`,
// // // // //         )
// // // // //         .join("\n")

// // // // //     const encodedUri = encodeURI(csvContent)
// // // // //     const link = document.createElement("a")
// // // // //     link.setAttribute("href", encodedUri)
// // // // //     link.setAttribute("download", "trainings.csv")
// // // // //     document.body.appendChild(link)
// // // // //     link.click()
// // // // //     document.body.removeChild(link)
// // // // //   }

// // // // //   const getStatusColor = (status: string) => {
// // // // //     switch (status) {
// // // // //       case "active":
// // // // //         return "bg-green-100 text-green-800 border-green-200"
// // // // //       case "inactive":
// // // // //         return "bg-gray-100 text-gray-800 border-gray-200"
// // // // //       case "draft":
// // // // //         return "bg-yellow-100 text-yellow-800 border-yellow-200"
// // // // //       default:
// // // // //         return "bg-gray-100 text-gray-800 border-gray-200"
// // // // //     }
// // // // //   }

// // // // //   const getLevelColor = (level: string) => {
// // // // //     switch (level?.toLowerCase()) {
// // // // //       case "beginner":
// // // // //         return "bg-blue-100 text-blue-800 border-blue-200"
// // // // //       case "intermediate":
// // // // //         return "bg-orange-100 text-orange-800 border-orange-200"
// // // // //       case "advanced":
// // // // //         return "bg-red-100 text-red-800 border-red-200"
// // // // //       default:
// // // // //         return "bg-gray-100 text-gray-800 border-gray-200"
// // // // //     }
// // // // //   }

// // // // //   const openEditForm = (training: Training) => {
// // // // //     setEditingTraining({
// // // // //       ...training,
// // // // //       name: training.name || "",
// // // // //       description: training.description || "",
// // // // //       image_url: training.image_url || "",
// // // // //       course_code: training.course_code || "",
// // // // //       category_id: training.category_id || "",
// // // // //       instructor_id: training.instructor_id || "",
// // // // //       instructor_name: training.instructor_name || "",
// // // // //       status: training.status || "draft",
// // // // //     })
// // // // //     setShowEditForm(true)
// // // // //   }

// // // // //   const handleAddTraining = () => {
// // // // //     setEditingTraining(null)
// // // // //     setNewTraining({
// // // // //       name: "",
// // // // //       description: "",
// // // // //       image_url: "",
// // // // //       course_code: "",
// // // // //       category_id: "",
// // // // //       price: 0,
// // // // //       discount: 0,
// // // // //       max_trainees: 0,
// // // // //       instructor_id: "",
// // // // //       instructor_name: "",
// // // // //       status: "draft",
// // // // //     })
// // // // //     setShowCreateForm(true)
// // // // //   }

// // // // //   const handleInstructorChange = (instructorId: string) => {
// // // // //     const selectedInstructor = instructors.find((inst) => inst.id === instructorId)
// // // // //     if (editingTraining) {
// // // // //       setEditingTraining({
// // // // //         ...editingTraining,
// // // // //         instructor_id: instructorId,
// // // // //         instructor_name: selectedInstructor?.name || "",
// // // // //       })
// // // // //     } else {
// // // // //       setNewTraining({
// // // // //         ...newTraining,
// // // // //         instructor_id: instructorId,
// // // // //         instructor_name: selectedInstructor?.name || "",
// // // // //       })
// // // // //     }
// // // // //   }

// // // // //   const formatDuration = (minutes: number) => {
// // // // //     if (minutes < 60) {
// // // // //       return `${minutes}m`
// // // // //     }
// // // // //     const hours = Math.floor(minutes / 60)
// // // // //     const remainingMinutes = minutes % 60
// // // // //     return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
// // // // //   }

// // // // //   // Pagination component
// // // // //   const renderPagination = () => {
// // // // //     if (pagination.totalPages <= 1) return null

// // // // //     const getPageNumbers = () => {
// // // // //       const current = pagination.page
// // // // //       const total = pagination.totalPages
// // // // //       const delta = 2
// // // // //       const range = []
// // // // //       const rangeWithDots = []

// // // // //       for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
// // // // //         range.push(i)
// // // // //       }

// // // // //       if (current - delta > 2) {
// // // // //         rangeWithDots.push(1, "...")
// // // // //       } else {
// // // // //         rangeWithDots.push(1)
// // // // //       }

// // // // //       rangeWithDots.push(...range)

// // // // //       if (current + delta < total - 1) {
// // // // //         rangeWithDots.push("...", total)
// // // // //       } else {
// // // // //         rangeWithDots.push(total)
// // // // //       }

// // // // //       return rangeWithDots
// // // // //     }

// // // // //     return (
// // // // //       <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
// // // // //         <div className="flex justify-between flex-1 sm:hidden">
// // // // //           <Button
// // // // //             onClick={() => handlePageChange(pagination.page - 1)}
// // // // //             disabled={!pagination.hasPrev || loading}
// // // // //             variant="outline"
// // // // //             size="sm"
// // // // //           >
// // // // //             Previous
// // // // //           </Button>
// // // // //           <Button
// // // // //             onClick={() => handlePageChange(pagination.page + 1)}
// // // // //             disabled={!pagination.hasNext || loading}
// // // // //             variant="outline"
// // // // //             size="sm"
// // // // //           >
// // // // //             Next
// // // // //           </Button>
// // // // //         </div>
// // // // //         <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
// // // // //           <div>
// // // // //             <p className="text-sm text-gray-700">
// // // // //               Showing{" "}
// // // // //               <span className="font-medium">
// // // // //                 {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
// // // // //               </span>{" "}
// // // // //               to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>{" "}
// // // // //               of <span className="font-medium">{pagination.total}</span> results
// // // // //             </p>
// // // // //           </div>
// // // // //           <div>
// // // // //             <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
// // // // //               <Button
// // // // //                 onClick={() => handlePageChange(pagination.page - 1)}
// // // // //                 disabled={!pagination.hasPrev || loading}
// // // // //                 variant="outline"
// // // // //                 size="sm"
// // // // //                 className="relative inline-flex items-center px-2 py-2 rounded-l-md"
// // // // //               >
// // // // //                 <ChevronLeft className="h-4 w-4" />
// // // // //               </Button>

// // // // //               {getPageNumbers().map((pageNum, index) => (
// // // // //                 <Button
// // // // //                   key={index}
// // // // //                   onClick={() => (typeof pageNum === "number" ? handlePageChange(pageNum) : undefined)}
// // // // //                   disabled={pageNum === "..." || loading}
// // // // //                   variant={pageNum === pagination.page ? "default" : "outline"}
// // // // //                   size="sm"
// // // // //                   className="relative inline-flex items-center px-4 py-2"
// // // // //                 >
// // // // //                   {pageNum}
// // // // //                 </Button>
// // // // //               ))}

// // // // //               <Button
// // // // //                 onClick={() => handlePageChange(pagination.page + 1)}
// // // // //                 disabled={!pagination.hasNext || loading}
// // // // //                 variant="outline"
// // // // //                 size="sm"
// // // // //                 className="relative inline-flex items-center px-2 py-2 rounded-r-md"
// // // // //               >
// // // // //                 <ChevronRight className="h-4 w-4" />
// // // // //               </Button>
// // // // //             </nav>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //     )
// // // // //   }

// // // // //   return (
// // // // //     <div className="relative space-y-4 sm:space-y-6 p-4 sm:p-6">
// // // // //       {/* Header - Responsive */}
// // // // //       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
// // // // //         <div>
// // // // //           <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Trainings Management</h1>
// // // // //           <p className="text-sm sm:text-base text-deep-purple mt-1">Manage specific training courses and modules</p>
// // // // //         </div>
// // // // //         <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
// // // // //           <Button
// // // // //             variant="outline"
// // // // //             onClick={exportTrainings}
// // // // //             disabled={loading || trainings.length === 0}
// // // // //             className="w-full sm:w-auto border-mustard text-mustard hover:bg-mustard hover:text-ivory bg-transparent"
// // // // //           >
// // // // //             <Download className="h-4 w-4 mr-2" />
// // // // //             Export
// // // // //           </Button>
// // // // //           <Button
// // // // //             onClick={handleAddTraining}
// // // // //             className="w-full sm:w-auto bg-mustard hover:bg-mustard/90 text-ivory transition-all duration-200 hover:scale-105 active:scale-95"
// // // // //             disabled={submitting}
// // // // //           >
// // // // //             <Plus className="h-4 w-4 mr-2" />
// // // // //             Add Training
// // // // //           </Button>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Error Alert */}
// // // // //       {error && (
// // // // //         <Alert variant="destructive">
// // // // //           <AlertCircle className="h-4 w-4" />
// // // // //           <AlertDescription>
// // // // //             {error}
// // // // //             <Button
// // // // //               variant="outline"
// // // // //               size="sm"
// // // // //               className="ml-2 bg-transparent"
// // // // //               onClick={() => {
// // // // //                 setError(null)
// // // // //                 const currentPage = Number.parseInt(searchParams.get("page") || "1")
// // // // //                 fetchTrainings(searchQuery, filterCategory, filterStatus, currentPage)
// // // // //               }}
// // // // //             >
// // // // //               Retry
// // // // //             </Button>
// // // // //           </AlertDescription>
// // // // //         </Alert>
// // // // //       )}

// // // // //       {/* Search and Filter - Responsive */}
// // // // //       <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
// // // // //         <div className="relative flex-1">
// // // // //           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-deep-purple" />
// // // // //           <Input
// // // // //             placeholder="Search trainings..."
// // // // //             className="pl-8 border-mustard/20 focus:border-mustard"
// // // // //             value={searchQuery}
// // // // //             onChange={(e) => handleSearchChange(e.target.value)}
// // // // //           />
// // // // //         </div>
// // // // //         <Select value={filterCategory} onValueChange={handleCategoryChange}>
// // // // //           <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
// // // // //             <SelectValue placeholder="Filter by category" />
// // // // //           </SelectTrigger>
// // // // //           <SelectContent className="bg-ivory border-mustard/20">
// // // // //             <SelectItem value="all">All Categories</SelectItem>
// // // // //             {categories.map((category) => (
// // // // //               <SelectItem key={category.id} value={category.id}>
// // // // //                 {category.name}
// // // // //               </SelectItem>
// // // // //             ))}
// // // // //           </SelectContent>
// // // // //         </Select>
// // // // //         <Select value={filterStatus} onValueChange={handleStatusChange}>
// // // // //           <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
// // // // //             <SelectValue placeholder="Filter by status" />
// // // // //           </SelectTrigger>
// // // // //           <SelectContent className="bg-ivory border-mustard/20">
// // // // //             <SelectItem value="all">All Status</SelectItem>
// // // // //             <SelectItem value="active">Active</SelectItem>
// // // // //             <SelectItem value="inactive">Inactive</SelectItem>
// // // // //             <SelectItem value="draft">Draft</SelectItem>
// // // // //           </SelectContent>
// // // // //         </Select>
// // // // //       </div>

// // // // //       {/* Loading State */}
// // // // //       {loading && trainings.length === 0 && (
// // // // //         <div className="flex items-center justify-center h-64">
// // // // //           <div className="text-center">
// // // // //             <Loader2 className="h-8 w-8 animate-spin text-mustard mx-auto mb-2" />
// // // // //             <p className="text-deep-purple">Loading trainings...</p>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* Trainings Table - Responsive */}
// // // // //       <div className="bg-ivory border border-mustard/20 rounded-lg">
// // // // //         <div className="p-4 border-b border-mustard/20">
// // // // //           <h3 className="text-lg font-semibold text-charcoal">Trainings ({pagination.total})</h3>
// // // // //         </div>

// // // // //         {!loading && (
// // // // //           <>
// // // // //             {/* Mobile View */}
// // // // //             <div className="block sm:hidden">
// // // // //               <div className="space-y-4 p-4">
// // // // //                 {trainings.length === 0 ? (
// // // // //                   <div className="text-center py-8 text-deep-purple">
// // // // //                     {error
// // // // //                       ? "Error loading trainings. Please try again."
// // // // //                       : "No trainings found. Click 'Add Training' to create your first training."}
// // // // //                   </div>
// // // // //                 ) : (
// // // // //                   trainings.map((training, index) => (
// // // // //                     <div key={training.id} className="border border-mustard/10 rounded-lg p-4 space-y-3 bg-white">
// // // // //                       <div className="flex justify-between items-start">
// // // // //                         <div className="flex items-center space-x-3">
// // // // //                           <div className="relative h-12 w-12">
// // // // //                             <Image
// // // // //                               src={training.image_url || "/placeholder.svg?height=48&width=48"}
// // // // //                               alt={training.name}
// // // // //                               fill
// // // // //                               className="object-cover rounded-md"
// // // // //                             />
// // // // //                           </div>
// // // // //                           <div>
// // // // //                             <h4 className="font-medium text-charcoal">{training.name}</h4>
// // // // //                             <p className="text-sm text-deep-purple">{training.description.substring(0, 50)}...</p>
// // // // //                           </div>
// // // // //                         </div>
// // // // //                         <Badge className={getStatusColor(training.status)}>{training.status}</Badge>
// // // // //                       </div>

// // // // //                       <div className="grid grid-cols-2 gap-4 text-sm">
// // // // //                         <div>
// // // // //                           <span className="text-gray-500">Code:</span>
// // // // //                           <p className="font-medium">{training.course_code}</p>
// // // // //                         </div>
// // // // //                         <div>
// // // // //                           <span className="text-gray-500">Category:</span>
// // // // //                           <p className="font-medium">{training.category_name}</p>
// // // // //                         </div>
// // // // //                         <div>
// // // // //                           <span className="text-gray-500">Instructor:</span>
// // // // //                           <p className="font-medium">{training.instructor_name || "Not assigned"}</p>
// // // // //                         </div>
// // // // //                         <div>
// // // // //                           <span className="text-gray-500">Level:</span>
// // // // //                           <Badge className={getLevelColor(training.level)}>{training.level || "N/A"}</Badge>
// // // // //                         </div>
// // // // //                         <div>
// // // // //                           <span className="text-gray-500">Price:</span>
// // // // //                           <p className="font-medium">
// // // // //                             ${training.price}
// // // // //                             {training.discount > 0 && (
// // // // //                               <span className="text-xs text-mustard ml-1">(-{training.discount}%)</span>
// // // // //                             )}
// // // // //                           </p>
// // // // //                         </div>
// // // // //                         <div>
// // // // //                           <span className="text-gray-500">Trainees:</span>
// // // // //                           <p className="font-medium">
// // // // //                             {training.current_trainees}/{training.max_trainees}
// // // // //                           </p>
// // // // //                         </div>
// // // // //                         <div>
// // // // //                           <span className="text-gray-500">Modules:</span>
// // // // //                           <p className="font-medium">{training.modules || 0}</p>
// // // // //                         </div>
// // // // //                         <div>
// // // // //                           <span className="text-gray-500">Duration:</span>
// // // // //                           <p className="font-medium">{formatDuration(training.duration || 0)}</p>
// // // // //                         </div>
// // // // //                       </div>

// // // // //                       <div className="flex space-x-2">
// // // // //                         <Button
// // // // //                           size="sm"
// // // // //                           variant="outline"
// // // // //                           onClick={() => openEditForm(training)}
// // // // //                           className="flex-1 border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
// // // // //                         >
// // // // //                           <Edit className="h-4 w-4 mr-1" />
// // // // //                           Edit
// // // // //                         </Button>
// // // // //                         <Button
// // // // //                           size="sm"
// // // // //                           variant="outline"
// // // // //                           onClick={() => handleDeleteTraining(training.id)}
// // // // //                           className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
// // // // //                         >
// // // // //                           <Trash2 className="h-4 w-4 mr-1" />
// // // // //                           Delete
// // // // //                         </Button>
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   ))
// // // // //                 )}
// // // // //               </div>
// // // // //             </div>

// // // // //             {/* Desktop View */}
// // // // //             <div className="hidden sm:block">
// // // // //               <div className="h-96 overflow-auto">
// // // // //                 <Table>
// // // // //                   <TableHeader className="sticky top-0 bg-ivory z-10">
// // // // //                     <TableRow className="border-mustard/20">
// // // // //                       <TableHead className="text-charcoal font-semibold">No.</TableHead>
// // // // //                       <TableHead className="text-charcoal font-semibold">Training</TableHead>
// // // // //                       <TableHead className="text-charcoal font-semibold">Code</TableHead>
// // // // //                       <TableHead className="text-charcoal font-semibold">Category</TableHead>
// // // // //                       <TableHead className="text-charcoal font-semibold">Instructor</TableHead>
// // // // //                       <TableHead className="text-charcoal font-semibold">Level</TableHead>
// // // // //                       <TableHead className="text-charcoal font-semibold">Price</TableHead>
// // // // //                       <TableHead className="text-charcoal font-semibold">Trainees</TableHead>
// // // // //                       <TableHead className="text-charcoal font-semibold">Modules</TableHead>
// // // // //                       <TableHead className="text-charcoal font-semibold">Duration</TableHead>
// // // // //                       <TableHead className="text-charcoal font-semibold">Status</TableHead>
// // // // //                       <TableHead className="text-charcoal font-semibold">Actions</TableHead>
// // // // //                     </TableRow>
// // // // //                   </TableHeader>
// // // // //                   <TableBody>
// // // // //                     {trainings.length === 0 ? (
// // // // //                       <TableRow>
// // // // //                         <TableCell colSpan={12} className="text-center py-8 text-deep-purple">
// // // // //                           {error
// // // // //                             ? "Error loading trainings. Please try again."
// // // // //                             : "No trainings found. Click 'Add Training' to create your first training."}
// // // // //                         </TableCell>
// // // // //                       </TableRow>
// // // // //                     ) : (
// // // // //                       trainings.map((training, index) => (
// // // // //                         <TableRow
// // // // //                           key={training.id}
// // // // //                           className="border-mustard/10 hover:bg-mustard/5 transition-colors duration-200"
// // // // //                         >
// // // // //                           <TableCell className="font-medium text-charcoal">
// // // // //                             {(pagination.page - 1) * pagination.limit + index + 1}
// // // // //                           </TableCell>
// // // // //                           <TableCell>
// // // // //                             <div className="flex items-center space-x-3">
// // // // //                               <div className="relative h-12 w-12">
// // // // //                                 <Image
// // // // //                                   src={training.image_url || "/placeholder.svg?height=48&width=48"}
// // // // //                                   alt={training.name}
// // // // //                                   fill
// // // // //                                   className="object-cover rounded-md"
// // // // //                                 />
// // // // //                               </div>
// // // // //                               <div>
// // // // //                                 <div className="font-medium text-charcoal">{training.name}</div>
// // // // //                                 <div className="text-sm text-deep-purple">{training.description.substring(0, 50)}...</div>
// // // // //                               </div>
// // // // //                             </div>
// // // // //                           </TableCell>
// // // // //                           <TableCell className="font-mono text-sm text-deep-purple">{training.course_code}</TableCell>
// // // // //                           <TableCell className="text-deep-purple">{training.category_name}</TableCell>
// // // // //                           <TableCell className="text-deep-purple">{training.instructor_name || "Not assigned"}</TableCell>
// // // // //                           <TableCell>
// // // // //                             <Badge className={getLevelColor(training.level)}>{training.level || "N/A"}</Badge>
// // // // //                           </TableCell>
// // // // //                           <TableCell className="text-charcoal">
// // // // //                             ${training.price}
// // // // //                             {training.discount > 0 && (
// // // // //                               <Badge variant="outline" className="ml-2 border-mustard text-mustard">
// // // // //                                 -{training.discount}%
// // // // //                               </Badge>
// // // // //                             )}
// // // // //                           </TableCell>
// // // // //                           <TableCell className="text-charcoal">
// // // // //                             {training.current_trainees}/{training.max_trainees}
// // // // //                           </TableCell>
// // // // //                           <TableCell className="text-charcoal">{training.modules || 0}</TableCell>
// // // // //                           <TableCell className="text-deep-purple">{formatDuration(training.duration || 0)}</TableCell>
// // // // //                           <TableCell>
// // // // //                             <Badge className={getStatusColor(training.status)}>{training.status}</Badge>
// // // // //                           </TableCell>
// // // // //                           <TableCell>
// // // // //                             <div className="flex space-x-1">
// // // // //                               <Button
// // // // //                                 size="sm"
// // // // //                                 variant="outline"
// // // // //                                 onClick={() => openEditForm(training)}
// // // // //                                 className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
// // // // //                               >
// // // // //                                 <Edit className="h-4 w-4" />
// // // // //                               </Button>
// // // // //                               <Button
// // // // //                                 size="sm"
// // // // //                                 variant="outline"
// // // // //                                 onClick={() => handleDeleteTraining(training.id)}
// // // // //                                 className="border-red-200 text-red-600 hover:bg-red-50"
// // // // //                               >
// // // // //                                 <Trash2 className="h-4 w-4" />
// // // // //                               </Button>
// // // // //                             </div>
// // // // //                           </TableCell>
// // // // //                         </TableRow>
// // // // //                       ))
// // // // //                     )}
// // // // //                   </TableBody>
// // // // //                 </Table>
// // // // //               </div>
// // // // //             </div>

// // // // //             {/* Pagination */}
// // // // //             {renderPagination()}
// // // // //           </>
// // // // //         )}
// // // // //       </div>

// // // // //       {/* Create Training Form Overlay - Responsive */}
// // // // //       {showCreateForm && (
// // // // //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
// // // // //           <div className="bg-ivory border border-mustard/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
// // // // //             <div className="p-4 sm:p-6">
// // // // //               <div className="flex justify-between items-center mb-4">
// // // // //                 <h2 className="text-xl sm:text-2xl font-bold text-charcoal">Create New Training</h2>
// // // // //                 <Button
// // // // //                   variant="ghost"
// // // // //                   size="sm"
// // // // //                   onClick={() => setShowCreateForm(false)}
// // // // //                   className="text-charcoal hover:bg-mustard/10"
// // // // //                   disabled={submitting}
// // // // //                 >
// // // // //                   <X className="h-4 w-4" />
// // // // //                 </Button>
// // // // //               </div>

// // // // //               <form onSubmit={handleCreateTraining} className="space-y-4">
// // // // //                 <div className="grid grid-cols-2 gap-4">
// // // // //                   <div>
// // // // //                     <label className="block text-sm font-medium text-charcoal mb-1">Training Name *</label>
// // // // //                     <Input
// // // // //                       value={newTraining.name}
// // // // //                       onChange={(e) => setNewTraining({ ...newTraining, name: e.target.value })}
// // // // //                       placeholder="Enter training name"
// // // // //                       className="border-mustard/20 focus:border-mustard"
// // // // //                       required
// // // // //                       disabled={submitting}
// // // // //                     />
// // // // //                   </div>
// // // // //                   <div>
// // // // //                     <label className="block text-sm font-medium text-charcoal mb-1">Course Code *</label>
// // // // //                     <Input
// // // // //                       value={newTraining.course_code}
// // // // //                       onChange={(e) => setNewTraining({ ...newTraining, course_code: e.target.value })}
// // // // //                       placeholder="e.g., MKP-ADV-001"
// // // // //                       className="border-mustard/20 focus:border-mustard"
// // // // //                       required
// // // // //                       disabled={submitting}
// // // // //                     />
// // // // //                   </div>
// // // // //                 </div>

// // // // //                 <div>
// // // // //                   <label className="block text-sm font-medium text-charcoal mb-1">Description *</label>
// // // // //                   <Textarea
// // // // //                     value={newTraining.description}
// // // // //                     onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
// // // // //                     placeholder="Enter training description"
// // // // //                     className="border-mustard/20 focus:border-mustard"
// // // // //                     rows={3}
// // // // //                     required
// // // // //                     disabled={submitting}
// // // // //                   />
// // // // //                 </div>

// // // // //                 <div>
// // // // //                   <label className="block text-sm font-medium text-charcoal mb-1">Training Image</label>
// // // // //                   <div className="space-y-3">
// // // // //                     <div className="flex items-center space-x-2">
// // // // //                       <input
// // // // //                         type="file"
// // // // //                         id="file-upload"
// // // // //                         accept="image/*"
// // // // //                         onChange={(e) => {
// // // // //                           const file = e.target.files?.[0]
// // // // //                           if (file) {
// // // // //                             handleFileUpload(file)
// // // // //                           }
// // // // //                         }}
// // // // //                         className="hidden"
// // // // //                         disabled={submitting || uploadingFile}
// // // // //                       />
// // // // //                       <Button
// // // // //                         type="button"
// // // // //                         variant="outline"
// // // // //                         onClick={() => document.getElementById("file-upload")?.click()}
// // // // //                         disabled={submitting || uploadingFile}
// // // // //                         className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
// // // // //                       >
// // // // //                         {uploadingFile ? (
// // // // //                           <>
// // // // //                             <Loader2 className="h-4 w-4 animate-spin mr-2" />
// // // // //                             Uploading...
// // // // //                           </>
// // // // //                         ) : (
// // // // //                           <>
// // // // //                             <Plus className="h-4 w-4 mr-2" />
// // // // //                             Upload Image
// // // // //                           </>
// // // // //                         )}
// // // // //                       </Button>
// // // // //                       <span className="text-sm text-deep-purple">Images only (Max 10MB)</span>
// // // // //                     </div>

// // // // //                     {newTraining.image_url && (
// // // // //                       <div className="relative w-32 h-32 border border-mustard/20 rounded-md overflow-hidden">
// // // // //                         <Image
// // // // //                           src={newTraining.image_url || "/placeholder.svg"}
// // // // //                           alt="Preview"
// // // // //                           fill
// // // // //                           className="object-cover"
// // // // //                         />
// // // // //                         <Button
// // // // //                           type="button"
// // // // //                           variant="outline"
// // // // //                           size="sm"
// // // // //                           onClick={() => setNewTraining({ ...newTraining, image_url: "" })}
// // // // //                           className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white"
// // // // //                           disabled={submitting}
// // // // //                         >
// // // // //                           <X className="h-3 w-3" />
// // // // //                         </Button>
// // // // //                       </div>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 </div>

// // // // //                 <div className="grid grid-cols-2 gap-4">
// // // // //                   <div>
// // // // //                     <label className="block text-sm font-medium text-charcoal mb-1">Category *</label>
// // // // //                     <Select
// // // // //                       value={newTraining.category_id}
// // // // //                       onValueChange={(value) => setNewTraining({ ...newTraining, category_id: value })}
// // // // //                       disabled={submitting}
// // // // //                     >
// // // // //                       <SelectTrigger className="border-mustard/20 focus:border-mustard">
// // // // //                         <SelectValue placeholder="Select category" />
// // // // //                       </SelectTrigger>
// // // // //                       <SelectContent className="bg-ivory border-mustard/20">
// // // // //                         {categories.map((category) => (
// // // // //                           <SelectItem key={category.id} value={category.id}>
// // // // //                             {category.name}
// // // // //                           </SelectItem>
// // // // //                         ))}
// // // // //                       </SelectContent>
// // // // //                     </Select>
// // // // //                   </div>
// // // // //                   <div>
// // // // //                     <label className="block text-sm font-medium text-charcoal mb-1">Instructor</label>
// // // // //                     <Select
// // // // //                       value={newTraining.instructor_id}
// // // // //                       onValueChange={handleInstructorChange}
// // // // //                       disabled={submitting}
// // // // //                     >
// // // // //                       <SelectTrigger className="border-mustard/20 focus:border-mustard">
// // // // //                         <SelectValue placeholder="Select instructor" />
// // // // //                       </SelectTrigger>
// // // // //                       <SelectContent className="bg-ivory border-mustard/20">
// // // // //                         <SelectItem value="">No instructor assigned</SelectItem>
// // // // //                         {instructors.map((instructor) => (
// // // // //                           <SelectItem key={instructor.id} value={instructor.id}>
// // // // //                             <div className="flex flex-col">
// // // // //                               <span>{instructor.name}</span>
// // // // //                               <span className="text-xs text-deep-purple">{instructor.email}</span>
// // // // //                             </div>
// // // // //                           </SelectItem>
// // // // //                         ))}
// // // // //                       </SelectContent>
// // // // //                     </Select>
// // // // //                   </div>
// // // // //                 </div>

// // // // //                 <div className="grid grid-cols-2 gap-4">
// // // // //                   <div>
// // // // //                     <label className="block text-sm font-medium text-charcoal mb-1">Status *</label>
// // // // //                     <Select
// // // // //                       value={newTraining.status}
// // // // //                       onValueChange={(value: "active" | "inactive" | "draft") =>
// // // // //                         setNewTraining({ ...newTraining, status: value })
// // // // //                       }
// // // // //                       disabled={submitting}
// // // // //                     >
// // // // //                       <SelectTrigger className="border-mustard/20 focus:border-mustard">
// // // // //                         <SelectValue placeholder="Select status" />
// // // // //                       </SelectTrigger>
// // // // //                       <SelectContent className="bg-ivory border-mustard/20">
// // // // //                         <SelectItem value="draft">
// // // // //                           <div className="flex items-center space-x-2">
// // // // //                             <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
// // // // //                             <span>Draft</span>
// // // // //                           </div>
// // // // //                         </SelectItem>
// // // // //                         <SelectItem value="active">
// // // // //                           <div className="flex items-center space-x-2">
// // // // //                             <div className="w-2 h-2 rounded-full bg-green-500"></div>
// // // // //                             <span>Active</span>
// // // // //                           </div>
// // // // //                         </SelectItem>
// // // // //                         <SelectItem value="inactive">
// // // // //                           <div className="flex items-center space-x-2">
// // // // //                             <div className="w-2 h-2 rounded-full bg-gray-500"></div>
// // // // //                             <span>Inactive</span>
// // // // //                           </div>
// // // // //                         </SelectItem>
// // // // //                       </SelectContent>
// // // // //                     </Select>
// // // // //                   </div>
// // // // //                   <div>
// // // // //                     <label className="block text-sm font-medium text-charcoal mb-1">Max Trainees</label>
// // // // //                     <Input
// // // // //                       type="number"
// // // // //                       value={newTraining.max_trainees}
// // // // //                       onChange={(e) => setNewTraining({ ...newTraining, max_trainees: Number(e.target.value) })}
// // // // //                       placeholder="0"
// // // // //                       min="0"
// // // // //                       className="border-mustard/20 focus:border-mustard"
// // // // //                       disabled={submitting}
// // // // //                     />
// // // // //                   </div>
// // // // //                 </div>

// // // // //                 <div className="grid grid-cols-2 gap-4">
// // // // //                   <div>
// // // // //                     <label className="block text-sm font-medium text-charcoal mb-1">Price ($)</label>
// // // // //                     <Input
// // // // //                       type="number"
// // // // //                       value={newTraining.price}
// // // // //                       onChange={(e) => setNewTraining({ ...newTraining, price: Number(e.target.value) })}
// // // // //                       placeholder="0"
// // // // //                       min="0"
// // // // //                       step="0.01"
// // // // //                       className="border-mustard/20 focus:border-mustard"
// // // // //                       disabled={submitting}
// // // // //                     />
// // // // //                   </div>
// // // // //                   <div>
// // // // //                     <label className="block text-sm font-medium text-charcoal mb-1">Discount (%)</label>
// // // // //                     <Input
// // // // //                       type="number"
// // // // //                       value={newTraining.discount}
// // // // //                       onChange={(e) => setNewTraining({ ...newTraining, discount: Number(e.target.value) })}
// // // // //                       placeholder="0"
// // // // //                       min="0"
// // // // //                       max="100"
// // // // //                       className="border-mustard/20 focus:border-mustard"
// // // // //                       disabled={submitting}
// // // // //                     />
// // // // //                   </div>
// // // // //                 </div>

// // // // //                 <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
// // // // //                   <Button
// // // // //                     type="button"
// // // // //                     variant="outline"
// // // // //                     onClick={() => setShowCreateForm(false)}
// // // // //                     className="w-full sm:w-auto border-mustard/20 text-charcoal hover:bg-mustard/10"
// // // // //                     disabled={submitting}
// // // // //                   >
// // // // //                     Cancel
// // // // //                   </Button>
// // // // //                   <Button
// // // // //                     type="submit"
// // // // //                     disabled={submitting}
// // // // //                     className="w-full sm:w-auto bg-mustard hover:bg-mustard/90 text-ivory"
// // // // //                   >
// // // // //                     {submitting ? (
// // // // //                       <>
// // // // //                         <Loader2 className="h-4 w-4 animate-spin mr-2" />
// // // // //                         Creating...
// // // // //                       </>
// // // // //                     ) : (
// // // // //                       "Create Training"
// // // // //                     )}
// // // // //                   </Button>
// // // // //                 </div>
// // // // //               </form>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* Edit Training Form Overlay - Responsive */}
// // // // //       {showEditForm && editingTraining && (
// // // // //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
// // // // //           <div className="bg-ivory border border-mustard/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
// // // // //             <div className="p-4 sm:p-6">
// // // // //               <div className="flex justify-between items-center mb-4">
// // // // //                 <h2 className="text-xl sm:text-2xl font-bold text-charcoal">Edit Training</h2>
// // // // //                 <Button
// // // // //                   variant="ghost"
// // // // //                   size="sm"
// // // // //                   onClick={() => setShowEditForm(false)}
// // // // //                   className="text-charcoal hover:bg-mustard/10"
// // // // //                   disabled={submitting}
// // // // //                 >
// // // // //                   <X className="h-4 w-4" />
// // // // //                 </Button>
// // // // //               </div>

// // // // //               <form onSubmit={handleEditTraining} className="space-y-4">
// // // // //                 <div className="grid grid-cols-2 gap-4">
// // // // //                   <div>
// // // // //                     <label className="block text-sm font-medium text-charcoal mb-1">Training Name *</label>
// // // // //                     <Input
// // // // //                       value={editingTraining.name}
// // // // //                       onChange={(e) => setEditingTraining({ ...editingTraining, name: e.target.value })}
// // // // //                       placeholder="Enter training name"
// // // // //                       className="border-mustard/20 focus:border-mustard"
// // // // //                       required
// // // // //                       disabled={submitting}
// // // // //                     />
// // // // //                   </div>
// // // // //                   <div>
// // // // //                     <label className="block text-sm font-medium text-charcoal mb-1">Course Code *</label>
// // // // //                     <Input
// // // // //                       value={editingTraining.course_code}
// // // // //                       onChange={(e) => setEditingTraining({ ...editingTraining, course_code: e.target.value })}
// // // // //                       placeholder="e.g., MKP-ADV-001"
// // // // //                       className="border-mustard/20 focus:border-mustard"
// // // // //                       required
// // // // //                       disabled={submitting}
// // // // //                     />
// // // // //                   </div>
// // // // //                 </div>

// // // // //                 <div>
// // // // //                     <label className="block text-sm font-medium text-charcoal mb-1">Description *</label>
// // // // //                     <Textarea
// // // // //                       value={editingTraining.description}
// // // // //                       onChange={(e) => setEditingTraining({ ...editingTraining, description: e.target.value })}
// // // // //                       placeholder="Enter training description"
// // // // //                       className="border-mustard/20 focus:border-mustard"
// // // // //                       rows={3}
// // // // //                       required
// // // // //                       disabled={submitting}
// // // // //                     />
// // // // //                   </div>

// // // // //                   <div>
// // // // //                   <label className="block text-sm font-medium text-charcoal mb-1">Training Image</label>
// // // // //                   <div className="space-y-3">
// // // // //                     <div className="flex items-center space-x-2">
// // // // //                       <input
// // // // //                         type="file"
// // // // //                         id="file-upload-edit"
// // // // //                         accept="image/*"
// // // // //                         onChange={(e) => {
// // // // //                           const file = e.target.files?.[0]
// // // // //                           if (file) {
// // // // //                             handleFileUpload(file, true)
// // // // //                           }
// // // // //                         }}
// // // // //                         className="hidden"
// // // // //                         disabled={submitting || uploadingEditFile}
// // // // //                       />
// // // // //                       <Button
// // // // //                         type="button"
// // // // //                         variant="outline"
// // // // //                         onClick={() => document.getElementById("file-upload-edit")?.click()}
// // // // //                         disabled={submitting || uploadingEditFile}
// // // // //                         className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
// // // // //                       >
// // // // //                         {uploadingEditFile ? (
// // // // //                           <>
// // // // //                             <Loader2 className="h-4 w-4 animate-spin mr-2" />
// // // // //                             Uploading...
// // // // //                           </>
// // // // //                         ) : (
// // // // //                           <>
// // // // //                             <Plus className="h-4 w-4 mr-2" />
// // // // //                             Upload New Image
// // // // //                           </>
// // // // //                         )}
// // // // //                       </Button>
// // // // //                       <span className="text-sm text-deep-purple">Images only (Max 10MB)</span>
// // // // //                     </div>

// // // // //                     {editingTraining.image_url && (
// // // // //                       <div className="relative w-32 h-32 border border-mustard/20 rounded-md overflow-hidden">
// // // // //                         <Image
// // // // //                           src={editingTraining.image_url || "/placeholder.svg"}
// // // // //                           alt="Preview"
// // // // //                           fill
// // // // //                           className="object-cover"
// // // // //                         />
// // // // //                         <Button
// // // // //                           type="button"
// // // // //                           variant="outline"
// // // // //                           size="sm"
// // // // //                           onClick={() => setEditingTraining({ ...editingTraining, image_url: "" })}
// // // // //                           className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white"
// // // // //                           disabled={submitting}
// // // // //                         >
// // // // //                           <X className="h-3 w-3" />
// // // // //                         </Button>
// // // // //                       </div>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 </div>

// // // // //                   <div className="grid grid-cols-2 gap-4">
// // // // //                     <div>
// // // // //                       <label className="block text-sm font-medium text-charcoal mb-1">Category *</label>
// // // // //                       <Select
// // // // //                         value={editingTraining.category_id}
// // // // //                         onValueChange={(value) => setEditingTraining({ ...editingTraining, category_id: value })}
// // // // //                         disabled={submitting}
// // // // //                       >
// // // // //                         <SelectTrigger className="border-mustard/20 focus:border-mustard">
// // // // //                           <SelectValue placeholder="Select category" />
// // // // //                         </SelectTrigger>
// // // // //                         <SelectContent className="bg-ivory border-mustard/20">
// // // // //                           {categories.map((category) => (
// // // // //                             <SelectItem key={category.id} value={category.id}>
// // // // //                               {category.name}
// // // // //                             </SelectItem>
// // // // //                           ))}
// // // // //                         </SelectContent>
// // // // //                       </Select>
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <label className="block text-sm font-medium text-charcoal mb-1">Instructor</label>
// // // // //                       <Select
// // // // //                         value={editingTraining.instructor_id}
// // // // //                         onValueChange={handleInstructorChange}
// // // // //                         disabled={submitting}
// // // // //                       >
// // // // //                         <SelectTrigger className="border-mustard/20 focus:border-mustard">
// // // // //                           <SelectValue placeholder="Select instructor" />
// // // // //                         </SelectTrigger>
// // // // //                         <SelectContent className="bg-ivory border-mustard/20">
// // // // //                           <SelectItem value="">No instructor assigned</SelectItem>
// // // // //                           {instructors.map((instructor) => (
// // // // //                             <SelectItem key={instructor.id} value={instructor.id}>
// // // // //                               <div className="flex flex-col">
// // // // //                                 <span>{instructor.name}</span>
// // // // //                                 <span className="text-xs text-deep-purple">{instructor.email}</span>
// // // // //                               </div>
// // // // //                             </SelectItem>
// // // // //                           ))}
// // // // //                         </SelectContent>
// // // // //                       </Select>
// // // // //                     </div>
// // // // //                   </div>

// // // // //                   <div className="grid grid-cols-2 gap-4">
// // // // //                     <div>
// // // // //                       <label className="block text-sm font-medium text-charcoal mb-1">Status *</label>
// // // // //                       <Select
// // // // //                         value={editingTraining.status}
// // // // //                         onValueChange={(value: "active" | "inactive" | "draft") =>
// // // // //                           setEditingTraining({ ...editingTraining, status: value })
// // // // //                         }
// // // // //                         disabled={submitting}
// // // // //                       >
// // // // //                         <SelectTrigger className="border-mustard/20 focus:border-mustard">
// // // // //                           <SelectValue placeholder="Select status" />
// // // // //                         </SelectTrigger>
// // // // //                         <SelectContent className="bg-ivory border-mustard/20">
// // // // //                           <SelectItem value="draft">
// // // // //                             <div className="flex items-center space-x-2">
// // // // //                               <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
// // // // //                               <span>Draft</span>
// // // // //                             </div>
// // // // //                           </SelectItem>
// // // // //                           <SelectItem value="active">
// // // // //                             <div className="flex items-center space-x-2">
// // // // //                               <div className="w-2 h-2 rounded-full bg-green-500"></div>
// // // // //                               <span>Active</span>
// // // // //                             </div>
// // // // //                           </SelectItem>
// // // // //                           <SelectItem value="inactive">
// // // // //                             <div className="flex items-center space-x-2">
// // // // //                               <div className="w-2 h-2 rounded-full bg-gray-500"></div>
// // // // //                               <span>Inactive</span>
// // // // //                             </div>
// // // // //                           </SelectItem>
// // // // //                         </SelectContent>
// // // // //                       </Select>
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <label className="block text-sm font-medium text-charcoal mb-1">Max Trainees</label>
// // // // //                       <Input
// // // // //                         type="number"
// // // // //                         value={editingTraining.max_trainees}
// // // // //                         onChange={(e) =>
// // // // //                           setEditingTraining({ ...editingTraining, max_trainees: Number(e.target.value) })
// // // // //                         }
// // // // //                         placeholder="0"
// // // // //                         min="0"
// // // // //                         className="border-mustard/20 focus:border-mustard"
// // // // //                         disabled={submitting}
// // // // //                       />
// // // // //                     </div>
// // // // //                   </div>

// // // // //                   <div className="grid grid-cols-2 gap-4">
// // // // //                     <div>
// // // // //                       <label className="block text-sm font-medium text-charcoal mb-1">Price ($)</label>
// // // // //                       <Input
// // // // //                         type="number"
// // // // //                         value={editingTraining.price}
// // // // //                         onChange={(e) =>
// // // // //                           setEditingTraining({ ...editingTraining, price: Number(e.target.value) })
// // // // //                         }
// // // // //                         placeholder="0"
// // // // //                         min="0"
// // // // //                         step="0.01"
// // // // //                         className="border-mustard/20 focus:border-mustard"
// // // // //                         disabled={submitting}
// // // // //                       />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <label className="block text-sm font-medium text-charcoal mb-1">Discount (%)</label>
// // // // //                       <Input
// // // // //                         type="number"
// // // // //                         value={editingTraining.discount}
// // // // //                         onChange={(e) =>
// // // // //                           setEditingTraining({ ...editingTraining, discount: Number(e.target.value) })
// // // // //                         }
// // // // //                         placeholder="0"
// // // // //                         min="0"
// // // // //                         max="100"
// // // // //                         className="border-mustard/20 focus:border-mustard"
// // // // //                         disabled={submitting}
// // // // //                       />
// // // // //                     </div>
// // // // //                   </div>

// // // // //                   <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
// // // // //                     <Button
// // // // //                       type="button"
// // // // //                       variant="outline"
// // // // //                       onClick={() => setShowEditForm(false)}
// // // // //                       className="w-full sm:w-auto border-mustard/20 text-charcoal hover:bg-mustard/10"
// // // // //                       disabled={submitting}
// // // // //                     >
// // // // //                       Cancel
// // // // //                     </Button>
// // // // //                     <Button
// // // // //                       type="submit"
// // // // //                       disabled={submitting}
// // // // //                       className="w-full sm:w-auto bg-mustard hover:bg-mustard/90 text-ivory"
// // // // //                     >
// // // // //                       {submitting ? (
// // // // //                         <>
// // // // //                           <Loader2 className="h-4 w-4 animate-spin mr-2" />
// // // // //                           Updating...
// // // // //                         </>
// // // // //                       ) : (
// // // // //                         "Update Training"
// // // // //                       )}
// // // // //                     </Button>
// // // // //                   </div>
// // // // //                 </form>
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>
// // // // //         )}
// // // // //       </div>
// // // // //     )
// // // // //   }

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
//                 disabled={submitting || uploadingFile}
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

// // "use client";

// // import { useState, useEffect, useCallback } from "react";
// // import Image from "next/image";
// // import { useRouter, useSearchParams } from "next/navigation";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Badge } from "@/components/ui/badge";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import {
// //   Loader2,
// //   Plus,
// //   Edit,
// //   Trash2,
// //   X,
// //   Upload,
// //   AlertCircle,
// // } from "lucide-react";
// // import { useToast } from "@/hooks/use-toast";
// // import { Alert, AlertDescription } from "@/components/ui/alert";
// // import { QuizManager } from "@/components/admin/QuizManager";

// // // --- Types ---
// // interface Training {
// //   id: string;
// //   name: string;
// //   description: string;
// //   image_url: string;
// //   course_code: string;
// //   category_id: string;
// //   category_name: string;
// //   price: number;
// //   discount: number;
// //   max_trainees: number;
// //   instructor_name: string;
// //   instructor_id: string;
// //   status: "active" | "inactive" | "draft";
// //   level: string;
// //   overview: string;
// //   what_you_will_learn: string;
// //   requirements: string;
// //   who_is_for: string;
// //   duration: number;
// // }
// // interface Category {
// //   id: string;
// //   name: string;
// // }
// // interface Instructor {
// //   id: string;
// //   name: string;
// //   email: string;
// // }

// // export default function TrainingsPage() {
// //   const { toast } = useToast();
// //   const router = useRouter();
// //   const searchParams = useSearchParams();

// //   const [trainings, setTrainings] = useState<Training[]>([]);
// //   const [categories, setCategories] = useState<Category[]>([]);
// //   const [instructors, setInstructors] = useState<Instructor[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   const [activeTab, setActiveTab] = useState<"details" | "quiz">("details");
// //   const [showCreateForm, setShowCreateForm] = useState(false);
// //   const [showEditForm, setShowEditForm] = useState(false);
// //   const [editingTraining, setEditingTraining] =
// //     useState<Partial<Training> | null>(null);
// //   const [submitting, setSubmitting] = useState(false);
// //   const [uploadingFile, setUploadingFile] = useState(false);
// //   const [createdTraining, setCreatedTraining] = useState<Training | null>(null);

// //   const [newTraining, setNewTraining] = useState({
// //     name: "",
// //     description: "",
// //     image_url: "",
// //     course_code: "",
// //     category_id: "",
// //     price: 0,
// //     discount: 0,
// //     max_trainees: 5,
// //     instructor_id: "",
// //     instructor_name: "",
// //     status: "draft" as "active" | "inactive" | "draft",
// //     level: "Beginner",
// //     overview: "",
// //     what_you_will_learn: "",
// //     requirements: "",
// //     who_is_for: "",
// //     duration: 0,
// //   });

// //   // --- Helpers ---
// //   const parseJsonStringForTextarea = (
// //     jsonString: string | undefined | null
// //   ) => {
// //     if (!jsonString) return "";
// //     try {
// //       const arr = JSON.parse(jsonString);
// //       return Array.isArray(arr) ? arr.join("\n") : "";
// //     } catch {
// //       return typeof jsonString === "string" ? jsonString : "";
// //     }
// //   };

// //   const getStatusColor = (status: string) => {
// //     switch (status) {
// //       case "active":
// //         return "bg-green-100 text-green-800 border-green-200";
// //       case "inactive":
// //         return "bg-gray-100 text-gray-800 border-gray-200";
// //       case "draft":
// //         return "bg-yellow-100 text-yellow-800 border-yellow-200";
// //       default:
// //         return "bg-gray-100 text-gray-800 border-gray-200";
// //     }
// //   };

// //   // --- Fetch ---
// //   const fetchDependencies = useCallback(async () => {
// //     try {
// //       const [catRes, instRes] = await Promise.all([
// //         fetch("/api/admin/categories", { cache: "no-store" }),
// //         fetch("/api/admin/instructors/available", { cache: "no-store" }),
// //       ]);
// //       if (catRes.ok) setCategories((await catRes.json()).categories || []);
// //       if (instRes.ok) setInstructors((await instRes.json()).instructors || []);
// //     } catch {
// //       toast({
// //         title: "Error",
// //         description: "Failed to load categories or instructors.",
// //         variant: "destructive",
// //       });
// //     }
// //   }, [toast]);

// //   const fetchTrainings = useCallback(async () => {
// //     setLoading(true);
// //     setError(null);
// //     try {
// //       const params = new URLSearchParams({
// //         search: searchParams.get("search") || "",
// //         category: searchParams.get("category") || "all",
// //         status: searchParams.get("status") || "all",
// //       });
// //       const res = await fetch(`/api/admin/trainings?${params.toString()}`, {
// //         cache: "no-store",
// //       });
// //       if (!res.ok) throw new Error("Failed to fetch trainings");
// //       const data = await res.json();
// //       setTrainings(data.trainings || []);
// //     } catch (e) {
// //       setError(e instanceof Error ? e.message : "Unknown error");
// //       setTrainings([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [searchParams]);

// //   useEffect(() => {
// //     fetchTrainings();
// //     fetchDependencies();
// //   }, [fetchTrainings, fetchDependencies]);

// //   // --- Upload ---
// //   const handleFileUpload = async (file: File) => {
// //     setUploadingFile(true);
// //     try {
// //       const formData = new FormData();
// //       formData.append("file", file);
// //       const res = await fetch("/api/admin/trainings/upload", {
// //         method: "POST",
// //         body: formData,
// //       });
// //       const data = await res.json();
// //       if (!res.ok || !data.success)
// //         throw new Error(data.error || "Upload failed");
// //       const path = data.filePath;
// //       if (showEditForm && editingTraining)
// //         setEditingTraining({ ...editingTraining, image_url: path });
// //       else setNewTraining({ ...newTraining, image_url: path });
// //       toast({ title: "Success", description: "Image uploaded." });
// //     } catch (e) {
// //       toast({
// //         title: "Upload Error",
// //         description: e instanceof Error ? e.message : "Unknown error",
// //         variant: "destructive",
// //       });
// //     } finally {
// //       setUploadingFile(false);
// //     }
// //   };

// //   // --- CRUD ---
// //   const handleCreateTraining = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setSubmitting(true);
// //     try {
// //       const res = await fetch("/api/admin/trainings", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(newTraining),
// //       });
// //       const data = await res.json();
// //       if (!res.ok) throw new Error(data.error || "Failed");
// //       setCreatedTraining(data.training);
// //       toast({
// //         title: "Success",
// //         description: "Training created successfully.",
// //       });
// //       setShowCreateForm(false);
// //       setNewTraining({
// //         ...newTraining,
// //         name: "",
// //         description: "",
// //         image_url: "",
// //         course_code: "",
// //         category_id: "",
// //         price: 0,
// //         discount: 0,
// //         max_trainees: 5,
// //         instructor_id: "",
// //         instructor_name: "",
// //         status: "draft",
// //         level: "Beginner",
// //         overview: "",
// //         what_you_will_learn: "",
// //         requirements: "",
// //         who_is_for: "",
// //         duration: 0,
// //       });
// //       fetchTrainings();
// //     } catch (e) {
// //       toast({
// //         title: "Error",
// //         description: e instanceof Error ? e.message : "Unknown error",
// //         variant: "destructive",
// //       });
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const handleEditTraining = async (e: React.FormEvent<HTMLFormElement>) => {
// //     e.preventDefault();
// //     if (!editingTraining?.id) return;
// //     setSubmitting(true);
// //     try {
// //       const res = await fetch("/api/admin/trainings", {
// //         method: "PUT",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(editingTraining),
// //       });
// //       const data = await res.json();
// //       if (!res.ok) throw new Error(data.error || "Failed");
// //       toast({
// //         title: "Success",
// //         description: "Training updated successfully.",
// //       });
// //       setShowEditForm(false);
// //       setEditingTraining(null);
// //       fetchTrainings();
// //     } catch (e) {
// //       toast({
// //         title: "Error",
// //         description: e instanceof Error ? e.message : "Unknown error",
// //         variant: "destructive",
// //       });
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const handleDeleteTraining = async (id: string) => {
// //     if (!confirm("Are you sure?")) return;
// //     try {
// //       const res = await fetch(`/api/admin/trainings?id=${id}`, {
// //         method: "DELETE",
// //       });
// //       const data = await res.json();
// //       if (!res.ok) throw new Error(data.error || "Failed");
// //       toast({ title: "Deleted", description: "Training deleted." });
// //       fetchTrainings();
// //     } catch (e) {
// //       toast({
// //         title: "Error",
// //         description: e instanceof Error ? e.message : "Unknown error",
// //         variant: "destructive",
// //       });
// //     }
// //   };

// //   const openEditForm = (
// //     training: Training,
// //     tab: "details" | "quiz" = "details"
// //   ) => {
// //     setEditingTraining({
// //       ...training,
// //       what_you_will_learn: parseJsonStringForTextarea(
// //         training.what_you_will_learn
// //       ),
// //       requirements: parseJsonStringForTextarea(training.requirements),
// //       who_is_for: parseJsonStringForTextarea(training.who_is_for),
// //     });
// //     setShowEditForm(true);
// //     setActiveTab(tab); // <-- This ensures Quiz tab is active when needed
// //   };

// //   const renderFormFields = (
// //     data: typeof newTraining | Partial<Training>,
// //     setData: any
// //   ) => (
// //     <div className="space-y-6">
// //       {/* Name & Code */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //         <Input
// //           placeholder="Training Name"
// //           value={data.name}
// //           onChange={(e) => setData({ ...data, name: e.target.value })}
// //           disabled={submitting}
// //           required
// //         />
// //         <Input
// //           placeholder="Course Code"
// //           value={data.course_code}
// //           onChange={(e) => setData({ ...data, course_code: e.target.value })}
// //           disabled={submitting}
// //           required
// //         />
// //       </div>
// //       {/* Description */}
// //       <Textarea
// //         placeholder="Short Description"
// //         value={data.description}
// //         onChange={(e) => setData({ ...data, description: e.target.value })}
// //         rows={3}
// //         disabled={submitting}
// //       />
// //       {/* Image Upload */}
// //       <div className="flex items-center gap-4">
// //         <input
// //           type="file"
// //           className="hidden"
// //           id={showEditForm ? "file-upload-edit" : "file-upload-create"}
// //           accept="image/*"
// //           onChange={(e) =>
// //             e.target.files && handleFileUpload(e.target.files[0])
// //           }
// //           disabled={submitting || uploadingFile}
// //         />
// //         <Button
// //           type="button"
// //           variant="outline"
// //           onClick={() =>
// //             document
// //               .getElementById(
// //                 showEditForm ? "file-upload-edit" : "file-upload-create"
// //               )
// //               ?.click()
// //           }
// //           disabled={submitting || uploadingFile}
// //         >
// //           {uploadingFile ? (
// //             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// //           ) : (
// //             <Upload className="h-4 w-4 mr-2" />
// //           )}
// //           {uploadingFile ? "Uploading..." : "Upload Image"}
// //         </Button>
// //         {data.image_url && (
// //           <div className="relative w-24 h-16 rounded-md border overflow-hidden">
// //             <Image
// //               src={data.image_url}
// //               alt="Preview"
// //               fill
// //               style={{ objectFit: "cover" }}
// //             />
// //             <Button
// //               type="button"
// //               variant="destructive"
// //               size="icon"
// //               className="absolute top-0 right-0 h-5 w-5"
// //               onClick={() => setData({ ...data, image_url: "" })}
// //             >
// //               <X className="h-3 w-3" />
// //             </Button>
// //           </div>
// //         )}
// //       </div>

// //       {/* Document Upload */}
// //       <div className="flex items-center gap-4 mt-4">
// //         <input
// //           type="file"
// //           className="hidden"
// //           id={showEditForm ? "doc-upload-edit" : "doc-upload-create"}
// //           accept=".pdf,.doc,.docx"
// //           onChange={async (e) => {
// //             if (!e.target.files || !e.target.files[0]) return;

// //             const trainingId = showEditForm
// //               ? editingTraining?.id
// //               : createdTraining?.id;

// //             if (!trainingId) {
// //               toast({
// //                 title: "Error",
// //                 description: "Please create the training first.",
// //                 variant: "destructive",
// //               });
// //               return;
// //             }

// //             setUploadingFile(true);
// //             const file = e.target.files[0];
// //             try {
// //               const formData = new FormData();
// //               formData.append("file", file);
// //               formData.append("trainingId", trainingId);

// //               const res = await fetch("/api/admin/trainings/upload-document", {
// //                 method: "POST",
// //                 body: formData,
// //               });

// //               const data = await res.json();
// //               if (!res.ok || !data.success)
// //                 throw new Error(data.error || "Upload failed");

// //               toast({ title: "Document uploaded successfully ✅" });
// //             } catch (e) {
// //               toast({
// //                 title: "Upload Error",
// //                 description: e instanceof Error ? e.message : "Unknown error",
// //                 variant: "destructive",
// //               });
// //             } finally {
// //               setUploadingFile(false);
// //             }
// //           }}
// //           disabled={
// //             submitting ||
// //             uploadingFile ||
// //             (!showEditForm && !createdTraining?.id)
// //           }
// //         />

// //         <Button
// //           type="button"
// //           variant="outline"
// //           onClick={() =>
// //             document
// //               .getElementById(
// //                 showEditForm ? "doc-upload-edit" : "doc-upload-create"
// //               )
// //               ?.click()
// //           }
// //           disabled={submitting || uploadingFile}
// //         >
// //           {uploadingFile ? (
// //             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// //           ) : (
// //             <Upload className="h-4 w-4 mr-2" />
// //           )}
// //           {uploadingFile ? "Uploading..." : "Upload Document"}
// //         </Button>
// //       </div>

// //       {/* Overview */}
// //       <Textarea
// //         placeholder="Detailed Overview"
// //         value={data.overview}
// //         onChange={(e) => setData({ ...data, overview: e.target.value })}
// //         rows={5}
// //         disabled={submitting}
// //       />
// //       {/* What You Will Learn, Requirements, Who Is For */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //         <Textarea
// //           placeholder="What You'll Learn (one per line)"
// //           value={data.what_you_will_learn}
// //           onChange={(e) =>
// //             setData({ ...data, what_you_will_learn: e.target.value })
// //           }
// //           rows={6}
// //           disabled={submitting}
// //         />
// //         <Textarea
// //           placeholder="Requirements (one per line)"
// //           value={data.requirements}
// //           onChange={(e) => setData({ ...data, requirements: e.target.value })}
// //           rows={6}
// //           disabled={submitting}
// //         />
// //         <Textarea
// //           placeholder="Who This Is For (one per line)"
// //           value={data.who_is_for}
// //           onChange={(e) => setData({ ...data, who_is_for: e.target.value })}
// //           rows={6}
// //           disabled={submitting}
// //         />
// //       </div>
// //       {/* Category, Instructor, Level */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //         <Select
// //           value={data.category_id}
// //           onValueChange={(v) => setData({ ...data, category_id: v })}
// //           disabled={submitting}
// //         >
// //           <SelectTrigger>
// //             <SelectValue placeholder="Select Category" />
// //           </SelectTrigger>
// //           <SelectContent>
// //             {categories.map((c) => (
// //               <SelectItem key={c.id} value={c.id}>
// //                 {c.name}
// //               </SelectItem>
// //             ))}
// //           </SelectContent>
// //         </Select>
// //         <Select
// //           value={data.instructor_id || ""}
// //           onValueChange={(v) =>
// //             setData({
// //               ...data,
// //               instructor_id: v,
// //               instructor_name: instructors.find((i) => i.id === v)?.name || "",
// //             })
// //           }
// //           disabled={submitting}
// //         >
// //           <SelectTrigger>
// //             <SelectValue placeholder="Select Instructor" />
// //           </SelectTrigger>
// //           <SelectContent>
// //             {instructors.map((i) => (
// //               <SelectItem key={i.id} value={String(i.id)}>
// //                 {i.name}
// //               </SelectItem>
// //             ))}
// //           </SelectContent>
// //         </Select>
// //         <Select
// //           value={data.level}
// //           onValueChange={(v) => setData({ ...data, level: v })}
// //           disabled={submitting}
// //         >
// //           <SelectTrigger>
// //             <SelectValue placeholder="Select Level" />
// //           </SelectTrigger>
// //           <SelectContent>
// //             <SelectItem value="Beginner">Beginner</SelectItem>
// //             <SelectItem value="Intermediate">Intermediate</SelectItem>
// //             <SelectItem value="Advanced">Advanced</SelectItem>
// //           </SelectContent>
// //         </Select>
// //       </div>
// //     </div>
// //   );

// //   if (loading)
// //     return (
// //       <div className="flex items-center justify-center h-screen">
// //         <Loader2 className="h-12 w-12 animate-spin" />
// //       </div>
// //     );

// //   return (
// //     <div className="space-y-6 p-6 bg-ivory min-h-screen">
// //       <div className="flex justify-between items-center">
// //         <h1 className="text-3xl font-bold text-charcoal">Trainings</h1>
// //         <Button
// //           type="button"
// //           onClick={() => setShowCreateForm(true)}
// //           className="bg-mustard hover:bg-mustard/90 text-ivory"
// //         >
// //           <Plus className="mr-2" />
// //           Add Training
// //         </Button>
// //       </div>

// //       {error && (
// //         <Alert variant="destructive">
// //           <AlertCircle className="mr-2" />
// //           <AlertDescription>{error}</AlertDescription>
// //         </Alert>
// //       )}

// //       {/* Table */}
// //       <div className="bg-white border rounded-lg overflow-auto">
// //         <Table className="min-w-[1200px]">
// //           <TableHeader>
// //             <TableRow>
// //               <TableHead>Training</TableHead>
// //               <TableHead>Code</TableHead>
// //               <TableHead>Category</TableHead>
// //               <TableHead>Instructor</TableHead>
// //               <TableHead>Price</TableHead>
// //               <TableHead>Status</TableHead>
// //               <TableHead>Actions</TableHead>
// //             </TableRow>
// //           </TableHeader>
// //           <TableBody>
// //             {trainings.map((t) => (
// //               <TableRow key={t.id}>
// //                 <TableCell className="flex items-center gap-2">
// //                   <Image
// //                     src={t.image_url || "/placeholder.svg"}
// //                     alt={t.name}
// //                     width={40}
// //                     height={40}
// //                     className="rounded-md"
// //                   />
// //                   {t.name}
// //                 </TableCell>
// //                 <TableCell>{t.course_code}</TableCell>
// //                 <TableCell>{t.category_name}</TableCell>
// //                 <TableCell>{t.instructor_name || "N/A"}</TableCell>
// //                 <TableCell>
// //                   $
// //                   {isNaN(Number(t.price)) ? "0.00" : Number(t.price).toFixed(2)}
// //                 </TableCell>
// //                 <TableCell>
// //                   <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
// //                 </TableCell>
// //                 <TableCell className="flex gap-2">
// //                   <Button
// //                     type="button"
// //                     variant="outline"
// //                     size="icon"
// //                     onClick={() => openEditForm(t, "details")}
// //                   >
// //                     <Edit className="h-4 w-4" />
// //                   </Button>

// //                   <Button
// //                     type="button"
// //                     variant="destructive"
// //                     size="icon"
// //                     onClick={() => handleDeleteTraining(t.id)}
// //                   >
// //                     <Trash2 className="h-4 w-4" />
// //                   </Button>
// //                 </TableCell>
// //               </TableRow>
// //             ))}
// //           </TableBody>
// //         </Table>
// //       </div>

// //       {/* Modal */}
// //       {/* Modal */}
// //       {(showCreateForm || showEditForm) && (
// //         <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-auto py-10">
// //           <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 relative">
// //             {/* Close Button */}
// //             <Button
// //               type="button"
// //               variant="ghost"
// //               size="icon"
// //               className="absolute top-4 right-4"
// //               onClick={() => {
// //                 setShowCreateForm(false);
// //                 setShowEditForm(false);
// //                 setEditingTraining(null);
// //               }}
// //               disabled={submitting}
// //             >
// //               <X className="h-5 w-5" />
// //             </Button>

// //             {/* Modal Title */}
// //             <h2 className="text-xl font-bold mb-4">
// //               {showEditForm ? "Edit Training" : "Create Training"}
// //             </h2>

// //             {/* Tabs (only for Edit Training) */}
// //             {showEditForm && (
// //               <div className="flex border-b mb-4">
// //                 <button
// //                   type="button"
// //                   className={`px-4 py-2 ${
// //                     activeTab === "details"
// //                       ? "border-b-2 border-mustard font-semibold"
// //                       : "text-muted-foreground"
// //                   }`}
// //                   onClick={() => setActiveTab("details")}
// //                 >
// //                   Details
// //                 </button>
// //                 <button
// //                   type="button"
// //                   className={`px-4 py-2 ${
// //                     activeTab === "quiz"
// //                       ? "border-b-2 border-mustard font-semibold"
// //                       : "text-muted-foreground"
// //                   }`}
// //                   onClick={() => setActiveTab("quiz")}
// //                 >
// //                   Quiz
// //                 </button>
// //               </div>
// //             )}

// //             {/* --- Form or Quiz --- */}
// //             {(!showEditForm || activeTab === "details") && (
// //               <form
// //                 onSubmit={
// //                   showEditForm ? handleEditTraining : handleCreateTraining
// //                 }
// //                 className="space-y-6"
// //               >
// //                 {renderFormFields(
// //                   showEditForm ? editingTraining! : newTraining,
// //                   showEditForm ? setEditingTraining : setNewTraining
// //                 )}

// //                 {/* Buttons */}
// //                 <div className="flex justify-end gap-4">
// //                   <Button
// //                     type="button"
// //                     variant="outline"
// //                     onClick={() => {
// //                       setShowCreateForm(false);
// //                       setShowEditForm(false);
// //                       setEditingTraining(null);
// //                     }}
// //                     disabled={submitting}
// //                   >
// //                     Cancel
// //                   </Button>
// //                   <Button
// //                     type="submit"
// //                     disabled={submitting || uploadingFile}
// //                     className="bg-mustard text-ivory"
// //                   >
// //                     {submitting ? (
// //                       <Loader2 className="animate-spin h-4 w-4" />
// //                     ) : showEditForm ? (
// //                       "Save Changes"
// //                     ) : (
// //                       "Create"
// //                     )}
// //                   </Button>
// //                 </div>
// //               </form>
// //             )}

// //             {/* QuizManager - only for quiz tab */}
// //             {showEditForm && activeTab === "quiz" && editingTraining?.id && (
// //               <QuizManager trainingId={editingTraining.id} />
// //             )}
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
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
  Search,
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
  sample_video_url: string; // ADDED: Sample video URL
}

interface Category {
  id: string;
  name: string;
}
interface Instructor {
  id: string;
  name: string;
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
  const [uploadingDocument, setUploadingDocument] = useState(false); // ADDED: New state for document upload

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
    sample_video_url: "", // ADDED: Initial state for sample video URL
  };
  const [newTraining, setNewTraining] = useState(initialNewTrainingState);

  // --- Data Fetching ---
  const fetchDependencies = useCallback(async () => {
    try {
      const [catResponse, instResponse] = await Promise.all([
        fetch("/api/admin/categories", { cache: "no-store" }),
        fetch("/api/admin/instructors/available", { cache: "no-store" }),
      ]);
      if (catResponse.ok)
        setCategories((await catResponse.json()).categories || []);
      if (instResponse.ok)
        setInstructors((await instResponse.json()).instructors || []);
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not load categories or instructors.",
        variant: "destructive",
      });
    }
  }, [toast]);

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

  useEffect(() => {
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const status = searchParams.get("status") || "all";
    fetchTrainings(search, category, status);
  }, [searchParams, fetchTrainings]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  // --- Event Handlers ---
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

  // ADDED: New handler for document upload
  const handleDocumentUpload = async (file: File) => {
    setUploadingDocument(true);
    try {
      if (!editingTraining?.id) {
        // Documents can only be uploaded for existing trainings (which have an ID)
        throw new Error(
          "Cannot upload document without a training ID. Please save the training first."
        );
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("trainingId", editingTraining.id); // Associate with the current training being edited

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
      // To display uploaded documents, you would typically refetch the training's documents
      // or update a local state that holds document information.
      // For this request, we're only implementing the upload functionality.
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
      fetchTrainings(searchQuery, filterCategory, filterStatus);
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
      fetchTrainings(searchQuery, filterCategory, filterStatus);
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
      fetchTrainings(searchQuery, filterCategory, filterStatus);
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
      sample_video_url: training.sample_video_url || "", // ADDED: Initialize sample video URL
    });
    setShowEditForm(true);
  };

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

      {/* ADDED: Sample Video URL Field */}
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

      {/* ADDED: Document Upload Field (Enabled only for editing existing trainings) */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Upload Documents
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="document-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" // Common document types
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleDocumentUpload(e.target.files[0]);
              }
            }}
            // Disable if submitting, currently uploading, or in create mode (no training ID yet)
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
          {/* Future improvement: Display a list of uploaded documents here */}
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
            onValueChange={(value) => setData({ ...data, category_id: value })}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
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
            onValueChange={(value) =>
              setData({
                ...data,
                instructor_id: value,
                instructor_name:
                  instructors.find((i) => i.id === value)?.name || "",
              })
            }
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select instructor" />
            </SelectTrigger>
            <SelectContent>
              {instructors.map((i) => (
                <SelectItem key={i.id} value={String(i.id)}>
                  {i.name}
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
        <div className="p-4 border-b">
          {/* Filters UI can go here if needed */}
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
            {/* <div className="overflow-y-auto flex-grow">
              <form
                id="training-form"
                onSubmit={
                  showEditForm ? handleEditTraining : handleCreateTraining
                }
                className="p-6"
              >
                {renderFormFields(
                  showEditForm ? editingTraining! : newTraining,
                  showEditForm ? setEditingTraining : setNewTraining
                )}
              </form>
            </div> */}
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
