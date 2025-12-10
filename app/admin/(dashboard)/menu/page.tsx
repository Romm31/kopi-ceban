import { prisma } from "@/lib/prisma"
import { MenuForm } from "@/components/admin/menu/menu-form"
import { columns } from "@/components/admin/menu/columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export const dynamic = 'force-dynamic'

export default async function MenuPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const menus = await prisma.menu.findMany({
    orderBy: { createdAt: "desc" },
  })

  // Handle Edit Mode via URL query param
  // Ideally, this should be done with a client-side wrapper or a separate route for cleaner separation,
  // but for a single page app feel in Next.js Server Components, we can check the ID here
  // and pass it to a client component wrapper that opens the dialog, 
  // OR we just render the table and let the table actions control the dialog state entirely client-side if we fetch data there.
  // BUT the prompt asks for clean implementation.
  // A common pattern: The "Add" button opens a Dialog. The "Edit" button in the table opens the same Dialog pre-filled.
  // To make "Edit" work from the server component properly, we might need a client wrapper for the page content 
  // that manages the dialog state, OR we use the URL to drive the dialog state.
  // Using URL state is robust.
  
  // Note: searchParams is a Promise in newer Next.js versions (15+), but 14 is sync. 
  // Next 15 it's async. Package.json says "next": "16.0.8". -> It IS async now!
  // Wait, I need to await searchParams if I use it.
  
  let editMenu = null
  const editId = (await searchParams)?.edit
  
  if (editId) {
      editMenu = await prisma.menu.findUnique({
          where: { id: parseInt(editId as string) }
      })
  }

  // We need a clear way to close the modal -> usually routing back to /admin/menu.
  // I will create a client component wrapper for the interaction part (The Header + Table + Dialog).
  // Actually, standard DataTable + Dialog on top is easiest.
  // I will make a `MenuClient` component that takes the data.
  
  return (
      <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
            <div>
            <h2 className="text-2xl font-bold tracking-tight text-coffee-cream">Menu Management</h2>
            <p className="text-muted-foreground">
                Manage your café's offerings, prices, and availability.
            </p>
            </div>
        </div>
        
        <MenuClientWrapper data={menus} editMenu={editMenu} />
      </div>
  )
}

// Separate client component for interactivity
import { MenuClientWrapper } from "@/components/admin/menu/client-wrapper"
