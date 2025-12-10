"use client"

import { HistoryOrder, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"

interface HistoryClientWrapperProps {
  data: HistoryOrder[]
}

export function HistoryClientWrapper({ data }: HistoryClientWrapperProps) {
  return (
    <DataTable columns={columns} data={data} searchKey="customerName" />
  )
}
