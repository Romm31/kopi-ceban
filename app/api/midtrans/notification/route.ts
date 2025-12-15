import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifySignature,
  mapMidtransStatus,
  logMidtransEvent,
  MIDTRANS_SERVER_KEY,
} from "@/lib/midtrans";
import { OrderStatus } from "@prisma/client";

/**
 * Midtrans Notification Handler
 * 
 * This endpoint receives POST requests from Midtrans when payment status changes.
 * It validates the signature, updates the order status, and syncs table status.
 * 
 * URL to configure in Midtrans Dashboard:
 * Settings > Payment > Notification URL > https://yourdomain.com/api/midtrans/notification
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      transaction_id,
      payment_type,
    } = body;

    // Log incoming notification
    logMidtransEvent("NOTIFICATION", order_id, {
      transaction_status,
      fraud_status,
      payment_type,
      status_code,
    });

    // 1. Validate signature (skip if server key not configured - for development)
    if (MIDTRANS_SERVER_KEY && signature_key) {
      const isValid = verifySignature(order_id, status_code, gross_amount, signature_key);
      
      if (!isValid) {
        logMidtransEvent("ERROR", order_id, {
          error: "Invalid signature",
          received: signature_key,
        });
        // Still return 200 to prevent Midtrans from retrying
        return NextResponse.json({ 
          message: "Invalid signature",
          received: true 
        });
      }
    }

    // 2. Find the order by orderCode
    const order = await prisma.order.findUnique({
      where: { orderCode: order_id },
    });

    if (!order) {
      logMidtransEvent("ERROR", order_id, {
        error: "Order not found",
      });
      // Return 200 to prevent Midtrans from retrying indefinitely
      return NextResponse.json({ 
        received: true, 
        message: "Order not found" 
      });
    }

    // 3. Map Midtrans status to our OrderStatus
    const newStatus = mapMidtransStatus(transaction_status, fraud_status);
    const oldStatus = order.status;

    // 4. Save to PaymentLog (for audit trail)
    await prisma.paymentLog.create({
      data: {
        orderId: order.id,
        midtransStatus: transaction_status,
        rawCallback: body,
      },
    });

    // 5. Update Order Status if changed
    if (newStatus !== oldStatus) {
      // Prepare update data
      const updateData: any = { status: newStatus };
      
      // Save payment details on successful payment
      if (newStatus === "SUCCESS") {
        updateData.paymentType = payment_type || null;
        updateData.transactionId = transaction_id || null;
        updateData.settlementTime = body.settlement_time 
          ? new Date(body.settlement_time) 
          : new Date();
      }
      
      await prisma.order.update({
        where: { id: order.id },
        data: updateData,
      });

      logMidtransEvent("NOTIFICATION", order_id, {
        statusChange: `${oldStatus} → ${newStatus}`,
        transaction_id,
      });

      // 6. Sync Table Status based on payment result
      if (order.tableId) {
        const statusesToResetTable: OrderStatus[] = ["EXPIRED", "FAILED", "REFUNDED"];
        
        if (newStatus === "SUCCESS") {
          // Payment successful - mark table as OCCUPIED
          await prisma.table.update({
            where: { id: order.tableId },
            data: { status: "OCCUPIED" },
          });
          
          logMidtransEvent("NOTIFICATION", order_id, {
            tableSync: `Table ${order.tableId} → OCCUPIED`,
          });
        } else if (statusesToResetTable.includes(newStatus)) {
          // Payment failed/expired/refunded - release the table
          await prisma.table.update({
            where: { id: order.tableId },
            data: { status: "AVAILABLE" },
          });
          
          logMidtransEvent("NOTIFICATION", order_id, {
            tableSync: `Table ${order.tableId} → AVAILABLE (payment ${newStatus})`,
          });
        }
      }
    }

    return NextResponse.json({ 
      received: true,
      message: "OK",
      orderId: order_id,
      status: newStatus,
    });
    
  } catch (error) {
    console.error("Notification Handler Error:", error);
    logMidtransEvent("ERROR", "unknown", {
      error: (error as Error).message,
    });
    
    // Return 200 even on error to prevent retry loops
    return NextResponse.json({ 
      received: true,
      error: "Internal error" 
    });
  }
}

// Prevent other methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
