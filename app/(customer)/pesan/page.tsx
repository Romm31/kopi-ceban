import { PrismaClient } from "@prisma/client";
import { CartDrawer } from "@/components/cart-drawer";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Coffee } from "lucide-react";
import { PesanClient } from "@/components/pesan-client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

async function getAllMenuItems() {
  return await prisma.menu.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function PesanPage() {
  const menuItems = await getAllMenuItems();

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1 w-full pt-20">
        {/* Header Section */}
        <div className="w-full bg-gradient-to-b from-primary/5 via-primary/3 to-transparent py-12 px-4 sm:px-6 lg:px-8 border-b border-border/30">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2 shadow-lg shadow-primary/10">
              <Coffee className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground tracking-tight">
              Pesan <span className="text-primary">Kopi Favoritmu</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Temukan menu favorit, cari dengan mudah, dan filter sesuai keinginan. Ratusan pelanggan puas setiap hari!
            </p>
          </div>
        </div>

        {/* Menu + Cart Layout */}
        <div className="w-full">
          <div className="max-w-[1920px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
              {/* Menu Section - Client Component */}
              <div className="lg:col-span-8 xl:col-span-9">
                <PesanClient initialMenuItems={menuItems} />
              </div>

              {/* Cart Sidebar - Desktop Only */}
              <div className="hidden lg:block lg:col-span-4 xl:col-span-3 px-4 py-8">
                <CartDrawer />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Cart */}
        <div className="lg:hidden">
          <CartDrawer />
        </div>
      </main>

      <Footer />
    </div>
  );
}
