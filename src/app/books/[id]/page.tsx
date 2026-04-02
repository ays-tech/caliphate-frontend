'use client';

import { useEffect, useState } from 'react';
import { booksApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  BookMarked, Download, Eye, User, FileText,
  Image as ImageIcon, BookOpen, ChevronRight, Sparkles
} from 'lucide-react';

const FILE_ICON: Record<string, any> = {
  pdf:   { icon: FileText,  color: 'text-red-500',     bg: 'bg-red-50' },
  epub:  { icon: BookOpen,  color: 'text-blue-500',    bg: 'bg-blue-50' },
  image: { icon: ImageIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVol, setSelectedVol] = useState<any>(null);
  const [dlLoading, setDlLoading] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    booksApi.getOne(params.id)
      .then((res) => {
        setBook(res.data);
        if (res.data.volumes?.length) setSelectedVol(res.data.volumes[0]);
      })
      .catch(() => toast.error('Book not found'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDownload = async (volId: string) => {
    if (!user) { toast.error('Sign in to download'); return; }
    setDlLoading(volId);
    try {
      const res = await booksApi.getDownloadUrl(volId);
      window.open(res.data.url, '_blank');
    } catch { toast.error('Download failed'); }
    finally { setDlLoading(null); }
  };

  /* ── Loading skeleton ─────────────────────────────────────────── */
  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 animate-fade-in">
      <div className="skeleton h-6 w-1/2 mb-2" />
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-64 w-full rounded-2xl mt-6" />
    </div>
  );

  if (!book) return (
    <div className="text-center py-24">
      <p className="font-arabic text-gold-500 text-3xl mb-2">لا يوجد كتاب</p>
      <p className="text-ink-400 font-body text-sm">This book could not be found.</p>
    </div>
  );

  const statusStyle: Record<string, string> = {
    APPROVED: 'badge-approved',
    PENDING:  'badge-pending',
    REJECTED: 'badge-rejected',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-ink-400 font-body mb-6">
        <Link href="/" className="hover:text-gold-600 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/books" className="hover:text-gold-600 transition-colors">Books</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-ink-600 truncate max-w-40">{book.title}</span>
      </nav>

      {/* Book hero card */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden mb-6">
        {/* Gold top bar */}
        <div className="h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

        <div className="p-5 sm:p-7 flex flex-col sm:flex-row gap-6">
          {/* Cover */}
          <div className="w-full sm:w-36 h-52 sm:h-48 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-900 via-ink-900 to-ink-950 flex-shrink-0 shadow-lg flex items-center justify-center relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4900f' fill-opacity='0.12'%3E%3Cpolygon points='20,2 24,14 37,14 27,22 31,35 20,27 9,35 13,22 3,14 16,14'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {book.coverUrl
              ? <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              : <BookMarked className="w-14 h-14 text-gold-400 opacity-60 animate-float" />
            }
          </div>

          {/* Meta */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-ink-900 text-xl sm:text-2xl leading-snug mb-2">{book.title}</h1>

            {book.scholar && (
              <Link href={`/scholars/${book.scholar.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-900 mb-3 transition-colors font-body"
              >
                <User className="w-3.5 h-3.5" /> {book.scholar.name}
              </Link>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={statusStyle[book.status] || 'badge-pending'}>{book.status}</span>
              <span className="text-[11px] bg-ink-100 text-ink-600 px-2 py-0.5 rounded-full font-body">
                {book.type === 'PUBLISHED' ? 'Published' : 'Manuscript'}
              </span>
              <span className="text-[11px] text-ink-400 font-body flex items-center gap-1">
                <Eye className="w-3 h-3" /> {book.readCount.toLocaleString()} reads
              </span>
            </div>

            {book.description && (
              <p className="text-sm text-ink-600 font-body leading-relaxed border-l-2 border-gold-300 pl-3">
                {book.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Volumes */}
      {book.volumes?.length > 0 && (
        <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <h2 className="font-display text-ink-900 text-sm tracking-wide">
              Volumes <span className="text-ink-400 font-body font-normal text-xs">({book.volumes.length})</span>
            </h2>
          </div>
          <div className="divide-y divide-ink-50">
            {book.volumes.map((vol: any) => {
              const meta = FILE_ICON[vol.fileType] || FILE_ICON.epub;
              const Icon = meta.icon;
              const isSelected = selectedVol?.id === vol.id;
              return (
                <div
                  key={vol.id}
                  onClick={() => setSelectedVol(vol)}
                  className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-gold-50 border-l-2 border-gold-400' : 'hover:bg-ink-50 border-l-2 border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-body font-medium truncate ${isSelected ? 'text-gold-800' : 'text-ink-800'}`}>
                      {vol.title}
                    </p>
                    <p className="text-[11px] text-ink-400 uppercase tracking-widest">{vol.fileType}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(vol.id); }}
                    disabled={dlLoading === vol.id}
                    className="flex items-center gap-1.5 text-xs btn-gold py-1.5 px-3"
                  >
                    <Download className="w-3 h-3" />
                    {dlLoading === vol.id ? '…' : 'Download'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reader */}
      {selectedVol && (
        <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gold-500" />
              <h2 className="font-display text-ink-900 text-sm tracking-wide truncate">
                {selectedVol.title}
              </h2>
            </div>
            <span className="text-[10px] font-body tracking-widest text-ink-400 uppercase bg-ink-100 px-2 py-1 rounded-full">
              {selectedVol.fileType}
            </span>
          </div>

          <div className="p-4">
            {selectedVol.fileType === 'pdf' ? (
              <iframe
                src={`${selectedVol.fileUrl}#toolbar=1&navpanes=0`}
                className="w-full rounded-xl border border-ink-100"
                style={{ height: 'min(700px, 80vh)' }}
                title={selectedVol.title}
              />
            ) : selectedVol.fileType === 'image' ? (
              <img
                src={selectedVol.fileUrl}
                alt={selectedVol.title}
                className="max-w-full mx-auto rounded-xl shadow"
              />
            ) : (
              <div className="text-center py-12">
                <BookMarked className="w-12 h-12 mx-auto text-gold-300 mb-3 animate-float" />
                <p className="font-display text-ink-700 text-sm mb-1">EPUB Format</p>
                <p className="text-ink-400 font-body text-xs mb-5">Download to read in your preferred e-reader app.</p>
                {user && (
                  <button
                    onClick={() => handleDownload(selectedVol.id)}
                    className="btn-gold"
                  >
                    <Download className="w-4 h-4" /> Download EPUB
                  </button>
                )}
                {!user && (
                  <Link href="/auth/login" className="btn-ghost">Sign in to download</Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {book.volumes?.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-ink-100">
          <BookMarked className="w-10 h-10 mx-auto text-gold-200 mb-3" />
          <p className="font-arabic text-gold-400 text-xl mb-1">لا توجد مجلدات</p>
          <p className="text-ink-400 text-sm font-body">No volumes uploaded yet.</p>
        </div>
      )}
    </div>
  );
}
