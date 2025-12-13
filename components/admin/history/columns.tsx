"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { OrderStatus } from "@prisma/client"
import Link from "next/link"
import { StatusBadge } from "@/components/ui/status-badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export type HistoryOrder = {
  id: string
  customerName: string
  totalPrice: number
  status: OrderStatus
  createdAt: Date
}

export const columns: ColumnDef<HistoryOrder>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">#{row.getValue("id")}</span>
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-coffee-gold hover:bg-transparent px-0 font-semibold"
          >
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({ row }) => <span className="font-bold text-coffee-cream">{row.getValue("customerName")}</span>
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-coffee-gold hover:bg-transparent px-0 font-semibold"
          >
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalPrice"))
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
      }).format(amount)

      return <div className="font-medium text-coffee-gold">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <StatusBadge status={row.getValue("status")} />
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-coffee-gold hover:bg-transparent px-0 font-semibold"
          >
            Finished At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({ row }) => {
        return <span className="text-xs text-muted-foreground">{format(row.getValue("createdAt"), "dd MMM yyyy, HH:mm")}</span>
    }
  },
  {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original
          
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-coffee-gold">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-coffee-black border-white/10">
              <DropdownMenuLabel className="text-coffee-cream">Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                  <Link href={`/admin/orders/${order.id}`} className="cursor-pointer focus:bg-white/10 focus:text-coffee-gold w-full flex items-center">
                      <Eye className="mr-2 h-4 w-4" /> View Details
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                    navigator.clipboard.writeText(order.id.toString())
                    toast.success("Order ID copied")
                }}
                className="cursor-pointer focus:bg-white/10 focus:text-coffee-gold"
              >
                Copy Order ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
  }
]
