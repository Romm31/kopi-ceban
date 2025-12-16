import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Confirm Cash Payment
 * 
 * POST /api/orders/confirm-payment
 * Body: { orderCode: string }
 * 
 * Used by admin to confirm cash payment at the cashier.
 * Updates order status to SUCCESS and sets paymentType to "cash".
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderCode } = body;

    if (!orderCode) {
      return NextResponse.json(
        { error: "Order code required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { orderCode },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify this is a CASH order
    if (order.paymentMethod !== "CASH") {
      return NextResponse.json(
        { error: "This order is not a cash payment. Cannot confirm manually." },
        { status: 400 }
      );
    }

    // Verify order is still PENDING
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: `Order already has status: ${order.status}` },
        { status: 400 }
      );
    }

    // Update order to SUCCESS
    const updatedOrder = await prisma.order.update({
      where: { orderCode },
      data: {
        status: "SUCCESS",
        paymentType: "cash",
        settlementTime: new Date(),
      },
    });

    // If order has a table, mark it as OCCUPIED
    if (updatedOrder.tableId) {
      await prisma.table.update({
        where: { id: updatedOrder.tableId },
        data: { status: "OCCUPIED" },
      });
    }

    console.log(`[Cash Payment] Order ${orderCode} confirmed by admin`);

    return NextResponse.json({
      success: true,
      message: "Payment confirmed successfully",
      orderCode: updatedOrder.orderCode,
      status: updatedOrder.status,
    });

  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json(
      { error: "Internal Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
