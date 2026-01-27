import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  const session = await getServerSession();

  if (!session) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const [rows] = await pool.query(
      `SELECT 
        a.*,
        u.nama_lengkap as nama_siswa,
        u.kelas,
        k.nama_kategori
       FROM aspirasi a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN kategori k ON a.kategori_id = k.id
       WHERE a.id = ?`,
      [id],
    );

    console.log(session.user);

    const aspirasi = (rows as any[])[0];

    if (!aspirasi) {
      return NextResponse.json(
        { error: "Aspirasi tidak ditemukan" },
        { status: 404 },
      );
    }

    if (
      (session.user as any).role === "siswa" &&
      aspirasi.user_id != (session.user as any).id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: aspirasi });
  } catch (error: any) {
    console.error("Error fetching aspirasi detail:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail aspirasi" },
      { status: 500 },
    );
  }
}
