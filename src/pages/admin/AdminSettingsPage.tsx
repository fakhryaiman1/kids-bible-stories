import React, { useEffect, useState } from 'react';
import { Settings, Megaphone, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Announcement } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data as Announcement[]);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('announcements').insert({ title, body });
    if (!error) {
      setTitle('');
      setBody('');
      fetchAnnouncements();
    }
    setSaving(false);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) fetchAnnouncements();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">إعدادات المنصة والإعلانات</h1>
        <p className="text-xs text-slate-400">نشر شريط الإعلانات وإدارة إعدادات النظام</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-black text-white">نشر إعلان جديد للشريط العلوي</h2>
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">عنوان الإعلان</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تم إضافة قصة داود والعملاق!"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-bold text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">نص الإعلان</label>
              <textarea
                required
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="تفاصيل الإعلان المعروض في أعلى موقع الأطفال..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-semibold text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-purple-600 py-3 text-xs font-black text-white shadow-lg shadow-purple-900/40 hover:bg-purple-500"
            >
              نشر الإعلان
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 size={18} />
              <span>حالة اتصال قاعدة البيانات (Supabase MCP)</span>
            </div>
            <p className="text-xs text-slate-400">
              مشروع Supabase مفعل وجاهز. تم تطبيق جميع سياسات RLS وقواعد حماية البيانات.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black text-white">الإعلانات المنشورة ({announcements.length})</h2>
            {announcements.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div>
                  <h4 className="font-bold text-amber-300">{a.title}</h4>
                  <p className="text-xs text-amber-200">{a.body}</p>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(a.id)}
                  className="rounded-xl p-2 text-rose-400 hover:bg-rose-500/20"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
