// C:\Users\Hp\Documents\BBMI-LMS\app\(dashboard)\dashboard\certificates\page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Award,
  Download,
  Calendar,
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  Star,
  GraduationCap,
  Clock,
  Users,
  Hash,
  UserRound,
  Tag,
  Eye, // Used for 'View Certificate' icon
  Loader2, // Used for loading states on buttons
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link"; // Keep Link for "View My Courses"

interface Certificate {
  id: number;
  user_id: number;
  course_id: number; // Corresponds to training_id in DB
  course_title: string; // Corresponds to training_name in DB
  course_category: string;
  course_level: string;
  instructor_name: string;
  student_name: string; // Corresponds to user_name in DB
  certificate_issued_at: string; // <-- USING THIS
  issue_date: string; // This remains for API's own issue date
  certificate_number: string; // <-- USING THIS
  verification_code: string; // Crucial for API call
  grade: string;
  duration_hours: number; // Corresponds to duration in DB
  skills_learned: string[];
  verification_url: string; // Not directly used for viewing in new tab, but useful
  progress: number;
  total_modules: number;
  completed_modules: number;
  training_description?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  course_count: number;
}

interface FilterOptions {
  categories: Category[];
  levels: string[];
  years: number[];
  instructors: string[];
}

export default function StudentCertificatesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<
    Certificate[]
  >([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    levels: [],
    years: [],
    instructors: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedInstructor, setSelectedInstructor] = useState("all");
  const [downloadingCertId, setDownloadingCertId] = useState<number | null>(
    null
  );
  const [viewingCertId, setViewingCertId] = useState<number | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
      return "N/A";
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch("/api/dashboard/categories");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.categories) {
        setFilterOptions((prev) => ({ ...prev, categories: data.categories }));
      } else {
        console.warn("Categories API returned no data or success false.");
        setFilterOptions((prev) => ({ ...prev, categories: [] }));
      }
    } catch (error) {
      console.error("Categories fetch error:", error);
      toast({
        title: "Warning",
        description: "Could not load categories from database.",
        variant: "default",
      });
    } finally {
      setCategoriesLoading(false);
    }
  }, [toast]);

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setCertificates([]);
        setFilteredCertificates([]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/certificates/student?userId=${user.id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.certificates && data.certificates.length > 0) {
        const mappedCertificates: Certificate[] = data.certificates.map(
          (cert: any) => ({
            id: cert.id,
            user_id: cert.user_id,
            course_id: cert.training_id,
            course_title: cert.course_title,
            course_category: cert.course_category || "Uncategorized",
            course_level: cert.course_level || "General",
            instructor_name: cert.instructor_name,
            student_name: cert.student_name,
            certificate_issued_at: cert.certificate_issued_at,
            issue_date: cert.issue_date,
            certificate_number: cert.certificate_number,
            verification_code: cert.verification_code,
            grade: cert.grade || "N/A",
            duration_hours: cert.duration,
            skills_learned: Array.isArray(cert.skills_learned)
              ? cert.skills_learned
              : typeof cert.skills_learned === "string" && cert.skills_learned
                ? cert.skills_learned.split(",").map((s: string) => s.trim())
                : [],
            verification_url: `${window.location.origin}/verify/${encodeURIComponent(cert.verification_code)}`,
            progress: 100,
            total_modules: 1,
            completed_modules: 1,
            training_description: cert.training_description || "",
          })
        );

        setCertificates(mappedCertificates);

        const levels = [
          ...new Set(mappedCertificates.map((cert) => cert.course_level)),
        ].filter(Boolean) as string[];
        const years = [
          ...new Set(
            mappedCertificates.map((cert) =>
              new Date(cert.certificate_issued_at).getFullYear()
            )
          ),
        ].sort((a, b) => b - a);
        const instructors = [
          ...new Set(mappedCertificates.map((cert) => cert.instructor_name)),
        ].filter(Boolean) as string[];

        setFilterOptions((prev) => {
          // Find the maximum ID already in 'prev.categories' to ensure new IDs don't clash
          const maxExistingId = prev.categories.reduce(
            (maxId, cat) => Math.max(maxId, cat.id),
            0
          );

          const categoriesWithCounts = prev.categories.map((cat) => ({
            ...cat,
            course_count: mappedCertificates.filter(
              (c) => c.course_category === cat.name
            ).length,
          }));

          const newCategoriesFromCerts = [
            ...new Set(mappedCertificates.map((c) => c.course_category)),
          ]
            .filter(
              (catName) => !prev.categories.some((pc) => pc.name === catName)
            )
            .map((catName, index) => ({
              id: maxExistingId + 1 + index, // <-- FIXED: Generate a unique ID
              name: catName,
              description: "",
              course_count: mappedCertificates.filter(
                (c) => c.course_category === catName
              ).length,
            }));

          return {
            ...prev,
            categories: [...categoriesWithCounts, ...newCategoriesFromCerts],
            levels: levels,
            years: years,
            instructors: instructors,
          };
        });
      } else {
        setCertificates([]);
        setFilterOptions((prev) => ({
          ...prev,
          levels: [],
          years: [],
          instructors: [],
        }));
      }
    } catch (error) {
      console.error("Certificates fetch error:", error);
      setCertificates([]);
      toast({
        title: "Error",
        description: "Failed to load certificates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (user?.id) {
      fetchCertificates();
    }
  }, [user?.id, fetchCertificates]);

  useEffect(() => {
    filterCertificates();
  }, [
    certificates,
    searchTerm,
    selectedCategory,
    selectedLevel,
    selectedYear,
    selectedInstructor,
  ]);

  const filterCertificates = () => {
    let filtered = certificates;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cert) =>
          cert.course_title.toLowerCase().includes(searchLower) ||
          cert.instructor_name.toLowerCase().includes(searchLower) ||
          cert.certificate_number.toLowerCase().includes(searchLower) ||
          cert.student_name.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (cert) => cert.course_category === selectedCategory
      );
    }

    if (selectedLevel !== "all") {
      filtered = filtered.filter((cert) => cert.course_level === selectedLevel);
    }

    if (selectedYear !== "all") {
      filtered = filtered.filter(
        (cert) =>
          new Date(cert.certificate_issued_at).getFullYear().toString() ===
          selectedYear
      );
    }

    if (selectedInstructor !== "all") {
      filtered = filtered.filter(
        (cert) => cert.instructor_name === selectedInstructor
      );
    }

    setFilteredCertificates(filtered);
  };

  const viewCertificateInNewTab = async (certificate: Certificate) => {
    setViewingCertId(certificate.id);
    try {
      toast({
        title: "Preparing Certificate",
        description: "Opening certificate in a new tab...",
      });

      const response = await fetch(
        `/api/certificates/html-content?verificationCode=${encodeURIComponent(certificate.verification_code)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch certificate HTML");
      }

      const htmlContent = await response.text();

      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      } else {
        toast({
          title: "Blocked",
          description: "Pop-ups blocked. Please allow pop-ups for this site.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("View certificate error:", error);
      toast({
        title: "View Failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to view certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setViewingCertId(null);
    }
  };

  const downloadCertificate = async (certificate: Certificate) => {
    setDownloadingCertId(certificate.id);
    try {
      toast({
        title: "Preparing Download",
        description: "Generating PDF certificate...",
      });

      console.log("Certificate data being sent for PDF:", {
        certificateId: certificate.id,
        studentName: certificate.student_name,
        courseName: certificate.course_title,
        instructorName: certificate.instructor_name,
        certificateIssuedAt: formatDate(certificate.certificate_issued_at),
        certificateNumber: certificate.certificate_number,
        verificationCode: certificate.verification_code,
        grade: certificate.grade,
        duration: certificate.duration_hours,
        skills: certificate.skills_learned,
        trainingDescription: certificate.training_description,
      });

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
          certificateIssuedAt: formatDate(certificate.certificate_issued_at),
          certificateNumber: certificate.certificate_number,
          verificationCode: certificate.verification_code,
          grade: certificate.grade,
          duration: certificate.duration_hours, // Use `duration` here
          skills: certificate.skills_learned,
          trainingDescription: certificate.training_description,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Download API Response Error:", errorText);
        throw new Error(
          `Failed to download certificate: ${response.status} - ${errorText}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `BBMI-Certificate-${certificate.certificate_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Certificate downloaded successfully!",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to download certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingCertId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="px-6 pt-6">
          <DashboardHeader
            heading="Certificates"
            text="Loading your certificates..."
          />
        </div>
        <div className="px-6 animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="px-6 pt-6">
        <DashboardHeader
          heading="Certificates"
          text="Overview of your learning journey"
        />
      </div>

      <div className="px-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              My Certificates
            </h1>
          </div>
          <p className="text-gray-600">
            View your professional achievements and download them.
          </p>
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
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px] sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  // Map directly from filterOptions.categories which should have category objects
                  filterOptions.categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}{" "}
                      {category.course_count > 0
                        ? `(${category.course_count})`
                        : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[140px]">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {filterOptions.levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedInstructor}
              onValueChange={setSelectedInstructor}
            >
              <SelectTrigger className="w-[180px]">
                <Users className="h-4 w-4 mr-2 text-purple-500" />
                <SelectValue placeholder="All Instructors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instructors</SelectItem>
                {filterOptions.instructors.map((instructor) => (
                  <SelectItem key={instructor} value={instructor}>
                    {instructor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="All Years" />
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

      <div className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <Card
              key={certificate.id}
              className="p-6 space-y-3 flex flex-col justify-between hover:shadow-lg transition-all duration-200"
            >
              <div className="space-y-2">
                {/* TRAINING NAME at the very top */}
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">
                  <BookOpen className="inline h-5 w-5 mr-2 text-blue-600" />
                  {certificate.course_title}
                </h3>

                {/* Issued Date (from certificates table's issue_date) */}
                {certificate.issue_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Issued: {formatDate(certificate.issue_date)}</span>
                  </div>
                )}
                {/* Course Completion Date (newly named certificate_issued_at) */}
                {certificate.certificate_issued_at &&
                  certificate.certificate_issued_at !== "N/A" && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>
                        Completed On:{" "}
                        {formatDate(certificate.certificate_issued_at)}
                      </span>
                    </div>
                  )}
                {/* Level */}
                {certificate.course_level !== "General" && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Level: {certificate.course_level}</span>
                  </div>
                )}
                {/* Instructor Name */}
                {certificate.instructor_name && (
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>Instructor: {certificate.instructor_name}</span>
                  </p>
                )}

                {/* Duration */}
                {certificate.duration_hours > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {certificate.duration_hours} hours</span>
                  </div>
                )}
                {/* Certificate Number (formerly Code) */}
                {certificate.certificate_number && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Hash className="h-4 w-4" />
                    <span>No: {certificate.certificate_number}</span>
                  </div>
                )}
                {/* Student Name */}
                {certificate.student_name && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                    <UserRound className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      Student: {certificate.student_name}
                    </span>
                  </p>
                )}
                {/* Skills Learned */}
                {certificate.skills_learned &&
                  certificate.skills_learned.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2">
                      <Tag className="h-4 w-4" />
                      <span className="font-medium">Skills:</span>
                      {certificate.skills_learned.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
              </div>

              {/* View and Download buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => viewCertificateInNewTab(certificate)}
                  disabled={viewingCertId === certificate.id}
                >
                  {viewingCertId === certificate.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      View Certificate
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadCertificate(certificate);
                  }}
                  disabled={downloadingCertId === certificate.id}
                  className="w-full"
                >
                  {downloadingCertId === certificate.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

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
  );
}
