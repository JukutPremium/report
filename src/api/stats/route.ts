import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [kategoriStats] = await pool.query(`
      SELECT 
        k.nama_kategori,
        COUNT(a.id) as jumlah
      FROM kategori k
      LEFT JOIN aspirasi a ON k.id = a.kategori_id
      GROUP BY k.id, k.nama_kategori
      ORDER BY jumlah DESC
    `);

    const [statusStats] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as jumlah
      FROM aspirasi
      GROUP BY status
    `);

    const [trendStats] = await pool.query(`
      SELECT 
        DATE_FORMAT(tanggal_pengaduan, '%Y-%m') as bulan,
        COUNT(*) as jumlah
      FROM aspirasi
      WHERE tanggal_pengaduan >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY bulan
      ORDER BY bulan ASC
    `);

    const [urgensiStats] = await pool.query(`
      SELECT 
        tingkat_urgensi,
        COUNT(*) as jumlah
      FROM aspirasi
      GROUP BY tingkat_urgensi
    `);

    const [overallStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'diproses' THEN 1 ELSE 0 END) as diproses,
        SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as selesai,
        SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as ditolak,
        SUM(CASE WHEN tingkat_urgensi = 'tinggi' THEN 1 ELSE 0 END) as urgent
      FROM aspirasi
    `);

    const [recentActivity] = await pool.query(`
      SELECT 
        a.id,
        a.judul,
        a.status,
        a.tingkat_urgensi,
        a.created_at,
        u.nama_lengkap as nama_siswa
      FROM aspirasi a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    return NextResponse.json({
      kategori: kategoriStats,
      status: statusStats,
      trend: trendStats,
      urgensi: urgensiStats,
      overall: (
        overallStats as Array<{
          total: number;
          pending: number;
          diproses: number;
          selesai: number;
          ditolak: number;
          urgent: number;
        }>
      )[0],
      recentActivity: recentActivity,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching stats:", err);
    return NextResponse.json(
      { error: "Gagal mengambil statistik" },
      { status: 500 },
    );
  }
}
