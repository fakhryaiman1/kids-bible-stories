import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Sparkles, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (data) setCategories(data as Category[]);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-3xl border border-white/80 bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 p-8 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-md">
            <LayoutGrid size={28} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold backdrop-blur-md">
              <Sparkles size={12} /> التصفح بالفئات
            </div>
            <h1 className="text-3xl font-black md:text-4xl">فئات الكتاب المقدس</h1>
            <p className="mt-1 text-sm text-sky-100">اختر الفئة التي ترغب في استكشاف قصصها</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-3xl bg-slate-200/60" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/stories?category=${cat.id}`}
              className="group flex flex-col items-center justify-center rounded-3xl border border-white/80 bg-white/90 p-6 shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-lg hover:shadow-sky-100"
            >
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-inner transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                {cat.icon}
              </div>
              <span className="text-base font-black text-slate-900">{cat.name}</span>
              <span className="mt-1 text-xs font-bold text-slate-500">استكشف القصص</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
