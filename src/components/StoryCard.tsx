import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Bookmark, Clock, Sparkles, Star } from 'lucide-react';
import { Story } from '../types';
import { useAuth } from '../context/AuthContext';

type StoryCardProps = {
  story: Story;
  onOpenAuth?: () => void;
};

export const StoryCard: React.FC<StoryCardProps> = ({ story, onOpenAuth }) => {
  const { user, favorites, toggleFavorite } = useAuth();
  const isFav = favorites.includes(story.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    await toggleFavorite(story.id);
  };

  const categoryColor = story.categories?.color || '#38bdf8';

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-lg shadow-sky-100/60 transition-all hover:shadow-xl hover:shadow-sky-200/60"
    >
      {/* Cover Header */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-sky-200 via-indigo-100 to-amber-100">
        {story.cover_image ? (
          <img
            src={story.cover_image}
            alt={story.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-sky-400 via-cyan-300 to-indigo-300 p-6 text-white">
            <BookOpen size={48} className="opacity-80" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all ${
            isFav
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/70 text-slate-700 hover:bg-white hover:text-rose-500'
          }`}
          title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        >
          <Bookmark size={18} className={isFav ? 'fill-white' : ''} />
        </button>

        {/* Category Badge */}
        {story.categories && (
          <span
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md"
            style={{ backgroundColor: `${categoryColor}cc` }}
          >
            <span>{story.categories.icon}</span>
            <span>{story.categories.name}</span>
          </span>
        )}

        {/* Story Title overlay */}
        <div className="absolute bottom-3 right-3 left-3">
          <span className="mb-1 inline-block rounded-md bg-white/30 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-md">
            {story.testament}
          </span>
          <h3 className="line-clamp-1 text-xl font-black text-white drop-shadow-sm">
            {story.title}
          </h3>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <p className="line-clamp-2 text-sm text-slate-600">
          {story.description}
        </p>

        <div className="mt-4 space-y-3 pt-2">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
              <Clock size={12} /> {story.reading_time} دقائق
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
              <Sparkles size={12} /> العمر: {story.age_group}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
              المستوى: {story.difficulty}
            </span>
          </div>

          {/* Action button */}
          <Link
            to={`/story/${story.slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-sm font-black text-white shadow-md shadow-sky-200 transition-all hover:brightness-105 active:scale-95"
          >
            <BookOpen size={16} /> اقرأ القصة الآن
          </Link>
        </div>
      </div>
    </motion.article>
  );
};
