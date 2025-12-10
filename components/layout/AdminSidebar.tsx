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
    <div className="space-y-4 py-4 flex flex-col h-full bg-coffee-dark border-r border-coffee-gold/10 text-coffee-cream">
      <div className="px-3 py-2 flex-1">
        <Link href="/admin/dashboard" className="flex items-center pl-3 mb-14 transition-opacity hover:opacity-80">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coffee-gold to-coffee-dark mr-3 flex items-center justify-center ring-1 ring-coffee-gold/50">
             <span className="text-lg">☕</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-coffee-cream to-coffee-gold bg-clip-text text-transparent">
            Kopi Ceban
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.02]",
                pathname === route.href 
                    ? "text-coffee-black bg-gradient-to-r from-coffee-gold to-[#B8860B] shadow-lg shadow-coffee-gold/20 font-bold" 
                    : "text-muted-foreground hover:text-coffee-gold hover:bg-white/10"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href ? "text-coffee-black" : "text-coffee-gold")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-4 border-t border-coffee-gold/10">
          <div className="bg-gradient-to-br from-coffee-gold/10 to-transparent p-4 rounded-xl border border-coffee-gold/20">
             <h3 className="text-coffee-gold font-semibold text-xs uppercase tracking-wider mb-2">Pro Tip</h3>
             <p className="text-xs text-muted-foreground">Check pending orders frequently to ensure fast service.</p>
          </div>
      </div>
    </div>
  )
}
