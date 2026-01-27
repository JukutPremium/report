import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM kategori ORDER BY nama_kategori ASC'
    );

    return NextResponse.json({ data: rows });
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching kategori:', err);
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori' },
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
    const { nama_kategori, deskripsi } = body;

    if (!nama_kategori) {
      return NextResponse.json(
        { error: 'Nama kategori harus diisi' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO kategori (nama_kategori, deskripsi) VALUES (?, ?)',
      [nama_kategori, deskripsi || null]
    );

    return NextResponse.json(
      {
        message: 'Kategori berhasil ditambahkan',
        id: (result as { insertId: number }).insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Error creating kategori:', err);
    return NextResponse.json(
      { error: 'Gagal menambahkan kategori' },
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
    const { id, nama_kategori, deskripsi } = body;

    if (!id || !nama_kategori) {
      return NextResponse.json(
        { error: 'ID dan nama kategori harus diisi' },
        { status: 400 }
      );
    }

    await pool.query(
      'UPDATE kategori SET nama_kategori = ?, deskripsi = ? WHERE id = ?',
      [nama_kategori, deskripsi || null, id]
    );

    return NextResponse.json({ message: 'Kategori berhasil diupdate' });
  } catch (error) {
    const err = error as Error;
    console.error('Error updating kategori:', err);
    return NextResponse.json(
      { error: 'Gagal mengupdate kategori' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID kategori harus diisi' },
        { status: 400 }
      );
    }

    const [aspirasi] = await pool.query(
      'SELECT COUNT(*) as count FROM aspirasi WHERE kategori_id = ?',
      [id]
    );

    if ((aspirasi as any[])[0].count > 0) {
      return NextResponse.json(
        { error: 'Kategori tidak dapat dihapus karena sudah digunakan' },
        { status: 400 }
      );
    }

    await pool.query('DELETE FROM kategori WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    const err = error as Error;
    console.error('Error deleting kategori:', err);
    return NextResponse.json(
      { error: 'Gagal menghapus kategori' },
      { status: 500 }
    );
  }
}