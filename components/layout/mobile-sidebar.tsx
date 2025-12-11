"use client"

import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import AdminSidebar from "./AdminSidebar"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export const MobileSidebar = () => {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (!isMounted) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden text-primary hover:bg-accent hover:text-foreground">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-sidebar border-r border-border w-72">
        <AdminSidebar />
      </SheetContent>
    </Sheet>
  )
}
