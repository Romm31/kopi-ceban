"use client"

import { Order, columns } from "./columns" // Import locally from columns.tsx in the same dir
import { DataTable } from "@/components/ui/data-table"

interface OrderClientWrapperProps {
  data: Order[]
}

export function OrderClientWrapper({ data }: OrderClientWrapperProps) {
  return (
    <DataTable columns={columns} data={data} searchKey="customerName" />
  )
}
