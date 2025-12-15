import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TableStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tables/:id
 * Get single table details
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const tableId = parseInt(id);

    if (isNaN(tableId)) {
      return NextResponse.json({ error: "Invalid table ID" }, { status: 400 });
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        orders: {
          where: {
            status: { in: ["PENDING", "SUCCESS"] },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Meja tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      table: {
        ...table,
        activeOrder: table.orders[0] || null,
        orders: undefined,
      },
    });
  } catch (error) {
    console.error("Get Table Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tables/:id
 * Update table status or name
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const tableId = parseInt(id);
    const body = await req.json();
    const { status, name } = body;

    if (isNaN(tableId)) {
      return NextResponse.json({ error: "Invalid table ID" }, { status: 400 });
    }

    // Validate status if provided
    const validStatuses: TableStatus[] = [
      "AVAILABLE",
      "RESERVED",
      "OCCUPIED",
      "CLEANING",
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Meja tidak ditemukan" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: { status?: TableStatus; name?: string } = {};
    if (status) updateData.status = status;
    if (name && typeof name === "string" && name.trim().length > 0) {
      updateData.name = name.trim();
    }

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      table: updatedTable,
    });
  } catch (error) {
    console.error("Update Table Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tables/:id
 * Delete a table (only if not linked to active orders)
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const tableId = parseInt(id);

    if (isNaN(tableId)) {
      return NextResponse.json({ error: "Invalid table ID" }, { status: 400 });
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        orders: {
          where: {
            status: { in: ["PENDING", "SUCCESS"] },
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Meja tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if table has active orders
    if (table.orders.length > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus meja dengan pesanan aktif" },
        { status: 400 }
      );
    }

    await prisma.table.delete({
      where: { id: tableId },
    });

    return NextResponse.json({
      success: true,
      message: "Meja berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete Table Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
