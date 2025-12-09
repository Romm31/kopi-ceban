import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import OrderStatusForm from "@/components/form/OrderStatusForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      items: {
        include: {
          menu: true,
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order #{order.id}</h1>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-500 mr-2">Status:</span>
           <OrderStatusForm orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date:</span>
              <span className="font-medium">{format(order.createdAt, "dd MMM yyyy, HH:mm")}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="font-medium">{format(order.updatedAt, "dd MMM yyyy, HH:mm")}</span>
            </div>
            <div className="flex flex-col gap-1 mt-4">
              <span className="text-muted-foreground">Notes:</span>
              <p className="text-sm bg-gray-50 p-2 rounded border min-h-[40px]">
                {order.notes || "No notes"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle>Order Summary</CardTitle>
          </CardHeader>
             <CardContent className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                   <span>Total Price:</span>
                   <span>Rp {order.totalPrice.toLocaleString()}</span>
                </div>
             </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
           <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                 <TableRow>
                    <TableHead>Menu</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {order.items.map((item) => (
                    <TableRow key={item.id}>
                       <TableCell>{item.menu.name}</TableCell>
                       <TableCell>Rp {item.price.toLocaleString()}</TableCell>
                       <TableCell>{item.quantity}</TableCell>
                       <TableCell className="text-right font-medium">
                          Rp {(item.price * item.quantity).toLocaleString()}
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  )
}
