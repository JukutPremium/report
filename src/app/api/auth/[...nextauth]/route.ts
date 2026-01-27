import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { User } from '@/types';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username dan password harus diisi');
        }

        try {
          const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [credentials.username]
          );

          const users = rows as (User & { password: string })[];
          
          if (users.length === 0) {
            throw new Error('Username tidak ditemukan');
          }

          const user = users[0];
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Password salah');
          }

          return {
            id: user.id.toString(),
            name: user.nama_lengkap,
            email: user.email || '',
            role: user.role,
            username: user.username,
            kelas: user.kelas,
          };
        } catch (error) {
          const err = error as Error;
          throw new Error(err.message || 'Login gagal');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.kelas = user.kelas;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.kelas = token.kelas;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };