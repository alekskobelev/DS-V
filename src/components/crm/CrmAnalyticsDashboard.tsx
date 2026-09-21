import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Percent,
  Calculator,
  MessageSquare,
  FileCheck2,
  Calendar,
  Filter,
  ArrowUpRight,
  Sparkles,
  Award,
  Layers,
  Zap,
  HelpCircle,
  Download
} from 'lucide-react';

interface MonthlyLeadData {
  month: string;
  monthShort: string;
  year: number;
  visitors: number;
  calculatorLeads: number;
  chatLeads: number;
  directRfqs: number;
  b2bTickets: number;
  totalLeads: number;
  wonDeals: number;
  conversionRate: number; // %
  wonConversionRate: number; // %
  pipelineRevenueMillion: number; // млн руб
}

const SIMULATED_MONTHLY_DATA: MonthlyLeadData[] = [
  {
    month: 'Октябрь 2025',
    monthShort: 'Окт',
    year: 2025,
    visitors: 3840,
    calculatorLeads: 42,
    chatLeads: 28,
    directRfqs: 18,
    b2bTickets: 12,
    totalLeads: 100,
    wonDeals: 24,
    conversionRate: 2.60,
    wonConversionRate: 24.0,
    pipelineRevenueMillion: 14.8
  },
  {
    month: 'Ноябрь 2025',
    monthShort: 'Ноя',
    year: 2025,
    visitors: 4120,
    calculatorLeads: 48,
    chatLeads: 34,
    directRfqs: 22,
    b2bTickets: 14,
    totalLeads: 118,
    wonDeals: 30,
    conversionRate: 2.86,
    wonConversionRate: 25.4,
    pipelineRevenueMillion: 17.5
  },
  {
    month: 'Декабрь 2025',
    monthShort: 'Дек',
    year: 2025,
    visitors: 4680,
    calculatorLeads: 56,
    chatLeads: 44,
    directRfqs: 29,
    b2bTickets: 18,
    totalLeads: 147,
    wonDeals: 39,
    conversionRate: 3.14,
    wonConversionRate: 26.5,
    pipelineRevenueMillion: 22.4
  },
  {
    month: 'Январь 2026',
    monthShort: 'Янв',
    year: 2026,
    visitors: 3620,
    calculatorLeads: 38,
    chatLeads: 31,
    directRfqs: 20,
    b2bTickets: 15,
    totalLeads: 104,
    wonDeals: 27,
    conversionRate: 2.87,
    wonConversionRate: 25.9,
    pipelineRevenueMillion: 15.6
  },
  {
    month: 'Февраль 2026',
    monthShort: 'Фев',
    year: 2026,
    visitors: 4450,
    calculatorLeads: 54,
    chatLeads: 42,
    directRfqs: 28,
    b2bTickets: 19,
    totalLeads: 143,
    wonDeals: 38,
    conversionRate: 3.21,
    wonConversionRate: 26.6,
    pipelineRevenueMillion: 21.8
  },
  {
    month: 'Март 2026',
    monthShort: 'Мар',
    year: 2026,
    visitors: 5120,
    calculatorLeads: 68,
    chatLeads: 52,
    directRfqs: 35,
    b2bTickets: 22,
    totalLeads: 177,
    wonDeals: 49,
    conversionRate: 3.46,
    wonConversionRate: 27.7,
    pipelineRevenueMillion: 28.2
  },
  {
    month: 'Апрель 2026',
    monthShort: 'Апр',
    year: 2026,
    visitors: 5480,
    calculatorLeads: 76,
    chatLeads: 58,
    directRfqs: 39,
    b2bTickets: 24,
    totalLeads: 197,
    wonDeals: 56,
    conversionRate: 3.59,
    wonConversionRate: 28.4,
    pipelineRevenueMillion: 31.5
  },
  {
    month: 'Май 2026',
    monthShort: 'Май',
    year: 2026,
    visitors: 4980,
    calculatorLeads: 70,
    chatLeads: 53,
    directRfqs: 34,
    b2bTickets: 21,
    totalLeads: 178,
    wonDeals: 51,
    conversionRate: 3.57,
    wonConversionRate: 28.6,
    pipelineRevenueMillion: 29.0
  },
  {
    month: 'Июнь 2026',
    monthShort: 'Июн',
    year: 2026,
    visitors: 5890,
    calculatorLeads: 88,
    chatLeads: 66,
    directRfqs: 44,
    b2bTickets: 27,
    totalLeads: 225,
    wonDeals: 66,
    conversionRate: 3.82,
    wonConversionRate: 29.3,
    pipelineRevenueMillion: 36.8
  },
  {
    month: 'Июль 2026',
    monthShort: 'Июл',
    year: 2026,
    visitors: 6140,
    calculatorLeads: 94,
    chatLeads: 71,
    directRfqs: 48,
    b2bTickets: 29,
    totalLeads: 242,
    wonDeals: 72,
    conversionRate: 3.94,
    wonConversionRate: 29.7,
    pipelineRevenueMillion: 40.2
  },
  {
    month: 'Август 2026',
    monthShort: 'Авг',
    year: 2026,
    visitors: 6520,
    calculatorLeads: 104,
    chatLeads: 79,
    directRfqs: 53,
    b2bTickets: 31,
    totalLeads: 267,
    wonDeals: 81,
    conversionRate: 4.10,
    wonConversionRate: 30.3,
    pipelineRevenueMillion: 45.6
  },
  {
    month: 'Сентябрь 2026',
    monthShort: 'Сен',
    year: 2026,
    visitors: 6980,
    calculatorLeads: 118,
    chatLeads: 88,
    directRfqs: 60,
    b2bTickets: 35,
    totalLeads: 301,
    wonDeals: 94,
    conversionRate: 4.31,
    wonConversionRate: 31.2,
    pipelineRevenueMillion: 52.4
  }
];

