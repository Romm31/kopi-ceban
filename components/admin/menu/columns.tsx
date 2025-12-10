"use client"

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
            <Avatar className="h-10 w-10 rounded-md">
                <AvatarImage src={imageUrl || ""} alt={name} className="object-cover" />
                <AvatarFallback className="rounded-md bg-white/10 text-xs">{name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
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
          className="hover:text-coffee-gold hover:bg-transparent px-0"
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
                <span className="font-medium">{row.getValue("name")}</span>
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
            className="hover:text-coffee-gold hover:bg-transparent px-0"
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

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "isAvailable",
    header: "Status",
    cell: ({ row }) => {
      const isAvailable = row.getValue("isAvailable")
      return (
        <Badge variant={isAvailable ? "default" : "destructive"} className={isAvailable ? "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/50" : "bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50"}>
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
      // const router = useRouter() // Re-fetching will be handled by Server Action revalidatePath. But we might want to trigger local update if needed. 
      // Actually actions props usage needs to be carefully handled in table cell.

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

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-coffee-gold">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-coffee-black border-white/10">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(menu.id.toString())}
              className="focus:bg-white/10 focus:text-coffee-gold"
            >
              Copy Menu ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
                // We'll handle edit via the Sheet or Dialog in the main page, or navigation. 
                // For now, let's assume we navigate or open a modal.
                // We'll configure the main page to handle this via URL params or state.
                // Using a custom event or callback context is cleaner but for simplicity lets use a query param approach or pass a handler? 
                // Table doesn't easily accept props.
                // Simplest: Edit button triggers a specialized Action or link.
                // Or: We expose an Edit button that sets a global store or query param.
                onClick={() => window.location.href = `/admin/menu?edit=${menu.id}`}
                className="focus:bg-white/10 focus:text-coffee-gold cursor-pointer"
            >
             <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer" disabled={isPending}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
