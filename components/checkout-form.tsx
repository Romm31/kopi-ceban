"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Coffee, UtensilsCrossed, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Table {
  id: number;
  name: string;
  status: string;
}

interface CheckoutFormProps {
  totalPrice: number;
  disabled: boolean;
  onSubmit: (data: {
    customerName: string;
    notes: string;
    tableId: number | null;
    takeAway: boolean;
  }) => Promise<void>;
  tableFromQR?: number | null;
  tableNameFromQR?: string | null;
}

export function CheckoutForm({
  totalPrice,
  disabled,
  onSubmit,
  tableFromQR,
  tableNameFromQR,
}: CheckoutFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderType, setOrderType] = useState<"dine-in" | "take-away">(
    tableFromQR ? "dine-in" : "dine-in"
  );
  const [selectedTableId, setSelectedTableId] = useState<number | null>(
    tableFromQR || null
  );
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);

  const isFromQR = tableFromQR !== null && tableFromQR !== undefined;

  // Fetch available tables when dine-in is selected and not from QR
  useEffect(() => {
    if (orderType === "dine-in" && !isFromQR) {
      fetchAvailableTables();
    }
  }, [orderType, isFromQR]);

  const fetchAvailableTables = async () => {
    setTablesLoading(true);
    try {
      const response = await fetch("/api/tables?status=AVAILABLE");
      const data = await response.json();
      if (data.success) {
        setAvailableTables(data.tables);
      }
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    } finally {
      setTablesLoading(false);
    }
  };

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

    // Validate table selection for dine-in
    if (orderType === "dine-in" && !isFromQR && !selectedTableId) {
      toast.error("Silakan pilih meja untuk dine-in");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        customerName,
        notes,
        tableId: orderType === "take-away" ? null : selectedTableId,
        takeAway: orderType === "take-away",
      });
      setCustomerName("");
      setNotes("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Order Type Selection */}
      <div className="space-y-3">
        <Label className="text-foreground text-xs uppercase tracking-wider font-bold">
          Jenis Pesanan
        </Label>

        {isFromQR ? (
          // QR Code Flow - Fixed Dine-in
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl border-2 border-primary/30 shadow-lg shadow-primary/10"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/20 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">Dine In</p>
                <p className="text-sm text-primary font-semibold">
                  {tableNameFromQR || `Meja ${tableFromQR}`}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          // Normal Flow - Selection
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setOrderType("dine-in");
                setSelectedTableId(null);
              }}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                orderType === "dine-in"
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-border/50 bg-input hover:border-primary/50"
              }`}
            >
              <UtensilsCrossed
                className={`w-6 h-6 ${
                  orderType === "dine-in" ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`font-semibold text-sm ${
                  orderType === "dine-in" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Dine In
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderType("take-away");
                setSelectedTableId(null);
              }}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                orderType === "take-away"
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-border/50 bg-input hover:border-primary/50"
              }`}
            >
              <ShoppingBag
                className={`w-6 h-6 ${
                  orderType === "take-away" ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`font-semibold text-sm ${
                  orderType === "take-away" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Take Away
              </span>
            </button>
          </div>
        )}

        {/* Table Selection - Only for dine-in and not from QR */}
        {orderType === "dine-in" && !isFromQR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Label
              htmlFor="table"
              className="text-foreground text-xs uppercase tracking-wider font-bold flex items-center gap-1"
            >
              Pilih Meja <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedTableId?.toString() || ""}
              onValueChange={(value) => setSelectedTableId(parseInt(value))}
              disabled={tablesLoading}
            >
              <SelectTrigger className="bg-input border-border/50 text-foreground h-11 rounded-xl">
                <SelectValue
                  placeholder={tablesLoading ? "Memuat meja..." : "Pilih meja..."}
                />
              </SelectTrigger>
              <SelectContent>
                {availableTables.length === 0 ? (
                  <SelectItem value="-1" disabled>
                    Tidak ada meja tersedia
                  </SelectItem>
                ) : (
                  availableTables.map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      {table.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </div>

      {/* Customer Info */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label
            htmlFor="customerName"
            className="text-foreground text-xs uppercase tracking-wider font-bold flex items-center gap-1"
          >
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
          <Label
            htmlFor="notes"
            className="text-foreground text-xs uppercase tracking-wider font-bold"
          >
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

      {/* Submit */}
      <div className="pt-3 border-t border-border/50">
        <div className="flex justify-between items-baseline mb-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
          <span className="text-base font-semibold text-muted-foreground">
            Total Pembayaran
          </span>
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
