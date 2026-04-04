import Link from 'next/link';
import { BookOpen, Users, Shield, Heart, ArrowRight } from 'lucide-react';

const PILLARS = [
  {
    icon: BookOpen,
    arabic: 'العلم',
    title: 'Knowledge',
    body: 'We believe that seeking knowledge is an obligation upon every Muslim. CaliphateMakhtaba exists to make the scholarly heritage of Islam freely accessible to everyone, everywhere, in any language.',
  },
  {
    icon: Users,
    arabic: 'الأمة',
    title: 'Community',
    body: 'Built for the global Ummah — students, researchers, imams, and curious minds. Every book uploaded, every scholar added, and every page read is an act of service to the community.',
  },
  {
    icon: Shield,
    arabic: 'الأمانة',
    title: 'Preservation',
    body: 'Centuries of Islamic scholarship are at risk of being lost. Our mission is to digitise, organise, and safeguard these works so future generations can benefit from the intellectual heritage of this civilisation.',
  },
  {
    icon: Heart,
    arabic: 'الإخلاص',
    title: 'Sincerity',
    body: 'This project is built with sincerity for the sake of Allah. Free to read, free to download, free forever. No advertisements. No paywalls. No compromise on the purity of the mission.',
  },
];

const TIMELINE = [
  { year: '8th C.', event: 'House of Wisdom founded in Baghdad — the greatest library of the ancient world, holding over 400,000 manuscripts.' },
  { year: '13th C.', event: 'The Mongol sack of Baghdad destroys the House of Wisdom. Scholars flee, carrying knowledge across the Islamic world.' },
  { year: '2024', event: 'CaliphateMakhtaba is founded — a digital House of Wisdom for the 21st century, open to all.' },
  { year: 'Today', event: 'Scholars, books, and manuscripts continue to be added. The library grows with every contribution.' },
];

export default function AboutPage() {
  return (
    <div className="animate-fade-in">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white px-4 py-16 sm:py-24 text-center"
        style={{ background: 'linear-gradient(180deg, #060f1e 0%, #0a1a2e 60%, #0d2010 100%)' }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23d4900f' stroke-opacity='1' stroke-width='0.8'%3E%3Cpolygon points='40,4 76,22 76,58 40,76 4,58 4,22'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <p className="font-arabic text-yellow-300 text-3xl mb-3">عن المكتبة</p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-500/60" />
            <span className="text-yellow-500 text-xl">&#10022;</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-500/60" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-4">
            About the Library
          </h1>
          <p className="text-white/60 text-base font-body max-w-lg mx-auto leading-relaxed">
            CaliphateMakhtaba is a free digital library dedicated to preserving
            and sharing the scholarly works of the Islamic tradition — from the
            earliest jurists to the great philosophers of the Golden Age.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/80 to-transparent" />
      </section>

      <div className="bg-parchment">
        <div className="max-w-4xl mx-auto px-4 py-14 space-y-16">

          {/* ── Mission ──────────────────────────────────────────── */}
          <section className="text-center max-w-2xl mx-auto">
            <p className="font-arabic text-gold-600 text-xl mb-1">رسالتنا</p>
            <h2 className="font-display text-ink-900 text-2xl tracking-wide mb-5">Our Mission</h2>
            <p className="text-ink-600 font-body leading-relaxed text-base mb-4">
              The Prophet Muhammad ﷺ said: <span className="font-arabic text-gold-700 text-lg">"طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ"</span>
            </p>
            <p className="text-ink-500 font-body text-sm italic mb-6">
              "Seeking knowledge is an obligation upon every Muslim." — Ibn Majah
            </p>
            <p className="text-ink-600 font-body leading-relaxed">
              We built CaliphateMakhtaba because the works of Ibn Khaldun, Al-Ghazali,
              Ibn Sina, and hundreds of other scholars deserve to be read — not locked behind
              paywalls, scattered across fragmented archives, or left to decay in
              physical collections few people can access. This library is our answer
              to that problem.
            </p>
          </section>

          {/* ── Gold divider ─────────────────────────────────────── */}
          <div className="divider-ornament text-xl">&#10022;</div>

          {/* ── Four pillars ─────────────────────────────────────── */}
          <section>
            <div className="text-center mb-10">
              <p className="font-arabic text-gold-600 text-xl mb-1">أركاننا</p>
              <h2 className="font-display text-ink-900 text-2xl tracking-wide">What We Stand For</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {PILLARS.map(({ icon: Icon, arabic, title, body }) => (
                <div key={title} className="card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center flex-shrink-0 shadow-glow-gold">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-arabic text-gold-600 text-base leading-none">{arabic}</p>
                      <h3 className="font-display text-ink-900 text-sm tracking-wide">{title}</h3>
                    </div>
                  </div>
                  <p className="text-ink-600 font-body text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Timeline ─────────────────────────────────────────── */}
          <section>
            <div className="text-center mb-10">
              <p className="font-arabic text-gold-600 text-xl mb-1">التاريخ</p>
              <h2 className="font-display text-ink-900 text-2xl tracking-wide">A Tradition of Scholarship</h2>
            </div>
            <div className="relative pl-6 border-l-2 border-gold-200 space-y-8">
              {TIMELINE.map(({ year, event }) => (
                <div key={year} className="relative">
                  {/* Gold dot on timeline */}
                  <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 border-2 border-parchment shadow-glow-gold" />
                  <p className="font-display text-gold-700 text-xs tracking-widest uppercase mb-1">{year}</p>
                  <p className="text-ink-600 font-body text-sm leading-relaxed">{event}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Stats ────────────────────────────────────────────── */}
          <section>
            <div
              className="rounded-2xl overflow-hidden p-8 text-center"
              style={{ background: 'linear-gradient(135deg, #14532d 0%, #0a1628 70%)' }}
            >
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4900f' fill-opacity='0.5'%3E%3Cpolygon points='30,2 34,20 52,14 40,28 56,38 37,36 34,54 26,38 8,44 18,30 4,20 22,22'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <p className="font-arabic text-yellow-300 text-2xl mb-6">مكتبة الخلافة</p>
              <div className="flex items-center justify-center gap-12 flex-wrap">
                {[
                  { value: '12+', label: 'Books' },
                  { value: '6',   label: 'Scholars' },
                  { value: '100%', label: 'Free' },
                  { value: '∞',   label: 'Growing' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-display text-yellow-400 text-3xl leading-none">{value}</p>
                    <p className="text-white/40 text-[10px] font-body tracking-widest mt-1 uppercase">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ──────────────────────────────────────────────── */}
          <section className="text-center">
            <p className="font-arabic text-gold-600 text-xl mb-2">ابدأ الرحلة</p>
            <h2 className="font-display text-ink-900 text-xl tracking-wide mb-4">Begin Your Journey</h2>
            <p className="text-ink-500 font-body text-sm mb-6 max-w-sm mx-auto">
              Explore our collection of scholarly works — free to read, free to share.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/books" className="btn-gold">
                <BookOpen className="w-4 h-4" /> Browse the Library
              </Link>
              <Link href="/contact" className="btn-ghost">
                Contact Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
