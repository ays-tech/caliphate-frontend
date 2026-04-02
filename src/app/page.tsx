'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { booksApi, scholarsApi, eventsApi } from '@/lib/api';
import BookCard from '@/components/books/BookCard';
import ScholarCard from '@/components/scholars/ScholarCard';
import { Search, ArrowRight, Calendar, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

// ── Rotating Islamic quotes ──────────────────────────────────────────
const QUOTES = [
  {
    arabic:  'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    english: 'In the Name of God, the Most Gracious, the Most Merciful',
    source:  'Al-Quran 1:1',
  },
  {
    arabic:  'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
    english: 'Read in the Name of your Lord who created',
    source:  'Al-Quran 96:1',
  },
  {
    arabic:  'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    english: 'And say: My Lord, increase me in knowledge',
    source:  'Al-Quran 20:114',
  },
  {
    arabic:  'الْعِلْمُ نُورٌ وَالْجَهْلُ ظُلْمَةٌ',
    english: 'Knowledge is light and ignorance is darkness',
    source:  'Prophetic Wisdom',
  },
];

function RotatingQuote() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 600);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const q = QUOTES[idx];

  return (
    <div
      className="text-center mb-6 min-h-[88px] flex flex-col items-center justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <p className="font-arabic text-gold-300 text-2xl sm:text-3xl leading-relaxed mb-1">
        {q.arabic}
      </p>
      <p className="text-ivory/80 text-xs sm:text-sm font-body italic max-w-sm mx-auto leading-relaxed">
        "{q.english}"
      </p>
      <p className="text-gold-600 text-[10px] font-display tracking-widest mt-1 uppercase">
        {q.source}
      </p>
    </div>
  );
}

