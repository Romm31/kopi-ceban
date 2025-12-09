import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentOrders({ orders }: { orders: any[] }) {
  return (
    <div className="space-y-8">
      {orders.map((order) => (
        <div className="flex items-center" key={order.id}>
          <Avatar className="h-9 w-9">
            <AvatarFallback>{order.customerName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">
              {order.items.length} items
            </p>
          </div>
          <div className="ml-auto font-medium">Rp {order.totalPrice.toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}
