"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { ShieldAlert, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAccess = () => {
      const token = localStorage.getItem("auth_token") || document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
      
      if (!token) {
        setIsAuthorized(false)
        return
      }

      try {
        const decoded: any = jwtDecode(token)
        
        if (decoded.is_super_admin) {
          setIsAuthorized(true)
          return
        }

        const privileges = decoded.privileges || []
        
        // Define route requirements
        const requirements: Record<string, string> = {
          "/admin/dashboard": "view_dashboard",
          "/admin/users": "view_user_management",
          "/admin/categories": "view_categories",
          "/admin/trainings": "view_trainings",
          "/admin/modules": "view_modules",
          "/admin/students": "view_students",
          "/admin/instructors": "view_instructors",
          "/admin/portfolio": "view_promotion",
        }

        // Exact match or sub-paths
        let requiredPrivilege = null
        for (const route in requirements) {
          if (pathname.startsWith(route)) {
            requiredPrivilege = requirements[route]
            break
          }
        }

        if (pathname.startsWith("/admin/role-management") && !decoded.is_super_admin) {
          setIsAuthorized(false)
          return
        }

        if (requiredPrivilege && !privileges.includes(requiredPrivilege)) {
          setIsAuthorized(false)
        } else {
          setIsAuthorized(true)
        }
      } catch (e) {
        setIsAuthorized(false)
      }
    }

    checkAccess()
  }, [pathname])

  if (isAuthorized === null) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-mustard" />
      </div>
    )
  }

  if (isAuthorized === false) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-gray-50 p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-sm border border-red-100">
          <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You do not have the required privileges to view this page. If you believe this is an error, please contact a super administrator.
          </p>
          <Button 
            onClick={() => router.push("/admin/dashboard")}
            className="bg-charcoal text-ivory hover:bg-charcoal/90 w-full"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
