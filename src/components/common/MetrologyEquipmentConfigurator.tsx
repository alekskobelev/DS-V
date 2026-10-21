import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wrench, 
  Layers, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ShieldCheck, 
  ArrowRight, 
  Download, 
  Send, 
  FileText, 
  Sliders, 
  Gauge, 
  Cpu, 
  ChevronRight, 
  Building2, 
  Thermometer, 
  Scan, 
  Target, 
  Crosshair,
  Printer,
  Box,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PartVisualizer3D } from './PartVisualizer3D';
import { useConfiguratorSettings } from '../../hooks/useConfiguratorSettings';

export interface PartGeometryInput {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  weightKg: number;
  partType: 'housing' | 'mold_die' | 'impeller_blade' | 'frame_weldment' | 'sheet_metal' | 'tooling_shaft';
  surfaceType: 'machined_matte' | 'mirror_glossy' | 'dark_carbon' | 'transparent';
  requiredToleranceUm: number; // in microns
  gdtParameters: string[];
  workshopEnvironment: 'metrology_lab' | 'shop_floor' | 'on_machine' | 'onsite_field';
  scanDensityNeed: 'inspection_points' | 'full_colormap' | 'both';
}

export interface RecommendedEquipmentResult {
  primaryDevice: {
    id: string;
    title: string;
    category: string;
    brand: string;
    accuracyFormula: string;
    mpeUm: number;
    recommendedSoftware: string;
    inspectionStandard: string;
    measuringMethod: string;
    measurementDurationEst: string;
    description: string;
    advantages: string[];
    photoUrl?: string;
  };
  secondaryDevice?: {
    title: string;
    category: string;
    brand: string;
    mpeUm: number;
    reason: string;
  };
  metrologyReserveRatio: number; // T / MPE, ideally >= 3.0 according to RMG 29 / GOST
  metrologyReserveStatus: 'optimal' | 'acceptable' | 'marginal';
  methodologyNotes: string[];
}