// ── Animated Mosque SVG background ──────────────────────────────────
function MosqueSVGBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Deep sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d2440] to-[#0a1a1a]" />

      {/* Animated stars */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fdf0ba" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#f5b019" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f5b019" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          {/* Crescent clip */}
          <clipPath id="crescent">
            <circle cx="148" cy="68" r="22" />
          </clipPath>
        </defs>

        {/* Stars — twinkling via CSS */}
        {[
          [60,30,1.2],[120,20,0.9],[200,40,1.4],[280,15,1.0],[350,35,0.8],
          [430,22,1.3],[510,42,0.7],[580,18,1.1],[650,38,1.5],[720,25,0.9],
          [90,70,0.8],[170,55,1.1],[240,65,0.7],[320,58,1.3],[400,72,0.9],
          [470,60,1.0],[550,55,0.8],[630,68,1.2],[700,62,0.7],[760,50,1.0],
          [30,50,0.7],[750,75,0.8],[140,90,1.0],[490,30,0.9],[610,28,1.1],
        ].map(([x, y, r], i) => (
          <g key={i}>
            <circle
              cx={x} cy={y} r={r}
              fill="white"
              opacity={0.6 + Math.random() * 0.4}
              style={{
                animation: `twinkle ${2 + (i % 4) * 0.7}s ease-in-out infinite`,
                animationDelay: `${(i * 0.3) % 3}s`,
              }}
            />
          </g>
        ))}

        {/* Moon */}
        <circle cx="148" cy="68" r="22" fill="url(#moonGlow)" />
        <circle cx="160" cy="60" r="18" fill="#0d2440" clipPath="url(#crescent)" />

        {/* Mosque silhouette */}
        {/* Ground */}
        <rect x="0" y="440" width="800" height="60" fill="#0a1210" />

        {/* Far background minarets (dim) */}
        <g opacity="0.25" fill="#14532d">
          <rect x="80"  y="300" width="18" height="140" />
          <ellipse cx="89" cy="300" rx="9" ry="14" />
          <circle cx="89" cy="292" r="4" />
          <rect x="700" y="310" width="18" height="130" />
          <ellipse cx="709" cy="310" rx="9" ry="14" />
          <circle cx="709" cy="302" r="4" />
        </g>

        {/* Mid minarets */}
        <g opacity="0.5" fill="#15803d">
          <rect x="175" y="260" width="22" height="180" />
          <ellipse cx="186" cy="260" rx="11" ry="18" />
          <circle cx="186" cy="248" r="5" />
          <rect x="600" y="268" width="22" height="172" />
          <ellipse cx="611" cy="268" rx="11" ry="18" />
          <circle cx="611" cy="256" r="5" />
        </g>

        {/* Main mosque body */}
        <g fill="#14532d">
          {/* Base walls */}
          <rect x="230" y="360" width="340" height="80" />

          {/* Arched windows row */}
          {[270,320,370,420,470,520].map((x, i) => (
            <g key={i}>
              <rect x={x} y="375" width="26" height="35" />
              <ellipse cx={x + 13} cy="375" rx="13" ry="10" />
              {/* Window glow */}
              <ellipse cx={x + 13} cy="383" rx="8" ry="12" fill="#d4900f" opacity="0.35" />
            </g>
          ))}

          {/* Side domes */}
          <ellipse cx="300" cy="360" rx="44" ry="30" />
          <ellipse cx="500" cy="360" rx="44" ry="30" />

          {/* Main central dome */}
          <ellipse cx="400" cy="340" rx="80" ry="55" />

          {/* Dome highlight */}
          <ellipse cx="390" cy="320" rx="30" ry="18" fill="#166534" opacity="0.5" />

          {/* Central crescent finial */}
          <rect x="397" y="285" width="6" height="28" fill="#d4900f" />
          <path d="M400 280 Q412 272 414 285 Q406 280 400 280Z" fill="#d4900f" />
          <circle cx="410" cy="277" r="3" fill="#f5b019" />

          {/* Side finials */}
          <rect x="298" y="330" width="4" height="18" fill="#d4900f" />
          <circle cx="300" cy="328" r="3" fill="#f5b019" />
          <rect x="498" y="330" width="4" height="18" fill="#d4900f" />
          <circle cx="500" cy="328" r="3" fill="#f5b019" />

          {/* Main minarets */}
          <rect x="245" y="200" width="28" height="160" />
          <ellipse cx="259" cy="200" rx="14" ry="22" />
          <circle cx="259" cy="184" r="7" />
          <rect x="527" y="200" width="28" height="160" />
          <ellipse cx="541" cy="200" rx="14" ry="22" />
          <circle cx="541" cy="184" r="7" />

          {/* Minaret balconies */}
          <rect x="240" y="260" width="38" height="5" rx="2" />
          <rect x="522" y="260" width="38" height="5" rx="2" />
          <rect x="240" y="300" width="38" height="5" rx="2" />
          <rect x="522" y="300" width="38" height="5" rx="2" />

          {/* Minaret crescent finials */}
          <rect x="257" y="162" width="4" height="16" fill="#d4900f" />
          <path d="M259 158 Q268 152 270 162 Q264 158 259 158Z" fill="#d4900f" />
          <rect x="539" y="162" width="4" height="16" fill="#d4900f" />
          <path d="M541 158 Q550 152 552 162 Q546 158 541 158Z" fill="#d4900f" />
        </g>

        {/* Ground foreground - dark strip */}
        <rect x="0" y="430" width="800" height="70" fill="#060e0e" />

        {/* Reflection in water */}
        <g opacity="0.15">
          <rect x="230" y="440" width="340" height="30" fill="#14532d" />
          <ellipse cx="400" cy="442" rx="80" ry="20" fill="#14532d" />
        </g>

        {/* Gold geometric overlay tiles */}
        <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <polygon points="40,4 76,22 76,58 40,76 4,58 4,22"
            fill="none" stroke="#d4900f" strokeOpacity="0.07" strokeWidth="0.8" />
          <polygon points="40,16 64,28 64,52 40,64 16,52 16,28"
            fill="none" stroke="#d4900f" strokeOpacity="0.05" strokeWidth="0.6" />
        </pattern>
        <rect width="800" height="500" fill="url(#geo)" />
      </svg>

      {/* Bottom fade into content */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-parchment to-transparent" />
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────
function SectionHeader({ title, arabic, href }: { title: string; arabic?: string; href: string }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        {arabic && <p className="font-arabic text-gold-600 text-base leading-none mb-0.5">{arabic}</p>}
        <h2 className="font-display text-ink-900 text-lg sm:text-xl tracking-wide">{title}</h2>
      </div>
      <Link href={href} className="flex items-center gap-1 text-xs font-display tracking-widest text-gold-600 hover:text-gold-800 transition-colors">
        ALL <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function SkeletonCards({ count = 6, h = 'h-56' }: { count?: number; h?: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`${h} skeleton`} style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const [mostRead,  setMostRead]  = useState<any[]>([]);
  const [recent,   setRecent]    = useState<any[]>([]);
  const [scholars, setScholars]  = useState<any[]>([]);
  const [events,   setEvents]    = useState<any[]>([]);
  const [search,   setSearch]    = useState('');
  const [loading,  setLoading]   = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      booksApi.getMostRead(6),
      booksApi.getRecent(6),
      scholarsApi.getAll(),
      eventsApi.getUpcoming(),
    ])
      .then(([mr, rc, sc, ev]) => {
        setMostRead(mr.data);
        setRecent(rc.data);
        setScholars(sc.data.slice(0, 6));
        setEvents(ev.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/books?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="animate-fade-in">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-white px-4 pt-12 pb-28 sm:pt-16 sm:pb-36 min-h-[520px] sm:min-h-[560px] flex items-center">
        <MosqueSVGBackground />

        <div className="relative w-full max-w-2xl mx-auto text-center z-10">

          {/* Rotating quote */}
          <RotatingQuote />

          {/* Gold ornament */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold-500" />
            <span className="text-gold-500 text-lg">✦</span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold-500" />
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory leading-tight tracking-wide mb-1 animate-fade-up">
            CaliphateMakhtaba
          </h1>
          <p className="font-arabic text-gold-300 text-xl mb-4 animate-fade-up animate-delay-100">
            مكتبة الخلافة
          </p>
          <p className="text-white/60 text-sm sm:text-base font-body max-w-md mx-auto leading-relaxed mb-8 animate-fade-up animate-delay-200">
            A curated digital library preserving the works of Islamic scholars — books, manuscripts, and volumes for generations to come.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto animate-fade-up animate-delay-300">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the library…"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-ivory text-sm placeholder-white/30 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-body backdrop-blur-md"
              />
            </div>
            <button type="submit" className="btn-gold py-3 px-5 text-xs">
              Search
            </button>
          </form>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8 animate-fade-up animate-delay-400">
            {[
              { label: 'Books',       value: '100+' },
              { label: 'Scholars',    value: scholars.length > 0 ? `${scholars.length}+` : '…' },
              { label: 'Free Access', value: '✓' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-display text-gold-400 text-lg leading-none">{value}</p>
                <p className="text-white/40 text-[10px] font-body tracking-widest mt-0.5 uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-14">

        <section>
          <SectionHeader title="Most Read" arabic="الأكثر قراءة" href="/books" />
          {loading ? <SkeletonCards count={6} /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
              {mostRead.map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          )}
        </section>

        <div className="divider-ornament text-2xl">✦</div>

        <section>
          <SectionHeader title="Recently Added" arabic="أحدث الإضافات" href="/books" />
          {loading ? <SkeletonCards count={6} /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
              {recent.map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          )}
        </section>

        <section>
          <SectionHeader title="Browse Scholars" arabic="العلماء" href="/scholars" />
          {loading ? <SkeletonCards count={6} h="h-40" /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
              {scholars.map((s) => <ScholarCard key={s.id} scholar={s} />)}
            </div>
          )}
        </section>

        {!loading && events.length > 0 && (
          <section>
            <div className="divider-ornament text-2xl mb-8">✦</div>
            <SectionHeader title="Upcoming Events" arabic="الفعاليات القادمة" href="/" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {events.map((event: any) => (
                <div key={event.id} className="card p-5 flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 flex flex-col items-center justify-center flex-shrink-0 border border-gold-300">
                    <span className="font-display text-gold-800 text-lg leading-none">{format(new Date(event.date), 'd')}</span>
                    <span className="text-[9px] font-body text-gold-700 uppercase tracking-widest">{format(new Date(event.date), 'MMM')}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-ink-900 text-sm leading-snug mb-1">{event.title}</h3>
                    {event.description && <p className="text-xs text-ink-500 font-body line-clamp-2">{event.description}</p>}
                    <p className="text-[11px] text-gold-600 mt-1.5 font-body">{format(new Date(event.date), 'EEEE, MMMM d')}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section>
          <div className="relative rounded-2xl overflow-hidden p-8 sm:p-10 text-center"
            style={{ background: 'linear-gradient(135deg, #14532d 0%, #0a1628 60%, #0a1a1a 100%)' }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4900f' fill-opacity='0.6'%3E%3Cpolygon points='30,2 34,20 52,14 40,28 56,38 37,36 34,54 26,38 8,44 18,30 4,20 22,22'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div className="relative">
              <p className="font-arabic text-gold-400 text-2xl mb-2">اقْرَأْ بِاسْمِ رَبِّكَ</p>
              <h2 className="font-display text-ivory text-xl sm:text-2xl mb-2 tracking-wide">Read in the Name of Your Lord</h2>
              <p className="text-white/50 text-sm font-body mb-6 max-w-sm mx-auto">
                Explore our growing collection of scholarly works. Free to read, free to learn.
              </p>
              <Link href="/books" className="btn-gold">
                <BookOpen className="w-4 h-4" /> Explore the Library
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* Twinkle keyframe */}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
