import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  Box, 
  Wrench, 
  Cpu, 
  Sparkles,
  ExternalLink,
  Pause,
  Play,
  Scan
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface SlideData {
  id: string;
  category: string;
  tabCategory: string;
  tabTitle: string;
  badgeIcon: React.ElementType;
  title: string;
  description: string;
  keyFeatures: string[];
  primaryBtnText: string;
  primaryAction: () => void;
  secondaryBtnText: string;
  secondaryAction: () => void;
  card: {
    tag: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    spec1Label: string;
    spec1Value: string;
    spec2Label: string;
    spec2Value: string;
    actionText: string;
    onCardClick: () => void;
  };
}

export const HeroSlider: React.FC = () => {
  const { navigateTo, openContactModal, siteTexts } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const isWheelThrottledRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Exact metrics as shown on the specification screenshot
  const metric1Val = siteTexts?.home?.metric1Value || '31 год';
  const metric1Lbl = siteTexts?.home?.metric1Label || 'Инженерной практики в РФ';
  const metric2Val = siteTexts?.home?.metric2Value || '500+';
  const metric2Lbl = siteTexts?.home?.metric2Label || 'Реализованных проектов';
  const metric3Val = siteTexts?.home?.metric3Value || '0.9 мкм';
  const metric3Lbl = siteTexts?.home?.metric3Label || 'Гарантированная точность';
  const metric4Val = siteTexts?.home?.metric4Value || '24/7';
  const metric4Lbl = siteTexts?.home?.metric4Label || 'Инженерная поддержка';

  const slides: SlideData[] = [
    {
      id: 'metrology',
      category: 'Метрологическое оборудование',
      tabCategory: '3D-метрология',
      tabTitle: '3D-сканеры, мобильные и стационарные КИМ',
      badgeIcon: Box,
      title: 'Высокоточная 3D-метрология и измерительные машины',
      description: 'Поставка и пусконаладка стационарных КИМ PMT, мобильных измерительных рук Hexagon и 3D-сканеров. Поверка, калибровка и внесение в Госреестр СИ.',
      keyFeatures: [
        'Погрешность измерений от 0.9 мкм',
        'Внесено в Госреестр СИ (ФГИС «АРШИН»)',
        'Собственный сертифицированный сервис'
      ],
      primaryBtnText: 'Подробнее об оборудовании',
      primaryAction: () => navigateTo('hardware'),
      secondaryBtnText: 'Запросить КП и расчет',
      secondaryAction: () => openContactModal({ title: 'Запрос коммерческого предложения на КИМ', formType: 'request' }),
      card: {
        tag: 'Поставка под заказ',
        title: 'Стационарная КИМ PMT Alpha 10.12.08',
        subtitle: 'Стационарный пост метрологического контроля деталей',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        spec1Label: 'Точность',
        spec1Value: 'E0,MPE от 0.9 + L/350 мкм',
        spec2Label: 'Конструктив',
        spec2Value: 'Гранитные направляющие с аэроопорами',
        actionText: 'Открыть характеристики КИМ',
        onCardClick: () => navigateTo('hardware', 'pmt-alpha-p')
      }
    },
    {
      id: 'services',
      category: 'Инжиниринговые услуги',
      tabCategory: 'Инжиниринг',
      tabTitle: '3D-сканирование и реверс',
      badgeIcon: Wrench,
      title: 'Комплексные инжиниринговые услуги и метрологический контроль',
      description: '3D-сканирование деталей, обратное проектирование в CAD (STEP/IGES), контроль геометрии, разработка постпроцессоров для станков с ЧПУ и проектирование оснастки.',
      keyFeatures: [
        'Выезд инженеров-метрологов на предприятия по всей России',
        'Построение твердотельных CAD-моделей (STEP, IGES, Parasolid)',
        'Сравнение с CAD: карты отклонений и протоколы контроля геометрии',
        'Разработка постпроцессоров и цифровых двойников станков с ЧПУ'
      ],
      primaryBtnText: 'Подробнее об услугах',
      primaryAction: () => navigateTo('services'),
      secondaryBtnText: 'Рассчитать стоимость',
      secondaryAction: () => openContactModal({ title: 'Расчет стоимости инжиниринговых услуг', formType: 'request' }),
      card: {
        tag: 'Собственный парк оборудования',
        title: 'Метрологический контроль и выездные измерения на производстве',
        subtitle: 'Лазерное 3D-сканирование и реверс-инжиниринг деталей',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        spec1Label: 'Оснащение',
        spec1Value: 'Лазерные 3D-сканеры FreeScan, КИМ Hexagon',
        spec2Label: 'Результат',
        spec2Value: 'Твердотельные STEP/IGES и чертежи ЕСКД',
        actionText: 'Заказать 3D-сканирование деталей',
        onCardClick: () => navigateTo('services')
      }
    },
    {
      id: 'polyworks',
      category: 'Метрологический стандарт',
      tabCategory: 'PolyWorks®',
      tabTitle: 'Контроль геометрии',
      badgeIcon: Cpu,
      title: 'Универсальная метрологическая платформа PolyWorks|Inspector™',
      description: 'Контроль геометрии по 3D-сканам и CAD-моделям, расчет допусков формы и расположения (GD&T по ASME/ISO) и статистический контроль стабильности (SPC).',
      keyFeatures: [
        'Сертифицированное PTB математическое ядро',
        'Прямой импорт CAD с аннотациями PMI',
        'Автоматические метрологические протоколы'
      ],
      primaryBtnText: 'Подробнее о PolyWorks',
      primaryAction: () => navigateTo('software', 'polyworks-inspector'),
      secondaryBtnText: 'Заказать презентацию',
      secondaryAction: () => openContactModal({ title: 'Заказ онлайн-демонстрации PolyWorks', formType: 'consultation' }),
      card: {
        tag: 'Сертификат PTB',
        title: 'PolyWorks|Inspector™ Premium',
        subtitle: 'Эталонное программное обеспечение для КИМ и 3D-сканеров',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        spec1Label: 'Поддержка',
        spec1Value: '100+ моделей КИМ, трекеров и 3D-сканеров',
        spec2Label: 'Анализ',
        spec2Value: 'Цветовые карты отклонений, сечения, GD&T',
        actionText: 'Сравнить конфигурации PolyWorks',
        onCardClick: () => navigateTo('software', 'polyworks-inspector')
      }
    },
    {
      id: 'cadcam',
      category: 'Универсальный программный комплекс',
      tabCategory: 'TopSolid 7',
      tabTitle: 'CAD / CAM / PDM комплекс',
      badgeIcon: Layers,
      title: 'TopSolid 7 — универсальное программное обеспечение: CAD, CAM и PDM',
      description: 'Комплексное инженерное решение для 3D-моделирования, механической обработки деталей и управления инженерными данными для всех отраслей промышленности.',
      keyFeatures: [
        'Интегрированная среда CAD, CAM и встроенная PDM',
        'Моделирование и обработка деталей любой сложности',
        'Адаптация под любые отраслевые задачи производства'
      ],
      primaryBtnText: 'Подробнее о ПО TopSolid 7',
      primaryAction: () => navigateTo('software', 'topsolid-7'),
      secondaryBtnText: 'Тестовая лицензия',
      secondaryAction: () => openContactModal({ title: 'Запрос тестовой лицензии TopSolid 7', formType: 'trial' }),
      card: {
        tag: 'Официальный дилер',
        title: 'TopSolid 7 (CAD / CAM / PDM)',
        subtitle: 'Моделирование, обработка на станках и управление данными изделия',
        imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        spec1Label: 'Функционал',
        spec1Value: '3D CAD моделирование, 2.5D–5D CAM и встроенный PDM-сервер',
        spec2Label: 'Отрасли',
        spec2Value: 'Машиностроение, приборостроение, инструментальное производство',
        actionText: 'Подробнее о TopSolid 7',
        onCardClick: () => navigateTo('software', 'topsolid-7')
      }
    },
    {
      id: 'geomagic',
      category: 'Реверс & 3D-контроль',
      tabCategory: 'Geomagic®',
      tabTitle: 'Реверс-инжиниринг и контроль',
      badgeIcon: Scan,
      title: 'Geomagic: Реверс-инжиниринг и 3D-инспекция',
      description: 'Лидирующие в отрасли программные комплексы для преобразования данных 3D-сканирования в высокоточные параметрические CAD-модели (Design X) и автоматизированного контроля геометрии деталей (Control X).',
      keyFeatures: [
        'Автоматическое извлечение эскизов и поверхностей из 3D-сканов',
        'Технология LiveTransfer™: экспорт дерева построения в CAD',
        'Geomagic Control X: автоматизированный контроль FAI и серийных партий',
        'Прямая интеграция со сканерами Shining 3D, ScanLine и КИМ Hexagon'
      ],
      primaryBtnText: 'Подробнее о ПО Geomagic',
      primaryAction: () => navigateTo('software', 'geomagic-design-x'),
      secondaryBtnText: 'Заказать демонстрацию',
      secondaryAction: () => openContactModal({ title: 'Заказ демонстрации Geomagic Design X / Control X', formType: 'consultation' }),
      card: {
        tag: 'Эталон реверс-инжиниринга',
        title: 'Geomagic Design X & Control X',
        subtitle: 'Профессиональный реверс-инжиниринг и 3D-инспекция',
        imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
        spec1Label: 'Моделирование',
        spec1Value: 'Твердые тела с историей (LiveTransfer CAD)',
        spec2Label: '3D-Контроль',
        spec2Value: 'Карты отклонений, FAI и расчет допусков GD&T',
        actionText: 'Открыть решения Geomagic',
        onCardClick: () => navigateTo('software', 'geomagic-design-x')
      }
    },
    {
      id: 'shining3d',
      category: 'Реверс-инжиниринг & Инспекция',
      tabCategory: 'Shining 3D',
      tabTitle: 'EXModel Pro & Inspect',
      badgeIcon: Cpu,
      title: 'Программное обеспечение Shining 3D: FreeScan, EXModel & Inspect',
      description: 'Комплексные программные решения для полного жизненного цикла 3D-данных: от высокоскоростного сбора и сшивки облаков точек FreeScan до твердотельного реверс-инжиниринга EXModel и метрологического контроля SHINING 3D Inspect с сертификатом PTB.',
      keyFeatures: [
        'Прямое извлечение геометрических примитивов и поверхностей из 3D-сеток',
        'Auto Surface: автоматическое натягивание гладких NURBS-поверхностей',
        'Live Deviation Analyzer: контроль точности прилегания в реальном времени',
        'SHINING 3D Inspect: сравнение с CAD, карты отклонений и протоколы'
      ],
      primaryBtnText: 'Подробнее о ПО Shining 3D',
      primaryAction: () => navigateTo('software', 'shining3d-exmodel'),
      secondaryBtnText: 'Заказать презентацию',
      secondaryAction: () => openContactModal({ title: 'Заказ презентации ПО Shining 3D (EXModel / Inspect)', formType: 'consultation' }),
      card: {
        tag: 'Официальный дилер',
        title: 'Shining 3D FreeScan, EXModel & Inspect',
        subtitle: 'Комплексное ПО для 3D-сканирования и контроля',
        imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        spec1Label: 'Функционал',
        spec1Value: 'Реверс-инжиниринг и метрология',
        spec2Label: 'Инструменты',
        spec2Value: 'Auto Surface, отклонения в реальном времени',
        actionText: 'Открыть решения Shining 3D',
        onCardClick: () => navigateTo('software', 'shining3d-exmodel')
      }
    }
  ];

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Auto-play timer (5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Smart Horizontal Scroll for slider container (Wheel & Touchpad swipe)
  useEffect(() => {
    const sliderEl = sliderRef.current;
    if (!sliderEl) return;

    const handleWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      // Detect intentional horizontal gesture (touchpad swipe or Shift+Wheel)
      if (absX > 18 && absX > absY) {
        e.preventDefault();
        if (isWheelThrottledRef.current) return;

        isWheelThrottledRef.current = true;
        if (e.deltaX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }

        setTimeout(() => {
          isWheelThrottledRef.current = false;
        }, 380);
      }
    };

    sliderEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      sliderEl.removeEventListener('wheel', handleWheel);
    };
  }, [nextSlide, prevSlide]);

  // Touch Swipe for mobile & tablet screens
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartXRef.current - touchEndX;
    const diffY = touchStartYRef.current - touchEndY;

    // Smart check: horizontal swipe exceeds 40px and dominates vertical movement
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Smart Auto-Scroll for Navigation Tabs (keep active tab centered horizontally without scrolling viewport)
  useEffect(() => {
    const tabsContainer = tabsContainerRef.current;
    const activeTab = document.getElementById(`hero-slide-tab-${currentSlide}`);
    if (tabsContainer && activeTab) {
      try {
        const containerRect = tabsContainer.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        const offset = (tabRect.left - containerRect.left) + tabsContainer.scrollLeft - (containerRect.width / 2) + (tabRect.width / 2);
        const targetScrollLeft = Math.max(0, offset);
        if (typeof tabsContainer.scrollTo === 'function') {
          tabsContainer.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
        } else {
          tabsContainer.scrollLeft = targetScrollLeft;
        }
      } catch (err) {
        console.warn('Tabs container scroll fallback:', err);
      }
    }
  }, [currentSlide]);

  // Horizontal wheel scroll on tabs row
  useEffect(() => {
    const tabsEl = tabsContainerRef.current;
    if (!tabsEl) return;

    const handleTabsWheel = (e: WheelEvent) => {
      // Only redirect wheel if Shift is held or intentional horizontal wheel is present, or if overflow exists and user is actively horizontal
      if (tabsEl.scrollWidth > tabsEl.clientWidth && e.shiftKey && e.deltaY !== 0) {
        e.preventDefault();
        tabsEl.scrollLeft += e.deltaY * 0.8;
      }
    };

    tabsEl.addEventListener('wheel', handleTabsWheel, { passive: false });
    return () => {
      tabsEl.removeEventListener('wheel', handleTabsWheel);
    };
  }, []);

  const activeSlide = slides[currentSlide];
  const CategoryIcon = activeSlide.badgeIcon;

  return (
    <section 
      id="main-hero-slider"
      className="relative overflow-hidden bg-white/20 dark:bg-slate-900/20 backdrop-blur-xs text-slate-900 dark:text-white py-1 sm:py-2 border-b border-gray-200/40 dark:border-[#112240]/40 snap-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-full min-w-0 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Main Slide Body: Exactly 650px on desktop (lg+), fully responsive and auto-height on mobile/tablet */}
        <div 
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="bg-gradient-to-r from-[#1B3679] via-[#1E3A8A] to-[#2563EB] text-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden w-full h-auto lg:h-[650px] flex flex-col justify-between border border-blue-400/25"
        >
          {/* Subtle Industrial Grid Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
          
          {/* 1. TOP TIER: Active Slide Content (Left Text/CTAs + Right Showcase Card) */}
          <div className="w-full relative z-10 flex-1 flex items-center mb-3 sm:mb-4 lg:mb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                className="w-full flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-8"
              >
                {/* Left Column: Heading, Description, Feature Bullets & CTAs */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2.5 sm:space-y-3.5 w-full">
                  <div className="space-y-1.5 sm:space-y-2">
                    {/* Category Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/25 text-xs font-semibold text-blue-200 backdrop-blur-xs w-fit shadow-xs">
                      <CategoryIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>{activeSlide.category}</span>
                    </div>

                    {/* Slide Title */}
                    <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight max-w-2xl drop-shadow-xs">
                      {activeSlide.title}
                    </h1>

                    {/* Slide Description */}
                    <p className="text-xs sm:text-sm lg:text-base text-blue-100/90 font-normal leading-relaxed max-w-2xl">
                      {activeSlide.description}
                    </p>
                  </div>

                  {/* Feature Bullets with Emerald Checkmarks */}
                  {activeSlide.keyFeatures && activeSlide.keyFeatures.length > 0 && (
                    <ul className="space-y-1.5 my-1 sm:my-2">
                      {activeSlide.keyFeatures.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm lg:text-base text-blue-100 font-medium leading-normal">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <button
                      onClick={activeSlide.primaryAction}
                      className="px-5 py-2.5 sm:px-6 sm:py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-black rounded-xl text-xs sm:text-sm lg:text-base shadow-md shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>{activeSlide.primaryBtnText}</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={activeSlide.secondaryAction}
                      className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/40 hover:border-white text-white font-bold rounded-xl text-xs sm:text-sm lg:text-base shadow-xs transition-all cursor-pointer"
                    >
                      {activeSlide.secondaryBtnText}
                    </button>
                  </div>
                </div>

                {/* Right Column: Premium Showcase Card exactly matching the visual archetype */}
                <div className="w-full lg:w-[480px] xl:w-[540px] 2xl:w-[580px] h-[330px] sm:h-[350px] lg:h-[365px] shrink-0 flex items-center justify-center">
                  <div className="w-full h-full max-w-full bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-[#233554] shadow-2xl flex flex-col justify-between hover:border-blue-400/50 transition-all">
                    {/* Card Header */}
                    <div className="flex items-center justify-between text-xs border-b border-gray-100 dark:border-[#233554] pb-1.5">
                      <span className="font-extrabold text-amber-500 dark:text-amber-400 uppercase tracking-wider text-[11px] sm:text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {activeSlide.card.tag}
                      </span>
                    </div>

                    {/* Card Image with 16:9 industrial proportions */}
                    <div className="relative rounded-xl overflow-hidden h-[135px] sm:h-[150px] lg:h-[160px] w-full bg-slate-900 shrink-0 border border-gray-200 dark:border-[#233554]/70 shadow-inner flex items-center justify-center">
                      <img
                        src={activeSlide.card.imageUrl}
                        alt={activeSlide.card.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Information Block */}
                    <div className="space-y-0.5">
                      <h3 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug truncate" title={activeSlide.card.title}>
                        {activeSlide.card.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 leading-tight truncate" title={activeSlide.card.subtitle}>
                        {activeSlide.card.subtitle}
                      </p>
                    </div>

                    {/* Dual Specifications Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/90 p-2 rounded-xl border border-gray-100 dark:border-[#233554]">
                      <div>
                        <div className="text-[10px] sm:text-[11px] uppercase font-black text-blue-600 dark:text-blue-400 tracking-wider truncate">
                          {activeSlide.card.spec1Label}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate" title={activeSlide.card.spec1Value}>
                          {activeSlide.card.spec1Value}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-[11px] uppercase font-black text-blue-600 dark:text-blue-400 tracking-wider truncate">
                          {activeSlide.card.spec2Label}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate" title={activeSlide.card.spec2Value}>
                          {activeSlide.card.spec2Value}
                        </div>
                      </div>
                    </div>

                    {/* Card Direct Action Button */}
                    <button
                      onClick={activeSlide.card.onCardClick}
                      className="w-full py-2 sm:py-2.5 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                    >
                      <span>{activeSlide.card.actionText}</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 2. MIDDLE TIER: 6 Major Company Activity Directions (Generous Size, Full 6-Col Grid on Desktop, Smooth Scroll on Mobile/Tablet) */}
          <div className="pt-2.5 lg:pt-3 border-t border-white/20 relative z-10 w-full mb-2.5 lg:mb-3">
            <div 
              ref={tabsContainerRef}
              className="overflow-x-auto scrollbar-none flex lg:grid lg:grid-cols-6 items-stretch gap-2 sm:gap-2.5 lg:gap-3 w-full py-0.5"
            >
              {slides.map((slide, idx) => {
                const isCurrent = currentSlide === idx;
                return (
                  <button
                    key={slide.id}
                    id={`hero-slide-tab-${idx}`}
                    onClick={() => goToSlide(idx)}
                    className={`shrink-0 lg:shrink min-w-[165px] sm:min-w-[185px] lg:min-w-0 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-center min-h-[58px] sm:min-h-[64px] ${
                      isCurrent
                        ? 'bg-white border-white text-slate-900 shadow-xl transform -translate-y-0.5'
                        : 'bg-white/10 hover:bg-white/20 border-white/25 hover:border-white/40 text-white shadow-xs backdrop-blur-xs'
                    }`}
                  >
                    <div>
                      <div className={`text-xs sm:text-sm xl:text-[15px] font-black leading-tight truncate ${
                        isCurrent ? 'text-slate-900' : 'text-white'
                      }`}>
                        {slide.tabCategory}
                      </div>
                      <div className={`text-[11px] sm:text-xs leading-snug line-clamp-1 mt-0.5 sm:mt-1 font-medium ${
                        isCurrent ? 'text-slate-500' : 'text-blue-100/90'
                      }`}>
                        {slide.tabTitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. BOTTOM TIER: Static Regalia Block (4 Columns Matching the Slider Palette and Image Layout) */}
          <div 
            id="hero-regalia-bar"
            className="pt-2.5 lg:pt-3 border-t border-white/20 relative z-10 w-full"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
              {/* 1. 31 год */}
              <div className="rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 backdrop-blur-xs p-2.5 sm:p-3 transition-all flex flex-col justify-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-400 leading-none tracking-tight">
                  {metric1Val}
                </div>
                <div className="text-[11px] sm:text-xs text-blue-100 font-medium mt-1 leading-snug">
                  {metric1Lbl}
                </div>
              </div>

              {/* 2. 500+ */}
              <div className="rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 backdrop-blur-xs p-2.5 sm:p-3 transition-all flex flex-col justify-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-400 leading-none tracking-tight">
                  {metric2Val}
                </div>
                <div className="text-[11px] sm:text-xs text-blue-100 font-medium mt-1 leading-snug">
                  {metric2Lbl}
                </div>
              </div>

              {/* 3. 0.9 мкм */}
              <div className="rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 backdrop-blur-xs p-2.5 sm:p-3 transition-all flex flex-col justify-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 leading-none tracking-tight">
                  {metric3Val}
                </div>
                <div className="text-[11px] sm:text-xs text-blue-100 font-medium mt-1 leading-snug">
                  {metric3Lbl}
                </div>
              </div>

              {/* 4. 24/7 */}
              <div className="rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 backdrop-blur-xs p-2.5 sm:p-3 transition-all flex flex-col justify-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-400 leading-none tracking-tight">
                  {metric4Val}
                </div>
                <div className="text-[11px] sm:text-xs text-blue-100 font-medium mt-1 leading-snug">
                  {metric4Lbl}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
