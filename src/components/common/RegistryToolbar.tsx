import React, { useState } from 'react';
import { Search, LayoutGrid, Table as TableIcon, List as ListIcon, FileText, Download, Loader2 } from 'lucide-react';

export interface RegistryToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  viewMode: 'cards' | 'table' | 'list';
  setViewMode: (val: 'cards' | 'table' | 'list') => void;
  totalCount: number;
  searchPlaceholder?: string;
  onExportPdf?: () => void | Promise<void>;
  isExportingPdf?: boolean;
  onExportExcel?: () => void | Promise<void>;
  children?: React.ReactNode;
}

export const RegistryToolbar: React.FC<RegistryToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  totalCount,
  searchPlaceholder = 'Поиск...',
  onExportPdf,
  isExportingPdf = false,
  onExportExcel,
  children
}) => {
  return (
    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6">
      {/* Search & Custom Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        {children}
      </div>

      {/* View Modes & Export & Total */}
      <div className="flex items-center justify-between gap-3 shrink-0 flex-wrap">
        {/* Export Buttons */}
        {(onExportPdf || onExportExcel) && (
          <div className="flex items-center gap-1.5">
            {onExportPdf && (
              <button
                type="button"
                onClick={onExportPdf}
                disabled={isExportingPdf}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                title="Экспорт текущей таблицы/списка в PDF"
              >
                {isExportingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>{isExportingPdf ? 'Формирование PDF...' : 'Экспорт в PDF'}</span>
              </button>
            )}

            {onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Экспорт в Excel / CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
            )}
          </div>
        )}

        <div className="text-[11px] font-bold text-gray-500 bg-gray-100 px-4 py-1.5 rounded-lg border border-gray-200 shrink-0">
          Всего записей: <span className="text-gray-900">{totalCount}</span>
        </div>
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              viewMode === 'cards' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500 hover:text-slate-500'
            }`}
            title="Карточки"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              viewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500 hover:text-slate-500'
            }`}
            title="Таблица"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              viewMode === 'list' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500 hover:text-slate-500'
            }`}
            title="Список"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
