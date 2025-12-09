import Link from 'next/link'
import { prisma } from "@/lib/prisma"
import MenuForm from "@/components/form/MenuForm"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMenuPage({ params }: PageProps) {
  const { id } = await params
  
  const menu = await prisma.menu.findUnique({
    where: { id: parseInt(id) },
  })

  if (!menu) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Menu</h1>
      <MenuForm initialData={menu} />
    </div>
  )
}
