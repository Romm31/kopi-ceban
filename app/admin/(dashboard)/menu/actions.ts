"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const menuSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  price: z.coerce.number().min(1),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
})

export async function createMenu(formData: FormData) {
  const values = Object.fromEntries(formData.entries())
  
  // Handle checkbox
  const isAvailable = formData.get("isAvailable") === "on"
  
  const parsed = menuSchema.safeParse({
    ...values,
    isAvailable,
  })

  if (!parsed.success) {
    return { error: "Invalid data" }
  }

  try {
    const menu = await prisma.menu.create({
      data: parsed.data,
    })
    revalidatePath("/admin/menu")
    return { success: "Menu created" }
  } catch (error) {
    return { error: "Failed to create menu" }
  }
}

export async function updateMenu(id: number, formData: FormData) {
  const values = Object.fromEntries(formData.entries())
  
  // Handle checkbox
  const isAvailable = formData.get("isAvailable") === "on"

  const parsed = menuSchema.safeParse({
    ...values,
    isAvailable,
  })

  if (!parsed.success) {
    return { error: "Invalid data" }
  }

  try {
    await prisma.menu.update({
      where: { id },
      data: parsed.data,
    })
    revalidatePath("/admin/menu")
    return { success: "Menu updated" }
  } catch (error) {
    return { error: "Failed to update menu" }
  }
}

export async function deleteMenu(id: number) {
  try {
    await prisma.menu.delete({
      where: { id },
    })
    revalidatePath("/admin/menu")
    return { success: "Menu deleted" }
  } catch (error) {
    return { error: "Failed to delete menu. It might be used in orders." }
  }
}
