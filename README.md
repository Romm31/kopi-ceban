# ☕ Kopi Ceban – Coffee Ordering Web App

<div align="center">

![Kopi Ceban](public/logo/logo.jpg)

**Aplikasi pemesanan kopi modern dengan UI dark coffee aesthetic**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.8-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

</div>

---

## 📖 Deskripsi

**Kopi Ceban** adalah aplikasi web pemesanan kopi full-stack yang dirancang untuk memberikan pengalaman pemesanan yang seamless dan modern. Dibangun dengan Next.js 16 App Router, aplikasi ini menggabungkan performa tinggi dengan estetika visual yang memukau menggunakan tema _dark coffee_ yang konsisten di seluruh halaman.

Dari sisi pelanggan, pengguna dapat menjelajahi menu kopi secara real-time, menambahkan item ke keranjang, dan melakukan pembayaran melalui berbagai metode termasuk QRIS, e-wallet, dan Virtual Account menggunakan integrasi **Midtrans Snap**. Proses checkout dirancang dengan pop-up modal yang elegan, memungkinkan pelanggan menyelesaikan transaksi tanpa meninggalkan halaman.

Untuk pengelola bisnis, tersedia **Admin Dashboard** lengkap dengan analytics real-time, manajemen menu CRUD, pelacakan pesanan, dan riwayat transaksi. Seluruh interface responsive dan dioptimalkan untuk penggunaan desktop maupun mobile, menjadikan Kopi Ceban solusi ideal untuk bisnis kopi modern.

---

## ✨ Fitur Utama

### 🛒 Customer Side

| Fitur               | Deskripsi                                                        |
| ------------------- | ---------------------------------------------------------------- |
| **Menu Catalog**    | Tampilan menu kopi real-time dengan gambar, harga, dan deskripsi |
| **Search & Filter** | Pencarian cepat dan filter berdasarkan nama atau harga           |
| **Shopping Cart**   | Keranjang belanja dengan animasi smooth dan counter badge        |
| **Checkout**        | Form checkout dengan validasi dan kalkulasi otomatis             |
| **Payment Gateway** | Integrasi Midtrans Snap (QRIS, GoPay, DANA, OVO, Bank Transfer)  |
| **Order Status**    | Halaman status pesanan dengan polling real-time                  |
| **Location Map**    | Google Maps embed untuk lokasi kedai                             |
| **Responsive UI**   | Optimized untuk mobile, tablet, dan desktop                      |
| **Dark Theme**      | Tema gelap dengan aksen coffee gold yang elegan                  |

### 🔐 Admin Side

| Fitur                   | Deskripsi                                                          |
| ----------------------- | ------------------------------------------------------------------ |
| **Dashboard Analytics** | Overview pendapatan, jumlah order, pending orders, dan best seller |
| **Menu Management**     | CRUD lengkap: tambah, edit, hapus menu dengan upload gambar        |
| **Order Management**    | Daftar pesanan dengan filter, detail items, dan payment logs       |
| **Transaction History** | Riwayat transaksi dengan statistik bulanan                         |
| **Revenue Chart**       | Grafik pendapatan 7 hari terakhir                                  |
| **Admin Profile**       | Pengaturan profil dan password admin                               |
| **Responsive Sidebar**  | Navigasi yang collapse di mobile                                   |

---

## 🛠️ Tech Stack

### Frontend

```
├── Next.js 16.0.8 (App Router + Turbopack)
├── TypeScript 5.x
├── Tailwind CSS 3.4
├── Shadcn/UI Components
├── Radix UI Primitives
├── Framer Motion (Animations)
├── Lucide React (Icons)
├── React Hook Form + Zod (Form Validation)
└── Google Maps Embed API
```

### Backend

```
├── Next.js API Routes
├── Prisma ORM 5.22
├── PostgreSQL (Neon.tech / Local)
└── NextAuth.js (Authentication)
```

### Payment Gateway

