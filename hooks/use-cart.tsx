"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Menu } from "@prisma/client";
import { toast } from "sonner"; // Assuming sonner is installed as per package.json

export type CartItem = {
  menu: Menu;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (menu: Menu) => void;
  removeItem: (menuId: number) => void;
  updateQuantity: (menuId: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    setIsClient(true);
    const savedCart = localStorage.getItem("kopi-ceban-cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from local storage", error);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("kopi-ceban-cart", JSON.stringify(items));
    }
  }, [items, isClient]);

  const addItem = (menu: Menu) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.menu.id === menu.id);
      if (existing) {
        toast.success(`Updated ${menu.name} quantity in cart`);
        return prev.map((item) =>
          item.menu.id === menu.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success(`Added ${menu.name} to cart`);
      return [...prev, { menu, quantity: 1 }];
    });
  };

  const removeItem = (menuId: number) => {
    setItems((prev) => prev.filter((item) => item.menu.id !== menuId));
  };

  const updateQuantity = (menuId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.menu.id === menuId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalPrice = items.reduce(
    (total, item) => total + item.menu.price * item.quantity,
    0
  );

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
