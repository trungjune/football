import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { UpdateNotification } from '@/components/pwa/update-notification';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FC Manager - Quản lý đội bóng sân 7',
  description: 'Ứng dụng quản lý đội bóng sân 7 chuyên nghiệp',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FC Manager',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FC Manager" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
          <InstallPrompt />
          <UpdateNotification />
        </Providers>
      </body>
    </html>
  );
}
