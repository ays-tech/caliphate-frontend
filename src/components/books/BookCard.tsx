import Link from 'next/link';
import { BookMarked, Eye } from 'lucide-react';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    coverUrl?: string;
    readCount: number;
    type?: string;
    scholar?: { id?: string; name: string };
    _count?: { volumes: number };
  };
  className?: string;
}

export default function BookCard({ book, className = '' }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className={`block group ${className}`}>
      <div className="card overflow-hidden h-full">
        {/* Cover */}
        <div
          className="relative h-44 sm:h-48 overflow-hidden bg-gradient-to-br from-emerald-900 via-ink-900 to-ink-950"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4900f' fill-opacity='0.3'%3E%3Cpolygon points='20,2 24,14 37,14 27,22 31,35 20,27 9,35 13,22 3,14 16,14'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookMarked className="w-10 h-10 text-gold-400 opacity-60 group-hover:scale-110 transition-transform duration-300" />
            </div>
          )}

          {book.type && (
            <div className="absolute top-2.5 left-2.5">
              <span className="text-[10px] font-display tracking-widest px-2 py-0.5 rounded-full bg-ink-950/70 text-gold-400 backdrop-blur-sm border border-gold-800/40">
                {book.type === 'PUBLISHED' ? 'PUBLISHED' : 'MANUSCRIPT'}
              </span>
            </div>
          )}

          {book._count && book._count.volumes > 0 && (
            <div className="absolute top-2.5 right-2.5">
              <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-ink-950/70 text-ink-300 backdrop-blur-sm">
                {book._count.volumes} vol{book._count.volumes !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="font-display text-ink-900 text-sm leading-snug line-clamp-2 group-hover:text-gold-700 transition-colors mb-1.5">
            {book.title}
          </h3>
          {book.scholar && (
            <p className="text-xs text-ink-500 font-body truncate mb-2">{book.scholar.name}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] text-ink-400">
              <Eye className="w-3 h-3" /> {book.readCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-gold-600 font-display tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
              Read →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
