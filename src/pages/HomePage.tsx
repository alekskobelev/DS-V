import React, { useState, useRef } from 'react';
import { Scrollspy } from '../components/common/Scrollspy';
import { 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Layers, 
  Box, 
  Wrench, 
  Scan, 
  Cpu, 
  Activity, 
  Terminal, 
  Send,
  Building2,
  Check,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileSpreadsheet,
  FileCheck2,
  UploadCloud,
  FileText,
  Paperclip,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COMPANY_INFO } from '../data/mockData';
import { DEFAULT_SITE_TEXTS } from '../data/defaultSiteTexts';
import { CasesGallerySection } from '../components/home/CasesGallerySection';
import { ManufacturersLogosSection } from '../components/home/ManufacturersLogosSection';
import { HeroSlider } from '../components/home/HeroSlider';
import { KeyEquipmentCarousel } from '../components/home/KeyEquipmentCarousel';
import { IndustryFocusSelector } from '../components/home/IndustryFocusSelector';
import { QuickRfqSection } from '../components/home/QuickRfqSection';
import { motion } from 'motion/react';
import { useSEO } from '../hooks/useSEO';
import { apiService } from '../services/apiService';

export const HomePage: React.FC = () => {
  const { navigateTo, openContactModal, showToast, customPages, setIsPrivacyModalOpen, siteTexts } = useApp();
  
  const cmsPage = customPages.find(p => p.id === 'home');
  const homeTexts = siteTexts?.home || DEFAULT_SITE_TEXTS.home;
  const contactTexts = siteTexts?.contacts || DEFAULT_SITE_TEXTS.contacts;
    
  useSEO({
    title: cmsPage?.metaTitle || cmsPage?.title || 'Инжиниринговые решения, CAD/CAM/PDM системы и 3D-оборудование',
    description: cmsPage?.metaDescription || cmsPage?.description || 'Комплексные инжиниринговые решения: внедрение CAD/CAM/PDM систем (TopSolid), поставка 3D-сканеров и измерительных машин (PMT, Shining 3D), реверс-инжиниринг и 3D-контроль.',
    keywords: cmsPage?.metaKeywords?.join(', ') || 'ДС‑Инжиниринг, TopSolid 7, CAD CAM PDM системы, 3D сканеры, КИМ, PMT, Shining 3D, реверс-инжиниринг, метрология, автоматизация ЧПУ'
  });

  // Quick Application Form State
  const [quickForm, setQuickForm] = useState({
    name: '',
    phone: '',
    taskType: 'scaning',
    message: '',
    agree: true,
  });
  const [quickFormFiles, setQuickFormFiles] = useState<File[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [quickFormSuccess, setQuickFormSuccess] = useState(false);
  const [quickFormSubmitting, setQuickFormSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const handleQuickPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('8')) val = '7' + val.slice(1);
    if (!val.startsWith('7')) val = '7' + val;

    let formatted = '+7';
    if (val.length > 1) formatted += ' (' + val.substring(1, 4);
    if (val.length >= 4) formatted += ') ' + val.substring(4, 7);
    if (val.length >= 7) formatted += '-' + val.substring(7, 9);
    if (val.length >= 9) formatted += '-' + val.substring(9, 11);

    setQuickForm({ ...quickForm, phone: formatted });
    setPhoneError('');
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const incoming = Array.from(e.dataTransfer.files);
      setQuickFormFiles(prev => [...prev, ...incoming].slice(0, 5));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const incoming = Array.from(e.target.files);
      setQuickFormFiles(prev => [...prev, ...incoming].slice(0, 5));
    }
  };

  const handleRemoveFile = (index: number) => {
    setQuickFormFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitize = (str: string) => str ? str.replace(/[<>]/g, '').trim() : '';
    const safeName = sanitize(quickForm.name);
    const safePhone = sanitize(quickForm.phone);
    const safeMessage = sanitize(quickForm.message);

    if (!safeName || safeName.length < 2) {
      showToast('Пожалуйста, укажите ваше имя (без спецсимволов)');
      return;
    }
    
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (!safePhone || !phoneRegex.test(safePhone)) {
      setPhoneError('Укажите полный номер: +7 (XXX) XXX-XX-XX');
      return;
    }

    if (!quickForm.agree) {
      showToast('Необходимо согласие на обработку персональных данных');
      return;
    }

    setQuickFormSubmitting(true);
    
    try {
      const filesSummary = quickFormFiles.length > 0 
        ? `\nПрикреплено файлов (${quickFormFiles.length}): ${quickFormFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)} Мб)`).join(', ')}` 
        : '';

      const result = await apiService.submitContactForm({
        name: safeName,
        phone: safePhone,
        message: `Экспресс-заявка с главной страницы. Задача: ${safeMessage || 'Не указана'}${filesSummary}`,
        department: 'engineering'
      });
      
      if (result && result.success) {
        setQuickFormSuccess(true);
        setQuickFormFiles([]);
        showToast('Спасибо! Заявка успешно отправлена ведущему инженеру.');
      } else {
        showToast(result?.error || 'Произошла ошибка при отправке заявки.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showToast('Сетевой сбой при отправке. Пожалуйста, позвоните нам.');
    } finally {
      setQuickFormSubmitting(false);
    }
  };

  return (
    <div className="relative w-full min-w-0 space-y-8 sm:space-y-12 pb-24 sm:pb-28">

      <Scrollspy sections={[
        { id: 'section-hero', label: 'Главная' },
        { id: 'section-directions', label: 'Направления' },
        { id: 'section-industries', label: 'Отрасли' },
        { id: 'section-equipment', label: 'Оборудование' },
        { id: 'section-cases', label: 'Проекты' },
        { id: 'section-quick-rfq', label: 'Оценка ТЗ' },
        { id: 'section-brands', label: 'Партнеры' },
        { id: 'section-contact', label: 'Контакты' }
      ]} />

      {/* 1. ЭКРАН 1: ГЛАВНЫЙ ИНЖЕНЕРНЫЙ СЛАЙДЕР С ПОЗИЦИОНИРОВАНИЕМ И МЕТРИКАМИ */}
      <div id="section-hero" className="scroll-mt-20 space-y-4 sm:space-y-6">
        <HeroSlider />

        {/* 4 ФУНДАМЕНТАЛЬНЫХ НАПРАВЛЕНИЯ «ДС-ИНЖИНИРИНГ» (СТРОГАЯ ПРОМЫШЛЕННАЯ ПАЛИТРА) */}
        <div id="section-directions" className="w-full min-w-0 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Направление 1: Поставка оборудования */}
            <div 
              onClick={() => navigateTo('hardware')}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                    <Box className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
                    ФГИС «АРШИН»
                  </span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                    Поставка измерительного оборудования
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Мобильные КИМ Hexagon Absolute Arm, стационарные КИМ PMT, лазерные трекеры Leica и 3D-сканеры Shining 3D FreeScan. Поверка и сервис.
                  </p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-cyan-400 group-hover:text-blue-700">
                <span>Каталог оборудования</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Направление 2: Услуги 3D-сканирования и реверса */}
            <div 
              onClick={() => navigateTo('services', 'reverse-engineering')}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                    <Scan className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    STEP / ЕСКД
                  </span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    3D-сканирование и реверс-инжиниринг
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Прецизионная оцифровка литья, штампов, лопаток. Построение параметрических B-Rep CAD-моделей и выпуск чертежей. Выезд по РФ за 24–48 ч.
                  </p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700">
                <span>Подробнее об услуге</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Направление 3: Контроль геометрии на КИМ */}
            <div 
              onClick={() => navigateTo('services', 'parts-inspection')}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-purple-500 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    GD&T ISO 1101
                  </span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    Контроль геометрии на КИМ (GD&T)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Контактные и оптические замеры деталей, выверка баз, анализ допусков формы и расположения в PolyWorks, цветовые карты отклонений.
                  </p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-700">
                <span>Метрологический контроль</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Направление 4: Поставка и внедрение инженерного ПО */}
            <div 
              onClick={() => navigateTo('software', 'topsolid-7')}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    TopSolid & ЧПУ
                  </span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                    Поставка и внедрение инженерного ПО
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Лицензии TopSolid 7 (CAD/CAM/PDM), PolyWorks|Inspector, Geomagic. Разработка кинематических постпроцессоров под стойки ЧПУ без аварий.
                  </p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-700">
                <span>Внедрение CAD/CAM</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ЭКРАН 2: ОТРАСЛЕВОЙ ПУТЕВОДИТЕЛЬ (АВИАЦИЯ, АВТОПРОМ, МАШИНОСТРОЕНИЕ, ИНСТРУМЕНТ) */}
      <section id="section-industries" className="w-full snap-section scroll-mt-20 py-2 sm:py-4">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <IndustryFocusSelector />
        </div>
      </section>

      {/* 3. ЭКРАН 3: КАРУСЕЛЬ КЛЮЧЕВОГО ОБОРУДОВАНИЯ (МОБИЛЬНЫЕ КИМ, ТРЕКЕРЫ, 3D-СКАНЕРЫ) */}
      <section id="section-equipment" className="w-full snap-section scroll-mt-20 py-2 sm:py-4">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 lg:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative">
            <KeyEquipmentCarousel />
          </div>
        </div>
      </section>

      {/* 4. ЭКРАН 4: ГАЛЕРЕЯ ВЫПОЛНЕННЫХ ПРОЕКТОВ (ПОРТФОЛИО С СОБЛЮДЕНИЕМ NDA) */}
      <section id="section-cases" className="w-full snap-section scroll-mt-20 py-2 sm:py-4">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 lg:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative">
            <CasesGallerySection />
          </div>
        </div>
      </section>

      {/* 5. ЭКРАН 5: ЭКСПРЕСС-ФОРМА ОЦЕНКИ ТЗ И ЗАГРУЗКИ 3D-МОДЕЛЕЙ ЗА 1 КЛИК */}
      <section id="section-quick-rfq" className="w-full snap-section scroll-mt-20 py-2 sm:py-4">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <QuickRfqSection />
        </div>
      </section>

      {/* 6. ЭКРАН 6: ПРОИЗВОДИТЕЛИ ОБОРУДОВАНИЯ И ПО */}
      <section id="section-brands" className="w-full snap-section scroll-mt-20 py-2 sm:py-4">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative">
            <ManufacturersLogosSection />
          </div>
        </div>
      </section>

      {/* 7. ЭКРАН 7: КОНТАКТЫ И ФОРМА ЗАПРОСА ТКП */}
      <section id="section-contact" className="w-full snap-section scroll-mt-20 py-2 sm:py-4">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-sm border border-slate-200 dark:border-slate-800 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start relative z-10">
              {/* Левая колонка: Официальные контакты и офисы */}
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-cyan-300 rounded-md text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>{homeTexts.contactCtaBadge || 'Инженерная поддержка и расчет'}</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {homeTexts.contactCtaTitle || 'Обсудите вашу задачу с инженерами «ДС‑Инжиниринг»'}
                </h2>
                
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {homeTexts.contactCtaDesc || 'Предоставим квалифицированную консультацию: оценим точность измерений, подберем конфигурацию ПО или согласуем выезд специалистов для 3D-сканирования и контроля.'}
                </p>

                <div className="pt-2 space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">Центральный офис и инженерная база (Самара):</span>
                      <span className="text-slate-600 dark:text-slate-300">443051, г. Самара, ул. Свободы, д. 198</span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Внедрение TopSolid 7, разработка постпроцессоров, выездные мобильные группы</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">Офис и демонстрационно-метрологический зал (Тольятти):</span>
                      <span className="text-slate-600 dark:text-slate-300">445043, г. Тольятти, Южное шоссе, 165 (Технопарк «Жигулевская долина», корп. 2.3 и 3.2)</span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Стационарная КИМ Mitutoyo CRYSTA-Apex S, мобильные КИМ PMT и Hexagon, 3D-контроль деталей</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                      <span>Тел: <strong className="font-mono text-slate-900 dark:text-white">{contactTexts.phoneMain || COMPANY_INFO.phone}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                      <span>Email: <strong className="font-mono text-slate-900 dark:text-white">{contactTexts.emailMain || COMPANY_INFO.email}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Режим работы: Пн–Пт 09:00 — 17:00 (МСК+1 / Самара). Выезд инженеров по всей РФ (24–48 ч).</span>
                  </div>
                </div>
              </div>

              {/* Правая колонка: Форма заявки */}
              <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 sm:p-7 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xs">
                {quickFormSuccess ? (
                  <div data-testid="feedback-success-message" className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xs">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Заявка успешно принята</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                      Инженеры компании изучат исходные данные и свяжутся с вами по номеру <strong className="font-mono text-slate-900 dark:text-white">{quickForm.phone}</strong>.
                    </p>
                    <button
                      onClick={() => setQuickFormSuccess(false)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                    >
                      Отправить еще один запрос
                    </button>
                  </div>
                ) : (
                  <form data-testid="home-feedback-form" onSubmit={handleQuickSubmit} className="space-y-4 text-xs">
                    <div className="pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Запрос технико-коммерческого предложения</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Контактное лицо <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          data-testid="feedback-name-input"
                          value={quickForm.name}
                          onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                          placeholder="Иван Петров"
                          className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Контактный телефон <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          data-testid="feedback-phone-input"
                          value={quickForm.phone}
                          onChange={handleQuickPhoneChange}
                          placeholder="+7 (999) 000-00-00"
                          className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors shadow-2xs"
                        />
                        {phoneError && <p data-testid="feedback-phone-error" className="text-rose-500 text-[10px] mt-0.5">{phoneError}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Описание производственной задачи
                      </label>
                      <input
                        type="text"
                        data-testid="feedback-message-input"
                        value={quickForm.message}
                        onChange={(e) => setQuickForm({ ...quickForm, message: e.target.value })}
                        placeholder="Например: 3D-контроль деталей КИМ, реверс-инжиниринг лопаток или постпроцессор для Fanuc"
                        className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors shadow-2xs"
                      />
                    </div>

                    {/* Compact File Upload Button */}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".step,.stp,.stl,.iges,.igs,.dxf,.dwg,.pdf,.zip,.rar,.7z"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Paperclip className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                          <span className="text-[11px]">Файлы чертежей и 3D-моделей (STEP, STL, DXF, PDF до 25 Мб)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-600"
                        >
                          Выбрать файлы
                        </button>
                      </div>

                      {/* Attached files chips */}
                      {quickFormFiles.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {quickFormFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] text-slate-800 dark:text-slate-200 font-mono shadow-2xs"
                            >
                              <FileText className="w-3 h-3 text-blue-600 dark:text-cyan-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{file.name}</span>
                              <span className="text-slate-500 dark:text-slate-400 font-sans">({(file.size / 1024 / 1024).toFixed(1)} Мб)</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(idx)}
                                className="text-slate-400 hover:text-rose-500 cursor-pointer ml-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <label htmlFor="agree-compact" className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          id="agree-compact"
                          data-testid="feedback-agree-checkbox"
                          checked={quickForm.agree}
                          onChange={(e) => setQuickForm({ ...quickForm, agree: e.target.checked })}
                          className="mt-0.5 w-3.5 h-3.5 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500 shrink-0 cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                          Согласен на обработку персональных данных (152-ФЗ) в соответствии с{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsPrivacyModalOpen(true);
                            }}
                            className="text-blue-600 dark:text-cyan-400 font-bold hover:underline inline cursor-pointer"
                          >
                            Политикой конфиденциальности
                          </button>
                          .
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      data-testid="feedback-submit-btn"
                      disabled={quickFormSubmitting}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      {quickFormSubmitting ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Отправить технический запрос</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;


