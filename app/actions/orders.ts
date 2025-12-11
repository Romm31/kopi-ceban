"use server"

import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  })

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/dashboard")
}
