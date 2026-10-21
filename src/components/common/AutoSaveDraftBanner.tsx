import React from 'react';
import { Save, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';

interface AutoSaveDraftBannerProps {
  hasDraft: boolean;
  lastSavedAt: string | null;
  statusText: string | null;
  onRestore: () => void;
  onClear: () => void;
  className?: string;
}

export const AutoSaveDraftBanner: React.FC<AutoSaveDraftBannerProps> = ({
  hasDraft,
  lastSavedAt,
  statusText,
  onRestore,
  onClear,
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 transition-all ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
          {statusText ? (
            <span className="text-blue-600 dark:text-blue-400 font-bold inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {statusText}
            </span>
          ) : lastSavedAt ? (
            <span>Автосохранение (30с): сохранен в <strong className="font-mono">{lastSavedAt}</strong></span>
          ) : (
            <span>Автосохранение каждые 30с и при потере фокуса</span>
          )}
        </span>
      </div>

      {hasDraft && !statusText?.includes('восстановлен') && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onRestore}
            className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 font-bold rounded flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
            title="Восстановить ранее несохраненный черновик этой формы"
          >
            <RotateCcw className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Восстановить черновик</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            title="Очистить сохраненный черновик"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
