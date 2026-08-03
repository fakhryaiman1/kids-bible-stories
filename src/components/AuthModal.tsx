import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { refreshProfile } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || 'قارئ صغير' },
          },
        });
        if (error) throw error;

        setSuccessMsg('تم إنشاء الحساب بنجاح! يمكنك الآن الاستمتاع بقراءة القصص وجمع النجوم.');
        await refreshProfile();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        await refreshProfile();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-sky-950/20">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X size={18} />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {isSignUp ? 'إنشاء حساب جديد' : 'مرحباً بك مجدداً!'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isSignUp
              ? 'احفظ إنجازاتك واجمع النجوم في مكتبتك التفاعلية'
              : 'سجل دخولك لمتابعة قراءة قصصك المفضلة'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-center text-xs font-bold text-rose-600">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">الاسم / اسم الطفل</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: يوسف الصغير"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-medium text-slate-800 outline-none focus:border-sky-500 focus:bg-white"
                />
                <User size={18} className="absolute right-3 top-3 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-medium text-slate-800 outline-none focus:border-sky-500 focus:bg-white"
              />
              <Mail size={18} className="absolute right-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">كلمة السر</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-medium text-slate-800 outline-none focus:border-sky-500 focus:bg-white"
              />
              <Lock size={18} className="absolute right-3 top-3 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 py-3 text-sm font-black text-white shadow-lg shadow-sky-200 transition-all hover:brightness-105 disabled:opacity-50"
          >
            {loading
              ? 'جاري التحميل...'
              : isSignUp
              ? 'إنشاء الحساب وبدء المغامرة'
              : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-600">
          {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب بعد؟'}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-sky-600 hover:underline"
          >
            {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </button>
        </div>
      </div>
    </div>
  );
};
