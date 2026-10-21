import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Award, 
  Compass, 
  Layers, 
  Cpu, 
  Target, 
  Maximize2, 
  ArrowRight, 
  FileSpreadsheet, 
  CheckCircle2, 
  Zap, 
  Play, 
  Pause,
  ExternalLink,
  Wrench,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';

export interface FeaturedEquipmentItem {
  id: string;
  name: string;
  brand: string;
  brandId: string;
  category: 'arms' | 'trackers' | 'scanners' | 'cmm';
  categoryLabel: string;
  typeLabel: string;
  badge: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'purple';
  arshinStatus: string;
  accuracy: string;
  range: string;
  speedOrSensor: string;
  softwareCompatibility: string[];
  description: string;
  image: string;
  targetProductSlug?: string;
  targetCategory?: 'hardware' | 'services';
  highlights: string[];
}

export const FEATURED_EQUIPMENT_DATA: FeaturedEquipmentItem[] = [
  {
    id: 'hexagon-arm-8525-as1',
    name: 'Hexagon Absolute Arm 8525 со сканером AS1',
    brand: 'HEXAGON Manufacturing Intelligence',
    brandId: 'HEXAGON',
    category: 'arms',
    categoryLabel: 'Мобильные КИМ (руки)',
    typeLabel: '7-осевая портативная КИМ высшей точности + 3D-сканер AS1',
    badge: 'Флагман точности',
    badgeColor: 'blue',
    arshinStatus: 'Госреестр СИ РФ (ФГИС «АРШИН»)',
    accuracy: '±0.016 мм (ISO 10360-12)',
    range: '2.0 – 4.5 м (рабочая сфера)',
    speedOrSensor: 'Сканер AS1: 1.2 млн тчк/с (SHINE лазер)',
    softwareCompatibility: ['PolyWorks|Inspector™', 'Geomagic Control X', 'PC-DMIS'],
    description: 'Эталонная 7-осевая мобильная измерительная рука с углепластиковыми звеньями и абсолютными датчиками положения (готовность к замерам без инициализации осей). Обеспечивает комбинированный контактный обмер щупом и сверхскоростное 3D-сканирование зеркальных и черных поверхностей.',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    targetProductSlug: 'hexagon-absolute-arm-8520',
    targetCategory: 'hardware',
    highlights: [
      'Абсолютные угловые энкодеры — замер сразу после включения',
      'Лазерный сканер AS1 с синим лазером и технологией SHINE',
      'Встроенная термокомпенсация и беспроводной режим Wi-Fi'
    ]
  },
  {
    id: 'leica-tracker-at960',
    name: 'Лазерный трекер Leica Absolute Tracker AT960',
    brand: 'Leica Geosystems (HEXAGON)',
    brandId: 'Leica Geosystems',
    category: 'trackers',
    categoryLabel: 'Лазерные трекеры',
    typeLabel: '6DoF прецизионный лазерный трекер для крупногабаритных объектов',
    badge: 'Авиакосмический эталон',
    badgeColor: 'purple',
    arshinStatus: 'Госреестр СИ РФ (ФГИС «АРШИН»)',
    accuracy: 'MPE: 15 мкм + 6 мкм/м (ISO 10360-10)',
    range: 'до 160 м (диаметр сферы со сферическим рефлектором SMR)',
    speedOrSensor: '6DoF частота: 1000 Гц + щуп T-Probe / сканер AS1',
    softwareCompatibility: ['PolyWorks|Inspector™', 'SpatialAnalyzer', 'Metrolog X4'],
    description: 'Универсальный координатно-измерительный комплекс для сборки планеров, станин прессов, турбин и крупной оснастки. Поддерживает 6 степеней свободы (6DoF), бесконтактный щуп Leica T-Probe и ручной сканер AS1 без наклеивания маркеров.',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    targetProductSlug: 'leica-absolute-tracker-at960',
    targetCategory: 'hardware',
    highlights: [
      'Технология автоматического захвата луча PowerLock',
      'Динамическое отслеживание перемещений в реальном времени (1000 Гц)',
      'Измерения скрытых зон с помощью беспроводного щупа T-Probe'
    ]
  },
  {
    id: 'leica-tracker-ats600',
    name: 'Leica Absolute Tracker ATS600 (Direct Scanning)',
    brand: 'Leica Geosystems (HEXAGON)',
    brandId: 'Leica Geosystems',
    category: 'trackers',
    categoryLabel: 'Лазерные трекеры',
    typeLabel: 'Лазерный трекер прямого бесконтактного сканирования без мишеней',
    badge: 'Прямое сканирование',
    badgeColor: 'emerald',
    arshinStatus: 'Госреестр СИ РФ (ФГИС «АРШИН»)',
    accuracy: 'Сканирование: до ±0.1 мм на 40 м, рефлектор: ±15 мкм',
    range: 'до 60–80 м без мишеней (до 160 м с SMR)',
    speedOrSensor: 'Прямой лазерный луч (Waveform Digitiser)',
    softwareCompatibility: ['PolyWorks|Inspector™', 'Geomagic Control X'],
    description: 'Инновационный лазерный трекер, сочетающий метрологическую точность рефлекторных измерений с возможностью прямого дистанционного 3D-сканирования поверхностей крупногабаритных объектов (корпуса судов, фюзеляжи, крупное литье) без физического доступа оператора.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    targetProductSlug: 'leica-absolute-tracker-ats600',
    targetCategory: 'hardware',
    highlights: [
      'Сканирование без наклеивания световозвращающих марок и мишеней',
      'Безопасная работа с труднодоступными и горячими конструкциями',
      'Автоматическое сеточное сканирование заданных областей CAD'
    ]
  },
  {
    id: 'leica-tracker-at403',
    name: 'Лазерный трекер Leica Absolute Tracker AT403',
    brand: 'Leica Geosystems (HEXAGON)',
    brandId: 'Leica Geosystems',
    category: 'trackers',
    categoryLabel: 'Лазерные трекеры',
    typeLabel: 'Ультрапортативный цеховой лазерный трекер IP54',
    badge: 'Цеховой монтаж',
    badgeColor: 'amber',
    arshinStatus: 'Госреестр СИ РФ (ФГИС «АРШИН»)',
    accuracy: '±15 мкм + 6 мкм/м (ISO 10360-10)',
    range: 'до 320 м (диаметр рабочей зоны)',
    speedOrSensor: 'Встроенный абсолютный интерферометр (AIFM)',
    softwareCompatibility: ['PolyWorks|Inspector™', 'SpatialAnalyzer'],
    description: 'Всепогодный портативный лазерный трекер с защитой IP54, встроенным Wi-Fi и питанием от аккумуляторов с горячей заменой. Идеален для нивелирования, выверки станин прокатных станов, гидроагрегатов и крупногабаритного монтажа в цеховых условиях.',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    targetProductSlug: 'leica-absolute-tracker-at403',
    targetCategory: 'hardware',
    highlights: [
      'Промышленный класс защиты IP54 для работы в пыли и влаге',
      'Автономная работа от 2 аккумуляторов с возможностью непрерывной смены',
      'Ультракомпактный кейс для транспортировки самолетом'
    ]
  },
  {
    id: 'pmt-alpha-arm-7axis',
    name: 'Портативная мобильная КИМ PMT Alpha Arm (7 осей)',
    brand: 'PMT Precision Metrology',
    brandId: 'PMT',
    category: 'arms',
    categoryLabel: 'Мобильные КИМ (руки)',
    typeLabel: '7-осевая измерительная рука с лазерным сканером PMT GH',
    badge: 'Промышленный стандарт',
    badgeColor: 'blue',
    arshinStatus: 'Госреестр СИ РФ (ФГИС «АРШИН»)',
    accuracy: 'Контактный замер: от ±0.018 мм (ISO 10360-12)',
    range: '1.5 – 4.5 м (рабочий диапазон)',
    speedOrSensor: 'Сканер PMT GH: синий лазер до 600 000 тчк/с',
    softwareCompatibility: ['PolyWorks|Inspector™', 'RationalDMIS', 'Geomagic'],
    description: 'Надежная цеховая измерительная машина типа «рука» на карбоновой раме с внутренней противовесной балансировкой Zero-G. Быстрое крепление на магнитную плиту, вакуумный стол или тяжелую стойку для экспресс-контроля деталей прямо на станке с ЧПУ.',
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
    targetProductSlug: 'pmt-alpha-arm',
    targetCategory: 'hardware',
    highlights: [
      'Внутренняя балансировка Zero-G снижает усталость оператора',
      'Энкодеры Renishaw с высокой повторяемостью угловых координат',
      'Прямая интеграция в PolyWorks|Inspector™ для построения карт GD&T'
    ]
  },
  {
    id: 'freescan-combo-scanline',
    name: 'Оптический гибридный 3D-сканер ScanLine / Shining 3D FreeScan Combo',
    brand: 'ScanLine / SHINING 3D',
    brandId: 'SHINING 3D',
    category: 'scanners',
    categoryLabel: '3D-сканеры',
    typeLabel: 'Метрологический лазерно-оптический сканер с фотограмметрией',
    badge: 'Госреестр СИ РФ',
    badgeColor: 'emerald',
    arshinStatus: 'Внесен в Государственный реестр средств измерений РФ',
    accuracy: 'до 0.020 мм (объемная: 0.02 + 0.015 мм/м)',
    range: 'Объекты от 10 мм до 10 000 мм',
    speedOrSensor: '26 лазерных линий + встроенная фотограмметрия (1.86 млн тчк/с)',
    softwareCompatibility: ['PolyWorks|Inspector™', 'Geomagic Design X', 'Inspect PTB 1'],
    description: 'Компактный гибридный метрологический сканер весом всего 620 г. Сочетает высокую скорость синего лазерного массива (26 линий) со встроенной оптической фотограмметрией, что исключает накопление погрешности при сканировании длинномерных деталей.',
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    targetProductSlug: 'freescan-combo',
    targetCategory: 'hardware',
    highlights: [
      'Встроенная фотограмметрия для оцифровки крупногабаритных рам и штампов',
      'Режим глубоких отверстий (одиночный лазерный луч) для узких полостей',
      'Сертификат поверки ВНИИМС со внесением в систему «АРШИН»'
    ]
  }
];

