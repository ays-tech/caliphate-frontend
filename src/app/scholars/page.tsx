'use client';

import { useEffect, useState } from 'react';
import { scholarsApi } from '@/lib/api';
import ScholarCard from '@/components/scholars/ScholarCard';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Loader2 } from 'lucide-react';

export default function ScholarsPage() {
  const [scholars, setScholars] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  const debouncedSearch = useDebounce(search, 400);

  const fetchScholars = async (s = debouncedSearch) => {
    setLoading(true);
    try {
      const res = await scholarsApi.getAll(s || undefined);
      setScholars(res.data);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => { fetchScholars(''); }, []);

  // Re-fetch when debounced search settles
  useEffect(() => {
    fetchScholars(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">

      {/* Header */}
      <div className="mb-6">
        <p className="font-arabic text-gold-600 text-xl">علماء الأمة</p>
        <h1 className="font-display text-ink-900 text-2xl sm:text-3xl tracking-wide">Islamic Scholars</h1>
      </div>

      {/* Search */}
      <div className="max-w-md mb-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scholars…"
            className="input-islamic pl-10 pr-10"
          />
          {search !== debouncedSearch && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-ink-400 font-body mb-4 px-1">
          {scholars.length} scholar{scholars.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-44 skeleton" style={{ animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      ) : scholars.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-ink-100">
          <p className="font-arabic text-gold-400 text-2xl mb-2">لا توجد نتائج</p>
          <p className="text-ink-400 font-body text-sm">No scholars found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
          {scholars.map((s: any) => <ScholarCard key={s.id} scholar={s} />)}
        </div>
      )}
    </div>
  );
}
