import React, { useEffect, useState } from 'react';
import { FileCode2, Plus, Trash2, Image, Layers } from 'lucide-react';
import { supabase, uploadAsset } from '../../lib/supabase';
import { Story, StoryPage } from '../../types';

export const StoryBuilderPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form
  const [pageNumber, setPageNumber] = useState(1);
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pageImageFile, setPageImageFile] = useState<File | null>(null);
  const [pageImageUrl, setPageImageUrl] = useState('');

  useEffect(() => {
    const fetchStories = async () => {
      const { data } = await supabase.from('stories').select('*').order('title');
      if (data) {
        setStories(data as Story[]);
        if (data.length > 0) setSelectedStoryId(data[0].id);
      }
      setLoading(false);
    };
    fetchStories();
  }, []);

  const fetchPages = async (storyId: string) => {
    if (!storyId) return;
    const { data } = await supabase
      .from('story_pages')
      .select('*')
      .eq('story_id', storyId)
      .order('page_number', { ascending: true });

    if (data) {
      setPages(data as StoryPage[]);
      setPageNumber(data.length + 1);
    }
  };

  useEffect(() => {
    fetchPages(selectedStoryId);
  }, [selectedStoryId]);

  const handleAddPage = async (e: React.FormEvent) => {
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

      setPageTitle('');
      setPageContent('');
      setPageImageFile(null);
      setPageImageUrl('');
      fetchPages(selectedStoryId);
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء إضافة الصفحة');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (id: string) => {
    const { error } = await supabase.from('story_pages').delete().eq('id', id);
    if (!error) fetchPages(selectedStoryId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">بناء صفحات القصص</h1>
        <p className="text-xs text-slate-400">إضافة وتعديل الصفحات والصور لكل قصة</p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <label className="mb-2 block text-xs font-bold text-slate-300">اختر القصة للتعديل</label>
        <select
          value={selectedStoryId}
          onChange={(e) => setSelectedStoryId(e.target.value)}
          className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sm font-bold text-white outline-none focus:border-purple-500"
        >
          {stories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* New Page Form */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-black text-white">إضافة صفحة جديدة</h2>
          <form onSubmit={handleAddPage} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">رقم الصفحة</label>
                <input
                  type="number"
                  min={1}
                  value={pageNumber}
                  onChange={(e) => setPageNumber(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">عنوان الصفحة</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="مثال: البداية"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">محتوى الصفحة</label>
              <textarea
                required
                rows={4}
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                placeholder="أدخل النص..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-semibold text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">صورة الصفحة (رفع أو URL)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPageImageFile(e.target.files?.[0] || null)}
                className="mb-2 block w-full text-xs font-bold text-slate-400"
              />
              <input
                type="url"
                value={pageImageUrl}
                onChange={(e) => setPageImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-purple-600 py-3 text-xs font-black text-white shadow-lg shadow-purple-900/40 hover:bg-purple-500 disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ الصفحة'}
            </button>
          </form>
        </div>

        {/* Existing Pages List */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-white">صفحات القصة ({pages.length})</h2>

          <div className="space-y-3">
            {pages.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-xs font-black text-purple-400">
                    {p.page_number}
                  </span>
                  <div>
                    <h4 className="font-bold text-white">{p.title || `صفحة ${p.page_number}`}</h4>
                    <p className="line-clamp-1 text-xs text-slate-400">{p.content}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePage(p.id)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
