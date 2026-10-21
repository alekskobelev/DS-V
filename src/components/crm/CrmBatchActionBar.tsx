import React, { useState } from 'react';
import { 
  CheckSquare, 
  X, 
  FileSpreadsheet, 
  FileText, 
  UserCheck, 
  Trash2, 
  ChevronDown, 
  Briefcase,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { STAFF_DIRECTORY } from '../../utils/staffDirectory';

export interface CrmBatchActionBarProps {
  selectedCount: number;
  totalCount: number;
  totalSum?: number;
  currency?: string;
  itemLabel?: string; // 'КП', 'Договоров', 'Сделок'
  onClearSelection: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  onReassignManager?: (managerName: string) => void;
  onBulkChangeStatus?: (status: string) => void;
  statusOptions?: { value: string; label: string }[];
  onDeleteSelected?: () => void;
  isAdmin?: boolean;
}

export const CrmBatchActionBar: React.FC<CrmBatchActionBarProps> = ({
  selectedCount,
  totalCount,
  totalSum,
  currency = '₽',
  itemLabel = 'документов',
  onClearSelection,
  onExportExcel,
  onExportPdf,
  onReassignManager,
  onBulkChangeStatus,
  statusOptions,
  onDeleteSelected,
  isAdmin = false
}) => {
  const [isManagerMenuOpen, setIsManagerMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[94%] bg-slate-900 text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Left: Selection summary */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
          <CheckSquare className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs sm:text-sm font-black flex items-center gap-2">
            <span>Выбрано: {selectedCount} из {totalCount} {itemLabel}</span>
          </div>
          {typeof totalSum === 'number' && totalSum > 0 && (
            <div className="text-[11px] text-emerald-400 font-mono font-bold">
              Общая сумма: {totalSum.toLocaleString('ru-RU')} {currency} (с НДС)
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Export to Excel */}
        {onExportExcel && (
          <button
            type="button"
            onClick={onExportExcel}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Экспортировать только выбранные позиции в Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">В Excel ({selectedCount})</span>
            <span className="sm:hidden">Excel</span>
          </button>
        )}

        {/* Export to PDF */}
        {onExportPdf && (
          <button
            type="button"
            onClick={onExportPdf}
            className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Экспортировать реестр выбранных в PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">В PDF ({selectedCount})</span>
            <span className="sm:hidden">PDF</span>
          </button>
        )}

        {/* Reassign Manager Menu */}
        {onReassignManager && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsManagerMenuOpen(!isManagerMenuOpen);
                setIsStatusMenuOpen(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Назначить другого ответственного менеджера для всех выбранных записей"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Менеджер</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isManagerMenuOpen && (
              <div className="absolute bottom-full mb-2 right-0 w-64 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                  Назначить сотрудника:
                </div>
                {Object.values(STAFF_DIRECTORY).map((staff, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onReassignManager(staff.shortName);
                      setIsManagerMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-bold">{staff.fullName}</div>
                      <div className="text-[10px] text-slate-500">{staff.position}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bulk Status Update */}
        {onBulkChangeStatus && statusOptions && statusOptions.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStatusMenuOpen(!isStatusMenuOpen);
                setIsManagerMenuOpen(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Сменить статус для всех выбранных записей"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Статус</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute bottom-full mb-2 right-0 w-56 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                  Установить статус:
                </div>
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onBulkChangeStatus(opt.value);
                      setIsStatusMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors font-medium cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Selected (Admin Only) */}
        {isAdmin && onDeleteSelected && (
          <div className="relative">
            {!isDeleteConfirmOpen ? (
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 transition-all cursor-pointer"
                title="Удалить выбранные записи"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-rose-950 p-1 rounded-xl border border-rose-700">
                <span className="text-[10px] text-rose-200 font-bold px-1.5">Удалить {selectedCount}?</span>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteSelected();
                    setIsDeleteConfirmOpen(false);
                  }}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black cursor-pointer"
                >
                  Да
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  Нет
                </button>
              </div>
            )}
          </div>
        )}

        {/* Clear Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Снять выделение"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
