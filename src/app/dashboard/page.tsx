'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Aspirasi {
  id: number;
  judul: string;
  nama_siswa: string;
  kelas: string;
  nama_kategori: string;
  status: string;
  tingkat_urgensi: string;
  tanggal_pengaduan: string;
  persentase_progres: number;
}

interface Stats {
  kategori: Array<{ nama_kategori: string; jumlah: number }>;
  status: Array<{ status: string; jumlah: number }>;
  trend: Array<{ bulan: string; jumlah: number }>;
  urgensi: Array<{ tingkat_urgensi: string; jumlah: number }>;
  overall: {
    total: number;
    pending: number;
    diproses: number;
    selesai: number;
    ditolak: number;
    urgent: number;
  };
  recentActivity: Array<{
    id: number;
    judul: string;
    status: string;
    tingkat_urgensi: string;
    nama_siswa: string;
    created_at: string;
  }>;
}

const COLORS = {
  pending: '#eab308',
  diproses: '#3b82f6',
  selesai: '#22c55e',
  ditolak: '#ef4444',
};

const PIE_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444'];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [aspirasi, setAspirasi] = useState<Aspirasi[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    kategori_id: 'all',
    bulan: 'all',
    tahun: new Date().getFullYear().toString(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value);
      });

      const aspirasiRes = await fetch(`/api/aspirasi?${params}`);
      const aspirasiData = await aspirasiRes.json();

      if (aspirasiData.data) {
        setAspirasi(aspirasiData.data);
      }

      if (session?.user?.role === 'admin') {
        const statsRes = await fetch('/api/stats');
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        {session?.user?.role === 'siswa' && (
          <Link href="/dashboard/aspirasi/buat">
            <Button className="w-full sm:w-auto">+ Buat Aspirasi Baru</Button>
          </Link>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Aspirasi
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.overall.total}</div>
              <p className="text-xs text-gray-500 mt-1">Semua aspirasi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.overall.pending}
              </div>
              <p className="text-xs text-gray-500 mt-1">Menunggu tindakan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Diproses
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.overall.diproses}
              </div>
              <p className="text-xs text-gray-500 mt-1">Sedang ditangani</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Selesai
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.overall.selesai}
              </div>
              <p className="text-xs text-gray-500 mt-1">Sudah diselesaikan</p>
            </CardContent>
          </Card>
        </div>
      )}

      {stats && session?.user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card>
            <CardHeader>
              <CardTitle>Aspirasi per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={300} minWidth={300}>
                  <BarChart data={stats.kategori}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="nama_kategori"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={11}
                      interval={0}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="jumlah" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={300} minWidth={300}>
                  <PieChart>
                    <Pie
                      data={stats.status}
                      dataKey="jumlah"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.payload.status}: ${entry.payload.jumlah}`}
                    >
                      {stats.status.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Trend Aspirasi (6 Bulan Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={300} minWidth={300}>
                  <LineChart data={stats.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="jumlah"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Jumlah Aspirasi"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filter Aspirasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="diproses">Diproses</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                  <SelectItem value="ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bulan</Label>
              <Select
                value={filters.bulan}
                onValueChange={(value) =>
                  setFilters({ ...filters, bulan: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(2000, i).toLocaleString('id-ID', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tahun</Label>
              <Input
                type="number"
                value={filters.tahun}
                onChange={(e) =>
                  setFilters({ ...filters, tahun: e.target.value })
                }
                placeholder="2026"
              />
            </div>

            <div className="space-y-2">
              <Label className="hidden sm:block">&nbsp;</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setFilters({
                    status: 'all',
                    kategori_id: 'all',
                    bulan: 'all',
                    tahun: new Date().getFullYear().toString(),
                  })
                }
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Aspirasi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Memuat data...</p>
          ) : aspirasi.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              Tidak ada data aspirasi
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Judul</TableHead>
                    {session?.user?.role === 'admin' && (
                      <TableHead>Siswa</TableHead>
                    )}
                    <TableHead>Kategori</TableHead>
                    <TableHead>Urgensi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progres</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aspirasi.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}