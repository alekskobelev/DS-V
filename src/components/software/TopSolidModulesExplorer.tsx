import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers, Cpu, Wrench, ShieldCheck, CheckCircle2, ArrowRight, Zap,
  FileCode, Sparkles, Box, Scissors, Settings, Cuboid as Cube
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface TopSolidModule {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  targetIndustries: string[];
  capabilities: string[];
  keyBenefits: string[];
  cncFocus?: string;
  icon: any;
  color: string;
}

export const TOPSOLID_MODULES: TopSolidModule[] = [
  {
    id: 'topsolid-design',
    name: "TopSolid'Design",
    category: 'CAD / 3D-Проектирование',
    tagline: 'Параметрическое моделирование сложных деталей, сборок и листового металла',
    description: 'Интегрированная CAD-система для конструкторских бюро. Поддерживает работу с твердотельной, поверхностной и фасетной геометрией, кинематический анализ механизмов и ассоциативную генерацию чертежей по ЕСКД.',
    targetIndustries: ['Машиностроение', 'Приборостроение', 'Авиакосмическая отрасль', 'Энергетика'],
    capabilities: [
      'Прямое и параметрическое гибридное моделирование без ограничений дерева построений',
      'Проектирование сборок из более чем 100 000 компонентов с мгновенным откликом',
      'Специализированный модуль гибки и развертки листового металла с учетом коэффициента K',
      'Встроенная PDM-система с версионированием, правами доступа и контролем ревизий'
    ],
    keyBenefits: [
      '100% ассоциативность с CAM-обработкой (изменение в CAD мгновенно обновляет траектории инструмента)',
      'Полная поддержка оформления чертежей по ГОСТ/ЕСКД в 1 клик',
      'Прямой импорт форматов STEP, IGES, Parasolid, DXF/DWG, SolidWorks, NX, CATIA'
    ],
    icon: Box,
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'topsolid-cam',
    name: "TopSolid'Cam",
    category: 'CAM / Механообработка ЧПУ',
    tagline: '2.5D–5D фрезерование, точение, токарно-фрезерная и многоосевая обработка',
    description: 'Мировой лидер в области программирования станков с ЧПУ. Позволяет рассчитывать безопасные и высокопроизводительные траектории резания с учетом динамики реального станка, оснастки и приспособлений.',
    targetIndustries: ['Металлообработка', 'Турбиностроение', 'Двигателестроение', 'Серийное производство'],
    cncFocus: 'Поддержка всех типов станков: от простых 3-осевых до сложнейших 9-осевых многоцелевых центров',
    capabilities: [
      'Высокоэффективное трохоидальное и волновое фрезерование (сокращение времени цикла до 70%)',
      'Непрерывная 5-осевая обработка моноколес, лопаток, шнеков и глубоких карманов',
      'Синхронизация многоканальной обработки на токарно-фрезерных автоматах и центрах с противошпинделем',
      'Симуляция удаления материала на основе реального G-кода с защитой от коллизий'
    ],
    keyBenefits: [
      'Исключение аварий на станках благодаря точнейшей 3D-модели станка и шпиндельного узла',
      'Увеличение стойкости режущего инструмента в 2–3 раза',
      'Готовые проверенные постпроцессоры под любые стойки (Балт-Систем, Fanuc, Sinumerik, Heidenhain)'
    ],
    icon: Cpu,
    color: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'topsolid-mold',
    name: "TopSolid'Mold",
    category: 'Инструментальная оснастка / Пресс-формы',
    tagline: 'Сквозное проектирование пресс-форм для литья пластмасс под давлением',
    description: 'Специализированное решение для инструментальных производств. Автоматизирует разделение формообразующих полостей (матрица и пуансон), построение линий и поверхностей разъема, расчет усадки и компоновку пакета плит.',
    targetIndustries: ['Литье пластмасс', 'Автопром', 'Бытовая техника', 'Медицинские изделия'],
    capabilities: [
      'Автоматическое разделение детали на формообразующие элементы с контролем поднутрений',
      'Встроенные библиотеки стандартных пакетов плит (DME, Hasco, FCPK, Meusburger, Pedrotti)',
      'Проектирование систем охлаждения с контролем пересечений каналов и расчет литниковых систем',
      'Автоматическая генерация чертежей всех плит пакета со спецификациями толкателей'
    ],
    keyBenefits: [
      'Сокращение срока проектирования пресс-формы с 3–4 недель до 3–5 дней',
      'Исключение ошибок сборки и столкновения толкателей с охлаждающими каналами',
      'Прямая передача формообразующих поверхностей в TopSolid Cam для фрезерования твердых сталей'
    ],
    icon: Layers,
    color: 'from-amber-600 to-orange-700'
  },
  {
    id: 'topsolid-progress',
    name: "TopSolid'Progress",
    category: 'Штамповая оснастка / Листовая штамповка',
    tagline: 'Проектирование штампов последовательного действия (последовательной вырубки и гибки)',
    description: 'Инженерный модуль для разработки сложных штампов листовой штамповки. Рассчитывает развертку заготовки, формует переходные шаги полосы, оптимизирует раскрой и рассчитывает усилия пресса.',
    targetIndustries: ['Приборостроение', 'Электротехника', 'Штамповка деталей кузова', 'Крепеж'],
    capabilities: [
      'Расчет промежуточных состояний деформации детали (развертка за несколько шагов)',
      'Интеллектуальная оптимизация расположения деталей на полосе для максимального КИМ (коэффициента использования металла)',
      'Автоматическое построение вырубных и гибочных пуансонов с учетом зазоров резания',
      'Анализ центра давления штампа и расчет требуемого тоннажа прессового оборудования'
    ],
    keyBenefits: [
      'Экономия дорогостоящего листового проката за счет плотного раскроя полосы',
      'Автоматическая генерация сборок штампа со стандартными колонками, втулками и плитами',
      'Прямая выгрузка контуров пуансонов в электроэрозионный модуль TopSolid Wire'
    ],
    icon: Scissors,
    color: 'from-purple-600 to-violet-700'
  },
  {
    id: 'topsolid-electrode',
    name: "TopSolid'Electrode & Wire",
    category: 'Эрозионная обработка / Электроды',
    tagline: 'Проектирование прошивных электродов и проволочно-вырезная эрозия (2D/4D)',
    description: 'Комплекс для электроэрозионной обработки. Позволяет в несколько кликов извлекать зоны глубоких пазов и ребер для создания графитовых и медных электродов с автогенерацией карт прожига.',
    targetIndustries: ['Инструментальные цеха', 'Пресс-формы и штампы', 'Авиационное двигателестроение'],
    capabilities: [
      'Автоматическое извлечение геометрии электродов с добавлением держателей Erowa / 3R',
      'Расчет искрового зазора (орбитации) и черновых/чистовых припусков',
      'Генерация чертежей позиционирования электродов на станке и создание ЧПУ-программ прожига',
      'Проволочная вырезка TopSolid Wire: 2-осевая и 4-осевая конусная обработка с контролем заправки проволоки'
    ],
    keyBenefits: [
      'Исключение человеческого фактора при расчете искрового зазора и координат привязки',
      'Единый технологический цикл от пресс-формы до прожига на станке',
      'Снижение времени подготовки электродов на 80%'
    ],
    icon: Zap,
    color: 'from-rose-600 to-pink-700'
  },
  {
    id: 'topsolid-wood',
    name: "TopSolid'Wood",
    category: 'Мебельное и деревообрабатывающее производство',
    tagline: 'Сквозное CAD/CAM проектирование мебели, интерьеров и столярных конструкций',
    description: 'Единственная в мире специализированная 3D CAD/CAM система для деревообработки, объединяющая дизайн мебели, конструкторскую документацию, оптимизацию раскроя плит и генерацию программ для ЧПУ.',
    targetIndustries: ['Мебельные фабрики', 'Интерьерные производства', 'Деревянное домостроение'],
    capabilities: [
      'Параметрическое проектирование корпусной и радиусной мебели с автоматической присадкой крепежа',
      'Оптимизация нестинга (раскроя) листовых материалов (ЛДСП, МДФ, фанера, массив)',
      'Автоматическое создание управляющих программ для присадочных и 3–5 осевых фрезерных станков (Biesse, Homag, SCM)',
      'Генерация фотореалистичных рендеров и спецификаций фурнитуры для отдела продаж'
    ],
    keyBenefits: [
      'Мгновенная передача утвержденного проекта в цех без участия технолога-программиста',
      'Снижение отходов плитных материалов на 15–20%',
      'Полная интеграция с учетными системами 1С:ERP'
    ],
    icon: Cube,
    color: 'from-amber-700 to-yellow-800'
  }
];

