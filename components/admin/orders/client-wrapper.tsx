"use client"

import { Order, columns } from "./columns" // Import locally from columns.tsx in the same dir
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ListFilter, ClipboardList } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"

interface OrderClientWrapperProps {
  data: Order[]
}

const statuses = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Success", value: "SUCCESS" },
    { label: "Expired", value: "EXPIRED" },
    { label: "Failed", value: "FAILED" },
    { label: "Refunded", value: "REFUNDED" },
]

export function OrderClientWrapper({ data }: OrderClientWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const debouncedSearch = useDebounce(searchTerm, 500)
  const currentStatus = searchParams.get("status") || "ALL"

  // Sync URL with Search
  useEffect(() => {
     const current = new URLSearchParams(Array.from(searchParams.entries()));
     
     if (debouncedSearch) {
         current.set("q", debouncedSearch);
     } else {
         current.delete("q");
     }

     const search = current.toString();
     const query = search ? `?${search}` : "";

     router.push(`/admin/orders${query}`);
  }, [debouncedSearch, router, searchParams]);

  const handleStatusChange = (status: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (status === "ALL") {
          current.delete("status");
      } else {
          current.set("status", status);
      }
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`/admin/orders${query}`);
  }

  const hasFilters = searchTerm || currentStatus !== "ALL"

  return (
    <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-4">
             {/* Status Pills */}
             <div className="flex flex-wrap gap-2">
                 {statuses.map((status) => (
                     <Button
                        key={status.value}
                        variant={currentStatus === status.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusChange(status.value)}
                        className={cn(
                            "rounded-full transition-all duration-300",
                            currentStatus === status.value 
                                ? "bg-coffee-gold text-coffee-black hover:bg-coffee-gold/90 shadow-[0_0_10px_rgba(201,161,109,0.3)]" 
                                : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
                        )}
                     >
                         {status.label}
                     </Button>
                 ))}
             </div>

             {/* Search */}
             <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by customer name..."
                    className="bg-white/5 border-white/10 pl-9 w-full focus-visible:ring-coffee-gold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-white/10 shadow-sm bg-coffee-black/40 backdrop-blur-sm overflow-hidden">
             {data.length > 0 ? (
                 <DataTable columns={columns} data={data} searchKey="customerName" showSearch={false} />
             ) : (
                 <EmptyState 
                    icon={ClipboardList}
                    title="No orders found"
                    description={hasFilters ? "Try adjusting your filters to find what you're looking for." : "Orders will appear here once customers place them."}
                 />
             )}
        </div>
    </div>
  )
}
