import React, { useEffect, useState } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { Search, Sparkles, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Story, Category } from '../../types';
import { StoryCard } from '../../components/StoryCard';

export const StoriesPage: React.FC = () => {
  const { onOpenAuth } = useOutletContext<{ onOpenAuth: () => void }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedTestament, setSelectedTestament] = useState(searchParams.get('testament') || 'all');
  const [selectedAge, setSelectedAge] = useState(searchParams.get('age') || 'all');

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      if (data) setCategories(data as Category[]);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchFilteredStories = async () => {
      setLoading(true);
      try {
        let query = supabase.from('stories').select('*, categories(*)').eq('published', true);

        if (selectedCategory !== 'all') {
          query = query.eq('category_id', selectedCategory);
        }
        if (selectedTestament !== 'all') {
          query = query.eq('testament', selectedTestament);
        }
        if (selectedAge !== 'all') {
          query = query.eq('age_group', selectedAge);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (!error && data) {
          let filtered = data as Story[];
          if (search.trim()) {
            const queryLower = search.toLowerCase();
            filtered = filtered.filter(
              (s) =>
                s.title.toLowerCase().includes(queryLower) ||
                s.description.toLowerCase().includes(queryLower)
            );
          }
          setStories(filtered);
        }
      } catch (err) {
        console.error('Error loading stories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredStories();
  }, [search, selectedCategory, selectedTestament, selectedAge]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedTestament('all');
    setSelectedAge('all');
    setSearchParams({});
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-white/80 bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
              <Sparkles size={14} /> المكتبة التفاعلية
            </div>
            <h1 className="text-3xl font-black md:text-4xl">مكتبة قصص الكتاب المقدس</h1>
            <p className="mt-2 text-sm text-sky-100 md:text-base">
              تصفح جميع القصص، تصفية الفئات، واختر القصة المناسبة لعمرك واهتمامك
            </p>
          </div>
          <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-md">
            <span className="block text-2xl font-black">{stories.length}</span>
            <span className="text-xs font-bold text-sky-100">قصة متاحة الآن</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-3xl border border-white/80 bg-white/80 p-6 shadow-lg shadow-sky-100/50 backdrop-blur-md">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search Input */}
          <div className="relative md:col-span-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن قصة بالاسم أو الوصف..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-4 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500 focus:bg-white"
            />
            <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
          </div>

          {/* Category Filter */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">الفئة / الموضوع</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-500"
            >
              <option value="all">كافة الفئات 📖</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Testament Filter */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">العهد</label>
            <select
              value={selectedTestament}
              onChange={(e) => setSelectedTestament(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-500"
            >
              <option value="all">الكل (العهد القديم والجديد)</option>
              <option value="العهد القديم">📜 العهد القديم</option>
              <option value="العهد الجديد">✨ العهد الجديد</option>
            </select>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">الفئة العمرية</label>
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-500"
            >
              <option value="all">كافة الأعمار</option>
              <option value="3-6">🧸 للأطفال (3-6) سنوات</option>
              <option value="7-12">🧒 للناشئين (7-12) سنة</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-300"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-3xl bg-slate-200/60" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="rounded-3xl bg-white/80 p-12 text-center shadow-md">
          <BookOpen size={48} className="mx-auto mb-3 text-slate-400" />
          <h3 className="text-xl font-black text-slate-800">لم يتم العثور على قصص مطابقة</h3>
          <p className="mt-1 text-sm text-slate-500">جرب البحث بكلمات أخرى أو قم بإلغاء الفلاتر.</p>
          <button
            onClick={handleResetFilters}
            className="mt-4 rounded-full bg-sky-500 px-6 py-2 text-xs font-bold text-white shadow-md"
          >
            عرض كافة القصص
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} onOpenAuth={onOpenAuth} />
          ))}
        </div>
      )}
    </div>
  );
};
