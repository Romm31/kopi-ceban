import { prisma } from "@/lib/prisma"
import { Overview } from "@/components/dashboard/Overview"
import { RecentOrders } from "@/components/dashboard/RecentOrders"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { PopularMenuCarousel } from "@/components/dashboard/PopularMenuCarousel"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { startOfDay, subDays, format } from "date-fns"
import { DollarSign, ShoppingBag, Users, Coffee, ArrowUpRight } from "lucide-react"

async function getDashboardData() {
  const today = startOfDay(new Date())

  // Total Revenue Today
  const revenueToday = await prisma.order.aggregate({
    _sum: {
      totalPrice: true,
    },
      where: {
        status: "PAID" as any,
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
        status: "PAID" as any,
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      },
    })

    salesData.push({
      name: format(date, "dd MMM"),
      total: revenue._sum?.totalPrice || 0,
    })
  }

  // Recent Orders
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  })

  // Top Menus (Aggregated from JSON)
  const allPaidOrders = await prisma.order.findMany({
    where: { status: "PAID" as any },
    select: { items: true }
  })

  const menuCounts: Record<string, number> = {}

  allPaidOrders.forEach(order => {
    const items = order.items as any[]
    if (Array.isArray(items)) {
        items.forEach(item => {
            if (item.menuId) {
                menuCounts[item.menuId] = (menuCounts[item.menuId] || 0) + (item.quantity || 0)
            }
        })
    }
  })

  const sortedMenuIds = Object.keys(menuCounts).sort((a, b) => menuCounts[b] - menuCounts[a]).slice(0, 5)

  const topMenuDetails = await Promise.all(
    sortedMenuIds.map(async (menuId) => {
      const menu = await prisma.menu.findUnique({
        where: { id: parseInt(menuId) },
      })
      if (!menu) return null
      return {
        name: menu.name,
        quantity: menuCounts[menuId],
        image: menu.imageUrl || ""
      }
    })
  )

  return {
    revenueToday: revenueToday._sum?.totalPrice || 0,
    ordersToday,
    pendingOrders,
    activeMenus,
    salesData,
    recentOrders,
    topMenuDetails: topMenuDetails.filter(Boolean) as any[],
  }
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-6 md:p-8 space-y-6 w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif tracking-tight font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your coffee shop today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Revenue Today"
          value={data.revenueToday}
          description="Total sales for today"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          title="Orders Today"
          value={data.ordersToday}
          description="New orders placed"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <StatsCard
          title="Pending Orders"
          value={data.pendingOrders}
          description="Awaiting preparation"
          icon={<ArrowUpRight className="h-4 w-4" />}
          iconClassName="text-orange-500"
        />
        <StatsCard
          title="Menu Items"
          value={data.activeMenus}
          description="Active menu items"
          icon={<Coffee className="h-4 w-4" />}
        />
      </div>

      {/* Charts & Recent Orders */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue Overview</CardTitle>
            <CardDescription className="text-muted-foreground">
              Last 7 days revenue trend
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={data.salesData} /> {/* Changed from chartData to salesData */}
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Orders</CardTitle>
            <CardDescription className="text-muted-foreground">
              Latest {data.recentOrders.length} orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders orders={data.recentOrders as any} />
          </CardContent>
        </Card>
      </div>

      {/* Popular Menu */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Popular Menu Items</CardTitle>
          <CardDescription className="text-muted-foreground">
            Top selling items this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PopularMenuCarousel menus={data.topMenuDetails} /> {/* Changed from items to menus, and popularItems to topMenuDetails */}
        </CardContent>
      </Card>
    </div>
  )
}
