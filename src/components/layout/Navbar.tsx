'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, LogOut, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const NAV = [
  { href: '/',         label: 'Home' },
  { href: '/books',    label: 'Books' },
  { href: '/scholars', label: 'Scholars' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-ink-950 border-b border-ink-800 safe-top">
      {/* Top gold line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center shadow-glow-gold">
            <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-ivory text-xs tracking-[0.15em] leading-none">CALIPHATE</p>
            <p className="font-arabic text-gold-400 text-sm leading-none mt-0.5">مكتبة</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-body transition-all duration-200 ${
                isActive(href)
                  ? 'bg-gold-600/20 text-gold-400 font-semibold'
                  : 'text-ink-300 hover:text-ivory hover:bg-ink-800'
              }`}
            >
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-lg text-sm font-body transition-all duration-200 flex items-center gap-1.5 ${
                isActive('/admin')
                  ? 'bg-emerald-900/40 text-emerald-400 font-semibold'
                  : 'text-ink-300 hover:text-ivory hover:bg-ink-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </Link>
          )}
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ink-800 hover:bg-ink-700 transition-colors text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="hidden sm:block text-ivory text-xs font-body max-w-24 truncate">{user.name}</span>
                <ChevronDown className={`w-3 h-3 text-ink-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-ink-900 border border-ink-700 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-ink-800">
                    <p className="text-ivory text-xs font-semibold truncate">{user.name}</p>
                    <span className={`text-xs mt-0.5 inline-block px-2 py-0.5 rounded-full font-body ${
                      user.role === 'SUPER_ADMIN' ? 'bg-gold-900/60 text-gold-400' :
                      user.role === 'ADMIN' ? 'bg-emerald-900/60 text-emerald-400' :
                      'bg-ink-800 text-ink-400'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-ink-300 hover:text-ivory hover:bg-ink-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { setDropOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="text-ink-300 hover:text-ivory text-sm px-3 py-1.5 rounded-lg hover:bg-ink-800 transition-colors hidden sm:block">
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-gold text-xs py-2 px-4">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
