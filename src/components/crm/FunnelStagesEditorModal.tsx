import React, { useState, useMemo } from 'react';
import { 
  X, 
  Workflow, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Edit2, 
  Check, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Cpu,
  Settings,
  LifeBuoy,
  Layers,
  Sparkles,
  MoveHorizontal
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FunnelStage, FunnelConfig, CRM_FUNNELS, getFunnelIconComponent } from './CrmPanel';

interface FunnelStagesEditorModalProps {
  initialFunnelId?: string;
  onClose: () => void;
}

const COLOR_PALETTES = [
  { label: 'Синий (Лиды)', value: 'border-blue-200 bg-blue-50/50 text-blue-800' },
  { label: 'Голубой / Циан (ТКП)', value: 'border-cyan-200 bg-cyan-50/50 text-cyan-800' },
  { label: 'Фиолетовый (Демо / NDA)', value: 'border-purple-200 bg-purple-50/50 text-purple-800' },
  { label: 'Янтарный (Договор / Счета)', value: 'border-amber-200 bg-amber-50/50 text-amber-800' },
  { label: 'Оранжевый (Логистика / Заказ)', value: 'border-orange-200 bg-orange-50/50 text-orange-800' },
  { label: 'Бирюзовый / Тил (Внедрение)', value: 'border-teal-200 bg-teal-50/50 text-teal-800' },
  { label: 'Изумрудный (Успех / Won)', value: 'border-emerald-200 bg-emerald-50/50 text-emerald-800' },
  { label: 'Розовый / Алый (Отказ / Lost)', value: 'border-rose-200 bg-rose-50/50 text-rose-800' },
  { label: 'Нейтральный серый', value: 'border-slate-200 bg-slate-50/50 text-slate-800' }
];

