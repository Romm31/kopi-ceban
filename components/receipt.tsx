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
        style={{
          maxWidth: "400px",
          margin: "0 auto",
          backgroundColor: "#1A1A18",
          borderRadius: "12px",
          padding: "24px",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            borderBottom: "1px dashed #3a3a38",
            paddingBottom: "16px",
            marginBottom: "16px",
          }}
        >
          {showLogo && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <img
                src="/logo/logo.jpg"
                alt="Kopi Ceban"
                style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" }}
              />
            </div>
          )}
          <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#d4a857", margin: "0" }}>
            Kopi Ceban
          </h1>
          <p style={{ fontSize: "12px", color: "#888888", margin: "4px 0 0" }}>
            Panglima Polim
          </p>
          <p style={{ fontSize: "12px", color: "#666666", marginTop: "4px" }}>
            {format(settlementDate, "dd MMMM yyyy, HH:mm", { locale: id })}
          </p>
        </div>

        {/* Order Info */}
        <div
          style={{
            borderBottom: "1px dashed #3a3a38",
            paddingBottom: "16px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", color: "#888888" }}>Order</span>
            <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#d4a857", fontSize: "14px" }}>
              {order.orderCode}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", color: "#888888" }}>Customer</span>
            <span style={{ fontWeight: "500", fontSize: "14px" }}>{order.customerName}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", color: "#888888" }}>Tipe</span>
            <span style={{ fontWeight: "500", fontSize: "14px" }}>
              {order.orderType === "DINE_IN"
                ? `Dine In - Meja ${order.tableNumber || "-"}`
                : "Take Away"}
            </span>
          </div>
          {order.paymentType && order.paymentType !== "-" && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", color: "#888888" }}>Pembayaran</span>
              <span style={{ fontWeight: "500", color: "#22c55e", fontSize: "14px" }}>
                {formatPaymentType(order.paymentType)} ✓
              </span>
            </div>
          )}
          {order.transactionId && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              <span style={{ fontSize: "14px", color: "#888888" }}>Trans ID</span>
              <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{order.transactionId}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#888888", marginBottom: "8px" }}>
            Detail Pesanan
          </h3>
          <div>
            {order.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "8px 0",
                  borderBottom: index < order.items.length - 1 ? "1px solid #2a2a28" : "none",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "500", fontSize: "14px", margin: "0" }}>{item.name}</p>
                  <p style={{ fontSize: "12px", color: "#888888", margin: "2px 0 0" }}>
                    {item.quantity} x {formatter.format(item.price)}
                  </p>
                </div>
                <span style={{ fontWeight: "500", fontSize: "14px" }}>
                  {formatter.format(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div
          style={{
            borderTop: "1px dashed #3a3a38",
            paddingTop: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", color: "#888888" }}>Subtotal</span>
            <span style={{ fontSize: "14px" }}>{formatter.format(order.totalPrice)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", color: "#888888" }}>Pajak</span>
            <span style={{ fontSize: "14px" }}>Rp 0</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "8px",
              borderTop: "1px solid #2a2a28",
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#d4a857" }}>TOTAL</span>
            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#d4a857" }}>
              {formatter.format(order.totalPrice)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px dashed #3a3a38",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "14px", color: "#cccccc", margin: "0" }}>
            Terima kasih telah berbelanja di
          </p>
          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#d4a857", margin: "4px 0" }}>
            Kopi Ceban
          </p>
          <p style={{ fontSize: "12px", color: "#666666", marginTop: "8px" }}>
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
