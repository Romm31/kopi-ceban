"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { OrderStatus } from "@prisma/client"
import Link from "next/link"

export type HistoryOrder = {
  id: number
  customerName: string
  totalPrice: number
  status: OrderStatus
  createdAt: Date
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
  PROCESSING: "bg-blue-500/20 text-blue-500 border-blue-500/50",
  READY: "bg-green-500/20 text-green-500 border-green-500/50",
  COMPLETED: "bg-green-500/20 text-green-500 border-green-500/50", // Use green for completed/ready
  CANCELLED: "bg-red-500/20 text-red-500 border-red-500/50",
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
            className="hover:text-coffee-gold hover:bg-transparent px-0"
          >
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({ row }) => <span className="font-medium text-foreground">{row.getValue("customerName")}</span>
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-coffee-gold hover:bg-transparent px-0"
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

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as OrderStatus
      return (
        <Badge variant={status === "CANCELLED" ? "destructive" : "default"} className={`${statusColors[status]}`}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-coffee-gold hover:bg-transparent px-0"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({ row }) => {
        return <span className="text-xs text-muted-foreground">{format(row.getValue("createdAt"), "dd MMM yyyy HH:mm")}</span>
    }
  },
  {
      id: "actions",
      cell: ({ row }) => {
          return (
              <Button asChild variant="ghost" size="icon" className="hover:text-coffee-gold hover:bg-white/5">
                  <Link href={`/admin/orders/${row.original.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
              </Button>
          )
      }
  }
]
