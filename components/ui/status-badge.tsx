import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { OrderStatus } from "@prisma/client"

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
  animated?: boolean
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25 border-yellow-500/20",
  },
  PAID: {
    label: "Paid",
    className: "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-gray-500/15 text-gray-500 hover:bg-gray-500/25 border-gray-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-500/15 text-red-500 hover:bg-red-500/25 border-red-500/20",
  },
}

export function StatusBadge({ status, className, animated = false }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium tracking-wide transition-all duration-300",
        config.className,
        animated && "animate-in zoom-in-95",
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
