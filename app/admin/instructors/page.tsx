// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Plus, Edit, Trash2, Search, Download, RotateCcw, Eye, Loader2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { useRouter, useSearchParams } from "next/navigation"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"

// interface EnhancedInstructor {
//   id: string
//   name: string
//   email: string
//   phone?: string
//   specialization: string
//   experience: number
//   status: "active" | "inactive" | "on-leave"
//   user_id?: string
//   trainings_count?: number
//   students_count?: number
//   upcoming_sessions?: number
//   join_date?: string
// }

// interface PaginationInfo {
//   page: number
//   limit: number
//   total: number
//   totalPages: number
//   hasNext: boolean
//   hasPrev: boolean
// }

// export default function InstructorsPage() {
//   const { toast } = useToast()
//   const router = useRouter()
//   const searchParams = useSearchParams()

//   const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
//   const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all")
//   const [filterSpecialization, setFilterSpecialization] = useState(searchParams.get("specialization") || "all")
//   const [instructors, setInstructors] = useState<EnhancedInstructor[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [pagination, setPagination] = useState<PaginationInfo>({
//     page: 1,
//     limit: 10,
//     total: 0,
//     totalPages: 0,
//     hasNext: false,
//     hasPrev: false,
//   })

//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
//   const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
//   const [selectedInstructor, setSelectedInstructor] = useState<EnhancedInstructor | null>(null)
//   const [submitting, setSubmitting] = useState(false)

//   const [newInstructor, setNewInstructor] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     specialization: "",
//     experience: 0,
//     status: "active" as "active" | "inactive" | "on-leave",
//     password: "",
//     confirmPassword: "",
//   })

//   const [editInstructor, setEditInstructor] = useState({
//     id: "",
//     name: "",
//     email: "",
//     phone: "",
//     specialization: "",
//     experience: 0,
//     status: "active" as "active" | "inactive" | "on-leave",
//     password: "",
//     confirmPassword: "",
//   })

//   const [resetPasswordData, setResetPasswordData] = useState({
//     newPassword: "",
//     confirmPassword: "",
//     email: "",
//   })

//   const specializations = [
//     "Makeup Artistry",
//     "Hair Styling",
//     "Skincare & Facial",
//     "Nail Care",
//     "Bridal Beauty",
//     "Special Effects Makeup",
//   ]

//   // Enhanced fetch function with pagination
//   const fetchInstructors = useCallback(
//     async (search: string, status: string, specialization: string, page = 1) => {
//       try {
//         setLoading(true)
//         setError(null)
//         console.log("🔍 Fetching instructors with pagination:", { search, status, page })

//         const params = new URLSearchParams({
//           search,
//           status,
//           specialization,
//           page: page.toString(),
//           limit: "10",
//         })

//         const response = await fetch(`/api/admin/instructors?${params}`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           cache: "no-store",
//         })

//         console.log("📡 Response status:", response.status)

//         if (!response.ok) {
//           const errorText = await response.text()
//           console.error("❌ Response not ok:", errorText)
//           throw new Error(`HTTP ${response.status}: ${errorText}`)
//         }

//         const data = await response.json()
//         console.log("✅ Enhanced instructors fetched with pagination:", data.instructors?.length || 0)

//         setInstructors(data.instructors || [])
//         setPagination(
//           data.pagination || {
//             page: 1,
//             limit: 10,
//             total: 0,
//             totalPages: 0,
//             hasNext: false,
//             hasPrev: false,
//           },
//         )
//       } catch (error) {
//         console.error("❌ Error fetching instructors:", error)
//         const errorMessage = error instanceof Error ? error.message : "Failed to fetch instructors"
//         setError(errorMessage)
//         toast({
//           title: "Error",
//           description: errorMessage,
//           variant: "destructive",
//         })
//         setInstructors([])
//       } finally {
//         setLoading(false)
//       }
//     },
//     [toast],
//   )

//   // Update URL when filters change
//   const updateURL = useCallback(
//     (newParams: Record<string, string>) => {
//       const params = new URLSearchParams(searchParams)
//       Object.entries(newParams).forEach(([key, value]) => {
//         if (value && value !== "all" && value !== "") {
//           params.set(key, value)
//         } else {
//           params.delete(key)
//         }
//       })
//       router.push(`?${params.toString()}`, { scroll: false })
//     },
//     [router, searchParams],
//   )

//   // Debounced search
//   const debouncedSearch = useCallback(
//     debounce((search: string) => {
//       updateURL({ search, page: "1" })
//     }, 300),
//     [updateURL],
//   )

//   function debounce(func: Function, wait: number) {
//     let timeout: NodeJS.Timeout
//     return function executedFunction(...args: any[]) {
//       const later = () => {
//         clearTimeout(timeout)
//         func(...args)
//       }
//       clearTimeout(timeout)
//       timeout = setTimeout(later, wait)
//     }
//   }

//   // Handle page change
//   const handlePageChange = (newPage: number) => {
//     updateURL({ page: newPage.toString() })
//   }

//   // Handle filter changes
//   const handleStatusChange = (status: string) => {
//     setFilterStatus(status)
//     updateURL({ status, page: "1" })
//   }

//   const handleSpecializationChange = (specialization: string) => {
//     setFilterSpecialization(specialization)
//     updateURL({ specialization, page: "1" })
//   }

//   // Handle search change
//   const handleSearchChange = (search: string) => {
//     setSearchQuery(search)
//     debouncedSearch(search)
//   }

//   // Effect to fetch data when URL params change
//   useEffect(() => {
//     const page = Number.parseInt(searchParams.get("page") || "1")
//     const search = searchParams.get("search") || ""
//     const status = searchParams.get("status") || "all"
//     const specialization = searchParams.get("specialization") || "all"

//     setSearchQuery(search)
//     setFilterStatus(status)
//     setFilterSpecialization(specialization)

//     fetchInstructors(search, status, specialization, page)
//   }, [searchParams, fetchInstructors])

//   const handleCreateInstructor = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (newInstructor.password !== newInstructor.confirmPassword) {
//       toast({
//         title: "Error",
//         description: "Passwords do not match",
//         variant: "destructive",
//       })
//       return
//     }

//     try {
//       setSubmitting(true)
//       setError(null)
//       console.log("🚀 Creating instructor user with real-time sync...")

//       const response = await fetch("/api/admin/instructors", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: newInstructor.name,
//           email: newInstructor.email,
//           phone: newInstructor.phone,
//           specialization: newInstructor.specialization,
//           experience: newInstructor.experience,
//           status: newInstructor.status,
//           password: newInstructor.password,
//         }),
//       })

//       console.log("📡 Create response status:", response.status)

//       const data = await response.json()
//       console.log("📊 Parsed response data:", data)

//       if (!response.ok || data.success === false) {
//         throw new Error(data.error || `HTTP ${response.status}`)
//       }

//       console.log("✅ Instructor user created with real-time sync:", data.instructor)

//       setNewInstructor({
//         name: "",
//         email: "",
//         phone: "",
//         specialization: "",
//         experience: 0,
//         status: "active",
//         password: "",
//         confirmPassword: "",
//       })
//       setIsCreateDialogOpen(false)

