"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "My Courses",
    href: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    title: "Certificates",
    href: "/dashboard/certificates",
    icon: FileText,
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
  },
  // {
  //   title: "Billing",
  //   href: "/dashboard/billing",
  //   icon: CreditCard,
  // },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

interface DashboardSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function DashboardSidebar({
  open,
  onOpenChange,
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div
      className={cn(
        "pb-12 min-h-screen bg-background border-r flex flex-col",
        className
      )}
    >
      <div className="space-y-4 py-4 px-2 lg:px-4">
        {/* Logo and Brand */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Brushed by Betty"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm bg-gradient-to-r from-custom-copper to-custom-tan hover:bg-warm-brown bg-clip-text text-transparent">
                  Brushed by Betty
                </span>
                <span className="text-xs text-muted-foreground">
                  Student Portal
                </span>
              </div>
            </Link>
            {open && onOpenChange && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="px-3 py-2 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-custom-copper to-custom-tan hover:bg-warm-brown flex items-center justify-center text-white font-semibold">
              {user?.full_name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.full_name || "Student"}
              </p>
              <p className="text-xs text-muted-foreground">Student</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-white"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>

        <div className="px-3 py-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start",
                  pathname === item.href
                    ? "bg-soft-cream text-custom-tan-100 hover:bg-soft-cream dark:bg-soft-cream dark:text-amber-100"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
