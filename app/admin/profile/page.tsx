"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Camera, Save, Key, Shield, Trash2, Eye, EyeOff } from "lucide-react"

export default function AdminProfilePage() {
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
   const [changingPassword, setChangingPassword] = useState(false)
 
  const [profile, setProfile] = useState({
    name: user?.full_name || "Administrator",
    email: user?.email || "sarifiseha0961test@gmail.com",
    phone: user?.phone || "0961872397",
    bio: "System Administrator for Glamour Academy Beauty Learning Management System",
    avatar: user?.profile_picture || "/placeholder.svg?height=100&width=100",
  })

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30,
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("userId", user?.id?.toString() || "")

      const response = await fetch("/api/admin/profile/upload-image", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setProfile((prev) => ({ ...prev, avatar: data.imageUrl }))
        await refreshUser() // Refresh user data to update header
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
        })
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Image upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteImage = async () => {
    try {
      const response = await fetch("/api/admin/profile/delete-image", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id }),
      })

      const data = await response.json()

      if (data.success) {
        setProfile((prev) => ({ ...prev, avatar: "/placeholder.svg?height=100&width=100" }))
        await refreshUser() // Refresh user data to update header
        toast({
          title: "Profile picture removed",
          description: "Your profile picture has been removed successfully.",
        })
      } else {
        throw new Error(data.error || "Delete failed")
      }
    } catch (error) {
      console.error("Image delete error:", error)
      toast({
        title: "Delete failed",
        description: "Failed to remove profile picture. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch("/api/admin/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          bio: profile.bio,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await refreshUser() // Refresh user data
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated successfully.",
        })
      } else {
        throw new Error(data.error || "Update failed")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwords.new.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setChangingPassword(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to change your password.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Password changed",
          description: "Your password has been updated successfully.",
        })
        setPasswords({
          current: "",
          new: "",
          confirm: "",
        })
        console.log("✅ Password changed successfully")
      } else {
        const error = await response.json()
         console.error("Password change error:", error)
        toast({
          title: "Password change failed",
          description: error.error || "Failed to change password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: "Failed to change password.",
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSecurityUpdate = () => {
    toast({
      title: "Security settings updated",
      description: "Your security preferences have been saved.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-gray-600">Manage your personal information and security settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="password">Password & Security</TabsTrigger>
          {/* <TabsTrigger value="preferences">Preferences</TabsTrigger> */}
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                  <AvatarFallback>
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage}>
                    <Camera className="h-4 w-4 mr-2" />
                    {isUploadingImage ? "Uploading..." : "Change Photo"}
                  </Button>
                  {profile.avatar !== "/placeholder.svg?height=100&width=100" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteImage}
                      className="text-red-600 hover:text-red-700 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Photo
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <Button onClick={handleProfileUpdate}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <div className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e: { target: { value: any } }) => setPasswords({ ...passwords, current: e.target.value })}
                />
                 <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("current")}
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
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
                 <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("new")}
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
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="pr-10"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
              </div>
              </div>
              <Button onClick={handlePasswordChange} disabled={changingPassword}>
                <Key className="h-4 w-4 mr-2" />
                {changingPassword ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {security.twoFactorEnabled ? "Disable" : "Enable"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {security.loginNotifications ? "Disable" : "Enable"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })}
                  />
                </div>
                <Button onClick={handleSecurityUpdate}>
                  <Shield className="h-4 w-4 mr-2" />
                  Update Security Settings
                </Button>
              </CardContent>
            </Card> */}
          </div>
        </TabsContent>

        {/* <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Customize your admin panel experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Light
                  </Button>
                  <Button variant="outline" size="sm">
                    Dark
                  </Button>
                  <Button variant="outline" size="sm">
                    System
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <select className="w-full p-2 border rounded">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <select className="w-full p-2 border rounded">
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC-6 (Central Time)</option>
                  <option>UTC-7 (Mountain Time)</option>
                  <option>UTC-8 (Pacific Time)</option>
                </select>
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  )
}