//       toast({
//         title: "Success",
//         description: `${newInstructor.name} has been added as an instructor with user account sync.`,
//       })

//       // Refresh current page
//       const currentPage = Number.parseInt(searchParams.get("page") || "1")
//       fetchInstructors(searchQuery, filterStatus, filterSpecialization, currentPage)
//     } catch (error) {
//       console.error("❌ Error creating instructor:", error)
//       const errorMessage = error instanceof Error ? error.message : "Failed to create instructor"
//       setError(errorMessage)
//       toast({
//         title: "Error",
//         description: errorMessage,
//         variant: "destructive",
//       })
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const handleEditInstructor = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (editInstructor.password && editInstructor.password !== editInstructor.confirmPassword) {
//       toast({
//         title: "Error",
//         description: "Passwords do not match",
//         variant: "destructive",
//       })
//       return
//     }

//     try {
//       setSubmitting(true)
//       setError(null)
//       console.log("🔄 Updating instructor user with real-time sync...")

//       const response = await fetch("/api/admin/instructors", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           id: editInstructor.id,
//           name: editInstructor.name,
//           email: editInstructor.email,
//           phone: editInstructor.phone,
//           specialization: editInstructor.specialization,
//           experience: editInstructor.experience,
//           status: editInstructor.status,
//           password: editInstructor.password,
//         }),
//       })

//       console.log("📡 Update response status:", response.status)

//       const data = await response.json()
//       console.log("📊 Parsed response data:", data)

//       if (!response.ok || data.success === false) {
//         throw new Error(data.error || `HTTP ${response.status}`)
//       }

//       console.log("✅ Instructor user updated with real-time sync")

//       setIsEditDialogOpen(false)
//       setEditInstructor({
//         id: "",
//         name: "",
//         email: "",
//         phone: "",
//         specialization: "",
//         experience: 0,
//         status: "active",
//         password: "",
//         confirmPassword: "",
//       })

//       toast({
//         title: "Success",
//         description: "Instructor has been updated successfully with user sync.",
//       })

//       // Refresh current page
//       const currentPage = Number.parseInt(searchParams.get("page") || "1")
//       fetchInstructors(searchQuery, filterStatus, filterSpecialization, currentPage)
//     } catch (error) {
//       console.error("❌ Error updating instructor:", error)
//       const errorMessage = error instanceof Error ? error.message : "Failed to update instructor"
//       setError(errorMessage)
//       toast({
//         title: "Error",
//         description: errorMessage,
//         variant: "destructive",
//       })
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const handleDeleteInstructor = async (instructorId: string) => {
//     if (
//       !confirm(
//         "Are you sure you want to delete this instructor? This will also delete their user account and all associated data.",
//       )
//     )
//       return

//     try {
//       console.log("🗑️ Deleting instructor user with real-time sync...")
//       const response = await fetch(`/api/admin/instructors?id=${instructorId}`, {
//         method: "DELETE",
//       })

//       console.log("📡 Delete response status:", response.status)

//       const data = await response.json()
//       console.log("📊 Parsed response data:", data)

//       if (!response.ok || data.success === false) {
//         throw new Error(data.error || `HTTP ${response.status}`)
//       }

//       console.log("✅ Instructor user deleted with real-time sync")

//       toast({
//         title: "Success",
//         description: "Instructor and associated user account have been deleted successfully.",
//       })

//       // Refresh current page
//       const currentPage = Number.parseInt(searchParams.get("page") || "1")
//       fetchInstructors(searchQuery, filterStatus, filterSpecialization, currentPage)
//     } catch (error) {
//       console.error("❌ Error deleting instructor:", error)
//       const errorMessage = error instanceof Error ? error.message : "Failed to delete instructor"
//       setError(errorMessage)
//       toast({
//         title: "Error",
//         description: errorMessage,
//         variant: "destructive",
//       })
//     }
//   }

//   const handleResetPassword = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!selectedInstructor) return

//     if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
//       toast({
//         title: "Error",
//         description: "Passwords do not match",
//         variant: "destructive",
//       })
//       return
//     }

//     if (resetPasswordData.newPassword.length < 6) {
//       toast({
//         title: "Error",
//         description: "Password must be at least 6 characters long",
//         variant: "destructive",
//       })
//       return
//     }

//     try {
//       setSubmitting(true)
//       setError(null)

//       const response = await fetch("/api/admin/instructors/reset-password", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           instructorId: selectedInstructor.id,
//           newPassword: resetPasswordData.newPassword,
//           email: resetPasswordData.email,
//         }),
//       })

//       console.log("📡 Reset password response status:", response.status)

//       const data = await response.json()
//       console.log("📊 Parsed response data:", data)

//       if (!response.ok || data.success === false) {
//         throw new Error(data.error || `HTTP ${response.status}`)
//       }

//       setIsResetPasswordDialogOpen(false)
//       setResetPasswordData({
//         newPassword: "",
//         confirmPassword: "",
//         email: "",
//       })

//       toast({
//         title: "Password Reset Successful",
//         description: `Password has been reset for ${data.name}. Email notification sent to ${data.email}.`,
//       })
//     } catch (error) {
//       console.error("❌ Error resetting password:", error)
//       const errorMessage = error instanceof Error ? error.message : "Failed to reset password"
//       setError(errorMessage)
//       toast({
//         title: "Error",
//         description: errorMessage,
//         variant: "destructive",
//       })
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const openResetPasswordDialog = (instructor: EnhancedInstructor) => {
//     setSelectedInstructor(instructor)
//     setResetPasswordData({
//       newPassword: "",
//       confirmPassword: "",
//       email: instructor.email,
//     })
//     setIsResetPasswordDialogOpen(true)
//   }

//   const openEditDialog = (instructor: EnhancedInstructor) => {
//     setSelectedInstructor(instructor)
//     setEditInstructor({
//       id: instructor.id,
//       name: instructor.name,
//       email: instructor.email,
//       phone: instructor.phone || "",
//       specialization: instructor.specialization,
//       experience: instructor.experience,
//       status: instructor.status,
//       password: "",
//       confirmPassword: "",
//     })
//     setIsEditDialogOpen(true)
//   }

//   const exportInstructors = () => {
//     const csvContent =
//       "data:text/csv;charset=utf-8," +
//       "Name,Email,Phone,User ID,Specialization,Trainings,Students,Experience,Status,Join Date,Upcoming Sessions\n" +
//       instructors
//         .map(
//           (i) =>
//             `"${i.name}","${i.email}","${i.phone || "-"}","${i.user_id || "-"}","${i.specialization}","${i.trainings_count || 0}","${i.students_count || 0}","${i.experience}","${i.status}","${i.join_date || "-"}","${i.upcoming_sessions || 0}"`,
//         )
//         .join("\n")

//     const encodedUri = encodeURI(csvContent)
//     const link = document.createElement("a")
//     link.setAttribute("href", encodedUri)
//     link.setAttribute("download", "instructors_with_realtime_counts.csv")
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "active":
//         return "bg-green-100 text-green-800 border-green-200"
//       case "inactive":
//         return "bg-gray-100 text-gray-800 border-gray-200"
//       case "on-leave":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200"
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200"
//     }
//   }

//   // Pagination component
//   const renderPagination = () => {
//     if (pagination.totalPages <= 1) return null

//     const getPageNumbers = () => {
//       const current = pagination.page
//       const total = pagination.totalPages
//       const delta = 2
//       const range = []
//       const rangeWithDots = []

//       for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
//         range.push(i)
//       }

//       if (current - delta > 2) {
//         rangeWithDots.push(1, "...")
//       } else {
//         rangeWithDots.push(1)
//       }

//       rangeWithDots.push(...range)

//       if (current + delta < total - 1) {
//         rangeWithDots.push("...", total)
//       } else {
//         rangeWithDots.push(total)
//       }

//       return rangeWithDots
//     }

//     return (
//       <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
//         <div className="flex justify-between flex-1 sm:hidden">
//           <Button
//             onClick={() => handlePageChange(pagination.page - 1)}
//             disabled={!pagination.hasPrev || loading}
//             variant="outline"
//             size="sm"
//           >
//             Previous
//           </Button>
//           <Button
//             onClick={() => handlePageChange(pagination.page + 1)}
//             disabled={!pagination.hasNext || loading}
//             variant="outline"
//             size="sm"
//           >
//             Next
//           </Button>
//         </div>
//         <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
//           <div>
//             <p className="text-sm text-gray-700">
//               Showing{" "}
//               <span className="font-medium">
//                 {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
//               </span>{" "}
//               to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>{" "}
//               of <span className="font-medium">{pagination.total}</span> results
//             </p>
//           </div>
//           <div>
//             <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
//               <Button
//                 onClick={() => handlePageChange(pagination.page - 1)}
//                 disabled={!pagination.hasPrev || loading}
//                 variant="outline"
//                 size="sm"
//                 className="relative inline-flex items-center px-2 py-2 rounded-l-md"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </Button>

//               {getPageNumbers().map((pageNum, index) => (
//                 <Button
//                   key={index}
//                   onClick={() => (typeof pageNum === "number" ? handlePageChange(pageNum) : undefined)}
//                   disabled={pageNum === "..." || loading}
//                   variant={pageNum === pagination.page ? "default" : "outline"}
//                   size="sm"
//                   className="relative inline-flex items-center px-4 py-2"
//                 >
//                   {pageNum}
//                 </Button>
//               ))}

//               <Button
//                 onClick={() => handlePageChange(pagination.page + 1)}
//                 disabled={!pagination.hasNext || loading}
//                 variant="outline"
//                 size="sm"
//                 className="relative inline-flex items-center px-2 py-2 rounded-r-md"
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </nav>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="relative space-y-4 sm:space-y-6 p-4 sm:p-6">
//       {/* Header - Responsive */}
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Instructors Management</h1>
//           <p className="text-sm sm:text-base text-deep-purple mt-1">
//             Manage instructors from users table with real-time training and student counts
//           </p>
//         </div>
//         <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
//           <Button
//             variant="outline"
//             onClick={exportInstructors}
//             disabled={loading || instructors.length === 0}
//             className="w-full sm:w-auto border-mustard text-mustard hover:bg-mustard hover:text-ivory bg-transparent"
//           >
//             <Download className="h-4 w-4 mr-2" />
//             Export
//           </Button>
//           <Button
//             onClick={() => setIsCreateDialogOpen(true)}
//             className="w-full sm:w-auto bg-mustard hover:bg-mustard/90 text-ivory transition-all duration-200 hover:scale-105 active:scale-95"
//             disabled={submitting}
//           >
//             <Plus className="h-4 w-4 mr-2" />
//             Add Instructor
//           </Button>
//         </div>
//       </div>

//       {/* Error Alert */}
//       {error && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             {error}
//             <Button
//               variant="outline"
//               size="sm"
//               className="ml-2 bg-transparent"
//               onClick={() => {
//                 setError(null)
//                 const currentPage = Number.parseInt(searchParams.get("page") || "1")
//                 fetchInstructors(searchQuery, filterStatus, filterSpecialization, currentPage)
//               }}
//             >
//               Retry
//             </Button>
//           </AlertDescription>
//         </Alert>
//       )}

//       {/* Search and Filter - Responsive */}
//       <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-deep-purple" />
//           <Input
//             placeholder="Search by name or email..."
//             className="pl-8 border-mustard/20 focus:border-mustard"
//             value={searchQuery}
//             onChange={(e) => handleSearchChange(e.target.value)}
//           />
//         </div>
//         <Select value={filterStatus} onValueChange={handleStatusChange}>
//           <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
//             <SelectValue placeholder="Filter by status" />
//           </SelectTrigger>
//           <SelectContent className="bg-ivory border-mustard/20">
//             <SelectItem value="all">All Status</SelectItem>
//             <SelectItem value="active">Active</SelectItem>
//             <SelectItem value="inactive">Inactive</SelectItem>
//             <SelectItem value="on-leave">On Leave</SelectItem>
//           </SelectContent>
//         </Select>
//         <Select value={filterSpecialization} onValueChange={handleSpecializationChange}>
//           <SelectTrigger className="w-full sm:w-[200px] border-mustard/20 focus:border-mustard">
//             <SelectValue placeholder="Filter by specialization" />
//           </SelectTrigger>
//           <SelectContent className="bg-ivory border-mustard/20">
//             <SelectItem value="all">All Specializations</SelectItem>
//             {specializations.map((spec) => (
//               <SelectItem key={spec} value={spec}>
//                 {spec}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Loading State */}
//       {loading && instructors.length === 0 && (
//         <div className="flex items-center justify-center h-64">
//           <div className="text-center">
//             <Loader2 className="h-8 w-8 animate-spin text-mustard mx-auto mb-2" />
//             <p className="text-deep-purple">Loading instructors...</p>
//           </div>
//         </div>
//       )}

//       {/* Instructors Table - Responsive */}
//       <div className="bg-ivory border border-mustard/20 rounded-lg">
//         <div className="p-4 border-b border-mustard/20">
//           <h3 className="text-lg font-semibold text-charcoal">Instructors ({pagination.total})</h3>
//         </div>

//         {!loading && (
//           <>
//             {/* Mobile View */}
//             <div className="block sm:hidden">
//               <div className="space-y-4 p-4">
//                 {instructors.length === 0 ? (
//   <div className="text-center py-8 text-deep-purple">
//     {error
//       ? "Error loading instructors. Please try again."
//       : "No instructors found. Click 'Add Instructor' to create your first instructor."}
//   </div>
// ) : (
//   instructors.map((instructor) => (
//     <div
//       key={`mobile-${instructor.id}`} // Added prefix for extra uniqueness
//       className="border border-mustard/10 rounded-lg p-4 space-y-3 bg-white"
//     >
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h4 className="font-medium text-charcoal">{instructor.name}</h4>
//                           <p className="text-sm text-deep-purple">{instructor.email}</p>
//                           <p className="text-sm text-deep-purple">{instructor.phone || "-"}</p>
//                         </div>
//                         <Badge className={getStatusColor(instructor.status)}>{instructor.status}</Badge>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4 text-sm">
//                         <div>
//                           <span className="text-gray-500">User ID:</span>
//                           <p className="font-mono">{instructor.user_id || "-"}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-500">Experience:</span>
//                           <p>{instructor.experience} years</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-500">Trainings:</span>
//                           <p>{instructor.trainings_count || 0}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-500">Students:</span>
//                           <p>{instructor.students_count || 0}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-500">Specialization:</span>
//                           <p>{instructor.specialization}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-500">Upcoming Sessions:</span>
//                           <p>{instructor.upcoming_sessions || 0}</p>
//                         </div>
//                       </div>

//                       <div className="flex space-x-2">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => openEditDialog(instructor)}
//                           className="flex-1 border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
//                         >
//                           <Edit className="h-4 w-4 mr-1" />
//                           Edit
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => openResetPasswordDialog(instructor)}
//                           className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
//                         >
//                           <RotateCcw className="h-4 w-4 mr-1" />
//                           Reset PW
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleDeleteInstructor(instructor.id)}
//                           className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
//                         >
//                           <Trash2 className="h-4 w-4 mr-1" />
//                           Delete
//                         </Button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//             {/* Desktop View */}
//             <div className="hidden sm:block">
//               <div className="h-96 overflow-auto">
//                 <Table>
//                   <TableHeader className="sticky top-0 bg-ivory z-10">
//                     <TableRow className="border-mustard/20">
//                       <TableHead className="text-charcoal font-semibold">No.</TableHead>
//                       <TableHead className="text-charcoal font-semibold">Instructor</TableHead>
//                       <TableHead className="text-charcoal font-semibold">Contact</TableHead>
//                       <TableHead className="text-charcoal font-semibold">User ID</TableHead>
//                       <TableHead className="text-charcoal font-semibold">Specialization</TableHead>
//                       <TableHead className="text-charcoal font-semibold">Trainings</TableHead>
//                       <TableHead className="text-charcoal font-semibold">Students</TableHead>
//                       <TableHead className="text-charcoal font-semibold">Experience</TableHead>
//                       <TableHead className="text-charcoal font-semibold">Status</TableHead>
//                       <TableHead className="text-charcoal font-semibold">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                  <TableBody>
//   {instructors.length === 0 ? (
//     <TableRow>
//       <TableCell colSpan={10} className="text-center py-8 text-deep-purple">
//         {error
//           ? "Error loading instructors. Please try again."
//           : "No instructors found. Click 'Add Instructor' to create your first instructor."}
//       </TableCell>
//     </TableRow>
//   ) : (
//     instructors.map((instructor, index) => (
//       <TableRow
//         key={`desktop-${instructor.id}-${index}`} // Added prefix and index for extra uniqueness
//         className="border-mustard/10 hover:bg-mustard/5 transition-colors duration-200"
//       >
//                           <TableCell className="font-medium text-charcoal">
//                             {(pagination.page - 1) * pagination.limit + index + 1}
//                           </TableCell>
//                           <TableCell>
//                             <div>
//                               <div className="font-medium">{instructor.name}</div>
//                               <div className="text-sm text-deep-purple">
//                                 Joined {instructor.join_date || "N/A"}
//                               </div>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div>
//                               <div className="text-sm">{instructor.email}</div>
//                               <div className="text-sm text-deep-purple">{instructor.phone || "-"}</div>
//                             </div>
//                           </TableCell>
//                           <TableCell className="font-mono text-sm text-deep-purple">
//                             {instructor.user_id || "-"}
//                           </TableCell>
//                           <TableCell className="text-deep-purple">{instructor.specialization}</TableCell>
//                           <TableCell className="text-deep-purple">{instructor.trainings_count || 0}</TableCell>
//                           <TableCell className="text-deep-purple">{instructor.students_count || 0}</TableCell>
//                           <TableCell className="text-deep-purple">{instructor.experience} years</TableCell>
//                           <TableCell>
//                             <Badge className={getStatusColor(instructor.status)}>{instructor.status}</Badge>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex space-x-1">
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => openEditDialog(instructor)}
//                                 className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
//                               >
//                                 <Edit className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => openResetPasswordDialog(instructor)}
//                                 className="border-blue-200 text-blue-600 hover:bg-blue-50"
//                               >
//                                 <RotateCcw className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleDeleteInstructor(instructor.id)}
//                                 className="border-red-200 text-red-600 hover:bg-red-50"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>

