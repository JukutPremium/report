feature/api/aspirasi
feature/api/auth
feature/api/kategori
feature/api/progres
feature/api/stats
feature/api/umpan-balik
feature/api/users
feature/dashboard
feature/d/aspirasi
feature/d/histori
feature/d/pengaturan
feature/lib
feature/login
feature/types

### 1. Environment Variables

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