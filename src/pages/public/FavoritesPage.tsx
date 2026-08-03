import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bookmark, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Story } from '../../types';
import { StoryCard } from '../../components/StoryCard';

export const FavoritesPage: React.FC = () => {
  const { user, favorites } = useAuth();
  const { onOpenAuth } = useOutletContext<{ onOpenAuth: () => void }>();
  const [favoriteStories, setFavoriteStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      if (user && favorites.length > 0) {
        const { data } = await supabase
          .from('stories')
          .select('*, categories(*)')
          .in('id', favorites);

        if (data) setFavoriteStories(data as Story[]);
      } else {
        setFavoriteStories([]);
      }
      setLoading(false);
    };

    fetchFavorites();
  }, [user, favorites]);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-white/80 bg-white/90 p-8 text-center shadow-xl">
        <Bookmark size={48} className="mx-auto mb-3 text-rose-500" />
        <h2 className="text-2xl font-black text-slate-900">قصصك المفضلة</h2>
        <p className="mt-2 text-sm text-slate-600">
          سجل دخولك لحفظ القصص التي تحبها في مكتبتك المفضلة والوصول إليها بسرعة في أي وقت.
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-6 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-sky-200"
        >
          تسجيل الدخول / حساب جديد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-3xl border border-white/80 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold backdrop-blur-md">
              <Sparkles size={14} /> مكتبتك الخاصة
            </div>
            <h1 className="text-3xl font-black md:text-4xl">القصص المفضلة</h1>
            <p className="mt-1 text-sm text-rose-100">القصص التي قمت بحفظها لإعادة قراءتها بسهولة</p>
          </div>
          <div className="rounded-2xl bg-white/20 p-4 text-center backdrop-blur-md">
            <span className="block text-3xl font-black">{favoriteStories.length}</span>
            <span className="text-xs font-bold text-rose-100">قصة محفوظة</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-3xl bg-slate-200/60" />
          ))}
        </div>
      ) : favoriteStories.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-md">
          <Bookmark size={48} className="mx-auto mb-3 text-slate-300" />
          <h3 className="text-xl font-black text-slate-800">لا توجد قصص محفوظة بعد</h3>
          <p className="mt-1 text-sm text-slate-500">
            انقر على أيقونة العلامة فوق القصة لحفظها هنا!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favoriteStories.map((story) => (
            <StoryCard key={story.id} story={story} onOpenAuth={onOpenAuth} />
          ))}
        </div>
      )}
    </div>
  );
};
