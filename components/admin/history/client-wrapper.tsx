"use client"

import { HistoryOrder, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { ClipboardList } from "lucide-react"

interface HistoryClientWrapperProps {
  data: HistoryOrder[]
}

export function HistoryClientWrapper({ data }: HistoryClientWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const status = searchParams.get("status")

  const [date, setDate] = useState<DateRange | undefined>(
      from && to ? { from: new Date(from), to: new Date(to) } : undefined
  )

  const handleDateSelect = (newDate: DateRange | undefined) => {
      setDate(newDate)
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      
      if (newDate?.from) {
          current.set("from", format(newDate.from, "yyyy-MM-dd"))
      } else {
          current.delete("from")
      }

      if (newDate?.to) {
          current.set("to", format(newDate.to, "yyyy-MM-dd"))
      } else {
          current.delete("to")
      }

      const search = current.toString()
      const query = search ? `?${search}` : ""
      router.push(`/admin/history${query}`)
  }

  const handleStatusChange = (val: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      if(val !== "ALL") current.set("status", val)
      else current.delete("status")
      
      const search = current.toString()
      const query = search ? `?${search}` : ""
      router.push(`/admin/history${query}`)
  }

  const clearFilters = () => {
      setDate(undefined)
      router.push("/admin/history")
  }
  
  const hasFilters = from || to || status

  return (
    <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
             <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-[300px] justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10",
                    !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                    date.to ? (
                        <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                        </>
                    ) : (
                        format(date.from, "LLL dd, y")
                    )
                    ) : (
                    <span>Pick a date range</span>
                    )}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-coffee-black border-white/10" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                    className="p-3 pointer-events-auto"
                />
                </PopoverContent>
            </Popover>

            <Select value={status || "ALL"} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-coffee-black border-white/10 text-foreground">
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
            </Select>

            {hasFilters && (
                 <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-white">
                    Reset
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>

        <div className="rounded-xl border border-white/10 shadow-sm bg-coffee-black/40 backdrop-blur-sm overflow-hidden">
             {data.length > 0 ? (
                 <DataTable columns={columns} data={data} searchKey="customerName" />
             ) : (
                 <EmptyState 
                    icon={ClipboardList}
                    title="No history found"
                    description={hasFilters ? "No transactions found for the selected period/status." : "No completed transactions yet."}
                 />
             )}
        </div>
    </div>
  )
}
