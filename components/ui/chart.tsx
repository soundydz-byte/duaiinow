"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  Legend,
  LegendProps,
} from "recharts"
import { cn } from "@/lib/utils"

type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType<any>
    color?: string
  }
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

export function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error("useChart must be used inside <ChartContainer />")
  return ctx
}

export function ChartContainer({
  children,
  config,
  className,
}: {
  children: React.ReactNode
  config: ChartConfig
  className?: string
}) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("w-full h-full", className)}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

/* ----------------------- Tooltip ----------------------- */

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    color: string
    dataKey: string
    name: string
    value: any
    payload: any
  }>
  label?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: ChartTooltipProps) {
  const { config } = useChart()

  if (!active || !payload?.length) return null

  return (
    <div className="rounded-md border bg-background p-2 text-xs shadow-md">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((item, i) => {
        const c = config[item.dataKey || item.name] || {}
        return (
          <div key={i} className="flex justify-between gap-4">
            <span>{c.label || item.name}</span>
            <span className="font-mono">{item.value}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ----------------------- Legend ----------------------- */

interface ChartLegendProps {
  payload?: Array<{
    value: string
    type: string
    color: string
    dataKey?: string
  }>
}

export function ChartLegendContent({ payload }: ChartLegendProps) {
  const { config } = useChart()
  if (!payload) return null

  return (
    <div className="flex items-center gap-4 py-2 text-xs justify-center">
      {payload.map((item) => {
        const c = config[item.dataKey || item.value] || {}

        return (
          <div key={item.value} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span>{c.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export { Tooltip as ChartTooltip }
export { Legend as ChartLegend }
export { BarChart, Bar, LineChart, Line }