//             {/* Pagination */}
//             {renderPagination()}
//           </>
//         )}
//       </div>

//       {/* Create Instructor Dialog */}
//       <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
//         <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Add New Instructor</DialogTitle>
//             <DialogDescription>
//               Create a new instructor account (Auto-syncs with users table as instructor role)
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleCreateInstructor}>
//             <div className="grid gap-4 py-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="name">Full Name *</Label>
//                 <Input
//                   id="name"
//                   name="name"
//                   type="text"
//                   value={newInstructor.name}
//                   onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
//                   required
//                   className="border-mustard/20 focus:border-mustard"
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="email">Email *</Label>
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={newInstructor.email}
//                   onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
//                   required
//                   className="border-mustard/20 focus:border-mustard"
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="phone">Phone</Label>
//                 <Input
//                   id="phone"
//                   name="phone"
//                   type="tel"
//                   value={newInstructor.phone}
//                   onChange={(e) => setNewInstructor({ ...newInstructor, phone: e.target.value })}
//                   className="border-mustard/20 focus:border-mustard"
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="experience">Experience (years)</Label>
//                 <Input
//                   id="experience"
//                   name="experience"
//                   type="number"
//                   value={newInstructor.experience}
//                   onChange={(e) => setNewInstructor({ ...newInstructor, experience: Number(e.target.value) })}
//                   className="border-mustard/20 focus:border-mustard"
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="specialization">Specialization</Label>
//                 <Select
//                   name="specialization"
//                   value={newInstructor.specialization}
//                   onValueChange={(value) => setNewInstructor({ ...newInstructor, specialization: value })}
//                 >
//                   <SelectTrigger className="border-mustard/20 focus:border-mustard">
//                     <SelectValue placeholder="Select specialization" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-ivory border-mustard/20">
//                     {specializations.map((spec) => (
//                       <SelectItem key={spec} value={spec}>
//                         {spec}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="status">Status</Label>
//                 <Select
//                   name="status"
//                   value={newInstructor.status}
//                   onValueChange={(value: "active" | "inactive" | "on-leave") =>
//                     setNewInstructor({ ...newInstructor, status: value })
//                   }
//                 >
//                   <SelectTrigger className="border-mustard/20 focus:border-mustard">
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-ivory border-mustard/20">
//                     <SelectItem value="active">Active</SelectItem>
//                     <SelectItem value="inactive">Inactive</SelectItem>
//                     <SelectItem value="on-leave">On Leave</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="password">Password *</Label>
//                 <Input
//                   id="password"
//                   name="password"
//                   type="password"
//                   value={newInstructor.password}
//                   onChange={(e) => setNewInstructor({ ...newInstructor, password: e.target.value })}
//                   required
//                   className="border-mustard/20 focus:border-mustard"
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="confirmPassword">Confirm Password *</Label>
//                 <Input
//                   id="confirmPassword"
//                   name="confirmPassword"
//                   type="password"
//                   value={newInstructor.confirmPassword}
//                   onChange={(e) => setNewInstructor({ ...newInstructor, confirmPassword: e.target.value })}
//                   required
//                   className="border-mustard/20 focus:border-mustard"
//                 />
//               </div>
//             </div>
//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setIsCreateDialogOpen(false)}
//                 className="border-mustard/20 text-charcoal hover:bg-mustard/10"
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={submitting} className="bg-mustard hover:bg-mustard/90 text-ivory">
//                 {submitting ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Creating...
//                   </>
//                 ) : (
//                   "Add Instructor"
//                 )}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Edit Instructor Dialog */}
//       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//         <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Edit Instructor</DialogTitle>
//             <DialogDescription>
//               Update instructor information (Auto-syncs with user account and updates real-time counts)
//             </DialogDescription>
//           </DialogHeader>
//           {selectedInstructor && (
//             <form onSubmit={handleEditInstructor}>
//               <div className="grid gap-4 py-4">
//                 <div className="grid gap-2">
//                   <Label htmlFor="edit-name">Full Name *</Label>
//                   <Input
//                     id="edit-name"
//                     value={editInstructor.name}
//                     onChange={(e) => setEditInstructor({ ...editInstructor, name: e.target.value })}
//                     required
//                     className="border-mustard/20 focus:border-mustard"
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="edit-email">Email *</Label>
//                   <Input
//                     id="edit-email"
//                     type="email"
//                     value={editInstructor.email}
//                     onChange={(e) => setEditInstructor({ ...editInstructor, email: e.target.value })}
//                     required
//                     className="border-mustard/20 focus:border-mustard"
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="edit-phone">Phone</Label>
//                   <Input
//                     id="edit-phone"
//                     value={editInstructor.phone}
//                     onChange={(e) => setEditInstructor({ ...editInstructor, phone: e.target.value })}
//                     className="border-mustard/20 focus:border-mustard"
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="edit-experience">Experience (years)</Label>
//                   <Input
//                     id="edit-experience"
//                     type="number"
//                     value={editInstructor.experience}
//                     onChange={(e) => setEditInstructor({ ...editInstructor, experience: Number(e.target.value) })}
//                     className="border-mustard/20 focus:border-mustard"
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="edit-specialization">Specialization</Label>
//                   <Select
//                     value={editInstructor.specialization}
//                     onValueChange={(value) => setEditInstructor({ ...editInstructor, specialization: value })}
//                   >
//                     <SelectTrigger className="border-mustard/20 focus:border-mustard">
//                       <SelectValue placeholder="Select specialization" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-ivory border-mustard/20">
//                       {specializations.map((spec) => (
//                         <SelectItem key={spec} value={spec}>
//                           {spec}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="edit-status">Status</Label>
//                   <Select
//                     value={editInstructor.status}
//                     onValueChange={(value: "active" | "inactive" | "on-leave") =>
//                       setEditInstructor({ ...editInstructor, status: value })
//                     }
//                   >
//                     <SelectTrigger className="border-mustard/20 focus:border-mustard">
//                       <SelectValue placeholder="Select status" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-ivory border-mustard/20">
//                       <SelectItem value="active">Active</SelectItem>
//                       <SelectItem value="inactive">Inactive</SelectItem>
//                       <SelectItem value="on-leave">On Leave</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
//                   <Input
//                     id="edit-password"
//                     type="password"
//                     value={editInstructor.password}
//                     onChange={(e) => setEditInstructor({ ...editInstructor, password: e.target.value })}
//                     className="border-mustard/20 focus:border-mustard"
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
//                   <Input
//                     id="edit-confirmPassword"
//                     type="password"
//                     value={editInstructor.confirmPassword}
//                     onChange={(e) => setEditInstructor({ ...editInstructor, confirmPassword: e.target.value })}
//                     className="border-mustard/20 focus:border-mustard"
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setIsEditDialogOpen(false)}
//                   className="border-mustard/20 text-charcoal hover:bg-mustard/10"
//                 >
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={submitting} className="bg-mustard hover:bg-mustard/90 text-ivory">
//                   {submitting ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Updating...
//                     </>
//                   ) : (
//                     "Update Instructor"
//                   )}
//                 </Button>
//               </DialogFooter>
//             </form>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Reset Password Dialog */}
//       <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Change Password</DialogTitle>
//             <DialogDescription>Update the account password (syncs with user account)</DialogDescription>
//           </DialogHeader>
//           {selectedInstructor && (
//             <form onSubmit={handleResetPassword}>
//               <div className="grid gap-4 py-4">
//                 <div className="grid gap-2">
//                   <Label htmlFor="reset-email">Email</Label>
//                   <Input
//                     id="reset-email"
//                     type="email"
//                     value={resetPasswordData.email}
//                     onChange={(e) => setResetPasswordData({ ...resetPasswordData, email: e.target.value })}
//                     placeholder="Instructor email"
//                     disabled
//                     className="border-mustard/20 focus:border-mustard"
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="reset-newPassword">New Password *</Label>
//                   <Input
//                     id="reset-newPassword"
//                     type="password"
//                     value={resetPasswordData.newPassword}
//                     onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
//                     required
//                     className="border-mustard/20 focus:border-mustard"
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="reset-confirmPassword">Confirm New Password *</Label>
//                   <Input
//                     id="reset-confirmPassword"
//                     type="password"
//                     value={resetPasswordData.confirmPassword}
//                     onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
//                     required
//                     className="border-mustard/20 focus:border-mustard"
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setIsResetPasswordDialogOpen(false)}
//                   className="border-mustard/20 text-charcoal hover:bg-mustard/10"
//                 >
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={submitting} className="bg-mustard hover:bg-mustard/90 text-ivory">
//                   {submitting ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Resetting...
//                     </>
//                   ) : (
//                     "Reset Password"
//                   )}
//                 </Button>
//               </DialogFooter>
//             </form>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Download,
  RotateCcw,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedInstructor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  experience: number;
  status: "active" | "inactive" | "on-leave";
  user_id?: string;
  trainings_count?: number;
  students_count?: number;
  upcoming_sessions?: number;
  join_date?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Helper function to extract a detailed error message from a fetch response
