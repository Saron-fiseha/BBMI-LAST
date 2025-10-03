// "use client";

// import type React from "react";

// import { useState } from "react";
// import { DashboardSidebar } from "./dashboard-sidebar";
// import { Button } from "@/components/ui/button";
// import { Menu } from "lucide-react";

// interface DashboardLayoutProps {
//   children: React.ReactNode;
// }

// export function DashboardLayout({ children }: DashboardLayoutProps) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-background flex">
//       {/* Mobile menu button */}
//       <div className="lg:hidden fixed top-4 left-4 z-50">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => setSidebarOpen(true)}
//         >
//           <Menu className="h-4 w-4" />
//         </Button>
//       </div>

//       <DashboardSidebar
//         open={sidebarOpen}
//         onOpenChange={setSidebarOpen}
//         className="fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0"
//       />

//       <div className="flex-1 flex flex-col min-w-0">
//         <main className="flex-1 overflow-auto bg-gray-50/50">{children}</main>
//       </div>

//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }
"use client";

import type React from "react";

import { useState } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile menu button:
          - Visible only on screens smaller than 'lg' breakpoint (`lg:hidden`).
          - Visible only when the sidebar is NOT open (`!sidebarOpen`).
          - Positioned fixed at the top-left for easy access.
      */}
      {!sidebarOpen && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dashboard Sidebar */}
      {/* 
          - On mobile (default): `fixed inset-y-0 left-0 z-40 w-64` positions it as an off-canvas sidebar.
          - `transform transition-transform duration-200 ease-in-out` enables smooth slide animations.
          - On desktop (`lg` breakpoint and above): 
            - `lg:translate-x-0` ensures it's always visible.
            - `lg:static lg:inset-0 lg:flex-shrink-0` makes it part of the normal document flow, 
              occupying space and preventing it from shrinking, effectively making it a permanent sidebar.
          - The `open` prop passed to `DashboardSidebar` is crucial for its internal logic 
            to show/hide itself on mobile via `transform` (e.g., `translate-x-[-100%]` when closed).
      */}
      <DashboardSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        className="fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0"
      />

      {/* Main Content Area */}
      {/* `flex-1` makes the main content take up all available horizontal space */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto bg-gray-50/50">{children}</main>
      </div>

      {/* Mobile sidebar overlay: 
          - Visible only when the sidebar is open (`sidebarOpen`).
          - Visible only on screens smaller than 'lg' (`lg:hidden`).
          - Creates a dark, translucent overlay to obscure main content and allow closing on click.
      */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
