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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Edit,
  RefreshCw,
  UtensilsCrossed,
  Link as LinkIcon,
  Loader2,
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
  AVAILABLE: { label: "Tersedia", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  RESERVED: { label: "Direservasi", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  OCCUPIED: { label: "Terisi", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  CLEANING: { label: "Dibersihkan", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

export function TablesClient() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [newTableName, setNewTableName] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

  const handleUpdateStatus = async (tableId: number, status: string) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Status meja diperbarui");
        fetchTables();
      } else {
        toast.error(data.error || "Gagal memperbarui status");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleDeleteTable = async (tableId: number) => {
    if (!confirm("Yakin ingin menghapus meja ini?")) return;

    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Meja berhasil dihapus");
        fetchTables();
      } else {
        toast.error(data.error || "Gagal menghapus meja");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const generateQR = async (table: TableData) => {
    setSelectedTable(table);
    // Use relative URL for development, replace with production domain
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
        {config.label}
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
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Meja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-coffee-cream">{tables.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-400">Tersedia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{availableCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-400">Terisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{occupiedCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-400">Direservasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{reservedCount}</div>
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
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Tambah Meja
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-coffee-cream">Tambah Meja Baru</DialogTitle>
              <DialogDescription>
                Masukkan nama meja yang akan ditambahkan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tableName">Nama Meja</Label>
                <Input
                  id="tableName"
                  placeholder="Contoh: Meja 1, VIP Room, dll"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
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

      {/* Tables List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-coffee-cream flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
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
                  <TableRow className="border-border/50">
                    <TableHead className="text-coffee-cream">ID</TableHead>
                    <TableHead className="text-coffee-cream">Nama</TableHead>
                    <TableHead className="text-coffee-cream">Status</TableHead>
                    <TableHead className="text-coffee-cream">Order Aktif</TableHead>
                    <TableHead className="text-coffee-cream text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table.id} className="border-border/30">
                      <TableCell className="font-medium text-coffee-cream">
                        #{table.id}
                      </TableCell>
                      <TableCell className="text-coffee-cream font-semibold">
                        {table.name}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={table.status}
                          onValueChange={(value) => handleUpdateStatus(table.id, value)}
                        >
                          <SelectTrigger className="w-36 bg-transparent border-none p-0 h-auto">
                            <SelectValue>{getStatusBadge(table.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AVAILABLE">
                              <span className="text-green-400">Tersedia</span>
                            </SelectItem>
                            <SelectItem value="CLEANING">
                              <span className="text-blue-400">Dibersihkan</span>
                            </SelectItem>
                            <SelectItem value="RESERVED" disabled>
                              <span className="text-yellow-400">Direservasi</span>
                            </SelectItem>
                            <SelectItem value="OCCUPIED" disabled>
                              <span className="text-red-400">Terisi</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => generateQR(table)}
                            title="Generate QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTable(table.id)}
                            title="Hapus Meja"
                            className="text-destructive hover:text-destructive"
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
            <DialogTitle className="text-coffee-cream text-center">
              QR Code - {selectedTable?.name}
            </DialogTitle>
            <DialogDescription className="text-center">
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
    </div>
  );
}
