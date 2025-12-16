import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Reject Cash Payment
 * 
 * POST /api/orders/reject-payment
 * Body: { orderCode: string, reason?: string }
 * 
 * Used by admin to reject cash payment orders.
 * Updates order status to FAILED.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderCode, reason } = body;

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
        { error: "This order is not a cash payment. Cannot reject manually." },
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

    // Update order to FAILED
    const updatedOrder = await prisma.order.update({
      where: { orderCode },
      data: {
        status: "FAILED",
        paymentType: reason || "rejected_by_admin",
      },
    });

    // If order has a table, release it
    if (updatedOrder.tableId) {
      await prisma.table.update({
        where: { id: updatedOrder.tableId },
        data: { status: "AVAILABLE" },
      });
    }

    console.log(`[Cash Payment] Order ${orderCode} rejected by admin. Reason: ${reason || 'none'}`);

    return NextResponse.json({
      success: true,
      message: "Order rejected successfully",
      orderCode: updatedOrder.orderCode,
      status: updatedOrder.status,
    });

  } catch (error) {
    console.error("Reject payment error:", error);
    return NextResponse.json(
      { error: "Internal Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
