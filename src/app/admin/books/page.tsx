'use client';

import { useEffect, useState, useRef } from 'react';
import { booksApi, scholarsApi } from '@/lib/api';
import {
  Plus, Trash2, Upload, X, Edit2, FileText,
  BookOpen, AlertCircle, Image as ImgIcon,
  Mic, Video,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_IMG_MB  = 5;
const MAX_FILE_MB = 500;

const LANGUAGES = [
  { value: 'ARABIC',   label: 'Arabic',   arabic: 'عربي' },
  { value: 'ENGLISH',  label: 'English',  arabic: 'إنجليزي' },
  { value: 'HAUSA',    label: 'Hausa',    arabic: 'هوسا' },
  { value: 'FULFULDE', label: 'Fulfulde', arabic: 'فولفلدي' },
];

const FORMATS = [
  { value: 'BOOK',  label: 'Book / Text', icon: BookOpen, note: 'PDF, EPUB, or image' },
  { value: 'AUDIO', label: 'Audio',       icon: Mic,      note: 'MP3, WAV, M4A' },
  { value: 'VIDEO', label: 'Video',       icon: Video,    note: 'MP4, WEBM, MOV' },
];

const FORMAT_ACCEPT: Record<string, string> = {
  BOOK:  '.pdf,.epub,image/jpeg,image/png,image/webp',
  AUDIO: 'audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/webm,.mp3,.m4a,.wav',
  VIDEO: 'video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mov',
};

const statusStyle: Record<string, string> = {
  PENDING:  'badge-pending',
  APPROVED: 'badge-approved',
  REJECTED: 'badge-rejected',
};

const EMPTY_FORM = {
  title: '', description: '', scholarId: '',
  type: 'PUBLISHED', language: 'ARABIC', format: 'BOOK', volumeTitle: '',
};

// ── Shared Modal ──────────────────────────────────────────────────────
function Modal({ title, arabic, onClose, children }: {
  title: string; arabic?: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-up">
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
        <div className="p-5 max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

const Label = ({ children, optional }: { children: React.ReactNode; optional?: boolean }) => (
  <label className="flex items-center gap-1.5 font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">
    {children}
    {optional && <span className="text-ink-400 normal-case font-body tracking-normal text-[10px]">(optional)</span>}
  </label>
);

function FileErr({ msg }: { msg: string }) {
  return (
    <div className="mt-1.5 flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-[11px] text-red-700 font-body">{msg}</p>
    </div>
  );
}

// ── Cover picker ──────────────────────────────────────────────────────
function CoverPicker({ current, preview, onChange, onClear }: {
  current?: string; preview: string | null;
  onChange: (f: File) => void; onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');
  const shown = preview || current;

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; setErr('');
    if (f.size > MAX_IMG_MB * 1024 * 1024) { setErr(`Max ${MAX_IMG_MB} MB`); e.target.value = ''; return; }
    if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(f.type)) { setErr('JPEG, PNG or WEBP only'); e.target.value = ''; return; }
    onChange(f);
  };

  return (
    <div>
      <Label optional>Cover Image</Label>
      <div className="flex items-start gap-3">
        <div className="w-16 h-20 rounded-xl flex-shrink-0 bg-gradient-to-br from-emerald-900 to-ink-900 overflow-hidden flex items-center justify-center cursor-pointer border border-ink-200"
          onClick={() => ref.current?.click()}>
          {shown ? <img src={shown} alt="Cover" className="w-full h-full object-cover" /> : <ImgIcon className="w-6 h-6 text-ink-500 opacity-40" />}
        </div>
        <div className="flex-1 space-y-1.5">
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={handle} className="hidden" />
          <button type="button" onClick={() => ref.current?.click()}
            className="flex items-center gap-1.5 text-xs bg-gold-50 text-gold-700 border border-gold-200 px-3 py-2 rounded-lg hover:bg-gold-100 transition-colors font-body w-full justify-center">
            <Upload className="w-3.5 h-3.5" /> {shown ? 'Change Cover' : 'Upload Cover'}
          </button>
          {shown && <button type="button" onClick={() => { onClear(); if (ref.current) ref.current.value = ''; }}
            className="text-[11px] text-red-400 hover:text-red-600 font-body block text-center w-full">Remove</button>}
          <p className="text-[11px] text-ink-400 font-body">JPEG · PNG · WEBP · max {MAX_IMG_MB} MB</p>
        </div>
      </div>
      {err && <FileErr msg={err} />}
    </div>
  );
}

// ── Book file picker ──────────────────────────────────────────────────
function BookFilePicker({ file, format, onChange, onClear }: {
  file: File | null; format: string; onChange: (f: File) => void; onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');
  const fmt = FORMATS.find(f => f.value === format) || FORMATS[0];
  const Icon = fmt.icon;

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; setErr('');
    if (f.size > MAX_FILE_MB * 1024 * 1024) { setErr(`Max ${MAX_FILE_MB} MB`); e.target.value = ''; return; }
    onChange(f);
  };

  useEffect(() => { onClear(); if (ref.current) ref.current.value = ''; setErr(''); }, [format]);

  return (
    <div className="rounded-xl border border-dashed border-gold-300 bg-gold-50/50 p-4">
      <Label optional><Icon className="w-3.5 h-3.5" /> {fmt.label} File</Label>
      <p className="text-[11px] text-ink-500 font-body mb-3 leading-relaxed">
        {format === 'BOOK'  && 'Upload PDF, EPUB, or image. Saved as Volume 1.'}
        {format === 'AUDIO' && 'Upload audio lecture (MP3, WAV, M4A). Saved as Volume 1.'}
        {format === 'VIDEO' && 'Upload video lecture (MP4, WEBM, MOV). Saved as Volume 1.'}
      </p>
      <input ref={ref} type="file" accept={FORMAT_ACCEPT[format]} onChange={handle} className="hidden" />
      {file ? (
        <div className="flex items-center gap-2 bg-white border border-gold-200 rounded-lg px-3 py-2">
          <FileText className="w-4 h-4 text-gold-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-body text-ink-700 truncate">{file.name}</p>
            <p className="text-[10px] text-ink-400">{(file.size/1024/1024).toFixed(1)} MB</p>
          </div>
          <button type="button" onClick={() => { onClear(); if (ref.current) ref.current.value = ''; }}
            className="text-ink-400 hover:text-red-500 transition-colors flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          className="flex items-center gap-1.5 text-xs bg-white text-gold-700 border border-gold-200 px-3 py-2 rounded-lg hover:bg-gold-50 transition-colors font-body w-full justify-center">
          <Upload className="w-3.5 h-3.5" /> Choose {fmt.label} File
        </button>
      )}
      {err && <FileErr msg={err} />}
      <p className="text-[10px] text-ink-400 font-body mt-2">{fmt.note} · max {MAX_FILE_MB} MB</p>
    </div>
  );
}

// ── BookFormBody — DEFINED OUTSIDE the page component ────────────────
// This is critical: if defined inside AdminBooksPage, React treats it as
// a new component type on every render, unmounts/remounts it, and inputs
// lose focus after each keystroke.
function BookFormBody({
  bookForm, setBookForm, scholars, isEdit, editingBook,
  coverFile, coverPreview, bookFile,
  onCoverChange, onCoverClear, onBookFileChange, onBookFileClear,
}: {
  bookForm: any; setBookForm: (f: any) => void; scholars: any[];
  isEdit?: boolean; editingBook?: any;
  coverFile: File | null; coverPreview: string | null; bookFile: File | null;
  onCoverChange: (f: File) => void; onCoverClear: () => void;
  onBookFileChange: (f: File) => void; onBookFileClear: () => void;
}) {
  return (
    <>
      <CoverPicker
        current={isEdit ? editingBook?.coverUrl : undefined}
        preview={coverPreview}
        onChange={onCoverChange}
        onClear={onCoverClear}
      />

      <div>
        <Label>Title *</Label>
        <input
          value={bookForm.title}
          onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
          required placeholder="Book title" className="input-islamic"
        />
      </div>

      <div>
        <Label>Scholar *</Label>
        <select value={bookForm.scholarId} onChange={e => setBookForm({ ...bookForm, scholarId: e.target.value })}
          required className="input-islamic">
          <option value="">Select a scholar…</option>
          {scholars.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div>
        <Label optional>Description</Label>
        <textarea
          value={bookForm.description}
          onChange={e => setBookForm({ ...bookForm, description: e.target.value })}
          rows={3} placeholder="Brief description…" className="input-islamic resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Format radio */}
        <div>
          <Label>Format</Label>
          <div className="space-y-1.5">
            {FORMATS.map(({ value, label, icon: Icon }) => (
              <label key={value}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                  bookForm.format === value ? 'border-gold-400 bg-gold-50 text-gold-800' : 'border-ink-200 hover:border-gold-200'
                }`}>
                <input type="radio" name="book-format" value={value}
                  checked={bookForm.format === value}
                  onChange={() => setBookForm({ ...bookForm, format: value })} className="hidden" />
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-body text-xs">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label>Language</Label>
            <select value={bookForm.language} onChange={e => setBookForm({ ...bookForm, language: e.target.value })}
              className="input-islamic">
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label} — {l.arabic}</option>)}
            </select>
          </div>
          <div>
            <Label>Publication</Label>
            <select value={bookForm.type} onChange={e => setBookForm({ ...bookForm, type: e.target.value })}
              className="input-islamic">
              <option value="PUBLISHED">Published</option>
              <option value="UNPUBLISHED">Manuscript</option>
            </select>
          </div>
        </div>
      </div>

      {!isEdit && (
        <>
          <BookFilePicker
            file={bookFile} format={bookForm.format}
            onChange={onBookFileChange} onClear={onBookFileClear}
          />
          {bookFile && (
            <div>
              <Label optional>Volume Title</Label>
              <input
                value={bookForm.volumeTitle}
                onChange={e => setBookForm({ ...bookForm, volumeTitle: e.target.value })}
                placeholder={`${bookForm.title || 'Book'} — Volume 1`}
                className="input-islamic text-sm"
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────
export default function AdminBooksPage() {
  const [books,    setBooks]    = useState<any[]>([]);
  const [scholars, setScholars] = useState<any[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);

  const [showCreate,  setShowCreate]  = useState(false);
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [showVolume,  setShowVolume]  = useState<string | null>(null);

  const [bookForm,     setBookForm]     = useState(EMPTY_FORM);
  const [coverFile,    setCoverFile]    = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [bookFile,     setBookFile]     = useState<File | null>(null);
  const [saving,       setSaving]       = useState(false);

  const [volForm,   setVolForm]   = useState({ title: '', order: '1' });
  const [volFile,   setVolFile]   = useState<File | null>(null);
  const [volSaving, setVolSaving] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try { const r = await booksApi.getAllAdmin({ limit: 50 }); setBooks(r.data.data); setTotal(r.data.total); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchBooks();
    scholarsApi.getAll().then(r => setScholars(r.data));
  }, []);

  const openCreate = () => {
    setEditingBook(null); setBookForm(EMPTY_FORM);
    setCoverFile(null); setCoverPreview(null); setBookFile(null);
    setShowCreate(true);
  };

  const openEdit = (book: any) => {
    setEditingBook(book);
    setBookForm({
      title:       book.title       || '',
      description: book.description || '',
      scholarId:   book.scholar?.id || '',
      type:        book.type        || 'PUBLISHED',
      language:    book.language    || 'ARABIC',
      format:      book.format      || 'BOOK',
      volumeTitle: '',
    });
    setCoverFile(null); setCoverPreview(null); setBookFile(null);
  };

  const closeEdit = () => { setEditingBook(null); setCoverFile(null); setCoverPreview(null); };

  const extractError = (err: any) => {
    const msg = err?.response?.data?.message;
    return Array.isArray(msg) ? msg[0] : msg || 'Something went wrong';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title.trim())  { toast.error('Book title is required'); return; }
    if (!bookForm.scholarId)     { toast.error('Please select a scholar'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',     bookForm.title.trim());
      fd.append('scholarId', bookForm.scholarId);
      fd.append('type',      bookForm.type);
      fd.append('language',  bookForm.language);
      fd.append('format',    bookForm.format);
      if (bookForm.description.trim()) fd.append('description', bookForm.description.trim());
      if (bookForm.volumeTitle.trim()) fd.append('volumeTitle', bookForm.volumeTitle.trim());
      if (coverFile) fd.append('cover',    coverFile);
      if (bookFile)  fd.append('bookFile', bookFile);
      await booksApi.create(fd);
      toast.success(bookFile ? 'Book created with Volume 1!' : 'Book created — add volumes next.');
      setShowCreate(false); fetchBooks();
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    setSaving(true);
    try {
      const fd = new FormData();
      if (bookForm.title.trim())  fd.append('title',       bookForm.title.trim());
      if (bookForm.description)   fd.append('description', bookForm.description.trim());
      if (bookForm.scholarId)     fd.append('scholarId',   bookForm.scholarId);
      fd.append('type',     bookForm.type);
      fd.append('language', bookForm.language);
      fd.append('format',   bookForm.format);
      if (coverFile) fd.append('cover', coverFile);
      await booksApi.update(editingBook.id, fd);
      toast.success('Book updated — reset to Pending for re-approval.');
      closeEdit(); fetchBooks();
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setSaving(false); }
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
      setShowVolume(null); setVolForm({ title: '', order: '1' }); setVolFile(null); fetchBooks();
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setVolSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? All uploaded volumes will also be deleted.`)) return;
    try { await booksApi.delete(id); toast.success('Book deleted'); fetchBooks(); }
    catch (err: any) { toast.error(extractError(err)); }
  };

  const FormatIcon = ({ fmt }: { fmt: string }) => {
    if (fmt === 'AUDIO') return <Mic   className="w-3.5 h-3.5 text-blue-500" />;
    if (fmt === 'VIDEO') return <Video className="w-3.5 h-3.5 text-purple-500" />;
    return <BookOpen className="w-3.5 h-3.5 text-emerald-600" />;
  };

  // Shared props for BookFormBody
  const formBodyProps = {
    bookForm, setBookForm, scholars, editingBook,
    coverFile, coverPreview, bookFile,
    onCoverChange:    (f: File) => { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); },
    onCoverClear:     () => { setCoverFile(null); setCoverPreview(null); },
    onBookFileChange: (f: File) => setBookFile(f),
    onBookFileClear:  () => setBookFile(null),
  };

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
            <p className="text-ink-400 text-sm font-body">No books yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-ink-50 border-b border-ink-100">
                <tr>
                  {['', 'Title', 'Scholar', 'Lang', 'Fmt', 'Status', 'Vols', ''].map((h, i) => (
                    <th key={i} className="text-left px-3 py-3 font-display text-ink-500 text-xs tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {books.map((book: any) => (
                  <tr key={book.id} className="hover:bg-ink-50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="w-8 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-900 to-ink-900 flex items-center justify-center flex-shrink-0">
                        {book.coverUrl
                          ? <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                          : <BookOpen className="w-3.5 h-3.5 text-gold-400 opacity-60" />
                        }
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-body font-medium text-ink-800 truncate max-w-[150px]">{book.title}</p>
                      {book.description && <p className="text-[11px] text-ink-400 truncate max-w-[150px]">{book.description}</p>}
                    </td>
                    <td className="px-3 py-3.5 text-ink-500 font-body text-xs">{book.scholar?.name}</td>
                    <td className="px-3 py-3.5">
                      <span className="text-[11px] bg-ink-100 text-ink-600 px-1.5 py-0.5 rounded font-body">
                        {book.language || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3.5"><FormatIcon fmt={book.format || 'BOOK'} /></td>
                    <td className="px-3 py-3.5"><span className={statusStyle[book.status]}>{book.status}</span></td>
                    <td className="px-3 py-3.5 text-ink-400 font-body text-xs">{book._count?.volumes || 0}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(book)}
                          className="flex items-center gap-1 text-xs bg-gold-50 text-gold-700 border border-gold-100 px-2 py-1.5 rounded-lg hover:bg-gold-100 transition-colors font-body">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => setShowVolume(book.id)}
                          className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors font-body">
                          <Upload className="w-3 h-3" /> Vol
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
            <BookFormBody {...formBodyProps} isEdit={false} />
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
              ⚠️ Editing resets status to <strong>Pending</strong> — super admin must re-approve.
            </p>
          </div>
          <form onSubmit={handleUpdate} className="space-y-4">
            <BookFormBody {...formBodyProps} isEdit={true} />
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
              <input value={volForm.title} onChange={e => setVolForm({ ...volForm, title: e.target.value })}
                required placeholder="e.g. Volume 2, Part Two…" className="input-islamic" />
            </div>
            <div>
              <Label>Order</Label>
              <input type="number" min="1" value={volForm.order}
                onChange={e => setVolForm({ ...volForm, order: e.target.value })} className="input-islamic" />
            </div>
            <div>
              <Label>File *</Label>
              <p className="text-[11px] text-ink-400 font-body mb-2">PDF, EPUB, MP3, MP4, or image — max {MAX_FILE_MB} MB</p>
              <input type="file"
                accept=".pdf,.epub,image/jpeg,image/png,image/webp,audio/mpeg,audio/mp4,audio/wav,video/mp4,video/webm,video/quicktime"
                onChange={e => setVolFile(e.target.files?.[0] || null)} required
                className="w-full text-sm text-ink-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-body file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100"
              />
              {volFile && <p className="text-[11px] text-ink-500 mt-1 font-body">{volFile.name} · {(volFile.size/1024/1024).toFixed(1)} MB</p>}
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
