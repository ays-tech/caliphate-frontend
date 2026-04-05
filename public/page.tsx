import Link from 'next/link';
import { BookOpen, Users, Shield, Globe, Eye, ArrowRight, User } from 'lucide-react';

// ── API base for media images ─────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const media = (f: string) => `${API}/media/${f}`;

// ── Contributors ──────────────────────────────────────────────────────
const CONTRIBUTORS = [
  { name: 'Junaidu Usman Junaidu', role: 'Contributor', image: 'junaidu_usman.jpg' },
  { name: 'Dr Zaruku Muhammad',    role: 'Contributor', image: 'zaruku_muhammad.jpg' },
  { name: 'Mushaffau Musa',        role: 'Contributor', image: 'mushaffau_musa.jpg' },
  { name: 'Muhammad Buhari',       role: 'Contributor', image: 'muhammad_buhari.jpg' },
];

// ── Mission pillars ───────────────────────────────────────────────────
const MISSION = [
  { icon: Shield, arabic: 'الحفظ',    title: 'Preservation',  body: 'Preservation of historical works and rare manuscripts.' },
  { icon: Globe,  arabic: 'الوصول',   title: 'Accessibility', body: 'Accessibility for global seekers of knowledge.' },
  { icon: Users,  arabic: 'التمكين',  title: 'Empowerment',   body: 'Empowerment of scholars to share and connect.' },
  { icon: BookOpen, arabic: 'التعليم', title: 'Education',    body: 'Educational support rooted in Quran and Sunnah.' },
];

