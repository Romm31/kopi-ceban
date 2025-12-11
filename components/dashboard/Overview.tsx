"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface OverviewProps {
  data: {
    name: string
    total: number
  }[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
        <p className="text-primary font-bold text-sm mb-1">{label}</p>
        <p className="text-foreground text-xs">
          Rp {payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export function Overview({ data }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d4a857" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#d4a857" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2725" opacity={0.5} />
        <XAxis
          dataKey="name"
          stroke="#9e9e9e"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#9e9e9e" }}
        />
        <YAxis
          stroke="#9e9e9e"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Rp ${value/1000}k`}
          tick={{ fill: "#9e9e9e" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#d4a857"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorTotal)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
