import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileCode2,
  LayoutGrid,
  HelpCircle,
  Users,
  Trophy,
  Image,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'لوحة القيادة', icon: LayoutDashboard },
    { path: '/admin/stories', label: 'إدارة القصص', icon: BookOpen },
    { path: '/admin/builder', label: 'بناء القصة بالصفحات', icon: FileCode2 },
    { path: '/admin/categories', label: 'إدارة الفئات', icon: LayoutGrid },
    { path: '/admin/quizzes', label: 'إدارة الاختبارات', icon: HelpCircle },
    { path: '/admin/users', label: 'المستخدمين والأدوار', icon: Users },
    { path: '/admin/achievements', label: 'الأوسمة والإنجازات', icon: Trophy },
    { path: '/admin/media', label: 'مكتبة الوسائط', icon: Image },
    { path: '/admin/analytics', label: 'الإحصائيات والتحليلات', icon: BarChart3 },
    { path: '/admin/settings', label: 'الإعدادات والإعلانات', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-['Cairo',sans-serif] dir-rtl" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-slate-800 bg-slate-900/95 p-6 backdrop-blur-md transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-900/40">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="text-base font-black text-white">لوحة التحكم</span>
              <span className="block text-[10px] font-bold tracking-wider text-purple-400 uppercase">
                Admin Console
              </span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                <ChevronLeft size={14} className="opacity-40" />
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile Footer */}
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <div className="mb-3 flex items-center justify-between rounded-2xl bg-slate-800/50 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 font-black text-purple-400">
                {profile?.name?.[0] || 'A'}
              </div>
              <div className="overflow-hidden text-right">
                <p className="truncate text-xs font-black text-white">{profile?.name || user?.email?.split('@')[0]}</p>
                <span className="inline-block rounded-md bg-purple-500/20 px-2 py-0.5 text-[9px] font-bold text-purple-300">
                  {profile?.role || 'admin'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Workspace Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Admin Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-black text-slate-200">نظام إدارة المحتوى والتطبيقات</h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <span>معاينة الموقع العام</span>
              <ExternalLink size={14} />
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-xl bg-rose-600/20 px-3.5 py-2 text-xs font-bold text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white"
            >
              <LogOut size={14} />
              <span>خروج</span>
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
