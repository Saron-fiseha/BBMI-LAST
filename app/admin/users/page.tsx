"use client"

import type React from "react"
import { useState, useEffect, useCallback, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, Download, Loader2, X, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Label } from "@/components/ui/label"

interface User {
  sex: string
  full_name: string
  id: string
  name: string
  email: string
  phone?: string
  age?: number
  gender?: string
  role: "admin" | "instructor" | "student"
  status: "active" | "inactive"
  image_url?: string
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

export default function AdminUsersPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [filterRole, setFilterRole] = useState(searchParams.get("role") || "all")
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingUser, setEditingUser] = useState<(User & { password?: string; confirmPassword?: string }) | null>(null)
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

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
    role: "student" as "admin" | "instructor" | "student",
    status: "active" as "active" | "inactive",
    image_url: "",
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

  // Fetch users from database with pagination
  const fetchUsers = async (search: string, role: string, status: string, page = 1) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔍 Fetching users with pagination...")

      const params = new URLSearchParams({
        search,
        role,
        status,
        page: page.toString(),
        limit: "10",
      })

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
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
        throw new Error(data.error || "Failed to fetch users")
      }

      const usersData = data.users || []
      console.log("✅ Users loaded:", usersData.length)

      setUsers(usersData)
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
      console.error("❌ Error fetching users:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch users"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() })
  }

  // Handle filter changes
  const handleRoleChange = (role: string) => {
    setFilterRole(role)
    updateURL({ role, page: "1" })
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
    const role = searchParams.get("role") || "all"
    const status = searchParams.get("status") || "all"

    setSearchQuery(search)
    setFilterRole(role)
    setFilterStatus(status)

    fetchUsers(search, role, status, page)
  }, [searchParams])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newUser.password !== newUser.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      console.log("📝 Creating user with data:", newUser)

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          age: newUser.age ? Number.parseInt(newUser.age) : null,
          gender: newUser.gender,
          password: newUser.password,
          role: newUser.role,
          status: newUser.status,
          image_url: newUser.image_url,
        }),
      })

      console.log("📡 Create response status:", response.status)

      const data = await response.json()
      console.log("📊 Parsed response data:", data)

      if (!response.ok || data.success === false) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      console.log("🎉 User created successfully:", data.user)

      // Reset form
      setNewUser({
        name: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        password: "",
        confirmPassword: "",
        role: "student",
        status: "active",
        image_url: "",
      })

      // Close form
      setShowCreateForm(false)

      toast({
        title: "Success",
        description: "User created successfully",
      })

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1")
      fetchUsers(searchQuery, filterRole, filterStatus, currentPage)
    } catch (error) {
      console.error("❌ Error creating user:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create user"
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

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    if (editingUser.password && editingUser.password !== editingUser.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingUser.full_name,
          email: editingUser.email,
          phone: editingUser.phone,
          age: editingUser.age,
          gender: editingUser.gender,
          password: editingUser.password,
          role: editingUser.role,
          status: editingUser.status,
          image_url: editingUser.image_url,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.error || data.details || "Failed to update user")
      }

      setShowEditForm(false)
      setEditingUser(null)

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1")
      fetchUsers(searchQuery, filterRole, filterStatus, currentPage)
    } catch (error) {
      console.error("Error updating user:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update user"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Failed to delete user")
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1")
      fetchUsers(searchQuery, filterRole, filterStatus, currentPage)
    } catch (error) {
      console.error("Error deleting user:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const exportUsers = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "No,Name,Email,Phone,Age,Gender,Role,Status,Created\n" +
      users
        .map(
          (u, index) =>
            `${index + 1},"${u.name}","${u.email}","${u.phone || "-"}","${u.age || "-"}","${u.gender || "-"}","${u.role}","${u.status}","${new Date(u.created_at).toLocaleDateString()}"`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "users.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "instructor":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "student":
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

  const openEditForm = (user: User) => {
    setEditingUser({
      ...user,
      password: "",
      confirmPassword: "",
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
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">User Management</h1>
          <p className="text-sm sm:text-base text-deep-purple mt-1">Manage all user accounts and permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={exportUsers}
            disabled={loading || users.length === 0}
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
            Add User
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
                fetchUsers(searchQuery, filterRole, filterStatus, currentPage)
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
          </SelectContent>
        </Select>
        <Select value={filterRole} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="bg-ivory border-mustard/20">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="instructor">Instructor</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && users.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-mustard mx-auto mb-2" />
            <p className="text-deep-purple">Loading users...</p>
          </div>
        </div>
      )}

      {/* Users Table - Responsive */}
      <div className="bg-ivory border border-mustard/20 rounded-lg">
        <div className="p-4 border-b border-mustard/20">
          <h3 className="text-lg font-semibold text-charcoal">Users ({pagination.total})</h3>
        </div>

        {!loading && (
          <>
            {/* Mobile View */}
            <div className="block sm:hidden">
              <div className="space-y-4 p-4">
                {users.length === 0 ? (
                  <div className="text-center py-8 text-deep-purple">
                    {error
                      ? "Error loading users. Please try again."
                      : "No users found. Click 'Add User' to create your first user."}
                  </div>
                ) : (
                  users.map((user, index) => (
                    <div key={user.id} className="border border-mustard/10 rounded-lg p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="relative h-12 w-12">
                            <Image
                              src={user.image_url || "/placeholder.svg?height=48&width=48"}
                              alt={user.name || "User profile picture"}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-charcoal">{user.name}</h4>
                            <p className="text-sm text-deep-purple">{user.email}</p>
                          </div>
                        </div>
                        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <p className="font-medium">{user.phone || "-"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Age:</span>
                          <p className="font-medium">{user.age || "-"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Gender:</span>
                          <p className="font-medium">{user.gender || "-"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditForm(user)}
                          className="flex-1 border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
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
                      <TableHead className="text-charcoal font-semibold">Email</TableHead>
                      <TableHead className="text-charcoal font-semibold">Phone</TableHead>
                      <TableHead className="text-charcoal font-semibold">Age</TableHead>
                      <TableHead className="text-charcoal font-semibold">Gender</TableHead>
                      <TableHead className="text-charcoal font-semibold">Role</TableHead>
                      <TableHead className="text-charcoal font-semibold">Status</TableHead>
                      <TableHead className="text-charcoal font-semibold">Join Date</TableHead>
                      <TableHead className="text-charcoal font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-deep-purple">
                          {error
                            ? "Error loading users. Please try again."
                            : "No users found. Click 'Add User' to create your first user."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user, index) => (
                        <TableRow
                          key={user.id}
                          className="border-mustard/10 hover:bg-mustard/5 transition-colors duration-200"
                        >
                          <TableCell className="font-medium text-charcoal">
                            {(pagination.page - 1) * pagination.limit + index + 1}
                          </TableCell>
                          <TableCell className="font-medium text-charcoal">{user.name}</TableCell>
                          <TableCell className="text-deep-purple">{user.email}</TableCell>
                          <TableCell className="text-deep-purple">{user.phone || "-"}</TableCell>
                          <TableCell className="text-deep-purple">{user.age || "-"}</TableCell>
                          <TableCell className="text-deep-purple">{user.gender || "-"}</TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                          </TableCell>
                          <TableCell className="text-deep-purple">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditForm(user)}
                                className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(user.id)}
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

      {/* Create User Form Overlay - Responsive */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-ivory border border-mustard/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal">Create New User</h2>
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

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Full Name *</label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                    className="border-mustard/20 focus:border-mustard"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Email *</label>
                  <Input
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email"
                    className="border-mustard/20 focus:border-mustard"
                    type="email"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
                  <Input
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="border-mustard/20 focus:border-mustard"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Age</label>
                  <Input
                    value={newUser.age}
                    onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
                    placeholder="Enter age"
                    className="border-mustard/20 focus:border-mustard"
                    type="number"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Gender</label>
                  <Select
                    value={newUser.gender}
                    onValueChange={(value) => setNewUser({ ...newUser, gender: value })}
                    disabled={submitting}
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

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Password *</label>
                  <Input
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                    className="border-mustard/20 focus:border-mustard"
                    type="password"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Confirm Password *</label>
                  <Input
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="border-mustard/20 focus:border-mustard"
                    type="password"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Role</label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: "admin" | "instructor" | "student") =>
                      setNewUser({ ...newUser, role: value })
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Status</label>
                  <Select
                    value={newUser.status}
                    onValueChange={(value: "active" | "inactive") =>
                      setNewUser({ ...newUser, status: value })
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
                      "Create User"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Form Overlay - Responsive */}
      {showEditForm && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-ivory border border-mustard/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal">Edit User</h2>
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

              <form onSubmit={handleEditUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Full Name *</label>
                  <Input
                    value={editingUser.full_name}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    placeholder="Enter full name"
                    className="border-mustard/20 focus:border-mustard"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Email *</label>
                  <Input
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    placeholder="Enter email"
                    className="border-mustard/20 focus:border-mustard"
                    type="email"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
                  <Input
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="border-mustard/20 focus:border-mustard"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Age</label>
                  <Input
                    value={editingUser.age}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        age: e.target.value ? Number.parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="Enter age"
                    className="border-mustard/20 focus:border-mustard"
                    type="number"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Gender</label>
                  <Select
                    value={editingUser.gender}
                    onValueChange={(value) => setEditingUser({ ...editingUser, gender: value })}
                    disabled={submitting}
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

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    New Password (leave blank to keep current)
                  </label>
                  <Input
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="Enter new password"
                    className="border-mustard/20 focus:border-mustard"
                    type="password"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Confirm New Password</label>
                  <Input
                    value={editingUser.confirmPassword}
                    onChange={(e) => setEditingUser({ ...editingUser, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="border-mustard/20 focus:border-mustard"
                    type="password"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Role</label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value: "admin" | "instructor" | "student") =>
                      setEditingUser({ ...editingUser, role: value })
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Status</label>
                  <Select
                    value={editingUser.status}
                    onValueChange={(value: "active" | "inactive") =>
                      setEditingUser({ ...editingUser, status: value })
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
                      "Update User"
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