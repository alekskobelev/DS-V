import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Film,
  FileArchive,
  ExternalLink,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  Plus,
  X
} from 'lucide-react';

export interface FileUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  accept?: string;
  helperText?: string;
  type?: 'image' | 'document' | 'video' | 'auto';
  multiline?: boolean; // For galleries or lists of URLs (one per line)
  required?: boolean;
  className?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  accept,
  helperText,
  type = 'auto',
  multiline = false,
  required = false,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine accepted MIME types based on type prop
  const defaultAccept =
    accept ||
    (type === 'image'
      ? 'image/jpeg,image/png,image/webp,image/svg+xml,image/gif'
      : type === 'video'
      ? 'video/mp4,video/webm,video/quicktime'
      : type === 'document'
      ? '.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt'
      : 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.mp4');

  const defaultHelper =
    helperText ||
    (type === 'image'
      ? 'Поддерживаются форматы JPG, PNG, WebP, SVG до 20 МБ'
      : type === 'document'
      ? 'Поддерживаются форматы PDF, DOCX, XLSX, ZIP до 50 МБ'
      : type === 'video'
      ? 'Поддерживаются MP4, WebM или прямые ссылки на YouTube / Rutube'
      : 'Перетащите файл сюда, выберите на диске или укажите прямую ссылку');

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
      throw new Error(data.error || 'Ошибка при загрузке файла');
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Не удалось загрузить файл: ${err.message || 'Ошибка сети'}`);
      return null;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      if (multiline) {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const url = await uploadFile(files[i]);
          if (url) uploadedUrls.push(url);
        }
        if (uploadedUrls.length > 0) {
          const currentUrls = value ? value.split('\n').filter(Boolean) : [];
          onChange([...currentUrls, ...uploadedUrls].join('\n'));
        }
      } else {
        const url = await uploadFile(files[0]);
        if (url) {
          onChange(url);
          setShowUrlInput(false);
        }
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      if (multiline) {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const url = await uploadFile(files[i]);
          if (url) uploadedUrls.push(url);
        }
        if (uploadedUrls.length > 0) {
          const currentUrls = value ? value.split('\n').filter(Boolean) : [];
          onChange([...currentUrls, ...uploadedUrls].join('\n'));
        }
      } else {
        const url = await uploadFile(files[0]);
        if (url) {
          onChange(url);
          setShowUrlInput(false);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    if (multiline) {
      const currentUrls = value ? value.split('\n').filter(Boolean) : [];
      onChange([...currentUrls, manualUrl.trim()].join('\n'));
    } else {
      onChange(manualUrl.trim());
    }
    setManualUrl('');
    setShowUrlInput(false);
  };

  // Helper to detect file type icon and presentation
  const getFileMeta = (url: string) => {
    const cleanUrl = url.split('?')[0].toLowerCase();
    const isImg =
      type === 'image' ||
      /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(cleanUrl) ||
      url.startsWith('data:image') ||
      cleanUrl.includes('images.unsplash.com');
    const isDoc =
      type === 'document' ||
      /\.(pdf|doc|docx|xls|xlsx|txt|rtf)$/i.test(cleanUrl);
    const isZip = /\.(zip|rar|7z|tar|gz)$/i.test(cleanUrl);
    const isVid =
      type === 'video' ||
      /\.(mp4|webm|mov|mkv)$/i.test(cleanUrl) ||
      cleanUrl.includes('youtube.com') ||
      cleanUrl.includes('youtu.be');

    // Extract filename from URL
    let fileName = 'Прикрепленный файл';
    try {
      const segments = url.split('/');
      const last = segments[segments.length - 1];
      if (last && last.length > 3) {
        fileName = decodeURIComponent(last.split('?')[0]);
      }
    } catch {
      fileName = url;
    }

    return { isImg, isDoc, isZip, isVid, fileName };
  };

  // Multiple items mode (e.g. Gallery of images or multiple documents)
  if (multiline) {
    const urls = value ? value.split('\n').map((u) => u.trim()).filter(Boolean) : [];

    return (
      <div className={`space-y-2 text-sm ${className}`}>
        {label && (
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-500">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {urls.length > 0 && (
              <span className="text-xs text-blue-600 font-semibold">
                Загружено: {urls.length}
              </span>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={defaultAccept}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Existing gallery cards */}
        {urls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {urls.map((url, idx) => {
              const meta = getFileMeta(url);
              return (
                <div
                  key={idx}
                  className="group relative rounded-xl border border-gray-200 bg-white p-2 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center relative mb-2">
                    {meta.isImg ? (
                      <img
                        src={url}
                        alt="Превью"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : meta.isVid ? (
                      <Film className="w-8 h-8 text-blue-500" />
                    ) : (
                      <FileText className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-auto">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate max-w-[100px] flex items-center gap-1"
                      title={url}
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{meta.fileName}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const newUrls = urls.filter((_, i) => i !== idx);
                        onChange(newUrls.join('\n'));
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Удалить из галереи"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload dropzone for adding items */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/60'
              : 'border-gray-300 bg-slate-50/50 hover:bg-slate-50 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">
                {isUploading ? 'Загрузка файлов на сервер...' : 'Добавить фото или документы в галерею'}
              </p>
              <p className="text-[11px] text-gray-500">{defaultHelper}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Выбрать файлы</span>
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-4 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-slate-500 rounded-lg text-xs font-medium transition-colors"
            >
              + URL
            </button>
          </div>
        </div>

        {/* Optional Manual URL input toggle */}
        {showUrlInput && (
          <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-200 shadow-2xs">
            <LinkIcon className="w-4 h-4 text-gray-400 ml-2" />
            <input
              type="text"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://... вставьте прямую ссылку"
              className="flex-1 text-xs px-2 py-1 outline-none text-gray-800"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddManualUrl();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddManualUrl}
              className="px-4 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="p-1 text-gray-400 hover:text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Single Item Mode (State 1: Empty, State 2: Attached)
  const isAttached = Boolean(value && value.trim().length > 0);
  const meta = getFileMeta(value || '');

  return (
    <div className={`space-y-1.5 text-sm ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-500">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {isAttached && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Файл прикреплен
            </span>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={defaultAccept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* STATE 2: File is attached */}
      {isAttached ? (
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            {meta.isImg ? (
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                <img
                  src={value}
                  alt="Превью"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>
            ) : meta.isVid ? (
              <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Film className="w-6 h-6" />
              </div>
            ) : meta.isZip ? (
              <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <FileArchive className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 text-xs truncate max-w-[240px] sm:max-w-xs font-mono">
                  {meta.fileName}
                </p>
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded inline-flex items-center gap-1 text-[11px] font-medium"
                  title="Открыть в новой вкладке"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="hidden sm:inline">Открыть</span>
                </a>
              </div>
              <p className="text-[11px] text-gray-500 truncate max-w-[280px]">
                {meta.isImg ? 'Изображение оптимизировано' : meta.isVid ? 'Видеофайл' : 'Документ готов к скачиванию'}
              </p>
            </div>
          </div>

          {/* Exactly two control buttons: Replace and Delete */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-slate-500 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              )}
              <span>Заменить</span>
            </button>

            <button
              type="button"
              disabled={isUploading}
              onClick={() => {
                onChange('');
                setShowUrlInput(false);
              }}
              className="px-4 py-1.5 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить</span>
            </button>
          </div>
        </div>
      ) : (
        /* STATE 1: Empty state (Dropzone + choose file or paste URL) */
        <div className="space-y-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-3.5 sm:p-4 transition-all flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 overflow-hidden ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/60'
                : 'border-gray-300 bg-slate-50/50 hover:bg-slate-50 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 max-w-full">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : type === 'image' ? (
                  <ImageIcon className="w-5 h-5" />
                ) : type === 'video' ? (
                  <Film className="w-5 h-5" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 leading-tight">
                  {isUploading
                    ? 'Загрузка файла на сервер...'
                    : 'Перетащите файл сюда, выберите на диске или укажите ссылку'}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{defaultHelper}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full xl:w-auto justify-start xl:justify-end mt-1 xl:mt-0">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Выбрать файл</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className={`px-3 py-2 border rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  showUrlInput
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'bg-white hover:bg-gray-100 border-gray-300 text-slate-600'
                }`}
              >
                Вставить URL
              </button>
            </div>
          </div>

          {/* Direct URL input expandable drawer */}
          {showUrlInput && (
            <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-300 shadow-2xs">
              <LinkIcon className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder={placeholder || 'https://... вставьте прямую ссылку'}
                className="flex-1 text-xs px-2 py-1.5 outline-none text-gray-800 font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddManualUrl();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddManualUrl}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shrink-0"
              >
                Применить
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="p-1.5 text-gray-400 hover:text-slate-500 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
