"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  description?: string
  trend?: "up" | "down" | "neutral"
  delay?: number
  iconClassName?: string
}

export function StatsCard({ title, value, icon, description, trend, delay = 0, iconClassName }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full bg-card border-border backdrop-blur-md hover:bg-sidebar-accent transition-colors shadow-lg group overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-xl bg-sidebar-accent group-hover:bg-primary/20 transition-all shadow-md ${iconClassName || 'text-primary'}`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-foreground group-hover:scale-105 transition-transform origin-left">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
          {trend && (
            <div className={`text-xs mt-2 flex items-center gap-1 ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 
              'text-muted-foreground'
            }`}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trend === 'neutral' && '→'}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
