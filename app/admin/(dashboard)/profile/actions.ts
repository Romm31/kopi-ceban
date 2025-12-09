"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from "bcrypt"
import { z } from "zod"

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function changePassword(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.name) {
    return { error: "Unauthorized" }
  }

  const values = Object.fromEntries(formData.entries())
  const parsed = changePasswordSchema.safeParse(values)

  if (!parsed.success) {
    return { error: "Invalid input" }
  }

  const { currentPassword, newPassword } = parsed.data

  const admin = await prisma.admin.findUnique({
    where: { username: session.user.name },
  })

  if (!admin) {
    return { error: "Admin not found" }
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, admin.password)

  if (!isPasswordValid) {
    return { error: "Incorrect current password" }
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10)

  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: hashedNewPassword },
  })

  return { success: "Password updated successfully" }
}
