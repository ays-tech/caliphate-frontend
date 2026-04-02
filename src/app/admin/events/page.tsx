'use client';

import { useEffect, useState } from 'react';
import { eventsApi } from '@/lib/api';
import { Plus, Trash2, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Label = ({ children }: any) => (
  <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">{children}</label>
);

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '' });

  const fetchEvents = async () => {
    setLoading(true);
    try { const res = await eventsApi.getAll(); setEvents(res.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await eventsApi.create(form);
      toast.success('Event created!');
      setShowCreate(false); setForm({ title: '', description: '', date: '' });
      fetchEvents();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await eventsApi.delete(id); toast.success('Event deleted'); fetchEvents(); }
    catch { toast.error('Failed'); }
  };

  const isPast = (date: string) => new Date(date) < new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-arabic text-gold-600 text-lg">إدارة الفعاليات</p>
          <h1 className="font-display text-ink-900 text-xl tracking-wide">Events <span className="text-ink-400 font-body font-normal text-sm">({events.length})</span></h1>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-gold text-xs py-2.5 px-4">
          <Plus className="w-3.5 h-3.5" /> Create Event
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-ink-100">
          <p className="font-arabic text-gold-300 text-xl mb-2">لا توجد فعاليات</p>
          <p className="text-ink-400 text-sm font-body">No events yet.</p>
        </div>
      ) : (
        <div className="space-y-3 stagger">
          {events.map((event: any) => {
            const past = isPast(event.date);
            return (
              <div key={event.id} className={`card p-4 flex items-start gap-4 ${past ? 'opacity-60' : ''}`}>
                {/* Date badge */}
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                  past ? 'bg-ink-100' : 'bg-gradient-to-br from-gold-100 to-gold-200 border border-gold-300'
                }`}>
                  <span className={`font-display text-lg leading-none ${past ? 'text-ink-400' : 'text-gold-800'}`}>
                    {format(new Date(event.date), 'd')}
                  </span>
                  <span className={`text-[9px] font-body tracking-widest uppercase ${past ? 'text-ink-400' : 'text-gold-700'}`}>
                    {format(new Date(event.date), 'MMM')}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-display text-ink-900 text-sm truncate">{event.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-body flex-shrink-0 ${
                      past ? 'bg-ink-100 text-ink-400' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {past ? 'Past' : 'Upcoming'}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-ink-500 font-body line-clamp-1">{event.description}</p>
                  )}
                  <p className="text-[11px] text-gold-600 mt-1 font-body">
                    {format(new Date(event.date), 'EEEE, MMMM d · h:mm a')}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(event.id, event.title)}
                  className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-up">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
            <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
              <div>
                <h2 className="font-display text-ink-900 text-sm tracking-wide">Create Event</h2>
                <p className="font-arabic text-gold-500 text-sm">إنشاء فعالية</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-ink-400 hover:text-ink-600 p-1.5 rounded-lg hover:bg-ink-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div><Label>Title *</Label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="input-islamic" /></div>
              <div><Label>Date & Time *</Label><input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="input-islamic" /></div>
              <div><Label>Description</Label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="input-islamic resize-none" /></div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold flex-1 py-2.5">{saving ? 'Creating…' : 'Create Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
