import { HorizontalScrollContainer } from '../common/HorizontalScrollContainer';
import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  CartesianGrid,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  Filter, 
  Download, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PieChart as PieIcon, 
  BarChart3, 
  Layers, 
  Calendar, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  HelpCircle,
  UserCheck,
  User,
  Briefcase
} from 'lucide-react';
import { ExtendedDeal } from '../../data/mockCrmData';
import { FunnelConfig } from './CrmPanel';
import { useApp } from '../../context/AppContext';

interface AnalyticsPipelineViewProps {
  deals: ExtendedDeal[];
  funnelConfigs: Record<'services' | 'equipment' | 'support', FunnelConfig>;
}

const LOSS_PALETTE = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#64748b', // Slate
  '#06b6d4', // Cyan
];

const STAGE_COLORS: Record<string, string> = {
  lead: '#3b82f6',
  audit: '#6366f1',
  tender: '#06b6d4',
  demo: '#a855f7',
  contract: '#f59e0b',
  logistics: '#f97316',
  implementation: '#14b8a6',
  closed_won: '#10b981',
  completed: '#10b981',
  new: '#f59e0b',
  estimate: '#3b82f6',
  nda: '#8b5cf6',
  cross_sell: '#6366f1',
  ticket: '#3b82f6',
  diagnostics: '#6366f1',
  maintenance: '#f59e0b',
  resolution: '#14b8a6',
  lost: '#ef4444'
};

