import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { OrderStatus } from "@prisma/client"
import { format } from "date-fns"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const search = searchParams.get("search")

  const where: any = {
    status: {
      in: ["SUCCESS", "FAILED"],
    },
  }

  if (status && status !== "ALL") {
    where.status = status as OrderStatus
  }

  if (startDate && endDate) {
    where.createdAt = {
       gte: new Date(startDate),
       lte: new Date(endDate),
    }
  }

  if (search) {
     where.customerName = {
        contains: search,
        mode: 'insensitive'
     }
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  // Generate CSV
  const headers = ["Order ID", "Customer Name", "Total Price", "Status", "Date Created", "Date Updated"]
  const rows = orders.map(order => [
    order.id,
    order.customerName,
    order.totalPrice,
    order.status,
    format(order.createdAt, "yyyy-MM-dd HH:mm:ss"),
    format(order.updatedAt, "yyyy-MM-dd HH:mm:ss"),
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n")

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="history-${format(new Date(), "yyyy-MM-dd")}.csv"`,
    },
  })
}
