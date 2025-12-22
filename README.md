# ☕ Kopi Ceban – Coffee Ordering Web App

<div align="center">

![Kopi Ceban](public/logo/logo.jpg)

**Aplikasi pemesanan kopi modern dengan UI dark coffee aesthetic**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.8-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.1-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

[Demo Live](https://kopi-ceban.vercel.app) • [Dokumentasi](#-installation--setup) • [Kontribusi](#-kontribusi)

</div>

---

## 📖 Deskripsi

**Kopi Ceban** adalah aplikasi web pemesanan kopi full-stack yang dirancang untuk memberikan pengalaman pemesanan yang seamless dan modern. Dibangun dengan Next.js 16 App Router dan React 19, aplikasi ini menggabungkan performa tinggi dengan estetika visual yang memukau menggunakan tema _dark coffee_ yang konsisten di seluruh halaman.

Dari sisi pelanggan, pengguna dapat menjelajahi menu kopi secara real-time, menambahkan item ke keranjang, dan melakukan pembayaran melalui berbagai metode termasuk **Cash**, **QRIS**, e-wallet, dan Virtual Account menggunakan integrasi **Midtrans Snap**. Proses checkout dirancang dengan pop-up modal yang elegan, serta fitur download struk/receipt dalam format gambar PNG.

Untuk pengelola bisnis, tersedia **Admin Dashboard** lengkap dengan analytics real-time, manajemen menu CRUD, pelacakan pesanan, riwayat transaksi dengan export Excel, dan manajemen meja. Seluruh interface responsive dan dioptimalkan untuk penggunaan desktop maupun mobile, menjadikan Kopi Ceban solusi ideal untuk bisnis kopi modern.

---

## ✨ Fitur Utama

### 🛒 Customer Side

| Fitur                   | Deskripsi                                                        |
| ----------------------- | ---------------------------------------------------------------- |
| **Menu Catalog**        | Tampilan menu kopi real-time dengan gambar, harga, dan deskripsi |
| **Search & Filter**     | Pencarian cepat dan filter berdasarkan nama atau harga           |
| **Shopping Cart**       | Keranjang belanja dengan animasi smooth dan counter badge        |
| **Dine-in / Take Away** | Pilihan makan di tempat dengan nomor meja atau bawa pulang       |
| **Customer Notes**      | Catatan khusus untuk pesanan (tingkat gula, suhu, dll)           |
| **Checkout**            | Form checkout dengan validasi dan kalkulasi otomatis             |
| **Payment Methods**     | Cash (bayar di kasir) atau Transfer (Midtrans Snap)              |
| **Payment Gateway**     | Integrasi Midtrans Snap (QRIS, GoPay, DANA, OVO, Bank Transfer)  |
| **Order Status**        | Halaman status pesanan dengan polling real-time                  |
| **Receipt Download**    | Download struk pesanan dalam format PNG                          |
| **Location Map**        | Google Maps embed untuk lokasi kedai                             |
| **Responsive UI**       | Optimized untuk mobile, tablet, dan desktop                      |
| **Dark Theme**          | Tema gelap premium dengan aksen coffee gold yang elegan          |

### 🔐 Admin Side

| Fitur                   | Deskripsi                                                                |
| ----------------------- | ------------------------------------------------------------------------ |
| **Dashboard Analytics** | Overview pendapatan, jumlah order, pending orders, dan best seller       |
| **Menu Management**     | CRUD lengkap: tambah, edit, hapus menu dengan upload gambar (Cloudinary) |
| **Order Management**    | Daftar pesanan dengan filter, detail items, update status, dan receipt   |
| **Payment Logs**        | Riwayat callback dari Midtrans untuk setiap transaksi                    |
| **Transaction History** | Riwayat transaksi dengan statistik dan export ke Excel                   |
| **Revenue Chart**       | Grafik pendapatan 7 hari terakhir (Recharts)                             |
| **Table Management**    | Manajemen meja untuk pesanan dine-in                                     |
| **Admin Profile**       | Pengaturan profil dan password admin                                     |
| **Responsive Sidebar**  | Navigasi yang collapse di mobile                                         |

---

## 🛠️ Tech Stack

### Frontend

```
├── Next.js 16.0.8 (App Router + Turbopack)
├── React 19.2.1
├── TypeScript 5.x
├── Tailwind CSS 4.x
├── Shadcn/UI Components
├── Radix UI Primitives
├── Framer Motion (Animations)
├── Recharts (Charts & Analytics)
├── Lucide React (Icons)
├── React Hook Form + Zod (Form Validation)
├── html2canvas (Receipt Generation)
└── Google Maps Embed API
```

### Backend

```
├── Next.js API Routes (Route Handlers)
├── Server Actions
├── Prisma ORM 5.22
├── PostgreSQL (Neon.tech / Local / Docker)
└── NextAuth.js v4 (Authentication)
```

### Payment Gateway

```
└── Midtrans Snap API
    ├── QRIS
    ├── GoPay / OVO / DANA / ShopeePay
    ├── Bank Transfer (Virtual Account)
    └── Webhook Notifications
```

### DevOps & Tools

```
├── Vercel (Deployment)
├── Neon.tech (PostgreSQL Cloud)
├── Docker Compose (Local Development)
├── Cloudinary (Image Upload)
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
│   ├── (customer)/              # Customer-facing pages
│   │   ├── menu/                # Menu catalog page
│   │   ├── pesan/               # Order page with cart
│   │   ├── status/              # Order status page
│   │   └── layout.tsx           # Shared navbar layout
│   ├── admin/                   # Admin dashboard
│   │   ├── (auth)/              # Login, logout pages
│   │   └── (dashboard)/         # Protected admin pages
│   │       ├── dashboard/       # Analytics overview
│   │       ├── menu/            # Menu CRUD management
│   │       ├── orders/          # Order management
│   │       ├── history/         # Transaction history
│   │       └── profile/         # Admin profile settings
│   ├── api/                     # API Routes
│   │   ├── orders/              # Order CRUD endpoints
│   │   ├── menu/                # Menu endpoints
│   │   ├── midtrans/            # Payment gateway webhooks
│   │   ├── history/             # Export endpoints
│   │   └── auth/                # NextAuth handlers
│   ├── actions/                 # Server Actions
│   └── layout.tsx               # Root layout
├── components/
│   ├── ui/                      # Shadcn/UI components
│   ├── admin/                   # Admin-specific components
│   ├── dashboard/               # Dashboard widgets
│   ├── form/                    # Form components
│   ├── cart/                    # Shopping cart components
│   └── receipt/                 # Receipt/struk components
├── hooks/
│   ├── use-cart.tsx             # Cart state management
│   └── use-mobile.tsx           # Responsive detection
├── lib/
│   ├── prisma.ts                # Prisma client singleton
│   ├── midtrans.ts              # Midtrans configuration
│   └── utils.ts                 # Utility functions
├── prisma/
│   └── schema.prisma            # Database schema
├── scripts/
│   └── create-admin.ts          # Admin user seeding
├── public/
│   └── logo/                    # Brand assets
└── compose.yml                  # Docker Compose config
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

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan ikuti langkah berikut:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 🙏 Credits

<div align="center">

### Tim Pengembang

| Nama                      | NPM      | Role           |
| ------------------------- | -------- | -------------- |
| **Erwin Wijaya**          | 24312092 | Full-stack Dev |
| **Sendy Agus P.**         | 24312087 | Frontend Dev   |
| **M. Bika Alfarid Hakim** | 24312082 | Backend Dev    |

---

**Universitas Teknokrat Indonesia**

</div>
