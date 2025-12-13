"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, UtensilsCrossed } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PaymentConfirmationModal } from "@/components/payment-confirmation-modal";

export default function SuccessPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);

  // Prevent back button
  useEffect(() => {
    // Push a new entry to history stack so we can intercept the back button
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      // Prevent actual navigation back
      window.history.pushState(null, "", window.location.href);
      setShowModal(true);
      setTargetPath(null); // Back button doesn't have a specific target path usually, or we could default to home
    };

    window.addEventListener("popstate", handlePopState);

    // Prompt before unloading (e.g. closing tab) - optional but good for payment
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleNavigation = (path: string) => {
    setTargetPath(path);
    setShowModal(true);
  };

  const confirmExit = () => {
    if (targetPath) {
      router.push(targetPath);
    } else {
      // If triggered by back button (targetPath is null), maybe just close modal or go home?
      // Requirement says "redirect to destination". If back button, usually means "leave", 
      // but strictly following "Tombol... HARUS memanggil modal", back button is implicit exit.
      // If we are confirming exit from back button, let's go to Home as a safe fallback.
      router.push("/");
    }
  };

  return (
    <div className="min-h-[90vh] w-full flex items-center justify-center p-4 py-12 animate-fade-in relative overflow-hidden">
      
      <PaymentConfirmationModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmExit}
      />

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-coffee-dark/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-xl w-full bg-card/50 backdrop-blur-md border border-border/60 rounded-3xl p-6 sm:p-10 text-center shadow-2xl shadow-black/20 relative z-10 animate-slide-up">
        
        <div className="flex flex-col items-center space-y-8">
          
          {/* Header Section */}
          <div className="space-y-3">
             <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center ring-4 ring-green-500/20 animate-scale-in mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
             </div>
             <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight">
               Pesanan Diterima!
             </h1>
             <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto">
               Terima kasih telah memesan di Kopi Ceban. Silakan selesaikan pembayaran.
             </p>
          </div>

          {/* QRIS Section */}
          <div className="relative group w-full flex justify-center animate-scale-in" style={{ animationDelay: "150ms" }}>
             <div className="relative w-[220px] sm:w-[320px] bg-white p-4 rounded-2xl shadow-xl shadow-primary/10 border-2 border-primary/30 group-hover:border-primary transition-all duration-500 group-hover:shadow-primary/30 transform group-hover:-translate-y-1">
                {/* Gold Frame Effect */}
                <div className="absolute inset-0 border border-coffee-gold/20 rounded-2xl m-1 pointer-events-none" />
                
                <div className="relative aspect-[3/4] w-full bg-white rounded-xl overflow-hidden">
                   <Image 
                      src="/QRIS/Qris.png" 
                      alt="Scan QRIS Kopi Ceban" 
                      fill
                      className="object-contain p-2"
                      priority
                   />
                </div>
                <div className="mt-3 text-center border-t border-dashed border-gray-200 pt-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scan to Pay</p>
                    <p className="text-sm font-bold text-coffee-dark mt-1">Kopi Ceban Official</p>
                </div>
             </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <p className="font-medium text-foreground text-lg">Scan QRIS di atas</p>
              <p className="text-sm text-neutral-400">Tunjukkan bukti bayar ke kasir / barista</p>
              <p className="text-xs text-amber-500/80 mt-2 font-medium">⚠️ Jangan tinggalkan halaman sampai pembayaran selesai.</p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4 w-full pt-4 animate-slide-up" style={{ animationDelay: "400ms" }}>
             <div className="w-full">
                <Button 
                    variant="outline" 
                    onClick={() => handleNavigation("/")}
                    className="w-full h-12 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors text-base font-medium"
                >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                </Button>
             </div>
             <div className="w-full">
                <Button 
                    onClick={() => handleNavigation("/menu")}
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 text-base font-bold"
                >
                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                    Menu
                </Button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

