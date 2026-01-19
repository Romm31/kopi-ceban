"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, RefreshCw, AlertTriangle, CheckCircle2, Bell, BellOff, Banknote, CreditCard, XCircle, Download, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useOrderNotification } from "@/hooks/use-order-notification";
import { Receipt } from "@/components/receipt";
import html2canvas from "html2canvas";

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
    notes?: string | null;
    totalPrice: number;
    status: string;
    createdAt: Date;
    items: any[];
    paymentLogs: PaymentLog[];
    orderType?: string;
    tableNumber?: number | null;
    paymentMethod?: string; // CASH or TRANSFER
    paymentType?: string | null;
    transactionId?: string | null;
    settlementTime?: Date | null;
}

interface OrdersTableProps {
    data: OrderWithLogs[];
}

export function OrdersTable({ data }: OrdersTableProps) {
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<OrderWithLogs | null>(null);
    const [syncingOrders, setSyncingOrders] = useState<Set<string>>(new Set());
    const [isSyncingAll, startSyncAll] = useTransition();
    const [downloading, setDownloading] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    
    // Order notification hook (handles polling and sound)
    const { 
        isEnabled: notificationEnabled, 
        toggleNotification, 
        newOrderId
    } = useOrderNotification();

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

    // Order Type Badge Component - inline design
    const OrderTypeBadge = ({ order }: { order: OrderWithLogs }) => {
        if (order.orderType === "DINE_IN") {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-500/30">
                        Dine In
                    </span>
                    {order.tableNumber && (
                        <span className="px-1.5 py-0.5 text-xs font-bold rounded bg-green-200 text-green-900 border border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-600/30">
                            Meja {order.tableNumber}
                        </span>
                    )}
                </div>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500/30">
                Take Away
            </span>
        );
    };

    // Payment Method Badge Component
    const PaymentMethodBadge = ({ order }: { order: OrderWithLogs }) => {
        if (order.paymentMethod === "CASH") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-500/30">
                    <Banknote className="w-3 h-3" />
                    Cash
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-500/30">
                <CreditCard className="w-3 h-3" />
                Transfer
            </span>
        );
    };

    // Confirm Cash Payment
    const [confirmingOrders, setConfirmingOrders] = useState<Set<string>>(new Set());
    const [rejectingOrders, setRejectingOrders] = useState<Set<string>>(new Set());
    
    const confirmCashPayment = async (orderCode: string) => {
        setConfirmingOrders(prev => new Set(prev).add(orderCode));
        
        try {
            const res = await fetch('/api/orders/confirm-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderCode }),
            });
            const result = await res.json();
            
            if (!res.ok) {
                toast.error(`Konfirmasi gagal: ${result.error}`);
                return;
            }
            
            toast.success(`✅ Pembayaran Cash ${orderCode} dikonfirmasi!`);
            router.refresh();
        } catch (error) {
            toast.error(`Error: ${(error as Error).message}`);
        } finally {
            setConfirmingOrders(prev => {
                const next = new Set(prev);
                next.delete(orderCode);
                return next;
            });
        }
    };

    // Reject Cash Payment - with custom modal
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [orderToReject, setOrderToReject] = useState<string | null>(null);
    
    const openRejectModal = (orderCode: string) => {
        setOrderToReject(orderCode);
        setRejectModalOpen(true);
    };
    
    const confirmRejectPayment = async () => {
        if (!orderToReject) return;
        
        setRejectModalOpen(false);
        setRejectingOrders(prev => new Set(prev).add(orderToReject));
        
        try {
            const res = await fetch('/api/orders/reject-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderCode: orderToReject, reason: 'rejected_by_admin' }),
            });
            const result = await res.json();
            
            if (!res.ok) {
                toast.error(`Penolakan gagal: ${result.error}`);
                return;
            }
            
            toast.success(`❌ Pesanan ${orderToReject} ditolak.`);
            router.refresh();
        } catch (error) {
            toast.error(`Error: ${(error as Error).message}`);
        } finally {
            setRejectingOrders(prev => {
                const next = new Set(prev);
                next.delete(orderToReject!);
                return next;
            });
            setOrderToReject(null);
        }
    };

    // Download receipt as image
    const handleDownloadReceipt = async (orderCode: string) => {
        if (!receiptRef.current) return;
        
        setDownloading(true);
        try {
            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: "#1A1A18",
                scale: 2,
            });
            
            const link = document.createElement("a");
            link.download = `Kuitansi-${orderCode}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            toast.success("Kuitansi berhasil diunduh!");
        } catch (err) {
            console.error("Download failed:", err);
            toast.error("Gagal mengunduh kuitansi");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Reject Confirmation Modal */}
            <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                <DialogContent className="sm:max-w-md bg-card border border-destructive/30">
                    <DialogHeader>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-destructive" />
                            </div>
                            <DialogTitle className="text-xl text-foreground">Tolak Pesanan?</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Pesanan ini akan ditandai sebagai <span className="text-destructive font-semibold">DITOLAK</span> dan tidak dapat dibatalkan.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    
                    {orderToReject && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 my-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Order Code</span>
                                <span className="font-mono font-bold text-foreground">{orderToReject}</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex gap-3 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setRejectModalOpen(false)}
                            className="flex-1 h-11 border-input text-foreground hover:bg-accent"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmRejectPayment}
                            className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Ya, Tolak
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            
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
                
                <div className="flex items-center gap-2">
                    {/* Notification Toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleNotification(!notificationEnabled)}
                        className={notificationEnabled 
                            ? "bg-coffee-gold/10 border-coffee-gold/30 text-coffee-gold hover:bg-coffee-gold/20" 
                            : "bg-muted/20 border-muted/30 text-muted-foreground hover:bg-muted/30"
                        }
                        title={notificationEnabled ? "Notifikasi aktif" : "Notifikasi nonaktif"}
                    >
                        {notificationEnabled ? (
                            <><Bell className="w-4 h-4 mr-2" /> Notifikasi On</>
                        ) : (
                            <><BellOff className="w-4 h-4 mr-2" /> Notifikasi Off</>
                        )}
                    </Button>
                    
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
            </div>

            <div className="rounded-md border border-border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Order Code</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Order Type</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((order) => {
                                const isSyncing = syncingOrders.has(order.orderCode);
                                const unsync = mightBeUnsync(order);

                                const isNewOrder = newOrderId === order.id;

                                return (
                                    <TableRow 
                                        key={order.id}
                                        className={isNewOrder ? "animate-pulse bg-coffee-gold/15 transition-all duration-700" : ""}
                                    >
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
                                            <PaymentMethodBadge order={order} />
                                        </TableCell>
                                        <TableCell>
                                            <OrderTypeBadge order={order} />
                                        </TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(order.totalPrice)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Confirm Cash Payment Button */}
                                                {order.paymentMethod === "CASH" && order.status === "PENDING" && (
                                                    <>
                                                        <Button 
                                                            size="sm" 
                                                            variant="default"
                                                            onClick={() => confirmCashPayment(order.orderCode)}
                                                            disabled={confirmingOrders.has(order.orderCode)}
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            title="Konfirmasi pembayaran cash"
                                                        >
                                                            {confirmingOrders.has(order.orderCode) ? (
                                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                    Konfirmasi
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="destructive"
                                                            onClick={() => openRejectModal(order.orderCode)}
                                                            disabled={rejectingOrders.has(order.orderCode)}
                                                            className="bg-red-600 hover:bg-red-700 text-white"
                                                            title="Tolak pesanan"
                                                        >
                                                            {rejectingOrders.has(order.orderCode) ? (
                                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                    </>
                                                )}
                                                {/* Sync Button - only for Transfer */}
                                                {order.paymentMethod !== "CASH" && (
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
                                                )}
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
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="details">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Details
                                </TabsTrigger>
                                <TabsTrigger value="receipt">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Kuitansi
                                </TabsTrigger>
                            </TabsList>
                            
                            {/* Details Tab */}
                            <TabsContent value="details" className="space-y-6">
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
                                
                                {/* Customer Notes */}
                                {selectedOrder.notes && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                        <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">📝 Catatan Pelanggan</h4>
                                        <p className="text-sm text-foreground">{selectedOrder.notes}</p>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center pt-4 border-t border-border">
                                    <div className="text-sm text-muted-foreground">
                                        Customer: <span className="text-foreground font-medium">{selectedOrder.customerName}</span>
                                    </div>
                                    <div className="text-xl font-bold text-primary">
                                        Total: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(selectedOrder.totalPrice)}
                                    </div>
                                </div>
                            </TabsContent>
                            
                            {/* Receipt Tab */}
                            <TabsContent value="receipt" className="space-y-4">
                                <ScrollArea className="h-[400px] rounded-md border p-4 bg-[#1A1A18]">
                                    <div ref={receiptRef}>
                                        <Receipt 
                                            order={{
                                                orderCode: selectedOrder.orderCode,
                                                customerName: selectedOrder.customerName,
                                                notes: selectedOrder.notes,
                                                items: selectedOrder.items,
                                                totalPrice: selectedOrder.totalPrice,
                                                orderType: selectedOrder.orderType || "TAKE_AWAY",
                                                tableNumber: selectedOrder.tableNumber,
                                                paymentType: (selectedOrder as any).paymentType || null,
                                                transactionId: (selectedOrder as any).transactionId || null,
                                                settlementTime: (selectedOrder as any).settlementTime || null,
                                                createdAt: selectedOrder.createdAt,
                                            }}
                                        />
                                    </div>
                                </ScrollArea>
                                
                                <Button
                                    onClick={() => handleDownloadReceipt(selectedOrder.orderCode)}
                                    disabled={downloading}
                                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {downloading ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Download className="w-4 h-4 mr-2" />
                                    )}
                                    {downloading ? 'Mengunduh...' : 'Download Kuitansi'}
                                </Button>
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

