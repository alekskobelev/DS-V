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
  Sparkles, 
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
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COMPANY_INFO } from '../data/mockData';
import { DEFAULT_SITE_TEXTS } from '../data/defaultSiteTexts';
import { CasesGallerySection } from '../components/home/CasesGallerySection';
import { TrustIndustriesSection } from '../components/home/TrustIndustriesSection';
import { ManufacturersLogosSection } from '../components/home/ManufacturersLogosSection';
import { ProblemsSolutionsBlock } from '../components/home/ProblemsSolutionsBlock';
import { HeroSlider } from '../components/home/HeroSlider';
import { FaqSection } from '../components/home/FaqSection';
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
    <div className="relative w-full min-w-0 space-y-6 sm:space-y-8 pb-12">

      <Scrollspy sections={[
        { id: 'section-hero', label: 'Главная' },
        { id: 'section-problems', label: 'Решения' },
        { id: 'section-trust', label: 'Отрасли и сертификаты' },
        { id: 'section-brands', label: 'Производители' },
        { id: 'section-cases', label: 'Проекты' },
        { id: 'section-faq', label: 'Частые вопросы (FAQ)' },
        { id: 'section-contact', label: 'Связь с инженером' }
      ]} />

      {/* 1. ЭКРАН 1: ГЛАВНЫЙ ИНЖЕНЕРНЫЙ СЛАЙДЕР С ПОЗИЦИОНИРОВАНИЕМ И МЕТРИКАМИ */}
      <div id="section-hero" className="scroll-mt-24">
        <HeroSlider />
      </div>

      {/* ЭКРАН С РЕШЕНИЯМИ ЗАДАЧ */}
      <section id="section-problems" className="w-full snap-section scroll-mt-24 py-6 sm:py-10">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <ProblemsSolutionsBlock />
        </div>
      </section>

      {/* 2. ЭКРАН 2: ОТРАСЛЕВОЕ ПРИЗНАНИЕ И ДОВЕРИЕ (СЕРТИФИКАТЫ, ПАРТНЕРСТВА, ГОСТ) */}
      <section id="section-trust" className="w-full scroll-mt-24 snap-section py-8 sm:py-12 bg-slate-100/70 border-y border-slate-200/80">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <TrustIndustriesSection />
        </div>
      </section>

      {/* 3. ЭКРАН 3: ПРОИЗВОДИТЕЛИ ОБОРУДОВАНИЯ И ПО (9 КЛЮЧЕВЫХ БРЕНДОВ, ФИЛЬТРЫ, БЕГУЩАЯ ЛЕНТА) */}
      <section id="section-brands" className="w-full scroll-mt-24 snap-section py-6 sm:py-10">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <ManufacturersLogosSection />
        </div>
      </section>

      {/* 4. ЭКРАН 4: ГАЛЕРЕЯ ВЫПОЛНЕННЫХ ПРОЕКТОВ (ПОРТФОЛИО С СОБЛЮДЕНИЕМ NDA) */}
      <section id="section-cases" className="w-full scroll-mt-24 snap-section py-8 sm:py-12 bg-slate-100/70 border-y border-slate-200/80">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <CasesGallerySection />
        </div>
      </section>

      {/* 5. ЭКРАН 5: ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ (FAQ ACCORDION НА ОСНОВЕ SCHEMA.ORG JSON-LD) */}
      <FaqSection />

      {/* 6. ЭКРАН 6: ПРЯМАЯ СВЯЗЬ С ВЕДУЩИМИ ИНЖЕНЕРАМИ И ЭКСПРЕСС-ОЦЕНКА ЗАДАЧИ */}
      <section id="section-contact" className="w-full snap-section scroll-mt-24 py-6 sm:py-10">
        <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl text-slate-900 dark:text-white p-6 sm:p-8 lg:p-10 shadow-xs border border-slate-300 dark:border-slate-800 relative overflow-hidden">
            {/* Subtle engineering grid background */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center relative z-10">
              {/* Левая колонка: Реквизиты и прямые контакты */}
              <div className="xl:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/90 dark:border-blue-800 text-blue-900 dark:text-blue-300 rounded-full text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{homeTexts.contactCtaBadge}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {homeTexts.contactCtaTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {homeTexts.contactCtaDesc}
                </p>

                <div className="pt-2 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span>Телефон: <strong className="text-slate-900 dark:text-white font-mono">{contactTexts.phoneMain || COMPANY_INFO.phone}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span>Электронная почта: <strong className="text-slate-900 dark:text-white font-mono">{contactTexts.emailMain || COMPANY_INFO.email}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span>Локация: <strong className="text-slate-900 dark:text-white">{homeTexts.contactCtaLocation}</strong></span>
                  </div>
                </div>
              </div>

              {/* Правая колонка: Форма экспресс-заявки */}
              <div className="xl:col-span-7 bg-white dark:bg-slate-950/90 rounded-xl p-6 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                {quickFormSuccess ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Запрос успешно зарегистрирован</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                      Ведущий специалист свяжется с вами по номеру <strong className="font-mono text-slate-900 dark:text-white">{quickForm.phone}</strong> для обсуждения технических деталей.
                    </p>
                    <button
                      onClick={() => setQuickFormSuccess(false)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
                    >
                      Отправить еще один запрос
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuickSubmit} className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Запрос технико-коммерческого предложения</span>
                      <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/80 dark:border-blue-800">Ответ инженера за 15 мин</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Контактное лицо <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={quickForm.name}
                          onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                          placeholder="Иван Петров"
                          className="w-full h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Контактный телефон <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={quickForm.phone}
                          onChange={handleQuickPhoneChange}
                          placeholder="+7 (999) 000-00-00"
                          className="w-full h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors shadow-2xs"
                        />
                        {phoneError && <p className="text-rose-500 text-[10px] mt-0.5">{phoneError}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Характер производственной задачи
                      </label>
                      <input
                        type="text"
                        value={quickForm.message}
                        onChange={(e) => setQuickForm({ ...quickForm, message: e.target.value })}
                        placeholder="Например: реверс-инжиниринг детали, подбор КИМ для цеха или лицензия TopSolid 7"
                        className="w-full h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors shadow-2xs"
                      />
                    </div>

                    {/* Drag-and-Drop CAD / Drawings Upload Zone */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Файлы чертежей / CAD моделей (опционально)
                        </label>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">STEP, STL, DXF, PDF до 25 Мб</span>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".step,.stp,.stl,.iges,.igs,.dxf,.dwg,.pdf,.zip,.rar,.7z"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingFile(true);
                        }}
                        onDragLeave={() => setIsDraggingFile(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${
                          isDraggingFile
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-200'
                            : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <UploadCloud className={`w-4 h-4 ${isDraggingFile ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            Перетащите файлы сюда или <strong className="text-blue-600 dark:text-blue-400 underline">выберите с диска</strong>
                          </span>
                        </div>
                      </div>

                      {/* Attached files chips list */}
                      {quickFormFiles.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {quickFormFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[10px] text-slate-800 dark:text-slate-200 font-mono shadow-2xs"
                            >
                              <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span className="truncate max-w-[140px]">{file.name}</span>
                              <span className="text-slate-500 dark:text-slate-400 font-sans">({(file.size / 1024 / 1024).toFixed(1)} Мб)</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(idx);
                                }}
                                className="text-slate-400 hover:text-rose-500 cursor-pointer ml-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <label htmlFor="agree-compact" className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          id="agree-compact"
                          checked={quickForm.agree}
                          onChange={(e) => setQuickForm({ ...quickForm, agree: e.target.checked })}
                          className="mt-0.5 w-3.5 h-3.5 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500 shrink-0 cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                          Даю <strong>отдельное согласие</strong> на обработку персональных данных (152-ФЗ) на серверах в РФ в соответствии с{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsPrivacyModalOpen(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline cursor-pointer"
                          >
                            Политикой конфиденциальности
                          </button>
                          .
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={quickFormSubmitting}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer"
                    >
                      {quickFormSubmitting ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Отправить запрос на оценку и расчет</span>
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

