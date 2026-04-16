import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import Link from 'next/link';

export const viewport: Viewport = {
  themeColor:  '#14532d',
  width:       'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title:       'CaliphateMakhtaba – Islamic Scholarly Library',
  description: 'A curated digital library preserving the works of Islamic scholars — books, manuscripts and volumes for generations to come.',
  manifest:    '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon.ico', sizes: '48x48' },
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable:         true,
    statusBarStyle:  'black-translucent',
    title:           'Makhtaba',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-parchment min-h-dvh">
        <AuthProvider>
          <ServiceWorkerRegistrar />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background:   '#251e1a',
                color:        '#faf6ef',
                fontFamily:   'Lato, sans-serif',
                fontSize:     '0.875rem',
                borderRadius: '0.75rem',
                border:       '1px solid #655444',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Navbar />
          <main className="pb-20 md:pb-0">{children}</main>
          <BottomNav />

          {/* PWA install prompt — shows on mobile if app not installed */}
          <PWAInstallBanner />

        
          
        </AuthProvider>
      </body>
    </html>
  );
}
