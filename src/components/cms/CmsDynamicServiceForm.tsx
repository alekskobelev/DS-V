import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  Wrench, 
  FileText, 
  Layers, 
  Users, 
  Cpu, 
  Sparkles, 
  Link2, 
  Phone, 
  Mail, 
  MapPin, 
  Info, 
  Clock,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { ServiceItem, ServiceContact, ServiceStep } from '../../types';
import { 
  VALID_CALCULATOR_TYPES, 
  VERIFIED_EQUIPMENT_PARK, 
  COMPANY_SPECIALISTS,
  validateServiceItem
} from '../../data/services';
import { useServiceFormValidation } from '../../hooks/useServiceFormValidation';
import { AutoResizeTextarea } from '../common/AutoResizeTextarea';
import { FileUploadField } from '../common/FileUploadField';

interface CmsDynamicServiceFormProps {
  initialService?: Partial<ServiceItem> | null;
  onSave: (service: ServiceItem) => void;
  onCancel?: () => void;
  className?: string;
}

const DEFAULT_SERVICE_TEMPLATE: ServiceItem = {
  id: '',
  title: '',
  category: '3D-сканирование и оцифровка',
  shortDesc: '',
  fullDesc: '',
  iconName: 'Scan',
  image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  calculatorType: 'scanning',
  basePriceText: 'от 15 000 ₽ / деталь',
  equipmentUsed: [
    'Оптический гибридный 3D-сканер ScanLine EasyScan Omni (Госреестр СИ ФГИС «АРШИН»)',
    'Метрологическое программное обеспечение PolyWorks|Inspector™ (контроль геометрии, GD&T)'
  ],
  deliverables: [
    'Высокоточная полигональная 3D-сетка (STL / OBJ / PLY)',
    'Официальный протокол размерного контроля и карта отклонений GD&T'
  ],
  steps: [
    { stepNumber: 1, title: 'Анализ ТЗ и детали', desc: 'Изучение требований, чертежей и допусков точности' },
    { stepNumber: 2, title: 'Сканирование и измерения', desc: 'Выполнение лазерного или контактного сканирования' },
    { stepNumber: 3, title: 'Выпуск отчета и CAD-модели', desc: 'Обработка данных, оформление протокола и передача заказчику' }
  ],
  contacts: [
    COMPANY_SPECIALISTS.yarish
  ],
  responsiblePerson: 'Ярыш Иван Владимирович (Инженер-метролог)',
  slaResponseTime: 'Ответ на заявку за 15 минут, выезд за 24–48 ч',
  workLocationNote: 'Выезд инженера по всей РФ или проведение измерений в лаборатории в Самаре / Тольятти'
};

