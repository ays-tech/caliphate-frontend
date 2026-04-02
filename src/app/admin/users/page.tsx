'use client';

import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { UserCheck, UserX, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const roleBadge: Record<string, string> = {
  USER:        'bg-ink-100 text-ink-600',
  ADMIN:       'bg-emerald-100 text-emerald-700',
  SUPER_ADMIN: 'bg-gold-100 text-gold-800',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const { user: me } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try { const res = await usersApi.getAll(); setUsers(res.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const approve = async (id: string, name: string) => {
    setActionId(id);
    try { await usersApi.approve(id); toast.success(`${name} approved`); fetchUsers(); }
    catch { toast.error('Failed'); } finally { setActionId(null); }
  };

  const promote = async (id: string, name: string) => {
    if (!confirm(`Promote ${name} to Admin?`)) return;
    setActionId(id);
    try { await usersApi.promote(id); toast.success(`${name} promoted to Admin`); fetchUsers(); }
    catch { toast.error('Failed'); } finally { setActionId(null); }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setActionId(id);
    try { await usersApi.delete(id); toast.success(`${name} deleted`); fetchUsers(); }
    catch { toast.error('Failed'); } finally { setActionId(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="font-arabic text-gold-600 text-lg">إدارة المستخدمين</p>
        <h1 className="font-display text-ink-900 text-xl tracking-wide">Users <span className="text-ink-400 font-body font-normal text-sm">({users.length})</span></h1>
      </div>

      <div className="bg-white rounded-2xl border border-ink-200 shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-ink-50 border-b border-ink-100">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Joined', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-display text-ink-500 text-[10px] tracking-widest uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-ink-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[11px] font-display">{u.name?.[0]}</span>
                        </div>
                        <span className="font-body font-medium text-ink-800 text-sm">{u.name}</span>
                        {u.id === me?.id && <span className="text-[10px] text-ink-400 font-body">(you)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-ink-500 font-body text-xs">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-body font-medium ${roleBadge[u.role]}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {u.approved
                        ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-body"><UserCheck className="w-3.5 h-3.5" /> Active</span>
                        : <span className="flex items-center gap-1 text-xs text-amber-600 font-body"><UserX className="w-3.5 h-3.5" /> Pending</span>
                      }
                    </td>
                    <td className="px-4 py-3.5 text-ink-400 text-xs font-body">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3.5">
                      {u.id !== me?.id && u.role !== 'SUPER_ADMIN' && (
                        <div className="flex items-center gap-1.5 justify-end">
                          {u.role === 'ADMIN' && !u.approved && (
                            <button onClick={() => approve(u.id, u.name)} disabled={actionId === u.id}
                              className="flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors font-body disabled:opacity-50"
                            >
                              <UserCheck className="w-3 h-3" /> Approve
                            </button>
                          )}
                          {u.role === 'USER' && (
                            <button onClick={() => promote(u.id, u.name)} disabled={actionId === u.id}
                              className="flex items-center gap-1 text-[11px] bg-gold-50 text-gold-700 border border-gold-100 px-2 py-1.5 rounded-lg hover:bg-gold-100 transition-colors font-body disabled:opacity-50"
                            >
                              <Shield className="w-3 h-3" /> Admin
                            </button>
                          )}
                          <button onClick={() => deleteUser(u.id, u.name)} disabled={actionId === u.id}
                            className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