async function getErrorMessageFromResponse(
  response: Response
): Promise<string> {
  let errorMessage = `Request failed with status ${response.status} (${response.statusText})`;
  try {
    const errorData = await response.json();
    errorMessage =
      errorData.error || errorData.message || JSON.stringify(errorData);
  } catch (e) {
    try {
      const textData = await response.text();
      if (textData) {
        errorMessage = textData;
      }
    } catch (e) {
      // Ignore if text cannot be read, initial error message is sufficient
    }
  }
  return errorMessage;
}

export default function InstructorsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [filterStatus, setFilterStatus] = useState(
    searchParams.get("status") || "all"
  );
  const [filterSpecialization, setFilterSpecialization] = useState(
    searchParams.get("specialization") || "all"
  );
  const [instructors, setInstructors] = useState<EnhancedInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [selectedInstructor, setSelectedInstructor] =
    useState<EnhancedInstructor | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newInstructor, setNewInstructor] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: 0,
    status: "active" as "active" | "inactive" | "on-leave",
    password: "",
    confirmPassword: "",
  });

  const [editInstructor, setEditInstructor] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: 0,
    status: "active" as "active" | "inactive" | "on-leave",
    password: "",
    confirmPassword: "",
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
    email: "",
  });

  const specializations = [
    "Makeup Artistry",
    "Hair Styling",
    "Skincare & Facial",
    "Nail Care",
    "Bridal Beauty",
    "Special Effects Makeup",
  ];

  // Enhanced fetch function with pagination
  const fetchInstructors = useCallback(
    async (
      search: string,
      status: string,
      specialization: string,
      page = 1
    ) => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔍 Fetching instructors with pagination:", {
          search,
          status,
          page,
        });

        const params = new URLSearchParams({
          search,
          status,
          specialization,
          page: page.toString(),
          limit: "10",
        });

        const response = await fetch(`/api/admin/instructors?${params}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          const errorText = await getErrorMessageFromResponse(response);
          throw new Error(errorText);
        }

        const data = await response.json();
        console.log(
          "✅ Enhanced instructors fetched with pagination:",
          data.instructors?.length || 0
        );

        setInstructors(data.instructors || []);
        setPagination(
          data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          }
        );
      } catch (error) {
        console.error("❌ Error fetching instructors:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch instructors";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setInstructors([]);
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Update URL when filters change
  const updateURL = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);
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

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      updateURL({ search, page: "1" });
    }, 300),
    [updateURL]
  );

  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() });
  };

  // Handle filter changes
  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    updateURL({ status, page: "1" });
  };

  const handleSpecializationChange = (specialization: string) => {
    setFilterSpecialization(specialization);
    updateURL({ specialization, page: "1" });
  };

  // Handle search change
  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    debouncedSearch(search);
  };

  // Effect to fetch data when URL params change
  useEffect(() => {
    const page = Number.parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const specialization = searchParams.get("specialization") || "all";

    setSearchQuery(search);
    setFilterStatus(status);
    setFilterSpecialization(specialization);

    fetchInstructors(search, status, specialization, page);
  }, [searchParams, fetchInstructors]);

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newInstructor.password !== newInstructor.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      console.log("🚀 Creating instructor user with real-time sync...");

      const response = await fetch("/api/admin/instructors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newInstructor.name,
          email: newInstructor.email,
          phone: newInstructor.phone,
          specialization: newInstructor.specialization,
          experience: newInstructor.experience,
          status: newInstructor.status,
          password: newInstructor.password,
        }),
      });

      console.log("📡 Create response status:", response.status);

      if (!response.ok) {
        const errorText = await getErrorMessageFromResponse(response);
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log("📊 Parsed response data:", data);

      if (data.success === false) {
        throw new Error(data.error || "The server indicated a failure.");
      }

      console.log(
        "✅ Instructor user created with real-time sync:",
        data.instructor
      );

      setNewInstructor({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        experience: 0,
        status: "active",
        password: "",
        confirmPassword: "",
      });
      setIsCreateDialogOpen(false);

      toast({
        title: "Success",
        description: `${newInstructor.name} has been added as an instructor with user account sync.`,
      });

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1");
      fetchInstructors(
        searchQuery,
        filterStatus,
        filterSpecialization,
        currentPage
      );
    } catch (error) {
      console.error("❌ Error creating instructor:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create instructor";
      setError(errorMessage);
      toast({
        title: "Error Creating Instructor",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditInstructor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      editInstructor.password &&
      editInstructor.password !== editInstructor.confirmPassword
    ) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      console.log("🔄 Updating instructor user with real-time sync...");

      const response = await fetch("/api/admin/instructors", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editInstructor.id,
          name: editInstructor.name,
          email: editInstructor.email,
          phone: editInstructor.phone,
          specialization: editInstructor.specialization,
          experience: editInstructor.experience,
          status: editInstructor.status,
          password: editInstructor.password,
        }),
      });

      console.log("📡 Update response status:", response.status);

      if (!response.ok) {
        const errorText = await getErrorMessageFromResponse(response);
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log("📊 Parsed response data:", data);

      if (data.success === false) {
        throw new Error(data.error || "The server indicated a failure.");
      }

      console.log("✅ Instructor user updated with real-time sync");

      setIsEditDialogOpen(false);
      setEditInstructor({
        id: "",
        name: "",
        email: "",
        phone: "",
        specialization: "",
        experience: 0,
        status: "active",
        password: "",
        confirmPassword: "",
      });

      toast({
        title: "Success",
        description: "Instructor has been updated successfully with user sync.",
      });

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1");
      fetchInstructors(
        searchQuery,
        filterStatus,
        filterSpecialization,
        currentPage
      );
    } catch (error) {
      console.error("❌ Error updating instructor:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update instructor";
      setError(errorMessage);
      toast({
        title: "Error Updating Instructor",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInstructor = async (instructorId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this instructor? This will also delete their user account and all associated data."
      )
    )
      return;

    try {
      console.log("🗑️ Deleting instructor user with real-time sync...");
      const response = await fetch(
        `/api/admin/instructors?id=${instructorId}`,
        {
          method: "DELETE",
        }
      );

      console.log("📡 Delete response status:", response.status);

      if (!response.ok) {
        const errorText = await getErrorMessageFromResponse(response);
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log("📊 Parsed response data:", data);

      if (data.success === false) {
        throw new Error(data.error || "The server indicated a failure.");
      }

      console.log("✅ Instructor user deleted with real-time sync");

      toast({
        title: "Success",
        description:
          "Instructor and associated user account have been deleted successfully.",
      });

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1");
      fetchInstructors(
        searchQuery,
        filterStatus,
        filterSpecialization,
        currentPage
      );
    } catch (error) {
      console.error("❌ Error deleting instructor:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete instructor";
      setError(errorMessage);
      toast({
        title: "Error Deleting Instructor",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructor) return;

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/admin/instructors/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instructorId: selectedInstructor.id,
          newPassword: resetPasswordData.newPassword,
          email: resetPasswordData.email,
        }),
      });

      console.log("📡 Reset password response status:", response.status);

      if (!response.ok) {
        const errorText = await getErrorMessageFromResponse(response);
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log("📊 Parsed response data:", data);

      if (data.success === false) {
        throw new Error(data.error || "The server indicated a failure.");
      }

      setIsResetPasswordDialogOpen(false);
      setResetPasswordData({
        newPassword: "",
        confirmPassword: "",
        email: "",
      });

      toast({
        title: "Password Reset Successful",
        description: `Password has been reset for ${data.name}. Email notification sent to ${data.email}.`,
      });
    } catch (error) {
      console.error("❌ Error resetting password:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reset password";
      setError(errorMessage);
      toast({
        title: "Error Resetting Password",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openResetPasswordDialog = (instructor: EnhancedInstructor) => {
    setSelectedInstructor(instructor);
    setResetPasswordData({
      newPassword: "",
      confirmPassword: "",
      email: instructor.email,
    });
    setIsResetPasswordDialogOpen(true);
  };

  const openEditDialog = (instructor: EnhancedInstructor) => {
    setSelectedInstructor(instructor);
    setEditInstructor({
      id: instructor.id,
      name: instructor.name,
      email: instructor.email,
      phone: instructor.phone || "",
      specialization: instructor.specialization,
      experience: instructor.experience,
      status: instructor.status,
      password: "",
      confirmPassword: "",
    });
    setIsEditDialogOpen(true);
  };

  const exportInstructors = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Email,Phone,User ID,Specialization,Trainings,Students,Experience,Status,Join Date,Upcoming Sessions\n" +
      instructors
        .map(
          (i) =>
            `"${i.name}","${i.email}","${i.phone || "-"}","${i.user_id || "-"}","${i.specialization}","${i.trainings_count || 0}","${i.students_count || 0}","${i.experience}","${i.status}","${i.join_date || "-"}","${i.upcoming_sessions || 0}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "instructors_with_realtime_counts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "on-leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Pagination component
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const getPageNumbers = () => {
      const current = pagination.page;
      const total = pagination.totalPages;
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, current - delta);
        i <= Math.min(total - 1, current + delta);
        i++
      ) {
        range.push(i);
      }

      if (current - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (current + delta < total - 1) {
        rangeWithDots.push("...", total);
      } else {
        rangeWithDots.push(total);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <Button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev || loading}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <Button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext || loading}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {Math.min(
                  (pagination.page - 1) * pagination.limit + 1,
                  pagination.total
                )}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span> results
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev || loading}
                variant="outline"
                size="sm"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPageNumbers().map((pageNum, index) => (
                <Button
                  key={index}
                  onClick={() =>
                    typeof pageNum === "number"
                      ? handlePageChange(pageNum)
                      : undefined
                  }
                  disabled={pageNum === "..." || loading}
                  variant={pageNum === pagination.page ? "default" : "outline"}
                  size="sm"
                  className="relative inline-flex items-center px-4 py-2"
                >
                  {pageNum}
                </Button>
              ))}

              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext || loading}
                variant="outline"
                size="sm"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
            Instructors Management
          </h1>
          <p className="text-sm sm:text-base text-deep-purple mt-1">
            Manage instructors from users table with real-time training and
            student counts
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={exportInstructors}
            disabled={loading || instructors.length === 0}
            className="w-full sm:w-auto border-mustard text-mustard hover:bg-mustard hover:text-ivory bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full sm:w-auto bg-mustard hover:bg-mustard/90 text-ivory transition-all duration-200 hover:scale-105 active:scale-95"
            disabled={submitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Instructor
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2 bg-transparent"
              onClick={() => {
                setError(null);
                const currentPage = Number.parseInt(
                  searchParams.get("page") || "1"
                );
                fetchInstructors(
                  searchQuery,
                  filterStatus,
                  filterSpecialization,
                  currentPage
                );
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filter - Responsive */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-deep-purple" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8 border-mustard/20 focus:border-mustard"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-ivory border-mustard/20">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterSpecialization}
          onValueChange={handleSpecializationChange}
        >
          <SelectTrigger className="w-full sm:w-[200px] border-mustard/20 focus:border-mustard">
            <SelectValue placeholder="Filter by specialization" />
          </SelectTrigger>
          <SelectContent className="bg-ivory border-mustard/20">
            <SelectItem value="all">All Specializations</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && instructors.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-mustard mx-auto mb-2" />
            <p className="text-deep-purple">Loading instructors...</p>
          </div>
        </div>
      )}

      {/* Instructors Table - Responsive */}
      <div className="bg-ivory border border-mustard/20 rounded-lg">
        <div className="p-4 border-b border-mustard/20">
          <h3 className="text-lg font-semibold text-charcoal">
            Instructors ({pagination.total})
          </h3>
        </div>

        {!loading && (
          <>
            {/* Mobile View */}
            <div className="block sm:hidden">
              <div className="space-y-4 p-4">
                {instructors.length === 0 ? (
                  <div className="text-center py-8 text-deep-purple">
                    {error
                      ? "Error loading instructors. Please try again."
                      : "No instructors found. Click 'Add Instructor' to create your first instructor."}
                  </div>
                ) : (
                  instructors.map((instructor, index) => (
                    <div
                      key={`mobile-${instructor.id}-${index}`} // FIX: Added index to ensure a unique key
                      className="border border-mustard/10 rounded-lg p-4 space-y-3 bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-charcoal">
                            {instructor.name}
                          </h4>
                          <p className="text-sm text-deep-purple">
                            {instructor.email}
                          </p>
                          <p className="text-sm text-deep-purple">
                            {instructor.phone || "-"}
                          </p>
                        </div>
                        <Badge className={getStatusColor(instructor.status)}>
                          {instructor.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">User ID:</span>
                          <p className="font-mono">
                            {instructor.user_id || "-"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Experience:</span>
                          <p>{instructor.experience} years</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Trainings:</span>
                          <p>{instructor.trainings_count || 0}</p>
                        </div>
                        {/* <div>
                          <span className="text-gray-500">Students:</span>
                          <p>{instructor.students_count || 0}</p>
                        </div> */}
                        <div>
                          <span className="text-gray-500">Specialization:</span>
                          <p>{instructor.specialization}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Upcoming Sessions:
                          </span>
                          <p>{instructor.upcoming_sessions || 0}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(instructor)}
                          className="flex-1 border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openResetPasswordDialog(instructor)}
                          className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reset PW
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteInstructor(instructor.id)}
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block">
              <div className="h-96 overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-ivory z-10">
                    <TableRow className="border-mustard/20">
                      <TableHead className="text-charcoal font-semibold">
                        No.
                      </TableHead>
                      <TableHead className="text-charcoal font-semibold">
                        Instructor
                      </TableHead>
                      <TableHead className="text-charcoal font-semibold">
                        Contact
                      </TableHead>
                      {/* <TableHead className="text-charcoal font-semibold">
                        User ID
                      </TableHead> */}
                      <TableHead className="text-charcoal font-semibold">
                        Specialization
                      </TableHead>
                      <TableHead className="text-charcoal font-semibold">
                        Trainings
                      </TableHead>
                      {/* <TableHead className="text-charcoal font-semibold">
                        Students
                      </TableHead> */}
                      <TableHead className="text-charcoal font-semibold">
                        Experience
                      </TableHead>
                      <TableHead className="text-charcoal font-semibold">
                        Status
                      </TableHead>
                      <TableHead className="text-charcoal font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instructors.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center py-8 text-deep-purple"
                        >
                          {error
                            ? "Error loading instructors. Please try again."
                            : "No instructors found. Click 'Add Instructor' to create your first instructor."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      instructors.map((instructor, index) => (
                        <TableRow
                          key={`desktop-${instructor.id}-${index}`} // Using index here is good practice for guaranteed uniqueness
                          className="border-mustard/10 hover:bg-mustard/5 transition-colors duration-200"
                        >
                          <TableCell className="font-medium text-charcoal">
                            {(pagination.page - 1) * pagination.limit +
                              index +
                              1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {instructor.name}
                              </div>
                              <div className="text-sm text-deep-purple">
                                Joined {instructor.join_date || "N/A"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{instructor.email}</div>
                              <div className="text-sm text-deep-purple">
                                {instructor.phone || "-"}
                              </div>
                            </div>
                          </TableCell>
                          {/* <TableCell className="font-mono text-sm text-deep-purple"> */}
                            {/* {instructor.user_id || "-"} */}
                          {/* </TableCell> */}
                          <TableCell className="text-deep-purple">
                            {instructor.specialization}
                          </TableCell>
                          <TableCell className="text-deep-purple">
                            {instructor.trainings_count || 0}
                          </TableCell>
                          {/* <TableCell className="text-deep-purple">
                            {instructor.students_count || 0}
                          </TableCell> */}
                          <TableCell className="text-deep-purple">
                            {instructor.experience} years
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(instructor.status)}
                            >
                              {instructor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(instructor)}
                                className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openResetPasswordDialog(instructor)
                                }
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDeleteInstructor(instructor.id)
                                }
                                className="border-red-200 text-red-600 hover:bg-red-50"
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

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>

      {/* Create Instructor Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Instructor</DialogTitle>
            <DialogDescription>
              Create a new instructor account (Auto-syncs with users table as
              instructor role)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInstructor}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={newInstructor.name}
                  onChange={(e) =>
                    setNewInstructor({ ...newInstructor, name: e.target.value })
                  }
                  required
                  className="border-mustard/20 focus:border-mustard"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newInstructor.email}
                  onChange={(e) =>
                    setNewInstructor({
                      ...newInstructor,
                      email: e.target.value,
                    })
                  }
                  required
                  className="border-mustard/20 focus:border-mustard"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={newInstructor.phone}
                  onChange={(e) =>
                    setNewInstructor({
                      ...newInstructor,
                      phone: e.target.value,
                    })
                  }
                  className="border-mustard/20 focus:border-mustard"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="experience">Experience (years)</Label>
                <Input
                  id="experience"
                  name="experience"
                  type="number"
                  value={newInstructor.experience}
                  onChange={(e) =>
                    setNewInstructor({
                      ...newInstructor,
                      experience: Number(e.target.value),
                    })
                  }
                  className="border-mustard/20 focus:border-mustard"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select
                  name="specialization"
                  value={newInstructor.specialization}
                  onValueChange={(value) =>
                    setNewInstructor({
                      ...newInstructor,
                      specialization: value,
                    })
                  }
                >
                  <SelectTrigger className="border-mustard/20 focus:border-mustard">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent className="bg-ivory border-mustard/20">
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={newInstructor.status}
                  onValueChange={(value: "active" | "inactive" | "on-leave") =>
                    setNewInstructor({ ...newInstructor, status: value })
                  }
                >
                  <SelectTrigger className="border-mustard/20 focus:border-mustard">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-ivory border-mustard/20">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newInstructor.password}
                  onChange={(e) =>
                    setNewInstructor({
                      ...newInstructor,
                      password: e.target.value,
                    })
                  }
                  required
                  className="border-mustard/20 focus:border-mustard"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={newInstructor.confirmPassword}
                  onChange={(e) =>
                    setNewInstructor({
                      ...newInstructor,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="border-mustard/20 focus:border-mustard"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="border-mustard/20 text-charcoal hover:bg-mustard/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-mustard hover:bg-mustard/90 text-ivory"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add Instructor"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Instructor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Instructor</DialogTitle>
            <DialogDescription>
              Update instructor information (Auto-syncs with user account and
              updates real-time counts)
            </DialogDescription>
          </DialogHeader>
          {selectedInstructor && (
            <form onSubmit={handleEditInstructor}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editInstructor.name}
                    onChange={(e) =>
                      setEditInstructor({
                        ...editInstructor,
                        name: e.target.value,
                      })
                    }
                    required
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editInstructor.email}
                    onChange={(e) =>
                      setEditInstructor({
                        ...editInstructor,
                        email: e.target.value,
                      })
                    }
                    required
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editInstructor.phone}
                    onChange={(e) =>
                      setEditInstructor({
                        ...editInstructor,
                        phone: e.target.value,
                      })
                    }
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-experience">Experience (years)</Label>
                  <Input
                    id="edit-experience"
                    type="number"
                    value={editInstructor.experience}
                    onChange={(e) =>
                      setEditInstructor({
                        ...editInstructor,
                        experience: Number(e.target.value),
                      })
                    }
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-specialization">Specialization</Label>
                  <Select
                    value={editInstructor.specialization}
                    onValueChange={(value) =>
                      setEditInstructor({
                        ...editInstructor,
                        specialization: value,
                      })
                    }
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editInstructor.status}
                    onValueChange={(
                      value: "active" | "inactive" | "on-leave"
                    ) =>
                      setEditInstructor({ ...editInstructor, status: value })
                    }
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on-leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-password">
                    New Password (leave blank to keep current)
                  </Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editInstructor.password}
                    onChange={(e) =>
                      setEditInstructor({
                        ...editInstructor,
                        password: e.target.value,
                      })
                    }
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-confirmPassword">
                    Confirm New Password
                  </Label>
                  <Input
                    id="edit-confirmPassword"
                    type="password"
                    value={editInstructor.confirmPassword}
                    onChange={(e) =>
                      setEditInstructor({
                        ...editInstructor,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-mustard/20 text-charcoal hover:bg-mustard/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-mustard hover:bg-mustard/90 text-ivory"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Instructor"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update the account password (syncs with user account)
            </DialogDescription>
          </DialogHeader>
          {selectedInstructor && (
            <form onSubmit={handleResetPassword}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetPasswordData.email}
                    onChange={(e) =>
                      setResetPasswordData({
                        ...resetPasswordData,
                        email: e.target.value,
                      })
                    }
                    placeholder="Instructor email"
                    disabled
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reset-newPassword">New Password *</Label>
                  <Input
                    id="reset-newPassword"
                    type="password"
                    value={resetPasswordData.newPassword}
                    onChange={(e) =>
                      setResetPasswordData({
                        ...resetPasswordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reset-confirmPassword">
                    Confirm New Password *
                  </Label>
                  <Input
                    id="reset-confirmPassword"
                    type="password"
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) =>
                      setResetPasswordData({
                        ...resetPasswordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsResetPasswordDialogOpen(false)}
                  className="border-mustard/20 text-charcoal hover:bg-mustard/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-mustard hover:bg-mustard/90 text-ivory"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
