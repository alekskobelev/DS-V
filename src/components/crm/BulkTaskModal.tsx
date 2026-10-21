import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckSquare, 
  Building2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Layers, 
  Send,
  Plus,
  Trash2
} from 'lucide-react';
import { ClientSegmentList, CrmCompany } from '../../types';

interface BulkTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  list?: ClientSegmentList | null;
  targetList?: ClientSegmentList | null;
  companies?: CrmCompany[];
  onExecuteBulkTask?: (listId: string, template: any) => Promise<void>;
  onSave?: (taskData: any) => Promise<void>;
}

export const BulkTaskModal: React.FC<BulkTaskModalProps> = ({
  isOpen,
  onClose,
  list: propList,
  targetList,
  companies = [],
  onExecuteBulkTask,
  onSave,
}) => {
  const list = targetList || propList;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('18:00');
  const [priority, setPriority] = useState<'low' | 'medium' | 'urgent'>('medium');
  const [subtasks, setSubtasks] = useState<string[]>([
    'Связаться с главным инженером / метрологом предприятия',
    'Направить коммерческое предложение и презентацию решений',
    'Зафиксировать итог переговоров в истории взаимодействия CRM',
  ]);
  const [newSubtask, setNewSubtask] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !list) return;
    setTitle(`Кампания: ${list.name}`);
    setDescription(`Массовое назначение задач по сегменту «${list.name}». Уведомить заказчиков о сервисных регламентах и акциях.`);
    
    // Default due in 3 days
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDueDate(d.toISOString().split('T')[0]);
    setDueTime('18:00');
    setPriority('medium');
    setError(null);
  }, [isOpen, list]);

  if (!isOpen || !list) return null;

  const targetCompanies = companies.filter(c => list.companyIds.includes(c.id));

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks(prev => [...prev, newSubtask.trim()]);
    setNewSubtask('');
  };

  const handleRemoveSubtask = (idx: number) => {
    setSubtasks(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setError('Укажите название задачи и срок выполнения');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onExecuteBulkTask(list.id, {
        title: title.trim(),
        description: description.trim(),
        dueDate,
        dueTime,
        priority,
        checklist: subtasks.map((text, i) => ({ id: `sub-${i + 1}`, text, completed: false })),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка массового назначения задач');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div 
        id="bulk-task-modal"
        className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4 sm:my-8"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-blue-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Массовое назначение задач по сегменту
              </h2>
              <p className="text-xs text-blue-700">
                Сегмент «{list.name}» • {targetCompanies.length} предприятий
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-slate-500 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Target preview */}
          <div className="p-3 bg-slate-50 border border-gray-200 rounded-lg text-xs">
            <div className="font-bold text-gray-800 mb-1.5">
              Предприятия, которым будет назначена типовая задача ({targetCompanies.length}):
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {targetCompanies.map(c => (
                <span key={c.id} className="px-2 py-0.5 bg-white border border-gray-200 text-slate-500 rounded-md font-medium text-[11px]">
                  {c.name} ({c.city})
                </span>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Шаблон названия задачи <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Уведомление об акции на калибровку КИМ в ФГИС АРШИН"
              className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
            />
            <p className="text-[11px] text-gray-400 mt-0.5">
              К названию задачи автоматически добавится название конкретного предприятия.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Инструкция / Цель для менеджера
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white outline-hidden resize-none"
            />
          </div>

          {/* Due date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Срок выполнения <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Время дедлайна
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-hidden"
              >
                <option value="medium">🟡 Средний</option>
                <option value="urgent">🔴 Срочный</option>
                <option value="low">🟢 Плановый</option>
              </select>
            </div>
          </div>

          {/* Subtasks (Чек-лист) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
              Типовой чек-лист подзадач для каждой компании:
            </label>
            <div className="space-y-1.5">
              {subtasks.map((st, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white border border-gray-200 rounded-lg text-xs">
                  <span className="font-medium text-gray-800 flex-1 truncate">{st}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Добавить пункт подзадачи..."
                className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 font-bold rounded-lg text-xs cursor-pointer"
              >
                Добавить
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-500 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving || targetCompanies.length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Создать {targetCompanies.length} задач</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
