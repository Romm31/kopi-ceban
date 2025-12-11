import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { OrderStatusUpdate } from "@/components/admin/orders/order-status-update"
import { ArrowLeft, Clock, CreditCard, User, Box, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/admin/page-header"
import { OrderTimeline } from "@/components/admin/orders/order-timeline"
import { StatusBadge } from "@/components/ui/status-badge"

export const dynamic = 'force-dynamic'

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
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
               <Button variant="outline" size="icon" asChild className="shrink-0 bg-white/5 border-white/10 hover:bg-white/10 hover:text-coffee-gold">
                    <Link href="/admin/orders">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
               </Button>
               <div>
                   <h2 className="text-2xl font-bold tracking-tight text-coffee-cream">Order #{order.id}</h2>
                   <p className="text-sm text-muted-foreground flex items-center gap-2">
                       Placed on {format(order.createdAt, "dd MMMM yyyy, HH:mm")}
                   </p>
               </div>
          </div>
          <div className="flex items-center gap-3">
               <StatusBadge status={order.status} className="text-base px-4 py-1.5" />
               <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
          </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-6">
             {/* Timeline */}
             <Card className="bg-white/5 border-white/10">
                 <CardHeader>
                     <CardTitle className="text-base font-semibold text-coffee-cream">Order Status</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <OrderTimeline currentStatus={order.status} />
                 </CardContent>
             </Card>

             {/* Order Items */}
             <Card className="bg-white/5 border-white/10 overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/10">
                    <CardTitle className="text-base font-semibold text-coffee-cream flex items-center gap-2">
                        <Box className="h-4 w-4" /> Order Items
                    </CardTitle>
                </CardHeader>
                <div className="divide-y divide-white/10">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-lg bg-white/10 overflow-hidden border border-white/10 flex-shrink-0">
                                    {item.menu.imageUrl ? (
                                        <img src={item.menu.imageUrl} alt={item.menu.name} className="object-cover h-full w-full" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-coffee-secondary text-coffee-gold font-bold">
                                            {item.menu.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground text-lg">{item.menu.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} x {new Intl.NumberFormat("id-ID").format(item.price)}</p>
                                </div>
                            </div>
                            <div className="font-bold text-coffee-gold text-lg">
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.price * item.quantity)}
                            </div>
                        </div>
                    ))}
                </div>
             </Card>
             
             {/* Notes */}
             {order.notes && (
                 <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold text-coffee-cream flex items-center gap-2">
                             <MessageSquare className="h-4 w-4" /> Customer Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground p-4 bg-white/5 rounded-md border border-white/10 italic">"{order.notes}"</p>
                    </CardContent>
                 </Card>
             )}
        </div>

        <div className="md:col-span-4 space-y-6">
            {/* Customer Details */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader className="bg-white/5 border-b border-white/10">
                    <CardTitle className="text-base font-semibold text-coffee-cream flex items-center gap-2">
                        <User className="h-4 w-4" /> Customer Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Name</span>
                        <span className="font-medium text-lg">{order.customerName}</span>
                    </div>
                    <Separator className="bg-white/10" />
                     <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Order ID</span>
                         <span className="font-mono text-sm text-muted-foreground">#{order.id}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader className="bg-white/5 border-b border-white/10">
                    <CardTitle className="text-base font-semibold text-coffee-cream flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Payment Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>Rp 0</span>
                    </div>
                    <Separator className="bg-white/10 my-2" />
                    <div className="flex justify-between font-bold text-xl text-coffee-gold">
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
