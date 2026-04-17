'use client';

import { useEffect, useState } from 'react';
import { authorApi } from '@/lib/api';
import { CheckCircle, XCircle, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

type AuthorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

const TABS: { label: string; value: AuthorStatus }[] = [
  { label: 'Pending',  value: 'PENDING'  },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [stats,   setStats]   = useState<any>(null);
  const [tab,     setTab]     = useState<AuthorStatus>('PENDING');
  const [loading, setLoading] = useState(true);
  const [notes,   setNotes]   = useState<Record<string, string>>({});
  const [expanded,setExpanded]= useState<string | null>(null);
  const [acting,  setActing]  = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([
        authorApi.listPending(tab),
        authorApi.getStats(),
      ]);
      setAuthors(aRes.data);
      setStats(sRes.data);
    } catch { toast.error('Failed to load author applications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Approve "${name}" as an author? Their role will be updated to AUTHOR.`)) return;
    setActing(id);
    try {
      await authorApi.approve(id, notes[id]);
      toast.success(`${name} approved as author!`);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    } finally { setActing(null); }
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm(`Reject "${name}"'s application?`)) return;
    setActing(id);
    try {
      await authorApi.reject(id, notes[id]);
      toast.success('Application rejected');
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    } finally { setActing(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <p className="font-arabic text-gold-600 text-lg">إدارة المؤلفين</p>
        <h1 className="font-display text-ink-900 text-xl tracking-wide">Author Applications</h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total',    value: stats.total,    color: 'text-ink-700' },
            { label: 'Pending',  value: stats.pending,  color: 'text-amber-600' },
            { label: 'Approved', value: stats.approved, color: 'text-emerald-600' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center">
              <p className={`font-display text-2xl leading-none ${color}`}>{value}</p>
              <p className="text-ink-400 font-body text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-ink-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-lg text-xs font-display tracking-wide transition-all ${
              tab === t.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}>
            {t.label}
            {stats && t.value === 'PENDING' && stats.pending > 0 && (
              <span className="ml-1.5 bg-gold-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{stats.pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

        {loading ? (
          <div className="p-5 space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-20" />)}</div>
        ) : authors.length === 0 ? (
          <div className="text-center py-16">
            <User className="w-8 h-8 text-ink-200 mx-auto mb-2" />
            <p className="text-ink-400 font-body text-sm">No {tab.toLowerCase()} applications</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-50">
            {authors.map((author: any) => {
              const isExpanded = expanded === author.id;
              return (
                <div key={author.id} className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gradient-to-br from-gold-400 to-gold-700 p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden bg-ink-900 flex items-center justify-center">
                        {author.avatarUrl
                          ? <img src={author.avatarUrl} alt={author.penName} className="w-full h-full object-cover" />
                          : <User className="w-5 h-5 text-gold-400 opacity-70" />
                        }
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display text-ink-900 text-sm tracking-wide">{author.penName}</p>
                        <span className="text-ink-400 font-body text-xs">·</span>
                        <p className="text-ink-500 font-body text-xs">{author.user?.name} ({author.user?.email})</p>
                      </div>
                      {author.bio && (
                        <p className="text-ink-500 font-body text-xs mt-1 line-clamp-2">{author.bio}</p>
                      )}
                      <p className="text-ink-400 font-body text-[10px] mt-1">
                        Applied {new Date(author.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {author.reviewNote && (
                        <p className="text-xs text-ink-500 font-body mt-1 italic">Note: {author.reviewNote}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {tab === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(author.id, author.penName)} disabled={acting === author.id}
                            className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors font-body">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => handleReject(author.id, author.penName)} disabled={acting === author.id}
                            className="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-100 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-body">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => setExpanded(isExpanded ? null : author.id)}
                        className="p-1.5 text-ink-400 hover:text-ink-600 hover:bg-ink-100 rounded-lg transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded: note input */}
                  {isExpanded && tab === 'PENDING' && (
                    <div className="mt-4 pt-4 border-t border-ink-100">
                      <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">
                        Review Note <span className="text-ink-400 normal-case font-body tracking-normal">(optional — shown to applicant)</span>
                      </label>
                      <textarea
                        value={notes[author.id] || ''}
                        onChange={e => setNotes({ ...notes, [author.id]: e.target.value })}
                        rows={2}
                        placeholder="Add a note for the applicant (e.g. reason for rejection, or welcome message)…"
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
  );
}
