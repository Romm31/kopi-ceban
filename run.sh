#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Memulai setup untuk kopi-ceban...${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm tidak terinstall. Mohon install Node.js dan npm terlebih dahulu.${NC}"
    exit 1
fi

# 1. Environment Setup
if [ ! -f .env ]; then
    echo -e "${GREEN}Membuat file .env dari env.example...${NC}"
    cp env.example .env
    
    # Update DATABASE_URL to match docker-compose credentials
    echo -e "${YELLOW}Mengkonfigurasi .env dengan kredensial Docker...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's|postgresql://user:password@localhost:5432/kopiceban|postgresql://kopiadmin:kopipass123@localhost:5432/kopiceban|g' .env
    else
        sed -i 's|postgresql://user:password@localhost:5432/kopiceban|postgresql://kopiadmin:kopipass123@localhost:5432/kopiceban|g' .env
    fi
else
    echo -e "${YELLOW}File .env sudah ada. Melewati pembuatan file.${NC}"
fi

# 2. Install Dependencies
echo -e "${GREEN}Menginstall dependencies...${NC}"
npm install

# 3. Start Database (Docker)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}Menyalakan database dengan Docker Compose...${NC}"
    docker compose up -d db
    
    echo -e "${YELLOW}Menunggu database siap...${NC}"
    sleep 5 # Give it a moment to initialize
else
    echo -e "${RED}Docker tidak ditemukan. Melewati startup database.${NC}"
    echo -e "${YELLOW}Pastikan database PostgreSQL Anda berjalan dan dapat diakses sesuai URL di .env${NC}"
fi

# 4. Database Migration & Prisma Generation
echo -e "${GREEN}Menyiapkan skema database...${NC}"
npx prisma generate
npx prisma migrate dev --name init

# 5. Important Security Reminders
echo -e "\n${YELLOW}PENGINGAT KONFIGURASI PENTING${NC}"
echo -e "1. Kredensial database diatur ke default: ${GREEN}kopiadmin / kopipass123${NC} (sesuai compose.yml)"
echo -e "2. Mohon update ${YELLOW}NEXTAUTH_SECRET${NC} di .env untuk keamanan."
echo -e "3. Jangan lupa mengatur ${YELLOW}MIDTRANS_SERVER_KEY${NC} dan ${YELLOW}MIDTRANS_CLIENT_KEY${NC}."
echo -e "   (Cek docs/MIDTRANS_SETUP.md untuk panduan)\n"

# 6. Start Development Server
echo -e "${GREEN}Menjalankan development server...${NC}"
npm run dev
