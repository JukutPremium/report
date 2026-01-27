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
    const aspirasiId = searchParams.get('aspirasi_id');

    if (!aspirasiId) {
      return NextResponse.json(
        { error: 'aspirasi_id harus diisi' },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `SELECT 
        ub.*,
        u.nama_lengkap as nama_admin
       FROM umpan_balik ub
       LEFT JOIN users u ON ub.admin_id = u.id
       WHERE ub.aspirasi_id = ?
       ORDER BY ub.created_at DESC`,
      [aspirasiId]
    );

    return NextResponse.json({ data: rows });
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching umpan balik:', err);
    return NextResponse.json(
      { error: 'Gagal mengambil data umpan balik' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { aspirasi_id, pesan, tindakan, estimasi_selesai } = body;

    if (!aspirasi_id || !pesan) {
      return NextResponse.json(
        { error: 'aspirasi_id dan pesan harus diisi' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO umpan_balik 
        (aspirasi_id, admin_id, pesan, tindakan, estimasi_selesai) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        aspirasi_id,
        session.user.id,
        pesan,
        tindakan || null,
        estimasi_selesai || null,
      ]
    );

    return NextResponse.json(
      {
        message: 'Umpan balik berhasil dibuat',
        id: (result as { insertId: number }).insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Error creating umpan balik:', err);
    return NextResponse.json(
      { error: 'Gagal membuat umpan balik' },
      { status: 500 }
    );
  }
}