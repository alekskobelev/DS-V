import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FeatureList } from '../components/common/FeatureList';
//, { useState, useEffect } from 'react';
import { 
  Scan, 
  Cpu, 
  CheckCircle2, 
  Wrench, 
  Activity, 
  Terminal, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Clock,
  Layers,
  Target,
  Box,
  Eye,
  Link2,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
  UploadCloud,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SERVICES_DATA, CASE_STUDIES } from '../data/mockData';
import { Calculator } from '../components/common/Calculator';
import { Scrollspy } from '../components/common/Scrollspy';
import { motion } from 'motion/react';
import { useSEO } from '../hooks/useSEO';
import { copyToClipboard } from '../utils/clipboard';

import { CadModel3DViewer } from '../components/common/CadModel3DViewer';
import { MeshCadComparisonSlider } from '../components/common/MeshCadComparisonSlider';

export const ServicesPage: React.FC = () => {
  const { customPages, services, selectedServiceId, setSelectedServiceId, openContactModal, navigateTo, siteTexts, showToast } = useApp();
  const cmsPage = customPages.find(p => p.id === 'services');
    
  useSEO({
    title: cmsPage?.metaTitle || cmsPage?.title || 'Инжиниринговые услуги | 3D-сканирование и Реверс-инжиниринг',
    description: cmsPage?.metaDescription || cmsPage?.description || 'Услуги по 3D-сканированию, реверс-инжинирингу, контролю геометрии деталей, проектированию оснастки и разработке постпроцессоров для станков с ЧПУ.',
    keywords: cmsPage?.metaKeywords?.join(', ') || 'услуги 3d сканирования, реверс инжиниринг деталей, контроль геометрии, обмер деталей, разработка постпроцессоров, обслуживание КИМ, проектирование оснастки, инжиниринговые услуги'
  });

  const [activeServiceId, setActiveServiceId] = useState<string>(selectedServiceId || '3d-scanning');
  const [isServiceCopied, setIsServiceCopied] = useState(false);

  // Ensure page stays at top upon landing
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      setActiveServiceId(selectedServiceId);
    }
  }, [selectedServiceId]);

  const servicesToUse = services && services.length > 0 ? services : SERVICES_DATA;
  const activeService = servicesToUse.find((s) => s.id === activeServiceId) || servicesToUse[0] || SERVICES_DATA[0];

  const handleCopyServiceLink = async () => {
    let url = typeof window !== 'undefined' ? window.location.href : '';
    if (activeService?.id && (!url || !url.includes(activeService.id))) {
      const path = `/services/${activeService.id}`;
      url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
    }

    await copyToClipboard(url);
    setIsServiceCopied(true);
    setTimeout(() => {
      setIsServiceCopied(false);
    }, 2500);
    showToast('Ссылка на услугу скопирована в буфер обмена');
  };

  const getServiceIcon = (id: string) => {
    switch (id) {
      case '3d-scanning': return <Scan className="w-5 h-5 text-current" />;
      case 'measurements':
      case 'parts-inspection': return <CheckCircle2 className="w-5 h-5 text-current" />;
      case 'reverse-engineering': return <Cpu className="w-5 h-5 text-current" />;
      case 'postprocessors-dev': return <Terminal className="w-5 h-5 text-current" />;
      case 'tooling-design': return <Wrench className="w-5 h-5 text-current" />;
      case 'cmm-service':
      case 'cmm-maintenance': return <Activity className="w-5 h-5 text-current" />;
      default: return <Wrench className="w-5 h-5 text-current" />;
    }
  };

  const scrollSections = [
    { id: 'services-hero', label: 'Услуги' },
    { id: 'services-nav', label: 'Выбор направления' },
    { id: 'services-detail', label: 'Описание услуги' },
    { id: 'services-viewer', label: 'Интерактивный 3D-просмотрщик контроля GD&T' },
    { id: 'service-calculator', label: 'Калькулятор стоимости' },
  ];

  return (
    <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      <Scrollspy sections={scrollSections} />
      {/* Header Banner */}
      <div id="services-hero" className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#2563EB] text-white p-5 sm:p-6 lg:p-8 rounded-xl shadow-sm relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold text-amber-300">
            <Wrench className="w-4 h-4" />
            <span>{siteTexts.services.bannerBadge || 'Инженерные компетенции с 1995 года'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {siteTexts.services.bannerTitle || 'Инжиниринговые услуги и метрологический контроль'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            {siteTexts.services.bannerSubtitle || 'Центральный офис в Самаре, представительство в Тольятти, парк прецизионных 3D-сканеров и мобильных КИМ, сертифицированные инженеры-технологи и программисты ЧПУ. Выполняем работы любой сложности с оперативным выездом по всей России.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={() => {
                const el = document.getElementById('service-calculator');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Онлайн-калькулятор стоимости
            </button>
            <button
              onClick={() => openContactModal({ title: 'Консультация по инжиниринговым услугам', formType: 'service' })}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl transition-colors cursor-pointer"
            >
              Заказать выезд инженера
            </button>
          </div>
        </div>

        {/* Visual Image Card */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 relative z-10">
          <div className="relative rounded-xl overflow-hidden shadow-sm border border-white/20 bg-blue-950/60 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80" 
              alt="Метрологический контроль и 3D-сканирование деталей" 
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 text-xs">
              <div className="font-bold text-white flex items-center justify-between">
                <span>3D-сканирование • Реверс • Контроль GD&T</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="text-[11px] text-blue-200 mt-0.5">
                Офисы в Самаре/Тольятти + Выезд по РФ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Navigation Selector Tabs */}
      <div id="services-nav" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {servicesToUse.map((srv, idx) => {
          const navTitle = srv.id === '3d-scanning' ? '3D-сканирование деталей и объектов' :
            srv.id === 'reverse-engineering' ? 'Обратный инжиниринг и выпуск КД' :
            srv.id === 'parts-inspection' || srv.id === 'measurements' ? 'Контроль геометрии на КИМ и GD&T' :
            srv.id === 'postprocessors-dev' ? 'Разработка постпроцессоров и УП ЧПУ' :
            srv.id === 'tooling-design' ? 'Сквозное проектирование оснастки' :
            (srv.id === 'cmm-service' || srv.id === 'cmm-maintenance') ? 'ТО, модернизация и сервис КИМ' : srv.title;

          const isActive = activeServiceId === srv.id;

          return (
            <motion.button
              key={srv.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10px" }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => {
                setActiveServiceId(srv.id);
                setSelectedServiceId(srv.id);
                navigateTo('services', srv.id);
              }}
              className={`group p-3.5 sm:p-4 rounded-xl border flex flex-col justify-between h-[156px] sm:h-[164px] transition-all duration-200 cursor-pointer text-left ${
                isActive
                  ? 'bg-gradient-to-br from-[#1E3A8A] via-blue-900 to-[#2563EB] text-white border-blue-600 shadow-sm scale-[1.02] ring-2 ring-blue-500/25'
                  : 'bg-white dark:bg-slate-900 hover:bg-blue-50/40 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-800 hover:border-blue-400 text-slate-900 dark:text-white shadow-2xs'
              }`}
            >
              {/* 1) Верхняя строка: Информационная иконка слева + Номер услуги справа */}
              <div className="w-full flex items-center justify-between pt-0.5">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                  isActive
                    ? 'bg-white/20 text-white backdrop-blur-xs shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-slate-700 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}>
                  {getServiceIcon(srv.id)}
                </div>

                <span className={`text-2xl sm:text-3xl font-black font-sans tracking-tight leading-none transition-colors ${
                  isActive ? 'text-blue-200' : 'text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}>
                  0{idx + 1}
                </span>
              </div>

              {/* 2) Текст с описанием услуги */}
              <div className="w-full mt-2.5 flex-1 flex items-center">
                <span className={`text-xs sm:text-[13px] font-bold leading-snug transition-colors line-clamp-2 text-left ${
                  isActive ? 'text-white font-extrabold' : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-900 dark:group-hover:text-blue-400'
                }`}>
                  {navTitle}
                </span>
              </div>

              {/* 3) Нижний акцентный индикатор */}
              <div className={`h-1 rounded-full transition-all duration-300 mt-2 ${
                isActive ? 'w-10 bg-amber-400' : 'w-5 bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-300'
              }`} />
            </motion.button>
          );
        })}
      </div>

      {/* Active Service Detailed Presentation */}
      <div id="services-detail" className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-6">
        {/* Title and Overview */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
          <div className="xl:col-span-7 space-y-4 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-800">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Базовая стоимость: <strong>{activeService.basePriceText}</strong></span>
              </div>
              <button
                id="copy-link-service-header"
                type="button"
                onClick={handleCopyServiceLink}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isServiceCopied
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
                title="Скопировать ссылку на услугу"
                aria-label="Скопировать ссылку на услугу"
                data-testid="copy-link-service-header"
              >
                {isServiceCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Link2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
                <span>{isServiceCopied ? 'Скопировано!' : 'Скопировать ссылку'}</span>
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeService.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {activeService.fullDesc}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  openContactModal({
                    title: activeService.id === 'postprocessors-dev' ? 'Заказ разработки постпроцессора для станков с ЧПУ' : `Заказ услуги: ${activeService.title}`,
                    defaultService: activeService.title,
                    formType: activeService.id === 'postprocessors-dev' ? 'postprocessor' : 'service',
                  })
                }
                className="px-6 py-3 bg-[#F59E0B] hover:bg-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                Оставить заявку на услугу
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('service-calculator');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold rounded-xl text-xs sm:text-sm border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
              >
                Рассчитать стоимость онлайн ↓
              </button>
              {/* Copy Link Action Button */}
              <button
                id="copy-link-service-btn"
                type="button"
                onClick={handleCopyServiceLink}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                  isServiceCopied
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
                title="Скопировать ссылку на услугу"
                aria-label="Скопировать ссылку на услугу"
                data-testid="copy-link-button"
              >
                {isServiceCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Скопировать ссылку</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="xl:col-span-5 min-w-0">
            <img
              src={activeService.image}
              alt={`${activeService.title} — инженерные услуги 3D-метрологии от ДС-Инжиниринг`}
              className="w-full h-72 object-cover rounded-xl shadow-md border border-gray-200 dark:border-slate-800"
            />
          </div>
        </div>

        {/* 5-Step Workflow */}
        <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Этапы выполнения работ (методология ДС‑Инжиниринг):</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {activeService.steps.map((step) => (
              <div
                key={step.stepNumber}
                className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-gray-200 dark:border-slate-700 relative flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] dark:bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                    {step.stepNumber}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables & Equipment Grid */}
        <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-slate-800">
          {/* Deliverables Formats Header Banner */}
          <div className="bg-gradient-to-r from-blue-900/90 via-slate-900 to-slate-900 text-white rounded-xl p-4 sm:p-5 border border-blue-800/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
                  Выходная документация и форматы файлов
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-white">
                Что вы получаете на руки по завершении работ
              </h4>
              <p className="text-xs text-slate-300 max-w-xl">
                Полный комплект конструкторской и метрологической отчетности: оригинальные CAD-модели без потери точности, протоколы первого изделия FAI по ГОСТ и проект PolyWorks.
              </p>
            </div>

            <button
              onClick={() => openContactModal({
                title: `Оценка чертежа или 3D-модели: ${activeService.title}`,
                defaultService: activeService.title,
                formType: activeService.id === 'postprocessors-dev' ? 'postprocessor' : 'service'
              })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Оценить ТЗ / Чертеж</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-xl p-5 sm:p-6 border border-blue-100 dark:border-blue-900/40 space-y-3">
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center justify-between">
                <span>Материалы на руки заказчику:</span>
                <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                  {activeService.deliverables.length} позиций
                </span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
                {activeService.deliverables.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 sm:p-6 border border-gray-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>Используемое оборудование и ПО:</span>
                <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded">
                  ФГИС «АРШИН»
                </span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
                {activeService.equipmentUsed.map((eq, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Wrench className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                    <span className="font-medium leading-snug">{eq}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Responsible Specialists & Service Contacts */}
        {((activeService.contacts && activeService.contacts.length > 0) || activeService.responsiblePerson || activeService.slaResponseTime || activeService.workLocationNote) && (
          <div className="bg-gradient-to-br from-blue-50/70 via-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900 rounded-xl p-6 border border-blue-100 dark:border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Ответственные инженеры и прямые контакты по направлению
                </h4>
              </div>
              {activeService.slaResponseTime && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/80 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activeService.slaResponseTime}</span>
                </div>
              )}
            </div>

            {activeService.workLocationNote && (
              <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{activeService.workLocationNote}</span>
              </div>
            )}

            {activeService.contacts && activeService.contacts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {activeService.contacts.map((contact, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{contact.name}</div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">{contact.role}</div>
                    </div>
                    <div className="space-y-1 text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <a href={`tel:${contact.phone}`} className="font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a href={`mailto:${contact.email}`} className="text-slate-600 dark:text-slate-300 hover:text-blue-600">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.location && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{contact.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SPECIAL 3D WEBGL CAD & GD&T METROLOGY SHOWCASE */}
        <div id="services-viewer" className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold mb-2 border border-blue-200 dark:border-blue-800">
                <Scan className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span>Интерактивный 3D-модуль оцифровки и контроля геометрии (WebGL)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Интерактивный 3D-просмотрщик контроля GD&T, моделей и карт отклонений
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl mt-1">
                Оцените качество оцифровки и метрологического контроля в реальном времени: вращайте деталь, переключайте режимы («CAD-модель», «Сетка 3D-скана», «Метрологическая карта отклонений GD&T»), делайте динамические сечения и анализируйте значения допусков в контрольных точках.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openContactModal({
                  title: `Заказ 3D-контроля геометрии и сканирования (${activeService.title})`,
                  defaultService: activeService.title,
                  formType: 'service'
                })}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Оцифровать мою деталь
              </button>
            </div>
          </div>

          {/* Embedded 3D WebGL Canvas Component (Lazy Loaded) */}
          <div className="w-full max-h-[600px] overflow-hidden rounded-xl">
            <CadModel3DViewer 
              initialModel={activeService.id === 'reverse-engineering' ? 'mold' : activeService.id === 'parts-inspection' ? 'housing' : 'impeller'}
              initialMode={activeService.id === 'reverse-engineering' ? 'cad' : activeService.id === '3d-scanning' ? 'mesh' : 'colormap'}
              className="max-h-[600px]"
            />
          </div>
        </div>

        {/* SPECIAL TOOLING DESIGN SHOWCASE: Complete Tooling Engineering Pipeline */}
        {activeService.id === 'tooling-design' && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-800 space-y-6">
            <div className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-900 dark:text-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-300 dark:border-slate-800 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-300/80 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold mb-2 border border-amber-500/30">
                    <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Инжиниринговый центр «ДС‑Инжиниринг» • Полный цикл от ТЗ до готовой оснастки</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Проектирование и изготовление технологической оснастки «под ключ»
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl mt-1">
                    Сквозной инжиниринг пресс-форм, штампов и станочных приспособлений: от 3D-моделирования деталей и расчета объемной усадки до выпуска полного комплекта конструкторской документации по ЕСКД, ЧПУ мехобработки, электроэрозии и проведения приемочных испытаний.
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800/90 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-center shrink-0 shadow-2xs">
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 uppercase font-mono block">Снижение времени разработки КД</span>
                  <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">до 3-х раз</span>
                </div>
              </div>

              {/* 5 Tooling Pipeline Steps */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-6">
                {[
                  {
                    step: '01',
                    title: 'Анализ детали и усадки',
                    tool: 'DFM & Shrinkage Analysis',
                    desc: 'Анализ технологичности детали, проверка углов уклона, поднутрений, выбор плоскости разъема и расчет объемной усадки.',
                  },
                  {
                    step: '02',
                    title: 'Формообразующие детали',
                    tool: 'Core & Cavity Design',
                    desc: 'Построение поверхностей разъема, моделирование матрицы, пуансона, знаков, боковых ползунов, шиберов и литниковой системы.',
                  },
                  {
                    step: '03',
                    title: 'Компоновка блока плит',
                    tool: 'Standard Mold/Die Base',
                    desc: 'Интеграция стандартизированных пакетов плит (Hasco, DME, FCPK, Meusburger), направляющих колонок и систем выталкивания.',
                  },
                  {
                    step: '04',
                    title: 'Кинематика и термостатика',
                    tool: 'Kinematic & Thermal CAE',
                    desc: 'Симуляция смыкания/раскрытия, проверка отсутствия коллизий шиберов, оптимизация контуров охлаждения и проливаемости.',
                  },
                  {
                    step: '05',
                    title: 'Производство, ЧПУ и тесты',
                    tool: 'CNC Machining & EDM',
                    desc: 'Выпуск КД по ЕСКД, высокоскоростное фрезерование ЧПУ, электроэрозия (EDM), слесарная сборка и испытания готовой оснастки.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{item.step}</span>
                        <span className="text-[9px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md font-mono border border-blue-200 dark:border-blue-900/60">{item.tool.split(' ')[0]}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/80 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                      {item.tool}
                    </div>
                  </div>
                ))}
              </div>

              {/* User Story & Case Highlight */}
              <div className="mt-6 p-4 sm:p-5 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
                    Реализованный промышленный кейс
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Многоместная горячеканальная пресс-форма точного литья разъемов автоэлектроники
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Разработан полный 3D CAD-проект 8-местной пресс-формы с кинематическим расчетом хода шиберов, выпущен комплект рабочей КД по ЕСКД, изготовлены формообразующие матрицы и электроды на прецизионных станках с ЧПУ и проведен прецизионный метрологический контроль мобильным 3D-комплексом <strong>ScanLine / PolyWorks</strong> с испытанием опытной партии деталей.
                  </p>
                </div>
                <button
                  onClick={() =>
                    openContactModal({
                      title: 'Заказ проектирования технологической оснастки',
                      defaultService: 'Проектирование и изготовление технологической оснастки (пресс-формы/штампы)',
                      formType: 'service',
                    })
                  }
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs shrink-0 shadow-xs transition-colors cursor-pointer"
                >
                  Заказать проект оснастки
                </button>
              </div>
            </div>
          </div>
        )}
        {activeService.id === 'reverse-engineering' && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-800 space-y-6">
            <div className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-900 dark:text-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-300 dark:border-slate-800 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-300/80 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold mb-2 border border-blue-200 dark:border-blue-800">
                    <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Специализированная технологическая цепочка Mesh-to-CAD</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Сквозной реверс-инжиниринг: 3D-сканирование, КИМ и моделирование в Geomagic Design X
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl mt-1">
                    Трансформация контактных измерений КИМ и полигональных сеток (STL) в точные твердотельные и поверхностные CAD-модели (STEP, Parasolid, IGES). Построение параметрических моделей с деревом выполняется по отдельному техническому заданию.
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800/90 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-center shrink-0 shadow-2xs">
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 uppercase font-mono block">Точность соответствия CAD/Скан</span>
                  <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">до ±0.010 мм</span>
                </div>
              </div>

              {/* 5 Mesh-to-CAD Steps */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-6">
                {[
                  {
                    step: '01',
                    title: 'Оцифровка и обмер',
                    tool: 'Hexagon Arm / Shining 3D FreeScan',
                    desc: 'Сбор высокоплотного облака точек лазером и контактный щуповой замер базовых плоскостей и отверстий мобильной КИМ.',
                  },
                  {
                    step: '02',
                    title: 'Сегментация сетки',
                    tool: 'Geomagic Design X (Region Grouping)',
                    desc: 'Автоматическое распознавание геометрических примитивов: плоскости, цилиндры, конусы, торы и свободные зоны.',
                  },
                  {
                    step: '03',
                    title: 'Эскизы сечений',
                    tool: 'Mesh Sketch & Auto-Profile',
                    desc: 'Извлечение сечений из сетки, наложение геометрических взаимосвязей (касательность, перпендикулярность, размеры).',
                  },
                  {
                    step: '04',
                    title: 'Твердотельное B-Rep моделирование',
                    tool: 'B-Rep / Auto Surface (STEP, Parasolid)',
                    desc: 'Построение геометрически точных твердых тел и сопряжений. Экспорт в нейтральные форматы STEP/Parasolid, в TopSolid и ЧПУ.',
                  },
                  {
                    step: '05',
                    title: 'Метрологический контроль',
                    tool: 'PolyWorks / Control X Deviation',
                    desc: 'Построение цветовой карты отклонений CAD от исходной сетки с выдачей протокола точности и оформлением чертежей по ЕСКД.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{item.step}</span>
                        <span className="text-[9px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md font-mono border border-blue-200 dark:border-blue-900/60">{item.tool.split(' ')[0]}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/80 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                      {item.tool}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Comparison: Mesh (STL) vs Solid CAD (STEP) */}
              <div className="pt-6">
                <MeshCadComparisonSlider />
              </div>

              {/* User Story & Case Highlight */}
              <div className="mt-6 p-4 sm:p-5 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
                    Реализованный промышленный кейс (Импортозамещение)
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Реверс-инжиниринг рабочего колеса насоса Sulzer и спирального корпуса
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Изношенная деталь оцифрована сканером <strong>Shining 3D FreeScan Combo</strong> (погрешность 0.02 мм) и мобильной КИМ Hexagon, в <strong>Geomagic Design X</strong> восстановлены теоретические профили пера лопаток и сформирована твердотельная CAD-модель (STEP) в <strong>TopSolid 7</strong> с выпуском УП для 5-осевого ЧПУ станка.
                  </p>
                </div>
                <button
                  onClick={() =>
                    openContactModal({
                      title: 'Запрос на реверс-инжиниринг деталей',
                      defaultService: 'Реверс-инжиниринг и твердотельное CAD-моделирование',
                      formType: 'service',
                    })
                  }
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs shrink-0 shadow-xs transition-colors cursor-pointer"
                >
                  Заказать реверс детали
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Service Calculator */}
      <Calculator defaultService={activeService.calculatorType as any} />
    </div>
  );
};

export default ServicesPage;

