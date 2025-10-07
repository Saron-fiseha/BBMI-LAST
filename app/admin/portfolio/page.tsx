"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Loader2,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface PortfolioItem {
  id: string
  title: string
  description: string
  category: string
  file_path?: string
  file_type?: "image" | "video"
  status: "published" | "draft"
  featured: boolean
  created_at: string
  updated_at: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminPortfolioPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [filterCategory, setFilterCategory] = useState(searchParams.get("category") || "all")
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
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

  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadingEditFile, setUploadingEditFile] = useState(false)

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "makeup",
    file_path: "",
    file_type: "image" as "image" | "video",
    status: "published" as "published" | "draft",
    featured: false,
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

  // Fetch portfolio items from database with pagination
  const fetchPortfolioItems = async (search: string, category: string, status: string, page = 1) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔍 Fetching portfolio items with pagination...")

      const params = new URLSearchParams({
        search,
        category,
        status,
        page: page.toString(),
        limit: "10",
      })

      const response = await fetch(`/api/admin/portfolio?${params.toString()}`, {
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
        throw new Error(data.error || "Failed to fetch portfolio items")
      }

      const itemsData = data.portfolioItems || []
      console.log("✅ Portfolio items loaded:", itemsData.length)

      setPortfolioItems(itemsData)
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
      console.error("❌ Error fetching portfolio items:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch portfolio items"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setPortfolioItems([])
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() })
  }

  // Handle filter changes
  const handleCategoryChange = (category: string) => {
    setFilterCategory(category)
    updateURL({ category, page: "1" })
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
    const category = searchParams.get("category") || "all"
    const status = searchParams.get("status") || "all"

    setSearchQuery(search)
    setFilterCategory(category)
    setFilterStatus(status)

    fetchPortfolioItems(search, category, status, page)
  }, [searchParams])

  const handleFileUpload = async (file: File, isEdit = false) => {
    try {
      if (isEdit) {
        setUploadingEditFile(true)
      } else {
        setUploadingFile(true)
      }

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/portfolio/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload file")
      }

      if (isEdit && editingItem) {
        setEditingItem({
          ...editingItem,
          file_path: data.filePath,
          file_type: data.fileType,
        })
      } else {
        setNewItem({
          ...newItem,
          file_path: data.filePath,
          file_type: data.fileType,
        })
      }

      toast({
        title: "Success",
        description: "File uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload file"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      if (isEdit) {
        setUploadingEditFile(false)
      } else {
        setUploadingFile(false)
      }
    }
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSubmitting(true)
      setError(null)

      console.log("📝 Creating portfolio item with data:", newItem)

      const response = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newItem.title,
          description: newItem.description,
          category: newItem.category,
          file_path: newItem.file_path,
          file_type: newItem.file_type,
          status: newItem.status,
          featured: newItem.featured,
        }),
      })

      console.log("📡 Create response status:", response.status)

      const data = await response.json()
      console.log("📊 Parsed response data:", data)

      if (!response.ok || data.success === false) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      console.log("🎉 Portfolio item created successfully:", data.portfolioItem)

      // Reset form
      setNewItem({
        title: "",
        description: "",
        category: "makeup",
        file_path: "",
        file_type: "image",
        status: "published",
        featured: false,
      })

      // Close form
      setShowCreateForm(false)

      toast({
        title: "Success",
        description: "Portfolio item created successfully",
      })

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1")
      fetchPortfolioItems(searchQuery, filterCategory, filterStatus, currentPage)
    } catch (error) {
      console.error("❌ Error creating portfolio item:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create portfolio item"
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

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/admin/portfolio/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingItem.title,
          description: editingItem.description,
          category: editingItem.category,
          file_path: editingItem.file_path,
          file_type: editingItem.file_type,
          status: editingItem.status,
          featured: editingItem.featured,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.error || data.details || "Failed to update portfolio item")
      }

      setShowEditForm(false)
      setEditingItem(null)

      toast({
        title: "Success",
        description: "Portfolio item updated successfully",
      })

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1")
      fetchPortfolioItems(searchQuery, filterCategory, filterStatus, currentPage)
    } catch (error) {
      console.error("Error updating portfolio item:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update portfolio item"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this portfolio item?")) return

    try {
      const response = await fetch(`/api/admin/portfolio/${itemId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Failed to delete portfolio item")
      }

      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      })

      // Refresh current page
      const currentPage = Number.parseInt(searchParams.get("page") || "1")
      fetchPortfolioItems(searchQuery, filterCategory, filterStatus, currentPage)
    } catch (error) {
      console.error("Error deleting portfolio item:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete portfolio item"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const exportPortfolio = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "No,Title,Category,Status,Featured,Created\n" +
      portfolioItems
        .map(
          (item, index) =>
            `${index + 1},"${item.title}","${item.category}","${item.status}","${item.featured ? "Yes" : "No"}","${new Date(item.created_at).toLocaleDateString()}"`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "portfolio.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "makeup":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "skincare":
        return "bg-green-100 text-green-800 border-green-200"
      case "haircare":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "nails":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "training":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const openEditForm = (item: PortfolioItem) => {
    setEditingItem(item)
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
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Promotion Management</h1>
          <p className="text-sm sm:text-base text-deep-purple mt-1">Manage Brushed By Betty's promotion showcase</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={exportPortfolio}
            disabled={loading || portfolioItems.length === 0}
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
            Add Promotion Item
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
                fetchPortfolioItems(searchQuery, filterCategory, filterStatus, currentPage)
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
            placeholder="Search by title or description..."
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
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="bg-ivory border-mustard/20">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="makeup">Makeup</SelectItem>
            <SelectItem value="skincare">Skincare</SelectItem>
            <SelectItem value="haircare">Haircare</SelectItem>
            <SelectItem value="nails">Nails</SelectItem>
            <SelectItem value="training">Training</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && portfolioItems.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-mustard mx-auto mb-2" />
            <p className="text-deep-purple">Loading promotion items...</p>
          </div>
        </div>
      )}

      {/* Portfolio Items Table - Responsive */}
      <div className="bg-ivory border border-mustard/20 rounded-lg">
        <div className="p-4 border-b border-mustard/20">
          <h3 className="text-lg font-semibold text-charcoal">Promotion Items ({pagination.total})</h3>
        </div>

        {!loading && (
          <>
            {/* Mobile View */}
            <div className="block sm:hidden">
              <div className="space-y-4 p-4">
                {portfolioItems.length === 0 ? (
                  <div className="text-center py-8 text-deep-purple">
                    {error
                      ? "Error loading Promotion items. Please try again."
                      : "No Promotion items found. Click 'Add Promotion Item' to create your first item."}
                  </div>
                ) : (
                  portfolioItems.map((item, index) => (
                    <div key={item.id} className="border border-mustard/10 rounded-lg p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="relative h-12 w-12">
                            {item.file_type === "video" ? (
                              <video
                                src={
                                  item.file_path || "/placeholder.svg?height=48&width=48&query=beauty salon Promotion"
                                }
                                className="object-cover rounded-md w-full h-full"
                                muted
                              />
                            ) : (
                              <Image
                                src={
                                  item.file_path || "/placeholder.svg?height=48&width=48&query=beauty salon portfolio"
                                }
                                alt={item.title}
                                fill
                                className="object-cover rounded-md"
                              />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-charcoal flex items-center">
                              {item.title}
                              {item.featured && <Star className="h-4 w-4 text-yellow-500 ml-1 fill-current" />}
                            </h4>
                            <p className="text-sm text-deep-purple line-clamp-2">{item.description}</p>
                          </div>
                        </div>
                        <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Featured:</span>
                          <p className="font-medium">{item.featured ? "Yes" : "No"}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditForm(item)}
                          className="flex-1 border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteItem(item.id)}
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
                      <TableHead className="text-charcoal font-semibold">Title</TableHead>
                      <TableHead className="text-charcoal font-semibold">Category</TableHead>
                      <TableHead className="text-charcoal font-semibold">Status</TableHead>
                      <TableHead className="text-charcoal font-semibold">Featured</TableHead>
                      <TableHead className="text-charcoal font-semibold">Created</TableHead>
                      <TableHead className="text-charcoal font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolioItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-deep-purple">
                          {error
                            ? "Error loading Promotion items. Please try again."
                            : "No Promotion items found. Click 'Add Promotion Item' to create your first item."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      portfolioItems.map((item, index) => (
                        <TableRow
                          key={item.id}
                          className="border-mustard/10 hover:bg-mustard/5 transition-colors duration-200"
                        >
                          <TableCell className="font-medium text-charcoal">
                            {(pagination.page - 1) * pagination.limit + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="relative h-12 w-12">
                              {item.file_type === "video" ? (
                                <video
                                  src={
                                    item.file_path || "/placeholder.svg?height=48&width=48&query=beauty salon portfolio"
                                  }
                                  className="object-cover rounded-md w-full h-full"
                                  muted
                                />
                              ) : (
                                <Image
                                  src={
                                    item.file_path || "/placeholder.svg?height=48&width=48&query=beauty salon portfolio"
                                  }
                                  alt={item.title}
                                  fill
                                  className="object-cover rounded-md"
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-charcoal max-w-xs">
                            <div className="flex items-center">
                              <span className="truncate">{item.title}</span>
                              {item.featured && (
                                <Star className="h-4 w-4 text-yellow-500 ml-1 fill-current flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-deep-purple line-clamp-2">{item.description}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </TableCell>
                          <TableCell className="text-deep-purple">{item.featured ? "Yes" : "No"}</TableCell>
                          <TableCell className="text-deep-purple">
                            {new Date(item.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditForm(item)}
                                className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteItem(item.id)}
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

      {/* Create Portfolio Item Form Overlay - Responsive */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-ivory border border-mustard/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal">Create New Promotion Item</h2>
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

              <form onSubmit={handleCreateItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Title *</label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Enter Promotion item title"
                    className="border-mustard/20 focus:border-mustard"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Description *</label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Enter detailed description"
                    className="border-mustard/20 focus:border-mustard min-h-[100px]"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Category *</label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="makeup">Makeup</SelectItem>
                      <SelectItem value="skincare">Skincare</SelectItem>
                      <SelectItem value="haircare">Haircare</SelectItem>
                      <SelectItem value="nails">Nails</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Upload Media</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        id="file-upload"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(file)
                          }
                        }}
                        className="hidden"
                        disabled={submitting || uploadingFile}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        disabled={submitting || uploadingFile}
                        className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                      >
                        {uploadingFile ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Upload File
                          </>
                        )}
                      </Button>
                      <span className="text-sm text-deep-purple">Images & Videos (Max 10MB)</span>
                    </div>

                    {newItem.file_path && (
                      <div className="relative w-32 h-32 border border-mustard/20 rounded-md overflow-hidden">
                        {newItem.file_type === "video" ? (
                          <video src={newItem.file_path} className="object-cover w-full h-full" controls muted />
                        ) : (
                          <Image
                            src={newItem.file_path || "/placeholder.svg"}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewItem({ ...newItem, file_path: "", file_type: "image" })}
                          className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white"
                          disabled={submitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Status</label>
                  <Select
                    value={newItem.status}
                    onValueChange={(value: "published" | "draft") => setNewItem({ ...newItem, status: value })}
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={newItem.featured}
                    onCheckedChange={(checked) => setNewItem({ ...newItem, featured: !!checked })}
                    disabled={submitting}
                  />
                  <Label htmlFor="featured" className="text-sm font-medium text-charcoal">
                    Featured Item
                  </Label>
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
                      "Create Promotion Item"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Portfolio Item Form Overlay - Responsive */}
      {showEditForm && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-ivory border border-mustard/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal">Edit Promotion Item</h2>
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

              <form onSubmit={handleEditItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Title *</label>
                  <Input
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="Enter Promotion item title"
                    className="border-mustard/20 focus:border-mustard"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Description *</label>
                  <Textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Enter detailed description"
                    className="border-mustard/20 focus:border-mustard min-h-[100px]"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Category *</label>
                  <Select
                    value={editingItem.category}
                    onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="makeup">Makeup</SelectItem>
                      <SelectItem value="skincare">Skincare</SelectItem>
                      <SelectItem value="haircare">Haircare</SelectItem>
                      <SelectItem value="nails">Nails</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Upload Media</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        id="file-upload-edit"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(file, true)
                          }
                        }}
                        className="hidden"
                        disabled={submitting || uploadingEditFile}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("file-upload-edit")?.click()}
                        disabled={submitting || uploadingEditFile}
                        className="border-mustard/20 text-mustard hover:bg-mustard hover:text-ivory"
                      >
                        {uploadingEditFile ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Upload New File
                          </>
                        )}
                      </Button>
                      <span className="text-sm text-deep-purple">Images & Videos (Max 10MB)</span>
                    </div>

                    {editingItem.file_path && (
                      <div className="relative w-32 h-32 border border-mustard/20 rounded-md overflow-hidden">
                        {editingItem.file_type === "video" ? (
                          <video src={editingItem.file_path} className="object-cover w-full h-full" controls muted />
                        ) : (
                          <Image
                            src={editingItem.file_path || "/placeholder.svg"}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem({ ...editingItem, file_path: "", file_type: "image" })}
                          className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white"
                          disabled={submitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Status</label>
                  <Select
                    value={editingItem.status}
                    onValueChange={(value: "published" | "draft") => setEditingItem({ ...editingItem, status: value })}
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-mustard/20 focus:border-mustard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ivory border-mustard/20">
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured-edit"
                    checked={editingItem.featured}
                    onCheckedChange={(checked) => setEditingItem({ ...editingItem, featured: !!checked })}
                    disabled={submitting}
                  />
                  <Label htmlFor="featured-edit" className="text-sm font-medium text-charcoal">
                    Featured Item
                  </Label>
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
                      "Update Promotion Item"
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
