"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, XCircle, Clock, Home, UtensilsCrossed, AlertCircle, ImageIcon, AlertTriangle } from "lucide-react";
import { Receipt, OrderData } from "@/components/receipt";
import { PaymentConfirmationModal } from "@/components/payment-confirmation-modal";
import html2canvas from "html2canvas";

type OrderStatus = "PENDING" | "SUCCESS" | "EXPIRED" | "FAILED" | "REFUNDED";
type PaymentMethod = "CASH" | "TRANSFER";

interface OrderResponse extends OrderData {
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("order_id") || searchParams.get("orderCode");
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Calculate time remaining for cash orders
  const EXPIRE_MINUTES = 15;
  
  // Countdown timer effect
  useEffect(() => {
    if (!order || order.status !== "PENDING" || order.paymentMethod !== "CASH") {
      setTimeRemaining(null);
      return;
    }
    
    const createdAt = new Date(order.createdAt).getTime();
    const expireAt = createdAt + EXPIRE_MINUTES * 60 * 1000;
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expireAt - now) / 1000));
      setTimeRemaining(remaining);
      
      // Auto-mark as expired locally if time is up
      if (remaining <= 0 && order.status === "PENDING") {
        setOrder(prev => prev ? { ...prev, status: "EXPIRED" } : null);
      }
    };
    
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [order?.createdAt, order?.status, order?.paymentMethod]);

  // Format time remaining as MM:SS
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#1A1A18",
        scale: 2,
      });
      
      // Convert to PNG and download
      const link = document.createElement("a");
      link.download = `Kuitansi-${orderCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Image generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Cancel order (customer) - with custom modal
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  
  const confirmCancelOrder = async () => {
    if (!orderCode) return;
    
    setCancelModalOpen(false);
    setCancelling(true);
    try {
      const res = await fetch('/api/orders/reject-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode, reason: 'cancelled_by_customer' }),
      });
      const result = await res.json();
      
      if (res.ok) {
        setOrder(prev => prev ? { ...prev, status: "FAILED" } : null);
      } else {
        alert(`Gagal membatalkan: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setCancelling(false);
    }
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

      {/* Cancel Order Confirmation Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#1a1816] border border-red-500/30">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <DialogTitle className="text-xl text-white">Batalkan Pesanan?</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Pesanan Anda akan dibatalkan dan tidak dapat dikembalikan.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          {orderCode && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 my-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Order</span>
                <span className="font-mono font-bold text-white text-sm">{orderCode}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-neutral-400">Total</span>
                <span className="font-bold text-[#d4a857]">{order ? formatter.format(order.totalPrice) : '-'}</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
              className="flex-1 h-11 border-white/20 text-white hover:bg-white/5"
            >
              Kembali
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelOrder}
              disabled={cancelling}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelling ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Ya, Batalkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
            <p className="text-neutral-400 text-sm mb-4">Kode: {orderCode}</p>
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

            {/* Action Buttons - All in grid for better mobile layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
              <Button
                onClick={handleDownloadImage}
                disabled={downloading}
                className="h-12 bg-[#d4a857] text-[#13110f] hover:bg-[#c2964b] font-bold"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4 mr-2" />
                )}
                Download Kuitansi
              </Button>
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
                    ? (order.paymentMethod === "CASH" ? "Silakan Bayar di Kasir" : "Menunggu Pembayaran")
                    : "Pesanan Dibatalkan"}
                </h1>
                <p className="text-neutral-300">
                  {order.status === "PENDING"
                    ? (order.paymentMethod === "CASH" 
                        ? "Tunjukkan kode pesanan ini kepada kasir untuk menyelesaikan pembayaran."
                        : "Silakan selesaikan pembayaran Anda.")
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

              {/* Pending Info - Different for Cash vs Transfer */}
              {order.status === "PENDING" && (
                <div className="space-y-3 w-full">
                  {order.paymentMethod === "CASH" ? (
                    /* Cash Payment Info with Premium Timer UI */
                    <div className="space-y-4">
                      {/* Circular Timer Section */}
                      <div className="bg-gradient-to-br from-[#1a1816] to-[#0f0e0c] p-6 rounded-2xl border border-[#d4a857]/20 shadow-xl shadow-[#d4a857]/5">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          {/* Circular Timer */}
                          <div className="relative">
                            <svg className="w-28 h-28 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 100 100">
                              {/* Background Circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                className="text-white/10"
                              />
                              {/* Progress Circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                                className={`transition-all duration-1000 ${
                                  timeRemaining !== null && timeRemaining < 60
                                    ? 'text-red-500'
                                    : timeRemaining !== null && timeRemaining < 180
                                      ? 'text-amber-500'
                                      : 'text-[#d4a857]'
                                }`}
                                strokeDasharray={`${2 * Math.PI * 45}`}
                                strokeDashoffset={`${2 * Math.PI * 45 * (1 - (timeRemaining || 0) / (15 * 60))}`}
                              />
                            </svg>
                            {/* Timer Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`font-mono font-bold text-2xl sm:text-3xl ${
                                timeRemaining !== null && timeRemaining < 60
                                  ? 'text-red-400'
                                  : timeRemaining !== null && timeRemaining < 180
                                    ? 'text-amber-400'
                                    : 'text-[#d4a857]'
                              }`}>
                                {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : '--:--'}
                              </span>
                              <span className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">Menit</span>
                            </div>
                          </div>
                          
                          {/* Info Text */}
                          <div className="flex-1 text-center sm:text-left space-y-2">
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-sm font-medium text-green-400">Menunggu Konfirmasi</span>
                            </div>
                            <p className="text-white/90 font-medium">
                              Tunjukkan kode pesanan kepada kasir
                            </p>
                            <p className="text-xs text-neutral-500">
                              Pesanan otomatis dibatalkan jika tidak dikonfirmasi dalam 15 menit
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Cancel Button */}
                      <Button
                        variant="outline"
                        onClick={() => setCancelModalOpen(true)}
                        disabled={cancelling}
                        className="w-full h-11 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 transition-all"
                      >
                        {cancelling ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
                      </Button>
                    </div>
                  ) : (
                    /* Transfer Payment Info */
                    <>
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
                    </>
                  )}
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

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#13110f] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#d4a857]" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
