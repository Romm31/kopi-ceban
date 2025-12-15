import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getTransactionStatus,
  mapMidtransStatus,
  logMidtransEvent,
} from "@/lib/midtrans";

/**
 * Check Status Fallback API
 * 
 * This endpoint allows manual checking of order status against Midtrans API.
 * Useful when notifications are missed or for debugging.
 * 
 * Usage: GET /api/midtrans/check-status?orderCode=ORD-xxx
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderCode = searchParams.get("orderCode");

    if (!orderCode) {
      return NextResponse.json(
        { error: "orderCode parameter is required" },
        { status: 400 }
      );
    }

    // 1. Find order in database
    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: {
        paymentLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // 2. Get status from Midtrans API
    let midtransData;
    let midtransStatus;
    let syncResult = "unchanged";

    try {
      midtransData = await getTransactionStatus(orderCode);
      midtransStatus = mapMidtransStatus(
        midtransData.transaction_status,
        midtransData.fraud_status
      );

      logMidtransEvent("STATUS_CHECK", orderCode, {
        midtrans_status: midtransData.transaction_status,
        mapped_status: midtransStatus,
        db_status: order.status,
      });

      // 3. Sync if status differs
      if (midtransStatus !== order.status) {
        const oldStatus = order.status;
        
        await prisma.order.update({
          where: { id: order.id },
          data: { status: midtransStatus },
        });

        // Log the sync
        await prisma.paymentLog.create({
          data: {
            orderId: order.id,
            midtransStatus: midtransData.transaction_status,
            rawCallback: {
              source: "manual_check",
              ...midtransData,
            },
          },
        });

        syncResult = `synced: ${oldStatus} → ${midtransStatus}`;
        
        logMidtransEvent("STATUS_CHECK", orderCode, {
          action: "status_synced",
          from: oldStatus,
          to: midtransStatus,
        });
      }
    } catch (midtransError) {
      // Midtrans API call failed - might be a new order not yet in Midtrans
      logMidtransEvent("ERROR", orderCode, {
        error: "Failed to fetch from Midtrans API",
        details: (midtransError as Error).message,
      });

      return NextResponse.json({
        orderCode,
        dbStatus: order.status,
        midtransStatus: null,
        syncResult: "midtrans_api_error",
        error: (midtransError as Error).message,
      });
    }

    return NextResponse.json({
      orderCode,
      dbStatus: order.status,
      midtransStatus: midtransData.transaction_status,
      mappedStatus: midtransStatus,
      syncResult,
      midtransData: {
        transaction_id: midtransData.transaction_id,
        payment_type: midtransData.payment_type,
        transaction_time: midtransData.transaction_time,
        gross_amount: midtransData.gross_amount,
      },
    });

  } catch (error) {
    console.error("Check Status Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to force sync all pending orders
 */
export async function POST(req: Request) {
  try {
    // Find all pending orders older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: tenMinutesAgo },
      },
      select: {
        id: true,
        orderCode: true,
        status: true,
      },
    });

    const results = [];

    for (const order of pendingOrders) {
      try {
        const midtransData = await getTransactionStatus(order.orderCode);
        const midtransStatus = mapMidtransStatus(
          midtransData.transaction_status,
          midtransData.fraud_status
        );

        if (midtransStatus !== order.status) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: midtransStatus },
          });

          await prisma.paymentLog.create({
            data: {
              orderId: order.id,
              midtransStatus: midtransData.transaction_status,
              rawCallback: {
                source: "batch_sync",
                ...midtransData,
              },
            },
          });

          results.push({
            orderCode: order.orderCode,
            synced: true,
            from: order.status,
            to: midtransStatus,
          });
        } else {
          results.push({
            orderCode: order.orderCode,
            synced: false,
            status: order.status,
          });
        }
      } catch (err) {
        results.push({
          orderCode: order.orderCode,
          error: (err as Error).message,
        });
      }
    }

    return NextResponse.json({
      processed: pendingOrders.length,
      results,
    });

  } catch (error) {
    console.error("Batch Sync Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
