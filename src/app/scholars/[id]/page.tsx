'use client';

import { useEffect, useState } from 'react';
import { scholarsApi } from '@/lib/api';
import BookCard from '@/components/books/BookCard';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { User, BookOpen, ChevronRight } from 'lucide-react';

export default function ScholarDetailPage({ params }: { params: { id: string } }) {
  const [scholar, setScholar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scholarsApi.getOne(params.id)
      .then((r) => setScholar(r.data))
      .catch(() => toast.error('Scholar not found'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 animate-fade-in">
      <div className="skeleton h-6 w-40" />
      <div className="skeleton h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-52" />)}
      </div>
    </div>
  );

  if (!scholar) return (
    <div className="text-center py-24">
      <p className="font-arabic text-gold-500 text-3xl mb-2">لا يوجد عالم</p>
      <p className="text-ink-400 font-body text-sm">Scholar not found.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-ink-400 font-body mb-6">
        <Link href="/" className="hover:text-gold-600 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/scholars" className="hover:text-gold-600 transition-colors">Scholars</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-ink-600 truncate max-w-40">{scholar.name}</span>
      </nav>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden mb-8">
        {/* Decorative header */}
        <div className="h-24 bg-gradient-to-br from-emerald-900 to-ink-950 relative overflow-hidden"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23d4900f' stroke-opacity='0.12' stroke-width='0.8'%3E%3Cpolygon points='30,4 56,18 56,42 30,56 4,42 4,18'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent absolute bottom-0 left-0 right-0" />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-10 mb-4 w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 p-0.5 shadow-glow-gold">
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-emerald-900 to-ink-900 flex items-center justify-center border-2 border-white">
                {scholar.pictureUrl
                  ? <img src={scholar.pictureUrl} alt={scholar.name} className="w-full h-full object-cover" />
                  : <User className="w-8 h-8 text-gold-400 opacity-70" />
                }
              </div>
            </div>
          </div>

          <h1 className="font-display text-ink-900 text-xl sm:text-2xl mb-1">{scholar.name}</h1>

          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-body mb-4">
            <BookOpen className="w-3 h-3" />
            {scholar.books?.length || 0} approved {scholar.books?.length === 1 ? 'book' : 'books'}
          </span>

          {scholar.biography && (
            <div className="border-ornament">
              <p className="text-sm text-ink-600 font-body leading-relaxed">{scholar.biography}</p>
            </div>
          )}
        </div>
      </div>

      {/* Books */}
      <h2 className="font-display text-ink-900 text-lg tracking-wide mb-5 flex items-center gap-2">
        <span className="font-arabic text-gold-600 text-xl">مؤلفاته</span>
        Works by {scholar.name.split(' ')[0]}
      </h2>

      {scholar.books?.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-ink-100">
          <p className="font-arabic text-gold-300 text-2xl mb-2">لا توجد كتب</p>
          <p className="text-ink-400 font-body text-sm">No approved books yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 stagger">
          {scholar.books?.map((book: any) => <BookCard key={book.id} book={book} />)}
        </div>
      )}
    </div>
  );
}
