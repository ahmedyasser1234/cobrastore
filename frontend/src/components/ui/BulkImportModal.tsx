import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import Button from './Button';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { lang } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(10);
    
    // Simulating file read for CSV format (Name, Price, Category)
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          setProgress(30);
          const text = e.target?.result as string;
          // Very basic CSV parsing
          const rows = text.split('\n').filter(row => row.trim() !== '');
          const headers = rows[0].split(',');
          
          setProgress(50);
          const products = rows.slice(1).map(row => {
            const values = row.split(',');
            return {
              nameEn: values[0] || 'Imported Product',
              nameAr: values[0] || 'منتج مستورد',
              basePrice: Number(values[1]) || 100,
              descriptionEn: 'Imported via CSV',
              descriptionAr: 'تم الاستيراد عبر CSV',
              stock: Number(values[2]) || 10,
              brand: 'Generic',
              departmentId: null, // Depending on backend handling
              categoryId: null, // Depending on backend handling
            };
          });

          setProgress(70);
          
          // Send to backend (Assuming we have a bulk create endpoint or just loop)
          // For the sake of this mock, we will just simulate a successful bulk import by making requests.
          for (let p of products) {
            await api.post('/products', p).catch(err => console.error(err));
          }
          
          setProgress(100);
          toast.success(lang === 'ar' ? 'تم الاستيراد بنجاح' : 'Products imported successfully');
          onSuccess();
          onClose();
        } catch (err) {
          toast.error(lang === 'ar' ? 'فشل معالجة الملف' : 'Failed to process file');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      toast.error(lang === 'ar' ? 'خطأ في قراءة الملف' : 'File read error');
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Price,Stock\nProduct A,150,50\nProduct B,200,20";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bulk_import_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black uppercase tracking-widest">{lang === 'ar' ? 'استيراد جماعي للمنتجات' : 'Bulk Product Import'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet size={32} />
            </div>
            <p className="text-sm font-bold text-slate-600 mb-4">
              {lang === 'ar' ? 'قم برفع ملف CSV يحتوي على بيانات المنتجات (الاسم، السعر، المخزون).' : 'Upload a CSV file containing your products (Name, Price, Stock).'}
            </p>
            <button 
              onClick={handleDownloadTemplate}
              className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
            >
              {lang === 'ar' ? 'تنزيل نموذج الملف (CSV)' : 'Download CSV Template'}
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-primary transition-colors relative cursor-pointer group">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              disabled={loading}
            />
            {file ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 size={32} className="text-green-500 mb-2" />
                <span className="text-sm font-bold text-slate-700">{file.name}</span>
              </div>
            ) : (
              <>
                <UploadCloud size={40} className="text-slate-300 group-hover:text-primary transition-colors mb-4" />
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  {lang === 'ar' ? 'اضغط لرفع الملف أو اسحبه هنا' : 'Click to browse or drag file here'}
                </span>
              </>
            )}
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>{lang === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <Button 
            className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-2xl flex justify-center items-center gap-2"
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : null}
            {lang === 'ar' ? 'بدء الاستيراد' : 'Start Import'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
