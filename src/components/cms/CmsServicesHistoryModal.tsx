import React from 'react';
import { 
  History, 
  RotateCcw, 
  Clock, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeftRight, 
  FileText, 
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  ServiceItem, 
  ServiceVersionSnapshot, 
  getServicesHistory, 
  restoreServicesVersion, 
  rollbackToPreviousVersion,
  clearServicesHistory
} from '../../data/services';

interface CmsServicesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentServices: ServiceItem[];
  onRestore: (restoredServices: ServiceItem[]) => void;
  showToast?: (message: string) => void;
}

export const CmsServicesHistoryModal: React.FC<CmsServicesHistoryModalProps> = ({
  isOpen,
  onClose,
  currentServices,
  onRestore,
  showToast
}) => {
  const [history, setHistory] = React.useState<ServiceVersionSnapshot[]>([]);
  const [selectedVersionId, setSelectedVersionId] = React.useState<string | null>(null);

  const refreshHistory = React.useCallback(() => {
    const list = getServicesHistory();
    setHistory(list);
    if (list.length > 0 && (!selectedVersionId || !list.some(v => v.id === selectedVersionId))) {
      setSelectedVersionId(list[0].id);
    }
  }, [selectedVersionId]);

  React.useEffect(() => {
    if (isOpen) {
      refreshHistory();
    }
  }, [isOpen, refreshHistory]);

  if (!isOpen) return null;

  const selectedSnapshot = history.find(v => v.id === selectedVersionId) || history[0];

  const handleRollback = (versionId: string) => {
    const target = history.find(v => v.id === versionId);
    if (!target) return;

    if (window.confirm(`Вы действительно хотите откатить реестр услуг к версии #${target.versionNumber} от ${target.formattedDate}? Текущее состояние будет сохранено в историю перед откатом.`)) {
      const restored = restoreServicesVersion(versionId);
      if (restored) {
        onRestore(restored);
        refreshHistory();
        if (showToast) {
          showToast(`Реестр услуг успешно восстановлен из версии #${target.versionNumber}!`);
        }
        onClose();
      } else {
        if (showToast) {
          showToast('Ошибка при восстановлении данных версии');
        }
      }
    }
  };

  const handleQuickRollbackOneStep = () => {
    if (history.length < 2) {
      if (showToast) showToast('Недостаточно сохраненных версий для отката на 1 шаг назад');
      return;
    }
    const prev = history[1];
    if (window.confirm(`Выполнить быстрый откат на 1 шаг назад к версии #${prev.versionNumber} от ${prev.formattedDate}?`)) {
      const res = rollbackToPreviousVersion();
      if (res.success && res.services) {
        onRestore(res.services);
        refreshHistory();
        if (showToast) showToast(res.message);
        onClose();
      } else {
        if (showToast) showToast(res.message || 'Ошибка отката');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-[#1E3A8A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <History className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 id="history-modal-title" className="text-base font-bold flex items-center gap-2">
                <span>История версий и откат изменений услуг</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-300/30 px-2 py-0.5 rounded-full font-semibold">
                  Хранится до 5 версий в localStorage
                </span>
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Автоматическое версионирование структуры ServiceItem для защиты от случайной порчи данных
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/50">
          {/* Left Column: Version list (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Сохраненные снимки ({history.length}/5)
              </span>
              {history.length >= 2 && (
                <button
                  type="button"
                  onClick={handleQuickRollbackOneStep}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Откат на 1 шаг</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-gray-200 text-center text-xs text-slate-500 space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p>История версий пока пуста. Снимки создаются автоматически при каждом сохранении услуг.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((snapshot, index) => {
                  const isSelected = snapshot.id === selectedSnapshot?.id;
                  const isLatest = index === 0;

                  return (
                    <button
                      key={snapshot.id}
                      type="button"
                      onClick={() => setSelectedVersionId(snapshot.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-bold text-slate-900">
                              Версия #{snapshot.versionNumber}
                            </span>
                            {isLatest && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                                Текущая
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 font-medium line-clamp-1">
                            {snapshot.description}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{snapshot.formattedDate}</span>
                            </span>
                            <span>•</span>
                            <span>{snapshot.servicesCount} услуг</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Version Details & Preview (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
            {selectedSnapshot ? (
              <div className="space-y-4 flex-1">
                <div className="border-b border-gray-100 pb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Снимок версии #{selectedSnapshot.versionNumber}
                      </span>
                      <span className="text-xs text-slate-400">({selectedSnapshot.formattedDate})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      {selectedSnapshot.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRollback(selectedSnapshot.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Откатить к этой версии</span>
                  </button>
                </div>

                {/* Content preview */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Услуги в данном снимке ({selectedSnapshot.services.length}):
                  </span>
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {selectedSnapshot.services.map((s, i) => (
                      <div key={s.id || i} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900">{i + 1}. {s.title}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded">
                            {s.calculatorType || 'scanning'}
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-1">{s.shortDesc}</p>
                        <div className="text-[11px] text-slate-500 flex flex-wrap gap-2 pt-0.5">
                          <span>💰 {s.basePriceText || 'по запросу'}</span>
                          <span>🔧 Приборов: {s.equipmentUsed?.length || 0}</span>
                          <span>📋 Этапов: {s.steps?.length || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 text-xs text-slate-400">
                Выберите версию слева для просмотра деталей
              </div>
            )}

            {/* Footer warning */}
            <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-amber-700 bg-amber-50/60 p-3 rounded-lg border border-amber-200/60">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                При откате текущее состояние будет автоматически сохранено в историю как предыдущий шаг.
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Хранилище: <code className="text-[11px] bg-gray-200 px-1.5 py-0.5 rounded font-mono">localStorage['ds_cms_services_history']</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
