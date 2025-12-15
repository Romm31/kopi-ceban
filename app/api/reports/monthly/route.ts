import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, format, getDaysInMonth } from "date-fns";
import { id as localeId } from "date-fns/locale";

/**
 * GET /api/reports/monthly
 * Generate monthly sales report data
 * Query params: month (1-12), year (YYYY)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || "");
    const year = parseInt(searchParams.get("year") || "");

    // Validate params
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 2020) {
      return NextResponse.json(
        { error: "Parameter month (1-12) dan year wajib diisi" },
        { status: 400 }
      );
    }

    // Calculate date range
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    const daysInMonth = getDaysInMonth(startDate);

    // Get period name in Indonesian
    const periodName = format(startDate, "MMMM yyyy", { locale: localeId });

    // Fetch all SUCCESS orders in the period
    const orders = await prisma.order.findMany({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        table: {
          select: { name: true },
        },
      },
    });

    // Calculate totals
    const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const transactions = orders.length;
    const avgDaily = daysInMonth > 0 ? Math.round(revenue / daysInMonth) : 0;
    const avgPerTransaction = transactions > 0 ? Math.round(revenue / transactions) : 0;

    // Calculate best sellers
    const itemSales: Record<string, { name: string; sold: number; revenue: number }> = {};

    orders.forEach((order) => {
      const items = order.items as any[];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          const key = item.menuId?.toString() || item.name;
          if (!itemSales[key]) {
            itemSales[key] = { name: item.name || "Unknown", sold: 0, revenue: 0 };
          }
          itemSales[key].sold += item.quantity || 1;
          itemSales[key].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });

    const bestSellers = Object.values(itemSales)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // Format orders for report
    const formattedOrders = orders.map((order) => {
      const items = order.items as any[];
      const itemNames = Array.isArray(items)
        ? items.map((i) => i.name).filter(Boolean)
        : [];

      return {
        id: order.orderCode,
        date: format(order.createdAt, "yyyy-MM-dd HH:mm"),
        total: order.totalPrice,
        items: itemNames,
        status: order.status,
        customerName: order.customerName,
        table: order.table?.name || (order.takeAway ? "Take Away" : "-"),
      };
    });

    // Payment method breakdown (simplified - we don't track this currently)
    // This could be extended if payment method is stored

    const report = {
      period: periodName,
      periodStart: format(startDate, "yyyy-MM-dd"),
      periodEnd: format(endDate, "yyyy-MM-dd"),
      generatedAt: new Date().toISOString(),
      summary: {
        revenue,
        transactions,
        avgDaily,
        avgPerTransaction,
        daysInMonth,
      },
      bestSellers,
      orders: formattedOrders,
    };

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Monthly Report Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
