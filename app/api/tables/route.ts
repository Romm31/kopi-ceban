import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TableStatus } from "@prisma/client";

/**
 * GET /api/tables
 * List all tables with optional status filter
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as TableStatus | null;

    const where = status ? { status } : {};

    const tables = await prisma.table.findMany({
      where,
      include: {
        orders: {
          where: {
            status: { in: ["PENDING", "SUCCESS"] },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { id: "asc" },
    });

    // Transform to include active order info
    const tablesWithActiveOrder = tables.map((table) => ({
      ...table,
      activeOrder: table.orders[0] || null,
      orders: undefined, // Remove the orders array from response
    }));

    return NextResponse.json({
      success: true,
      tables: tablesWithActiveOrder,
    });
  } catch (error) {
    console.error("Get Tables Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tables
 * Create a new table
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Nama meja wajib diisi" },
        { status: 400 }
      );
    }

    const table = await prisma.table.create({
      data: {
        name: name.trim(),
        status: "AVAILABLE",
      },
    });

    return NextResponse.json({
      success: true,
      table,
    });
  } catch (error) {
    console.error("Create Table Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
