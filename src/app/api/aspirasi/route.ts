import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal');
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');
    const userId = searchParams.get('user_id');
    const kategoriId = searchParams.get('kategori_id');
    const status = searchParams.get('status');

    let query = `
      SELECT 
        a.*,
        u.nama_lengkap as nama_siswa,
        u.kelas,
        k.nama_kategori,
        COUNT(DISTINCT ub.id) as jumlah_umpan_balik,
        MAX(p.persentase) as persentase_progres
      FROM aspirasi a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN kategori k ON a.kategori_id = k.id
      LEFT JOIN umpan_balik ub ON a.id = ub.aspirasi_id
      LEFT JOIN progres_perbaikan p ON a.id = p.aspirasi_id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (session.user.role === 'siswa') {
      query += ' AND a.user_id = ?';
      params.push(session.user.id);
    }

    if (tanggal) {
      query += ' AND DATE(a.tanggal_pengaduan) = ?';
      params.push(tanggal);
    }

    if (bulan && tahun) {
      query += ' AND MONTH(a.tanggal_pengaduan) = ? AND YEAR(a.tanggal_pengaduan) = ?';
      params.push(parseInt(bulan), parseInt(tahun));
    } else if (tahun) {
      query += ' AND YEAR(a.tanggal_pengaduan) = ?';
      params.push(parseInt(tahun));
    }

    if (userId && session.user.role === 'admin') {
      query += ' AND a.user_id = ?';
      params.push(parseInt(userId));
    }

    if (kategoriId) {
      query += ' AND a.kategori_id = ?';
      params.push(parseInt(kategoriId));
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' GROUP BY a.id ORDER BY a.created_at DESC';

    const [rows] = await pool.query(query, params);

    return NextResponse.json({ data: rows });
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching aspirasi:', err);
    return NextResponse.json(
      { error: 'Gagal mengambil data aspirasi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      kategori_id,
      judul,
      deskripsi,
      lokasi,
      tingkat_urgensi,
    } = body;

    if (!kategori_id || !judul || !deskripsi) {
      return NextResponse.json(
        { error: 'Kategori, judul, dan deskripsi harus diisi' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO aspirasi 
        (user_id, kategori_id, judul, deskripsi, lokasi, tingkat_urgensi, tanggal_pengaduan) 
       VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
      [
        session.user.id,
        kategori_id,
        judul,
        deskripsi,
        lokasi || null,
        tingkat_urgensi || 'sedang',
      ]
    );

    return NextResponse.json(
      { 
        message: 'Aspirasi berhasil dibuat',
        id: (result as { insertId: number }).insertId 
      },
      { status: 201 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Error creating aspirasi:', err);
    return NextResponse.json(
      { error: 'Gagal membuat aspirasi' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID dan status harus diisi' },
        { status: 400 }
      );
    }

    await pool.query(
      'UPDATE aspirasi SET status = ? WHERE id = ?',
      [status, id]
    );

    return NextResponse.json({ message: 'Status berhasil diupdate' });
  } catch (error) {
    const err = error as Error;
    console.error('Error updating aspirasi:', err);
    return NextResponse.json(
      { error: 'Gagal mengupdate status' },
      { status: 500 }
    );
  }
}