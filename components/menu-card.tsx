"use client";

import { Menu } from "@prisma/client";
import { Plus, Check, Coffee } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";

interface MenuCardProps {
  menu: Menu;
  index?: number;
}

export function MenuCard({ menu, index = 0 }: MenuCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleAddToCart = () => {
    if (menu.isAvailable) {
      setIsAdding(true);
      addItem(menu);
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  // Format price to IDR
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  return (
    <Card 
        className={cn(
            "group overflow-hidden bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 ease-out rounded-2xl flex flex-col relative animate-fade-in hover:-translate-y-2 h-full",
        )}
        style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
        {menu.imageUrl ? (
          <Image
            src={menu.imageUrl}
            alt={menu.name}
            fill
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.15] group-hover:brightness-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index < 6}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20 bg-muted/10">
            <Coffee className="w-12 h-12 mb-2" />
            <span className="text-xs">Tidak Ada Gambar</span>
          </div>
        )}
        {!menu.isAvailable && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10 transition-all">
            <Badge variant="destructive" className="text-sm font-bold px-5 py-2 shadow-2xl shadow-destructive/50 border border-destructive/20 animate-pulse">
              HABIS
            </Badge>
          </div>
        )}
        
        {/* Quick Add Button Overlay for Desktop Hover */}
        {menu.isAvailable && (
             <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden md:block">
                 <Button 
                    size="icon" 
                    className="h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-300"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart();
                    }}
                 >
                     {isAdding ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                 </Button>
             </div>
        )}
      </div>

      <CardContent className="p-5 flex-grow flex flex-col justify-between gap-3">
        <div className="space-y-2">
            <h3 className="font-bold text-base sm:text-lg text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                {menu.name}
            </h3>
            <p className="font-bold text-primary text-lg sm:text-xl tracking-tight">
                {formatter.format(menu.price)}
            </p>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
          {menu.description || "Nikmati cita rasa kopi terbaik dari Kopi Ceban."}
        </p>
      </CardContent>

      <CardFooter className="p-5 pt-0 md:hidden">
        <Button
          onClick={handleAddToCart}
          disabled={!menu.isAvailable}
          className={cn(
            "w-full h-11 font-bold text-sm rounded-xl transition-all duration-300 active:scale-95",
            menu.isAvailable
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              : "opacity-40 cursor-not-allowed bg-muted"
          )}
        >
          {menu.isAvailable ? (
            <span className="flex items-center justify-center gap-2">
              {isAdding ? (
                <>
                  <Check className="w-4 h-4" /> 
                  <span className="font-bold">Ditambahkan!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> 
                  <span className="font-bold">Tambah ke Keranjang</span>
                </>
              )}
            </span>
          ) : (
            <span className="font-bold">Stok Habis</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