export const FunnelStagesEditorModal: React.FC<FunnelStagesEditorModalProps> = ({
  initialFunnelId = 'equipment',
  onClose
}) => {
  const { funnels, updateFunnelStages, resetFunnelsToDefault, deals, setDeals, showToast } = useApp();

  const [selectedFunnelId, setSelectedFunnelId] = useState<string>(initialFunnelId);
  const [isSaving, setIsSaving] = useState(false);

  // Derive initial stages for each funnel merging default CRM_FUNNELS with context funnels
  const activeFunnelsMap = useMemo(() => {
    const map: Record<string, FunnelStage[]> = {};
    Object.values(CRM_FUNNELS).forEach(def => {
      const dbFunnel = funnels.find(f => f.id === def.id);
      map[def.id] = (dbFunnel && dbFunnel.stages && dbFunnel.stages.length > 0)
        ? JSON.parse(JSON.stringify(dbFunnel.stages))
        : JSON.parse(JSON.stringify(def.stages));
    });
    return map;
  }, [funnels]);

  // Working state for stages of the selected funnel
  const [localStagesMap, setLocalStagesMap] = useState<Record<string, FunnelStage[]>>(activeFunnelsMap);
  const currentStages = localStagesMap[selectedFunnelId] || [];

  // Edit / Add stage form state
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageFormData, setStageFormData] = useState<Partial<FunnelStage>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Migration modal state when deleting a stage with active deals
  const [deleteStageCandidate, setDeleteStageCandidate] = useState<FunnelStage | null>(null);
  const [migrationTargetStageId, setMigrationTargetStageId] = useState<string>('');

  const funnelsList = [
    { id: 'equipment', name: 'Оборудование и ПО', icon: Cpu, desc: 'КИМ, 3D-сканеры, ПО PolyWorks, САПР TopSolid 7' },
    { id: 'services', name: 'Инжиниринг', icon: Settings, desc: '3D-сканирование, реверс, постпроцессоры' },
    { id: 'support', name: 'Сервис и ТО', icon: LifeBuoy, desc: 'ТО КИМ, поверка, калибровка и ремонт' },
  ];

  // Count deals on each stage in this funnel
  const stageDealsCount = useMemo(() => {
    const counts: Record<string, number> = {};
    deals.filter(d => d.funnel === selectedFunnelId).forEach(d => {
      counts[d.stage] = (counts[d.stage] || 0) + 1;
    });
    return counts;
  }, [deals, selectedFunnelId]);

  // Reorder stage up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const nextStages = [...currentStages];
    const temp = nextStages[index - 1];
    nextStages[index - 1] = nextStages[index];
    nextStages[index] = temp;
    setLocalStagesMap(prev => ({ ...prev, [selectedFunnelId]: nextStages }));
  };

  // Reorder stage down
  const handleMoveDown = (index: number) => {
    if (index === currentStages.length - 1) return;
    const nextStages = [...currentStages];
    const temp = nextStages[index + 1];
    nextStages[index + 1] = nextStages[index];
    nextStages[index] = temp;
    setLocalStagesMap(prev => ({ ...prev, [selectedFunnelId]: nextStages }));
  };

  // Start editing a stage
  const handleStartEdit = (stage: FunnelStage) => {
    setEditingStageId(stage.id);
    setIsAddingNew(false);
    setStageFormData({ ...stage });
  };

  // Save edited stage
  const handleSaveStageForm = () => {
    if (!stageFormData.label || !stageFormData.label.trim()) {
      showToast('Укажите название этапа');
      return;
    }

    const shortLabel = stageFormData.shortLabel?.trim() || stageFormData.label.slice(0, 14);
    const winRate = Math.max(0, Math.min(100, Number(stageFormData.winRate) || 0));
    const color = stageFormData.color || 'border-blue-200 bg-blue-50/50 text-blue-800';

    if (isAddingNew) {
      const generatedId = `stage_${Date.now().toString().slice(-6)}`;
      const newStage: FunnelStage = {
        id: generatedId,
        label: stageFormData.label.trim(),
        shortLabel,
        winRate,
        color,
        isWon: Boolean(stageFormData.isWon),
        isLost: Boolean(stageFormData.isLost)
      };

      // Insert new stage right before won/lost closing stages if they exist
      const closingIdx = currentStages.findIndex(s => s.isWon || s.isLost);
      let nextStages: FunnelStage[];
      if (closingIdx !== -1) {
        nextStages = [
          ...currentStages.slice(0, closingIdx),
          newStage,
          ...currentStages.slice(closingIdx)
        ];
      } else {
        nextStages = [...currentStages, newStage];
      }

      setLocalStagesMap(prev => ({ ...prev, [selectedFunnelId]: nextStages }));
      setIsAddingNew(false);
      setEditingStageId(null);
      setStageFormData({});
      showToast(`Этап «${newStage.label}» добавлен в воронку`);
    } else if (editingStageId) {
      const nextStages = currentStages.map(s => {
        if (s.id === editingStageId) {
          return {
            ...s,
            label: stageFormData.label!.trim(),
            shortLabel,
            winRate,
            color,
            isWon: Boolean(stageFormData.isWon),
            isLost: Boolean(stageFormData.isLost)
          };
        }
        return s;
      });

      setLocalStagesMap(prev => ({ ...prev, [selectedFunnelId]: nextStages }));
      setEditingStageId(null);
      setStageFormData({});
      showToast('Параметры этапа обновлены');
    }
  };

  // Delete stage with deal migration
  const handleDeleteStagePrompt = (stage: FunnelStage) => {
    const dealsCount = stageDealsCount[stage.id] || 0;
    if (dealsCount > 0) {
      const otherStages = currentStages.filter(s => s.id !== stage.id);
      setMigrationTargetStageId(otherStages[0]?.id || '');
      setDeleteStageCandidate(stage);
    } else {
      // Direct delete if 0 deals
      const nextStages = currentStages.filter(s => s.id !== stage.id);
      setLocalStagesMap(prev => ({ ...prev, [selectedFunnelId]: nextStages }));
      showToast(`Этап «${stage.label}» удален`);
    }
  };

  // Confirm delete with migration
  const handleConfirmDeleteMigration = () => {
    if (!deleteStageCandidate) return;
    const stageId = deleteStageCandidate.id;
    const dealsCount = stageDealsCount[stageId] || 0;

    // Migrate deals to migrationTargetStageId
    if (dealsCount > 0 && migrationTargetStageId) {
      const targetStage = currentStages.find(s => s.id === migrationTargetStageId);
      setDeals(prevDeals => {
        return prevDeals.map(d => {
          if (d.funnel === selectedFunnelId && d.stage === stageId) {
            return {
              ...d,
              stage: migrationTargetStageId,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...(d.timeline || []),
                {
                  id: `tl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  type: 'status_change',
                  date: new Date().toISOString(),
                  author: 'Система CRM',
                  title: 'Перенос сделки при удалении этапа',
                  description: `Этап «${deleteStageCandidate.label}» был удален. Сделка автоматически переведена на этап «${targetStage?.label || migrationTargetStageId}».`
                }
              ]
            };
          }
          return d;
        });
      });
      showToast(`Перенесено сделок: ${dealsCount} на этап «${targetStage?.label || migrationTargetStageId}»`);
    }

    const nextStages = currentStages.filter(s => s.id !== stageId);
    setLocalStagesMap(prev => ({ ...prev, [selectedFunnelId]: nextStages }));
    setDeleteStageCandidate(null);
  };

  // Save changes to backend and AppContext
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateFunnelStages(selectedFunnelId, currentStages);
      showToast(`Этапы воронки «${funnelsList.find(f => f.id === selectedFunnelId)?.name}» успешно сохранены`);
      onClose();
    } catch (e) {
      showToast('Ошибка при сохранении этапов воронки');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleResetToDefault = async () => {
    const defaultStages = (CRM_FUNNELS as any)[selectedFunnelId]?.stages || [];
    setLocalStagesMap(prev => ({
      ...prev,
      [selectedFunnelId]: JSON.parse(JSON.stringify(defaultStages))
    }));
    showToast('Этапы текущей воронки сброшены к заводским настройкам');
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Управление этапами воронок продаж CRM
                </h3>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {currentStages.length} этапов
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Создание, редактирование, изменение порядка и удаление стадий канбан-доски
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Funnel Selector Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 flex flex-wrap gap-2">
          {funnelsList.map((f) => {
            const Icon = getFunnelIconComponent(f.icon);
            const isSelected = selectedFunnelId === f.id;
            const stageCount = (localStagesMap[f.id] || []).length;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setSelectedFunnelId(f.id);
                  setEditingStageId(null);
                  setIsAddingNew(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{f.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {stageCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stages List Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Instructions banner */}
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg flex items-center justify-between text-blue-900 dark:text-blue-200 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Настройте последовательность этапов для воронки «<strong>{funnelsList.find(f => f.id === selectedFunnelId)?.name}</strong>». Вы можете перемещать этапы стрелками вверх/вниз, менять процент конверсии и добавлять новые стадии.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(true);
                setEditingStageId(null);
                setStageFormData({
                  label: '',
                  shortLabel: '',
                  winRate: 50,
                  color: 'border-blue-200 bg-blue-50/50 text-blue-800',
                  isWon: false,
                  isLost: false
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all shrink-0 cursor-pointer ml-3"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить этап</span>
            </button>
          </div>

          {/* New / Edit Form Accordion */}
          {(isAddingNew || editingStageId) && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-2 border-blue-400 dark:border-blue-600 space-y-3 shadow-sm">
              <div className="flex items-center justify-between font-bold text-xs text-blue-950 dark:text-blue-200">
                <span className="flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  {isAddingNew ? 'Создание нового этапа' : 'Редактирование параметров этапа'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingStageId(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Отмена
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Полное название этапа *:
                  </label>
                  <input
                    type="text"
                    value={stageFormData.label || ''}
                    onChange={(e) => setStageFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Например: 4. Согласование спецификации и NDA"
                    className="w-full h-9 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Короткий ярлык (для компактных бейджей):
                  </label>
                  <input
                    type="text"
                    value={stageFormData.shortLabel || ''}
                    onChange={(e) => setStageFormData(prev => ({ ...prev, shortLabel: e.target.value }))}
                    placeholder="Например: Спецификация"
                    className="w-full h-9 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Вероятность закрытия сделки (% winRate): {stageFormData.winRate || 0}%
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={stageFormData.winRate ?? 50}
                      onChange={(e) => setStageFormData(prev => ({ ...prev, winRate: Number(e.target.value) }))}
                      className="flex-1 accent-blue-600"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={stageFormData.winRate ?? 50}
                      onChange={(e) => setStageFormData(prev => ({ ...prev, winRate: Number(e.target.value) }))}
                      className="w-16 h-8 px-2 text-center text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Цветовая гамма этапа:
                  </label>
                  <select
                    value={stageFormData.color || COLOR_PALETTES[0].value}
                    onChange={(e) => setStageFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-9 px-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  >
                    {COLOR_PALETTES.map((pal, idx) => (
                      <option key={idx} value={pal.value}>
                        {pal.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Flags */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stageFormData.isWon || false}
                    onChange={(e) => setStageFormData(prev => ({ 
                      ...prev, 
                      isWon: e.target.checked, 
                      winRate: e.target.checked ? 100 : prev.winRate,
                      isLost: e.target.checked ? false : prev.isLost 
                    }))}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    🏆 Финальный успешный этап (Won / Сделка закрыта успешно)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stageFormData.isLost || false}
                    onChange={(e) => setStageFormData(prev => ({ 
                      ...prev, 
                      isLost: e.target.checked, 
                      winRate: e.target.checked ? 0 : prev.winRate,
                      isWon: e.target.checked ? false : prev.isWon 
                    }))}
                    className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    ❌ Этап отказа / срыва (Lost / Архив)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingStageId(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSaveStageForm}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isAddingNew ? 'Добавить в список' : 'Применить правки'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Stages Table / List */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
            {currentStages.map((stage, idx) => {
              const dealsCount = stageDealsCount[stage.id] || 0;
              const isFirst = idx === 0;
              const isLast = idx === currentStages.length - 1;

              return (
                <div 
                  key={stage.id} 
                  className={`p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors ${
                    editingStageId === stage.id ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  {/* Left: Reorder Controls & Index */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveUp(idx)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Поднять этап выше"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveDown(idx)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Опустить этап ниже"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Middle: Stage Info & Badges */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {stage.label}
                      </span>
                      {stage.shortLabel && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                          {stage.shortLabel}
                        </span>
                      )}
                      {stage.isWon && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          УСПЕХ (WON)
                        </span>
                      )}
                      {stage.isLost && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-extrabold">
                          ОТКАЗ (LOST)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        Вероятность сделки: <strong className="text-slate-700 dark:text-slate-300">{stage.winRate}%</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Сделок на этапе: <strong className={`font-bold ${dealsCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>{dealsCount}</strong>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-slate-400">ID: {stage.id}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(stage)}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Редактировать этап"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Изменить</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteStagePrompt(stage)}
                      className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title={dealsCount > 0 ? `Удалить этап (с переносом ${dealsCount} сделок)` : 'Удалить этап'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Удалить</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Восстановить заводские этапы этой воронки"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Сбросить к эталону</span>
            <span className="sm:hidden">Сброс</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-lg shadow-sm shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Сохранение...' : 'Сохранить этапы'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Migration Confirmation Modal */}
      {deleteStageCandidate && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  На этапе «{deleteStageCandidate.label}» есть активные сделки ({stageDealsCount[deleteStageCandidate.id] || 0} шт.)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Чтобы не потерять клиентов и контракты, выберите этап, на который автоматически переместить все сделки перед удалением стадии:
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Целевой этап для переноса:
              </label>
              <select
                value={migrationTargetStageId}
                onChange={(e) => setMigrationTargetStageId(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currentStages
                  .filter(s => s.id !== deleteStageCandidate.id)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({stageDealsCount[s.id] || 0} сделок)
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteStageCandidate(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMigration}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Перенести и удалить</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
