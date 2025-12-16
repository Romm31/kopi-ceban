import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Expire Old Cash Orders
 * 
 * POST /api/orders/expire-cash
 * 
 * Automatically expires CASH orders that have been PENDING for more than 15 minutes.
 * Can be called by cron job or admin manually.
 */
export async function POST() {
  try {
    const EXPIRE_MINUTES = 15;
    const expireCutoff = new Date(Date.now() - EXPIRE_MINUTES * 60 * 1000);

    // Find all CASH orders that are PENDING and older than 15 minutes
    const expiredOrders = await prisma.order.findMany({
      where: {
        paymentMethod: "CASH",
        status: "PENDING",
        createdAt: { lt: expireCutoff },
      },
      select: {
        id: true,
        orderCode: true,
        tableId: true,
      },
    });

    const results = [];

    for (const order of expiredOrders) {
      // Update order to EXPIRED
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "EXPIRED",
          paymentType: "expired_timeout_15min",
        },
      });

      // Release table if exists
      if (order.tableId) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: "AVAILABLE" },
        });
      }

      results.push({
        orderCode: order.orderCode,
        expired: true,
        tableReleased: !!order.tableId,
      });
    }

    console.log(`[Cash Auto-Expire] Expired ${results.length} orders`);

    return NextResponse.json({
      success: true,
      expiredCount: results.length,
      results,
    });

  } catch (error) {
    console.error("Expire cash orders error:", error);
    return NextResponse.json(
      { error: "Internal Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET endpoint to check status (for thank-you page auto-expiry check)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderCode = searchParams.get("orderCode");

  if (!orderCode) {
    return NextResponse.json({ error: "orderCode required" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: {
        status: true,
        paymentMethod: true,
        createdAt: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const EXPIRE_MINUTES = 15;
    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const ageMinutes = (now.getTime() - createdAt.getTime()) / (60 * 1000);
    
    // Check if should auto-expire
    if (order.paymentMethod === "CASH" && order.status === "PENDING" && ageMinutes >= EXPIRE_MINUTES) {
      // Auto-expire this order
      await prisma.order.update({
        where: { orderCode },
        data: {
          status: "EXPIRED",
          paymentType: "expired_timeout_15min",
        },
      });

      return NextResponse.json({
        orderCode,
        status: "EXPIRED",
        expired: true,
        reason: "Order exceeded 15 minute timeout",
      });
    }

    // Return time remaining
    const timeRemaining = Math.max(0, Math.floor((EXPIRE_MINUTES - ageMinutes) * 60));

    return NextResponse.json({
      orderCode,
      status: order.status,
      paymentMethod: order.paymentMethod,
      timeRemaining, // seconds remaining before auto-expire
      expired: false,
    });

  } catch (error) {
    console.error("Check expire error:", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}
