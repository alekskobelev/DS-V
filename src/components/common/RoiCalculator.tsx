import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calculator, 
  DollarSign, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Printer, 
  Info, 
  Cpu, 
  Gauge, 
  Layers, 
  BarChart3, 
  FileSpreadsheet,
  Building2,
  Sliders,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useConfiguratorSettings } from '../../hooks/useConfiguratorSettings';

export interface RoiPreset {
  id: string;
  name: string;
  category: string;
  typicalCapexRub: number;
  typicalInspectionTimeMin: number;
  newInspectionTimeMin: number;
  scrapReductionPercent: number;
  description: string;
}

const ROI_PRESETS: RoiPreset[] = [
  {
    id: 'cmm_stationary',
    name: 'Стационарная КИМ PMT / Mitutoyo',
    category: 'Координатно-измерительные машины',
    typicalCapexRub: 8500000,
    typicalInspectionTimeMin: 40,
    newInspectionTimeMin: 7,
    scrapReductionPercent: 65,
    description: 'Серийный контроль корпусных деталей, токарно-фрезерных изделий с ЧПУ, пресс-форм и штампов'
  },
  {
    id: 'scanner_handheld',
    name: '3D-сканер Shining 3D FreeScan / ScanLine',
    category: 'Ручные и оптические лазерные 3D-сканеры',
    typicalCapexRub: 4200000,
    typicalInspectionTimeMin: 50,
    newInspectionTimeMin: 10,
    scrapReductionPercent: 70,
    description: 'Быстрый контроль сложной криволинейной геометрии, штамповок, лопаток и сварных узлов'
  },
  {
    id: 'tracker_laser',
    name: 'Лазерный трекер Leica Absolute Tracker',
    category: 'Лазерные трекеры и интерферометры',
    typicalCapexRub: 16500000,
    typicalInspectionTimeMin: 120,
    newInspectionTimeMin: 25,
    scrapReductionPercent: 75,
    description: 'Контроль крупногабаритных станин, сварных рам, авиационных стапелей и оснастки до 80 м'
  },
  {
    id: 'optical_cmm',
    name: 'Оптическая КИМ и измерительная рука Hexagon/PMT',
    category: 'Мобильные КИМ и оптические системы',
    typicalCapexRub: 6800000,
    typicalInspectionTimeMin: 35,
    newInspectionTimeMin: 8,
    scrapReductionPercent: 60,
    description: 'Цеховой контроль деталей на станке и в ОТК без демонтажа технологической оснастки'
  }
];

