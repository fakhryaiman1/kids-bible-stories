import React, { useEffect, useState } from 'react';
import { HelpCircle, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Story, Quiz } from '../../types';

export const ManageQuizzesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [saving, setSaving] = useState(false);

  // Form
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [correctIdx, setCorrectIdx] = useState(1);

  useEffect(() => {
    const fetchStories = async () => {
      const { data } = await supabase.from('stories').select('*').order('title');
      if (data) {
        setStories(data as Story[]);
        if (data.length > 0) setSelectedStoryId(data[0].id);
      }
    };
    fetchStories();
  }, []);

  const fetchQuizzes = async (storyId: string) => {
    if (!storyId) return;
    const { data } = await supabase
      .from('quizzes')
      .select('*, quiz_options(*)')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });

    if (data) setQuizzes(data as Quiz[]);
  };

  useEffect(() => {
    fetchQuizzes(selectedStoryId);
  }, [selectedStoryId]);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryId || !question || !opt1 || !opt2) return;
    setSaving(true);

    try {
      const { data: newQuiz, error: qErr } = await supabase
        .from('quizzes')
        .insert({
          story_id: selectedStoryId,
          question,
          type: 'multiple_choice',
          explanation,
          sort_order: quizzes.length + 1,
        })
        .select()
        .single();

      if (qErr) throw qErr;

      if (newQuiz) {
        await supabase.from('quiz_options').insert([
          { quiz_id: newQuiz.id, option_text: opt1, is_correct: correctIdx === 1 },
          { quiz_id: newQuiz.id, option_text: opt2, is_correct: correctIdx === 2 },
        ]);
      }

      setQuestion('');
      setExplanation('');
      setOpt1('');
      setOpt2('');
      fetchQuizzes(selectedStoryId);
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء إضافة السؤال');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    const { error } = await supabase.from('quizzes').delete().eq('id', id);
    if (!error) fetchQuizzes(selectedStoryId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة الاختبارات والأسئلة</h1>
        <p className="text-xs text-slate-400">إضافة أسئلة اختيار من متعدد للقصص</p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <label className="mb-2 block text-xs font-bold text-slate-300">اختر القصة</label>
        <select
          value={selectedStoryId}
          onChange={(e) => setSelectedStoryId(e.target.value)}
          className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sm font-bold text-white outline-none"
        >
          {stories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-black text-white">إضافة سؤال جديد</h2>
          <form onSubmit={handleCreateQuiz} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">السؤال</label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="نص السؤال..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-bold text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">الخيار الأول</label>
              <input
                type="text"
                required
                value={opt1}
                onChange={(e) => setOpt1(e.target.value)}
                placeholder="الخيار الأول..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">الخيار الثاني</label>
              <input
                type="text"
                required
                value={opt2}
                onChange={(e) => setOpt2(e.target.value)}
                placeholder="الخيار الثاني..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">الإجابة الصحيحة</label>
              <select
                value={correctIdx}
                onChange={(e) => setCorrectIdx(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-white outline-none"
              >
                <option value={1}>الخيار الأول صحيح</option>
                <option value={2}>الخيار الثاني صحيح</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">التوضيح (تلميح للطفل)</label>
              <input
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="سبب الإجابة الصحيحة..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-purple-600 py-3 text-xs font-black text-white shadow-lg shadow-purple-900/40 hover:bg-purple-500"
            >
              حفظ السؤال
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-black text-white">أسئلة القصة ({quizzes.length})</h2>
          {quizzes.map((q) => (
            <div key={q.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">{q.question}</h4>
                <button onClick={() => handleDeleteQuiz(q.id)} className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="space-y-1">
                {q.quiz_options?.map((o) => (
                  <div key={o.id} className={`text-xs p-2 rounded-xl border ${o.is_correct ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-bold' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
                    {o.option_text} {o.is_correct && '✓ الإجابة الصحيحة'}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
