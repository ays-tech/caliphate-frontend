'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { booksApi, scholarsApi, eventsApi } from '@/lib/api';
import BookCard from '@/components/books/BookCard';
import ScholarCard from '@/components/scholars/ScholarCard';
import { Search, ArrowRight, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

// ── Rotating Islamic quotes ───────────────────────────────────────────
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
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx((i) => (i + 1) % QUOTES.length); setVisible(true); }, 500);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const q = QUOTES[idx];
  return (
    <div
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        minHeight:  '7rem',
      }}
      className="flex flex-col items-center justify-center text-center px-4"
    >
      <p className="font-arabic text-3xl sm:text-4xl text-yellow-300 leading-relaxed mb-2 drop-shadow-lg">
        {q.arabic}
      </p>
      <p className="text-white/70 text-sm sm:text-base font-body italic leading-relaxed max-w-lg">
        &ldquo;{q.english}&rdquo;
      </p>
      <p className="text-yellow-500/80 text-xs font-display tracking-widest mt-2 uppercase">
        — {q.source}
      </p>
    </div>
  );
}

// ── Mosque SVG (contained, no bleed) ────────────────────────────────
function MosqueSVG() {
  return (
    <svg
      viewBox="0 0 800 280"
      preserveAspectRatio="xMidYMax meet"
      className="absolute bottom-0 left-0 right-0 w-full"
      aria-hidden="true"
    >
      <defs>
        {/* Stars pattern */}
        <pattern id="starPat" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <polygon
            points="30,2 33,20 50,14 38,27 55,37 36,35 33,53 25,37 7,43 17,29 3,19 21,21"
            fill="#d4900f" fillOpacity="0.06"
          />
        </pattern>
        {/* Geo pattern */}
        <pattern id="geoPat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <polygon points="40,4 76,22 76,58 40,76 4,58 4,22"
            fill="none" stroke="#d4900f" strokeOpacity="0.07" strokeWidth="0.8"/>
        </pattern>
      </defs>

      {/* Twinkling stars */}
      {[
        [60,25,1.2],[130,15,0.9],[210,30,1.4],[300,12,1.0],[380,22,0.8],
        [450,18,1.3],[520,28,0.7],[600,14,1.1],[670,24,1.5],[740,18,0.9],
        [95,55,0.8],[180,42,1.1],[260,50,0.7],[340,44,1.3],[420,55,0.9],
        [490,46,1.0],[560,42,0.8],[640,52,1.2],[710,48,0.7],[770,38,1.0],
      ].map(([x, y, r], i) => (
        <circle
          key={i} cx={x} cy={y} r={r} fill="white"
          style={{
            animation:      `twinkle ${2 + (i % 4) * 0.6}s ease-in-out infinite`,
            animationDelay: `${(i * 0.28) % 3}s`,
          }}
        />
      ))}

      {/* Moon + crescent */}
      <circle cx="680" cy="45" r="20" fill="#fdf0ba" fillOpacity="0.85"/>
      <circle cx="692" cy="38" r="16" fill="#0a1628"/>

      {/* ── Far-background minarets (dim) ── */}
      <g opacity="0.2" fill="#15803d">
        <rect x="75"  y="160" width="14" height="120"/>
        <ellipse cx="82"  cy="160" rx="7" ry="11"/>
        <circle  cx="82"  cy="151" r="3"/>
        <rect x="710" y="165" width="14" height="115"/>
        <ellipse cx="717" cy="165" rx="7" ry="11"/>
        <circle  cx="717" cy="156" r="3"/>
      </g>

      {/* ── Mid minarets ── */}
      <g opacity="0.45" fill="#166534">
        <rect x="170" y="130" width="18" height="150"/>
        <ellipse cx="179" cy="130" rx="9" ry="14"/>
        <circle  cx="179" cy="118" r="4"/>
        <rect x="612" y="135" width="18" height="145"/>
        <ellipse cx="621" cy="135" rx="9" ry="14"/>
        <circle  cx="621" cy="123" r="4"/>
      </g>

      {/* ── Main mosque body ── */}
      <g fill="#14532d">
        {/* Base */}
        <rect x="240" y="195" width="320" height="85"/>

        {/* Arched windows with amber glow */}
        {[275,325,375,425,475,525].map((x, i) => (
          <g key={i}>
            <rect x={x} y="207" width="22" height="30"/>
            <ellipse cx={x+11} cy="207" rx="11" ry="9"/>
            <ellipse cx={x+11} cy="215" rx="7" ry="10" fill="#d4900f" fillOpacity="0.4"/>
          </g>
        ))}

        {/* Side domes */}
        <ellipse cx="298" cy="195" rx="42" ry="28"/>
        <ellipse cx="502" cy="195" rx="42" ry="28"/>

        {/* Main dome */}
        <ellipse cx="400" cy="175" rx="76" ry="52"/>
        {/* Dome highlight */}
        <ellipse cx="391" cy="157" rx="28" ry="17" fill="#166534" fillOpacity="0.45"/>

        {/* Main finial */}
        <rect x="397" y="123" width="6" height="26" fill="#d4900f"/>
        {/* Crescent */}
        <path d="M400 118 Q412 110 414 122 Q406 117 400 118Z" fill="#d4900f"/>
        <circle cx="410" cy="116" r="3.5" fill="#f5b019"/>

        {/* Side finials */}
        <rect x="296" y="167" width="4" height="16" fill="#d4900f"/>
        <circle cx="298" cy="165" r="3" fill="#f5b019"/>
        <rect x="500" y="167" width="4" height="16" fill="#d4900f"/>
        <circle cx="502" cy="165" r="3" fill="#f5b019"/>

        {/* Main minarets */}
        <rect x="252" y="105" width="26" height="155"/>
        <ellipse cx="265" cy="105" rx="13" ry="20"/>
        <circle  cx="265" cy="91"  r="6"/>
        <rect x="522" y="105" width="26" height="155"/>
        <ellipse cx="535" cy="105" rx="13" ry="20"/>
        <circle  cx="535" cy="91"  r="6"/>

        {/* Balconies */}
        <rect x="246" y="162" width="38" height="5" rx="2"/>
        <rect x="516" y="162" width="38" height="5" rx="2"/>
        <rect x="246" y="198" width="38" height="5" rx="2"/>
        <rect x="516" y="198" width="38" height="5" rx="2"/>

        {/* Minaret finials */}
        <rect x="263" y="70"  width="4" height="15" fill="#d4900f"/>
        <path d="M265 66 Q274 60 276 70 Q270 66 265 66Z" fill="#d4900f"/>
        <rect x="533" y="70"  width="4" height="15" fill="#d4900f"/>
        <path d="M535 66 Q544 60 546 70 Q540 66 535 66Z" fill="#d4900f"/>
      </g>

      {/* Ground */}
      <rect x="0" y="270" width="800" height="10" fill="#060e0e"/>

      {/* Pattern overlays */}
      <rect width="800" height="280" fill="url(#geoPat)"/>
      <rect width="800" height="200" fill="url(#starPat)"/>
    </svg>
  );
}