export const RoiCalculator: React.FC<{
  onClose?: () => void;
  isStandalone?: boolean;
}> = ({ onClose, isStandalone = false }) => {
  const { openContactModal, openConfiguratorModal, showToast } = useApp();
  const { settings: globalConfigSettings } = useConfiguratorSettings();
  const roiSettings = globalConfigSettings.roi;

  // Selected Equipment Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cmm_stationary');

  // Dynamic Presets with CMS settings
  const presets: RoiPreset[] = useMemo(() => [
    {
      id: 'cmm_stationary',
      name: 'Стационарная КИМ PMT / Mitutoyo',
      category: 'Координатно-измерительные машины',
      typicalCapexRub: roiSettings.cmmCapexRub || 8500000,
      typicalInspectionTimeMin: 40,
      newInspectionTimeMin: 7,
      scrapReductionPercent: roiSettings.scrapReductionTargetPercent || 65,
      description: 'Серийный контроль корпусных деталей, токарно-фрезерных изделий с ЧПУ, пресс-форм и штампов'
    },
    {
      id: 'scanner_handheld',
      name: '3D-сканер Shining 3D FreeScan / ScanLine',
      category: 'Ручные и оптические лазерные 3D-сканеры',
      typicalCapexRub: roiSettings.scannerCapexRub || 4200000,
      typicalInspectionTimeMin: 50,
      newInspectionTimeMin: 10,
      scrapReductionPercent: Math.min(95, (roiSettings.scrapReductionTargetPercent || 65) + 5),
      description: 'Быстрый контроль сложной криволинейной геометрии, штамповок, лопаток и сварных узлов'
    },
    {
      id: 'tracker_laser',
      name: 'Лазерный трекер Leica Absolute Tracker',
      category: 'Лазерные трекеры и интерферометры',
      typicalCapexRub: roiSettings.trackerCapexRub || 16500000,
      typicalInspectionTimeMin: 120,
      newInspectionTimeMin: 25,
      scrapReductionPercent: Math.min(95, (roiSettings.scrapReductionTargetPercent || 65) + 10),
      description: 'Контроль крупногабаритных станин, сварных рам, авиационных стапелей и оснастки до 80 м'
    },
    {
      id: 'optical_arm',
      name: 'Оптическая КИМ и измерительная рука Hexagon/PMT',
      category: 'Мобильные КИМ и оптические системы',
      typicalCapexRub: roiSettings.armCapexRub || 6800000,
      typicalInspectionTimeMin: 35,
      newInspectionTimeMin: 8,
      scrapReductionPercent: Math.max(40, (roiSettings.scrapReductionTargetPercent || 65) - 5),
      description: 'Цеховой контроль деталей на станке и в ОТК без демонтажа технологической оснастки'
    }
  ], [roiSettings]);

  // Input Parameters
  const [monthlyPartsCount, setMonthlyPartsCount] = useState<number>(600); // деталей в месяц
  const [currentInspectionTimeMin, setCurrentInspectionTimeMin] = useState<number>(40); // минут на 1 деталь вручную
  const [newInspectionTimeMin, setNewInspectionTimeMin] = useState<number>(8); // минут после внедрения СИ
  const [hourlyLaborRateRub, setHourlyLaborRateRub] = useState<number>(roiSettings.hourlyLaborRateRub || 850); // ставка метролога/ОТК руб/час
  const [currentScrapRatePercent, setCurrentScrapRatePercent] = useState<number>(roiSettings.defaultScrapRatePercent || 4.5); // % брака
  const [scrapReductionPercent, setScrapReductionPercent] = useState<number>(roiSettings.scrapReductionTargetPercent || 65); // % снижения брака
  const [averageScrapCostRub, setAverageScrapCostRub] = useState<number>(roiSettings.defaultPartScrapCostRub || 14500); // себестоимость 1 бракованной детали
  const [equipmentInvestmentRub, setEquipmentInvestmentRub] = useState<number>(roiSettings.cmmCapexRub || 8500000); // стоимость СИ

  // Sync state when CMS settings load
  React.useEffect(() => {
    if (roiSettings) {
      setHourlyLaborRateRub(roiSettings.hourlyLaborRateRub || 850);
      setCurrentScrapRatePercent(roiSettings.defaultScrapRatePercent || 4.5);
      setScrapReductionPercent(roiSettings.scrapReductionTargetPercent || 65);
      setAverageScrapCostRub(roiSettings.defaultPartScrapCostRub || 14500);
      if (selectedPresetId === 'cmm_stationary') setEquipmentInvestmentRub(roiSettings.cmmCapexRub || 8500000);
      else if (selectedPresetId === 'scanner_handheld') setEquipmentInvestmentRub(roiSettings.scannerCapexRub || 4200000);
      else if (selectedPresetId === 'tracker_laser') setEquipmentInvestmentRub(roiSettings.trackerCapexRub || 16500000);
      else if (selectedPresetId === 'optical_arm') setEquipmentInvestmentRub(roiSettings.armCapexRub || 6800000);
    }
  }, [roiSettings, selectedPresetId]);

  // Handle Preset Change
  const handlePresetSelect = (preset: RoiPreset) => {
    setSelectedPresetId(preset.id);
    setEquipmentInvestmentRub(preset.typicalCapexRub);
    setCurrentInspectionTimeMin(preset.typicalInspectionTimeMin);
    setNewInspectionTimeMin(preset.newInspectionTimeMin);
    setScrapReductionPercent(preset.scrapReductionPercent);
  };

  // Calculations
  const calculation = useMemo(() => {
    // 1. Time & Labor Savings
    const timeSavedPerPartHours = Math.max(0, (currentInspectionTimeMin - newInspectionTimeMin) / 60);
    const monthlyHoursSaved = monthlyPartsCount * timeSavedPerPartHours;
    const annualHoursSaved = monthlyHoursSaved * 12;
    const annualLaborSavingsRub = annualHoursSaved * hourlyLaborRateRub;

    // 2. Scrap Reduction Savings
    const monthlyTotalScrapParts = monthlyPartsCount * (currentScrapRatePercent / 100);
    const monthlyPreventedScrapParts = monthlyTotalScrapParts * (scrapReductionPercent / 100);
    const annualPreventedScrapParts = monthlyPreventedScrapParts * 12;
    const annualScrapSavingsRub = annualPreventedScrapParts * averageScrapCostRub;

    // 3. Machine Downtime / Process Acceleration Savings (conservative estimate 15% of labor savings)
    const annualDowntimeSavingsRub = annualLaborSavingsRub * 0.18;

    // 4. Total Annual Economic Effect
    const totalAnnualSavingsRub = annualLaborSavingsRub + annualScrapSavingsRub + annualDowntimeSavingsRub;

    // 5. Payback Period (Months)
    const paybackMonths = totalAnnualSavingsRub > 0 
      ? Number(((equipmentInvestmentRub / totalAnnualSavingsRub) * 12).toFixed(1))
      : 999;

    const paybackYears = Number((paybackMonths / 12).toFixed(2));

    // 6. 3-Year Cumulative ROI
    const threeYearsCumulativeSavingsRub = totalAnnualSavingsRub * 3;
    const threeYearsNetProfitRub = threeYearsCumulativeSavingsRub - equipmentInvestmentRub;
    const roiPercentage = equipmentInvestmentRub > 0 
      ? Math.round((threeYearsNetProfitRub / equipmentInvestmentRub) * 100) 
      : 0;

    // Inspection Speedup Multiplier
    const speedupFactor = newInspectionTimeMin > 0 
      ? Number((currentInspectionTimeMin / newInspectionTimeMin).toFixed(1))
      : 1;

    return {
      monthlyHoursSaved: Math.round(monthlyHoursSaved),
      annualHoursSaved: Math.round(annualHoursSaved),
      annualLaborSavingsRub: Math.round(annualLaborSavingsRub),
      annualScrapSavingsRub: Math.round(annualScrapSavingsRub),
      annualDowntimeSavingsRub: Math.round(annualDowntimeSavingsRub),
      totalAnnualSavingsRub: Math.round(totalAnnualSavingsRub),
      paybackMonths,
      paybackYears,
      roiPercentage,
      threeYearsNetProfitRub: Math.round(threeYearsNetProfitRub),
      speedupFactor,
      annualPreventedScrapParts: Math.round(annualPreventedScrapParts)
    };
  }, [
    monthlyPartsCount,
    currentInspectionTimeMin,
    newInspectionTimeMin,
    hourlyLaborRateRub,
    currentScrapRatePercent,
    scrapReductionPercent,
    averageScrapCostRub,
    equipmentInvestmentRub
  ]);

  const handleRequestTeo = () => {
    const selectedPreset = ROI_PRESETS.find(p => p.id === selectedPresetId);
    openContactModal({
      title: 'Запрос детального расчета ТЭО окупаемости СИ',
      subtitle: 'Подготовим официальное финансово-экономическое обоснование для руководства предприятия',
      defaultProduct: selectedPreset?.name || 'КИМ и 3D-оборудование',
      formType: 'quote'
    });
  };

  const handlePrintTeo = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-w-5xl w-full mx-auto my-auto">
      {/* Modal Header */}
      <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Тестовый доступ (Beta)
              </span>
              <span className="text-xs text-blue-200">
                Финансово-экономическое моделирование
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              B2B-калькулятор окупаемости внедрения СИ (ROI)
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

      {/* Beta Notice Banner */}
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Режим тестового доступа:</strong> Расчет базируется на усредненных показателях более 40 внедренных КИМ и 3D-сканеров на заводах РФ. Для точного ТЭО закажите расчет под ваш станочный парк.
          </span>
        </div>
        <button
          type="button"
          onClick={openConfiguratorModal}
          className="text-blue-700 dark:text-blue-400 hover:underline font-bold whitespace-nowrap shrink-0 flex items-center gap-1"
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Конфигуратор СИ</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
        {/* Presets Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Выберите класс оборудования для расчета окупаемости:</span>
            <span className="text-blue-600 font-normal">Шаблоны типовых комплексов</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPresetId === preset.id
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 dark:bg-blue-950/40'
                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                    {preset.category}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Инвестиции:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {(preset.typicalCapexRub / 1000000).toFixed(1)} млн ₽
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2-Columns Layout: Inputs vs Realtime ROI Result Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Input Parameters (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Производственные параметры цеха и ОТК:</span>
              </h3>

              {/* Monthly Volume */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">Объем контроля деталей в месяц:</span>
                  <b className="font-mono font-bold text-slate-900 dark:text-white">{monthlyPartsCount} шт/мес</b>
                </div>
                <input
                  type="range"
                  min={50}
                  max={5000}
                  step={50}
                  value={monthlyPartsCount}
                  onChange={(e) => setMonthlyPartsCount(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>50 шт (мелкосерийное)</span>
                  <span>1000 шт</span>
                  <span>5000 шт (крупная серия)</span>
                </div>
              </div>

              {/* Time Before & After */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 dark:text-slate-300 flex justify-between">
                    <span>Текущий ручной замер:</span>
                    <b className="font-mono text-slate-900 dark:text-white">{currentInspectionTimeMin} мин</b>
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={180}
                    step={5}
                    value={currentInspectionTimeMin}
                    onChange={(e) => setCurrentInspectionTimeMin(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400">Штангенциркули, микрометры</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 dark:text-slate-300 flex justify-between">
                    <span>Контроль на СИ/КИМ:</span>
                    <b className="font-mono text-emerald-600 font-bold">{newInspectionTimeMin} мин</b>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    step={1}
                    value={newInspectionTimeMin}
                    onChange={(e) => setNewInspectionTimeMin(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-emerald-600">Автоматический цикл по CAD</span>
                </div>
              </div>

              {/* Labor Rate */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">Стоимость часа контролера ОТК / метролога:</span>
                  <b className="font-mono font-bold text-slate-900 dark:text-white">{hourlyLaborRateRub} ₽/час</b>
                </div>
                <input
                  type="range"
                  min={400}
                  max={2500}
                  step={50}
                  value={hourlyLaborRateRub}
                  onChange={(e) => setHourlyLaborRateRub(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Scrap Rate & Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 dark:text-slate-300 flex justify-between">
                    <span>Текущий брак в цехе:</span>
                    <b className="font-mono text-rose-600 font-bold">{currentScrapRatePercent}%</b>
                  </label>
                  <input
                    type="range"
                    min={0.5}
                    max={15}
                    step={0.5}
                    value={currentScrapRatePercent}
                    onChange={(e) => setCurrentScrapRatePercent(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 dark:text-slate-300 flex justify-between">
                    <span>Себестоимость 1 детали:</span>
                    <b className="font-mono text-slate-900 dark:text-white">{averageScrapCostRub.toLocaleString('ru-RU')} ₽</b>
                  </label>
                  <input
                    type="range"
                    min={1000}
                    max={200000}
                    step={1000}
                    value={averageScrapCostRub}
                    onChange={(e) => setAverageScrapCostRub(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Investment Capex */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Бюджет внедрения измерительного комплекса (Capex):</span>
                  <b className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {equipmentInvestmentRub.toLocaleString('ru-RU')} ₽
                  </b>
                </div>
                <input
                  type="range"
                  min={1500000}
                  max={35000000}
                  step={250000}
                  value={equipmentInvestmentRub}
                  onChange={(e) => setEquipmentInvestmentRub(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Results and ROI Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Primary Payback Highlight Card */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-5 rounded-2xl border border-blue-700/50 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
                  Расчетный срок окупаемости (ROI):
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950 uppercase">
                  {calculation.paybackMonths <= 12 ? 'Высокая отдача' : 'Оптимально'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-black font-mono text-emerald-400 tracking-tight">
                  {calculation.paybackMonths}
                </div>
                <div className="text-sm text-blue-100 font-semibold">
                  месяцев ({calculation.paybackYears} года)
                </div>
              </div>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/10 text-xs">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <div className="text-[10px] text-blue-200">Ускорение контроля:</div>
                  <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                    в {calculation.speedupFactor} раза
                  </div>
                  <div className="text-[9px] text-slate-300">-{calculation.annualHoursSaved} час/год</div>
                </div>

                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <div className="text-[10px] text-blue-200">ROI за 3 года:</div>
                  <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
                    +{calculation.roiPercentage}%
                  </div>
                  <div className="text-[9px] text-slate-300">возврат инвестиций</div>
                </div>
              </div>
            </div>

            {/* Savings Breakdown Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Структура годовой экономии:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                  {calculation.totalAnnualSavingsRub.toLocaleString('ru-RU')} ₽ / год
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Экономия на снижении брака:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {calculation.annualScrapSavingsRub.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Экономия ФОТ контролеров:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {calculation.annualLaborSavingsRub.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Предотвращение бракованных деталей:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {calculation.annualPreventedScrapParts} шт / год
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleRequestTeo}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Запросить официальное ТЭО для руководства</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrintTeo}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Печать расчета</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    openConfiguratorModal();
                  }}
                  className="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Конфигуратор СИ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
