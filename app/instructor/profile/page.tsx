"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Camera,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Eye,
  EyeOff,
  Award,
  BookOpen,
  MapPin,
  Calendar,
  Upload,
  User,
  Shield,
  Star,
  Users,
  DollarSign,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { InstructorLayout } from "@/components/instructor/instructor-layout"

interface InstructorProfile {
  id: string
  name: string
  email: string
  phone: string
  position: string
  bio: string
  profile_picture: string
  cover_photo: string
  specialization: string
  experience_years: number
  location: string
  specialties: string[]
  certifications: string[]
  achievements: string[]
  social_links: {
    email?: string
    instagram?: string
    facebook?: string
    linkedin?: string
    twitter?: string
  }
  stats: {
    total_courses: number
    total_students: number
    average_rating: number
    total_earnings: number
  }
}

export default function InstructorProfilePage() {
  const [profile, setProfile] = useState<InstructorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<InstructorProfile>>({})
  const [newSpecialty, setNewSpecialty] = useState("")
  const [newCertification, setNewCertification] = useState("")
  const [newAchievement, setNewAchievement] = useState("")
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [uploadingImage, setUploadingImage] = useState<"profile" | "cover" | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const profileImageRef = useRef<HTMLInputElement>(null)
  const coverImageRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token") // Fixed: using correct token key
      if (!token) {
        toast.error("No authentication token found")
        return
      }

      const response = await fetch("/api/instructor/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Profile data:", data) // Debug log
        setProfile(data)
        setFormData(data)
      } else {
        const errorData = await response.json()
        console.error("Profile fetch error:", errorData)
        toast.error(errorData.error || "Failed to load profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      errors.name = "Full name is required"
    }

    if (!formData.position?.trim()) {
      errors.position = "Position/title is required"
    }

    if (!formData.bio?.trim()) {
      errors.bio = "Biography is required"
    } else if (formData.bio.length < 50) {
      errors.bio = "Biography should be at least 50 characters"
    }

    if (formData.experience_years !== undefined && formData.experience_years < 0) {
      errors.experience_years = "Experience years cannot be negative"
    }

    // Validate social media URLs
    const urlPattern = /^https?:\/\/.+/
    if (formData.social_links?.instagram && !urlPattern.test(formData.social_links.instagram)) {
      errors.instagram = "Please enter a valid Instagram URL"
    }
    if (formData.social_links?.facebook && !urlPattern.test(formData.social_links.facebook)) {
      errors.facebook = "Please enter a valid Facebook URL"
    }
    if (formData.social_links?.linkedin && !urlPattern.test(formData.social_links.linkedin)) {
      errors.linkedin = "Please enter a valid LinkedIn URL"
    }
    if (formData.social_links?.twitter && !urlPattern.test(formData.social_links.twitter)) {
      errors.twitter = "Please enter a valid Twitter URL"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors before saving")
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem("auth_token") // Fixed: using correct token key

      console.log("Saving profile data:", formData) // Debug log

      const response = await fetch("/api/instructor/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const responseData = await response.json()
      console.log("Save response:", responseData) // Debug log

      if (response.ok) {
        toast.success("Profile updated successfully")
        setEditing(false)
        setFormErrors({})
        await fetchProfile() // Refresh the profile data
      } else {
        console.error("Save error:", responseData)
        toast.error(responseData.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (type: "profile" | "cover", file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or GIF)")
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB")
      return
    }

    try {
      setUploadingImage(type)
      const token = localStorage.getItem("auth_token") // Fixed: using correct token key

      const formData = new FormData()
      formData.append("image", file)
      formData.append("type", type)

      const response = await fetch("/api/instructor/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`${type === "profile" ? "Profile" : "Cover"} photo updated successfully`)

        // Update the form data with the new image URL
        setFormData((prev) => ({
          ...prev,
          [type === "profile" ? "profile_picture" : "cover_photo"]: result.imageUrl,
        }))

        // If not in editing mode, also update the profile state
        if (!editing) {
          setProfile((prev) =>
            prev
              ? {
                  ...prev,
                  [type === "profile" ? "profile_picture" : "cover_photo"]: result.imageUrl,
                }
              : null,
          )
        }
      } else {
        toast.error(result.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(null)
    }
  }

  const handlePasswordChange = async () => {
    // Validate passwords
    if (!passwordData.currentPassword) {
      toast.error("Current password is required")
      return
    }

    if (!passwordData.newPassword) {
      toast.error("New password is required")
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    try {
      setChangingPassword(true)
      const token = localStorage.getItem("auth_token") // Fixed: using correct token key

      const response = await fetch("/api/instructor/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        toast.success("Password changed successfully")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        toast.error(responseData.error || "Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error("Failed to change password")
    } finally {
      setChangingPassword(false)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData({
        ...formData,
        specialties: [...(formData.specialties || []), newSpecialty.trim()],
      })
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (index: number) => {
    setFormData({
      ...formData,
      specialties: formData.specialties?.filter((_, i) => i !== index) || [],
    })
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData({
        ...formData,
        certifications: [...(formData.certifications || []), newCertification.trim()],
      })
      setNewCertification("")
    }
  }

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications?.filter((_, i) => i !== index) || [],
    })
  }

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData({
        ...formData,
        achievements: [...(formData.achievements || []), newAchievement.trim()],
      })
      setNewAchievement("")
    }
  }

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements?.filter((_, i) => i !== index) || [],
    })
  }

  if (loading) {
    return (
      <InstructorLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Profile</h1>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </InstructorLayout>
    )
  }

  if (!profile) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load profile</p>
        </div>
      </InstructorLayout>
    )
  }

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile Management</h1>
            <p className="text-muted-foreground">Manage your instructor profile and settings</p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false)
                    setFormData(profile)
                    setFormErrors({})
                  }}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Cover Photo and Profile Picture */}
        <Card>
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative overflow-hidden">
              {(editing ? formData.cover_photo : profile.cover_photo) && (
                <img
                  src={(editing ? formData.cover_photo : profile.cover_photo) || "/placeholder.svg"}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20" />

              <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4"
                onClick={() => coverImageRef.current?.click()}
                disabled={uploadingImage === "cover"}
              >
                {uploadingImage === "cover" ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Cover
                  </>
                )}
              </Button>

              <input
                ref={coverImageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload("cover", file)
                }}
              />
            </div>

            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background">
                  <AvatarImage
                    src={(editing ? formData.profile_picture : profile.profile_picture) || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                  onClick={() => profileImageRef.current?.click()}
                  disabled={uploadingImage === "profile"}
                >
                  {uploadingImage === "profile" ? (
                    <Upload className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>

                <input
                  ref={profileImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload("profile", file)
                  }}
                />
              </div>
            </div>
          </div>

          <CardContent className="pt-20">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {profile.position || profile.specialization || "Beauty Instructor"}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {profile.location || "Location not specified"}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {profile.experience_years} years of experience
                  </p>
                </div>

                {/* Stats */}
                {/* <div className="grid grid-cols-2 gap-4 text-center"> */}
                <div className="grid grid-cols-3 gap-4 text-center">
  <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
    <BookOpen className="h-6 w-6 text-blue-600 mb-1" />
    <div className="text-2xl font-bold text-blue-600">{profile.stats.total_courses}</div>
    <div className="text-sm text-muted-foreground">Courses</div>
  </div>
  <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
    <Users className="h-6 w-6 text-green-600 mb-1" />
    <div className="text-2xl font-bold text-green-600">{profile.stats.total_students}</div>
    <div className="text-sm text-muted-foreground">Students</div>
  </div>
  <div className="flex flex-col items-center p-3 bg-yellow-50 rounded-lg">
    <Star className="h-6 w-6 text-yellow-600 mb-1" />
    <div className="text-2xl font-bold text-yellow-600">{profile.stats.average_rating}</div>
    <div className="text-sm text-muted-foreground">Rating</div>
  </div>
</div>

                  {/* <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600 mb-1" />
                    <div className="text-2xl font-bold text-purple-600">
                      ${profile.stats.total_earnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Earnings</div>
                  </div> */}
                {/* </div> */}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Professional
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={editing ? formData.name || "" : profile.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!editing}
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editing ? formData.phone || "" : profile.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!editing}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Title *</Label>
                    <Input
                      id="position"
                      value={editing ? formData.position || "" : profile.position || ""}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      disabled={!editing}
                      placeholder="e.g., Senior Beauty Instructor"
                      className={formErrors.position ? "border-red-500" : ""}
                    />
                    {formErrors.position && <p className="text-sm text-red-500">{formErrors.position}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editing ? formData.location || "" : profile.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!editing}
                      placeholder="e.g., New York, NY"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={editing ? formData.experience_years || "" : profile.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                      disabled={!editing}
                      min="0"
                      max="50"
                      className={formErrors.experience_years ? "border-red-500" : ""}
                    />
                    {formErrors.experience_years && (
                      <p className="text-sm text-red-500">{formErrors.experience_years}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biography *</Label>
                  <Textarea
                    id="bio"
                    value={editing ? formData.bio || "" : profile.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!editing}
                    className={`min-h-[120px] ${formErrors.bio ? "border-red-500" : ""}`}
                    placeholder="Tell us about yourself, your experience, and what makes you passionate about teaching... (minimum 50 characters)"
                  />
                  <div className="flex justify-between items-center">
                    {formErrors.bio && <p className="text-sm text-red-500">{formErrors.bio}</p>}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {(editing ? formData.bio?.length : profile.bio?.length) || 0} characters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-6">
            {/* Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>Specialties & Expertise</CardTitle>
                <CardDescription>Areas where you have specialized knowledge and skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(editing ? formData.specialties : profile.specialties)?.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {specialty}
                      {editing && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeSpecialty(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  ))}
                  {(!editing ? profile.specialties : formData.specialties)?.length === 0 && (
                    <p className="text-muted-foreground">No specialties added yet</p>
                  )}
                </div>
                {editing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new specialty (e.g., Makeup Artistry, Skincare)"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addSpecialty()
                        }
                      }}
                    />
                    <Button size="sm" onClick={addSpecialty} disabled={!newSpecialty.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <CardDescription>Professional certifications and qualifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {(editing ? formData.certifications : profile.certifications)?.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-yellow-50">
                      <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <span className="flex-1">{cert}</span>
                      {editing && (
                        <Button size="sm" variant="ghost" onClick={() => removeCertification(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {(!editing ? profile.certifications : formData.certifications)?.length === 0 && (
                    <p className="text-muted-foreground">No certifications added yet</p>
                  )}
                </div>
                {editing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new certification (e.g., Certified Beauty Therapist)"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addCertification()
                        }
                      }}
                    />
                    <Button size="sm" onClick={addCertification} disabled={!newCertification.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Notable accomplishments and recognition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {(editing ? formData.achievements : profile.achievements)?.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-blue-50">
                      <Award className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="flex-1">{achievement}</span>
                      {editing && (
                        <Button size="sm" variant="ghost" onClick={() => removeAchievement(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {(!editing ? profile.achievements : formData.achievements)?.length === 0 && (
                    <p className="text-muted-foreground">No achievements added yet</p>
                  )}
                </div>
                {editing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new achievement (e.g., Winner of Beauty Excellence Award 2023)"
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addAchievement()
                        }
                      }}
                    />
                    <Button size="sm" onClick={addAchievement} disabled={!newAchievement.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Connect your social media profiles to showcase your work and connect with students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-link" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contact Email
                    </Label>
                    <Input
                      id="email-link"
                      type="email"
                      placeholder="your.contact@example.com"
                      value={editing ? formData.social_links?.email || "" : profile.social_links?.email || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, email: e.target.value },
                        })
                      }
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      placeholder="https://instagram.com/yourusername"
                      value={editing ? formData.social_links?.instagram || "" : profile.social_links?.instagram || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, instagram: e.target.value },
                        })
                      }
                      disabled={!editing}
                      className={formErrors.instagram ? "border-red-500" : ""}
                    />
                    {formErrors.instagram && <p className="text-sm text-red-500">{formErrors.instagram}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="flex items-center gap-2">
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      placeholder="https://facebook.com/yourusername"
                      value={editing ? formData.social_links?.facebook || "" : profile.social_links?.facebook || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, facebook: e.target.value },
                        })
                      }
                      disabled={!editing}
                      className={formErrors.facebook ? "border-red-500" : ""}
                    />
                    {formErrors.facebook && <p className="text-sm text-red-500">{formErrors.facebook}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/yourusername"
                      value={editing ? formData.social_links?.linkedin || "" : profile.social_links?.linkedin || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, linkedin: e.target.value },
                        })
                      }
                      disabled={!editing}
                      className={formErrors.linkedin ? "border-red-500" : ""}
                    />
                    {formErrors.linkedin && <p className="text-sm text-red-500">{formErrors.linkedin}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      placeholder="https://twitter.com/yourusername"
                      value={editing ? formData.social_links?.twitter || "" : profile.social_links?.twitter || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, twitter: e.target.value },
                        })
                      }
                      disabled={!editing}
                      className={formErrors.twitter ? "border-red-500" : ""}
                    />
                    {formErrors.twitter && <p className="text-sm text-red-500">{formErrors.twitter}</p>}
                  </div>
                </div>

                {!editing && (
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      Social media links help students connect with you and see your work. Make sure your profiles are
                      professional and showcase your expertise.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password for security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter your current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={
                      changingPassword ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword
                    }
                  >
                    {changingPassword ? "Changing Password..." : "Change Password"}
                  </Button>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Password requirements:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>At least 8 characters long</li>
                      <li>Include uppercase and lowercase letters</li>
                      <li>Include at least one number</li>
                      <li>Include at least one special character</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </InstructorLayout>
  )
}
