"use client"

import AdminSidebar from "@/components/layout/AdminSidebar"
import AdminNavbar from "@/components/layout/AdminNavbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
          <AdminSidebar />
      </div>
      <main className="md:pl-72 h-full bg-gray-50 text-gray-900"> 
        <AdminNavbar />
        <div className="p-8 h-[calc(100vh-4rem)] overflow-y-auto">
            {children}
        </div>
      </main>
    </div>
  )
}
