import { prisma } from "@/lib/prisma"
import { OrderClientWrapper } from "@/components/admin/orders/client-wrapper"
import { PageHeader } from "@/components/admin/page-header"
import { OrderStatus } from "@prisma/client"
import { Suspense } from "react"
import { OrdersLoader } from "@/components/admin/orders/orders-loader"

export const dynamic = 'force-dynamic'

export default async function OrdersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const status = typeof searchParams.status === 'string' ? searchParams.status as OrderStatus : undefined
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined

  const where: any = {}

  if (status && status !== 'ALL' as any) { // 'ALL' isn't in OrderStatus, but client might send it
      where.status = status
  }

  if (q) {
      where.customerName = { contains: q, mode: 'insensitive' }
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex-1 flex flex-col min-h-screen p-6 md:p-8 space-y-6">
       <PageHeader 
          title="Orders" 
          description="Manage incoming and past orders." 
       />

       <div className="flex-1 rounded-xl border border-white/10 bg-coffee-black/40 backdrop-blur-sm p-4 overflow-hidden flex flex-col">
            <Suspense fallback={<OrdersLoader />}>
                <OrderClientWrapper data={orders} />
            </Suspense>
       </div>
    </div>
  )
}
