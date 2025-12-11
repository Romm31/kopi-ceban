import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft, Coffee } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-2xl shadow-primary/5 relative overflow-hidden group">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />

        <div className="relative z-10 space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center ring-4 ring-green-500/20 animate-scale-in">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Pesanan Diterima!
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Terima kasih telah memesan di Kopi Ceban. Barista kami akan segera menyiapkan pesananmu.
            </p>
          </div>

          <div className="bg-popover border border-border rounded-xl p-5 text-sm text-left space-y-3 animate-slide-up hover:border-primary/30 transition-colors" style={{ animationDelay: "200ms" }}>
             <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Coffee className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground text-base">Mohon Ditunggu</h3>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                        Pesanan biasanya siap dalam 10-15 menit. Silakan lakukan pembayaran di kasir jika diperlukan.
                    </p>
                </div>
             </div>
          </div>

          <div className="pt-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
             <Link href="/pesan" className="block w-full">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 text-base shadow-lg shadow-primary/10 transition-all active:scale-[0.98]">
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Pesan Lagi
                </Button>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
