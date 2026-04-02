'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { Eye, EyeOff, BookOpen } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      login(res.data.access_token, res.data.user);
      toast.success('Welcome back');
      router.push(res.data.user.role !== 'USER' ? '/admin' : '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-parchment flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm animate-fade-up">

        {/* Card */}
        <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">

          {/* Header strip */}
          <div className="relative bg-ink-950 px-6 py-8 text-center overflow-hidden"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23d4900f' stroke-opacity='0.1' stroke-width='0.8'%3E%3Cpolygon points='30,4 56,18 56,42 30,56 4,42 4,18'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center mx-auto mb-3 shadow-glow-gold">
              <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <p className="font-arabic text-gold-400 text-lg mb-0.5">مكتبة الخلافة</p>
            <h1 className="font-display text-ivory text-lg tracking-widest">Sign In</h1>
          </div>

          {/* Gold line */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block font-display text-ink-700 text-xs tracking-widest mb-1.5 uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="input-islamic"
              />
            </div>

            <div>
              <label className="block font-display text-ink-700 text-xs tracking-widest mb-1.5 uppercase">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-islamic pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full py-3 mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="px-6 pb-6 text-center">
            <div className="divider-ornament text-base mb-4">✦</div>
            <p className="text-ink-500 text-sm font-body">
              New to the library?{' '}
              <Link href="/auth/register" className="text-gold-700 hover:text-gold-900 font-semibold transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
