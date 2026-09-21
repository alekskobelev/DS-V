import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  SlidersHorizontal,
  Target,
  Zap,
  Maximize2,
  Weight,
  ShieldCheck,
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
  BarChart3,
  HelpCircle,
  Plus
} from 'lucide-react';
import { Product } from '../../types';
import {
  getDetailedMetrologyMetrics,
  getProductMetrology,
  DetailedMetrologyMetrics
} from '../../utils/hardwareMetrology';

export type ChartMode = 'radar' | 'bar';
export type BarMetricKey = 'error' | 'speed' | 'resolution' | 'range' | 'weight';

interface HardwareComparisonChartProps {
  products: (Product | null)[];
  onSelectSlot?: (slotIndex: number) => void;
  className?: string;
}

interface ProductColorConfig {
  stroke: string;
  fill: string;
  lightBg: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
}

const PRODUCT_THEME: ProductColorConfig[] = [
  {
    stroke: '#2563EB', // Blue
    fill: '#3B82F6',
    lightBg: 'bg-blue-50',
    badgeBg: 'bg-blue-600',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-400',
  },
  {
    stroke: '#059669', // Emerald
    fill: '#10B981',
    lightBg: 'bg-emerald-50',
    badgeBg: 'bg-emerald-600',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-400',
  },
  {
    stroke: '#D97706', // Amber
    fill: '#F59E0B',
    lightBg: 'bg-amber-50',
    badgeBg: 'bg-amber-600',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-400',
  },
];

const BAR_METRIC_CONFIG: Record<
  BarMetricKey,
  {
    title: string;
    unit: string;
    description: string;
    betterDirection: 'lower' | 'higher';
    formatVal: (val: number) => string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  error: {
    title: 'Предельная погрешность MPE',
    unit: 'мкм',
    description: 'Максимальная допустимая погрешность измерений по ГОСТ Р ИСО 10360 (меньше = выше точность)',
    betterDirection: 'lower',
    formatVal: (val) => `${val.toLocaleString('ru-RU')} мкм`,
    icon: Target,
  },
  speed: {
    title: 'Скорость измерений',
    unit: 'тыс. точек/с',
    description: 'Производительность оцифровки в непрерывном режиме (больше = быстрее)',
    betterDirection: 'higher',
    formatVal: (val) => `${val.toLocaleString('ru-RU')} тыс. тчк/с`,
    icon: Zap,
  },
  resolution: {
    title: 'Разрешение / Шаг сетки',
    unit: 'мкм',
    description: 'Минимальное расстояние между точками или шаг энкодеров (меньше = выше детализация)',
    betterDirection: 'lower',
    formatVal: (val) => `${val.toLocaleString('ru-RU')} мкм`,
    icon: Layers,
  },
  range: {
    title: 'Диапазон / Зона контроля',
    unit: 'мм',
    description: 'Максимальный линейный рабочий габарит измеряемых объектов',
    betterDirection: 'higher',
    formatVal: (val) => `${val.toLocaleString('ru-RU')} мм`,
    icon: Maximize2,
  },
  weight: {
    title: 'Масса оборудования',
    unit: 'кг',
    description: 'Вес измерительного модуля или всей системы (меньше = выше мобильность)',
    betterDirection: 'lower',
    formatVal: (val) => `${val.toLocaleString('ru-RU')} кг`,
    icon: Weight,
  },
};

