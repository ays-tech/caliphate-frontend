'use client';

import { useEffect, useState, useRef } from 'react';
import { scholarsApi, booksApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Send, Clock, CheckCircle, XCircle,
  FileText, AlertCircle, GraduationCap, Upload,
  Edit2, Save, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CFG: Record<string, { label: string; icon: any; colour: string; bg: string }> = {
  DRAFT:    { label: 'Draft',    icon: FileText,    colour: 'text-ink-500',     bg: 'bg-ink-100' },
  PENDING:  { label: 'Pending',  icon: Clock,       colour: 'text-amber-600',   bg: 'bg-amber-100' },
  APPROVED: { label: 'Approved', icon: CheckCircle, colour: 'text-emerald-600', bg: 'bg-emerald-100' },
  REJECTED: { label: 'Rejected', icon: XCircle,     colour: 'text-red-500',     bg: 'bg-red-100' },
};

export default function ScholarDashboardPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const picRef   = useRef<HTMLInputElement>(null);

  const [profile,    setProfile]    = useState<any>(null);
  const [books,      setBooks]      = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [editing,    setEditing]    = useState(false);
  const [editForm,   setEditForm]   = useState({ name: '', biography: '' });
  const [editPic,    setEditPic]    = useState<File | null>(null);
  const [editPreview,setEditPreview]= useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadData = async () => {
    try {
      const [pRes, bRes] = await Promise.all([
        scholarsApi.getMyProfile(),
        booksApi.getMyBooks(),
      ]);
      setProfile(pRes.data);
      setBooks(bRes.data);
    } catch {
      // profile not found → redirect to apply page
      router.push('/scholar');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    loadData();
  }, [user]);

  const startEdit = () => {
    setEditForm({ name: profile.name || '', biography: profile.biography || '' });
    setEditPreview(null);
    setEditPic(null);
    setEditing(true);
  };

  const handleEditPic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5 MB'); return; }
    setEditPic(f);
    setEditPreview(URL.createObjectURL(f));
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const fd = new FormData();
      if (editForm.name.trim())      fd.append('name',      editForm.name.trim());
      if (editForm.biography.trim()) fd.append('biography', editForm.biography.trim());
      if (editPic)                   fd.append('picture',   editPic);
      const res = await scholarsApi.updateMyProfile(fd);
      setProfile(res.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to update');
    } finally { setSavingEdit(false); }
  };

  const handleSubmit = async (bookId: string, title: string) => {
    if (!confirm(`Submit "${title}" for review?`)) return;
    setSubmitting(bookId);
    try {
      await booksApi.submit(bookId);
      toast.success('Book submitted for review!');
      const res = await booksApi.getMyBooks();
      setBooks(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to submit');
    } finally { setSubmitting(null); }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="skeleton h-20 rounded-2xl" />
      ))}
    </div>
  );

  if (!profile) return null;

  // Not yet approved
  if (profile.claimStatus !== 'APPROVED') {
    const isPending = profile.claimStatus === 'PENDING';
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        {isPending
          ? <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          : <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        }
        <h1 className="font-display text-ink-900 text-xl tracking-wide mb-3">
          {isPending ? 'Application Under Review' : 'Application Rejected'}
        </h1>
        <p className="text-ink-500 font-body text-sm mb-6">
          {isPending
            ? "Your scholar application is being reviewed by our admins. You'll receive a notification once approved."
            : profile.reviewNote || 'Your application was not approved.'}
        </p>
        {!isPending && (
          <Link href="/scholar" className="btn-gold text-sm">Re-apply</Link>
        )}
      </div>
    );
  }

  const counts = {
    draft:    books.filter(b => b.status === 'DRAFT').length,
    pending:  books.filter(b => b.status === 'PENDING').length,
    approved: books.filter(b => b.status === 'APPROVED').length,
    rejected: books.filter(b => b.status === 'REJECTED').length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-arabic text-gold-600 text-xl mb-1">لوحة العالم</p>
          <h1 className="font-display text-ink-900 text-2xl tracking-wide">
            Scholar Dashboard
          </h1>
        </div>
        <Link href="/admin/books" className="btn-gold text-xs py-2.5 px-4">
          <BookOpen className="w-3.5 h-3.5" /> Upload Book
        </Link>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden mb-6">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

        {!editing ? (
          <div className="p-5 flex items-start gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br
              from-gold-400 to-gold-700 p-0.5">
              <div className="w-full h-full rounded-full overflow-hidden bg-ink-100
                flex items-center justify-center">
                {profile.pictureUrl
                  ? <img src={profile.pictureUrl} alt={profile.name}
                      className="w-full h-full object-cover" />
                  : <GraduationCap className="w-8 h-8 text-ink-400" />
                }
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-ink-900 text-base tracking-wide">
                {profile.name}
              </h2>
              {profile.biography && (
                <p className="text-ink-500 font-body text-sm mt-1 leading-relaxed line-clamp-3">
                  {profile.biography}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-body
                  px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle className="w-3 h-3" /> Approved Scholar
                </span>
                <Link href={`/scholars/${profile.id}`}
                  className="text-[11px] text-gold-600 hover:text-gold-800 font-body underline">
                  View public profile
                </Link>
              </div>
            </div>
            <button onClick={startEdit}
              className="flex items-center gap-1.5 text-xs btn-ghost py-2 px-3 flex-shrink-0">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        ) : (
          /* Edit mode */
          <form onSubmit={saveEdit} className="p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-display text-ink-900 text-sm tracking-wide">
                Edit Profile
              </h3>
              <button type="button" onClick={() => setEditing(false)}
                className="ml-auto text-ink-400 hover:text-ink-600 p-1 rounded-lg
                  hover:bg-ink-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0
                bg-ink-100 flex items-center justify-center cursor-pointer"
                onClick={() => picRef.current?.click()}>
                {editPreview || profile.pictureUrl
                  ? <img src={editPreview || profile.pictureUrl} alt=""
                      className="w-full h-full object-cover" />
                  : <GraduationCap className="w-7 h-7 text-ink-400" />
                }
              </div>
              <div>
                <input ref={picRef} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handleEditPic} className="hidden" />
                <button type="button" onClick={() => picRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs bg-gold-50 text-gold-700
                    border border-gold-200 px-3 py-1.5 rounded-lg hover:bg-gold-100
                    transition-colors font-body">
                  <Upload className="w-3 h-3" /> Change Photo
                </button>
              </div>
            </div>

            <div>
              <label className="block font-display text-ink-600 text-[10px] tracking-widest
                mb-1.5 uppercase">Name</label>
              <input value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="input-islamic" />
            </div>

            <div>
              <label className="block font-display text-ink-600 text-[10px] tracking-widest
                mb-1.5 uppercase">Biography</label>
              <textarea value={editForm.biography}
                onChange={e => setEditForm({ ...editForm, biography: e.target.value })}
                rows={4} className="input-islamic resize-none" maxLength={2000} />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(false)}
                className="btn-ghost flex-1 py-2.5">Cancel</button>
              <button type="submit" disabled={savingEdit}
                className="btn-gold flex-1 py-2.5">
                <Save className="w-3.5 h-3.5" />
                {savingEdit ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Drafts',   value: counts.draft,    colour: 'text-ink-700' },
          { label: 'Pending',  value: counts.pending,  colour: 'text-amber-600' },
          { label: 'Live',     value: counts.approved, colour: 'text-emerald-600' },
          { label: 'Rejected', value: counts.rejected, colour: 'text-red-500' },
        ].map(({ label, value, colour }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`font-display text-2xl leading-none ${colour}`}>{value}</p>
            <p className="text-ink-400 font-body text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Books */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
          <h2 className="font-display text-ink-900 text-sm tracking-wide">My Books</h2>
          <span className="text-ink-400 text-xs font-body">{books.length} total</span>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-8 h-8 text-ink-200 mx-auto mb-2" />
            <p className="text-ink-400 font-body text-sm">No books yet.</p>
            <Link href="/admin/books"
              className="btn-ghost text-xs mt-4 inline-flex">
              Upload your first book
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ink-50">
            {books.map((book: any) => {
              const cfg  = STATUS_CFG[book.status] || STATUS_CFG.DRAFT;
              const Icon = cfg.icon;
              return (
                <div key={book.id}
                  className="px-5 py-4 flex items-start gap-4 hover:bg-ink-50 transition-colors">
                  <div className="w-10 h-12 rounded-lg overflow-hidden flex-shrink-0
                    bg-gradient-to-br from-emerald-900 to-ink-900
                    flex items-center justify-center">
                    {book.coverUrl
                      ? <img src={book.coverUrl} alt={book.title}
                          className="w-full h-full object-cover" loading="lazy" />
                      : <BookOpen className="w-4 h-4 text-gold-400 opacity-60" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-display text-ink-900 text-sm truncate">
                      {book.title}
                    </p>
                    <p className="text-ink-400 font-body text-xs mt-0.5">
                      {book._count?.volumes || 0} volume(s)
                    </p>

                    {book.status === 'REJECTED' && book.reviewNote && (
                      <div className="flex items-start gap-1.5 mt-1.5 bg-red-50
                        rounded-lg px-2.5 py-1.5">
                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-[11px] font-body">
                          {book.reviewNote}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-body
                      px-2 py-1 rounded-full ${cfg.bg} ${cfg.colour}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>

                    {book.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSubmit(book.id, book.title)}
                        disabled={submitting === book.id}
                        className="flex items-center gap-1 text-xs bg-emerald-50
                          text-emerald-700 border border-emerald-100 px-2.5 py-1.5
                          rounded-lg hover:bg-emerald-100 transition-colors font-body"
                      >
                        <Send className="w-3 h-3" />
                        {submitting === book.id ? '…' : 'Submit'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
