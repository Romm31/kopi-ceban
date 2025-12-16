import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSnapTransaction } from "@/lib/midtrans";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      customerName, 
      items, 
      totalPrice, 
      tableId, 
      takeAway = false, 
      notes,
      orderType = "TAKE_AWAY",
      tableNumber = null,
      paymentMethod = "TRANSFER" // CASH or TRANSFER
    } = body;

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Validate orderType and tableNumber
    if (orderType === "DINE_IN" && !tableNumber) {
      return NextResponse.json(
        { error: "Nomor meja wajib diisi untuk Dine In" },
        { status: 400 }
      );
    }

    // Table validation for dine-in orders (if using table management system)
    let validatedTableId: number | null = null;
    
    if (tableId && !takeAway) {
      const table = await prisma.table.findUnique({
        where: { id: tableId },
      });

      if (!table) {
        return NextResponse.json(
          { error: "Meja tidak ditemukan" },
          { status: 400 }
        );
      }

      if (table.status === "OCCUPIED") {
        return NextResponse.json(
          { error: "Meja sedang digunakan. Silakan pilih meja lain." },
          { status: 400 }
        );
      }

      if (table.status === "RESERVED") {
        return NextResponse.json(
          { error: "Meja sedang direservasi. Silakan pilih meja lain." },
          { status: 400 }
        );
      }

      if (table.status === "CLEANING") {
        return NextResponse.json(
          { error: "Meja sedang dibersihkan. Silakan pilih meja lain." },
          { status: 400 }
        );
      }

      validatedTableId = tableId;

      // Reserve the table
      await prisma.table.update({
        where: { id: tableId },
        data: { status: "RESERVED" },
      });
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

    // Add PPN 11% tax
    const ppn = Math.round(calculatedTotal * 0.11);
    const grandTotal = calculatedTotal + ppn;

    // 2. Generate Order Code
    const timestamp = Date.now();
    const orderCode = `ORD-${timestamp}-${Math.floor(Math.random() * 1000)}`;

    // 3. Create Order in DB - store grand total with tax
    const order = await prisma.order.create({
      data: {
        orderCode,
        customerName,
        notes: notes || null, // Customer notes
        totalPrice: grandTotal, // Grand total including PPN
        items: validatedItems,
        status: "PENDING",
        tableId: validatedTableId,
        takeAway: takeAway,
        orderType: orderType,
        tableNumber: tableNumber ? parseInt(tableNumber) : null,
        paymentMethod: paymentMethod, // CASH or TRANSFER
      },
    });

    // 4. Handle payment based on method
    if (paymentMethod === "CASH") {
      // For CASH: No Midtrans, just return order code
      // Customer will pay at cashier, admin will confirm
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderCode: orderCode,
        paymentMethod: "CASH",
        message: "Silakan bayar di kasir",
      });
    }

    // 5. For TRANSFER: Create Snap Transaction Token
    let snapData;
    try {
      snapData = await createSnapTransaction(
        orderCode,
        calculatedTotal,
        customerName,
        validatedItems
      );
    } catch (snapError) {
      // If Midtrans fails, reset table status and delete order
      if (validatedTableId) {
        await prisma.table.update({
          where: { id: validatedTableId },
          data: { status: "AVAILABLE" },
        });
      }
      await prisma.order.delete({ where: { id: order.id } });
      throw snapError;
    }

    // 6. Update Order with snap token
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentLinkId: snapData.token,
        paymentLinkUrl: snapData.redirect_url,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderCode: orderCode,
      snapToken: snapData.token,
      redirectUrl: snapData.redirect_url,
      paymentMethod: "TRANSFER",
    });

  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
