import React, { useState, useMemo } from 'react';
import { CrmPrintSummaryModal } from './CrmPrintSummaryModal';
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
  Award,
  ShieldCheck,
  Clock,
  Phone,
  Mail,
  Building2,
  Search,
  Filter,
  Download,
  Sparkles,
  Layers,
  Cpu,
  Settings,
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  FileText,
  ChevronRight,
  RefreshCw,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Printer,
  History,
  Factory,
  Target,
  Users,
  Compass
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExtendedDeal, INITIAL_CRM_DEALS } from '../../data/mockCrmData';
import { COMPANY_INFO } from '../../data/mockData';
import { ArshinVerificationWidget } from './ArshinVerificationWidget';

// Format currency in Russian Rubles
const formatRub = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} млн ₽`;
  }
  return `${value.toLocaleString('ru-RU')} ₽`;
};

const formatFullRub = (value: number): string => {
  return `${value.toLocaleString('ru-RU')} ₽`;
};

export type PeriodFilter = 'month' | 'quarter' | 'year' | 'legacy30';
export type FunnelFilter = 'all' | 'equipment' | 'services' | 'support';

interface RecentRequestItem {
  id: string;
  customerName: string;
  companyName: string;
  phone: string;
  email: string;
  source: 'calculator' | 'chat' | 'callback' | 'rfq' | 'service' | 'exhibition';
  sourceLabel: string;
  sourceBadgeColor: string;
  topic: string;
  funnel: 'equipment' | 'services' | 'support';
  funnelLabel: string;
  estimatedPrice: number;
  createdAt: string;
  slaMinutesLeft: number;
  slaStatus: 'urgent' | 'warning' | 'ok' | 'responded';
  manager: string;
  dealStage: string;
}

export interface CrmDashboardProps {
  onNavigateToSchedule?: () => void;
}

export const CrmDashboard: React.FC<CrmDashboardProps> = ({ onNavigateToSchedule }) => {
  const { deals: contextDeals, contracts, commercialProposals, supportTickets } = useApp();

  // Active Deals dataset (fallback to initial mock if empty)
  const deals: ExtendedDeal[] = useMemo(() => {
    return contextDeals && contextDeals.length > 0 ? contextDeals : INITIAL_CRM_DEALS;
  }, [contextDeals]);

  // Filters State
  const [period, setPeriod] = useState<PeriodFilter>('quarter');
  const [funnelFilter, setFunnelFilter] = useState<FunnelFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RecentRequestItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrintSummaryOpen, setIsPrintSummaryOpen] = useState(false);

  // Period-specific multipliers to reflect realistic 30-year legacy scaling
  const periodMultiplier = useMemo(() => {
    switch (period) {
      case 'month':
        return 0.35;
      case 'quarter':
        return 1.0;
      case 'year':
        return 3.8;
      case 'legacy30':
        return 31.0;
      default:
        return 1.0;
    }
  }, [period]);

  // 1. METRIC: Total Pipeline Value Calculation
  const pipelineMetrics = useMemo(() => {
    const filteredDeals = deals.filter(deal => {
      if (funnelFilter !== 'all' && deal.funnel !== funnelFilter) return false;
      return deal.stage !== 'lost';
    });

    const totalRaw = filteredDeals.reduce((sum, d) => sum + (d.estimatedPrice || 0), 0);
    
    // Scale according to active period view
    const totalPipeline = period === 'legacy30' ? 1_480_000_000 : Math.round(totalRaw * periodMultiplier);
    
    // Weighted value based on stage win probabilities
    const weightedRaw = filteredDeals.reduce((sum, d) => {
      let rate = 0.2;
      if (d.stage === 'audit' || d.stage === 'estimate') rate = 0.35;
      if (d.stage === 'tender' || d.stage === 'nda') rate = 0.55;
      if (d.stage === 'demo') rate = 0.70;
      if (d.stage === 'contract' || d.stage === 'maintenance') rate = 0.85;
      if (d.stage === 'closed_won' || d.stage === 'completed') rate = 1.0;
      return sum + (d.estimatedPrice || 0) * rate;
    }, 0);

    const weightedPipeline = period === 'legacy30' ? 1_120_000_000 : Math.round(weightedRaw * periodMultiplier);

    // Segment breakdown
    const equipmentValue = Math.round(totalPipeline * 0.62);
    const servicesValue = Math.round(totalPipeline * 0.21);
    const supportValue = Math.round(totalPipeline * 0.17);

    return {
      total: totalPipeline,
      weighted: weightedPipeline,
      equipment: equipmentValue,
      services: servicesValue,
      support: supportValue,
      growthRate: '+19.4%',
      dealsCount: Math.round(filteredDeals.length * (period === 'legacy30' ? 85 : periodMultiplier))
    };
  }, [deals, funnelFilter, period, periodMultiplier]);

  // 2. METRIC: Lead Conversion Rate Calculation
  const conversionMetrics = useMemo(() => {
    const baseWinRate = 28.4; // Industry standard for high-end CMM metrology
    const adjustedRate = funnelFilter === 'support' 
      ? 48.2 
      : funnelFilter === 'services' 
        ? 34.6 
        : funnelFilter === 'equipment' 
          ? 23.8 
          : baseWinRate;

    // 30-Year repeat client retention rate
    const repeatBusinessRate = 84.7;

    return {
      overallRate: adjustedRate,
      changeVsLastYear: '+3.6%',
      funnelConversion: {
        lead: 100,
        qualification: 82,
        techAudit: 64,
        tkpTender: 48,
        demoNda: 36,
        contractSigned: adjustedRate
      },
      repeatBusinessRate,
      averageSalesCycleDays: funnelFilter === 'equipment' ? 78 : funnelFilter === 'services' ? 24 : 14,
      historicalWonDeals30Years: 1840
    };
  }, [funnelFilter]);

  // 3. METRIC: Recent Requests dataset
  const recentRequests: RecentRequestItem[] = useMemo(() => {
    const list: RecentRequestItem[] = [
      {
        id: 'REQ-2026-914',
        customerName: 'Королев Виктор Михайлович',
        companyName: 'ПАО «ОДК-Кузнецов» (Самара)',
        phone: '+7 (846) 270-80-00',
        email: 'v.korolev@odk-kuznetsov.ru',
        source: 'rfq',
        sourceLabel: 'Прямой RFQ ТКП',
        sourceBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        topic: 'Мостовая КИМ Mitutoyo CRYSTA-Apex V9168 + 10 лицензий TopSolid 7 Cam',
        funnel: 'equipment',
        funnelLabel: 'Оборудование и ПО',
        estimatedPrice: 28500000,
        createdAt: '2026-09-11 11:20',
        slaMinutesLeft: 7,
        slaStatus: 'urgent',
        manager: 'Некрасов С.Ю.',
        dealStage: 'Подготовка ТКП'
      },
      {
        id: 'CALL-2026-804',
        customerName: 'Белов Артем Игоревич',
        companyName: 'АО «Авиастар-СП» (Ульяновск)',
        phone: '+7 (8422) 28-10-10',
        email: 'a.belov@aviastar-sp.ru',
        source: 'callback',
        sourceLabel: 'Обратный звонок (Срочно)',
        sourceBadgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        topic: 'Выездной 3D-контроль геометрии центроплана самолета трекером Leica AT960',
        funnel: 'services',
        funnelLabel: 'Инжиниринг',
        estimatedPrice: 1850000,
        createdAt: '2026-09-11 10:45',
        slaMinutesLeft: 3,
        slaStatus: 'urgent',
        manager: 'Скобелев А.С.',
        dealStage: 'Квалификация лида'
      },
      {
        id: 'CALC-2026-782',
        customerName: 'Семенов Дмитрий Павлович',
        companyName: 'ПАО «КАМАЗ» — Литейный завод',
        phone: '+7 (8552) 37-14-14',
        email: 'semenov.dp@kamaz.ru',
        source: 'calculator',
        sourceLabel: 'Инженерный калькулятор',
        sourceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        topic: 'Оптический 3D-сканер FreeScan COMBO + ПО контроля Geomagic Control X',
        funnel: 'equipment',
        funnelLabel: 'Оборудование и ПО',
        estimatedPrice: 7900000,
        createdAt: '2026-09-11 09:15',
        slaMinutesLeft: 22,
        slaStatus: 'ok',
        manager: 'Чернов М.В.',
        dealStage: 'Технический аудит'
      },
      {
        id: 'SRV-2026-309',
        customerName: 'Иванова Екатерина Сергеевна',
        companyName: 'АО «Уральский завод ГА» (УЗГА)',
        phone: '+7 (343) 295-50-50',
        email: 'e.ivanova@uwca.ru',
        source: 'service',
        sourceLabel: 'Сервисный портал B2B',
        sourceBadgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        topic: 'Ежегодное ТО КИМ Mitutoyo + юстировка лазером и поверка во ФГИС АРШИН',
        funnel: 'support',
        funnelLabel: 'Сервис и ТО КИМ',
        estimatedPrice: 620000,
        createdAt: '2026-09-10 16:40',
        slaMinutesLeft: 0,
        slaStatus: 'responded',
        manager: 'Смирнов К.А.',
        dealStage: 'Согласован выезд инженера'
      },
      {
        id: 'CHAT-2026-551',
        customerName: 'Григорьев Антон Валерьевич',
        companyName: 'АО «Сибур-Химпром» (Пермь)',
        phone: '+7 (342) 290-88-88',
        email: 'grigoriev.av@sibur.ru',
        source: 'chat',
        sourceLabel: 'Онлайн-Инженер (ИИ)',
        sourceBadgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
        topic: 'Разработка кинематического 5-осевого постпроцессора DMU 50 для TopSolid 7',
        funnel: 'services',
        funnelLabel: 'Инжиниринг',
        estimatedPrice: 950000,
        createdAt: '2026-09-10 14:15',
        slaMinutesLeft: 0,
        slaStatus: 'responded',
        manager: 'Некрасов С.Ю.',
        dealStage: 'ТЗ и 3D-модель станка получены'
      },
      {
        id: 'EXH-2026-118',
        customerName: 'Тарасов Михаил Андреевич',
        companyName: 'АО «ОДК-Климов» (Санкт-Петербург)',
        phone: '+7 (812) 456-78-90',
        email: 'm.tarasov@klimov.ru',
        source: 'exhibition',
        sourceLabel: 'Металлообработка-2026',
        sourceBadgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        topic: 'Автоматизированная ячейка контроля профиля пера лопаток газовых турбин',
        funnel: 'equipment',
        funnelLabel: 'Оборудование и ПО',
        estimatedPrice: 34000000,
        createdAt: '2026-09-09 12:00',
        slaMinutesLeft: 0,
        slaStatus: 'responded',
        manager: 'Скобелев А.С.',
        dealStage: 'Выездная демонстрация и NDA'
      }
    ];

    // Filter by Funnel
    return list.filter(item => {
      if (funnelFilter !== 'all' && item.funnel !== funnelFilter) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'urgent' && item.slaStatus !== 'urgent') return false;
        if (statusFilter === 'responded' && item.slaStatus !== 'responded') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.companyName.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.topic.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [funnelFilter, statusFilter, searchQuery]);

  // 4. CHART: Monthly Trend of Total Pipeline Value vs Won Revenue
  const monthlyChartData = useMemo(() => {
    return [
      { month: 'Апр 2026', pipeline: 84.5, won: 22.1, weighted: 48.0, requests: 48 },
      { month: 'Май 2026', pipeline: 96.2, won: 28.4, weighted: 55.4, requests: 56 },
      { month: 'Июн 2026', pipeline: 112.0, won: 34.2, weighted: 68.1, requests: 62 },
      { month: 'Июл 2026', pipeline: 125.8, won: 38.6, weighted: 74.2, requests: 71 },
      { month: 'Авг 2026', pipeline: 139.4, won: 42.0, weighted: 81.5, requests: 78 },
      { month: 'Сен 2026 (Тек)', pipeline: 148.4, won: 49.8, weighted: 86.2, requests: 84 }
    ];
  }, []);

  // 5. CHART: 30-Year Business Evolution by Decade (1994 - 2026)
  const legacyDecadeData = useMemo(() => {
    return [
      {
        period: '1995–2003',
        label: 'Зарождение КИМ',
        plantsCount: 140,
        machinesDelivered: 85,
        calibrationsCount: 320,
        revenueIndex: 18,
        focus: 'Поставки мостовых контактных КИМ, разработка калибровочных методик'
      },
      {
        period: '2004–2014',
        label: 'Лазерное 3D & САПР',
        plantsCount: 460,
        machinesDelivered: 290,
        calibrationsCount: 1150,
        revenueIndex: 46,
        focus: 'Внедрение САПР TopSolid 7 CAM, оптические сканеры, 5-осевые постпроцессоры'
      },
      {
        period: '2015–2021',
        label: 'Реверс & Аккредитация',
        plantsCount: 880,
        machinesDelivered: 540,
        calibrationsCount: 2300,
        revenueIndex: 78,
        focus: 'Центр реверс-инжиниринга турбин, мобильные КИМ-руки, аттестация сервиса'
      },
      {
        period: '2022–2026',
        label: 'Экосистема 30+ лет',
        plantsCount: 1240,
        machinesDelivered: 780,
        calibrationsCount: 3540,
        revenueIndex: 100,
        focus: 'Автоматизированные робо-ячейки контроля, ФГИС АРШИН, цифровая платформа'
      }
    ];
  }, []);

  // 6. CHART: Conversion Funnel Stage Distribution
  const conversionFunnelData = useMemo(() => {
    return [
      { stage: '1. Входящие лиды', count: 120, rate: '100%', fill: '#3b82f6' },
      { stage: '2. Технический аудит', count: 98, rate: '81.6%', fill: '#0ea5e9' },
      { stage: '3. ТКП и Спецификация', count: 76, rate: '63.3%', fill: '#06b6d4' },
      { stage: '4. Выездное Демо / NDA', count: 52, rate: '43.3%', fill: '#8b5cf6' },
      { stage: '5. Договор и Аванс', count: 41, rate: '34.1%', fill: '#f59e0b' },
      { stage: '6. Контракт закрыт (ПНР)', count: 34, rate: '28.4%', fill: '#10b981' }
    ];
  }, []);

  // Copy phone handler
  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  // Export handler
  const handleExportData = () => {
    setIsExporting(true);
    try {
      const headers = ['ID Запроса', 'Заказчик', 'Предприятие', 'Телефон', 'Email', 'Источник', 'Тематика / Оборудование', 'Сумма (₽)', 'Статус SLA', 'Менеджер', 'Дата'];
      const rows = recentRequests.map(r => [
        r.id,
        `"${r.customerName}"`,
        `"${r.companyName}"`,
        r.phone,
        r.email,
        r.sourceLabel,
        `"${r.topic}"`,
        r.estimatedPrice,
        r.slaStatus,
        r.manager,
        r.createdAt
      ]);
      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `DS_Engineering_CRM_Dashboard_${period}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="crm-dashboard-container" className="space-y-6">
      
      {/* 1. TOP HEADER & 30-YEAR HERITAGE BADGE BANNER */}
      <div id="crm-dashboard-heritage-banner" className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-lg p-6 sm:p-8 border-2 border-slate-800 shadow-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span id="badge-30-years" className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Award className="w-4 h-4 text-amber-400" />
                30+ Лет на рынке метрологии (1994–2026)
              </span>
              <span id="badge-state-accredited" className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ФГИС «АРШИН» & ГОСТ Р ИСО 10360
              </span>
              <span id="badge-heritage-plants" className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold bg-blue-400/20 text-blue-200 border border-blue-400/30">
                <Factory className="w-3.5 h-3.5 text-blue-400" />
                1 240+ оснащенных заводов РФ и СНГ
              </span>
            </div>

            <div>
              <h1 id="crm-dashboard-title" className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
                <span>Сводный дашборд показателей</span>
                <span className="text-amber-400 text-lg font-bold font-mono">
                  v2.9
                </span>
              </h1>
              <p id="crm-dashboard-subtitle" className="text-slate-300 text-xs mt-1 leading-relaxed max-w-2xl">
                Оперативный мониторинг воронки продаж, конверсии и динамики контрактов.
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="btn-crm-dashboard-export"
              type="button"
              onClick={handleExportData}
              disabled={isExporting}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-2 shadow-xs cursor-pointer hover:border-slate-600 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>{isExporting ? 'Выгрузка...' : 'Экспорт (CSV)'}</span>
            </button>

            <button
              id="btn-crm-dashboard-print"
              type="button"
              onClick={() => setIsPrintSummaryOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-md cursor-pointer hover:shadow-blue-500/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Печать сводки</span>
            </button>
          </div>
        </div>

        {/* 30-Year Key Numbers Ribbon */}
        <div id="crm-dashboard-heritage-ribbon" className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-0.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">История практики</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">31 Год</div>
            <div className="text-[11px] text-slate-400">Основана в 1995 году</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Внедренных КИМ & Сканеров</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">780+ ед.</div>
            <div className="text-[11px] text-emerald-400">Mitutoyo, Shining3D, Leica</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Поверок и ТО КИМ</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">3 540+</div>
            <div className="text-[11px] text-blue-300">В реестре ФГИС «АРШИН»</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Индекс удержания (LTV)</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">84.7%</div>
            <div className="text-[11px] text-slate-400">Повторные контракты</div>
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD FILTER TOOLBAR */}
      <div id="crm-dashboard-toolbar" className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4">
        
        {/* Period Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 hidden sm:inline-flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            Период:
          </span>
          <button
            id="filter-period-month"
            type="button"
            onClick={() => setPeriod('month')}
            className={`px-2.5 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              period === 'month'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Сентябрь 2026
          </button>
          <button
            id="filter-period-quarter"
            type="button"
            onClick={() => setPeriod('quarter')}
            className={`px-2.5 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              period === 'quarter'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            III Квартал 2026
          </button>
          <button
            id="filter-period-year"
            type="button"
            onClick={() => setPeriod('year')}
            className={`px-2.5 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              period === 'year'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            2026 Год
          </button>
          <button
            id="filter-period-legacy30"
            type="button"
            onClick={() => setPeriod('legacy30')}
            className={`px-2.5 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              period === 'legacy30'
                ? 'bg-amber-500 text-slate-900 shadow-xs font-black'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-950/40'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            30 лет (1994–2026)
          </button>
        </div>

        {/* Business Unit Funnel Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Направление:
          </span>
          <select
            id="filter-funnel-select"
            value={funnelFilter}
            onChange={(e) => setFunnelFilter(e.target.value as FunnelFilter)}
            aria-label="Фильтр по направлению бизнеса"
            className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-xs sm:max-w-sm truncate"
          >
            <option value="all">Все направления (Комплексный)</option>
            <option value="equipment">Оборудование и ПО (КИМ, 3D-сканеры, TopSolid)</option>
            <option value="services">Инжиниринговые услуги (3D-скан, реверс, ЧПУ)</option>
            <option value="support">Сервис и ТО КИМ (Поверка, ремонт, запчасти)</option>
          </select>
        </div>
      </div>

      {/* CORE 3 METRIC CARDS (Recent Requests, Lead Conversion Rate, Total Pipeline Value) - Stacked Uniform Rounded Rectangles */}
      <div id="crm-dashboard-kpi-grid" className="flex flex-col gap-5 w-full">
        
        {/* BLOCK 1: ACTIVE REQUESTS (Full-width Rounded Rectangle) */}
        <div id="card-metric-total-pipeline" className="w-full bg-white dark:bg-slate-900 rounded-lg p-5 sm:p-6 border-2 border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 items-center">
            {/* Header & Category */}
            <div className="flex items-center gap-3.5 xl:col-span-3 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 shadow-xs">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                    Активные запросы
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-0.5 shrink-0">
                    <ArrowUpRight className="w-3 h-3" />
                    +14%
                  </span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  В работе
                </div>
              </div>
            </div>

            {/* KPI Metric Value */}
            <div className="xl:col-span-2 min-w-0">
              <div id="metric-pipeline-total-number" className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight leading-none">
                342
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Новых за месяц:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                  +45
                </span>
              </div>
            </div>

            {/* Segment Breakdown Progress Bar */}
            <div className="xl:col-span-4 min-w-0 space-y-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold flex-wrap gap-1">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  Оборудование (62%)
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Услуги (21%)
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Сервис (17%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-blue-600 h-full" style={{ width: '62%' }} title="Оборудование: 62%" />
                <div className="bg-amber-500 h-full" style={{ width: '21%' }} title="Инжиниринг: 21%" />
                <div className="bg-emerald-500 h-full" style={{ width: '17%' }} title="Сервис: 17%" />
              </div>
            </div>

            {/* Right Status Badge */}
            <div className="xl:col-span-3 min-w-0 xl:text-right pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100 dark:border-slate-800 flex xl:flex-col justify-between items-center xl:items-end gap-1">
              <span className="text-xs text-slate-500 whitespace-nowrap">Активных сделок в пайплайне:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm sm:text-base bg-slate-100 dark:bg-slate-800 px-4 py-1 rounded-lg mt-0.5 whitespace-nowrap">
                {pipelineMetrics.dealsCount} проектов
              </span>
            </div>
          </div>
        </div>

        {/* BLOCK 2: TOTAL PIPELINE VALUE (Full-width Rounded Rectangle) */}
        <div id="card-metric-lead-conversion" className="w-full bg-white dark:bg-slate-900 rounded-lg p-5 sm:p-6 border-2 border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 items-center">
            {/* Header & Category */}
            <div className="flex items-center gap-3.5 xl:col-span-3 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Target className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                    Объем воронки сделок
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 inline-flex items-center gap-0.5 shrink-0">
                    <ArrowUpRight className="w-3 h-3" />
                    {pipelineMetrics.growthRate}
                  </span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  В деньгах
                </div>
              </div>
            </div>

            {/* KPI Metric Value */}
            <div className="xl:col-span-2 min-w-0">
              <div id="metric-conversion-rate-number" className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight leading-none">
                {formatRub(pipelineMetrics.total)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Взвешенный прогноз:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatRub(pipelineMetrics.weighted)}
                </span>
              </div>
            </div>

            {/* Micro Conversion Steps */}
            <div className="xl:col-span-4 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex sm:flex-col justify-between items-center sm:items-start p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase truncate w-full">ТКП подготовка</div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">63.3%</div>
              </div>
              <div className="flex sm:flex-col justify-between items-center sm:items-start p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase truncate w-full">Демо / Замеры</div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">43.3%</div>
              </div>
              <div className="flex sm:flex-col justify-between items-center sm:items-start p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase truncate w-full">Выигрыш (Won)</div>
                <div className="text-xs font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{conversionMetrics.overallRate}%</div>
              </div>
            </div>

            {/* Right Status Badge */}
            <div className="xl:col-span-3 min-w-0 xl:text-right pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100 dark:border-slate-800 flex xl:flex-col justify-between items-center xl:items-end gap-1">
              <span className="text-xs text-slate-500 whitespace-nowrap">Средний цикл сделки:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm sm:text-base bg-slate-100 dark:bg-slate-800 px-4 py-1 rounded-lg mt-0.5 whitespace-nowrap">
                {conversionMetrics.averageSalesCycleDays} раб. дней
              </span>
            </div>
          </div>
        </div>

        {/* BLOCK 3: CONVERSION RATE (Full-width Rounded Rectangle) */}
        <div id="card-metric-recent-requests" className="w-full bg-white dark:bg-slate-900 rounded-lg p-5 sm:p-6 border-2 border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 items-center">
            {/* Header & Category */}
            <div className="flex items-center gap-3.5 xl:col-span-3 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Zap className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                    Конверсия лидов в контракты
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 inline-flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    SLA: ≤ 15 мин
                  </span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  Эффективность
                </div>
              </div>
            </div>

            {/* KPI Metric Value */}
            <div className="xl:col-span-2 min-w-0">
              <div id="metric-recent-requests-number" className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight leading-none">
                {conversionMetrics.overallRate}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Повторные заказчики (30 лет):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {conversionMetrics.repeatBusinessRate}%
                </span>
              </div>
            </div>

            {/* Micro Conversion Steps */}
            <div className="xl:col-span-4 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex sm:flex-col justify-between items-center sm:items-start p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase truncate w-full">ТКП подготовка</div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">63.3%</div>
              </div>
              <div className="flex sm:flex-col justify-between items-center sm:items-start p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase truncate w-full">Демо / Замеры</div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">43.3%</div>
              </div>
              <div className="flex sm:flex-col justify-between items-center sm:items-start p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase truncate w-full">Выигрыш (Won)</div>
                <div className="text-xs font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{conversionMetrics.overallRate}%</div>
              </div>
            </div>

            {/* Right Status Badge */}
            <div className="xl:col-span-3 min-w-0 xl:text-right pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100 dark:border-slate-800 flex xl:flex-col justify-between items-center xl:items-end gap-1">
              <span className="text-xs text-slate-500 whitespace-nowrap">Среднее время ответа:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300 font-mono text-xs sm:text-sm bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-4 py-1.5 rounded-lg inline-flex items-center gap-1 mt-0.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                11 мин (Норматив)
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. VISUALIZATION SECTION (Total Pipeline Dynamics + Conversion Stages) */}
      <div id="crm-dashboard-charts-grid" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* CHART 1: Total Pipeline Value Trend (2 cols) */}
        <div id="chart-pipeline-trend-container" className="xl:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-lg border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Динамика объема воронки и выручки по контрактам
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Сравнение суммарного пайплайна (млн ₽), взвешенной вероятности и закрытых договоров
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
                Пайплайн
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                Выиграно
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="M" />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    const formatted = `${value} млн ₽`;
                    if (name === 'pipeline') return [formatted, 'Объем воронки (Pipeline)'];
                    if (name === 'won') return [formatted, 'Подписанные контракты (Won)'];
                    if (name === 'weighted') return [formatted, 'Взвешенный пайплайн'];
                    return [value, name];
                  }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="pipeline" fill="#3b82f6" fillOpacity={0.15} stroke="#3b82f6" strokeWidth={2} name="pipeline" />
                <Bar dataKey="won" fill="#10b981" radius={[6, 6, 0, 0]} barSize={26} name="won" />
                <Line type="monotone" dataKey="weighted" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="weighted" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Lead Conversion Funnel (1 col) */}
        <div id="chart-conversion-funnel-container" className="bg-white dark:bg-slate-900 p-6 rounded-lg border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              Воронка конверсии этапов
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              От квалификации лида до сдачи ПНР КИМ
            </p>
          </div>

          {/* Stepped Funnel Bar UI */}
          <div className="space-y-3 pt-1">
            {conversionFunnelData.map((item, idx) => (
              <div key={item.stage} className="space-y-1">
                <div className="flex justify-between items-center text-xs gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-0 flex-1 leading-snug">
                    {item.stage}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 whitespace-nowrap">
                    {item.count} лидов ({item.rate})
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: item.rate,
                      backgroundColor: item.fill
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
            💡 <b>Инсайт конверсии:</b> Наибольшая конверсия достигается после очной демонстрации и технического замера деталей заказчика (переход в контракт 65.4%).
          </div>
        </div>

      </div>

      {/* 5. 30-YEAR LEGACY BUSINESS PERFORMANCE SECTION */}
      <div id="crm-dashboard-30year-legacy" className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-lg border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <History className="w-4 h-4" />
              Ретроспективный анализ 30-летней истории (1994–2026)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Эволюция технологических направлений и парка внедренного оборудования
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              От единичных поставок контактных КИМ в 1990-х до создания федеральной сети координатно-измерительных машин, 3D-сканеров и САПР TopSolid 7
            </p>
          </div>
        </div>

        {/* 4 Decades Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {legacyDecadeData.map((d, index) => (
            <div
              key={d.period}
              id={`legacy-milestone-${index}`}
              className="p-5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {d.period}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    Этап #{index + 1}
                  </span>
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {d.label}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                  {d.focus}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Оснащено заводов:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{d.plantsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Поставлено машин:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{d.machinesDelivered} ед.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Поверок & ТО:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{d.calibrationsCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Industry Portfolios Bar */}
        <div className="bg-slate-900 text-white rounded-lg p-5 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Отраслевая структура заказчиков</div>
              <div className="text-sm font-black text-white">Доли ключевых секторов промышленности в 30-летнем портфеле</div>
            </div>
            <div className="text-xs text-slate-400">
              База: 1 240+ корпоративных контрактов
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">Авиадвигатели & Космос</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">38%</div>
              <div className="text-[11px] text-slate-400">ОДК, Климов, Кузнецов</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">Тяжелое машиностроение & ВПК</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">29%</div>
              <div className="text-[11px] text-slate-400">Ростех, УЗГА, КАМАЗ</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">Энергетика & Турбины</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">18%</div>
              <div className="text-[11px] text-slate-400">Силовые Машины, Газпром</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400">Автопром & Спецтехника</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">15%</div>
              <div className="text-[11px] text-slate-400">АвтоВАЗ, ГАЗ, НАМИ</div>
            </div>
          </div>
        </div>
      </div>

      {/* FGIS ARSHIN VERIFICATION MONITORING WIDGET */}
      <ArshinVerificationWidget onOpenFullSchedule={onNavigateToSchedule} />

      {/* 6. RECENT REQUESTS DETAILED TABLE & FEED */}
      <div id="crm-dashboard-recent-requests-table" className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden w-full">
        
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Recent Requests: Реестр последних входящих запросов
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {recentRequests.length} заявок
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Обработка обращений дежурными инженерами по стандарту SLA (до 15 минут с момента фиксации на сайте)
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="input-crm-dashboard-search"
                type="text"
                placeholder="Поиск по компании, теме, тел..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <select
              id="select-crm-requests-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Фильтр статуса SLA"
              className="w-full sm:w-auto text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Все статусы SLA</option>
              <option value="urgent">Срочные (требуют звонка)</option>
              <option value="responded">Обработано дежурным</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          <table className="w-full data-dense-table text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-4.5 py-2.5 whitespace-nowrap">ID & Дата</th>
                <th className="px-4.5 py-2.5">Заказчик & Предприятие</th>
                <th className="px-4.5 py-2.5">Тематика / Оборудование</th>
                <th className="px-4.5 py-2.5 whitespace-nowrap">Источник</th>
                <th className="px-4.5 py-2.5 text-right whitespace-nowrap">Оценка суммы</th>
                <th className="px-4.5 py-2.5 text-center whitespace-nowrap">SLA Статус</th>
                <th className="px-4.5 py-2.5 text-right whitespace-nowrap">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    По заданным критериям запросов не обнаружено. Измените параметры фильтра.
                  </td>
                </tr>
              ) : (
                recentRequests.map((req) => (
                  <tr
                    key={req.id}
                    id={`request-row-${req.id}`}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* ID & Date */}
                    <td className="px-4.5 py-2.5 align-top font-mono whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{req.id}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {req.createdAt}
                      </div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                        Отв: {req.manager}
                      </div>
                    </td>

                    {/* Customer & Company */}
                    <td className="px-4.5 py-2.5 align-top max-w-[200px]">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {req.companyName}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate">
                        {req.customerName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <a
                          id={`call-link-${req.id}`}
                          href={`tel:${req.phone.replace(/[^+\d]/g, '')}`}
                          className="font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          {req.phone}
                        </a>
                        <button
                          id={`btn-copy-phone-${req.id}`}
                          type="button"
                          onClick={() => handleCopyPhone(req.phone, req.id)}
                          title="Скопировать телефон"
                          className="text-slate-400 hover:text-slate-500 transition-colors cursor-pointer"
                        >
                          {copiedPhoneId === req.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Topic & Stage */}
                    <td className="px-4.5 py-2.5 align-top max-w-[220px]">
                      <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                        {req.topic}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Этап:</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 text-[10px]">
                          {req.dealStage}
                        </span>
                      </div>
                    </td>

                    {/* Source Badge */}
                    <td className="px-4.5 py-2.5 align-top whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${req.sourceBadgeColor}`}>
                        {req.sourceLabel}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {req.funnelLabel}
                      </div>
                    </td>

                    {/* Estimated Price */}
                    <td className="px-4.5 py-2.5 align-top text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatFullRub(req.estimatedPrice)}
                    </td>

                    {/* SLA Status */}
                    <td className="px-4.5 py-2.5 align-top text-center whitespace-nowrap">
                      {req.slaStatus === 'urgent' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          {req.slaMinutesLeft > 0 ? `Осталось ${req.slaMinutesLeft} мин` : 'Просрочен SLA'}
                        </span>
                      )}
                      {req.slaStatus === 'ok' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          {req.slaMinutesLeft} мин в запасе
                        </span>
                      )}
                      {req.slaStatus === 'responded' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Обработан
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4.5 py-2.5 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          id={`btn-action-call-${req.id}`}
                          href={`tel:${req.phone.replace(/[^+\d]/g, '')}`}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          title="Позвонить сейчас"
                        >
                          <Phone className="w-3 h-3" />
                          <span className="hidden sm:inline">Звонок</span>
                        </a>
                        <button
                          id={`btn-action-view-${req.id}`}
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Открыть карточку"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Показано {recentRequests.length} запросов из реестра входящих лидов
          </div>
          <div className="flex items-center gap-3">
            <span>Сумма отображаемых запросов:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {formatFullRub(recentRequests.reduce((acc, curr) => acc + curr.estimatedPrice, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* 7. MODAL: DETAILED REQUEST INSPECTION */}
      {selectedRequest && (
        <div id="modal-request-details" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-xl w-full p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border mb-2 ${selectedRequest.sourceBadgeColor}`}>
                  {selectedRequest.sourceLabel}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Карточка запроса {selectedRequest.id}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Поступил: {selectedRequest.createdAt}
                </p>
              </div>
              <button
                id="btn-close-modal-request"
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-slate-400 hover:text-slate-500 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Предприятие:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedRequest.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Контактное лицо:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedRequest.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Телефон:</span>
                  <span className="font-bold font-mono text-blue-600">{selectedRequest.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{selectedRequest.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Содержание запроса / Оборудование:</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg font-medium text-slate-800 dark:text-slate-200">
                  {selectedRequest.topic}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900">
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold block">Оценка суммы контракта:</span>
                  <span className="text-base font-black text-blue-900 dark:text-white font-mono">
                    {formatFullRub(selectedRequest.estimatedPrice)}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">Назначенный инженер:</span>
                  <span className="text-base font-bold text-emerald-900 dark:text-white">
                    {selectedRequest.manager}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
              >
                Закрыть
              </button>
              <a
                href={`tel:${selectedRequest.phone.replace(/[^+\d]/g, '')}`}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Позвонить заказчику</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Executive CRM Summary Print & Export Modal */}
      <CrmPrintSummaryModal
        isOpen={isPrintSummaryOpen}
        onClose={() => setIsPrintSummaryOpen(false)}
        periodLabel={
          period === 'month' ? 'Текущий месяц' :
          period === 'quarter' ? 'Текущий квартал' :
          period === 'year' ? 'Текущий год (2026)' : 'За 30 лет практики (1995-2026)'
        }
        totalPipelineRub={pipelineMetrics.total}
        activeDealsCount={pipelineMetrics.dealsCount}
        totalMachinesCount={285}
        totalPlantsCount={1240}
        recentRequests={recentRequests}
      />

    </div>
  );
};
