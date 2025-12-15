import { prisma } from "@/lib/prisma";
import { CartDrawer } from "@/components/cart-drawer";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Coffee, UtensilsCrossed } from "lucide-react";
import { PesanClient } from "@/components/pesan-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAllMenuItems() {
  return await prisma.menu.findMany({
    where: { isAvailable: true },
    orderBy: { id: "asc" }, // Stable ordering to prevent hydration mismatch
  });
}

async function getTableById(tableId: number) {
  return await prisma.table.findUnique({
    where: { id: tableId },
  });
}

interface PesanPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PesanPage({ searchParams }: PesanPageProps) {
  const menuItems = await getAllMenuItems();
  const params = await searchParams;
  
  // Check for table parameter from QR code
  const tableParam = params.table;
  let tableFromQR: number | null = null;
  let tableNameFromQR: string | null = null;
  let tableError: string | null = null;

  if (tableParam && typeof tableParam === "string") {
    const tableId = parseInt(tableParam);
    if (!isNaN(tableId)) {
      const table = await getTableById(tableId);
      if (table) {
        if (table.status === "AVAILABLE") {
          tableFromQR = table.id;
          tableNameFromQR = table.name;
        } else if (table.status === "OCCUPIED") {
          tableError = `${table.name} sedang digunakan. Silakan pilih meja lain.`;
        } else if (table.status === "RESERVED") {
          tableError = `${table.name} sedang direservasi.`;
        } else if (table.status === "CLEANING") {
          tableError = `${table.name} sedang dibersihkan.`;
        }
      } else {
        tableError = "Meja tidak ditemukan.";
      }
    }
  }

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

            {/* Table Indicator from QR */}
            {tableFromQR && tableNameFromQR && (
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl border-2 border-primary/30 shadow-lg shadow-primary/10 mt-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <UtensilsCrossed className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-primary/80 font-medium uppercase tracking-wider">Dine In</p>
                  <p className="text-lg font-bold text-foreground">{tableNameFromQR}</p>
                </div>
              </div>
            )}

            {/* Table Error */}
            {tableError && (
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-destructive/10 rounded-2xl border-2 border-destructive/30 shadow-lg mt-4">
                <p className="text-destructive font-medium">{tableError}</p>
              </div>
            )}
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
                <CartDrawer 
                  tableFromQR={tableFromQR} 
                  tableNameFromQR={tableNameFromQR}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Cart */}
        <div className="lg:hidden">
          <CartDrawer 
            tableFromQR={tableFromQR} 
            tableNameFromQR={tableNameFromQR}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
