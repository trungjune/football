import 'next-auth';
import { UserRole } from '@shared/types/entities/user';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
      member?: any;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    email: string;
    role: UserRole;
    accessToken: string;
    member?: any;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    accessToken: string;
    member?: any;
  }
}
