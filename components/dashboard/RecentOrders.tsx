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
    <div className="rounded-md border border-white/10 overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/10 hover:bg-white/10">
            <TableHead className="text-coffee-gold">Customer</TableHead>
            <TableHead className="text-coffee-gold">Status</TableHead>
            <TableHead className="text-coffee-gold">Items</TableHead>
            <TableHead className="text-right text-coffee-gold">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, i) => (
            <motion.tr 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border-white/10 hover:bg-white/5 transition-colors group"
            >
              <TableCell className="font-medium text-coffee-cream">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-coffee-gold/20">
                        <AvatarFallback className="bg-coffee-dark text-coffee-gold font-bold">
                            {order.customerName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="group-hover:text-coffee-gold transition-colors">{order.customerName}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                    variant="outline" 
                    className={`
                        ${order.status === 'COMPLETED' ? 'text-green-400 border-green-400/20 bg-green-400/10' : ''}
                        ${order.status === 'PENDING' ? 'text-orange-400 border-orange-400/20 bg-orange-400/10' : ''}
                        ${order.status === 'CANCELLED' ? 'text-red-400 border-red-400/20 bg-red-400/10' : ''}
                    `}
                >
                    {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{order.items.length} items</TableCell>
              <TableCell className="text-right font-medium text-coffee-cream">Rp {order.totalPrice.toLocaleString()}</TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
