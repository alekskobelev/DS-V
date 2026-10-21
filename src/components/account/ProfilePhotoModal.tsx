import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  Link as LinkIcon, 
  Sparkles, 
  ShieldCheck, 
  User,
  Building2
} from 'lucide-react';
import { AuthAccount } from '../../types';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthAccount;
  onSavePhoto: (newAvatarUrl: string) => Promise<boolean> | boolean;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  user,
  onSavePhoto
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(user.avatar || '');
  const [urlInput, setUrlInput] = useState<string>(user.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const initials = user.fullName
    ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'ДС';

  // Preset monogram generator with SVG Data URL
  const generateMonogramSvgUrl = (bg: string, fg: string = '#ffffff') => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160"><rect width="160" height="160" rx="36" fill="${bg}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="900" font-size="52" fill="${fg}">${initials}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  };

  const PRESET_OPTIONS = [
    { label: 'Инженерный синий', bg: '#1E3A8A', color: '#60A5FA' },
    { label: 'Прецизионный янтарь', bg: '#78350F', color: '#FBBF24' },
    { label: 'Метрологический изумруд', bg: '#064E3B', color: '#34D399' },
    { label: 'Промышленный графит', bg: '#0F172A', color: '#94A3B8' },
    { label: 'Корпоративный индиго', bg: '#312E81', color: '#818CF8' },
    { label: 'Сапфир TopSolid', bg: '#1E40AF', color: '#93C5FD' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Пожалуйста, выберите файл изображения (.jpg, .png, .webp, .svg)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Размер файла не должен превышать 8 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Compress/resize via canvas to keep avatar crisp and lightweight
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.88);
            setPreviewUrl(optimizedBase64);
          } else {
            setPreviewUrl(result);
          }
        };
        img.onerror = () => {
          setPreviewUrl(result);
        };
        img.src = result;
      }
    };
    reader.onerror = () => {
      setUploadError('Не удалось прочитать файл');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setPreviewUrl(urlInput.trim());
    }
  };

  const handleClearPhoto = () => {
    setPreviewUrl('');
    setUrlInput('');
    setUploadError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSavePhoto(previewUrl);
      onClose();
    } catch (e) {
      console.error('Failed to save avatar', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-sm border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 text-amber-300">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Смена фотографии профиля</h3>
              <p className="text-xs text-blue-200 mt-0.5">{user.fullName} ({user.email})</p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          
          {/* Top Live Preview Circle */}
          <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-gray-200">
            <div className="relative shrink-0">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt={user.fullName} 
                  className="w-20 h-20 rounded-xl object-cover ring-4 ring-blue-500/20 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-800 to-indigo-900 text-white font-black text-2xl flex items-center justify-center shadow-md ring-4 ring-blue-500/20">
                  {initials}
                </div>
              )}
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Текущий аватар</div>
              <div className="text-sm font-bold text-gray-900 truncate">{user.fullName}</div>
              <div className="text-xs text-gray-500 truncate">{user.position || user.company}</div>
              {previewUrl ? (
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-bold mt-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Сбросить к монограмме
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" /> Фирменная монограмма «{initials}»
                </span>
              )}
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex border-b border-gray-200 pb-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'upload'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Загрузить файл</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('presets')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'presets'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Монограммы</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('url')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'url'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>По ссылке (URL)</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeMode === 'upload' && (
            <div className="space-y-3">
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-blue-600 bg-blue-50/70 scale-[0.99]' 
                    : 'border-gray-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-gray-900">
                  Перетащите изображение сюда или <span className="text-blue-600 underline">выберите файл</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Поддерживаются форматы JPG, PNG, WEBP, SVG (до 8 МБ)
                </div>
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {uploadError}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Monograms & Badges */}
          {activeMode === 'presets' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 font-medium">
                Выберите фирменный инженерный стиль монограммы с вашими инициалами «{initials}»:
              </div>
              <div className="grid grid-cols-3 gap-3">
                {PRESET_OPTIONS.map((opt, idx) => {
                  const svgUrl = generateMonogramSvgUrl(opt.bg, opt.color);
                  const isSelected = previewUrl === svgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewUrl(svgUrl)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/30 shadow-xs' 
                          : 'border-gray-200 bg-white hover:bg-slate-50 hover:border-gray-300'
                      }`}
                    >
                      <img src={svgUrl} alt={opt.label} className="w-12 h-12 rounded-xl shadow-xs" />
                      <span className="text-[11px] font-bold text-gray-800 text-center leading-tight">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: URL input */}
          {activeMode === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500">
                Прямая ссылка на фото (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 px-4.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Применить
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Укажите общедоступную ссылку на фотографию в интернете (HTTPS).
              </p>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Сохранение...' : 'Сохранить фото профиля'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
