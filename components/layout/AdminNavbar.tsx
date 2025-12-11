"use client"

import { User, LogOut, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import { motion } from "framer-motion"

import { MobileSidebar } from "@/components/layout/mobile-sidebar"

export default function AdminNavbar() {
  const { data: session } = useSession()

  return (
    <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 border-b border-border h-16 flex items-center px-4 md:px-6 bg-background/80 backdrop-blur-md"
    >
        <MobileSidebar />
        <div className="flex items-center gap-2 lg:hidden text-primary font-bold ml-2">
            <Coffee className="h-5 w-5" />
            <span>Kopi Ceban</span>
        </div>
      <div className="ml-auto flex items-center space-x-4">
        <span className="text-sm font-medium text-foreground hidden md:block">
          Welcome, {session?.user?.name || "Barista"}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary transition-all">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                 <User className="h-5 w-5 text-primary" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-popover border-border text-foreground" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-primary">{session?.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">Admin Access</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => signOut()} className="focus:bg-destructive/10 focus:text-destructive cursor-pointer text-destructive/90">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}