export const MetrologyEquipmentConfigurator: React.FC<{
  onClose?: () => void;
  isStandalone?: boolean;
}> = ({ onClose, isStandalone = false }) => {
  const { openContactModal, showToast, openRoiCalculatorModal } = useApp();
  const { settings: globalConfigSettings } = useConfiguratorSettings();
  const metrologySettings = globalConfigSettings.metrology;

  // Step state (1: Geometry, 2: Tolerance & GD&T, 3: Environment, 4: Results)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hasUserEdited, setHasUserEdited] = useState<boolean>(false);

  // Configuration inputs with CMS defaults
  const [lengthMm, setLengthMm] = useState<number>(metrologySettings.defaultLengthMm || 450);
  const [widthMm, setWidthMm] = useState<number>(metrologySettings.defaultWidthMm || 320);
  const [heightMm, setHeightMm] = useState<number>(metrologySettings.defaultHeightMm || 180);
  const [weightKg, setWeightKg] = useState<number>(metrologySettings.defaultWeightKg || 25);
  const [partType, setPartType] = useState<PartGeometryInput['partType']>(metrologySettings.defaultPartType || 'housing');
  const [surfaceType, setSurfaceType] = useState<PartGeometryInput['surfaceType']>(metrologySettings.defaultSurfaceType || 'machined_matte');

  const [tolerancePreset, setTolerancePreset] = useState<'it5' | 'it7' | 'it9' | 'it12' | 'custom'>('it7');
  const [toleranceUm, setToleranceUm] = useState<number>(metrologySettings.it7Um || 15);
  const [selectedGdt, setSelectedGdt] = useState<string[]>([
    'Плоскостность и цилиндричность',
    'Перпендикулярность и параллельность баз',
    'Позиционный допуск отверстий'
  ]);
  const [scanDensityNeed, setScanDensityNeed] = useState<PartGeometryInput['scanDensityNeed']>(metrologySettings.defaultScanDensityNeed || 'full_colormap');
  const [workshopEnvironment, setWorkshopEnvironment] = useState<PartGeometryInput['workshopEnvironment']>(metrologySettings.defaultWorkshopEnvironment || 'shop_floor');

  // Synchronize with loaded CMS defaults if untouched
  useEffect(() => {
    if (!hasUserEdited && metrologySettings) {
      if (metrologySettings.defaultLengthMm) setLengthMm(metrologySettings.defaultLengthMm);
      if (metrologySettings.defaultWidthMm) setWidthMm(metrologySettings.defaultWidthMm);
      if (metrologySettings.defaultHeightMm) setHeightMm(metrologySettings.defaultHeightMm);
      if (metrologySettings.defaultWeightKg) setWeightKg(metrologySettings.defaultWeightKg);
      if (metrologySettings.defaultPartType) setPartType(metrologySettings.defaultPartType);
      if (metrologySettings.defaultSurfaceType) setSurfaceType(metrologySettings.defaultSurfaceType);
      if (metrologySettings.defaultWorkshopEnvironment) setWorkshopEnvironment(metrologySettings.defaultWorkshopEnvironment);
      if (metrologySettings.defaultScanDensityNeed) setScanDensityNeed(metrologySettings.defaultScanDensityNeed);
      if (metrologySettings.it7Um && tolerancePreset === 'it7') setToleranceUm(metrologySettings.it7Um);
    }
  }, [metrologySettings, hasUserEdited, tolerancePreset]);

  // Handle tolerance preset change
  const handleTolerancePresetSelect = (preset: 'it5' | 'it7' | 'it9' | 'it12' | 'custom') => {
    setHasUserEdited(true);
    setTolerancePreset(preset);
    if (preset === 'it5') setToleranceUm(metrologySettings.it5Um || 4);
    else if (preset === 'it7') setToleranceUm(metrologySettings.it7Um || 15);
    else if (preset === 'it9') setToleranceUm(metrologySettings.it9Um || 45);
    else if (preset === 'it12') setToleranceUm(metrologySettings.it12Um || 180);
  };

  // Toggle GD&T parameters
  const toggleGdt = (item: string) => {
    setHasUserEdited(true);
    setSelectedGdt(prev => 
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  // Thresholds from CMS
  const optimalRatio = metrologySettings.optimalReserveRatio || 3.0;
  const acceptableRatio = metrologySettings.acceptableReserveRatio || 1.8;

  // Intelligent Metrological Matching Engine
  const recommendation: RecommendedEquipmentResult = useMemo(() => {
    const maxDim = Math.max(lengthMm, widthMm, heightMm);
    const tol = Math.max(1, toleranceUm);

    // 1. Extreme Large Scale (> 2500 mm)
    if (maxDim > 2500 || workshopEnvironment === 'onsite_field' && maxDim > 1800) {
      const mpe = Math.round(10 + (maxDim / 1000) * 5); // Leica tracker formula
      const ratio = tol / mpe;
      return {
        primaryDevice: {
          id: 'leica_tracker',
          title: 'Лазерный трекер Leica Absolute Tracker AT960 / AT403',
          category: 'Лазерные трекеры и интерферометры',
          brand: 'Leica Geosystems (Швейцария / Hexagon)',
          accuracyFormula: 'U = 15 мкм + 6 мкм/м (MPE)',
          mpeUm: mpe,
          recommendedSoftware: 'PolyWorks|Inspector™ Probe + SpatialAnalyzer',
          inspectionStandard: 'ГОСТ Р ИСО 10360-10:2019 (Лазерные системы слежения)',
          measuringMethod: 'Сферический интерферометр (IFM / ADM), измерение с T-Probe и T-Scan в радиусе до 80 м без перебазирования.',
          measurementDurationEst: '25–45 минут на крупногабаритный объект',
          description: 'Идеальное решение для контроля крупногабаритных станин, сварных рам, оснастки и авиационных стапелей. Беспроводной щуп T-Probe позволяет замерять скрытые точки внутри глубоких карманов.',
          advantages: [
            'Рабочий диапазон измерений в сфере до 80–160 метров',
            'Отсутствие необходимости перемещения тяжелой заготовки',
            'Высочайшая угловая точность благодаря технологии PowerLock',
            'Прямая интеграция с CAD-моделью изделия в реальном времени'
          ],
          photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80'
        },
        secondaryDevice: {
          title: 'Оптический лазерный 3D-сканер Shining 3D FreeScan Combo',
          category: 'Ручные метрологические сканеры',
          brand: 'Shining 3D',
          mpeUm: 20,
          reason: 'Для детального оцифровывания мелких узлов и швов на крупногабаритной конструкции'
        },
        metrologyReserveRatio: Math.round(ratio * 10) / 10,
        metrologyReserveStatus: ratio >= optimalRatio ? 'optimal' : ratio >= acceptableRatio ? 'acceptable' : 'marginal',
        methodologyNotes: [
          'Привязка системы координат трекера к заводским реперным маркам стапеля.',
          'Учет температурной компенсации материала детали (сталь α=11.5 мкм/м·°C) через датчики температуры объекта.',
          'Протоколирование отклонений баз и осей с формированием карты центробежных погрешностей.'
        ]
      };
    }

    // 2. High Precision / Tight Tolerance (T <= 8 um)
    if (tol <= 8 || (tol <= 15 && workshopEnvironment === 'metrology_lab' && partType === 'housing')) {
      const mpe = Math.round(1.2 + (maxDim / 350) * 10) / 10; // PMT Alpha CMM formula ~ 1.8-2.5 um
      const ratio = tol / mpe;
      return {
        primaryDevice: {
          id: 'pmt_cmm_bridge',
          title: 'Координатно-измерительная машина PMT Alpha / Horizon',
          category: 'Стационарные мостовые КИМ с ЧПУ',
          brand: 'PMT (Официальный представитель «ДС-Инжиниринг»)',
          accuracyFormula: 'MPEE = 1.2 + L / 350 мкм (по ГОСТ Р ИСО 10360-2)',
          mpeUm: mpe,
          recommendedSoftware: 'PolyWorks|Inspector™ CMM CNC + Renishaw UCC',
          inspectionStandard: 'ГОСТ Р ИСО 10360-2:2018 (КИМ с контактными датчиками)',
          measuringMethod: 'Прямой контактный метод с автоматической поворотной головкой Renishaw PH10M / SP25M непрерывного сканирования.',
          measurementDurationEst: '12–25 минут в автоматическом ЧПУ-цикле',
          description: 'Золотой стандарт метрологической лаборатории. Цельногранитное основание класса точности 00 по DIN 876, пневматические опоры на всех осях и оптические шкалы Renishaw с разрешением 0.05 мкм.',
          advantages: [
            'Минимальная погрешность измерений в микронах (MPEE от 1.2 мкм)',
            'Высокая повторяемость результатов и полная независимость от оператора',
            'Контроль допусков формы (круглость, цилиндричность) с высокой плотностью точек щупом SP25M',
            'Свидетельство о поверке государственного образца (ФГИС «АРШИН»)'
          ],
          photoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=700&q=80'
        },
        secondaryDevice: {
          title: 'Оптический синий 3D-сканер ScanLine Metrology',
          category: 'Оптические сканеры синего света',
          brand: 'ScanLine',
          mpeUm: 6,
          reason: 'Для быстрого построения сплошной 3D-карты отклонений свободных поверхностей'
        },
        metrologyReserveRatio: Math.round(ratio * 10) / 10,
        metrologyReserveStatus: ratio >= optimalRatio ? 'optimal' : ratio >= acceptableRatio ? 'acceptable' : 'marginal',
        methodologyNotes: [
          'Термостатирование детали в ЦЗЛ при 20 ± 0.5 °C не менее 8 часов перед чистовым циклом контроля.',
          'Калибровка измерительных наконечников по эталонной рубиновой сфере Ø19 мм с фиксацией формы щупа.',
          'Определение координатных баз по правилу 3-2-1 по чертежным базам A, B, C.'
        ]
      };
    }

    // 3. Freeform Surfaces, Dies, Molds, Impellers, or Complex Sheet Metal (T = 10..50 um, Full Colormap)
    if (partType === 'mold_die' || partType === 'impeller_blade' || partType === 'sheet_metal' || scanDensityNeed === 'full_colormap' || surfaceType === 'dark_carbon' || surfaceType === 'mirror_glossy') {
      const mpe = 18; // 0.018 mm = 18 um
      const ratio = tol / mpe;
      return {
        primaryDevice: {
          id: 'shining_freescan',
          title: 'Метрологический лазерный 3D-сканер Shining 3D FreeScan UE Pro / Combo',
          category: 'Метрологические лазерные сканеры',
          brand: 'Shining 3D',
          accuracyFormula: 'Объемная точность до 0.020 мм + 0.040 мм/м',
          mpeUm: mpe,
          recommendedSoftware: 'Geomagic Control X / PolyWorks|Inspector™',
          inspectionStandard: 'ГОСТ Р ИСО 10360-8:2016 (Оптические измерительные системы)',
          measuringMethod: 'Бесконтактное триангуляционное сканирование сеткой синих лазерных лучей (26+1 линий) без нанесения матирующего спрея.',
          measurementDurationEst: '8–15 минут на полную оцифровку детали',
          description: 'Высокопроизводительный метрологический сканер для контроля сложной геометрии штампов, пресс-форм, турбинных лопаток и кузовных панелей. Уверенно сканирует блестящие обработанные металлы и черные композиты.',
          advantages: [
            'Сплошная цветовая карта отклонений GD&T по миллионам полигональных точек',
            'Работа без матирующего спрея даже на хромированных и зеркальных поверхностях',
            'Встроенная фотограмметрия для устранения накопления объемной погрешности на длине',
            'Возможность контроля непосредственно на станке ЧПУ без снятия детали'
          ],
          photoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=700&q=80'
        },
        secondaryDevice: {
          title: 'Портативная измерительная рука PMT Alpha Arm (7 осей)',
          category: 'Шарнирные измерительные руки',
          brand: 'PMT',
          mpeUm: 22,
          reason: 'Для быстрого контактного замера резьб и внутренних глухих полостей'
        },
        metrologyReserveRatio: Math.round(ratio * 10) / 10,
        metrologyReserveStatus: ratio >= optimalRatio ? 'optimal' : ratio >= acceptableRatio ? 'acceptable' : 'marginal',
        methodologyNotes: [
          'Позиционирование по магнитным самоклеящимся маркерам Ø3 или Ø6 мм.',
          'Best-Fit совмещение полигональной STL-сетки с эталонной STEP/Parasolid CAD-моделью по базовым поверхностям.',
          'Расчет цветовой шкалы отклонений с шагом 0.01 мм и расстановка контрольных флажков критических зон.'
        ]
      };
    }

    // 4. Shop Floor / Arm CMM (T > 20 um or On-Machine inspection)
    const mpe = Math.round(15 + (maxDim / 200) * 3);
    const ratio = tol / mpe;
    return {
      primaryDevice: {
        id: 'pmt_alpha_arm',
        title: 'Шарнирная мобильная КИМ-рука PMT Alpha Arm 7-Axis + Laser Scanner',
        category: 'Портативные координатно-измерительные руки',
        brand: 'PMT (ДС-Инжиниринг)',
        accuracyFormula: 'Погрешность одной точки от 0.016 мм, объемная от 0.025 мм',
        mpeUm: mpe,
        recommendedSoftware: 'PolyWorks|Inspector™ Probe + Laser',
        inspectionStandard: 'ГОСТ Р ИСО 10360-12:2020 (Шарнирные КИМ)',
        measuringMethod: 'Комбинированный контактный замер рубиновым щупом Renishaw + бесконтактное лазерное сканирование синей линией.',
        measurementDurationEst: '10–20 минут',
        description: 'Максимальная универсальность для цеха. Углепластиковые трубы с нулевым коэффициентом теплового расширения и внутренняя пружинная балансировка обеспечивают легкую работу инженера без утомления.',
        advantages: [
          'Установка на магнитное основание или треногу прямо на стол металлорежущего станка',
          'Мгновенный контактный контроль центров отверстий, цилиндричности и плоскостей',
          'Встроенная температурная компенсация от 10 до 40 °C',
          'Легкий вес и транспортировка в противоударном кейсе одним инженером'
        ],
        photoUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=700&q=80'
      },
      secondaryDevice: {
        title: 'Стационарная КИМ PMT Alpha Bridge',
        category: 'Мостовые КИМ',
        brand: 'PMT',
        mpeUm: 2.2,
        reason: 'Если потребуется эталонный арбитражный замер по ГОСТ Р ИСО 10360-2'
      },
      metrologyReserveRatio: Math.round(ratio * 10) / 10,
      metrologyReserveStatus: ratio >= optimalRatio ? 'optimal' : ratio >= acceptableRatio ? 'acceptable' : 'marginal',
      methodologyNotes: [
        'Фиксация магнитного основания руки на устойчивой жесткой поверхности без резонансных колебаний.',
        'Калибровка щупа по коническому гнезду в 9 различных угловых ориентациях шарниров.',
        'Выполнение контрольных измерений с соблюдением требований ГОСТ Р ИСО 1101.'
      ]
    };
  }, [lengthMm, widthMm, heightMm, weightKg, partType, surfaceType, toleranceUm, workshopEnvironment, scanDensityNeed, optimalRatio, acceptableRatio]);

  // Match recommended device to CMS SI Category and its ROI technical coefficients
  const matchingCategory = useMemo(() => {
    const cats = metrologySettings.categories || [];
    if (cats.length === 0) return null;
    const devId = recommendation.primaryDevice.id;
    if (devId.includes('tracker')) {
      return cats.find(c => c.id === 'laser_tracker') || cats[2] || cats[0];
    }
    if (devId.includes('cmm') || devId.includes('pmt_cmm')) {
      return cats.find(c => c.id === 'cmm_bridge') || cats[0];
    }
    if (devId.includes('scan') || devId.includes('freescan')) {
      return cats.find(c => c.id === 'optical_scanner') || cats[1] || cats[0];
    }
    if (devId.includes('arm')) {
      return cats.find(c => c.id === 'measuring_arm') || cats[3] || cats[0];
    }
    return cats[0];
  }, [recommendation, metrologySettings.categories]);

  // Handle Request Commercial Proposal / Demo
  const handleRequestQuote = () => {
    openContactModal({
      formType: 'measurement',
      defaultProduct: recommendation.primaryDevice.title,
      defaultService: 'Метрологический контроль и подбор оборудования',
      title: `Заявка на подбор: ${recommendation.primaryDevice.title}`,
      customMessage: `Запрос конфигурации метрологического оборудования:\n- Изделие: ${partType}, габариты ${lengthMm}x${widthMm}x${heightMm} мм, масса ${weightKg} кг\n- Требуемый допуск: ±${toleranceUm} мкм (0.0${toleranceUm < 10 ? '0' : ''}${toleranceUm} мм)\n- Рекомендуемый прибор: ${recommendation.primaryDevice.title}\n- Методика контроля: ${recommendation.primaryDevice.measuringMethod}\n- Условия: ${workshopEnvironment === 'metrology_lab' ? 'Лаборатория ЦЗЛ' : 'Производственный цех'}`
    });
    if (onClose) onClose();
  };

  // Download Specification summary
  const handlePrintOrDownloadSummary = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-w-5xl w-full mx-auto my-auto">
      {/* Widget Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
            <Gauge className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Инженерный B2B-конфигуратор
              </span>
              <span className="text-xs text-blue-200">Подбор измерительных машин и 3D-сканеров</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Метрологический конфигуратор оборудования СИ
            </h2>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Stepper Tabs Bar */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between overflow-x-auto gap-2">
        {[
          { num: 1, label: '1. Габариты и деталь' },
          { num: 2, label: '2. Допуск и GD&T' },
          { num: 3, label: '3. Условия цеха' },
          { num: 4, label: '4. Рекомендация СИ' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setCurrentStep(s.num)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentStep === s.num
                ? 'bg-blue-600 text-white shadow-xs'
                : currentStep > s.num
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Main Body Content */}
      <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
        {/* STEP 1: GEOMETRY & PART SPECS */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>Шаг 1: Габариты, масса, 3D-форма и тип детали</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Укажите физические размеры изделия и тип геометрии для расчета зоны сканирования, ходов осей КИМ (X, Y, Z) и оценки ориентации в рабочей зоне.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-5">
                {/* Quick Part Type Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Тип контролируемого изделия:</span>
                    <span className="text-[10px] text-blue-600 font-semibold">Выберите тип детали</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'housing', label: 'Корпусная деталь / Картер', desc: 'Призматические базы, расточки' },
                      { id: 'mold_die', label: 'Пресс-форма / Штамп', desc: 'Криволинейные полости, матрица' },
                      { id: 'impeller_blade', label: 'Крыльчатка / Лопатки', desc: 'Тонкие кромки, 3D-сплайны' },
                      { id: 'frame_weldment', label: 'Сварная металлоконструкция', desc: 'Крупногабаритная станина / рама' },
                      { id: 'sheet_metal', label: 'Листовая штамповка', desc: 'Упругая деформация, контур' },
                      { id: 'tooling_shaft', label: 'Ступенчатый вал / Шпиндель', desc: 'Тела вращения, биение, шейки' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPartType(item.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          partType === item.id
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 dark:bg-blue-950/40 shadow-xs'
                            : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{item.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimensions Inputs Grid */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Габаритные размеры (мм) и масса (кг):</span>
                    <span className="text-blue-600 font-mono text-xs">
                      {lengthMm} × {widthMm} × {heightMm} мм • {weightKg} кг
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Длина L (X):</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={10}
                            max={5000}
                            value={lengthMm}
                            onChange={(e) => {
                              const val = Math.max(10, Math.min(5000, Number(e.target.value) || 10));
                              setLengthMm(val);
                            }}
                            className="w-16 px-1.5 py-0.5 text-right font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                          />
                          <span className="text-[11px] text-slate-400">мм</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={5000}
                        step={10}
                        value={lengthMm}
                        onChange={(e) => setLengthMm(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <div className="flex gap-1 pt-1 flex-wrap">
                        {[150, 600, 1200, 2500, 4000].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setLengthMm(val)}
                            className={`px-2 py-0.5 text-[10px] rounded border transition-colors cursor-pointer ${
                              lengthMm === val 
                                ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Ширина W (Y):</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={10}
                            max={2500}
                            value={widthMm}
                            onChange={(e) => {
                              const val = Math.max(10, Math.min(2500, Number(e.target.value) || 10));
                              setWidthMm(val);
                            }}
                            className="w-16 px-1.5 py-0.5 text-right font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                          />
                          <span className="text-[11px] text-slate-400">мм</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={2500}
                        step={10}
                        value={widthMm}
                        onChange={(e) => setWidthMm(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <div className="flex gap-1 pt-1 flex-wrap">
                        {[100, 400, 800, 1500].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setWidthMm(val)}
                            className={`px-2 py-0.5 text-[10px] rounded border transition-colors cursor-pointer ${
                              widthMm === val 
                                ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Высота H (Z):</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={5}
                            max={2000}
                            value={heightMm}
                            onChange={(e) => {
                              const val = Math.max(5, Math.min(2000, Number(e.target.value) || 5));
                              setHeightMm(val);
                            }}
                            className="w-16 px-1.5 py-0.5 text-right font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                          />
                          <span className="text-[11px] text-slate-400">мм</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={2000}
                        step={5}
                        value={heightMm}
                        onChange={(e) => setHeightMm(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <div className="flex gap-1 pt-1 flex-wrap">
                        {[50, 250, 600, 1200].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setHeightMm(val)}
                            className={`px-2 py-0.5 text-[10px] rounded border transition-colors cursor-pointer ${
                              heightMm === val 
                                ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Weight Slider */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-300 font-semibold">Масса детали:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={2500}
                          value={weightKg}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(2500, Number(e.target.value) || 1));
                            setWeightKg(val);
                          }}
                          className="w-16 px-1.5 py-0.5 text-right font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                        />
                        <span className="text-[11px] text-slate-400">кг</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={2500}
                      step={5}
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Surface Optical Properties */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Оптические свойства поверхности материала:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'machined_matte', label: 'Матовый металл', sub: 'Фрезерованный/пескоструй' },
                      { id: 'mirror_glossy', label: 'Блестящий / Хром', sub: 'Полированная сталь, глянец' },
                      { id: 'dark_carbon', label: 'Черный / Углепластик', sub: 'Карбон, резина, пластик' },
                      { id: 'transparent', label: 'Стекло / Прозрачный', sub: 'Требуется матирующий спрей' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSurfaceType(s.id as any)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                          surfaceType === s.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="font-bold">{s.label}</div>
                        <div className={`text-[10px] mt-0.5 ${surfaceType === s.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {s.sub}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Part Visualization */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-blue-600" />
                    <span>3D-вид контролируемой детали:</span>
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                    Three.js WebGL
                  </span>
                </div>

                <PartVisualizer3D
                  partType={partType}
                  lengthMm={lengthMm}
                  widthMm={widthMm}
                  heightMm={heightMm}
                  weightKg={weightKg}
                  surfaceType={surfaceType}
                  toleranceUm={toleranceUm}
                  selectedGdt={selectedGdt}
                  heightClass="h-[320px] sm:h-[360px]"
                />

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Габаритный объем заготовки:</span>
                    <b className="text-slate-900 dark:text-white font-mono">{((lengthMm * widthMm * heightMm) / 1000000).toFixed(2)} л (дм³)</b>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span>Ориентировочная плотность:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {Math.max(0.5, Math.min(20, Math.round((weightKg / ((lengthMm * widthMm * heightMm) / 1000000)) * 10) / 10))} кг/дм³
                    </span>
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1 pt-0.5">
                    <Info className="w-3 h-3 shrink-0" />
                    <span>Вращайте деталь зажатием мыши, колесико — масштаб</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Далее: Допуски и точность</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TOLERANCE & GD&T */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Шаг 2: Требуемый допуск и параметры точности деталей</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Правило метрологического запаса: погрешность измерительного прибора должна быть как минимум в 3 раза точнее поля допуска контролируемого параметра.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Tolerance Controls */}
              <div className="lg:col-span-7 space-y-5">
                {/* Standard Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Квалитет / Типовой допуск чертежа:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'it5', label: 'Прецизионный IT5', um: metrologySettings.it5Um || 4, desc: `±${((metrologySettings.it5Um || 4)/1000).toFixed(3)} мм (±${metrologySettings.it5Um || 4} мкм) • Подшипники` },
                      { id: 'it7', label: 'Высокоточный IT7', um: metrologySettings.it7Um || 15, desc: `±${((metrologySettings.it7Um || 15)/1000).toFixed(3)} мм (±${metrologySettings.it7Um || 15} мкм) • Пресс-формы` },
                      { id: 'it9', label: 'Машиностроение IT9', um: metrologySettings.it9Um || 45, desc: `±${((metrologySettings.it9Um || 45)/1000).toFixed(3)} мм (±${metrologySettings.it9Um || 45} мкм) • Корпуса, ЧПУ` },
                      { id: 'it12', label: 'Свободный IT12', um: metrologySettings.it12Um || 180, desc: `±${((metrologySettings.it12Um || 180)/1000).toFixed(3)} мм • Литье, металлоконструкции` },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleTolerancePresetSelect(item.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          tolerancePreset === item.id
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/20 dark:bg-blue-950/40'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</span>
                          <span className="font-mono text-xs font-bold text-blue-600">±{item.um} мкм</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Micro-Meter Tolerance Slider */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Точное значение требуемого поля допуска:</span>
                    <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                      {toleranceUm} мкм (0.{toleranceUm < 100 ? (toleranceUm < 10 ? `00${toleranceUm}` : `0${toleranceUm}`) : toleranceUm} мм)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={250}
                    step={1}
                    value={toleranceUm}
                    onChange={(e) => {
                      setToleranceUm(Number(e.target.value));
                      setTolerancePreset('custom');
                    }}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1 мкм (Ультрапрецизионный)</span>
                    <span>25 мкм (IT7)</span>
                    <span>80 мкм (IT10)</span>
                    <span>250 мкм (Литье/сварка)</span>
                  </div>
                </div>

                {/* Controlled GD&T Parameters Checkboxes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Контролируемые геометрические параметры (GD&T):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'Плоскостность и цилиндричность',
                      'Перпендикулярность и параллельность баз',
                      'Позиционный допуск отверстий',
                      'Профиль свободной поверхности (сплайны)',
                      'Торцевое и радиальное биение',
                      'Соосность и симметричность'
                    ].map((item) => {
                      const isChecked = selectedGdt.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleGdt(item)}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                            isChecked
                              ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold dark:bg-blue-950/40 dark:text-blue-200'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span>{item}</span>
                          {isChecked && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: GD&T 3D Deviation Heatmap Preview */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span>3D-вид детали и метрологические базы [A][B][C]:</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    ±{toleranceUm} мкм
                  </span>
                </div>

                <PartVisualizer3D
                  partType={partType}
                  lengthMm={lengthMm}
                  widthMm={widthMm}
                  heightMm={heightMm}
                  weightKg={weightKg}
                  surfaceType={surfaceType}
                  toleranceUm={toleranceUm}
                  selectedGdt={selectedGdt}
                  heightClass="h-[320px] sm:h-[360px]"
                />

                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-950 dark:text-emerald-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Выбрано параметров GD&T: {selectedGdt.length}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                    {selectedGdt.join(' • ')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Далее: Условия цеха</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ENVIRONMENT & WORKSHOP */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-blue-600" />
                <span>Шаг 3: Производственная среда и режим эксплуатации</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Климатические условия и вибрации напрямую определяют конструктив оборудования (стационарная КИМ с виброизоляцией или портативный оптический сканер).
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'metrology_lab',
                  title: 'Измерительная лаборатория (ЦЗЛ)',
                  desc: 'Климат-контроль 20 ± 0.5 °C, чистая зона без пыли, виброизолированный фундамент по ГОСТ 8.050.',
                  icon: Building2,
                  badge: 'Класс 1 • Максимальная точность'
                },
                {
                  id: 'shop_floor',
                  title: 'Цеховой контрольный пост (Цех механической обработки)',
                  desc: 'Колебания температуры 15–30 °C, цеховая вибрация от станков. Требуется встроенная температурная компенсация.',
                  icon: Wrench,
                  badge: 'Промышленный цех'
                },
                {
                  id: 'on_machine',
                  title: 'Контроль на станке с ЧПУ / на стапеле без демонтажа',
                  desc: 'Заготовка закреплена в патроне или на стапеле, съем невозможен. Требуется компактный сканер или измерительная рука.',
                  icon: Crosshair,
                  badge: 'Без демонтажа детали'
                },
                {
                  id: 'onsite_field',
                  title: 'Мобильный выезд специалиста на площадку субподрядчика',
                  desc: 'Выездной контроль партий деталей в командировках, транспортировка прибора авиа- или автотранспортом.',
                  icon: Scan,
                  badge: 'Выезд инженера'
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWorkshopEnvironment(item.id as any)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-4 w-full ${
                    workshopEnvironment === item.id
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 dark:bg-blue-950/40'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    workshopEnvironment === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Gauge className="w-4 h-4" />
                <span>Рассчитать оптимальное СИ</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: RECOMMENDATION & METROLOGICAL REPORT */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Summary Top Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 border border-blue-800 shadow-md">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Экспертное заключение метрологической службы «ДС-Инжиниринг»</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {recommendation.primaryDevice.title}
                  </h3>
                  <div className="text-xs text-blue-200 mt-1">
                    Категория: {recommendation.primaryDevice.category} • Производитель: {recommendation.primaryDevice.brand}
                  </div>
                </div>

                {/* Metrology Reserve Badge */}
                <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center shrink-0">
                  <div className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Запас точности (T / MPE):</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                    {recommendation.metrologyReserveRatio}×
                  </div>
                  <div className="text-[10px] text-blue-200 mt-0.5">
                    {recommendation.metrologyReserveStatus === 'optimal'
                      ? `✓ Оптимально по ГОСТ (≥ ${optimalRatio}×)`
                      : `✓ Допустимо для цехового контроля (≥ ${acceptableRatio}×)`}
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Column Specification Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Device Details & Methodology */}
              <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Метрологические характеристики:</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Формула погрешности (MPE):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {recommendation.primaryDevice.accuracyFormula}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Погрешность на данной детали:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      ±{recommendation.primaryDevice.mpeUm} мкм (0.{recommendation.primaryDevice.mpeUm < 100 ? (recommendation.primaryDevice.mpeUm < 10 ? `00${recommendation.primaryDevice.mpeUm}` : `0${recommendation.primaryDevice.mpeUm}`) : recommendation.primaryDevice.mpeUm} мм)
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Стандарт поверки:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {recommendation.primaryDevice.inspectionStandard}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Рекомендуемое ПО:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {recommendation.primaryDevice.recommendedSoftware}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Оценка времени контроля:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {recommendation.primaryDevice.measurementDurationEst}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Ключевые преимущества для вашего техпроцесса:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {recommendation.primaryDevice.advantages.map((adv, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: 3D Part Setup Visualization & Methodology */}
              <div className="lg:col-span-6 space-y-4">
                {/* 3D Part Visualizer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Scan className="w-4 h-4 text-blue-600" />
                      <span>Симуляция контроля детали в рабочей зоне СИ:</span>
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                      {lengthMm}x{widthMm}x{heightMm} мм
                    </span>
                  </div>

                  <PartVisualizer3D
                    partType={partType}
                    lengthMm={lengthMm}
                    widthMm={widthMm}
                    heightMm={heightMm}
                    weightKg={weightKg}
                    surfaceType={surfaceType}
                    toleranceUm={toleranceUm}
                    selectedGdt={selectedGdt}
                    recommendedDeviceTitle={recommendation.primaryDevice.title}
                    recommendedDeviceMpe={recommendation.primaryDevice.mpeUm}
                    heightClass="h-[260px] sm:h-[280px]"
                  />
                </div>

                {/* Methodology notes */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Рекомендуемая методика измерений (по ГОСТ):</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {recommendation.primaryDevice.measuringMethod}
                  </p>
                  <div className="space-y-1 pt-0.5">
                    {recommendation.methodologyNotes.map((note, idx) => (
                      <div key={idx} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Alternative */}
                {recommendation.secondaryDevice && (
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-800/50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-amber-900 dark:text-amber-200">
                        Альтернативный / Дополнительный прибор:
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-800">
                        ±{recommendation.secondaryDevice.mpeUm} мкм
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {recommendation.secondaryDevice.title} ({recommendation.secondaryDevice.brand})
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      {recommendation.secondaryDevice.reason}.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ROI Technical Coefficients & Economic Impact Card */}
            {matchingCategory && (
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-800/60 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/40 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-indigo-300">
                        Технико-экономические показатели внедрения (ROI)
                      </div>
                      <div className="text-sm font-bold text-white">
                        {matchingCategory.name}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (openRoiCalculatorModal) {
                        openRoiCalculatorModal();
                      }
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs active:scale-95"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Открыть детальный B2B ROI калькулятор</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-indigo-300 uppercase block font-semibold">Ориентировочный CAPEX</span>
                    <span className="text-base font-black font-mono text-emerald-400 mt-0.5 block">
                      ~{(matchingCategory.capexRub / 1000000).toFixed(1)} млн ₽
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Поставка, пусконаладка, ПО</span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-indigo-300 uppercase block font-semibold">Ускорение замера</span>
                    <span className="text-base font-black font-mono text-blue-400 mt-0.5 block">
                      {matchingCategory.autoInspectionTimeMin} мин <span className="text-xs font-normal text-slate-400">/ дет.</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Вместо {matchingCategory.manualInspectionTimeMin} мин вручную (в {(matchingCategory.manualInspectionTimeMin / Math.max(1, matchingCategory.autoInspectionTimeMin)).toFixed(1)}× быстрее)
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-indigo-300 uppercase block font-semibold">Снижение брака</span>
                    <span className="text-base font-black font-mono text-emerald-400 mt-0.5 block">
                      -{matchingCategory.scrapReductionPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Раннее выявление отклонений</span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-indigo-300 uppercase block font-semibold">Экономия ЧПУ</span>
                    <span className="text-base font-black font-mono text-amber-400 mt-0.5 block">
                      +{matchingCategory.cncDowntimeReductionHoursPerMonth} ч/мес
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Сокращение межоперационных простоев</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Изменить параметры детали
                </button>
                <button
                  type="button"
                  onClick={handlePrintOrDownloadSummary}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Распечатать или сохранить в PDF"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Печать / PDF</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleRequestQuote}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Запросить ТКП и демонстрацию прибора</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
