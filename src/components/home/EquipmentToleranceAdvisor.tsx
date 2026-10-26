import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  Ruler, 
  Target, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Award, 
  Sparkles, 
  FileCheck, 
  Eye, 
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types';

export type DimensionBand = 'small' | 'medium' | 'large' | 'massive';
export type ToleranceBand = 'ultra' | 'high' | 'standard' | 'coarse';
export type EnvironmentType = 'lab' | 'shopfloor' | 'field';

interface RecommendationResult {
  title: string;
  category: string;
  mpeFormula: string;
  expectedAccuracy: string;
  arshinNumber: string;
  arshinVerified: boolean;
  fieldReady: boolean;
  whyThisMatches: string;
  highlights: string[];
  deliverables: string[];
  catalogPage: PageId;
  servicePage?: PageId;
  imageUrl?: string;
}

export const EquipmentToleranceAdvisor: React.FC = () => {
  const { navigateTo, openContactModal } = useApp();

  const [dimension, setDimension] = useState<DimensionBand>('medium');
  const [tolerance, setTolerance] = useState<ToleranceBand>('high');
  const [environment, setEnvironment] = useState<EnvironmentType>('shopfloor');

  // Dimension band details
  const dimensionOptions = [
    {
      id: 'small' as DimensionBand,
      label: 'До 300 мм',
      sublabel: 'Мелкие детали & инструмент',
      examples: 'Лопатки, матрицы, крепеж, шестерни, режущий инструмент'
    },
    {
      id: 'medium' as DimensionBand,
      label: '300 – 1500 мм',
      sublabel: 'Средние корпусные узлы',
      examples: 'Блоки цилиндров, пресс-формы, кронштейны, литье, насосы'
    },
    {
      id: 'large' as DimensionBand,
      label: '1.5 – 5.0 м',
      sublabel: 'Крупногабаритная оснастка',
      examples: 'Кузовные штампы, сварные рамы, стрелы, станины станков'
    },
    {
      id: 'massive' as DimensionBand,
      label: 'До 15 – 50+ м',
      sublabel: 'Сверхкрупные объекты',
      examples: 'Турбины, крылья самолетов, стапели, судовые валопроводы'
    }
  ];

  // Tolerance band details
  const toleranceOptions = [
    {
      id: 'ultra' as ToleranceBand,
      label: 'Сверхпрецизионный (до 0.010 мм / 10 мкм)',
      sublabel: 'Прецизионные базы, посадки H6/h5, лопаточные аппараты',
      badge: 'Лабораторный класс'
    },
    {
      id: 'high' as ToleranceBand,
      label: 'Высокий (0.010 – 0.050 мм / 20–50 мкм)',
      sublabel: 'Штампы, пресс-формы, корпусные детали, автомобильные узлы',
      badge: 'Промышленный класс'
    },
    {
      id: 'standard' as ToleranceBand,
      label: 'Стандартный машиностроительный (0.050 – 0.200 мм)',
      sublabel: 'Литье, сварные конструкции, фасонный прокат, листовой металл',
      badge: 'Машиностроение'
    },
    {
      id: 'coarse' as ToleranceBand,
      label: 'Монтажный / Строительный (0.200 – 1.0+ мм)',
      sublabel: 'Металлоконструкции, строительные фермы, крупный монтаж',
      badge: 'Монтаж и сборка'
    }
  ];

  // Environment options
  const environmentOptions = [
    {
      id: 'lab' as EnvironmentType,
      label: 'Метрологическая лаборатория (20±1 °C)',
      desc: 'Стационарный контроль, термоконстантная среда, гранитные плиты'
    },
    {
      id: 'shopfloor' as EnvironmentType,
      label: 'Цеховой участок (15–35 °C)',
      desc: 'Измерения прямо у станка ЧПУ или пресса без демонтажа детали'
    },
    {
      id: 'field' as EnvironmentType,
      label: 'Выезд на предприятие заказчика',
      desc: 'Мобильный кейс, развертывание за 30 минут, автономное питание'
    }
  ];

  // Intelligent recommendation engine
  const recommendation = useMemo<RecommendationResult>(() => {
    // Massive objects (15-50m)
    if (dimension === 'massive') {
      return {
        title: 'Лазерный трекер Leica Geosystems Absolute Tracker AT960 / AT403',
        category: 'Лазерно-интерферометрический комплекс',
        mpeFormula: 'MPE (Point): ±15 мкм + 6 мкм/м',
        expectedAccuracy: 'от 0.025 до 0.150 мм на дистанции до 160 м',
        arshinNumber: 'В Госреестре СИ ФГИС «АРШИН»',
        arshinVerified: true,
        fieldReady: true,
        whyThisMatches: 'Для объектов свыше 5 метров только лазерный трекер обеспечивает прямую видимость и прецизионную триангуляцию без накопления погрешности перебазирования.',
        highlights: [
          'Технология PowerLock: мгновенный автоматический захват луча на отражателе',
          'Поддержка 6DoF (беспроводной щуп B-Probe и сканер Leica T-Scan)',
          'Встроенная метеостанция с автоматической компенсацией давления и влажности',
          'Оперативный выезд мобильной бригады инженеров «ДС-Инжиниринг» по всей России'
        ],
        deliverables: ['Отчет взаимной геометрии баз', 'Протокол выверки осей в PolyWorks', 'Свидетельство поверки ФГИС «АРШИН»'],
        catalogPage: 'hardware'
      };
    }

    // Ultra tolerance (under 10 microns) in Lab
    if (tolerance === 'ultra') {
      if (environment === 'lab' && (dimension === 'small' || dimension === 'medium')) {
        return {
          title: 'Стационарная портальная КИМ Mitutoyo CRYSTA-Apex V9106',
          category: 'Лабораторная координатно-измерительная машина',
          mpeFormula: 'MPE_E: (1.7 + 3L/1000) мкм',
          expectedAccuracy: '1.7 – 3.5 мкм в объеме до 1000 мм',
          arshinNumber: 'Госреестр СИ РФ № 48291-24 (ФГИС «АРШИН»)',
          arshinVerified: true,
          fieldReady: false,
          whyThisMatches: 'Допуск до 10 мкм требует абсолютной виброизоляции, гранитной направляющей и моторизованной головки Renishaw PH10M с контактными щупами.',
          highlights: [
            'Температурная компенсация от 16 до 26 °C со встроенными термодатчиками детали',
            'Сканирующие головки Renishaw SP25M с непрерывным контактным сканированием',
            'Полный метрологический протокол FAI по стандарту ГОСТ Р 59085-2020 / AS9102',
            'Лабораторные измерения образцов в Самаре с выдачей официального заключения'
          ],
          deliverables: ['Протокол FAI по ГОСТ Р 59085', 'Анализ отклонений формы GD&T ISO 1101', '3D PDF отчет с допусками'],
          catalogPage: 'hardware',
          servicePage: 'services'
        };
      }
    }

    // Small or Medium with high/ultra in shopfloor/field: FreeScan or Hexagon Arm
    if (dimension === 'small' || (dimension === 'medium' && tolerance === 'high')) {
      return {
        title: 'Лазерный 3D-сканер Shining 3D FreeScan Combo / UE Pro',
        category: 'Метрологический синий лазерный 3D-сканер',
        mpeFormula: 'Погрешность: до 0.020 мм (20 мкм) + 0.040 мм/м',
        expectedAccuracy: '0.02 – 0.04 мм на реальной детали',
        arshinNumber: 'В Госреестре СИ ФГИС «АРШИН»',
        arshinVerified: true,
        fieldReady: true,
        whyThisMatches: 'Синий лазер высокого разрешения фиксирует глубокие пазы, ребра и блестящие поверхности без матирующего спрея. Идеален как для цеха, так и для выезда к заказчику.',
        highlights: [
          '26 синих лазерных линий + 1 одиночная линия для глубоких колодцев',
          'Скорость сканирования до 1 860 000 точек/сек',
          'Встроенная фотограмметрия для контроля масштабного коэффициента',
          'Выезд мобильной группы «ДС-Инжиниринг» в течение 24–48 часов'
        ],
        deliverables: ['Плотная полигональная сетка STL/OBJ', 'Твердотельная CAD-модель STEP AP242', 'Цветовая карта отклонений PolyWorks'],
        catalogPage: 'hardware',
        servicePage: 'services'
      };
    }

    // Large dimension (1.5 - 5m) or shopfloor CMM
    if (dimension === 'large' || environment === 'shopfloor') {
      return {
        title: 'Мобильная координатно-измерительная рука Hexagon Absolute Arm 8525 / PMT Alpha',
        category: 'Портативная КИМ типа «рука» с 3D-сканером',
        mpeFormula: 'MPE_P: ±0.028 мм (контактно) / ±0.043 мм (со сканером RS5/AS1)',
        expectedAccuracy: '0.025 – 0.060 мм в радиусе до 3.5 – 4.5 м',
        arshinNumber: 'Госреестр СИ РФ (ФГИС «АРШИН»)',
        arshinVerified: true,
        fieldReady: true,
        whyThisMatches: 'Углепластиковые звенья с абсолютными энкодерами (не требуют калибровки при включении) позволяют измерять деталь прямо на станке ЧПУ, прессе или стапеле.',
        highlights: [
          'Контактные замеры отверстий и скрытых плоскостей жестким щупом Renishaw',
          'Лазерный сканер AS1 с синей полосой 150 мм для свободных поверхностей',
          'Функция Leapfrog: обход крупногабаритных деталей свыше 5 м вокруг периметра',
          'Поставка оборудования с обучением операторов или выездные услуги под ключ'
        ],
        deliverables: ['Протокол контроля баз RPS', 'Цветовая 3D-карта отклонений формы', 'Свидетельство поверки прибора'],
        catalogPage: 'hardware',
        servicePage: 'services'
      };
    }

    // Standard / Default fallback
    return {
      title: 'Оптический гибридный 3D-комплекс ScanLine EasyScan Omni',
      category: 'Метрологический оптический комплекс',
      mpeFormula: 'Погрешность: до 0.025 мм',
      expectedAccuracy: '0.025 – 0.050 мм',
      arshinNumber: 'В Госреестре СИ ФГИС «АРШИН»',
      arshinVerified: true,
      fieldReady: true,
      whyThisMatches: 'Универсальное решение для широкого спектра машиностроительных деталей среднего габарита с оптимальным балансом скорости и точности.',
      highlights: [
        'Оптическая фотограмметрия + лазерная сетка высокой плотности',
        'Интеграция с программным пакетом PolyWorks|Inspector',
        'Быстрый ввод в эксплуатацию без специальных требований к помещению',
        'Официальная гарантия и техническая поддержка инженеров «ДС-Инжиниринг»'
      ],
      deliverables: ['Протокол измерений', 'STL и STEP файлы', 'Консультация метролога'],
      catalogPage: 'hardware'
    };
  }, [dimension, tolerance, environment]);

  return (
    <div id="section-advisor" className="w-full bg-slate-900 text-white rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl p-4 sm:p-7 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            Интерактивный конфигуратор подбора
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Подбор измерительного комплекса под габариты и допуски деталей
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Укажите размер вашей детали, поле допуска чертежа и условия измерений. Алгоритм подберет измерительную машину или 3D-сканер с обоснованием формулы MPE и статуса во ФГИС «АРШИН».
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Все приборы поверены по ГОСТ</span>
        </div>
      </div>

      {/* Main Interactive Grid: Selectors (5 cols) vs Result Card (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Interactive Selectors */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Dimension Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-blue-400" />
                1. Габариты детали или узла
              </span>
              <span className="text-cyan-400 font-mono text-[11px] font-bold">
                {dimensionOptions.find(d => d.id === dimension)?.label}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dimensionOptions.map((opt) => {
                const isActive = dimension === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setDimension(opt.id)}
                    className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                      isActive 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/30' 
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{opt.label}</div>
                    <div className={`text-[10px] leading-tight mt-1 truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {opt.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-slate-400 flex items-start gap-1.5 px-1">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>Примеры: {dimensionOptions.find(d => d.id === dimension)?.examples}</span>
            </div>
          </div>

          {/* 2. Tolerance Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                2. Требуемый допуск чертежа
              </span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold">
                {tolerance === 'ultra' ? 'до 10 мкм' : tolerance === 'high' ? '20–50 мкм' : tolerance === 'standard' ? '0.05–0.2 мм' : 'до 1 мм'}
              </span>
            </label>
            <div className="space-y-1.5">
              {toleranceOptions.map((opt) => {
                const isActive = tolerance === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTolerance(opt.id)}
                    className={`w-full p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer border flex items-center justify-between ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/30'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold leading-tight truncate">{opt.label}</div>
                      <div className={`text-[10px] leading-tight mt-0.5 truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                        {opt.sublabel}
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Environment Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                3. Условия проведения измерений
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {environmentOptions.map((opt) => {
                const isActive = environment === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setEnvironment(opt.id)}
                    className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/30'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                    }`}
                  >
                    <div className="text-xs font-bold leading-snug">{opt.label.split('(')[0]}</div>
                    <div className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {opt.id === 'lab' ? 'Лаборатория' : opt.id === 'shopfloor' ? 'Цех у станка' : 'Выезд на объект'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Recommendation Display */}
        <div className="lg:col-span-7 bg-slate-850 rounded-2xl border border-slate-700/90 p-5 sm:p-6 lg:p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Top Badges & Category */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white shadow-xs">
                  Рекомендуемое решение
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {recommendation.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{recommendation.arshinNumber}</span>
              </div>
            </div>

            {/* Model Title */}
            <div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white leading-tight">
                {recommendation.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed bg-slate-800/90 p-3 rounded-xl border border-slate-700/60">
                {recommendation.whyThisMatches}
              </p>
            </div>

            {/* Key Technical Metrology Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Формула погрешности (MPE)
                </div>
                <div className="text-xs sm:text-sm font-mono font-extrabold text-cyan-300 tabular-nums">
                  {recommendation.mpeFormula}
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Ожидаемая точность на детали
                </div>
                <div className="text-xs sm:text-sm font-mono font-extrabold text-emerald-300 tabular-nums">
                  {recommendation.expectedAccuracy}
                </div>
              </div>
            </div>

            {/* Advantages and Features */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                Преимущества для выбранных параметров:
              </div>
              <ul className="space-y-1.5">
                {recommendation.highlights.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-snug">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverables */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">На выходе:</span>
              {recommendation.deliverables.map((del, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {del}
                </span>
              ))}
            </div>
          </div>

          {/* Action Button Row */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={() => navigateTo(recommendation.catalogPage)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-300" />
              <span>Смотреть в каталоге оборудования</span>
            </button>

            <button
              onClick={() => openContactModal({
                title: `Запрос расчета / демо: ${recommendation.title}`,
                formType: 'quote'
              })}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Запросить расчет под мою деталь</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
