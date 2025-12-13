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
            "group overflow-hidden bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 ease-out rounded-xl sm:rounded-2xl flex flex-col relative animate-fade-in hover:-translate-y-1 hover:scale-[1.02] h-full",
        )}
        style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
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
        
        {/* Top Left Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {/* Best Seller Badge - Show for items with id % 3 === 0 (dummy logic) */}
          {menu.id % 3 === 0 && menu.isAvailable && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none shadow-lg shadow-amber-500/30 text-xs font-bold px-3 py-1">
              ⭐ Best Seller
            </Badge>
          )}
          
          {/* Promo Badge - Show for items with id % 5 === 0 (dummy logic) */}
          {menu.id % 5 === 0 && menu.isAvailable && (
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none shadow-lg shadow-red-500/30 text-xs font-bold px-3 py-1 animate-pulse">
              🔥 PROMO
            </Badge>
          )}
        </div>

        {/* Available Badge - Top Right */}
        {menu.isAvailable && (
          <div className="absolute top-3 right-3 z-20">
            <Badge className="bg-emerald-500/90 backdrop-blur-sm text-white border-none shadow-lg text-xs font-bold px-3 py-1">
              Tersedia
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

      <CardContent className="p-3 sm:p-4 flex-grow flex flex-col justify-between gap-2">
        <div className="space-y-1.5 sm:space-y-2">
            <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                {menu.name}
            </h3>
            
            {/* Rating Stars (Dummy 4.8) */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${star <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">4.8</span>
            </div>
            
            <p className="font-bold text-primary text-base sm:text-lg tracking-tight">
                {formatter.format(menu.price)}
            </p>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed hidden sm:block">
          {menu.description || "Nikmati cita rasa kopi terbaik dari Kopi Ceban."}
        </p>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0 md:hidden">
        <Button
          onClick={handleAddToCart}
          disabled={!menu.isAvailable}
          className={cn(
            "w-full h-9 sm:h-10 font-bold text-xs sm:text-sm rounded-lg transition-all duration-300 active:scale-95",
            menu.isAvailable
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
              : "opacity-40 cursor-not-allowed bg-muted"
          )}
        >
          {menu.isAvailable ? (
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              {isAdding ? (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                  <span className="font-bold hidden sm:inline">Ditambahkan!</span>
                  <span className="font-bold sm:hidden">✓</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                  <span className="font-bold">Tambah</span>
                </>
              )}
            </span>
          ) : (
            <span className="font-bold text-xs">Habis</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
