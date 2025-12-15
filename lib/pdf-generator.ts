import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Extend jsPDF type for autoTable
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

export interface ReportData {
  period: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  summary: {
    revenue: number;
    transactions: number;
    avgDaily: number;
    avgPerTransaction: number;
    daysInMonth: number;
  };
  bestSellers: Array<{ name: string; sold: number; revenue: number }>;
  orders: Array<{
    id: string;
    date: string;
    total: number;
    items: string[];
    status: string;
    customerName: string;
    table: string;
  }>;
}

const formatIDR = (num: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

/**
 * Generate PDF report for monthly sales
 */
export function generateMonthlyReportPDF(data: ReportData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Colors
  const primaryColor: [number, number, number] = [101, 67, 33]; // Coffee brown
  const textColor: [number, number, number] = [51, 51, 51];
  const mutedColor: [number, number, number] = [128, 128, 128];

  // ============ HEADER ============
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Penjualan Bulanan", pageWidth / 2, 18, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("KOPI CEBAN", pageWidth / 2, 28, { align: "center" });

  doc.setFontSize(11);
  doc.text(`Periode: ${data.period}`, pageWidth / 2, 36, { align: "center" });

  y = 50;

  // ============ SUMMARY CARDS ============
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Penjualan", margin, y);
  y += 10;

  // Summary boxes
  const boxWidth = (pageWidth - margin * 2 - 10) / 2;
  const boxHeight = 25;

  // Box 1: Total Revenue
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text("Total Pendapatan", margin + 5, y + 8);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(formatIDR(data.summary.revenue), margin + 5, y + 18);

  // Box 2: Total Transactions
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin + boxWidth + 10, y, boxWidth, boxHeight, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text("Jumlah Transaksi", margin + boxWidth + 15, y + 8);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(`${data.summary.transactions} transaksi`, margin + boxWidth + 15, y + 18);

  y += boxHeight + 5;

  // Box 3: Average Daily
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text("Rata-rata per Hari", margin + 5, y + 8);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(formatIDR(data.summary.avgDaily), margin + 5, y + 18);

  // Box 4: Average per Transaction
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin + boxWidth + 10, y, boxWidth, boxHeight, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text("Rata-rata per Transaksi", margin + boxWidth + 15, y + 8);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(formatIDR(data.summary.avgPerTransaction), margin + boxWidth + 15, y + 18);

  y += boxHeight + 15;

  // ============ BEST SELLERS ============
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Menu Terlaris", margin, y);
  y += 5;

  if (data.bestSellers.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["#", "Menu", "Jumlah Terjual", "Pendapatan"]],
      body: data.bestSellers.map((item, index) => [
        (index + 1).toString(),
        item.name,
        `${item.sold} pcs`,
        formatIDR(item.revenue),
      ]),
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 35, halign: "center" },
        3: { cellWidth: 40, halign: "right" },
      },
      margin: { left: margin, right: margin },
    });
    y = doc.lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...mutedColor);
    doc.text("Tidak ada data penjualan", margin, y + 5);
    y += 15;
  }

  // ============ TRANSACTION LIST ============
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Daftar Transaksi", margin, y);
  y += 5;

  if (data.orders.length > 0) {
    // Limit to first 50 orders for PDF size
    const ordersToShow = data.orders.slice(0, 50);

    autoTable(doc, {
      startY: y,
      head: [["ID", "Tanggal", "Customer", "Meja", "Total"]],
      body: ordersToShow.map((order) => [
        order.id.replace("ORD-", ""),
        order.date,
        order.customerName.substring(0, 15),
        order.table,
        formatIDR(order.total),
      ]),
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25, halign: "center" },
        4: { cellWidth: 35, halign: "right" },
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        // Footer on each page
        doc.setFontSize(8);
        doc.setTextColor(...mutedColor);
        doc.text(
          `Kopi Ceban - Halaman ${doc.getNumberOfPages()}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      },
    });

    if (data.orders.length > 50) {
      const finalY = doc.lastAutoTable.finalY + 5;
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...mutedColor);
      doc.text(
        `Menampilkan 50 dari ${data.orders.length} transaksi`,
        margin,
        finalY
      );
    }
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...mutedColor);
    doc.text("Tidak ada transaksi", margin, y + 5);
  }

  // ============ FOOTER ============
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(
      `Generated: ${new Date(data.generatedAt).toLocaleString("id-ID")}`,
      margin,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  return doc;
}
