import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('فشل تسجيل الدخول');

      // Verify Admin Role in profiles or admin_roles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const { data: adminRoleData } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      const isUserAdmin =
        profileData?.role === 'admin' ||
        profileData?.role === 'editor' ||
        adminRoleData?.role === 'admin' ||
        adminRoleData?.role === 'editor';

      if (!isUserAdmin) {
        // If not admin, set role in profiles if initial admin email or throw error
        throw new Error('هذا الحساب لا يملك صلاحية مدير (Admin)');
      }

      await refreshProfile();
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل تسجيل الدخول في لوحة الإدارة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 font-['Cairo',sans-serif]">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-purple-950/50">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black text-white">تسجيل دخول المشرفين</h1>
          <p className="mt-1 text-xs text-slate-400">منطقة خاصة لإدارة المحتوى وقاعدة البيانات</p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-rose-500/10 p-3.5 text-xs font-bold text-rose-400 border border-rose-500/30">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300">البريد الإلكتروني للإدارة</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 pr-10 text-sm font-semibold text-white outline-none focus:border-purple-500"
              />
              <Mail size={18} className="absolute right-3 top-3.5 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300">كلمة السر</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 pr-10 text-sm font-semibold text-white outline-none focus:border-purple-500"
              />
              <Lock size={18} className="absolute right-3 top-3.5 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm font-black text-white shadow-lg shadow-purple-900/40 hover:brightness-110 disabled:opacity-50"
          >
            {loading ? (
              <span>جاري التحقق من الصلاحيات...</span>
            ) : (
              <>
                <span>دخول لوحة التحكم</span>
                <ArrowLeft size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-800 pt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-bold text-slate-400 hover:text-white hover:underline"
          >
            العودة للموقع العام للأطفال
          </button>
        </div>
      </div>
    </div>
  );
};
