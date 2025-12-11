"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { ReactNode, useEffect, useState } from "react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  description?: string
  trend?: "up" | "down" | "neutral"
  delay?: number
}

export function StatsCard({ title, value, icon, description, trend, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors shadow-lg group overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-coffee-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-coffee-gold transition-colors">
            {title}
          </CardTitle>
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-coffee-gold/20 transition-colors">
            {icon}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-coffee-cream tracking-tight">
            {typeof value === 'number' ? (
                <CountUp value={value} prefix={title.includes("Revenue") ? "Rp " : ""} />
            ) : value}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CountUp({ value, prefix = "" }: { value: number, prefix?: string }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        const start = 0
        const end = value
        const duration = 2000
        const incrementTime = 30
        const range = end - start
        let current = start
        const step = Math.max(Math.ceil(range / (duration / incrementTime)), 1)
        
        const timer = setInterval(() => {
            current += step
            if (current >= end) {
                setDisplayValue(end)
                clearInterval(timer)
            } else {
                setDisplayValue(current)
            }
        }, incrementTime)

        return () => clearInterval(timer)
    }, [value])

    return <>{prefix}{displayValue.toLocaleString()}</>
}
