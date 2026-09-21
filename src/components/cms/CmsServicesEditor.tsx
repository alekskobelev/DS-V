import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Eye, 
  FileText, 
  Wrench, 
  Search, 
  Columns 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceItem } from '../../types';
import { FileUploadField } from '../common/FileUploadField';
import { AutoResizeTextarea } from '../common/AutoResizeTextarea';
import { RichTextEditor } from './RichTextEditor';
import { ServiceVisualPreview } from './ServiceVisualPreview';

export const CmsServicesEditor: React.FC = () => {
  const { services, updateService, deleteService, showToast, navigateTo } = useApp();

  const [servicesViewMode, setServicesViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [servTitle, setServTitle] = useState('');
  const [servCategory, setServCategory] = useState('Метрология');
  const [servImage, setServImage] = useState('');
  const [servBrochureUrl, setServBrochureUrl] = useState('');
  const [servShortDesc, setServShortDesc] = useState('');
  const [servFullDesc, setServFullDesc] = useState('');
  const [servBasePriceText, setServBasePriceText] = useState('от 25 000 ₽');
  const [servBasePriceNum, setServBasePriceNum] = useState<number>(25000);
  const [servCalculatorType, setServCalculatorType] = useState<ServiceItem['calculatorType']>('scanning');
  const [servBenefits, setServBenefits] = useState('');
  const [servEquipmentUsed, setServEquipmentUsed] = useState('PMT Arm, TopSolid 7 Inspection, FreeScan Combo');
  const [servSteps, setServSteps] = useState<{ stepNumber: number; title: string; desc: string }[]>([
    { stepNumber: 1, title: 'Анализ ТЗ', desc: 'Изучение требований и чертежей заказчика' },
    { stepNumber: 2, title: 'Выполнение работ', desc: 'Сканирование или измерения на объекте' },
    { stepNumber: 3, title: 'Сдача отчета', desc: 'Формирование протокола и передача 3D моделей' }
  ]);

  const handleResetServiceForm = () => {
    setEditingServiceId(null);
    setServTitle('');
    setServShortDesc('');
    setServImage('');
    setServBrochureUrl('');
    setServFullDesc('');
    setServBenefits('');
    setServBasePriceText('от 25 000 ₽');
    setServBasePriceNum(25000);
    setServCalculatorType('scanning');
    setServEquipmentUsed('PMT Arm, TopSolid 7 Inspection, FreeScan Combo');
    setServSteps([
      { stepNumber: 1, title: 'Анализ ТЗ', desc: 'Изучение требований и чертежей заказчика' },
      { stepNumber: 2, title: 'Выполнение работ', desc: 'Сканирование или измерения на объекте' },
      { stepNumber: 3, title: 'Сдача отчета', desc: 'Формирование протокола и передача 3D моделей' }
    ]);
  };

  const handleStartEditService = (serv: ServiceItem) => {
    setEditingServiceId(serv.id);
    setServTitle(serv.title);
    setServCategory(serv.category || 'Метрология');
    setServShortDesc(serv.shortDesc || '');
    setServFullDesc(serv.fullDesc || serv.shortDesc || '');
    setServImage(serv.image || '');
    setServBrochureUrl(serv.brochureUrl || serv.fileUrl || '');
    setServBasePriceText(serv.basePriceText || 'от 25 000 ₽');
    setServCalculatorType(serv.calculatorType || 'scanning');
    setServBenefits(serv.deliverables ? serv.deliverables.join('\n') : '');
    setServEquipmentUsed(serv.equipmentUsed ? serv.equipmentUsed.join(', ') : 'PMT Arm, TopSolid 7 Inspection');
    setServSteps(serv.steps && serv.steps.length > 0 ? serv.steps : [
      { stepNumber: 1, title: 'Анализ ТЗ', desc: 'Изучение требований и чертежей заказчика' },
      { stepNumber: 2, title: 'Выполнение работ', desc: 'Сканирование или измерения на объекте' },
      { stepNumber: 3, title: 'Сдача отчета', desc: 'Формирование протокола и передача 3D моделей' }
    ]);
    showToast(`Редактирование услуги: «${serv.title}»`);
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

  const handleDeleteService = (id: string, title: string) => {
    if (window.confirm(`Удалить инжиниринговую услугу «${title}»?`)) {
      if (deleteService) {
        deleteService(id);
      }
      if (editingServiceId === id) {
        handleResetServiceForm();
      }
      showToast(`Услуга «${title}» удалена`);
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servTitle.trim()) {
      showToast('Укажите наименование услуги');
      return;
    }
    const cleanId = servTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existing = services.find((s) => s.id === editingServiceId);

    const equipArray = servEquipmentUsed.split(',').map(e => e.trim()).filter(Boolean);

    const servObj: ServiceItem = {
      id: editingServiceId || `serv-${cleanId}-${Date.now()}`,
      title: servTitle,
      category: servCategory,
      shortDesc: servShortDesc || 'Комплексная инжиниринговая услуга.',
      fullDesc: servFullDesc || servShortDesc || 'Выполняется ведущими инженерами-метрологами «ДС‑Инжиниринг».',
      iconName: existing?.iconName || 'Wrench',
      calculatorType: servCalculatorType,
      basePriceText: servBasePriceText || `от ${servBasePriceNum.toLocaleString('ru-RU')} ₽`,
      steps: servSteps.length > 0 ? servSteps : [
        { stepNumber: 1, title: 'Анализ ТЗ', desc: 'Изучение требований и чертежей заказчика' },
        { stepNumber: 2, title: 'Выполнение работ', desc: 'Сканирование или измерения на объекте' },
        { stepNumber: 3, title: 'Сдача отчета', desc: 'Формирование протокола и передача 3D моделей' }
      ],
      equipmentUsed: equipArray.length > 0 ? equipArray : ['PMT Arm', 'TopSolid 7 Inspection'],
      deliverables: servBenefits ? servBenefits.split('\n').filter(Boolean) : ['CAD-модель (STEP / IGES)', 'Протокол измерений (PDF / Excel)', 'Карта цветовых отклонений'],
      image: servImage.trim() || existing?.image || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      brochureUrl: servBrochureUrl.trim() || undefined,
      fileUrl: servBrochureUrl.trim() || undefined,
    };

    updateService(servObj.id, servObj);
    showToast(`Услуга «${servTitle}» успешно сохранена!`);
    handleResetServiceForm();
  };

  const activeService = services.find((s) => s.id === editingServiceId) || services[0];
  const currentServicePreview = {
    id: editingServiceId || activeService?.id || 'sample-serv',
    title: servTitle || activeService?.title || '3D-сканирование крупногабаритных деталей',
    category: servCategory || 'Метрологический контроль',
    shortDesc: servShortDesc || activeService?.shortDesc || 'Высокоточное лазерное и оптическое 3D-сканирование промышленного оборудования с выездом экспертов.',
    fullDesc: servFullDesc || activeService?.fullDesc || activeService?.shortDesc || '',
    image: servImage || activeService?.image || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    basePriceText: servBasePriceText || activeService?.basePriceText || 'от 25 000 ₽',
    deliverables: servBenefits ? servBenefits.split('\n').filter(Boolean) : (activeService?.deliverables || ['CAD-модель (STEP / IGES)', 'Протокол измерений (PDF / Excel)', 'Карта цветовых отклонений']),
    equipmentUsed: servEquipmentUsed ? servEquipmentUsed.split(',').map(e => e.trim()).filter(Boolean) : (activeService?.equipmentUsed || ['PMT Arm', 'TopSolid 7 Inspection']),
    calculatorType: servCalculatorType || activeService?.calculatorType || 'scanning',
    steps: servSteps,
    brochureUrl: servBrochureUrl || activeService?.brochureUrl,
    fileUrl: servBrochureUrl || activeService?.fileUrl
  };

  const filteredServices = services.filter((s) => 
    !serviceSearchQuery || 
    s.title.toLowerCase().includes(serviceSearchQuery.toLowerCase()) || 
    (s.shortDesc && s.shortDesc.toLowerCase().includes(serviceSearchQuery.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Left Column (4 cols): List of all services with search */}
      <div className="xl:col-span-4 space-y-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                Услуги и инжиниринг
              </h3>
              <p className="text-[11px] text-gray-500">
                {services.length} активных направлений
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetServiceForm}
              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить</span>
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
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredServices.map((serv) => (
              <div
                key={serv.id}
                className={`p-3 rounded-xl border transition-all ${
                  editingServiceId === serv.id
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">
                        {serv.category || 'Инжиниринг'}
                      </span>
                      <span className="text-[10px] bg-blue-50 px-1.5 py-0.2 rounded text-blue-700 font-semibold">
                        {serv.basePriceText}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-xs truncate">
                      {serv.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                      {serv.shortDesc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => navigateTo('services', serv.id)}
                      title="Открыть в калькуляторе"
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEditService(serv)}
                      title="Редактировать в CMS"
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-amber-600" />
                      <span>Ред.</span>
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
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                servicesViewMode === 'split' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Сплит: Редактор + Live-превью</span>
            </button>
            <button
              type="button"
              onClick={() => setServicesViewMode('editor')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                servicesViewMode === 'editor' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Только редактор</span>
            </button>
            <button
              type="button"
              onClick={() => setServicesViewMode('preview')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                servicesViewMode === 'preview' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Визуальный предпросмотр</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {editingServiceId && (
              <button
                type="button"
                onClick={handleResetServiceForm}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-gray-100 rounded-lg font-medium cursor-pointer"
              >
                Сбросить
              </button>
            )}
            <button
              type="button"
              onClick={(e) => handleSaveService(e as any)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Сохранить услугу</span>
            </button>
          </div>
        </div>

        {/* Form Editor (shown in 'split' and 'editor' modes) */}
        {(servicesViewMode === 'split' || servicesViewMode === 'editor') && (
          <form onSubmit={handleSaveService} className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>{editingServiceId ? `Редактирование: «${servTitle}»` : 'Создание новой услуги'}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Настройте формулировки, базовую ставку для калькулятора и материалы
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Наименование услуги <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={servTitle}
                  onChange={(e) => setServTitle(e.target.value)}
                  placeholder="Например: 3D-сканирование крупногабаритных деталей"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Категория</label>
                <input
                  type="text"
                  value={servCategory}
                  onChange={(e) => setServCategory(e.target.value)}
                  placeholder="Метрология / Реверс-инжиниринг"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Тип калькулятора (алгоритм расчета)</label>
                <select
                  value={servCalculatorType}
                  onChange={(e) => setServCalculatorType(e.target.value as any)}
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
                <label className="block font-semibold text-slate-500 mb-1">Базовая цена (число для калькулятора, ₽)</label>
                <input
                  type="number"
                  value={servBasePriceNum}
                  onChange={(e) => setServBasePriceNum(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <FileUploadField 
                  label="Изображение услуги" 
                  value={servImage} 
                  onChange={setServImage} 
                  type="image"
                  placeholder="https://... или /images/services/my-service.jpg" 
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Текст стоимости (для карточки)</label>
                <input
                  type="text"
                  value={servBasePriceText}
                  onChange={(e) => setServBasePriceText(e.target.value)}
                  placeholder="от 25 000 ₽"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-500 mb-1">Используемое оборудование (через запятую)</label>
                <input
                  type="text"
                  value={servEquipmentUsed}
                  onChange={(e) => setServEquipmentUsed(e.target.value)}
                  placeholder="PMT Arm, TopSolid 7 Inspection, FreeScan Combo, Geomagic Control X"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
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
                  label="Краткое описание (в карточке)"
                  value={servShortDesc}
                  onChange={setServShortDesc}
                  minRows={2}
                  placeholder="Высокоточное оптическое сканирование на объекте заказчика..."
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-500 mb-1">Полное описание (на странице услуги)</label>
                <div className="rounded-xl focus-within:ring-2 focus-within:ring-blue-500">
                  <RichTextEditor
                    content={servFullDesc}
                    onChange={setServFullDesc}
                    minHeight="min-h-[140px]"
                    placeholder="<p>Подробное описание инжиниринговой услуги...</p>"
                  />
                </div>
              </div>

              {/* Interactive Steps Editor */}
              <div className="sm:col-span-3 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
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
                          onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                          placeholder="Название этапа (напр. «3D-сканирование»)"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-semibold"
                        />
                        <input
                          type="text"
                          value={step.desc}
                          onChange={(e) => handleStepChange(idx, 'desc', e.target.value)}
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

              <div className="sm:col-span-3">
                <AutoResizeTextarea
                  label="Преимущества и результат работ (по 1 в строке)"
                  value={servBenefits}
                  onChange={setServBenefits}
                  minRows={3}
                  placeholder="Выезд с мобильным сканером по всей РФ&#10;Точность до 0.015 мм&#10;Официальный метрологический отчет"
                />
              </div>

              <div className="sm:col-span-3 flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingServiceId ? 'Сохранить изменения услуги' : 'Добавить услугу'}</span>
                </button>
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={handleResetServiceForm}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-500 font-semibold rounded-xl text-xs cursor-pointer"
                  >
                    Отмена
                  </button>
                )}
              </div>
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
  );
};
