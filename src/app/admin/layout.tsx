'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  LayoutDashboard, BookOpen, Users, GraduationCap,
  Calendar, Shield, LogOut, ChevronRight, Menu, X,
  BookMarked, Settings,
} from 'lucide-react';

const NAV = [
  { href: '/admin',            label: 'Overview',    arabic: 'نظرة عامة',    icon: LayoutDashboard, exact: true },
  { href: '/admin/books',      label: 'Books',       arabic: 'الكتب',         icon: BookOpen },
  { href: '/admin/scholars',   label: 'Scholars',    arabic: 'العلماء',       icon: GraduationCap },
  { href: '/admin/events',     label: 'Events',      arabic: 'الفعاليات',     icon: Calendar },
  { href: '/admin/moderation', label: 'Moderation',  arabic: 'المراجعة',     icon: Shield,          superAdminOnly: true },
  { href: '/admin/users',      label: 'Users',       arabic: 'المستخدمون',    icon: Users,           superAdminOnly: true },
  { href: '/admin/settings',   label: 'Settings',    arabic: 'الإعدادات',    icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) router.push('/auth/login');
  }, [loading, isAdmin]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (loading || !isAdmin) return null;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-ink-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center flex-shrink-0">
            <BookMarked className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-ivory text-xs tracking-[0.15em] leading-none">MAKHTABA</p>
            <p className="font-arabic text-gold-400 text-sm leading-none mt-0.5">لوحة التحكم</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gold-700 to-transparent" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.filter((n) => !n.superAdminOnly || user?.role === 'SUPER_ADMIN').map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                active
                  ? 'bg-gradient-to-r from-gold-900/60 to-gold-800/20 text-gold-400 border border-gold-800/40'
                  : 'text-ink-400 hover:bg-ink-800 hover:text-ivory'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-gold-400' : 'text-ink-500 group-hover:text-ink-300'}`} />
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm leading-none">{item.label}</p>
                <p className="font-arabic text-[11px] leading-none mt-0.5 opacity-60">{item.arabic}</p>
              </div>
              {active && <ChevronRight className="w-3 h-3 text-gold-500 flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-ink-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-ink-800/50 mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-display">{user?.name?.[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ivory text-xs font-body truncate">{user?.name}</p>
            <p className={`text-[10px] font-body ${
              user?.role === 'SUPER_ADMIN' ? 'text-gold-400' : 'text-emerald-400'
            }`}>
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-950/30 transition-colors font-body"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100dvh-56px)] bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-ink-950 border-r border-ink-800 fixed top-14 bottom-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-ink-950 border-r border-ink-800 flex flex-col h-full">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 text-ink-400 hover:text-ivory p-1.5 rounded-lg hover:bg-ink-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-ink-900 border-b border-ink-800 px-4 h-11 flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-ink-400 hover:text-ivory p-1.5 rounded-lg hover:bg-ink-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <p className="font-display text-ivory text-xs tracking-widest">
          {NAV.find((n) => isActive(n.href, n.exact))?.label || 'Dashboard'}
        </p>
      </div>

      {/* Main content */}
      <div className="md:ml-56 flex-1 pt-11 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