// ── Section header ───────────────────────────────────────────────────
function SectionHeader({ title, arabic, href }: { title: string; arabic?: string; href: string }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        {arabic && <p className="font-arabic text-gold-600 text-lg leading-none mb-0.5">{arabic}</p>}
        <h2 className="font-display text-ink-900 text-lg sm:text-xl tracking-wide">{title}</h2>
      </div>
      <Link
        href={href}
        className="flex items-center gap-1 text-xs font-display tracking-widest text-gold-600 hover:text-gold-800 transition-colors"
      >
        ALL <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function SkeletonCards({ count = 6, h = 'h-56' }: { count?: number; h?: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`${h} skeleton rounded-xl`} style={{ animationDelay: `${i * 0.08}s` }} />
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
  const [searching, setSearching] = useState(false);
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
    <div>

      {/* ╔══════════════════════════════════════════════════════════════╗
          ║  HERO — fully contained, no bleed                           ║
          ╚══════════════════════════════════════════════════════════════╝ */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(180deg, #060f1e 0%, #0a1a2e 50%, #0d2010 100%)' }}
      >
        {/* Mosque SVG — sits at the bottom of the section */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <MosqueSVG />
        </div>

        {/* Dark vignette so text reads clearly over the mosque */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 40%, transparent 30%, rgba(6,14,30,0.55) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 pt-12 pb-52 sm:pt-16 sm:pb-60 text-center">

          {/* Rotating quote */}
          <RotatingQuote />

          {/* Gold ornament */}
          <div className="flex items-center justify-center gap-4 my-5">
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-yellow-500/60" />
            <span className="text-yellow-500 text-xl font-arabic leading-none">&#10022;</span>
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-yellow-500/60" />
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide leading-tight mb-1">
            CaliphateMakhtaba
          </h1>
          <p className="font-arabic text-yellow-300 text-2xl mb-4">مكتبة الخلافة</p>
          <p className="text-white/60 text-sm sm:text-base font-body max-w-md mx-auto leading-relaxed mb-8">
            A curated digital library preserving the works of Islamic scholars —
            books, manuscripts, and volumes for generations to come.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the library…"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-body
                           bg-white/10 border border-white/20 text-white
                           placeholder-white/30 backdrop-blur-md
                           focus:outline-none focus:border-yellow-400/60
                           focus:ring-2 focus:ring-yellow-400/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="btn-gold py-3 px-5 text-xs whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Stats — plain text, no symbols that render as emoji */}
          <div className="flex items-center justify-center gap-10 mt-8">
            {[
              { label: 'BOOKS',       value: '100+' },
              { label: 'SCHOLARS',    value: scholars.length > 0 ? `${scholars.length}+` : '—' },
              { label: 'FREE ACCESS', value: 'Open' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-display text-yellow-400 text-2xl leading-none">{value}</p>
                <p className="text-white/40 text-[10px] font-body tracking-[0.18em] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hard bottom edge — no gradient bleed into content */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/80 to-transparent" />
      </section>

      {/* Gold rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

      {/* ╔══════════════════════════════════════════════════════════════╗
          ║  CONTENT — white/parchment background, clearly separated    ║
          ╚══════════════════════════════════════════════════════════════╝ */}
      <div className="bg-parchment">
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">

          {/* Most Read */}
          <section>
            <SectionHeader title="Most Read" arabic="الأكثر قراءة" href="/books" />
            {loading ? <SkeletonCards count={6} /> : mostRead.length === 0 ? (
              <p className="text-ink-400 text-sm font-body py-8 text-center">No books yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
                {mostRead.map((book) => <BookCard key={book.id} book={book} />)}
              </div>
            )}
          </section>

          {/* Ornament divider */}
          <div className="divider-ornament text-xl">&#10022;</div>

          {/* Recently Added */}
          <section>
            <SectionHeader title="Recently Added" arabic="أحدث الإضافات" href="/books" />
            {loading ? <SkeletonCards count={6} /> : recent.length === 0 ? (
              <p className="text-ink-400 text-sm font-body py-8 text-center">No books yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
                {recent.map((book) => <BookCard key={book.id} book={book} />)}
              </div>
            )}
          </section>

          {/* Scholars */}
          <section>
            <SectionHeader title="Browse Scholars" arabic="العلماء" href="/scholars" />
            {loading ? <SkeletonCards count={6} h="h-40" /> : scholars.length === 0 ? (
              <p className="text-ink-400 text-sm font-body py-8 text-center">No scholars yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger">
                {scholars.map((s) => <ScholarCard key={s.id} scholar={s} />)}
              </div>
            )}
          </section>

          {/* Events */}
          {!loading && events.length > 0 && (
            <section>
              <div className="divider-ornament text-xl mb-8">&#10022;</div>
              <SectionHeader title="Upcoming Events" arabic="الفعاليات القادمة" href="/" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                {events.map((event: any) => (
                  <div key={event.id} className="card p-5 flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 flex flex-col items-center justify-center flex-shrink-0 border border-gold-300">
                      <span className="font-display text-gold-800 text-lg leading-none">
                        {format(new Date(event.date), 'd')}
                      </span>
                      <span className="text-[9px] font-body text-gold-700 uppercase tracking-widest">
                        {format(new Date(event.date), 'MMM')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-ink-900 text-sm leading-snug mb-1">{event.title}</h3>
                      {event.description && (
                        <p className="text-xs text-ink-500 font-body line-clamp-2">{event.description}</p>
                      )}
                      <p className="text-[11px] text-gold-600 mt-1.5 font-body">
                        {format(new Date(event.date), 'EEEE, MMMM d')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA banner */}
          <section>
            <div
              className="relative rounded-2xl overflow-hidden p-8 sm:p-10 text-center"
              style={{ background: 'linear-gradient(135deg, #14532d 0%, #0a1628 60%, #0a1a1a 100%)' }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4900f' fill-opacity='0.6'%3E%3Cpolygon points='30,2 34,20 52,14 40,28 56,38 37,36 34,54 26,38 8,44 18,30 4,20 22,22'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative">
                <p className="font-arabic text-yellow-400 text-2xl mb-2">اقْرَأْ بِاسْمِ رَبِّكَ</p>
                <h2 className="font-display text-white text-xl sm:text-2xl mb-3 tracking-wide">
                  Read in the Name of Your Lord
                </h2>
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
      </div>

      {/* Twinkle keyframe */}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.9); }
          50%       { opacity: 1;    transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
