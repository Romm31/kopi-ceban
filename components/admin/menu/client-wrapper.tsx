"use client"

import { useState, useEffect } from "react"
import { Menu, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Search, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MenuForm } from "./menu-form"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/ui/empty-state"
import { Coffee } from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuClientWrapperProps {
    data: Menu[]
    editMenu: Menu | null
}

export function MenuClientWrapper({ data, editMenu }: MenuClientWrapperProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
    const debouncedSearch = useDebounce(searchTerm, 500)
    const [availableOnly, setAvailableOnly] = useState(searchParams.get("available") === "true")

    // Sync dialog open state with editMenu presence or manual toggle
    useEffect(() => {
        if (editMenu) {
            setOpen(true)
        }
    }, [editMenu])

    // Handle Search & Filter
    useEffect(() => {
         const current = new URLSearchParams(Array.from(searchParams.entries()));
         
         if (debouncedSearch) {
             current.set("q", debouncedSearch);
         } else {
             current.delete("q");
         }

         if (availableOnly) {
             current.set("available", "true");
         } else {
             current.delete("available");
         }

         const search = current.toString();
         const query = search ? `?${search}` : "";

         router.push(`/admin/menu${query}`);
    }, [debouncedSearch, availableOnly, router, searchParams]);


    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            // Remove edit param when closing
            const current = new URLSearchParams(Array.from(searchParams.entries()));
            current.delete("edit");
            const search = current.toString();
            const query = search ? `?${search}` : "";
            router.push(`/admin/menu${query}`);
        }
    }

    const handleSuccess = () => {
        setOpen(false)
        router.refresh()
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.delete("edit");
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`/admin/menu${query}`);
    }

    const clearFilters = () => {
        setSearchTerm("")
        setAvailableOnly(false)
    }

    const hasFilters = searchTerm || availableOnly

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                 <div className="flex flex-1 items-center space-x-2">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search menu..."
                            className="bg-white/5 border-white/10 pl-9 w-full focus-visible:ring-coffee-gold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-md px-3 py-2 h-10">
                         <Switch 
                            id="available-mode" 
                            checked={availableOnly}
                            onCheckedChange={setAvailableOnly}
                            className="data-[state=checked]:bg-coffee-gold"
                         />
                         <Label htmlFor="available-mode" className="text-sm text-muted-foreground cursor-pointer">Available</Label>
                    </div>
                    {hasFilters && (
                        <Button variant="ghost" onClick={clearFilters} className="h-10 px-2 lg:px-3 text-muted-foreground hover:text-white">
                            Reset
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                 </div>

                 <Button 
                    onClick={() => setOpen(true)} 
                    className="bg-coffee-gold text-coffee-black hover:bg-coffee-gold/90 font-bold shadow-[0_0_15px_rgba(201,161,109,0.3)] transition-all hover:shadow-[0_0_20px_rgba(201,161,109,0.5)]"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Menu
                </Button>
            </div>

            <div className="rounded-xl border border-white/10 shadow-sm bg-coffee-black/40 backdrop-blur-sm overflow-hidden">
                {data.length > 0 ? (
                    <DataTable columns={columns} data={data} searchKey="name" showSearch={false} showColumnsToggle={false} />
                ) : (
                    <EmptyState 
                        icon={Coffee}
                        title="No menu found"
                        description={hasFilters ? "Try adjusting your filters to find what you're looking for." : "Get started by creating a new menu item."}
                        action={
                            !hasFilters && (
                                <Button onClick={() => setOpen(true)} variant="outline" className="border-coffee-gold text-coffee-gold hover:bg-coffee-gold hover:text-coffee-black">
                                    Create Menu Item
                                </Button>
                            )
                        }
                    />
                )}
            </div>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[600px] bg-coffee-black border-white/10 text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-coffee-cream">{editMenu ? "Edit Menu" : "Add New Menu"}</DialogTitle>
                        <DialogDescription>
                            {editMenu ? "Update the menu details below." : "Fill in the details to create a new menu item."}
                        </DialogDescription>
                    </DialogHeader>
                    <MenuForm 
                        initialData={editMenu ? {
                            ...editMenu,
                            description: editMenu.description || undefined,
                            imageUrl: editMenu.imageUrl || undefined,
                        } : null} 
                        onSuccess={handleSuccess} 
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
