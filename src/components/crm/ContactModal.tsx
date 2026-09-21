import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Star, 
  Clock, 
  CheckSquare, 
  Plus, 
  MessageSquare, 
  AlertTriangle,
  History,
  Minimize,
  Maximize
} from 'lucide-react';
import { CrmContact, CrmCompany, ContactInteraction } from '../../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Partial<CrmContact>) => Promise<void>;
  onAddInteraction?: (contactId: string, interaction: { type: string; comment: string }) => Promise<void>;
  contact?: CrmContact | null;
  companies: CrmCompany[];
  initialCompanyId?: string;
  onOpenTaskModal?: (initialContactId: string) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onAddInteraction = async () => {},
  contact,
  companies,
  initialCompanyId,
  onOpenTaskModal,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [workPhone, setWorkPhone] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [email, setEmail] = useState('');
  const [isDecisionMaker, setIsDecisionMaker] = useState(false);
  const [notes, setNotes] = useState('');

  // New interaction input state
  const [interactionType, setInteractionType] = useState('call');
  const [interactionComment, setInteractionComment] = useState('');
  const [savingInteraction, setSavingInteraction] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (contact) {
      setCompanyId(contact.companyId || '');
      setFullName(contact.fullName || '');
      setPosition(contact.position || '');
      setDepartment(contact.department || '');
      setWorkPhone(contact.workPhone || '');
      setMobilePhone(contact.mobilePhone || '');
      setEmail(contact.email || '');
      setIsDecisionMaker(Boolean(contact.isDecisionMaker));
      setNotes(contact.notes || '');
    } else {
      setCompanyId(initialCompanyId || '');
      setFullName('');
      setPosition('');
      setDepartment('');
      setWorkPhone('');
      setMobilePhone('');
      setEmail('');
      setIsDecisionMaker(false);
      setNotes('');
    }
    setInteractionComment('');
    setError(null);
  }, [isOpen, contact, initialCompanyId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Укажите ФИО контактного лица');
      return;
    }

    const selectedComp = companies.find(c => c.id === companyId);
    const companyName = selectedComp ? selectedComp.name : (contact?.companyName || 'Не указано');

    setSaving(true);
    setError(null);

    try {
      await onSave({
        id: contact?.id,
        companyId: companyId || undefined,
        companyName,
        fullName: fullName.trim(),
        position: position.trim(),
        department: department.trim(),
        workPhone: workPhone.trim(),
        mobilePhone: mobilePhone.trim(),
        email: email.trim(),
        isDecisionMaker,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения контакта');
    } finally {
      setSaving(false);
    }
  };

  const handleAddInteractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact?.id || !interactionComment.trim()) return;

    setSavingInteraction(true);
    try {
      await onAddInteraction(contact.id, {
        type: interactionType,
        comment: interactionComment.trim(),
      });
      setInteractionComment('');
    } catch (err: any) {
      setError(err.message || 'Ошибка добавления записи взаимодействия');
    } finally {
      setSavingInteraction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div 
        id="contact-modal"
        className={`${isFullscreen ? 'max-w-none w-full h-full min-h-screen rounded-none' : 'max-w-2xl rounded-lg max-h-[92vh] my-4 sm:my-8'} bg-white shadow-sm border border-gray-100 w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-xs ${
              isDecisionMaker ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {isDecisionMaker ? <Star className="w-5 h-5 fill-current" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  {contact ? contact.fullName : 'Новый контакт предприятия'}
                </h2>
                {isDecisionMaker && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded text-[11px]">
                    ⭐ ЛПР
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Справочник контактных лиц заказчиков «ДС‑Инжиниринг»
              </p>
            </div>
          </div>
          
              <button
                type="button"
                onClick={() => setIsFullscreen(prev => !prev)}
                className="p-2 text-gray-400 hover:text-slate-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer hidden sm:block"
                title={isFullscreen ? "Свернуть" : "На весь экран"}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
              <button
            onClick={onClose}
            className="text-gray-400 hover:text-slate-500 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick action strip */}
        {contact && onOpenTaskModal && (
          <div className="px-6 py-2 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-semibold">
              Связан с компанией: {contact.companyName}
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTaskModal(contact.id);
              }}
              className="px-4 py-1 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Поставить задачу по контакту</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name & LPR Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                ФИО сотрудника <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Королев Виктор Михайлович"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:bg-white focus:border-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Статус ЛПР
              </label>
              <label className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                isDecisionMaker 
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' 
                  : 'bg-slate-50 border-gray-200 text-slate-500'
              }`}>
                <input
                  type="checkbox"
                  checked={isDecisionMaker}
                  onChange={(e) => setIsDecisionMaker(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300"
                />
                <span className="text-xs">⭐ ЛПР (Принимает решения)</span>
              </label>
            </div>
          </div>

          {/* Company & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Предприятие
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:border-emerald-500 outline-hidden"
              >
                <option value="">-- Выберите компанию --</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Должность
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Главный инженер проекта / Главный метролог"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Phones & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Рабочий телефон (доб.)
              </label>
              <input
                type="text"
                value={workPhone}
                onChange={(e) => setWorkPhone(e.target.value)}
                placeholder="+7 (846) 270-80-00 доб. 1420"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Мобильный телефон
              </label>
              <input
                type="text"
                value={mobilePhone}
                onChange={(e) => setMobilePhone(e.target.value)}
                placeholder="+7 (927) 208-44-11"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="v.korolev@odk-kuznetsov.ru"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 outline-hidden"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Заметки и особенности взаимодействия
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Сфера ответственности, темы переговоров, специфика отдела..."
              className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white outline-hidden resize-none"
            />
          </div>

          {/* Interaction History, Log */}
          {contact && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>История взаимодействий (Звонки, встречи, аудит)</span>
                </label>
                <span className="text-[11px] text-gray-500 font-semibold">
                  {contact.interactionHistory?.length || 0} записей
                </span>
              </div>

              {/* Log entries */}
              {contact.interactionHistory && contact.interactionHistory.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {contact.interactionHistory.map((item) => (
                    <div key={item.id} className="p-2.5 bg-white border border-gray-200 rounded-lg text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-gray-900 flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${
                            item.type === 'call' ? 'bg-blue-500' :
                            item.type === 'meeting' ? 'bg-emerald-500' :
                            item.type === 'demo' ? 'bg-purple-500' : 'bg-amber-500'
                          }`} />
                          <span>{item.type === 'call' ? 'Звонок' : item.type === 'meeting' ? 'Встреча' : item.type === 'demo' ? 'Демонстрация' : 'Аудит'}</span>
                        </span>
                        <span className="text-[10px] text-gray-400">{item.date} • {item.author}</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">{item.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Истории взаимодействий пока нет.</p>
              )}

              {/* Quick log input */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <select
                    value={interactionType}
                    onChange={(e) => setInteractionType(e.target.value)}
                    className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 outline-hidden"
                  >
                    <option value="call">📞 Звонок</option>
                    <option value="meeting">👥 Встреча</option>
                    <option value="demo">🔍 Демо</option>
                    <option value="audit">📐 Аудит</option>
                    <option value="email">✉️ Письмо</option>
                  </select>
                  <input
                    type="text"
                    value={interactionComment}
                    onChange={(e) => setInteractionComment(e.target.value)}
                    placeholder="Быстро зафиксировать результат звонка или договоренность..."
                    className="flex-1 px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddInteractionSubmit}
                    disabled={savingInteraction || !interactionComment.trim()}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Записать
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>{contact ? 'Сохранить контакт' : 'Создать контакт'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
