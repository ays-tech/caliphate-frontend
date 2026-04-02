import Link from 'next/link';
import { User, BookOpen } from 'lucide-react';

interface ScholarCardProps {
  scholar: {
    id: string;
    name: string;
    pictureUrl?: string;
    biography?: string;
    _count?: { books: number };
  };
}

export default function ScholarCard({ scholar }: ScholarCardProps) {
  return (
    <Link href={`/scholars/${scholar.id}`} className="block group">
      <div className="card p-4 text-center h-full flex flex-col items-center gap-2.5">
        {/* Avatar with gold ring */}
        <div className="relative w-16 h-16 rounded-full flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 p-0.5 group-hover:shadow-glow-gold transition-shadow duration-300">
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-emerald-900 to-ink-900 flex items-center justify-center">
              {scholar.pictureUrl ? (
                <img
                  src={scholar.pictureUrl}
                  alt={scholar.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-gold-400 opacity-70" />
              )}
            </div>
          </div>
        </div>

        <h3 className="font-display text-ink-900 text-xs sm:text-sm leading-snug group-hover:text-gold-700 transition-colors line-clamp-2 text-center">
          {scholar.name}
        </h3>

        {scholar.biography && (
          <p className="text-[11px] text-ink-500 line-clamp-2 leading-relaxed">{scholar.biography}</p>
        )}

        {scholar._count !== undefined && (
          <span className="mt-auto inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-body">
            <BookOpen className="w-3 h-3" />
            {scholar._count.books} {scholar._count.books === 1 ? 'book' : 'books'}
          </span>
        )}
      </div>
    </Link>
  );
}
