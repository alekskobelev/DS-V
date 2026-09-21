import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  FilePlus, 
  Sparkles,
  Paperclip,
  Save,
  Edit3
} from 'lucide-react';
import { AttachedDocument } from '../../types';

interface AccountFileModalProps {
  existingDoc?: AttachedDocument | null;
  parentTitle: string;
  defaultCategories?: string[];
  onClose: () => void;
  onSave: (doc: AttachedDocument) => void;
}

const DEFAULT_CATEGORIES = [
  'Договор и приложения',
  'Спецификация и смета',
  'Акт сдачи-приемки',
  'Техническое задание',
  'Паспорт и сертификат',
  'Файл лицензии (.v2c / .lic)',
  'CAD-модель / Чертеж',
  'Лог ошибки / Скриншот',
  'Прочее'
];

export const AccountFileModal: React.FC<AccountFileModalProps> = ({
  existingDoc,
  parentTitle,
  defaultCategories = DEFAULT_CATEGORIES,
  onClose,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'upload' | 'manual'>(existingDoc ? 'manual' : 'upload');
  const [docName, setDocName] = useState(existingDoc?.name || '');
  const [category, setCategory] = useState(existingDoc?.category || defaultCategories[0] || 'Договор и приложения');
  const [fileSize, setFileSize] = useState(existingDoc?.size || '1.4 MB');
  const [fileUrl, setFileUrl] = useState<string | undefined>(existingDoc?.fileUrl);
  const [uploadedBy, setUploadedBy] = useState(existingDoc?.uploadedBy || 'Инженерный отдел');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!existingDoc;

  // Auto-generate name suggestion based on category and parent
  const handleCategorySelect = (newCat: string) => {
    setCategory(newCat);
    if (!docName || !isEditing) {
      const sanitized = parentTitle.replace(/["«»]/g, '').replace(/\s+/g, '_').slice(0, 20);
      const dateStr = new Date().toLocaleDateString('ru-RU').replace(/\./g, '_');
      
      if (newCat.includes('Договор')) {
        setDocName(`Договор_${sanitized}_${dateStr}.pdf`);
        setFileSize('2.4 MB');
      } else if (newCat.includes('Спецификац')) {
        setDocName(`Спецификация_${sanitized}.pdf`);
        setFileSize('1.1 MB');
      } else if (newCat.includes('Акт')) {
        setDocName(`Акт_выполненных_работ_${sanitized}.pdf`);
        setFileSize('850 KB');
      } else if (newCat.includes('лицензи')) {
        setDocName(`Ключ_лицензии_${sanitized}.v2c`);
        setFileSize('24 KB');
      } else if (newCat.includes('CAD') || newCat.includes('Чертеж')) {
        setDocName(`Модель_${sanitized}.step`);
        setFileSize('5.2 MB');
      } else if (newCat.includes('Лог') || newCat.includes('Скриншот')) {
        setDocName(`Crash_Log_${sanitized}.log`);
        setFileSize('128 KB');
      } else {
        setDocName(`Документ_${sanitized}_${dateStr}.pdf`);
        setFileSize('1.5 MB');
      }
    }
  };

  const handleFileSelect = (file: File) => {
    setError('');
    const sizeInMB = file.size / (1024 * 1024);
    const formattedSize = sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
    
    setDocName(file.name);
    setFileSize(formattedSize);

    // Auto-detect category
    const lower = file.name.toLowerCase();
    if (lower.includes('v2c') || lower.includes('.lic') || lower.includes('hasp') || lower.includes('ключ')) {
      setCategory('Файл лицензии (.v2c / .lic)');
    } else if (lower.includes('договор') || lower.includes('контракт')) {
      setCategory('Договор и приложения');
    } else if (lower.includes('акт')) {
      setCategory('Акт сдачи-приемки');
    } else if (lower.includes('тз') || lower.includes('спецификац') || lower.includes('смета')) {
      setCategory('Спецификация и смета');
    } else if (lower.includes('step') || lower.includes('iges') || lower.includes('cad') || lower.includes('dwg')) {
      setCategory('CAD-модель / Чертеж');
    } else if (lower.includes('log') || lower.includes('png') || lower.includes('jpg') || lower.includes('ошибк')) {
      setCategory('Лог ошибки / Скриншот');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      setError('Укажите наименование документа');
      return;
    }

    const resultDoc: AttachedDocument = {
      id: existingDoc?.id || `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: docName.trim(),
      category: category,
      size: fileSize || '1.2 MB',
      uploadedAt: existingDoc?.uploadedAt || new Date().toLocaleDateString('ru-RU'),
      uploadedBy: uploadedBy.trim() || 'Инженерный отдел',
      fileUrl: fileUrl,
      fileType: docName.split('.').pop()?.toLowerCase(),
    };

    onSave(resultDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-sm border border-gray-200 overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <FilePlus className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate">
                {isEditing ? 'Редактировать файл' : 'Прикрепить документ / файл'}
              </h2>
              <p className="text-xs text-gray-400 truncate">{parentTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Mode Switcher if creating new */}
          {!isEditing && (
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'upload'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-gray-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Загрузить с диска</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'manual'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Создать запись / шаблон</span>
              </button>
            </div>
          )}

          {/* Upload Dropzone */}
          {mode === 'upload' && !isEditing && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/70'
                  : 'border-gray-300 hover:border-blue-400 bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">
                  Перетащите файл сюда или нажмите для выбора
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  PDF, DOCX, XLSX, STEP, IGES, .v2c, .lic, PNG, ZIP (до 50 МБ)
                </p>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Категория документа <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500"
            >
              {defaultCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Наименование файла <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Например: Договор_Поставки_2026.pdf"
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Size and UploadedBy row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Размер файла
              </label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="1.5 MB"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Автор / Отдел
              </label>
              <input
                type="text"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                placeholder="Инженерный отдел"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-500 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Сохранить изменения' : 'Прикрепить файл'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
