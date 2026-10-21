import React, { useState } from 'react';
import { Scrollspy } from '../components/common/Scrollspy';
import { 
  Building2, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Users, 
  Target, 
  History, 
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Cpu,
  Layers,
  Wrench,
  Download,
  ExternalLink,
  BookOpen,
  Briefcase,
  Scan,
  Compass,
  Check,
  Truck,
  Globe2,
  Navigation,
  Clock,
  Package,
  Boxes
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COMPANY_INFO, PARTNERS_DATA, ENGINEERING_SERVICES_EQUIPMENT, COMPANY_LOCATIONS } from '../data/mockData';
import { DEFAULT_SITE_TEXTS } from '../data/defaultSiteTexts';
import { DsLogo } from '../components/common/DsLogo';
import { ManufacturersLogosSection } from '../components/home/ManufacturersLogosSection';
import { IndustrialClientsSection } from '../components/about/IndustrialClientsSection';
import { InteractiveCompanyTimeline } from '../components/about/InteractiveCompanyTimeline';
import { useSEO } from '../hooks/useSEO';

interface AboutPageProps {
  initialTab?: 'overview' | 'equipment' | 'clients' | 'vendors' | 'partners' | 'history';
}

export const AboutPage: React.FC<AboutPageProps> = ({ initialTab = 'overview' }) => {
  const { openContactModal, navigateTo, siteTexts, customPages } = useApp();
  const cmsPage = customPages.find(p => p.id === 'about');
  const aboutTexts = siteTexts?.about || DEFAULT_SITE_TEXTS.about;
    
  useSEO({
    title: cmsPage?.metaTitle || cmsPage?.title || 'О компании ООО «ДС‑Инжиниринг» | История, компетенции, оснащение',
    description: cmsPage?.metaDescription || cmsPage?.description || 'Официальная инжиниринговая компания «ДС‑Инжиниринг» (с 1995 г.): 30+ лет опыта, поставка оборудования, внедрение TopSolid, разработка постпроцессоров, метрологический зал в Тольятти, офис в Самаре.',
    keywords: cmsPage?.metaKeywords?.join(', ') || 'ДС‑Инжиниринг, о компании, поставка оборудования, TopSolid, Shining 3D, PMT, PolyWorks, Geomagic, постпроцессоры, КИМ, Тольятти Жигулевская долина, Самара'
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'equipment' | 'clients' | 'vendors' | 'history'>(
    initialTab === 'partners' ? 'clients' : (initialTab as any) || 'overview'
  );

  const keyDirections = [
    {
      icon: <Package className="w-6 h-6 text-blue-600" />,
      title: 'Поставка измерительного и 3D-оборудования',
      desc: 'Официальные поставки координатно-измерительных машин (PMT, Hexagon), портативных КИМ типа «рука», лазерных 3D-сканеров Shining 3D / ScanLine с заводской гарантией, пусконаладкой и шеф-монтажом.',
      linkText: 'Каталог оборудования',
      linkPage: 'hardware',
    },
    {
      icon: <Layers className="w-6 h-6 text-blue-600" />,
      title: 'Внедрение CAD/CAM/PDM систем',
      desc: 'Интеграция сквозной цифровой среды TopSolid 7 «под ключ»: от 3D-моделирования сложных сборок и штампов до генерации управляющих программ для станков с ЧПУ и системы управления инженерными данными (PDM).',
      linkText: 'Каталог программного обеспечения',
      linkPage: 'software',
    },
    {
      icon: <Cpu className="w-6 h-6 text-amber-600" />,
      title: 'Разработка постпроцессоров и симуляторов ЧПУ',
      desc: 'Создание индивидуальных постпроцессоров и точных кинематических цифровых двойников станков с ЧПУ (Fanuc, Heidenhain, Siemens, Haas, Syntec) с 100% гарантией безаварийной обработки деталей.',
      linkText: 'Подробнее о постпроцессорах',
      linkPage: 'services',
    },
    {
      icon: <Wrench className="w-6 h-6 text-emerald-600" />,
      title: '3D-метрология и контроль геометрии (GD&T)',
      desc: 'Высокоточные контактные и оптические измерения в Метрологическом зале в Тольятти и оперативные выезды по всей России с мобильными КИМ Hexagon Absolute Arm и 3D-сканерами. Протоколы отклонений и GD&T-анализ в PolyWorks|Inspector™.',
      linkText: 'Услуги 3D-метрологии',
      linkPage: 'services',
    },
    {
      icon: <Target className="w-6 h-6 text-blue-600" />,
      title: 'Реверс-инжиниринг деталей и оснастки',
      desc: 'Воссоздание точных твердотельных и поверхностных CAD-моделей (STEP, Parasolid x_t, IGES) изношенных, импортных деталей или оснастки по контактным замерам КИМ Hexagon и полигональным сеткам 3D-сканирования в Geomagic Design X и TopSolid.',
      linkText: 'Услуги реверс-инжиниринга',
      linkPage: 'services',
    },
    {
      icon: <Users className="w-6 h-6 text-amber-600" />,
      title: 'Технический инструктаж и консультации технологов',
      desc: 'Практический технический инструктаж и инженерные консультации для технологов, программистов ЧПУ и контролеров ОТК на базе реальных производственных деталей вашего предприятия.',
      linkText: 'Программы инструктажа',
      linkPage: 'services',
    },
  ];

  const scrollSections = [
    { id: 'about-hero', label: 'О компании' },
    { id: 'about-tabs', label: 'Вкладки и разделы' },
    { id: 'about-metrics', label: 'Ключевые показатели' },
    { id: 'about-directions', label: 'Направления работы' },
  ];

  return (
    <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      <Scrollspy sections={scrollSections} />

      {/* 1. Hero Banner */}
      <div id="about-hero" className="bg-gradient-to-br from-[#1E3A8A] via-blue-900 to-slate-950 text-white p-5 sm:p-6 lg:p-8 rounded-xl shadow-sm flex flex-col xl:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-2xl xl:max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-amber-300 border border-white/20">
            <History className="w-4 h-4" />
            <span>{aboutTexts.heroBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {aboutTexts.heroTitle}
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-blue-100/90 leading-relaxed max-w-2xl">
            {aboutTexts.heroSubtitle}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={() => openContactModal({ title: 'Запрос консультации или ТКП', formType: 'consultation' })}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Заказать консультацию
            </button>
            <button
              onClick={() => navigateTo('contacts')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Контакты и реквизиты</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Enlarged Logo Card */}
        <div className="shrink-0 w-full sm:w-80 md:w-96 bg-white/10 p-6 sm:p-8 rounded-xl border border-white/20 backdrop-blur-md shadow-sm flex flex-col items-center justify-center text-center relative z-10 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-white/15 rounded-full shadow-inner border border-white/25 mb-3">
            <DsLogo size={160} />
          </div>
          <div className="mt-1 text-base sm:text-lg font-black text-white tracking-widest uppercase">
            САМАРА • ТОЛЬЯТТИ
          </div>
          <div className="mt-4 pt-3.5 border-t border-white/15 w-full flex items-center justify-center gap-2 text-xs text-amber-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Более 30 лет инженерного опыта</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div id="about-tabs" className="flex flex-wrap border-b border-gray-200 dark:border-slate-800 gap-1 sm:gap-3 text-xs sm:text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>О компании</span>
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'equipment'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Техническое оснащение</span>
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'clients'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Промышленные заказчики</span>
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'vendors'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Вендоры и бренды</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 border-b-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>История с 1995 года</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-mono font-bold">1995–2026</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Counters */}
          <div id="about-metrics" className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-blue-700 dark:text-blue-400 font-mono">{aboutTexts.metric1Value}</div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{aboutTexts.metric1Label}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{aboutTexts.metric1Desc}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-blue-700 dark:text-blue-400 font-mono">{aboutTexts.metric2Value}</div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{aboutTexts.metric2Label}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{aboutTexts.metric2Desc}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-blue-700 dark:text-blue-400 font-mono">{aboutTexts.metric3Value}</div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{aboutTexts.metric3Label}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{aboutTexts.metric3Desc}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-blue-700 dark:text-blue-400 font-mono">{aboutTexts.metric4Value}</div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{aboutTexts.metric4Label}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{aboutTexts.metric4Desc}</div>
            </div>
          </div>

          {/* Three Foundation Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{aboutTexts.pillar1Title || 'Точность по ГОСТ и ISO'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {aboutTexts.pillar1Desc || 'Работаем с поверенными средствами измерений из реестра ФГИС «АРШИН».'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{aboutTexts.pillar2Title || 'Сквозная цифровизация'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {aboutTexts.pillar2Desc || 'От сканирования детали до готовой управляющей программы для станков с ЧПУ без потери точности геометрии.'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{aboutTexts.pillar3Title || 'Ответственность за результат'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {aboutTexts.pillar3Desc || 'Выезжаем на производство заказчика, проводим пусконаладку, обучаем персонал и сопровождаем проекты после сдачи.'}
              </p>
            </div>
          </div>

          {/* 6 Key Directions Section */}
          <div id="about-directions" className="space-y-6">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Комплексные инженерные услуги
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Ключевые направления деятельности
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Полный цикл внедрения передовых цифровых и метрологических технологий в производственный процесс предприятия
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {keyDirections.map((dir, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl w-fit border border-slate-100 dark:border-slate-700">
                      {dir.icon}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {dir.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {dir.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => navigateTo(dir.linkPage as any)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer group"
                    >
                      <span>{dir.linkText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 30 Years Heritage & Interactive Timeline Teaser Banner */}
          <div className="bg-gradient-to-r from-blue-50 dark:from-slate-900 via-indigo-50/50 dark:via-blue-950/40 to-white dark:to-slate-900 rounded-xl p-6 sm:p-8 border border-blue-200/80 dark:border-blue-900/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Хроника 1995–2026: 30+ лет лидерства</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Интерактивная временная шкала развития «ДС-Инжиниринг»
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Познакомьтесь со всеми технологическими вехами: от первых CAD/CAM в 1995 году до внедрения TopSolid 7, мобильного 3D-сканирования со статусом СИ в ФГИС «АРШИН» и регионального представительства в Тольятти.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Открыть интерактивную шкалу</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: EQUIPMENT */}
      {activeTab === 'equipment' && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-4">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              Парк измерительной техники
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Собственное метрологическое оснащение
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Мобильные метрологические 3D-комплексы со статусом СИ в ФГИС «АРШИН», рабочие станции PolyWorks|Inspector™ и CAD/CAM среда TopSolid 7
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {ENGINEERING_SERVICES_EQUIPMENT.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="relative h-24 sm:h-28 bg-slate-900 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                    <div className="absolute top-2 left-2 bg-blue-900/90 text-white text-[9.5px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                      {item.categoryLabel}
                    </div>
                    <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10.5px] text-white">
                      <span className="text-blue-300 font-mono font-medium">Точность: {item.accuracy}</span>
                      <span className="text-amber-300 font-semibold bg-black/50 px-2 py-0.2 rounded text-[10px]">{item.mobility}</span>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 space-y-2.5">
                    <div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">{item.typeLabel}</div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">{item.name}</h3>
                    </div>

                    <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                      {item.features.slice(0, 4).map((f, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate leading-tight">{f}</span>
                        </div>
                      ))}
                    </div>

                    {item.specs && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-0.5 text-[10.5px] border border-slate-200/80 dark:border-slate-700/60">
                        {Object.entries(item.specs).slice(0, 4).map(([key, val]) => (
                          <div key={key} className="flex justify-between gap-1">
                            <span className="text-slate-500 dark:text-slate-400 truncate text-[10px]">{key}:</span>
                            <span className="text-slate-900 dark:text-white font-medium text-right truncate text-[10.5px]">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-1 flex items-center justify-between">
                  <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">Самара, Тольятти и выезд по РФ</span>
                  <button
                    onClick={() => openContactModal({ title: `Заказ измерений на ${item.name}`, formType: 'measurement' })}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Заказать замер
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Software banner */}
          <div className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-900 dark:text-white p-5 sm:p-6 rounded-xl border border-slate-300 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded-full text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Метрологический программный стек</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                100% достоверность и совместимость отчетов
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Мы формируем официальные протоколы контроля геометрии (GD&T) и карты отклонений в эталонных пакетах 
                <strong className="text-slate-900 dark:text-white"> PolyWorks|Inspector™</strong> и <strong className="text-slate-900 dark:text-white">Geomagic Control X</strong> по ГОСТ Р ИСО 1101.
              </p>
            </div>
            <button
              onClick={() => openContactModal({ title: 'Запрос примера метрологического отчета', formType: 'consultation' })}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs shrink-0 transition-colors cursor-pointer"
            >
              Запросить образец отчета
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: INDUSTRIAL CLIENTS */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <IndustrialClientsSection />
        </div>
      )}

      {/* TAB 4: VENDORS & BRANDS */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          <ManufacturersLogosSection />
        </div>
      )}

      {/* TAB 5: HISTORY & MILESTONES (INTERACTIVE ANIMATED TIMELINE) */}
      {activeTab === 'history' && (
        <InteractiveCompanyTimeline />
      )}
    </div>
  );
};

export default AboutPage;

