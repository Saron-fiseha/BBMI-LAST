"use client"

import type React from "react"
import { useState, useEffect, useCallback, ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Search, Download, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

// Debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }) as T
}

export default function StudentsPage() {
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterGender, setFilterGender] = useState("all")

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

  // Debounced fetch function
  const debouncedFetchStudents = useCallback(
    debounce(async (search: string, status: string, gender: string) => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (search.trim()) params.append("search", search.trim())
        if (status !== "all") params.append("status", status)
        if (gender !== "all") params.append("gender", gender)

        const response = await fetch(`/api/admin/students?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setStudents(data.students || [])
        } else {
          throw new Error(data.error || "Failed to fetch students")
        }
      } catch (error) {
        console.error("Error fetching students:", error)
        toast({
          title: "Error",
          description: "Failed to fetch students",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }, 300),
    [toast],
  )

  // Effects
  useEffect(() => {
    debouncedFetchStudents(searchQuery, filterStatus, filterGender)
  }, [searchQuery, filterStatus, filterGender, debouncedFetchStudents])

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
        debouncedFetchStudents(searchQuery, filterStatus, filterGender)
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
          name: editingStudent.full_name,
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
        debouncedFetchStudents(searchQuery, filterStatus, filterGender)
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
        debouncedFetchStudents(searchQuery, filterStatus, filterGender)
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
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600">Manage all registered students</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterGender} onValueChange={setFilterGender}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gender</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students ({students.length})</CardTitle>
          <CardDescription>Complete list of registered students</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading students...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">#</th>
                    <th className="text-left p-4">Student</th>
                    <th className="text-left p-4">ID Number</th>
                    <th className="text-left p-4">Contact</th>
                    <th className="text-left p-4">Age</th>
                    <th className="text-left p-4">Gender</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Courses</th>
                    <th className="text-left p-4">Progress</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Last Active</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{student.roll_number}</td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{student.full_name}</div>
                          <div className="text-sm text-gray-500">
                            Joined {new Date(student.join_date).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm">{student.id_number}</td>
                      <td className="p-4">
                        <div>
                          <div className="text-sm">{student.email}</div>
                          <div className="text-sm text-gray-500">{student.phone || "-"}</div>
                        </div>
                      </td>
                      <td className="p-4">{student.age || "-"}</td>
                      <td className="p-4">{student.gender || "-"}</td>
                      <td className="p-4">
                        <Badge variant="secondary">student</Badge>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-sm">Enrolled: {student.courses_enrolled}</div>
                          <div className="text-sm text-gray-500">Completed: {student.courses_completed}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-sm">{student.total_hours} hours</div>
                          <div className="text-sm text-gray-500">
                            {student.courses_enrolled > 0
                              ? Math.round((student.courses_completed / student.courses_enrolled) * 100)
                              : 0}
                            % complete
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(student.last_active).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(student)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            disabled={isDeleting === student.id}
                          >
                            {isDeleting === student.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {students.length === 0 && <div className="text-center py-8 text-gray-500">No students found</div>}
            </div>
          )}
        </CardContent>
      </Card>

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
                  value={newStudent.name}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={newStudent.age}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={newStudent.gender}
                  onValueChange={(value) => setNewStudent((prev) => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
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
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newStudent.confirmPassword}
                  onChange={(e) => setNewStudent((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newStudent.status}
                  onValueChange={(value) => setNewStudent((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingStudent.phone || ""}
                    onChange={(e) => setEditingStudent((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-age">Age</Label>
                  <Input
                    id="edit-age"
                    type="number"
                    value={editingStudent.age || ""}
                    onChange={(e) =>
                      setEditingStudent((prev) =>
                        prev ? { ...prev, age: e.target.value ? Number.parseInt(e.target.value) : undefined } : null,
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select
                    value={editingStudent.gender || ""}
                    onValueChange={(value) => setEditingStudent((prev) => (prev ? { ...prev, gender: value } : null))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
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
                    value={editingStudent.password || ""}
                    onChange={(e) => setEditingStudent((prev) => (prev ? { ...prev, password: e.target.value } : null))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
                  <Input
                    id="edit-confirmPassword"
                    type="password"
                    value={editingStudent.confirmPassword || ""}
                    onChange={(e) =>
                      setEditingStudent((prev) => (prev ? { ...prev, confirmPassword: e.target.value } : null))
                    }
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
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
