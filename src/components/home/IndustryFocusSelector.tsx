import React, { useState } from 'react';
import { 
  Plane, 
  Car, 
  Factory, 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  FileCheck2, 
  Crosshair,
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types';

export interface IndustryProfile {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
  bgLight: string;
  borderLight: string;
  tagColor: string;
  headline: string;
  subheadline: string;
  typicalParts: string[];
  keyChallenges: string[];
  recommendedSolutions: {
    title: string;
    type: 'equipment' | 'service' | 'software';
    tag: string;
    desc: string;
    actionTarget: { page: PageId; subTab?: string };
  }[];
  standards: string[];
  deliverables: string[];
}

export const INDUSTRY_PROFILES: IndustryProfile[] = [
  {
    id: 'aviation',
    name: 'Авиастроение & Двигателестроение',
    shortName: 'Авиация & Космос',
    badge: 'Допуски от 5 мкм • ГОСТ Р 59085 / AS9102',
    icon: Plane,
    accentColor: 'text-sky-600 dark:text-sky-400',
    bgLight: 'bg-sky-50 dark:bg-sky-950/40',
    borderLight: 'border-sky-200 dark:border-sky-800',
    tagColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
    headline: 'Прецизионный контроль аэродинамических поверхностей и лопаточных машин',
    subheadline: 'Контроль сложной свободной формы (Free-form surfaces), лопаток ГТД, моноколес (блисков), корпусов и шпангоутов с выдачей протоколов первого изделия FAI.',
    typicalParts: [
      'Рабочие и сопловые лопатки ГТД',
      'Блиски и моноколеса компрессоров',
      'Силовые шпангоуты и лонжероны',
      'Сборочные стапели и оснастка крыла'
    ],
    keyChallenges: [
      'Жесткие допуски профиля пера лопатки (от ±0.015 мм)',
      'Сложнобазируемые детали без плоских граней',
      'Обязательная прослеживаемость измерений во ФГИС «АРШИН»',
      'Подготовка цифровых двойников для 5-осевой обработки'
    ],
    recommendedSolutions: [
      {
        title: 'Shining 3D FreeScan Combo / UE Pro',
        type: 'equipment',
        tag: 'Лазерный 3D-сканер',
        desc: 'Синий лазер высокого разрешения (погрешность до 0.02 мм). Оцифровка блестящих кромок лопаток без матирующего спрея.',
        actionTarget: { page: 'hardware' }
      },
      {
        title: 'Координатно-измерительная рука Hexagon Absolute Arm 8525',
        type: 'equipment',
        tag: 'Мобильная КИМ',
        desc: 'Контактные замеры баз и сканирование 3D-датчиком AS1 прямо на сборочном стапеле в цеху.',
        actionTarget: { page: 'hardware' }
      },
      {
        title: 'Контроль геометрии и протокол FAI (AS9102 / ГОСТ Р 59085)',
        type: 'service',
        tag: 'Инженерная услуга',
        desc: 'Выездной контроль партии деталей на КИМ с полным анализом GD&T и цветовой картой отклонений.',
        actionTarget: { page: 'services', subTab: 'parts-inspection' }
      },
      {
        title: 'TopSolid 7 CAM: 5-осевая обработка лопаток',
        type: 'software',
        tag: 'Инженерное ПО',
        desc: 'Непрерывная 5-осевая фрезеровка турбинных лопаток с кинематической защитой от зарезания станка.',
        actionTarget: { page: 'software', subTab: 'topsolid-7' }
      }
    ],
    standards: ['ГОСТ Р 59085-2020', 'AS9102B (FAI)', 'ISO 1101 (GD&T)', 'ФГИС АРШИН'],
    deliverables: ['STEP AP242 (с аннотациями PMI)', 'Протокол PolyWorks (.pwx)', 'Цветовая 3D-карта отклонений']
  },
  {
    id: 'automotive',
    name: 'Автомобилестроение & Кузовное производство',
    shortName: 'Автопром',
    badge: 'Крупногабаритная штамповка • Сварочные кондукторы',
    icon: Car,
    accentColor: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    borderLight: 'border-blue-200 dark:border-blue-800',
    tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
    headline: 'Выверка штамповой оснастки, сварочных кондукторов и кузовных элементов',
    subheadline: 'Контроль геометрических баз RPS, анализ пружинения листового металла после формообразования, реверс изношенных матриц и пуансонов.',
    typicalParts: [
      'Крупные вытяжные и формовочные штампы (1–4 м)',
      'Кузовные лицевые панели и каркасы',
      'Сварочные и сборочные кондукторы',
      'Пластиковые отливки бамперов и панелей приборов'
    ],
    keyChallenges: [
      'Учет упругого пружинения листа и износа кромок штампа',
      'Выверка взаимного положения базовых пальцев кондуктора',
      'Оперативный контроль прямо в прессовом цеху без остановки линии',
      'Реверс импортной оснастки без исходной КД'
    ],
    recommendedSolutions: [
      {
        title: 'Hexagon Absolute Arm 8525 / PMT Alpha Arm',
        type: 'equipment',
        tag: 'Мобильная КИМ',
        desc: 'Измерительный объем до 4.5 м, углепластиковые звенья с термостабилизацией для работы в условиях штамповочного цеха.',
        actionTarget: { page: 'hardware' }
      },
      {
        title: 'Реверс-инжиниринг штампов и пресс-форм',
        type: 'service',
        tag: 'Инженерная услуга',
        desc: 'Построение параметрической твердотельной CAD-модели с разделением на формообразующие, пуансон и матрицу.',
        actionTarget: { page: 'services', subTab: 'reverse-engineering' }
      },
      {
        title: 'TopSolid 7 Mold & Progress: штампы и формы',
        type: 'software',
        tag: 'Инженерное ПО',
        desc: 'Специализированное сквозное проектирование последовательных вырубных и формовочных штампов.',
        actionTarget: { page: 'software', subTab: 'topsolid-7' }
      }
    ],
    standards: ['Базирование по RPS', 'ГОСТ 2.102-2013 (ЕСКД)', 'ГОСТ Р ИСО 10360', 'ФГИС АРШИН'],
    deliverables: ['Параметрическая CAD-модель (STEP/Parasolid)', 'Анализ износа штампа', 'Таблица отклонений баз RPS']
  },
  {
    id: 'machinery',
    name: 'Общее, тяжелое & Энергетическое машиностроение',
    shortName: 'Машиностроение & Энергетика',
    badge: 'Крупногабарит 2–15+ м • Выверка соосности и плоскостности',
    icon: Factory,
    accentColor: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    borderLight: 'border-amber-200 dark:border-amber-800',
    tagColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    headline: 'Высокоточные измерения крупногабаритных корпусов, турбин и редукторов',
    subheadline: 'Метрологический контроль сварных рам, прокатных станов, гидротурбин и станин станков методом перебазирования (Leapfrog) и лазерной трекерометрии.',
    typicalParts: [
      'Сварные станины и крупногабаритные балки (до 15 м)',
      'Корпуса редукторов и гидроагрегатов',
      'Валопроводы, фланцы и роторы турбин',
      'Тяжелая литая оснастка и изложницы'
    ],
    keyChallenges: [
      'Температурная деформация крупногабарита в нестабильном цеху',
      'Измерение объектов, превышающих физический вылет руки КИМ',
      'Проверка геометрической точности направляющих станка (прямолинейность, соосность)',
      'Быстрый выезд мобильной бригады со своим поверенным оборудованием'
    ],
    recommendedSolutions: [
      {
        title: 'Лазерные трекеры Leica Geosystems (AT960 / AT403)',
        type: 'equipment',
        tag: 'Лазерный трекер',
        desc: 'Дальность измерений до 160 м, субмиллиметровая точность на больших дистанциях, выверка геометрии крупногабаритных агрегатов.',
        actionTarget: { page: 'hardware' }
      },
      {
        title: 'Метрологический контроль с функцией Leapfrog',
        type: 'service',
        tag: 'Инженерная услуга',
        desc: 'Сшивка систем координат при перемещении мобильной КИМ вокруг объекта без потери паспортной точности.',
        actionTarget: { page: 'services', subTab: 'parts-inspection' }
      },
      {
        title: 'Разработка кинематических постпроцессоров ЧПУ',
        type: 'service',
        tag: 'Инженерная услуга',
        desc: 'Постпроцессоры для портальных и расточных тяжелых станков с ЧПУ (Siemens Sinumerik, Fanuc, Heidenhain).',
        actionTarget: { page: 'services', subTab: 'cnc-postprocessors' }
      }
    ],
    standards: ['ISO 10360-10 (Трекеры)', 'ГОСТ 8.549-86', 'ГОСТ 2.503-2015', 'ФГИС АРШИН'],
    deliverables: ['Отчет выверки баз и осей', 'CAD-сборка в STEP AP214/242', 'Справка о температурной компенсации']
  },
  {
    id: 'tooling',
    name: 'Инструментальное производство & Пресс-формы',
    shortName: 'Пресс-формы & Оснастка',
    badge: 'Субмикронная точность • Твердотельный CAD B-Rep',
    icon: Wrench,
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderLight: 'border-emerald-200 dark:border-emerald-800',
    tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    headline: 'Высокоточная оцифровка формообразующих, фильер и калибров',
    subheadline: 'Реверс-инжиниринг сложной геометрии знаков, матриц, режущих кромок и охлаждающих каналов для импортозамещения зарубежных компонентов.',
    typicalParts: [
      'Пресс-формы для литья пластмасс под давлением',
      'Пресс-формы для алюминиевого литья (ЛПД)',
      'Калибры, шаблоны и фасонный режущий инструмент',
      'Электроды для прошивных электроэрозионных станков'
    ],
    keyChallenges: [
      'Острые кромки, глубокие колодцы и тонкие ребра',
      'Необходимость параметрической модели для внесения усадки',
      'Высокие требования к шероховатости и точности позиционирования',
      'Отсутствие исходных математических моделей от зарубежных изготовителей'
    ],
    recommendedSolutions: [
      {
        title: 'ScanLine EasyScan Omni / Shining 3D FreeScan',
        type: 'equipment',
        tag: 'Метрологический 3D-сканер',
        desc: 'Оптическая система высокого разрешения с синими лазерными сетками для захвата мельчайших радиусов от 0.1 мм.',
        actionTarget: { page: 'hardware' }
      },
      {
        title: 'Реверс в параметрический B-Rep (SolidWorks, TopSolid, NX)',
        type: 'service',
        tag: 'Инженерная услуга',
        desc: 'Построение идеальных цилиндров, конусов и плавных сопряжений поверхности без эффекта триангуляции.',
        actionTarget: { page: 'services', subTab: 'reverse-engineering' }
      },
      {
        title: 'TopSolid 7 Tooling: сквозное проектирование форм',
        type: 'software',
        tag: 'Инженерное ПО',
        desc: 'Автоматический анализ уклонов, линии разъема и расчет каналов охлаждения пресс-формы.',
        actionTarget: { page: 'software', subTab: 'topsolid-7' }
      }
    ],
    standards: ['ГОСТ 2.051-2013 (ЭМД)', 'ГОСТ 2789-73 (Шероховатость)', 'ISO 1101', 'ФГИС АРШИН'],
    deliverables: ['Параметрический STEP AP242', 'Чертежи ЕСКД с допусками', 'Карта толщин стенок и уклонов']
  }
];

export const IndustryFocusSelector: React.FC = () => {
  const { navigateTo, openContactModal } = useApp();
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('aviation');

  const currentProfile = INDUSTRY_PROFILES.find(p => p.id === selectedIndustryId) || INDUSTRY_PROFILES[0];
  const IconComponent = currentProfile.icon;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm p-5 sm:p-8 text-slate-900 dark:text-white">
      {/* Header and Value Proposition */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
            <Crosshair className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Быстрый путеводитель по отраслям
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Решения под отраслевые задачи вашего предприятия
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Выберите направление, чтобы мгновенно увидеть рекомендуемый измерительный комплекс, примеры решаемых задач с допусками и стандарты сдачи работ.
          </p>
        </div>

        {/* Global Action: 1-Click RFQ Scroll */}
        <button
          onClick={() => {
            const el = document.getElementById('section-quick-rfq');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else {
              openContactModal({
                title: `Оценка ТЗ под отрасль: ${currentProfile.name}`,
                formType: 'quote'
              });
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 self-start md:self-auto cursor-pointer"
        >
          <span>Оценить деталь за 1 клик</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Industry Tabs (Solid High Contrast Segmented Buttons) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 my-6">
        {INDUSTRY_PROFILES.map((profile) => {
          const TabIcon = profile.icon;
          const isSelected = profile.id === selectedIndustryId;
          return (
            <button
              key={profile.id}
              onClick={() => setSelectedIndustryId(profile.id)}
              className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl text-left transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white dark:bg-slate-700 text-blue-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-600'
              }`}>
                <TabIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className={`text-xs sm:text-sm font-extrabold truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {profile.shortName}
                </div>
                <div className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'}`}>
                  {profile.id === 'aviation' ? 'от 5 мкм' : profile.id === 'automotive' ? 'Штампы & RPS' : profile.id === 'machinery' ? 'До 15+ метров' : 'B-Rep оснастка'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Industry Detail Matrix */}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-4 sm:p-6 lg:p-7 space-y-6">
        {/* Industry Banner Info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-800/90 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {currentProfile.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-cyan-300 border border-blue-200 dark:border-blue-700">
                  {currentProfile.badge}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
                {currentProfile.headline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => openContactModal({
                title: `Консультация по отрасли: ${currentProfile.name}`,
                formType: 'consultation'
              })}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Консультация инженера отрасли</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2 Columns: Typical Parts & Challenges vs Recommended Solutions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Left Column: Details, Parts & Challenges (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Typical Parts */}
            <div className="bg-[#0E1B33] rounded-xl p-4 sm:p-5 border border-slate-800 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Типичные измеряемые узлы и детали
              </div>
              <ul className="space-y-2">
                {currentProfile.typicalParts.map((part, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{part}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Challenges */}
            <div className="bg-[#0E1B33] rounded-xl p-4 sm:p-5 border border-slate-800 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Специфика цеховых требований
              </div>
              <ul className="space-y-2">
                {currentProfile.keyChallenges.map((challenge, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0 mt-1.5" />
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Standards & Output Formats */}
            <div className="bg-[#0E1B33] rounded-xl p-4 sm:p-5 border border-slate-800 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-400" />
                Стандарты и выходные материалы
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentProfile.standards.map((std, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {std}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                {currentProfile.deliverables.map((item, idx) => (
                  <span key={idx} className="text-[11px] font-medium text-cyan-200 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/60">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Recommended Solutions (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
              Рекомендуемый комплекс оборудования и услуг для отрасли
            </div>

            <div className="space-y-3">
              {currentProfile.recommendedSolutions.map((solution, idx) => (
                <div 
                  key={idx}
                  className="bg-[#0E1B33] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm hover:border-blue-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        solution.type === 'equipment' 
                          ? 'bg-blue-500/20 text-cyan-300 border border-blue-400/30'
                          : solution.type === 'service'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                      }`}>
                        {solution.tag}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                      {solution.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {solution.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => navigateTo(solution.actionTarget.page, solution.actionTarget.subTab)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-bold transition-all shrink-0 self-start sm:self-auto cursor-pointer border border-slate-700 hover:border-blue-500"
                  >
                    <span>Подробнее</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Direct RFQ Action Box */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 border border-blue-800/60 shadow-lg">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                  Прямой диалог с метрологом
                </div>
                <div className="text-sm font-bold">
                  Нужна оценка чертежа или выезд инженера по {currentProfile.shortName.toLowerCase()}?
                </div>
                <div className="text-xs text-slate-300">
                  Согласуем NDA в течение 1 часа, предварительный расчет ТКП за 24 часа.
                </div>
              </div>
              <button
                onClick={() => {
                  const quickSec = document.getElementById('section-quick-rfq');
                  if (quickSec) {
                    quickSec.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    openContactModal({
                      title: `Запрос ТКП по направлению: ${currentProfile.name}`,
                      formType: 'quote'
                    });
                  }
                }}
                className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2"
              >
                <span>Оценить ТЗ / Чертеж</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
