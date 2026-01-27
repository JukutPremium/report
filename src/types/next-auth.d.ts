import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "admin" | "siswa";
    username: string;
    kelas?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: "admin" | "siswa";
      username: string;
      kelas?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "siswa";
    username: string;
    kelas?: string;
  }
}
