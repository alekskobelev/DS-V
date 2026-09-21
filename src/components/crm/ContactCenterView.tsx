import React, { useState, useMemo, useRef } from 'react';
import { 
  Building2, 
  Users, 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Wrench, 
  CheckSquare, 
  Calendar, 
  Download, 
  Upload,
  Edit3, 
  Trash2, 
  FileText,
  Send,
  Sparkles,
  ExternalLink,
  LayoutGrid, List as ListIcon, Table, ArrowDownAZ, ArrowUpZA
} from 'lucide-react';
import { 
  CrmCompany, 
  CrmContact, 
  ClientSegmentList, 
  UserTask, 
  CompanyStatus 
} from '../../types';

interface ContactCenterViewProps {
  companies: CrmCompany[];
  contacts: CrmContact[];
  clientLists: ClientSegmentList[];
  tasks: UserTask[];
  onOpenCompanyModal: (company?: CrmCompany) => void;
  onDeleteCompany: (id: string) => Promise<void>;
  onOpenContactModal: (contact?: CrmContact, initialCompanyId?: string) => void;
  onDeleteContact: (id: string) => Promise<void>;
  onOpenTaskModal: (task?: UserTask, initialCompanyId?: string, initialContactId?: string) => void;
  onOpenEventModal: (initialCompanyId?: string, initialContactId?: string) => void;
  onSaveClientList: (list: Partial<ClientSegmentList>) => Promise<void>;
  onDeleteClientList: (id: string) => Promise<void>;
  onOpenBulkTaskModal: (list: ClientSegmentList) => void;
  onImportExcel?: (file: File) => void;
}