export const AnalyticsPipelineView: React.FC<AnalyticsPipelineViewProps> = ({ deals, funnelConfigs }) => {
  const { showToast, authUsers, currentUser } = useApp();

  const [selectedFunnel, setSelectedFunnel] = useState<'all' | 'equipment' | 'services' | 'support'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '2026' | 'q3_2026' | 'month'>('all');
  const [selectedManager, setSelectedManager] = useState<string>('all');

  // Dynamic Manager List including General Director (superadmin) and staff
  const availableManagersList = useMemo(() => {
    const staffUsers = (authUsers || []).filter(u => u.role === 'superadmin' || u.role === 'admin' || u.role === 'manager');
    if (staffUsers.length === 0) {
      return [
        { id: 'usr-nekrasov', value: 'Некрасов С.Ю.', shortName: 'Некрасов С.Ю.', fullName: 'Некрасов Сергей Юрьевич', label: 'Некрасов С.Ю. (Генеральный директор)', position: 'Генеральный директор', isDirector: true },
        { id: 'usr-skobelev', value: 'Скобелев А.С.', shortName: 'Скобелев А.С.', fullName: 'Скобелев Александр Сергеевич', label: 'Скобелев А.С. (Инженер по ПО, ЧПУ и CAD-моделированию)', position: 'Инженер по ПО, ЧПУ и CAD-моделированию', isDirector: false },
        { id: 'usr-yarysh-ivan', value: 'Ярыш И.В.', shortName: 'Ярыш И.В.', fullName: 'Ярыш Иван Владимирович', label: 'Ярыш И.В. (Инженер-метролог)', position: 'Инженер-метролог', isDirector: false },
        { id: 'usr-yarysh-alex', value: 'Ярыш А.В.', shortName: 'Ярыш А.В.', fullName: 'Ярыш Александр Владимирович', label: 'Ярыш А.В. (Инженер по подбору оборудования и ПО)', position: 'Инженер по подбору оборудования и ПО', isDirector: false },
        { id: 'usr-morozov', value: 'Морозов В.Г.', shortName: 'Морозов В.Г.', fullName: 'Морозов Владимир Георгиевич', label: 'Морозов В.Г. (Руководитель КТО)', position: 'Руководитель КТО', isDirector: false },
      ];
    }

    const list = staffUsers.map(u => {
      const parts = u.fullName.trim().split(/\s+/);
      const shortName = parts.length >= 3 ? `${parts[0]} ${parts[1][0]}.${parts[2][0]}.` : parts.length === 2 ? `${parts[0]} ${parts[1][0]}.` : u.fullName;
      const isDir = u.role === 'superadmin';
      let title = shortName;
      if (isDir) {
        title = `${shortName} (Генеральный директор / Стратегические проекты)`;
      } else if (u.position) {
        title = `${shortName} (${u.position})`;
      } else {
        title = `${shortName} (${u.role === 'admin' ? 'Администратор' : 'Менеджер'})`;
      }
      return {
        id: u.id,
        value: shortName,
        shortName,
        fullName: u.fullName,
        label: title,
        position: u.position || (isDir ? 'Генеральный директор' : 'Менеджер'),
        isDirector: isDir
      };
    });

    // Ensure General Director is at the very top of the managers list
    return list.sort((a, b) => (b.isDirector ? 1 : 0) - (a.isDirector ? 1 : 0));
  }, [authUsers]);

  // Current logged in user helper for Quick "My Analytics" filter
  const currentStaffKey = useMemo(() => {
    if (!currentUser) return 'Некрасов С.Ю.';
    const parts = currentUser.fullName?.trim().split(/\s+/) || [];
    const short = parts.length >= 3 ? `${parts[0]} ${parts[1][0]}.${parts[2][0]}.` : parts[0] || 'Некрасов С.Ю.';
    return short;
  }, [currentUser]);

  const currentStaffObj = useMemo(() => {
    const keyLower = currentStaffKey.toLowerCase();
    return availableManagersList.find(m => 
      m.value.toLowerCase() === keyLower || 
      m.shortName.toLowerCase() === keyLower ||
      (currentUser?.id && m.id === currentUser.id)
    ) 
      || availableManagersList.find(m => m.isDirector) 
      || availableManagersList[0];
  }, [availableManagersList, currentStaffKey, currentUser]);

  const isCurrentManagerSelected = selectedManager !== 'all' && (
    (Boolean(currentStaffObj?.value) && selectedManager.toLowerCase() === currentStaffObj!.value.toLowerCase()) ||
    (Boolean(currentStaffObj?.shortName) && selectedManager.toLowerCase() === currentStaffObj!.shortName.toLowerCase())
  );

  const handleToggleMyAnalytics = () => {
    if (isCurrentManagerSelected) {
      setSelectedManager('all');
      showToast('Отображена общая сводная аналитика компании');
    } else {
      const targetVal = currentStaffObj?.value || 'Некрасов С.Ю.';
      setSelectedManager(targetVal);
      showToast(`Персональный срез: ${currentStaffObj?.shortName || targetVal} (${currentStaffObj?.isDirector ? 'Генеральный директор' : 'Менеджер'})`);
    }
  };

  // Filtered Deals calculation
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      // Funnel filter
      if (selectedFunnel !== 'all' && deal.funnel !== selectedFunnel) {
        return false;
      }
      // Manager filter
      if (selectedManager !== 'all') {
        const mgr = (deal.responsibleManager || deal.createdByManager || '').toLowerCase();
        const sel = selectedManager.toLowerCase();
        const targetObj = availableManagersList.find(m => m.value.toLowerCase() === sel || m.shortName.toLowerCase() === sel);
        
        let isMatch = mgr.includes(sel);
        if (!isMatch && targetObj) {
          if (targetObj.shortName && mgr.includes(targetObj.shortName.toLowerCase())) isMatch = true;
          if (targetObj.fullName && mgr.includes(targetObj.fullName.toLowerCase())) isMatch = true;
          const parts = (targetObj.fullName || targetObj.shortName || '').split(/\s+/);
          if (parts.length >= 2) {
            const lastName = parts[0].toLowerCase();
            const firstInitial = parts[1][0].toLowerCase();
            if (mgr.includes(lastName) && mgr.includes(firstInitial)) isMatch = true;
          }
        }
        if (!isMatch) return false;
      }
      // Period filter (mocked date filtering based on deal createdAt)
      if (selectedPeriod === 'month') {
        const created = new Date(deal.createdAt || Date.now());
        const now = new Date();
        if (created.getMonth() !== now.getMonth() || created.getFullYear() !== now.getFullYear()) {
          // Allow August/September 2026 for rich mock demonstration
          const isAugSept2026 = created.getFullYear() === 2026 && (created.getMonth() === 7 || created.getMonth() === 8);
          if (!isAugSept2026) return false;
        }
      } else if (selectedPeriod === 'q3_2026') {
        const created = new Date(deal.createdAt || Date.now());
        const month = created.getMonth(); // 6,7,8 = Q3
        if (created.getFullYear() !== 2026 || (month < 6 || month > 8)) {
          return false;
        }
      } else if (selectedPeriod === '2026') {
        const created = new Date(deal.createdAt || Date.now());
        if (created.getFullYear() !== 2026) return false;
      }
      return true;
    });
  }, [deals, selectedFunnel, selectedPeriod, selectedManager]);

  // High-Level KPIs
  const kpis = useMemo(() => {
    let totalVolume = 0;
    let weightedRevenue = 0;
    let wonVolume = 0;
    let wonCount = 0;
    let lostVolume = 0;
    let lostCount = 0;
    let activeCount = 0;

    filteredDeals.forEach(deal => {
      const price = deal.estimatedPrice || 0;
      totalVolume += price;

      const funnelCfg = funnelConfigs[deal.funnel];
      const stageObj = funnelCfg?.stages.find(s => s.id === deal.stage);
      const winRate = stageObj ? stageObj.winRate : (deal.stage === 'closed_won' || deal.stage === 'completed' ? 100 : (deal.stage === 'lost' ? 0 : 30));

      if (deal.stage === 'closed_won' || deal.stage === 'completed') {
        wonVolume += price;
        wonCount++;
      } else if (deal.stage === 'lost') {
        lostVolume += price;
        lostCount++;
      } else {
        activeCount++;
        weightedRevenue += (price * winRate) / 100;
      }
    });

    const totalResolved = wonCount + lostCount;
    const winRatePercent = totalResolved > 0 ? Math.round((wonCount / totalResolved) * 100) : (filteredDeals.length > 0 ? Math.round((wonCount / filteredDeals.length) * 100) : 0);
    const avgCheck = wonCount > 0 ? Math.round(wonVolume / wonCount) : (filteredDeals.length > 0 ? Math.round(totalVolume / filteredDeals.length) : 0);

    return {
      totalVolume,
      weightedRevenue: Math.round(weightedRevenue + wonVolume),
      wonVolume,
      wonCount,
      lostVolume,
      lostCount,
      activeCount,
      totalCount: filteredDeals.length,
      winRatePercent,
      avgCheck,
      avgCycleDays: 19 // Average engineering deal cycle (benchmark)
    };
  }, [filteredDeals, funnelConfigs]);

  // 1. Conversion Funnel Data (Aggregated by stages)
  const funnelStagesData = useMemo(() => {
    if (selectedFunnel === 'all') {
      // General stages aggregation
      const stagesMap: Record<string, { label: string; count: number; volume: number; color: string; order: number }> = {
        '1_lead': { label: '1. Лид / Первичный запрос', count: 0, volume: 0, color: '#3b82f6', order: 1 },
        '2_audit': { label: '2. Тех. аудит и Оценка ТЗ', count: 0, volume: 0, color: '#6366f1', order: 2 },
        '3_tender_nda': { label: '3. ТКП / NDA / Методика', count: 0, volume: 0, color: '#06b6d4', order: 3 },
        '4_demo_contract': { label: '4. Демо / Договор / Аванс', count: 0, volume: 0, color: '#f59e0b', order: 4 },
        '5_implementation': { label: '5. Внедрение / Поставка / Работы', count: 0, volume: 0, color: '#14b8a6', order: 5 },
        '6_won': { label: '6. Закрыто / Сдано (Успех)', count: 0, volume: 0, color: '#10b981', order: 6 },
        '7_lost': { label: 'Отказ / Архив', count: 0, volume: 0, color: '#ef4444', order: 7 }
      };

      filteredDeals.forEach(d => {
        const p = d.estimatedPrice || 0;
        if (d.stage === 'lead' || d.stage === 'new' || d.stage === 'ticket') {
          stagesMap['1_lead'].count++;
          stagesMap['1_lead'].volume += p;
        } else if (d.stage === 'audit' || d.stage === 'estimate' || d.stage === 'diagnostics') {
          stagesMap['2_audit'].count++;
          stagesMap['2_audit'].volume += p;
        } else if (d.stage === 'tender' || d.stage === 'nda') {
          stagesMap['3_tender_nda'].count++;
          stagesMap['3_tender_nda'].volume += p;
        } else if (d.stage === 'demo' || d.stage === 'contract' || d.stage === 'maintenance') {
          stagesMap['4_demo_contract'].count++;
          stagesMap['4_demo_contract'].volume += p;
        } else if (d.stage === 'logistics' || d.stage === 'implementation' || d.stage === 'cross_sell' || d.stage === 'resolution') {
          stagesMap['5_implementation'].count++;
          stagesMap['5_implementation'].volume += p;
        } else if (d.stage === 'closed_won' || d.stage === 'completed') {
          stagesMap['6_won'].count++;
          stagesMap['6_won'].volume += p;
        } else if (d.stage === 'lost') {
          stagesMap['7_lost'].count++;
          stagesMap['7_lost'].volume += p;
        }
      });

      return Object.values(stagesMap).sort((a, b) => a.order - b.order);
    } else {
      // Specific funnel stages
      const cfg = funnelConfigs[selectedFunnel];
      return cfg.stages.map((st, idx) => {
        const stageDeals = filteredDeals.filter(d => {
          if (st.id === 'lost') return d.stage === 'lost';
          if (st.id === 'closed_won' || st.id === 'completed') {
            return d.stage === 'closed_won' || d.stage === 'completed';
          }
          return d.stage === st.id;
        });

        const volume = stageDeals.reduce((sum, d) => sum + (d.estimatedPrice || 0), 0);
        return {
          label: st.shortLabel || st.label,
          count: stageDeals.length,
          volume,
          color: STAGE_COLORS[st.id] || '#3b82f6',
          order: idx + 1
        };
      });
    }
  }, [filteredDeals, selectedFunnel, funnelConfigs]);

  // 2. Loss Reasons Distribution
  const lossReasonsData = useMemo(() => {
    const lostDeals = filteredDeals.filter(d => d.stage === 'lost');
    const reasonsMap: Record<string, { name: string; count: number; volume: number }> = {};

    lostDeals.forEach(d => {
      let r = d.lossReason || 'Причина не указана';
      // Normalize common reason strings
      if (r.includes(':')) {
        r = r.split(':')[0].trim();
      }
      if (!reasonsMap[r]) {
        reasonsMap[r] = { name: r, count: 0, volume: 0 };
      }
      reasonsMap[r].count++;
      reasonsMap[r].volume += d.estimatedPrice || 0;
    });

    // If no lost deals yet, provide illustrative baseline categories
    if (Object.keys(reasonsMap).length === 0) {
      return [
        { name: 'Выбран дешевый аналог', count: 3, volume: 4500000 },
        { name: 'Перенос бюджета заказчика', count: 2, volume: 3200000 },
        { name: 'Заморозка проекта', count: 1, volume: 1800000 },
        { name: 'Сроки поставки превышают ТЗ', count: 1, volume: 950000 },
      ];
    }

    return Object.values(reasonsMap).sort((a, b) => b.volume - a.volume);
  }, [filteredDeals]);

  // 3. Monthly Revenue Trend & Forecast (Area Chart)
  const monthlyRevenueData = useMemo(() => {
    const months = [
      { name: 'Апр 26', won: 4200000, forecast: 6800000, lost: 1100000 },
      { name: 'Май 26', won: 7500000, forecast: 8900000, lost: 1800000 },
      { name: 'Июн 26', won: 6100000, forecast: 9400000, lost: 2400000 },
      { name: 'Июл 26', won: 8900000, forecast: 11500000, lost: 1500000 },
      { name: 'Авг 26', won: 12400000, forecast: 15800000, lost: 2200000 },
      { name: 'Сен 26 (План)', won: kpis.wonVolume > 0 ? kpis.wonVolume : 9800000, forecast: kpis.weightedRevenue > 0 ? kpis.weightedRevenue : 18600000, lost: kpis.lostVolume > 0 ? kpis.lostVolume : 3100000 }
    ];
    return months;
  }, [kpis]);

  // 4. Engineers Workload & Performance
  const engineersPerformance = useMemo(() => {
    const engMap: Record<string, { name: string; position: string; wonSum: number; wonCount: number; activeSum: number; activeCount: number; lostCount: number }> = {
      'Некрасов С.Ю.': { name: 'Некрасов С.Ю.', position: 'Генеральный директор', wonSum: 0, wonCount: 0, activeSum: 0, activeCount: 0, lostCount: 0 },
      'Скобелев А.С.': { name: 'Скобелев А.С.', position: 'Инженер по ПО, ЧПУ и CAD-моделированию', wonSum: 0, wonCount: 0, activeSum: 0, activeCount: 0, lostCount: 0 },
      'Ярыш И.В.': { name: 'Ярыш И.В.', position: 'Инженер-метролог', wonSum: 0, wonCount: 0, activeSum: 0, activeCount: 0, lostCount: 0 },
      'Ярыш А.В.': { name: 'Ярыш А.В.', position: 'Инженер по подбору оборудования и ПО', wonSum: 0, wonCount: 0, activeSum: 0, activeCount: 0, lostCount: 0 },
      'Морозов В.Г.': { name: 'Морозов В.Г.', position: 'Руководитель КТО', wonSum: 0, wonCount: 0, activeSum: 0, activeCount: 0, lostCount: 0 },
    };

    // Dynamically add any additional staff users from authUsers
    (authUsers || []).forEach(u => {
      if (u.role === 'superadmin' || u.role === 'admin' || u.role === 'manager') {
        const parts = u.fullName.trim().split(/\s+/);
        const shortName = parts.length >= 3 ? `${parts[0]} ${parts[1][0]}.${parts[2][0]}.` : parts.length === 2 ? `${parts[0]} ${parts[1][0]}.` : u.fullName;
        if (!engMap[shortName]) {
          engMap[shortName] = {
            name: shortName,
            position: u.position || (u.role === 'superadmin' ? 'Генеральный директор' : 'Менеджер'),
            wonSum: 0,
            wonCount: 0,
            activeSum: 0,
            activeCount: 0,
            lostCount: 0
          };
        }
      }
    });

    filteredDeals.forEach(d => {
      const mgr = d.responsibleManager || d.createdByManager || 'Скобелев А.С.';
      let key = 'Скобелев А.С.';
      if (mgr.includes('Некрасов')) key = 'Некрасов С.Ю.';
      else if (mgr.includes('Ярыш И.') || mgr.includes('Ярыш Иван')) key = 'Ярыш И.В.';
      else if (mgr.includes('Ярыш А.') || mgr.includes('Ярыш Александр')) key = 'Ярыш А.В.';
      else if (mgr.includes('Морозов')) key = 'Морозов В.Г.';
      else if (mgr.includes('Скобелев')) key = 'Скобелев А.С.';
      else {
        const found = Object.keys(engMap).find(k => mgr.includes(k.split(' ')[0]));
        if (found) key = found;
      }

      if (engMap[key]) {
        const price = d.estimatedPrice || 0;
        if (d.stage === 'closed_won' || d.stage === 'completed') {
          engMap[key].wonSum += price;
          engMap[key].wonCount++;
        } else if (d.stage === 'lost') {
          engMap[key].lostCount++;
        } else {
          engMap[key].activeSum += price;
          engMap[key].activeCount++;
        }
      }
    });

    return Object.values(engMap).sort((a, b) => (b.wonSum + b.activeSum) - (a.wonSum + a.activeSum));
  }, [filteredDeals, authUsers]);

  // Export Full Analytical Report to Excel (XLSX)
  const exportFullExcelReport = async () => {
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      // Sheet 1: General Summary
      const summaryData = [
        ['ООО «ДС‑ИНЖИНИРИНГ» — АНАЛИТИЧЕСКИЙ ОТЧЕТ CRM И ВОРОНОК ПРОДАЖ'],
        ['Дата формирования отчета:', new Date().toLocaleString('ru-RU')],
        ['Выбранная воронка:', selectedFunnel === 'all' ? 'Все направления' : funnelConfigs[selectedFunnel]?.name],
        ['Период:', selectedPeriod],
        [''],
        ['КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ (KPI)', 'ЗНАЧЕНИЕ'],
        ['Общий объем пайплайна (все сделки)', `${kpis.totalVolume.toLocaleString('ru-RU')} ₽`],
        ['Взвешенный прогноз поступлений (Weighted Pipeline)', `${kpis.weightedRevenue.toLocaleString('ru-RU')} ₽`],
        ['Выиграно / Поставлено (Closed Won)', `${kpis.wonVolume.toLocaleString('ru-RU')} ₽ (${kpis.wonCount} сделок)`],
        ['Упущенная выгода / Отказы (Lost)', `${kpis.lostVolume.toLocaleString('ru-RU')} ₽ (${kpis.lostCount} сделок)`],
        ['Конверсия воронки (Win Rate)', `${kpis.winRatePercent}%`],
        ['Средний чек сделки', `${kpis.avgCheck.toLocaleString('ru-RU')} ₽`],
        ['Сделок в активной работе', `${kpis.activeCount} шт.`]
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Сводка KPI');

      // Sheet 2: Deals Register
      const dealsRows = filteredDeals.map(d => ({
        'ID Сделки': d.id,
        'Воронка': funnelConfigs[d.funnel]?.name || d.funnel,
        'Компания заказчика': d.companyName || 'Не указано',
        'ИНН': d.inn || '',
        'Контактное лицо': d.customerName,
        'Телефон': d.phone,
        'Email': d.email,
        'Этап': d.stage,
        'Сумма сделки (₽)': d.estimatedPrice || 0,
        'Куратор / Инженер': d.responsibleManager || d.createdByManager || '',
        'Причина отказа (если есть)': d.lossReason || '',
        'Дата создания': d.createdAt ? new Date(d.createdAt).toLocaleDateString('ru-RU') : ''
      }));
      const wsDeals = XLSX.utils.json_to_sheet(dealsRows);
      XLSX.utils.book_append_sheet(wb, wsDeals, 'Реестр сделок');

      // Sheet 3: Engineers Matrix
      const engRows = engineersPerformance.map(e => ({
        'Инженер / Куратор': e.name,
        'Специализация': e.position,
        'Закрыто (руб)': e.wonSum,
        'Закрыто (шт)': e.wonCount,
        'В работе (руб)': e.activeSum,
        'В работе (шт)': e.activeCount,
        'Отказов (шт)': e.lostCount,
        'Всего пайплайн (руб)': e.wonSum + e.activeSum
      }));
      const wsEng = XLSX.utils.json_to_sheet(engRows);
      XLSX.utils.book_append_sheet(wb, wsEng, 'KPI Инженеров');

      // Save file
      XLSX.writeFile(wb, `DS_Engineering_CRM_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast('Аналитический отчет успешно выгружен в Excel (.xlsx)');
    } catch (err) {
      console.error('Failed to export analytics excel', err);
      showToast('Ошибка при формировании отчета Excel');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Title Area */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <PieIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Сквозная аналитика и KPI
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Контроль пайплайна продаж, конверсий и метрик эффективности менеджеров
              </p>
            </div>
          </div>

          {/* Filters Area */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Funnel */}
            <select
              value={selectedFunnel}
              onChange={(e) => setSelectedFunnel(e.target.value as any)}
              className="px-4 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
            >
              <option value="all">Все воронки продаж</option>
              <option value="equipment">Оборудование и ПО (КИМ)</option>
              <option value="services">Услуги</option>
              <option value="support">Техподдержка и ТО</option>
            </select>
            {/* Period */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
            >
              <option value="all">За все время</option>
              <option value="2026">2026 год (Годовой срез)</option>
              <option value="q3_2026">3-й квартал 2026</option>
              <option value="month">Текущий месяц</option>
            </select>
            {/* Manager */}
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="px-4 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
            >
              <option value="all">Все сотрудники</option>
              {availableManagersList.map((m, idx) => (
                <option key={`${m.value}_${m.id || idx}`} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            
            <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1"></div>

            {/* Quick My Analytics Toggle */}
            <button
              type="button"
              onClick={handleToggleMyAnalytics}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border w-full sm:w-auto justify-center ${
                isCurrentManagerSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-500 hover:text-blue-700 border-gray-300 hover:bg-gray-50'
              }`}
              title={isCurrentManagerSelected ? "Сбросить фильтр" : `Показать персональный срез`}
            >
              <User className={`w-4 h-4 ${isCurrentManagerSelected ? 'text-white' : 'text-blue-600'}`} />
              <span>{isCurrentManagerSelected ? 'Мои метрики' : 'Моя аналитика'}</span>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <a
                href="https://metrika.yandex.ru/stat/dashboard?id=112028524"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-white text-slate-500 border border-gray-300 hover:bg-gray-50 rounded-lg transition-all cursor-pointer w-full sm:w-auto"
                title="Открыть панель Яндекс.Метрики"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" />
                <span className="hidden sm:inline">Метрика</span>
                <span className="sm:hidden">Яндекс.Метрика</span>
              </a>
              <button
                onClick={exportFullExcelReport}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-white border border-gray-300 text-slate-500 hover:bg-gray-50 rounded-lg transition-all cursor-pointer w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Экспорт</span>
                <span className="sm:hidden">Экспорт отчета</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Personal Filter Active State */}
      {selectedManager !== 'all' && (
        <div className="bg-blue-50/80 border border-blue-200/60 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 flex-shrink-0 animate-pulse" />
            <div className="text-xs text-blue-900 font-medium">
              Персональный срез: <strong className="font-bold">{availableManagersList.find(m => m.value.toLowerCase() === selectedManager.toLowerCase())?.label || selectedManager}</strong>
              <span className="hidden md:inline mx-3 text-blue-200">|</span>
              <span className="hidden md:inline">
                Сделок: <strong>{kpis.totalCount}</strong> • Пайплайн: <strong>{kpis.totalVolume.toLocaleString('ru-RU')} ₽</strong> • Закрыто: <strong>{kpis.wonVolume.toLocaleString('ru-RU')} ₽</strong>
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedManager('all')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
          >
            Сбросить фильтр
          </button>
        </div>
      )}

      {/* 3. High-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Total Pipeline */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col justify-between group hover:border-gray-300 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Общий объем пайплайна
              </p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {kpis.totalVolume.toLocaleString('ru-RU')} <span className="text-lg font-bold text-gray-400">₽</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
              <Layers className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-500">
            <span className="text-gray-900 font-bold">{kpis.totalCount}</span> сделок в реестре
          </div>
        </div>

        {/* KPI 2: Weighted Forecast */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-blue-200 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                Взвешенный прогноз
              </p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {kpis.weightedRevenue.toLocaleString('ru-RU')} <span className="text-lg font-bold text-gray-400">₽</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-500">
            С учетом WinRate стадий
          </div>
        </div>

        {/* KPI 3: Won (Fact) */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col justify-between group hover:border-emerald-200 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                Фактическая выручка
              </p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {kpis.wonVolume.toLocaleString('ru-RU')} <span className="text-lg font-bold text-gray-400">₽</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-500 flex items-center justify-between">
            <span><span className="text-gray-900 font-bold">{kpis.wonCount}</span> успешных</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[10px]">
              WinRate {kpis.winRatePercent}%
            </span>
          </div>
        </div>

        {/* KPI 4: Lost */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col justify-between group hover:border-rose-200 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">
                Упущенная выгода
              </p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {kpis.lostVolume.toLocaleString('ru-RU')} <span className="text-lg font-bold text-gray-400">₽</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 group-hover:bg-rose-100 transition-colors">
              <XCircle className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-500">
            <span className="text-gray-900 font-bold">{kpis.lostCount}</span> сорванных сделок
          </div>
        </div>
      </div>

      {/* 4. Main Charts Row (Funnel & Loss) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Funnel Chart (8 cols) */}
        <div className="xl:col-span-8 bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Конверсия по стадиям воронки
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Анализ распределения пайплайна в денежном и количественном выражении
              </p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={funnelStagesData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="label" type="category" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} width={140} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(val: any, name: string) => [
                    name === 'Объем (₽)' ? `${Number(val).toLocaleString('ru-RU')} ₽` : `${val} шт.`,
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '10px' }} />
                <Bar dataKey="volume" name="Объем (₽)" barSize={24} radius={[0, 4, 4, 0]}>
                  {funnelStagesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loss Reasons Pie Chart (4 cols) */}
        <div className="xl:col-span-4 bg-white border border-gray-200 rounded-lg p-6 shadow-xs flex flex-col">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Причины срыва сделок
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Упущенная выручка по категориям
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center mt-6 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lossReasonsData}
                  dataKey="volume"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {lossReasonsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={LOSS_PALETTE[index % LOSS_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${(Number(val) / 1000000).toFixed(1)} млн ₽`, 'Потери']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2.5 max-h-40 overflow-y-auto pr-1 border-t border-gray-100 pt-3">
            {lossReasonsData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: LOSS_PALETTE[idx % LOSS_PALETTE.length] }} />
                  <span className="text-slate-500 font-medium truncate">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900 shrink-0">
                  {((item.volume / 1000000) || 0).toFixed(1)}M
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Revenue Trend & KPI Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-8">
        {/* Revenue Trend Area Chart (7 cols) */}
        <div className="xl:col-span-7 bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              Динамика выручки
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Фактические поступления против прогноза
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString('ru-RU')} ₽`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '10px' }} />
                <Area type="monotone" dataKey="forecast" name="Прогноз (₽)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorForecast)" />
                <Area type="monotone" dataKey="won" name="Факт (₽)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorWon)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engineer Matrix Table (5 cols) */}
        <div className="xl:col-span-5 bg-white border border-gray-200 rounded-lg p-6 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Эффективность менеджеров
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Объем закрытых и активных проектов
            </p>
          </div>
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <table className="w-full data-dense-table text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 px-2 font-bold text-gray-400 uppercase tracking-wider">Сотрудник</th>
                  <th className="pb-3 px-2 font-bold text-gray-400 uppercase tracking-wider text-center">В работе</th>
                  <th className="pb-3 px-2 font-bold text-gray-400 uppercase tracking-wider text-center">Закрыто</th>
                  <th className="pb-3 px-2 font-bold text-gray-400 uppercase tracking-wider text-right">Выручка</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {engineersPerformance.slice(0, 6).map((eng, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-2">
                      <div className="font-bold text-gray-900">{eng.name}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[120px]">{eng.position}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 font-bold text-blue-700 bg-blue-50 rounded-md border border-blue-100">
                        {eng.activeCount}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 font-bold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-100">
                        {eng.wonCount}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-black text-gray-900">
                      {eng.wonSum > 0 ? `${(eng.wonSum / 1000000).toFixed(1)}M` : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};