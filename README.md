# Aplikasi Pengaduan Sarana Sekolah

Aplikasi web untuk mengelola pengaduan dan aspirasi terkait sarana dan prasarana sekolah dengan sistem role-based access control (Admin & Siswa).

## 🚀 Fitur Utama

### Untuk Admin
- ✅ Melihat semua aspirasi (list keseluruhan)
- ✅ Filter aspirasi (per tanggal, per bulan, per siswa, per kategori)
- ✅ Melihat dan mengubah status penyelesaian
- ✅ Memberikan umpan balik pada aspirasi
- ✅ Menambahkan progres perbaikan dengan persentase
- ✅ Melihat histori semua aspirasi
- ✅ Dashboard dengan statistik

### Untuk Siswa
- ✅ Membuat aspirasi/pengaduan baru
- ✅ Melihat status penyelesaian aspirasi sendiri
- ✅ Melihat umpan balik dari admin
- ✅ Melihat progres perbaikan
- ✅ Melihat histori aspirasi sendiri

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm atau yarn

## 🔧 Instalasi

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd pengaduan-sekolah

# Install dependencies
npm install
```

### 2. Setup Database

```bash
# Login ke MySQL
mysql -u root -p

# Jalankan script database
source db_schema.sql
```

Atau import manual menggunakan MySQL Workbench atau phpMyAdmin.

### 3. Generate Password Hash

Buat file `hash-password.js`:

```javascript
const bcrypt = require('bcryptjs');
const password = 'password123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Jalankan:
```bash
node hash-password.js
```

Copy hasil hash dan update di tabel `users`.

### 4. Environment Variables

Buat file `.env.local`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pengaduan_sekolah

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-using-openssl-rand-base64-32

# Upload
UPLOAD_DIR=./public/uploads
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 5. Jalankan Aplikasi

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Buka browser: `http://localhost:3000`

## 👥 Login Credentials

### Admin
- Username: `admin`
- Password: `password123`

### Siswa
- Username: `siswa1`
- Password: `password123`

## 📁 Struktur Project

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth configuration
│   │   ├── aspirasi/               # Aspirasi endpoints
│   │   ├── kategori/               # Kategori endpoints
│   │   ├── umpan-balik/            # Umpan balik endpoints
│   │   └── progres/                # Progres endpoints
│   ├── dashboard/
│   │   ├── page.tsx                # Dashboard utama
│   │   ├── aspirasi/
│   │   │   ├── buat/               # Form buat aspirasi
│   │   │   └── [id]/               # Detail aspirasi
│   │   └── histori/                # Halaman histori
│   ├── login/                      # Halaman login
│   └── layout.tsx                  # Root layout
├── components/
│   ├── ui/                         # shadcn/ui components
│   └── SessionProvider.tsx         # Session provider
├── lib/
│   ├── db.ts                       # Database connection
│   └── utils.ts                    # Utility functions
└── types/
    └── index.ts                    # TypeScript types
```

## 🔐 Role-Based Access Control

### Admin dapat:
- Melihat semua aspirasi
- Mengubah status aspirasi
- Memberikan umpan balik
- Menambahkan progres perbaikan
- Filter berdasarkan siswa

### Siswa dapat:
- Membuat aspirasi baru
- Melihat aspirasi sendiri
- Melihat umpan balik
- Melihat progres perbaikan
- Tidak bisa mengubah status

## 📊 Database Schema

### Tabel Users
- id, username, password, nama_lengkap, role, kelas, email

### Tabel Kategori
- id, nama_kategori, deskripsi

### Tabel Aspirasi
- id, user_id, kategori_id, judul, deskripsi, lokasi, tingkat_urgensi, status, tanggal_pengaduan

### Tabel Umpan Balik
- id, aspirasi_id, admin_id, pesan, tindakan, estimasi_selesai

### Tabel Progres Perbaikan
- id, aspirasi_id, persentase, keterangan, foto_progres

## 🎨 Fitur UI/UX

- ✨ Responsive design untuk mobile & desktop
- 🎯 Filter dan pencarian real-time
- 📈 Progress bar untuk tracking perbaikan
- 🏷️ Color-coded badges untuk status dan urgensi
- 📅 Grouping histori berdasarkan bulan
- 🔔 Alert notifications untuk feedback
- 📊 Dashboard dengan statistik

## 🔄 API Endpoints

### Aspirasi
- `GET /api/aspirasi` - List aspirasi dengan filter
- `POST /api/aspirasi` - Buat aspirasi baru
- `PUT /api/aspirasi` - Update status
- `GET /api/aspirasi/[id]` - Detail aspirasi

### Umpan Balik
- `GET /api/umpan-balik?aspirasi_id=[id]` - List umpan balik
- `POST /api/umpan-balik` - Tambah umpan balik

### Progres
- `GET /api/progres?aspirasi_id=[id]` - List progres
- `POST /api/progres` - Tambah progres

### Kategori
- `GET /api/kategori` - List kategori

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Pastikan MySQL sudah running
- Cek credentials di `.env.local`
- Cek firewall settings

### Error: "NextAuth not configured"
- Pastikan NEXTAUTH_SECRET sudah di-set
- Generate ulang dengan `openssl rand -base64 32`

### Error: "Unauthorized"
- Clear browser cookies
- Logout dan login kembali
- Cek session di browser DevTools

## 📝 Pengembangan Lebih Lanjut

### Fitur yang bisa ditambahkan:
1. Upload foto bukti pengaduan
2. Notifikasi real-time (WebSocket/Pusher)
3. Export laporan ke PDF/Excel
4. Dashboard analytics dengan charts
5. Email notifications
6. Mobile app dengan React Native
7. Multi-bahasa (i18n)
8. Dark mode

### Security Enhancements:
1. Rate limiting
2. CSRF protection
3. Input sanitization
4. File upload validation
5. SQL injection prevention (sudah ada via prepared statements)

## 📞 Support

Untuk pertanyaan atau masalah, silakan buat issue di repository ini.

## 📄 License

MIT License - Bebas digunakan untuk keperluan pendidikan dan komersial.

---

**Dibuat untuk tugas Kelas XII - Junior Assistant Programmer**

Semoga sukses! 🎓