import { prisma } from "@/lib/prisma"
import { HistoryClientWrapper } from "@/components/admin/history/client-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingBag, XCircle, TrendingUp } from "lucide-react"
import { startOfMonth, subMonths, endOfDay, startOfDay, parseISO } from "date-fns"
import { PageHeader } from "@/components/admin/page-header"
import { Suspense } from "react"
import { HistoryLoader } from "@/components/admin/history/history-loader"
import { OrderStatus } from "@prisma/client"

export const dynamic = 'force-dynamic'

export default async function HistoryPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const status = typeof searchParams.status === 'string' ? searchParams.status as OrderStatus : undefined
  const from = typeof searchParams.from === 'string' ? searchParams.from : undefined
  const to = typeof searchParams.to === 'string' ? searchParams.to : undefined
  
  const now = new Date()
  const currentMonthStart = startOfMonth(now)

  // Build Where Clause
  const where: any = {
      status: { in: ["PAID", "CANCELLED"] as any }
  }

  if (status && status !== 'ALL' as any) {
      where.status = status
  }

  if (from && to) {
      where.createdAt = {
          gte: startOfDay(parseISO(from)),
          lte: endOfDay(parseISO(to))
      }
  }
  
  // Fetch Analytics Data (Independent of filters mostly, usually shows "This Month" or "Total")
  // Let's make the cards show "This Month" stats always for consistency, or we could make them reactive to filters?
  // Usually Dashboard Stats are "Current Snapshot". Let's keep them as "This Month" for now to match the UI labels.
  
  const [
      totalRevenue,
      totalOrders,
      canceledOrders,
      menuStats
  ] = await Promise.all([
      // Total Revenue This Month
      prisma.order.aggregate({
          _sum: { totalPrice: true },
          where: {
              status: "PAID" as any,
              createdAt: { gte: currentMonthStart }
          }
      }),
      // Total Completed Orders This Month
      prisma.order.count({
          where: {
              status: "PAID" as any,
              createdAt: { gte: currentMonthStart }
          }
      }),
      // Canceled Orders This Month
      prisma.order.count({
          where: {
              status: "CANCELLED",
              createdAt: { gte: currentMonthStart }
          }
      }),
      // Best Selling Menu (In-Memory Aggregation from Orders)
      prisma.order.findMany({
          where: {
              status: "PAID" as any,
              createdAt: { gte: currentMonthStart }
          },
          select: { items: true }
      })
  ])

  let bestSellingMenuName = "N/A"
  let bestSellingMenuQty = 0

  // Calculate Best Seller from menuStats (which is now a list of orders with items)
  const itemCounts: Record<string, number> = {}
  
  // menuStats here is actually the result of the 4th promise
  const paidOrdersForStats = menuStats as any[] 

  paidOrdersForStats.forEach(order => {
      const items = order.items as any[]
      if (Array.isArray(items)) {
          items.forEach(item => {
              if (item.menuId) {
                  itemCounts[item.menuId] = (itemCounts[item.menuId] || 0) + (item.quantity || 0)
              }
          })
      }
  })

  let bestMenuId = ""
  let maxQty = 0

  Object.entries(itemCounts).forEach(([id, qty]) => {
      if (qty > maxQty) {
          maxQty = qty
          bestMenuId = id
      }
  })

  if (bestMenuId) {
      const menu = await prisma.menu.findUnique({ where: { id: parseInt(bestMenuId) } })
      if (menu) {
          bestSellingMenuName = menu.name
          bestSellingMenuQty = maxQty
      }
  }

  // Fetch History Data
  const historyData = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100 // Limit for performance, assuming filters narrow it down
  })

  // Chart Data (Simple Daily Revenue for this month)
  // We can acttually fetch grouped by day for the current month
  // This is a "nice to have".
  // Let's fetch all completed orders this month to build a simple array for a chart if we had one.
  // For now we just implement the cards + table polish as requested.

  // Formatter
  const formatIDR = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num)

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
       <PageHeader 
            title="History & Analytics" 
            description="Performance overview and transaction history." 
       />

      {/* Analytics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-coffee-black to-coffee-brown/40 border-white/10 overflow-hidden relative group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-coffee-cream">{formatIDR(totalRevenue._sum.totalPrice || 0)}</div>
                <p className="text-xs text-muted-foreground">This month</p>
                {/* Optional Mini Bar Chart visual could go here */}
                <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500/50 w-[70%]"></div>
                </div>
            </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Orders Completed</CardTitle>
                <ShoppingBag className="h-4 w-4 text-coffee-gold" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-coffee-cream">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">This month</p>
                 <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-coffee-gold/50 w-[85%]"></div>
                </div>
            </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Canceled</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-coffee-cream">{canceledOrders}</div>
                <p className="text-xs text-muted-foreground">This month</p>
                 <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500/50 w-[10%]"></div>
                </div>
            </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Best Seller</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-coffee-cream truncate" title={bestSellingMenuName}>{bestSellingMenuName}</div>
                <p className="text-xs text-muted-foreground">{bestSellingMenuQty} sold this month</p>
                 <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/50 w-[60%]"></div>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
              <CardHeader>
                  <CardTitle className="text-coffee-cream">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                  <Suspense fallback={<HistoryLoader />}>
                     <HistoryClientWrapper data={historyData} />
                  </Suspense>
              </CardContent>
          </Card>
      </div>
    </div>
  )
}
