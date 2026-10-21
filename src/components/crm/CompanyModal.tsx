import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Search,
  Check,
  Edit3,
  Layers,
  Monitor,
  Scan,
  Crosshair,
  Compass,
  Cpu,
  ShieldCheck,
  Clock,
  Sparkles,
  UserPlus,
  UserCheck,
  ExternalLink,
  Info
} from 'lucide-react';
import { CrmCompany, CompanyStatus, CompanyEquipmentItem, CrmContact, UserTask } from '../../types';
import { apiService } from '../../services/apiService';
import { parseRussianLeaderGreeting } from '../../utils/printProposal';
import { useFormAutoSave } from '../../hooks/useFormAutoSave';
import { AutoSaveDraftBanner } from '../common/AutoSaveDraftBanner';
import { useModalStack } from '../../hooks/useModalStack';
import { 
  EQUIPMENT_PRESETS, 
  EQUIPMENT_CATEGORIES, 
  searchEquipmentPresets, 
  EquipmentPresetItem 
} from '../../data/equipmentPresets';

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
  onAddContactForCompany?: (newContact: Partial<CrmContact>) => Promise<void>;
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
  onAddContactForCompany,
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

  // --- ASSIGNED EQUIPMENT & PRESET CATALOG STATE ---
  const [assignedEquipment, setAssignedEquipment] = useState<CompanyEquipmentItem[]>([]);
  const [eqListSearch, setEqListSearch] = useState('');
  const [eqListCategoryFilter, setEqListCategoryFilter] = useState<'all' | 'software' | 'scanners' | 'cmm' | 'trackers' | 'cnc' | 'other'>('all');
  
  // Preset catalog picker modal state
  const [isPresetPickerOpen, setIsPresetPickerOpen] = useState(false);
  const [presetSearchQuery, setPresetSearchQuery] = useState('');
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<'all' | 'software' | 'scanners' | 'cmm' | 'trackers' | 'cnc' | 'other'>('all');

  // Inline add/edit equipment form state
  const [isEqFormOpen, setIsEqFormOpen] = useState(false);
  const [editingEqIndex, setEditingEqIndex] = useState<number | null>(null);
  const [formEqName, setFormEqName] = useState('');
  const [formEqBrand, setFormEqBrand] = useState('');
  const [formEqType, setFormEqType] = useState<string>('3D-сканер');
  const [formEqCategory, setFormEqCategory] = useState<string>('scanners');
  const [formEqSerial, setFormEqSerial] = useState('');
  const [formEqVerifDate, setFormEqVerifDate] = useState('');
  const [formEqWarranty, setFormEqWarranty] = useState('');
  const [formEqLocation, setFormEqLocation] = useState('');
  const [formEqNotes, setFormEqNotes] = useState('');

  // --- INLINE CONTACT CREATION STATE ---
  const [isAddingContactInline, setIsAddingContactInline] = useState(false);
  const [newContactFullName, setNewContactFullName] = useState('');
  const [newContactPosition, setNewContactPosition] = useState('');
  const [newContactDepartment, setNewContactDepartment] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactIsDecisionMaker, setNewContactIsDecisionMaker] = useState(false);
  const [isSavingInlineContact, setIsSavingInlineContact] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { containerRef, zIndex } = useModalStack({
    id: `crm-company-${company?.id || 'new'}`,
    isOpen,
    onClose,
    baseZIndex: 500,
  });

  const [dadataQuery, setDadataQuery] = useState('');
  const [dadataResults, setDadataResults] = useState<any[]>([]);
  const [isSearchingDadata, setIsSearchingDadata] = useState(false);
  const [showDadataDropdown, setShowDadataDropdown] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDadataQuery('');
      setDadataResults([]);
      setShowDadataDropdown(false);
      setIsPresetPickerOpen(false);
      setIsEqFormOpen(false);
      setEditingEqIndex(null);
      setIsAddingContactInline(false);
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
      setCity('Самара');
      setAddress('');
      setStatus('active');
      setPhone('');
      setEmail('');
      setContactPerson('');
      setCeoName('');
      setCeoPost('Генеральный директор');
      setNotes('');
      setAssignedEquipment([]);
    }
    setError(null);
  }, [isOpen, company]);

  const companyFormData = useMemo(() => ({
    name, inn, kpp, industrySelect, customIndustry, city, address, phone, email, contactPerson, ceoName, ceoPost, notes
  }), [name, inn, kpp, industrySelect, customIndustry, city, address, phone, email, contactPerson, ceoName, ceoPost, notes]);

  const autoSave = useFormAutoSave({
    formKey: `company_modal_${company?.id || 'new'}`,
    formData: companyFormData,
    enabled: isOpen,
    onRestore: (saved) => {
      if (saved.name) setName(saved.name);
      if (saved.inn) setInn(saved.inn);
      if (saved.kpp) setKpp(saved.kpp);
      if (saved.industrySelect) setIndustrySelect(saved.industrySelect);
      if (saved.customIndustry) setCustomIndustry(saved.customIndustry);
      if (saved.city) setCity(saved.city);
      if (saved.address) setAddress(saved.address);
      if (saved.phone) setPhone(saved.phone);
      if (saved.email) setEmail(saved.email);
      if (saved.contactPerson) setContactPerson(saved.contactPerson);
      if (saved.ceoName) setCeoName(saved.ceoName);
      if (saved.ceoPost) setCeoPost(saved.ceoPost);
      if (saved.notes) setNotes(saved.notes);
    }
  });

  // Filtered contacts of this company
  const companyContacts = useMemo(() => {
    if (!company && !name) return [];
    return contacts.filter(c => 
      (company?.id && c.companyId === company.id) ||
      (name && c.companyName && c.companyName.toLowerCase() === name.toLowerCase())
    );
  }, [contacts, company, name]);

  // Filtered tasks of this company
  const companyTasks = useMemo(() => {
    if (!company) return [];
    return tasks.filter(t => t.companyId === company.id && (t.status as string) !== 'completed');
  }, [tasks, company]);

  // Filtered presets in picker catalog
  const filteredPresets = useMemo(() => {
    return searchEquipmentPresets(presetSearchQuery, presetCategoryFilter);
  }, [presetSearchQuery, presetCategoryFilter]);

  // Filtered assigned equipment in the company card
  const filteredAssignedEquipment = useMemo(() => {
    let list = assignedEquipment;
    if (eqListCategoryFilter !== 'all') {
      list = list.filter(item => {
        if (item.category) return item.category === eqListCategoryFilter;
        // fallback match by type
        const t = (item.type || '').toLowerCase();
        if (eqListCategoryFilter === 'software') return t.includes('по') || t.includes('программ');
        if (eqListCategoryFilter === 'scanners') return t.includes('сканер');
        if (eqListCategoryFilter === 'cmm') return t.includes('ким');
        if (eqListCategoryFilter === 'trackers') return t.includes('трекер') || t.includes('рук');
        if (eqListCategoryFilter === 'cnc') return t.includes('чпу') || t.includes('станок');
        return true;
      });
    }
    if (eqListSearch.trim()) {
      const q = eqListSearch.toLowerCase().trim();
      list = list.filter(item => 
        item.name.toLowerCase().includes(q) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.serial && item.serial.toLowerCase().includes(q)) ||
        (item.type && item.type.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    }
    return list;
  }, [assignedEquipment, eqListCategoryFilter, eqListSearch]);

  if (!isOpen) return null;

  // --- DADATA HANDLERS ---
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
        setError(res.error || 'По запросу ничего не найдено в ЕГРЮЛ через DaData');
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
    const compName = suggestion.value || data.name?.short_with_opf || data.name?.full_with_opf || '';
    setName(compName);
    setInn(data.inn || '');
    setKpp(data.kpp || '');
    setAddress(data.address?.unrestricted_value || data.address?.value || '');
    if (data.address?.data?.city) {
      setCity(data.address.data.city);
    }
    
    // Extract CEO / Leader info
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

  // --- EQUIPMENT MANAGEMENT HANDLERS ---
  const resetEquipmentForm = () => {
    setFormEqName('');
    setFormEqBrand('');
    setFormEqType('3D-сканер');
    setFormEqCategory('scanners');
    setFormEqSerial('');
    setFormEqVerifDate('');
    setFormEqWarranty('');
    setFormEqLocation('');
    setFormEqNotes('');
    setEditingEqIndex(null);
    setIsEqFormOpen(false);
  };

  const handleOpenAddEquipmentForm = () => {
    resetEquipmentForm();
    setIsEqFormOpen(true);
  };

  const handleStartEditEquipment = (index: number) => {
    const eq = assignedEquipment[index];
    if (!eq) return;
    setEditingEqIndex(index);
    setFormEqName(eq.name || '');
    setFormEqBrand(eq.brand || '');
    setFormEqType(eq.type || '3D-сканер');
    setFormEqCategory(eq.category || 'scanners');
    setFormEqSerial(eq.serial || '');
    setFormEqVerifDate(eq.verificationDate || '');
    setFormEqWarranty(eq.warrantyUntil || '');
    setFormEqLocation(eq.location || '');
    setFormEqNotes(eq.notes || '');
    setIsEqFormOpen(true);
  };

  const handleSaveEquipmentForm = () => {
    if (!formEqName.trim()) {
      alert('Укажите наименование или модель оборудования');
      return;
    }

    const itemData: CompanyEquipmentItem = {
      id: editingEqIndex !== null && assignedEquipment[editingEqIndex]?.id 
        ? assignedEquipment[editingEqIndex].id 
        : `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: formEqName.trim(),
      brand: formEqBrand.trim() || undefined,
      type: formEqType || '3D-сканер',
      category: formEqCategory || 'scanners',
      serial: formEqSerial.trim() || undefined,
      verificationDate: formEqVerifDate || undefined,
      warrantyUntil: formEqWarranty || undefined,
      location: formEqLocation.trim() || undefined,
      notes: formEqNotes.trim() || undefined,
    };

    if (editingEqIndex !== null) {
      setAssignedEquipment(prev => prev.map((it, idx) => idx === editingEqIndex ? itemData : it));
    } else {
      setAssignedEquipment(prev => [...prev, itemData]);
    }

    resetEquipmentForm();
  };

  const handleRemoveEquipment = (index: number) => {
    setAssignedEquipment(prev => prev.filter((_, i) => i !== index));
    if (editingEqIndex === index) {
      resetEquipmentForm();
    }
  };

  const handleSelectPreset = (preset: EquipmentPresetItem) => {
    const now = new Date();
    let defaultWarrantyDate = '';
    if (preset.defaultWarrantyMonths) {
      const wDate = new Date();
      wDate.setMonth(wDate.getMonth() + preset.defaultWarrantyMonths);
      defaultWarrantyDate = wDate.toISOString().slice(0, 10);
    }

    const newItem: CompanyEquipmentItem = {
      id: `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: preset.name,
      brand: preset.brand,
      type: preset.type,
      category: preset.category,
      warrantyUntil: defaultWarrantyDate || undefined,
      notes: preset.description || undefined,
    };

    setAssignedEquipment(prev => [...prev, newItem]);
    setIsPresetPickerOpen(false);
  };

  // Helper for category badge styling
  const getCategoryBadge = (category?: string, type?: string) => {
    const cat = category || (type === 'ПО' ? 'software' : type === '3D-сканер' ? 'scanners' : type === 'КИМ' ? 'cmm' : type === 'Лазерный трекер' ? 'trackers' : type === 'Станок ЧПУ' ? 'cnc' : 'other');
    switch (cat) {
      case 'software':
        return { label: 'ПО', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'scanners':
        return { label: '3D-сканер', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'cmm':
        return { label: 'КИМ', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'trackers':
        return { label: 'Трекер/Рука', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'cnc':
        return { label: 'Станок ЧПУ', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      default:
        return { label: 'Оснастка/Прочее', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  // Verification status helper
  const getVerificationStatus = (dateStr?: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const days = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (days < 0) {
      return { status: 'expired', label: `Просрочена (${Math.abs(days)} дн.)`, bg: 'bg-rose-100 text-rose-800 border-rose-200' };
    }
    if (days <= 30) {
      return { status: 'warning', label: `Истекает через ${days} дн.`, bg: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    return { status: 'valid', label: `Действует (до ${dateStr})`, bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  // --- INLINE CONTACT CREATION HANDLER ---
  const handleSaveInlineContact = async () => {
    if (!newContactFullName.trim()) {
      alert('Укажите ФИО контактного лица');
      return;
    }

    setIsSavingInlineContact(true);
    try {
      const contactData: Partial<CrmContact> = {
        fullName: newContactFullName.trim(),
        position: newContactPosition.trim() || 'Контактное лицо',
        department: newContactDepartment.trim() || undefined,
        workPhone: newContactPhone.trim() || undefined,
        email: newContactEmail.trim() || undefined,
        isDecisionMaker: newContactIsDecisionMaker,
        companyId: company?.id || undefined,
        companyName: name || 'Организация',
        interactionHistory: []
      };

      if (onAddContactForCompany) {
        await onAddContactForCompany(contactData);
      } else {
        await apiService.saveCrmContact(contactData);
      }

      setNewContactFullName('');
      setNewContactPosition('');
      setNewContactDepartment('');
      setNewContactPhone('');
      setNewContactEmail('');
      setNewContactIsDecisionMaker(false);
      setIsAddingContactInline(false);
    } catch (e: any) {
      alert(e?.message || 'Ошибка сохранения контактного лица');
    } finally {
      setIsSavingInlineContact(false);
    }
  };

  // --- FORM SUBMIT HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Наименование организации обязательно');
      return;
    }
    if (!inn.trim()) {
      setError('ИНН организации обязателен');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const finalIndustry = industrySelect === 'other' ? (customIndustry.trim() || 'Машиностроение') : industrySelect;

      await onSave({
        id: company?.id,
        name: name.trim(),
        inn: inn.trim(),
        kpp: kpp.trim() || undefined,
        industry: finalIndustry,
        city: city.trim() || 'Самара',
        address: address.trim() || undefined,
        status,
        phone: phone.trim(),
        email: email.trim(),
        contactPerson: contactPerson.trim() || undefined,
        ceoName: ceoName.trim() || undefined,
        ceoPost: ceoPost.trim() || undefined,
        notes: notes.trim() || undefined,
        assignedEquipment,
      });
      autoSave.clearDraft();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения контрагента');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      style={{ zIndex }}
    >
      <div 
        ref={containerRef}
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 w-full transition-all duration-200 flex flex-col my-auto max-h-[96vh] ${
          isFullscreen ? 'fixed inset-2 max-w-none max-h-none rounded-xl' : 'max-w-4xl'
        }`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/80 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {company ? `Редактирование: ${company.name}` : 'Новый контрагент / Предприятие'}
              </h3>
              <p className="text-xs text-gray-500">
                Карточка партнера, закрепленное оборудование и база контактов
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Свернуть' : 'Развернуть на весь экран'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AutoSave Draft Banner */}
        {autoSave.hasDraft && (
          <AutoSaveDraftBanner
            hasDraft={autoSave.hasDraft}
            lastSavedAt={autoSave.lastSavedAt}
            statusText={autoSave.statusText}
            onRestore={autoSave.restoreDraft}
            onClear={autoSave.clearDraft}
            className="mx-6 mt-3"
          />
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col min-h-0">
          <div className="p-6 space-y-5 flex-1">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* DaData Search & Quick Auto-fill */}
            <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Поиск и автозаполнение реквизитов через DaData (ЕГРЮЛ / ИНН)</span>
                </label>
              </div>
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={dadataQuery}
                      onChange={(e) => setDadataQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleDadataSearch(); } }}
                      placeholder="Введите ИНН, ОГРН или точное наименование завода..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-blue-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleDadataSearch}
                    disabled={isSearchingDadata}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    {isSearchingDadata ? (
                      <span className="animate-spin text-xs">⏳</span>
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Найти в ЕГРЮЛ</span>
                  </button>
                </div>

                {/* DaData Dropdown Results */}
                {showDadataDropdown && dadataResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-blue-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {dadataResults.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyDadataResult(sug)}
                        className="w-full text-left p-3 hover:bg-blue-50 transition-colors flex flex-col gap-0.5 cursor-pointer"
                      >
                        <div className="text-xs font-bold text-gray-900">{sug.value}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-3">
                          <span>ИНН: <strong className="font-mono text-gray-700">{sug.data?.inn}</strong></span>
                          {sug.data?.address?.value && <span className="truncate">Адрес: {sug.data?.address?.value}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Полное наименование организации <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ПАО «ОДК-Кузнецов»"
                  className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  ИНН <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={inn}
                  onChange={(e) => setInn(e.target.value)}
                  placeholder="6312000000"
                  className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
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
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Отрасль / Направление
                </label>
                <select
                  value={industrySelect}
                  onChange={(e) => setIndustrySelect(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
                >
                  {PREDEFINED_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                  <option value="other">Другая отрасль...</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Город / Регион
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Самара"
                  className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
                />
              </div>

              {industrySelect === 'other' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Укажите собственную отрасль
                  </label>
                  <input
                    type="text"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    placeholder="Например: Аддитивное производство / 3D-печать"
                    className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Юридический / Фактический адрес
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="г. Самара, Заводское шоссе, д. 29"
                  className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>

            {/* Contacts & CEO block */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Общие контактные данные предприятия</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Телефон приемной / коммутатора
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (846) 200-00-00"
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email общий / экспедиция
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@odk-kuznetsov.ru"
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Руководитель организации (для автоподстановки в ТКП и DaData) */}
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <label className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Руководитель организации (для генератора ТКП)</span>
                </label>
                {ceoName && (
                  <span className="text-[11px] font-bold text-blue-800 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                    Обращение: <strong className="text-blue-950">{parseRussianLeaderGreeting(ceoName, ceoPost).greeting}</strong>
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
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden font-medium"
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
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden font-bold"
                  />
                </div>
              </div>
            </div>

            {/* --- MULTIPLE CONTACTS OF COMPANY SECTION --- */}
            <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Контактные лица предприятия ({companyContacts.length})
                  </label>
                </div>
                {!isAddingContactInline && (
                  <button
                    type="button"
                    onClick={() => setIsAddingContactInline(true)}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Добавить контакт</span>
                  </button>
                )}
              </div>

              {/* Inline contact creation sub-form */}
              {isAddingContactInline && (
                <div className="p-3.5 bg-blue-50/70 border-2 border-blue-300 rounded-xl space-y-2.5 animate-in fade-in zoom-in-98 duration-150">
                  <div className="flex items-center justify-between border-b border-blue-200/80 pb-1.5">
                    <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-blue-700" />
                      <span>Новое контактное лицо</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingContactInline(false)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                        ФИО контакта <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newContactFullName}
                        onChange={(e) => setNewContactFullName(e.target.value)}
                        placeholder="Например: Сидоров Алексей Викторович"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold focus:border-blue-500 outline-hidden"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Должность</label>
                      <input
                        type="text"
                        value={newContactPosition}
                        onChange={(e) => setNewContactPosition(e.target.value)}
                        placeholder="Главный метролог / Инженер ОТК"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:border-blue-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Подразделение / Цех</label>
                      <input
                        type="text"
                        value={newContactDepartment}
                        onChange={(e) => setNewContactDepartment(e.target.value)}
                        placeholder="Цех №12 / Лаборатория КИМ"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:border-blue-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Телефон</label>
                      <input
                        type="text"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        placeholder="+7 (927) 000-00-00"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:border-blue-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Email</label>
                      <input
                        type="email"
                        value={newContactEmail}
                        onChange={(e) => setNewContactEmail(e.target.value)}
                        placeholder="sidorov@zavod.ru"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:border-blue-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                    <label className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newContactIsDecisionMaker}
                        onChange={(e) => setNewContactIsDecisionMaker(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                      />
                      <span>⭐ Лицо, принимающее решения (ЛПР)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingContactInline(false)}
                        className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-100 text-slate-600 text-xs font-bold rounded-md cursor-pointer"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveInlineContact}
                        disabled={isSavingInlineContact}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSavingInlineContact ? 'Сохранение...' : 'Создать контакт'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* List of contacts */}
              <div className="space-y-2">
                {companyContacts.map(c => (
                  <div key={c.id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-start justify-between gap-3 text-xs shadow-2xs hover:border-blue-300 transition-colors">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 truncate">{c.fullName}</span>
                        {c.isDecisionMaker && (
                          <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded-full font-black">
                            ⭐ ЛПР
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-2 flex-wrap">
                        {c.position && <span>Должность: <strong className="text-gray-700">{c.position}</strong></span>}
                        {c.department && <span>Цех: <strong className="text-gray-700">{c.department}</strong></span>}
                      </div>
                      <div className="text-[11px] text-gray-600 flex items-center gap-3 pt-0.5">
                        {c.workPhone && (
                          <a href={`tel:${c.workPhone}`} className="hover:text-blue-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-blue-500" />
                            <span>{c.workPhone}</span>
                          </a>
                        )}
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="hover:text-blue-600 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-blue-500" />
                            <span>{c.email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {companyContacts.length === 0 && !isAddingContactInline && (
                  <p className="text-xs text-gray-400 italic py-1">
                    Связанные контактные лица пока отсутствуют. Нажмите «Добавить контакт», чтобы закрепить инженеров, метрологов или ЛПР за предприятием.
                  </p>
                )}
              </div>
            </div>

            {/* --- ASSIGNED EQUIPMENT & PRESET CATALOG SECTION --- */}
            <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-xl space-y-3.5 shadow-2xs">
              {/* Header with Title and Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Закрепленное оборудование и ПО ({assignedEquipment.length})</span>
                    </label>
                    <p className="text-[10px] text-gray-500">
                      Парк КИМ, 3D-сканеров, трекеров, лицензий ПО и станков с ЧПУ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsPresetPickerOpen(true)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                    title="Выбрать оборудование или ПО из каталога готовых промышленных решений «ДС-Инжиниринг»"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Выбрать из каталога ПО и оборудования</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenAddEquipmentForm}
                    className="px-3 py-1.5 bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    title="Добавить индивидуальную единицу оборудования вручную"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить вручную</span>
                  </button>
                </div>
              </div>

              {/* Category Breakdown Badges */}
              {assignedEquipment.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={() => setEqListCategoryFilter('all')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      eqListCategoryFilter === 'all' 
                        ? 'bg-slate-800 text-white shadow-xs' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Все ({assignedEquipment.length})
                  </button>
                  {EQUIPMENT_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                    const count = assignedEquipment.filter(item => {
                      if (item.category) return item.category === cat.id;
                      const t = (item.type || '').toLowerCase();
                      if (cat.id === 'software') return t.includes('по');
                      if (cat.id === 'scanners') return t.includes('сканер');
                      if (cat.id === 'cmm') return t.includes('ким');
                      if (cat.id === 'trackers') return t.includes('трекер') || t.includes('рук');
                      if (cat.id === 'cnc') return t.includes('чпу') || t.includes('станок');
                      return false;
                    }).length;

                    if (count === 0) return null;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setEqListCategoryFilter(cat.id)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          eqListCategoryFilter === cat.id 
                            ? 'bg-blue-600 text-white shadow-xs' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        {cat.label}: {count}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Inline Add / Edit Equipment Card */}
              {isEqFormOpen && (
                <div className="p-4 bg-amber-50/70 border-2 border-amber-300 rounded-xl space-y-3 animate-in fade-in zoom-in-98 duration-150 shadow-xs">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-amber-700" />
                      <span>{editingEqIndex !== null ? 'Редактирование параметров единицы парка' : 'Добавление новой единицы оборудования / ПО'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={resetEquipmentForm}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Наименование / Модель <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formEqName}
                        onChange={(e) => setFormEqName(e.target.value)}
                        placeholder="Например: PMT Future Plus / FreeScan UE Pro / ScanLine EasyScan / PolyWorks"
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:border-amber-500 outline-hidden"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Производитель / Бренд
                      </label>
                      <input
                        type="text"
                        value={formEqBrand}
                        onChange={(e) => setFormEqBrand(e.target.value)}
                        placeholder="SHINING 3D, InnovMetric, Mitutoyo"
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:border-amber-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Тип оборудования
                      </label>
                      <select
                        value={formEqType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormEqType(val);
                          if (val === 'ПО') setFormEqCategory('software');
                          else if (val === '3D-сканер') setFormEqCategory('scanners');
                          else if (val === 'КИМ') setFormEqCategory('cmm');
                          else if (val === 'Лазерный трекер') setFormEqCategory('trackers');
                          else if (val === 'Станок ЧПУ') setFormEqCategory('cnc');
                          else setFormEqCategory('other');
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:border-amber-500 outline-hidden cursor-pointer"
                      >
                        <option value="3D-сканер">3D-сканер</option>
                        <option value="КИМ">КИМ (Координатно-измерительная машина)</option>
                        <option value="Лазерный трекер">Лазерный трекер / Рука</option>
                        <option value="ПО">ПО (CAD / CAM / Метрология)</option>
                        <option value="Станок ЧПУ">Станок ЧПУ (Фрезерный / Токарный)</option>
                        <option value="Прочее">Прочее (Оснастка / Датчики / Плиты)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Серийный № / Лицензия
                      </label>
                      <input
                        type="text"
                        value={formEqSerial}
                        onChange={(e) => setFormEqSerial(e.target.value)}
                        placeholder="SN-2026-89412 / ДЛ-00389"
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:border-amber-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Местоположение / Цех
                      </label>
                      <input
                        type="text"
                        value={formEqLocation}
                        onChange={(e) => setFormEqLocation(e.target.value)}
                        placeholder="Лаборатория КИМ №3, Корпус 4"
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:border-amber-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Дата следующей поверки
                      </label>
                      <input
                        type="date"
                        value={formEqVerifDate}
                        onChange={(e) => setFormEqVerifDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:border-amber-500 outline-hidden cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Гарантия / Техподдержка до
                      </label>
                      <input
                        type="date"
                        value={formEqWarranty}
                        onChange={(e) => setFormEqWarranty(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:border-amber-500 outline-hidden cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Примечания
                      </label>
                      <input
                        type="text"
                        value={formEqNotes}
                        onChange={(e) => setFormEqNotes(e.target.value)}
                        placeholder="Особенности комплектации..."
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:border-amber-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={resetEquipmentForm}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEquipmentForm}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingEqIndex !== null ? 'Сохранить изменения' : 'Добавить в парк предприятия'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Equipment Search Input */}
              {assignedEquipment.length > 2 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={eqListSearch}
                    onChange={(e) => setEqListSearch(e.target.value)}
                    placeholder="Поиск по парку (модель, серийный номер, цех, бренд)..."
                    className="w-full pl-8 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 outline-hidden"
                  />
                </div>
              )}

              {/* List of assigned equipment */}
              <div className="space-y-2">
                {filteredAssignedEquipment.map((eq, idx) => {
                  const originalIndex = assignedEquipment.indexOf(eq);
                  const badge = getCategoryBadge(eq.category, eq.type);
                  const verifStatus = getVerificationStatus(eq.verificationDate);

                  return (
                    <div 
                      key={eq.id || idx} 
                      className="p-3 bg-white border border-gray-200 rounded-xl flex items-start justify-between gap-3 text-xs shadow-2xs hover:border-blue-300 transition-colors"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">{eq.name}</span>
                          {eq.brand && (
                            <span className="text-[11px] text-slate-500 font-medium">({eq.brand})</span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-slate-600 pt-0.5">
                          {eq.serial && (
                            <div>Серийный №: <strong className="font-mono text-gray-800">{eq.serial}</strong></div>
                          )}
                          {eq.location && (
                            <div>Цех/Участок: <strong className="text-gray-800">{eq.location}</strong></div>
                          )}
                          {eq.warrantyUntil && (
                            <div>Гарантия до: <strong className="text-gray-800">{eq.warrantyUntil}</strong></div>
                          )}
                        </div>

                        {/* Verification badge */}
                        {verifStatus && (
                          <div className="pt-0.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${verifStatus.bg}`}>
                              <ShieldCheck className="w-3 h-3" />
                              <span>Поверка: {verifStatus.label}</span>
                            </span>
                          </div>
                        )}

                        {eq.notes && (
                          <p className="text-[11px] text-slate-500 italic pt-0.5 border-t border-gray-100">
                            {eq.notes}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleStartEditEquipment(originalIndex >= 0 ? originalIndex : idx)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Редактировать параметры"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipment(originalIndex >= 0 ? originalIndex : idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Удалить из парка"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {assignedEquipment.length === 0 && !isEqFormOpen && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-white/50 space-y-2">
                    <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-gray-500 font-medium">
                      За предприятием пока не закреплено измерительное оборудование или ПО
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsPresetPickerOpen(true)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Открыть каталог оборудования</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

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
          <div className="px-6 py-3.5 border-t border-gray-100 bg-slate-50/80 flex items-center justify-between gap-2 shrink-0">
            <div className="text-xs text-slate-500">
              {assignedEquipment.length > 0 && (
                <span>Парк: <strong>{assignedEquipment.length} ед.</strong></span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-slate-600 font-bold rounded-lg text-xs transition-colors cursor-pointer"
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
          </div>
        </form>

        {/* --- PRESET CATALOG PICKER MODAL (OVERLAY) --- */}
        {isPresetPickerOpen && (
          <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Библиотека промышленного оборудования и ПО «ДС-Инжиниринг»
                    </h4>
                    <p className="text-[11px] text-blue-200/80">
                      Выберите типовые системы для быстрого добавления в парк контрагента
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPresetPickerOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search and Category Filter Bar */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={presetSearchQuery}
                    onChange={(e) => setPresetSearchQuery(e.target.value)}
                    placeholder="Поиск по названию (PolyWorks, FreeScan, Mitutoyo, DMG MORI, Leica)..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-gray-900 focus:border-blue-500 outline-hidden"
                    autoFocus
                  />
                </div>

                {/* Category tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {EQUIPMENT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPresetCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        presetCategoryFilter === cat.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets List Body */}
              <div className="p-4 overflow-y-auto flex-1 divide-y divide-gray-100 space-y-2">
                {filteredPresets.map(preset => {
                  const badge = getCategoryBadge(preset.category, preset.type);
                  return (
                    <div 
                      key={preset.id}
                      className="p-3 hover:bg-blue-50/60 rounded-xl border border-gray-100 hover:border-blue-200 transition-all flex items-start justify-between gap-3 group cursor-pointer"
                      onClick={() => handleSelectPreset(preset)}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {preset.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            • {preset.brand}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPreset(preset);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0 shadow-2xs group-hover:shadow-xs transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Выбрать</span>
                      </button>
                    </div>
                  );
                })}

                {filteredPresets.length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-400">
                    По запросу «{presetSearchQuery}» ничего не найдено в каталоге.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500">
                  Всего в каталоге: {EQUIPMENT_PRESETS.length} позиций
                </span>
                <button
                  type="button"
                  onClick={() => setIsPresetPickerOpen(false)}
                  className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
