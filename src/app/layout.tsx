import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import Link from 'next/link';

export const viewport: Viewport = {
  themeColor: '#14532d',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'CaliphateMakhtaba – Islamic Scholarly Library',
  description: 'A curated digital library preserving the works of Islamic scholars — books, manuscripts and volumes for generations to come.',
  manifest: '/manifest.json',
  icons: {
    icon:  [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Makhtaba',
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

          {/* ── Footer ─────────────────────────────────────────────── */}
          <footer className="hidden md:block bg-ink-950 text-ink-400">
            {/* Gold top rule */}
            <div className="h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

            <div className="max-w-6xl mx-auto px-4 py-12">
              <div className="grid grid-cols-4 gap-8 mb-10">

                {/* Brand */}
                <div className="col-span-1">
                  <p className="font-display text-ivory text-sm tracking-widest mb-1">CaliphateMakhtaba</p>
                  <p className="font-arabic text-gold-400 text-xl mb-3">مكتبة الخلافة</p>
                  <p className="text-ink-500 text-xs font-body leading-relaxed">
                    A free digital library preserving the scholarly heritage of Islam.
                  </p>
                </div>

                {/* Library links */}
                <div>
                  <p className="font-display text-ivory text-[10px] tracking-widest uppercase mb-3">Library</p>
                  <ul className="space-y-2">
                    {[
                      { href: '/books',    label: 'Browse Books' },
                      { href: '/scholars', label: 'Scholars' },
                    ].map(({ href, label }) => (
                      <li key={href}>
                        <Link href={href} className="text-ink-400 hover:text-gold-400 text-xs font-body transition-colors">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* About links */}
                <div>
                  <p className="font-display text-ivory text-[10px] tracking-widest uppercase mb-3">About</p>
                  <ul className="space-y-2">
                    {[
                      { href: '/about',   label: 'About the Library' },
                      { href: '/contact', label: 'Contact Us' },
                    ].map(({ href, label }) => (
                      <li key={href}>
                        <Link href={href} className="text-ink-400 hover:text-gold-400 text-xs font-body transition-colors">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quranic verse */}
                <div className="text-right">
                  <p className="font-arabic text-gold-500 text-lg leading-relaxed mb-1">
                    وَقُل رَّبِّ زِدْنِي عِلْمًا
                  </p>
                  <p className="text-ink-500 text-[10px] font-body italic">
                    "My Lord, increase me in knowledge."
                  </p>
                  <p className="text-gold-600 text-[10px] font-display tracking-widest mt-1">
                    Al-Quran 20:114
                  </p>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="pt-6 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-ink-600 font-body">
                  © {new Date().getFullYear()} CaliphateMakhtaba · Preserving Islamic Knowledge
                </p>
                <div className="flex items-center gap-1 text-ink-600">
                  <span className="text-xs font-body">Built with</span>
                  <span className="font-arabic text-gold-600 text-sm mx-1">إخلاص</span>
                  <span className="text-xs font-body">for the Ummah</span>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
