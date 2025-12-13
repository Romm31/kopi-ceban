import { Navbar } from "@/components/navbar";
import { CartProvider } from "@/hooks/use-cart";
import Script from "next/script";

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || process.env.MIDTRANS_CLIENT_KEY;
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";
const SNAP_URL = MIDTRANS_IS_PRODUCTION 
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {/* Midtrans Snap Script */}
      <Script
        src={SNAP_URL}
        data-client-key={MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <div className="flex flex-col min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary overflow-x-hidden">
        <Navbar />
        <main className="flex-1 pt-20 flex flex-col relative w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </CartProvider>
  );
}
