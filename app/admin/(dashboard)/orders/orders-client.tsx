"use client";

import { useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Eye, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PaymentLog {
    id: string;
    createdAt: Date;
    midtransStatus: string;
    rawCallback: any;
}

interface OrderWithLogs {
    id: string;
    orderCode: string;
    customerName: string;
    totalPrice: number;
    status: string;
    createdAt: Date;
    items: any[];
    paymentLogs: PaymentLog[];
}

interface OrdersTableProps {
    data: OrderWithLogs[];
}

export function OrdersTable({ data }: OrdersTableProps) {
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<OrderWithLogs | null>(null);
    const [syncingOrders, setSyncingOrders] = useState<Set<string>>(new Set());
    const [isSyncingAll, startSyncAll] = useTransition();
    const router = useRouter();

    const filteredData = data.filter(order => 
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.orderCode.toLowerCase().includes(search.toLowerCase())
    );

    // Sync single order
    const syncOrder = async (orderCode: string) => {
        setSyncingOrders(prev => new Set(prev).add(orderCode));
        
        try {
            const res = await fetch(`/api/midtrans/check-status?orderCode=${orderCode}`);
            const result = await res.json();
            
            if (!res.ok) {
                toast.error(`Sync failed: ${result.error}`);
                return;
            }
            
            if (result.syncResult?.includes("synced")) {
                toast.success(`${orderCode}: ${result.syncResult}`, {
                    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
                });
            } else if (result.syncResult === "unchanged") {
                toast.info(`${orderCode}: Status sudah sinkron`);
            } else if (result.syncResult === "midtrans_api_error") {
                toast.warning(`${orderCode}: Transaksi belum ada di Midtrans`);
            }
            
            router.refresh();
        } catch (error) {
            toast.error(`Sync error: ${(error as Error).message}`);
        } finally {
            setSyncingOrders(prev => {
                const next = new Set(prev);
                next.delete(orderCode);
                return next;
            });
        }
    };

    // Sync all pending orders
    const syncAllPending = () => {
        startSyncAll(async () => {
            try {
                const res = await fetch('/api/midtrans/check-status', { method: 'POST' });
                const result = await res.json();
                
                if (!res.ok) {
                    toast.error(`Batch sync failed: ${result.error}`);
                    return;
                }
                
                const synced = result.results?.filter((r: any) => r.synced).length || 0;
                const errors = result.results?.filter((r: any) => r.error).length || 0;
                
                if (synced > 0) {
                    toast.success(`✅ ${synced} order berhasil di-sync`);
                }
                if (errors > 0) {
                    toast.warning(`⚠️ ${errors} order gagal di-sync`);
                }
                if (synced === 0 && errors === 0) {
                    toast.info("Semua order sudah sinkron");
                }
                
                router.refresh();
            } catch (error) {
                toast.error(`Batch sync error: ${(error as Error).message}`);
            }
        });
    };

    // Check if order might be unsync'd (pending for more than 5 minutes)
    const mightBeUnsync = (order: OrderWithLogs) => {
        if (order.status !== "PENDING") return false;
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return new Date(order.createdAt) < fiveMinutesAgo;
    };

    const pendingCount = data.filter(o => o.status === "PENDING").length;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-2 w-full sm:max-w-sm">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name or order code..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9"
                    />
                </div>
                
                {/* Sync All Button */}
                {pendingCount > 0 && (
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={syncAllPending}
                        disabled={isSyncingAll}
                        className="bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncingAll ? 'animate-spin' : ''}`} />
                        {isSyncingAll ? 'Syncing...' : `Sync ${pendingCount} Pending`}
                    </Button>
                )}
            </div>

            <div className="rounded-md border border-border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Order Code</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((order) => {
                                const isSyncing = syncingOrders.has(order.orderCode);
                                const unsync = mightBeUnsync(order);

                                return (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-sm">
                                            <div className="flex items-center gap-2">
                                                {order.orderCode}
                                                {unsync && (
                                                    <span title="Mungkin perlu di-sync">
                                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{order.customerName}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(order.createdAt), "dd MMM HH:mm", { locale: id })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={
                                                    order.status === 'SUCCESS' ? 'default' :
                                                    order.status === 'PENDING' ? 'secondary' :
                                                    order.status === 'FAILED' || order.status === 'EXPIRED' ? 'destructive' :
                                                    order.status === 'REFUNDED' ? 'outline' : 'outline'
                                                }
                                                className={
                                                    order.status === 'SUCCESS' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                                    order.status === 'PENDING' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                                                    order.status === 'FAILED' ? 'bg-gray-500 hover:bg-gray-600 text-white' :
                                                    order.status === 'EXPIRED' ? 'bg-red-500 hover:bg-red-600 text-white' :
                                                    order.status === 'REFUNDED' ? 'bg-purple-500 hover:bg-purple-600 text-white' : ''
                                                }
                                            >
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(order.totalPrice)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Sync Button */}
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost"
                                                    onClick={() => syncOrder(order.orderCode)}
                                                    disabled={isSyncing}
                                                    title="Sync status dari Midtrans"
                                                    className={unsync ? "text-amber-500 hover:text-amber-400" : ""}
                                                >
                                                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                                </Button>
                                                {/* Details Button */}
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" /> Details
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Order Details
                            {selectedOrder && (
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => syncOrder(selectedOrder.orderCode)}
                                    disabled={syncingOrders.has(selectedOrder.orderCode)}
                                    className="ml-auto"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-1 ${syncingOrders.has(selectedOrder.orderCode) ? 'animate-spin' : ''}`} />
                                    Sync
                                </Button>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            Code: <span className="font-mono text-primary font-bold">{selectedOrder?.orderCode}</span>
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedOrder && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Items</h4>
                                    <ScrollArea className="h-[200px] rounded-md border p-2">
                                        {selectedOrder.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                                                <div className="text-sm">
                                                    <span className="font-bold">{item.quantity}x</span> {item.name}
                                                </div>
                                                <div className="text-sm font-mono">
                                                    {new Intl.NumberFormat("id-ID").format(item.price * item.quantity)}
                                                </div>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Payment Logs</h4>
                                    <ScrollArea className="h-[200px] rounded-md border p-2 bg-muted/20">
                                        {selectedOrder.paymentLogs.length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-4">No payment logs yet.</p>
                                        ) : (
                                            selectedOrder.paymentLogs.map((log) => (
                                                <div key={log.id} className="mb-3 p-2 bg-background rounded-md border border-border text-xs">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="font-bold text-primary">{log.midtransStatus}</span>
                                                        <span className="text-muted-foreground">
                                                            {format(new Date(log.createdAt), "HH:mm:ss", { locale: id })}
                                                        </span>
                                                    </div>
                                                    <pre className="overflow-x-auto p-1 bg-black/10 rounded text-[10px]">
                                                        {JSON.stringify(log.rawCallback, null, 2)}
                                                    </pre>
                                                </div>
                                            ))
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-border">
                                <div className="text-sm text-muted-foreground">
                                    Customer: <span className="text-foreground font-medium">{selectedOrder.customerName}</span>
                                </div>
                                <div className="text-xl font-bold text-primary">
                                    Total: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(selectedOrder.totalPrice)}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

