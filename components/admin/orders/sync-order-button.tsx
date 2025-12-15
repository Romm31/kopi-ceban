"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SyncOrderButtonProps {
  orderCode: string;
}

export function SyncOrderButton({ orderCode }: SyncOrderButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      const res = await fetch(`/api/midtrans/check-status?orderCode=${orderCode}`);
      const result = await res.json();
      
      if (!res.ok) {
        toast.error(`Sync failed: ${result.error}`);
        return;
      }
      
      if (result.syncResult?.includes("synced")) {
        toast.success(`Status berhasil disinkronkan`, {
          icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
        });
      } else if (result.syncResult === "unchanged") {
        toast.info("Status sudah sinkron dengan Midtrans");
      } else if (result.syncResult === "midtrans_api_error") {
        toast.warning("Transaksi belum terdaftar di Midtrans");
      }
      
      router.refresh();
    } catch (error) {
      toast.error(`Sync error: ${(error as Error).message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
      className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:text-coffee-gold"
    >
      <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Syncing..." : "Sync Midtrans"}
    </Button>
  );
}
