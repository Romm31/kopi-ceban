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
        scale: 2,
        backgroundColor: null, // Transparent/Use CSS
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
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p>Order ID tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 py-12 bg-background relative overflow-hidden">
      <PaymentConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmExit}
      />

      {/* Cancel Order Confirmation Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-destructive/30">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <DialogTitle className="text-xl text-foreground">Batalkan Pesanan?</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Pesanan Anda akan dibatalkan dan tidak dapat dikembalikan.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          {orderCode && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 my-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Order</span>
                <span className="font-mono font-bold text-foreground text-sm">{orderCode}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold text-primary">{order ? formatter.format(order.totalPrice) : '-'}</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
              className="flex-1 h-11 border-input text-foreground hover:bg-accent"
            >
              Kembali
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelOrder}
              disabled={cancelling}
              className="flex-1 h-11"
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
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-lg w-full relative z-10">
        {loading ? (
          <div className="flex flex-col items-center py-10 bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse">Memuat status pesanan...</p>
          </div>
        ) : !order ? (
          <div className="flex flex-col items-center py-10 bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8">
            <XCircle className="w-16 h-16 text-destructive mb-4" />
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Pesanan Tidak Ditemukan</h2>
            <p className="text-muted-foreground text-sm mb-4">Kode: {orderCode}</p>
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
              <h1 className="text-3xl font-serif font-bold text-primary">Pembayaran Berhasil!</h1>
              <p className="text-muted-foreground mt-2">Terima kasih, pesanan Anda akan segera diproses.</p>
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
                className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
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
                className="h-12 border-input text-foreground hover:bg-accent"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                onClick={() => router.push("/menu")}
                variant="outline"
                className="h-12 border-primary/30 text-primary hover:bg-primary/10"
              >
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Pesan Lagi
              </Button>
            </div>
          </div>
        ) : (
          // PENDING / FAILED / EXPIRED
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-10 text-center shadow-2xl">
            <div className="flex flex-col items-center space-y-6">
              {/* Status Icon */}
              <div className="mb-2">
                {order.status === "PENDING" && (
                  <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center ring-4 ring-amber-500/20 animate-pulse">
                    <Clock className="w-12 h-12 text-amber-500" />
                  </div>
                )}
                {(order.status === "EXPIRED" || order.status === "FAILED") && (
                  <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center ring-4 ring-destructive/20">
                    <XCircle className="w-12 h-12 text-destructive" />
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-3xl font-serif font-bold text-primary">
                  {order.status === "PENDING"
                    ? (order.paymentMethod === "CASH" ? "Silakan Bayar di Kasir" : "Menunggu Pembayaran")
                    : "Pesanan Dibatalkan"}
                </h1>
                <p className="text-muted-foreground">
                  {order.status === "PENDING"
                    ? (order.paymentMethod === "CASH" 
                        ? "Tunjukkan kode pesanan ini kepada kasir untuk menyelesaikan pembayaran."
                        : "Silakan selesaikan pembayaran Anda.")
                    : "Maaf, pesanan Anda telah kadaluarsa atau dibatalkan."}
                </p>
              </div>

              {/* Order Info */}
              <div className="w-full bg-secondary/50 rounded-2xl p-4 border border-border space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                  <span className="text-muted-foreground">Order Code</span>
                  <span className="font-mono text-foreground text-xs sm:text-sm">{order.orderCode}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Nama Pemesan</span>
                  <span className="font-medium text-foreground">{order.customerName}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-muted-foreground">Total Tagihan</span>
                  <span className="font-bold text-primary text-lg">
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
                      <div className="bg-gradient-to-br from-card to-background p-6 rounded-2xl border border-primary/20 shadow-xl shadow-primary/5">
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
                                className="text-muted/20"
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
                                      : 'text-primary'
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
                                    : 'text-primary'
                              }`}>
                                {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : '--:--'}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Menit</span>
                            </div>
                          </div>
                          
                          {/* Info Text */}
                          <div className="flex-1 text-center sm:text-left space-y-2">
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-sm font-medium text-green-400">Menunggu Konfirmasi</span>
                            </div>
                            <p className="text-foreground/90 font-medium">
                              Tunjukkan kode pesanan kepada kasir
                            </p>
                            <p className="text-xs text-muted-foreground">
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
                        className="w-full h-11 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all"
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
                          <p className="text-xs text-amber-500/80 leading-relaxed">
                            Status akan update otomatis setiap 5 detik.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-500">Auto-refresh aktif</span>
                          </div>
                        </div>
                      </div>

                      {/* Sandbox Warning */}
                      <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/30 text-left space-y-2">
                        <span className="text-destructive font-bold text-xs uppercase tracking-wider">
                          ⚠️ Mode Sandbox
                        </span>
                        <p className="text-xs text-destructive/90 leading-relaxed">
                          <strong>QRIS Sandbox TIDAK BISA dibayar</strong> menggunakan aplikasi e-wallet asli.
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Untuk testing, gunakan{" "}
                          <strong>Midtrans Dashboard → Transactions → Simulate Payment</strong>.
                        </p>
                        <a
                          href="https://dashboard.sandbox.midtrans.com/transactions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg transition-colors"
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
                  className="w-full h-12 border-input text-foreground hover:bg-accent"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button
                  onClick={() => handleNavigation("/menu")}
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
