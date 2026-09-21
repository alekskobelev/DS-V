import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CheckSquare, 
  Calendar, 
  Plus, 
  Wrench, 
  Trash2, 
  Users, 
  AlertTriangle,
  FileText,
  Minimize2,
  Maximize2,
  Search
} from 'lucide-react';
import { CrmCompany, CompanyStatus, CompanyEquipmentItem, CrmContact, UserTask } from '../../types';
import { apiService } from '../../services/apiService';
import { parseRussianLeaderGreeting } from '../../utils/printProposal';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: Partial<CrmCompany>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  company?: CrmCompany | null;
  contacts?: CrmContact[];
  tasks?: UserTask[];
  onOpenTaskModal?: (task?: UserTask, initialCompanyId?: string) => void;
  onOpenEventModal?: (initialCompanyId?: string) => void;
}

const PREDEFINED_INDUSTRIES = [
  'Авиастроение',
  'Двигателестроение',
  'Ракетно-космическая отрасль',
  'Тяжелое машиностроение',
  'Автомобилестроение',
  'Приборостроение',
  'Нефтегазовое машиностроение',
  'Металлообработка',
  'Машиностроение'
];

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  company,
  contacts = [],
  tasks = [],
  onOpenTaskModal,
  onOpenEventModal,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [name, setName] = useState('');
  const [inn, setInn] = useState('');
  const [kpp, setKpp] = useState('');
  const [industrySelect, setIndustrySelect] = useState('Машиностроение');
  const [customIndustry, setCustomIndustry] = useState('');
  const [city, setCity] = useState('Самара');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<CompanyStatus>('active');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [ceoPost, setCeoPost] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedEquipment, setAssignedEquipment] = useState<CompanyEquipmentItem[]>([]);
  const [newEqName, setNewEqName] = useState('');
  const [newEqSerial, setNewEqSerial] = useState('');
  const [newEqType, setNewEqType] = useState('КИМ');
  const [newEqVerifDate, setNewEqVerifDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dadataQuery, setDadataQuery] = useState('');
  const [dadataResults, setDadataResults] = useState<any[]>([]);
  const [isSearchingDadata, setIsSearchingDadata] = useState(false);
  const [showDadataDropdown, setShowDadataDropdown] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDadataQuery('');
      setDadataResults([]);
      setShowDadataDropdown(false);
      return;
    }

    if (company) {
      setName(company.name || '');
      setInn(company.inn || '');
      setKpp(company.kpp || '');
      const ind = company.industry || 'Машиностроение';
      if (PREDEFINED_INDUSTRIES.includes(ind)) {
        setIndustrySelect(ind);
        setCustomIndustry('');
      } else {
        setIndustrySelect('other');
        setCustomIndustry(ind);
      }
      setCity(company.city || 'Самара');
      setAddress(company.address || '');
      setStatus(company.status || 'active');
      setPhone(company.phone || '');
      setEmail(company.email || '');
      setContactPerson(company.contactPerson || '');
      setCeoName(company.ceoName || '');
      setCeoPost(company.ceoPost || '');
      setNotes(company.notes || '');
      setAssignedEquipment(company.assignedEquipment || []);
    } else {
      setName('');
      setInn('');
      setKpp('');
      setIndustrySelect('Машиностроение');
      setCustomIndustry('');
      setCity('');
      setAddress('');
      setStatus('active');
      setPhone('');
      setEmail('');
      setContactPerson('');
      setCeoName('');
      setCeoPost('');
      setNotes('');
      setAssignedEquipment([]);
    }
    setError(null);
  }, [isOpen, company]);

  if (!isOpen) return null;

  const handleDadataSearch = async () => {
    if (!dadataQuery.trim()) return;
    setIsSearchingDadata(true);
    setError(null);
    try {
      const res = await apiService.searchCompanyByDadata(dadataQuery);
      if (res.success && res.data.length > 0) {
        setDadataResults(res.data);
        setShowDadataDropdown(true);
      } else {
        setError('По запросу ничего не найдено');
        setDadataResults([]);
        setShowDadataDropdown(false);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка поиска по ИНН');
    } finally {
      setIsSearchingDadata(false);
    }
  };

  const applyDadataResult = (suggestion: any) => {
    const data = suggestion.data;
    setName(suggestion.value || data.name?.short_with_opf || '');
    setInn(data.inn || '');
    setKpp(data.kpp || '');
    setAddress(data.address?.unrestricted_value || '');
    if (data.address?.data?.city) {
      setCity(data.address.data.city);
    }
    
    // Extract CEO / Leader info for ТКП and contacts
    if (data.management?.name) {
      setCeoName(data.management.name);
      if (data.management.post) {
        setCeoPost(data.management.post);
      }
      if (!contactPerson) {
        setContactPerson(data.management.name);
      }
      const ceoInfo = `${data.management.post || 'Руководитель'}: ${data.management.name}`;
      setNotes(prev => prev ? `${prev}\n${ceoInfo}` : ceoInfo);
    } else if (data.fio?.name) {
      const fullFio = [data.fio.surname, data.fio.name, data.fio.patronymic].filter(Boolean).join(' ');
      setCeoName(fullFio);
      setCeoPost('Индивидуальный предприниматель');
      if (!contactPerson) {
        setContactPerson(fullFio);
      }
    }
    
    setShowDadataDropdown(false);
    setDadataQuery('');
  };

  const handleAddEquipment = () => {
    if (!newEqName.trim()) return;
    setAssignedEquipment(prev => [
      ...prev,
      {
        name: newEqName.trim(),
        serial: newEqSerial.trim() || undefined,
        type: newEqType,
        verificationDate: newEqVerifDate || undefined,
      }
    ]);
    setNewEqName('');
    setNewEqSerial('');
    setNewEqVerifDate('');
  };

  const handleRemoveEquipment = (index: number) => {
    setAssignedEquipment(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !inn.trim()) {
      setError('Укажите название предприятия и ИНН');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        id: company?.id,
        name: name.trim(),
        inn: inn.trim(),
        kpp: kpp.trim(),
        industry: industrySelect === 'other' ? customIndustry.trim() : industrySelect,
        city: city.trim(),
        address: address.trim(),
        status,
        phone: phone.trim(),
        email: email.trim(),
        contactPerson: contactPerson.trim(),
        ceoName: ceoName.trim(),
        ceoPost: ceoPost.trim(),
        notes: notes.trim(),
        assignedEquipment,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения компании');
    } finally {
      setSaving(false);
    }
  };

  const companyContacts = company && Array.isArray(contacts) ? contacts.filter(c => c.companyId === company.id) : [];
  const companyTasks = company && Array.isArray(tasks) ? tasks.filter(t => t.companyId === company.id) : [];

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/60 sm: backdrop-blur-xs overflow-hidden ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'}`}>
      <div 
        id="company-modal"
        className={`${isFullscreen ? 'fixed inset-0 z-[201] w-screen h-screen max-w-none max-h-none rounded-none' : 'relative max-w-4xl w-full h-full max-h-[94vh] sm:max-h-[90vh] rounded-lg sm:rounded-lg'} bg-white shadow-sm border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {company ? company.name : 'Новое промышленное предприятие'}
              </h2>
              <p className="text-xs text-gray-500">
                Карточка контрагента, парк оборудования и прикрепленные контакты
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-2 text-gray-400 hover:text-slate-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title={isFullscreen ? "Свернуть в окно" : "На весь экран"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-slate-500 p-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick action strip if company exists */}
        {company && (
          <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between flex-wrap gap-2 text-xs shrink-0">
            <span className="font-semibold text-blue-900">
              Быстрые действия по контрагенту:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTaskModal?.(undefined, company.id);
                }}
                className="px-4 py-1 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Поставить задачу</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEventModal?.(company.id);
                }}
                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Событие в календарь</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Dadata Auto-fill Tool */}
          {!company && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg relative">
              <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                Автоматическое заполнение реквизитов (ИНН или Название)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={dadataQuery}
                  onChange={(e) => {
                    setDadataQuery(e.target.value);
                    if (showDadataDropdown) setShowDadataDropdown(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleDadataSearch())}
                  placeholder="Введите ИНН или название компании..."
                  className="flex-1 px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium text-gray-900 focus:border-blue-500 outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleDadataSearch}
                  disabled={isSearchingDadata || !dadataQuery.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Найти</span>
                </button>
              </div>
              
              {/* Dropdown with results */}
              {showDadataDropdown && dadataResults.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-gray-200 shadow-sm rounded-lg max-h-60 overflow-y-auto">
                  {dadataResults.map((suggestion, idx) => (
                    <div 
                      key={idx}
                      onClick={() => applyDadataResult(suggestion)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <div className="font-bold text-gray-900">{suggestion.value}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span>ИНН: {suggestion.data.inn}</span>
                        {suggestion.data.kpp && <span>КПП: {suggestion.data.kpp}</span>}
                        <span>{suggestion.data.address?.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Название предприятия <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ПАО «ОДК-Кузнецов»"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Статус контрагента
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CompanyStatus)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-blue-500 outline-hidden"
              >
                <option value="key_partner">⭐ Ключевой партнер</option>
                <option value="active">Активный клиент</option>
                <option value="in_progress">В работе (переговоры)</option>
                <option value="potential">Потенциальный</option>
                <option value="archive">Архив</option>
              </select>
            </div>
          </div>

          {/* INN, KPP, Industry, City */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                ИНН <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={inn}
                onChange={(e) => setInn(e.target.value)}
                placeholder="6312004455"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                КПП
              </label>
              <input
                type="text"
                value={kpp}
                onChange={(e) => setKpp(e.target.value)}
                placeholder="631201001"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Отрасль
              </label>
              {industrySelect === 'other' ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    placeholder="Укажите отрасль"
                    className="flex-1 px-4 py-2 bg-white border border-blue-300 rounded-lg text-xs font-medium text-gray-900 focus:border-blue-500 outline-hidden"
                    autoFocus
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      setIndustrySelect('Машиностроение');
                      setCustomIndustry('');
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-lg bg-gray-100 hover:bg-red-50 transition-colors"
                    title="Отменить"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <select
                  value={industrySelect}
                  onChange={(e) => setIndustrySelect(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:border-blue-500 outline-hidden"
                >
                  <option value="Машиностроение">Машиностроение</option>
                  <option value="Авиастроение">Авиастроение</option>
                  <option value="Двигателестроение">Двигателестроение</option>
                  <option value="Ракетно-космическая отрасль">Ракетно-космическая отрасль</option>
                  <option value="Тяжелое машиностроение">Тяжелое машиностроение</option>
                  <option value="Автомобилестроение">Автомобилестроение</option>
                  <option value="Приборостроение">Приборостроение</option>
                  <option value="Нефтегазовое машиностроение">Нефтегазовое машиностроение</option>
                  <option value="Металлообработка">Металлообработка</option>
                  <option value="other" className="font-bold text-blue-600">Другое...</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Город
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Самара"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* Address, Phone, Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Адрес производства
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="г. Самара, Заводское шоссе, д. 29"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Телефон
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (846) 270-80-00"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
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
                placeholder="info@odk-kuznetsov.ru"
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* Руководитель организации (для автоподстановки в ТКП и DaData) */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg">
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
              <label className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Руководитель организации (для генератора ТКП)</span>
              </label>
              {ceoName && (
                <span className="text-[11px] font-bold text-blue-800 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                  Обращение в ТКП: <strong className="text-blue-950">{parseRussianLeaderGreeting(ceoName, ceoPost).greeting}</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Должность руководителя
                </label>
                <input
                  type="text"
                  value={ceoPost}
                  onChange={(e) => setCeoPost(e.target.value)}
                  placeholder="Генеральный директор / Главный инженер"
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  ФИО руководителя
                </label>
                <input
                  type="text"
                  value={ceoName}
                  onChange={(e) => setCeoName(e.target.value)}
                  placeholder="Королев Виктор Михайлович"
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Assigned Equipment Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>Закрепленное оборудование и парк станков ({assignedEquipment.length})</span>
              </label>
            </div>

            {/* List of existing equipment */}
            {assignedEquipment.length > 0 ? (
              <div className="space-y-2 mb-3">
                {assignedEquipment.map((eq, idx) => (
                  <div key={idx} className="p-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">{eq.name}</div>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                        <span className="font-medium text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                          {eq.type || 'Оборудование'}
                        </span>
                        {eq.serial && <span>Сер. №: {eq.serial}</span>}
                        {eq.verificationDate && <span>Поверка до: {eq.verificationDate}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEquipment(idx)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic mb-3">Оборудование пока не добавлено.</p>
            )}

            {/* Add equipment inline */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
              <input
                type="text"
                value={newEqName}
                onChange={(e) => setNewEqName(e.target.value)}
                placeholder="Модель (например: КИМ Mitutoyo)"
                className="sm:col-span-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-hidden"
              />
              <select
                value={newEqType}
                onChange={(e) => setNewEqType(e.target.value)}
                className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-hidden"
              >
                <option value="КИМ">КИМ</option>
                <option value="3D-сканер">3D-сканер</option>
                <option value="Лазерный трекер">Лазерный трекер</option>
                <option value="Станок ЧПУ">Станок ЧПУ</option>
                <option value="ПО">ПО</option>
              </select>
              <button
                type="button"
                onClick={handleAddEquipment}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить</span>
              </button>
            </div>
          </div>

          {/* Attached Contacts & Active Tasks Overview (if existing company) */}
          {company && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Contacts preview */}
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Контакты ({companyContacts.length})</span>
                  </span>
                </div>
                <div className="space-y-1.5">
                  {companyContacts.slice(0, 3).map(c => (
                    <div key={c.id} className="text-xs bg-white p-2 rounded-lg border border-gray-100 flex items-center justify-between">
                      <span className="font-semibold text-gray-900 truncate">{c.fullName}</span>
                      {c.isDecisionMaker && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">ЛПР</span>
                      )}
                    </div>
                  ))}
                  {companyContacts.length === 0 && (
                    <p className="text-[11px] text-gray-400">Нет привязанных контактов</p>
                  )}
                </div>
              </div>

              {/* Tasks preview */}
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-2">
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Активные задачи ({companyTasks.length})</span>
                  </span>
                </div>
                <div className="space-y-1.5">
                  {companyTasks.slice(0, 3).map(t => (
                    <div key={t.id} className="text-xs bg-white p-2 rounded-lg border border-gray-100 flex items-center justify-between">
                      <span className="font-medium text-gray-800 truncate">{t.title}</span>
                      <span className="text-[10px] text-gray-500 shrink-0">{t.dueDate}</span>
                    </div>
                  ))}
                  {companyTasks.length === 0 && (
                    <p className="text-[11px] text-gray-400">Нет активных задач</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Примечания и специфика производства
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Особые требования к пропускному режиму, закрытые цеха, специфика деталей..."
              className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden resize-none"
            />
          </div>
          </div>

          {/* Footer Actions (Always visible, sticky at the bottom) */}
          <div className="px-6 py-3.5 border-t border-gray-100 bg-slate-50/80 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-slate-500 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>{company ? 'Сохранить изменения' : 'Создать предприятие'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
