import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { OrderStatus } from "@prisma/client"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { Download } from "lucide-react"

export const dynamic = 'force-dynamic'

interface HistoryPageProps {
  searchParams: Promise<{
    status?: string
    startDate?: string
    endDate?: string
    search?: string
  }>
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const { status, startDate, endDate, search } = await searchParams

  const where: any = {
    status: {
      in: ["COMPLETED", "CANCELLED"]
    }
  }

  if (status && status !== "ALL") {
    where.status = status as OrderStatus
  }

  if (startDate && endDate) {
     where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
     }
  }

  if (search) {
     where.customerName = {
        contains: search,
        mode: 'insensitive'
     }
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  // Summary Stats (Month to date by default or filtered?)
  // Requirement: "Total pendapatan bulan ini" (Explicitly "bulan ini", not filtered range)
  const startOfCurrentMonth = startOfMonth(new Date())
  const endOfCurrentMonth = endOfMonth(new Date())

  const monthlyStats = await prisma.order.aggregate({
     _sum: { totalPrice: true },
     _count: { _all: true },
     where: {
        status: "COMPLETED",
        createdAt: {
           gte: startOfCurrentMonth,
           lte: endOfCurrentMonth
        }
     }
  })

  const cancelledMonth = await prisma.order.count({
     where: {
        status: "CANCELLED",
        createdAt: {
           gte: startOfCurrentMonth,
           lte: endOfCurrentMonth
        }
     }
  })

  // Build Export URL
  const exportUrl = new URLSearchParams()
  if (status) exportUrl.set("status", status)
  if (startDate) exportUrl.set("startDate", startDate)
  if (endDate) exportUrl.set("endDate", endDate)
  if (search) exportUrl.set("search", search)
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transaction History</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
         <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-muted-foreground">Monthly Revenue</h3>
            <div className="text-2xl font-bold mt-2">Rp {monthlyStats._sum.totalPrice?.toLocaleString() || 0}</div>
         </div>
         <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-muted-foreground">Monthly Completed</h3>
            <div className="text-2xl font-bold mt-2">{monthlyStats._count._all || 0} Orders</div>
         </div>
         <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-muted-foreground">Monthly Cancelled</h3>
            <div className="text-2xl font-bold mt-2 text-red-500">{cancelledMonth} Orders</div>
         </div>
      </div>

      {/* Filter & Export */}
      <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-4 rounded-lg border">
         <form className="flex-1 w-full grid gap-4 grid-cols-1 md:grid-cols-4">
             <div className="space-y-1">
                <label className="text-sm font-medium">Search</label>
                <Input name="search" placeholder="Customer name" defaultValue={search} />
             </div>
             <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <select name="status" defaultValue={status || "ALL"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                   <option value="ALL">All History</option>
                   <option value="COMPLETED">Completed</option>
                   <option value="CANCELLED">Cancelled</option>
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-sm font-medium">Start Date</label>
                <Input name="startDate" type="date" defaultValue={startDate} />
             </div>
             <div className="space-y-1">
                <label className="text-sm font-medium">End Date</label>
                <div className="flex gap-2">
                   <Input name="endDate" type="date" defaultValue={endDate} />
                   <Button type="submit">Filter</Button>
                </div>
             </div>
         </form>
         <div className="pb-0">
             <a href={`/api/history/export?${exportUrl.toString()}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                   <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
             </a>
         </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Date Completed</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono">#{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>Rp {order.totalPrice.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={order.status === 'CANCELLED' ? 'destructive' : 'default'}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(order.createdAt, "dd MMM yyyy, HH:mm")}</TableCell>
                <TableCell>{format(order.updatedAt, "dd MMM yyyy, HH:mm")}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline" size="sm">Details</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  No history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
