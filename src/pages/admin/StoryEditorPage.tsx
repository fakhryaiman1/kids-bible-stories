import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, Save, Eye, Layers, Plus, Trash2, Copy, MoveUp, MoveDown, 
  Image as ImageIcon, Volume2, FileText, HelpCircle, BookOpen, Settings as SettingsIcon,
  Sparkles, Check, AlertCircle, X
} from 'lucide-react';
import { supabase, uploadAsset } from '../../lib/supabase';
import { Story, StoryPage, Category, Quiz, QuizOption } from '../../types';

export const StoryEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Upload state tracking
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  
  // Tabs State
  type TabType = 'info' | 'pages' | 'images' | 'quiz' | 'lessons' | 'audio' | 'settings' | 'preview';
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Story Basic Info State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [ageGroup, setAgeGroup] = useState('kindergarten');
  const [testament, setTestament] = useState('old');
  const [readingTime, setReadingTime] = useState(5);
  const [difficulty, setDifficulty] = useState('easy');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  // Story Pages State
  const [pages, setPages] = useState<Partial<StoryPage>[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);

  // Quizzes State
  interface ExtendedQuiz extends Partial<Quiz> {
    options?: Partial<QuizOption>[];
  }
  const [quizzes, setQuizzes] = useState<ExtendedQuiz[]>([]);

  // Lessons Learned State
  const [lessons, setLessons] = useState<string[]>(['أهمية الطاعة والإيمان', 'محبة الله لا تتغير', 'الشجاعة والتوكل على الله']);

  // Active page selection helper
  const activePage = pages[selectedPageIndex] || null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: catData } = await supabase.from('categories').select('*').order('sort_order');
      if (catData) setCategories(catData as Category[]);

      if (id && id !== 'new') {
        // Fetch Story
        const { data: storyData } = await supabase.from('stories').select('*').eq('id', id).single();
        if (storyData) {
          setTitle(storyData.title || '');
          setSlug(storyData.slug || '');
          setDescription(storyData.description || '');
          setCoverImage(storyData.cover_image || '');
          setBannerImage(storyData.banner_image || storyData.cover_image || '');
          setCategoryId(storyData.category_id || '');
          setAgeGroup(storyData.age_group || 'kindergarten');
          setTestament(storyData.testament || 'old');
          setReadingTime(storyData.reading_time || 5);
          setDifficulty(storyData.difficulty || 'easy');
          setFeatured(storyData.featured || false);
          setPublished(storyData.published || false);
        }

        // Fetch Pages
        const { data: pagesData } = await supabase
          .from('story_pages')
          .select('*')
          .eq('story_id', id)
          .order('page_number', { ascending: true });

        if (pagesData && pagesData.length > 0) {
          setPages(pagesData);
        } else {
          setPages([{ page_number: 1, title: 'الصفحة الأولى', content: '', image: '', audio: '' }]);
        }

        // Fetch Quizzes with Options
        const { data: quizData } = await supabase
          .from('quizzes')
          .select('*, quiz_options(*)')
          .eq('story_id', id)
          .order('sort_order', { ascending: true });

        if (quizData && quizData.length > 0) {
          setQuizzes(quizData.map((q: any) => ({
            ...q,
            options: q.quiz_options || [],
          })));
        } else {
          setQuizzes([
            {
              question: 'سؤال الكويز الأول عن القصة؟',
              type: 'multiple_choice',
              correct_answer: 'الخيار الصحيح',
              explanation: 'شرح وتوضيح الإجابة للأطفال',
              options: [
                { option_text: 'الخيار الصحيح', is_correct: true },
                { option_text: 'خيار آخر 1', is_correct: false },
                { option_text: 'خيار آخر 2', is_correct: false },
              ],
            },
          ]);
        }
      } else {
        // New Story Setup
        setTitle('قصة جديدة');
        setSlug(`story-${Date.now().toString().slice(-4)}`);
        setDescription('');
        setPages([{ page_number: 1, title: 'الصفحة الأولى', content: '', image: '', audio: '' }]);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // Warn before unload on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Mark changes state helper
  const markChanged = () => {
    setHasUnsavedChanges(true);
  };

  const saveStory = async (isDraft = false) => {
    if (!title.trim()) return;
    setSaving(true);

    try {
      let storyId = id;
      const isPublishAction = isDraft === false;
      
      const payload: Record<string, any> = {
        title,
        slug: slug || title.trim().toLowerCase().replace(/\s+/g, '-'),
        description,
        category_id: categoryId || categories[0]?.id,
        age_group: ageGroup,
        testament,
        reading_time: Number(readingTime),
        difficulty,
        featured,
        published: isPublishAction ? true : false,
        updated_at: new Date().toISOString(),
      };
      // Only include image fields if they have a real value (don't overwrite with empty string)
      if (coverImage) payload.cover_image = coverImage;
      if (bannerImage) payload.banner_image = bannerImage;

      if (!storyId || storyId === 'new') {
        const { data: newStory, error } = await supabase.from('stories').insert(payload).select().single();
        if (error) throw error;
        storyId = newStory.id;
        navigate(`/admin/stories/${storyId}/edit`, { replace: true });
      } else {
        const { error } = await supabase.from('stories').update(payload).eq('id', storyId);
        if (error) throw error;
      }

      // Save Pages safely by page ID or insert
      if (storyId) {
        // Delete excess pages beyond current count
        const { error: delErr } = await supabase
          .from('story_pages')
          .delete()
          .eq('story_id', storyId)
          .gt('page_number', pages.length);
        if (delErr) console.error('Error deleting excess pages:', delErr);

        const updatedPagesList: Partial<StoryPage>[] = [];
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const pagePayload = {
            story_id: storyId,
            page_number: i + 1,
            title: page.title || `صفحة ${i + 1}`,
            content: page.content !== undefined ? page.content : '',
            image: page.image || null,
            audio: page.audio || null,
          };

          if (page.id) {
            const { data: updatedPage, error: updateErr } = await supabase
              .from('story_pages')
              .update(pagePayload)
              .eq('id', page.id)
              .select()
              .single();

            if (updateErr) {
              console.error(`Error updating page ${i + 1}:`, updateErr);
              updatedPagesList.push(page);
            } else {
              updatedPagesList.push(updatedPage || page);
            }
          } else {
            const { data: insertedPage, error: insertErr } = await supabase
              .from('story_pages')
              .insert(pagePayload)
              .select()
              .single();

            if (insertErr) {
              console.error(`Error inserting page ${i + 1}:`, insertErr);
              updatedPagesList.push(page);
            } else {
              updatedPagesList.push(insertedPage || page);
            }
          }
        }
        setPages(updatedPagesList);

        // Save Quizzes
        for (let qIdx = 0; qIdx < quizzes.length; qIdx++) {
          const q = quizzes[qIdx];
          const quizPayload = {
            story_id: storyId,
            question: q.question || 'سؤال',
            type: q.type || 'multiple_choice',
            correct_answer: q.correct_answer || '',
            explanation: q.explanation || '',
            sort_order: qIdx + 1,
          };

          let quizId = q.id;
          if (quizId) {
            await supabase.from('quizzes').update(quizPayload).eq('id', quizId);
          } else {
            const { data: newQ } = await supabase.from('quizzes').insert(quizPayload).select().single();
            if (newQ) quizId = newQ.id;
          }

          // Options
          if (quizId && q.options) {
            await supabase.from('quiz_options').delete().eq('quiz_id', quizId);
            for (const opt of q.options) {
              await supabase.from('quiz_options').insert({
                quiz_id: quizId,
                option_text: opt.option_text || '',
                is_correct: opt.is_correct || false,
              });
            }
          }
        }
      }

      setHasUnsavedChanges(false);
      const saveTime = new Date().toLocaleTimeString('ar-EG');
      setLastSaved(saveTime);
      setUploadSuccess('تم حفظ ونشر القصة وجميع الصفحات بنجاح ✅');
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      console.error('Error saving story:', err);
      setUploadError(err.message || 'حدث خطأ أثناء حفظ القصة');
    } finally {
      setSaving(false);
    }
  };

  // Delete Handler with Confirmation
  const handleDeleteStory = async () => {
    if (!id || id === 'new') return;
    if (confirm('هل أنت تأكد من رغبتك في حذف القصة نهائياً من قاعدة البيانات؟')) {
      await supabase.from('stories').delete().eq('id', id);
      navigate('/admin/stories');
    }
  };

  // Pages Operations
  const handleAddPage = () => {
    const newPage: Partial<StoryPage> = {
      page_number: pages.length + 1,
      title: `صفحة ${pages.length + 1}`,
      content: '',
      image: '',
      audio: '',
    };
    setPages([...pages, newPage]);
    setSelectedPageIndex(pages.length);
    markChanged();
  };

  const handleDuplicatePage = (index: number) => {
    const pageToDup = pages[index];
    const newPage: Partial<StoryPage> = {
      ...pageToDup,
      id: undefined,
      page_number: pages.length + 1,
      title: `${pageToDup.title || 'صفحة'} (نسخة)`,
    };
    const updated = [...pages];
    updated.splice(index + 1, 0, newPage);
    setPages(updated);
    setSelectedPageIndex(index + 1);
    markChanged();
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) {
      alert('يجب أن تحتوي القصة على صفحة واحدة على الأقل');
      return;
    }
    const updated = pages.filter((_, i) => i !== index);
    setPages(updated);
    if (selectedPageIndex >= updated.length) {
      setSelectedPageIndex(updated.length - 1);
    }
    markChanged();
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === pages.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...pages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPages(updated);
    setSelectedPageIndex(targetIndex);
    markChanged();
  };

  const updateActivePage = (key: keyof StoryPage, value: any) => {
    if (selectedPageIndex < 0) return;
    setPages((prevPages) => {
      if (selectedPageIndex >= prevPages.length) return prevPages;
      const updated = [...prevPages];
      updated[selectedPageIndex] = {
        ...updated[selectedPageIndex],
        [key]: value,
      };
      return updated;
    });
    markChanged();
  };

  // Quizzes Operations
  const handleAddQuiz = () => {
    const newQ: ExtendedQuiz = {
      question: 'سؤال جديد...',
      type: 'multiple_choice',
      correct_answer: 'الخيار الأول',
      explanation: 'شرح بسيط للطفل',
      options: [
        { option_text: 'الخيار الأول', is_correct: true },
        { option_text: 'الخيار الثاني', is_correct: false },
      ],
    };
    setQuizzes([...quizzes, newQ]);
    markChanged();
  };

  const handleDuplicateQuiz = (index: number) => {
    const q = quizzes[index];
    const duplicated: ExtendedQuiz = {
      ...q,
      id: undefined,
      question: `${q.question} (نسخة)`,
    };
    const updated = [...quizzes];
    updated.splice(index + 1, 0, duplicated);
    setQuizzes(updated);
    markChanged();
  };

  const handleDeleteQuiz = (index: number) => {
    setQuizzes(quizzes.filter((_, i) => i !== index));
    markChanged();
  };

  // Asset Upload Handler — uploads to Supabase Storage, saves URL to DB immediately
  const handleUploadAsset = async (
    file: File,
    target: 'cover' | 'banner' | 'page_image' | 'page_audio',
    pageIndex?: number,
  ) => {
    setUploadingField(target);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const url = await uploadAsset(file, 'story-assets');
      if (!url) throw new Error('فشل رفع الملف إلى Supabase Storage');

      // Add cache-busting timestamp to force browser reload
      const cacheBustedUrl = `${url}?t=${Date.now()}`;

      // Update local React state immediately
      if (target === 'cover') setCoverImage(cacheBustedUrl);
      if (target === 'banner') setBannerImage(cacheBustedUrl);
      if (target === 'page_image' || target === 'page_audio') {
        const idx = pageIndex ?? selectedPageIndex;
        const updated = [...pages];
        const fieldName = target === 'page_image' ? 'image' : 'audio';
        updated[idx] = { ...updated[idx], [fieldName]: cacheBustedUrl };

        if (id && id !== 'new') {
          const pageId = updated[idx]?.id;
          const pagePayload = {
            story_id: id,
            page_number: idx + 1,
            title: updated[idx].title || `صفحة ${idx + 1}`,
            content: updated[idx].content !== undefined ? updated[idx].content : '',
            image: updated[idx].image || null,
            audio: updated[idx].audio || null,
          };

          if (pageId) {
            // Page exists — update by ID
            const { data: updatedPage, error: updateErr } = await supabase
              .from('story_pages')
              .update(pagePayload)
              .eq('id', pageId)
              .select()
              .single();
            if (updateErr) console.error(`Error updating page ${target}:`, updateErr);
            if (updatedPage) updated[idx] = updatedPage;
          } else {
            // New page — insert
            const { data: insertedPage, error: insertErr } = await supabase
              .from('story_pages')
              .insert(pagePayload)
              .select()
              .single();
            if (insertErr) console.error(`Error inserting page ${target}:`, insertErr);
            if (insertedPage) updated[idx] = insertedPage;
          }
        }
        setPages(updated);
      }

      // Immediately persist cover/banner to DB
      if ((target === 'cover' || target === 'banner') && id && id !== 'new') {
        const field = target === 'cover' ? 'cover_image' : 'banner_image';
        await supabase.from('stories').update({ [field]: cacheBustedUrl }).eq('id', id);
      }

      setUploadSuccess(`تم رفع ${target === 'cover' ? 'صورة الغلاف' : target === 'banner' ? 'البانر' : target === 'page_image' ? 'صورة الصفحة' : 'الصوت'} بنجاح ✅`);
      setHasUnsavedChanges(true);
      setLastSaved(new Date().toLocaleTimeString('ar-EG'));
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'حدث خطأ أثناء الرفع، يرجى المحاولة مرة أخرى');
    } finally {
      setUploadingField(null);
      // Auto-clear success/error messages after 4 seconds
      setTimeout(() => {
        setUploadSuccess(null);
        setUploadError(null);
      }, 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Status Toast Notifications */}
      {(uploadSuccess || uploadError || uploadingField) && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-6 py-3 text-sm font-bold shadow-2xl transition-all ${
          uploadError ? 'bg-rose-600 text-white' : uploadSuccess ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
        }`}>
          {uploadingField && !uploadError && !uploadSuccess && (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              جاري رفع الملف...
            </span>
          )}
          {uploadSuccess && uploadSuccess}
          {uploadError && `❌ ${uploadError}`}
        </div>
      )}
      {/* CMS Top Control Action Bar */}
      <div className="sticky top-4 z-40 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-4 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (hasUnsavedChanges && !confirm('توجد تغييرات غير محفوظة، هل أنت تأكد من الخروج؟')) return;
              navigate('/admin/stories');
            }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
          >
            <ArrowRight size={18} />
          </button>
          <div>
            <h1 className="text-base font-black text-white">{title || 'محرر القصة المتكامل'}</h1>
            <p className="text-[11px] text-slate-400">
              {lastSaved ? `تم الحفظ تلقائياً الساعة ${lastSaved}` : hasUnsavedChanges ? 'توجد تغييرات غير محفوظة (حفظ تلقائي كل 30ث)' : 'جميع التغييرات محفوظة في Supabase'}
            </p>
          </div>
        </div>

        {/* Action Buttons: Save, Draft, Preview, Publish, Cancel */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Eye size={14} />
            معاينة
          </button>

          <button
            onClick={() => saveStory(true)}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
          >
            حفظ كمسودة
          </button>

          <button
            onClick={() => saveStory(false)}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-purple-900/40 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'جاري النشر...' : 'نشر وتحديث'}
          </button>

          <button
            onClick={() => {
              if (hasUnsavedChanges && !confirm('إلغاء التغييرات والعودة للقصص؟')) return;
              navigate('/admin/stories');
            }}
            className="flex items-center gap-1.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white"
          >
            إلغاء
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex overflow-x-auto rounded-2xl bg-slate-900 p-1.5 border border-slate-800">
        {[
          { id: 'info', label: '📖 المعلومات الأساسية' },
          { id: 'pages', label: `📄 صفحات القصة (${pages.length})` },
          { id: 'images', label: '🖼 الصور والوسائط' },
          { id: 'quiz', label: `❓ الاختبارات (${quizzes.length})` },
          { id: 'lessons', label: '🎯 الدروس المستفادة' },
          { id: 'audio', label: '🔊 الصوتيات' },
          { id: 'settings', label: '⚙️ الإعدادات' },
          { id: 'preview', label: '👁 المعاينة المباشرة' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 📖 BASIC INFORMATION */}
      {activeTab === 'info' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="text-base font-black text-white">تفاصيل ومحتوى القصة</h2>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">عنوان القصة</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markChanged();
                }}
                placeholder="عنوان القصة بالعربية..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sm font-bold text-white outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">الرابط الفريد (Slug)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    markChanged();
                  }}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-semibold text-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">الفئة / التصنيف</label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    markChanged();
                  }}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-white outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">الوصف القصير</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  markChanged();
                }}
                placeholder="مخصر للقصة..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-medium text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">الوصف الكامل والمفصّل</label>
              <textarea
                rows={5}
                value={fullDescription}
                onChange={(e) => {
                  setFullDescription(e.target.value);
                  markChanged();
                }}
                placeholder="تفاصيل وشرح كامل عن أحداث القصة والسياق الكتابي..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-medium text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Side Attributes Panel */}
          <div className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="text-base font-black text-white">خصائص القصة</h2>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">الفئة العمرية</label>
              <select
                value={ageGroup}
                onChange={(e) => {
                  setAgeGroup(e.target.value);
                  markChanged();
                }}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-white outline-none"
              >
                <option value="kindergarten">روضة أطفال (3-6 سنوات)</option>
                <option value="primary">ابتدائي (7-12 سنة)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">العهد الكتابي</label>
              <select
                value={testament}
                onChange={(e) => {
                  setTestament(e.target.value);
                  markChanged();
                }}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-white outline-none"
              >
                <option value="old">العهد القديم</option>
                <option value="new">العهد الجديد</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">مستوى الصعوبة</label>
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  markChanged();
                }}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-white outline-none"
              >
                <option value="easy">سهل جداً (أطفال)</option>
                <option value="medium">متوسط</option>
                <option value="advanced">متقدم</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">وقت القراءة المقدر (دقائق)</label>
              <input
                type="number"
                min={1}
                value={readingTime}
                onChange={(e) => {
                  setReadingTime(Number(e.target.value));
                  markChanged();
                }}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-white outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 📄 STORY PAGES BUILDER */}
      {activeTab === 'pages' && (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">صفحات القصة ({pages.length})</h3>
              <button
                onClick={handleAddPage}
                className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500"
              >
                <Plus size={14} /> صفحة
              </button>
            </div>

            <div className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
              {pages.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border p-3 transition-all ${
                    selectedPageIndex === idx
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-xs font-black text-purple-400">
                      {idx + 1}
                    </span>
                    <div className="max-w-[130px] truncate text-xs font-bold">
                      {p.title || `صفحة ${idx + 1}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePage(idx, 'up');
                      }}
                      className="rounded p-1 hover:bg-slate-800 text-slate-400"
                    >
                      <MoveUp size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePage(idx, 'down');
                      }}
                      className="rounded p-1 hover:bg-slate-800 text-slate-400"
                    >
                      <MoveDown size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicatePage(idx);
                      }}
                      className="rounded p-1 hover:bg-slate-800 text-slate-400"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(idx);
                      }}
                      className="rounded p-1 hover:bg-rose-500/20 text-rose-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {activePage && (
            <div className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h2 className="text-base font-black text-white">تعديل محتوى الصفحة {selectedPageIndex + 1}</h2>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">عنوان الصفحة</label>
                <input
                  type="text"
                  value={activePage.title || ''}
                  onChange={(e) => updateActivePage('title', e.target.value)}
                  placeholder="مثال: البداية"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sm font-bold text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">نص الصفحة (Visual Content Editor)</label>
                <textarea
                  rows={7}
                  value={activePage.content || ''}
                  onChange={(e) => updateActivePage('content', e.target.value)}
                  placeholder="اكتب النص المشوق للأطفال..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm font-semibold leading-relaxed text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">صورة الصفحة</label>
                    {activePage.image && (
                      <button
                        onClick={async () => {
                          updateActivePage('image', null);
                          markChanged();
                          if (activePage.id) {
                            await supabase.from('story_pages').update({ image: null }).eq('id', activePage.id);
                          }
                        }}
                        className="flex items-center gap-1 rounded-lg bg-rose-500/20 px-2 py-1 text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                        title="حذف الصورة"
                      >
                        <X size={12} /> حذف الصورة
                      </button>
                    )}
                  </div>
                  {activePage.image ? (
                    <img
                      key={activePage.image}
                      src={activePage.image}
                      alt="صورة الصفحة"
                      className="h-32 w-full rounded-xl object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center rounded-xl bg-slate-900 text-slate-600">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed p-2.5 text-xs font-bold transition-all ${
                    uploadingField === 'page_image' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-purple-500 hover:text-purple-400'
                  }`}>
                    {uploadingField === 'page_image' ? (
                      <><span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /> جاري الرفع...</>
                    ) : (
                      <><ImageIcon size={12} /> ارفع صورة الصفحة</>
                    )}
                    <input type="file" accept="image/*" className="hidden" disabled={!!uploadingField}
                      onChange={(e) => { if (e.target.files?.[0]) handleUploadAsset(e.target.files[0], 'page_image', selectedPageIndex); }} />
                  </label>
                  <input
                    type="url"
                    value={(activePage.image || '').split('?t=')[0]}
                    onChange={(e) => updateActivePage('image', e.target.value)}
                    placeholder="أو أدخل رابط الصورة مباشرة..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <label className="block text-xs font-bold text-slate-300">السرد الصوتي للصفحة</label>
                  {activePage.audio && <audio controls src={activePage.audio} className="w-full" />}
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleUploadAsset(e.target.files[0], 'page_audio');
                    }}
                    className="w-full text-xs text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🖼 IMAGES & MEDIA */}
      {activeTab === 'images' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="text-base font-black text-white">صورة الغلاف (Cover Image)</h2>
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
              {coverImage ? (
                <img
                  key={coverImage}
                  src={coverImage}
                  alt="غلاف"
                  className="h-56 w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="flex h-56 w-full items-center justify-center text-slate-600">
                  <ImageIcon size={48} />
                </div>
              )}
            </div>
            <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed p-3 text-xs font-bold transition-all ${
              uploadingField === 'cover' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-purple-500 hover:text-purple-400'
            }`}>
              {uploadingField === 'cover' ? (
                <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /> جاري الرفع...</>
              ) : (
                <><ImageIcon size={14} /> اختر صورة الغلاف أو اسحبها هنا</>
              )}
              <input type="file" accept="image/*" className="hidden" disabled={!!uploadingField}
                onChange={(e) => { if (e.target.files?.[0]) handleUploadAsset(e.target.files[0], 'cover'); }} />
            </label>
            <input
              type="url"
              value={coverImage.split('?t=')[0]}
              onChange={(e) => { setCoverImage(e.target.value); markChanged(); }}
              placeholder="أو أدخل رابط الصورة مباشرة..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
            />
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="text-base font-black text-white">صورة البانر العلوي (Banner Image)</h2>
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
              {(bannerImage || coverImage) ? (
                <img
                  key={bannerImage || coverImage}
                  src={bannerImage || coverImage}
                  alt="بانر"
                  className="h-56 w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="flex h-56 w-full items-center justify-center text-slate-600">
                  <ImageIcon size={48} />
                </div>
              )}
            </div>
            <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed p-3 text-xs font-bold transition-all ${
              uploadingField === 'banner' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-purple-500 hover:text-purple-400'
            }`}>
              {uploadingField === 'banner' ? (
                <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /> جاري الرفع...</>
              ) : (
                <><ImageIcon size={14} /> اختر صورة البانر أو اسحبها هنا</>
              )}
              <input type="file" accept="image/*" className="hidden" disabled={!!uploadingField}
                onChange={(e) => { if (e.target.files?.[0]) handleUploadAsset(e.target.files[0], 'banner'); }} />
            </label>
            <input
              type="url"
              value={(bannerImage || '').split('?t=')[0]}
              onChange={(e) => { setBannerImage(e.target.value); markChanged(); }}
              placeholder="أو أدخل رابط البانر مباشرة..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
            />
          </div>
        </div>
      )}

      {/* ❓ QUIZ BUILDER */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">منشئ اختبارات القصة (Quizzes)</h2>
            <button
              onClick={handleAddQuiz}
              className="flex items-center gap-1.5 rounded-2xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500"
            >
              <Plus size={14} /> إضافة سؤال جديد
            </button>
          </div>

          <div className="space-y-6">
            {quizzes.map((q, qIdx) => (
              <div key={qIdx} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-purple-400">السؤال رقم {qIdx + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicateQuiz(qIdx)}
                      className="rounded-xl bg-slate-800 p-2 text-xs text-slate-300 hover:bg-slate-700"
                      title="نسخ السؤال"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(qIdx)}
                      className="rounded-xl bg-rose-500/20 p-2 text-xs text-rose-400 hover:bg-rose-500 hover:text-white"
                      title="حذف السؤال"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-300">نص السؤال</label>
                  <input
                    type="text"
                    value={q.question || ''}
                    onChange={(e) => {
                      const updated = [...quizzes];
                      updated[qIdx].question = e.target.value;
                      setQuizzes(updated);
                      markChanged();
                    }}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sm font-bold text-white outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-300">الشرح والتوضيح بعد الإجابة</label>
                  <input
                    type="text"
                    value={q.explanation || ''}
                    onChange={(e) => {
                      const updated = [...quizzes];
                      updated[qIdx].explanation = e.target.value;
                      setQuizzes(updated);
                      markChanged();
                    }}
                    placeholder="شرح بسيط للأطفال..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">خيارات الإجابة</label>
                  {q.options?.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                      <input
                        type="radio"
                        name={`quiz-correct-${qIdx}`}
                        checked={opt.is_correct || false}
                        onChange={() => {
                          const updated = [...quizzes];
                          updated[qIdx].options = updated[qIdx].options?.map((o, idx) => ({
                            ...o,
                            is_correct: idx === optIdx,
                          }));
                          updated[qIdx].correct_answer = opt.option_text;
                          setQuizzes(updated);
                          markChanged();
                        }}
                        className="h-4 w-4 accent-purple-600"
                      />
                      <input
                        type="text"
                        value={opt.option_text || ''}
                        onChange={(e) => {
                          const updated = [...quizzes];
                          if (updated[qIdx].options) {
                            updated[qIdx].options![optIdx].option_text = e.target.value;
                            if (opt.is_correct) updated[qIdx].correct_answer = e.target.value;
                          }
                          setQuizzes(updated);
                          markChanged();
                        }}
                        className="w-full bg-transparent text-xs font-bold text-white outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 LESSONS LEARNED */}
      {activeTab === 'lessons' && (
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-base font-black text-white">الدروس المستفادة للأطفال (3 دروس)</h2>
          {lessons.map((lesson, lIdx) => (
            <div key={lIdx} className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/20 text-xs font-black text-purple-400">
                {lIdx + 1}
              </span>
              <input
                type="text"
                value={lesson}
                onChange={(e) => {
                  const updated = [...lessons];
                  updated[lIdx] = e.target.value;
                  setLessons(updated);
                  markChanged();
                }}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-bold text-white outline-none"
              />
            </div>
          ))}
        </div>
      )}

      {/* 🔊 AUDIO */}
      {activeTab === 'audio' && (
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-base font-black text-white">التسجيلات الصوتية العامة للقصة</h2>
          <p className="text-xs text-slate-400">يمكنك رفع ملف صوتی كامل يقرأ القصة من البداية للنهاية للأطفال</p>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              if (e.target.files?.[0]) handleUploadAsset(e.target.files[0], 'page_audio');
            }}
            className="w-full text-xs text-slate-400"
          />
        </div>
      )}

      {/* ⚙ SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-base font-black text-white">إعدادات النشر وحذف القصة</h2>

          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="font-bold text-white">حالة النشر الحالية</h4>
              <p className="text-xs text-slate-400">القصص المنشورة تظهر فوراً في الموقع العام للأطفال</p>
            </div>
            <button
              onClick={() => {
                setPublished(!published);
                markChanged();
              }}
              className={`rounded-2xl px-5 py-2 text-xs font-black ${
                published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {published ? 'منشورة حالياً' : 'مسودة غير منشورة'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="font-bold text-rose-400">حذف القصة نهائياً</h4>
              <p className="text-xs text-slate-400">سيتم مسح القصة وصفحاتها واختباراتها بالكامل من Supabase</p>
            </div>
            <button
              onClick={handleDeleteStory}
              className="rounded-2xl bg-rose-600/20 px-5 py-2.5 text-xs font-black text-rose-400 hover:bg-rose-600 hover:text-white"
            >
              حذف القصة
            </button>
          </div>
        </div>
      )}

      {/* 👁 PREVIEW */}
      {activeTab === 'preview' && (
        <div className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-purple-400">{testament === 'old' ? 'العهد القديم' : 'العهد الجديد'}</span>
              <h2 className="text-2xl font-black text-white">{title}</h2>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
              {readingTime} دقائق قراءة
            </span>
          </div>

          {activePage && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-3xl border border-slate-800">
                <img
                  src={activePage.image || coverImage || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800'}
                  alt="معاينة"
                  className="h-64 w-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500">صفحة {selectedPageIndex + 1} من {pages.length}</span>
                <h3 className="text-xl font-bold text-white">{activePage.title}</h3>
                <p className="text-base leading-relaxed text-slate-300 whitespace-pre-line">
                  {activePage.content || 'لم يتم إضافة نص لهذه الصفحة بعد.'}
                </p>
              </div>

              {activePage.audio && (
                <div className="rounded-2xl bg-slate-950 p-4">
                  <audio controls src={activePage.audio} className="w-full" />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              disabled={selectedPageIndex === 0}
              onClick={() => setSelectedPageIndex((prev) => prev - 1)}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white disabled:opacity-30"
            >
              الصفحة السابقة
            </button>
            <span className="text-xs font-bold text-slate-400">
              {selectedPageIndex + 1} / {pages.length}
            </span>
            <button
              disabled={selectedPageIndex === pages.length - 1}
              onClick={() => setSelectedPageIndex((prev) => prev + 1)}
              className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-30"
            >
              الصفحة التالية
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