const LEAD_CHANNELS_DISTRIBUTION = [
  { name: 'Онлайн-калькулятор стоимости', value: 39, color: '#2563EB', count: 118, leadCost: '1 240 ₽' },
  { name: 'Чат «Онлайн-инженер»', value: 29, color: '#0EA5E9', count: 88, leadCost: '980 ₽' },
  { name: 'Прямые RFQ и формы услуг', value: 20, color: '#8B5CF6', count: 60, leadCost: '1 850 ₽' },
  { name: 'B2B Сервис и ТЗ', value: 12, color: '#10B981', count: 35, leadCost: '2 100 ₽' }
];

const SERVICE_CONVERSIONS = [
  { service: '3D-сканирование и метрологический контроль', visitors: 2450, leads: 122, conv: 4.98, avgCheck: '320 000 ₽' },
  { service: 'Реверс-инжиниринг и CAD-моделирование', visitors: 1890, leads: 86, conv: 4.55, avgCheck: '450 000 ₽' },
  { service: 'Поставка 3D-сканеров и КИМ (Оборудование)', visitors: 1380, leads: 48, conv: 3.48, avgCheck: '3 800 000 ₽' },
  { service: 'Метрологическое ПО и цифровой контроль', visitors: 1260, leads: 45, conv: 3.57, avgCheck: '1 200 000 ₽' }
];

