import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSnapTransaction } from "@/lib/midtrans";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, items, totalPrice } = body;

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // 1. Recalculate total price on server side
    let calculatedTotal = 0;
    const menuIds = items.map((i: any) => i.menuId).filter((id: any) => typeof id === 'number');
    
    const dbItems = await prisma.menu.findMany({
      where: {
        id: { in: menuIds }
      }
    });

    const dbItemMap = new Map(dbItems.map(i => [i.id, i]));
    
    const validatedItems = items.map((item: any) => {
        const dbItem = dbItemMap.get(item.menuId);
        const price = dbItem ? dbItem.price : item.price;
        calculatedTotal += price * item.quantity;
        return { ...item, price, name: dbItem?.name || item.name };
    });

    // 2. Generate Order Code
    const timestamp = Date.now();
    const orderCode = `ORD-${timestamp}-${Math.floor(Math.random() * 1000)}`;

    // 3. Create Order in DB (Pending)
    const order = await prisma.order.create({
      data: {
        orderCode,
        customerName,
        totalPrice: calculatedTotal,
        items: validatedItems,
        status: "PENDING",
      } as any,
    });

    // 4. Create Snap Transaction Token
    const snapData = await createSnapTransaction(
      orderCode,
      calculatedTotal,
      customerName,
      validatedItems
    );

    // 5. Update Order with snap token
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentLinkId: snapData.token,
        paymentLinkUrl: snapData.redirect_url,
      } as any,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderCode: orderCode,
      snapToken: snapData.token,
      redirectUrl: snapData.redirect_url,
    });

  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
