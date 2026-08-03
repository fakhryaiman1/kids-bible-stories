import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileCode2,
  LayoutGrid,
  HelpCircle,
  Users,
  Star,
  Plus,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Database,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    stories: 0,
    publishedStories: 0,
    pages: 0,
    categories: 0,
    quizzes: 0,
    users: 0,
    stars: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const { count: storiesCount } = await supabase.from('stories').select('*', { count: 'exact', head: true });
        const { count: pubCount } = await supabase.from('stories').select('*', { count: 'exact', head: true }).eq('published', true);
        const { count: pagesCount } = await supabase.from('story_pages').select('*', { count: 'exact', head: true });
        const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
        const { count: quizCount } = await supabase.from('quizzes').select('*', { count: 'exact', head: true });
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { data: starsData } = await supabase.from('profiles').select('stars');

        const totalStars = starsData?.reduce((acc, curr) => acc + (curr.stars || 0), 0) || 0;

        setStats({
          stories: storiesCount || 0,
          publishedStories: pubCount || 0,
          pages: pagesCount || 0,
          categories: catCount || 0,
          quizzes: quizCount || 0,
          users: usersCount || 0,
          stars: totalStars,
        });
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const statCards = [
    { label: 'إجمالي القصص', value: stats.stories, sub: `${stats.publishedStories} قصة منشورة`, icon: BookOpen, color: 'from-sky-500 to-cyan-500' },
    { label: 'إجمالي الصفحات', value: stats.pages, sub: 'صفحات تفاعلية', icon: FileCode2, color: 'from-purple-500 to-indigo-500' },
    { label: 'الفئات والأقسام', value: stats.categories, sub: 'فئات مفعلة', icon: LayoutGrid, color: 'from-emerald-500 to-teal-500' },
    { label: 'أسئلة الاختبارات', value: stats.quizzes, sub: 'سؤال تفاعلي', icon: HelpCircle, color: 'from-amber-500 to-orange-500' },
    { label: 'المستخدمين والأطفال', value: stats.users, sub: 'حسابات مسجلة', icon: Users, color: 'from-rose-500 to-pink-500' },
    { label: 'مجموع النجوم الممنوحة', value: stats.stars, sub: 'نجمة مكتسبة', icon: Star, color: 'from-yellow-400 to-amber-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-purple-900/60 via-slate-900 to-indigo-900/60 p-8 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-500/30">
              <Sparkles size={14} /> نظرة عامة لإنتاجية المنصة
            </div>
            <h1 className="text-3xl font-black text-white md:text-4xl">لوحة القيادة والمؤشرات</h1>
            <p className="mt-1 text-sm text-slate-300">متابعة إحصائيات المحتوى ونشاط الأطفال في الوقت الفعلي</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/stories"
              className="flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-purple-900/40 hover:bg-purple-500"
            >
              <Plus size={16} /> إضافة قصة جديدة
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400">{card.label}</p>
                  <h3 className="mt-2 text-3xl font-black text-white">
                    {loading ? '...' : card.value}
                  </h3>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">{card.sub}</p>
                </div>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-black text-white">إجراءات سريعة</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Link
            to="/admin/stories"
            className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 hover:border-purple-500/50 hover:bg-slate-900"
          >
            <div className="rounded-xl bg-sky-500/20 p-3 text-sky-400">
              <BookOpen size={20} />
            </div>
            <div>
              <span className="block text-sm font-bold text-white">إدارة القصص</span>
              <span className="text-[11px] text-slate-400">تعديل ونشر القصص</span>
            </div>
          </Link>

          <Link
            to="/admin/builder"
            className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 hover:border-purple-500/50 hover:bg-slate-900"
          >
            <div className="rounded-xl bg-purple-500/20 p-3 text-purple-400">
              <FileCode2 size={20} />
            </div>
            <div>
              <span className="block text-sm font-bold text-white">بناء الصفحات</span>
              <span className="text-[11px] text-slate-400">إضافة صور ونصوص</span>
            </div>
          </Link>

          <Link
            to="/admin/quizzes"
            className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 hover:border-purple-500/50 hover:bg-slate-900"
          >
            <div className="rounded-xl bg-amber-500/20 p-3 text-amber-400">
              <HelpCircle size={20} />
            </div>
            <div>
              <span className="block text-sm font-bold text-white">إضافة أسئلة</span>
              <span className="text-[11px] text-slate-400">اختبارات تفاعلية</span>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 hover:border-purple-500/50 hover:bg-slate-900"
          >
            <div className="rounded-xl bg-rose-500/20 p-3 text-rose-400">
              <Users size={20} />
            </div>
            <div>
              <span className="block text-sm font-bold text-white">أدوار المستخدمين</span>
              <span className="text-[11px] text-slate-400">تعيين الأدوار</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
