import React, { useEffect, useState } from 'react';
import { LayoutGrid, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';

export const ManageCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📖');
  const [color, setColor] = useState('#38bdf8');
  const [sortOrder, setSortOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    if (data) setCategories(data as Category[]);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('categories').insert({
      name,
      icon,
      color,
      sort_order: sortOrder,
    });
    if (!error) {
      setName('');
      fetchCategories();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف الفئة؟')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) fetchCategories();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة الفئات والمواضيع</h1>
        <p className="text-xs text-slate-400">إضافة وتنظيم الفئات للأطفال</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-black text-white">إضافة فئة جديدة</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-300">اسم الفئة</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسم الفئة..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-bold text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">أيقونة / إيموجي</label>
                <input
                  type="text"
                  required
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="📜"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-center text-lg outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">اللون المميز</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-xl border-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-purple-600 py-3 text-xs font-black text-white shadow-lg shadow-purple-900/40 hover:bg-purple-500"
            >
              حفظ الفئة
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-black text-white">الفئات الحالية ({categories.length})</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${c.color}20`, color: c.color }}>
                    {c.icon}
                  </div>
                  <span className="font-bold text-white">{c.name}</span>
                </div>
                <button onClick={() => handleDelete(c.id)} className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400">
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
