// "use client"

// import type React from "react"

// import { useAuth } from "@/hooks/use-auth"
// import { LoadingSpinner } from "@/components/loading-spinner"
// import { useEffect } from "react"
// import { useRouter } from "next/navigation"

// interface AuthGuardProps {
//   children: React.ReactNode
//   requireAuth?: boolean
//   allowedRoles?: string[]
//   redirectTo?: string
// }

// export function AuthGuard({ children, requireAuth = false, allowedRoles = [], redirectTo = "/login" }: AuthGuardProps) {
//   const { user, loading, isAuthenticated } = useAuth()
//   const router = useRouter()

//   useEffect(() => {
//     if (!loading) {
//       if (requireAuth && !isAuthenticated) {
//         router.push(redirectTo)
//         return
//       }

//       if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
//         // Redirect to appropriate dashboard based on role
//         switch (user.role) {
//           case "admin":
//             router.push("/admin/dashboard")
//             break
//           case "instructor":
//             router.push("/instructor/dashboard")
//             break
//           default:
//             router.push("/dashboard")
//         }
//         return
//       }
//     }
//   }, [loading, isAuthenticated, user, requireAuth, allowedRoles, redirectTo, router])

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner />
//       </div>
//     )
//   }

//   if (requireAuth && !isAuthenticated) {
//     return null
//   }

//   if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
//     return null
//   }

//   return <>{children}</>
// }
"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "student" | "instructor" | "admin"
  redirectTo?: string
}

export function AuthGuard({ children, requiredRole, redirectTo = "/login" }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo)
        return
      }

      if (requiredRole && user.role !== requiredRole) {
        // Redirect based on user role
        switch (user.role) {
          case "admin":
            router.push("/admin/dashboard")
            break
          case "instructor":
            router.push("/instructor/dashboard")
            break
          case "student":
            router.push("/dashboard")
            break
          default:
            router.push("/login")
        }
        return
      }
    }
  }, [user, loading, requiredRole, router, redirectTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
