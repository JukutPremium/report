'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Kategori {
  id: number;
  nama_kategori: string;
}

export default function BuatAspirasiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  
  const [formData, setFormData] = useState({
    kategori_id: '',
    judul: '',
    deskripsi: '',
    lokasi: '',
    tingkat_urgensi: 'sedang',
  });

  useEffect(() => {
    fetchKategori();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/aspirasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat aspirasi');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Buat Aspirasi Baru</CardTitle>
          <p className="text-gray-600">
            Sampaikan pengaduan atau masukan terkait sarana dan prasarana sekolah
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Aspirasi berhasil dibuat! Mengarahkan ke dashboard...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="kategori">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.kategori_id}
                onValueChange={(value) => handleChange('kategori_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriList.map((kat) => (
                    <SelectItem key={kat.id} value={kat.id.toString()}>
                      {kat.nama_kategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="judul">
                Judul Pengaduan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="judul"
                value={formData.judul}
                onChange={(e) => handleChange('judul', e.target.value)}
                placeholder="Contoh: Kipas Angin Rusak"
                required
                disabled={loading}
                maxLength={200}
              />
              <p className="text-sm text-gray-500">
                {formData.judul.length}/200 karakter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => handleChange('deskripsi', e.target.value)}
                placeholder="Jelaskan detail pengaduan Anda..."
                required
                disabled={loading}
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lokasi">Lokasi</Label>
              <Input
                id="lokasi"
                value={formData.lokasi}
                onChange={(e) => handleChange('lokasi', e.target.value)}
                placeholder="Contoh: Ruang XII RPL 1"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgensi">
                Tingkat Urgensi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tingkat_urgensi}
                onValueChange={(value) => handleChange('tingkat_urgensi', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rendah">Rendah</SelectItem>
                  <SelectItem value="sedang">Sedang</SelectItem>
                  <SelectItem value="tinggi">Tinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Mengirim...' : 'Kirim Aspirasi'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={loading}
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}