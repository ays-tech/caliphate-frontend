'use client';

import { useState } from 'react';
import { Mail, MessageSquare, BookPlus, AlertCircle, Send, CheckCircle } from 'lucide-react';

const REASONS = [
  { value: 'general',     label: 'General Enquiry' },
  { value: 'submit-book', label: 'Submit a Book / Manuscript' },
  { value: 'scholar',     label: 'Add a Scholar' },
  { value: 'correction',  label: 'Report an Error' },
  { value: 'technical',   label: 'Technical Issue' },
  { value: 'other',       label: 'Other' },
];

const CONTACTS = [
  {
    icon: Mail,
    arabic: 'البريد الإلكتروني',
    label: 'Email',
    value: 'contact@lo9in.com',
    href: 'mailto:contact@lo9in.com',
  },
  {
    icon: BookPlus,
    arabic: 'إضافة كتاب',
    label: 'Submit a Book',
    value: 'Use the form opposite to propose a new title for the library.',
    href: null,
  },
  {
    icon: AlertCircle,
    arabic: 'الإبلاغ عن خطأ',
    label: 'Report an Error',
    value: 'Found incorrect metadata or a broken file? Let us know via the form.',
    href: null,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', reason: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);

    // Mailto fallback — opens the user's email client with the form data
    // Replace with your own email API (Resend, Formspree, etc.) when ready
    try {
      const subject = encodeURIComponent(`[CaliphateMakhtaba] ${REASONS.find(r => r.value === form.reason)?.label || 'Enquiry'} — ${form.name}`);
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nReason: ${form.reason}\n\nMessage:\n${form.message}`
      );
      window.location.href = `mailto:contact@lo9in.com?subject=${subject}&body=${body}`;
      setTimeout(() => {
        setSent(true);
        setSending(false);
      }, 800);
    } catch {
      setError('Something went wrong. Please email us directly at contact@lo9in.com');
      setSending(false);
    }
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">
      {children}
    </label>
  );

  return (
    <div className="animate-fade-in">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white px-4 py-16 sm:py-20 text-center"
        style={{ background: 'linear-gradient(180deg, #060f1e 0%, #0a1a2e 60%, #0d2010 100%)' }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23d4900f' stroke-opacity='1' stroke-width='0.8'%3E%3Cpolygon points='40,4 76,22 76,58 40,76 4,58 4,22'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-xl mx-auto">
          <p className="font-arabic text-yellow-300 text-3xl mb-3">تواصل معنا</p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-500/60" />
            <span className="text-yellow-500 text-xl">&#10022;</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-500/60" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-4">
            Contact Us
          </h1>
          <p className="text-white/60 text-base font-body leading-relaxed">
            Whether you want to suggest a book, report an error, or simply say
            salaam — we would love to hear from you.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/80 to-transparent" />
      </section>

      <div className="bg-parchment">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <div className="grid md:grid-cols-5 gap-8">

            {/* ── Left — contact info ─────────────────────────────── */}
            <div className="md:col-span-2 space-y-5">
              <div>
                <p className="font-arabic text-gold-600 text-lg mb-0.5">وسائل التواصل</p>
                <h2 className="font-display text-ink-900 text-lg tracking-wide">Get in Touch</h2>
              </div>

              {CONTACTS.map(({ icon: Icon, arabic, label, value, href }) => (
                <div key={label} className="card p-4 flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center flex-shrink-0 shadow-glow-gold">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-arabic text-gold-600 text-sm leading-none mb-0.5">{arabic}</p>
                    <p className="font-display text-ink-900 text-xs tracking-wide mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="text-xs text-emerald-700 hover:text-emerald-900 font-body transition-colors break-all">
                        {value}
                      </a>
                    ) : (
                      <p className="text-xs text-ink-500 font-body leading-relaxed">{value}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Hadith */}
              <div className="card p-5 text-center border-l-4 border-gold-400">
                <p className="font-arabic text-gold-700 text-xl leading-relaxed mb-2">
                  وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ
                </p>
                <p className="text-ink-500 text-xs font-body italic">
                  "Cooperate with one another in goodness and piety."
                </p>
                <p className="text-gold-600 text-[10px] font-display tracking-widest mt-1">
                  — Al-Quran 5:2
                </p>
              </div>
            </div>

            {/* ── Right — contact form ────────────────────────────── */}
            <div className="md:col-span-3">
              <div className="card overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

                {sent ? (
                  /* Success state */
                  <div className="p-8 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="font-arabic text-gold-600 text-xl">جزاك الله خيراً</p>
                    <h3 className="font-display text-ink-900 text-lg tracking-wide">Message Sent</h3>
                    <p className="text-ink-500 font-body text-sm max-w-xs mx-auto leading-relaxed">
                      Your email client should have opened. If not, please email us directly at{' '}
                      <a href="mailto:contact@lo9in.com" className="text-emerald-700 hover:underline">
                        contact@lo9in.com
                      </a>
                    </p>
                    <button
                      onClick={() => { setSent(false); setForm({ name: '', email: '', reason: '', message: '' }); }}
                      className="btn-ghost text-xs py-2 px-5 mt-2"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Your Name *</Label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          placeholder="Full name"
                          className="input-islamic"
                        />
                      </div>
                      <div>
                        <Label>Email Address *</Label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                          placeholder="you@example.com"
                          className="input-islamic"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Reason for Contact *</Label>
                      <select
                        value={form.reason}
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        required
                        className="input-islamic"
                      >
                        <option value="">Select a reason…</option>
                        {REASONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Message *</Label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                        rows={6}
                        placeholder={
                          form.reason === 'submit-book'
                            ? 'Please include: book title, author, publication year, and a link or description of where we can find it…'
                            : form.reason === 'correction'
                            ? 'Please describe the error — which book or scholar it relates to, and what the correct information should be…'
                            : 'Write your message here…'
                        }
                        className="input-islamic resize-none"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 font-body text-xs leading-relaxed">{error}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-ink-400 font-body text-xs">
                        We aim to reply within 2–3 working days.
                      </p>
                      <button type="submit" disabled={sending} className="btn-gold py-2.5 px-6">
                        <Send className="w-4 h-4" />
                        {sending ? 'Opening…' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
