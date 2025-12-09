import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { deleteMenu } from "./actions"
import DeleteMenuButton from "@/components/admin/DeleteMenuButton"

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const menus = await prisma.menu.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Link href="/admin/menu/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Menu
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus.map((menu) => (
              <TableRow key={menu.id}>
                <TableCell>
                  {menu.imageUrl ? (
                    <img src={menu.imageUrl} alt={menu.name} className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-200" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{menu.name}</TableCell>
                <TableCell>Rp {menu.price.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={menu.isAvailable ? "default" : "destructive"}>
                    {menu.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/menu/${menu.id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <DeleteMenuButton id={menu.id} />
                </TableCell>
              </TableRow>
            ))}
            {menus.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No menus found. Add one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
