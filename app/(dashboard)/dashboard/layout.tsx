import type React from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children} <Toaster /></DashboardLayout>
}
