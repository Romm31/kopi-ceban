"use client"

import AdminSidebar from "@/components/layout/AdminSidebar"
import AdminNavbar from "@/components/layout/AdminNavbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background relative overflow-x-hidden">
      {/* Sidebar - Fixed Desktop */}
      <div className="hidden lg:flex h-screen w-72 flex-col fixed inset-y-0 z-50 border-r border-border bg-sidebar">
          <AdminSidebar />
      </div>
      
      {/* Main Content */}
      <main className="lg:pl-72 flex flex-col min-h-screen w-full">
        <AdminNavbar />
        {/* Content Region - flex-1 ensures it grows */}
        <div className="flex-1 flex flex-col w-full">
            {children}
        </div>
      </main>
    </div>
  )
}
