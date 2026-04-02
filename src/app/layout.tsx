import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'CaliphateMakhtaba – Islamic Scholarly Library',
  description: 'A curated digital library of scholarly Islamic books and manuscripts',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#14532d',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-parchment min-h-dvh">
        <AuthProvider>
          <ServiceWorkerRegistrar />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#251e1a',
                color: '#faf6ef',
                fontFamily: 'Lato, sans-serif',
                fontSize: '0.875rem',
                borderRadius: '0.75rem',
                border: '1px solid #655444',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Navbar />
          <main className="pb-20 md:pb-0">{children}</main>
          <BottomNav />
          <footer className="hidden md:block bg-ink-950 text-ink-400 py-10 px-4">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="font-display text-ivory text-sm tracking-widest mb-1">CaliphateMakhtaba</p>
                <p className="font-arabic text-gold-400 text-lg">مكتبة الخلافة</p>
              </div>
              <p className="text-xs text-ink-500">
                © {new Date().getFullYear()} CaliphateMakhtaba · Preserving Islamic Knowledge
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
