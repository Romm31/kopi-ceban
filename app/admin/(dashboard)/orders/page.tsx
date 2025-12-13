import { prisma } from "@/lib/prisma";
import { OrdersTable } from "./orders-client";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      paymentLogs: {
        orderBy: {
           createdAt: 'desc'
        }
      }
    }
  });

  // Serialization needed for Dates usually passed to client components, 
  // but standard Next.js SC passes dates as Date objects fine to Client Components in recent versions.
  // Actually, Server Component -> Client Component props serialization warning might occur if not simple JSON.
  // Let's rely on auto-serialization or map if needed. Next.js 13+ handles Date mostly fine, 
  // but let's be safe if it fails, though usually okay.
  // We'll pass as is. "items" is Json, which is typed as any in prisma client usually.

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 space-y-6 w-full">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Orders Management</h1>
        <p className="text-muted-foreground">Monitor and track all customer orders.</p>
      </div>

      <OrdersTable data={orders as any} /> 
    </div>
  );
}
