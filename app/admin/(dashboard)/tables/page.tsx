import { PageHeader } from "@/components/admin/page-header";
import { TablesClient } from "@/components/admin/tables/tables-client";

export const dynamic = "force-dynamic";

export default function TablesPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <PageHeader
        title="Manajemen Meja"
        description="Kelola meja, status ketersediaan, dan QR code untuk pemesanan."
      />
      <TablesClient />
    </div>
  );
}
