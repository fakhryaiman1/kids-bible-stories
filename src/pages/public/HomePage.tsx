import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Trophy, ArrowLeft, Star, Search, Flame, Megaphone, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Story, Category, Announcement } from '../../types';
import { StoryCard } from '../../components/StoryCard';

export const HomePage: React.FC = () => {
  const { onOpenAuth } = useOutletContext<{ onOpenAuth: () => void }>();
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        const { data: storyData } = await supabase
          .from('stories')
          .select('*, categories(*)')
          .eq('published', true)
          .order('created_at', { ascending: false });

        const { data: announceData } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(2);

        if (categoryData) setCategories(categoryData as Category[]);
        if (storyData) setStories(storyData as Story[]);
        if (announceData) setAnnouncements(announceData as Announcement[]);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const featuredStory = stories.find((s) => s.featured) || stories[0];
  const recentStories = stories.slice(0, 6);

  return (
    <div className="space-y-12">
      {/* Announcements Bar */}
      {announcements.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-3 text-white shadow-md">
          <div className="flex items-center gap-2 font-black text-amber-100">
            <Megaphone size={18} className="animate-bounce" />
            <span>إعلان هام:</span>
          </div>
          <p className="text-sm font-bold">{announcements[0].title} — {announcements[0].body}</p>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/70 p-6 shadow-xl shadow-sky-100/50 backdrop-blur-md md:p-12">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center space-y-6"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-sky-100/80 px-4 py-1.5 text-xs font-black text-sky-800 backdrop-blur-sm">
              <Sparkles size={14} className="text-sky-600" /> رحلة إيمانية وتفاعلية للأطفال
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-6xl">
              اكتشف أجمل <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">قصص الكتاب المقدس</span> للأطفال
            </h1>

            <p className="max-w-xl text-base text-slate-600 md:text-lg">
              قصص ممتعة مصحوبة بالصور الرائعة، الأسئلة التفاعلية، ونظام المكافآت بالنجوم الذي يشجع طفلك على التعلم والاستمتاع بالقراءة يومياً.
            </p>

            {/* Quick Search */}
            <div className="relative max-w-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن قصة (مثال: داود والعملاق)..."
                className="w-full rounded-full border border-slate-200 bg-white/90 py-3.5 pr-12 pl-32 text-sm font-semibold text-slate-800 shadow-md outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
              <Search size={20} className="absolute right-4 top-3.5 text-slate-400" />
              <Link
                to={searchQuery ? `/stories?search=${encodeURIComponent(searchQuery)}` : '/stories'}
                className="absolute left-2 top-1.5 rounded-full bg-sky-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-sky-200 hover:bg-sky-600"
              >
                بحث
              </Link>
            </div>

            {/* CTA Buttons - Strictly Public */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/stories"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-4 text-base font-black text-white shadow-lg shadow-sky-200 transition-transform hover:scale-105"
              >
                <BookOpen size={20} /> ابدأ القراءة الآن
              </Link>
              <Link
                to="/categories"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-6 py-4 text-base font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
              >
                استكشف الفئات
              </Link>
            </div>
          </motion.div>

          {/* Featured Card Side */}
          {featuredStory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-400 via-cyan-400 to-indigo-500 p-1 shadow-2xl"
            >
              <div className="relative flex flex-col justify-between overflow-hidden rounded-[1.4rem] bg-slate-900/40 p-6 text-white backdrop-blur-md">
                <div className="mb-8 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-black text-slate-900 shadow-md">
                    <Trophy size={14} /> القصة المميزة اليوم
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                    {featuredStory.testament}
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-black">{featuredStory.title}</h2>
                  <p className="line-clamp-3 text-sm text-slate-200">
                    {featuredStory.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span>{featuredStory.reading_time} دقائق قراءة</span>
                    </div>
                    <Link
                      to={`/story/${featuredStory.slug}`}
                      className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black text-sky-900 shadow-lg transition-transform hover:scale-105"
                    >
                      اقرأ القصة المميزة <ArrowLeft size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">تصفح الفئات</h2>
            <p className="text-sm text-slate-500">اختر قسمك المفضل وابدأ الاستكشاف</p>
          </div>
          <Link to="/categories" className="text-sm font-bold text-sky-600 hover:underline">
            عرض كافة الفئات
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/stories?category=${cat.id}`}
              className="group flex flex-col items-center justify-center rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-sky-100"
            >
              <div
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-inner transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                {cat.icon}
              </div>
              <span className="text-sm font-black text-slate-800">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Stories Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Flame size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">أحدث القصص التفاعلية</h2>
              <p className="text-sm text-slate-500">قصص جديدة تضاف بانتظام</p>
            </div>
          </div>
          <Link
            to="/stories"
            className="flex items-center gap-1 text-sm font-bold text-sky-600 hover:underline"
          >
            عرض المكتبة كاملة <ArrowLeft size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl bg-slate-200/60" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentStories.map((story) => (
              <StoryCard key={story.id} story={story} onOpenAuth={onOpenAuth} />
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights */}
      <section className="grid gap-6 rounded-3xl border border-white/80 bg-gradient-to-br from-sky-50 via-indigo-50 to-amber-50 p-8 shadow-inner md:grid-cols-3">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-200">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900">قراءة تفاعلية بالصفحات</h3>
          <p className="mt-2 text-sm text-slate-600">
            صفحات مصورة، مريحة للعين، تدعم القراءة الصوتية والتنقل السلس.
          </p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-200">
            <Trophy size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900">اختبارات ومكافآت</h3>
          <p className="mt-2 text-sm text-slate-600">
            أسئلة ممتعة بعد كل قصة واكتساب نجوم تضاف لملف الطفل الشخصي.
          </p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-200">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900">مزامنة التقدم بـ Supabase</h3>
          <p className="mt-2 text-sm text-slate-600">
            حفظ تلقائي للنجوم والقصص المكتملة في حساب الطفل الشخصي.
          </p>
        </div>
      </section>
    </div>
  );
};
