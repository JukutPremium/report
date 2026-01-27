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
    jumlah_umpan_balik: number;
}

interface Kategori {
    id: number;
    nama_kategori: string;
}

export default function AspirasiListPage() {
    const { data: session } = useSession();
    const [aspirasi, setAspirasi] = useState<Aspirasi[]>([]);
    const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        kategori_id: 'all',
        bulan: 'all',
        tahun: new Date().getFullYear().toString(),
        search: '',
    });

    useEffect(() => {
        fetchKategori();
    }, []);

    useEffect(() => {
        fetchAspirasi();
    }, [filters.status, filters.kategori_id, filters.bulan, filters.tahun]);

    const fetchKategori = async () => {
        try {
            const response = await fetch('/api/kategori');
            const data = await response.json();
            if (data.data) {
                setKategoriList(data.data);
            }
        } catch (error) {
            console.error('Error fetching kategori:', error);
        }
    };

    const fetchAspirasi = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all' && key !== 'search') {
                    params.append(key, value);
                }
            });

            const response = await fetch(`/api/aspirasi?${params}`);
            const data = await response.json();

            if (data.data) {
                setAspirasi(data.data);
            }
        } catch (error) {
            console.error('Error fetching aspirasi:', error);
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

    const filteredAspirasi = aspirasi.filter((item) => {
        if (!filters.search) return true;
        const searchLower = filters.search.toLowerCase();
        return (
            item.judul.toLowerCase().includes(searchLower) ||
            item.nama_siswa.toLowerCase().includes(searchLower) ||
            item.nama_kategori.toLowerCase().includes(searchLower)
        );
    });

    const stats = {
        total: filteredAspirasi.length,
        pending: filteredAspirasi.filter((a) => a.status === 'pending').length,
        diproses: filteredAspirasi.filter((a) => a.status === 'diproses').length,
        selesai: filteredAspirasi.filter((a) => a.status === 'selesai').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Daftar Aspirasi</h1>
                    <p className="text-gray-600 mt-1">
                        Kelola semua pengaduan sarana dan prasarana sekolah
                    </p>
                </div>
                {session?.user?.role === 'siswa' && (
                    <Link href="/dashboard/aspirasi/buat">
                        <Button>+ Buat Aspirasi Baru</Button>
                    </Link>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Diproses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{stats.diproses}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Selesai
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{stats.selesai}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter & Pencarian</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="space-y-2">
                            <Label>Cari</Label>
                            <Input
                                placeholder="Cari aspirasi..."
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters({ ...filters, search: e.target.value })
                                }
                            />
                        </div>

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
                            <Label>Kategori</Label>
                            <Select
                                value={filters.kategori_id}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, kategori_id: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    {kategoriList.map((kat) => (
                                        <SelectItem key={kat.id} value={kat.id.toString()}>
                                            {kat.nama_kategori}
                                        </SelectItem>
                                    ))}
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
                    </div>

                    <div className="mt-4 flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setFilters({
                                    status: 'all',
                                    kategori_id: 'all',
                                    bulan: 'all',
                                    tahun: new Date().getFullYear().toString(),
                                    search: '',
                                })
                            }
                        >
                            Reset Filter
                        </Button>
                        <span className="text-sm text-gray-600 flex items-center">
                            Menampilkan {filteredAspirasi.length} aspirasi
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Aspirasi Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Aspirasi</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-gray-500">Memuat data...</p>
                    ) : filteredAspirasi.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">Tidak ada aspirasi ditemukan</p>
                            {session?.user?.role === 'siswa' && (
                                <Link href="/dashboard/aspirasi/buat">
                                    <Button>Buat Aspirasi Pertama</Button>
                                </Link>
                            )}
                        </div>
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
                                        <TableHead>Umpan Balik</TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAspirasi.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(item.tanggal_pengaduan).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell className="font-medium max-w-xs">
                                                <div className="truncate">{item.judul}</div>
                                            </TableCell>
                                            {session?.user?.role === 'admin' && (
                                                <TableCell>
                                                    <div>{item.nama_siswa}</div>
                                                    <div className="text-xs text-gray-500">{item.kelas}</div>
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <Badge variant="outline">{item.nama_kategori}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className={getUrgensiColor(item.tingkat_urgensi)}>
                                                    {item.tingkat_urgensi.charAt(0).toUpperCase() +
                                                        item.tingkat_urgensi.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{
                                                                width: `${item.persentase_progres || 0}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm">
                                                        {item.persentase_progres || 0}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {item.jumlah_umpan_balik}
                                                </Badge>
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