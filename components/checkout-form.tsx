"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface CheckoutFormProps {
  totalPrice: number;
  disabled: boolean;
  onSubmit: (data: { customerName: string; notes: string }) => Promise<void>;
}

export function CheckoutForm({ totalPrice, disabled, onSubmit }: CheckoutFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error("Nama pemesan wajib diisi");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ customerName, notes });
      // Reset form on success if needed, though usually we redirect
      setCustomerName("");
      setNotes("");
    } catch (error) {
      // Error handling is likely done in parent or here
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="customerName" className="text-foreground text-xs uppercase tracking-wider font-bold flex items-center gap-1">
            Nama Pemesan <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customerName"
            placeholder="Nama Anda..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={isLoading || disabled}
            className="bg-input border-border/50 text-foreground focus-visible:ring-primary focus-visible:border-primary h-11 rounded-xl transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-foreground text-xs uppercase tracking-wider font-bold">
            Catatan (Opsional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Tambahan permintaan khusus..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading || disabled}
            className="bg-input border-border/50 text-foreground focus-visible:ring-primary focus-visible:border-primary min-h-[70px] text-sm resize-none rounded-xl transition-all"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-border/50">
        <div className="flex justify-between items-baseline mb-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
          <span className="text-base font-semibold text-muted-foreground">Total Pembayaran</span>
          <span className="text-primary text-2xl font-bold tracking-tight">
            {formatter.format(totalPrice)}
          </span>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || disabled}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 font-bold h-13 text-base rounded-xl transition-all active:scale-[0.97] shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memproses Pesanan...
            </>
          ) : (
            "Buat Pesanan Sekarang"
          )}
        </Button>
      </div>
    </div>
  );
}