export const CmsDynamicServiceForm: React.FC<CmsDynamicServiceFormProps> = ({
  initialService,
  onSave,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState<ServiceItem>(() => {
    if (initialService) {
      return {
        ...DEFAULT_SERVICE_TEMPLATE,
        ...initialService,
        id: initialService.id || `service-${Date.now()}`,
        equipmentUsed: initialService.equipmentUsed || (initialService as any).equipment || DEFAULT_SERVICE_TEMPLATE.equipmentUsed,
        deliverables: initialService.deliverables || DEFAULT_SERVICE_TEMPLATE.deliverables,
        steps: initialService.steps || DEFAULT_SERVICE_TEMPLATE.steps,
        contacts: initialService.contacts || DEFAULT_SERVICE_TEMPLATE.contacts
      };
    }
    return {
      ...DEFAULT_SERVICE_TEMPLATE,
      id: `service-${Date.now()}`
    };
  });

  // Active section tab
  const [activeSection, setActiveSection] = useState<'main' | 'equipment' | 'deliverables' | 'steps' | 'contacts' | 'media'>('main');

  // New Equipment state
  const [selectedPresetEquipment, setSelectedPresetEquipment] = useState<string>('');
  const [customEquipmentInput, setCustomEquipmentInput] = useState<string>('');

  // New Deliverable state
  const [newDeliverableInput, setNewDeliverableInput] = useState<string>('');

  // New Step state
  const [newStepTitle, setNewStepTitle] = useState<string>('');
  const [newStepDesc, setNewStepDesc] = useState<string>('');

  // New Contact state
  const [selectedPresetContactKey, setSelectedPresetContactKey] = useState<string>('');
  const [customContactName, setCustomContactName] = useState<string>('');
  const [customContactRole, setCustomContactRole] = useState<string>('');
  const [customContactPhone, setCustomContactPhone] = useState<string>('');
  const [customContactEmail, setCustomContactEmail] = useState<string>('');
  const [customContactLocation, setCustomContactLocation] = useState<string>('Самара (ул. Свободы, 198)');
  const [customContactUrl, setCustomContactUrl] = useState<string>('');
  const [showAddContactForm, setShowAddContactForm] = useState<boolean>(false);

  // Real-time Form Validation Hook
  const {
    isValid,
    isSaveDisabled,
    errors,
    errorMap,
    getFieldValidation,
    getEquipmentValidation,
    errorCount,
    touchAllFields
  } = useServiceFormValidation(formData, { liveValidation: true });

  // Update field handler
  const handleFieldChange = (field: keyof ServiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // --- Equipment Actions ---
  const handleAddPresetEquipment = () => {
    if (!selectedPresetEquipment) return;
    if (formData.equipmentUsed.includes(selectedPresetEquipment)) return;
    handleFieldChange('equipmentUsed', [...formData.equipmentUsed, selectedPresetEquipment]);
    setSelectedPresetEquipment('');
  };

  const handleAddCustomEquipment = () => {
    const trimmed = customEquipmentInput.trim();
    if (!trimmed) return;
    handleFieldChange('equipmentUsed', [...formData.equipmentUsed, trimmed]);
    setCustomEquipmentInput('');
  };

  const handleRemoveEquipment = (index: number) => {
    handleFieldChange('equipmentUsed', formData.equipmentUsed.filter((_, i) => i !== index));
  };

  const handleMoveEquipment = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= formData.equipmentUsed.length) return;
    const updated = [...formData.equipmentUsed];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    handleFieldChange('equipmentUsed', updated);
  };

  // --- Deliverables Actions ---
  const handleAddDeliverable = () => {
    const trimmed = newDeliverableInput.trim();
    if (!trimmed) return;
    handleFieldChange('deliverables', [...formData.deliverables, trimmed]);
    setNewDeliverableInput('');
  };

  const handleRemoveDeliverable = (index: number) => {
    handleFieldChange('deliverables', formData.deliverables.filter((_, i) => i !== index));
  };

  const handleMoveDeliverable = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= formData.deliverables.length) return;
    const updated = [...formData.deliverables];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    handleFieldChange('deliverables', updated);
  };

  // --- Steps Actions ---
  const handleAddStep = () => {
    if (!newStepTitle.trim() || !newStepDesc.trim()) return;
    const newStep: ServiceStep = {
      stepNumber: formData.steps.length + 1,
      title: newStepTitle.trim(),
      desc: newStepDesc.trim()
    };
    handleFieldChange('steps', [...formData.steps, newStep]);
    setNewStepTitle('');
    setNewStepDesc('');
  };

  const handleRemoveStep = (index: number) => {
    const updated = formData.steps.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      stepNumber: idx + 1
    }));
    handleFieldChange('steps', updated);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= formData.steps.length) return;
    const updated = [...formData.steps];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    const renumbered = updated.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    handleFieldChange('steps', renumbered);
  };

  // --- Contacts Actions ---
  const handleAddPresetContact = () => {
    if (!selectedPresetContactKey) return;
    const specialist = COMPANY_SPECIALISTS[selectedPresetContactKey];
    if (!specialist) return;
    const currentContacts = formData.contacts || [];
    if (currentContacts.some(c => c.email === specialist.email)) return;
    handleFieldChange('contacts', [...currentContacts, specialist]);
    setSelectedPresetContactKey('');
  };

  const handleAddCustomContact = () => {
    if (!customContactName.trim() || !customContactPhone.trim()) return;
    const newContact: ServiceContact = {
      id: `c-custom-${Date.now()}`,
      name: customContactName.trim(),
      role: customContactRole.trim() || 'Инженер-специалист',
      phone: customContactPhone.trim(),
      email: customContactEmail.trim() || 'info@ds-enginering.ru',
      location: customContactLocation.trim() || 'Самара (ул. Свободы, 198)',
      url: customContactUrl.trim() || undefined
    };
    const currentContacts = formData.contacts || [];
    handleFieldChange('contacts', [...currentContacts, newContact]);
    setCustomContactName('');
    setCustomContactRole('');
    setCustomContactPhone('');
    setCustomContactEmail('');
    setCustomContactUrl('');
    setShowAddContactForm(false);
  };

  const handleRemoveContact = (index: number) => {
    const currentContacts = formData.contacts || [];
    handleFieldChange('contacts', currentContacts.filter((_, i) => i !== index));
  };

  // Submit handler with full audit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    touchAllFields();
    if (!isValid) {
      return;
    }
    onSave(formData);
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
      {/* Header with Title and Real-time Validation Badge */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {formData.title ? `Редактирование: ${formData.title}` : 'Создание инжиниринговой услуги'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Динамическая форма с поэлементной валидацией ServiceItem перед сохранением
            </p>
          </div>
        </div>

        {/* Live Validation Indicator */}
        <div className="flex items-center gap-2">
          {isValid ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-300 dark:border-emerald-700 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Данные валидны (0 ошибок)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-lg border border-rose-300 dark:border-rose-700 shadow-2xs animate-pulse">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Ошибок валидации: {errorCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Validation Error Banner (Shows summary of all errors if invalid) */}
      {!isValid && errors.length > 0 && (
        <div className="bg-rose-50/90 dark:bg-rose-950/50 border-b border-rose-200 dark:border-rose-800/80 p-3 sm:p-4 text-xs">
          <div className="flex items-start gap-2 text-rose-800 dark:text-rose-200 font-semibold mb-1">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>Кнопка сохранения заблокирована. Исправьте следующие ошибки:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-6 text-[11px] text-rose-700 dark:text-rose-300">
            {errors.map((err, i) => (
              <li key={i}>
                <strong className="font-mono">{err.field}:</strong> {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/30 overflow-x-auto no-scrollbar">
        {[
          { id: 'main', label: '1. Основное & Цены', icon: FileText, errorFields: ['title', 'category', 'shortDesc', 'fullDesc', 'calculatorType', 'basePriceText'] },
          { id: 'equipment', label: `2. Оборудование (${formData.equipmentUsed?.length || 0})`, icon: Wrench, errorFields: ['equipmentUsed', 'equipment'] },
          { id: 'deliverables', label: `3. Результаты (${formData.deliverables?.length || 0})`, icon: Sparkles, errorFields: ['deliverables'] },
          { id: 'steps', label: `4. Этапы (${formData.steps?.length || 0})`, icon: Layers, errorFields: ['steps'] },
          { id: 'contacts', label: `5. Специалисты (${formData.contacts?.length || 0})`, icon: Users, errorFields: ['contacts', 'contactLink'] },
          { id: 'media', label: '6. Медиа & Ссылки', icon: Link2, errorFields: ['image', 'brochureUrl', 'fileUrl'] },
        ].map((tab) => {
          const Icon = tab.icon;
          const hasSectionError = tab.errorFields.some(f => !!errorMap[f]);
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {hasSectionError && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="В этом разделе есть ошибки" />
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        {/* SECTION 1: MAIN INFO & PRICING */}
        {activeSection === 'main' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Title */}
            <div>
              <label className={`block text-xs font-bold mb-1 ${getFieldValidation('title').labelClassName}`}>
                Наименование инжиниринговой услуги <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="например, Прецизионное 3D-сканирование и контроль геометрии деталей"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-colors ${getFieldValidation('title').errorClassName}`}
              />
              {getFieldValidation('title').errorMessage && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{getFieldValidation('title').errorMessage}</span>
                </p>
              )}
            </div>

            {/* Category & Calculator Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${getFieldValidation('category').labelClassName}`}>
                  Категория услуги <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.category || ''}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  placeholder="3D-сканирование, Реверс-инжиниринг, ЧПУ..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-colors ${getFieldValidation('category').errorClassName}`}
                />
                {getFieldValidation('category').errorMessage && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{getFieldValidation('category').errorMessage}</span>
                  </p>
                )}
              </div>

              {/* Calculator Type Enum */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${getFieldValidation('calculatorType').labelClassName}`}>
                  Тип онлайн-калькулятора <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.calculatorType}
                  onChange={(e) => handleFieldChange('calculatorType', e.target.value as ServiceItem['calculatorType'])}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-colors ${getFieldValidation('calculatorType').errorClassName}`}
                >
                  {VALID_CALCULATOR_TYPES.map((calcType) => (
                    <option key={calcType} value={calcType}>
                      {calcType}
                    </option>
                  ))}
                </select>
                {getFieldValidation('calculatorType').errorMessage && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{getFieldValidation('calculatorType').errorMessage}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Pricing Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${getFieldValidation('basePriceText').labelClassName}`}>
                  Базовая стоимость (текст для карточки) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.basePriceText}
                  onChange={(e) => handleFieldChange('basePriceText', e.target.value)}
                  placeholder="от 15 000 ₽ / деталь"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-colors ${getFieldValidation('basePriceText').errorClassName}`}
                />
                {getFieldValidation('basePriceText').errorMessage && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{getFieldValidation('basePriceText').errorMessage}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  SLA / Время ответа инженера
                </label>
                <input
                  type="text"
                  value={formData.slaResponseTime || ''}
                  onChange={(e) => handleFieldChange('slaResponseTime', e.target.value)}
                  placeholder="Ответ за 15 минут, выезд за 24–48 ч"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className={`block text-xs font-bold mb-1 ${getFieldValidation('shortDesc').labelClassName}`}>
                Краткое описание (для каталога и сниппетов) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.shortDesc}
                onChange={(e) => handleFieldChange('shortDesc', e.target.value)}
                placeholder="Краткая суть услуги (минимум 10 символов)..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-colors ${getFieldValidation('shortDesc').errorClassName}`}
              />
              {getFieldValidation('shortDesc').errorMessage && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{getFieldValidation('shortDesc').errorMessage}</span>
                </p>
              )}
            </div>

            {/* Full Description */}
            <div>
              <label className={`block text-xs font-bold mb-1 ${getFieldValidation('fullDesc').labelClassName}`}>
                Подробное описание услуги <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.fullDesc}
                onChange={(e) => handleFieldChange('fullDesc', e.target.value)}
                placeholder="Полное технологическое описание, стандарты ГОСТ, методики контроля (минимум 20 символов)..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-colors ${getFieldValidation('fullDesc').errorClassName}`}
              />
              {getFieldValidation('fullDesc').errorMessage && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{getFieldValidation('fullDesc').errorMessage}</span>
                </p>
              )}
            </div>

            {/* Location Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Локация проведения работ
              </label>
              <input
                type="text"
                value={formData.workLocationNote || ''}
                onChange={(e) => handleFieldChange('workLocationNote', e.target.value)}
                placeholder="Самара (ул. Свободы, 198) / Тольятти (Жигулевская долина, Южное шоссе, 165) / Выезд по РФ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* SECTION 2: EQUIPMENT ARRAY MANAGER (Array<string>) */}
        {activeSection === 'equipment' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className={`text-sm font-bold ${getFieldValidation('equipmentUsed').labelClassName}`}>
                  Парк измерительного оборудования и ПО услуги <span className="text-rose-500">*</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Строго типизированный массив строк (`Array&lt;string&gt;`). Запрещены вымышленные демо-центры.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                Приборов: {formData.equipmentUsed?.length || 0}
              </span>
            </div>

            {/* Add Equipment Toolbar */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Добавить прибор из верифицированного парка:
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedPresetEquipment}
                  onChange={(e) => setSelectedPresetEquipment(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Выберите прибор из реестра СИ «ДС-Инжиниринг» --</option>
                  {VERIFIED_EQUIPMENT_PARK.map((eq, i) => (
                    <option key={i} value={eq} disabled={formData.equipmentUsed?.includes(eq)}>
                      {eq} {formData.equipmentUsed?.includes(eq) ? '(уже добавлен)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddPresetEquipment}
                  disabled={!selectedPresetEquipment}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить из реестра</span>
                </button>
              </div>

              {/* Custom Input */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customEquipmentInput}
                  onChange={(e) => setCustomEquipmentInput(e.target.value)}
                  placeholder="Или введите модель оборудования вручную (напр. Лазерный трекер Leica AT403)..."
                  className="flex-1 px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddCustomEquipment}
                  disabled={!customEquipmentInput.trim()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить вручную</span>
                </button>
              </div>
            </div>

            {/* Equipment Items List */}
            {formData.equipmentUsed && formData.equipmentUsed.length > 0 ? (
              <div className="space-y-2">
                {formData.equipmentUsed.map((item, idx) => {
                  const itemValidation = getEquipmentValidation(item);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        !itemValidation.isValid
                          ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-400'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 break-words block">
                            {item}
                          </span>
                          {!itemValidation.isValid && (
                            <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{itemValidation.errors.join('; ')}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleMoveEquipment(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-400 transition-colors"
                          title="Поднять выше"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveEquipment(idx, 'down')}
                          disabled={idx === formData.equipmentUsed.length - 1}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-400 transition-colors"
                          title="Опустить ниже"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipment(idx)}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Удалить прибор"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl border border-dashed border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-rose-500" />
                <span>Список оборудования пуст. Добавьте хотя бы один прибор или ПО.</span>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: DELIVERABLES ARRAY MANAGER */}
        {activeSection === 'deliverables' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className={`text-sm font-bold ${getFieldValidation('deliverables').labelClassName}`}>
                  Перечень результатов для заказчика (deliverables) <span className="text-rose-500">*</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Что передается заказчику: твердотельные STEP, чертежи ЕСКД, протоколы GD&T, G-коды
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                Пунктов: {formData.deliverables?.length || 0}
              </span>
            </div>

            {/* Add Deliverable Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newDeliverableInput}
                onChange={(e) => setNewDeliverableInput(e.target.value)}
                placeholder="Добавить результат (напр. Параметрическая CAD-модель в формате STEP AP242)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                disabled={!newDeliverableInput.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить</span>
              </button>
            </div>

            {/* Deliverables List */}
            {formData.deliverables && formData.deliverables.length > 0 ? (
              <div className="space-y-2">
                {formData.deliverables.map((deliv, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs text-slate-800 dark:text-slate-200 break-words">
                        {deliv}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveDeliverable(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-400 transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDeliverable(idx, 'down')}
                        disabled={idx === formData.deliverables.length - 1}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-400 transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl border border-dashed border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-rose-500" />
                <span>Список результатов пуст. Добавьте хотя бы один передаваемый артефакт.</span>
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: STEPS ARRAY MANAGER */}
        {activeSection === 'steps' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className={`text-sm font-bold ${getFieldValidation('steps').labelClassName}`}>
                  Этапы выполнения инжиниринговых работ <span className="text-rose-500">*</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Пошаговый регламент реализации проекта для заказчика
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                Этапов: {formData.steps?.length || 0}
              </span>
            </div>

            {/* Add Step Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Добавить новый этап:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder="Название этапа (напр. Лазерный замер)..."
                  className="sm:col-span-1 px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
                <input
                  type="text"
                  value={newStepDesc}
                  onChange={(e) => setNewStepDesc(e.target.value)}
                  placeholder="Описание работ на этапе..."
                  className="sm:col-span-2 px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                disabled={!newStepTitle.trim() || !newStepDesc.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить этап</span>
              </button>
            </div>

            {/* Steps List */}
            {formData.steps && formData.steps.length > 0 ? (
              <div className="space-y-2">
                {formData.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {step.stepNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {step.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {step.desc}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleMoveStep(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-400 transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStep(idx, 'down')}
                        disabled={idx === formData.steps.length - 1}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-400 transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl border border-dashed border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-rose-500" />
                <span>Список этапов пуст. Укажите минимум 1 этап проекта.</span>
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: CONTACTS & SPECIALISTS */}
        {activeSection === 'contacts' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ответственные сертифицированные специалисты услуги
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Штатные инженеры «ДС-Инжиниринг» с валидацией телефонных номеров, email и ссылок
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                Контактов: {formData.contacts?.length || 0}
              </span>
            </div>

            {/* Add Specialist Preset Toolbar */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Привязать штатного инженера:
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedPresetContactKey}
                  onChange={(e) => setSelectedPresetContactKey(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Выберите инженера из штатного расписания --</option>
                  {Object.entries(COMPANY_SPECIALISTS).map(([key, sp]) => (
                    <option key={key} value={key} disabled={formData.contacts?.some(c => c.email === sp.email)}>
                      {sp.name} — {sp.role}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddPresetContact}
                  disabled={!selectedPresetContactKey}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Привязать</span>
                </button>
              </div>

              {/* Toggle Custom Contact Form */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                {!showAddContactForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddContactForm(true)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить другого сотрудника вручную</span>
                  </button>
                ) : (
                  <div className="space-y-3 pt-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Новый контактный специалист:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={customContactName}
                        onChange={(e) => setCustomContactName(e.target.value)}
                        placeholder="ФИО инженера *"
                        className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                      />
                      <input
                        type="text"
                        value={customContactRole}
                        onChange={(e) => setCustomContactRole(e.target.value)}
                        placeholder="Должность / Квалификация"
                        className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                      />
                      <input
                        type="text"
                        value={customContactPhone}
                        onChange={(e) => setCustomContactPhone(e.target.value)}
                        placeholder="Телефон: +7 (XXX) XXX-XX-XX *"
                        className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                      />
                      <input
                        type="email"
                        value={customContactEmail}
                        onChange={(e) => setCustomContactEmail(e.target.value)}
                        placeholder="Email: engineer@ds-enginering.ru"
                        className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddCustomContact}
                        disabled={!customContactName.trim() || !customContactPhone.trim()}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Сохранить в услугу
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddContactForm(false)}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contacts List */}
            {formData.contacts && formData.contacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.contacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{contact.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {contact.role}
                      </div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono flex items-center gap-1 pt-1">
                        <Phone className="w-3 h-3" />
                        <span>{contact.phone}</span>
                      </div>
                      {contact.email && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveContact(idx)}
                      className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                      title="Удалить контакт"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                Контакты специалистов пока не привязаны.
              </div>
            )}
          </div>
        )}

        {/* SECTION 6: MEDIA & EXTERNAL LINKS */}
        {activeSection === 'media' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Медиа-ресурсы, брошюры и файлы услуги
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Валидация форматов URL ссылок на изображения, PDF-буклеты и протоколы
              </p>
            </div>

            {/* Image URL */}
            <div>
              <label className={`block text-xs font-bold mb-1 ${getFieldValidation('image').labelClassName}`}>
                URL заглавного изображения услуги
              </label>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => handleFieldChange('image', e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-colors ${getFieldValidation('image').errorClassName}`}
              />
              {getFieldValidation('image').errorMessage && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{getFieldValidation('image').errorMessage}</span>
                </p>
              )}
            </div>

            {/* Brochure URL */}
            <div>
              <label className={`block text-xs font-bold mb-1 ${getFieldValidation('brochureUrl').labelClassName}`}>
                URL ссылки на брошюру / регламент работ (PDF)
              </label>
              <input
                type="text"
                value={formData.brochureUrl || ''}
                onChange={(e) => handleFieldChange('brochureUrl', e.target.value)}
                placeholder="https://ds-enginering.ru/docs/service-brochure.pdf"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-colors ${getFieldValidation('brochureUrl').errorClassName}`}
              />
              {getFieldValidation('brochureUrl').errorMessage && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{getFieldValidation('brochureUrl').errorMessage}</span>
                </p>
              )}
            </div>

            {/* File URL */}
            <div>
              <label className={`block text-xs font-bold mb-1 ${getFieldValidation('fileUrl').labelClassName}`}>
                URL ссылки на пример отчета / протокола измерений
              </label>
              <input
                type="text"
                value={formData.fileUrl || ''}
                onChange={(e) => handleFieldChange('fileUrl', e.target.value)}
                placeholder="https://ds-enginering.ru/files/sample-inspection-report.pdf"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-colors ${getFieldValidation('fileUrl').errorClassName}`}
              />
              {getFieldValidation('fileUrl').errorMessage && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{getFieldValidation('fileUrl').errorMessage}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions: Save Button (Strictly Disabled when Invalid) + Cancel */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
            {isValid ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Форма готова к сохранению в базу данных
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-4 h-4" />
                Сохранение заблокировано: исправьте {errorCount} {errorCount === 1 ? 'ошибку' : 'ошибок'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Отмена
              </button>
            )}

            <button
              type="submit"
              disabled={isSaveDisabled}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                isSaveDisabled
                  ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700 shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white cursor-pointer shadow-emerald-600/25 hover:shadow-lg'
              }`}
              title={isSaveDisabled ? `Кнопка заблокирована: исправьте ${errorCount} ошибок валидации` : 'Сохранить услугу'}
            >
              <Save className="w-4 h-4" />
              <span>Сохранить услугу</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
