import { OrderStatus } from "@prisma/client"
import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderTimelineProps {
  currentStatus: OrderStatus
}

const steps = [
  { status: "PENDING", label: "Pending" },
  { status: "PAID", label: "Paid" },
]

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const statusStr = currentStatus as string
  const currentStepIndex = steps.findIndex((s) => s.status === statusStr)
  const isCancelled = statusStr === "CANCELLED"
  const isExpired = statusStr === "EXPIRED"

  // If Cancelled, we show a red state
  if (isCancelled) {
      return (
          <div className="w-full py-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Order Cancelled
              </div>
          </div>
      )
  }

  // If Expired, show gray state
  if (isExpired) {
      return (
          <div className="w-full py-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20">
                  Order Expired
              </div>
          </div>
      )
  }

  return (
    <div className="relative flex flex-col md:flex-row justify-between w-full max-w-3xl mx-auto py-4">
      {/* Connector Line (Desktop) */}
      <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 -translate-y-1/2" />
      
      {steps.map((step, index) => {
        const isCompleted = index <= currentStepIndex
        const isCurrent = index === currentStepIndex

        return (
          <div key={step.status} className="flex flex-col items-center gap-2 bg-transparent z-10 px-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                isCompleted
                  ? "bg-coffee-gold border-coffee-gold text-coffee-black shadow-[0_0_10px_rgba(201,161,109,0.5)]"
                  : "bg-coffee-black border-white/20 text-muted-foreground"
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
            </div>
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wider transition-colors duration-300",
                isCurrent ? "text-coffee-gold" : isCompleted ? "text-coffee-cream" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