export const KeyEquipmentCarousel: React.FC = () => {
  const { openContactModal, navigateTo } = useApp();
  const [activeCategory, setActiveCategory] = useState<'all' | 'arms' | 'trackers' | 'scanners'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return FEATURED_EQUIPMENT_DATA;
    return FEATURED_EQUIPMENT_DATA.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  // Autoplay interval
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filteredItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, filteredItems.length]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % filteredItems.length);
  };

  const currentItem = filteredItems[currentIndex] || filteredItems[0];

  const handleRequestQuote = (item: FeaturedEquipmentItem) => {
    openContactModal({
      title: `Запрос КП и технических условий: ${item.name}`,
      defaultProduct: item.name,
      formType: 'quote'
    });
  };

  const handleViewCatalog = (item: FeaturedEquipmentItem) => {
    navigateTo('hardware');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Title and Category Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 pt-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300 text-xs font-bold rounded-md mb-2 uppercase tracking-wider border border-blue-200 dark:border-blue-800 shadow-xs">
            <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Модельный ряд оборудования</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ключевые мобильные КИМ, трекеры и 3D-сканеры
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Поставляем высокоточные средства измерений из Госреестра СИ РФ с поверкой, пусконаладкой и техническим сопровождением
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-1 ring-blue-500/20'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Все приборы ({FEATURED_EQUIPMENT_DATA.length})
          </button>
          <button
            onClick={() => setActiveCategory('arms')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
              activeCategory === 'arms'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-1 ring-blue-500/20'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Мобильные КИМ-руки (до 4.5 м)
          </button>
          <button
            onClick={() => setActiveCategory('trackers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
              activeCategory === 'trackers'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-1 ring-blue-500/20'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Лазерные трекеры Leica (до 160 м)
          </button>
          <button
            onClick={() => setActiveCategory('scanners')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
              activeCategory === 'scanners'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-1 ring-blue-500/20'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Оптические 3D-сканеры FreeScan
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Carousel Card */}
      <div 
        ref={containerRef}
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
        className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Visual & Brand Profile (5 cols) */}
          <div className="lg:col-span-5 relative bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 flex flex-col justify-between p-6 sm:p-8 text-white min-h-[320px] lg:min-h-[440px] overflow-hidden">
            {/* Background image overlay with gradient */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
              style={{ backgroundImage: `url(${currentItem.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/50" />

            {/* Top Badges */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentItem.badge}</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ФГИС «АРШИН»</span>
              </div>
            </div>

            {/* Bottom Brand Summary on Image */}
            <div className="relative z-10 space-y-2 pt-16">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-slate-200 text-xs">
                <span className="font-semibold">{currentItem.brand}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm">
                {currentItem.name}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {currentItem.typeLabel}
              </p>
            </div>
          </div>

          {/* Right Column: Engineering Specifications & Capabilities (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-8 flex flex-col justify-between space-y-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            <div>
              {/* Top Meta info & quick nav */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                    {currentItem.categoryLabel}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Модель {currentIndex + 1} из {filteredItems.length}
                  </span>
                </div>

                {/* Autoplay & Navigation buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={isPlaying ? 'Приостановить автопрокрутку' : 'Включить автопрокрутку'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handlePrev}
                    className="p-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    aria-label="Предыдущая модель"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    aria-label="Следующая модель"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Technical description */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {currentItem.description}
              </p>

              {/* 4-Grid Key Metrological Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-4">
                {/* Spec 1: Accuracy */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-cyan-400 uppercase tracking-wider mb-1">
                    <Target className="w-3.5 h-3.5 shrink-0" />
                    <span>Точность / Погрешность (MPE)</span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                    {currentItem.accuracy}
                  </div>
                </div>

                {/* Spec 2: Range */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-cyan-400 uppercase tracking-wider mb-1">
                    <Maximize2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Рабочий диапазон (сфера)</span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                    {currentItem.range}
                  </div>
                </div>

                {/* Spec 3: Speed or Sensor */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-cyan-400 uppercase tracking-wider mb-1">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>Сбор данных / Датчик</span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                    {currentItem.speedOrSensor}
                  </div>
                </div>

                {/* Spec 4: Software Compatibility */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-cyan-400 uppercase tracking-wider mb-1">
                    <Cpu className="w-3.5 h-3.5 shrink-0" />
                    <span>Совместимость с ПО</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {currentItem.softwareCompatibility.map(sw => (
                      <span key={sw} className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-cyan-300 dark:border-blue-800 text-[10px] font-bold">
                        {sw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Highlights Checkmarks */}
              <div className="mt-3.5 space-y-1.5">
                {currentItem.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Indicator dots */}
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                {filteredItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentIndex === idx 
                        ? 'w-6 bg-blue-600' 
                        : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                    }`}
                    aria-label={`Перейти к слайду ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Target CTAs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewCatalog(currentItem)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Весь каталог КИМ</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => handleRequestQuote(currentItem)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Запросить ТКП и характеристики</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Thumbnails Strip for Instant Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {filteredItems.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setCurrentIndex(idx)}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
              currentIndex === idx
                ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 ring-2 ring-blue-500/20 shadow-sm text-blue-900 dark:text-white'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 block truncate">
                {item.brand.split(' ')[0]}
              </span>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1">
                {item.name.replace(/Hexagon|Leica|PMT|ScanLine|Shining 3D/gi, '').trim()}
              </span>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <span>{item.accuracy.split(' ')[0]}</span>
              <span className="text-[9px] font-sans px-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{item.badge.split(' ')[0]}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
