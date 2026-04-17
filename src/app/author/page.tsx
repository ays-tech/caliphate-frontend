'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authorApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PenLine, User, CheckCircle, Clock, XCircle, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const BENEFITS = [
  'Upload and publish your own books directly',
  'Track reads and engagement on your works',
  'Build your public author profile',
  'Connect with scholars and the wider Ummah',
];

export default function AuthorApplyPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const [profile, setProfile]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [avatar,  setAvatar]    = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [form,    setForm]      = useState({ penName: '', bio: '' });

  useEffect(() => {
    authorApi.getMe()
      .then(r => setProfile(r.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Avatar must be under 5 MB'); return; }
    setAvatar(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.penName.trim()) { toast.error('Pen name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('penName', form.penName.trim());
      if (form.bio.trim()) fd.append('bio', form.bio.trim());
      if (avatar) fd.append('avatar', avatar);
      const res = await authorApi.apply(fd);
      setProfile(res.data);
      toast.success('Application submitted! An admin will review it soon.');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to submit application');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  // Already has a profile — show status
  if (profile) {
    const statusConfig = {
      PENDING:  { icon: Clock,         color: 'text-amber-600',  bg: 'bg-amber-50  border-amber-200',  label: 'Under Review',  msg: 'Your application has been submitted and is awaiting admin review. We\'ll notify you once a decision has been made.' },
      APPROVED: { icon: CheckCircle,   color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Approved!',   msg: 'Your author profile is approved. You can now upload and submit books for publication.' },
      REJECTED: { icon: XCircle,       color: 'text-red-600',    bg: 'bg-red-50    border-red-200',     label: 'Rejected',    msg: profile.reviewNote || 'Your application was not approved. You may re-apply with updated information.' },
    }[profile.status as string] || { icon: Clock, color: 'text-ink-500', bg: 'bg-ink-50 border-ink-200', label: profile.status, msg: '' };

    const Icon = statusConfig.icon;

    return (
      <div className="max-w-xl mx-auto px-4 py-12 animate-fade-in">
        <div className={`rounded-2xl border p-6 ${statusConfig.bg}`}>
          <div className="flex items-center gap-3 mb-4">
            <Icon className={`w-6 h-6 ${statusConfig.color}`} />
            <h1 className="font-display text-ink-900 text-lg tracking-wide">{statusConfig.label}</h1>
          </div>
          <p className="text-ink-600 font-body text-sm leading-relaxed mb-4">{statusConfig.msg}</p>
          <div className="bg-white rounded-xl p-4 mb-4">
            <p className="text-xs font-display text-ink-500 tracking-widest uppercase mb-2">Your Profile</p>
            <p className="font-display text-ink-900 text-sm">{profile.penName}</p>
            {profile.bio && <p className="text-ink-500 font-body text-xs mt-1">{profile.bio}</p>}
          </div>
          <div className="flex gap-3">
            {profile.status === 'APPROVED' && (
              <Link href="/author/dashboard" className="btn-gold text-xs py-2.5 px-5">
                Go to Dashboard
              </Link>
            )}
            {profile.status === 'REJECTED' && (
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
      <div className="grid md:grid-cols-2 gap-8">

        {/* Left — info */}
        <div>
          <p className="font-arabic text-gold-600 text-xl mb-1">انضم كمؤلف</p>
          <h1 className="font-display text-ink-900 text-2xl tracking-wide mb-4">Become an Author</h1>
          <p className="text-ink-600 font-body leading-relaxed mb-6">
            Share your knowledge with the global Muslim community. Apply to become a verified author on CaliphateMakhtaba and upload your own scholarly works.
          </p>
          <div className="space-y-3 mb-6">
            {BENEFITS.map(b => (
              <div key={b} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-ink-600 font-body text-sm">{b}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 font-body text-xs leading-relaxed">
                Applications are reviewed by admins within 1–3 business days. All uploaded books still go through a moderation process before being published.
              </p>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 p-0.5 flex-shrink-0 cursor-pointer"
                onClick={() => document.getElementById('avatar-input')?.click()}>
                <div className="w-full h-full rounded-full bg-ink-100 overflow-hidden flex items-center justify-center">
                  {preview
                    ? <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                    : <User className="w-7 h-7 text-ink-400" />
                  }
                </div>
              </div>
              <div>
                <input id="avatar-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatar} className="hidden" />
                <button type="button" onClick={() => document.getElementById('avatar-input')?.click()}
                  className="flex items-center gap-1.5 text-xs bg-gold-50 text-gold-700 border border-gold-200 px-3 py-2 rounded-lg hover:bg-gold-100 transition-colors font-body">
                  <Upload className="w-3.5 h-3.5" /> Upload Photo
                </button>
                <p className="text-[11px] text-ink-400 font-body mt-1">JPEG, PNG, WEBP · max 5 MB</p>
              </div>
            </div>

            <div>
              <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">Pen Name *</label>
              <input
                value={form.penName}
                onChange={e => setForm({ ...form, penName: e.target.value })}
                required placeholder="Name you publish under"
                className="input-islamic"
              />
              <p className="text-[11px] text-ink-400 font-body mt-1">This is how your name will appear on your books</p>
            </div>

            <div>
              <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">Bio <span className="text-ink-400 normal-case font-body tracking-normal">(optional)</span></label>
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                rows={4}
                placeholder="Tell us about yourself — your background, area of specialisation, works…"
                className="input-islamic resize-none"
                maxLength={1000}
              />
              <p className="text-[11px] text-ink-400 font-body mt-1 text-right">{form.bio.length}/1000</p>
            </div>

            {!user && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-body">
                Please <Link href="/auth/login" className="underline">sign in</Link> before applying.
              </div>
            )}

            <button type="submit" disabled={saving || !user} className="btn-gold w-full py-3">
              <PenLine className="w-4 h-4" />
              {saving ? 'Submitting…' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
