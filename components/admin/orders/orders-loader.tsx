import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function OrdersLoader() {
  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/10">
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-white/10">
                    <TableCell><Skeleton className="h-4 w-[60px] bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px] bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px] bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px] bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px] rounded-full bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md bg-white/10 ml-auto" /></TableCell>
                </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
