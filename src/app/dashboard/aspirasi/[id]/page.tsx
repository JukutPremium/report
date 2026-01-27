'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AspirasiDetail {
    id: number;
    judul: string;
    deskripsi: string;
    lokasi: string;
    tingkat_urgensi: string;
    status: string;
    tanggal_pengaduan: string;
    nama_siswa: string;
    kelas: string;
    nama_kategori: string;
}

interface UmpanBalik {
    id: number;
    pesan: string;
    tindakan: string;
    estimasi_selesai: string;
    nama_admin: string;
    created_at: string;
}

interface Progres {
    id: number;
    persentase: number;
    keterangan: string;
    created_at: string;
}

export default function DetailAspirasiPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [aspirasi, setAspirasi] = useState<AspirasiDetail | null>(null);
    const [umpanBalik, setUmpanBalik] = useState<UmpanBalik[]>([]);
    const [progres, setProgres] = useState<Progres[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


    const [newStatus, setNewStatus] = useState('');
    const [umpanBalikForm, setUmpanBalikForm] = useState({
        pesan: '',
        tindakan: '',
        estimasi_selesai: '',
    });
    const [progresForm, setProgresForm] = useState({
        persentase: '0',
        keterangan: '',
    });



    const fetchDetail = async () => {
        try {
            setLoading(true);

            const aspirasiRes = await fetch(`/api/aspirasi/${params.id}`, {
            });
            console.log({ aspirasiRes })
            const aspirasiData = await aspirasiRes.json();

            if (aspirasiData.data) {
                setAspirasi(aspirasiData.data);
                setNewStatus(aspirasiData.data.status);
            }

            const umpanBalikRes = await fetch(`/api/umpan-balik?aspirasi_id=${params.id}`);
            const umpanBalikData = await umpanBalikRes.json();

            if (umpanBalikData.data) {
                setUmpanBalik(umpanBalikData.data);
            }

            const progresRes = await fetch(`/api/progres?aspirasi_id=${params.id}`);
            const progresData = await progresRes.json();

            if (progresData.data) {
                setProgres(progresData.data);
            }
        } catch (error) {
            console.error('Error fetching detail:', error);
            setError('Gagal memuat detail aspirasi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchDetail();
            console.log(aspirasi)
        }
    }, [params.id]);

    const handleUpdateStatus = async () => {
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/aspirasi', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: params.id,
                    status: newStatus,
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal mengupdate status');
            }

            setSuccess('Status berhasil diupdate');
            fetchDetail();
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitUmpanBalik = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/umpan-balik', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    aspirasi_id: params.id,
                    ...umpanBalikForm,
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal menambahkan umpan balik');
            }

            setSuccess('Umpan balik berhasil ditambahkan');
            setUmpanBalikForm({ pesan: '', tindakan: '', estimasi_selesai: '' });
            fetchDetail();
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitProgres = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/progres', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    aspirasi_id: params.id,
                    ...progresForm,
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal menambahkan progres');
            }

            setSuccess('Progres berhasil ditambahkan');
            setProgresForm({ persentase: '0', keterangan: '' });
            fetchDetail();
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Memuat detail aspirasi...</div>;
    }

    if (!aspirasi) {
        return <div className="text-center py-8">Aspirasi tidak ditemukan</div>;
    }

    const isAdmin = session?.user?.role === 'admin';
    const latestProgres = progres.length > 0 ? progres[0].persentase : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Detail Aspirasi</h1>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                    Kembali
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{aspirasi.judul}</CardTitle>
                            <p className="text-gray-600 mt-2">
                                Diajukan oleh: {aspirasi.nama_siswa} ({aspirasi.kelas})
                            </p>
                        </div>
                        <Badge
                            className={
                                aspirasi.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : aspirasi.status === 'diproses'
                                        ? 'bg-blue-100 text-blue-800'
                                        : aspirasi.status === 'selesai'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                            }
                        >
                            {aspirasi.status.charAt(0).toUpperCase() + aspirasi.status.slice(1)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Kategori</p>
                            <p className="font-medium">{aspirasi.nama_kategori}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Lokasi</p>
                            <p className="font-medium">{aspirasi.lokasi || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tingkat Urgensi</p>
                            <p
                                className={`font-medium ${aspirasi.tingkat_urgensi === 'tinggi'
                                    ? 'text-red-600'
                                    : aspirasi.tingkat_urgensi === 'sedang'
                                        ? 'text-yellow-600'
                                        : 'text-green-600'
                                    }`}
                            >
                                {aspirasi.tingkat_urgensi.charAt(0).toUpperCase() +
                                    aspirasi.tingkat_urgensi.slice(1)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tanggal Pengaduan</p>
                            <p className="font-medium">
                                {new Date(aspirasi.tanggal_pengaduan).toLocaleDateString('id-ID')}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 mb-2">Deskripsi</p>
                        <p className="whitespace-pre-wrap">{aspirasi.deskripsi}</p>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <p className="text-sm text-gray-600">Progres Perbaikan</p>
                            <p className="text-sm font-medium">{latestProgres}%</p>
                        </div>
                        <Progress value={latestProgres} />
                    </div>
                </CardContent>
            </Card>

            {isAdmin && (
                <Card>
                    <CardHeader>
                        <CardTitle>Update Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="diproses">Diproses</SelectItem>
                                    <SelectItem value="selesai">Selesai</SelectItem>
                                    <SelectItem value="ditolak">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleUpdateStatus} disabled={submitting}>
                                Update Status
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Umpan Balik</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {umpanBalik.length === 0 ? (
                        <p className="text-gray-500">Belum ada umpan balik</p>
                    ) : (
                        umpanBalik.map((ub) => (
                            <div key={ub.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">{ub.nama_admin}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(ub.created_at).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <p className="mb-2">{ub.pesan}</p>
                                {ub.tindakan && (
                                    <p className="text-sm text-gray-600">
                                        <strong>Tindakan:</strong> {ub.tindakan}
                                    </p>
                                )}
                                {ub.estimasi_selesai && (
                                    <p className="text-sm text-gray-600">
                                        <strong>Estimasi Selesai:</strong>{' '}
                                        {new Date(ub.estimasi_selesai).toLocaleDateString('id-ID')}
                                    </p>
                                )}
                            </div>
                        ))
                    )}

                    {isAdmin && (
                        <form onSubmit={handleSubmitUmpanBalik} className="space-y-4 mt-6 pt-6 border-t">
                            <h3 className="font-medium">Tambah Umpan Balik</h3>
                            <div className="space-y-2">
                                <Label>Pesan</Label>
                                <Textarea
                                    value={umpanBalikForm.pesan}
                                    onChange={(e) =>
                                        setUmpanBalikForm({ ...umpanBalikForm, pesan: e.target.value })
                                    }
                                    required
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tindakan</Label>
                                <Input
                                    value={umpanBalikForm.tindakan}
                                    onChange={(e) =>
                                        setUmpanBalikForm({ ...umpanBalikForm, tindakan: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Estimasi Selesai</Label>
                                <Input
                                    type="date"
                                    value={umpanBalikForm.estimasi_selesai}
                                    onChange={(e) =>
                                        setUmpanBalikForm({
                                            ...umpanBalikForm,
                                            estimasi_selesai: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <Button type="submit" disabled={submitting}>
                                Kirim Umpan Balik
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Histori Progres</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {progres.length === 0 ? (
                        <p className="text-gray-500">Belum ada progres</p>
                    ) : (
                        progres.map((p) => (
                            <div key={p.id} className="border-l-4 border-green-500 pl-4 py-2">
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">{p.persentase}% - Selesai</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(p.created_at).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                {p.keterangan && <p className="text-sm">{p.keterangan}</p>}
                            </div>
                        ))
                    )}

                    {isAdmin && (
                        <form onSubmit={handleSubmitProgres} className="space-y-4 mt-6 pt-6 border-t">
                            <h3 className="font-medium">Tambah Progres</h3>
                            <div className="space-y-2">
                                <Label>Persentase (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={progresForm.persentase}
                                    onChange={(e) =>
                                        setProgresForm({ ...progresForm, persentase: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Keterangan</Label>
                                <Textarea
                                    value={progresForm.keterangan}
                                    onChange={(e) =>
                                        setProgresForm({ ...progresForm, keterangan: e.target.value })
                                    }
                                    rows={3}
                                />
                            </div>
                            <Button type="submit" disabled={submitting}>
                                Tambah Progres
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}