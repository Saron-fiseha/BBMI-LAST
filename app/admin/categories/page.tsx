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

interface Category {
  id: string
  name: string
  description: string
  image_url: string
  level: "beginner" | "intermediate" | "advanced"
  trainings_count: number
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

export default function CategoriesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [filterLevel, setFilterLevel] = useState(searchParams.get("level") || "all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
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

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    image_url: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
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

  // Fetch categories from database with pagination
  const fetchCategories = async (search: string, level: string, page = 1) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔍 Fetching categories with pagination...")

      const params = new URLSearchParams({
        search,
        level,
        page: page.toString(),
        limit: "10",
      })

      const response = await fetch(`/api/admin/categories?${params}`, {
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
        throw new Error(data.error || "Failed to fetch categories")
      }

      const categoriesData = data.categories || []
      console.log("✅ Categories loaded:", categoriesData.length)

      setCategories(categoriesData)
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
      console.error("❌ Error fetching categories:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch categories"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() })
  }

  // Handle filter changes
  const handleLevelChange = (level: string) => {
    setFilterLevel(level)
    updateURL({ level, page: "1" })
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
    const level = searchParams.get("level") || "all"

    setSearchQuery(search)
    setFilterLevel(level)

    fetchCategories(search, level, page)
  }, [searchParams])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🚀 Starting category creation...")

    // Validation
    if (!newCategory.name.trim() || !newCategory.description.trim()) {
      const errorMsg = "Please fill in all required fields"
      console.log("❌ Validation failed:", errorMsg)
      toast({
        title: "Validation Error",
        description: errorMsg,
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      console.log("📝 Creating category with data:", newCategory)

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      })

      console.log("📡 Create response status:", response.status)

      const data = await response.json()
      console.log("📊 Parsed response data:", data)

      if (!response.ok || data.success === false) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      console.log("🎉 Category created successfully:", data.category)

      // Reset form
      setNewCategory({
        name: "",
        description: "",
        image_url: "",
        level: "beginner",
      })

      // Close form
      setShowCreateForm(false)

      toast({
        title: "Success",
        description: "Category created successfully and is now available on courses pages",
      })

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1")
      fetchCategories(searchQuery, filterLevel, currentPage)
    } catch (error) {
      console.error("❌ Error creating category:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create category"
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

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      setSubmitting(true)
      const response = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.error || data.details || "Failed to update category")
      }

      setShowEditForm(false)
      setEditingCategory(null)

      toast({
        title: "Success",
        description: "Category updated successfully",
      })

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1")
      fetchCategories(searchQuery, filterLevel, currentPage)
    } catch (error) {
      console.error("Error updating category:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update category"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const response = await fetch(`/api/admin/categories?id=${categoryId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Failed to delete category")
      }

      toast({
        title: "Success",
        description: "Category deleted successfully",
      })

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1")
      fetchCategories(searchQuery, filterLevel, currentPage)
    } catch (error) {
      console.error("Error deleting category:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete category"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const exportCategories = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "No,Name,Description,Level,Trainings,Status,Created\n" +
      categories
        .map(
          (c, index) =>
            `${index + 1},"${c.name}","${c.description}","${c.level}",${c.trainings_count},"${c.status}","${new Date(c.created_at).toLocaleDateString()}"`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "categories.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "intermediate":
        return "bg-mustard/20 text-mustard border-mustard/30"
      case "advanced":
        return "bg-deep-purple/20 text-deep-purple border-deep-purple/30"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const openEditForm = (category: Category) => {
    setEditingCategory({ ...category })
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
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Training Categories</h1>
          <p className="text-sm sm:text-base text-deep-purple mt-1">Manage beauty salon training categories</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={exportCategories}
            disabled={loading || categories.length === 0}
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
            Add Category
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
                fetchCategories(searchQuery, filterLevel, currentPage)
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
            placeholder="Search categories..."
            className="pl-8 border-mustard/20 focus:border-mustard"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={filterLevel} onValueChange={handleLevelChange}>
          <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent className="bg-ivory border-mustard/20">
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && categories.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-mustard mx-auto mb-2" />
            <p className="text-deep-purple">Loading categories...</p>
          </div>
        </div>
      )}

      {/* Categories Table - Responsive */}
      <div className="bg-ivory border border-mustard/20 rounded-lg">
        <div className="p-4 border-b border-mustard/20">
          <h3 className="text-lg font-semibold text-charcoal">Categories ({pagination.total})</h3>
        </div>

        {!loading && (
          <>
            {/* Mobile View */}
            <div className="block sm:hidden">
              <div className="space-y-4 p-4">
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-deep-purple">
                    {error
                      ? "Error loading categories. Please try again."
                      : "No categories found. Click 'Add Category' to create your first category."}
                  </div>
                ) : (
                  categories.map((category, index) => (
                    <div key={category.id} className="border border-mustard/10 rounded-lg p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="relative h-12 w-12">
                            <Image
                              src={category.image_url || "/placeholder.svg?height=48&width=48"}
                              alt={category.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-charcoal">{category.name}</h4>
                            <p className="text-sm text-deep-purple">{category.description.substring(0, 50)}...</p>
                          </div>
                        </div>
                        <Badge className={getLevelColor(category.level)}>{category.level}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Trainings:</span>
                          <p className="font-medium">{category.trainings_count || 0}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <Badge variant="outline" className="border-mustard text-mustard ml-1">
                            {category.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditForm(category)}
                          className="flex-1 border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCategory(category.id)}
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
                      <TableHead className="text-charcoal font-semibold">Image</TableHead>
                      <TableHead className="text-charcoal font-semibold">Name</TableHead>
                      <TableHead className="text-charcoal font-semibold">Description</TableHead>
                      <TableHead className="text-charcoal font-semibold">Level</TableHead>
                      <TableHead className="text-charcoal font-semibold">Trainings</TableHead>
                      <TableHead className="text-charcoal font-semibold">Status</TableHead>
                      <TableHead className="text-charcoal font-semibold">Created</TableHead>
                      <TableHead className="text-charcoal font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-deep-purple">
                          {error
                            ? "Error loading categories. Please try again."
                            : "No categories found. Click 'Add Category' to create your first category."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category, index) => (
                        <TableRow
                          key={category.id}
                          className="border-mustard/10 hover:bg-mustard/5 transition-colors duration-200"
                        >
                          <TableCell className="font-medium text-charcoal">
                            {(pagination.page - 1) * pagination.limit + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="relative h-12 w-12">
                              <Image
                                src={category.image_url || "/placeholder.svg?height=48&width=48"}
                                alt={category.name}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-charcoal">{category.name}</TableCell>
                          <TableCell className="text-deep-purple max-w-xs truncate">{category.description}</TableCell>
                          <TableCell>
                            <Badge className={getLevelColor(category.level)}>{category.level}</Badge>
                          </TableCell>
                          <TableCell className="text-charcoal">{category.trainings_count || 0}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-mustard text-mustard">
                              {category.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-deep-purple">
                            {new Date(category.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditForm(category)}
                                className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCategory(category.id)}
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

      {/* Create Category Form Overlay - Responsive */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-ivory border border-mustard/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal">Create New Category</h2>
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

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Category Name *</label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Enter category name"
                    className="border-mustard/20 focus:border-mustard"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Description *</label>
                  <Textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Enter category description"
                    className="border-mustard/20 focus:border-mustard"
                    rows={3}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Image URL</label>
                  <Input
                    value={newCategory.image_url}
                    onChange={(e) => setNewCategory({ ...newCategory, image_url: e.target.value })}
                    placeholder="Enter image URL (optional)"
                    className="border-mustard/20 focus:border-mustard"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Difficulty Level</label>
                  <Select
                    value={newCategory.level}
                    onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                      setNewCategory({ ...newCategory, level: value })
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
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
                      "Create Category"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Form Overlay - Responsive */}
      {showEditForm && editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-ivory border border-mustard/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal">Edit Category</h2>
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

              <form onSubmit={handleEditCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Category Name *</label>
                  <Input
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    placeholder="Enter category name"
                    className="border-mustard/20 focus:border-mustard"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Description *</label>
                  <Textarea
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    placeholder="Enter category description"
                    className="border-mustard/20 focus:border-mustard"
                    rows={3}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Image URL</label>
                  <Input
                    value={editingCategory.image_url}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                    placeholder="Enter image URL (optional)"
                    className="border-mustard/20 focus:border-mustard"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Difficulty Level</label>
                  <Select
                    value={editingCategory.level}
                    onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                      setEditingCategory({ ...editingCategory, level: value })
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Status</label>
                  <Select
                    value={editingCategory.status}
                    onValueChange={(value: "active" | "inactive") =>
                      setEditingCategory({ ...editingCategory, status: value })
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
                      "Update Category"
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
