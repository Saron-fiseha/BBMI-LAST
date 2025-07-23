"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Search, Download, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Student {
  full_name: string
  id: string
  roll_number: number
  id_number: string
  name: string
  email: string
  phone?: string
  age?: number
  gender?: string
  role: string
  courses_enrolled: number
  courses_completed: number
  total_hours: number
  join_date: string
  last_active: string
  status: "active" | "inactive"
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function StudentsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all")
  const [filterGender, setFilterGender] = useState(searchParams.get("gender") || "all")
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Form states
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
    status: "active",
  })

  const [editingStudent, setEditingStudent] = useState<
    (Student & { password?: string; confirmPassword?: string }) | null
  >(null)

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

  // Fetch students from database with pagination
  const fetchStudents = async (search: string, status: string, gender: string, page = 1) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔍 Fetching students with pagination...")

      const params = new URLSearchParams({
        search,
        status,
        gender,
        page: page.toString(),
        limit: "10",
      })

      const response = await fetch(`/api/admin/students?${params.toString()}`, {
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
        throw new Error(data.error || "Failed to fetch students")
      }

      const studentsData = data.students || []
      console.log("✅ Students loaded:", studentsData.length)

      setStudents(studentsData)
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
      console.error("❌ Error fetching students:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch students"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() })
  }

  // Handle filter changes
  const handleStatusChange = (status: string) => {
    setFilterStatus(status)
    updateURL({ status, page: "1" })
  }

  const handleGenderChange = (gender: string) => {
    setFilterGender(gender)
    updateURL({ gender, page: "1" })
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
    const status = searchParams.get("status") || "all"
    const gender = searchParams.get("gender") || "all"

    setSearchQuery(search)
    setFilterStatus(status)
    setFilterGender(gender)

    fetchStudents(search, status, gender, page)
  }, [searchParams])

  // Export function
  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/students/export")
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "students-export.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Students exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export students",
        variant: "destructive",
      })
    }
  }

  // Create student function
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newStudent.password !== newStudent.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudent.name,
          email: newStudent.email,
          phone: newStudent.phone,
          age: newStudent.age ? Number.parseInt(newStudent.age) : null,
          gender: newStudent.gender,
          password: newStudent.password,
          status: newStudent.status,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        setIsCreateDialogOpen(false)
        setNewStudent({
          name: "",
          email: "",
          phone: "",
          age: "",
          gender: "",
          password: "",
          confirmPassword: "",
          status: "active",
        })
        const currentPage = Number.parseInt(searchParams.get("page") || "1")
        fetchStudents(searchQuery, filterStatus, filterGender, currentPage)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create student",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Edit student function
  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return

    if (editingStudent.password && editingStudent.password !== editingStudent.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/students/${editingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingStudent.name,
          email: editingStudent.email,
          phone: editingStudent.phone,
          age: editingStudent.age,
          gender: editingStudent.gender,
          password: editingStudent.password,
          status: editingStudent.status,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        setIsEditDialogOpen(false)
        setEditingStudent(null)
        const currentPage = Number.parseInt(searchParams.get("page") || "1")
        fetchStudents(searchQuery, filterStatus, filterGender, currentPage)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Delete student function
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}?`)) return

    setIsDeleting(studentId)
    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        const currentPage = Number.parseInt(searchParams.get("page") || "1")
        fetchStudents(searchQuery, filterStatus, filterGender, currentPage)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  // Open edit dialog
  const openEditDialog = (student: Student) => {
    setEditingStudent({
      ...student,
      password: "",
      confirmPassword: "",
    })
    setIsEditDialogOpen(true)
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
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Students Management</h1>
          <p className="text-sm sm:text-base text-deep-purple mt-1">Manage all registered students</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading || students.length === 0}
            className="w-full sm:w-auto border-mustard text-mustard hover:bg-mustard hover:text-ivory bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full sm:w-auto bg-mustard hover:bg-mustard/90 text-ivory transition-all duration-200 hover:scale-105 active:scale-95"
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="block sm:inline">{error}</span>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 bg-transparent"
              onClick={() => {
                setError(null)
                const currentPage = Number.parseInt(searchParams.get("page") || "1")
                fetchStudents(searchQuery, filterStatus, filterGender, currentPage)
              }}
            >
              Retry
            </Button>
          </div>
        </div>
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
          </SelectContent>
        </Select>
        <Select value={filterGender} onValueChange={handleGenderChange}>
          <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
            <SelectValue placeholder="Filter by gender" />
          </SelectTrigger>
          <SelectContent className="bg-ivory border-mustard/20">
            <SelectItem value="all">All Gender</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && students.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-mustard mx-auto mb-2" />
            <p className="text-deep-purple">Loading students...</p>
          </div>
        </div>
      )}

      {/* Students Table - Responsive */}
      <div className="bg-ivory border border-mustard/20 rounded-lg">
        <div className="p-4 border-b border-mustard/20">
          <h3 className="text-lg font-semibold text-charcoal">Students ({pagination.total})</h3>
        </div>

        {!loading && (
          <>
            {/* Mobile View */}
            <div className="block sm:hidden">
              <div className="space-y-4 p-4">
                {students.length === 0 ? (
                  <div className="text-center py-8 text-deep-purple">
                    {error
                      ? "Error loading students. Please try again."
                      : "No students found. Click 'Add Student' to create your first student."}
                  </div>
                ) : (
                  students.map((student) => (
                    <div key={student.id} className="border border-mustard/10 rounded-lg p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-charcoal">{student.full_name}</h4>
                          <p className="text-sm text-deep-purple">
                            Joined {new Date(student.join_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Roll #:</span>
                          <p className="font-medium">{student.roll_number}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">ID:</span>
                          <p className="font-mono">{student.id_number}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <p className="font-medium">{student.email}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <p className="font-medium">{student.phone}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Age:</span>
                          <p className="font-medium">{student.age}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Gender:</span>
                          <p className="font-medium">{student.gender}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Courses:</span>
                          <p className="font-medium">
                            {student.courses_enrolled} enrolled, {student.courses_completed} completed
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Progress:</span>
                          <p className="font-medium">
                            {student.total_hours} hours,{" "}
                            {student.courses_enrolled > 0
                              ? Math.round((student.courses_completed / student.courses_enrolled) * 100)
                              : 0}
                            % complete
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Active:</span>
                          <p className="font-medium">{new Date(student.last_active).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(student)}
                          className="flex-1 border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                          disabled={isDeleting === student.id}
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {isDeleting === student.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
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
                      <TableHead className="text-charcoal font-semibold">Student</TableHead>
                      <TableHead className="text-charcoal font-semibold">ID Number</TableHead>
                      <TableHead className="text-charcoal font-semibold">Contact</TableHead>
                      <TableHead className="text-charcoal font-semibold">Age</TableHead>
                      <TableHead className="text-charcoal font-semibold">Gender</TableHead>
                      <TableHead className="text-charcoal font-semibold">Courses</TableHead>
                      <TableHead className="text-charcoal font-semibold">Progress</TableHead>
                      <TableHead className="text-charcoal font-semibold">Status</TableHead>
                      <TableHead className="text-charcoal font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-deep-purple">
                          {error
                            ? "Error loading students. Please try again."
                            : "No students found. Click 'Add Student' to create your first student."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student, index) => (
                        <TableRow
                          key={student.id}
                          className="border-mustard/10 hover:bg-mustard/5 transition-colors duration-200"
                        >
                          <TableCell className="font-medium text-charcoal">
                            {(pagination.page - 1) * pagination.limit + index + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{student.full_name}</div>
                              <div className="text-sm text-deep-purple">
                                Joined {new Date(student.join_date).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-deep-purple">{student.id_number}</TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{student.email}</div>
                              <div className="text-sm text-deep-purple">{student.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-deep-purple">{student.age}</TableCell>
                          <TableCell className="text-deep-purple">{student.gender}</TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">Enrolled: {student.courses_enrolled}</div>
                              <div className="text-sm text-deep-purple">Completed: {student.courses_completed}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{student.total_hours} hours</div>
                              <div className="text-sm text-deep-purple">
                                {student.courses_enrolled > 0
                                  ? Math.round((student.courses_completed / student.courses_enrolled) * 100)
                                  : 0}
                                % complete
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(student)}
                                className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteStudent(student.id, student.name)}
                                disabled={isDeleting === student.id}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                {isDeleting === student.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
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

      {/* Create Student Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Create a new student account with all details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStudent}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, name: e.target.value }))}
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
                  value={newStudent.email}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="border-mustard/20 focus:border-mustard"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="number"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, phone: e.target.value }))}
                  className="border-mustard/20 focus:border-mustard"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={newStudent.age}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, age: e.target.value }))}
                  className="border-mustard/20 focus:border-mustard"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  name="gender"
                  value={newStudent.gender}
                  onValueChange={(value) => setNewStudent((prev) => ({ ...prev, gender: value }))}
                  required={true}
                >
                  <SelectTrigger id="gender" aria-required="true" className="border-mustard/20 focus:border-mustard">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-ivory border-mustard/20">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  className="border-mustard/20 focus:border-mustard"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmpassword"
                  type="password"
                  value={newStudent.confirmPassword}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="border-mustard/20 focus:border-mustard"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newStudent.status}
                  onValueChange={(value) => setNewStudent((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="border-mustard/20 focus:border-mustard">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-ivory border-mustard/20">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
                disabled={isCreating}
                className="bg-mustard hover:bg-mustard/90 text-ivory"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add Student"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information and settings.</DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <form onSubmit={handleEditStudent}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingStudent.full_name}
                    onChange={(e) => setEditingStudent((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    required
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                    required
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-age">Age</Label>
                  <Input
                    id="edit-age"
                    type="number"
                    value={editingStudent.age}
                    onChange={(e) =>
                      setEditingStudent((prev) =>
                        prev ? { ...prev, age: e.target.value ? Number.parseInt(e.target.value) : undefined } : null,
                      )
                    }
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select
                    value={editingStudent.gender}
                    onValueChange={(value) => setEditingStudent((prev) => (prev ? { ...prev, gender: value } : null))}
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editingStudent.password}
                    onChange={(e) => setEditingStudent((prev) => (prev ? { ...prev, password: e.target.value } : null))}
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
                  <Input
                    id="edit-confirmPassword"
                    type="password"
                    value={editingStudent.confirmPassword}
                    onChange={(e) =>
                      setEditingStudent((prev) => (prev ? { ...prev, confirmPassword: e.target.value } : null))
                    }
                    className="border-mustard/20 focus:border-mustard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingStudent.status}
                    onValueChange={(value) =>
                      setEditingStudent((prev) => (prev ? { ...prev, status: value as "active" | "inactive" } : null))
                    }
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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
                  disabled={isUpdating}
                  className="bg-mustard hover:bg-mustard/90 text-ivory"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Student"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}