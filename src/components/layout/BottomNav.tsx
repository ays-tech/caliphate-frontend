'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Home, BookOpen, Users, LayoutDashboard, LogIn } from 'lucide-react';

const items = [
  { href: '/',         label: 'Home',     icon: Home },
  { href: '/books',    label: 'Books',    icon: BookOpen },
  { href: '/scholars', label: 'Scholars', icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      {/* Gold top line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
      <div className="bg-ink-950/95 backdrop-blur-md px-2 pt-2 pb-3 flex items-center justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 min-w-[56px]"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-br from-gold-400 to-gold-700 shadow-glow-gold scale-110'
                  : 'bg-transparent'
              }`}>
                <Icon className={`w-4 h-4 transition-colors ${active ? 'text-white' : 'text-ink-400'}`} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-body tracking-wide transition-colors ${
                active ? 'text-gold-400 font-semibold' : 'text-ink-500'
              }`}>
                {label}
              </span>
            </Link>
          );
        })}

        {isAdmin ? (
          <Link
            href="/admin"
            className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 min-w-[56px]"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isActive('/admin')
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-800 shadow-glow-emerald scale-110'
                : 'bg-transparent'
            }`}>
              <LayoutDashboard className={`w-4 h-4 transition-colors ${isActive('/admin') ? 'text-white' : 'text-ink-400'}`} strokeWidth={2} />
            </div>
            <span className={`text-[10px] font-body tracking-wide transition-colors ${
              isActive('/admin') ? 'text-emerald-400 font-semibold' : 'text-ink-500'
            }`}>
              Admin
            </span>
          </Link>
        ) : !user ? (
          <Link
            href="/auth/login"
            className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 min-w-[56px]"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isActive('/auth') ? 'bg-gradient-to-br from-gold-400 to-gold-700 scale-110' : 'bg-transparent'
            }`}>
              <LogIn className={`w-4 h-4 ${isActive('/auth') ? 'text-white' : 'text-ink-400'}`} strokeWidth={2} />
            </div>
            <span className={`text-[10px] font-body tracking-wide ${
              isActive('/auth') ? 'text-gold-400 font-semibold' : 'text-ink-500'
            }`}>
              Sign in
            </span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
