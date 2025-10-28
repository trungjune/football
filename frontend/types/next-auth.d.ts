import 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      member?: any;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    email: string;
    role: Role;
    accessToken: string;
    member?: any;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
    accessToken: string;
    member?: any;
  }
}