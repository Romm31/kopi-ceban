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
  PROCESSING: {
    label: "Processing",
    className: "bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border-blue-500/20",
  },
  READY: {
    label: "Ready",
    className: "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20",
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
