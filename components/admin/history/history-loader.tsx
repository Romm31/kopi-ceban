import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HistoryLoader() {
  return (
    <div className="space-y-8">
        {/* Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             {Array.from({ length: 4 }).map((_, i) => (
                 <Card key={i} className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="h-4 w-[100px]"><Skeleton className="h-4 w-full bg-white/10" /></CardTitle>
                        <Skeleton className="h-4 w-4 bg-white/10" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-[120px] bg-white/10 mb-2" />
                        <Skeleton className="h-3 w-[80px] bg-white/5" />
                    </CardContent>
                 </Card>
             ))}
        </div>

        {/* Table Skeleton */}
        <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
                <TableHeader className="bg-white/5">
                <TableRow className="border-white/10">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-white/10">
                            <TableCell><Skeleton className="h-4 w-[60px] bg-white/10" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[120px] bg-white/10" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[150px] bg-white/10" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[200px] bg-white/10" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px] bg-white/10" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-[80px] rounded-full bg-white/10" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
  )
}