```
└── Midtrans Snap API (Sandbox)
    ├── QRIS
    ├── GoPay / OVO / DANA / ShopeePay
    └── Bank Transfer (VA)
```

### DevOps & Tools

```
├── Vercel (Deployment)
├── Neon.tech (PostgreSQL Cloud)
├── GitHub (Version Control)
└── npm / pnpm (Package Manager)
```

---

## ⚙️ Environment Variables

Buat file `.env` di root project dengan konfigurasi berikut:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

# Midtrans Keys
MIDTRANS_MERCHANT_ID="your-merchant-id"
MIDTRANS_CLIENT_KEY="your-client-key"
MIDTRANS_SERVER_KEY="your-server-key"
MIDTRANS_IS_PRODUCTION="false"

# For client-side Snap
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your-client-key"

# NextAuth (Optional)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

> 💡 **Catatan**: Dapatkan Midtrans keys dari [Midtrans Dashboard](https://dashboard.midtrans.com). Gunakan Sandbox keys untuk development.

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (local atau cloud)
- npm / pnpm / yarn

### Steps

```bash
# 1. Clone repository
git clone https://github.com/Romm31/kopi-ceban.git
cd kopi-ceban

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi database dan Midtrans Anda

# 4. Setup database
npx prisma migrate dev --name init
npx prisma generate

# 5. (Optional) Create admin user
npx tsx scripts/create-admin.ts

# 6. Run development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

---

## 🌐 Deployment (Vercel + Neon)

### Deploy ke Vercel

1. Push repository ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Tambahkan semua environment variables di Settings → Environment Variables
4. Deploy

### Setup Database dengan Neon

1. Buat project baru di [Neon.tech](https://neon.tech)
2. Copy connection string ke `DATABASE_URL`
3. Jalankan migrasi:

```bash
npx prisma db push
```

### Production Checklist

- [ ] Ganti Midtrans Sandbox keys dengan Production keys
- [ ] Set `MIDTRANS_IS_PRODUCTION="true"`
- [ ] Update `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` dengan Production key
- [ ] Konfigurasi webhook URL di Midtrans Dashboard
- [ ] Setup domain custom di Vercel

---

## 📁 Project Structure

```
kopi-ceban/
├── app/
│   ├── (customer)/          # Customer pages
│   │   ├── menu/
│   │   ├── pesan/
│   │   └── layout.tsx
│   ├── admin/               # Admin dashboard
│   │   └── (dashboard)/
│   ├── api/                 # API routes
│   │   ├── orders/
│   │   └── midtrans/
│   └── layout.tsx
├── components/
│   ├── ui/                  # Shadcn components
│   ├── dashboard/           # Admin components
│   └── ...
├── lib/
│   ├── prisma.ts
│   └── midtrans.ts
├── prisma/
│   └── schema.prisma
├── public/
│   ├── logo/
│   └── uploads/
└── hooks/
    └── use-cart.tsx
```

---

## 🧪 Testing Payments (Sandbox)

> ⚠️ **PENTING**: QRIS Sandbox **tidak bisa** dibayar dengan aplikasi e-wallet asli (DANA, OVO, GoPay, dll).

### Cara Test yang Benar:

1. Buat pesanan dan lanjut ke checkout
2. Pop-up Midtrans Snap akan muncul
3. Pilih metode pembayaran apapun
4. **Jangan scan QRIS dengan HP**
5. Buka [Midtrans Sandbox Dashboard](https://dashboard.sandbox.midtrans.com)
6. Navigasi ke **Transactions** → Cari order Anda
7. Klik **Actions** → **Accept** untuk simulasi pembayaran

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

<div align="center">

### Tim Pengembang

| Nama                      | NIM      |
| ------------------------- | -------- |
| **Erwin Wijaya**          | 24312092 |
| **Sendy Agus P.**         | 24312087 |
| **M. Bika Alfarid Hakim** | 24312082 |

---

Kopi Ceban Project © 2025

Made with ☕ and 💛

</div>
