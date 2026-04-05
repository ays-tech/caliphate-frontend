'use client';

import { useEffect, useState, useRef } from 'react';
import { scholarsApi } from '@/lib/api';
import { Plus, Trash2, Edit, X, User, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_IMG_MB = 5;

function Modal({ title, arabic, onClose, children }: {
  title: string; arabic?: string; onClose: () => void; children: React.ReactNode;
}) {
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
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">{children}</label>
);

// Image picker with preview + size validation
function ImagePicker({
  label, current, onChange, onClear, preview,
}: {
  label: string;
  current?: string;
  onChange: (f: File) => void;
  onClear: () => void;
  preview: string | null;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError('');
    if (f.size > MAX_IMG_MB * 1024 * 1024) {
      setError(`File is ${(f.size / 1024 / 1024).toFixed(1)} MB. Maximum is ${MAX_IMG_MB} MB.`);
      e.target.value = '';
      return;
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(f.type)) {
      setError('Only JPEG, PNG, and WEBP images are allowed.');
      e.target.value = '';
      return;
    }
    onChange(f);
  };

  const shown = preview || current;

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        {/* Preview circle */}
        <div
          className="w-14 h-14 rounded-full flex-shrink-0 bg-gradient-to-br from-gold-400 to-gold-700 p-0.5 cursor-pointer"
          onClick={() => ref.current?.click()}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-ink-900 flex items-center justify-center">
            {shown
              ? <img src={shown} alt="Preview" className="w-full h-full object-cover" />
              : <User className="w-6 h-6 text-gold-400 opacity-60" />
            }
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <input
            ref={ref}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="flex items-center gap-1.5 text-xs bg-gold-50 text-gold-700 border border-gold-200 px-3 py-2 rounded-lg hover:bg-gold-100 transition-colors font-body w-full justify-center"
          >
            <Upload className="w-3.5 h-3.5" />
            {shown ? 'Change Photo' : 'Upload Photo'}
          </button>
          {shown && (
            <button
              type="button"
              onClick={() => { onClear(); if (ref.current) ref.current.value = ''; }}
              className="text-[11px] text-red-400 hover:text-red-600 mt-1 font-body block text-center w-full"
            >
              Remove photo
            </button>
          )}
          <p className="text-[11px] text-ink-400 mt-1 font-body">JPEG, PNG, WEBP · Max {MAX_IMG_MB} MB</p>
        </div>
      </div>
      {error && (
        <div className="mt-2 flex items-start gap-1.5 text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] font-body">{error}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminScholarsPage() {
  const [scholars, setScholars] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,  setEditing]  = useState<any>(null);
  const [form,     setForm]     = useState({ name: '', biography: '' });
  const [picFile,  setPicFile]  = useState<File | null>(null);
  const [picPreview, setPicPreview] = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);

  const fetchScholars = async () => {
    setLoading(true);
    try { const r = await scholarsApi.getAll(); setScholars(r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchScholars(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', biography: '' });
    setPicFile(null); setPicPreview(null);
    setShowModal(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, biography: s.biography || '' });
    setPicFile(null); setPicPreview(null);
    setShowModal(true);
  };

  const handlePicChange = (f: File) => {
    setPicFile(f);
    setPicPreview(URL.createObjectURL(f));
  };

  const handlePicClear = () => {
    setPicFile(null);
    setPicPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Scholar name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',      form.name.trim());
      fd.append('biography', form.biography.trim());
      if (picFile) fd.append('picture', picFile);

      if (editing) {
        await scholarsApi.update(editing.id, fd);
        toast.success('Scholar updated!');
      } else {
        await scholarsApi.create(fd);
        toast.success('Scholar created!');
      }
      setShowModal(false);
      fetchScholars();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to save scholar');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await scholarsApi.delete(id); toast.success('Scholar deleted'); fetchScholars(); }
    catch { toast.error('Failed to delete scholar'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-arabic text-gold-600 text-lg">إدارة العلماء</p>
          <h1 className="font-display text-ink-900 text-xl tracking-wide">
            Scholars <span className="text-ink-400 font-body font-normal text-sm">({scholars.length})</span>
          </h1>
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
          <p className="text-ink-400 text-sm font-body">No scholars yet. Add the first one.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {scholars.map((s: any) => (
            <div key={s.id} className="card p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gradient-to-br from-gold-400 to-gold-700 p-0.5 shadow-glow-gold">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-emerald-900 to-ink-900 flex items-center justify-center">
                  {s.pictureUrl
                    ? <img src={s.pictureUrl} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
                    : <User className="w-5 h-5 text-gold-400 opacity-70" />
                  }
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-ink-900 text-sm truncate">{s.name}</p>
                {s.biography && <p className="text-xs text-ink-500 line-clamp-1 mt-0.5 font-body">{s.biography}</p>}
                <span className="inline-block mt-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-body">
                  {s._count?.books || 0} books
                </span>
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
        <Modal
          title={editing ? 'Edit Scholar' : 'Add Scholar'}
          arabic={editing ? 'تعديل عالم' : 'إضافة عالم'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image picker with preview */}
            <ImagePicker
              label="Profile Photo"
              current={editing?.pictureUrl}
              preview={picPreview}
              onChange={handlePicChange}
              onClear={handlePicClear}
            />

            <div>
              <Label>Name *</Label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Scholar's full name"
                className="input-islamic"
              />
            </div>

            <div>
              <Label>Biography</Label>
              <textarea
                value={form.biography}
                onChange={(e) => setForm({ ...form, biography: e.target.value })}
                rows={5}
                placeholder="Brief biography…"
                className="input-islamic resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 py-2.5">Cancel</button>
              <button type="submit" disabled={saving} className="btn-gold flex-1 py-2.5">
                {saving ? 'Saving…' : editing ? 'Update Scholar' : 'Add Scholar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
