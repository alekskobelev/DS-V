import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Eye, 
  FileText, 
  Wrench, 
  Search, 
  Columns,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  History
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceItem, ServiceContact } from '../../types';
import { 
  REAL_SERVICES, 
  VERIFIED_EQUIPMENT_PARK, 
  COMPANY_SPECIALISTS,
  validateEquipmentItem,
  validateEquipmentList,
  validateEquipmentArray,
  validateContact,
  validateContactLink,
  validateServiceItem,
  sanitizeServiceItem,
  saveServicesVersion,
  getServicesHistory,
  restoreServicesVersion,
  rollbackToPreviousVersion,
  ServiceVersionSnapshot
} from '../../data/services';
import { FileUploadField } from '../common/FileUploadField';
import { AutoResizeTextarea } from '../common/AutoResizeTextarea';
import { RichTextEditor } from './RichTextEditor';
import { ServiceVisualPreview } from './ServiceVisualPreview';
import { CmsDynamicServiceForm } from './CmsDynamicServiceForm';
import { CmsServicesHistoryModal } from './CmsServicesHistoryModal';
import { useServiceFormValidation } from '../../hooks/useServiceFormValidation';

export { CmsDynamicServiceForm, useServiceFormValidation, CmsServicesHistoryModal };

export const SERVICES_DATA = REAL_SERVICES;
export const REAL_EQUIPMENT_PRESETS: string[] = VERIFIED_EQUIPMENT_PARK;
export const STAFF_CONTACT_PRESETS: ServiceContact[] = Object.values(COMPANY_SPECIALISTS);

