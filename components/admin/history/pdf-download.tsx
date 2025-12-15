"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { generateMonthlyReportPDF, type ReportData } from "@/lib/pdf-generator";

const months = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

export function PdfDownload() {
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Fetch report data from API
      const response = await fetch(
        `/api/reports/monthly?month=${selectedMonth}&year=${selectedYear}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal mengambil data laporan");
      }

      const reportData: ReportData = data.report;

      if (reportData.orders.length === 0) {
        toast.info("Tidak ada transaksi pada periode ini");
        return;
      }

      // Generate PDF
      const pdf = generateMonthlyReportPDF(reportData);
      
      // Download
      const monthName = months.find(m => m.value === selectedMonth)?.label || selectedMonth;
      pdf.save(`Laporan-${monthName}-${selectedYear}.pdf`);
      
      toast.success("PDF berhasil diunduh!");
    } catch (error) {
      console.error("PDF Download Error:", error);
      toast.error((error as Error).message || "Gagal mengunduh PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-coffee-cream flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Unduh Laporan Bulanan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Bulan
            </label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="bg-input border-border/50">
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Tahun
            </label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-input border-border/50">
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleDownload}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 gap-2 h-10 sm:h-9"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Laporan mencakup total pendapatan, jumlah transaksi, menu terlaris, dan daftar transaksi.
        </p>
      </CardContent>
    </Card>
  );
}
