import React, { useState } from 'react';
import { 
  Scan, 
  Cpu, 
  Wrench, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Target, 
  Clock, 
  FileText, 
  Award,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface ProblemSolutionItem {
  id: string;
  icon: React.ElementType;
  taskTitle: string;
  badge: string;
  painPoint: string;
  solution: string;
  deliverables: string[];
  whyNow: string;
  results: string[];
  recommendedTech: { name: string; type: 'software' | 'hardware' | 'service'; id?: string }[];
  accentColor: string;
}

const PROBLEMS_SOLUTIONS: ProblemSolutionItem[] = [
  {
    id: 'reverse-import',
    icon: Scan,
    taskTitle: 'Восстановление геометрии и выпуск чертежей при отсутствии исходной КД',
    badge: '3D-сканирование и реверс',
    accentColor: 'blue',
    painPoint: 'Оригинальная деталь, штамп или пресс-форма изношены, чертежи утрачены, а поставки импортных комплектующих прекращены или занимают месяцы.',
    solution: 'Инженер выезжает со сканером на предприятие, выполняет контактные замеры базовых элементов КИМ-рукой Hexagon, прецизионно сканирует рабочие поверхности и строит твердотельную параметрическую CAD-модель (STEP AP242 / Parasolid .x_t) с выпуском рабочих чертежей по ЕСКД.',
    deliverables: [
      'Твердотельная параметрическая 3D CAD-модель (STEP AP242 / Parasolid .x_t / IGES)',
      'Комплект конструкторской документации по ЕСКД (чертежи деталей в PDF / DWG)',
      'Протокол совмещения скана с реконструированной моделью с картой отклонений'
    ],
    whyNow: 'Позволяет оперативно запустить изготовление детали на собственных станках с ЧПУ или разместить заказ у надежного подрядчика.',
    results: [
      'Точность восстановления номинальной геометрии: от ±0.015 мм',
      'Срок построения твердотельной CAD-модели: от 2 до 5 рабочих дней',
      'Полная готовность КД к загрузке в CAM и запуску механообработки'
    ],
    recommendedTech: [
      { name: 'Hexagon Absolute Arm 7-Axis + AS1', type: 'hardware', id: 'hexagon-absolute-arm-7axis' },
      { name: 'Shining 3D FreeScan Combo', type: 'hardware', id: 'freescan-combo' },
      { name: 'Geomagic Design X & TopSolid 7', type: 'software', id: 'geomagic-design-x' }
    ]
  },
  {
    id: 'quality-control',
    icon: Target,
    taskTitle: 'Выявление причин брака и координатный контроль допусков (GD&T)',
    badge: 'Контроль на КИМ',
    accentColor: 'emerald',
    painPoint: 'Штангенциркули и шаблоны не могут проконтролировать криволинейную форму, коробление корпусов, винтовые поверхности лопаток или соосность глубоких отверстий.',
    solution: 'Контактные замеры базовых отверстий и плоскостей КИМ-рукой Hexagon, 3D-сканирование поверхностей и сравнение с эталонной CAD-моделью в среде PolyWorks|Inspector™. Построение цветовой карты фактических отклонений и расчет допусков формы и расположения.',
    deliverables: [
      'Официальный протокол размерного контроля детали (PDF / Excel)',
      'Цветовая 3D-карта фактических отклонений от номинала CAD-модели',
      'Таблица проверки допусков GD&T (соосность, плоскостность, перпендикулярность, позиционный допуск)'
    ],
    whyNow: 'Позволяет сразу локализовать причину деформации или износа инструмента и исключить брак до передачи узла на финишную сборку.',
    results: [
      'Полный координатный контроль детали за 15–30 минут вместо многочасовых ручных промеров',
      'Наглядная визуализация зон перекоса, коробления и недоливов/припусков',
      'Метрологический протокол для подтверждения качества перед заказчиком и ОТК'
    ],
    recommendedTech: [
      { name: 'Hexagon Absolute Arm 8525', type: 'hardware', id: 'hexagon-absolute-arm-8520' },
      { name: 'PolyWorks|Inspector™', type: 'software', id: 'polyworks-inspector' },
      { name: 'КИМ Mitutoyo CRYSTA-Apex S', type: 'hardware', id: 'mitutoyo-crysta' }
    ]
  },
  {
    id: 'cnc-collisions',
    icon: Cpu,
    taskTitle: 'Внедрение станков с ЧПУ и разработка постпроцессоров без риска аварий',
    badge: 'TopSolid 7 & Постпроцессоры',
    accentColor: 'amber',
    painPoint: 'Новый 3-, 4- или 5-осевой станок простаивает без проверенного постпроцессора, а ручное написание УП грозит опасным столкновением шпинделя с заготовкой или поворотным столом.',
    solution: 'Создание точного цифрового двойника станка в TopSolid 7 CAM с симуляцией кинематики узлов и разработка индивидуального постпроцессора под стойку ЧПУ (Fanuc, Sinumerik, Heidenhain, Haas). Верификация траекторий без аварийных остановок.',
    deliverables: [
      'Индивидуальный настроенный постпроцессор под стойку и кинематику вашего станка',
      '3D-модель кинематики станочного комплекса с проверкой столкновений в CAM',
      'Отработанная управляющая программа с тестовой деталью на оборудовании'
    ],
    whyNow: 'Сокращает ввод нового станочного оборудования в эксплуатацию и защищает шпиндельный узел от дорогостоящего аварийного ремонта.',
    results: [
      '100% исключение коллизий инструмента и станка благодаря полной 3D-симуляции G-кода',
      'Сокращение времени наладки первой детали на станке в 2–3 раза',
      'Оптимизированные режимы резания и продление стойкости фрез и пластин'
    ],
    recommendedTech: [
      { name: 'TopSolid 7 (CAD / CAM / PDM)', type: 'software', id: 'topsolid-7' },
      { name: 'Разработка кинематических постпроцессоров', type: 'service', id: 'postprocessors-dev' },
      { name: 'Адаптация и внедрение на производстве', type: 'service', id: 'training-cad-cam' }
    ]
  },
  {
    id: 'large-scale',
    icon: Layers,
    taskTitle: 'Выездные измерения крупногабаритных конструкций, стапелей и рам',
    badge: 'Лазерные трекеры Leica',
    accentColor: 'purple',
    painPoint: 'Сварные рамы, стапели, корпусные конструкции размером от 3 до 50+ метров невозможно доставить на стационарную КИМ, а обычный слесарный инструмент накапливает недопустимую погрешность.',
    solution: 'Оперативный выезд инженеров «ДС-Инжиниринг» с лазерными трекерами Leica (Leica AT960 / AT403) и мобильными КИМ-руками Hexagon непосредственно на производственный участок предприятия заказчика.',
    deliverables: [
      'Протокол пространственных измерений в единой системе координат изделия',
      'Карта фактических координат базовых опор, стыковочных плоскостей и узлов стапеля',
      'Свидетельства о поверке СИ из реестра ФГИС «АРШИН»'
    ],
    whyNow: 'Позволяет выверить и настроить положение узлов и оснастки в реальном времени прямо на сборочном участке без транспортировки объекта.',
    results: [
      'Пространственная точность измерений: 15 мкм + 6 мкм/м на дистанциях до 160 метров',
      'Юстировка геометрии сборочных баз и направляющих в режиме реального времени',
      'Выезд сертифицированных инженеров с поверенным комплексом по всей территории РФ'
    ],
    recommendedTech: [
      { name: 'Лазерный трекер Leica AT960', type: 'hardware', id: 'leica-absolute-tracker-at960' },
      { name: 'Лазерный трекер Leica AT403', type: 'hardware', id: 'leica-absolute-tracker-at403' },
      { name: 'ПО SpatialAnalyzer & PolyWorks', type: 'software', id: 'polyworks-inspector' }
    ]
  }
];

export const ProblemsSolutionsBlock: React.FC = () => {
  const { navigateTo, openContactModal } = useApp();
  const [activeTab, setActiveTab] = useState<string>('reverse-import');

  const currentItem = PROBLEMS_SOLUTIONS.find((item) => item.id === activeTab) || PROBLEMS_SOLUTIONS[0];

  return (
    <div className="bg-slate-100/90 dark:bg-slate-900/90 rounded-3xl p-5 sm:p-7 lg:p-8 text-slate-900 dark:text-white shadow-xs border border-slate-300 dark:border-slate-800 relative overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/90 dark:border-blue-800 text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2 shadow-2xs">
            <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Инженерные задачи и готовые решения</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Какие проблемы предприятий решает <span className="whitespace-nowrap inline-block">«ДС&#8209;Инжиниринг»</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-2xl mx-auto leading-relaxed">
            Выберите вашу производственную задачу, чтобы увидеть проверенный практикой алгоритм решения и рекомендуемые технологии
          </p>
        </div>

        {/* Tab Buttons (4 Problems) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-5">
          {PROBLEMS_SOLUTIONS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10px" }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => setActiveTab(item.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive 
                        ? 'bg-white text-blue-700 shadow-2xs' 
                        : 'bg-blue-50 dark:bg-slate-700/80 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-blue-700/90 text-blue-100 border border-blue-400/40' 
                        : 'bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <div className={`font-bold text-xs sm:text-sm leading-snug transition-colors ${
                    isActive ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}>
                    {item.taskTitle}
                  </div>
                </div>

                <div className={`mt-2.5 flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}>
                  <span>Смотреть решение</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Problem & Solution Deep Dive Card */}
        <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-300 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column: Problem, Engineering Solution & Deliverables */}
            <div className="xl:col-span-7 space-y-6 lg:space-y-7 lg:pr-4">
              {/* 1. Pain Point */}
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200/90 dark:border-rose-800/50 rounded-lg text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>Проблема производства</span>
                </div>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                  {currentItem.painPoint}
                </p>
              </div>

              {/* 2. Engineering Solution */}
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200/90 dark:border-blue-800/50 rounded-lg text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>Инженерный метод «ДС‑Инжиниринг»</span>
                </div>
                <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                  {currentItem.solution}
                </p>
              </div>

              {/* 3. Deliverables / Artifacts on Hand */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Что вы получаете на выходе:
                </div>
                <ul className="space-y-2.5">
                  {currentItem.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0"></span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Confirmed Results & Recommended Tech */}
            <div className="xl:col-span-5 bg-slate-50 dark:bg-slate-900/90 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-6 flex flex-col justify-between h-full shadow-2xs">
              {/* Confirmed Metrics / Results */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-400 mb-3.5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Подтвержденные параметры:</span>
                </div>
                <ul className="space-y-3">
                  {currentItem.results.map((res, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{res}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Technologies */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Используемые технологии и СИ:
                </div>
                <div className="space-y-2">
                  {currentItem.recommendedTech.map((tech, i) => (
                    <button
                      key={i}
                      onClick={() => tech.id && navigateTo(tech.type === 'service' ? 'services' : (tech.type === 'software' ? 'software' : 'hardware'), tech.id)}
                      className="w-full text-left p-3 rounded-lg bg-white dark:bg-slate-950/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all flex items-center justify-between text-xs sm:text-sm group cursor-pointer shadow-2xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-white transition-colors">
                        {tech.name}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
                        Подробнее &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation Action */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Получите предварительную техническую оценку вашей задачи от инженера:
                </div>
                <button
                  onClick={() => openContactModal({
                    title: `Консультация по задаче: ${currentItem.taskTitle}`,
                    formType: 'consultation'
                  })}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Обсудить задачу с инженером</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
