'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
    id: number;
    username: string;
    nama_lengkap: string;
    role: string;
    kelas?: string;
    email?: string;
    created_at: string;
}

interface Kategori {
    id: number;
    nama_kategori: string;
    deskripsi?: string;
}

export default function PengaturanPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [kategori, setKategori] = useState<Kategori[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [openUserDialog, setOpenUserDialog] = useState(false);
    const [editUserId, setEditUserId] = useState<number | null>(null);
    const [userForm, setUserForm] = useState({
        username: '',
        password: '',
        nama_lengkap: '',
        role: 'siswa',
        kelas: '',
        email: '',
    });

    const [openKategoriDialog, setOpenKategoriDialog] = useState(false);
    const [editKategoriId, setEditKategoriId] = useState<number | null>(null);
    const [kategoriForm, setKategoriForm] = useState({
        nama_kategori: '',
        deskripsi: '',
    });

    useEffect(() => {
        if (session?.user?.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        fetchData();
    }, [session, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, kategoriRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/kategori'),
            ]);

            const usersData = await usersRes.json();
            const kategoriData = await kategoriRes.json();

            if (usersData.data) setUsers(usersData.data);
            if (kategoriData.data) setKategori(kategoriData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const url = '/api/users';
            const method = editUserId ? 'PUT' : 'POST';
            const body = editUserId
                ? { ...userForm, id: editUserId }
                : userForm;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal menyimpan user');
            }

            setSuccess(
                editUserId ? 'User berhasil diupdate' : 'User berhasil ditambahkan'
            );
            setOpenUserDialog(false);
            setEditUserId(null);
            setUserForm({
                username: '',
                password: '',
                nama_lengkap: '',
                role: 'siswa',
                kelas: '',
                email: '',
            });
            fetchData();
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        }
    };

    const handleEditUser = (user: User) => {
        setEditUserId(user.id);
        setUserForm({
            username: user.username,
            password: '', 
            nama_lengkap: user.nama_lengkap,
            role: user.role,
            kelas: user.kelas || '',
            email: user.email || '',
        });
        setOpenUserDialog(true);
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('Yakin ingin menghapus user ini?')) return;

        setError('');
        setSuccess('');

        try {
            const response = await fetch(`/api/users?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Gagal menghapus user');
            }

            setSuccess('User berhasil dihapus');
            fetchData();
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        }
    };

    const handleAddKategori = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const url = '/api/kategori';
            const method = editKategoriId ? 'PUT' : 'POST';
            const body = editKategoriId
                ? { ...kategoriForm, id: editKategoriId }
                : kategoriForm;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal menyimpan kategori');
            }

            setSuccess(
                editKategoriId
                    ? 'Kategori berhasil diupdate'
                    : 'Kategori berhasil ditambahkan'
            );
            setOpenKategoriDialog(false);
            setEditKategoriId(null);
            setKategoriForm({ nama_kategori: '', deskripsi: '' });
            fetchData();
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        }
    };

    const handleEditKategori = (kat: Kategori) => {
        setEditKategoriId(kat.id);
        setKategoriForm({
            nama_kategori: kat.nama_kategori,
            deskripsi: kat.deskripsi || '',
        });
        setOpenKategoriDialog(true);
    };

    const handleDeleteKategori = async (id: number) => {
        if (!confirm('Yakin ingin menghapus kategori ini?')) return;

        setError('');
        setSuccess('');

        try {
            const response = await fetch(`/api/kategori?id=${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal menghapus kategori');
            }

            setSuccess('Kategori berhasil dihapus');
            fetchData();
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        }
    };

    if (session?.user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Pengaturan</h1>

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

            <Tabs defaultValue="users" className="w-full">
                <TabsList>
                    <TabsTrigger value="users">Kelola User</TabsTrigger>
                    <TabsTrigger value="kategori">Kelola Kategori</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Daftar User</CardTitle>
                            <Dialog
                                open={openUserDialog}
                                onOpenChange={(open) => {
                                    setOpenUserDialog(open);
                                    if (!open) {
                                        setEditUserId(null);
                                        setUserForm({
                                            username: '',
                                            password: '',
                                            nama_lengkap: '',
                                            role: 'siswa',
                                            kelas: '',
                                            email: '',
                                        });
                                    }
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button>+ Tambah User</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editUserId ? 'Edit User' : 'Tambah User Baru'}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddUser} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Username *</Label>
                                            <Input
                                                value={userForm.username}
                                                onChange={(e) =>
                                                    setUserForm({ ...userForm, username: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Password {editUserId ? '(Kosongkan jika tidak ingin mengubah)' : '*'}
                                            </Label>
                                            <Input
                                                type="password"
                                                value={userForm.password}
                                                onChange={(e) =>
                                                    setUserForm({ ...userForm, password: e.target.value })
                                                }
                                                required={!editUserId}
                                                placeholder={editUserId ? 'Kosongkan jika tidak ingin mengubah' : ''}
                                            />
                                            {editUserId && (
                                                <p className="text-xs text-gray-500">
                                                    Kosongkan jika tidak ingin mengubah password
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nama Lengkap *</Label>
                                            <Input
                                                value={userForm.nama_lengkap}
                                                onChange={(e) =>
                                                    setUserForm({ ...userForm, nama_lengkap: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Role *</Label>
                                            <Select
                                                value={userForm.role}
                                                onValueChange={(value) =>
                                                    setUserForm({ ...userForm, role: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="siswa">Siswa</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {userForm.role === 'siswa' && (
                                            <div className="space-y-2">
                                                <Label>Kelas</Label>
                                                <Input
                                                    value={userForm.kelas}
                                                    onChange={(e) =>
                                                        setUserForm({ ...userForm, kelas: e.target.value })
                                                    }
                                                    placeholder="XII RPL 1"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={userForm.email}
                                                onChange={(e) =>
                                                    setUserForm({ ...userForm, email: e.target.value })
                                                }
                                            />
                                        </div>
                                        <Button type="submit" className="w-full">
                                            {editUserId ? 'Update User' : 'Tambah User'}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-center py-4">Memuat data...</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Nama Lengkap</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Kelas</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.username}</TableCell>
                                                <TableCell>{user.nama_lengkap}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={
                                                            user.role === 'admin'
                                                                ? 'text-blue-600 font-medium'
                                                                : ''
                                                        }
                                                    >
                                                        {user.role === 'admin' ? 'Admin' : 'Siswa'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{user.kelas || '-'}</TableCell>
                                                <TableCell>{user.email || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditUser(user)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={user.id.toString() === session?.user?.id}
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="kategori">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Daftar Kategori</CardTitle>
                            <Dialog
                                open={openKategoriDialog}
                                onOpenChange={(open) => {
                                    setOpenKategoriDialog(open);
                                    if (!open) {
                                        setEditKategoriId(null);
                                        setKategoriForm({ nama_kategori: '', deskripsi: '' });
                                    }
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button>+ Tambah Kategori</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editKategoriId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddKategori} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Nama Kategori *</Label>
                                            <Input
                                                value={kategoriForm.nama_kategori}
                                                onChange={(e) =>
                                                    setKategoriForm({
                                                        ...kategoriForm,
                                                        nama_kategori: e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Deskripsi</Label>
                                            <Textarea
                                                value={kategoriForm.deskripsi}
                                                onChange={(e) =>
                                                    setKategoriForm({
                                                        ...kategoriForm,
                                                        deskripsi: e.target.value,
                                                    })
                                                }
                                                rows={3}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full">
                                            {editKategoriId ? 'Update Kategori' : 'Tambah Kategori'}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-center py-4">Memuat data...</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Kategori</TableHead>
                                            <TableHead>Deskripsi</TableHead>
                                            <TableHead>Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {kategori.map((kat) => (
                                            <TableRow key={kat.id}>
                                                <TableCell className="font-medium">
                                                    {kat.nama_kategori}
                                                </TableCell>
                                                <TableCell>{kat.deskripsi || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditKategori(kat)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteKategori(kat.id)}
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}