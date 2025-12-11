"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcrypt"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function updateAdminPassword(adminId: number, formData: FormData) {
  const rawData = {
    currentPassword: formData.get("currentPassword")?.toString() || undefined,
    newPassword: formData.get("newPassword")?.toString() || undefined,
    confirmPassword: formData.get("confirmPassword")?.toString() || undefined,
  }

  const validatedData = passwordSchema.safeParse(rawData)
  
  if (!validatedData.success) {
      return { error: validatedData.error.flatten().fieldErrors }
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
  })

  if (!admin) {
    return { error: "Admin not found" }
  }

  const isPasswordValid = await bcrypt.compare(validatedData.data.currentPassword, admin.password)

  if (!isPasswordValid) {
    return { error: { currentPassword: ["Incorrect current password"] } }
  }

  const hashedPassword = await bcrypt.hash(validatedData.data.newPassword, 10)

  await prisma.admin.update({
    where: { id: adminId },
    data: { password: hashedPassword },
  })

  revalidatePath("/admin/profile")
  return { success: true }
}
