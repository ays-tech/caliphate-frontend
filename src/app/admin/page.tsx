'use client';

import { useEffect, useState } from 'react';
import { booksApi, scholarsApi, usersApi } from '@/lib/api';
import { BookOpen, Users, GraduationCap, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';

export default function AdminPage() {
  const [stats, setStats] = useState({ books: 0, scholars: 0, users: 0, pending: 0 });
  const [pendingBooks, setPendingBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      booksApi.getAllAdmin({ limit: 100 }),
      scholarsApi.getAll(),
      usersApi.getAll().catch(() => ({ data: [] })),
      booksApi.getAllAdmin({ status: 'PENDING', limit: 5 }),
    ]).then(([books, scholars, users, pending]) => {
      setStats({
        books: books.data.total,
        scholars: scholars.data.length,
        users: users.data.length,
        pending: pending.data.total,
      });
      setPendingBooks(pending.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Books',    arabic: 'الكتب',      value: stats.books,   icon: BookOpen,      color: 'from-emerald-700 to-emerald-900', href: '/admin/books' },
    { label: 'Scholars',       arabic: 'العلماء',    value: stats.scholars, icon: GraduationCap, color: 'from-gold-600 to-gold-900',      href: '/admin/scholars' },
    { label: 'Users',          arabic: 'المستخدمون', value: stats.users,   icon: Users,         color: 'from-ink-600 to-ink-900',         href: '/admin/users' },
    { label: 'Pending Review', arabic: 'قيد المراجعة', value: stats.pending, icon: Clock,        color: 'from-amber-600 to-amber-900',    href: '/admin/moderation' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Greeting */}
      <div>
        <p className="font-arabic text-gold-600 text-xl mb-0.5">مرحباً بك</p>
        <h1 className="font-display text-ink-900 text-2xl tracking-wide">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-ink-500 font-body text-sm mt-1">
          {format(new Date(), 'EEEE, MMMM d yyyy')}
        </p>
      </div>

      {/* Gold divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${card.color} p-5 group cursor-pointer hover:shadow-card-hover transition-shadow`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpolygon points='20,2 24,14 37,14 27,22 31,35 20,27 9,35 13,22 3,14 16,14'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              <card.icon className="w-8 h-8 text-black mb-3" />
              {loading
                ? <div className="skeleton h-8 w-16 mb-2" style={{ background: 'rgba(0,0,0,0.2)' }} />
                : <p className="font-display text-4xl font-bold text-black mb-1">{card.value.toLocaleString()}</p>
              }
              <p className="font-body text-black text-xs font-semibold mb-1">{card.label}</p>
              <p className="font-arabic text-black text-sm opacity-80">{card.arabic}</p>
              <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-black opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Pending books */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="px-5 py-4 flex items-center justify-between border-b border-ink-100">
          <div>
            <h2 className="font-display text-ink-900 text-sm tracking-wide">Pending Review</h2>
            <p className="font-arabic text-gold-500 text-sm">الكتب قيد المراجعة</p>
          </div>
          <Link href="/admin/moderation"
            className="text-xs font-display tracking-widest text-gold-600 hover:text-gold-800 transition-colors flex items-center gap-1"
          >
            ALL <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14" />)}
          </div>
        ) : pendingBooks.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-arabic text-gold-300 text-xl mb-1">لا توجد كتب قيد المراجعة</p>
            <p className="text-ink-400 text-sm font-body">No books awaiting review.</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-50">
            {pendingBooks.map((book: any) => (
              <div key={book.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-12 rounded-lg bg-gradient-to-br from-emerald-900 to-ink-900 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-gold-400 opacity-70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-ink-800 text-sm truncate">{book.title}</p>
                  <p className="text-xs text-ink-400">{book.scholar?.name} · {book.uploadedBy?.name}</p>
                </div>
                <span className="badge-pending flex-shrink-0">Pending</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
