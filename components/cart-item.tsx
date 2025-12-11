"use client";

import { CartItem as CartItemType, useCart } from "@/hooks/use-cart";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Image from "next/image";

interface CartItemProps {
  item: CartItemType;
  isReadOnly?: boolean;
}

export function CartItem({ item, isReadOnly = false }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { menu, quantity } = item;

  // Format price
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0">
      {/* Image */}
      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted/20">
        {menu.imageUrl && (
          <Image
            src={menu.imageUrl}
            alt={menu.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-foreground text-sm line-clamp-1">
            {menu.name}
          </h4>
          <span className="text-primary font-semibold text-sm whitespace-nowrap">
            {formatter.format(menu.price * quantity)}
          </span>
        </div>
        
        {!isReadOnly && (
          <div className="flex justify-between items-end mt-2">
            <QuantityStepper
              value={quantity}
              onIncrease={() => updateQuantity(menu.id, quantity + 1)}
              onDecrease={() => updateQuantity(menu.id, quantity - 1)}
              className="scale-90 origin-left"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-transparent"
              onClick={() => removeItem(menu.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {isReadOnly && (
          <div className="text-muted-foreground text-xs mt-1">
            Qty: {quantity} x {formatter.format(menu.price)}
          </div>
        )}
      </div>
    </div>
  );
}
