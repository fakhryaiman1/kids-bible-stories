import React, { useEffect, useState } from 'react';
import { Trophy, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Achievement } from '../../types';

export const ManageAchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🏅');
  const [reqStories, setReqStories] = useState(1);
  const [reqPoints, setReqPoints] = useState(10);
  const [saving, setSaving] = useState(false);

  const fetchAchievements = async () => {
    const { data } = await supabase.from('achievements').select('*').order('required_stories');
    if (data) setAchievements(data as Achievement[]);
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('achievements').insert({
      title,
      description,
      icon,
      required_stories: Number(reqStories),
      required_points: Number(reqPoints),
    });

    if (!error) {
      setTitle('');
      setDescription('');
      fetchAchievements();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('achievements').delete().eq('id', id);
    if (!error) fetchAchievements();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة الأوسمة والإنجازات</h1>
        <p className="text-xs text-slate-400">تحديد شروط فتح شارات الإنجاز للأطفال</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-black text-white">إضافة وسام جديد</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">عنوان الوسام</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: قارئ مجتهد"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-bold text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">الوصف</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="شرط الحصول عليه..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-semibold text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">رمز / إيموجي</label>
                <input
                  type="text"
                  required
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="🏆"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-center text-lg outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">القصص المطلوبة</label>
                <input
                  type="number"
                  min={0}
                  value={reqStories}
                  onChange={(e) => setReqStories(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">النجوم المطلوبة</label>
                <input
                  type="number"
                  min={0}
                  value={reqPoints}
                  onChange={(e) => setReqPoints(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-purple-600 py-3 text-xs font-black text-white shadow-lg shadow-purple-900/40 hover:bg-purple-500"
            >
              حفظ الوسام
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-black text-white">الأوسمة المتاحة ({achievements.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{a.icon}</div>
                  <div>
                    <h4 className="font-bold text-white">{a.title}</h4>
                    <p className="text-[11px] text-slate-400">{a.description}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)} className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400">
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
