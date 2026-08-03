import React, { useEffect, useState } from 'react';
import { Image, Upload, Trash2, Check, Copy } from 'lucide-react';
import { supabase, uploadAsset } from '../../lib/supabase';

export const MediaLibraryPage: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const fetchBucketFiles = async () => {
    try {
      const { data, error } = await supabase.storage.from('story-assets').list('uploads', {
        limit: 50,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (!error && data) {
        setFiles(data);
      }
    } catch (err) {
      console.error('Error listing files:', err);
    }
  };

  useEffect(() => {
    fetchBucketFiles();
  }, []);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const publicUrl = await uploadAsset(file, 'story-assets');
    if (publicUrl) {
      fetchBucketFiles();
    }
    setUploading(false);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedPath(url);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مكتبة الوسائط والملفات</h1>
          <p className="text-xs text-slate-400">رفع واستعراض الصور المخزنة في Supabase Storage (story-assets)</p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-purple-900/40 hover:bg-purple-500">
          <Upload size={16} />
          <span>{uploading ? 'جاري الرفع...' : 'رفع صورة جديدة للـ Storage'}</span>
          <input type="file" accept="image/*" onChange={handleUploadFile} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {files.map((file) => {
          const { data } = supabase.storage.from('story-assets').getPublicUrl(`uploads/${file.name}`);
          const publicUrl = data.publicUrl;
          const isCopied = copiedPath === publicUrl;

          return (
            <div key={file.id || file.name} className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-md">
              <div className="relative h-44 w-full bg-slate-950">
                <img src={publicUrl} alt={file.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="truncate text-[11px] font-semibold text-slate-400 max-w-[150px]">{file.name}</span>
                <button
                  onClick={() => copyToClipboard(publicUrl)}
                  className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-slate-200 hover:bg-purple-600 hover:text-white"
                >
                  {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{isCopied ? 'تم النسخ' : 'نسخ الرابط'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
