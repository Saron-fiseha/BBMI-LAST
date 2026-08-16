"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  BookOpen,
  GraduationCap,
  PlayCircle,
  UserCheck,
  UserX,
  Settings,
  Home,
  Briefcase, // 1. Import the Briefcase icon
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const sidebarItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "User Accounts",
    href: "/admin/users",
    icon: Users,
  },
  // {
  //   title: "Project Creation",
  //   href: "/admin/projects",
  //   icon: FolderOpen,
  // },
  {
    title: "Training Categories",
    href: "/admin/categories",
    icon: BookOpen,
  },
  {
    title: "Trainings",
    href: "/admin/trainings",
    icon: GraduationCap,
  },
  {
    title: "Modules",
    href: "/admin/modules",
    icon: PlayCircle,
  },
  {
    title: "Students",
    href: "/admin/students",
    icon: UserCheck,
  },
  {
    title: "Instructors",
    href: "/admin/instructors",
    icon: UserX,
  },
  {
    title: "Promotion",
    href: "/admin/portfolio",
    icon: Briefcase,
  },
  {
    title: "Profile",
    href: "/admin/profile",
    icon: Settings,
  },
]

interface AdminSidebarProps {
  className?: string
}

import { useEffect, useState } from "react"
import { ShieldAlert } from "lucide-react"
import { jwtDecode } from "jwt-decode"

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUser(decoded)
      } catch (e) {
        console.error("Invalid token")
      }
    }
  }, [])

  // Filter sidebar items based on user privileges
  const filteredItems = sidebarItems.filter((item) => {
    if (!user) return false
    if (user.is_super_admin) return true
    
    // Always show Home and Profile
    if (item.title === "Home" || item.title === "Profile") return true

    // Check specific privileges for sub-admins
    const privileges = user.privileges || []
    switch (item.title) {
      case "Dashboard": return privileges.includes("view_dashboard")
      case "User Accounts": return privileges.includes("view_user_management")
      case "Training Categories": return privileges.includes("view_categories")
      case "Trainings": return privileges.includes("view_trainings")
      case "Modules": return privileges.includes("view_modules")
      case "Students": return privileges.includes("view_students")
      case "Instructors": return privileges.includes("view_instructors")
      case "Promotion": return privileges.includes("view_promotion")
      default: return false
    }
  })

  // Insert Role Management for Super Admin
  if (user?.is_super_admin) {
    const promotionIndex = filteredItems.findIndex(i => i.title === "Promotion")
    if (promotionIndex !== -1) {
      filteredItems.splice(promotionIndex + 1, 0, {
        title: "Role Management",
        href: "/admin/role-management",
        icon: ShieldAlert,
      })
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col pb-12 h-full overflow-y-auto bg-charcoal border-r border-mustard/20 w-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]", className)}>
        <div className="space-y-4 py-4 flex-1">
          <div className="px-2 py-2">
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center rounded-lg p-3 text-sm font-medium hover:bg-mustard/20 hover:text-mustard transition-colors",
                        pathname === item.href ? "bg-mustard/20 text-mustard" : "text-ivory/80",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-charcoal text-ivory border-mustard/20">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}