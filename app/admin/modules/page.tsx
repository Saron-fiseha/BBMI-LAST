"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, Download, Play, X, Loader2, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Module {
  id: string
  name: string
  description: string
  moduleCode: string
  programId: string
  programName: string
  videoId: string
  duration: number
  order: number
  status: "active" | "inactive" | "draft"
  createdAt: string
}

interface Program {
  id: string
  name: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function ModulesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [modules, setModules] = useState<Module[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [filterProgram, setFilterProgram] = useState(searchParams.get("program") || "all")
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all")
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  const [newModule, setNewModule] = useState({
    name: "",
    description: "",
    moduleCode: "",
    programId: "",
    videoId: "",
    duration: 0,
    order: 1,
    status: "draft" as "active" | "inactive" | "draft",
  })

  // Update URL when filters change
  const updateURL = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams)
      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      updateURL({ search, page: "1" })
    }, 300),
    [updateURL],
  )

  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Fetch modules from database with pagination
  const fetchModules = async (search: string, program: string, status: string, page = 1) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔍 Fetching modules with pagination...")

      const params = new URLSearchParams({
        search,
        program,
        status,
        page: page.toString(),
        limit: "10",
      })

      const response = await fetch(`/api/admin/modules?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Response not ok:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("📊 Received data:", data)

      if (data.success === false) {
        throw new Error(data.error || "Failed to fetch modules")
      }

     const modulesData = Array.isArray(data) ? data : data.modules || []
     console.log("✅ Modules loaded:", modulesData.length)
     setModules(modulesData)

      setModules(modulesData)
      setPagination(
        data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      )
    } catch (error) {
      console.error("❌ Error fetching modules:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch modules"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setModules([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/admin/trainings")
      if (response.ok) {
        const data = await response.json()
        if (data.trainings && Array.isArray(data.trainings)) {
          setPrograms(data.trainings.map((training: any) => ({ id: training.id, name: training.name })))
        } else {
          console.error("Trainings data structure is incorrect:", data)
          setPrograms([
            { id: "1", name: "Advanced Makeup Techniques" },
            { id: "2", name: "Hair Styling Fundamentals" },
            { id: "3", name: "Skincare Specialist Certification" },
          ])
        }
      }
    } catch (error) {
      console.error("Error fetching programs:", error)
      setPrograms([
        { id: "1", name: "Advanced Makeup Techniques" },
        { id: "2", name: "Hair Styling Fundamentals" },
        { id: "3", name: "Skincare Specialist Certification" },
      ])
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() })
  }

  // Handle filter changes
  const handleProgramChange = (program: string) => {
    setFilterProgram(program)
    updateURL({ program, page: "1" })
  }

  const handleStatusChange = (status: string) => {
    setFilterStatus(status)
    updateURL({ status, page: "1" })
  }

  // Handle search change
  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    debouncedSearch(search)
  }

  // Effect to fetch data when URL params change
  useEffect(() => {
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const program = searchParams.get("program") || "all"
    const status = searchParams.get("status") || "all"

    setSearchQuery(search)
    setFilterProgram(program)
    setFilterStatus(status)

    fetchModules(search, program, status, page)
    fetchPrograms()
  }, [searchParams])

  const handleCreateModule = async () => {
    console.log("🚀 Starting module creation...")

    // Validation
    if (
      !newModule.name ||
      !newModule.description ||
      !newModule.moduleCode ||
      !newModule.programId ||
      !newModule.videoId ||
      !newModule.status
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const programName = programs.find((p) => p.id === newModule.programId)?.name || ""
      console.log("📝 Creating module with data:", { ...newModule, programName })

      const response = await fetch("/api/admin/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newModule,
          programName,
        }),
      })

      console.log("📡 Create response status:", response.status)

      if (response.ok) {
        const savedModule = await response.json()
        console.log("🎉 Module created successfully:", savedModule)

        setNewModule({
          name: "",
          description: "",
          moduleCode: "",
          programId: "",
          videoId: "",
          duration: 0,
          order: 1,
          status: "draft",
        })

        setShowForm(false)

        toast({
          title: "Module created successfully!",
          description: `${newModule.name} has been added to the system.`,
        })

        // Refresh current page
        const currentPage = Number.parseInt(searchParams.get("page") || "1")
        fetchModules(searchQuery, filterProgram, filterStatus, currentPage)
      } else {
        const errorText = await response.text()
        console.error("❌ Create failed:", errorText)
        throw new Error("Failed to create module")
      }
    } catch (error) {
      console.error("❌ Error creating module:", error)
      toast({
        title: "Error",
        description: "Failed to create module. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditModule = async () => {
    console.log("🔄 Starting module update...")

    if (!editingModule) return

    // Validation
    if (
      !newModule.name ||
      !newModule.description ||
      !newModule.moduleCode ||
      !newModule.programId ||
      !newModule.videoId ||
      !newModule.status
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const programName = programs.find((p) => p.id === newModule.programId)?.name || ""
      console.log("📝 Updating module with data:", { ...newModule, programName })

      const response = await fetch("/api/admin/modules", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingModule.id,
          ...newModule,
          programName,
        }),
      })

      console.log("📡 Update response status:", response.status)

      if (response.ok) {
        const updatedModule = await response.json()
        console.log("🎉 Module updated successfully:", updatedModule)

        setNewModule({
          name: "",
          description: "",
          moduleCode: "",
          programId: "",
          videoId: "",
          duration: 0,
          order: 1,
          status: "draft",
        })

        setEditingModule(null)
        setShowForm(false)

        toast({
          title: "Module updated successfully!",
          description: `${newModule.name} has been updated.`,
        })

        // Refresh current page
        const currentPage = Number.parseInt(searchParams.get("page") || "1")
        fetchModules(searchQuery, filterProgram, filterStatus, currentPage)
      } else {
        const errorText = await response.text()
        console.error("❌ Update failed:", errorText)
        throw new Error("Failed to update module")
      }
    } catch (error) {
      console.error("❌ Error updating module:", error)
      toast({
        title: "Error",
        description: "Failed to update module. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    console.log("🗑️ Deleting module:", moduleId)

    if (!confirm("Are you sure you want to delete this module? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "DELETE",
      })

      console.log("📡 Delete response status:", response.status)

      if (response.ok) {
        console.log("🎉 Module deleted successfully")
        toast({
          title: "Module deleted",
          description: "Module has been deleted successfully.",
        })

        // Refresh current page
        const currentPage = Number.parseInt(searchParams.get("page") || "1")
        fetchModules(searchQuery, filterProgram, filterStatus, currentPage)
      } else {
        const errorText = await response.text()
        console.error("❌ Delete failed:", errorText)
        throw new Error("Failed to delete module")
      }
    } catch (error) {
      console.error("❌ Error deleting module:", error)
      toast({
        title: "Error",
        description: "Failed to delete module.",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (module: Module) => {
    console.log("✏️ Editing module:", module.name)
    setEditingModule(module)
    setNewModule({
      name: module.name,
      description: module.description,
      moduleCode: module.moduleCode,
      programId: module.programId,
      videoId: module.videoId,
      duration: module.duration,
      order: module.order,
      status: module.status,
    })
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingModule(null)
    setNewModule({
      name: "",
      description: "",
      moduleCode: "",
      programId: "",
      videoId: "",
      duration: 0,
      order: 1,
      status: "draft",
    })
  }

  const exportModules = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "#,Name,Code,Program,Duration,Order,Status,VideoID\n" +
      modules
        .map(
          (m, index) =>
            `${index + 1},"${m.name}","${m.moduleCode}","${m.programName}",${m.duration},${m.order},"${m.status}","${m.videoId}"`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "modules.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "draft":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : url
  }

  // Pagination component
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null

    const getPageNumbers = () => {
      const current = pagination.page
      const total = pagination.totalPages
      const delta = 2
      const range = []
      const rangeWithDots = []

      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i)
      }

      if (current - delta > 2) {
        rangeWithDots.push(1, "...")
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (current + delta < total - 1) {
        rangeWithDots.push("...", total)
      } else {
        rangeWithDots.push(total)
      }

      return rangeWithDots
    }

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
                {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
              </span>{" "}
              to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>{" "}
              of <span className="font-medium">{pagination.total}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
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
                  onClick={() => (typeof pageNum === "number" ? handlePageChange(pageNum) : undefined)}
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
    )
  }

  return (
    <div className="relative space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Modules Management</h1>
          <p className="text-sm sm:text-base text-deep-purple mt-1">Manage learning modules with YouTube video integration</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={exportModules}
            disabled={loading || modules.length === 0}
            className="w-full sm:w-auto border-mustard text-mustard hover:bg-mustard hover:text-ivory bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto bg-mustard hover:bg-mustard/90 text-ivory transition-all duration-200 hover:scale-105 active:scale-95"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
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
                setError(null)
                const currentPage = Number.parseInt(searchParams.get("page") || "1")
                fetchModules(searchQuery, filterProgram, filterStatus, currentPage)
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
            placeholder="Search modules..."
            className="pl-8 border-mustard/20 focus:border-mustard"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={filterProgram} onValueChange={handleProgramChange}>
          <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
            <SelectValue placeholder="Filter by program" />
          </SelectTrigger>
          <SelectContent className="bg-ivory border-mustard/20">
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.name}
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

      {/* Loading State */}
      {loading && modules.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-mustard mx-auto mb-2" />
            <p className="text-deep-purple">Loading modules...</p>
          </div>
        </div>
      )}

      {/* Modules Table - Responsive */}
      <div className="bg-ivory border border-mustard/20 rounded-lg">
        <div className="p-4 border-b border-mustard/20">
          <h3 className="text-lg font-semibold text-charcoal">
             Modules ({pagination.total > 0 ? pagination.total : modules.length})
          </h3>

        </div>

        {!loading && (
          <>
            {/* Mobile View */}
            <div className="block sm:hidden">
              <div className="space-y-4 p-4">
                {modules.length === 0 ? (
                  <div className="text-center py-8 text-deep-purple">
                    {error
                      ? "Error loading modules. Please try again."
                      : "No modules found. Click 'Add Module' to create your first module."}
                  </div>
                ) : (
                  modules.map((module, index) => (
                    <div key={module.id} className="border border-mustard/10 rounded-lg p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-charcoal">{module.name}</h4>
                          <p className="text-sm text-deep-purple">{module.description.substring(0, 50)}...</p>
                        </div>
                        <Badge className={getStatusColor(module.status)}>{module.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Code:</span>
                          <p className="font-mono">{module.moduleCode}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Program:</span>
                          <p className="font-medium">{module.programName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-medium">{formatDuration(module.duration)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Order:</span>
                          <p className="font-medium">#{module.order}</p>
                        </div>
                        <div>
  <span className="text-gray-500">Video ID:</span>
  <div className="flex items-center space-x-1 w-full max-w-xs truncate">
    <Play className="h-4 w-4 text-red-600" />
    <p className="font-mono text-sm truncate">{module.videoId}</p>
  </div>
</div>

                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(module)}
                          className="flex-1 border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteModule(module.id)}
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
                      <TableHead className="text-charcoal font-semibold">No.</TableHead>
                      <TableHead className="text-charcoal font-semibold">Module</TableHead>
                      <TableHead className="text-charcoal font-semibold">Code</TableHead>
                      <TableHead className="text-charcoal font-semibold">Program</TableHead>
                      <TableHead className="text-charcoal font-semibold">Duration</TableHead>
                      <TableHead className="text-charcoal font-semibold">Order</TableHead>
                      <TableHead className="text-charcoal font-semibold">Video</TableHead>
                      <TableHead className="text-charcoal font-semibold">Status</TableHead>
                      <TableHead className="text-charcoal font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-deep-purple">
                          {error
                            ? "Error loading modules. Please try again."
                            : "No modules found. Click 'Add Module' to create your first module."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      modules.map((module, index) => (
                        <TableRow
                          key={module.id}
                          className="border-mustard/10 hover:bg-mustard/5 transition-colors duration-200"
                        >
                          <TableCell className="font-medium text-charcoal">
                            {(pagination.page - 1) * pagination.limit + index + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{module.name}</div>
                              <div className="text-sm text-deep-purple">{module.description.substring(0, 50)}...</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-deep-purple">{module.moduleCode}</TableCell>
                          <TableCell className="text-deep-purple">{module.programName}</TableCell>
                          <TableCell className="text-deep-purple">{formatDuration(module.duration)}</TableCell>
                          <TableCell className="text-charcoal">#{module.order}</TableCell>
                          <TableCell className="w-40 max-w-xs">
  <div className="flex items-center space-x-2 truncate">
    <Play className="h-4 w-4 text-red-600" />
    <span className="text-sm font-mono truncate">{module.videoId}</span>
  </div>
</TableCell>

                          <TableCell>
                            <Badge className={getStatusColor(module.status)}>{module.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClick(module)}
                                className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteModule(module.id)}
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

      {/* Form Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-ivory border border-mustard/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal">
                  {editingModule ? "Edit Module" : "Create New Module"}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFormClose}
                  className="text-charcoal hover:bg-mustard/10"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Module Name *</label>
                    <Input
                      value={newModule.name}
                      onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                      placeholder="Enter module name"
                      className="border-mustard/20 focus:border-mustard"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Module Code *</label>
                    <Input
                      value={newModule.moduleCode}
                      onChange={(e) => setNewModule({ ...newModule, moduleCode: e.target.value })}
                      placeholder="e.g., MKP-001-01"
                      className="border-mustard/20 focus:border-mustard"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Description *</label>
                  <Textarea
                    value={newModule.description}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                    placeholder="Enter module description"
                    className="border-mustard/20 focus:border-mustard"
                    rows={3}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Training Program *</label>
                    <Select
                      value={newModule.programId}
                      onValueChange={(value) => setNewModule({ ...newModule, programId: value })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="border-mustard/20 focus:border-mustard">
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent className="bg-ivory border-mustard/20">
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Status *</label>
                    <Select
                      value={newModule.status}
                      onValueChange={(value: "active" | "inactive" | "draft") =>
                        setNewModule({ ...newModule, status: value })
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="border-mustard/20 focus:border-mustard">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-ivory border-mustard/20">
                        <SelectItem value="draft">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusDot("draft")}`}></div>
                            <span>Draft</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusDot("active")}`}></div>
                            <span>Active</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusDot("inactive")}`}></div>
                            <span>Inactive</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">YouTube Video URL/ID *</label>
                  <Input
                    value={newModule.videoId}
                    onChange={(e) => setNewModule({ ...newModule, videoId: extractVideoId(e.target.value) })}
                    placeholder="Enter YouTube URL or Video ID"
                    className="border-mustard/20 focus:border-mustard"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Duration (minutes) *</label>
                    <Input
                      type="number"
                      value={newModule.duration}
                      onChange={(e) => setNewModule({ ...newModule, duration: Number(e.target.value) })}
                      placeholder="0"
                      min="1"
                      className="border-mustard/20 focus:border-mustard"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Order</label>
                    <Input
                      type="number"
                      value={newModule.order}
                      onChange={(e) => setNewModule({ ...newModule, order: Number(e.target.value) })}
                      placeholder="1"
                      min="1"
                      className="border-mustard/20 focus:border-mustard"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={handleFormClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto border-mustard/20 text-charcoal hover:bg-mustard/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingModule ? handleEditModule : handleCreateModule}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-mustard hover:bg-mustard/90 text-ivory"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {editingModule ? "Updating..." : "Creating..."}
                    </>
                  ) : editingModule ? (
                    "Update Module"
                  ) : (
                    "Create Module"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}