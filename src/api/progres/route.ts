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
      `SELECT * FROM progres_perbaikan 
       WHERE aspirasi_id = ? 
       ORDER BY created_at DESC`,
      [aspirasiId]
    );

    return NextResponse.json({ data: rows });
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching progres:', err);
    return NextResponse.json(
      { error: 'Gagal mengambil data progres' },
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
    const { aspirasi_id, persentase, keterangan } = body;

    if (!aspirasi_id || persentase === undefined) {
      return NextResponse.json(
        { error: 'aspirasi_id dan persentase harus diisi' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO progres_perbaikan 
        (aspirasi_id, persentase, keterangan) 
       VALUES (?, ?, ?)`,
      [aspirasi_id, persentase, keterangan || null]
    );

    return NextResponse.json(
      {
        message: 'Progres berhasil ditambahkan',
        id: (result as { insertId: number }).insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Error creating progres:', err);
    return NextResponse.json(
      { error: 'Gagal menambahkan progres' },
      { status: 500 }
    );
  }
}