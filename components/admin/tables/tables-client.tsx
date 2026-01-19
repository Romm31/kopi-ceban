"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  QrCode,
  Download,
  Trash2,
  RefreshCw,
  UtensilsCrossed,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

interface TableData {
  id: number;
  name: string;
  status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "CLEANING";
  createdAt: string;
  updatedAt: string;
  activeOrder?: {
    id: string;
    orderCode: string;
    customerName: string;
    status: string;
  } | null;
}

const statusConfig = {
  AVAILABLE: { label: "Tersedia", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: "🟢" },
  RESERVED: { label: "Direservasi", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: "🟡" },
  OCCUPIED: { label: "Terisi", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: "🔴" },
  CLEANING: { label: "Dibersihkan", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: "🔵" },
};

export function TablesClient() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [tableToDelete, setTableToDelete] = useState<TableData | null>(null);
  const [newTableName, setNewTableName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tables");
      const data = await res.json();
      if (data.success) {
        setTables(data.tables);
      }
    } catch (error) {
      toast.error("Gagal memuat data meja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleCreateTable = async () => {
    if (!newTableName.trim()) {
      toast.error("Nama meja wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTableName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Meja berhasil ditambahkan");
        setNewTableName("");
        setCreateDialogOpen(false);
        fetchTables();
      } else {
        toast.error(data.error || "Gagal menambahkan meja");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseTable = async (tableId: number) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "AVAILABLE" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Meja berhasil dirilis");
        fetchTables();
      } else {
        toast.error(data.error || "Gagal merilis meja");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const openDeleteDialog = (table: TableData) => {
    setTableToDelete(table);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/tables/${tableToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Meja berhasil dihapus");
        setDeleteDialogOpen(false);
        setTableToDelete(null);
        fetchTables();
      } else {
        toast.error(data.error || "Gagal menghapus meja");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleting(false);
    }
  };

  const generateQR = async (table: TableData) => {
    setSelectedTable(table);
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const qrUrl = `${baseUrl}/pesan?table=${table.id}`;
    
    try {
      const dataUrl = await QRCode.toDataURL(qrUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#654321",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(dataUrl);
      setQrDialogOpen(true);
    } catch (error) {
      toast.error("Gagal membuat QR Code");
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl || !selectedTable) return;
    
    const link = document.createElement("a");
    link.download = `QR-${selectedTable.name.replace(/\s+/g, "-")}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const getStatusBadge = (status: TableData["status"]) => {
    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={`${config.color} font-medium`}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  // Summary cards
  const availableCount = tables.filter(t => t.status === "AVAILABLE").length;
  const occupiedCount = tables.filter(t => t.status === "OCCUPIED").length;
  const reservedCount = tables.filter(t => t.status === "RESERVED").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Meja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{tables.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600 dark:text-green-400">Tersedia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{availableCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600 dark:text-red-400">Terisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{occupiedCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-600 dark:text-yellow-400">Direservasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{reservedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTables}
            disabled={loading}
            className="gap-2 border-border hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Tambah Meja
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Tambah Meja Baru</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Masukkan nama meja yang akan ditambahkan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tableName" className="text-foreground">Nama Meja</Label>
                <Input
                  id="tableName"
                  placeholder="Contoh: Meja 1, VIP Room, dll"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-border text-foreground hover:bg-accent">
                Batal
              </Button>
              <Button onClick={handleCreateTable} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-sm">
            <p className="text-blue-700 dark:text-blue-300 font-medium">Status Meja Otomatis</p>
            <p className="text-muted-foreground mt-1">
              Status meja akan berubah otomatis berdasarkan pesanan: <br />
              • <span className="text-yellow-600 dark:text-yellow-400">Reserved</span> → Saat customer checkout (menunggu bayar) <br />
              • <span className="text-red-600 dark:text-red-400">Occupied</span> → Saat pembayaran berhasil <br />
              • <span className="text-green-600 dark:text-green-400">Available</span> → Saat pembayaran gagal/expired/admin release
            </p>
          </div>
        </div>
      </div>

      {/* Tables List */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            Daftar Meja
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Belum ada meja. Klik "Tambah Meja" untuk memulai.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold">ID</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Nama</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Order Aktif</TableHead>
                    <TableHead className="text-muted-foreground font-semibold text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table.id} className="border-border hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        #{table.id}
                      </TableCell>
                      <TableCell className="text-foreground font-semibold">
                        {table.name}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(table.status)}
                      </TableCell>
                      <TableCell>
                        {table.activeOrder ? (
                          <a
                            href={`/admin/orders/${table.activeOrder.id}`}
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <LinkIcon className="w-3 h-3" />
                            {table.activeOrder.orderCode}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Release Button - only show if occupied/reserved */}
                          {(table.status === "OCCUPIED" || table.status === "RESERVED") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReleaseTable(table.id)}
                              title="Release Meja"
                              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-500/10"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Release
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => generateQR(table)}
                            title="Generate QR Code"
                            className="text-muted-foreground hover:text-foreground hover:bg-accent"
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(table)}
                            title="Hapus Meja"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-center">
              QR Code - {selectedTable?.name}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Scan untuk langsung memesan di meja ini
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {qrDataUrl && (
              <div className="p-4 bg-white rounded-xl shadow-lg">
                <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
              </div>
            )}
            <p className="mt-4 text-sm text-muted-foreground text-center">
              {typeof window !== "undefined" && `${window.location.origin}/pesan?table=${selectedTable?.id}`}
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={downloadQR} className="gap-2">
              <Download className="w-4 h-4" />
              Download PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Hapus Meja
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-foreground">{tableToDelete?.name}</span>?
              <br /><br />
              {tableToDelete?.activeOrder ? (
                <span className="text-destructive">
                  ⚠️ Meja ini memiliki pesanan aktif dan tidak dapat dihapus.
                </span>
              ) : (
                <span>Tindakan ini tidak dapat dibatalkan.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted hover:bg-muted/80 text-foreground">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTable}
              disabled={deleting || !!tableToDelete?.activeOrder}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Ya, Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
