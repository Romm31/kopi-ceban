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
            "group overflow-hidden bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 ease-out rounded-xl flex flex-col p-0 h-full", 
            // Explicitly added p-0 to force no padding on main container
        )}
    >
      {/* 
          IMAGE WRAPPER - MUST BE FIRST CHILD 
          Relative position for absolute badges.
          Aspect Square enforced.
          Width full.
      */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/20">
        {menu.imageUrl ? (
          <img
            src={menu.imageUrl}
            alt={menu.name}
            className="object-cover object-center w-full h-full transition-all duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 bg-muted/20">
            <Coffee className="w-10 h-10 mb-1" />
          </div>
        )}
        
        {/* Overlays (Sold Out) */}
        {!menu.isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <Badge variant="destructive" className="text-xs font-bold px-3 py-1 shadow-lg border border-destructive/20">
              HABIS
            </Badge>
          </div>
        )}
        
        {/* Badges - Absolute Top Left inside the image wrapper */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20">
          {menu.id % 3 === 0 && menu.isAvailable && (
            <Badge className="bg-amber-500 text-white border-none shadow-sm text-[10px] font-bold px-2 py-0.5 h-auto self-start">
              Best Seller
            </Badge>
          )}
          
          {menu.id % 5 === 0 && menu.isAvailable && (
            <Badge className="bg-red-500 text-white border-none shadow-sm text-[10px] font-bold px-2 py-0.5 h-auto animate-pulse self-start">
              Promo
            </Badge>
          )}
        </div>
        
        {/* Quick Add Button Overlay for Desktop Hover */}
        {menu.isAvailable && (
             <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden md:block z-20">
                 <Button 
                    size="icon" 
                    className="h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart();
                    }}
                 >
                     {isAdding ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                 </Button>
             </div>
        )}
      </div>

      {/* CONTENT SECTION */}
      <div className="p-3 flex-grow flex flex-col gap-1.5">
        <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                {menu.name}
            </h3>
        </div>
        
        <p className="text-[10px] sm:text-xs text-muted-foreground/70 line-clamp-1 leading-relaxed">
          {menu.description || "Nikmati kopi terbaik kami."}
        </p>

        <p className="font-bold text-primary text-base sm:text-lg tracking-tight mt-auto pt-1">
            {formatter.format(menu.price)}
        </p>
      </div>

      {/* FOOTER BUTTON (Mobile Only) */}
      <div className="p-3 pt-0 md:hidden">
        <Button
          onClick={handleAddToCart}
          disabled={!menu.isAvailable}
          className={cn(
            "w-full h-9 font-bold text-xs rounded-lg transition-all duration-300 active:scale-95",
            menu.isAvailable
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
              : "opacity-50 cursor-not-allowed bg-muted"
          )}
        >
          {menu.isAvailable ? (
            <span className="flex items-center justify-center gap-1.5">
              {isAdding ? (
                <>
                  <Check className="w-3.5 h-3.5" /> 
                  <span className="font-bold">Ditambahkan</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> 
                  <span className="font-bold">Tambah</span>
                </>
              )}
            </span>
          ) : (
            <span className="font-bold text-xs">Habis</span>
          )}
        </Button>
      </div>
    </Card>
  );
}
