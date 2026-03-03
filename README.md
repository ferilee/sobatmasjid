# SobatMasjid

Aplikasi volunteer, donatur, dan partner untuk aksi bersih masjid.

## Fitur utama
- Email OTP login.
- Onboarding + pemilihan role (Volunteer, Donatur, Partner) dan switch role.
- Partner membuat request cleansing masjid.
- Volunteer discovery aksi terdekat + join event + link koordinasi.
- Donatur kontribusi dana/logistik/konsumsi + riwayat bantuan.
- Pelaporan aksi + activity feed + dashboard statistik.

## Setup
1. Salin `.env.example` ke `.env.local` dan isi kredensial MariaDB.
2. Install dependency: `npm install`
3. Generate/push schema: `npm run db:generate && npm run db:push`
4. Jalankan dev server: `npm run dev`

## API
Endpoint utama ada di `app/api/[[...route]]/route.ts` dengan base path `/api`.
