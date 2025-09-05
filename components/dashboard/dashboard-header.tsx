"use client"

import type React from "react"

import { Bell, User, Settings, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"; 


interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

interface Notification {
  id: number
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at: string
  related_id?: number
  related_type?: string
  metadata?: any
  link?: string;
}

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   fetchNotifications();
  //   // Set up polling for new notifications every 30 seconds
  //   const interval = setInterval(fetchNotifications, 30000)
  //   return () => clearInterval(interval)
  // }, [user])

  // const fetchNotifications = async () => {
  //   if (!user) return
  const fetchNotifications = useCallback(async () => {
    // This check is crucial. If there's no user, we don't fetch.
    if (!user) {
      // Clear notifications if user logs out
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true); 


    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token") // Adjust based on your auth implementation

      const response = await fetch("/api/notifications?limit=10", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } else {
        console.error("Failed to fetch notifications:", response.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [user]);
useEffect(() => {
    fetchNotifications(); // Fetch immediately on load/user change

    const interval = setInterval(fetchNotifications, 30000); // Poll with the fresh function
    
    return () => clearInterval(interval); // Cleanup
  }, [fetchNotifications]);

   const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if it's unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate if a link exists
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const markAsRead = async (notificationId: number) => {
    if (!user) return

    try {
      const token = localStorage.getItem("auth_token") // Adjust based on your auth implementation

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Update local state
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } else {
        console.error("Failed to mark notification as read:", response.statusText)
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const getDashboardLink = () => {
    if (!user) return "/dashboard"

    switch (user.role) {
      case "admin":
        return "/admin/dashboard"
      case "instructor":
        return "/instructor/dashboard"
      default:
        return "/dashboard"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "🎉"
      case "warning":
        return "⚠️"
      case "error":
        return "❌"
      default:
        return "ℹ️"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="relative bg-transparent" disabled={loading}>
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex flex-col items-start p-3 cursor-pointer ${
                      !notification.read ? "bg-blue-50 dark:bg-blue-950" : ""
                    }`}
                    // onClick={() => !notification.read && markAsRead(notification.id)}
                     onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(notification.created_at)}</p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
              )}
            </div>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem asChild>
              <Link href="/dashboard/notifications" className="w-full text-center">
                View all notifications
              </Link>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.profile_picture || "/placeholder.svg?height=64&width=64"}
                  alt={user?.full_name || "Student"}
                />
                <AvatarFallback className="bg-gradient-to-r from-amber-400 to-amber-600 text-white font-semibold">
                  {user?.full_name?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="absolute -bottom-1 -right-1 h-4 w-4 bg-white rounded-full p-0.5 border border-gray-200" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.full_name || "Student"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || "student@example.com"}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-xs leading-none text-amber-600 capitalize font-medium">
                    {user?.role || "student"}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={getDashboardLink()} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {children}
      </div>
    </div>
  )
}
