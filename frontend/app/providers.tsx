'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { PWAInit } from '@/components/pwa/pwa-init';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <PWAInit />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
