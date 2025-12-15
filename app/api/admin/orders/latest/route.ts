import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get count and latest order
    const [count, latestOrder] = await Promise.all([
      prisma.order.count({
        where: { status: "PENDING" }
      }),
      prisma.order.findFirst({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderCode: true,
          customerName: true,
          status: true,
          createdAt: true,
          totalPrice: true,
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      pendingCount: count,
      latestOrder: latestOrder ? {
        ...latestOrder,
        createdAt: latestOrder.createdAt.toISOString()
      } : null
    });
  } catch (error) {
    console.error("Error fetching latest orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
