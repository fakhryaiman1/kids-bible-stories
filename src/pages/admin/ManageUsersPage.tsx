import React, { useEffect, useState } from 'react';
import { Users, Shield, Star, Award, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';

export const ManageUsersPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setProfiles(data as Profile[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);

    if (!error) {
      // Also sync admin_roles table
      if (newRole === 'admin') {
        await supabase.from('admin_roles').upsert({ user_id: userId, role: 'admin' });
      } else {
        await supabase.from('admin_roles').delete().eq('user_id', userId);
      }
      fetchUsers();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة المستخدمين والأدوار</h1>
        <p className="text-xs text-slate-400">عرض الحسابات المسجلة وتحديد صلاحيات المشرفين (Admin/User)</p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-black text-white">المستخدمون المسجلون ({profiles.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="p-3">المستخدم</th>
                <th className="p-3">البريد الإلكتروني</th>
                <th className="p-3">النجوم</th>
                <th className="p-3">القصص المكتملة</th>
                <th className="p-3">الدور الحسابي</th>
                <th className="p-3 text-center">تغيير الصلاحية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-950/40">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 font-black">
                      {p.name?.[0] || 'U'}
                    </div>
                    <span>{p.name || 'قارئ صغير'}</span>
                  </td>
                  <td className="p-3 text-slate-300">{p.email || 'غير محدد'}</td>
                  <td className="p-3 font-black text-amber-400">{p.stars || 0} ★</td>
                  <td className="p-3 text-emerald-400 font-bold">{p.completed_stories || 0} قصة</td>
                  <td className="p-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-black ${p.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      {p.role || 'user'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleToggleRole(p.id, p.role || 'user')}
                      className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all ${p.role === 'admin' ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
                    >
                      {p.role === 'admin' ? 'تحويل لمستخدم عادي' : 'ترقية لمنصب مدير (Admin)'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
