import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Upload,
  BookOpen,
  Layers,
  HelpCircle,
  Megaphone,
  Check,
  X,
  Sparkles,
  LayoutGrid,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';
import { supabase, uploadAsset } from '../lib/supabase';
import { Story, Category, StoryPage, Quiz, Announcement } from '../types';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stories' | 'pages' | 'quizzes' | 'categories' | 'announcements'>('stories');
  
  // Data state
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Stats state
  const [stats, setStats] = useState({
    stories: 0,
    pages: 0,
    categories: 0,
    quizzes: 0,
    users: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Forms state
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');

  // New Story Form state
  const [storyTitle, setStoryTitle] = useState('');
  const [storySlug, setStorySlug] = useState('');
  const [storyDesc, setStoryDesc] = useState('');
  const [storyCatId, setStoryCatId] = useState('');
  const [storyAge, setStoryAge] = useState('7-12');
  const [storyTestament, setStoryTestament] = useState('العهد القديم');
  const [storyReadingTime, setStoryReadingTime] = useState(5);
  const [storyDifficulty, setStoryDifficulty] = useState('متوسط');
  const [storyFeatured, setStoryFeatured] = useState(false);
  const [storyPublished, setStoryPublished] = useState(true);
  const [storyCoverFile, setStoryCoverFile] = useState<File | null>(null);
  const [storyCoverUrl, setStoryCoverUrl] = useState('');

  // New Page Form state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pageImageFile, setPageImageFile] = useState<File | null>(null);
  const [pageImageUrl, setPageImageUrl] = useState('');

  // New Category Form state
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('📖');
  const [catColor, setCatColor] = useState('#38bdf8');
  const [catOrder, setCatOrder] = useState(1);

  // New Announcement Form state
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceBody, setAnnounceBody] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { data: catData } = await supabase.from('categories').select('*').order('sort_order');
      const { data: storyData } = await supabase.from('stories').select('*, categories(*)').order('created_at', { ascending: false });
      const { data: annData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });

      // Counts
      const { count: pagesCount } = await supabase.from('story_pages').select('*', { count: 'exact', head: true });
      const { count: quizzesCount } = await supabase.from('quizzes').select('*', { count: 'exact', head: true });
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      if (catData) setCategories(catData as Category[]);
      if (storyData) {
        setStories(storyData as Story[]);
        if (storyData.length > 0 && !selectedStoryId) {
          setSelectedStoryId(storyData[0].id);
        }
      }
      if (annData) setAnnouncements(annData as Announcement[]);

      setStats({
        stories: storyData?.length || 0,
        pages: pagesCount || 0,
        categories: catData?.length || 0,
        quizzes: quizzesCount || 0,
        users: usersCount || 0,
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch pages for selected story
  useEffect(() => {
    if (!selectedStoryId) return;
    const fetchStoryPages = async () => {
      const { data } = await supabase
        .from('story_pages')
        .select('*')
        .eq('story_id', selectedStoryId)
        .order('page_number', { ascending: true });

      if (data) {
        setPages(data as StoryPage[]);
        setPageNumber(data.length + 1);
      }
    };

    fetchStoryPages();
  }, [selectedStoryId]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  // Create Story Action
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalCover = storyCoverUrl;

      if (storyCoverFile) {
        const uploaded = await uploadAsset(storyCoverFile, 'story-assets');
        if (uploaded) finalCover = uploaded;
      }

      const generatedSlug =
        storySlug.trim() ||
        storyTitle
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '') + `-${Date.now().toString().slice(-4)}`;

      const { error } = await supabase.from('stories').insert({
        title: storyTitle,
        slug: generatedSlug,
        description: storyDesc,
        category_id: storyCatId || categories[0]?.id,
        age_group: storyAge,
        testament: storyTestament,
        reading_time: Number(storyReadingTime),
        difficulty: storyDifficulty,
        featured: storyFeatured,
        published: storyPublished,
        cover_image: finalCover || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
      });

      if (error) throw error;

      showNotification('تمت إضافة القصة بنجاح إلى قاعدة البيانات!');
      setStoryTitle('');
      setStorySlug('');
      setStoryDesc('');
      setStoryCoverFile(null);
      setStoryCoverUrl('');
      await fetchAllData();
    } catch (err: any) {
      showNotification(err.message || 'حدث خطأ أثناء إضافة القصة', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    const { error } = await supabase
      .from('stories')
      .update({ published: !currentPublished })
      .eq('id', id);

    if (!error) {
      showNotification('تم تحديث حالة النشر بنجاح');
      fetchAllData();
    }
  };

  // Delete Story Action
  const handleDeleteStory = async (id: string) => {
    if (!confirm('هل أنت تأكد من رغبتك في حذف هذه القصة؟')) return;
    const { error } = await supabase.from('stories').delete().eq('id', id);
    if (!error) {
      showNotification('تم حذف القصة بنجاح');
      fetchAllData();
    }
  };

  // Create Page Action
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryId) return;
    setSaving(true);
    try {
      let finalImg = pageImageUrl;
      if (pageImageFile) {
        const uploaded = await uploadAsset(pageImageFile, 'story-assets');
        if (uploaded) finalImg = uploaded;
      }

      const { error } = await supabase.from('story_pages').insert({
        story_id: selectedStoryId,
        page_number: pageNumber,
        title: pageTitle,
        content: pageContent,
        image: finalImg || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      });

      if (error) throw error;

      showNotification('تمت إضافة الصفحة إلى القصة بنجاح!');
      setPageTitle('');
      setPageContent('');
      setPageImageFile(null);
      setPageImageUrl('');

      // Refresh pages
      const { data } = await supabase
        .from('story_pages')
        .select('*')
        .eq('story_id', selectedStoryId)
        .order('page_number', { ascending: true });

      if (data) {
        setPages(data as StoryPage[]);
        setPageNumber(data.length + 1);
      }
    } catch (err: any) {
      showNotification(err.message || 'خطأ أثناء إضافة الصفحة', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Page Action
  const handleDeletePage = async (id: string) => {
    const { error } = await supabase.from('story_pages').delete().eq('id', id);
    if (!error) {
      showNotification('تم حذف الصفحة');
      setPages((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Create Category Action
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('categories').insert({
        name: catName,
        icon: catIcon,
        color: catColor,
        sort_order: catOrder,
      });

      if (error) throw error;
      showNotification('تمت إضافة الفئة بنجاح!');
      setCatName('');
      fetchAllData();
    } catch (err: any) {
      showNotification(err.message || 'خطأ أثناء إضافة الفئة', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Create Announcement Action
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('announcements').insert({
        title: announceTitle,
        body: announceBody,
      });

      if (error) throw error;
      showNotification('تم نشر الإعلان بنجاح!');
      setAnnounceTitle('');
      setAnnounceBody('');
      fetchAllData();
    } catch (err: any) {
      showNotification(err.message || 'خطأ في نشر الإعلان', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-white/80 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
              <ShieldCheck size={16} /> إدارة البيانات الحية (Supabase MCP)
            </div>
            <h1 className="text-3xl font-black md:text-4xl">لوحة الإدارة الشاملة</h1>
            <p className="mt-2 text-sm text-purple-100">
              إضافة وتعديل القصص، الصفحات، الفئات، والإعلانات مباشرة في قاعدة البيانات.
            </p>
          </div>
          <div className="hidden rounded-2xl bg-white/20 p-4 text-center backdrop-blur-md md:block">
            <Sparkles size={28} className="mx-auto text-amber-300" />
            <span className="mt-1 block text-xs font-bold">إصدار الإنتاج</span>
          </div>
        </div>

        {/* Database Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/20 pt-6 sm:grid-cols-5">
          <div className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur-md">
            <span className="block text-2xl font-black">{stats.stories}</span>
            <span className="text-[11px] font-bold text-purple-100">القصص</span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur-md">
            <span className="block text-2xl font-black">{stats.pages}</span>
            <span className="text-[11px] font-bold text-purple-100">الصفحات</span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur-md">
            <span className="block text-2xl font-black">{stats.categories}</span>
            <span className="text-[11px] font-bold text-purple-100">الفئات</span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur-md">
            <span className="block text-2xl font-black">{stats.quizzes}</span>
            <span className="text-[11px] font-bold text-purple-100">الأسئلة</span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur-md">
            <span className="block text-2xl font-black">{stats.users}</span>
            <span className="text-[11px] font-bold text-purple-100">المستخدمون</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {msg && (
        <div
          className={`rounded-2xl p-4 text-sm font-bold shadow-md ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto rounded-2xl border border-white/80 bg-white/80 p-2 shadow-sm">
        {[
          { id: 'stories', label: 'إدارة القصص', icon: BookOpen },
          { id: 'pages', label: 'بناء صفحات القصص', icon: FileText },
          { id: 'categories', label: 'الفئات', icon: LayoutGrid },
          { id: 'announcements', label: 'الإعلانات', icon: Megaphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 text-xs font-black transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: STORIES MANAGEMENT */}
      {activeTab === 'stories' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* New Story Form */}
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-black text-slate-900">إضافة قصة جديدة</h2>
            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">عنوان القصة</label>
                <input
                  type="text"
                  required
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="مثال: يونان والحوت العظيم"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">الوصف</label>
                <textarea
                  required
                  rows={3}
                  value={storyDesc}
                  onChange={(e) => setStoryDesc(e.target.value)}
                  placeholder="وصف مختصر وممتع للقصة..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">الفئة</label>
                  <select
                    value={storyCatId}
                    onChange={(e) => setStoryCatId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">العهد</label>
                  <select
                    value={storyTestament}
                    onChange={(e) => setStoryTestament(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none"
                  >
                    <option value="العهد القديم">العهد القديم</option>
                    <option value="العهد الجديد">العهد الجديد</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">الفئة العمرية</label>
                  <select
                    value={storyAge}
                    onChange={(e) => setStoryAge(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none"
                  >
                    <option value="3-6">3-6 سنوات</option>
                    <option value="7-12">7-12 سنة</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">وقت القراءة (دقائق)</label>
                  <input
                    type="number"
                    min={1}
                    value={storyReadingTime}
                    onChange={(e) => setStoryReadingTime(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">صورة الغلاف (رفع للـ Storage أو رابط)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setStoryCoverFile(e.target.files?.[0] || null)}
                  className="mb-2 block w-full text-xs font-bold text-slate-600"
                />
                <input
                  type="url"
                  value={storyCoverUrl}
                  onChange={(e) => setStoryCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={storyFeatured}
                    onChange={(e) => setStoryFeatured(e.target.checked)}
                    className="h-4 w-4 rounded accent-purple-600"
                  />
                  <span>قصة مميزة (Featured)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={storyPublished}
                    onChange={(e) => setStoryPublished(e.target.checked)}
                    className="h-4 w-4 rounded accent-purple-600"
                  />
                  <span>منشورة (Published)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-purple-600 py-3 text-sm font-black text-white shadow-lg shadow-purple-200 hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ في Supabase...' : 'إضافة القصة لقاعدة البيانات'}
              </button>
            </form>
          </div>

          {/* Stories List */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900">قائمة القصص الحالية ({stories.length})</h2>
            <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
              {stories.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={s.cover_image || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80'}
                      alt={s.title}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-black text-slate-900">{s.title}</h4>
                      <p className="text-xs text-slate-500">{s.testament} • {s.age_group} سنة</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(s.id, s.published)}
                      className={`rounded-full p-2 text-xs font-bold transition-colors ${
                        s.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                      title={s.published ? 'إلغاء النشر' : 'نشر القصة'}
                    >
                      {s.published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteStory(s.id)}
                      className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORY PAGES BUILDER */}
      {activeTab === 'pages' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-black text-slate-900">إضافة صفحة جديدة للقصة</h2>
            <form onSubmit={handleCreatePage} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">اختر القصة</label>
                <select
                  value={selectedStoryId}
                  onChange={(e) => setSelectedStoryId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-800 outline-none"
                >
                  {stories.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">رقم الصفحة</label>
                  <input
                    type="number"
                    min={1}
                    value={pageNumber}
                    onChange={(e) => setPageNumber(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">عنوان الصفحة (اختياري)</label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder="مثال: البداية"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">نص الصفحة</label>
                <textarea
                  required
                  rows={4}
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                  placeholder="أدخل النص المخصص لهذه الصفحة..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">صورة التوضيح (Upload or URL)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPageImageFile(e.target.files?.[0] || null)}
                  className="mb-2 block w-full text-xs font-bold text-slate-600"
                />
                <input
                  type="url"
                  value={pageImageUrl}
                  onChange={(e) => setPageImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-sky-600 py-3 text-sm font-black text-white shadow-lg shadow-sky-200 hover:bg-sky-700 disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ الصفحة'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900">
              صفحات القصة المحددة ({pages.length})
            </h2>

            <div className="space-y-3">
              {pages.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-black text-sky-700">
                      {p.page_number}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">{p.title || `صفحة ${p.page_number}`}</h4>
                      <p className="line-clamp-1 text-xs text-slate-500">{p.content}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePage(p.id)}
                    className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-black text-slate-900">إضافة فئة جديدة</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">اسم الفئة</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="مثال: تسبيح وحمد"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">رمز / أيقونة</label>
                  <input
                    type="text"
                    required
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    placeholder="🕊️"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center text-lg outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">اللون (Hex)</label>
                  <input
                    type="color"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-xl border-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200"
              >
                إضافة الفئة
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-black text-slate-900">الفئات الحالية ({categories.length})</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${c.color}20`, color: c.color }}>
                    {c.icon}
                  </div>
                  <span className="font-bold text-slate-800">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-black text-slate-900">نشر إعلان جديد</h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">عنوان الإعلان</label>
                <input
                  type="text"
                  required
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="مثال: تم إضافة قصص جديدة!"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">نص الإعلان</label>
                <textarea
                  required
                  rows={3}
                  value={announceBody}
                  onChange={(e) => setAnnounceBody(e.target.value)}
                  placeholder="تفاصيل الإعلان التي تظهر للزوار..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-black text-white shadow-lg shadow-amber-200 hover:bg-amber-600"
              >
                نشر الإعلان
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-black text-slate-900">الإعلانات المنشورة ({announcements.length})</h2>
            {announcements.map((a) => (
              <div key={a.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <h4 className="font-black text-amber-900">{a.title}</h4>
                <p className="mt-1 text-xs text-amber-800">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
