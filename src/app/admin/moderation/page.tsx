'use client';

import { useEffect, useState } from 'react';
import { booksApi } from '@/lib/api';
import { CheckCircle, XCircle, BookOpen, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

type Status = 'PENDING' | 'APPROVED' | 'REJECTED';

const TABS: { label: string; arabic: string; value: Status }[] = [
  { label: 'Pending',  arabic: 'قيد المراجعة', value: 'PENDING' },
  { label: 'Approved', arabic: 'معتمد',         value: 'APPROVED' },
  { label: 'Rejected', arabic: 'مرفوض',        value: 'REJECTED' },
];

export default function AdminModerationPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Status>('PENDING');
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchBooks = async (s: Status) => {
    setLoading(true);
    try { const res = await booksApi.getAllAdmin({ status: s, limit: 50 }); setBooks(res.data.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(tab); }, [tab]);

  const approve = async (id: string, title: string) => {
    setActionId(id);
    try { await booksApi.approve(id); toast.success(`"${title}" approved`); fetchBooks(tab); }
    catch { toast.error('Failed'); } finally { setActionId(null); }
  };

  const reject = async (id: string, title: string) => {
    if (!confirm(`Reject "${title}"?`)) return;
    setActionId(id);
    try { await booksApi.reject(id); toast.success(`"${title}" rejected`); fetchBooks(tab); }
    catch { toast.error('Failed'); } finally { setActionId(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="font-arabic text-gold-600 text-lg">مراجعة الكتب</p>
        <h1 className="font-display text-ink-900 text-xl tracking-wide">Book Moderation</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-ink-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
              tab === t.value
                ? 'bg-white shadow-sm font-display text-ink-900 text-xs tracking-wide'
                : 'text-ink-500 hover:text-ink-700 font-body text-xs'
            }`}
          >
            {t.label}
            <span className="ml-1 font-arabic text-xs opacity-60">{t.arabic}</span>
          </button>
        ))}
      </div>

      {/* Books */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20" />)}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-arabic text-gold-300 text-xl mb-2">لا توجد كتب</p>
            <p className="text-ink-400 text-sm font-body">No {tab.toLowerCase()} books.</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-50">
            {books.map((book: any) => (
              <div key={book.id} className="px-5 py-4 flex items-start gap-4">
                {/* Cover thumb */}
                <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-emerald-900 to-ink-900 flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4900f' fill-opacity='0.15'%3E%3Cpolygon points='10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7'/%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                >
                  {book.coverUrl
                    ? <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    : <BookOpen className="w-4 h-4 text-gold-400 opacity-50" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-display text-ink-900 text-sm truncate">{book.title}</p>
                  <p className="text-xs text-ink-500 font-body mt-0.5">{book.scholar?.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="text-[10px] text-ink-400 font-body">{book.uploadedBy?.name}</span>
                    <span className="text-[10px] bg-ink-100 text-ink-500 px-1.5 py-0.5 rounded-full font-body">{book.type}</span>
                    <span className="text-[10px] text-ink-400 font-body">{book._count?.volumes || 0} vol{book._count?.volumes !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 flex-col sm:flex-row">
                  <Link href={`/books/${book.id}`} target="_blank"
                    className="p-1.5 text-ink-400 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  {tab === 'PENDING' && (
                    <>
                      <button onClick={() => approve(book.id, book.title)} disabled={actionId === book.id}
                        className="flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors font-body disabled:opacity-50"
                      >
                        <CheckCircle className="w-3 h-3" /> {actionId === book.id ? '…' : 'Approve'}
                      </button>
                      <button onClick={() => reject(book.id, book.title)} disabled={actionId === book.id}
                        className="flex items-center gap-1 text-[11px] bg-red-50 text-red-600 border border-red-100 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-body disabled:opacity-50"
                      >
                        <XCircle className="w-3 h-3" /> {actionId === book.id ? '…' : 'Reject'}
                      </button>
                    </>
                  )}
                  {tab === 'APPROVED' && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg font-body">
                      <CheckCircle className="w-3 h-3" /> Live
                    </span>
                  )}
                  {tab === 'REJECTED' && (
                    <button onClick={() => approve(book.id, book.title)} disabled={actionId === book.id}
                      className="text-[11px] text-ink-500 hover:text-emerald-700 px-2 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors font-body"
                    >
                      Re-approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
