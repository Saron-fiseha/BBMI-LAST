"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, Download, Loader2, X, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

interface Project {
  id: string
  name: string
  description: string
  image_url: string
  type: "free" | "paid"
  mentor_name: string
  mentor_address: string
  trainings_count: number
  students_count: number
  status: "active" | "inactive"
  created_at: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function ProjectsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [filterType, setFilterType] = useState(searchParams.get("type") || "all")
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    image_url: "",
    type: "free" as "free" | "paid",
    mentor_name: "",
    mentor_address: "",
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

  // Fetch projects from database with pagination
  const fetchProjects = async (search: string, type: string, status: string, page = 1) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔍 Fetching projects with pagination...")

      const params = new URLSearchParams({
        search,
        type,
        status,
        page: page.toString(),
        limit: "10",
      })

      const response = await fetch(`/api/admin/projects?${params.toString()}`, {
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
        throw new Error(data.error || "Failed to fetch projects")
      }

      const projectsData = data.projects || []
      console.log("✅ Projects loaded:", projectsData.length)

      setProjects(projectsData)
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
      console.error("❌ Error fetching projects:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch projects"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() })
  }

  // Handle filter changes
  const handleTypeChange = (type: string) => {
    setFilterType(type)
    updateURL({ type, page: "1" })
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
    const type = searchParams.get("type") || "all"
    const status = searchParams.get("status") || "all"

    setSearchQuery(search)
    setFilterType(type)
    setFilterStatus(status)

    fetchProjects(search, type, status, page)
  }, [searchParams])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newProject.name || !newProject.description || !newProject.mentor_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      console.log("📝 Creating project with data:", newProject)

      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      })

      console.log("📡 Create response status:", response.status)

      const data = await response.json()
      console.log("📊 Parsed response data:", data)

      if (!response.ok || data.success === false) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      console.log("🎉 Project created successfully:", data.project)

      // Reset form
      setNewProject({
        name: "",
        description: "",
        image_url: "",
        type: "free",
        mentor_name: "",
        mentor_address: "",
      })

      // Close form
      setShowCreateForm(false)

      toast({
        title: "Success",
        description: "Project created successfully",
      })

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1")
      fetchProjects(searchQuery, filterType, filterStatus, currentPage)
    } catch (error) {
      console.error("❌ Error creating project:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create project"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    try {
      setSubmitting(true)
      const response = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject),
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.error || data.details || "Failed to update project")
      }

      setShowEditForm(false)
      setEditingProject(null)

      toast({
        title: "Success",
        description: "Project updated successfully",
      })

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1")
      fetchProjects(searchQuery, filterType, filterStatus, currentPage)
    } catch (error) {
      console.error("Error updating project:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update project"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const response = await fetch(`/api/admin/projects?id=${projectId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Failed to delete project")
      }

      toast({
        title: "Success",
        description: "Project deleted successfully",
      })

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1")
      fetchProjects(searchQuery, filterType, filterStatus, currentPage)
    } catch (error) {
      console.error("Error deleting project:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete project"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const exportProjects = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "No,Name,Description,Type,Mentor,Students,Trainings,Status,Created\n" +
      projects
        .map(
          (p, index) =>
            `${index + 1},"${p.name}","${p.description}","${p.type}","${p.mentor_name}",${p.students_count},${p.trainings_count},"${p.status}","${p.created_at}"`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "projects.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "paid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "free":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const openEditForm = (project: Project) => {
    setEditingProject({
      ...project,
      name: project.name || "",
      description: project.description || "",
      image_url: project.image_url || "",
      mentor_name: project.mentor_name || "",
      mentor_address: project.mentor_address || "",
      type: project.type || "free",
      status: project.status || "active",
    })
    setShowEditForm(true)
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
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Project Management</h1>
          <p className="text-sm sm:text-base text-deep-purple mt-1">Manage training projects and programs</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={exportProjects}
            disabled={loading || projects.length === 0}
            className="w-full sm:w-auto border-mustard text-mustard hover:bg-mustard hover:text-ivory bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto bg-mustard hover:bg-mustard/90 text-ivory transition-all duration-200 hover:scale-105 active:scale-95"
            disabled={submitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Project
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
                fetchProjects(searchQuery, filterType, filterStatus, currentPage)
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
            placeholder="Search projects by name, mentor, or description..."
            className="pl-8 border-mustard/20 focus:border-mustard"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-ivory border-mustard/20">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
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
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && projects.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-mustard mx-auto mb-2" />
            <p className="text-deep-purple">Loading projects...</p>
          </div>
        </div>
      )}

      {/* Projects Table - Responsive */}
      <div className="bg-ivory border border-mustard/20 rounded-lg">
        <div className="p-4 border-b border-mustard/20">
          <h3 className="text-lg font-semibold text-charcoal">Projects ({pagination.total})</h3>
        </div>

        {!loading && (
          <>
            {/* Mobile View */}
            <div className="block sm:hidden">
              <div className="space-y-4 p-4">
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-deep-purple">
                    {error
                      ? "Error loading projects. Please try again."
                      : "No projects found. Click 'Create Project' to add your first project."}
                  </div>
                ) : (
                  projects.map((project, index) => (
                    <div key={project.id} className="border border-mustard/10 rounded-lg p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="relative h-12 w-12">
                            <Image
                              src={project.image_url || "/placeholder.svg?height=48&width=48"}
                              alt={project.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-charcoal">{project.name}</h4>
                            <p className="text-sm text-deep-purple">{project.description.substring(0, 50)}...</p>
                          </div>
                        </div>
                        <Badge className={getTypeColor(project.type)}>{project.type}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Mentor:</span>
                          <p className="font-medium">{project.mentor_name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Students:</span>
                          <p className="font-medium">{project.students_count}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Trainings:</span>
                          <p className="font-medium">{project.trainings_count}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditForm(project)}
                          className="flex-1 border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProject(project.id)}
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
                      <TableHead className="text-charcoal font-semibold">Name</TableHead>
                      <TableHead className="text-charcoal font-semibold">Description</TableHead>
                      <TableHead className="text-charcoal font-semibold">Type</TableHead>
                      <TableHead className="text-charcoal font-semibold">Mentor</TableHead>
                      <TableHead className="text-charcoal font-semibold">Students</TableHead>
                      <TableHead className="text-charcoal font-semibold">Trainings</TableHead>
                      <TableHead className="text-charcoal font-semibold">Status</TableHead>
                      <TableHead className="text-charcoal font-semibold">Created</TableHead>
                      <TableHead className="text-charcoal font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-deep-purple">
                          {error
                            ? "Error loading projects. Please try again."
                            : "No projects found. Click 'Create Project' to add your first project."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      projects.map((project, index) => (
                        <TableRow
                          key={project.id}
                          className="border-mustard/10 hover:bg-mustard/5 transition-colors duration-200"
                        >
                          <TableCell className="font-medium text-charcoal">
                            {(pagination.page - 1) * pagination.limit + index + 1}
                          </TableCell>
                          <TableCell className="font-medium text-charcoal">{project.name}</TableCell>
                          <TableCell className="text-deep-purple max-w-xs truncate">{project.description}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(project.type)}>{project.type}</Badge>
                          </TableCell>
                          <TableCell className="text-deep-purple">{project.mentor_name}</TableCell>
                          <TableCell className="text-charcoal">{project.students_count}</TableCell>
                          <TableCell className="text-charcoal">{project.trainings_count}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                          </TableCell>
                          <TableCell className="text-deep-purple">
                            {new Date(project.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditForm(project)}
                                className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteProject(project.id)}
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

      {/* Create Project Form Overlay - Responsive */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-ivory border border-mustard/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal">Create New Project</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  className="text-charcoal hover:bg-mustard/10"
                  disabled={submitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Project Name *</label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Enter project name"
                    className="border-mustard/20 focus:border-mustard"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Description *</label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Enter project description"
                    className="border-mustard/20 focus:border-mustard"
                    rows={3}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Image URL</label>
                  <Input
                    value={newProject.image_url}
                    onChange={(e) => setNewProject({ ...newProject, image_url: e.target.value })}
                    placeholder="Enter image URL (optional)"
                    className="border-mustard/20 focus:border-mustard"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Project Type</label>
                  <Select
                    value={newProject.type}
                    onValueChange={(value: "free" | "paid") => setNewProject({ ...newProject, type: value })}
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Mentor Name *</label>
                  <Input
                    value={newProject.mentor_name}
                    onChange={(e) => setNewProject({ ...newProject, mentor_name: e.target.value })}
                    placeholder="Enter mentor name"
                    className="border-mustard/20 focus:border-mustard"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Mentor Address</label>
                  <Textarea
                    value={newProject.mentor_address}
                    onChange={(e) => setNewProject({ ...newProject, mentor_address: e.target.value })}
                    placeholder="Enter mentor address (optional)"
                    className="border-mustard/20 focus:border-mustard"
                    rows={2}
                    disabled={submitting}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="w-full sm:w-auto border-mustard/20 text-charcoal hover:bg-mustard/10"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-mustard hover:bg-mustard/90 text-ivory"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Form Overlay - Responsive */}
      {showEditForm && editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-ivory border border-mustard/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal">Edit Project</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditForm(false)}
                  className="text-charcoal hover:bg-mustard/10"
                  disabled={submitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleEditProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Project Name *</label>
                  <Input
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                    placeholder="Enter project name"
                    className="border-mustard/20 focus:border-mustard"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Description *</label>
                  <Textarea
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    placeholder="Enter project description"
                    className="border-mustard/20 focus:border-mustard"
                    rows={3}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Image URL</label>
                  <Input
                    value={editingProject.image_url}
                    onChange={(e) => setEditingProject({ ...editingProject, image_url: e.target.value })}
                    placeholder="Enter image URL (optional)"
                    className="border-mustard/20 focus:border-mustard"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Project Type</label>
                  <Select
                    value={editingProject.type}
                    onValueChange={(value: "free" | "paid") => setEditingProject({ ...editingProject, type: value })}
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Status</label>
                  <Select
                    value={editingProject.status}
                    onValueChange={(value: "active" | "inactive") =>
                      setEditingProject({ ...editingProject, status: value })
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Mentor Name *</label>
                  <Input
                    value={editingProject.mentor_name}
                    onChange={(e) => setEditingProject({ ...editingProject, mentor_name: e.target.value })}
                    placeholder="Enter mentor name"
                    className="border-mustard/20 focus:border-mustard"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Mentor Address</label>
                  <Textarea
                    value={editingProject.mentor_address}
                    onChange={(e) => setEditingProject({ ...editingProject, mentor_address: e.target.value })}
                    placeholder="Enter mentor address (optional)"
                    className="border-mustard/20 focus:border-mustard"
                    rows={2}
                    disabled={submitting}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditForm(false)}
                    className="w-full sm:w-auto border-mustard/20 text-charcoal hover:bg-mustard/10"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-mustard hover:bg-mustard/90 text-ivory"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Project"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}