export const CrmAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'6m' | '12m' | 'ytd'>('12m');
  const [chartViewMode, setChartViewMode] = useState<'composed' | 'stacked' | 'conversion'>('composed');

  const filteredData = useMemo(() => {
    if (timeRange === '6m') {
      return SIMULATED_MONTHLY_DATA.slice(-6);
    }
    if (timeRange === 'ytd') {
      return SIMULATED_MONTHLY_DATA.filter(d => d.year === 2026);
    }
    return SIMULATED_MONTHLY_DATA;
  }, [timeRange]);

  const latestMonth = filteredData[filteredData.length - 1];
  const previousMonth = filteredData[filteredData.length - 2] || latestMonth;

  const totalLeadsPeriod = filteredData.reduce((acc, curr) => acc + curr.totalLeads, 0);
  const avgConversionPeriod = (
    filteredData.reduce((acc, curr) => acc + curr.conversionRate, 0) / filteredData.length
  ).toFixed(2);
  const totalWonDealsPeriod = filteredData.reduce((acc, curr) => acc + curr.wonDeals, 0);
  const totalPipelineRevenue = filteredData.reduce((acc, curr) => acc + curr.pipelineRevenueMillion, 0).toFixed(1);

  const leadsMoMGrowth = (
    ((latestMonth.totalLeads - previousMonth.totalLeads) / previousMonth.totalLeads) * 100
  ).toFixed(1);

  const convMoMGrowth = (latestMonth.conversionRate - previousMonth.conversionRate).toFixed(2);

  return (
    <div id="crm-analytics-dashboard" className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-lg p-5 sm:p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                  Аналитика генерации лидов и конверсии сайта
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Мониторинг воронки продаж, эффективности калькулятора, онлайн-инженера и каналов захвата лидов «ДС‑Инжиниринг»
                </p>
              </div>
            </div>
          </div>

          {/* Time Range Selector & Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
              <button
                id="filter-time-6m"
                onClick={() => setTimeRange('6m')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === '6m'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                Посл. 6 мес
              </button>
              <button
                id="filter-time-12m"
                onClick={() => setTimeRange('12m')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === '12m'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                За 12 месяцев
              </button>
              <button
                id="filter-time-ytd"
                onClick={() => setTimeRange('ytd')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === 'ytd'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                2026 (YTD)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Leads */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Всего лидов за период</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-gray-900">{totalLeadsPeriod}</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{leadsMoMGrowth}% прирост в последнем месяце ({latestMonth.totalLeads} лидов)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Average Conversion Rate */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Средняя конверсия сайта</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-gray-900">{latestMonth.conversionRate}%</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{convMoMGrowth}% п.п. (средняя за период: {avgConversionPeriod}%)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Won Deals */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Заключено сделок (Won)</span>
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-gray-900">{totalWonDealsPeriod}</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Конверсия лид-в-сделку: {latestMonth.wonConversionRate}%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Estimated Pipeline Volume */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Объем пайплайна (Период)</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-gray-900">{totalPipelineRevenue} млн ₽</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
              <span>В текущем месяце: {latestMonth.pipelineRevenueMillion} млн ₽</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Recharts Section: Monthly Trend & Breakdown */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>Динамика лидогенерации и конверсии по месяцам</span>
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Соотношение количества заявок по источникам и общий коэффициент конверсии трафика в лиды
            </p>
          </div>

          {/* Chart Display Mode Switcher */}
          <div className="inline-flex bg-gray-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto border border-gray-200">
            <button
              id="chart-mode-composed"
              onClick={() => setChartViewMode('composed')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'composed'
                  ? 'bg-white text-blue-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-gray-900'
              }`}
            >
              Лиды & Конверсия (%)
            </button>
            <button
              id="chart-mode-stacked"
              onClick={() => setChartViewMode('stacked')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'stacked'
                  ? 'bg-white text-blue-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-gray-900'
              }`}
            >
              Структура источников
            </button>
            <button
              id="chart-mode-conversion"
              onClick={() => setChartViewMode('conversion')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'conversion'
                  ? 'bg-white text-blue-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-gray-900'
              }`}
            >
              Только конверсия (%)
            </button>
          </div>
        </div>

        {/* Recharts Main Canvas */}
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartViewMode === 'composed' ? (
              <ComposedChart data={filteredData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotalLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis 
                  dataKey="monthShort" 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  label={{ value: 'Лиды (шт.)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 11 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  unit="%" 
                  domain={[0, 6]}
                  tick={{ fill: '#059669', fontSize: 12 }} 
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  label={{ value: 'Конверсия (%)', angle: 90, position: 'insideRight', fill: '#059669', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderRadius: '12px', 
                    border: '1px solid #334155', 
                    color: '#FFF',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Конверсия сайта') return [`${value}%`, name];
                    if (name === 'Всего лидов') return [`${value} шт.`, name];
                    if (name === 'Заключено договоров') return [`${value} шт.`, name];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload && payload[0]?.payload;
                    return item ? `${item.month}` : label;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="totalLeads" 
                  name="Всего лидов" 
                  stroke="#2563EB" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorTotalLeads)" 
                />
                <Bar 
                  yAxisId="left"
                  dataKey="wonDeals" 
                  name="Заключено договоров" 
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={18}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="conversionRate" 
                  name="Конверсия сайта" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, stroke: '#064E3B' }}
                />
              </ComposedChart>
            ) : chartViewMode === 'stacked' ? (
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis 
                  dataKey="monthShort" 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderRadius: '12px', 
                    border: '1px solid #334155', 
                    color: '#FFF' 
                  }}
                  formatter={(value: any, name: any) => [`${value} заявок`, name]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="calculatorLeads" name="Калькулятор стоимости" stackId="a" fill="#2563EB" />
                <Bar dataKey="chatLeads" name="Чат Онлайн-инженер" stackId="a" fill="#0EA5E9" />
                <Bar dataKey="directRfqs" name="Прямые RFQ" stackId="a" fill="#8B5CF6" />
                <Bar dataKey="b2bTickets" name="B2B Поддержка" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={filteredData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConvOnly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="monthShort" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} />
                <YAxis unit="%" domain={[0, 6]} tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#FFF' }}
                  formatter={(value: any) => [`${value}%`, 'Коэффициент конверсии']}
                />
                <Area type="monotone" dataKey="conversionRate" name="Коэффициент конверсии (%)" stroke="#10B981" strokeWidth={3} fill="url(#colorConvOnly)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Section: Channels Breakdown & Service Category Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Distribution by Lead Channel */}
        <div className="xl:col-span-5 bg-white p-5 sm:p-6 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-gray-900">Источники лидов (Сентябрь 2026)</h4>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                301 заявка
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Распределение входящих обращений по модулям захвата контактов
            </p>

            <div className="h-[200px] w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={LEAD_CHANNELS_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {LEAD_CHANNELS_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '10px', border: '1px solid #334155', color: '#FFF', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [`${val}% доли`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Channels Legend & Stats Table */}
          <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
            {LEAD_CHANNELS_DISTRIBUTION.map((ch, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ch.color }}></span>
                  <span className="font-semibold text-gray-800">{ch.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-gray-900">{ch.count} шт. ({ch.value}%)</span>
                  <span className="text-[11px] text-gray-500">CPL: {ch.leadCost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (7 cols): Service Categories Conversion Rates */}
        <div className="xl:col-span-7 bg-white p-5 sm:p-6 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-gray-900">Конверсия по направлениям услуг</h4>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Топ: Метрология (4.98%)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Эффективность посадочных страниц и воронки целевых услуг «ДС‑Инжиниринг»
            </p>

            <div className="space-y-3.5 mt-4">
              {SERVICE_CONVERSIONS.map((sc, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-gray-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-1.5">
                    <span className="font-bold text-gray-900">{sc.service}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-emerald-700 font-black">{sc.conv}% CR</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-slate-500">{sc.leads} лидов / {sc.visitors} посет.</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(sc.conv / 6) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1.5">
                    <span>Средний чек контракта: <strong className="text-gray-800 font-semibold">{sc.avgCheck}</strong></span>
                    <span className="text-blue-600 font-medium">Стабильный рост</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Данные синхронизированы с модулями онлайн-калькулятора и чат-виджетом
            </span>
            <span className="font-semibold text-slate-500">Обновлено в реальном времени</span>
          </div>
        </div>
      </div>
    </div>
  );
};