export const HardwareComparisonChart: React.FC<HardwareComparisonChartProps> = ({
  products,
  onSelectSlot,
  className = '',
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('radar');
  const [selectedBarMetric, setSelectedBarMetric] = useState<BarMetricKey>('error');

  // Filter hardware models and keep original slot indices
  const activeEntries = useMemo(() => {
    return products
      .map((product, slotIndex) => {
        if (!product || product.category === 'software') return null;
        const metrics = getDetailedMetrologyMetrics(product);
        const facet = getProductMetrology(product);
        return {
          product,
          slotIndex,
          metrics,
          facet,
          theme: PRODUCT_THEME[slotIndex % PRODUCT_THEME.length],
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  }, [products]);

  const softwareEntriesCount = useMemo(() => {
    return products.filter((p) => p && p.category === 'software').length;
  }, [products]);

  // Data for Spider Radar Chart (normalized 0-100 scores)
  const radarData = useMemo(() => {
    if (activeEntries.length === 0) return [];

    const axes = [
      {
        metric: 'Прецизионность (MPE)',
        key: 'scorePrecision' as keyof DetailedMetrologyMetrics,
        fullMark: 100,
        hint: 'Точность и повторяемость измерений по ГОСТ Р ИСО 10360',
      },
      {
        metric: 'Скорость сбора данных',
        key: 'scoreSpeed' as keyof DetailedMetrologyMetrics,
        fullMark: 100,
        hint: 'Частота сканирования и производительность такта',
      },
      {
        metric: 'Детализация рельефа',
        key: 'scoreResolution' as keyof DetailedMetrologyMetrics,
        fullMark: 100,
        hint: 'Разрешение сетки и проработка микрогеометрии',
      },
      {
        metric: 'Охват рабочей зоны',
        key: 'scoreRange' as keyof DetailedMetrologyMetrics,
        fullMark: 100,
        hint: 'Линейный диапазон контроля объектов',
      },
      {
        metric: 'Цеховая мобильность',
        key: 'scoreMobility' as keyof DetailedMetrologyMetrics,
        fullMark: 100,
        hint: 'Портативность, автономность и готовность к цеху',
      },
    ];

    return axes.map((axis) => {
      const row: Record<string, any> = {
        metric: axis.metric,
        hint: axis.hint,
      };
      activeEntries.forEach((entry) => {
        row[`slot_${entry.slotIndex}`] = entry.metrics[axis.key];
      });
      return row;
    });
  }, [activeEntries]);

  // Data for BarChart comparison
  const barData = useMemo(() => {
    if (activeEntries.length === 0) return [];

    return activeEntries.map((entry) => {
      let rawVal = 0;
      switch (selectedBarMetric) {
        case 'error':
          rawVal = entry.metrics.errorMicrons;
          break;
        case 'speed':
          rawVal = entry.metrics.speedKpts;
          break;
        case 'resolution':
          rawVal = entry.metrics.resolutionMicrons;
          break;
        case 'range':
          rawVal = entry.metrics.rangeMm;
          break;
        case 'weight':
          rawVal = entry.metrics.weightKg;
          break;
      }

      return {
        name: entry.product.name,
        shortName: entry.product.name.length > 28 ? `${entry.product.name.slice(0, 26)}...` : entry.product.name,
        brand: entry.product.brand,
        slotIndex: entry.slotIndex,
        slotLabel: `Слот ${entry.slotIndex + 1}`,
        value: rawVal,
        color: entry.theme.stroke,
        fill: entry.theme.fill,
        isGost: entry.facet.isGostReestr,
      };
    });
  }, [activeEntries, selectedBarMetric]);

  // Find leader in the selected bar metric
  const metricLeader = useMemo(() => {
    if (barData.length < 2) return null;
    const cfg = BAR_METRIC_CONFIG[selectedBarMetric];
    if (cfg.betterDirection === 'lower') {
      let minItem = barData[0];
      for (const item of barData) {
        if (item.value < minItem.value) minItem = item;
      }
      return minItem;
    } else {
      let maxItem = barData[0];
      for (const item of barData) {
        if (item.value > maxItem.value) maxItem = item;
      }
      return maxItem;
    }
  }, [barData, selectedBarMetric]);

  // If no hardware selected
  if (activeEntries.length === 0) {
    return (
      <div
        id="hardware-chart-empty-container"
        className={`bg-slate-50 rounded-xl p-6 sm:p-8 border border-dashed border-gray-300 text-center ${className}`}
      >
        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-gray-900 text-sm sm:text-base">
          Метрологическая диаграмма сравнения параметров
        </h4>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
          {softwareEntriesCount > 0
            ? 'В текущих слотах выбрано программное обеспечение. Диаграмма Recharts формирует профили для аппаратного измерительного оборудования (КИМ и 3D-сканеры). Добавьте измерительную систему для построения графика.'
            : 'Добавьте хотя бы одно аппаратное устройство (КИМ, лазерный 3D-сканер или измерительную руку) в слоты сравнения для построения интерактивной диаграммы параметров.'}
        </p>
        {onSelectSlot && (
          <button
            id="chart-add-equipment-btn"
            onClick={() => onSelectSlot(0)}
            className="mt-4 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Выбрать модель из каталога</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      id="hardware-comparison-chart-wrapper"
      className={`bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden ${className}`}
    >
      {/* 1. Header Toolbar */}
      <div className="bg-slate-50/80 border-b border-gray-200 px-4 md:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base tracking-tight">
                Метрологическое сопоставление моделей
              </h3>
              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-full border border-blue-200">
                Recharts Analytics
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Наглядное сравнение точности по ГОСТ, скорости оцифровки и рабочего объема ({activeEntries.length} из 3 моделей)
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Radar vs Bar */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs self-start md:self-auto">
          <button
            id="chart-mode-radar-btn"
            onClick={() => setChartMode('radar')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              chartMode === 'radar'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-500 hover:text-gray-900 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Профиль (Радар)</span>
          </button>
          <button
            id="chart-mode-bar-btn"
            onClick={() => setChartMode('bar')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              chartMode === 'bar'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-500 hover:text-gray-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Параметры (Гистограмма)</span>
          </button>
        </div>
      </div>

      {/* 2. Models Legend Bar */}
      <div className="bg-slate-100/60 border-b border-gray-200 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Сравниваемые образцы:
          </span>
          {activeEntries.map((entry) => (
            <div
              key={entry.product.id}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border ${entry.theme.borderColor} shadow-2xs`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.theme.stroke }}
              />
              <span className="font-bold text-gray-800 text-[11px]">
                Слот {entry.slotIndex + 1}:
              </span>
              <span className="font-semibold text-slate-500 text-[11px] truncate max-w-[160px] sm:max-w-[220px]">
                {entry.product.name}
              </span>
              {entry.facet.isGostReestr && (
                <span
                  className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded"
                  title="Внесен в Государственный реестр средств измерений РФ (ФГИС «АРШИН»)"
                >
                  СИ РФ
                </span>
              )}
            </div>
          ))}
        </div>

        {activeEntries.length < 3 && onSelectSlot && (
          <button
            id="chart-add-slot-helper-btn"
            onClick={() => {
              const emptyIdx = products.findIndex((p) => p === null || p.category === 'software');
              onSelectSlot(emptyIdx !== -1 ? emptyIdx : 1);
            }}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Добавить еще прибор для сравнения
          </button>
        )}
      </div>

      {/* 3. BarChart Metric Sub-Selector (when chartMode === 'bar') */}
      {chartMode === 'bar' && (
        <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(BAR_METRIC_CONFIG) as BarMetricKey[]).map((mKey) => {
              const cfg = BAR_METRIC_CONFIG[mKey];
              const IconComp = cfg.icon;
              const isSelected = selectedBarMetric === mKey;
              return (
                <button
                  key={mKey}
                  id={`bar-metric-tab-${mKey}`}
                  onClick={() => setSelectedBarMetric(mKey)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-bold'
                      : 'bg-white text-slate-500 border-gray-200 hover:bg-slate-50'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cfg.title}</span>
                  <span className="text-[10px] opacity-75">({cfg.unit})</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-gray-500 shrink-0">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>{BAR_METRIC_CONFIG[selectedBarMetric].description}</span>
          </div>
        </div>
      )}

      {/* 4. Chart Canvas Container */}
      <div className="p-4 sm:p-6">
        {chartMode === 'radar' ? (
          /* RADAR CHART */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
            <div className="xl:col-span-8 w-full h-[340px] sm:h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    stroke="#CBD5E1"
                  />
                  {activeEntries.map((entry) => (
                    <Radar
                      key={entry.product.id}
                      name={`Слот ${entry.slotIndex + 1}: ${entry.product.name}`}
                      dataKey={`slot_${entry.slotIndex}`}
                      stroke={entry.theme.stroke}
                      fill={entry.theme.fill}
                      fillOpacity={activeEntries.length === 1 ? 0.45 : 0.3}
                      strokeWidth={2.5}
                    />
                  ))}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const dataItem = payload[0].payload;
                        return (
                          <div className="bg-[#1E293B] text-white p-3 rounded-xl shadow-sm border border-slate-700 text-xs max-w-xs">
                            <div className="font-bold text-amber-300 text-[13px] border-b border-slate-700 pb-1 mb-2">
                              {dataItem.metric}
                            </div>
                            <p className="text-[11px] text-slate-300 mb-2 leading-tight">
                              {dataItem.hint}
                            </p>
                            <div className="space-y-1.5">
                              {activeEntries.map((entry) => {
                                const val = dataItem[`slot_${entry.slotIndex}`];
                                return (
                                  <div
                                    key={entry.product.id}
                                    className="flex items-center justify-between gap-3 text-[11px]"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: entry.theme.stroke }}
                                      />
                                      <span className="truncate text-slate-200 font-medium">
                                        {entry.product.name}
                                      </span>
                                    </div>
                                    <span className="font-mono font-bold text-white shrink-0">
                                      {val} / 100 баллов
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Interpretation Sidebar */}
            <div className="xl:col-span-4 bg-slate-50 rounded-xl p-4 sm:p-5 border border-gray-200 space-y-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                  Инженерная интерпретация профилей
                </h4>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Лепестковая диаграмма сопоставляет 5 важнейших эксплуатационных факторов по нормализованной 100-балльной шкале «ДС-Инжиниринг»:
              </p>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-start gap-2">
                  <Target className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Прецизионность:</strong> расчет на базе предельной погрешности MPE (субмикронные КИМ достигают 99–100 баллов).
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Производительность:</strong> преимущество ручных оптических систем с синим лазером (до 3,6 млн тчк/с).
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-start gap-2">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Мобильность и зона:</strong> баланс портативности (ручные сканеры/руки) и охвата крупногабаритных объектов.
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                <span>Масштаб нормирования:</span>
                <strong className="text-gray-800">ISO 10360 / ГОСТ Р</strong>
              </div>
            </div>
          </div>
        ) : (
          /* BAR CHART */
          <div>
            <div className="w-full h-[320px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="slotLabel"
                    tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    unit={` ${BAR_METRIC_CONFIG[selectedBarMetric].unit}`}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        const cfg = BAR_METRIC_CONFIG[selectedBarMetric];
                        return (
                          <div className="bg-[#1E293B] text-white p-3 rounded-xl shadow-sm border border-slate-700 text-xs max-w-xs">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1 mb-1.5">
                              <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">
                                {item.slotLabel}
                              </span>
                              {item.isGost && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-700 text-emerald-100 font-bold">
                                  Госреестр СИ РФ
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-white text-[13px] mb-1">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-300 mb-2">
                              Производитель: {item.brand}
                            </div>
                            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                              <span className="text-slate-300">{cfg.title}:</span>
                              <span className="font-mono font-bold text-white text-sm">
                                {cfg.formatVal(item.value)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    fill="#2563EB"
                    label={{
                      position: 'top',
                      fill: '#1E293B',
                      fontSize: 11,
                      fontWeight: 700,
                      formatter: (val: any) => {
                        const num = Number(val);
                        return isNaN(num) ? '' : BAR_METRIC_CONFIG[selectedBarMetric].formatVal(num);
                      },
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Details Grid */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              {barData.map((item) => {
                const isLeader = metricLeader && metricLeader.slotIndex === item.slotIndex;
                const cfg = BAR_METRIC_CONFIG[selectedBarMetric];
                return (
                  <div
                    key={item.slotIndex}
                    className={`p-3 rounded-xl border transition-all ${
                      isLeader
                        ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-slate-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-gray-500">{item.slotLabel}</span>
                      {isLeader && (
                        <span className="text-[10px] font-extrabold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Лидер параметра
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-gray-900 text-xs truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-[11px] text-gray-500">{cfg.unit}:</span>
                      <span className="font-mono font-bold text-sm text-[#1E3A8A]">
                        {cfg.formatVal(item.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Summary Insights / Metrological Verdict */}
        <div className="mt-6 bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/60 rounded-xl p-4 sm:p-5 border border-blue-100">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h5 className="font-bold text-gray-900 text-xs sm:text-sm">
                Сводный метрологический вердикт «ДС-Инжиниринг»
              </h5>
            </div>
            <span className="text-[10px] text-gray-500 italic">
              Экспертный расчет на базе паспортов средств измерений
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Accuracy Benchmark */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>Эталон точности (MPE)</span>
              </div>
              {(() => {
                const bestAccuracy = [...activeEntries].sort(
                  (a, b) => a.metrics.errorMicrons - b.metrics.errorMicrons
                )[0];
                return (
                  <div>
                    <div className="font-bold text-gray-900 truncate">
                      {bestAccuracy.product.name}
                    </div>
                    <div className="text-gray-500 mt-1 flex items-center gap-2">
                      <span>Погрешность:</span>
                      <strong className="text-emerald-700 font-mono">
                        {bestAccuracy.metrics.errorMicrons} мкм
                      </strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Speed Benchmark */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Лидер производительности</span>
              </div>
              {(() => {
                const bestSpeed = [...activeEntries].sort(
                  (a, b) => b.metrics.speedKpts - a.metrics.speedKpts
                )[0];
                return (
                  <div>
                    <div className="font-bold text-gray-900 truncate">
                      {bestSpeed.product.name}
                    </div>
                    <div className="text-gray-500 mt-1 flex items-center gap-2">
                      <span>Скорость сбора:</span>
                      <strong className="text-blue-700 font-mono">
                        {bestSpeed.metrics.speedKpts.toLocaleString('ru-RU')} тыс. тчк/с
                      </strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Metrological Status / Reestr */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Госреестр СИ РФ</span>
              </div>
              <div className="space-y-1">
                {activeEntries.map((entry) => (
                  <div key={entry.product.id} className="flex items-center justify-between text-[11px]">
                    <span className="truncate max-w-[150px] text-slate-500">
                      Слот {entry.slotIndex + 1}:
                    </span>
                    {entry.facet.isGostReestr ? (
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Внесен в СИ РФ
                      </span>
                    ) : (
                      <span className="text-gray-400">По калибровке</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
