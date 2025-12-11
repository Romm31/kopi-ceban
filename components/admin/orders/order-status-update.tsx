"use client"

import { OrderStatus } from "@prisma/client"
import { updateOrderStatus } from "@/app/actions/orders"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"

interface OrderStatusUpdateProps {
    orderId: number
    currentStatus: OrderStatus
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
  PROCESSING: "bg-blue-500/20 text-blue-500 border-blue-500/50",
  READY: "bg-green-500/20 text-green-500 border-green-500/50",
  COMPLETED: "bg-gray-500/20 text-gray-500 border-gray-500/50",
  CANCELLED: "bg-red-500/20 text-red-500 border-red-500/50",
}

export function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
    const [isPending, startTransition] = useTransition()

    const handleStatusChange = (value: string) => {
        startTransition(async () => {
            try {
                await updateOrderStatus(orderId, value as OrderStatus)
                toast.success(`Order status updated to ${value}`)
            } catch (error) {
                toast.error("Failed to update status")
                console.error(error)
            }
        })
    }

    return (
        <div className="flex items-center gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Select defaultValue={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
                <SelectTrigger className={`w-[150px] font-medium ${statusColors[currentStatus]}`}>
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-coffee-black border-white/10 text-foreground">
                    {Object.keys(statusColors).map((status) => (
                        <SelectItem key={status} value={status} className="focus:bg-white/10 focus:text-coffee-gold cursor-pointer">
                            {status}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
