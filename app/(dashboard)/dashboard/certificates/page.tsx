"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Award,
  Download,
  Share2,
  Calendar,
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  Star,
  GraduationCap,
  Clock,
  X,
  Eye,
  ExternalLink,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import Image from "next/image"

interface Certificate {
  id: number
  user_id: number
  course_id: number
  course_title: string
  course_category: string
  course_level: string
  instructor_name: string
  student_name: string
  completion_date: string
  issue_date: string
  certificate_code: string
  verification_code: string
  grade: string
  duration_hours: number
  skills_learned: string[]
  verification_url: string
  progress: number
  total_modules: number
  completed_modules: number
}

interface FilterOptions {
  categories: string[]
  levels: string[]
  years: number[]
  instructors: string[]
}

export default function StudentCertificatesPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    levels: [],
    years: [],
    instructors: [],
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedInstructor, setSelectedInstructor] = useState("all")
  const [isGenerating, setIsGenerating] = useState<number | null>(null)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchCertificates()
    }
  }, [user?.id])

  useEffect(() => {
    filterCertificates()
  }, [certificates, searchTerm, selectedCategory, selectedLevel, selectedYear, selectedInstructor])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/certificates/student?userId=${user?.id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.certificates && data.certificates.length > 0) {
        setCertificates(data.certificates)

        // Extract filter options from certificates
        const categories = [...new Set(data.certificates.map((cert: Certificate) => cert.course_category))]
        const levels = [...new Set(data.certificates.map((cert: Certificate) => cert.course_level))]
        const years = [
          ...new Set(data.certificates.map((cert: Certificate) => new Date(cert.completion_date).getFullYear())),
        ]
        const instructors = [...new Set(data.certificates.map((cert: Certificate) => cert.instructor_name))]

        // setFilterOptions({
        //   categories: categories.filter(Boolean),
        //   levels: levels.filter(Boolean),
        //   years: years.sort((a, b) => b - a),
        //   instructors: instructors.filter(Boolean),
        // })
      } else {
        // Mock certificate data for demonstration - will be replaced when real data is available
        const mockCertificates: Certificate[] = [
          {
            id: 1,
            user_id: user?.id || 1,
            course_id: 2,
            course_title: "Professional Bridal Makeup Artistry",
            course_category: "Bridal Makeup",
            course_level: "Intermediate",
            instructor_name: "Sarah Martinez",
            student_name: user?.full_name || "Student Name",
            completion_date: "2024-01-15",
            issue_date: "2024-01-16",
            certificate_code: "BBMI-BMA-2024-001",
            verification_code: "VER-ABC123DEF456",
            grade: "A+",
            duration_hours: 18,
            skills_learned: [
              "Bridal Makeup Techniques",
              "Long-lasting Formulas",
              "Photography-ready Looks",
              "Client Consultation",
              "Color Matching",
            ],
            verification_url: `${window.location.origin}/verify/${encodeURIComponent("VER-ABC123DEF456")}`,
            progress: 100,
            total_modules: 6,
            completed_modules: 6,
          },
          {
            id: 2,
            user_id: user?.id || 1,
            course_id: 4,
            course_title: "Advanced Color Theory & Application",
            course_category: "Color Theory",
            course_level: "Advanced",
            instructor_name: "Emma Wilson",
            student_name: user?.full_name || "Student Name",
            completion_date: "2023-12-10",
            issue_date: "2023-12-11",
            certificate_code: "BBMI-CTA-2023-045",
            verification_code: "VER-XYZ789GHI012",
            grade: "A",
            duration_hours: 15,
            skills_learned: [
              "Color Matching",
              "Skin Tone Analysis",
              "Color Correction",
              "Seasonal Color Analysis",
              "Advanced Color Theory",
            ],
            verification_url: `${window.location.origin}/verify/${encodeURIComponent("VER-XYZ789GHI012")}`,
            progress: 100,
            total_modules: 5,
            completed_modules: 5,
          },
        ]

        setCertificates(mockCertificates)
        setFilterOptions({
          categories: ["Bridal Makeup", "Color Theory"],
          levels: ["Intermediate", "Advanced"],
          years: [2024, 2023],
          instructors: ["Sarah Martinez", "Emma Wilson"],
        })
      }
    } catch (error) {
      console.error("Certificates fetch error:", error)
      setCertificates([])
      toast({
        title: "Error",
        description: "Failed to load certificates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterCertificates = () => {
    let filtered = certificates

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (cert) =>
          cert.course_title.toLowerCase().includes(searchLower) ||
          cert.instructor_name.toLowerCase().includes(searchLower) ||
          cert.certificate_code.toLowerCase().includes(searchLower) ||
          cert.student_name.toLowerCase().includes(searchLower),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((cert) => cert.course_category === selectedCategory)
    }

    // Level filter
    if (selectedLevel !== "all") {
      filtered = filtered.filter((cert) => cert.course_level === selectedLevel)
    }

    // Year filter
    if (selectedYear !== "all") {
      filtered = filtered.filter((cert) => new Date(cert.completion_date).getFullYear().toString() === selectedYear)
    }

    // Instructor filter
    if (selectedInstructor !== "all") {
      filtered = filtered.filter((cert) => cert.instructor_name === selectedInstructor)
    }

    setFilteredCertificates(filtered)
  }

  const generateCertificate = async (courseId: number) => {
    try {
      setIsGenerating(courseId)
      toast({
        title: "Generating Certificate",
        description: "Creating your certificate of completion...",
      })

      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          courseId: courseId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate certificate")
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Certificate generated successfully!",
        })
        // Refresh certificates list
        await fetchCertificates()
      } else {
        throw new Error(data.message || "Certificate generation failed")
      }
    } catch (error) {
      console.error("Certificate generation error:", error)
      toast({
        title: "Generation Failed",
        description: "Unable to generate certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(null)
    }
  }

  const downloadCertificate = async (certificate: Certificate) => {
    try {
      setIsDownloading(true)
      toast({
        title: "Preparing Download",
        description: "Generating PDF certificate...",
      })

      const response = await fetch("/api/certificates/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          certificateId: certificate.id,
          studentName: certificate.student_name,
          courseName: certificate.course_title,
          instructorName: certificate.instructor_name,
          completionDate: certificate.completion_date,
          certificateCode: certificate.certificate_code,
          grade: certificate.grade,
          duration: certificate.duration_hours,
          skills: certificate.skills_learned,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to download certificate")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `BBMI-Certificate-${certificate.certificate_code}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Certificate downloaded successfully!",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Failed",
        description: "Unable to download certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const shareCertificate = async (certificate: Certificate) => {
    try {
      const shareData = {
        title: `BBMI Certificate - ${certificate.course_title}`,
        text: `🎓 I've successfully completed ${certificate.course_title} at Betty Beauty Makeup Institute and earned my certificate of completion!

Certificate ID: ${certificate.certificate_code}
Grade: ${certificate.grade}
Instructor: ${certificate.instructor_name}

#BBMI #MakeupArtist #CertifiedProfessional #BeautyEducation`,
        url: certificate.verification_url,
      }

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast({
          title: "Shared Successfully",
          description: "Certificate shared successfully!",
        })
      } else {
        // Fallback: copy to clipboard
        const shareText = `🎓 I've successfully completed ${certificate.course_title} at Betty Beauty Makeup Institute and earned my certificate of completion!

Certificate ID: ${certificate.certificate_code}
Grade: ${certificate.grade}
Instructor: ${certificate.instructor_name}
Verify at: ${certificate.verification_url}

#BBMI #MakeupArtist #CertifiedProfessional #BeautyEducation`

        await navigator.clipboard.writeText(shareText)
        toast({
          title: "Link Copied",
          description: "Certificate details copied to clipboard!",
        })
      }
    } catch (error) {
      console.error("Share error:", error)
      toast({
        title: "Share Failed",
        description: "Unable to share certificate. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openCertificateModal = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setIsModalOpen(true)
  }

  const closeCertificateModal = () => {
    setSelectedCertificate(null)
    setIsModalOpen(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="px-6 pt-6">
          <DashboardHeader heading="Dashboard" text="Loading your certificates..." />
        </div>
        <div className="px-6 animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Dashboard Header */}
      <div className="px-6 pt-6">
        <DashboardHeader heading="Dashboard" text="Overview of your learning journey" />
      </div>

      {/* Welcome Section */}
      <div className="px-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
          </div>
          <p className="text-gray-600">View, download and share your achievements</p>
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              <span>{certificates.length} Certificates Earned</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Verified & Authentic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="px-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search certificates, courses, instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filterOptions.categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
{/* 
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {filterOptions.levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}

            {/* <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Instructor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instructors</SelectItem>
                {filterOptions.instructors.map((instructor) => (
                  <SelectItem key={instructor} value={instructor}>
                    {instructor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {filterOptions.years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <Card
              key={certificate.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 cursor-pointer group"
              onClick={() => openCertificateModal(certificate)}
            >
              {/* Certificate Template Display - Smaller Size */}
              <div className="relative">
                <div className="aspect-[4/3] relative bg-white">
                  <Image
                    src="/certificate-template.png"
                    alt="BBMI Certificate Template"
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                  {/* Dynamic Text Overlays */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                    {/* Student Name */}
                    {/* <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <h3 className="text-lg md:text-xl font-bold text-yellow-600 font-serif">
                        {certificate.student_name}
                      </h3>
                    </div> */}

                    {/* Course Description - Simplified for smaller view */}
                    {/* <div className="absolute top-[58%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-xs px-2">
                      <p className="text-xs text-blue-900 leading-tight">
                        {certificate.course_title} - {new Date(certificate.completion_date).toLocaleDateString()}
                      </p>
                    </div> */}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Summary */}
              <div className="p-4 bg-white">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{certificate.course_title}</h4>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{certificate.course_category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {certificate.grade}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(certificate.completion_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadCertificate(certificate)
                    }}
                    disabled={isDownloading}
                    className="flex-1 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    {isDownloading ? "..." : "PDF"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      shareCertificate(certificate)
                    }}
                    className="flex-1 text-xs"
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Certificate Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Certificate Details</span>
              <Button variant="ghost" size="sm" onClick={closeCertificateModal}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedCertificate && (
            <div className="space-y-6">
              {/* Full Size Certificate */}
              <div className="relative">
                <div className="aspect-[4/3] relative bg-white">
                  <Image
                    src="/certificate-template.png"
                    alt="BBMI Certificate Template"
                    fill
                    className="object-contain"
                    priority
                  />
                  {/* Dynamic Text Overlays - Full Size */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                    {/* Student Name */}
                    <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-600 font-serif">
                        {selectedCertificate.student_name}
                      </h3>
                    </div>

                    {/* Course Description */}
                    <div className="absolute top-[58%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-2xl px-4">
                      <p className="text-sm md:text-base lg:text-lg text-blue-900 leading-relaxed">
                        In recognition of exceptional skill in {selectedCertificate.course_title.toLowerCase()},
                        including long-wear techniques, client consultation, and personalized beauty enhancement.
                        Proudly awarded by BBMI on {new Date(selectedCertificate.completion_date).toLocaleDateString()}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Skills Acquired
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedCertificate.skills_learned.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Course Details</h5>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span>Category: {selectedCertificate.course_category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Level: {selectedCertificate.course_level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span>Duration: {selectedCertificate.duration_hours} hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      <span>Grade: {selectedCertificate.grade}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>Issued: {new Date(selectedCertificate.issue_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      <span>Certificate ID: {selectedCertificate.certificate_code}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  onClick={() => downloadCertificate(selectedCertificate)}
                  disabled={isDownloading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isDownloading ? "Downloading..." : "Download PDF"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => shareCertificate(selectedCertificate)}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Certificate
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.open(selectedCertificate.verification_url, "_blank")}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Verify Online
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {filteredCertificates.length === 0 && !loading && (
        <div className="px-6">
          <Card>
            <div className="text-center py-16">
              <GraduationCap className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {searchTerm ||
                selectedCategory !== "all" ||
                selectedLevel !== "all" ||
                selectedYear !== "all" ||
                selectedInstructor !== "all"
                  ? "No certificates found"
                  : "No Certificates Yet"}
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {searchTerm ||
                selectedCategory !== "all" ||
                selectedLevel !== "all" ||
                selectedYear !== "all" ||
                selectedInstructor !== "all"
                  ? "Try adjusting your search or filter criteria to find certificates."
                  : "Complete courses to earn certificates and showcase your professional achievements."}
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View My Courses
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
