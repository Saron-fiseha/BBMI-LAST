"use client"
import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, Calendar, Share2, Facebook, Twitter, Instagram, Linkedin, Copy, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

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

export default function PortfolioDetailPage() {
  const [portfolioItem, setPortfolioItem] = useState<PortfolioItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const itemId = params.id as string

  const fetchPortfolioItem = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log(`🔍 Fetching portfolio item with ID: ${id}...`)

      const response = await fetch(`/api/admin/portfolio/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch item`)
      }

      const data = await response.json()

      if (data.success === false) {
        throw new Error(data.error || "Failed to fetch portfolio item")
      }

      setPortfolioItem(data.portfolioItem)
    } catch (error) {
      console.error("❌ Error fetching portfolio item:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch portfolio item"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (itemId) {
      fetchPortfolioItem(itemId)
    }
  }, [itemId])

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

  const handleShare = (platform: string) => {
    const currentUrl = window.location.href
    const title = portfolioItem?.title || "Brushed By Betty Portfolio"
    const description = portfolioItem?.description || "Check out this amazing work from Brushed By Betty"

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`
        break
      case "instagram":
        navigator.clipboard.writeText(currentUrl)
        toast({
          title: "Link Copied!",
          description: "Share this link on Instagram",
        })
        return
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
        break
      case "copy":
        navigator.clipboard.writeText(currentUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({
          title: "Link Copied!",
          description: "Portfolio link copied to clipboard",
        })
        return
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mustard mx-auto mb-4"></div>
          <p className="text-deep-purple">Loading portfolio details...</p>
        </div>
      </div>
    )
  }

  if (error || !portfolioItem) {
    return (
      <div className="min-h-screen bg-ivory">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end mb-6">
             <Button
                onClick={() => router.push("/portfolio")}
                className="bg-gradient-to-r from-custom-copper to-custom-tan hover:bg-warm-brown"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portfolio
            </Button>
          </div>
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>{error || "An unexpected error occurred."}</span>
              <Button
                variant="link"
                className="p-0 h-auto text-current underline"
                onClick={() => fetchPortfolioItem(itemId)}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
        <SiteHeader />
        {/* --- Start of Corrected Header --- */}
        <div className="bg-[#F5F1E9] text-warm-brown">
            <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-start mb-4">
                {/* Title now on the left */}
                <h1 className="text-3xl md:text-5xl font-bold">{portfolioItem.title}</h1>
                {/* Button moved to the right */}
                {/* <Button
                    onClick={() => router.push("/portfolio")}
                    className="bg-gradient-to-r from-custom-copper to-custom-tan hover:bg-warm-brown text-white flex-shrink-0"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Portfolio
                </Button> */}
            </div>

            {/* Meta-info (Category, Featured, Date) now below the title */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Badge className={getCategoryColor(portfolioItem.category)}>{portfolioItem.category}</Badge>
                {portfolioItem.featured && (
                <div className="bg-gradient-to-r from-custom-copper to-custom-tan hover:bg-warm-brown text-white px-2 py-1 rounded-full flex items-center text-sm font-medium">
                    <Star className="h-4 w-4 mr-1.5 fill-current" />
                    Featured
                </div>
                )}
                <div className="flex items-center text-warm-brown/80">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(portfolioItem.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
                </div>
            </div>
            </div>
        </div>
        {/* --- End of Corrected Header --- */}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Media Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-mustard/10">
              <div className="relative w-full h-96 md:h-[500px]">
                {portfolioItem.file_type === "video" ? (
                  <video
                    src={
                      portfolioItem.file_path || "/placeholder.svg?height=500&width=800&query=beauty salon portfolio"
                    }
                    className="object-cover w-full h-full"
                    controls
                    autoPlay
                    muted
                    poster={portfolioItem.file_path ? undefined : "/placeholder.svg?height=500&width=800"}
                  />
                ) : (
                  <Image
                    src={
                      portfolioItem.file_path ||
                      "/placeholder.svg?height=500&width=800&query=beauty salon portfolio" ||
                      "/placeholder.svg"
                    }
                    alt={portfolioItem.title}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-mustard/10">
              <h2 className="text-xl font-bold text-charcoal mb-4">Description</h2>
              <p className="text-warm-brown leading-relaxed whitespace-pre-wrap">{portfolioItem.description}</p>
            </div>

            {/* Share Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-mustard/10">
              <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                Share This Work
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleShare("facebook")}
                  className="bg-custom-browny hover:bg-custom-browny/90 text-white"
                  size="sm"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  onClick={() => handleShare("twitter")}
                  className="bg-custom-lavender hover:bg-custom-lavender/90 text-white"
                  size="sm"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  onClick={() => handleShare("instagram")}
                  className="bg-light-rose hover:bg-light-rose/-90 text-white"
                  size="sm"
                >
                  <Instagram className="h-4 w-4 mr-2" />
                  Instagram
                </Button>
                <Button
                  onClick={() => handleShare("linkedin")}
                  className="bg-charcoal-gray hover:bg-charcoal-gray/90 text-white"
                  size="sm"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  onClick={() => handleShare("copy")}
                  variant="outline"
                  className="col-span-2 border-custom-tan text-charcoal hover:bg-custom-tan hover:text-white"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-mustard/10">
              <h2 className="text-xl font-bold text-charcoal mb-4">Interested in Our Services?</h2>
              <p className="text-warm-brown mb-4">
                Get in touch with Brushed By Betty to learn more about our training programs and services.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/contact")}
                  className="w-full bg-custom-tan hover:bg-custom-tan/90 text-ivory"
                >
                  Contact Us
                </Button>
                <Button
                  onClick={() => router.push("/courses")}
                  variant="outline"
                  className="w-full border-custom-tan/20 text-custom-tan hover:bg-custom-tan hover:text-ivory"
                >
                  View Courses
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
     <SiteFooter />
    </div>
  )
}