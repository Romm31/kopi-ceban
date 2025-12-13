import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderCode = searchParams.get("orderCode");

  if (!orderCode) {
    return NextResponse.json({ error: "Order code required" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: {
        customerName: true,
        totalPrice: true,
        status: true,
        // paymentLinkUrl: true // optional
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
