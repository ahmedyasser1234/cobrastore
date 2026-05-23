import React, { useRef, useState } from 'react';
import { Upload, Link, X, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  lang?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label, lang = 'ar' }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'url' | 'upload'>('upload');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url);
      toast.success(lang === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    } catch (err: any) {
      toast.error(lang === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className={`block text-xs font-bold uppercase tracking-widest text-text-muted ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          {label}
        </label>
      )}

      {/* Mode Switcher */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
            mode === 'upload' ? 'bg-primary text-black' : 'bg-surface border border-border text-text-muted hover:text-primary'
          }`}
        >
          <Upload size={12} />
          {lang === 'ar' ? 'رفع ملف' : 'Upload'}
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
            mode === 'url' ? 'bg-primary text-black' : 'bg-surface border border-border text-text-muted hover:text-primary'
          }`}
        >
          <Link size={12} />
          {lang === 'ar' ? 'رابط URL' : 'URL Link'}
        </button>
      </div>

      {mode === 'upload' ? (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-primary group ${
            uploading ? 'opacity-60 cursor-not-allowed' : 'border-border'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="text-primary animate-spin" />
              <span className="text-xs text-text-muted">{lang === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={32} className="text-text-muted group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold text-text-muted group-hover:text-primary transition-colors">
                {lang === 'ar' ? 'اضغط لرفع صورة من جهازك' : 'Click to upload image from device'}
              </span>
              <span className="text-[10px] text-text-muted/60">PNG, JPG, WebP — {lang === 'ar' ? 'حتى' : 'max'} 5MB</span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <Link className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://..."
            className={`input-field text-sm ${lang === 'ar' ? 'pr-10 text-right' : 'pl-10 text-left'}`}
          />
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-20 w-auto object-cover rounded-xl border border-border shadow-sm"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
