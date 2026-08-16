import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { AdminRouteGuard } from "@/components/admin/admin-route-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-ivory">
      <AdminSidebar className="h-full" />
      <main className="flex-1 overflow-y-auto p-6">
        <AdminRouteGuard>
          {children}
          <Toaster />
        </AdminRouteGuard>
      </main>
    </div>
  )
}
