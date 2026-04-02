import Link from 'next/link';
import { BookOpen, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-56px)] bg-parchment flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md mx-auto animate-fade-up">

        {/* Mosque dome illustration */}
        <div className="w-32 h-32 mx-auto mb-6">
          <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="64" cy="64" r="60" fill="#14532d" fillOpacity="0.08" />
            <circle cx="64" cy="64" r="48" stroke="#d4900f" strokeOpacity="0.2" strokeWidth="1" />
            {/* Dome */}
            <ellipse cx="64" cy="72" rx="32" ry="22" fill="#14532d" fillOpacity="0.5" />
            <ellipse cx="64" cy="72" rx="22" ry="14" fill="#14532d" fillOpacity="0.4" />
            {/* Minaret left */}
            <rect x="24" y="54" width="8" height="40" rx="1" fill="#14532d" fillOpacity="0.4" />
            <ellipse cx="28" cy="54" rx="4" ry="6" fill="#14532d" fillOpacity="0.4" />
            {/* Minaret right */}
            <rect x="96" y="54" width="8" height="40" rx="1" fill="#14532d" fillOpacity="0.4" />
            <ellipse cx="100" cy="54" rx="4" ry="6" fill="#14532d" fillOpacity="0.4" />
            {/* Crescent */}
            <circle cx="64" cy="44" r="6" fill="#d4900f" fillOpacity="0.7" />
            <circle cx="67" cy="42" r="5" fill="#faf6ef" />
            {/* Ground */}
            <rect x="10" y="94" width="108" height="4" rx="2" fill="#14532d" fillOpacity="0.15" />
            {/* 404 */}
            <text x="64" y="88" textAnchor="middle" fontFamily="serif" fontSize="11" fill="#d4900f" fillOpacity="0.7" fontWeight="bold">٤٠٤</text>
          </svg>
        </div>

        {/* Arabic */}
        <p className="font-arabic text-gold-600 text-2xl mb-1">الصفحة غير موجودة</p>

        {/* Gold ornament */}
        <div className="flex items-center justify-center gap-3 my-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400" />
          <span className="text-gold-500 text-sm">✦</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400" />
        </div>

        <h1 className="font-display text-ink-900 text-2xl tracking-wide mb-2">Page Not Found</h1>
        <p className="text-ink-500 font-body text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          The page you are looking for does not exist or may have been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-gold py-2.5 px-6">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link href="/books" className="btn-ghost py-2.5 px-6">
            <BookOpen className="w-4 h-4" /> Browse Books
          </Link>
        </div>
      </div>
    </div>
  );
}
