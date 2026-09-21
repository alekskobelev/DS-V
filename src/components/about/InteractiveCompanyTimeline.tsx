import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Award, 
  Sparkles, 
  Layers, 
  Cpu, 
  Scan, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Wrench, 
  Target, 
  Compass, 
  Clock, 
  Filter, 
  SlidersHorizontal,
  FileCheck,
  Zap,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface MilestoneItem {
  year: string;
  period: '1995-2005' | '2006-2015' | '2016-2021' | '2022-2026';
  category: 'foundation' | 'training' | 'cnc' | 'metrology' | 'software' | 'expansion' | 'innovation' | 'achievement';
  categoryLabel: string;
  title: string;
  badge: string;
  desc: string;
  fullDetails: string;
  metrics: string;
  techStack: string[];
  equipment: string;
  location: string;
}

export const MILESTONES_DATA: MilestoneItem[] = [
  {
    year: '1995',
    period: '1995-2005',
    category: 'foundation',
    categoryLabel: 'Основание и CAD/CAM',
    title: 'Основание компании в Самаре',
    badge: 'Истоки инженерной школы',
    desc: 'Создание ведущей инжиниринговой группы на базе экспертов Самарского аэрокосмического кластера («Делкам-Самара»).',
    fullDetails: 'Старт практического внедрения передовых CAD/CAM технологий на машиностроительных и авиационных предприятиях региона. Разработка математических моделей штамповой оснастки, пресс-форм и турбинных лопаток, заложивших основу 30-летней инженерной репутации компании.',
    metrics: 'Первые 10+ заводов-партнеров',
    techStack: ['CAD/CAM 1-го поколения', 'Parasolid', 'Штамповая оснастка'],
    equipment: 'Инженерные рабочие станции Silicon Graphics, координатные столы',
    location: 'Самара, аэрокосмический кластер'
  },
  {
    year: '2001',
    period: '1995-2005',
    category: 'training',
    categoryLabel: 'Обучение и кадры',
    title: 'Первый учебный центр CAD/CAM в Самаре',
    badge: 'Кадровый потенциал отрасли',
    desc: 'Открытие авторизованного учебного центра для технологов-программистов станков с ЧПУ.',
    fullDetails: 'Формирование авторских прикладных программ экспресс-подготовки инженеров-технологов без отрыва от производства. Подготовка более 200 высококвалифицированных специалистов для машиностроения Самарской области и сопредельных регионов.',
    metrics: '200+ сертифицированных специалистов',
    techStack: ['ЧПУ программирование', 'G-код', 'Основы CAM'],
    equipment: 'Учебные стенды со стойками ЧПУ Fanuc и Sinumerik',
    location: 'Самара, учебный класс'
  },
  {
    year: '2008',
    period: '2006-2015',
    category: 'cnc',
    categoryLabel: 'ЧПУ и Постпроцессоры',
    title: 'Специализированный отдел постпроцессоров и симуляторов',
    badge: 'Многоосевая синхронная обработка',
    desc: 'Формирование экспертной группы разработки кинематических постпроцессоров и цифровых двойников для 3-, 4- и 5-осевых станков.',
    fullDetails: 'Разработка прецизионных трансляторов управляющих программ для сложных кинематических схем фрезерных и токарно-фрезерных обрабатывающих центров (Siemens Sinumerik, Heidenhain, Fanuc, Haas, Syntec). Внедрение алгоритмов 100% верификации траекторий инструмента с исключением столкновений рабочих органов.',
    metrics: '100% защита от столкновений',
    techStack: ['Heidenhain iTNC/TNC', 'Sinumerik 840D', 'Fanuc 31i', 'Кинематические симуляторы'],
    equipment: 'Виртуальные 3D-модели станков DMU, Hermle, Mazak, Doosan',
    location: 'Самара, конструкторский отдел'
  },
  {
    year: '2012',
    period: '2006-2015',
    category: 'metrology',
    categoryLabel: 'Метрология и КИМ',
    title: 'Официальный дилер HEXAGON Manufacturing Intelligence',
    badge: 'Портативные КИМ и цеховой контроль',
    desc: 'Получение официального дилерского статуса мирового лидера в области метрологии HEXAGON MI в Российской Федерации.',
    fullDetails: 'Старт поставок, шеф-монтажа и сервисного обслуживания портативных координатно-измерительных машин типа «рука» Hexagon Absolute Arm (серии 73, 75, 85) и лазерных сканеров RS6. Открытие направления мобильного бесконтактного контроля геометрии крупногабаритных деталей непосредственно на производственных участках.',
    metrics: 'Точность до 0.020 мм в цеху',
    techStack: ['Hexagon Absolute Arm', 'Лазерный сканер RS6', 'PC-DMIS'],
    equipment: 'Мобильные измерительные манипуляторы Hexagon 8520, 8320',
    location: 'Самара / Тольятти / Выезд по РФ'
  },
  {
    year: '2017',
    period: '2016-2021',
    category: 'software',
    categoryLabel: 'САПР и PDM платформы',
    title: 'Официальный дистрибьютор TOPSOLID SAS (Франция)',
    badge: 'Единое цифровое ядро предприятия',
    desc: 'Подписание прямого генерального дистрибьюторского соглашения с TOPSOLID SAS в РФ.',
    fullDetails: 'Создание центра компетенций и внедрение комплексной интегрированной линейки TopSolid 7: Design (3D-моделирование), CAM (фрезерная, токарная, эрозионная обработка), Mold & Progress (проектирование штампов и пресс-форм) и защищенной среды управления инженерными данными TopSolid PDM.',
    metrics: 'Сквозное ядро Parasolid 7',
    techStack: ['TopSolid Design', 'TopSolid Cam', 'TopSolid Mold & Progress', 'TopSolid PDM'],
    equipment: 'Авторизованный учебно-демонстрационный стенд TopSolid 7',
    location: 'Главный офис в Самаре'
  },
  {
    year: '2020',
    period: '2016-2021',
    category: 'metrology',
    categoryLabel: '3D-сканирование и КИМ',
    title: 'Запуск Метрологического зала и парка 3D-сканеров',
    badge: 'Субмикронная точность 1.7 мкм',
    desc: 'Оснащение собственного метрологического центра стационарной КИМ Mitutoyo CRYSTA-Apex S и оптическими 3D-сканерами.',
    fullDetails: 'Ввод в эксплуатацию высокоточной стационарной КИМ портального типа Mitutoyo CRYSTA-Apex S 9106 с температурной компенсацией реального времени и погрешностью E0,MPE от 1.7 мкм. Формирование мобильного парка ручных лазерных сканеров ScanLine EasyScan Omni и Shining 3D FreeScan OMNI. Внедрение эталонного ПО PolyWorks|Inspector™ и Geomagic Control X для оформления отчетов GD&T по ГОСТ Р ИСО 1101.',
    metrics: 'Погрешность от 1.7 мкм (ГОСТ Р ИСО 10360)',
    techStack: ['Mitutoyo MCOSMOS', 'PolyWorks|Inspector™', 'Geomagic Control X', 'GD&T ГОСТ Р ИСО 1101'],
    equipment: 'КИМ Mitutoyo CRYSTA-Apex S 9106, 3D-сканеры FreeScan OMNI',
    location: 'Метрологический зал Тольятти / Самара'
  },
  {
    year: '2023',
    period: '2022-2026',
    category: 'expansion',
    categoryLabel: 'Инфраструктура и Тольятти',
    title: 'Метрологический зал в Технопарке «Жигулевская долина»',
    badge: 'Хаб инноваций в Тольятти',
    desc: 'Открытие офиса (корпус 2.3) и демонстрационно-метрологического зала (корпус 3.2) в Технопарке высоких технологий.',
    fullDetails: 'Развертывание крупнейшего регионального демо-центра точных измерений в Тольятти. Дооснащение парка оборудования прецизионным лазерным трекером Leica Absolute Tracker AT403 для крупногабаритных измерений станин, оснастки и сборок с радиусом действия до 160 метров. Оперативная поддержка автомобильного кластера Самарской области.',
    metrics: 'Дистанция трекера до 160 метров',
    techStack: ['Leica Absolute Tracker AT403', 'Крупногабаритная метрология', 'PolyWorks'],
    equipment: 'Лазерный трекер Leica AT403, КИМ Hexagon ARM 8520, зал в корпусе 3.2',
    location: 'Тольятти, Южное шоссе 165 (Технопарк «Жигулевская долина»)'
  },
  {
    year: '2025',
    period: '2022-2026',
    category: 'innovation',
    categoryLabel: 'Импортонезависимость и Реверс',
    title: 'Линейка КИМ PMT и суверенный реверс-инжиниринг',
    badge: 'Технологический суверенитет',
    desc: 'Прямые поставки портативных КИМ «рука» PMT Alpha Arm и масштабирование услуг реверс-инжиниринга критических узлов.',
    fullDetails: 'Формирование независимого пула метрологического оборудования: поставка, сертификация и сервисная калибровка портативных КИМ PMT Alpha Arm (точность 0.015 мм). Воссоздание параметрических твердотельных CAD-моделей сложных импортных турбин, редукторов и пресс-форм по данным 3D-сканирования с полным пакетом КД по стандартам ЕСКД.',
    metrics: '50+ выполненных проектов реверса',
    techStack: ['PMT Alpha Arm', 'Geomagic Design X', 'EXModel Pro', 'Чертежи по ЕСКД'],
    equipment: 'КИМ-рука PMT Alpha Arm, 3D-сканеры Shining3D FreeScan Combo',
    location: 'Самара, Тольятти и выезд на предприятия РФ'
  },
  {
    year: '2026',
    period: '2022-2026',
    category: 'achievement',
    categoryLabel: 'Юбилейный рубеж',
    title: 'Более 30 лет инженерного лидерства в РФ (1995–2026)',
    badge: '30+ лет практики',
    desc: '500+ успешных проектов, 300+ постпроцессоров, 2 филиала и доверие сотен предприятий России.',
    fullDetails: 'Юбилейная веха развития «ДС-Инжиниринг». За три десятилетия компания превратилась из самарской инженерной лаборатории в один из ведущих российских центров внедрения САПР TopSolid 7, разработки специализированных постпроцессоров для 5-осевых станков с ЧПУ, поставок КИМ и выполнения сложнейших метрологических экспертиз по всей стране.',
    metrics: '31 год на рынке • 500+ проектов • 300+ постпроцессоров',
    techStack: ['Сквозной цифровой цикл CAD/CAM/PDM/Metrology', 'Цифровые двойники'],
    equipment: 'Полный парк стационарных КИМ, трекеров Leica, сканеров и ПО',
    location: 'Главный офис (Самара) • Метрологический зал (Тольятти)'
  }
];

