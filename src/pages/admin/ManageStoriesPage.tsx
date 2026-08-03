import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Eye, EyeOff, Search, Sparkles } from 'lucide-react';
import { supabase, uploadAsset } from '../../lib/supabase';
import { Story, Category } from '../../types';

import { Link } from 'react-router-dom';

export const ManageStoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [ageGroup, setAgeGroup] = useState('7-12');
  const [testament, setTestament] = useState('العهد القديم');
  const [readingTime, setReadingTime] = useState(5);
  const [difficulty, setDifficulty] = useState('متوسط');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState('');

  const fetchStoriesData = async () => {
    setLoading(true);
    const { data: catData } = await supabase.from('categories').select('*').order('sort_order');
    const { data: storyData } = await supabase.from('stories').select('*, categories(*)').order('created_at', { ascending: false });

    if (catData) {
      setCategories(catData as Category[]);
      if (catData.length > 0 && !categoryId) setCategoryId(catData[0].id);
    }
    if (storyData) setStories(storyData as Story[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchStoriesData();
  }, []);

  const handleDuplicateStory = async (story: Story) => {
    const newSlug = `${story.slug}-copy-${Date.now().toString().slice(-4)}`;
    const { error } = await supabase.from('stories').insert({
      title: `${story.title} (نسخة)`,
      slug: newSlug,
      description: story.description,
      cover_image: story.cover_image,
      category_id: story.category_id,
      age_group: story.age_group,
      testament: story.testament,
      reading_time: story.reading_time,
      difficulty: story.difficulty,
      featured: story.featured,
      published: false,
    });
    if (!error) fetchStoriesData();
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      let finalCover = coverUrl;
      if (coverFile) {
        const uploaded = await uploadAsset(coverFile, 'story-assets');
        if (uploaded) finalCover = uploaded;
      }

      const generatedSlug =
        title
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '') + `-${Date.now().toString().slice(-4)}`;

      const { error } = await supabase.from('stories').insert({
        title,
        slug: generatedSlug,
        description,
        category_id: categoryId || categories[0]?.id,
        age_group: ageGroup,
        testament,
        reading_time: Number(readingTime),
        difficulty,
        featured,
        published,
        cover_image: finalCover || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
      });

      if (error) throw error;

      setMsg('تمت إضافة القصة بنجاح إلى قاعدة البيانات!');
      setTitle('');
      setDescription('');
      setCoverFile(null);
      setCoverUrl('');
      fetchStoriesData();
    } catch (err: any) {
      setMsg(err.message || 'خطأ أثناء حفظ القصة');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    const { error } = await supabase.from('stories').update({ published: !currentPublished }).eq('id', id);
    if (!error) fetchStoriesData();
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm('هل أنت تأكد من رغبتك في حذف القصة؟')) return;
    const { error } = await supabase.from('stories').delete().eq('id', id);
    if (!error) fetchStoriesData();
  };

  const filteredStories = stories.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة القصص والمحتوى</h1>
          <p className="text-xs text-slate-400">إضافة وتعديل وحذف ونشر القصص من Supabase</p>
        </div>
      </div>

      {msg && (
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 text-xs font-bold text-purple-300">
          {msg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* Form */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-black text-white">إضافة قصة جديدة</h2>
          <form onSubmit={handleCreateStory} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">عنوان القصة</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان القصة..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-semibold text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">الوصف</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="تفاصيل مختصرة عن القصة..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-semibold text-white outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">الفئة</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-slate-200 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">العهد</label>
                <select
                  value={testament}
                  onChange={(e) => setTestament(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-slate-200 outline-none"
                >
                  <option value="العهد القديم">العهد القديم</option>
                  <option value="العهد الجديد">العهد الجديد</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">صورة الغلاف (ملف أو رابط)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="mb-2 block w-full text-xs font-bold text-slate-400"
              />
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded accent-purple-600"
                />
                <span>قصة مميزة</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 rounded accent-purple-600"
                />
                <span>منشورة فوراً</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-purple-600 py-3 text-xs font-black text-white shadow-lg shadow-purple-900/40 hover:bg-purple-500 disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ القصة'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في القصص..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-3 pr-10 pl-4 text-xs font-semibold text-white outline-none"
            />
            <Search size={16} className="absolute right-3.5 top-3.5 text-slate-500" />
          </div>

          <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={story.cover_image || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80'}
                    alt={story.title}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-white">{story.title}</h4>
                    <p className="text-[11px] text-slate-400">{story.testament} • {story.age_group} سنة</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/story/${story.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 rounded-xl bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
                    title="معاينة العرض العام"
                  >
                    <Eye size={14} />
                    <span>عرض</span>
                  </Link>

                  <Link
                    to={`/admin/stories/${story.id}/edit`}
                    className="flex items-center gap-1 rounded-xl bg-purple-600/20 px-2.5 py-1.5 text-xs font-bold text-purple-400 hover:bg-purple-600 hover:text-white"
                    title="تعديل القصة في نظام CMS"
                  >
                    <Sparkles size={14} />
                    <span>تعديل</span>
                  </Link>

                  <button
                    onClick={() => handleDuplicateStory(story)}
                    className="flex items-center gap-1 rounded-xl bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
                    title="نسخ القصة"
                  >
                    <span>📋</span>
                    <span>نسخ</span>
                  </button>

                  <button
                    onClick={() => handleTogglePublish(story.id, story.published)}
                    className={`rounded-xl p-2 text-xs font-bold ${
                      story.published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                    title={story.published ? 'منشورة (إلغاء النشر)' : 'مسودة (نشر)'}
                  >
                    {story.published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>

                  <button
                    onClick={() => handleDeleteStory(story.id)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                    title="حذف القصة"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
