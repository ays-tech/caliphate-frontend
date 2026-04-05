'use client';

import { useEffect, useState, useRef } from 'react';
import { booksApi, scholarsApi } from '@/lib/api';
import { Plus, Trash2, Upload, X, Edit2, FileText, BookOpen, AlertCircle, Image as ImgIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_IMG_MB  = 5;
const MAX_BOOK_MB = 100;

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
        <div className="p-5 max-h-[82vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

const Label = ({ children, optional }: { children: React.ReactNode; optional?: boolean }) => (
  <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase flex items-center gap-1.5">
    {children}
    {optional && <span className="text-ink-400 normal-case font-body tracking-normal text-[10px]">(optional)</span>}
  </label>
);

function FileSizeError({ msg }: { msg: string }) {
  return (
    <div className="mt-1.5 flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-[11px] text-red-700 font-body">{msg}</p>
    </div>
  );
}

function CoverPicker({ current, onChange, onClear, preview }: {
  current?: string; onChange: (f: File) => void; onClear: () => void; preview: string | null;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');
  const shown = preview || current;

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; setErr('');
    if (f.size > MAX_IMG_MB * 1024 * 1024) { setErr(`Max cover size is ${MAX_IMG_MB} MB (yours: ${(f.size/1024/1024).toFixed(1)} MB)`); e.target.value=''; return; }
    if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(f.type)) { setErr('Cover must be JPEG, PNG, or WEBP'); e.target.value=''; return; }
    onChange(f);
  };

  return (
    <div>
      <Label optional>Cover Image</Label>
      <div className="flex items-start gap-3">
        <div
          className="w-16 h-20 rounded-xl flex-shrink-0 bg-gradient-to-br from-emerald-900 to-ink-900 overflow-hidden flex items-center justify-center cursor-pointer border border-ink-200"
          onClick={() => ref.current?.click()}
        >
          {shown
            ? <img src={shown} alt="Cover" className="w-full h-full object-cover" />
            : <ImgIcon className="w-6 h-6 text-ink-500 opacity-50" />
          }
        </div>
        <div className="flex-1 space-y-1.5">
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={handle} className="hidden" />
          <button type="button" onClick={() => ref.current?.click()}
            className="flex items-center gap-1.5 text-xs bg-gold-50 text-gold-700 border border-gold-200 px-3 py-2 rounded-lg hover:bg-gold-100 transition-colors font-body w-full justify-center"
          >
            <Upload className="w-3.5 h-3.5" /> {shown ? 'Change Cover' : 'Upload Cover'}
          </button>
          {shown && (
            <button type="button" onClick={() => { onClear(); if (ref.current) ref.current.value=''; }}
              className="text-[11px] text-red-400 hover:text-red-600 font-body block text-center w-full"
            >Remove cover</button>
          )}
          <p className="text-[11px] text-ink-400 font-body">JPEG · PNG · WEBP · Max {MAX_IMG_MB} MB</p>
        </div>
      </div>
      {err && <FileSizeError msg={err} />}
    </div>
  );
}

