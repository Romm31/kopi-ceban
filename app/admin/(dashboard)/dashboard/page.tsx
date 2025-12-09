import { prisma } from "@/lib/prisma"
import { Overview } from "@/components/dashboard/Overview"
import { RecentOrders } from "@/components/dashboard/RecentOrders"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { startOfDay, subDays, format } from "date-fns"
import { DollarSign, ShoppingBag, Users, Coffee } from "lucide-react"

async function getDashboardData() {
  const today = startOfDay(new Date())

  // Total Revenue Today
  const revenueToday = await prisma.order.aggregate({
    _sum: {
      totalPrice: true,
    },
    where: {
      status: "COMPLETED",
      createdAt: {
        gte: today,
      },
    },
  })

  // Total Orders Today
  const ordersToday = await prisma.order.count({
    where: {
      createdAt: {
        gte: today,
      },
    },
  })

  // Pending Orders
  const pendingOrders = await prisma.order.count({
    where: {
      status: "PENDING",
    },
  })

  // Active Menus
  const activeMenus = await prisma.menu.count({
    where: {
      isAvailable: true,
    },
  })

  // Sales Chart Data (Last 7 days)
  const salesData = []
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i)
    const nextDate = subDays(today, i - 1)
    
    const revenue = await prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      },
    })

    salesData.push({
      name: format(date, "dd MMM"),
      total: revenue._sum.totalPrice || 0,
    })
  }

  // Recent Orders
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: true,
    },
  })

  // Top Menus
  const topMenus = await prisma.orderItem.groupBy({
    by: ["menuId"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 3,
  })

  const topMenuDetails = await Promise.all(
    topMenus.map(async (item) => {
      const menu = await prisma.menu.findUnique({
        where: { id: item.menuId },
      })
      return {
        name: menu?.name || "Unknown",
        quantity: item._sum.quantity,
      }
    })
  )

  return {
    revenueToday: revenueToday._sum.totalPrice || 0,
    ordersToday,
    pendingOrders,
    activeMenus,
    salesData,
    recentOrders,
    topMenuDetails,
  }
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue Today
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {data.revenueToday.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Orders Today
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.ordersToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{data.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Menu</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeMenus}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={data.salesData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              You made {data.ordersToday} orders today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders orders={data.recentOrders} />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card className="col-span-2">
            <CardHeader>
               <CardTitle>Top Selling Menus</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {data.topMenuDetails.length === 0 ? <p className="text-sm text-gray-500">No data available</p> : null}
                  {data.topMenuDetails.map((item, index) => (
                     <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-500">{item.quantity} sold</span>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
