import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderCode = searchParams.get("orderCode");

  console.log("[Order Status] Querying orderCode:", orderCode);

  if (!orderCode) {
    return NextResponse.json({ error: "Order code required" }, { status: 400 });
  }

  try {
    // Get all order data without select to avoid field issues
    const order = await prisma.order.findUnique({
      where: { orderCode },
    });

    console.log("[Order Status] Found order:", order ? order.orderCode : "NOT FOUND");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Return relevant fields
    return NextResponse.json({
      orderCode: order.orderCode,
      customerName: order.customerName,
      notes: order.notes || null,
      items: order.items,
      totalPrice: order.totalPrice,
      status: order.status,
      orderType: order.orderType || "TAKE_AWAY",
      tableNumber: order.tableNumber || null,
      paymentType: order.paymentType || null,
      paymentMethod: order.paymentMethod || "TRANSFER",
      transactionId: order.transactionId || null,
      settlementTime: order.settlementTime || null,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error("Order status error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
