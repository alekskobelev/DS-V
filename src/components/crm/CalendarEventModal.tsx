import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Users, 
  Eye, 
  Wrench, 
  CheckCircle2, 
  Building2, 
  AlertTriangle,
  Trash2,
  Edit3,
  MonitorPlay,
  GraduationCap
} from 'lucide-react';
import { CalendarEvent, CalendarEventType, CalendarEventStatus, CrmCompany, CrmContact } from '../../types';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<CalendarEvent>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  event?: CalendarEvent | null;
  companies: CrmCompany[];
  contacts: CrmContact[];
  initialDate?: string;
  initialCompanyId?: string;
  initialContactId?: string;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  companies,
  contacts,
  initialDate,
  initialCompanyId,
  initialContactId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CalendarEventType>('meeting');
  const [customType, setCustomType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [contactId, setContactId] = useState('');
  const [dealId, setDealId] = useState('');
  const [status, setStatus] = useState<CalendarEventStatus>('scheduled');
  const [color, setColor] = useState('blue');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setType(event.type || 'meeting');
      setCustomType(event.customType || '');
      
      const s = new Date(event.startDateTime);
      const e = new Date(event.endDateTime);
      setStartDate(s.toISOString().split('T')[0]);
      setStartTime(s.toTimeString().substring(0, 5));
      setEndDate(e.toISOString().split('T')[0]);
      setEndTime(e.toTimeString().substring(0, 5));

      setLocation(event.location || '');
      setCompanyId(event.companyId || '');
      setContactId(event.contactId || '');
      setDealId(event.dealId || '');
      setStatus(event.status || 'scheduled');
      setColor(event.color || 'blue');
    } else {
      const today = initialDate || new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setType('meeting');
      setCustomType('');
      setStartDate(today);
      setStartTime('10:00');
      setEndDate(today);
      setEndTime('11:00');
      setLocation('');
      setCompanyId(initialCompanyId || '');
      setContactId(initialContactId || '');
      setDealId('');
      setStatus('scheduled');
      setColor('blue');
    }
    setError(null);
  }, [isOpen, event, initialDate, initialCompanyId, initialContactId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Укажите название события');
      return;
    }
    if (!startDate || !startTime || !endDate || !endTime) {
      setError('Укажите дату и время начала и окончания');
      return;
    }

    if (type === 'other' && !customType.trim()) {
      setError('Укажите свой тип события');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${endDate}T${endTime}:00`).toISOString();

      const selectedComp = companies.find(c => c.id === companyId);
      const selectedCont = contacts.find(c => c.id === contactId);

      await onSave({
        id: event?.id,
        title: title.trim(),
        description: description.trim(),
        type,
        customType: type === 'other' ? customType.trim() : undefined,
        startDateTime,
        endDateTime,
        location: location.trim(),
        companyId: companyId || undefined,
        companyName: selectedComp?.name,
        contactId: contactId || undefined,
        contactName: selectedCont ? `${selectedCont.fullName} (${selectedCont.position})` : undefined,
        dealId: dealId || undefined,
        dealTitle: dealId ? `Сделка ${dealId}` : undefined,
        status,
        color,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения события');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !onDelete) return;
    if (!confirm('Вы уверены, что хотите удалить данное событие из календаря?')) return;

    setDeleting(true);
    try {
      await onDelete(event.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления события');
    } finally {
      setDeleting(false);
    }
  };

  const selectedCompanyContacts = contacts.filter(c => !companyId || c.companyId === companyId);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div 
        id="calendar-event-modal"
        className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4 sm:my-8"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {event ? 'Событие календаря' : 'Запланировать событие в календаре'}
              </h2>
              <p className="text-xs text-gray-500">
                Звонки, встречи, демонстрации 3D-сканеров, ТО оборудования и прочие события
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Тип события <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'call', label: 'Звонок', icon: Phone, color: 'blue' },
                { id: 'meeting', label: 'Встреча', icon: Users, color: 'emerald' },
                { id: 'demo', label: 'Демонстрация', icon: Eye, color: 'purple' },
                { id: 'presentation', label: 'Презентация', icon: MonitorPlay, color: 'indigo' },
                { id: 'training', label: 'Обучение', icon: GraduationCap, color: 'cyan' },
                { id: 'maintenance', label: 'Задача по ТО', icon: Wrench, color: 'rose' },
                { id: 'other', label: 'Ручной ввод', icon: Edit3, color: 'slate' },
              ].map(t => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setType(t.id as CalendarEventType);
                      setColor(t.color);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-500 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {type === 'other' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Свой тип события <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required={type === 'other'}
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Например: Выездная пусконаладка"
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-hidden transition-all"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Название события <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Выездная демонстрация FreeScan UE Pro в цехе №4"
              className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:bg-white focus:border-purple-500 outline-hidden"
            />
          </div>

          {/* Time start & end */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
            <div>
              <label className="block text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                Начало события
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (!endDate) setEndDate(e.target.value);
                  }}
                  className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-gray-900 outline-hidden"
                />
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-gray-900 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                Окончание события
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-gray-900 outline-hidden"
                />
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-gray-900 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Место проведения / Формат
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Адрес завода, номер цеха, переговорная или ссылка на ВКС"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:border-purple-500 outline-hidden"
              />
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Binding: Company & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Предприятие (Клиент)
              </label>
              <select
                value={companyId}
                onChange={(e) => {
                  setCompanyId(e.target.value);
                  setContactId('');
                }}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-purple-500 outline-hidden"
              >
                <option value="">-- Без привязки --</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Контактное лицо
              </label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-purple-500 outline-hidden"
              >
                <option value="">-- Без привязки --</option>
                {selectedCompanyContacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.position}) {c.isDecisionMaker ? '★ ЛПР' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deal & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Сделка / Проект CRM
              </label>
              <input
                type="text"
                value={dealId}
                onChange={(e) => setDealId(e.target.value)}
                placeholder="СДЕЛКА-2026-001"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-purple-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Статус события
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CalendarEventStatus)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:border-purple-500 outline-hidden"
              >
                <option value="scheduled">Запланировано</option>
                <option value="completed">Успешно проведено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Повестка / Заметки к событию
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Вопросы для обсуждения, список образцов деталей для сканирования или состав выездной группы..."
              className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:border-purple-500 outline-hidden resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            {event && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{event ? 'Сохранить изменения' : 'Запланировать'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
