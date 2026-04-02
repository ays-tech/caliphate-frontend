'use client';

import { useEffect, useState } from 'react';
import { scholarsApi } from '@/lib/api';
import { Plus, Trash2, Edit, X, User } from 'lucide-react';
import toast from 'react-hot-toast';

function Modal({ title, arabic, onClose, children }: any) {
  return (
    <div className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-up">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
          <div>
            <h2 className="font-display text-ink-900 text-sm tracking-wide">{title}</h2>
            {arabic && <p className="font-arabic text-gold-500 text-sm">{arabic}</p>}
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-600 p-1.5 rounded-lg hover:bg-ink-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const Label = ({ children }: any) => (
  <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">{children}</label>
);

export default function AdminScholarsPage() {
  const [scholars, setScholars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', biography: '' });
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchScholars = async () => {
    setLoading(true);
    try { const res = await scholarsApi.getAll(); setScholars(res.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchScholars(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', biography: '' }); setPictureFile(null); setShowModal(true); };
  const openEdit = (s: any) => { setEditing(s); setForm({ name: s.name, biography: s.biography || '' }); setPictureFile(null); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name); fd.append('biography', form.biography);
      if (pictureFile) fd.append('picture', pictureFile);
      if (editing) { await scholarsApi.update(editing.id, fd); toast.success('Scholar updated!'); }
      else { await scholarsApi.create(fd); toast.success('Scholar created!'); }
      setShowModal(false); fetchScholars();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await scholarsApi.delete(id); toast.success('Deleted'); fetchScholars(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-arabic text-gold-600 text-lg">إدارة العلماء</p>
          <h1 className="font-display text-ink-900 text-xl tracking-wide">Scholars <span className="text-ink-400 font-body font-normal text-sm">({scholars.length})</span></h1>
        </div>
        <button onClick={openCreate} className="btn-gold text-xs py-2.5 px-4">
          <Plus className="w-3.5 h-3.5" /> Add Scholar
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : scholars.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-ink-100">
          <p className="font-arabic text-gold-300 text-xl mb-2">لا يوجد علماء</p>
          <p className="text-ink-400 text-sm font-body">No scholars yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {scholars.map((s: any) => (
            <div key={s.id} className="card p-4 flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gradient-to-br from-gold-400 to-gold-700 p-0.5 shadow-glow-gold">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-emerald-900 to-ink-900 flex items-center justify-center">
                  {s.pictureUrl
                    ? <img src={s.pictureUrl} alt={s.name} className="w-full h-full object-cover" />
                    : <User className="w-5 h-5 text-gold-400 opacity-70" />
                  }
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-ink-900 text-sm truncate">{s.name}</p>
                {s.biography && <p className="text-xs text-ink-500 line-clamp-1 mt-0.5 font-body">{s.biography}</p>}
                <span className="inline-block mt-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-body">{s._count?.books || 0} books</span>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => openEdit(s)} className="p-1.5 text-ink-400 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Scholar' : 'Add Scholar'} arabic={editing ? 'تعديل عالم' : 'إضافة عالم'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Name *</Label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="input-islamic" /></div>
            <div><Label>Biography</Label><textarea value={form.biography} onChange={e => setForm({...form, biography: e.target.value})} rows={4} className="input-islamic resize-none" /></div>
            <div>
              <Label>Profile Picture</Label>
              <input type="file" accept="image/*" onChange={e => setPictureFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-ink-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-body file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 py-2.5">Cancel</button>
              <button type="submit" disabled={saving} className="btn-gold flex-1 py-2.5">{saving ? 'Saving…' : editing ? 'Update' : 'Add Scholar'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
