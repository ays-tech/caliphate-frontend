'use client';

import { useEffect, useState, useRef } from 'react';
import { scholarsApi } from '@/lib/api';
import {
  Plus, Trash2, Edit2, X, CheckCircle, XCircle,
  Clock, GraduationCap, ChevronDown, ChevronUp, Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'scholars' | 'applications';
type AppStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ── Shared Modal ──────────────────────────────────────────────────────
function Modal({ title, onClose, children }: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm flex items-end
      sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-up">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
          <h2 className="font-display text-ink-900 text-sm tracking-wide">{title}</h2>
          <button onClick={onClose}
            className="text-ink-400 hover:text-ink-600 p-1.5 rounded-lg hover:bg-ink-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">
    {children}
  </label>
);

const APP_TABS: { label: string; value: AppStatus }[] = [
  { label: 'Pending',  value: 'PENDING'  },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function AdminScholarsPage() {
  const [tab,          setTab]          = useState<Tab>('scholars');
  const [scholars,     setScholars]     = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [appTab,       setAppTab]       = useState<AppStatus>('PENDING');
  const [appStats,     setAppStats]     = useState<any>(null);
  const [loading,      setLoading]      = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [editing,    setEditing]    = useState<any | null>(null);
  const [form,       setForm]       = useState({ name: '', biography: '' });
  const [picFile,    setPicFile]    = useState<File | null>(null);
  const [preview,    setPreview]    = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [acting,     setActing]     = useState<string | null>(null);
  const [notes,      setNotes]      = useState<Record<string, string>>({});
  const [expanded,   setExpanded]   = useState<string | null>(null);

  const picRef = useRef<HTMLInputElement>(null);

  const fetchScholars = async () => {
    setLoading(true);
    try { setScholars((await scholarsApi.getAll()).data); }
    catch { toast.error('Failed to load scholars'); }
    finally { setLoading(false); }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([
        scholarsApi.listApplications(appTab),
        scholarsApi.getApplicationStats(),
      ]);
      setApplications(aRes.data);
      setAppStats(sRes.data);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'scholars')     fetchScholars();
    if (tab === 'applications') fetchApplications();
  }, [tab, appTab]);

  const handlePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Max 5 MB'); return; }
    setPicFile(f); setPreview(URL.createObjectURL(f));
  };

  const openCreate = () => {
    setEditing(null); setForm({ name: '', biography: '' });
    setPicFile(null); setPreview(null); setShowCreate(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name || '', biography: s.biography || '' });
    setPicFile(null); setPreview(null); setShowCreate(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      if (form.biography.trim()) fd.append('biography', form.biography.trim());
      if (picFile) fd.append('picture', picFile);
      if (editing) {
        await scholarsApi.update(editing.id, fd);
        toast.success('Scholar updated');
      } else {
        await scholarsApi.create(fd);
        toast.success('Scholar created');
      }
      setShowCreate(false); fetchScholars();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? All their books will also be deleted.`)) return;
    try { await scholarsApi.delete(id); toast.success('Deleted'); fetchScholars(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to delete'); }
  };

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Approve "${name}" as a scholar? Their role will be updated.`)) return;
    setActing(id);
    try {
      await scholarsApi.approveApplication(id, notes[id]);
      toast.success(`${name} approved!`);
      fetchApplications();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally { setActing(null); }
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm(`Reject "${name}"'s application?`)) return;
    setActing(id);
    try {
      await scholarsApi.rejectApplication(id, notes[id]);
      toast.success('Application rejected');
      fetchApplications();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally { setActing(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-arabic text-gold-600 text-lg">إدارة العلماء</p>
          <h1 className="font-display text-ink-900 text-xl tracking-wide">Scholars</h1>
        </div>
        {tab === 'scholars' && (
          <button onClick={openCreate} className="btn-gold text-xs py-2.5 px-4">
            <Plus className="w-3.5 h-3.5" /> Add Scholar
          </button>
        )}
      </div>

      {/* Main tabs */}
      <div className="flex gap-1 bg-ink-100 rounded-xl p-1 w-fit">
        {[
          { value: 'scholars',     label: 'All Scholars' },
          { value: 'applications', label: `Applications${appStats?.pending ? ` (${appStats.pending})` : ''}` },
        ].map(t => (
          <button key={t.value} onClick={() => setTab(t.value as Tab)}
            className={`px-4 py-2 rounded-lg text-xs font-display tracking-wide transition-all ${
              tab === t.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SCHOLARS TAB ──────────────────────────────────────────────── */}
      {tab === 'scholars' && (
        <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16" />)}
            </div>
          ) : scholars.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="w-8 h-8 text-ink-200 mx-auto mb-2" />
              <p className="text-ink-400 font-body text-sm">No scholars yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-ink-50 border-b border-ink-100">
                  <tr>
                    {['', 'Name', 'Books', 'Account', ''].map((h, i) => (
                      <th key={i} className="text-left px-4 py-3 font-display text-ink-500
                        text-xs tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {scholars.map((s: any) => (
                    <tr key={s.id} className="hover:bg-ink-50 transition-colors">
                      <td className="px-4 py-3 w-10">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br
                          from-gold-400 to-gold-700 flex items-center justify-center flex-shrink-0">
                          {s.pictureUrl
                            ? <img src={s.pictureUrl} alt={s.name}
                                className="w-full h-full object-cover" loading="lazy" />
                            : <span className="text-white text-sm font-display">
                                {s.name?.[0]}
                              </span>
                          }
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-body font-medium text-ink-800">{s.name}</p>
                        {s.biography && (
                          <p className="text-ink-400 text-xs truncate max-w-[200px]">
                            {s.biography}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-500 font-body text-xs">
                        {s._count?.books || 0}
                      </td>
                      <td className="px-4 py-3">
                        {s.userId ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-body
                            px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3" />
                            {s.claimStatus === 'APPROVED' ? 'Linked' : s.claimStatus}
                          </span>
                        ) : (
                          <span className="text-[11px] text-ink-400 font-body">Historical</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(s)}
                            className="p-1.5 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(s.id, s.name)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── APPLICATIONS TAB ─────────────────────────────────────────── */}
      {tab === 'applications' && (
        <div className="space-y-4">
          {/* Stats */}
          {appStats && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total',    value: appStats.total,    colour: 'text-ink-700' },
                { label: 'Pending',  value: appStats.pending,  colour: 'text-amber-600' },
                { label: 'Approved', value: appStats.approved, colour: 'text-emerald-600' },
                { label: 'Rejected', value: appStats.rejected, colour: 'text-red-500' },
              ].map(({ label, value, colour }) => (
                <div key={label} className="card p-4 text-center">
                  <p className={`font-display text-2xl leading-none ${colour}`}>{value}</p>
                  <p className="text-ink-400 font-body text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* App status tabs */}
          <div className="flex gap-1 bg-ink-100 rounded-xl p-1 w-fit">
            {APP_TABS.map(t => (
              <button key={t.value} onClick={() => setAppTab(t.value)}
                className={`px-4 py-2 rounded-lg text-xs font-display tracking-wide transition-all ${
                  appTab === t.value
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Applications list */}
          <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20" />)}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="w-8 h-8 text-ink-200 mx-auto mb-2" />
                <p className="text-ink-400 font-body text-sm">
                  No {appTab.toLowerCase()} applications
                </p>
              </div>
            ) : (
              <div className="divide-y divide-ink-50">
                {applications.map((a: any) => {
                  const isExp = expanded === a.id;
                  return (
                    <div key={a.id} className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Photo */}
                        <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gradient-to-br
                          from-gold-400 to-gold-700 p-0.5">
                          <div className="w-full h-full rounded-full overflow-hidden bg-ink-900
                            flex items-center justify-center">
                            {a.pictureUrl
                              ? <img src={a.pictureUrl} alt={a.name}
                                  className="w-full h-full object-cover" />
                              : <GraduationCap className="w-5 h-5 text-gold-400 opacity-70" />
                            }
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-display text-ink-900 text-sm tracking-wide">
                              {a.name}
                            </p>
                            <span className="text-ink-400 text-xs">·</span>
                            <p className="text-ink-500 font-body text-xs">
                              {a.user?.name} ({a.user?.email})
                            </p>
                          </div>
                          {a.biography && (
                            <p className="text-ink-500 font-body text-xs mt-1 line-clamp-2">
                              {a.biography}
                            </p>
                          )}
                          <p className="text-ink-400 font-body text-[10px] mt-1">
                            Applied {new Date(a.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                          {a.reviewNote && (
                            <p className="text-xs text-ink-500 font-body mt-1 italic">
                              Note: {a.reviewNote}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {appTab === 'PENDING' && (
                            <>
                              <button onClick={() => handleApprove(a.id, a.name)}
                                disabled={acting === a.id}
                                className="flex items-center gap-1 text-xs bg-emerald-50
                                  text-emerald-700 border border-emerald-100 px-2.5 py-1.5
                                  rounded-lg hover:bg-emerald-100 transition-colors font-body">
                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button onClick={() => handleReject(a.id, a.name)}
                                disabled={acting === a.id}
                                className="flex items-center gap-1 text-xs bg-red-50 text-red-600
                                  border border-red-100 px-2.5 py-1.5 rounded-lg
                                  hover:bg-red-100 transition-colors font-body">
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setExpanded(isExp ? null : a.id)}
                            className="p-1.5 text-ink-400 hover:text-ink-600 hover:bg-ink-100
                              rounded-lg transition-colors">
                            {isExp
                              ? <ChevronUp className="w-4 h-4" />
                              : <ChevronDown className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </div>

                      {/* Review note input */}
                      {isExp && appTab === 'PENDING' && (
                        <div className="mt-4 pt-4 border-t border-ink-100">
                          <Label>
                            Review Note{' '}
                            <span className="text-ink-400 normal-case font-body tracking-normal">
                              (optional — shown to applicant)
                            </span>
                          </Label>
                          <textarea
                            value={notes[a.id] || ''}
                            onChange={e => setNotes({ ...notes, [a.id]: e.target.value })}
                            rows={2}
                            placeholder="Add a note for the applicant…"
                            className="input-islamic resize-none text-sm"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreate && (
        <Modal
          title={editing ? `Edit — ${editing.name}` : 'Add Scholar'}
          onClose={() => setShowCreate(false)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            {/* Photo */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0
                bg-ink-100 flex items-center justify-center cursor-pointer"
                onClick={() => picRef.current?.click()}>
                {preview
                  ? <img src={preview} alt="" className="w-full h-full object-cover" />
                  : editing?.pictureUrl
                    ? <img src={editing.pictureUrl} alt=""
                        className="w-full h-full object-cover" />
                    : <GraduationCap className="w-7 h-7 text-ink-400" />
                }
              </div>
              <div>
                <input ref={picRef} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handlePic} className="hidden" />
                <button type="button" onClick={() => picRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs bg-gold-50 text-gold-700
                    border border-gold-200 px-3 py-1.5 rounded-lg hover:bg-gold-100
                    transition-colors font-body">
                  <Upload className="w-3 h-3" />
                  {editing?.pictureUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
              </div>
            </div>

            <div>
              <Label>Name *</Label>
              <input value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required placeholder="Scholar's full name" className="input-islamic" />
            </div>

            <div>
              <Label>Biography</Label>
              <textarea value={form.biography}
                onChange={e => setForm({ ...form, biography: e.target.value })}
                rows={4} placeholder="Brief biography…"
                className="input-islamic resize-none" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowCreate(false)}
                className="btn-ghost flex-1 py-2.5">Cancel</button>
              <button type="submit" disabled={saving}
                className="btn-gold flex-1 py-2.5">
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Scholar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
