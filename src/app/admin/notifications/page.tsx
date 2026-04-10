'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Bell, Send, Users, CheckCircle, AlertCircle, Loader2, BookOpen, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const QUICK_TEMPLATES = [
  {
    icon: BookOpen,
    label: 'New Book Available',
    title: '📚 New Book — CaliphateMakhtaba',
    message: 'A new book has been added to the library. Tap to explore our latest addition.',
    url: '/books',
  },
  {
    icon: Calendar,
    label: 'Upcoming Event',
    title: '📅 Upcoming Event — CaliphateMakhtaba',
    message: 'We have an upcoming event you won\'t want to miss. Tap to view details.',
    url: '/',
  },
  {
    icon: Bell,
    label: 'General Announcement',
    title: '📢 Announcement — CaliphateMakhtaba',
    message: 'We have an important announcement for the community.',
    url: '/',
  },
];

interface BroadcastRecord {
  id:        number;
  title:     string;
  message:   string;
  url:       string;
  sent:      number;
  timestamp: string;
}

export default function AdminNotificationsPage() {
  const [subscribers, setSubscribers] = useState<number | null>(null);
  const [form,  setForm]  = useState({ title: '', message: '', url: '/' });
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<BroadcastRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('broadcast-history') || '[]');
    } catch { return []; }
  });

  const loadStats = async () => {
    try {
      const res = await api.get('/push/stats');
      setSubscribers(res.data.subscribers);
    } catch {
      setSubscribers(0);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const applyTemplate = (t: typeof QUICK_TEMPLATES[0]) => {
    setForm({ title: t.title, message: t.message, url: t.url });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (subscribers === 0) {
      toast.error('No subscribers yet — nobody to notify');
      return;
    }
    setSending(true);
    try {
      const res = await api.post('/push/broadcast', {
        title:   form.title.trim(),
        message: form.message.trim(),
        url:     form.url.trim() || '/',
      });

      if (res.data.error) {
        toast.error(res.data.error);
        return;
      }

      toast.success(`Sent to ${res.data.sent} subscriber(s)!`);

      // Save to local history
      const record: BroadcastRecord = {
        id:        Date.now(),
        title:     form.title.trim(),
        message:   form.message.trim(),
        url:       form.url.trim() || '/',
        sent:      res.data.sent,
        timestamp: new Date().toISOString(),
      };
      const updated = [record, ...history].slice(0, 20); // keep last 20
      setHistory(updated);
      localStorage.setItem('broadcast-history', JSON.stringify(updated));

      setForm({ title: '', message: '', url: '/' });
      loadStats();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('broadcast-history');
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">
      {children}
    </label>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <p className="font-arabic text-gold-600 text-lg">الإشعارات</p>
        <h1 className="font-display text-ink-900 text-xl tracking-wide">Push Notifications</h1>
      </div>

      {/* Subscriber count card */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-display text-ink-500 text-xs tracking-widest uppercase mb-0.5">Active Subscribers</p>
            <p className="font-display text-ink-900 text-3xl leading-none">
              {subscribers === null
                ? <Loader2 className="w-6 h-6 animate-spin text-ink-400 inline" />
                : subscribers.toLocaleString()
              }
            </p>
            <p className="text-ink-400 font-body text-xs mt-1">
              {subscribers === 0
                ? 'No one has enabled notifications yet'
                : `${subscribers} device(s) will receive this notification`
              }
            </p>
          </div>
          <button
            onClick={loadStats}
            className="ml-auto btn-ghost text-xs py-2 px-3"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Compose form ─────────────────────────────────────────── */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-gold-600" />
                <h2 className="font-display text-ink-900 text-sm tracking-wide">Compose Notification</h2>
              </div>

              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required
                    maxLength={80}
                    placeholder="e.g. 📚 New Book Available"
                    className="input-islamic"
                  />
                  <p className="text-[11px] text-ink-400 font-body mt-1 text-right">
                    {form.title.length}/80
                  </p>
                </div>

                <div>
                  <Label>Message *</Label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                    maxLength={200}
                    rows={3}
                    placeholder="What do you want to tell your subscribers?"
                    className="input-islamic resize-none"
                  />
                  <p className="text-[11px] text-ink-400 font-body mt-1 text-right">
                    {form.message.length}/200
                  </p>
                </div>

                <div>
                  <Label>Link (where to open on tap)</Label>
                  <input
                    value={form.url}
                    onChange={e => setForm({ ...form, url: e.target.value })}
                    placeholder="/books or /scholars or /"
                    className="input-islamic"
                  />
                  <p className="text-[11px] text-ink-400 font-body mt-1">
                    Use a path like <code className="bg-ink-100 px-1 rounded">/books</code> or <code className="bg-ink-100 px-1 rounded">/</code> for homepage
                  </p>
                </div>

                {/* Preview */}
                {(form.title || form.message) && (
                  <div className="rounded-xl bg-ink-950 p-3.5 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-ink-900 flex items-center justify-center flex-shrink-0 border border-gold-700/30">
                      <span className="font-arabic text-gold-400 text-base leading-none">م</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{form.title || 'Notification Title'}</p>
                      <p className="text-white/60 text-[11px] font-body mt-0.5 line-clamp-2">{form.message || 'Your message here…'}</p>
                    </div>
                    <p className="text-white/30 text-[10px] flex-shrink-0">now</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending || subscribers === 0}
                  className="btn-gold w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send to {subscribers ?? '…'} subscriber(s)</>
                  )}
                </button>

                {subscribers === 0 && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-700 text-xs font-body leading-relaxed">
                      No subscribers yet. Users need to accept notification permission on the website first.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Quick templates */}
          <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
            <div className="p-5">
              <h2 className="font-display text-ink-900 text-sm tracking-wide mb-3">Quick Templates</h2>
              <div className="space-y-2">
                {QUICK_TEMPLATES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-ink-100 hover:border-gold-300 hover:bg-gold-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-ink-900 text-xs tracking-wide">{t.label}</p>
                        <p className="text-ink-400 font-body text-[11px] truncate max-w-[220px]">{t.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Broadcast history ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-ink-900 text-sm tracking-wide">Send History</h2>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-[11px] text-red-400 hover:text-red-600 font-body transition-colors">
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-8 h-8 text-ink-200 mx-auto mb-2" />
                <p className="text-ink-400 text-sm font-body">No notifications sent yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div key={item.id} className="rounded-xl border border-ink-100 p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-display text-ink-900 text-xs tracking-wide line-clamp-1 flex-1">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span className="text-[11px] text-emerald-600 font-body">{item.sent}</span>
                      </div>
                    </div>
                    <p className="text-ink-500 font-body text-[11px] line-clamp-2 mb-1.5">{item.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-ink-400 font-body">→ {item.url}</span>
                      <span className="text-[10px] text-ink-400 font-body">
                        {new Date(item.timestamp).toLocaleString('en-GB', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
