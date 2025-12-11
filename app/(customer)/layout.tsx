import { Navbar } from "@/components/navbar";
import { CartProvider } from "@/hooks/use-cart";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary overflow-x-hidden">
        <Navbar />
        <main className="flex-1 pt-20 flex flex-col relative w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </CartProvider>
  );
}
