import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileCheck2, 
  Trash2, 
  Download, 
  Loader2, 
  RefreshCw,
  LucideIcon,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { formatBytes, parsePointCloudText, parseStlBuffer, parseStepText } from '../../utils/cadFileParsers';

interface CadFileUploadCardProps {
  id: string;
  title: string;
  subtitle: string;
  targetModeLabel: string;
  icon: LucideIcon;
  formatPill: string;
  accept: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  onUploadSuccess: (info: {
    url: string;
    fileName: string;
    fileSize: string;
    detectedPoints?: number;
    detectedTriangles?: number;
  }) => void;
  onRemove: () => void;
}

export const CadFileUploadCard: React.FC<CadFileUploadCardProps> = ({
  id,
  title,
  subtitle,
  targetModeLabel,
  icon: Icon,
  formatPill,
  accept,
  fileUrl,
  fileName,
  fileSize,
  onUploadSuccess,
  onRemove
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      // 1. Client-side inspection of geometry stats
      let detectedPoints: number | undefined;
      let detectedTriangles: number | undefined;

      const lowerName = file.name.toLowerCase();
      try {
        if (lowerName.endsWith('.stl')) {
          const buffer = await file.arrayBuffer();
          const geom = parseStlBuffer(buffer);
          const posAttr = geom.getAttribute('position');
          if (posAttr) {
            detectedPoints = posAttr.count;
            detectedTriangles = Math.floor(posAttr.count / 3);
          }
        } else if (lowerName.endsWith('.xyz') || lowerName.endsWith('.pts') || lowerName.endsWith('.asc') || lowerName.endsWith('.txt')) {
          const text = await file.text();
          const parsed = parsePointCloudText(text);
          detectedPoints = parsed.pointCount;
        } else if (lowerName.endsWith('.stp') || lowerName.endsWith('.step')) {
          const text = await file.text();
          const parsed = parseStepText(text);
          detectedPoints = parsed.pointCount;
          detectedTriangles = parsed.facetCount;
        }
      } catch (clientErr) {
        console.warn('Local preview parse error (will proceed with upload):', clientErr);
      }

      // 2. Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.url) {
        throw new Error(data.error || 'Не удалось сохранить файл на сервере');
      }

      const sizeStr = formatBytes(file.size);
      onUploadSuccess({
        url: data.url,
        fileName: file.name,
        fileSize: sizeStr,
        detectedPoints,
        detectedTriangles
      });
    } catch (err: any) {
      console.error('3D File upload error:', err);
      setUploadError(err.message || 'Сбой загрузки файла');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const hasFile = Boolean(fileUrl && fileUrl.trim().length > 0);

  return (
    <div 
      id={id}
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        hasFile 
          ? 'bg-slate-900/60 dark:bg-slate-900/90 border-emerald-500/40 shadow-sm' 
          : isDragOver
            ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/20'
            : 'bg-gray-50/70 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/80 hover:border-gray-300 dark:hover:border-slate-600'
      }`}
    >
      <input 
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileProcess(file);
        }}
        className="hidden"
      />

      {/* Card Header */}
      <div className="p-3.5 pb-2.5 flex items-start justify-between gap-2 border-b border-gray-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            hasFile 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {title}
            </h5>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
            {formatPill}
          </span>
          {hasFile && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>Активен</span>
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3.5">
        {isUploading ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
              Загрузка и парсинг 3D-файла...
            </span>
            <span className="text-[10px] text-gray-500 dark:text-slate-400">
              Пожалуйста, подождите
            </span>
          </div>
        ) : hasFile ? (
          <div className="space-y-3">
            {/* File Info Box */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileCheck2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate" title={fileName || fileUrl}>
                    {fileName || fileUrl?.split('/').pop() || 'Файл 3D'}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-slate-400">
                    {fileSize && (
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {fileSize}
                      </span>
                    )}
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Режим: {targetModeLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={fileName || 'model-3d'}
                    title="Скачать файл"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Заменить файл"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  title="Удалить файл"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-4 text-center transition-all duration-200 group"
          >
            <Upload className="w-5 h-5 mx-auto mb-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Загрузить {title}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
              Перетащите файл сюда или нажмите для выбора ({accept.replace(/\./g, ' ')})
            </p>
          </div>
        )}

        {uploadError && (
          <div className="mt-2 text-[11px] text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg border border-red-200 dark:border-red-900/50">
            {uploadError}
          </div>
        )}
      </div>
    </div>
  );
};
