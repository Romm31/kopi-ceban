"use server";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

const OrderSchema = z.object({
  customerName: z.string().min(3, "Nama harus minimal 3 karakter"),
  notes: z.string().optional(),
  totalPrice: z.number().min(1, "Total harga tidak valid"),
  items: z.array(
    z.object({
      menu: z.object({
        id: z.number(),
        price: z.number(),
      }),
      quantity: z.number().min(1),
    })
  ).min(1, "Keranjang tidak boleh kosong"),
});

export type OrderState = {
  success: boolean;
  error?: string;
};

export async function submitOrder(data: any): Promise<OrderState> {
  const result = OrderSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const { customerName, notes, totalPrice, items } = result.data;

  try {
    // Recalculate total price on server side to prevent tampering?
    // For now we trust specific menu prices check ideally, but for MVP we trust the sum passed OR ideally re-fetch prices.
    // Let's do a quick re-fetch or at least insertion. The prompt asks to "totalPrice dihitung otomatis" implying maybe server side?
    // "totalPrice dihitung otomatis" usually means derived.
    // Let's robustly calculate it.

    let calculatedTotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      // Ideally we fetch the menu item to get current price
      const menuItem = await prisma.menu.findUnique({ where: { id: item.menu.id } });
      if (!menuItem) {
          throw new Error(`Menu content item ${item.menu.id} not found`);
      }
      calculatedTotal += menuItem.price * item.quantity;
      orderItemsData.push({
        menuId: item.menu.id,
        quantity: item.quantity,
        price: menuItem.price, // Store unit price at time of order
      });
    }

    await prisma.order.create({
      data: {
        customerName,
        notes,
        totalPrice: calculatedTotal,
        status: "PENDING",
        items: {
          create: orderItemsData,
        },
      },
    });

    revalidatePath("/admin/dashboard"); // Update admin dashboard
    return { success: true };
  } catch (error) {
    console.error("Order submission error:", error);
    return { success: false, error: "Gagal menyimpan pesanan" };
  }
}
