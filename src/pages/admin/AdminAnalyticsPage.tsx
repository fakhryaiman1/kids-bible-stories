import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminAnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalCompleted: 0,
    totalStars: 0,
    activeReaders: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: progress } = await supabase.from('user_progress').select('*');
      const { data: profiles } = await supabase.from('profiles').select('stars');

      const completed = progress?.filter((p) => p.completed)?.length || 0;
      const stars = profiles?.reduce((a, b) => a + (b.stars || 0), 0) || 0;

      setMetrics({
        totalCompleted: completed,
        totalStars: stars,
        activeReaders: profiles?.length || 0,
      });
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">التحليلات ومعدلات القراءة</h1>
        <p className="text-xs text-slate-400">تقارير التفاعل والإنجازات اليومية للأطفال</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="flex items-center gap-3 text-purple-400">
            <BookOpen size={24} />
            <span className="text-xs font-bold text-slate-400">إجمالي القصص المكتملة</span>
          </div>
          <h3 className="mt-4 text-4xl font-black text-white">{metrics.totalCompleted}</h3>
          <p className="mt-1 text-xs text-emerald-400">قراءة ناجحة بالكامل</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="flex items-center gap-3 text-amber-400">
            <Star size={24} />
            <span className="text-xs font-bold text-slate-400">مجموع النجوم والمكافآت</span>
          </div>
          <h3 className="mt-4 text-4xl font-black text-white">{metrics.totalStars}</h3>
          <p className="mt-1 text-xs text-amber-400">نجمة مكتسبة للأطفال</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="flex items-center gap-3 text-sky-400">
            <Users size={24} />
            <span className="text-xs font-bold text-slate-400">المستخدمون والقراء الأنشط</span>
          </div>
          <h3 className="mt-4 text-4xl font-black text-white">{metrics.activeReaders}</h3>
          <p className="mt-1 text-xs text-sky-400">طفل قارئ مسجل</p>
        </div>
      </div>
    </div>
  );
};
