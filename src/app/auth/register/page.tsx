'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(form);
      toast.success('Account created! You may now sign in.');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: keyof typeof form; label: string; type: string; placeholder: string }[] = [
    { key: 'name',     label: 'Full Name', type: 'text',     placeholder: 'Your name' },
    { key: 'email',    label: 'Email',     type: 'email',    placeholder: 'you@example.com' },
    { key: 'password', label: 'Password',  type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-parchment flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">

          {/* Header */}
          <div className="relative bg-ink-950 px-6 py-8 text-center overflow-hidden"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23d4900f' stroke-opacity='0.1' stroke-width='0.8'%3E%3Cpolygon points='30,4 56,18 56,42 30,56 4,42 4,18'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-glow-emerald">
              <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <p className="font-arabic text-gold-400 text-lg mb-0.5">انضم إلى المكتبة</p>
            <h1 className="font-display text-ivory text-lg tracking-widest">Create Account</h1>
          </div>

          <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block font-display text-ink-700 text-xs tracking-widest mb-1.5 uppercase">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required
                  placeholder={placeholder}
                  className="input-islamic"
                />
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-emerald w-full py-3 mt-2">
              {loading ? 'Creating account…' : 'Join the Library'}
            </button>
          </form>

          <div className="px-6 pb-6 text-center">
            <div className="divider-ornament text-base mb-4">✦</div>
            <p className="text-ink-500 text-sm font-body">
              Already a member?{' '}
              <Link href="/auth/login" className="text-gold-700 hover:text-gold-900 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
