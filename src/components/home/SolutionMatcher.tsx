import React, { useState } from 'react';
import { 
  Cpu, 
  Scan, 
  Wrench, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  FileCheck, 
  Award,
  ChevronRight,
  Calculator,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA } from '../../data/mockData';

interface QuizStep {
  title: string;
  subtitle: string;
}

const STEPS: QuizStep[] = [
  {
    title: '1. Производственная задача',
    subtitle: 'Выберите ключевое направление модернизации вашего предприятия',
  },
  {
    title: '2. Габариты и специфика изделий',
    subtitle: 'Укажите характерные размеры и особенности деталей',
  },
  {
    title: '3. Требуемая точность и условия',
    subtitle: 'Выберите условия измерений и допуски',
  },
];

interface OptionItem {
  id: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  badge?: string;
}

const TASK_OPTIONS: OptionItem[] = [
  {
    id: 'cnc-cam',
    icon: Cpu,
    title: 'Фрезерная / токарная ЧПУ обработка (3–5 осей)',
    desc: 'Разработка УП, симуляция со съемом материала, постпроцессоры и исключение коллизий',
    badge: 'CAD/CAM/PDM',
  },
  {
    id: 'metrology-qc',
    icon: FileCheck,
    title: '3D-контроль геометрии и метрология (ОТК)',
    desc: 'Инспекция первого изделия FAI, оценка GD&T по ISO/ASME, карты отклонений от CAD',
    badge: 'Контроль качества',
  },
  {
    id: 'reverse-eng',
    icon: Scan,
    title: 'Реверс-инжиниринг и обратное проектирование',
    desc: 'Оцифровка деталей, импортозамещение запчастей, создание твердотельных STEP моделей',
    badge: 'Реверс & Сканирование',
  },
  {
    id: 'complex-turnkey',
    icon: Layers,
    title: 'Сквозное оснащение под ключ',
    desc: 'Единая экосистема: 3D-сканирование + CAD-проектирование + CAM-обработка + Контроль КИМ',
    badge: 'Комплекс под ключ',
  },
];

const SIZE_OPTIONS: OptionItem[] = [
  {
    id: 'small-precision',
    icon: Zap,
    title: 'Мелкие и точные детали (до 300 мм)',
    desc: 'Лопатки турбин, медицинские импланты, пресс-формы, прецизионные шестерни',
  },
  {
    id: 'medium-parts',
    icon: Wrench,
    title: 'Среднегабаритные узлы (300 – 2000 мм)',
    desc: 'Корпуса редукторов, штампы, литые заготовки, элементы двигателей и станков',
  },
  {
    id: 'large-structures',
    icon: Layers,
    title: 'Крупногабаритные объекты (от 2 до 80 м)',
    desc: 'Сварные рамы, авиационные крылья, фюзеляжи, стапели, корпусы судов, вагоны',
  },
  {
    id: 'sheet-metal',
    icon: Sparkles,
    title: 'Листовая штамповка и кузовные элементы',
    desc: 'Контроль пружинения, толщины стенок, вмятин, зазоров и перепадов (Flush & Gap)',
  },
];

const ACCURACY_OPTIONS: OptionItem[] = [
  {
    id: 'shop-floor',
    icon: Wrench,
    title: 'Цеховые условия (MPE 15 – 35 мкм)',
    desc: 'Измерения непосредственно у станка ЧПУ с термокомпенсацией и виброустойчивостью',
  },
  {
    id: 'lab-metrology',
    icon: Award,
    title: 'Метрологический зал и КИМ (MPE 1 – 10 мкм)',
    desc: 'Прецизионный контроль ответственных посадок и эталонов в чистой зоне',
  },
  {
    id: 'high-speed',
    icon: Clock,
    title: 'Высокая скорость (контроль серии деталей)',
    desc: 'Быстрое бесконтактное лазерное сканирование сотен тысяч точек в секунду',
  },
];

