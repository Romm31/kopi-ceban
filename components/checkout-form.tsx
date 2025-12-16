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
import { Loader2, UtensilsCrossed, ShoppingBag, Banknote, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
    orderType: string;
    tableNumber: number | null;
    paymentMethod: "CASH" | "TRANSFER";
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
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKE_AWAY">(
    tableFromQR ? "DINE_IN" : "TAKE_AWAY"
  );
  const [selectedTableId, setSelectedTableId] = useState<number | null>(
    tableFromQR || null
  );
  const [selectedTableName, setSelectedTableName] = useState<string>(
    tableNameFromQR || ""
  );
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("TRANSFER");

  const isFromQR = tableFromQR !== null && tableFromQR !== undefined;

  // Fetch available tables when dine-in is selected
  useEffect(() => {
    if (orderType === "DINE_IN" && !isFromQR) {
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
      toast.error("Gagal memuat daftar meja");
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

    // Validate table for dine-in
    if (orderType === "DINE_IN" && !selectedTableId) {
      toast.error("Pilih meja terlebih dahulu untuk Dine In");
      return;
    }

    setIsLoading(true);
    try {
      // Extract table number from table name (e.g., "Meja 5" -> 5)
      let tableNum: number | null = null;
      if (selectedTableName) {
        const match = selectedTableName.match(/\d+/);
        tableNum = match ? parseInt(match[0]) : selectedTableId;
      }
      
      await onSubmit({
        customerName,
        notes,
        tableId: orderType === "TAKE_AWAY" ? null : selectedTableId,
        takeAway: orderType === "TAKE_AWAY",
        orderType: orderType,
        tableNumber: orderType === "DINE_IN" ? tableNum : null,
        paymentMethod,
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
    <div className="space-y-3 p-4">
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
          // Normal Flow - Selection Cards
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              type="button"
              onClick={() => {
                setOrderType("DINE_IN");
                setSelectedTableId(null);
                setSelectedTableName("");
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                orderType === "DINE_IN"
                  ? "border-primary bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/20"
                  : "border-border/50 bg-input hover:border-primary/50"
              }`}
            >
              <div className={`p-2 rounded-lg ${
                orderType === "DINE_IN" 
                  ? "bg-primary/20" 
                  : "bg-muted/30"
              }`}>
                <UtensilsCrossed
                  className={`w-5 h-5 ${
                    orderType === "DINE_IN" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`font-semibold text-xs ${
                  orderType === "DINE_IN" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Dine In
              </span>
              <span className="text-[10px] text-muted-foreground">Makan di tempat</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => {
                setOrderType("TAKE_AWAY");
                setSelectedTableId(null);
                setSelectedTableName("");
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                orderType === "TAKE_AWAY"
                  ? "border-primary bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/20"
                  : "border-border/50 bg-input hover:border-primary/50"
              }`}
            >
              <div className={`p-2 rounded-lg ${
                orderType === "TAKE_AWAY" 
                  ? "bg-primary/20" 
                  : "bg-muted/30"
              }`}>
                <ShoppingBag
                  className={`w-5 h-5 ${
                    orderType === "TAKE_AWAY" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`font-semibold text-xs ${
                  orderType === "TAKE_AWAY" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Take Away
              </span>
              <span className="text-[10px] text-muted-foreground">Dibawa pulang</span>
            </motion.button>
          </div>
        )}

        {/* Table Selection - Only for dine-in and not from QR */}
        <AnimatePresence>
          {orderType === "DINE_IN" && !isFromQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2 overflow-hidden"
            >
              <Label
                htmlFor="tableSelect"
                className="text-foreground text-xs uppercase tracking-wider font-bold flex items-center gap-1"
              >
                Pilih Meja <span className="text-destructive">*</span>
              </Label>
              
              {tablesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Memuat daftar meja...</span>
                </div>
              ) : availableTables.length === 0 ? (
                <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/30 text-center">
                  <p className="text-sm text-destructive">Tidak ada meja tersedia saat ini</p>
                  <p className="text-xs text-muted-foreground mt-1">Silakan pilih Take Away atau coba lagi nanti</p>
                </div>
              ) : (
                <Select
                  value={selectedTableId?.toString() || ""}
                  onValueChange={(value) => {
                    const tableId = parseInt(value);
                    setSelectedTableId(tableId);
                    const table = availableTables.find(t => t.id === tableId);
                    if (table) {
                      setSelectedTableName(table.name);
                    }
                  }}
                >
                  <SelectTrigger className="bg-input border-border/50 text-foreground h-11 rounded-xl">
                    <SelectValue placeholder="Pilih meja yang tersedia..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTables.map((table) => (
                      <SelectItem key={table.id} value={table.id.toString()}>
                        {table.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label className="text-foreground text-xs uppercase tracking-wider font-bold">
          Metode Pembayaran
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            type="button"
            onClick={() => setPaymentMethod("CASH")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
              paymentMethod === "CASH"
                ? "border-green-500 bg-gradient-to-br from-green-500/20 to-green-500/5 shadow-lg shadow-green-500/20"
                : "border-border/50 bg-input hover:border-green-500/50"
            }`}
          >
            <div className={`p-2 rounded-lg ${
              paymentMethod === "CASH" 
                ? "bg-green-500/20" 
                : "bg-muted/30"
            }`}>
              <Banknote
                className={`w-5 h-5 ${
                  paymentMethod === "CASH" ? "text-green-500" : "text-muted-foreground"
                }`}
              />
            </div>
            <span
              className={`font-semibold text-xs ${
                paymentMethod === "CASH" ? "text-green-500" : "text-muted-foreground"
              }`}
            >
              Cash
            </span>
            <span className="text-[10px] text-muted-foreground">Bayar di kasir</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setPaymentMethod("TRANSFER")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
              paymentMethod === "TRANSFER"
                ? "border-primary bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/20"
                : "border-border/50 bg-input hover:border-primary/50"
            }`}
          >
            <div className={`p-2 rounded-lg ${
              paymentMethod === "TRANSFER" 
                ? "bg-primary/20" 
                : "bg-muted/30"
            }`}>
              <CreditCard
                className={`w-5 h-5 ${
                  paymentMethod === "TRANSFER" ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>
            <span
              className={`font-semibold text-xs ${
                paymentMethod === "TRANSFER" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Transfer
            </span>
            <span className="text-[10px] text-muted-foreground">QRIS / E-Wallet</span>
          </motion.button>
        </div>

        {/* Cash Info Message */}
        <AnimatePresence>
          {paymentMethod === "CASH" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30 text-center">
                <p className="text-sm text-green-400">
                  💵 Setelah checkout, tunjukkan kode pesanan ke kasir untuk pembayaran
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
        {/* Price Breakdown */}
        <div className="space-y-2 mb-4 p-4 bg-muted/30 rounded-xl border border-border/30">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-sm text-foreground">{formatter.format(totalPrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">PPN (11%)</span>
            <span className="text-sm text-foreground">{formatter.format(Math.round(totalPrice * 0.11))}</span>
          </div>
          <div className="h-px bg-border/50 my-2" />
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-foreground">Total Pembayaran</span>
            <span className="text-primary text-xl font-bold tracking-tight">
              {formatter.format(Math.round(totalPrice * 1.11))}
            </span>
          </div>
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