function BookFilePicker({ file, onChange, onClear }: {
  file: File | null; onChange: (f: File) => void; onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; setErr('');
    if (f.size > MAX_BOOK_MB * 1024 * 1024) { setErr(`Max file size is ${MAX_BOOK_MB} MB (yours: ${(f.size/1024/1024).toFixed(1)} MB)`); e.target.value=''; return; }
    const ok = ['application/pdf','application/epub+zip','image/jpeg','image/jpg','image/png','image/webp'];
    if (!ok.includes(f.type)) { setErr('Only PDF, EPUB, or image files are allowed'); e.target.value=''; return; }
    onChange(f);
  };

  return (
    <div className="rounded-xl border border-dashed border-gold-300 bg-gold-50/50 p-4">
      <Label optional>Book File</Label>
      <p className="text-[11px] text-ink-500 font-body mb-3 leading-relaxed">
        Upload the actual book (PDF or EPUB). It will be saved as <strong>Volume 1</strong> automatically. You can add more volumes later.
      </p>
      <input ref={ref} type="file" accept=".pdf,.epub,image/jpeg,image/png,image/webp" onChange={handle} className="hidden" />
      {file ? (
        <div className="flex items-center gap-2 bg-white border border-gold-200 rounded-lg px-3 py-2">
          <FileText className="w-4 h-4 text-gold-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-body text-ink-700 truncate">{file.name}</p>
            <p className="text-[10px] text-ink-400">{(file.size/1024/1024).toFixed(1)} MB</p>
          </div>
          <button type="button" onClick={() => { onClear(); if(ref.current) ref.current.value=''; }} className="text-ink-400 hover:text-red-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          className="flex items-center gap-1.5 text-xs bg-white text-gold-700 border border-gold-200 px-3 py-2 rounded-lg hover:bg-gold-50 transition-colors font-body w-full justify-center"
        >
          <Upload className="w-3.5 h-3.5" /> Choose PDF / EPUB / Image
        </button>
      )}
      {err && <FileSizeError msg={err} />}
      <p className="text-[10px] text-ink-400 font-body mt-2">PDF · EPUB · JPEG · PNG · WEBP · Max {MAX_BOOK_MB} MB</p>
    </div>
  );
}

const EMPTY_FORM = { title: '', description: '', scholarId: '', type: 'PUBLISHED', volumeTitle: '' };
const statusStyle: Record<string,string> = { PENDING:'badge-pending', APPROVED:'badge-approved', REJECTED:'badge-rejected' };

