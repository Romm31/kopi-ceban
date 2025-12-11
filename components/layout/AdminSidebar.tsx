"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Coffee, ShoppingBag, History, User } from "lucide-react"
import { cn } from "@/lib/utils"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    label: "Menu",
    icon: Coffee,
    href: "/admin/menu",
  },
  {
    label: "Orders",
    icon: ShoppingBag,
    href: "/admin/orders",
  },
  {
    label: "History",
    icon: History,
    href: "/admin/history",
  },
  {
    label: "Profile",
    icon: User,
    href: "/admin/profile",
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="px-4 py-6 flex-1">
        <Link href="/admin/dashboard" className="flex items-center pl-2 mb-10 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-yellow-600 mr-3 flex items-center justify-center shadow-lg shadow-sidebar-primary/20 group-hover:shadow-sidebar-primary/40 transition-all duration-300">
             <Coffee className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-sidebar-foreground tracking-wide group-hover:text-sidebar-primary transition-colors">
              Kopi Ceban
            </h1>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Admin Panel</span>
          </div>
        </Link>
        <div className="space-y-1.5">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-300 ease-out relative overflow-hidden",
                pathname === route.href 
                    ? "text-sidebar-primary-foreground bg-gradient-to-r from-sidebar-primary to-[#d4a857] shadow-lg shadow-sidebar-primary/10 font-bold translate-x-1" 
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-1"
              )}
            >
                {pathname === route.href && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href ? "text-coffee-black" : "text-coffee-gold")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="bg-gradient-to-br from-sidebar-primary/10 to-transparent p-4 rounded-xl border border-sidebar-primary/20">
             <h3 className="text-sidebar-primary font-semibold text-xs uppercase tracking-wider mb-2">Pro Tip</h3>
             <p className="text-xs text-muted-foreground">Check pending orders frequently to ensure fast service.</p>
          </div>
      </div>
    </div>
  )
}
