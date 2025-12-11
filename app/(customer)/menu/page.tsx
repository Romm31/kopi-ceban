import { PrismaClient } from "@prisma/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Coffee, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

async function getAllMenuItems() {
  return await prisma.menu.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function MenuPage() {
  const menuItems = await getAllMenuItems();

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full pt-20">
        {/* Header Section */}
        <div className="w-full bg-gradient-to-b from-primary/5 to-transparent py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2 shadow-lg shadow-primary/10">
              <Coffee className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground tracking-tight">
              Menu <span className="text-primary">Kopi Ceban</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Jelajahi berbagai pilihan kopi premium kami. Dari espresso klasik hingga racikan spesial, semua dibuat dengan penuh dedikasi.
            </p>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {menuItems.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border animate-fade-in shadow-lg">
                <Coffee className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                <p className="text-muted-foreground text-lg">Menu belum tersedia saat ini.</p>
                <p className="text-muted-foreground/60 text-sm mt-2">Silakan kembali lagi nanti.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="group overflow-hidden bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 ease-out rounded-2xl flex flex-col relative animate-fade-in hover:-translate-y-2"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.15] group-hover:brightness-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          priority={index < 8}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20 bg-muted/10">
                          <Coffee className="w-12 h-12 mb-2" />
                          <span className="text-xs">Tidak Ada Gambar</span>
                        </div>
                      )}
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10 transition-all">
                          <Badge variant="destructive" className="text-sm font-bold px-5 py-2 shadow-2xl shadow-destructive/50 border border-destructive/20 animate-pulse">
                            HABIS
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-grow flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                          {item.name}
                        </h3>
                        <p className="font-bold text-primary text-xl tracking-tight">
                          {formatter.format(item.price)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed">
                        {item.description || "Nikmati cita rasa kopi terbaik dari Kopi Ceban."}
                      </p>

                      {/* CTA Button */}
                      <Link href="/pesan" className="mt-2">
                        <Button
                          disabled={!item.isAvailable}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 font-bold h-11 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {item.isAvailable ? (
                            <span className="flex items-center justify-center gap-2">
                              Pesan Sekarang
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          ) : (
                            "Stok Habis"
                          )}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