export default function AdminBooksPage() {
  const [books,    setBooks]    = useState<any[]>([]);
  const [scholars, setScholars] = useState<any[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [editingBook, setEditingBook] = useState<any|null>(null);
  const [showVolume,  setShowVolume]  = useState<string|null>(null);

  const [bookForm,     setBookForm]     = useState(EMPTY_FORM);
  const [coverFile,    setCoverFile]    = useState<File|null>(null);
  const [coverPreview, setCoverPreview] = useState<string|null>(null);
  const [bookFile,     setBookFile]     = useState<File|null>(null);
  const [saving,       setSaving]       = useState(false);

  const [volForm,  setVolForm]  = useState({ title: '', order: '1' });
  const [volFile,  setVolFile]  = useState<File|null>(null);
  const [volSaving,setVolSaving]= useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try { const r = await booksApi.getAllAdmin({ limit: 50 }); setBooks(r.data.data); setTotal(r.data.total); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(); scholarsApi.getAll().then(r => setScholars(r.data)); }, []);

  const openCreate = () => {
    setEditingBook(null); setBookForm(EMPTY_FORM);
    setCoverFile(null); setCoverPreview(null); setBookFile(null);
    setShowCreate(true);
  };

  const openEdit = (book: any) => {
    setEditingBook(book);
    setBookForm({ title: book.title||'', description: book.description||'', scholarId: book.scholar?.id||'', type: book.type||'PUBLISHED', volumeTitle: '' });
    setCoverFile(null); setCoverPreview(null); setBookFile(null);
  };

  const closeEdit = () => { setEditingBook(null); setBookForm(EMPTY_FORM); setCoverFile(null); setCoverPreview(null); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title.trim())   { toast.error('Book title is required'); return; }
    if (!bookForm.scholarId)      { toast.error('Please select a scholar'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',     bookForm.title.trim());
      fd.append('scholarId', bookForm.scholarId);
      fd.append('type',      bookForm.type);
      if (bookForm.description.trim()) fd.append('description', bookForm.description.trim());
      if (bookForm.volumeTitle.trim()) fd.append('volumeTitle', bookForm.volumeTitle.trim());
      if (coverFile) fd.append('cover',    coverFile);
      if (bookFile)  fd.append('bookFile', bookFile);
      await booksApi.create(fd);
      toast.success(bookFile ? 'Book created with Volume 1!' : 'Book created — add volumes next.');
      setShowCreate(false); fetchBooks();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create book');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    setSaving(true);
    try {
      const fd = new FormData();
      if (bookForm.title.trim())       fd.append('title',       bookForm.title.trim());
      if (bookForm.description !== undefined) fd.append('description', bookForm.description.trim());
      if (bookForm.scholarId)          fd.append('scholarId',   bookForm.scholarId);
      if (bookForm.type)               fd.append('type',        bookForm.type);
      if (coverFile)                   fd.append('cover',       coverFile);
      await booksApi.update(editingBook.id, fd);
      toast.success('Book updated — reset to Pending for re-approval.');
      closeEdit(); fetchBooks();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to update book');
    } finally { setSaving(false); }
  };

  const handleAddVolume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volFile || !showVolume) { toast.error('Please select a file'); return; }
    if (!volForm.title.trim())   { toast.error('Volume title is required'); return; }
    setVolSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', volForm.title.trim());
      fd.append('order', volForm.order);
      fd.append('file',  volFile);
      await booksApi.addVolume(showVolume, fd);
      toast.success('Volume added!');
      setShowVolume(null); setVolForm({ title:'', order:'1' }); setVolFile(null); fetchBooks();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to add volume');
    } finally { setVolSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will also delete all uploaded volumes. This cannot be undone.`)) return;
    try { await booksApi.delete(id); toast.success('Book deleted'); fetchBooks(); }
    catch { toast.error('Failed to delete'); }
  };

  // Shared book form body
  const BookFormBody = ({ isEdit = false }: { isEdit?: boolean }) => (
    <>
      {/* Cover image */}
      <CoverPicker
        current={isEdit ? editingBook?.coverUrl : undefined}
        preview={coverPreview}
        onChange={(f) => { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }}
        onClear={() => { setCoverFile(null); setCoverPreview(null); }}
      />

      <div>
        <Label>Title *</Label>
        <input value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})}
          required placeholder="Book title" className="input-islamic" />
      </div>

      <div>
        <Label>Scholar *</Label>
        <select value={bookForm.scholarId} onChange={e => setBookForm({...bookForm, scholarId: e.target.value})}
          required className="input-islamic">
          <option value="">Select a scholar…</option>
          {scholars.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div>
        <Label optional>Description</Label>
        <textarea value={bookForm.description} onChange={e => setBookForm({...bookForm, description: e.target.value})}
          rows={3} placeholder="Brief description…" className="input-islamic resize-none" />
      </div>

      <div>
        <Label>Type</Label>
        <select value={bookForm.type} onChange={e => setBookForm({...bookForm, type: e.target.value})}
          className="input-islamic">
          <option value="PUBLISHED">Published</option>
          <option value="UNPUBLISHED">Manuscript / Unpublished</option>
        </select>
      </div>

      {/* Book file — only on create */}
      {!isEdit && (
        <>
          <BookFilePicker
            file={bookFile}
            onChange={setBookFile}
            onClear={() => setBookFile(null)}
          />
          {bookFile && (
            <div>
              <Label optional>Volume Title</Label>
              <input value={bookForm.volumeTitle}
                onChange={e => setBookForm({...bookForm, volumeTitle: e.target.value})}
                placeholder={`${bookForm.title || 'Book'} — Volume 1`}
                className="input-islamic text-sm"
              />
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-arabic text-gold-600 text-lg">إدارة الكتب</p>
          <h1 className="font-display text-ink-900 text-xl tracking-wide">
            Books <span className="text-ink-400 font-body font-normal text-sm">({total})</span>
          </h1>
        </div>
        <button onClick={openCreate} className="btn-gold text-xs py-2.5 px-4">
          <Plus className="w-3.5 h-3.5" /> Upload Book
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-14" />)}</div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-arabic text-gold-300 text-xl mb-2">لا توجد كتب</p>
            <p className="text-ink-400 text-sm font-body">No books yet. Upload the first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-ink-50 border-b border-ink-100">
                <tr>
                  {['Cover','Title','Scholar','Status','Vols','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-display text-ink-500 text-xs tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {books.map((book:any) => (
                  <tr key={book.id} className="hover:bg-ink-50 transition-colors">
                    {/* Cover thumbnail */}
                    <td className="px-4 py-3">
                      <div className="w-8 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-900 to-ink-900 flex items-center justify-center flex-shrink-0">
                        {book.coverUrl
                          ? <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                          : <BookOpen className="w-3.5 h-3.5 text-gold-400 opacity-60" />
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-body font-medium text-ink-800 truncate max-w-[160px]">{book.title}</p>
                      {book.description && <p className="text-[11px] text-ink-400 truncate max-w-[160px]">{book.description}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-ink-500 font-body text-xs">{book.scholar?.name}</td>
                    <td className="px-4 py-3.5"><span className={statusStyle[book.status]}>{book.status}</span></td>
                    <td className="px-4 py-3.5 text-ink-400 font-body text-xs">{book._count?.volumes || 0}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => openEdit(book)}
                          className="flex items-center gap-1 text-xs bg-gold-50 text-gold-700 border border-gold-100 px-2.5 py-1.5 rounded-lg hover:bg-gold-100 transition-colors font-body">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => setShowVolume(book.id)}
                          className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors font-body">
                          <Upload className="w-3 h-3" /> Volume
                        </button>
                        <button onClick={() => handleDelete(book.id, book.title)}
                          className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
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

      {/* CREATE modal */}
      {showCreate && (
        <Modal title="Upload New Book" arabic="رفع كتاب جديد" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <BookFormBody />
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost flex-1 py-2.5">Cancel</button>
              <button type="submit" disabled={saving} className="btn-gold flex-1 py-2.5">
                {saving ? 'Uploading…' : 'Upload Book'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT modal */}
      {editingBook && (
        <Modal title="Edit Book" arabic="تعديل الكتاب" onClose={closeEdit}>
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs text-amber-700 font-body">
              ⚠️ Editing resets status to <strong>Pending</strong> — super admin must re-approve before it goes live.
            </p>
          </div>
          <form onSubmit={handleUpdate} className="space-y-4">
            <BookFormBody isEdit />
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeEdit} className="btn-ghost flex-1 py-2.5">Cancel</button>
              <button type="submit" disabled={saving} className="btn-gold flex-1 py-2.5">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD VOLUME modal */}
      {showVolume && (
        <Modal title="Add Volume" arabic="إضافة مجلد" onClose={() => setShowVolume(null)}>
          <form onSubmit={handleAddVolume} className="space-y-4">
            <div>
              <Label>Volume Title *</Label>
              <input value={volForm.title} onChange={e => setVolForm({...volForm, title: e.target.value})}
                required placeholder="e.g. Volume 2, Part Two…" className="input-islamic" />
            </div>
            <div>
              <Label>Order</Label>
              <input type="number" min="1" value={volForm.order} onChange={e => setVolForm({...volForm, order: e.target.value})}
                className="input-islamic" />
            </div>
            <div>
              <Label>File *</Label>
              <p className="text-[11px] text-ink-400 font-body mb-2">PDF, EPUB, or image — max {MAX_BOOK_MB} MB</p>
              <input type="file" accept=".pdf,.epub,image/jpeg,image/png,image/webp"
                onChange={e => setVolFile(e.target.files?.[0] || null)} required
                className="w-full text-sm text-ink-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-body file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100" />
              {volFile && (
                <p className="text-[11px] text-ink-500 mt-1 font-body">
                  {volFile.name} · {(volFile.size/1024/1024).toFixed(1)} MB
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowVolume(null)} className="btn-ghost flex-1 py-2.5">Cancel</button>
              <button type="submit" disabled={volSaving} className="btn-gold flex-1 py-2.5">
                {volSaving ? 'Uploading…' : 'Add Volume'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
