"use client"

import { useState, useEffect } from "react"
import { Menu, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MenuForm } from "./menu-form"
import { useRouter, useSearchParams } from "next/navigation"

interface MenuClientWrapperProps {
    data: Menu[]
    editMenu: Menu | null
}

export function MenuClientWrapper({ data, editMenu }: MenuClientWrapperProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)

    // Sync dialog open state with editMenu presence or manual toggle
    useEffect(() => {
        if (editMenu) {
            setOpen(true)
        }
    }, [editMenu])

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            // Remove edit param when closing
            router.push("/admin/menu")
        }
    }

    const handleSuccess = () => {
        setOpen(false)
        router.push("/admin/menu")
        router.refresh()
    }

    return (
        <>
            <div className="flex justify-end">
                 <Button onClick={() => setOpen(true)} className="bg-coffee-gold text-coffee-black hover:bg-coffee-gold/80 font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Add Menu
                </Button>
            </div>

            <DataTable columns={columns} data={data} searchKey="name" />

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[600px] bg-coffee-black border-white/10 text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-coffee-cream">{editMenu ? "Edit Menu" : "Add New Menu"}</DialogTitle>
                        <DialogDescription>
                            {editMenu ? "Update the menu details below." : "Fill in the details to create a new menu item."}
                        </DialogDescription>
                    </DialogHeader>
                    <MenuForm initialData={editMenu} onSuccess={handleSuccess} />
                </DialogContent>
            </Dialog>
        </>
    )
}
