"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Order, OrderStatus } from "@prisma/client"

interface RecentOrdersProps {
    orders: (Order & { items: any[] })[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No recent orders</div>
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="text-primary">Customer</TableHead>
            <TableHead className="text-primary">Status</TableHead>
            <TableHead className="text-primary">Items</TableHead>
            <TableHead className="text-right text-primary">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, i) => (
            <motion.tr 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border-border hover:bg-muted/50 transition-colors group"
            >
              <TableCell className="font-medium text-foreground">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-primary/20">
                        <AvatarFallback className="bg-sidebar-accent text-primary font-bold">
                            {order.customerName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="group-hover:text-primary transition-colors">{order.customerName}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                    variant={
                        order.status === 'COMPLETED' ? 'success' :
                        order.status === 'PENDING' ? 'warning' :
                        order.status === 'CANCELLED' ? 'destructive' : 'info'
                    }
                >
                    {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{order.items.length} items</TableCell>
              <TableCell className="text-right font-medium text-foreground">Rp {order.totalPrice.toLocaleString()}</TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
