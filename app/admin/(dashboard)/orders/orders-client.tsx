"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PaymentLog {
    id: string;
    createdAt: Date;
    midtransStatus: string;
    rawCallback: any;
}

interface OrderWithLogs {
    id: string;
    orderCode: string; // Changed from id to orderCode for display
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

    const filteredData = data.filter(order => 
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.orderCode.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by name or order code..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9"
                />
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
                            filteredData.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-sm">{order.orderCode}</TableCell>
                                    <TableCell className="font-medium">{order.customerName}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(order.createdAt), "dd MMM HH:mm", { locale: id })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={
                                                order.status === 'PAID' ? 'default' : // default usually primary/black
                                                order.status === 'PENDING' ? 'secondary' :
                                                order.status === 'CANCELLED' || order.status === 'EXPIRED' ? 'destructive' : 'outline'
                                            }
                                            className={
                                                order.status === 'PAID' ? 'bg-green-500 hover:bg-green-600' :
                                                order.status === 'PENDING' ? 'bg-amber-500 hover:bg-amber-600' : ''
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(order.totalPrice)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" /> Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
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
                                                    <pre className="overflow-x-auto p-1 bg-black/10 rounded">
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
