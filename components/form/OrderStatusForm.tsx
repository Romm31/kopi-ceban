"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateOrderStatus } from "@/app/admin/(dashboard)/orders/actions"
import { toast } from "sonner"
import { useState } from "react"
import { OrderStatus } from "@prisma/client"

interface OrderStatusFormProps {
  orderId: string
  currentStatus: OrderStatus
}

export default function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(value: string) {
    const newStatus = value as OrderStatus
    setStatus(newStatus)
    setLoading(true)
    
    const result = await updateOrderStatus(orderId, newStatus)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Order status updated to ${newStatus}`)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <Select onValueChange={handleStatusChange} value={status} disabled={loading}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(OrderStatus).map((s) => (
            <SelectItem key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
