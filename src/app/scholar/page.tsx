'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { scholarsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  GraduationCap, CheckCircle, Clock, XCircle,
  Upload, AlertCircle, BookOpen, Users, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const BENEFITS = [
  { icon: BookOpen, text: 'Upload and publish your own books directly to the library' },
  { icon: Users,    text: 'Build your public scholar profile visible to the Ummah' },
  { icon: Star,     text: 'Track how many people read your works' },
  { icon: CheckCircle, text: 'Each book goes through moderation before going live' },
];

export default function ScholarApplyPage() {
  const { user }   = useAuth();
  const router     = useRouter();
  const picRef     = useRef<HTMLInputElement>(null);

  const [profile,  setProfile]  = useState<any | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [picFile,  setPicFile]  = useState<File | null>(null);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [form,     setForm]     = useState({ name: '', biography: '' });

  useEffect(() => {
    scholarsApi.getMyProfile()
      .then(r  => setProfile(r.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  // Pre-fill name from user account
  useEffect(() => {
    if (user?.name && !form.name) setForm(f => ({ ...f, name: user.name }));
  }, [user]);

  const handlePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5 MB'); return; }
    setPicFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      if (form.biography.trim()) fd.append('biography', form.biography.trim());
      if (picFile) fd.append('picture', picFile);
      const res = await scholarsApi.apply(fd);
      setProfile(res.data);
      toast.success('Application submitted! An admin will review it soon.');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to submit');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  // Already has a profile — show status
  if (profile) {
    const cfg = {
      PENDING:  { icon: Clock,       colour: 'text-amber-600',   bg: 'bg-amber-50  border-amber-200',   label: 'Application Under Review', msg: "Your application has been submitted and is awaiting admin review. You'll be notified once a decision has been made." },
      APPROVED: { icon: CheckCircle, colour: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Approved — Welcome!',       msg: 'Your scholar profile is live. You can now upload and submit books from your dashboard.' },
      REJECTED: { icon: XCircle,     colour: 'text-red-500',     bg: 'bg-red-50    border-red-200',     label: 'Application Rejected',      msg: profile.reviewNote || 'Your application was not approved. You may re-apply with updated information.' },
    }[profile.claimStatus as string];

    if (!cfg) return null;
    const Icon = cfg.icon;

    return (
      <div className="max-w-lg mx-auto px-4 py-16 animate-fade-in">
        <div className={`rounded-2xl border p-6 ${cfg.bg}`}>
          <div className="flex items-center gap-3 mb-4">
            <Icon className={`w-6 h-6 ${cfg.colour}`} />
            <h1 className="font-display text-ink-900 text-lg tracking-wide">{cfg.label}</h1>
          </div>
          <p className="text-ink-600 font-body text-sm leading-relaxed mb-5">{cfg.msg}</p>

          <div className="bg-white rounded-xl p-4 flex items-center gap-3 mb-5">
            {profile.pictureUrl && (
              <img src={profile.pictureUrl} alt={profile.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            )}
            <div>
              <p className="font-display text-ink-900 text-sm">{profile.name}</p>
              {profile.biography && (
                <p className="text-ink-500 font-body text-xs mt-0.5 line-clamp-2">{profile.biography}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {profile.claimStatus === 'APPROVED' && (
              <Link href="/scholar/dashboard" className="btn-gold text-xs py-2.5 px-5">
                Go to Dashboard
              </Link>
            )}
            {profile.claimStatus === 'REJECTED' && (
              <button onClick={() => setProfile(null)} className="btn-ghost text-xs py-2.5 px-5">
                Re-apply
              </button>
            )}
            <Link href="/" className="btn-ghost text-xs py-2.5 px-5">Back to Library</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-10">

        {/* Left — info */}
        <div>
          <p className="font-arabic text-gold-600 text-2xl mb-1">انضم كعالم</p>
          <h1 className="font-display text-ink-900 text-3xl tracking-wide mb-4 leading-tight">
            Become a Scholar
          </h1>
          <p className="text-ink-600 font-body leading-relaxed mb-8">
            CaliphateMakhtaba is a library of Islamic scholarship. If you are a scholar,
            researcher, or student of knowledge — apply to get your own profile and
            start sharing your works with the global Muslim community.
          </p>

          <div className="space-y-4 mb-8">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-700
                  flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-ink-600 font-body text-sm leading-relaxed mt-1">{text}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 font-body text-xs leading-relaxed">
                Applications are reviewed by admins within 1–3 business days.
                All uploaded books still go through a separate moderation step before
                appearing publicly.
              </p>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <GraduationCap className="w-4 h-4 text-gold-600" />
              <h2 className="font-display text-ink-900 text-sm tracking-wide">Scholar Application</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo */}
              <div className="flex items-center gap-4">
                <div
                  onClick={() => picRef.current?.click()}
                  className="w-16 h-16 rounded-full flex-shrink-0 bg-gradient-to-br from-gold-400
                    to-gold-700 p-0.5 cursor-pointer"
                >
                  <div className="w-full h-full rounded-full bg-ink-100 overflow-hidden
                    flex items-center justify-center">
                    {preview
                      ? <img src={preview} alt="Photo" className="w-full h-full object-cover" />
                      : <GraduationCap className="w-7 h-7 text-ink-400" />
                    }
                  </div>
                </div>
                <div className="flex-1">
                  <input ref={picRef} type="file" accept="image/jpeg,image/png,image/webp"
                    onChange={handlePic} className="hidden" />
                  <button type="button" onClick={() => picRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs bg-gold-50 text-gold-700
                      border border-gold-200 px-3 py-2 rounded-lg hover:bg-gold-100
                      transition-colors font-body w-full justify-center mb-1">
                    <Upload className="w-3.5 h-3.5" />
                    {preview ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  <p className="text-[11px] text-ink-400 font-body text-center">
                    JPEG · PNG · WEBP · max 5 MB
                  </p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">
                  Your Scholar Name *
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Sheikh Abdullahi Usman"
                  className="input-islamic"
                />
                <p className="text-[11px] text-ink-400 font-body mt-1">
                  This will be your public name on the library
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">
                  Biography{' '}
                  <span className="text-ink-400 normal-case font-body tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={form.biography}
                  onChange={e => setForm({ ...form, biography: e.target.value })}
                  rows={5}
                  placeholder="Tell us about yourself — your area of study, qualifications, notable works, institution…"
                  className="input-islamic resize-none"
                  maxLength={2000}
                />
                <p className="text-[11px] text-ink-400 font-body mt-1 text-right">
                  {form.biography.length}/2000
                </p>
              </div>

              {!user && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3
                  text-xs text-amber-700 font-body">
                  Please{' '}
                  <Link href="/auth/login" className="underline font-semibold">sign in</Link>
                  {' '}before applying.
                </div>
              )}

              <button type="submit" disabled={saving || !user} className="btn-gold w-full py-3">
                <GraduationCap className="w-4 h-4" />
                {saving ? 'Submitting…' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
