import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { ArrowLeft, CreditCard, User, Box } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OrderTimeline } from "@/components/admin/orders/order-timeline"
import { StatusBadge } from "@/components/ui/status-badge"
import { SyncOrderButton } from "@/components/admin/orders/sync-order-button"

export const dynamic = 'force-dynamic'

// Type for items stored in JSON
interface OrderItem {
  menuId: number
  name: string
  price: number
  quantity: number
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  if (!id) {
    notFound()
  }

  const orderData = await prisma.order.findUnique({
    where: { id },
  })

  if (!orderData) {
    notFound()
  }

  // Cast to include new fields
  const order = orderData as typeof orderData & {
    orderType?: string;
    tableNumber?: number | null;
  }

  // Parse items from JSON
  const orderItems = (order.items as unknown as OrderItem[]) || []

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
                   <h2 className="text-2xl font-bold tracking-tight text-coffee-cream">Order #{order.orderCode}</h2>
                   <p className="text-sm text-muted-foreground flex items-center gap-2">
                       Placed on {format(order.createdAt, "dd MMMM yyyy, HH:mm")}
                   </p>
               </div>
          </div>
          <div className="flex items-center gap-3">
               <StatusBadge status={order.status} className="text-base px-4 py-1.5" />
               <SyncOrderButton orderCode={order.orderCode} />
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
                    {orderItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-lg bg-white/10 overflow-hidden border border-white/10 flex-shrink-0 flex items-center justify-center">
                                    <span className="text-coffee-gold font-bold text-lg">
                                        {item.name.substring(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground text-lg">{item.name}</p>
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
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Order Code</span>
                         <span className="font-mono text-sm text-muted-foreground">{order.orderCode}</span>
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Order Type</span>
                        <div className="flex items-center gap-2">
                            {order.orderType === "DINE_IN" ? (
                                <>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-700/30 text-green-300 border border-green-500/30">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Dine In
                                    </span>
                                    {order.tableNumber && (
                                        <span className="px-2.5 py-1 text-sm font-bold rounded-lg bg-green-900/50 text-green-200 border border-green-600/30">
                                            Meja {order.tableNumber}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-700/30 text-blue-300 border border-blue-500/30">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Take Away
                                </span>
                            )}
                        </div>
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
