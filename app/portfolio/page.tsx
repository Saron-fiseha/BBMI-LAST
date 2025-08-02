"use client"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation' // Corrected: Import from next/navigation
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Loader2, AlertCircle, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { Button } from "@/components/ui/button"

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

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter() // Corrected: Instantiate the router hook

  // Fetch portfolio items from database
  const fetchPortfolioItems = async (search = "", category = "all") => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔍 Fetching portfolio items for public display...")

      const params = new URLSearchParams({
        search,
        category,
        status: "published", // Only show published items on public page
        page: "1",
        limit: "100", // Get all published items
      })

      const response = await fetch(`/api/admin/portfolio?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (data.success === false) {
        throw new Error(data.error || "Failed to fetch portfolio items")
      }

      const itemsData = data.portfolioItems || []
      console.log("✅ Portfolio items loaded for public display:", itemsData.length)

      // Sort by featured first, then by creation date
      const sortedItems = itemsData.sort((a: PortfolioItem, b: PortfolioItem) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setPortfolioItems(sortedItems)
    } catch (error) {
      console.error("❌ Error fetching portfolio items:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch portfolio items"
      setError(errorMessage)
      setPortfolioItems([])
    } finally {
      setLoading(false)
    }
  }

  // Effect to fetch data on component mount and when filters change
  useEffect(() => {
    fetchPortfolioItems(searchQuery, filterCategory)
  }, [searchQuery, filterCategory])

  // Handle search change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPortfolioItems(searchQuery, filterCategory)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

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

  const handleViewDetail = (itemId: string) => {
    router.push(`/portfolio/${itemId}`) // This will now work correctly
  }

  const filteredItems = portfolioItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-white">
        <SiteHeader />
      {/* Header Section */}
      <div className="bg-gradient-to-r from-milk-cream to-soft-cream text-warm-brown">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Brushed By Betty</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">Beauty Salon Training Center Portfolio</p>
          <p className="text-lg max-w-2xl mx-auto opacity-80">
            Discover our stunning beauty transformations, professional training programs, and the artistry that makes
            Brushed By Betty the premier destination for beauty education.
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-deep-purple" />
            <Input
              placeholder="Search our portfolio..."
              className="pl-10 border-mustard/20 focus:border-mustard bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-[200px] border-mustard/20 focus:border-mustard bg-white">
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

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <button
                onClick={() => fetchPortfolioItems(searchQuery, filterCategory)}
                className="ml-2 underline hover:no-underline"
              >
                Try again
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-mustard mx-auto mb-4" />
              <p className="text-deep-purple">Loading our beautiful portfolio...</p>
            </div>
          </div>
        )}

        {/* Portfolio Grid */}
        {!loading && (
          <>
            {filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-deep-purple text-lg">
                  {error
                    ? "Unable to load portfolio items at this time."
                    : searchQuery || filterCategory !== "all"
                      ? "No portfolio items match your search criteria."
                      : "No portfolio items available yet. Check back soon!"}
                </div>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-deep-purple">
                    Showing {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
                    {(searchQuery || filterCategory !== "all") && (
                      <span className="ml-2 text-sm">
                        {searchQuery && `for "${searchQuery}"`}
                        {searchQuery && filterCategory !== "all" && " in "}
                        {filterCategory !== "all" && `${filterCategory} category`}
                      </span>
                    )}
                  </p>
                </div>

                {/* Portfolio Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-mustard/10 flex flex-col"
                    >
                      {/* Image/Video */}
                      <div className="relative h-48 w-full">
                        {item.file_type === "video" ? (
                          <video
                            src={item.file_path || "/placeholder.svg?height=192&width=300&query=beauty salon portfolio"}
                            className="object-cover w-full h-full"
                            controls
                            muted
                            poster={item.file_path ? undefined : "/placeholder.svg?height=192&width=300"}
                          />
                        ) : (
                          <Image
                            src={item.file_path || "/placeholder.svg?height=192&width=300&query=beauty salon portfolio"}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        )}
                        {item.featured && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-mustard text-ivory px-2 py-1 rounded-full flex items-center text-xs font-medium">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Featured
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex-grow">
                            <div className="flex items-center justify-between mb-2">
                            <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                            </div>

                            <h3 className="text-lg font-semibold text-charcoal mb-2 line-clamp-2">{item.title}</h3>

                            <p className="text-deep-purple text-sm line-clamp-3 mb-3">{item.description}</p>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                            </div>
                            <Button
                                onClick={() => handleViewDetail(item.id)}
                                className="bg-charcoal hover:bg-charcoal/90 text-ivory text-sm px-3 py-1.5 rounded-md"
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer Section */}
      <div className="bg-charcoal text-ivory mt-16">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Beauty Skills?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join Brushed By Betty's professional training programs and become part of our success stories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-mustard hover:bg-mustard/90 text-ivory px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Contact Us
            </a>
            <a
              href="/courses"
              className="border border-mustard text-mustard hover:bg-mustard hover:text-ivory px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              View Courses
            </a>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}