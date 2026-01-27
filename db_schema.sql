-- Database Schema untuk Aplikasi Pengaduan Sarana Sekolah

CREATE DATABASE IF NOT EXISTS pengaduan_sekolah;
USE pengaduan_sekolah;

-- Tabel Users (untuk Admin dan Siswa)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    role ENUM('admin', 'siswa') NOT NULL,
    kelas VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Kategori Aspirasi
CREATE TABLE kategori (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_kategori VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Aspirasi
CREATE TABLE aspirasi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    kategori_id INT NOT NULL,
    judul VARCHAR(200) NOT NULL,
    deskripsi TEXT NOT NULL,
    lokasi VARCHAR(100),
    tingkat_urgensi ENUM('rendah', 'sedang', 'tinggi') DEFAULT 'sedang',
    status ENUM('pending', 'diproses', 'selesai', 'ditolak') DEFAULT 'pending',
    tanggal_pengaduan DATE NOT NULL,
    foto_bukti VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE RESTRICT
);

-- Tabel Umpan Balik
CREATE TABLE umpan_balik (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aspirasi_id INT NOT NULL,
    admin_id INT NOT NULL,
    pesan TEXT NOT NULL,
    tindakan TEXT,
    estimasi_selesai DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aspirasi_id) REFERENCES aspirasi(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Progres Perbaikan
CREATE TABLE progres_perbaikan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aspirasi_id INT NOT NULL,
    persentase INT DEFAULT 0,
    keterangan TEXT,
    foto_progres VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aspirasi_id) REFERENCES aspirasi(id) ON DELETE CASCADE
);

-- Insert Data Kategori Default
INSERT INTO kategori (nama_kategori, deskripsi) VALUES
('Ruang Kelas', 'Pengaduan terkait kondisi ruang kelas'),
('Toilet', 'Pengaduan terkait fasilitas toilet'),
('Laboratorium', 'Pengaduan terkait fasilitas laboratorium'),
('Perpustakaan', 'Pengaduan terkait fasilitas perpustakaan'),
('Lapangan', 'Pengaduan terkait lapangan olahraga'),
('Kantin', 'Pengaduan terkait fasilitas kantin'),
('Lainnya', 'Pengaduan lainnya');

-- Insert Data User Demo
-- Password untuk semua user adalah 'password123' (harus di-hash dengan bcrypt)
INSERT INTO users (username, password, nama_lengkap, role, kelas, email) VALUES
('admin', '$2a$12$PVqG4NSYSR1zR43jIsRD/.95qhLed9F7.fBGlnqNUBaxjRAlzsAr2', 'Administrator Sekolah', 'admin', NULL, 'admin@sekolah.com'),
('siswa1', '$2a$12$PVqG4NSYSR1zR43jIsRD/.95qhLed9F7.fBGlnqNUBaxjRAlzsAr2', 'Ahmad Rizki', 'siswa', 'XII RPL 1', 'ahmad@siswa.com'),
('siswa2', '$2a$12$PVqG4NSYSR1zR43jIsRD/.95qhLed9F7.fBGlnqNUBaxjRAlzsAr2', 'Siti Nurhaliza', 'siswa', 'XII RPL 2', 'siti@siswa.com');

-- Insert Data Aspirasi Demo
INSERT INTO aspirasi (user_id, kategori_id, judul, deskripsi, lokasi, tingkat_urgensi, status, tanggal_pengaduan) VALUES
(2, 1, 'Kipas Angin Rusak', 'Kipas angin di kelas XII RPL 1 sudah tidak berfungsi sejak seminggu yang lalu', 'Ruang XII RPL 1', 'sedang', 'pending', '2026-01-15'),
(3, 2, 'Pintu Toilet Rusak', 'Pintu toilet lantai 2 tidak bisa dikunci dengan baik', 'Toilet Lantai 2', 'tinggi', 'diproses', '2026-01-14'),
(2, 3, 'Komputer Lab Error', 'Beberapa komputer di lab komputer mengalami error saat booting', 'Lab Komputer 1', 'tinggi', 'selesai', '2026-01-10');

-- Insert Umpan Balik Demo
INSERT INTO umpan_balik (aspirasi_id, admin_id, pesan, tindakan, estimasi_selesai) VALUES
(2, 1, 'Terima kasih atas laporannya. Kami sudah menugaskan teknisi untuk memperbaiki', 'Perbaikan pintu toilet', '2026-01-25'),
(3, 1, 'Perbaikan komputer telah selesai dilakukan', 'Reinstall OS dan update driver', '2026-01-18');

-- Insert Progres Perbaikan Demo
INSERT INTO progres_perbaikan (aspirasi_id, persentase, keterangan) VALUES
(2, 50, 'Spare part pintu sudah dipesan, menunggu kedatangan'),
(3, 100, 'Semua komputer sudah diperbaiki dan berfungsi normal');

-- Index untuk optimasi query
CREATE INDEX idx_aspirasi_user ON aspirasi(user_id);
CREATE INDEX idx_aspirasi_kategori ON aspirasi(kategori_id);
CREATE INDEX idx_aspirasi_status ON aspirasi(status);
CREATE INDEX idx_aspirasi_tanggal ON aspirasi(tanggal_pengaduan);
CREATE INDEX idx_umpan_balik_aspirasi ON umpan_balik(aspirasi_id);