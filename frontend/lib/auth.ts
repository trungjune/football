import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const apiUrl =
            process.env.NODE_ENV === 'production'
              ? '/api/auth/login'
              : 'http://localhost:3001/api/auth/login';

          const response = await axios.post(apiUrl, {
            email: credentials.email,
            password: credentials.password,
          });

          const { user, access_token } = response.data;

          if (user) {
            return {
              id: user.id,
              email: user.email,
              role: user.role,
              accessToken: access_token,
              member: user.member,
            };
          }
        } catch (error) {
          console.error('Authentication error:', error);
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.member = user.member;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as Role;
        session.accessToken = token.accessToken as string;
        session.user.member = token.member;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
