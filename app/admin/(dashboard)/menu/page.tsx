import { prisma } from "@/lib/prisma"
import { MenuClientWrapper } from "@/components/admin/menu/client-wrapper"
import { PageHeader } from "@/components/admin/page-header"
import { Suspense } from "react"
import { MenuLoader } from "@/components/admin/menu/menu-loader"

export const dynamic = 'force-dynamic'

export default async function MenuPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined
  const available = typeof searchParams.available === 'string' ? searchParams.available === 'true' : undefined
  const editId = typeof searchParams.edit === 'string' ? searchParams.edit : undefined

  const where: any = {}
  
  if (q) {
      where.name = { contains: q, mode: 'insensitive' }
  }

  if (available !== undefined) {
      where.isAvailable = available
  }

  const menus = await prisma.menu.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })
  
  let editMenu = null
  if (editId) {
      editMenu = await prisma.menu.findUnique({
          where: { id: parseInt(editId) }
      })
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-6 md:p-8 space-y-6 w-full overflow-x-hidden">
       <PageHeader 
          title="Menu Management" 
          description="Manage your coffee menu items here." 
       />

       {/* Pass data to Client Component */}
       <div className="flex-1 rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 overflow-hidden flex flex-col w-full">
            <MenuClientWrapper data={menus} editMenu={editMenu} />
       </div>
    </div>
  )
}
