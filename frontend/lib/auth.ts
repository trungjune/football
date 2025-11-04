// NextAuth configuration - DISABLED for custom auth
// Using custom AuthContext instead

// Commented out to avoid unused imports
// import { NextAuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';

// enum Role {
//   ADMIN = 'ADMIN',
//   MEMBER = 'MEMBER',
// }

/*
export const authOptions: NextAuthOptions = {
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
          // Call backend API for authentication (same domain)
          const backendUrl =
            process.env.NODE_ENV === 'production'
              ? '' // Same domain in production
              : 'http://localhost:3001';
          const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          return {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            accessToken: data.access_token,
            member: data.user.member,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
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
*/

// Placeholder export to avoid import errors
export const authOptions = null;
