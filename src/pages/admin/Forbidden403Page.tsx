import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Forbidden403Page: React.FC = () => {
  const { signOut, user, profile } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-rose-500/20 text-rose-500 border border-rose-500/30">
        <ShieldAlert size={56} />
      </div>

      <span className="rounded-full bg-rose-500/10 px-4 py-1.5 text-xs font-black text-rose-400 border border-rose-500/20">
        403 Forbidden Access
      </span>

      <h1 className="mt-4 text-3xl font-black md:text-5xl">غير مصرح بالدخول</h1>

      <p className="mt-3 max-w-md text-sm text-slate-400 leading-relaxed">
        عذراً، الحساب الحالي ({user?.email}) مسجل كـ <span className="font-bold text-amber-400">"{profile?.role || 'مستخدم عادي'}"</span> ولا يملك صلاحية الوصول للوحة التحكم الإدارية.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-2xl bg-slate-800 px-6 py-3 text-sm font-bold text-white border border-slate-700 hover:bg-slate-700"
        >
          <Home size={18} /> العودة للموقع الرئيسي
        </Link>

        <Link
          to="/admin/login"
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-purple-900/40"
        >
          <ArrowRight size={18} /> تسجيل الدخول بحساب مشرف
        </Link>
      </div>
    </div>
  );
};
