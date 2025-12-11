"use client"

import AdminSidebar from "@/components/layout/AdminSidebar"
import AdminNavbar from "@/components/layout/AdminNavbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-coffee-black relative">
      {/* Sidebar - Fixed */}
      <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50 border-r border-coffee-gold/10 bg-coffee-black">
          <AdminSidebar />
      </div>
      
      {/* Main Content */}
      <main className="md:pl-72 flex flex-col min-h-screen"> 
        <AdminNavbar />
        {/* Content Region - flex-1 ensures it grows */}
        <div className="flex-1 flex flex-col w-full">
            {children}
        </div>
      </main>
    </div>
  )
}
