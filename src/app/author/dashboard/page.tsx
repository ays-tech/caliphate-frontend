'use client';

import { useEffect, useState } from 'react';
import { authorApi, booksApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Plus, Send, Edit2, Clock, CheckCircle,
  XCircle, FileText, AlertCircle, User,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  DRAFT:    { label: 'Draft',    icon: FileText,     color: 'text-ink-500',     bg: 'bg-ink-100' },
  PENDING:  { label: 'Pending',  icon: Clock,        color: 'text-amber-600',   bg: 'bg-amber-100' },
  APPROVED: { label: 'Approved', icon: CheckCircle,  color: 'text-emerald-600', bg: 'bg-emerald-100' },
  REJECTED: { label: 'Rejected', icon: XCircle,      color: 'text-red-500',     bg: 'bg-red-100' },
};

export default function AuthorDashboardPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [books,   setBooks]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }

    Promise.all([
      authorApi.getMe().then(r => setProfile(r.data)),
      booksApi.getMyBooks().then(r => setBooks(r.data)),
    ]).finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (bookId: string, title: string) => {
    if (!confirm(`Submit "${title}" for review?`)) return;
    setSubmitting(bookId);
    try {
      await booksApi.submit(bookId);
      toast.success('Book submitted for review!');
      const res = await booksApi.getMyBooks();
      setBooks(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to submit');
    } finally { setSubmitting(null); }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
    </div>
  );

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <User className="w-12 h-12 text-ink-300 mx-auto mb-4" />
        <h1 className="font-display text-ink-900 text-xl tracking-wide mb-3">No Author Profile</h1>
        <p className="text-ink-500 font-body text-sm mb-6">You need an approved author profile to access the dashboard.</p>
        <Link href="/author" className="btn-gold">Apply to Become an Author</Link>
      </div>
    );
  }

  if (profile.status !== 'APPROVED') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h1 className="font-display text-ink-900 text-xl tracking-wide mb-3">
          Application {profile.status === 'PENDING' ? 'Under Review' : 'Rejected'}
        </h1>
        <p className="text-ink-500 font-body text-sm mb-2">
          {profile.status === 'PENDING'
            ? 'Your author application is being reviewed. You\'ll be notified once approved.'
            : profile.reviewNote || 'Your application was not approved.'
          }
        </p>
        {profile.status === 'REJECTED' && (
          <Link href="/author" className="btn-ghost text-sm mt-4">Re-apply</Link>
        )}
      </div>
    );
  }

  const draftCount    = books.filter(b => b.status === 'DRAFT').length;
  const pendingCount  = books.filter(b => b.status === 'PENDING').length;
  const approvedCount = books.filter(b => b.status === 'APPROVED').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-arabic text-gold-600 text-xl mb-1">لوحة المؤلف</p>
          <h1 className="font-display text-ink-900 text-2xl tracking-wide">Author Dashboard</h1>
          <p className="text-ink-500 font-body text-sm mt-1">
            Welcome, <span className="text-ink-800 font-semibold">{profile.penName}</span>
          </p>
        </div>
        <Link href="/admin/books" className="btn-gold text-xs py-2.5 px-4">
          <Plus className="w-3.5 h-3.5" /> New Book
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Drafts',   value: draftCount,   color: 'text-ink-600' },
          { label: 'Pending',  value: pendingCount,  color: 'text-amber-600' },
          { label: 'Published',value: approvedCount, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`font-display text-3xl leading-none ${color}`}>{value}</p>
            <p className="text-ink-400 font-body text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Books list */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="px-5 py-4 border-b border-ink-100">
          <h2 className="font-display text-ink-900 text-sm tracking-wide">My Books</h2>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-8 h-8 text-ink-200 mx-auto mb-2" />
            <p className="text-ink-400 font-body text-sm">No books yet. Create your first book.</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-50">
            {books.map((book: any) => {
              const cfg  = STATUS_CONFIG[book.status] || STATUS_CONFIG.DRAFT;
              const Icon = cfg.icon;
              return (
                <div key={book.id} className="px-5 py-4 flex items-start gap-4 hover:bg-ink-50 transition-colors">
                  {/* Cover */}
                  <div className="w-10 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-900 to-ink-900 flex items-center justify-center flex-shrink-0">
                    {book.coverUrl
                      ? <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                      : <BookOpen className="w-4 h-4 text-gold-400 opacity-60" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-display text-ink-900 text-sm truncate">{book.title}</p>
                    <p className="text-ink-400 font-body text-xs mt-0.5">{book.scholar?.name}</p>

                    {/* Rejection note */}
                    {book.status === 'REJECTED' && book.reviewNote && (
                      <div className="flex items-start gap-1.5 mt-1.5 bg-red-50 rounded-lg px-2.5 py-1.5">
                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-[11px] font-body">{book.reviewNote}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1 text-[11px] font-body px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>

                    {/* Actions */}
                    {book.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSubmit(book.id, book.title)}
                        disabled={submitting === book.id}
                        className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors font-body"
                      >
                        <Send className="w-3 h-3" />
                        {submitting === book.id ? 'Submitting…' : 'Submit'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
