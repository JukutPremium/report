'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SessionUserWithRole {
  role?: string;
}

interface AspirasiHistori {
  id: number;
  judul: string;
  nama_siswa: string;
  kelas: string;
  nama_kategori: string;
  status: string;
  tingkat_urgensi: string;
  tanggal_pengaduan: string;
  persentase_progres: number;
  jumlah_umpan_balik: number;
}

export default function HistoriPage() {
  const { data: session } = useSession();
  const [aspirasi, setAspirasi] = useState<AspirasiHistori[]>([]);
  const [filteredAspirasi, setFilteredAspirasi] = useState<AspirasiHistori[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    fetchAspirasi();
  }, []);

  useEffect(() => {
    filterAspirasi();
  }, [searchTerm, selectedMonth, aspirasi]);

  const fetchAspirasi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aspirasi');
      const data = await response.json();

      if (data.data) {
        const sorted = data.data.sort(
          (a: AspirasiHistori, b: AspirasiHistori) =>
            new Date(b.tanggal_pengaduan).getTime() -
            new Date(a.tanggal_pengaduan).getTime()
        );
        setAspirasi(sorted);
        setFilteredAspirasi(sorted);
      }
    } catch (error) {
      console.error('Error fetching aspirasi:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAspirasi = () => {
    let filtered = [...aspirasi];

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMonth && selectedMonth !== 'all') {
      filtered = filtered.filter((a) => {
        const date = new Date(a.tanggal_pengaduan);
        const monthYear = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`;
        return monthYear === selectedMonth;
      });
    }

    setFilteredAspirasi(filtered);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      diproses: 'bg-blue-100 text-blue-800',
      selesai: 'bg-green-100 text-green-800',
      ditolak: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[status] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getUrgensiColor = (urgensi: string) => {
    const colors: Record<string, string> = {
      rendah: 'text-green-600',
      sedang: 'text-yellow-600',
      tinggi: 'text-red-600',
    };
    return colors[urgensi] || '';
  };

  const groupedByMonth = filteredAspirasi.reduce((acc, item) => {
    const date = new Date(item.tanggal_pengaduan);
    const monthYear = date.toLocaleString('id-ID', {
      month: 'long',
      year: 'numeric',
    });

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(item);
    return acc;
  }, {} as Record<string, AspirasiHistori[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Histori Aspirasi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cari & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cari Aspirasi</Label>
              <Input
                placeholder="Cari berdasarkan judul, siswa, atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Filter Bulan</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>

          {(searchTerm || selectedMonth) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMonth('all');
                }}
              >
                Reset Filter
              </Button>
              <span className="ml-4 text-sm text-gray-600">
                Menampilkan {filteredAspirasi.length} dari {aspirasi.length} aspirasi
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">Memuat data...</p>
          </CardContent>
        </Card>
      ) : filteredAspirasi.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">Tidak ada data aspirasi</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByMonth).map(([month, items]) => (
          <Card key={month}>
            <CardHeader>
              <CardTitle className="text-xl">{month}</CardTitle>
              <p className="text-sm text-gray-600">{items.length} aspirasi</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Judul</TableHead>
                    {(session?.user as SessionUserWithRole)?.role === 'admin' && (
                      <TableHead>Siswa</TableHead>
                    )}
                    <TableHead>Kategori</TableHead>
                    <TableHead>Urgensi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progres</TableHead>
                    <TableHead>Umpan Balik</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {new Date(item.tanggal_pengaduan).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="font-medium">{item.judul}</TableCell>
                      {session?.user?.role === 'admin' && (
                        <TableCell>
                          {item.nama_siswa}
                          <br />
                          <span className="text-sm text-gray-500">{item.kelas}</span>
                        </TableCell>
                      )}
                      <TableCell>{item.nama_kategori}</TableCell>
                      <TableCell className={getUrgensiColor(item.tingkat_urgensi)}>
                        {item.tingkat_urgensi.charAt(0).toUpperCase() +
                          item.tingkat_urgensi.slice(1)}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.persentase_progres ? `${item.persentase_progres}%` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.jumlah_umpan_balik}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/aspirasi/${item.id}`}>
                          <Button variant="outline" size="sm">
                            Detail
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}