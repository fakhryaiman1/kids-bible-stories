import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trophy, Bookmark, BookOpen, Flame, UserCheck, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Achievement, Story } from '../types';
import { StoryCard } from '../components/StoryCard';

type ProfilePageProps = {
  onOpenAuth: () => void;
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenAuth }) => {
  const { user, profile, favorites, signOut } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [favoriteStories, setFavoriteStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const { data: achData } = await supabase
          .from('achievements')
          .select('*')
          .order('required_stories', { ascending: true });

        if (achData) setAchievements(achData as Achievement[]);

        if (favorites.length > 0) {
          const { data: favStoriesData } = await supabase
            .from('stories')
            .select('*, categories(*)')
            .in('id', favorites);

          if (favStoriesData) setFavoriteStories(favStoriesData as Story[]);
        } else {
          setFavoriteStories([]);
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [favorites]);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-white/80 bg-white/90 p-8 text-center shadow-xl backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          <Sparkles size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">سجل دخولك لحفظ نجومك وإنجازاتك</h2>
        <p className="mt-2 text-sm text-slate-600">
          إنشاء حساب يتيح لك حفظ القصص المفضلة، متابعة شريط التقدم، وجمع الأوسمة والنجوم.
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

  const completedCount = profile?.completed_stories || 0;
  const totalStars = profile?.stars || 0;

  return (
    <div className="space-y-10">
      {/* Profile Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl shadow-inner backdrop-blur-md border-2 border-white/40">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
              ) : (
                '🧒'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black md:text-3xl">{profile?.name || user.email?.split('@')[0]}</h1>
                <span className="rounded-full bg-amber-400 px-3 py-0.5 text-xs font-black text-slate-900">
                  قارئ مميز
                </span>
              </div>
              <p className="mt-1 text-xs text-sky-100">{user.email}</p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30"
          >
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>

        {/* Stats Strip */}
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/20 pt-6 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-amber-300">
              <Star size={20} className="fill-amber-300" />
              <span className="text-2xl font-black md:text-3xl">{totalStars}</span>
            </div>
            <span className="text-xs font-bold text-sky-100">مجموع النجوم</span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-emerald-300">
              <BookOpen size={20} />
              <span className="text-2xl font-black md:text-3xl">{completedCount}</span>
            </div>
            <span className="text-xs font-bold text-sky-100">قصص مكتملة</span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-rose-300">
              <Flame size={20} />
              <span className="text-2xl font-black md:text-3xl">{profile?.reading_streak || 1} د</span>
            </div>
            <span className="text-xs font-bold text-sky-100">أيام القراءة المتتالية</span>
          </div>
        </div>
      </div>

      {/* Achievements Showcase */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-500" size={24} />
          <h2 className="text-2xl font-black text-slate-900">الأوسمة والإنجازات</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {achievements.map((ach) => {
            const isUnlocked =
              (ach.required_stories > 0 && completedCount >= ach.required_stories) ||
              (ach.required_points > 0 && totalStars >= ach.required_points);

            return (
              <div
                key={ach.id}
                className={`relative flex items-center gap-4 rounded-3xl border p-4 transition-all ${
                  isUnlocked
                    ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-md'
                    : 'border-slate-200 bg-slate-100/60 opacity-60'
                }`}
              >
                <div className="text-3xl">{ach.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{ach.title}</h3>
                    {isUnlocked && <UserCheck size={14} className="text-emerald-500" />}
                  </div>
                  <p className="text-xs text-slate-500">{ach.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Favorites Library */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark className="text-rose-500" size={24} />
          <h2 className="text-2xl font-black text-slate-900">قصصي المفضلة</h2>
        </div>

        {favoriteStories.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <Bookmark size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">لا توجد قصص في المفضلة بعد</p>
            <p className="text-xs text-slate-400">انقر على زر الحفظ فوق أي قصة لإضافتها هنا.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favoriteStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
