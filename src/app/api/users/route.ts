import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [rows] = await pool.query(
      `SELECT id, username, nama_lengkap, role, kelas, email, created_at 
       FROM users 
       ORDER BY created_at DESC`,
    );

    return NextResponse.json({ data: rows });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching users:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, password, nama_lengkap, role, kelas, email } = body;

    if (!username || !password || !nama_lengkap || !role) {
      return NextResponse.json(
        { error: "Username, password, nama lengkap, dan role harus diisi" },
        { status: 400 },
      );
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );

    if ((existing as Array<{ id: number }>).length > 0) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (username, password, nama_lengkap, role, kelas, email) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        username,
        hashedPassword,
        nama_lengkap,
        role,
        kelas || null,
        email || null,
      ],
    );

    return NextResponse.json(
      {
        message: "User berhasil ditambahkan",
        id: (result as { insertId: number }).insertId,
      },
      { status: 201 },
    );
  } catch (error) {
    const err = error as Error;
    console.error("Error creating user:", err);
    return NextResponse.json(
      { error: "Gagal menambahkan user" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, username, password, nama_lengkap, role, kelas, email } = body;

    if (!id || !username || !nama_lengkap || !role) {
      return NextResponse.json(
        { error: "ID, username, nama lengkap, dan role harus diisi" },
        { status: 400 },
      );
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ? AND id != ?",
      [username, id],
    );

    if ((existing as Array<{ id: number }>).length > 0) {
      return NextResponse.json(
        { error: "Username sudah digunakan oleh user lain" },
        { status: 400 },
      );
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users 
         SET username = ?, password = ?, nama_lengkap = ?, role = ?, kelas = ?, email = ? 
         WHERE id = ?`,
        [
          username,
          hashedPassword,
          nama_lengkap,
          role,
          kelas || null,
          email || null,
          id,
        ],
      );
    } else {
      await pool.query(
        `UPDATE users 
         SET username = ?, nama_lengkap = ?, role = ?, kelas = ?, email = ? 
         WHERE id = ?`,
        [username, nama_lengkap, role, kelas || null, email || null, id],
      );
    }

    return NextResponse.json({ message: "User berhasil diupdate" });
  } catch (error) {
    const err = error as Error;
    console.error("Error updating user:", err);
    return NextResponse.json(
      { error: "Gagal mengupdate user" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID user harus diisi" },
        { status: 400 },
      );
    }

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus user sendiri" },
        { status: 400 },
      );
    }

    await pool.query("DELETE FROM users WHERE id = ?", [id]);

    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    const err = error as Error;
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { error: "Gagal menghapus user" },
      { status: 500 },
    );
  }
}
