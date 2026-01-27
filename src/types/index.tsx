export interface User {
    id: number;
    username: string;
    nama_lengkap: string;
    role: 'admin' | 'siswa';
    kelas?: string;
    email?: string;
    created_at: Date;
}

export interface Kategori {
    id: number;
    nama_kategori: string;
    deskripsi?: string;
}

export interface Aspirasi {
    id: number;
    user_id: number;
    kategori_id: number;
    judul: string;
    deskripsi: string;
    lokasi?: string;
    tingkat_urgensi: 'rendah' | 'sedang' | 'tinggi';
    status: 'pending' | 'diproses' | 'selesai' | 'ditolak';
    tanggal_pengaduan: Date;
    foto_bukti?: string;
    created_at: Date;
    updated_at: Date;

    user?: User;
    kategori?: Kategori;
    umpan_balik?: UmpanBalik[];
    progres?: ProgresPerbaikan[];
}

export interface UmpanBalik {
    id: number;
    aspirasi_id: number;
    admin_id: number;
    pesan: string;
    tindakan?: string;
    estimasi_selesai?: Date;
    created_at: Date;
    updated_at: Date;

    admin?: User;
}

export interface ProgresPerbaikan {
    id: number;
    aspirasi_id: number;
    persentase: number;
    keterangan?: string;
    foto_progres?: string;
    created_at: Date;
}

export interface DashboardStats {
    total_aspirasi: number;
    pending: number;
    diproses: number;
    selesai: number;
    ditolak: number;
    aspirasi_bulan_ini: number;
}

export interface FilterOptions {
    tanggal?: string;
    bulan?: string;
    tahun?: string;
    user_id?: number;
    kategori_id?: number;
    status?: string;
}