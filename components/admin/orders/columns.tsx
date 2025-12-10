"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Link as LinkIcon, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { OrderStatus } from "@prisma/client"
import { updateOrderStatus } from "@/app/actions/orders"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"

export type Order = {
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
  COMPLETED: "bg-gray-500/20 text-gray-500 border-gray-500/50",
  CANCELLED: "bg-red-500/20 text-red-500 border-red-500/50",
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-mono text-xs">#{row.getValue("id")}</span>
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => <span className="font-bold text-coffee-cream">{row.getValue("customerName")}</span>
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
      const order = row.original
      
      const handleStatusChange = async (value: string) => {
          try {
              await updateOrderStatus(order.id, value as OrderStatus)
              toast.success(`Order #${order.id} status updated to ${value}`)
          } catch (error) {
              toast.error("Failed to update status")
              console.error(error)
          }
      }

      return (
        <Select defaultValue={order.status} onValueChange={handleStatusChange}>
            <SelectTrigger className={`w-[130px] h-8 border-transparent focus:ring-0 focus:ring-offset-0 ${statusColors[order.status]}`}>
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-coffee-black border-white/10 text-foreground">
                {Object.keys(statusColors).map((status) => (
                    <SelectItem key={status} value={status} className="focus:bg-white/10 focus:text-coffee-gold cursor-pointer">
                        {status}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
        return <span className="text-xs text-muted-foreground">{format(row.getValue("createdAt"), "dd MMM HH:mm")}</span>
    }
  },
  {
      id: "actions",
      cell: ({ row }) => {
          return (
              <Button asChild variant="ghost" size="icon" className="hover:text-coffee-gold hover:bg-white/5">
                  <Link href={`/admin/orders/${row.original.id}`}>
                    <LinkIcon className="h-4 w-4" />
                  </Link>
              </Button>
          )
      }
  }
]