export const CmsServicesEditor: React.FC = () => {
  const { services, updateService, deleteService, showToast, navigateTo } = useApp();

  const [servicesViewMode, setServicesViewMode] = useState<'split' | 'editor' | 'dynamic' | 'preview'>('split');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form Validation State
  const [formValidationErrors, setFormValidationErrors] = useState<Record<string, string>>({});

  // Form State
  const [servTitle, setServTitle] = useState('');
  const [servCategory, setServCategory] = useState('3D-сканирование и оцифровка');
  const [servImage, setServImage] = useState('');
  const [servBrochureUrl, setServBrochureUrl] = useState('');
  const [servShortDesc, setServShortDesc] = useState('');
  const [servFullDesc, setServFullDesc] = useState('');
  const [servBasePriceText, setServBasePriceText] = useState('от 15 000 ₽ / деталь');
  const [servBasePriceNum, setServBasePriceNum] = useState<number>(15000);
  const [servCalculatorType, setServCalculatorType] = useState<ServiceItem['calculatorType']>('scanning');
  const [servBenefits, setServBenefits] = useState('');

  // Equipment Management
  const [servEquipmentList, setServEquipmentList] = useState<string[]>([
    'Лазерный 3D-сканер Shining 3D FreeScan Combo (в реестре ФГИС «АРШИН»)',
    'Метрологическое ПО PolyWorks|Inspector™ (контроль геометрии и GD&T)',
    'Мобильная рабочая станция метролога (выезд на объект)'
  ]);
  const [newEquipmentInput, setNewEquipmentInput] = useState('');

  // Contacts & SLA Management
  const [servResponsiblePerson, setServResponsiblePerson] = useState('Ярыш Иван Владимирович (Инженер-метролог)');
  const [servSlaResponseTime, setServSlaResponseTime] = useState('Ответ на заявку за 15 минут, выезд за 24–48 ч');
  const [servWorkLocationNote, setServWorkLocationNote] = useState('Выезд со сканером на объект заказчика по всей РФ или в офисе в Самаре (ул. Свободы, 198)');
  const [servContacts, setServContacts] = useState<ServiceContact[]>([
    {
      id: 'c-yarish',
      name: 'Ярыш Иван Владимирович',
      role: 'Инженер-метролог (выездной 3D-контроль, сканирование)',
      phone: '+7 (927) 748-46-58',
      email: 'yarish@ds-enginering.ru',
      location: 'Самара (ул. Свободы, 198) / Выезд по РФ'
    }
  ]);

  // Steps Management
  const [servSteps, setServSteps] = useState<{ stepNumber: number; title: string; desc: string }[]>([
    { stepNumber: 1, title: 'Анализ ТЗ и модели', desc: 'Изучение требований, чертежей и допусков заказчика' },
    { stepNumber: 2, title: 'Выезд и сканирование', desc: 'Сканирование мобильным прибором на объекте или в лаборатории' },
    { stepNumber: 3, title: 'Обработка и сдача отчета', desc: 'Построение сетки/CAD-модели и оформление протокола поверки' }
  ]);

  // Current partial object for live validation hook
  const currentServiceFormData: Partial<ServiceItem> = {
    id: editingServiceId || 'temp-id',
    title: servTitle,
    category: servCategory,
    shortDesc: servShortDesc,
    fullDesc: servFullDesc || servShortDesc,
    iconName: 'Wrench',
    calculatorType: servCalculatorType,
    basePriceText: servBasePriceText,
    steps: servSteps,
    equipmentUsed: servEquipmentList,
    deliverables: servBenefits ? servBenefits.split('\n').map(b => b.trim()).filter(Boolean) : [],
    image: servImage,
    brochureUrl: servBrochureUrl || undefined,
    fileUrl: servBrochureUrl || undefined,
    contacts: servContacts,
    responsiblePerson: servResponsiblePerson || undefined,
    slaResponseTime: servSlaResponseTime || undefined,
    workLocationNote: servWorkLocationNote || undefined,
  };

  // Real-time validation hook invocation
  const liveValidation = useServiceFormValidation(currentServiceFormData, { liveValidation: true });
  const isSaveBlocked = !liveValidation.isValid;
  const activeErrorMap = { ...liveValidation.errorMap, ...formValidationErrors };

  // New Contact Inline Inputs
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactLocation, setNewContactLocation] = useState('Самара (ул. Свободы, 198)');
  const [newContactTelegram, setNewContactTelegram] = useState('');
  const [newContactUrl, setNewContactUrl] = useState('');
  const [showAddContactForm, setShowAddContactForm] = useState(false);

  const handleResetServiceForm = () => {
    setEditingServiceId(null);
    setFormValidationErrors({});
    setServTitle('');
    setServCategory('3D-сканирование и оцифровка');
    setServShortDesc('');
    setServImage('');
    setServBrochureUrl('');
    setServFullDesc('');
    setServBenefits('');
    setServBasePriceText('от 15 000 ₽ / деталь');
    setServBasePriceNum(15000);
    setServCalculatorType('scanning');
    setServEquipmentList([
      'Лазерный 3D-сканер Shining 3D FreeScan Combo (в реестре ФГИС «АРШИН»)',
      'Метрологическое ПО PolyWorks|Inspector™ (контроль геометрии и GD&T)'
    ]);
    setServResponsiblePerson('Ярыш Иван Владимирович (Инженер-метролог)');
    setServSlaResponseTime('Ответ на заявку за 15 минут, выезд за 24–48 ч');
    setServWorkLocationNote('Выезд со сканером на объект заказчика по всей РФ или в офисе в Самаре (ул. Свободы, 198)');
    setServContacts([
      {
        id: 'c-yarish',
        name: 'Ярыш Иван Владимирович',
        role: 'Инженер-метролог (выездной 3D-контроль, сканирование)',
        phone: '+7 (927) 748-46-58',
        email: 'yarish@ds-enginering.ru',
        location: 'Самара (ул. Свободы, 198) / Выезд по РФ'
      }
    ]);
    setServSteps([
      { stepNumber: 1, title: 'Анализ ТЗ и модели', desc: 'Изучение требований, чертежей и допусков заказчика' },
      { stepNumber: 2, title: 'Выезд и сканирование', desc: 'Сканирование мобильным прибором на объекте или в лаборатории' },
      { stepNumber: 3, title: 'Обработка и сдача отчета', desc: 'Построение сетки/CAD-модели и оформление протокола поверки' }
    ]);
  };

  const handleStartEditService = (serv: ServiceItem) => {
    setEditingServiceId(serv.id);
    setFormValidationErrors({});
    setServTitle(serv.title);
    setServCategory(serv.category || 'Инжиниринг');
    setServShortDesc(serv.shortDesc || '');
    setServFullDesc(serv.fullDesc || serv.shortDesc || '');
    setServImage(serv.image || '');
    setServBrochureUrl(serv.brochureUrl || serv.fileUrl || '');
    setServBasePriceText(serv.basePriceText || 'от 15 000 ₽');
    setServCalculatorType(serv.calculatorType || 'scanning');
    setServBenefits(serv.deliverables ? serv.deliverables.join('\n') : '');
    
    // Equipment
    const equip = Array.isArray(serv.equipmentUsed) ? serv.equipmentUsed : [];
    setServEquipmentList(equip.length > 0 ? equip : [
      'Лазерный 3D-сканер Shining 3D FreeScan Combo (в реестре ФГИС «АРШИН»)',
      'Метрологическое ПО PolyWorks|Inspector™'
    ]);

    // Contacts
    setServResponsiblePerson(serv.responsiblePerson || '');
    setServSlaResponseTime(serv.slaResponseTime || 'Ответ на заявку за 15 минут, выезд за 24–48 ч');
    setServWorkLocationNote(serv.workLocationNote || 'Выезд со сканером на объект заказчика по всей РФ или в офисе в Самаре (ул. Свободы, 198)');
    setServContacts(Array.isArray(serv.contacts) && serv.contacts.length > 0 ? serv.contacts : [
      {
        id: 'c-yarish',
        name: 'Ярыш Иван Владимирович',
        role: 'Инженер-метролог (выездной 3D-контроль, сканирование)',
        phone: '+7 (927) 748-46-58',
        email: 'yarish@ds-enginering.ru',
        location: 'Самара (ул. Свободы, 198) / Выезд по РФ'
      }
    ]);

    // Steps
    setServSteps(serv.steps && serv.steps.length > 0 ? serv.steps : [
      { stepNumber: 1, title: 'Анализ ТЗ', desc: 'Изучение требований и чертежей заказчика' },
      { stepNumber: 2, title: 'Выполнение работ', desc: 'Сканирование или измерения на объекте' },
      { stepNumber: 3, title: 'Сдача отчета', desc: 'Формирование протокола и передача 3D моделей' }
    ]);
    showToast(`Редактирование услуги: «${serv.title}»`);
  };

  const handleAddEquipment = (eqName: string) => {
    const trimmed = eqName.trim();
    if (!trimmed) {
      showToast('Укажите наименование оборудования');
      return;
    }
    // Строгая валидация формата оборудования
    const valResult = validateEquipmentItem(trimmed);
    if (!valResult.isValid) {
      showToast(valResult.error || 'Недопустимый формат оборудования');
      return;
    }
    if (servEquipmentList.includes(trimmed)) {
      showToast('Этот прибор уже есть в списке');
      return;
    }
    setServEquipmentList(prev => [...prev, trimmed]);
    setNewEquipmentInput('');
    setFormValidationErrors(prev => {
      const next = { ...prev };
      delete next.equipmentUsed;
      return next;
    });
  };

  const handleRemoveEquipment = (index: number) => {
    setServEquipmentList(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPresetContact = (preset: ServiceContact) => {
    if (servContacts.some(c => c.name === preset.name)) {
      showToast(`Контакт «${preset.name}» уже добавлен к услуге`);
      return;
    }
    setServContacts(prev => [...prev, { ...preset, id: `c-${Date.now()}` }]);
    if (!servResponsiblePerson) {
      setServResponsiblePerson(`${preset.name} (${preset.role})`);
    }
    showToast(`Добавлен специалист: ${preset.name}`);
  };

  const handleCreateCustomContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      showToast('Укажите ФИО и телефон специалиста');
      return;
    }
    const newContact: ServiceContact = {
      id: `c-custom-${Date.now()}`,
      name: newContactName.trim(),
      role: newContactRole.trim() || 'Инженер-эксперт',
      phone: newContactPhone.trim(),
      email: newContactEmail.trim() || 'info@ds-enginering.ru',
      location: newContactLocation.trim() || 'Самара (ул. Свободы, 198)',
      telegramUrl: newContactTelegram.trim() || undefined,
      url: newContactUrl.trim() || undefined
    };

    const contactVal = validateContact(newContact);
    if (!contactVal.isValid) {
      showToast(contactVal.errors[0] || 'Ошибка валидации контакта');
      return;
    }

    setServContacts(prev => [...prev, newContact]);
    setNewContactName('');
    setNewContactRole('');
    setNewContactPhone('');
    setNewContactEmail('');
    setNewContactTelegram('');
    setNewContactUrl('');
    setShowAddContactForm(false);
    showToast(`Контакт «${newContact.name}» добавлен`);
  };

  const handleRemoveContact = (index: number) => {
    setServContacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    setServSteps(prev => [
      ...prev,
      { stepNumber: prev.length + 1, title: `Этап ${prev.length + 1}`, desc: 'Описание работ на данном этапе' }
    ]);
  };

  const handleRemoveStep = (idx: number) => {
    setServSteps(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  const handleStepChange = (idx: number, field: 'title' | 'desc', val: string) => {
    setServSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  // Version History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState<number>(() => {
    return getServicesHistory().length;
  });

  const updateHistoryCount = () => {
    setHistoryCount(getServicesHistory().length);
  };

  const handleDeleteService = (id: string, title: string) => {
    if (window.confirm(`Удалить инжиниринговую услугу «${title}»?`)) {
      if (deleteService) {
        deleteService(id);
      }
      const nextServices = services.filter(s => s.id !== id);
      saveServicesVersion(nextServices, `Удаление услуги «${title}»`, {
        action: 'delete',
        changedServiceId: id
      });
      updateHistoryCount();
      if (editingServiceId === id) {
        handleResetServiceForm();
      }
      showToast(`Услуга «${title}» удалена (снимок сохранен в историю)`);
    }
  };

  const handleRestoreRealisticDefaults = () => {
    if (window.confirm('Сбросить все услуги до проверенных заводских данных «ДС-Инжиниринг»? Все несуществующие демо-центры и стационарные КИМ будут гарантированно очищены.')) {
      try {
        localStorage.setItem('ds_cms_services', JSON.stringify(SERVICES_DATA));
        saveServicesVersion(SERVICES_DATA, 'Сброс к эталонным заводским услугам «ДС-Инжиниринг»', {
          action: 'restore',
          reason: 'Сброс к эталону'
        });
        updateHistoryCount();
        SERVICES_DATA.forEach(s => updateService(s.id, s));
        handleResetServiceForm();
        showToast('Все 6 инжиниринговых услуг успешно восстановлены! Снимок сохранен в историю.');
      } catch (err) {
        console.error('Failed to restore default services', err);
        showToast('Ошибка при восстановлении данных');
      }
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanId = servTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existing = services.find((s) => s.id === editingServiceId);

    const deliverablesList = servBenefits 
      ? servBenefits.split('\n').map(b => b.trim()).filter(Boolean) 
      : [];

    const servObj: ServiceItem = {
      id: editingServiceId || `serv-${cleanId}-${Date.now()}`,
      title: servTitle.trim(),
      category: servCategory.trim(),
      shortDesc: servShortDesc.trim(),
      fullDesc: servFullDesc.trim() || servShortDesc.trim(),
      iconName: existing?.iconName || 'Wrench',
      calculatorType: servCalculatorType,
      basePriceText: servBasePriceText.trim() || (servBasePriceNum > 0 ? `от ${servBasePriceNum.toLocaleString('ru-RU')} ₽` : ''),
      steps: servSteps,
      equipmentUsed: servEquipmentList,
      deliverables: deliverablesList,
      image: servImage.trim() || existing?.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      brochureUrl: servBrochureUrl.trim() || undefined,
      fileUrl: servBrochureUrl.trim() || undefined,
      contacts: servContacts,
      responsiblePerson: servResponsiblePerson.trim() || (servContacts[0] ? `${servContacts[0].name} (${servContacts[0].role})` : undefined),
      slaResponseTime: servSlaResponseTime.trim() || undefined,
      workLocationNote: servWorkLocationNote.trim() || undefined,
    };

    // Строгая валидация перед сохранением: отсутствие пустых полей и проверка формата оборудования
    const validation = validateServiceItem(servObj);
    if (!validation.isValid) {
      setFormValidationErrors(validation.errorMap);
      const firstError = validation.errors[0]?.message || 'Заполните обязательные поля';
      showToast(firstError);
      return;
    }

    setFormValidationErrors({});
    updateService(servObj.id, servObj);

    // Сохраняем снимок в историю (до 5 последних версий в localStorage)
    const nextServices = services.some(s => s.id === servObj.id)
      ? services.map(s => s.id === servObj.id ? servObj : s)
      : [...services, servObj];
    
    saveServicesVersion(
      nextServices,
      editingServiceId ? `Обновление услуги «${servTitle}»` : `Создание новой услуги «${servTitle}»`,
      {
        action: editingServiceId ? 'update' : 'create',
        changedServiceId: servObj.id
      }
    );
    updateHistoryCount();

    showToast(`Услуга «${servTitle}» сохранена (снимок версии записан)`);
    handleResetServiceForm();
  };

  const handleServicesRestoreFromHistory = (restoredServices: ServiceItem[]) => {
    localStorage.setItem('ds_cms_services', JSON.stringify(restoredServices));
    restoredServices.forEach(s => updateService(s.id, s));
    updateHistoryCount();
    handleResetServiceForm();
  };

  const activeService = services.find((s) => s.id === editingServiceId) || services[0];
  const currentServicePreview = {
    id: editingServiceId || activeService?.id || 'sample-serv',
    title: servTitle || activeService?.title || '3D-сканирование деталей и объектов',
    category: servCategory || activeService?.category || '3D-сканирование и оцифровка',
    shortDesc: servShortDesc || activeService?.shortDesc || 'Высокоточное лазерное и оптическое 3D-сканирование промышленного оборудования с выездом экспертов по всей РФ.',
    fullDesc: servFullDesc || activeService?.fullDesc || activeService?.shortDesc || '',
    image: servImage || activeService?.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    basePriceText: servBasePriceText || activeService?.basePriceText || 'от 15 000 ₽ / деталь',
    deliverables: servBenefits ? servBenefits.split('\n').map(b => b.trim()).filter(Boolean) : (activeService?.deliverables || ['CAD-модель (STEP)', 'Протокол измерений']),
    equipmentUsed: servEquipmentList.length > 0 ? servEquipmentList : (activeService?.equipmentUsed || ['Shining 3D FreeScan Combo', 'PolyWorks|Inspector™']),
    calculatorType: servCalculatorType || activeService?.calculatorType || 'scanning',
    steps: servSteps,
    brochureUrl: servBrochureUrl || activeService?.brochureUrl,
    fileUrl: servBrochureUrl || activeService?.fileUrl,
    contacts: servContacts.length > 0 ? servContacts : activeService?.contacts,
    responsiblePerson: servResponsiblePerson || activeService?.responsiblePerson,
    slaResponseTime: servSlaResponseTime || activeService?.slaResponseTime,
    workLocationNote: servWorkLocationNote || activeService?.workLocationNote
  };

  const filteredServices = services.filter((s) => 
    !serviceSearchQuery || 
    s.title.toLowerCase().includes(serviceSearchQuery.toLowerCase()) || 
    (s.shortDesc && s.shortDesc.toLowerCase().includes(serviceSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Explaining Verified Real Services */}
      <div className="bg-gradient-to-r from-blue-900 to-[#1E3A8A] text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">
              Управление реальными услугами «ДС-Инжиниринг»
            </h2>
          </div>
          <p className="text-xs text-blue-200 max-w-3xl leading-relaxed">
            В панели администратора редактируются только реальные производственные услуги: выездное 3D-сканирование (Shining 3D / ScanLine), контроль геометрии (PolyWorks), реверс-инжиниринг (STEP), разработка постпроцессоров и внедрение TopSolid 7. Все изменения автоматически версионируются в localStorage (до 5 версий для безопасного отката).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => {
              updateHistoryCount();
              setIsHistoryModalOpen(true);
            }}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-white/20 transition-colors cursor-pointer shadow-xs"
            title="История версий и откат изменений"
          >
            <History className="w-3.5 h-3.5 text-amber-300" />
            <span>История версий</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400/30 text-amber-200 text-[10px] font-bold rounded-full border border-amber-300/40">
                {historyCount}/5
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleRestoreRealisticDefaults}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-white/20 transition-colors cursor-pointer"
            title="Восстановить проверенный эталон услуг"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
            <span>Сбросить к эталону</span>
          </button>
        </div>
      </div>

      {/* History Rollback Modal */}
      <CmsServicesHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        currentServices={services}
        onRestore={handleServicesRestoreFromHistory}
        showToast={showToast}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column (4 cols): List of all services with search */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                  Список услуг ({services.length})
                </h3>
                <p className="text-[11px] text-gray-500">
                  Выберите услугу для редактирования
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetServiceForm}
                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Новая услуга</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={serviceSearchQuery}
                onChange={(e) => setServiceSearchQuery(e.target.value)}
                placeholder="Поиск по услугам..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Services list */}
            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
              {filteredServices.map((serv) => (
                <div
                  key={serv.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    editingServiceId === serv.id
                      ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">
                          {serv.category || 'Инжиниринг'}
                        </span>
                        <span className="text-[10px] bg-blue-50 px-1.5 py-0.2 rounded text-blue-700 font-semibold">
                          {serv.basePriceText}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-xs leading-snug">
                        {serv.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                        {serv.shortDesc}
                      </p>

                      {serv.responsiblePerson && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600 font-medium">
                          <UserCheck className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">{serv.responsiblePerson}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditService(serv)}
                        title="Редактировать в CMS"
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-amber-600" />
                        <span>Ред.</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTo('services', serv.id)}
                        title="Просмотр на сайте"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(serv.id, serv.title)}
                        title="Удалить услугу"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredServices.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">
                  Услуг не найдено
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Mode Switcher Toolbar + Editor Form + ServiceVisualPreview */}
        <div className="xl:col-span-8 space-y-6">
          {/* Unified Mode Switcher Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1.5">Режим:</span>
              <button
                type="button"
                onClick={() => setServicesViewMode('split')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  servicesViewMode === 'split' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Сплит</span>
              </button>
              <button
                type="button"
                onClick={() => setServicesViewMode('editor')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  servicesViewMode === 'editor' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Редактор</span>
              </button>
              <button
                type="button"
                onClick={() => setServicesViewMode('dynamic')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  servicesViewMode === 'dynamic' ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Динамический генератор ServiceItem</span>
              </button>
              <button
                type="button"
                onClick={() => setServicesViewMode('preview')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  servicesViewMode === 'preview' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live-превью</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {editingServiceId && (
                <button
                  type="button"
                  onClick={handleResetServiceForm}
                  className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-gray-100 rounded-lg font-medium cursor-pointer"
                >
                  Отмена
                </button>
              )}
              {servicesViewMode !== 'dynamic' && (
                <button
                  type="button"
                  disabled={isSaveBlocked}
                  onClick={(e) => handleSaveService(e as any)}
                  title={isSaveBlocked ? 'Заполните обязательные поля без ошибок' : 'Сохранить услугу'}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all ${
                    isSaveBlocked 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Сохранить услугу</span>
                  {isSaveBlocked && <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />}
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Service Form Mode */}
          {servicesViewMode === 'dynamic' && (
            <CmsDynamicServiceForm
              initialService={editingServiceId ? services.find(s => s.id === editingServiceId) : undefined}
              onSave={(savedService) => {
                updateService(savedService.id, savedService);
                showToast(`Услуга «${savedService.title}» успешно сохранена!`);
                handleResetServiceForm();
                setServicesViewMode('split');
              }}
              onCancel={handleResetServiceForm}
            />
          )}

          {/* Form Editor (shown in 'split' and 'editor' modes) */}
          {(servicesViewMode === 'split' || servicesViewMode === 'editor') && (
            <form onSubmit={handleSaveService} className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    <span>{editingServiceId ? `Редактирование: «${servTitle}»` : 'Создание новой услуги'}</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Настройте формулировки, список реального оборудования, ответственных инженеров и контакты
                  </p>
                </div>
                {isSaveBlocked && (
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Ошибок: {liveValidation.errorCount} (кнопка сохранения заблокирована)</span>
                  </span>
                )}
              </div>

              {/* Validation Errors Alert Banner */}
              {(!liveValidation.isValid || Object.keys(activeErrorMap).length > 0) && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1.5 shadow-xs">
                  <div className="font-bold flex items-center gap-2 text-rose-900">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Обнаружены ошибки валидации ServiceItem:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-rose-700 pl-1 font-medium">
                    {liveValidation.errors.map((err, i) => (
                      <li key={i}><strong>[{err.field}]</strong>: {err.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 1. Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Наименование услуги <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={servTitle}
                    onChange={(e) => {
                      setServTitle(e.target.value);
                      if (formValidationErrors.title) {
                        setFormValidationErrors(prev => {
                          const next = { ...prev };
                          delete next.title;
                          return next;
                        });
                      }
                    }}
                    placeholder="Например: 3D-сканирование деталей и объектов"
                    className={`w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500 ${
                      formValidationErrors.title ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formValidationErrors.title && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formValidationErrors.title}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Категория услуги</label>
                  <input
                    type="text"
                    value={servCategory}
                    onChange={(e) => {
                      setServCategory(e.target.value);
                      if (formValidationErrors.category) {
                        setFormValidationErrors(prev => {
                          const next = { ...prev };
                          delete next.category;
                          return next;
                        });
                      }
                    }}
                    placeholder="3D-сканирование и оцифровка"
                    className={`w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500 ${
                      formValidationErrors.category ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                    }`}
                  />
                  {formValidationErrors.category && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold">{formValidationErrors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Тип калькулятора (алгоритм расчета)</label>
                  <select
                    value={servCalculatorType}
                    onChange={(e) => {
                      setServCalculatorType(e.target.value as any);
                      if (formValidationErrors.calculatorType) {
                        setFormValidationErrors(prev => {
                          const next = { ...prev };
                          delete next.calculatorType;
                          return next;
                        });
                      }
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="scanning">3D-сканирование и оцифровка (по габаритам/массе)</option>
                    <option value="inspection">КИМ-контроль геометрии и GD&T (по допускам)</option>
                    <option value="reverse">Реверс-инжиниринг (CAD/STEP по сетке STL)</option>
                    <option value="postprocessor">Разработка постпроцессоров ЧПУ</option>
                    <option value="tooling">Проектирование оснастки и пресс-форм</option>
                    <option value="cmm_service">Сервисное обслуживание и калибровка КИМ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Базовая цена (число для калькулятора, ₽)</label>
                  <input
                    type="number"
                    value={servBasePriceNum}
                    onChange={(e) => setServBasePriceNum(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Текст стоимости (для карточки)</label>
                  <input
                    type="text"
                    value={servBasePriceText}
                    onChange={(e) => {
                      setServBasePriceText(e.target.value);
                      if (formValidationErrors.basePriceText) {
                        setFormValidationErrors(prev => {
                          const next = { ...prev };
                          delete next.basePriceText;
                          return next;
                        });
                      }
                    }}
                    placeholder="от 15 000 ₽ / деталь"
                    className={`w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500 ${
                      formValidationErrors.basePriceText ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                    }`}
                  />
                  {formValidationErrors.basePriceText && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold">{formValidationErrors.basePriceText}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <FileUploadField 
                    label="Изображение услуги" 
                    value={servImage} 
                    onChange={setServImage} 
                    type="image"
                    placeholder="https://... или /images/services/my-service.jpg" 
                  />
                </div>

                {/* File Upload for Brochure / Technical Specification */}
                <div className="sm:col-span-3">
                  <FileUploadField 
                    label="Брошюра услуги / Бланк ТЗ / Методические указания (PDF, DOCX, ZIP)" 
                    value={servBrochureUrl} 
                    onChange={setServBrochureUrl} 
                    type="document"
                    helperText="Файл будет доступен для скачивания на странице услуги и в калькуляторе"
                  />
                </div>

                <div className="sm:col-span-3">
                  <AutoResizeTextarea
                    label="Краткое описание (в каталоге и карточке)"
                    value={servShortDesc}
                    onChange={(val) => {
                      setServShortDesc(val);
                      if (formValidationErrors.shortDesc) {
                        setFormValidationErrors(prev => {
                          const next = { ...prev };
                          delete next.shortDesc;
                          return next;
                        });
                      }
                    }}
                    minRows={2}
                    placeholder="Высокоточное лазерное и оптическое 3D-сканирование изделий любых габаритов..."
                  />
                  {formValidationErrors.shortDesc && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formValidationErrors.shortDesc}</span>
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Полное описание услуги (детальная страница)</label>
                  <div className={`rounded-xl focus-within:ring-2 focus-within:ring-blue-500 ${
                    formValidationErrors.fullDesc ? 'ring-2 ring-red-500' : ''
                  }`}>
                    <RichTextEditor
                      content={servFullDesc}
                      onChange={(val) => {
                        setServFullDesc(val);
                        if (formValidationErrors.fullDesc) {
                          setFormValidationErrors(prev => {
                            const next = { ...prev };
                            delete next.fullDesc;
                            return next;
                          });
                        }
                      }}
                      minHeight="min-h-[140px]"
                      placeholder="<p>Подробное описание инжиниринговой услуги...</p>"
                    />
                  </div>
                  {formValidationErrors.fullDesc && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formValidationErrors.fullDesc}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 2. REAL EQUIPMENT MANAGEMENT SECTION */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-500" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                        Список оборудования и ПО по услуге ({servEquipmentList.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Только реальные измерительные комплексы и ПО (без вымышленных стационарных КИМ)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Active Equipment Tags */}
                <div className="flex flex-wrap gap-2">
                  {servEquipmentList.map((eq, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-900 text-xs font-semibold rounded-lg shadow-2xs group"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{eq}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipment(idx)}
                        className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer ml-1"
                        title="Удалить прибор"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {servEquipmentList.length === 0 && (
                    <div className="text-xs text-amber-700 flex items-center gap-1.5 py-1">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Оборудование не выбрано. Добавьте приборы из пресетов ниже.</span>
                    </div>
                  )}
                </div>

                {/* Equipment Validation Error */}
                {formValidationErrors.equipmentUsed && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{formValidationErrors.equipmentUsed}</span>
                  </div>
                )}

                {/* Add Custom Equipment Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEquipmentInput}
                    onChange={(e) => setNewEquipmentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEquipment(newEquipmentInput);
                      }
                    }}
                    placeholder="Введите название оборудования или измерительной системы..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddEquipment(newEquipmentInput)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить</span>
                  </button>
                </div>

                {/* Quick Presets of Real Company Equipment */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Быстрое добавление из реального парка «ДС-Инжиниринг»:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {REAL_EQUIPMENT_PRESETS.map((preset, i) => {
                      const isAdded = servEquipmentList.includes(preset);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => isAdded ? handleRemoveEquipment(servEquipmentList.indexOf(preset)) : handleAddEquipment(preset)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                            isAdded
                              ? 'bg-blue-100 text-blue-800 border-blue-300 font-semibold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          <Plus className={`w-3 h-3 ${isAdded ? 'rotate-45 text-blue-600' : 'text-slate-400'}`} />
                          <span>{preset}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. CONTACTS & SPECIALISTS MANAGEMENT SECTION */}
              <div className="bg-blue-50/40 p-5 rounded-xl border border-blue-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                        Контакты и ответственные специалисты по услуге ({servContacts.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Фактические контакты инженеров для прямой связи заказчика
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddContactForm(!showAddContactForm)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{showAddContactForm ? 'Скрыть форму' : 'Добавить контакт'}</span>
                  </button>
                </div>

                {/* Responsible Person Field & SLA */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Ведущий ответственный специалист (в заголовке)
                    </label>
                    <input
                      type="text"
                      value={servResponsiblePerson}
                      onChange={(e) => setServResponsiblePerson(e.target.value)}
                      placeholder="Ярыш Иван Владимирович (Инженер-метролог)"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Регламентный SLA ответа и выезда
                    </label>
                    <input
                      type="text"
                      value={servSlaResponseTime}
                      onChange={(e) => setServSlaResponseTime(e.target.value)}
                      placeholder="Ответ за 15 минут, выезд за 24–48 ч"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      География оказания услуги
                    </label>
                    <input
                      type="text"
                      value={servWorkLocationNote}
                      onChange={(e) => setServWorkLocationNote(e.target.value)}
                      placeholder="Выезд по РФ / офис Самара (ул. Свободы, 198)"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* List of Attached Contacts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {servContacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(idx)}
                        className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Удалить контакт"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="pr-6">
                        <div className="font-bold text-xs text-slate-900">{contact.name}</div>
                        <div className="text-[11px] text-blue-700 font-medium">{contact.role}</div>
                      </div>

                      <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                        {contact.phone && (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                            <a href={`tel:${contact.phone}`} className="hover:underline font-semibold">
                              {contact.phone}
                            </a>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <a href={`mailto:${contact.email}`} className="hover:underline">
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.location && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{contact.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {servContacts.length === 0 && (
                    <div className="sm:col-span-2 text-xs text-amber-700 py-2">
                      Контакты специалистов не назначены. Выберите специалиста из пресетов ниже.
                    </div>
                  )}
                </div>

                {/* Form to Add Custom Contact */}
                {showAddContactForm && (
                  <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-xs space-y-3">
                    <span className="font-bold text-slate-900 text-xs">Добавление нового контакта</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 mb-0.5">ФИО инженера *</label>
                        <input
                          type="text"
                          value={newContactName}
                          onChange={(e) => setNewContactName(e.target.value)}
                          placeholder="Иванов Петр Сергеевич"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">Должность / Специализация *</label>
                        <input
                          type="text"
                          value={newContactRole}
                          onChange={(e) => setNewContactRole(e.target.value)}
                          placeholder="Ведущий метролог"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">Телефон *</label>
                        <input
                          type="text"
                          value={newContactPhone}
                          onChange={(e) => setNewContactPhone(e.target.value)}
                          placeholder="+7 (927) 000-00-00"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">Email</label>
                        <input
                          type="email"
                          value={newContactEmail}
                          onChange={(e) => setNewContactEmail(e.target.value)}
                          placeholder="engineer@ds-enginering.ru"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 mb-0.5">Локация / Базирование</label>
                        <input
                          type="text"
                          value={newContactLocation}
                          onChange={(e) => setNewContactLocation(e.target.value)}
                          placeholder="Самара (ул. Свободы, 198) / Выезд по РФ"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">Ссылка Telegram (URL)</label>
                        <input
                          type="url"
                          value={newContactTelegram}
                          onChange={(e) => setNewContactTelegram(e.target.value)}
                          placeholder="https://t.me/ds_engineering"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">Веб-сайт / Профиль (URL)</label>
                        <input
                          type="url"
                          value={newContactUrl}
                          onChange={(e) => setNewContactUrl(e.target.value)}
                          placeholder="https://ds-enginering.ru"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddContactForm(false)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateCustomContact}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Сохранить контакт
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Presets of Real Company Personnel */}
                <div className="pt-2 border-t border-blue-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Штатные специалисты «ДС-Инжиниринг» (кликните для добавления):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {STAFF_CONTACT_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddPresetContact(preset)}
                        className="text-xs px-3 py-1.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold">{preset.name}</span>
                        <span className="text-[10px] text-slate-400">({preset.phone})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Interactive Steps Editor */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                    Этапы выполнения инжиниринговых работ ({servSteps.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить этап</span>
                  </button>
                </div>

                {formValidationErrors.steps && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{formValidationErrors.steps}</span>
                  </div>
                )}

                <div className="space-y-2">
                  {servSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0 mt-1">
                        {step.stepNumber}
                      </span>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            handleStepChange(idx, 'title', e.target.value);
                            if (formValidationErrors.steps) {
                              setFormValidationErrors(prev => {
                                const next = { ...prev };
                                delete next.steps;
                                return next;
                              });
                            }
                          }}
                          placeholder="Название этапа (напр. «3D-сканирование»)"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-semibold"
                        />
                        <input
                          type="text"
                          value={step.desc}
                          onChange={(e) => {
                            handleStepChange(idx, 'desc', e.target.value);
                            if (formValidationErrors.steps) {
                              setFormValidationErrors(prev => {
                                const next = { ...prev };
                                delete next.steps;
                                return next;
                              });
                            }
                          }}
                          placeholder="Краткое описание действий инженера"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Удалить этап"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Deliverables */}
              <div>
                <AutoResizeTextarea
                  label="Преимущества и результат работ для заказчика (по 1 в строке)"
                  value={servBenefits}
                  onChange={(val) => {
                    setServBenefits(val);
                    if (formValidationErrors.deliverables) {
                      setFormValidationErrors(prev => {
                        const next = { ...prev };
                        delete next.deliverables;
                        return next;
                      });
                    }
                  }}
                  minRows={3}
                  placeholder="CAD-модель (STEP / IGES / Parasolid)&#10;Официальный протокол измерений (PDF / Excel)&#10;Карта цветовых отклонений геометрии GD&T&#10;Выезд с мобильным сканером по всей РФ"
                />
                {formValidationErrors.deliverables && (
                  <p className="text-[11px] text-red-600 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formValidationErrors.deliverables}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaveBlocked}
                  title={isSaveBlocked ? 'Заполните обязательные поля без ошибок' : 'Сохранить услугу'}
                  className={`px-6 py-2.5 font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all ${
                    isSaveBlocked
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                      : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{editingServiceId ? 'Сохранить изменения услуги' : 'Добавить услугу в реестр'}</span>
                  {isSaveBlocked && <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                </button>
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={handleResetServiceForm}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                  >
                    Отмена
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Service Visual Live Preview (shown in 'split' and 'preview' modes) */}
          {(servicesViewMode === 'split' || servicesViewMode === 'preview') && (
            <div className="w-full">
              <ServiceVisualPreview 
                service={currentServicePreview} 
                viewMode={servicesViewMode} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
