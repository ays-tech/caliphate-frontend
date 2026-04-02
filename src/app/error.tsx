'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-parchment flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md mx-auto animate-fade-up">

        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
          <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#d4900f" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M20 12 L20 22" stroke="#d4900f" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="20" cy="28" r="1.5" fill="#d4900f" />
          </svg>
        </div>

        <p className="font-arabic text-gold-600 text-xl mb-1">حدث خطأ ما</p>

        <div className="flex items-center justify-center gap-3 my-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400" />
          <span className="text-gold-500 text-sm">✦</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400" />
        </div>

        <h1 className="font-display text-ink-900 text-2xl tracking-wide mb-2">
          Something Went Wrong
        </h1>
        <p className="text-ink-500 font-body text-sm leading-relaxed mb-2 max-w-xs mx-auto">
          An unexpected error occurred. Please try again or return to the home page.
        </p>

        {/* Show error digest in dev */}
        {error.digest && (
          <p className="text-ink-400 font-body text-xs mb-6 bg-ink-50 border border-ink-200 px-3 py-1.5 rounded-lg inline-block">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button onClick={reset} className="btn-gold py-2.5 px-6">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link href="/" className="btn-ghost py-2.5 px-6">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
