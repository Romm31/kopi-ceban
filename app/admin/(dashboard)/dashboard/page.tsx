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
    take: 5, // Increased take to 5 for carousel
  })

  const topMenuDetails = await Promise.all(
    topMenus.map(async (item) => {
      const menu = await prisma.menu.findUnique({
        where: { id: item.menuId },
      })
      return {
        name: menu?.name || "Unknown",
        quantity: item._sum.quantity || 0,
        image: menu?.imageUrl || ""
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
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-4 bg-coffee-black min-h-screen">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-coffee-cream">Dashboard</h2>
            <p className="text-muted-foreground">Overview of your café's performance today.</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
            title="Total Revenue" 
            value={data.revenueToday} 
            icon={<DollarSign className="h-4 w-4 text-coffee-gold" />} 
            description="Today's earnings"
            delay={0.1}
        />
        <StatsCard 
            title="Orders" 
            value={data.ordersToday} 
            icon={<ShoppingBag className="h-4 w-4 text-coffee-gold" />} 
            description="Total orders today"
            delay={0.2}
        />
        <StatsCard 
            title="Pending" 
            value={data.pendingOrders} 
            icon={<Users className="h-4 w-4 text-coffee-gold" />} 
            description="Orders waiting action"
            delay={0.3}
        />
        <StatsCard 
            title="Active Menu" 
            value={data.activeMenus} 
            icon={<Coffee className="h-4 w-4 text-coffee-gold" />} 
            description="Available items"
            delay={0.4}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="col-span-4 bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-coffee-cream">Revenue Overview</CardTitle>
            <CardDescription>Performance over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={data.salesData} />
          </CardContent>
        </Card>

        {/* Top Menus Carousel (Moved here or kept separate? Let's keep structure similar but use Carousel) */}
        <Card className="col-span-3 bg-white/5 border-white/10 backdrop-blur-md flex flex-col">
            <CardHeader>
                <CardTitle className="text-coffee-cream flex items-center justify-between">
                    Top Selling Menus
                    <ArrowUpRight className="h-4 w-4 text-coffee-gold" />
                </CardTitle>
                <CardDescription>Most popular items</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
                <PopularMenuCarousel menus={data.topMenuDetails} />
            </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="grid gap-4 grid-cols-1">
         <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-coffee-cream">Recent Orders</CardTitle>
                 <CardDescription>Latest transactions from customers.</CardDescription>
            </CardHeader>
            <CardContent>
                <RecentOrders orders={data.recentOrders} />
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
