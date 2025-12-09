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
import { format } from "date-fns"

export const dynamic = 'force-dynamic'

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string
    search?: string
  }>
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { status, search } = await searchParams
  
  const where: any = {}
  
  if (status && status !== "ALL") {
    where.status = status as OrderStatus
  }
  
  if (search) {
    where.customerName = {
      contains: search,
      mode: 'insensitive',
    }
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  // Status Badge Color Helper
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'default' // black
      case 'PROCESSING': return 'secondary' // gray
      case 'READY': return 'warning' // we need a custom variant, but lets use outline or something. 
      // Actually Shadcn badge variants are limited. Let's stick to default/secondary/drestructive/outline.
      case 'COMPLETED': return 'default' // green-ish in logic but here basic
      case 'CANCELLED': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>

      <div className="flex gap-4">
         <form className="flex-1 flex gap-2">
            <Input 
              name="search" 
              placeholder="Search customer name..." 
              defaultValue={search} 
              className="max-w-sm"
            />
            <Button type="submit" variant="secondary">Search</Button>
         </form>
         <div className="flex gap-2">
            {['ALL', ...Object.values(OrderStatus)].map(s => (
               <Link key={s} href={`/admin/orders?status=${s}`}>
                  <Button variant={status === s || (!status && s === 'ALL') ? "default" : "outline"} size="sm">
                    {s}
                  </Button>
               </Link>
            ))}
         </div>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
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
                  <Badge variant={order.status === 'CANCELLED' ? 'destructive' : order.status === 'PENDING' ? 'secondary' : 'default'}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(order.createdAt, "dd MMM yyyy, HH:mm")}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline" size="sm">Details</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
