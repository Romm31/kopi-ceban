"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const menuSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
})

export async function createMenu(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    description: formData.get("description")?.toString() || undefined,
    price: formData.get("price"),
    imageUrl: formData.get("imageUrl")?.toString() || undefined,
    isAvailable: formData.get("isAvailable") === "on",
  }

  const validatedData = menuSchema.parse(rawData)

  await prisma.menu.create({
    data: validatedData,
  })

  revalidatePath("/admin/menu")
}

export async function updateMenu(id: number, formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    description: formData.get("description")?.toString() || undefined,
    price: formData.get("price"),
    imageUrl: formData.get("imageUrl")?.toString() || undefined,
    isAvailable: formData.get("isAvailable") === "on",
  }

  const validatedData = menuSchema.parse(rawData)

  await prisma.menu.update({
    where: { id },
    data: validatedData,
  })

  revalidatePath("/admin/menu")
}

export async function deleteMenu(id: number) {
  await prisma.menu.delete({
    where: { id },
  })

  revalidatePath("/admin/menu")
}

export async function toggleMenuAvailability(id: number, isAvailable: boolean) {
    await prisma.menu.update({
        where: { id },
        data: { isAvailable }
    })
    revalidatePath("/admin/menu")
}