// ── Vision pillars ────────────────────────────────────────────────────
const VISION = [
  { arabic: 'مكتبة شاملة',  body: 'Comprehensive online library from past and present.' },
  { arabic: 'أمة متصلة',    body: 'Connected ummah of scholars and students.' },
  { arabic: 'حفظ التاريخ',  body: 'Preserving Islamic history and culture.' },
  { arabic: 'قوة المجتمع',  body: 'Strengthening the Muslim community.' },
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
        <div className="relative max-w-3xl mx-auto">
          <p className="font-arabic text-yellow-300 text-3xl mb-3">عن المكتبة</p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-500/60" />
            <span className="text-yellow-500 text-xl">&#10022;</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-500/60" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-6">
            About Caliphate Makhtaba
          </h1>
          <p className="text-white/70 text-base sm:text-lg font-body max-w-2xl mx-auto leading-relaxed">
            A dedicated online platform committed to preserving, promoting, and sharing
            the rich intellectual heritage of Islam — rooted in the historical legacy of
            the Sokoto Caliphate and other Islamic centres of knowledge.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/80 to-transparent" />
      </section>

      <div className="bg-parchment">
        <div className="max-w-4xl mx-auto px-4 py-14 space-y-16">

          {/* ── Who We Are ───────────────────────────────────────── */}
          <section className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="font-arabic text-gold-600 text-xl mb-1">من نحن</p>
              <h2 className="font-display text-ink-900 text-2xl tracking-wide">Who We Are</h2>
            </div>
            <div className="space-y-5 text-ink-600 font-body leading-relaxed text-base">
              <p>
                Caliphate Makhtaba is a dedicated online platform committed to preserving, promoting,
                and sharing the rich intellectual heritage of Islam. Rooted in the historical legacy
                of the Sokoto Caliphate and other Islamic centres of knowledge, we serve as a bridge
                between scholars, students, and the wider Muslim community.
              </p>
              <p>
                Our library houses a growing collection of books, manuscripts, audio lectures, video
                teachings, and other scholarly works from both past and present scholars. More than
                just a repository, Caliphate Makhtaba is a living knowledge hub — a place where
                scholars can engage with the ummah, announce public lectures, publish new works, and
                share beneficial reminders.
              </p>
              <p>
                We believe that Islamic knowledge is a trust{' '}
                <span className="font-arabic text-gold-700 text-lg">(أمانة)</span> that must be
                safeguarded, transmitted, and made accessible for generations to come. Through modern
                technology and traditional scholarship, we aim to make authentic Islamic knowledge
                available to anyone, anywhere, while honouring the contributions of those who
                dedicated their lives to the service of Islam.
              </p>
            </div>
          </section>

          <div className="divider-ornament text-xl">&#10022;</div>

          {/* ── Mission ──────────────────────────────────────────── */}
          <section>
            <div className="text-center mb-10">
              <p className="font-arabic text-gold-600 text-xl mb-1">رسالتنا</p>
              <h2 className="font-display text-ink-900 text-2xl tracking-wide mb-4">Our Mission</h2>
              <p className="text-ink-600 font-body text-base max-w-2xl mx-auto leading-relaxed">
                To collect, preserve, and disseminate authentic Islamic knowledge while empowering
                scholars to share their teachings with the global Muslim community.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {MISSION.map(({ icon: Icon, arabic, title, body }) => (
                <div key={title} className="card p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center flex-shrink-0 shadow-glow-gold">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-arabic text-gold-600 text-base leading-none mb-0.5">{arabic}</p>
                    <h3 className="font-display text-ink-900 text-sm tracking-wide mb-1">{title}</h3>
                    <p className="text-ink-500 font-body text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="divider-ornament text-xl">&#10022;</div>

          {/* ── Vision ───────────────────────────────────────────── */}
          <section>
            <div className="text-center mb-10">
              <p className="font-arabic text-gold-600 text-xl mb-1">رؤيتنا</p>
              <h2 className="font-display text-ink-900 text-2xl tracking-wide mb-4">Our Vision</h2>
              <p className="text-ink-600 font-body text-base max-w-2xl mx-auto leading-relaxed">
                To become the leading global digital hub for Islamic scholarship — uniting past
                wisdom with present voices and inspiring future generations.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {VISION.map(({ arabic, body }) => (
                <div key={arabic} className="card p-5 flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex-shrink-0 mt-2" />
                  <div>
                    <p className="font-arabic text-gold-600 text-lg leading-snug mb-1">{arabic}</p>
                    <p className="text-ink-500 font-body text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="divider-ornament text-xl">&#10022;</div>

          {/* ── Contributors ─────────────────────────────────────── */}
          <section>
            <div className="text-center mb-10">
              <p className="font-arabic text-gold-600 text-xl mb-1">المساهمون</p>
              <h2 className="font-display text-ink-900 text-2xl tracking-wide">Meet the Contributors</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {CONTRIBUTORS.map(({ name, role, image }) => (
                <div key={name} className="card p-5 text-center flex flex-col items-center gap-3">
                  {/* Avatar with gold ring */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 p-0.5 shadow-glow-gold flex-shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-emerald-900 to-ink-900 flex items-center justify-center">
                      <img
                        src={media(image)}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image not found
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
                        }}
                      />
                      <User
                        className="w-8 h-8 text-gold-400 opacity-70"
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-ink-900 text-xs sm:text-sm leading-snug">{name}</h3>
                    <p className="text-[11px] text-gold-600 font-body mt-1">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Stats ────────────────────────────────────────────── */}
          <section>
            <div
              className="relative rounded-2xl overflow-hidden p-8 text-center"
              style={{ background: 'linear-gradient(135deg, #14532d 0%, #0a1628 70%)' }}
            >
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4900f' fill-opacity='0.5'%3E%3Cpolygon points='30,2 34,20 52,14 40,28 56,38 37,36 34,54 26,38 8,44 18,30 4,20 22,22'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <p className="relative font-arabic text-yellow-300 text-2xl mb-6">مكتبة الخلافة</p>
              <div className="relative flex items-center justify-center gap-10 flex-wrap">
                {[
                  { value: '12+',  label: 'Books' },
                  { value: '6',    label: 'Scholars' },
                  { value: '100%', label: 'Free' },
                  { value: '∞',    label: 'Growing' },
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
