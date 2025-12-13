"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Clock, Home, UtensilsCrossed, AlertCircle } from "lucide-react";
import { PaymentConfirmationModal } from "@/components/payment-confirmation-modal";

type OrderStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";

interface OrderData {
  customerName: string;
  totalPrice: number;
  status: OrderStatus;
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("order_id") || searchParams.get("orderCode"); // Midtrans sends order_id
  const router = useRouter();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);

  // Polling Logic
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
          // If PAID, stop polling (optional optimization, but user might stay so keep polling if needed? 
          // Usually better to stop if terminal state)
          if (data.status === 'PAID' || data.status === 'EXPIRED' || data.status === 'CANCELLED') {
            // Stop polling or slow it down? 
            // For now, let's keep it simple.
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus(); // Initial fetch
    const interval = setInterval(fetchStatus, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [orderCode]);

  const handleNavigation = (path: string) => {
    // If not paid, confirm first
    if (order?.status !== 'PAID' && order?.status !== 'CANCELLED' && order?.status !== 'EXPIRED') {
      setTargetPath(path);
      setShowConfirmModal(true);
    } else {
      router.push(path);
    }
  };

  const confirmExit = () => {
     setShowConfirmModal(false);
     if (targetPath) router.push(targetPath);
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

      <div className="max-w-lg w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 text-center shadow-2xl relative z-10">
        
        {loading ? (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-12 h-12 text-[#d4a857] animate-spin mb-4" />
            <p className="text-neutral-400 animate-pulse">Memuat status pesanan...</p>
          </div>
        ) : !order ? (
          <div className="flex flex-col items-center py-10">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-serif font-bold text-white mb-2">Pesanan Tidak Ditemukan</h2>
            <Button onClick={() => router.push('/')} variant="outline" className="mt-4">Kembali ke Home</Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            
            {/* Status Icon */}
            <div className="mb-2">
                {order.status === 'PAID' && (
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center ring-4 ring-green-500/20 animate-scale-in">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                )}
                {order.status === 'PENDING' && (
                    <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center ring-4 ring-amber-500/20 animate-pulse">
                        <Clock className="w-12 h-12 text-amber-500" />
                    </div>
                )}
                {(order.status === 'EXPIRED' || order.status === 'CANCELLED') && (
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center ring-4 ring-red-500/20">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                )}
            </div>

            {/* Title & Desc */}
            <div className="space-y-2">
                <h1 className="text-3xl font-serif font-bold text-[#d4a857]">
                    {order.status === 'PAID' ? 'Pembayaran Berhasil!' : 
                     order.status === 'PENDING' ? 'Menunggu Pembayaran' : 
                     'Pesanan Dibatalkan'}
                </h1>
                <p className="text-neutral-300">
                    {order.status === 'PAID' ? 'Terima kasih, pesanan Anda akan segera diproses.' : 
                     order.status === 'PENDING' ? 'Silakan selesaikan pembayaran Anda.' : 
                     'Maaf, pesanan Anda telah kadaluarsa atau dibatalkan.'}
                </p>
            </div>

            {/* Order Details Card */}
            <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-neutral-400">Order Code</span>
                    <span className="font-mono text-white text-xs sm:text-sm">{orderCode}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Nama Pemesan</span>
                    <span className="font-medium text-white">{order.customerName}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-neutral-400">Total Tagihan</span>
                    <span className="font-bold text-[#d4a857] text-lg">{formatter.format(order.totalPrice)}</span>
                </div>
            </div>
            
            {/* Payment Warning (Only if Pending) */}
            {order.status === 'PENDING' && (
                <div className="space-y-3 w-full">
                    <div className="flex gap-3 items-start bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-left">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-200/80 leading-relaxed">
                            Mohon tidak menutup halaman ini sebelum pembayaran terkonfirmasi. Status akan update otomatis.
                        </p>
                    </div>
                    
                    {/* SANDBOX WARNING - CRITICAL */}
                    <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30 text-left space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-red-400 font-bold text-xs uppercase tracking-wider">⚠️ Mode Sandbox</span>
                        </div>
                        <p className="text-xs text-red-200/90 leading-relaxed">
                            <strong>QRIS Sandbox TIDAK BISA dibayar</strong> menggunakan aplikasi e-wallet asli (DANA, OVO, GoPay, ShopeePay, dll).
                        </p>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            Untuk testing, gunakan <strong>Midtrans Dashboard → Transactions → Simulate Payment</strong>.
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
                    className="w-full h-12 border-white/10 text-white hover:bg-white/5 hover:text-white"
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
        )}
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#13110f] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#d4a857]" />
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
