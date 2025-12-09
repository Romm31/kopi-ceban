import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("password123", 10)

  try {
    const admin = await prisma.admin.upsert({
      where: { username: "admin" },
      update: { password },
      create: {
        username: "admin",
        password: 'password',
      },
    })
    console.log("Admin user created/updated:", admin)
  } catch (error) {
    console.error("Error creating admin user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