type EraFilter = 'all' | '1995-2005' | '2006-2015' | '2016-2021' | '2022-2026';
type ViewMode = 'timeline' | 'focus';

export const InteractiveCompanyTimeline: React.FC = () => {
  const { openContactModal, navigateTo } = useApp();
  
  const [selectedEra, setSelectedEra] = useState<EraFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number>(MILESTONES_DATA.length - 1);
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({
    '2026': true,
    '2023': true
  });

  const filteredMilestones = useMemo(() => {
    if (selectedEra === 'all') return MILESTONES_DATA;
    return MILESTONES_DATA.filter(m => m.period === selectedEra);
  }, [selectedEra]);

  const toggleExpand = (year: string) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const currentFocusMilestone = MILESTONES_DATA[selectedMilestoneIndex];

  const handlePrevFocus = () => {
    setSelectedMilestoneIndex(prev => (prev > 0 ? prev - 1 : MILESTONES_DATA.length - 1));
  };

  const handleNextFocus = () => {
    setSelectedMilestoneIndex(prev => (prev < MILESTONES_DATA.length - 1 ? prev + 1 : 0));
  };

  const getCategoryColor = (category: MilestoneItem['category']) => {
    switch (category) {
      case 'foundation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'training':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cnc':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'metrology':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'software':
        return 'bg-indigo-100 text-indigo-900 border-indigo-200';
      case 'expansion':
        return 'bg-cyan-100 text-cyan-900 border-cyan-200';
      case 'innovation':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      case 'achievement':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-xs';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: MilestoneItem['category']) => {
    switch (category) {
      case 'foundation':
        return <Building2 className="w-4 h-4" />;
      case 'training':
        return <BookOpen className="w-4 h-4" />;
      case 'cnc':
        return <Cpu className="w-4 h-4" />;
      case 'metrology':
        return <Scan className="w-4 h-4" />;
      case 'software':
        return <Layers className="w-4 h-4" />;
      case 'expansion':
        return <Compass className="w-4 h-4" />;
      case 'innovation':
        return <Wrench className="w-4 h-4" />;
      case 'achievement':
        return <Award className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Controls Bar */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Более 30 лет непрерывной инженерной практики</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
              Интерактивная хронология развития (1995–2026)
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
              Ключевые этапы становления ООО «ДС-Инжиниринг»: от внедрения первых CAD/CAM в Самаре до дистрибьюции TopSolid 7, парка КИМ и метрологического зала в Технопарке «Жигулевская долина».
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl shrink-0 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-4.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-gray-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Вся шкала</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('focus')}
              className={`px-4.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'focus'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-gray-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Фокус по годам</span>
            </button>
          </div>
        </div>

        {/* Era Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Период:</span>
          </span>

          {[
            { id: 'all', label: 'Все этапы (1995–2026)', count: MILESTONES_DATA.length },
            { id: '1995-2005', label: '1995–2005: Становление CAD/CAM', count: 2 },
            { id: '2006-2015', label: '2006–2015: ЧПУ и КИМ Hexagon', count: 2 },
            { id: '2016-2021', label: '2016–2021: TopSolid и Метрология', count: 2 },
            { id: '2022-2026', label: '2022–2026: Технопарк и Суверенитет', count: 3 }
          ].map((era) => {
            const isActive = selectedEra === era.id;
            return (
              <button
                key={era.id}
                type="button"
                onClick={() => setSelectedEra(era.id as EraFilter)}
                className={`px-4.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-gray-900 border border-slate-200'
                }`}
              >
                <span>{era.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {era.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. VIEW MODE 1: VISUAL INTERACTIVE TIMELINE */}
      {viewMode === 'timeline' && (
        <div className="relative">
          {/* Central Vertical Connecting Track */}
          <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 bg-gradient-to-b from-blue-300 via-indigo-400 to-blue-700 rounded-full hidden sm:block opacity-60"></div>
          <div className="absolute left-6 top-4 bottom-4 w-1 bg-gradient-to-b from-blue-300 via-indigo-400 to-blue-700 rounded-full sm:hidden opacity-60"></div>

          <div className="space-y-8 sm:space-y-12">
            <AnimatePresence mode="popLayout">
              {filteredMilestones.map((milestone, idx) => {
                const isEven = idx % 2 === 0;
                const isExpanded = Boolean(expandedYears[milestone.year]);
                const isLatest = milestone.year === '2026';

                return (
                  <motion.div
                    key={milestone.year}
                    layout
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    className={`relative flex flex-col sm:flex-row items-start sm:items-center ${
                      isEven ? 'sm:flex-row-reverse' : ''
                    } gap-4 sm:gap-8`}
                  >
                    {/* Node on central axis */}
                    <div className="absolute left-6 sm:left-1/2 top-6 -translate-x-1/2 z-20 flex items-center justify-center">
                      <motion.div 
                        whileHover={{ scale: 1.25 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 transition-transform cursor-pointer ${
                          isLatest
                            ? 'bg-amber-500 border-white text-white ring-4 ring-amber-300/50'
                            : 'bg-blue-600 border-white text-white ring-4 ring-blue-100'
                        }`}
                        onClick={() => toggleExpand(milestone.year)}
                      >
                        {getCategoryIcon(milestone.category)}
                      </motion.div>
                    </div>

                    {/* Content Card (Left or Right on desktop) */}
                    <div className={`w-full sm:w-[calc(50%-2.5rem)] pl-14 sm:pl-0 ${
                      isEven ? 'sm:pr-4' : 'sm:pl-4'
                    }`}>
                      <div className={`bg-white rounded-xl p-6 sm:p-7 border transition-all duration-300 shadow-xs hover:shadow-md ${
                        isLatest 
                          ? 'border-amber-300 bg-gradient-to-br from-amber-50/20 via-white to-white' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}>
                        {/* Top Meta Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xl sm:text-2xl font-black text-blue-700 tracking-tight">
                              {milestone.year}
                            </span>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getCategoryColor(milestone.category)}`}>
                              {milestone.badge}
                            </span>
                          </div>

                          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="truncate max-w-[180px]">{milestone.location}</span>
                          </span>
                        </div>

                        {/* Title & Short Description */}
                        <div className="mt-3 space-y-2">
                          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 leading-snug">
                            {milestone.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                            {milestone.desc}
                          </p>
                        </div>

                        {/* Highlighted Metric Badge */}
                        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>{milestone.metrics}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                            {milestone.categoryLabel}
                          </span>
                        </div>

                        {/* Collapsible Full Context */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3.5 text-xs text-slate-500 leading-relaxed">
                                <p className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/80 text-blue-950">
                                  {milestone.fullDetails}
                                </p>

                                <div className="space-y-1.5">
                                  <div className="font-bold text-gray-800 flex items-center gap-1.5 text-[11px]">
                                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Технологический стек и ПО:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {milestone.techStack.map((tech, tIdx) => (
                                      <span key={tIdx} className="bg-slate-100 text-slate-800 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border border-slate-200">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="font-bold text-gray-800 flex items-center gap-1.5 text-[11px]">
                                    <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Оборудование и инфраструктура:</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500">
                                    {milestone.equipment}
                                  </p>
                                </div>

                                <div className="pt-2 flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => openContactModal({ title: `Консультация по направлению (${milestone.year})`, formType: 'consultation' })}
                                    className="px-4.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                  >
                                    <span>Запросить консультацию инженера</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>

                                  {milestone.category === 'metrology' && (
                                    <button
                                      type="button"
                                      onClick={() => navigateTo('hardware')}
                                      className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                                    >
                                      Каталог оборудования
                                    </button>
                                  )}

                                  {milestone.category === 'software' && (
                                    <button
                                      type="button"
                                      onClick={() => navigateTo('software')}
                                      className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                                    >
                                      Модули TopSolid 7
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Expand/Collapse Trigger */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleExpand(milestone.year)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{isExpanded ? 'Свернуть подробности' : 'Развернуть технические детали'}</span>
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? '-rotate-90' : 'rotate-90'}`} />
                          </button>

                          <span className="text-[10px] text-gray-400 font-mono">
                            {milestone.period}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Empty spacer for the alternating layout on desktop */}
                    <div className="hidden sm:block sm:w-[calc(50%-2.5rem)]"></div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 3. VIEW MODE 2: FOCUS CAROUSEL BY YEAR */}
      {viewMode === 'focus' && currentFocusMilestone && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          {/* Top Year Switcher Bar */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Выберите веху на шкале:
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {MILESTONES_DATA.map((item, idx) => {
                const isCurrent = idx === selectedMilestoneIndex;
                return (
                  <button
                    key={item.year}
                    type="button"
                    onClick={() => setSelectedMilestoneIndex(idx)}
                    className={`px-4 py-2.5 rounded-xl font-mono text-sm font-black transition-all shrink-0 cursor-pointer flex flex-col items-center gap-0.5 border ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{item.year}</span>
                    <span className={`text-[9px] font-sans font-semibold truncate max-w-[80px] ${
                      isCurrent ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animated Stage Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFocusMilestone.year}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-900 dark:text-white rounded-2xl p-6 sm:p-10 relative overflow-hidden space-y-6 border border-slate-300 dark:border-slate-800 shadow-xs"
            >
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-400/30 mb-2">
                    {getCategoryIcon(currentFocusMilestone.category)}
                    <span>{currentFocusMilestone.categoryLabel}</span>
                    <span>•</span>
                    <span>{currentFocusMilestone.period}</span>
                  </div>
                  <div className="text-4xl sm:text-6xl font-black font-mono text-amber-600 dark:text-amber-400 tracking-tight">
                    {currentFocusMilestone.year} год
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {currentFocusMilestone.title}
                  </h3>
                </div>

                {/* Next / Prev Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevFocus}
                    className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-xs font-bold shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFocus}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shadow-md"
                  >
                    <span>Вперед</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stage Body */}
              <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 space-y-4">
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                    {currentFocusMilestone.desc}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
                    {currentFocusMilestone.fullDetails}
                  </p>

                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Используемые технологии и программный комплекс:</span>
                    <div className="flex flex-wrap gap-2">
                      {currentFocusMilestone.techStack.map((tech, idx) => (
                        <span key={idx} className="bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-mono text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Facts Box */}
                <div className="xl:col-span-4 bg-white dark:bg-slate-800/90 rounded-xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4 shadow-xs">
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Ключевые показатели этапа:
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>{currentFocusMilestone.metrics}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                      <div className="text-slate-500 dark:text-slate-400 font-semibold">Оборудование:</div>
                      <div>{currentFocusMilestone.equipment}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                      <div className="text-slate-500 dark:text-slate-400 font-semibold">Локация внедрения:</div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{currentFocusMilestone.location}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openContactModal({ title: `Вопрос по технологиям (${currentFocusMilestone.year} год)`, formType: 'consultation' })}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>Связаться с куратором направления</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* 4. Bottom 30-Year Heritage Summary Banner */}
      <div className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-900 dark:text-white rounded-2xl p-6 sm:p-8 border border-slate-300 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-amber-100 dark:bg-amber-950/60 rounded-full text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Надежный промышленный партнер</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Готовы внедрить проверенные временем решения на вашем предприятии?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            От бесплатного тестового замера вашей детали в Метрологическом зале в Тольятти до разработки постпроцессора любой сложности и сквозной автоматизации в TopSolid 7.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => openContactModal({ title: 'Заказ демонстрации оборудования или выезда инженера', formType: 'consultation' })}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
          >
            Заказать демонстрацию
          </button>
          <button
            type="button"
            onClick={() => navigateTo('contacts')}
            className="px-5 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
          >
            Контакты офисов
          </button>
        </div>
      </div>
    </div>
  );
};
