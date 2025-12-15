"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, MoreHorizontal, UtensilsCrossed, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { OrderStatus } from "@prisma/client"
import { updateOrderStatus } from "@/app/actions/orders"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Link from "next/link"
import { StatusBadge } from "@/components/ui/status-badge"

export type Order = {
  id: string
  customerName: string
  totalPrice: number
  status: OrderStatus
  createdAt: Date
  orderType?: string
  tableNumber?: number | null
}

// Order Type Badge Component
function OrderTypeBadge({ orderType, tableNumber }: { orderType?: string; tableNumber?: number | null }) {
  if (orderType === "DINE_IN") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-green-700/30 text-green-300 border border-green-500/30">
          <UtensilsCrossed className="w-3 h-3" />
          Dine In
        </span>
        {tableNumber && (
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-900/50 text-green-200 border border-green-600/30">
            Meja {tableNumber}
          </span>
        )}
      </div>
    )
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-700/30 text-blue-300 border border-blue-500/30">
      <ShoppingBag className="w-3 h-3" />
      Take Away
    </span>
  )
}

export const columns: ColumnDef<Order>[] = [
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
            className="hover:text-primary hover:bg-transparent px-0 font-semibold"
          >
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({ row }) => <span className="font-bold text-foreground">{row.getValue("customerName")}</span>
  },
  {
    accessorKey: "orderType",
    header: "Order Type",
    cell: ({ row }) => {
      const order = row.original
      return <OrderTypeBadge orderType={order.orderType} tableNumber={order.tableNumber} />
    },
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-primary hover:bg-transparent px-0 font-semibold"
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

      return <div className="font-bold text-primary">{formatted}</div>
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
    header: "Date",
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
                <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuLabel className="text-foreground">Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link href={`/admin/orders/${order.id}`} className="cursor-pointer focus:bg-accent focus:text-primary w-full flex items-center">
                        <Eye className="mr-2 h-4 w-4" /> View Details
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                      navigator.clipboard.writeText(order.id.toString())
                      toast.success("Order ID copied")
                  }}
                  className="cursor-pointer focus:bg-accent focus:text-primary"
                >
                  Copy Order ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
      }
  }
]
