import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-ivory">
      <AdminSidebar className="h-full" />
      <main className="flex-1 overflow-y-auto p-6">{children}<Toaster /></main>
    </div>
  )
}