interface MatchedSolution {
  title: string;
  tagline: string;
  recommendedSoftware: { id: string; name: string; desc: string; linkId: string };
  recommendedHardware: { id: string; name: string; desc: string; linkId: string };
  keyBenefits: string[];
  estimatedPayback: string;
  serviceSupport: string;
}

export const SolutionMatcher: React.FC = () => {
  const { openContactModal, navigateTo } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTask, setSelectedTask] = useState<string>('metrology-qc');
  const [selectedSize, setSelectedSize] = useState<string>('medium-parts');
  const [selectedAccuracy, setSelectedAccuracy] = useState<string>('shop-floor');

  const getMatchedSolution = (): MatchedSolution => {
    if (selectedTask === 'cnc-cam') {
      return {
        title: 'Комплекс сквозного CAD/CAM производства и ЧПУ-симуляции',
        tagline: 'Безупречная точность обработки сложных корпусных и 5-осевых деталей',
        recommendedSoftware: {
          id: 'topsolid-7-cam',
          name: 'TopSolid 7 CAM + Postprocessors',
          desc: 'Сквозная параметрическая система для 2D-5D фрезерования и токарно-фрезерных ОЦ с полной кинематической симуляцией станка.',
          linkId: 'topsolid-7',
        },
        recommendedHardware: {
          id: 'pmt-arm-alpha',
          name: 'PMT Arm Alpha Series (MPE 15 мкм)',
          desc: 'Портативная мобильная КИМ для цехового контроля детали прямо на столе станка перед снятием базирования.',
          linkId: 'pmt-alpha-p',
        },
        keyBenefits: [
          'Сокращение времени наладки станка ЧПУ до 40% за счет верификации в TopSolid',
          'Исключение поломок дорогостоящего инструмента и шпинделя',
          'Контроль детали на станке без потери координатной привязки',
          'Индивидуальный постпроцессор под стойки Fanuc / Heidenhain / Siemens',
        ],
        estimatedPayback: '3 – 6 месяцев',
        serviceSupport: 'Инструктаж операторов ЧПУ + разработка постпроцессоров под ключ',
      };
    }

    if (selectedTask === 'reverse-eng') {
      if (selectedSize === 'small-precision' || selectedSize === 'medium-parts') {
        return {
          title: 'Комплекс реверс-инжиниринга и прямого CAD-моделирования',
          tagline: 'Быстрое воссоздание параметрических STEP моделей по физическим образцам',
          recommendedSoftware: {
            id: 'shining3d-exmodel',
            name: 'Shining 3D EXModel Pro ',
            desc: 'Специализированное ПО для мгновенного извлечения аналитических примитивов, построения параметрических эскизов и свободных NURBS-поверхностей.',
            linkId: 'shining3d-exmodel',
          },
          recommendedHardware: {
            id: 'freescan-combo',
            name: 'Лазерный 3D-сканер Shining 3D FreeScan Combo',
            desc: 'Метрологический сканер двойного источника света: 26 синих лазерных линий + VCSEL инфракрасный режим без маркеров.',
            linkId: 'freescan-combo',
          },
          keyBenefits: [
            'Создание 100% твердотельных параметрических CAD-моделей (STEP, Parasolid, IGES)',
            'Точность сканирования до 0.02 мм на лазерном источнике',
            'Live Deviation Analyzer — постоянный контроль отклонений твердого тела от скана',
            'Возможность сканирования блестящих и черных металлических поверхностей',
          ],
          estimatedPayback: '2 – 4 месяца',
          serviceSupport: 'Технический инструктаж по реверс-инжинирингу + тестовый триал 30 дней',
        };
      } else {
        return {
          title: 'Комплекс реверса крупногабаритных объектов и оснастки',
          tagline: 'Бесшовное сканирование конструкций от 2 до 20 метров с высокой детализацией',
          recommendedSoftware: {
            id: 'geomagic-design-x',
            name: 'Geomagic Design X (HEXAGON)',
            desc: 'Мировой золотой стандарт реверс-инжиниринга в экосистеме HEXAGON с технологией LiveTransfer в SolidWorks, Siemens NX, CATIA, Inventor.',
            linkId: 'geomagic-design-x',
          },
          recommendedHardware: {
            id: 'pmt-arm-laser',
            name: 'Мобильная КИМ PMT Arm Elite + Blue Laser Scanner',
            desc: '7-осевая мобильная КИМ с оптическим лазерным сканером для оцифровки труднодоступных зон.',
            linkId: 'pmt-alpha-e',
          },
          keyBenefits: [
            'Прямая передача дерева построения в вашу текущую CAD-систему',
            'Сканирование крупных литых и сварных рам с гарантированной точностью',
            'Сшивка сеток и автоматическое исправление дефектов геометрии',
          ],
          estimatedPayback: '4 – 7 месяцев',
          serviceSupport: 'Пусконаладка на объекте заказчика + методика калибровки',
        };
      }
    }

    if (selectedTask === 'metrology-qc') {
      if (selectedSize === 'large-structures') {
        return {
          title: 'Метрологический комплекс для крупногабаритных объектов',
          tagline: 'Высокоточная инспекция до 80 метров в пространстве цеха',
          recommendedSoftware: {
            id: 'polyworks-inspector',
            name: 'PolyWorks|Inspector™ Metrology Suite',
            desc: 'Универсальное метрологическое ПО мирового класса для работы с контактными щупами, сканерами и лазерными трекерами.',
            linkId: 'polyworks-inspector',
          },
          recommendedHardware: {
            id: 'leica-at960',
            name: 'Лазерный трекер Leica Absolute Tracker AT960',
            desc: 'Прецизионные 6DoF измерения на дистанциях до 80 метров с динамическим сканированием T-Scan.',
            linkId: 'leica-at960',
          },
          keyBenefits: [
            'Контроль геометрии стапелей, авиационных крыльев и турбин с погрешностью до 15 мкм на дистанции',
            'Единый интерфейс PolyWorks для всех типов оборудования на предприятии',
            'Мгновенная генерация сводных метрологических протоколов по ISO/ГОСТ',
          ],
          estimatedPayback: '6 – 10 месяцев',
          serviceSupport: 'Аттестация методик измерений + метрологическая поверка',
        };
      } else {
        return {
          title: 'Цеховой комплекс контроля качества на базе сканера SHINING 3D',
          tagline: 'Сертифицированная метрологическая оценка допусков GD&T по ISO 1101 и ГОСТ',
          recommendedSoftware: {
            id: 'shining3d-inspect',
            name: 'SHINING 3D Inspect (PTB Class 1 — только для сканеров SHINING 3D)',
            desc: 'Специализированный комплекс контроля для линейки сканеров FreeScan и EinScan: многобазовое выравнивание, анализ толщин, штамповки и GD&T.',
            linkId: 'shining3d-inspect',
          },
          recommendedHardware: {
            id: 'freescan-combo',
            name: 'Лазерный 3D-сканер Shining 3D FreeScan Combo',
            desc: 'Метрологический лазерный 3D-сканер с синими лазерами и VCSEL источником для высокоточного бесконтактного контроля.',
            linkId: 'freescan-combo',
          },
          keyBenefits: [
            'Сертификация расчетных алгоритмов PTB (Physikalisch-Technische Bundesanstalt)',
            'Автоматическая генерация протокола контроля в PDF и Excel за 3 минуты',
            'Специализированные модули: листовой металл, вмятины, зазоры (Flush & Gap)',
            'Сокращение брака на серийном производстве на 75–90%',
          ],
          estimatedPayback: '2 – 5 месяцев',
          serviceSupport: 'Бесплатное тестовое сканирование детали + инструктаж специалистов ОТК',
        };
      }
    }

    // Default Complex
    return {
      title: 'Сквозная цифровая экосистема «Проектирование – ЧПУ – Метрология»',
      tagline: 'Полная интеграция конструкторского отдела, станочного парка и службы ОТК',
      recommendedSoftware: {
        id: 'topsolid-polyworks',
        name: 'TopSolid 7 (CAD/CAM/PDM) + PolyWorks|Inspector',
        desc: 'Сквозное проектирование пресс-форм и оснастки, генерация управляющих программ ЧПУ и последующий автоматизированный контроль качества.',
        linkId: 'topsolid-7',
      },
      recommendedHardware: {
        id: 'freescan-pmt',
        name: 'PMT Arm + 3D-сканер Shining 3D FreeScan',
        desc: 'Комбинированный метрологический пост: контактные измерения посадочных отверстий щупом + скоростная лазерная оцифровка сложных поверхностей.',
        linkId: 'freescan-combo',
      },
      keyBenefits: [
        'Единый цифровой поток без потери данных при конвертации форматов',
        'Быстрое обнаружение отклонений и автоматическая корректировка ЧПУ-программ',
        'Полная независимость от зарубежных облачных сервисов и локальная база PDM',
      ],
      estimatedPayback: '4 – 8 месяцев',
      serviceSupport: 'Комплексный консалтинг, шеф-монтаж и сертификация персонала',
    };
  };

  const solution = getMatchedSolution();

  return (
    <div id="solution-matcher" className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Инженерный онлайн-конфигуратор решений</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Подберите оптимальный комплекс за 3 шага
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl">
              Ответьте на 3 ключевых вопроса о задачах вашего производства, чтобы получить готовую спецификацию программного обеспечения и измерительного оборудования с расчетом окупаемости.
            </p>
          </div>

          {currentStep > 0 && currentStep < 3 && (
            <button
              onClick={() => {
                setCurrentStep(0);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить выбор</span>
            </button>
          )}
        </div>

        {/* Progress indicators */}
        <div className="mt-6 pt-6 border-t border-blue-800/60 grid grid-cols-3 gap-2 sm:gap-4">
          {STEPS.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`text-left transition-all ${
                currentStep === idx
                  ? 'opacity-100'
                  : currentStep > idx
                  ? 'opacity-80'
                  : 'opacity-40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === idx
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300/50'
                    : currentStep > idx
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-white/20 text-white'
                }`}>
                  {currentStep > idx ? '✓' : idx + 1}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-white truncate">
                  Шаг {idx + 1}
                </span>
              </div>
              <div className={`h-1.5 rounded-full ${
                currentStep === idx ? 'bg-amber-400' : currentStep > idx ? 'bg-emerald-400' : 'bg-white/20'
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-5 sm:p-6">
        {/* STEP 0: Task */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Шаг 1 из 3</span>
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                Какова главная цель модернизации на вашем предприятии?
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Выберите направление, требующее оптимизации в первую очередь
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TASK_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedTask === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedTask(opt.id)}
                    className={`p-5 rounded-lg border-2 text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {opt.badge && (
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-blue-200 text-blue-900' : 'bg-gray-100 text-slate-500'
                          }`}>
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-base font-bold text-gray-900 pt-2">
                        {opt.title}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between text-xs font-semibold">
                      <span className={isSelected ? 'text-blue-700' : 'text-gray-400'}>
                        {isSelected ? '✓ Выбрано' : 'Нажмите для выбора'}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-blue-600' : 'text-gray-300'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <span>Далее: Размеры деталей</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Size & Specifics */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Шаг 2 из 3</span>
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                С какими габаритами деталей предстоит работать?
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Размер изделий определяет оптимальный радиус мобильной КИМ или рабочий объем сканера
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SIZE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedSize(opt.id)}
                    className={`p-5 rounded-lg border-2 text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-900">
                            ✓ Выбрано
                          </span>
                        )}
                      </div>
                      <div className="text-base font-bold text-gray-900 pt-2">
                        {opt.title}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>

                    <div className="pt-4 text-xs font-semibold text-gray-400">
                      {isSelected ? 'Оптимальный типоразмер зафиксирован' : 'Выбрать этот типоразмер'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(0)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-500 font-semibold rounded-lg text-xs sm:text-sm transition-colors"
              >
                ← Назад
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <span>Далее: Точность и условия</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Accuracy & Environment */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Шаг 3 из 3</span>
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                Где будут производиться замеры и какова требуемая точность?
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Это позволит подобрать оптимальный класс защиты оборудования и сертификацию расчетных алгоритмов
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ACCURACY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedAccuracy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedAccuracy(opt.id)}
                    className={`p-5 rounded-lg border-2 text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-base font-bold text-gray-900 pt-2">
                        {opt.title}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>

                    <div className="pt-4 text-xs font-semibold">
                      <span className={isSelected ? 'text-blue-700' : 'text-gray-400'}>
                        {isSelected ? '✓ Выбрано' : 'Выбрать'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-500 font-semibold rounded-lg text-xs sm:text-sm transition-colors"
              >
                ← Назад
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Показать подобранный комплект</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Matched Solution View */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Header summary banner */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-lg p-6 sm:p-8 text-white space-y-4 border border-blue-800/40">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Индивидуальная рекомендация ДС‑Инжиниринг</span>
                </div>
                <div className="text-xs text-blue-200 font-mono">
                  Окупаемость: <strong className="text-amber-400">{solution.estimatedPayback}</strong>
                </div>
              </div>

              <div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-white">
                  {solution.title}
                </h4>
                <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
                  {solution.tagline}
                </p>
              </div>
            </div>

            {/* Hardware + Software Recommended Pair */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recommended Software */}
              <div className="p-6 rounded-lg border-2 border-blue-200 bg-blue-50/40 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                      Рекомендуемое ПО
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded">
                      Лицензия + Инструктаж
                    </span>
                  </div>

                  <h5 className="text-lg font-bold text-gray-900">
                    {solution.recommendedSoftware.name}
                  </h5>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {solution.recommendedSoftware.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-blue-200 flex items-center justify-between">
                  <button
                    onClick={() => navigateTo('software', solution.recommendedSoftware.linkId)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5"
                  >
                    <span>Смотреть описание в каталоге ПО</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Recommended Hardware */}
              <div className="p-6 rounded-lg border-2 border-emerald-200 bg-emerald-50/40 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Рекомендуемое Оборудование
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded">
                      Гарантия 12–24 мес.
                    </span>
                  </div>

                  <h5 className="text-lg font-bold text-gray-900">
                    {solution.recommendedHardware.name}
                  </h5>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {solution.recommendedHardware.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-emerald-200 flex items-center justify-between">
                  <button
                    onClick={() => navigateTo('hardware', solution.recommendedHardware.linkId)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5"
                  >
                    <span>Смотреть спецификацию в оборудовании</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Key Benefits List */}
            <div className="bg-slate-50 p-6 rounded-lg border border-gray-200 space-y-3">
              <h6 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Экономический и технологический эффект от внедрения:
              </h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
                {solution.keyBenefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep(0)}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-500 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Пройти тест заново</span>
              </button>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() =>
                    openContactModal({
                      title: `Запрос ТКП: ${solution.title}`,
                      defaultProduct: `${solution.recommendedSoftware.name} + ${solution.recommendedHardware.name}`,
                      formType: 'quote',
                    })
                  }
                  className="w-full sm:w-auto px-6 py-3 bg-[#F59E0B] hover:bg-amber-600 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Запросить смету и расчет окупаемости</span>
                </button>

                <button
                  onClick={() =>
                    openContactModal({
                      title: `Заказ демо-показа / тестового сканирования`,
                      defaultProduct: solution.recommendedHardware.name,
                      formType: 'consultation',
                    })
                  }
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Заказать тестовое сканирование детали</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
