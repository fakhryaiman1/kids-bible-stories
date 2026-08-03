import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  Star,
  Bookmark,
  Home,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Story, StoryPage, Quiz } from '../types';
import { useAuth } from '../context/AuthContext';

export const StoryReaderPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile, favorites, toggleFavorite, refreshProfile } = useAuth();

  const [story, setStory] = useState<Story | null>(null);
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Audio / Speech Reader state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Quiz state
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [storyCompleted, setStoryCompleted] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);

  useEffect(() => {
    const fetchStoryDetails = async () => {
      setLoading(true);
      try {
        const { data: storyData } = await supabase
          .from('stories')
          .select('*, categories(*)')
          .eq('slug', slug)
          .single();

        if (storyData) {
          setStory(storyData as Story);

          // Fetch pages
          const { data: pageData } = await supabase
            .from('story_pages')
            .select('*')
            .eq('story_id', storyData.id)
            .order('page_number', { ascending: true });

          if (pageData) setPages(pageData as StoryPage[]);

          // Fetch quizzes with options
          const { data: quizData } = await supabase
            .from('quizzes')
            .select('*, quiz_options(*)')
            .eq('story_id', storyData.id)
            .order('sort_order', { ascending: true });

          if (quizData) setQuizzes(quizData as Quiz[]);
        }
      } catch (err) {
        console.error('Error fetching story:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchStoryDetails();
  }, [slug]);

  // Handle Speech synthesis (Reading story content aloud)
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('عذراً، متصفحك لا يدعم خاصية القراءة الصوتية');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentPage = pages[currentPageIdx];
    if (!currentPage) return;

    const utterance = new SpeechSynthesisUtterance(currentPage.content);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Cancel speaking when switching pages
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentPageIdx, isQuizMode]);

  const handleNextPage = () => {
    if (currentPageIdx < pages.length - 1) {
      setCurrentPageIdx((prev) => prev + 1);
    } else {
      // Start quiz or complete story
      if (quizzes.length > 0) {
        setIsQuizMode(true);
      } else {
        completeStory(0);
      }
    }
  };

  const handlePrevPage = () => {
    if (isQuizMode) {
      setIsQuizMode(false);
    } else if (currentPageIdx > 0) {
      setCurrentPageIdx((prev) => prev - 1);
    }
  };

  const handleSelectQuizOption = (optionId: string, isCorrect: boolean) => {
    if (quizAnswered) return;
    setSelectedOptionId(optionId);
    setQuizAnswered(true);

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx < quizzes.length - 1) {
      setCurrentQuizIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setQuizAnswered(false);
    } else {
      // Finished all quiz questions
      completeStory(quizScore + (selectedOptionId ? 1 : 0));
    }
  };

  const completeStory = async (finalQuizScore: number) => {
    setStoryCompleted(true);
    const bonusStars = 10 + finalQuizScore * 5;
    setStarsEarned(bonusStars);

    if (user && story) {
      try {
        // Upsert user progress in Supabase
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          story_id: story.id,
          current_page: pages.length,
          completed: true,
          quiz_score: finalQuizScore,
          stars: bonusStars,
          last_read: new Date().toISOString(),
        });

        // Update profile total stars
        if (profile) {
          await supabase
            .from('profiles')
            .update({
              stars: (profile.stars || 0) + bonusStars,
              completed_stories: (profile.completed_stories || 0) + 1,
            })
            .eq('id', user.id);

          await refreshProfile();
        }
      } catch (err) {
        console.error('Error recording story progress:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        <p className="text-base font-black text-slate-700">جاري تحميل القصة...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center shadow-lg">
        <h2 className="text-2xl font-black text-slate-800">القصة غير موجودة</h2>
        <p className="mt-2 text-slate-500">يبدو أن القصة المطلوبة غير متوفرة أو تم نقلها.</p>
        <Link
          to="/stories"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-md"
        >
          <ArrowRight size={18} /> العودة للمكتبة
        </Link>
      </div>
    );
  }

  const isFav = favorites.includes(story.id);
  const activePage = pages[currentPageIdx];
  const activeQuiz = quizzes[currentQuizIdx];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between rounded-full border border-white/80 bg-white/80 px-6 py-3 shadow-md backdrop-blur-md">
        <button
          onClick={() => navigate('/stories')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600"
        >
          <ArrowRight size={18} /> العودة للمكتبة
        </button>

        <div className="text-center">
          <h1 className="text-lg font-black text-slate-900">{story.title}</h1>
          <p className="text-xs font-semibold text-slate-500">
            {isQuizMode ? 'اختبار القصة' : `صفحة ${currentPageIdx + 1} من ${pages.length}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isQuizMode && (
            <button
              onClick={toggleSpeech}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                isSpeaking ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={isSpeaking ? 'إيقاف القراءة' : 'استمع للقصة'}
            >
              {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}

          <button
            onClick={() => toggleFavorite(story.id)}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
              isFav ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-500'
            }`}
          >
            <Bookmark size={18} className={isFav ? 'fill-white' : ''} />
          </button>
        </div>
      </div>

      {/* Main Reader Stage */}
      {!isQuizMode && !storyCompleted && (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/90 shadow-2xl shadow-sky-200/50 backdrop-blur-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPageIdx}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 p-6 md:grid-cols-2 md:p-10"
            >
              {/* Illustration / Image Side */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-indigo-100 to-amber-100 p-2 shadow-inner">
                {activePage?.image ? (
                  <img
                    src={activePage.image}
                    alt={activePage.title || story.title}
                    className="h-72 w-full rounded-2xl object-cover shadow-md md:h-96"
                  />
                ) : (
                  <div className="flex h-72 w-full items-center justify-center rounded-2xl bg-sky-200/50 md:h-96">
                    <BookOpen size={64} className="text-sky-500 opacity-60" />
                  </div>
                )}

                {activePage?.title && (
                  <span className="absolute bottom-4 right-4 rounded-xl bg-slate-900/70 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                    {activePage.title}
                  </span>
                )}
              </div>

              {/* Story Content Side */}
              <div className="flex flex-col justify-between space-y-6">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                    <Sparkles size={14} /> جزء {currentPageIdx + 1}
                  </div>
                  <p className="text-lg font-bold leading-relaxed text-slate-800 md:text-xl">
                    {activePage?.content}
                  </p>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-4">
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
                      style={{ width: `${((currentPageIdx + 1) / pages.length) * 100}%` }}
                    />
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPageIdx === 0}
                      className="flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-30"
                    >
                      <ArrowRight size={18} /> الصفحة السابقة
                    </button>

                    <button
                      onClick={handleNextPage}
                      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-7 py-2.5 text-sm font-black text-white shadow-lg shadow-sky-200 transition-all hover:brightness-105"
                    >
                      {currentPageIdx === pages.length - 1
                        ? quizzes.length > 0
                          ? 'بدء الاختبار 🎯'
                          : 'إنهاء القصة ✨'
                        : 'الصفحة التالية'}
                      <ArrowLeft size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Quiz Mode Stage */}
      {isQuizMode && !storyCompleted && activeQuiz && (
        <div className="rounded-[2.5rem] border border-white/90 bg-white/95 p-6 shadow-2xl backdrop-blur-md md:p-10">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 font-black text-purple-700">
              <Trophy size={20} />
              <span>اختبار فهم القصة ({currentQuizIdx + 1} من {quizzes.length})</span>
            </div>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
              +5 نجوم لكل إجابة صحيحة
            </span>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 md:text-2xl">
              {activeQuiz.question}
            </h2>

            <div className="grid gap-3">
              {activeQuiz.quiz_options?.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                let btnStyle = 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100';

                if (quizAnswered) {
                  if (opt.is_correct) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                  } else if (isSelected && !opt.is_correct) {
                    btnStyle = 'border-rose-500 bg-rose-50 text-rose-900';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectQuizOption(opt.id, opt.is_correct)}
                    disabled={quizAnswered}
                    className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-right text-base font-bold transition-all ${btnStyle}`}
                  >
                    <span>{opt.option_text}</span>
                    {quizAnswered && (
                      <span>
                        {opt.is_correct ? (
                          <CheckCircle2 className="text-emerald-500" size={20} />
                        ) : isSelected ? (
                          <XCircle className="text-rose-500" size={20} />
                        ) : null}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {quizAnswered && activeQuiz.explanation && (
              <div className="rounded-2xl bg-amber-50 p-4 text-xs font-bold text-amber-800 border border-amber-200">
                💡 التوضيح: {activeQuiz.explanation}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={handlePrevPage}
                className="rounded-full border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600"
              >
                مراجعة القصة
              </button>

              {quizAnswered && (
                <button
                  onClick={handleNextQuizQuestion}
                  className="flex items-center gap-2 rounded-full bg-purple-600 px-7 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-200"
                >
                  {currentQuizIdx < quizzes.length - 1 ? 'السؤال التالي' : 'عرض النتيجة النهائية'}
                  <ArrowLeft size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal / Stage */}
      {storyCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2.5rem] border border-white/90 bg-gradient-to-br from-white via-sky-50 to-amber-50 p-8 text-center shadow-2xl md:p-12"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-400 text-white shadow-xl shadow-amber-200 animate-bounce">
            <Trophy size={40} />
          </div>

          <h2 className="text-3xl font-black text-slate-900 md:text-4xl">ممتاز! أحسنت القراءة 🌟</h2>
          <p className="mt-2 text-base font-bold text-slate-600">
            لقد أكملت قصة "{story.title}" بنجاح وحصلت على:
          </p>

          <div className="my-6 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 shadow-lg border border-amber-200">
            <Star size={32} className="fill-amber-400 text-amber-500" />
            <span className="text-3xl font-black text-amber-700">+{starsEarned} نجمة!</span>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                setStoryCompleted(false);
                setIsQuizMode(false);
                setCurrentPageIdx(0);
                setCurrentQuizIdx(0);
                setSelectedOptionId(null);
                setQuizAnswered(false);
              }}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm"
            >
              <RefreshCw size={18} /> اعادة القراءة
            </button>

            <Link
              to="/stories"
              className="flex items-center gap-2 rounded-full bg-sky-500 px-8 py-3 font-black text-white shadow-lg shadow-sky-200"
            >
              <BookOpen size={18} /> قصة أخرى
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 font-black text-white shadow-lg shadow-purple-200"
            >
              شاهد نجومك وإنجازاتك
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};
