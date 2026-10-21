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
  Target,
  ExternalLink,
  Pause,
  Play,
  Scan
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ImageOptimized } from '../common/ImageOptimized';

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

  // Accurate, verified engineering metrics for the bottom tier (centered, balanced proportion)
  const metric1Val = siteTexts?.home?.metric1Value || '30+ лет';
  const metric1Lbl = siteTexts?.home?.metric1Label || 'практики CAD/CAM';
  const metric2Val = siteTexts?.home?.metric2Value || 'от 5 мк';
  const metric2Lbl = siteTexts?.home?.metric2Label || 'погрешность КИМ';
  const metric3Val = siteTexts?.home?.metric3Value || '24–48 часов';
  const metric3Lbl = siteTexts?.home?.metric3Label || 'выезд инженера по РФ';
  // User directive: Верхняя строка - "ПОВЕРЕННОЕ ОБОРУДОВАНИЕ", нижняя строка - "ФГИС «АРШИН»"
  const rawMetric4Val = siteTexts?.home?.metric4Value || 'ПОВЕРЕННОЕ ОБОРУДОВАНИЕ';
  const rawMetric4Lbl = siteTexts?.home?.metric4Label || 'ФГИС «АРШИН»';
  const metric4Val = (rawMetric4Val.toUpperCase().includes('АРШИН') || rawMetric4Lbl.toLowerCase().includes('поверенное'))
    ? 'ПОВЕРЕННОЕ ОБОРУДОВАНИЕ'
    : (rawMetric4Val || 'ПОВЕРЕННОЕ ОБОРУДОВАНИЕ');
  const metric4Lbl = (rawMetric4Val.toUpperCase().includes('АРШИН') || rawMetric4Lbl.toLowerCase().includes('поверенное'))
    ? 'ФГИС «АРШИН»'
    : (rawMetric4Lbl || 'ФГИС «АРШИН»');

  const slides: SlideData[] = [
    {
      id: 'equipment-supply',
      category: 'Поставка измерительного оборудования',
      tabCategory: 'Поставка оборудования',
      tabTitle: 'Мобильные КИМ, трекеры и сканеры',
      badgeIcon: Box,
      title: 'Поставка координатно-измерительных машин и 3D-сканеров',
      description: 'Официальные поставки портативных КИМ типа «рука» Hexagon Absolute Arm и PMT, лазерных трекеров Leica Geosystems, оптических 3D-сканеров Shining 3D FreeScan и ScanLine. Внесение в Госреестр СИ РФ (ФГИС «АРШИН»), поверка, пусконаладка и обучение операторов.',
      keyFeatures: [
        'Мобильные КИМ Hexagon и PMT с углепластиковыми звеньями и датчиками без инициализации',
        'Лазерные трекеры Leica с дальностью измерений до 160 метров и технологией 6DoF',
        'Полный комплекс пусконаладки, метрологической поверки и гарантийного сервиса'
      ],
      primaryBtnText: 'Каталог оборудования',
      primaryAction: () => navigateTo('hardware'),
      secondaryBtnText: 'Запросить ТКП и КП',
      secondaryAction: () => openContactModal({ title: 'Запрос коммерческого предложения на оборудование', formType: 'request' }),
      card: {
        tag: 'Госреестр СИ РФ',
        title: 'Hexagon Absolute Arm 8525 + AS1',
        subtitle: '7-осевая портативная КИМ высшей точности со сканером AS1',
        imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
        spec1Label: 'Погрешность MPE',
        spec1Value: '±0.016 мм (ISO 10360-12)',
        spec2Label: 'Рабочая зона',
        spec2Value: 'Сфера от 2.0 до 4.5 метров',
        actionText: 'Открыть характеристики КИМ',
        onCardClick: () => navigateTo('hardware', 'hexagon-absolute-arm-8520')
      }
    },
    {
      id: 'reverse-engineering',
      category: 'Услуги 3D-сканирования и реверс-инжиниринга',
      tabCategory: '3D-сканирование и реверс',
      tabTitle: 'Оцифровка и CAD-модели по ЕСКД',
      badgeIcon: Scan,
      title: 'Выездное 3D-сканирование и параметрический реверс-инжиниринг',
      description: 'Прецизионная оцифровка литых корпусов, турбинных лопаток, штампов, пресс-форм и изношенных деталей. Построение точных твердотельных CAD-моделей (STEP AP242, Parasolid .x_t) с деревом построения и комплекта рабочих чертежей по ЕСКД.',
      keyFeatures: [
        'Оперативный выезд инженера со сканером на предприятие по всей РФ за 24–48 часов',
        'Твердотельный параметрический B-Rep реверс в Geomagic Design X и TopSolid 7',
        'Устранение фактического износа и восстановление исходного номинала изделия'
      ],
      primaryBtnText: 'Подробнее о реверс-инжиниринге',
      primaryAction: () => navigateTo('services', 'reverse-engineering'),
      secondaryBtnText: 'Рассчитать стоимость',
      secondaryAction: () => openContactModal({ title: 'Расчет стоимости 3D-сканирования и реверса', formType: 'request' }),
      card: {
        tag: 'Выезд по всей РФ',
        title: 'Реверс сложных деталей и оснастки',
        subtitle: 'От облака точек до готовой твердотельной CAD-модели STEP / Parasolid',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        spec1Label: 'Выходной формат',
        spec1Value: 'STEP AP242, Parasolid .x_t, КД ЕСКД',
        spec2Label: 'Погрешность реверса',
        spec2Value: 'от ±0.015 мм по номиналу',
        actionText: 'Заказать реверс-инжиниринг',
        onCardClick: () => navigateTo('services', 'reverse-engineering')
      }
    },
    {
      id: 'cmm-inspection',
      category: 'Услуги контроля геометрии на КИМ',
      tabCategory: 'Контроль на КИМ',
      tabTitle: 'Анализ допусков GD&T и протоколы',
      badgeIcon: Target,
      title: 'Координатный контроль геометрии деталей и анализ допусков GD&T',
      description: 'Контактные и оптические измерения деталей на портативных КИМ Hexagon, лазерных трекерах Leica и стационарной КИМ Mitutoyo CRYSTA-Apex S (метро-зал в технопарке «Жигулевская долина»). Анализ допусков формы и расположения по ГОСТ Р 53442-2015 / ISO 1101.',
      keyFeatures: [
        'Цветовые 3D-карты фактических отклонений от CAD-модели (Color Map) в PolyWorks',
        'Контроль отклонений формы, биения, соосности, плоскостности и взаимного расположения',
        'Официальные метрологические протоколы измерений для ОТК и заказчиков'
      ],
      primaryBtnText: 'Подробнее о контроле на КИМ',
      primaryAction: () => navigateTo('services', 'parts-inspection'),
      secondaryBtnText: 'Заказать измерения',
      secondaryAction: () => openContactModal({ title: 'Заказ координатно-измерительного контроля на КИМ', formType: 'request' }),
      card: {
        tag: 'Метрология PolyWorks',
        title: 'Координатный контроль и анализ GD&T',
        subtitle: 'Контактный обмер щупом и сканирование по ГОСТ Р 53442-2015',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        spec1Label: 'Стандарты анализа',
        spec1Value: 'ГОСТ Р 53442-2015, ASME Y14.5, ISO 1101',
        spec2Label: 'Отчетность',
        spec2Value: 'Протокол FAI, цветовая карта отклонений',
        actionText: 'Заказать контроль на КИМ',
        onCardClick: () => navigateTo('services', 'parts-inspection')
      }
    },
    {
      id: 'topsolid-cadcam',
      category: 'Поставка и внедрение инженерного ПО',
      tabCategory: 'Внедрение TopSolid 7',
      tabTitle: 'Комплекс CAD / CAM / PDM',
      badgeIcon: Layers,
      title: 'TopSolid 7 — комплексное решение: CAD, CAM и встроенная PDM',
      description: 'Поставка лицензий, адаптация и внедрение интегрированной системы TopSolid 7 на машиностроительных заводах. Сквозное 3D-моделирование деталей и сборок, 2.5D–5D механообработка на станках с ЧПУ и централизованное управление данными об изделии.',
      keyFeatures: [
        'Единая среда CAD, CAM и встроенного PDM без промежуточных конвертаций форматов',
        'Прямое параметрическое моделирование штампов, пресс-форм и технологической оснастки',
        'Сквозное отслеживание изменений изделия с автоматическим пересчетом траекторий ЧПУ'
      ],
      primaryBtnText: 'Подробнее о TopSolid 7',
      primaryAction: () => navigateTo('software', 'topsolid-7'),
      secondaryBtnText: 'Запросить демо-версию',
      secondaryAction: () => openContactModal({ title: 'Запрос демонстрации и тестирования TopSolid 7', formType: 'trial' }),
      card: {
        tag: 'Официальный дилер',
        title: 'TopSolid 7 (CAD / CAM / PDM)',
        subtitle: 'Сквозное проектирование и механообработка на станках с ЧПУ',
        imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        spec1Label: 'Модули системы',
        spec1Value: 'Design, Cam 2D-5D, Mold, Progress, PDM',
        spec2Label: 'Станочный парк',
        spec2Value: 'Токарные, фрезерные, токарно-фрезерные ОЦ',
        actionText: 'Узнать больше о TopSolid',
        onCardClick: () => navigateTo('software', 'topsolid-7')
      }
    },
    {
      id: 'metrology-software',
      category: 'Метрологическое ПО и реверс',
      tabCategory: 'PolyWorks & Geomagic',
      tabTitle: 'Метрология и реверс-инжиниринг',
      badgeIcon: Cpu,
      title: 'Универсальное метрологическое ПО PolyWorks и Geomagic',
      description: 'Поставка и интеграция мировых стандартов 3D-метрологии: платформы PolyWorks|Inspector™ для координатных машин и 3D-сканеров, а также Geomagic Design X и Control X для реверс-инжиниринга и автоматизированного контроля первого изделия (FAI).',
      keyFeatures: [
        'PolyWorks|Inspector™: прямое подключение к 100+ моделям КИМ, трекеров и сканеров',
        'Geomagic Design X: извлечение конструктивных элементов из сеток с технологией LiveTransfer',
        'Сертифицированные математические алгоритмы PTB и NIST для расчета допусков'
      ],
      primaryBtnText: 'Каталог ПО',
      primaryAction: () => navigateTo('software'),
      secondaryBtnText: 'Заказать демонстрацию',
      secondaryAction: () => openContactModal({ title: 'Заказ демонстрации PolyWorks и Geomagic', formType: 'consultation' }),
      card: {
        tag: 'Сертификат PTB',
        title: 'PolyWorks & Geomagic Design X',
        subtitle: 'Программные эталоны 3D-контроля точности и твердотельного реверса',
        imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
        spec1Label: 'Совместимость',
        spec1Value: 'Hexagon, Leica, PMT, Mitutoyo, Shining 3D',
        spec2Label: 'Ядро расчетов',
        spec2Value: 'PTB Class 1, сертифицированные алгоритмы',
        actionText: 'Выбрать конфигурацию ПО',
        onCardClick: () => navigateTo('software', 'polyworks-inspector')
      }
    },
    {
      id: 'cnc-postprocessors',
      category: 'Внедрение станков с ЧПУ',
      tabCategory: 'Постпроцессоры ЧПУ',
      tabTitle: '3D-кинематика и постпроцессоры',
      badgeIcon: Wrench,
      title: 'Разработка кинематических моделей и постпроцессоров для станков с ЧПУ',
      description: 'Индивидуальная разработка и верификация постпроцессоров для 3-, 4- и 5-осевых фрезерных, токарно-фрезерных и эрозионных станков под стойки Fanuc, Siemens Sinumerik, Heidenhain, Haas. Построение точных кинематических 3D-моделей для полной симуляции без коллизий.',
      keyFeatures: [
        '100% защита от столкновений шпинделя и оснастки благодаря полной 3D-симуляции кинематики',
        'Поддержка непрерывной 5-осевой обработки, наклонных плоскостей (CYCLE800, PLANE SPATIAL, G68.2)',
        'Внедрение инженерами непосредственно на оборудовании заказчика с отработкой тестовой детали'
      ],
      primaryBtnText: 'Подробнее о постпроцессорах',
      primaryAction: () => navigateTo('services', 'postprocessors-dev'),
      secondaryBtnText: 'Заказать разработку',
      secondaryAction: () => openContactModal({ title: 'Заказ разработки постпроцессора для станка с ЧПУ', formType: 'request' }),
      card: {
        tag: 'Безаварийная обработка',
        title: 'Кинематические постпроцессоры ЧПУ',
        subtitle: 'Разработка под стойки Fanuc, Siemens Sinumerik, Heidenhain',
        imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
        spec1Label: 'Кинематика станков',
        spec1Value: '3D-двойник станка с симуляцией G-кода',
        spec2Label: 'Стойки управления',
        spec2Value: 'Fanuc, Sinumerik, Heidenhain, Балт-Систем',
        actionText: 'Заказать постпроцессор',
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

    // Responsive, reliable swipe: horizontal movement over 25px and dominating vertical motion
    if (Math.abs(diffX) > 25 && Math.abs(diffX) > Math.abs(diffY) * 0.75) {
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
      className="relative overflow-hidden bg-white/20 dark:bg-slate-900/20 backdrop-blur-xs text-slate-900 dark:text-white py-1 sm:py-1.5 border-b border-gray-200/40 dark:border-[#112240]/40 snap-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-full min-w-0 max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Main Slide Body: Locked height on desktop (lg+) to ensure 100% fit on one vertical page without scrolling and no height fluctuation when switching slides */}
        <div 
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="bg-gradient-to-r from-[#1B3679] via-[#1E3A8A] to-[#2563EB] text-white p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden w-full h-auto min-h-0 lg:h-[650px] flex flex-col justify-between border border-blue-400/25"
        >
          {/* Subtle Industrial Grid Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
          
          {/* 1. TOP TIER: Active Slide Content (Left Text/CTAs + Right Showcase Card) - Locked height on desktop */}
          <div className="w-full relative z-10 flex-1 flex items-center mb-2.5 lg:mb-0 min-h-0 lg:h-[370px] xl:h-[385px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -30 }}
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                className="w-full h-full flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6"
              >
                {/* Left Column: Heading, Description, Feature Bullets & CTAs */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2 sm:space-y-3 w-full">
                  <div className="space-y-1.5 sm:space-y-2">
                    {/* Top Row: Category Pill & Mobile Quick Switch Arrows */}
                    <div className="flex items-center justify-between w-full">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/25 text-[11px] sm:text-xs font-semibold text-blue-200 backdrop-blur-xs w-fit shadow-xs">
                        <CategoryIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>{activeSlide.category}</span>
                      </div>

                      {/* Mobile Fast Navigation Controls (Arrows & Indicator) */}
                      <div className="flex lg:hidden items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                          aria-label="Предыдущее направление"
                          className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 border border-white/30 flex items-center justify-center text-white transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-[11px] font-bold text-blue-200 px-1 font-mono">
                          {currentSlide + 1}/{slides.length}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                          aria-label="Следующее направление"
                          className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 border border-white/30 flex items-center justify-center text-white transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Slide Title - Constrained to 2 lines max to keep layout locked */}
                    <h1 
                      style={{ textWrap: 'balance' }} 
                      className="text-xl sm:text-2xl lg:text-3xl xl:text-[32px] font-black text-white leading-snug tracking-tight max-w-2xl drop-shadow-xs line-clamp-2"
                    >
                      {activeSlide.title}
                    </h1>

                    {/* Slide Description - Constrained to 2 lines to prevent height shifts */}
                    <p 
                      style={{ textWrap: 'balance' }} 
                      className="text-xs sm:text-sm lg:text-[14.5px] text-blue-100/95 font-normal leading-relaxed max-w-2xl line-clamp-2"
                    >
                      {activeSlide.description}
                    </p>
                  </div>

                  {/* Feature Bullets with Emerald Checkmarks - Uniform 3 items per slide */}
                  {activeSlide.keyFeatures && activeSlide.keyFeatures.length > 0 && (
                    <ul className="space-y-1 sm:space-y-1.5 my-1">
                      {activeSlide.keyFeatures.slice(0, 3).map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-blue-100 font-medium leading-snug">
                          <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="line-clamp-1">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                      onClick={activeSlide.primaryAction}
                      className="px-4.5 py-2.5 sm:px-5.5 sm:py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-black rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>{activeSlide.primaryBtnText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={activeSlide.secondaryAction}
                      className="px-4.5 py-2.5 sm:px-5.5 sm:py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/40 hover:border-white text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                    >
                      {activeSlide.secondaryBtnText}
                    </button>
                  </div>
                </div>

                {/* Right Column: Premium Showcase Card (Desktop visible, clean fit) */}
                <div className="hidden lg:flex w-full lg:w-[410px] xl:w-[440px] 2xl:w-[470px] lg:h-[330px] xl:h-[340px] shrink-0 items-center justify-center">
                  <div className="w-full bg-white dark:bg-slate-800 p-3 sm:p-3.5 rounded-2xl border border-gray-100 dark:border-[#233554] shadow-2xl flex flex-col justify-between hover:border-blue-400/50 transition-all">
                    {/* Card Header */}
                    <div className="flex items-center justify-between text-xs border-b border-gray-100 dark:border-[#233554] pb-1.5">
                      <span className="font-extrabold text-amber-500 dark:text-amber-400 uppercase tracking-wider text-[10px] sm:text-[11px] flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        {activeSlide.card.tag}
                      </span>
                    </div>

                    {/* Card Image with 16:9 industrial proportions */}
                    <div className="relative rounded-xl overflow-hidden h-[120px] sm:h-[135px] lg:h-[125px] w-full bg-slate-900 shrink-0 border border-gray-200 dark:border-[#233554]/70 shadow-inner flex items-center justify-center my-1.5">
                      <ImageOptimized
                        src={activeSlide.card.imageUrl}
                        alt={activeSlide.card.title}
                        priority={currentSlide === 0}
                        sizes="(max-width: 1024px) 100vw, 470px"
                        quality={85}
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover"
                      />
                    </div>

                    {/* Information Block */}
                    <div className="space-y-0.5">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight leading-snug truncate" title={activeSlide.card.title}>
                        {activeSlide.card.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-300 leading-tight truncate" title={activeSlide.card.subtitle}>
                        {activeSlide.card.subtitle}
                      </p>
                    </div>

                    {/* Dual Specifications Grid */}
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-50 dark:bg-slate-900/90 p-2 rounded-xl border border-gray-100 dark:border-[#233554] my-1">
                      <div>
                        <div className="text-[9px] sm:text-[10px] uppercase font-black text-blue-600 dark:text-blue-400 tracking-wider truncate">
                          {activeSlide.card.spec1Label}
                        </div>
                        <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate" title={activeSlide.card.spec1Value}>
                          {activeSlide.card.spec1Value}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] sm:text-[10px] uppercase font-black text-blue-600 dark:text-blue-400 tracking-wider truncate">
                          {activeSlide.card.spec2Label}
                        </div>
                        <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate" title={activeSlide.card.spec2Value}>
                          {activeSlide.card.spec2Value}
                        </div>
                      </div>
                    </div>

                    {/* Card Direct Action Button */}
                    <button
                      onClick={activeSlide.card.onCardClick}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                    >
                      <span>{activeSlide.card.actionText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 2. MIDDLE TIER: 6 Major Company Activity Directions - Generous, prominent block size */}
          <div className="pt-2.5 lg:pt-3 border-t border-white/20 relative z-10 w-full mb-2 lg:mb-2.5 shrink-0">
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
                    className={`shrink-0 lg:shrink min-w-[140px] sm:min-w-[180px] lg:min-w-0 p-2 sm:p-3 lg:p-3.5 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-center min-h-[56px] sm:min-h-[72px] lg:min-h-[76px] ${
                      isCurrent
                        ? 'bg-white border-white text-slate-900 shadow-xl transform -translate-y-0.5'
                        : 'bg-white/10 hover:bg-white/20 border-white/25 hover:border-white/40 text-white shadow-xs backdrop-blur-xs'
                    }`}
                  >
                    <div>
                      <div className={`text-xs sm:text-sm lg:text-[14px] font-black leading-snug truncate ${
                        isCurrent ? 'text-slate-900' : 'text-white'
                      }`}>
                        {slide.tabCategory}
                      </div>
                      <div className={`text-[10.5px] sm:text-xs leading-snug line-clamp-1 mt-1 font-medium ${
                        isCurrent ? 'text-slate-600' : 'text-blue-100/90'
                      }`}>
                        {slide.tabTitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. BOTTOM TIER: Static Regalia Block - Centered, enlarged and clearly separated from middle tier */}
          <div 
            id="hero-regalia-bar"
            className="pt-2.5 lg:pt-3 border-t border-white/20 relative z-10 w-full shrink-0 flex justify-center"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 w-full max-w-5xl mx-auto">
              {/* 1. 31 год */}
              <div className="rounded-xl sm:rounded-2xl border border-white/25 bg-white/12 hover:bg-white/20 backdrop-blur-xs py-2.5 px-3 sm:py-3 sm:px-4 transition-all flex flex-col items-center justify-center text-center min-h-[58px] sm:min-h-[64px] lg:min-h-[68px] shadow-xs">
                <div className="text-xl sm:text-2xl lg:text-[26px] font-black text-amber-400 leading-none tracking-tight text-center drop-shadow-2xs">
                  {metric1Val}
                </div>
                <div className="text-[11px] sm:text-xs text-blue-100 font-medium mt-1.5 leading-snug text-center max-w-[200px]">
                  {metric1Lbl}
                </div>
              </div>

              {/* 2. от 0.9 мкм */}
              <div className="rounded-xl sm:rounded-2xl border border-white/25 bg-white/12 hover:bg-white/20 backdrop-blur-xs py-2.5 px-3 sm:py-3 sm:px-4 transition-all flex flex-col items-center justify-center text-center min-h-[58px] sm:min-h-[64px] lg:min-h-[68px] shadow-xs">
                <div className="text-xl sm:text-2xl lg:text-[26px] font-black text-amber-400 leading-none tracking-tight text-center drop-shadow-2xs">
                  {metric2Val}
                </div>
                <div className="text-[11px] sm:text-xs text-blue-100 font-medium mt-1.5 leading-snug text-center max-w-[200px]">
                  {metric2Lbl}
                </div>
              </div>

              {/* 3. 100% CAD */}
              <div className="rounded-xl sm:rounded-2xl border border-white/25 bg-white/12 hover:bg-white/20 backdrop-blur-xs py-2.5 px-3 sm:py-3 sm:px-4 transition-all flex flex-col items-center justify-center text-center min-h-[58px] sm:min-h-[64px] lg:min-h-[68px] shadow-xs">
                <div className="text-xl sm:text-2xl lg:text-[26px] font-black text-emerald-400 leading-none tracking-tight text-center drop-shadow-2xs">
                  {metric3Val}
                </div>
                <div className="text-[11px] sm:text-xs text-blue-100 font-medium mt-1.5 leading-snug text-center max-w-[200px]">
                  {metric3Lbl}
                </div>
              </div>

              {/* 4. ПОВЕРЕННОЕ ОБОРУДОВАНИЕ / ФГИС «АРШИН» */}
              <div className="rounded-xl sm:rounded-2xl border border-white/25 bg-white/12 hover:bg-white/20 backdrop-blur-xs py-2.5 px-3 sm:py-3 sm:px-4 transition-all flex flex-col items-center justify-center text-center min-h-[58px] sm:min-h-[64px] lg:min-h-[68px] shadow-xs">
                <div className="text-xs sm:text-sm lg:text-[15px] font-black text-cyan-300 leading-snug uppercase tracking-wide text-center drop-shadow-2xs">
                  {metric4Val}
                </div>
                <div className="text-[11px] sm:text-xs text-blue-100 font-semibold mt-1 leading-snug text-center max-w-[200px]">
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
