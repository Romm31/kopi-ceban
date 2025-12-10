import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { OrderStatusUpdate } from "@/components/admin/orders/order-status-update"
import { ArrowLeft, Clock,  CreditCard, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  
  if (!id || isNaN(parseInt(id))) {
      notFound()
  }

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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="shrink-0 text-muted-foreground hover:text-coffee-gold">
                <Link href="/admin/orders">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight text-coffee-cream">Order #{order.id}</h2>
        </div>
        <div className="flex items-center gap-2">
            <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4">
             {/* Order Items */}
             <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-coffee-cream">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-md bg-white/10 overflow-hidden relative">
                                    {/* Ideally Image component here if menu.imageUrl exists */}
                                    {item.menu.imageUrl && (
                                        <img src={item.menu.imageUrl} alt={item.menu.name} className="object-cover h-full w-full" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{item.menu.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} x {new Intl.NumberFormat("id-ID").format(item.price)}</p>
                                </div>
                            </div>
                            <div className="font-semibold text-coffee-gold">
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.price * item.quantity)}
                            </div>
                        </div>
                    ))}
                </CardContent>
             </Card>
             
             {/* Notes */}
             {order.notes && (
                 <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground">{order.notes}</p>
                    </CardContent>
                 </Card>
             )}
        </div>

        <div className="col-span-3 space-y-4">
            {/* Customer Details */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-coffee-cream flex items-center gap-2">
                        <User className="h-4 w-4" /> Customer Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{order.customerName}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Time</span>
                        <span className="font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(order.createdAt, "dd MMM yyyy, HH:mm")}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-coffee-cream flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Payment Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.totalPrice)}</span>
                    </div>
                    <Separator className="bg-white/10 my-2" />
                    <div className="flex justify-between font-bold text-lg text-coffee-gold">
                        <span>Total</span>
                        <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.totalPrice)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
