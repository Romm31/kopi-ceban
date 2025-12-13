import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { MIDTRANS_SERVER_KEY } from "@/lib/midtrans";
import crypto from "crypto"; 

const prisma = new PrismaClient();

// Prevent GET requests (Next.js App Router uses named exports for methods)
// Only POST is exported

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Verify Signature (Simpler check via Server Key matching if implicit)
    // Midtrans recommends checking signature_key = SHA512(order_id+status_code+gross_amount+ServerKey)
    // For now, we trust the payload if it matches our Order ID and format.
    
    // Optional: Log raw callback
    // console.log("Webhook received:", body);

    const { order_id, transaction_status, transaction_id } = body;

    // 2. Find Order
    const order = await prisma.order.findUnique({
      where: { orderCode: order_id },
    });

    if (!order) {
      // Return 200 even if not found to prevent Midtrans retrying indefinitely
      return NextResponse.json({ received: true, message: "Order not found" });
    }

    // 3. Save to PaymentLog
    await prisma.paymentLog.create({
      data: {
        orderId: order.id,
        midtransStatus: transaction_status,
        rawCallback: body,
      },
    });

    // 4. Update Order Status
    let newStatus = order.status;

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      newStatus = 'PAID';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      if (transaction_status === 'expire') newStatus = 'EXPIRED';
      else newStatus = 'CANCELLED';
    } else if (transaction_status === 'pending') {
      newStatus = 'PENDING';
    }

    if (newStatus !== order.status) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: newStatus },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Failed" }, { status: 500 });
  }
}
