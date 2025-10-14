"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Camera, Save, Key, Trash2, Eye, EyeOff } from "lucide-react";

// --- NEW: A helper function to get the auth token ---
const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  // Try localStorage first (your app seems to use "auth_token")
  const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
  // fallback to cookie (if you store token in cookie)
  if (token) return token;
  // simple cookie parse
  const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};


export default function StudentProfilePage() {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "Student at BBMI Academy",
    avatar: "/placeholder.svg",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: "Student at BBMI Academy",
        avatar: user.profile_picture || "/placeholder.svg",
      });
    }
  }, [user]);

  // --- NEW: A more robust error handler ---
  const handleApiError = async (response: Response) => {
    if (response.headers.get("Content-Type")?.includes("application/json")) {
      const errorData = await response.json();
      return errorData.error || "An unknown error occurred.";
    }
    return `Server returned a non-JSON response with status ${response.status}.`;
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // ... file validation checks ...

    setIsUploadingImage(true);
    const token = getAuthToken(); // Use helper
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", user.id.toString());

      const response = await fetch("/api/profile/upload-image", {
        method: "POST",
        // UPDATED: Added Authorization header
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      const data = await response.json();
      if (data.success) {
        await refreshUser();
        toast({ title: "Profile picture updated" });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!user) return;
    const token = getAuthToken(); // Use helper
    try {
      const response = await fetch("/api/profile/delete-image", {
        method: "DELETE",
        // UPDATED: Added Authorization header
        headers: { Authorization: `Bearer ${token}` },
        // REMOVED: body: JSON.stringify({ userId: user.id })
      });

      // if (!response.ok) {
      //   throw new Error(await handleApiError(response));
      // }
      const data = await response.json(); // This can now be a simple check
      if (response.ok && data.success) {
        await refreshUser();
        toast({ title: "Profile picture removed" });
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsUpdatingProfile(true);
    const token = getAuthToken(); // Use helper
    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        // UPDATED: Added Authorization header
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          bio: profile.bio,
        }),
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      const data = await response.json();
      if (data.success) {
        await refreshUser();
        toast({ title: "Profile updated" });
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    // ... password validation checks ...

    setChangingPassword(true);
    const token = getAuthToken(); // Use helper
    try {
      const response = await fetch("/api/profile/change-password", {
        method: "PUT",
        // UPDATED: Added Authorization header
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      const data = await response.json();
      if (data.success) {
        toast({ title: "Password changed successfully" });
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        throw new Error(data.error || "Failed to change password");
      }
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    // --- UPDATED: Matched the layout and padding of the Billing page ---
    <div className="space-y-6 px-6 pt-6 pb-8 pl-16 lg:pl-6">
      {/* --- UPDATED: Added the DashboardHeader component --- */}
      <DashboardHeader
        heading="My Profile"
        text="Manage your personal information and security settings."
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details and profile picture.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={profile.avatar || "/placeholder.svg"}
                    alt={profile.name}
                  />
                  <AvatarFallback>
                    {profile.name
                      ?.split(" ")
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
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {isUploadingImage ? "Uploading..." : "Change Photo"}
                  </Button>
                  {profile.avatar &&
                    !profile.avatar.includes("placeholder.svg") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteImage}
                        className="text-red-600 hover:text-red-700"
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
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <Button
                onClick={handleProfileUpdate}
                disabled={isUpdatingProfile}
                className="bg-custom-copper hover:bg-custom-copper-dark text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={changingPassword}
              >
                <Key className="h-4 w-4 mr-2" />
                {changingPassword ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
