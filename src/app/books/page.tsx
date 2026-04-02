'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { booksApi, scholarsApi } from '@/lib/api';
import BookCard from '@/components/books/BookCard';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';

export default function BooksPage() {
  const searchParams = useSearchParams();
  const [books,      setBooks]      = useState<any[]>([]);
  const [scholars,   setScholars]   = useState<any[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search,    setSearch]    = useState(searchParams.get('search') || '');
  const [scholarId, setScholarId] = useState('');
  const [type,      setType]      = useState('');

  // Debounce the text search — fires 400ms after the user stops typing
  const debouncedSearch = useDebounce(search, 400);

  const fetchBooks = async (p = 1, s = debouncedSearch) => {
    setLoading(true);
    try {
      const res = await booksApi.getAll({
        search: s, scholarId, type, page: p, limit: 12,
      });
      setBooks(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  // Load scholars for filter dropdown once
  useEffect(() => {
    scholarsApi.getAll().then((r) => setScholars(r.data));
  }, []);

  // Re-fetch whenever debounced search changes
  useEffect(() => {
    fetchBooks(1, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const applyFilters = () => fetchBooks(1);

  const clearFilters = () => {
    setSearch('');
    setScholarId('');
    setType('');
  };

  // When dropdowns change, re-fetch immediately (no debounce needed)
  useEffect(() => {
    fetchBooks(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scholarId, type]);

  const hasFilters = search || scholarId || type;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">

      {/* Header */}
      <div className="mb-6">
        <p className="font-arabic text-gold-600 text-xl">مكتبة الكتب</p>
        <h1 className="font-display text-ink-900 text-2xl sm:text-3xl tracking-wide">The Book Library</h1>
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card p-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title…"
              className="input-islamic pl-10 pr-10"
            />
            {/* Spinner inside input while debounce is pending */}
            {search !== debouncedSearch && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 animate-spin" />
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
              filtersOpen || hasFilters
                ? 'border-gold-400 bg-gold-50 text-gold-700'
                : 'border-ink-200 text-ink-500 hover:border-gold-300 hover:text-gold-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:block font-body text-xs">Filter</span>
            {(scholarId || type) && (
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0" />
            )}
          </button>
        </div>

        {filtersOpen && (
          <div className="mt-4 pt-4 border-t border-ink-100 grid sm:grid-cols-2 gap-3 animate-fade-in">
            <div>
              <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">Scholar</label>
              <select
                value={scholarId}
                onChange={(e) => setScholarId(e.target.value)}
                className="input-islamic text-sm"
              >
                <option value="">All Scholars</option>
                {scholars.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-islamic text-sm"
              >
                <option value="">All Types</option>
                <option value="PUBLISHED">Published</option>
                <option value="UNPUBLISHED">Manuscript</option>
              </select>
            </div>
            {hasFilters && (
              <div className="sm:col-span-2">
                <button
                  onClick={clearFilters}
                  className="btn-ghost text-xs py-2 px-4 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-ink-400 font-body mb-4 px-1">
        {loading
          ? 'Searching…'
          : `${total.toLocaleString()} book${total !== 1 ? 's' : ''} found`
        }
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-56 skeleton" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-ink-100">
          <p className="font-arabic text-gold-400 text-2xl mb-2">لا توجد نتائج</p>
          <p className="text-ink-400 font-body text-sm">No books found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
          {books.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-10 flex-wrap">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchBooks(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm font-display tracking-wide transition-all ${
                page === i + 1
                  ? 'bg-gradient-to-br from-gold-400 to-gold-700 text-white shadow-glow-gold'
                  : 'bg-white border border-ink-200 text-ink-500 hover:border-gold-300 hover:text-gold-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
