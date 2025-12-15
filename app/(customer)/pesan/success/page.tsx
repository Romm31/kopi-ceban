"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Clock, Home, UtensilsCrossed, Download, Printer, AlertCircle } from "lucide-react";
import { Receipt, OrderData } from "@/components/receipt";
import { PaymentConfirmationModal } from "@/components/payment-confirmation-modal";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type OrderStatus = "PENDING" | "SUCCESS" | "EXPIRED" | "FAILED" | "REFUNDED";

interface OrderResponse extends OrderData {
  status: OrderStatus;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("order_id") || searchParams.get("orderCode");
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Polling for order status
  useEffect(() => {
    if (!orderCode) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/orders/status?orderCode=${orderCode}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (e) {
        console.error("Fetch error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    
    // Only poll if not already successful
    const interval = setInterval(() => {
      if (order?.status !== "SUCCESS") {
        fetchStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderCode, order?.status]);

  const handleNavigation = (path: string) => {
    if (order?.status !== "SUCCESS" && order?.status !== "FAILED" && order?.status !== "EXPIRED") {
      setTargetPath(path);
      setShowConfirmModal(true);
    } else {
      router.push(path);
    }
  };

  const confirmExit = () => {
    setShowConfirmModal(false);
    router.push(targetPath || "/");
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#1A1A18",
        scale: 2,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });
      
      const imgWidth = 130;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (148 - imgWidth) / 2;
      const y = 10;
      
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`Receipt-${orderCode}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  if (!orderCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#13110f] text-white">
        <p>Order ID tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 py-12 bg-[#13110f] relative overflow-hidden">
      <PaymentConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmExit}
      />

      {/* Decorative Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#d4a857]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-lg w-full relative z-10">
        {loading ? (
          <div className="flex flex-col items-center py-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <Loader2 className="w-12 h-12 text-[#d4a857] animate-spin mb-4" />
            <p className="text-neutral-400 animate-pulse">Memuat status pesanan...</p>
          </div>
        ) : !order ? (
          <div className="flex flex-col items-center py-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-serif font-bold text-white mb-2">Pesanan Tidak Ditemukan</h2>
            <Button onClick={() => router.push("/")} variant="outline" className="mt-4">
              Kembali ke Home
            </Button>
          </div>
        ) : order.status === "SUCCESS" ? (
          // SUCCESS - Show Receipt
          <div className="space-y-6">
            {/* Success Header */}
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center ring-4 ring-green-500/20 mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-[#d4a857]">Pembayaran Berhasil!</h1>
              <p className="text-neutral-400 mt-2">Terima kasih, pesanan Anda akan segera diproses.</p>
            </div>

            {/* Receipt */}
            <div ref={receiptRef}>
              <Receipt order={order} />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 print:hidden">
              <Button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="h-12 bg-[#d4a857] text-[#13110f] hover:bg-[#c2964b] font-bold"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download PDF
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="h-12 border-white/20 text-white hover:bg-white/5"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>

            {/* Navigation */}
            <div className="grid grid-cols-2 gap-3 print:hidden">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="h-12 border-white/10 text-white hover:bg-white/5"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                onClick={() => router.push("/menu")}
                variant="outline"
                className="h-12 border-[#d4a857]/30 text-[#d4a857] hover:bg-[#d4a857]/10"
              >
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Pesan Lagi
              </Button>
            </div>
          </div>
        ) : (
          // PENDING / FAILED / EXPIRED
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 text-center shadow-2xl">
            <div className="flex flex-col items-center space-y-6">
              {/* Status Icon */}
              <div className="mb-2">
                {order.status === "PENDING" && (
                  <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center ring-4 ring-amber-500/20 animate-pulse">
                    <Clock className="w-12 h-12 text-amber-500" />
                  </div>
                )}
                {(order.status === "EXPIRED" || order.status === "FAILED") && (
                  <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center ring-4 ring-red-500/20">
                    <XCircle className="w-12 h-12 text-red-500" />
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-3xl font-serif font-bold text-[#d4a857]">
                  {order.status === "PENDING"
                    ? "Menunggu Pembayaran"
                    : "Pesanan Dibatalkan"}
                </h1>
                <p className="text-neutral-300">
                  {order.status === "PENDING"
                    ? "Silakan selesaikan pembayaran Anda."
                    : "Maaf, pesanan Anda telah kadaluarsa atau dibatalkan."}
                </p>
              </div>

              {/* Order Info */}
              <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                  <span className="text-neutral-400">Order Code</span>
                  <span className="font-mono text-white text-xs sm:text-sm">{order.orderCode}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">Nama Pemesan</span>
                  <span className="font-medium text-white">{order.customerName}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-neutral-400">Total Tagihan</span>
                  <span className="font-bold text-[#d4a857] text-lg">
                    {formatter.format(order.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Pending Warning */}
              {order.status === "PENDING" && (
                <div className="space-y-3 w-full">
                  <div className="flex gap-3 items-start bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-left">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-amber-200/80 leading-relaxed">
                        Status akan update otomatis setiap 5 detik.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-400">Auto-refresh aktif</span>
                      </div>
                    </div>
                  </div>

                  {/* Sandbox Warning */}
                  <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30 text-left space-y-2">
                    <span className="text-red-400 font-bold text-xs uppercase tracking-wider">
                      ⚠️ Mode Sandbox
                    </span>
                    <p className="text-xs text-red-200/90 leading-relaxed">
                      <strong>QRIS Sandbox TIDAK BISA dibayar</strong> menggunakan aplikasi e-wallet asli.
                    </p>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Untuk testing, gunakan{" "}
                      <strong>Midtrans Dashboard → Transactions → Simulate Payment</strong>.
                    </p>
                    <a
                      href="https://dashboard.sandbox.midtrans.com/transactions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Buka Midtrans Dashboard →
                    </a>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleNavigation("/")}
                  className="w-full h-12 border-white/10 text-white hover:bg-white/5"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button
                  onClick={() => handleNavigation("/menu")}
                  className="w-full h-12 bg-[#d4a857] text-[#13110f] hover:bg-[#c2964b] font-bold"
                >
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Menu
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#13110f] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#d4a857]" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
