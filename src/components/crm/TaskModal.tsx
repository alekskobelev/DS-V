import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckSquare, 
  Building2, 
  User, 
  Briefcase, 
  Plus, 
  Trash2, 
  Bell,
  Sparkles
} from 'lucide-react';
import { UserTask, TaskPriority, TaskStatus, TaskTargetType, TaskReminderOption, TaskChecklistItem, CrmCompany, CrmContact } from '../../types';
import { useFormAutoSave } from '../../hooks/useFormAutoSave';
import { AutoSaveDraftBanner } from '../common/AutoSaveDraftBanner';
import { useModalStack } from '../../hooks/useModalStack';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<UserTask>) => Promise<void>;
  task?: UserTask | null;
  companies: CrmCompany[];
  contacts: CrmContact[];
  initialCompanyId?: string;
  initialContactId?: string;
  initialDealId?: string;
  initialDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  companies,
  contacts,
  initialCompanyId,
  initialContactId,
  initialDealId,
  initialDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('18:00');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('new');
  const [targetType, setTargetType] = useState<TaskTargetType>('personal');
  const [companyId, setCompanyId] = useState('');
  const [contactId, setContactId] = useState('');
  const [dealId, setDealId] = useState('');
  const [reminder, setReminder] = useState<TaskReminderOption>('15_min_before');
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { containerRef, zIndex } = useModalStack({
    id: `crm-task-modal-${task?.id || 'new'}`,
    isOpen,
    onClose,
    baseZIndex: 580
  });

  // Initialize form
  useEffect(() => {
    if (!isOpen) return;

    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(task.dueTime || '18:00');
      setPriority(task.priority || 'medium');
      setStatus(task.status || 'new');
      setTargetType(task.targetType || 'personal');
      setCompanyId(task.companyId || '');
      setContactId(task.contactId || '');
      setDealId(task.dealId || '');
      setReminder(task.reminder || '15_min_before');
      setChecklist(task.checklist || []);
    } else {
      const today = initialDate || new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setDueDate(today);
      setDueTime('17:00');
      setPriority('medium');
      setStatus('new');
      setReminder('15_min_before');
      setChecklist([]);

      if (initialCompanyId) {
        setTargetType('company');
        setCompanyId(initialCompanyId);
      } else if (initialContactId) {
        setTargetType('contact');
        setContactId(initialContactId);
        const ct = contacts.find(c => c.id === initialContactId);
        if (ct?.companyId) setCompanyId(ct.companyId);
      } else if (initialDealId) {
        setTargetType('deal');
        setDealId(initialDealId);
      } else {
        setTargetType('personal');
        setCompanyId('');
        setContactId('');
        setDealId('');
      }
    }
    setError(null);
  }, [isOpen, task, initialCompanyId, initialContactId, initialDealId, initialDate, contacts]);

  const taskFormData = useMemo(() => ({
    title, description, dueDate, dueTime, priority, status, targetType, companyId, contactId, dealId, reminder
  }), [title, description, dueDate, dueTime, priority, status, targetType, companyId, contactId, dealId, reminder]);

  const autoSave = useFormAutoSave({
    formKey: `task_modal_${task?.id || 'new'}`,
    formData: taskFormData,
    enabled: isOpen,
    onRestore: (saved) => {
      if (saved.title) setTitle(saved.title);
      if (saved.description) setDescription(saved.description);
      if (saved.dueDate) setDueDate(saved.dueDate);
      if (saved.dueTime) setDueTime(saved.dueTime);
      if (saved.priority) setPriority(saved.priority);
      if (saved.status) setStatus(saved.status);
      if (saved.targetType) setTargetType(saved.targetType);
      if (saved.companyId) setCompanyId(saved.companyId);
      if (saved.contactId) setContactId(saved.contactId);
      if (saved.dealId) setDealId(saved.dealId);
      if (saved.reminder) setReminder(saved.reminder);
    }
  });

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setChecklist(prev => [
      ...prev,
      { id: `chk-${Date.now()}-${Math.floor(Math.random() * 1000)}`, text: newSubtaskText.trim(), completed: false }
    ]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleRemoveSubtask = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Укажите название задачи');
      return;
    }
    if (!dueDate) {
      setError('Укажите дату выполнения задачи');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let targetTitle: string | undefined;
      let targetId: string | undefined;

      if (targetType === 'company') {
        const comp = companies.find(c => c.id === companyId);
        targetTitle = comp?.name;
        targetId = companyId;
      } else if (targetType === 'contact') {
        const cont = contacts.find(c => c.id === contactId);
        targetTitle = cont ? `${cont.fullName} (${cont.companyName})` : undefined;
        targetId = contactId;
      } else if (targetType === 'deal') {
        targetTitle = dealId;
        targetId = dealId;
      }

      await onSave({
        id: task?.id,
        title: title.trim(),
        description: description.trim(),
        dueDate,
        dueTime,
        dueDateTime: new Date(`${dueDate}T${dueTime || '18:00'}:00`).toISOString(),
        priority,
        status,
        targetType,
        targetId,
        targetTitle,
        companyId: targetType === 'company' || targetType === 'contact' ? (companyId || undefined) : undefined,
        contactId: targetType === 'contact' ? (contactId || undefined) : undefined,
        dealId: targetType === 'deal' ? (dealId || undefined) : undefined,
        reminder,
        checklist,
      });

      autoSave.clearDraft();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения задачи');
    } finally {
      setSaving(false);
    }
  };

  const selectedCompanyContacts = contacts.filter(c => !companyId || c.companyId === companyId);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-start justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
      style={{ zIndex }}
    >
      <div 
        ref={containerRef}
        tabIndex={-1}
        id="task-modal"
        className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4 sm:my-8"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {task ? 'Редактирование задачи' : 'Новая рабочая задача / цель'}
              </h2>
              <p className="text-xs text-gray-500">
                Планирование рабочего дня инженера и контроль обязательств «ДС‑Инжиниринг»
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

        {/* AutoSave Draft Banner */}
        <div className="px-4 py-1.5 bg-slate-50 border-b border-gray-100">
          <AutoSaveDraftBanner
            hasDraft={autoSave.hasDraft}
            lastSavedAt={autoSave.lastSavedAt}
            statusText={autoSave.statusText}
            onRestore={autoSave.restoreDraft}
            onClear={autoSave.clearDraft}
          />
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Название задачи / цель <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Согласовать регламентное ТО мостовой КИМ Mitutoyo"
              className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Подробное описание и целевой результат
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Укажите технические детали, контакты, требования ГОСТ/ВНИИМС или пункты технического задания..."
              className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Deadline & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Срок выполнения <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
                />
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Точное время дедлайна
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
                />
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
              >
                <option value="low">🟢 Низкий (Плановый)</option>
                <option value="medium">🟡 Средний (Рабочий)</option>
                <option value="urgent">🔴 Срочный (Горящий дедлайн)</option>
              </select>
            </div>
          </div>

          {/* Status & Reminder Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Текущий статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
              >
                <option value="new">Новая задача</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Выполнено</option>
                <option value="postponed">Отложено / На паузе</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Напоминание в системе
              </label>
              <div className="relative">
                <select
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value as TaskReminderOption)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
                >
                  <option value="none">Без напоминания</option>
                  <option value="15_min_before">За 15 минут до срока</option>
                  <option value="1_hour_before">За 1 час до срока</option>
                  <option value="at_due">В момент наступления срока</option>
                </select>
                <Bell className="w-4 h-4 text-blue-500 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Checklist (Подзадачи) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>Внутренний чек-лист (Подзадачи)</span>
              </label>
              <span className="text-[11px] font-semibold text-gray-500">
                {checklist.filter(i => i.completed).length} из {checklist.length} выполнено
              </span>
            </div>

            {/* Checklist items */}
            {checklist.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {checklist.map((item) => (
                  <div 
                    key={item.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded-lg text-xs transition-all ${
                      item.completed 
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 line-through opacity-80' 
                        : 'bg-white text-gray-800 border border-gray-200 shadow-2xs'
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleSubtask(item.id)}
                        className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="truncate font-medium">{item.text}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(item.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors"
                      title="Удалить подзадачу"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add subtask input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Добавить пункт чек-листа (например: Запросить протокол поверки)..."
                className="flex-1 px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить</span>
              </button>
            </div>
          </div>

          {/* Task Target Binding */}
          <div className="p-4 bg-slate-50 border border-gray-200 rounded-lg space-y-3">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
              Привязка задачи (Контекст выполнения)
            </label>

            {/* Target Type Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'personal', label: 'Личная цель', icon: User },
                { id: 'company', label: 'Предприятие', icon: Building2 },
                { id: 'contact', label: 'Контактное лицо', icon: User },
                { id: 'deal', label: 'Сделка / Проект', icon: Briefcase },
              ].map(t => {
                const Icon = t.icon;
                const isSelected = targetType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTargetType(t.id as TaskTargetType)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Specific binding fields */}
            {targetType === 'company' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Выберите предприятие контрагента:
                </label>
                <select
                  value={companyId}
                  onChange={(e) => {
                    setCompanyId(e.target.value);
                    setContactId('');
                  }}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:border-blue-500 outline-hidden"
                >
                  <option value="">-- Выберите компанию из базы --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (ИНН: {c.inn}, {c.city})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetType === 'contact' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Предприятие:
                  </label>
                  <select
                    value={companyId}
                    onChange={(e) => {
                      setCompanyId(e.target.value);
                      setContactId('');
                    }}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
                  >
                    <option value="">-- Все предприятия --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Сотрудник (контактное лицо):
                  </label>
                  <select
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:border-blue-500 outline-hidden"
                  >
                    <option value="">-- Выберите контакт --</option>
                    {selectedCompanyContacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} — {c.position} {c.isDecisionMaker ? '★ ЛПР' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {targetType === 'deal' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Номер сделки / проекта CRM:
                </label>
                <input
                  type="text"
                  value={dealId}
                  onChange={(e) => setDealId(e.target.value)}
                  placeholder="Например: СДЕЛКА-2026-001 (ПАО ОДК-Кузнецов)"
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
                />
              </div>
            )}

            {targetType === 'personal' && (
              <p className="text-xs text-gray-500 italic">
                Чисто персональная цель или задача самоконтроля. Не привязывается к контрагентам и клиентам.
              </p>
            )}
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
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {saving ? (
                <span>Сохранение...</span>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  <span>{task ? 'Сохранить изменения' : 'Создать задачу'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
