import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Sparkles } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/80 bg-white/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-md">
                <BookOpen size={20} />
              </div>
              <span className="text-xl font-black text-slate-900">قصص الكتاب المقدس</span>
            </div>
            <p className="text-sm text-slate-600">
              تطبيق تفاعلي مصمم بأسلوب ممتع وجذاب لتعليم الأطفال القيم والأخلاق السامية من خلال قصص الكتاب المقدس.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900">روابط الموقع</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/" className="hover:text-sky-600">الرئيسية</Link>
              </li>
              <li>
                <Link to="/stories" className="hover:text-sky-600">مكتبة القصص</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-sky-600">الفئات</Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-sky-600">المفضلة</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-sky-600">الملف الشخصي والنجوم</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900">أقسام الكتاب</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/stories?testament=العهد القديم" className="hover:text-sky-600">قصص العهد القديم</Link></li>
              <li><Link to="/stories?testament=العهد الجديد" className="hover:text-sky-600">قصص العهد الجديد</Link></li>
              <li><Link to="/stories?age=3-6" className="hover:text-sky-600">قصص للأطفال (3-6) سنوات</Link></li>
              <li><Link to="/stories?age=7-12" className="hover:text-sky-600">قصص للناشئين (7-12) سنة</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between border-t border-slate-100 pt-6 text-center text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} قصص الكتاب المقدس للأطفال. جميع الحقوق محفوظة.</p>
          <p className="mt-2 flex items-center gap-1 md:mt-0">
            تم التطوير بحب <Heart size={14} className="fill-rose-500 text-rose-500" /> ورعاية للأطفال
          </p>
        </div>
      </div>
    </footer>
  );
};
