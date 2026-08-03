import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Sparkles, UserCircle2, Star, ShieldCheck, Library, Home, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-4 md:px-8">
      <div className="mx-auto max-w-7xl rounded-full border border-white/80 bg-white/85 px-5 py-3 shadow-lg shadow-sky-100/50 backdrop-blur-md transition-all">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-md shadow-sky-200 transition-transform group-hover:scale-105">
              <BookOpen size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">قصص الكتاب المقدس</span>
              <span className="mr-2 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">للأطفال 🌟</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              to="/"
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                isActive('/') ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Home size={16} /> الرئيسية
            </Link>
            <Link
              to="/stories"
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                isActive('/stories') ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Library size={16} /> مكتبة القصص
            </Link>
            <Link
              to="/admin"
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                isActive('/admin') ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck size={16} /> لوحة الإدارة
            </Link>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-800 shadow-sm transition-transform hover:scale-105"
                >
                  <Star size={16} className="fill-amber-400 text-amber-500" />
                  <span>{profile?.stars ?? 0} نجوم</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200"
                >
                  <UserCircle2 size={18} className="text-sky-600" />
                  <span className="hidden sm:inline">{profile?.name || user.email?.split('@')[0]}</span>
                </Link>
                <button
                  onClick={signOut}
                  title="تسجيل الخروج"
                  className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-sky-200 transition-transform hover:scale-105 active:scale-95"
              >
                <Sparkles size={16} /> تسجيل الدخول
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 md:hidden"
            >
              <Library size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 md:hidden">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2.5 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-600"
            >
              الرئيسية
            </Link>
            <Link
              to="/stories"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2.5 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-600"
            >
              مكتبة القصص
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2.5 text-sm font-bold text-purple-700 hover:bg-purple-50"
            >
              لوحة الإدارة
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
