'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, KeyRound, User, ShieldCheck } from 'lucide-react';

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block font-display text-ink-600 text-[10px] tracking-widest mb-1.5 uppercase">
    {children}
  </label>
);

function PasswordInput({
  value, onChange, placeholder, autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '••••••••'}
        autoComplete={autoComplete}
        required
        className="input-islamic pr-11"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// Simple password strength indicator
function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-600'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : 'bg-ink-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-body ${score <= 2 ? 'text-red-500' : score === 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { user, logout } = useAuth();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (form.newPassword === form.currentPassword) {
      toast.error('New password must be different from your current password');
      return;
    }

    setSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });

      toast.success('Password changed successfully. Please sign in again.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

      // Sign out after password change for security
      setTimeout(() => logout(), 1800);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg || 'Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  const roleBadgeClass: Record<string, string> = {
    USER:        'bg-ink-100 text-ink-600',
    ADMIN:       'bg-emerald-100 text-emerald-700',
    SUPER_ADMIN: 'bg-gold-100 text-gold-800',
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-xl">

      {/* Header */}
      <div>
        <p className="font-arabic text-gold-600 text-lg">الإعدادات</p>
        <h1 className="font-display text-ink-900 text-xl tracking-wide">Account Settings</h1>
      </div>

      {/* Profile info card */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-2">
          <User className="w-4 h-4 text-gold-500" />
          <h2 className="font-display text-ink-900 text-sm tracking-wide">Profile</h2>
        </div>
        <div className="px-5 py-5 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center flex-shrink-0 shadow-glow-gold">
            <span className="font-display text-white text-xl">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-display text-ink-900 text-base">{user?.name}</p>
            <p className="text-ink-500 font-body text-sm">{user?.email}</p>
            <span className={`inline-block mt-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-body font-medium ${
              roleBadgeClass[user?.role || 'USER']
            }`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Change password card */}
      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-gold-500" />
          <h2 className="font-display text-ink-900 text-sm tracking-wide">Change Password</h2>
          <p className="font-arabic text-gold-500 text-sm mr-1">تغيير كلمة المرور</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">

          <div>
            <Label>Current Password</Label>
            <PasswordInput
              value={form.currentPassword}
              onChange={(v) => setForm({ ...form, currentPassword: v })}
              placeholder="Your current password"
              autoComplete="current-password"
            />
          </div>

          <div>
            <Label>New Password</Label>
            <PasswordInput
              value={form.newPassword}
              onChange={(v) => setForm({ ...form, newPassword: v })}
              placeholder="Min. 8 chars, uppercase, lowercase, number"
              autoComplete="new-password"
            />
            <StrengthBar password={form.newPassword} />
          </div>

          <div>
            <Label>Confirm New Password</Label>
            <PasswordInput
              value={form.confirmPassword}
              onChange={(v) => setForm({ ...form, confirmPassword: v })}
              placeholder="Repeat your new password"
              autoComplete="new-password"
            />
            {/* Match indicator */}
            {form.confirmPassword && (
              <p className={`text-[11px] font-body mt-1 ${
                form.newPassword === form.confirmPassword ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {form.newPassword === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Requirements */}
          <div className="bg-ink-50 rounded-xl p-3.5 space-y-1.5">
            <p className="font-display text-ink-500 text-[10px] tracking-widest uppercase mb-2">Requirements</p>
            {[
              { label: 'At least 8 characters',        met: form.newPassword.length >= 8 },
              { label: 'One uppercase letter (A–Z)',    met: /[A-Z]/.test(form.newPassword) },
              { label: 'One lowercase letter (a–z)',    met: /[a-z]/.test(form.newPassword) },
              { label: 'One number (0–9)',              met: /\d/.test(form.newPassword) },
            ].map(({ label, met }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  met ? 'bg-emerald-100' : 'bg-ink-100'
                }`}>
                  <span className={`text-[10px] font-bold ${met ? 'text-emerald-600' : 'text-ink-400'}`}>
                    {met ? '✓' : '·'}
                  </span>
                </div>
                <p className={`text-[11px] font-body transition-colors ${met ? 'text-emerald-700' : 'text-ink-400'}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 font-body leading-relaxed">
              For security, you will be signed out automatically after changing your password and will need to sign in again with your new password.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || form.newPassword !== form.confirmPassword}
            className="btn-gold w-full py-3 mt-1 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            {saving ? 'Changing password…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
