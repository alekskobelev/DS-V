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
    title: 'Основание «Делкам-Самара» и первые поставки CAD/CAM',
    badge: 'Истоки инженерной школы',
    desc: 'Создание фирмы при поддержке Delcam Plc (Великобритания), АО «АВТОВАЗ» и авиационных предприятий Самары.',
    fullDetails: 'Старт практического внедрения передовых CAD/CAM систем Delcam в отечественной индустрии. Первые поставки, техническая адаптация и внедрение программных комплексов на АО «АВТОВАЗ» и в ракетно-космическом центре ЦСКБ «Прогресс», заложившие фундамент многолетнего технологического лидерства.',
    metrics: 'Первые поставки на АВТОВАЗ и ЦСКБ Прогресс',
    techStack: ['CAD/CAM Delcam', 'PowerMILL', 'DUCT', 'Parasolid'],
    equipment: 'Высокопроизводительные рабочие станции Silicon Graphics, координатные столы',
    location: 'Самара, аэрокосмический кластер'
  },
  {
    year: '1998',
    period: '1995-2005',
    category: 'achievement',
    categoryLabel: 'Промышленный прорыв',
    title: 'Панель приборов Chevrolet-Niva (ВАЗ-2123)',
    badge: 'Впервые в России',
    desc: 'Впервые в РФ с использованием CAD/CAM Delcam проведена полная подготовка производства панели приборов Chevrolet-Niva.',
    fullDetails: 'Беспрецедентный для отечественного автопрома проект: математическое моделирование сложнейшей формообразующей оснастки и пресс-форм, сквозное ЧПУ-фрезерование и контроль геометрии интерьера Chevrolet-Niva (ВАЗ-2123). В 1997 и 2001 годах компания дважды признана лучшим официальным представительством Delcam в России.',
    metrics: 'Лучшее представительство Delcam в РФ (1997, 2001)',
    techStack: ['Delcam PowerSHAPE', 'PowerMILL', 'Пресс-формы ВАЗ-2123', 'Сложные поверхности'],
    equipment: 'Обрабатывающие центры с ЧПУ, контрольные калибры',
    location: 'Тольятти (НТЦ АВТОВАЗ) / Самара'
  },
  {
    year: '2000',
    period: '1995-2005',
    category: 'metrology',
    categoryLabel: 'Мобильная метрология',
    title: 'КИМ ROMER и контроль линий сварки ВАЗ-1118',
    badge: 'Сервисный центр КИМ',
    desc: 'Старт продаж портативных КИМ типа «рука» ROMER, открытие сервисного центра и аттестация линий сварки Lada Kalina.',
    fullDetails: 'Создание одного из первых в России авторизованных сервисных центров по ремонту и калибровке переносных координатно-измерительных машин ROMER. Выполнение уникального комплекса метрологических работ по аттестации и прецизионному контролю точности автоматических сварочных линий и контрольных калибров для проектов Chevrolet-Niva и ВАЗ-1118 («Лада Калина»).',
    metrics: '100% аттестация линий сварки кузовов',
    techStack: ['КИМ ROMER Arm', 'PowerINSPECT', 'Аттестация сварочных кондукторов', 'Контрольные калибры'],
    equipment: 'Портативные КИМ ROMER 6- и 7-осевые, сервисный калибровочный стенд',
    location: 'Тольятти (АВТОВАЗ) / Самара'
  },
  {
    year: '2001',
    period: '1995-2005',
    category: 'training',
    categoryLabel: 'Обучение и кадры',
    title: 'Учебный центр CAD/CAM в Самаре',
    badge: 'Кадровый потенциал отрасли',
    desc: 'Открытие авторизованного учебного центра для технологов-программистов станков с ЧПУ.',
    fullDetails: 'Формирование авторских прикладных программ экспресс-подготовки инженеров-технологов без отрыва от производства. Подготовка более 200 высококвалифицированных специалистов для машиностроения Самарской области и сопредельных регионов.',
    metrics: '200+ сертифицированных специалистов',
    techStack: ['ЧПУ программирование', 'G-код', 'Основы CAM'],
    equipment: 'Учебные стенды со стойками ЧПУ Fanuc и Sinumerik',
    location: 'Самара, учебный класс'
  },
  {
    year: '2003',
    period: '1995-2005',
    category: 'innovation',
    categoryLabel: 'Реверс-инжиниринг',
    title: 'Реинжиниринг катеров «Аквалайн» для ЦСКБ «Прогресс» и КИМ CIMCORE',
    badge: 'Аэрокосмический реверс',
    desc: 'Реинжиниринг обводов катеров «Аквалайн» для ЦСКБ «Прогресс» и старт поставок переносных КИМ CIMCORE.',
    fullDetails: 'Выполнение масштабного конструкторского проекта реверс-инжиниринга сложной гидродинамической геометрии обводов корпуса и технологической оснастки серии скоростных прогулочных катеров «Аквалайн» по заказу ЦСКБ «Прогресс». В 2005 году начаты поставки переносных координатно-измерительных машин CIMCORE.',
    metrics: 'Серийный выпуск катеров «Аквалайн»',
    techStack: ['Реверс-инжиниринг гидрообводов', 'Полигональные сетки', 'Параметрические поверхности', 'КИМ CIMCORE'],
    equipment: 'КИМ CIMCORE, лазерные измерительные головки, 3D-сканеры',
    location: 'Самара (РКЦ «Прогресс»)'
  },
  {
    year: '2006',
    period: '2006-2015',
    category: 'cnc',
    categoryLabel: 'Модернизация КИМ',
    title: 'Глубокая модернизация стационарных КИМ и система Metronor',
    badge: 'Вторая жизнь КИМ',
    desc: 'Комплексная модернизация измерительных машин для УАЗ, АВТОВАЗ; первая в РФ поставка системы Metronor.',
    fullDetails: 'Реализация программ глубокой модернизации парка тяжелых координатно-измерительных машин для ОАО «УАЗ», АО «АВТОВАЗ» и др.: замена контроллеров на Renishaw и Pantec, монтаж лазерных интерферометров, создание объемных матриц компенсации ошибок (Error Mapping) и перевод на CAD-ориентированное ПО. В 2008 г. осуществлена первая в РФ поставка переносной оптико-электронной системы Metronor.',
    metrics: 'Восстановление точности КИМ до 1.5–2.0 мкм',
    techStack: ['Renishaw UCC', 'Pantec', 'Deva', 'Оптико-электронная система Metronor', 'Error Mapping'],
    equipment: 'Контроллеры Renishaw, интерферометрические системы калибровки, стационарные КИМ',
    location: 'Ульяновск (УАЗ) / Тольятти / Самара'
  },
  {
    year: '2009',
    period: '2006-2015',
    category: 'achievement',
    categoryLabel: 'Авиация и Атомная энергия',
    title: 'Проект 476 (Ил-76МД-90А) и международный реактор ITER',
    badge: 'Федеральный масштаб',
    desc: 'Техпроцессы обработки титанового шасси Ил-76МД-90А на «Авиаагрегат» и защитные блоки реактора ITER.',
    fullDetails: 'Разработка и промышленное внедрение сквозных технологий ЧПУ-обработки высокопрочных титановых деталей шасси тяжелого военно-транспортного самолета по проекту 476 (Ил-76МД-90А) для самарского завода «Авиаагрегат». Параллельно изготовлены прецизионные опытные образцы первой стенки защитных бланкетов для международного термоядерного экспериментального реактора ITER (Франция).',
    metrics: 'Проект 476 Ил-76МД-90А • Международный проект ITER',
    techStack: ['Высокоскоростная 5-осевая обработка титана', 'Спецсплавы ITER', 'CAM верификация'],
    equipment: 'Тяжелые обрабатывающие центры, координатно-измерительные комплексы',
    location: 'Самара (АО «Авиаагрегат») / Международная кооперация ITER'
  },
  {
    year: '2014',
    period: '2006-2015',
    category: 'metrology',
    categoryLabel: 'Трекеры и Оснастка',
    title: 'Лазерные трекеры Leica и оснастка для Авиастар-СП и ОДК-Кузнецов',
    badge: 'Субмиллиметровая точность',
    desc: 'Поставки трекеров Leica Geosystems, проектирование и изготовление оснастки для лидеров авиадвигателестроения.',
    fullDetails: 'Старт масштабных поставок лазерных трекеров Leica (включая тахеометры TDRA6000 для работы на дистанциях до 600 м) и мобильных КИМ ROMER для аэрокосмического комплекса. Выполнение комплексных контрактов по проектированию и изготовлению высокоточной технологической оснастки, стапелей и штампов для АО «Авиастар-СП» (Ульяновск), ПАО «ОДК-Кузнецов» (Самара) и РКЦ «Прогресс».',
    metrics: 'Измерения на дистанциях до 600 м (Leica TDRA6000)',
    techStack: ['Leica Laser Tracker', 'ROMER Arm', 'Штамповая и стапельная оснастка', 'PC-DMIS'],
    equipment: 'Лазерные трекеры Leica Geosystems, тахеометры TDRA6000, прецизионные стапели',
    location: 'Ульяновск (Авиастар) / Самара (ОДК-Кузнецов, РКЦ Прогресс)'
  },
  {
    year: '2016',
    period: '2016-2021',
    category: 'foundation',
    categoryLabel: 'Новый этап развития',
    title: 'Официальное наименование «ДС-Инжиниринг»',
    badge: 'Преемственность и развитие',
    desc: 'Утверждение бренда «ДС-Инжиниринг» с сохранением 20-летнего экспертного состава, школы и традиций Делкам-Самара.',
    fullDetails: 'Консолидация всех инженерных направлений под брендом ООО «ДС-Инжиниринг». Сохранение признанного экспертного коллектива, накопленной библиотеки из сотен постпроцессоров, прямых долгосрочных контрактов с машиностроительными гигантами Поволжья и России.',
    metrics: '20+ лет непрерывной инженерной практики',
    techStack: ['Инженерный консалтинг', 'CAD/CAM/CAE', 'Постпроцессоры', 'КИМ'],
    equipment: 'Собственные испытательные мощности, сервисная база',
    location: 'Самара, ул. Свободы, 198'
  },
  {
    year: '2017',
    period: '2016-2021',
    category: 'software',
    categoryLabel: 'САПР и PDM платформы',
    title: 'Генеральное дистрибьюторство TOPSOLID SAS (Франция)',
    badge: 'Единое цифровое ядро',
    desc: 'Подписание прямого мастер-дистрибьюторского соглашения с Missler Software (TOPSOLID SAS) в России.',
    fullDetails: 'Создание всероссийского центра компетенций TopSolid 7: внедрение сквозной среды Design (3D CAD), CAM (многоосевая и токарно-фрезерная ЧПУ-обработка), Mold & Progress (проектирование штампов и пресс-форм) и встроенной защищенной PDM. Организация авторизованного учебного центра и горячей линии техподдержки.',
    metrics: 'Сквозное ядро Parasolid 7 • 100% PDM',
    techStack: ['TopSolid Design', 'TopSolid Cam', 'TopSolid Mold & Progress', 'TopSolid PDM'],
    equipment: 'Сертифицированный учебно-демонстрационный класс TopSolid 7',
    location: 'Главный офис в Самаре'
  },
  {
    year: '2022',
    period: '2022-2026',
    category: 'innovation',
    categoryLabel: 'Поставки КИМ',
    title: 'Поставки КИМ PMT',
    badge: 'КИМ PMT',
    desc: 'Авторизованные поставки и сервисный центр координатно-измерительных машин PMT (мостовые, портальные КИМ и измерительные руки Alpha Arm).',
    fullDetails: 'Официальные поставки высокоточных портальных и мобильных КИМ PMT промышленного класса с гранитным основанием, воздушными подшипниками и оптико-контактными головками Renishaw. Обеспечение полного цикла шеф-монтажа, пусконаладки, калибровки и гарантийного обслуживания сервисной службой «ДС-Инжиниринг».',
    metrics: 'Прямые поставки КИМ PMT • Сервисный центр',
    techStack: ['Портальные КИМ PMT', 'PMT Alpha Arm', 'PolyWorks|Inspector™', 'Renishaw UCC'],
    equipment: 'КИМ PMT Bridge, КИМ-рука PMT Alpha Arm, датчики Renishaw',
    location: 'Самара, Тольятти и поставки по всей РФ'
  },
  {
    year: '2023',
    period: '2022-2026',
    category: 'expansion',
    categoryLabel: 'Инфраструктура и выездной сервис',
    title: 'Развитие регионального представительства в Тольятти и выездных услуг',
    badge: 'Представительство Тольятти',
    desc: 'Открытие представительства на Южном шоссе для оперативного взаимодействия с предприятиями автомобилестроения и машиностроения Поволжья.',
    fullDetails: 'Развертывание официального представительства в Тольятти (Южное шоссе, 161В). Формирование выездных мобильных групп инженеров для проведения оперативного 3D-контроля геометрии, сканирования оснастки и внедрения программных комплексов TopSolid 7 на предприятиях Самарской области.',
    metrics: 'Оперативный выезд за 24–48 ч • Внедрение TopSolid 7',
    techStack: ['TopSolid 7 CAM Pro', 'PolyWorks|Inspector™', 'Выездной 3D-контроль', 'Постпроцессоры ЧПУ'],
    equipment: 'Мобильные рабочие станции PolyWorks, комплексы 3D-сканирования, CAD/CAM среда TopSolid',
    location: 'Самара, Тольятти и выезд по всей РФ'
  },
  {
    year: '2024',
    period: '2022-2026',
    category: 'metrology',
    categoryLabel: 'Поставки 3D-сканеров',
    title: '2024 год: поставки Измерительных приборов компании Shining 3D и ScanLine',
    badge: 'Shining 3D & ScanLine',
    desc: 'Официальные поставки оптических и лазерных 3D-сканеров Shining 3D FreeScan и метрологических комплексов ScanLine (в реестре ФГИС «АРШИН»).',
    fullDetails: 'Расширение портфеля прямых поставок измерительного оборудования: портативные синие лазерные 3D-сканеры Shining 3D FreeScan Combo, UE Pro и оптические гибридные системы ScanLine EasyScan Omni со встроенной фотограмметрией. Внесение средств измерений в Государственный реестр ФГИС «АРШИН» с оформлением свидетельств о поверке.',
    metrics: 'Реестр СИ «АРШИН» • 50+ внедрений 3D-сканеров',
    techStack: ['Shining 3D FreeScan', 'ScanLine EasyScan Omni', 'Реестр СИ ФГИС АРШИН', 'PolyWorks|Inspector™'],
    equipment: 'Лазерные 3D-сканеры FreeScan OMNI, Combo, UE Pro, фотограмметрия',
    location: 'Самара, Тольятти и поставки по всей РФ'
  },
  {
    year: '2026',
    period: '2022-2026',
    category: 'achievement',
    categoryLabel: 'Юбилейный рубеж',
    title: 'Более 30 лет непрерывного инженерного лидерства (1995–2026)',
    badge: '30+ лет практики',
    desc: '500+ реализованных промышленных проектов, 300+ постпроцессоров, 2 филиала и доверие ключевых флагманов РФ.',
    fullDetails: 'Юбилейная веха развития «ДС-Инжиниринг». За более чем три десятилетия компания выросла из самарского отделения Delcam в национальный центр технологических компетенций: мастер-дистрибьютор TopSolid 7, разработчик уникальных симуляторов ЧПУ, поставщик измерительных комплексов КИМ и центр прецизионного 3D-контроля геометрии GD&T.',
    metrics: '31 год опыта • 500+ проектов • 300+ постпроцессоров • 2 представительства',
    techStack: ['Сквозной цифровой цикл: CAD/CAM/PDM + ЧПУ + КИМ + GD&T'],
    equipment: 'Собственный парк мобильных КИМ, оптических и лазерных сканеров и ПО',
    location: 'Главный офис (Самара) • Представительство и отдел КИМ (Тольятти)'
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
            { id: '1995-2005', label: '1995–2005: Делкам, ВАЗ и КИМ ROMER', count: MILESTONES_DATA.filter(m => m.period === '1995-2005').length },
            { id: '2006-2015', label: '2006–2015: Модернизация КИМ, Ил-76 и Leica', count: MILESTONES_DATA.filter(m => m.period === '2006-2015').length },
            { id: '2016-2021', label: '2016–2021: TopSolid и Метрология', count: MILESTONES_DATA.filter(m => m.period === '2016-2021').length },
            { id: '2022-2026', label: '2022–2026: Технопарк, PMT и Реверс', count: MILESTONES_DATA.filter(m => m.period === '2022-2026').length }
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

          <div className="space-y-5 sm:space-y-7">
            <AnimatePresence mode="popLayout">
              {filteredMilestones.map((milestone, idx) => {
                const isEven = idx % 2 === 0;
                const isExpanded = Boolean(expandedYears[milestone.year]);
                const isLatest = milestone.year === '2026';

                return (
                  <motion.div
                    key={milestone.year}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className={`relative flex flex-col sm:flex-row items-start sm:items-center ${
                      isEven ? 'sm:flex-row-reverse' : ''
                    } gap-3 sm:gap-6`}
                  >
                    {/* Node on central axis */}
                    <div className="absolute left-6 sm:left-1/2 top-5 -translate-x-1/2 z-20 flex items-center justify-center">
                      <motion.div 
                        whileHover={{ scale: 1.2 }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md border-3 transition-transform cursor-pointer ${
                          isLatest
                            ? 'bg-amber-500 border-white text-white ring-3 ring-amber-300/50'
                            : 'bg-blue-600 border-white text-white ring-3 ring-blue-100'
                        }`}
                        onClick={() => toggleExpand(milestone.year)}
                      >
                        {getCategoryIcon(milestone.category)}
                      </motion.div>
                    </div>

                    {/* Content Card (Left or Right on desktop) */}
                    <div className={`w-full sm:w-[calc(50%-2rem)] pl-13 sm:pl-0 ${
                      isEven ? 'sm:pr-3' : 'sm:pl-3'
                    }`}>
                      <div className={`bg-white rounded-xl p-4 sm:p-5 border transition-all duration-200 shadow-xs hover:shadow-sm ${
                        isLatest 
                          ? 'border-amber-300 bg-gradient-to-br from-amber-50/20 via-white to-white' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}>
                        {/* Top Meta Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-gray-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-lg sm:text-xl font-black text-blue-700 tracking-tight">
                              {milestone.year}
                            </span>
                            <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md border ${getCategoryColor(milestone.category)}`}>
                              {milestone.badge}
                            </span>
                          </div>

                          <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[160px] sm:max-w-[200px]">{milestone.location}</span>
                          </span>
                        </div>

                        {/* Title & Short Description */}
                        <div className="mt-2.5 space-y-1">
                          <h3 className="text-sm sm:text-base font-extrabold text-gray-900 leading-snug">
                            {milestone.title}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
                            {milestone.desc}
                          </p>
                        </div>

                        {/* Highlighted Metric Badge */}
                        <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-800 truncate">
                            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">{milestone.metrics}</span>
                          </div>
                          <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase tracking-wider shrink-0">
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
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 text-xs text-slate-600 leading-relaxed">
                                <p className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/80 text-blue-950 text-xs">
                                  {milestone.fullDetails}
                                </p>

                                <div className="space-y-1">
                                  <div className="font-bold text-gray-800 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                                    <Cpu className="w-3 h-3 text-blue-600" />
                                    <span>Стек и технологии:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {milestone.techStack.map((tech, tIdx) => (
                                      <span key={tIdx} className="bg-slate-100 text-slate-800 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-slate-200">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-0.5">
                                  <div className="font-bold text-gray-800 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                                    <Wrench className="w-3 h-3 text-emerald-600" />
                                    <span>Оснащение:</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600">
                                    {milestone.equipment}
                                  </p>
                                </div>

                                <div className="pt-1.5 flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openContactModal({ title: `Консультация по направлению (${milestone.year})`, formType: 'consultation' })}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <span>Запросить консультацию</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>

                                  {milestone.category === 'metrology' && (
                                    <button
                                      type="button"
                                      onClick={() => navigateTo('hardware')}
                                      className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                                    >
                                      Каталог оборудования
                                    </button>
                                  )}

                                  {milestone.category === 'software' && (
                                    <button
                                      type="button"
                                      onClick={() => navigateTo('software')}
                                      className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
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
                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleExpand(milestone.year)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{isExpanded ? 'Свернуть подробности' : 'Развернуть технические детали'}</span>
                            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? '-rotate-90' : 'rotate-90'}`} />
                          </button>

                          <span className="text-[10px] text-gray-400 font-mono">
                            {milestone.period}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Empty spacer for the alternating layout on desktop */}
                    <div className="hidden sm:block sm:w-[calc(50%-2rem)]"></div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 3. VIEW MODE 2: FOCUS CAROUSEL BY YEAR */}
      {viewMode === 'focus' && currentFocusMilestone && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          {/* Top Year Switcher Bar */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Выберите веху на шкале:
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1.5">
              {MILESTONES_DATA.map((item, idx) => {
                const isCurrent = idx === selectedMilestoneIndex;
                return (
                  <button
                    key={item.year}
                    type="button"
                    onClick={() => setSelectedMilestoneIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-black transition-all shrink-0 cursor-pointer flex flex-col items-center gap-0.5 border ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-102'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{item.year}</span>
                    <span className={`text-[8.5px] font-sans font-semibold truncate max-w-[70px] ${
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
              transition={{ duration: 0.25 }}
              className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-900 dark:text-white rounded-xl p-5 sm:p-7 relative overflow-hidden space-y-4 border border-slate-300 dark:border-slate-800 shadow-xs"
            >
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full text-[11px] font-bold border border-blue-200 dark:border-blue-400/30 mb-1.5">
                    {getCategoryIcon(currentFocusMilestone.category)}
                    <span>{currentFocusMilestone.categoryLabel}</span>
                    <span>•</span>
                    <span>{currentFocusMilestone.period}</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-amber-600 dark:text-amber-400 tracking-tight">
                    {currentFocusMilestone.year} год
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {currentFocusMilestone.title}
                  </h3>
                </div>

                {/* Next / Prev Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevFocus}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-xs font-bold shadow-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Назад</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFocus}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shadow-xs"
                  >
                    <span>Вперед</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stage Body */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-8 space-y-3">
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                    {currentFocusMilestone.desc}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80">
                    {currentFocusMilestone.fullDetails}
                  </p>

                  <div className="space-y-1.5 pt-0.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Технологии и стек:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentFocusMilestone.techStack.map((tech, idx) => (
                        <span key={idx} className="bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Facts Box */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-800/90 rounded-lg p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3 shadow-xs">
                  <div className="space-y-2.5">
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Ключевой показатель:
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{currentFocusMilestone.metrics}</span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                      <div className="text-slate-500 dark:text-slate-400 font-semibold text-[10px] uppercase">Оборудование:</div>
                      <div>{currentFocusMilestone.equipment}</div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700 text-[11px] space-y-0.5 text-slate-600 dark:text-slate-300">
                      <div className="text-slate-500 dark:text-slate-400 font-semibold text-[10px] uppercase">Локация:</div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{currentFocusMilestone.location}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openContactModal({ title: `Вопрос по технологиям (${currentFocusMilestone.year} год)`, formType: 'consultation' })}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Связаться с куратором</span>
                    <ArrowRight className="w-3 h-3" />
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
