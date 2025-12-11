"use client"

import { cn } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { deleteMenu } from "@/app/actions/menu"
import { useTransition } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export type Menu = {
  id: number
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

export const columns: ColumnDef<Menu>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
        const imageUrl = row.getValue("imageUrl") as string
        const name = row.getValue("name") as string
        return (
            <div className="h-10 w-10 rounded-md overflow-hidden bg-sidebar-accent border border-border">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="object-cover h-full w-full" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-xs font-bold text-primary">
                        {name.substring(0, 2).toUpperCase()}
                    </div>
                )}
            </div>
        )
    }
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-primary hover:bg-transparent px-0 font-semibold"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const description = row.original.description
        return (
            <div className="flex flex-col">
                <span className="font-medium text-foreground">{row.getValue("name")}</span>
                {description && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{description}</span>}
            </div>
        )
    }
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-primary hover:bg-transparent px-0 font-semibold"
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
      }).format(amount)

      return <div className="font-medium text-foreground">{formatted}</div>
    },
  },
  {
    accessorKey: "isAvailable",
    header: "Status",
    cell: ({ row }) => {
      const isAvailable = row.getValue("isAvailable")
      return (
        <Badge 
            variant={isAvailable ? "success" : "destructive"}
        >
          {isAvailable ? "Available" : "Unavailable"}
        </Badge>
      )
    },
  },
  {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
          return <span className="text-xs text-muted-foreground">{format(row.getValue("createdAt"), "dd MMM yyyy")}</span>
      }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const menu = row.original
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isPending, startTransition] = useTransition()
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter() // Use router hook correctly

      const handleDelete = () => {
          if(!confirm("Are you sure you want to delete this menu?")) return;
          
          startTransition(async () => {
              try {
                  await deleteMenu(menu.id)
                  toast.success("Menu deleted successfully")
              } catch (error) {
                  toast.error("Failed to delete menu")
                  console.error(error)
              }
          })
      }

      const handleEdit = () => {
          const current = new URLSearchParams(window.location.search);
          current.set("edit", menu.id.toString());
          router.push(`/admin/menu?${current.toString()}`);
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuLabel className="text-foreground">Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                  navigator.clipboard.writeText(menu.id.toString())
                  toast.success("ID Copied")
              }}
              className="focus:bg-accent focus:text-primary"
            >
              Copy Menu ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem 
                onClick={handleEdit}
                className="focus:bg-accent focus:text-primary cursor-pointer"
            >
             <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer" disabled={isPending}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