export const TopSolidModulesExplorer: React.FC = () => {
  const { openContactModal } = useApp();
  const [activeModuleId, setActiveModuleId] = useState<string>('topsolid-cam');

  const currentModule = TOPSOLID_MODULES.find(m => m.id === activeModuleId) || TOPSOLID_MODULES[0];
  const IconComponent = currentModule.icon;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6" id="topsolid-modules">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Отраслевая экосистема TopSolid 7</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Специализированные модули для сквозного цифрового производства
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Единая интегрированная среда CAD/CAM/PDM: от конструкторской задумки и оснастки до готовой детали на станке с ЧПУ без промежуточной конвертации файлов.
          </p>
        </div>

        <button
          onClick={() => openContactModal({
            title: `Заказ демонстрации модуля ${currentModule.name}`,
            formType: 'consultation'
          })}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Заказать демонстрацию модуля</span>
        </button>
      </div>

      {/* Module Selector Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {TOPSOLID_MODULES.map((mod) => {
          const isSelected = activeModuleId === mod.id;
          const ModIcon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModuleId(mod.id)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md transform -translate-y-0.5'
                  : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <ModIcon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
              </div>
              <div>
                <div className="font-extrabold text-xs sm:text-sm tracking-tight">{mod.name}</div>
                <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {mod.category}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Module Detailed View */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Overview & Capabilities */}
          <div className="xl:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${currentModule.color} text-white shadow-md`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {currentModule.category}
                </div>
                <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {currentModule.name}
                </h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-300">
              {currentModule.tagline}
            </p>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
              {currentModule.description}
            </p>

            {/* Target Industries Tags */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Целевые отрасли применения:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentModule.targetIndustries.map((ind, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            {/* Capabilities List */}
            <div className="pt-2 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Ключевой функционал:
              </div>
              <div className="space-y-1.5">
                {currentModule.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Key Economic & Technical Benefits */}
          <div className="xl:col-span-5 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm sm:text-base border-b border-slate-100 dark:border-slate-700 pb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Эффект от внедрения модуля</span>
            </div>

            <div className="space-y-3">
              {currentModule.keyBenefits.map((ben, i) => (
                <div key={i} className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {ben}
                </div>
              ))}
            </div>

            {currentModule.cncFocus && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl text-xs text-blue-800 dark:text-blue-300 font-medium">
                {currentModule.cncFocus}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => openContactModal({
                  title: `Запрос тестовой лицензии и КП на ${currentModule.name}`,
                  formType: 'trial'
                })}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Запросить временную лицензию</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
