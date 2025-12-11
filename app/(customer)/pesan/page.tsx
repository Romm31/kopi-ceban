import { PrismaClient } from "@prisma/client";
import { MenuCard } from "@/components/menu-card";
import { CartDrawer } from "@/components/cart-drawer";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Coffee } from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

async function getAllMenuItems() {
  return await prisma.menu.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function PesanPage() {
  const menuItems = await getAllMenuItems();

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Navbar />
      
      {/* Main Content - Zero Whitespace Design */}
      <main className="flex-1 w-full pt-20">
        {/* Header Section */}
        <div className="w-full bg-gradient-to-b from-primary/5 to-transparent py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2 shadow-lg shadow-primary/10">
              <Coffee className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground tracking-tight">
              Pesan <span className="text-primary">Kopi Favoritmu</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Nikmati racikan kopi terbaik dari biji pilihan. Pilih menu, masukkan ke keranjang, dan kami siap melayani.
            </p>
          </div>
        </div>

        {/* Menu + Cart Layout */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Menu Grid - Full width on mobile/tablet, 8/12 on desktop */}
              <div className="lg:col-span-8">
                {menuItems.length === 0 ? (
                  <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border animate-fade-in shadow-lg">
                    <Coffee className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                    <p className="text-muted-foreground text-lg">Menu belum tersedia saat ini.</p>
                    <p className="text-muted-foreground/60 text-sm mt-2">Silakan kembali lagi nanti.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {menuItems.map((item, index) => (
                      <MenuCard key={item.id} menu={item} index={index} />
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Sidebar - Desktop Only */}
              <div className="hidden lg:block lg:col-span-4">
                <CartDrawer />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Cart handled by CartDrawer component */}
        <div className="lg:hidden">
          <CartDrawer />
        </div>
      </main>

      <Footer />
    </div>
  );
}
