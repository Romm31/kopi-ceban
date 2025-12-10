"use client"

import AdminSidebar from "@/components/layout/AdminSidebar"
import AdminNavbar from "@/components/layout/AdminNavbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full relative bg-coffee-black">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] border-r border-coffee-gold/10">
          <AdminSidebar />
      </div>
      <main className="md:pl-72 h-full"> 
        <AdminNavbar />
        {/* Removed overflow-y-auto restricted height to allow full page detail and scroll */}
        <div className="p-0 h-full">
            {children}
        </div>
      </main>
    </div>
  )
}
