import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Printer, 
  Send, 
  HelpCircle, 
  ShieldCheck, 
  Sliders, 
  Calculator, 
  BarChart3, 
  Cpu, 
  Zap, 
  Building2,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useConfiguratorSettings, SiEquipmentCategoryConfig } from '../../hooks/useConfiguratorSettings';

export interface RoiCalculatorProps {
  onClose?: () => void;
  isStandalone?: boolean;
}

export const MetrologyRoiCalculator: React.FC<RoiCalculatorProps> = ({ onClose, isStandalone = false }) => {
  const { openContactModal, showToast } = useApp();
  const { settings: globalConfigSettings } = useConfiguratorSettings();
  const availableCategories = useMemo(() => {
    const cats = globalConfigSettings.metrology.categories;
    return Array.isArray(cats) && cats.length > 0 
      ? cats.filter(c => c.enabled !== false)
      : [];
  }, [globalConfigSettings.metrology.categories]);

  // Selected Equipment Type (supports category id or fallback)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cmm_bridge');

  // Input Parameters
  const [partsPerMonth, setPartsPerMonth] = useState<number>(450);
  const [cncMachinesCount, setCncMachinesCount] = useState<number>(6);
  const [manualTimeMinutes, setManualTimeMinutes] = useState<number>(75); // mins manually with calipers/indicators
  const [partCostRub, setPartCostRub] = useState<number>(35000); // 35 000 руб. per part
  const [currentScrapPercent, setCurrentScrapPercent] = useState<number>(3.8); // 3.8% scrap/rework
  const [inspectorSalaryRub, setInspectorSalaryRub] = useState<number>(95000); // 95 000 руб/мес
  const [inspectorCount, setInspectorCount] = useState<number>(3); // 3 inspectors

  // Active Category configuration from CMS
  const activeCategory: SiEquipmentCategoryConfig | null = useMemo(() => {
    if (availableCategories.length === 0) return null;
    return availableCategories.find(c => c.id === selectedCategoryId) || availableCategories[0];
  }, [availableCategories, selectedCategoryId]);

  // Equipment Cost Presets based on selected equipment
  const equipmentSpecs = useMemo(() => {
    if (activeCategory) {
      return {
        title: activeCategory.name,
        subtitle: `${activeCategory.category} (${activeCategory.brand})`,
        capexRub: activeCategory.capexRub,
        inspectionTimeMinutes: activeCategory.autoInspectionTimeMin,
        scrapReductionPercent: activeCategory.scrapReductionPercent,
        cncDowntimeReductionHoursPerMonth: activeCategory.cncDowntimeReductionHoursPerMonth,
      };
    }
    // Fallback standard
    return {
      title: 'Стационарная мостовая КИМ PMT Alpha / Horizon',
      subtitle: 'Автоматический ЧПУ-контроль серийных деталей',
      capexRub: 8500000,
      inspectionTimeMinutes: 7,
      scrapReductionPercent: 65,
      cncDowntimeReductionHoursPerMonth: 28,
    };
  }, [activeCategory]);

  // Update manual time when category changes
  useEffect(() => {
    if (activeCategory?.manualInspectionTimeMin) {
      setManualTimeMinutes(activeCategory.manualInspectionTimeMin);
    }
  }, [activeCategory]);

  // Economic ROI Calculations
  const calculations = useMemo(() => {
    const spec = equipmentSpecs;

    // 1. Time & Labor Savings
    const totalManualHoursPerMonth = (partsPerMonth * manualTimeMinutes) / 60;
    const totalAutoHoursPerMonth = (partsPerMonth * spec.inspectionTimeMinutes) / 60;
    const hoursSavedPerMonth = Math.max(0, totalManualHoursPerMonth - totalAutoHoursPerMonth);
    const timeEfficiencyIncreasePercent = Math.round(((manualTimeMinutes - spec.inspectionTimeMinutes) / manualTimeMinutes) * 100);

    // Hourly rate per inspector including taxes & overhead (~1.4x)
    const hourlyInspectorRate = (inspectorSalaryRub * 1.4) / 168;
    const laborSavingsPerYear = Math.round(hoursSavedPerMonth * hourlyInspectorRate * 12);

    // 2. Scrap & Rework Reduction Savings
    const totalPartsPerYear = partsPerMonth * 12;
    const currentScrapPartsPerYear = Math.round(totalPartsPerYear * (currentScrapPercent / 100));
    const scrapPartsPreventedPerYear = Math.round(currentScrapPartsPerYear * (spec.scrapReductionPercent / 100));
    const scrapSavingsPerYear = Math.round(scrapPartsPreventedPerYear * partCostRub);

    // 3. CNC Machine Downtime Savings (average CNC machine hour = 3500 rub)
    const machineHourCostRub = 3500;
    const cncDowntimeSavingsPerYear = Math.round(spec.cncDowntimeReductionHoursPerMonth * machineHourCostRub * 12);

    // Total Annual Economic Effect
    const totalAnnualSavingsRub = laborSavingsPerYear + scrapSavingsPerYear + cncDowntimeSavingsPerYear;

    // Payback Period (in months)
    const paybackMonths = totalAnnualSavingsRub > 0 
      ? Math.round((spec.capexRub / (totalAnnualSavingsRub / 12)) * 10) / 10 
      : 99;

    // 3-Year Net ROI (%)
    const threeYearSavings = totalAnnualSavingsRub * 3;
    const netProfit3Years = threeYearSavings - spec.capexRub;
    const roiPercent3Years = spec.capexRub > 0 ? Math.round((netProfit3Years / spec.capexRub) * 100) : 0;

    return {
      totalManualHoursPerMonth: Math.round(totalManualHoursPerMonth),
      totalAutoHoursPerMonth: Math.round(totalAutoHoursPerMonth),
      hoursSavedPerMonth: Math.round(hoursSavedPerMonth),
      timeEfficiencyIncreasePercent,
      laborSavingsPerYear,
      scrapPartsPreventedPerYear,
      scrapSavingsPerYear,
      cncDowntimeSavingsPerYear,
      totalAnnualSavingsRub,
      paybackMonths,
      roiPercent3Years,
      netProfit3Years
    };
  }, [equipmentSpecs, partsPerMonth, manualTimeMinutes, partCostRub, currentScrapPercent, inspectorSalaryRub]);

  // Request Consultation / Proposal
  const handleRequestTeoProposal = () => {
    openContactModal({
      formType: 'quote',
      defaultProduct: equipmentSpecs.title,
      defaultService: 'Расчет окупаемости инвестиций (ROI)',
      title: `Запрос ТЭО окупаемости: ${equipmentSpecs.title}`,
      customMessage: `Запрос технико-экономического обоснования (ТЭО):\n- Оборудование: ${equipmentSpecs.title}\n- Программа выпуска: ${partsPerMonth} дет/мес на ${cncMachinesCount} станках ЧПУ\n- Расчетная годовая экономия: ${calculations.totalAnnualSavingsRub.toLocaleString('ru-RU')} руб/год\n- Срок окупаемости: ${calculations.paybackMonths} мес (ROI 3 года: ${calculations.roiPercent3Years}%)\n- Прошу подготовить официальный расчет ТЭО для руководства предприятия.`
    });
    if (onClose) onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-w-5xl w-full mx-auto my-auto">
      {/* Header with Beta Badge */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                Тестовый доступ (Beta)
              </span>
              <span className="text-xs text-slate-400">Инженерно-экономический расчет</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              B2B-калькулятор окупаемости внедрения измерительных систем (ROI)
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

      {/* Main Content Area */}
      <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
        
        {/* Equipment Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>Выберите тип внедряемого оборудования:</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {availableCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedCategoryId(item.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedCategoryId === item.id
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 dark:bg-blue-950/40'
                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{item.category}</div>
                </div>
                <div className="mt-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                  <span>~{(item.capexRub / 1000000).toFixed(1)} млн ₽</span>
                  <span className="text-[10px] text-emerald-600 font-mono">-{item.scrapReductionPercent}% брак</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders and Parameters Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Production Inputs */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Параметры участка и контроль деталей:</span>
              <span className="text-[11px] text-blue-600 font-bold">{cncMachinesCount} станков ЧПУ</span>
            </div>

            {/* Volume per month */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">План контроля деталей в месяц:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    step={10}
                    value={partsPerMonth}
                    onChange={(e) => setPartsPerMonth(Math.max(10, Math.min(10000, Number(e.target.value) || 10)))}
                    className="w-20 px-1.5 py-0.5 text-right font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">шт/мес</span>
                </div>
              </div>
              <input
                type="range"
                min={20}
                max={3000}
                step={20}
                value={partsPerMonth}
                onChange={(e) => setPartsPerMonth(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Manual Inspection Time */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">Текущее ручное время контроля 1 детали:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={5}
                    max={480}
                    step={5}
                    value={manualTimeMinutes}
                    onChange={(e) => setManualTimeMinutes(Math.max(5, Math.min(600, Number(e.target.value) || 5)))}
                    className="w-16 px-1.5 py-0.5 text-right font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">мин</span>
                </div>
              </div>
              <input
                type="range"
                min={15}
                max={240}
                step={5}
                value={manualTimeMinutes}
                onChange={(e) => setManualTimeMinutes(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>15 мин (простые)</span>
                <span>75 мин (средние)</span>
                <span>240 мин (сложные корпуса)</span>
              </div>
            </div>

            {/* Part Cost */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">Себестоимость / цена одной детали:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={500}
                    max={1000000}
                    step={1000}
                    value={partCostRub}
                    onChange={(e) => setPartCostRub(Math.max(500, Math.min(5000000, Number(e.target.value) || 500)))}
                    className="w-24 px-1.5 py-0.5 text-right font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">₽</span>
                </div>
              </div>
              <input
                type="range"
                min={2000}
                max={300000}
                step={2000}
                value={partCostRub}
                onChange={(e) => setPartCostRub(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Current Scrap Rate */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">Текущий процент брака и доработок:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0.1}
                    max={25}
                    step={0.1}
                    value={currentScrapPercent}
                    onChange={(e) => setCurrentScrapPercent(Math.max(0.1, Math.min(50, Number(e.target.value) || 0.1)))}
                    className="w-16 px-1.5 py-0.5 text-right font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-rose-600 dark:text-rose-400 focus:outline-hidden focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">%</span>
                </div>
              </div>
              <input
                type="range"
                min={0.5}
                max={12}
                step={0.1}
                value={currentScrapPercent}
                onChange={(e) => setCurrentScrapPercent(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Right Column: Key Economic Effect Results */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white p-5 rounded-xl border border-blue-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-blue-300 mb-2">
                <span className="font-bold uppercase tracking-wider">Экономический эффект (ТЭО)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Сокращение цикла: −{calculations.timeEfficiencyIncreasePercent}%
                </span>
              </div>

              {/* Main Numbers */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                  <div className="text-[10px] text-blue-200 uppercase font-bold">Срок окупаемости (CAPEX):</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5">
                    {calculations.paybackMonths} мес
                  </div>
                  <div className="text-[10px] text-blue-200 mt-0.5">
                    {calculations.paybackMonths <= 12 ? '✓ Быстрая окупаемость (< 1 года)' : '✓ В пределах стандарта машиностроения'}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                  <div className="text-[10px] text-blue-200 uppercase font-bold">Годовая экономия:</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5">
                    {(calculations.totalAnnualSavingsRub / 1000000).toFixed(2)} млн ₽
                  </div>
                  <div className="text-[10px] text-blue-200 mt-0.5">
                    В год суммарно по всем статьям
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown Items */}
            <div className="space-y-2 text-xs border-t border-white/10 pt-3 text-blue-100">
              <div className="flex justify-between items-center">
                <span>Экономия на предотвращении брака ({calculations.scrapPartsPreventedPerYear} дет/год):</span>
                <b className="font-mono text-emerald-300 font-bold">
                  +{calculations.scrapSavingsPerYear.toLocaleString('ru-RU')} ₽
                </b>
              </div>
              <div className="flex justify-between items-center">
                <span>Экономия рабочего времени ОТК ({calculations.hoursSavedPerMonth} ч/мес):</span>
                <b className="font-mono text-blue-200">
                  +{calculations.laborSavingsPerYear.toLocaleString('ru-RU')} ₽
                </b>
              </div>
              <div className="flex justify-between items-center">
                <span>Сокращение простоя станков ЧПУ в ожидании замера:</span>
                <b className="font-mono text-blue-200">
                  +{calculations.cncDowntimeSavingsPerYear.toLocaleString('ru-RU')} ₽
                </b>
              </div>
              <div className="flex justify-between items-center font-bold text-white pt-1 border-t border-white/10">
                <span>Чистая прибыль за 3 года (ROI):</span>
                <b className="font-mono text-emerald-400 text-sm">
                  +{(calculations.netProfit3Years / 1000000).toFixed(2)} млн ₽ (+{calculations.roiPercent3Years}%)
                </b>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Методология расчета основана на производственной статистике машиностроительных предприятий РФ.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Печать ТЭО</span>
            </button>
            <button
              type="button"
              onClick={handleRequestTeoProposal}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Запросить официальное ТЭО для руководства</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
