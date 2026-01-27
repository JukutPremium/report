'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">AS</span>
                </div>
                <span className="font-bold text-xl hidden sm:inline">
                  Aplikasi Sarana
                </span>
                <span className="font-bold text-base sm:hidden">Aspirasi</span>
              </Link>

              <div className="ml-10 hidden md:flex space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                {user.role === 'siswa' && (
                  <Link href="/dashboard/aspirasi/buat">
                    <Button variant="ghost">Buat Aspirasi</Button>
                  </Link>
                )}
                <Link href="/dashboard/histori">
                  <Button variant="ghost">Histori</Button>
                </Link>
                {user.role === 'admin' && (
                  <Link href="/dashboard/pengaturan">
                    <Button variant="ghost">Pengaturan</Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Desktop User Menu */}
              <div className="hidden sm:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          {user.role === 'admin' ? 'Administrator' : user.kelas}
                        </p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Role: {user.role === 'admin' ? 'Administrator' : 'Siswa'}
                        </p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="text-red-600"
                    >
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">
                          {user.role === 'admin' ? 'Administrator' : user.kelas}
                        </p>
                      </div>
                    </div>
                  </div>

                  <nav className="mt-6 flex flex-col space-y-2">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Dashboard
                      </Button>
                    </Link>
                    {user.role === 'siswa' && (
                      <Link
                        href="/dashboard/aspirasi/buat"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button variant="ghost" className="w-full justify-start">
                          Buat Aspirasi
                        </Button>
                      </Link>
                    )}
                    <Link href="/dashboard/histori" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Histori
                      </Button>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/dashboard/pengaturan"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button variant="ghost" className="w-full justify-start">
                          Pengaturan
                        </Button>
                      </Link>
                    )}
                  </nav>

                  <div className="absolute bottom-6 left-6 right-6">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut({ callbackUrl: '/login' });
                      }}
                    >
                      Keluar
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}