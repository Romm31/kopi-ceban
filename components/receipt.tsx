"use client";

import { forwardRef } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface OrderItem {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  orderCode: string;
  customerName: string;
  notes?: string | null;
  items: OrderItem[];
  totalPrice: number;
  orderType: string;
  tableNumber?: number | null;
  paymentType?: string | null;
  transactionId?: string | null;
  settlementTime?: Date | string | null;
  createdAt: Date | string;
}

interface ReceiptProps {
  order: OrderData;
  showLogo?: boolean;
}

const formatPaymentType = (type: string | null | undefined): string => {
  if (!type) return "-";
  const map: Record<string, string> = {
    qris: "QRIS",
    bank_transfer: "Transfer Bank",
    credit_card: "Kartu Kredit",
    debit: "Kartu Debit",
    debit_card: "Kartu Debit",
    gopay: "GoPay",
    shopeepay: "ShopeePay",
    ovo: "OVO",
    dana: "DANA",
    linkaja: "LinkAja",
    akulaku: "Akulaku",
    kredivo: "Kredivo",
    cstore: "Convenience Store",
    echannel: "Mandiri Bill",
    bca_va: "BCA VA",
    bni_va: "BNI VA",
    bri_va: "BRI VA",
    permata_va: "Permata VA",
    cimb_va: "CIMB VA",
  };
  return map[type.toLowerCase()] || type.replace(/_/g, " ").toUpperCase();
};

// Using inline styles with hex colors for html2canvas compatibility
const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ order, showLogo = true }, ref) => {
    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

    const settlementDate = order.settlementTime
      ? new Date(order.settlementTime)
      : new Date(order.createdAt);

    return (
      <div
        ref={ref}
        id="receipt-content"
        className="max-w-[400px] mx-auto bg-card rounded-xl p-6 text-foreground font-sans border border-border shadow-sm"
      >
        {/* Header */}
        <div className="text-center border-b border-dashed border-muted-foreground/30 pb-4 mb-4">
          {showLogo && (
            <div className="flex justify-center mb-3">
              <img
                src="/logo/logo.jpg"
                alt="Kopi Ceban"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
          )}
          <h1 className="text-xl font-bold text-primary m-0">
            Kopi Ceban
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Panglima Polim
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(settlementDate, "dd MMMM yyyy, HH:mm", { locale: id })}
          </p>
        </div>

        {/* Order Info */}
        <div className="border-b border-dashed border-muted-foreground/30 pb-4 mb-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Order</span>
            <span className="font-mono font-bold text-primary text-sm">
              {order.orderCode}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Customer</span>
            <span className="font-medium text-sm">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Tipe</span>
            <span className="font-medium text-sm">
              {order.orderType === "DINE_IN"
                ? `Dine In - Meja ${order.tableNumber || "-"}`
                : "Take Away"}
            </span>
          </div>
          {order.paymentType && order.paymentType !== "-" && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pembayaran</span>
              <span className="font-medium text-green-600 text-sm">
                {formatPaymentType(order.paymentType)} ✓
              </span>
            </div>
          )}
          {order.transactionId && (
            <div className="flex justify-between mt-2">
              <span className="text-sm text-muted-foreground">Trans ID</span>
              <span className="font-mono text-xs">{order.transactionId}</span>
            </div>
          )}
        </div>

        {/* Customer Notes */}
        {order.notes && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-primary/20">
            <h3 className="text-xs font-bold uppercase text-primary mb-2">
              📝 Catatan
            </h3>
            <p className="text-sm text-foreground m-0 leading-relaxed">
              {order.notes}
            </p>
          </div>
        )}

        {/* Items */}
        <div className="mb-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2">
            Detail Pesanan
          </h3>
          <div>
            {order.items.map((item, index) => (
              <div
                key={index}
                className={`flex justify-between items-start py-2 ${index < order.items.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm m-0">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.quantity} x {formatter.format(item.price)}
                  </p>
                </div>
                <span className="font-medium text-sm">
                  {formatter.format(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-dashed border-muted-foreground/30 pt-4 space-y-2">
          {/* Calculate subtotal from items */}
          {(() => {
            const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const ppn = Math.round(subtotal * 0.11);
            const grandTotal = subtotal + ppn;
            return (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm">{formatter.format(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">PPN (11%)</span>
                  <span className="text-sm">{formatter.format(ppn)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border mt-2">
                  <span className="text-lg font-bold text-primary">TOTAL</span>
                  <span className="text-lg font-bold text-primary">
                    {formatter.format(grandTotal)}
                  </span>
              </div>
            </>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-dashed border-muted-foreground/30 text-center">
          <p className="text-sm text-muted-foreground m-0">
            Terima kasih telah berbelanja di
          </p>
          <p className="text-lg font-bold text-primary my-1">
            Kopi Ceban
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Follow us @kopiceban_
          </p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";

export { Receipt };
export type { OrderData, OrderItem };
