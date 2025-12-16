"use client";

import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/components/cart-item";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckoutForm } from "@/components/checkout-form";

// Declare Snap type for TypeScript
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

interface CartDrawerProps {
  tableFromQR?: number | null;
  tableNameFromQR?: string | null;
}

export function CartDrawer({ tableFromQR, tableNameFromQR }: CartDrawerProps = {}) {
  const { items, totalPrice, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  const handleProcessOrder = async (data: {
    customerName: string;
    notes: string;
    tableId: number | null;
    takeAway: boolean;
    orderType: string;
    tableNumber: number | null;
    paymentMethod: "CASH" | "TRANSFER";
  }) => {
    if (items.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }

    setIsProcessing(true);

    try {
      // Call API Endpoint to get Snap Token
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: data.customerName,
          notes: data.notes,
          tableId: data.tableId,
          takeAway: data.takeAway,
          orderType: data.orderType,
          tableNumber: data.tableNumber,
          paymentMethod: data.paymentMethod,
          items: items.map(item => ({
            menuId: item.menu.id,
            name: item.menu.name,
            price: item.menu.price,
            quantity: item.quantity,
          })),
          totalPrice,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.details || result.error || "Gagal membuat pesanan";
        toast.error(errorMsg, { duration: 5000 });
        console.error("Order creation failed:", result);
        return;
      }

      // Handle Cash Payment - redirect directly to thank-you
      if (data.paymentMethod === "CASH" && result.success) {
        setIsOpen(false);
        toast.success("Pesanan berhasil dibuat! Silakan bayar di kasir 💵");
        clearCart();
        router.push(`/pesan/thank-you?order_id=${result.orderCode}`);
        return;
      }

      // Handle Transfer Payment - use Midtrans
      if (result.success && result.snapToken) {
        // Close the cart drawer first
        setIsOpen(false);
        
        // Check if Snap is loaded
        if (typeof window.snap === 'undefined') {
          toast.error("Payment system not loaded. Please refresh and try again.");
          setIsProcessing(false);
          return;
        }

        // Open Snap Pop-up
        window.snap.pay(result.snapToken, {
          onSuccess: (snapResult: any) => {
            console.log("Payment Success:", snapResult);
            toast.success("Pembayaran berhasil! 🎉");
            clearCart();
            router.push(`/pesan/thank-you?order_id=${result.orderCode}`);
          },
          onPending: (snapResult: any) => {
            console.log("Payment Pending:", snapResult);
            toast.info("Menunggu pembayaran...");
            clearCart();
            router.push(`/pesan/thank-you?order_id=${result.orderCode}`);
          },
          onError: (snapResult: any) => {
            console.error("Payment Error:", snapResult);
            toast.error("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => {
            console.log("Snap closed without completing payment");
            toast.info("Pembayaran dibatalkan");
          },
        });
      } else if (!result.success) {
        const errorMsg = result.details || result.error || "Gagal membuat pesanan";
        toast.error(errorMsg, { duration: 5000 });
        console.error("Order creation failed:", result);
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error("Terjadi kesalahan sistem. Coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const CartContents = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-card/95 backdrop-blur-md">
      {/* Header */}
      <div className="p-5 border-b border-border/50 bg-gradient-to-b from-card to-card/80 flex justify-between items-center shrink-0 shadow-sm">
        <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <span>Keranjang</span>
          {items.length > 0 && (
            <span className="px-2.5 py-0.5 text-xs font-bold bg-primary/20 text-primary rounded-full border border-primary/30">
              {items.length}
            </span>
          )}
        </h2>
      </div>

      {/* Items List */}
      <div className="flex-1 px-4 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground animate-fade-in">
            <div className="p-6 bg-muted/20 rounded-full mb-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
            </div>
            <p className="font-semibold text-base">Keranjang kosong</p>
            <p className="text-sm opacity-60 mt-1">Yuk pilih kopi favoritmu!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0 py-3">
            <AnimatePresence initial={false} mode="popLayout">
                {items.map((item) => (
                <motion.div
                    key={item.menu.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, x: -20, transition: { duration: 0.25 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <CartItem item={item} />
                </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer / Checkout Form - Scrollable for long forms */}
      <div className="border-t border-border/50 bg-gradient-to-t from-card to-card/80 shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.2)] z-10 max-h-[60vh] overflow-y-auto">
        {items.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
                <CheckoutForm 
                    totalPrice={totalPrice} 
                    disabled={items.length === 0}
                    onSubmit={handleProcessOrder}
                    tableFromQR={tableFromQR}
                    tableNameFromQR={tableNameFromQR}
                />
            </motion.div>
        )}
      </div>
    </div>
  );

  // Mobile Bottom Sheet Trigger (Sticky Bottom)
  const MobileTrigger = () => {
    // Only show if items exist
    if (items.length === 0) return null;
    
    return (
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur-xl border-t border-border/50 lg:hidden z-50 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.3)]"
      >
         <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 h-16 font-bold shadow-2xl shadow-primary/40 rounded-2xl relative overflow-hidden group transition-all active:scale-[0.98]">
                     {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                    
                    <div className="flex justify-between w-full items-center px-3 relative z-10">
                        <div className="flex items-center gap-2 bg-black/25 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                            <ShoppingBag className="w-5 h-5" />
                            <span className="font-bold text-sm">{items.length}</span>
                        </div>
                        <span className="text-base sm:text-lg font-bold">
                             Lihat Keranjang
                        </span>
                        <div className="font-mono font-bold bg-black/25 px-4 py-2 rounded-xl text-sm sm:text-base backdrop-blur-sm border border-white/10">
                             {formatter.format(totalPrice)}
                        </div>
                    </div>
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="p-0 border-t-2 border-primary/20 bg-card/98 backdrop-blur-xl h-[90vh] rounded-t-3xl overflow-hidden focus-visible:outline-none shadow-2xl">
                <CartContents isMobile={true} />
            </SheetContent>
        </Sheet>
      </motion.div>
    );
  }

  return (
    <>
      {/* Desktop Sidebar View - Sticky */}
      <div className="hidden lg:block h-[calc(100vh-140px)] sticky top-28 rounded-2xl overflow-hidden border-2 border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl shadow-black/20 hover:shadow-3xl hover:shadow-primary/5 transition-shadow duration-300">
        <CartContents />
      </div>

      {/* Mobile Trigger and Sheet */}
      <AnimatePresence>
        {items.length > 0 && <MobileTrigger />}
      </AnimatePresence>
    </>
  );
}
