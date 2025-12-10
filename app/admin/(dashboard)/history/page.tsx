import { prisma } from "@/lib/prisma"
import { HistoryClientWrapper } from "@/components/admin/history/client-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, ShoppingBag, XCircle, TrendingUp } from "lucide-react"
import { startOfMonth, subMonths } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const now = new Date()
  const currentMonthStart = startOfMonth(now)
  
  // Fetch Analytics Data
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
              status: "COMPLETED",
              createdAt: { gte: currentMonthStart }
          }
      }),
      // Total Completed Orders This Month
      prisma.order.count({
          where: {
              status: "COMPLETED",
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
      // Best Selling Menu
      prisma.orderItem.groupBy({
          by: ["menuId"],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 1
      })
  ])

  let bestSellingMenuName = "N/A"
  let bestSellingMenuQty = 0

  if (menuStats.length > 0) {
      const bestMenuId = menuStats[0].menuId
      const menu = await prisma.menu.findUnique({ where: { id: bestMenuId } })
      if (menu) {
          bestSellingMenuName = menu.name
          bestSellingMenuQty = menuStats[0]._sum.quantity || 0
      }
  }

  // Fetch All History Data
  // In a real app, strict pagination is better. For now we take last 100 for performance/demo.
  const historyData = await prisma.order.findMany({
      where: {
          status: { in: ["COMPLETED", "CANCELLED"] }
      },
      orderBy: { createdAt: "desc" },
      take: 100
  })

  // Formatter
  const formatIDR = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num)

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
       <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-coffee-cream">History & Analytics</h2>
          <p className="text-muted-foreground">
            Performance overview and transaction history.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-coffee-cream">{formatIDR(totalRevenue._sum.totalPrice || 0)}</div>
                <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Orders Completed</CardTitle>
                <ShoppingBag className="h-4 w-4 text-coffee-gold" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-coffee-cream">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Canceled</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-coffee-cream">{canceledOrders}</div>
                <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Best Seller</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-coffee-cream truncate" title={bestSellingMenuName}>{bestSellingMenuName}</div>
                <p className="text-xs text-muted-foreground">{bestSellingMenuQty} sold this month</p>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
              <CardHeader>
                  <CardTitle className="text-coffee-cream">Transaction History</CardTitle>
                  <CardDescription>Records of completed and cancelled orders.</CardDescription>
              </CardHeader>
              <CardContent>
                  <HistoryClientWrapper data={historyData} />
              </CardContent>
          </Card>
      </div>
    </div>
  )
}
