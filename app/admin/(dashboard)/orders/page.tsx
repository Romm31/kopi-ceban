import { prisma } from "@/lib/prisma"
import { OrderClientWrapper } from "@/components/admin/orders/client-wrapper"

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-coffee-cream">Orders</h2>
          <p className="text-muted-foreground">
            Monitor and manage customer orders in real-time.
          </p>
        </div>
      </div>
      <OrderClientWrapper data={orders} />
    </div>
  )
}