export const ContactCenterView: React.FC<ContactCenterViewProps> = ({
  companies,
  contacts,
  clientLists,
  tasks,
  onOpenCompanyModal,
  onDeleteCompany,
  onOpenContactModal,
  onDeleteContact,
  onOpenTaskModal,
  onOpenEventModal,
  onSaveClientList,
  onDeleteClientList,
  onOpenBulkTaskModal,
  onImportExcel,
}) => {
  const [activeTab, setActiveTab] = useState<'companies' | 'contacts' | 'segments'>('companies');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onImportExcel) {
        onImportExcel(e.target.files[0]);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Search & Filters for Companies
  const [companySearch, setCompanySearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [companyViewMode, setCompanyViewMode] = useState<'cards' | 'list' | 'table'>('table');
  const [companySort, setCompanySort] = useState<'default' | 'az' | 'za'>('default');

  // Search & Filters for Contacts
  const [contactSearch, setContactSearch] = useState('');
  const [lprOnly, setLprOnly] = useState(false);
  const [selectedContactCompany, setSelectedContactCompany] = useState('');
  const [contactViewMode, setContactViewMode] = useState<'cards' | 'list' | 'table'>('table');
  const [contactSort, setContactSort] = useState<'default' | 'az' | 'za'>('default');

  // Segment builder state
  const [segIndustries, setSegIndustries] = useState<string[]>([]);
  const [segEquipment, setSegEquipment] = useState<string[]>([]);
  const [segCities, setSegCities] = useState<string[]>([]);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [savingSegment, setSavingSegment] = useState(false);

  // Distinct industries & cities from existing data
  const industriesList = useMemo(() => {
    const set = new Set<string>();
    companies.forEach(c => { if (c.industry) set.add(c.industry); });
    return Array.from(set).sort();
  }, [companies]);

  const citiesList = useMemo(() => {
    const set = new Set<string>();
    companies.forEach(c => { if (c.city) set.add(c.city); });
    return Array.from(set).sort();
  }, [companies]);

  // Filtered Companies
  const filteredCompanies = useMemo(() => {
    let res = companies.filter(c => {
      if (companySearch.trim()) {
        const q = companySearch.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchInn = c.inn.includes(q);
        const matchCity = c.city?.toLowerCase().includes(q);
        if (!matchName && !matchInn && !matchCity) return false;
      }
      if (selectedIndustry && c.industry !== selectedIndustry) return false;
      if (selectedCity && c.city !== selectedCity) return false;
      if (selectedStatus && c.status !== selectedStatus) return false;
      return true;
    });
    
    if (companySort === 'az') {
      res.sort((a, b) => a.name.localeCompare(b.name));
    } else if (companySort === 'za') {
      res.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    return res;
  }, [companies, companySearch, selectedIndustry, selectedCity, selectedStatus, companySort]);

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    let res = contacts.filter(c => {
      if (contactSearch.trim()) {
        const q = contactSearch.toLowerCase();
        const matchName = c.fullName.toLowerCase().includes(q);
        const matchComp = c.companyName.toLowerCase().includes(q);
        const matchPos = c.position.toLowerCase().includes(q);
        const matchEmail = c.email?.toLowerCase().includes(q);
        if (!matchName && !matchComp && !matchPos && !matchEmail) return false;
      }
      if (lprOnly && !c.isDecisionMaker) return false;
      if (selectedContactCompany && c.companyId !== selectedContactCompany) return false;
      return true;
    });
    
    if (contactSort === 'az') {
      res.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (contactSort === 'za') {
      res.sort((a, b) => b.fullName.localeCompare(a.fullName));
    }
    
    return res;
  }, [contacts, contactSearch, lprOnly, selectedContactCompany, contactSort]);

  // Companies matching custom segment filters
  const segmentFilteredCompanies = useMemo(() => {
    return companies.filter(c => {
      if (segIndustries.length > 0 && !segIndustries.includes(c.industry)) return false;
      if (segCities.length > 0 && !segCities.includes(c.city)) return false;
      if (segEquipment.length > 0) {
        const hasEq = c.assignedEquipment?.some(eq => segEquipment.includes(eq.type || ''));
        if (!hasEq) return false;
      }
      return true;
    });
  }, [companies, segIndustries, segCities, segEquipment]);

  // Save new custom segment
  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setSavingSegment(true);
    try {
      await onSaveClientList({
        name: newListName.trim(),
        description: newListDesc.trim(),
        filters: {
          industries: segIndustries,
          cities: segCities,
          equipmentTypes: segEquipment,
        },
        companyIds: segmentFilteredCompanies.map(c => c.id),
      });
      setNewListName('');
      setNewListDesc('');
    } finally {
      setSavingSegment(false);
    }
  };

  // Export any company list to Excel (.xlsx)
  const exportToExcel = async (targetList: CrmCompany[], fileName: string) => {
    const data = targetList.map((c, i) => {
      const compContacts = contacts.filter(ct => ct.companyId === c.id);
      const lpr = compContacts.find(ct => ct.isDecisionMaker);
      const equipmentStr = c.assignedEquipment?.map(e => `${e.name} (${e.type || ''})`).join('; ') || 'Не указано';

      return {
        '№': i + 1,
        'Предприятие': c.name,
        'ИНН': c.inn,
        'КПП': c.kpp || '',
        'Отрасль': c.industry,
        'Город': c.city,
        'Адрес': c.address || '',
        'Статус': c.status === 'key_partner' ? 'Ключевой партнер' : c.status === 'active' ? 'Активный' : c.status === 'in_progress' ? 'В работе' : 'Потенциальный',
        'Телефон': c.phone,
        'Email': c.email,
        'ЛПР': lpr ? `${lpr.fullName} (${lpr.position}, ${lpr.mobilePhone || lpr.workPhone})` : 'Не назначен',
        'Контакты': compContacts.map(ct => `${ct.fullName} - ${ct.position}`).join('; '),
        'Парк оборудования': equipmentStr,
      };
    });

    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Контрагенты');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportContactsToExcel = async (targetList: CrmContact[], fileName: string) => {
    const data = targetList.map((c, i) => {
      const comp = companies.find(comp => comp.id === c.companyId);
      return {
        '№': i + 1,
        'ФИО': c.fullName,
        'Должность': c.position,
        'Предприятие': comp ? comp.name : 'Не привязано',
        'Email': c.email,
        'Раб. Телефон': c.workPhone || '',
        'Моб. Телефон': c.mobilePhone || '',
        'ЛПР': c.isDecisionMaker ? 'Да' : 'Нет',
        'Примечание': c.notes || ''
      };
    });

    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Контактные лица');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const getStatusBadge = (status: CompanyStatus) => {
    switch (status) {
      case 'key_partner':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">⭐ Ключевой партнер</span>;
      case 'active':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Активный</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">В работе</span>;
      case 'potential':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">Потенциальный</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-slate-500">Архив</span>;
    }
  };

  return (
    <div id="crm-contact-center-container" className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Контакт-центр клиентов и база промышленных предприятий
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Реестр контрагентов «ДС‑Инжиниринг», ЛПР, парк КИМ и станков с ЧПУ, сегментация и рассылки
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenCompanyModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Новое предприятие</span>
            </button>

            <button
              onClick={() => onOpenContactModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Новый контакт</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex items-center gap-2 border-b border-gray-200 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'companies'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>База предприятий ({companies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Контактные лица / ЛПР ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('segments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'segments'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Списки (Сегментация и рассылки) ({clientLists.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. TAB: COMPANIES (База предприятий) */}
      {/* ======================================================== */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          {/* Filters strip */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full">
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder="Поиск по названию предприятия, ИНН или городу..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:border-emerald-500 outline-hidden"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-800 outline-hidden"
              >
                <option value="">Все отрасли</option>
                {industriesList.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-800 outline-hidden"
              >
                <option value="">Все города</option>
                {citiesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-800 outline-hidden"
              >
                <option value="">Все статусы</option>
                <option value="key_partner">Ключевой партнер</option>
                <option value="active">Активный</option>
                <option value="in_progress">В работе</option>
                <option value="potential">Потенциальный</option>
              </select>
              
              <div className="flex items-center bg-slate-50 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setCompanySort(companySort === 'az' ? 'za' : 'az')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${companySort !== 'default' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-slate-500'}`}
                  title="Сортировка по алфавиту"
                >
                  {companySort === 'za' ? <ArrowUpZA className="w-3.5 h-3.5" /> : <ArrowDownAZ className="w-3.5 h-3.5" />}
                </button>
                {companySort !== 'default' && (
                  <button 
                    onClick={() => setCompanySort('default')}
                    className="px-1 text-[10px] font-bold text-gray-400 hover:text-red-500 cursor-pointer"
                  >×</button>
                )}
              </div>

              <div className="flex items-center bg-slate-50 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setCompanyViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${companyViewMode === 'cards' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-slate-500'}`}
                  title="Карточки"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCompanyViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${companyViewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-slate-500'}`}
                  title="Список"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCompanyViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${companyViewMode === 'table' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-slate-500'}`}
                  title="Таблица"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileChange} 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-gray-50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Импорт базы предприятий из Excel"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Импорт</span>
              </button>

              <button
                onClick={() => exportToExcel(filteredCompanies, 'Предприятия_ДС_Инжиниринг')}
                className="px-4 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-gray-50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Экспорт списка предприятий в Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* Companies Cards Grid */}
          
          {filteredCompanies.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-lg border border-gray-200 text-gray-400">
              Предприятий по выбранным параметрам не найдено.
            </div>
          ) : (
            <>
              {companyViewMode === 'cards' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {filteredCompanies.map(comp => {
                const compContacts = contacts.filter(c => c.companyId === comp.id);
                const lpr = compContacts.find(c => c.isDecisionMaker);

                return (
                  <div
                    key={comp.id}
                    className="bg-white rounded-lg border border-gray-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 
                            onClick={() => onOpenCompanyModal(comp)}
                            className="text-sm font-bold text-gray-900 hover:text-emerald-600 cursor-pointer truncate"
                            title={comp.name}
                          >
                            {comp.name}
                          </h3>
                          <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                            ИНН: {comp.inn} • КПП: {comp.kpp || '—'}
                          </div>
                        </div>
                        {getStatusBadge(comp.status)}
                      </div>

                      {/* Industry & Location */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 flex-wrap">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium text-[11px]">
                          {comp.industry}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {comp.city}
                        </span>
                      </div>

                      {/* LPR / Contacts info */}
                      {lpr ? (
                        <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg mb-3 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <Star className="w-3.5 h-3.5 fill-current text-amber-600" />
                            <span className="truncate">ЛПР: {lpr.fullName}</span>
                          </div>
                          <div className="text-[11px] text-amber-800 mt-0.5 truncate">
                            {lpr.position} • {lpr.mobilePhone || lpr.workPhone || lpr.email}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-slate-50 border border-gray-100 rounded-lg mb-3 text-[11px] text-gray-500 flex items-center justify-between">
                          <span>Контактов в базе: {compContacts.length}</span>
                          <button
                            onClick={() => onOpenContactModal(undefined, comp.id)}
                            className="text-blue-600 font-bold hover:underline"
                          >
                            + Добавить ЛПР
                          </button>
                        </div>
                      )}

                      {/* Equipment List */}
                      <div className="mb-4">
                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-blue-500" />
                          <span>Закрепленное оборудование ({comp.assignedEquipment?.length || 0}):</span>
                        </div>
                        <div className="space-y-1">
                          {comp.assignedEquipment?.slice(0, 2).map((eq, i) => (
                            <div key={i} className="text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg flex items-center justify-between">
                              <span className="font-semibold text-gray-800 truncate">{eq.name}</span>
                              <span className="text-[10px] text-blue-600 font-bold ml-1 shrink-0">{eq.type}</span>
                            </div>
                          ))}
                          {(comp.assignedEquipment?.length || 0) > 2 && (
                            <div 
                              onClick={() => onOpenCompanyModal(comp)}
                              className="text-[10px] text-blue-600 font-bold cursor-pointer hover:underline"
                            >
                              + еще {(comp.assignedEquipment?.length || 0) - 2} ед. оборудования
                            </div>
                          )}
                          {(!comp.assignedEquipment || comp.assignedEquipment.length === 0) && (
                            <div className="text-[11px] text-gray-400 italic">Оборудование не внесено</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 1-Click Action Buttons */}
                    <div className="pt-3 mt-auto border-t border-gray-100 grid grid-cols-4 gap-2">
                        <button
                          onClick={() => onOpenTaskModal(undefined, comp.id)}
                          className="flex flex-col items-center justify-center py-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                          title="Поставить задачу"
                        >
                          <CheckSquare className="w-4 h-4 mb-1" />
                          <span className="text-[10px] font-bold">Задача</span>
                        </button>
                        <button
                          onClick={() => onOpenEventModal(comp.id)}
                          className="flex flex-col items-center justify-center py-2 rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                          title="Назначить событие"
                        >
                          <Calendar className="w-4 h-4 mb-1" />
                          <span className="text-[10px] font-bold">Событие</span>
                        </button>
                        <button
                          onClick={() => onOpenCompanyModal(comp)}
                          className="flex flex-col items-center justify-center py-2 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                          title="Изменить"
                        >
                          <Edit3 className="w-4 h-4 mb-1" />
                          <span className="text-[10px] font-bold">Изменить</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Удалить предприятие «${comp.name}»?`)) {
                              onDeleteCompany(comp.id);
                            }
                          }}
                          className="flex flex-col items-center justify-center py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 mb-1" />
                          <span className="text-[10px] font-bold">Удалить</span>
                        </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {companyViewMode === 'list' && (
            <div className="flex flex-col gap-3">
              {filteredCompanies.map(comp => {
                const compContacts = contacts.filter(c => c.companyId === comp.id);
                const lpr = compContacts.find(c => c.isDecisionMaker);
                
                return (
                  <div key={comp.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 onClick={() => onOpenCompanyModal(comp)} className="text-sm font-bold text-gray-900 hover:text-emerald-600 cursor-pointer truncate">
                            {comp.name}
                          </h3>
                          {getStatusBadge(comp.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span className="font-mono text-[10px]">ИНН: {comp.inn}</span>
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-slate-500">{comp.industry}</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3"/> {comp.city}</span>
                        </div>
                      </div>
                      
                      {lpr && (
                        <div className="hidden md:block flex-1 min-w-0 text-xs p-2 bg-amber-50/50 border border-amber-100 rounded-lg">
                          <div className="font-bold text-amber-900 flex items-center gap-1"><Star className="w-3 h-3 fill-current text-amber-500" /> {lpr.fullName}</div>
                          <div className="text-[10px] text-amber-800 mt-0.5 truncate">{lpr.position}</div>
                        </div>
                      )}
                        <div className="hidden md:block flex-1 min-w-0 text-xs text-gray-500">
                           <div className="font-medium text-slate-500 flex items-center gap-1"><Wrench className="w-3 h-3 text-blue-500" /> Оборудование ({comp.assignedEquipment?.length || 0})</div>
                           <div className="text-[10px] mt-0.5 truncate">{comp.assignedEquipment?.map(e => e.name).join(', ') || '—'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => onOpenTaskModal(undefined, comp.id)} className="p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100" title="Задача"><CheckSquare className="w-4 h-4" /></button>
                        <button onClick={() => onOpenEventModal(comp.id)} className="p-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100" title="В календарь"><Calendar className="w-4 h-4" /></button>
                        <button onClick={() => onOpenCompanyModal(comp)} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm(`Удалить предприятие «${comp.name}»?`)) onDeleteCompany(comp.id); }} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {companyViewMode === 'table' && (
              <div className="overflow-x-auto no-scrollbar bg-white rounded-lg border border-gray-200">
                <table className="w-full data-dense-table text-left text-xs">
                  <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Название</th>
                      <th className="px-4 py-3">ИНН/КПП</th>
                      <th className="px-4 py-3">Отрасль / Город</th>
                      <th className="px-4 py-3">Статус</th>
                      <th className="px-4 py-3">ЛПР</th>
                      <th className="px-4 py-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCompanies.map(comp => {
                      const compContacts = contacts.filter(c => c.companyId === comp.id);
                      const lpr = compContacts.find(c => c.isDecisionMaker);
                      return (
                        <tr key={comp.id} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="px-4 py-3 font-bold text-gray-900 cursor-pointer hover:text-emerald-600" onClick={() => onOpenCompanyModal(comp)}>{comp.name}</td>
                          <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{comp.inn} / {comp.kpp || '—'}</td>
                          <td className="px-4 py-3 text-slate-500"><span className="block">{comp.industry}</span><span className="text-[10px] text-gray-400">{comp.city}</span></td>
                          <td className="px-4 py-3">{getStatusBadge(comp.status)}</td>
                          <td className="px-4 py-3 text-slate-500">{lpr ? <div className="flex items-center gap-1 text-amber-700 font-medium"><Star className="w-3 h-3 fill-current"/> {lpr.fullName}</div> : <span className="text-gray-400">—</span>}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => onOpenTaskModal(undefined, comp.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Задача"><CheckSquare className="w-3.5 h-3.5" /></button>
                              <button onClick={() => onOpenEventModal(comp.id)} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="В календарь"><Calendar className="w-3.5 h-3.5" /></button>
                              <button onClick={() => onOpenCompanyModal(comp)} className="p-1 text-gray-400 hover:text-emerald-600 rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            </>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. TAB: CONTACTS (Контактные лица / ЛПР) */}
      {/* ======================================================== */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          {/* Filter strip */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full">
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Поиск по ФИО сотрудника, предприятию, должности или email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* LPR Toggle Filter */}
              <button
                onClick={() => setLprOnly(!lprOnly)}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  lprOnly
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-500 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${lprOnly ? 'fill-current' : ''}`} />
                <span>Только ЛПР (Лица, принимающие решения)</span>
              </button>

              <select
                value={selectedContactCompany}
                onChange={(e) => setSelectedContactCompany(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-800 outline-hidden"
              >
                <option value="">Все предприятия</option>
                {companies.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>

              <div className="flex items-center bg-slate-50 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setContactSort(contactSort === 'az' ? 'za' : 'az')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${contactSort !== 'default' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-slate-500'}`}
                  title="Сортировка по алфавиту"
                >
                  {contactSort === 'za' ? <ArrowUpZA className="w-3.5 h-3.5" /> : <ArrowDownAZ className="w-3.5 h-3.5" />}
                </button>
                {contactSort !== 'default' && (
                  <button 
                    onClick={() => setContactSort('default')}
                    className="px-1 text-[10px] font-bold text-gray-400 hover:text-red-500 cursor-pointer"
                  >×</button>
                )}
              </div>

              <div className="flex items-center bg-slate-50 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setContactViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${contactViewMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-slate-500'}`}
                  title="Карточки"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setContactViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${contactViewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-slate-500'}`}
                  title="Список"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setContactViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${contactViewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-slate-500'}`}
                  title="Таблица"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-gray-50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Импорт контактов из Excel"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Импорт</span>
              </button>

              <button
                onClick={() => exportContactsToExcel(filteredContacts, 'Контакты_ДС_Инжиниринг')}
                className="px-4 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-gray-50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Экспорт списка контактов в Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* Contacts Grid */}
          
          {filteredContacts.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-lg border border-gray-200 text-gray-400">
              Контактных лиц не найдено.
            </div>
          ) : (
            <>
              {contactViewMode === 'cards' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {filteredContacts.map(cont => {
                const historyCount = cont.interactionHistory?.length || 0;

                return (
                  <div
                    key={cont.id}
                    className={`bg-white rounded-lg border p-5 transition-all hover:shadow-md flex flex-col justify-between ${
                      cont.isDecisionMaker ? 'border-amber-200 bg-amber-50/10' : 'border-gray-200'
                    }`}
                  >
                    <div>
                      {/* Name & LPR Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 
                            onClick={() => onOpenContactModal(cont)}
                            className="text-sm font-bold text-gray-900 hover:text-blue-600 cursor-pointer truncate"
                          >
                            {cont.fullName}
                          </h3>
                          <div className="text-xs font-semibold text-slate-500 mt-0.5">
                            {cont.position}
                          </div>
                          {cont.department && (
                            <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                              {cont.department}
                            </div>
                          )}
                        </div>

                        {cont.isDecisionMaker && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1 shrink-0">
                            <Star className="w-3 h-3 fill-current text-amber-500" />
                            ЛПР
                          </span>
                        )}
                      </div>

                      {/* Company badge */}
                      <div className="mt-2 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{cont.companyName}</span>
                      </div>

                      {/* Communications */}
                      <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                        {cont.mobilePhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <a href={`tel:${cont.mobilePhone}`} className="hover:underline text-gray-800 font-medium">
                              {cont.mobilePhone} (моб.)
                            </a>
                          </div>
                        )}
                        {cont.workPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-slate-500">{cont.workPhone}</span>
                          </div>
                        )}
                        {cont.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <a href={`mailto:${cont.email}`} className="hover:underline text-blue-600 truncate">
                              {cont.email}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Interaction history summary */}
                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                        <span>Зафиксировано взаимодействий:</span>
                        <span className="font-bold text-slate-500">{historyCount}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => onOpenTaskModal(undefined, cont.companyId, cont.id)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Поставить задачу по контакту"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Поставить задачу</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenContactModal(cont)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                          title="Редактировать контакт"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Удалить контакт «${cont.fullName}»?`)) {
                              onDeleteContact(cont.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                          title="Удалить контакт"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
            
            {contactViewMode === 'list' && (
              <div className="flex flex-col gap-3">
                {filteredContacts.map(cont => {
                  return (
                    <div key={cont.id} className={`bg-white rounded-lg border p-4 transition-all hover:shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${cont.isDecisionMaker ? 'border-amber-200 bg-amber-50/20' : 'border-gray-200 hover:border-blue-300'}`}>
                      <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 onClick={() => onOpenContactModal(cont)} className="text-sm font-bold text-gray-900 hover:text-blue-600 cursor-pointer truncate">
                              {cont.fullName}
                            </h3>
                            {cont.isDecisionMaker && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-0.5 shrink-0">
                                <Star className="w-3 h-3 fill-current text-amber-500" /> ЛПР
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-slate-500">{cont.position}</div>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-blue-800 font-medium bg-blue-50/50 w-fit px-2 py-0.5 rounded-md border border-blue-100">
                            <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="truncate">{cont.companyName}</span>
                          </div>
                        </div>
                        
                        <div className="hidden md:block flex-1 min-w-0 text-xs text-slate-500 space-y-1">
                           {cont.mobilePhone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-500 shrink-0"/> {cont.mobilePhone} (моб.)</div>}
                           {cont.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-blue-500 shrink-0"/> {cont.email}</div>}
                        </div>
                        
                        <div className="hidden md:block flex-1 min-w-0 text-xs text-gray-500 text-center">
                           Взаимодействий: <span className="font-bold text-slate-500">{cont.interactionHistory?.length || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => onOpenTaskModal(undefined, cont.companyId, cont.id)} className="p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100" title="Задача"><CheckSquare className="w-4 h-4" /></button>
                        <button onClick={() => onOpenContactModal(cont)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm(`Удалить контакт «${cont.fullName}»?`)) onDeleteContact(cont.id); }} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {contactViewMode === 'table' && (
              <div className="overflow-x-auto no-scrollbar bg-white rounded-lg border border-gray-200">
                <table className="w-full data-dense-table text-left text-xs">
                  <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">ФИО / Роль</th>
                      <th className="px-4 py-3">Предприятие</th>
                      <th className="px-4 py-3">Должность</th>
                      <th className="px-4 py-3">Контакты</th>
                      <th className="px-4 py-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredContacts.map(cont => {
                      return (
                        <tr key={cont.id} className={`hover:bg-blue-50/30 transition-colors ${cont.isDecisionMaker ? 'bg-amber-50/10' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => onOpenContactModal(cont)}>{cont.fullName}</span>
                              {cont.isDecisionMaker && <span title="ЛПР"><Star className="w-3 h-3 text-amber-500 fill-current" /></span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-blue-800">{cont.companyName}</td>
                          <td className="px-4 py-3 text-slate-500">{cont.position}</td>
                          <td className="px-4 py-3 text-slate-500 space-y-0.5 text-[11px]">
                            {cont.mobilePhone && <div className="flex items-center gap-1"><Phone className="w-2.5 h-2.5 text-emerald-500" /> {cont.mobilePhone}</div>}
                            {cont.email && <div className="flex items-center gap-1"><Mail className="w-2.5 h-2.5 text-blue-500" /> {cont.email}</div>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => onOpenTaskModal(undefined, cont.companyId, cont.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Задача"><CheckSquare className="w-3.5 h-3.5" /></button>
                              <button onClick={() => onOpenContactModal(cont)} className="p-1 text-gray-400 hover:text-blue-600 rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            </>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB: SEGMENTS (Списки и сегментация клиентов) */}
      {/* ======================================================== */}
      {activeTab === 'segments' && (
        <div className="space-y-6">
          {/* Segment Builder Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Конструктор сегментов и целевых выборок</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Выбирайте параметры для формирования целевой аудитории предприятий (отрасли, города, парк оборудования)
                </p>
              </div>

              {/* Real-time Match Counter */}
              <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <div className="text-xs font-bold text-purple-900">Найдено предприятий:</div>
                <div className="text-xl font-extrabold text-purple-700">{segmentFilteredCompanies.length}</div>
              </div>
            </div>

            {/* Filter Multi-pickers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              {/* Industries */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Отрасли предприятий:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {industriesList.map(ind => {
                    const checked = segIndustries.includes(ind);
                    return (
                      <label key={ind} className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSegIndustries(prev => 
                              checked ? prev.filter(x => x !== ind) : [...prev, ind]
                            );
                          }}
                          className="w-3.5 h-3.5 rounded text-purple-600"
                        />
                        <span className="truncate">{ind}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Equipment type */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Наличие оборудования:
                </label>
                <div className="space-y-1.5">
                  {['КИМ', '3D-сканер', 'Лазерный трекер', 'Станок ЧПУ', 'ПО'].map(eqType => {
                    const checked = segEquipment.includes(eqType);
                    return (
                      <label key={eqType} className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSegEquipment(prev => 
                              checked ? prev.filter(x => x !== eqType) : [...prev, eqType]
                            );
                          }}
                          className="w-3.5 h-3.5 rounded text-purple-600"
                        />
                        <span>{eqType}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Cities */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Города расположения:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {citiesList.map(city => {
                    const checked = segCities.includes(city);
                    return (
                      <label key={city} className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSegCities(prev => 
                              checked ? prev.filter(x => x !== city) : [...prev, city]
                            );
                          }}
                          className="w-3.5 h-3.5 rounded text-purple-600"
                        />
                        <span>{city}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Save Segment Form */}
            <form onSubmit={handleCreateSegment} className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                required
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Название нового списка (например: Заводы Самары с парком КИМ)..."
                className="flex-1 w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white outline-hidden"
              />
              <button
                type="submit"
                disabled={savingSegment || !newListName.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Сохранить в реестр сегментов</span>
              </button>
            </form>
          </div>

          {/* Saved Segment Lists */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Сохраненные сегменты и списки предприятий ({clientLists.length})
            </h3>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {clientLists.map(list => {
                const targetComps = companies.filter(c => list.companyIds.includes(c.id));

                return (
                  <div 
                    key={list.id} 
                    className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2">
                          {list.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 shrink-0">
                          {targetComps.length} компаний
                        </span>
                      </div>

                      {list.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {list.description}
                        </p>
                      )}

                      {/* Mini preview of companies */}
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg mb-3 space-y-1">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Предприятия в сегменте:</div>
                        <div className="text-xs text-gray-800 space-y-0.5">
                          {targetComps.slice(0, 3).map(c => (
                            <div key={c.id} className="truncate">• {c.name} ({c.city})</div>
                          ))}
                          {targetComps.length > 3 && (
                            <div className="text-[10px] text-gray-400 italic">+ еще {targetComps.length - 3} предприятий</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mass Actions */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Mass task button */}
                        <button
                          onClick={() => onOpenBulkTaskModal(list)}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Назначить всем предприятиям типовую задачу"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Назначить задачу</span>
                        </button>

                        {/* Excel Export */}
                        <button
                          onClick={() => exportToExcel(targetComps, `Сегмент_${list.name}`)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Выгрузить список компаний в Excel (.xlsx)"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>В Excel (.xlsx)</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => {
                            if (confirm(`Удалить список «${list.name}»?`)) {
                              onDeleteClientList(list.id);
                            }
                          }}
                          className="text-gray-400 hover:text-red-600 text-xs p-1 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Удалить список</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
