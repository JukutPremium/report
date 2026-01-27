'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            const error = err as Error;
            setError(error.message || 'Terjadi kesalahan saat login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4">
            <Card className="w-full max-w-md shadow-xl border border-gray-200/60 backdrop-blur">
                <CardHeader className="space-y-2 text-center">
                    {/* Logo / Icon */}
                    <div className="mx-auto mb-2 w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">AS</span>
                    </div>

                    <CardTitle className="text-2xl font-bold">
                        Aplikasi Pengaduan
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Sarana & Prasarana Sekolah
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Masukkan username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium"
                            disabled={loading}
                        >
                            {loading ? 'Memverifikasi...' : 'Masuk'}
                        </Button>

                        <div className="mt-6 rounded-lg bg-gray-50 border p-3 text-xs text-gray-600 space-y-1">
                            <p className="font-semibold text-gray-700">
                                Demo Akun:
                            </p>
                            <p>Admin — <span className="font-mono">admin / password123</span></p>
                            <p>Siswa — <span className="font-mono">siswa1 / password123</span></p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
