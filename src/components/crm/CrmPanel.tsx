import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA, SERVICES_DATA, ENGINEERING_SERVICES_EQUIPMENT } from '../../data/mockData';
import { 
  Settings, 
  Cpu, 
  LifeBuoy, 
  ChevronRight,
  ChevronLeft,
  ChevronDown, 
  Clock, 
  CheckCircle2, 
  FileText, 
  X,
  Phone,
  Mail,
  User,
  UserCheck,
  Building2,
  TrendingUp,
  Award,
  Search,
  Plus,
  ArrowRight,
  RotateCcw,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Send,
  Calendar,
  CalendarClock,
  Filter,
  CheckSquare,
  Sparkles,
  Percent,
  Layers,
  Paperclip,
  Check,
  FileCheck2,
  ShieldCheck,
  Wrench,
  Download,
  Trash2,
  Lock,
  Edit3,
  BookOpen,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  Columns,
  List,
  Smartphone,
  Printer,
  Copy,
  Receipt,
  Loader2,
  Building,
  Briefcase,
  Users,
  UserPlus,
  Star,
  Globe
} from 'lucide-react';
import { 
  ExtendedDeal, 
  INITIAL_CRM_DEALS, 
  LOSS_REASONS, 
  RETURN_REASONS,
  DealItemSpec,
  TimelineEntry,
  ProjectDocument
} from '../../data/mockCrmData';
import { 
  CurrencyCode, 
  CURRENCY_OPTIONS, 
  getCurrencySymbol, 
  formatCurrency, 
  CURRENCIES,
  CrmCompany,
  CrmContact
} from '../../types';
import { CrmDocumentViewerModal } from './CrmDocumentViewerModal';
import { CrmAttachDocModal } from './CrmAttachDocModal';
import { ProposalsRegistry } from './ProposalsRegistry';
import { ContractsRegistry } from './ContractsRegistry';
import { AnalyticsPipelineView } from './AnalyticsPipelineView';
import { EmailSettingsView } from './EmailSettingsView';
import { CrmManualView } from './CrmManualView';
import { CertificatesRegistry } from './CertificatesRegistry';
import { CrmDashboard } from './CrmDashboard';
import { GenerateProposalModal } from './GenerateProposalModal';
import { FunnelStagesEditorModal } from './FunnelStagesEditorModal';
import { CrmVatSettingsModal } from './CrmVatSettingsModal';
import { parseRussianLeaderGreeting } from '../../utils/printProposal';
import { CommercialProposal, CommercialContract, INITIAL_PROPOSALS, INITIAL_CONTRACTS } from '../../data/mockCrmData';


export interface FunnelStage {
  id: string;
  label: string;
  shortLabel?: string;
  winRate: number; // percentage 0 - 100
  color: string;
  isWon?: boolean;
  isLost?: boolean;
}

export interface FunnelConfig {
  id: 'services' | 'equipment' | 'support';
  name: string;
  icon: any;
  description: string;
  accentColor: string;
  stages: FunnelStage[];
}

export const getFunnelIconComponent = (icon: any) => {
  if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
    return icon;
  }
  if (typeof icon === 'string') {
    switch (icon) {
      case 'Cpu':
        return Cpu;
      case 'Settings':
        return Settings;
      case 'LifeBuoy':
        return LifeBuoy;
      default:
        return Cpu;
    }
  }
  return Cpu;
};

// Helper to get formatted manager title from AuthAccount
export const formatManagerOption = (user: { fullName: string; position?: string }) => {
  const parts = user.fullName.trim().split(/\s+/);
  let shortName = user.fullName;
  if (parts.length >= 3) {
    shortName = `${parts[0]} ${parts[1][0]}.${parts[2][0]}.`;
  } else if (parts.length === 2) {
    shortName = `${parts[0]} ${parts[1][0]}.`;
  }
  const pos = user.position ? ` (${user.position})` : '';
  return {
    value: shortName,
    label: `${shortName}${pos}`,
    fullName: user.fullName,
    position: user.position || 'Специалист'
  };
};

export const UTM_SOURCE_LABELS: Record<string, string> = {
  'yandex_direct': 'Яндекс.Директ (Поиск / РСЯ)',
  'yandex': 'Яндекс (Органический поиск)',
  'google': 'Google (Поисковая выдача)',
  'organic': 'Органический поиск (SEO)',
  'direct': 'Прямой переход на сайт',
  'crm_manual': 'Ввод менеджером вручную',
  'vk.ru/ds_engineering': 'Сообщество ВКонтакте',
  'telegram': 'Телеграм-канал ДС‑Инжиниринг',
  'exhibition': 'Выставка «Металлообработка»',
  'partner': 'Партнерская рекомендация'
};

export const UTM_MEDIUM_LABELS: Record<string, string> = {
  'cpc': 'Контекстная реклама (Платный клик)',
  'search': 'Поисковая выдача (SEO)',
  'social': 'Социальные сети',
  'website': 'Форма на сайте',
  'direct': 'Прямой визит',
  'none': 'Без параметров'
};

export const UTM_CAMPAIGN_LABELS: Record<string, string> = {
  'prom_metrology_crysta': 'Промышленная метрология и КИМ Mitutoyo',
  'freescan_combo_catalog': 'Каталог 3D-сканеров FreeScan',
  'reverse_engineering_cases': 'Кейсы реверс-инжиниринга и контроля',
  'postprocessors_portal': 'Раздел постпроцессоров и ЧПУ',
  'sales_department': 'Отдел прямых продаж',
  'lead_form': 'Инженерный калькулятор на сайте'
};

export const CRM_FUNNELS: Record<'services' | 'equipment' | 'support', FunnelConfig> = {
  equipment: {
    id: 'equipment',
    name: 'Оборудование и ПО',
    icon: Cpu,
    description: 'КИМ, 3D-сканеры, ПО PolyWorks, САПР TopSolid 7 для ЧПУ',
    accentColor: 'blue',
    stages: [
      { id: 'lead', label: '1. Входящий лид (Квалификация)', shortLabel: 'Лид', winRate: 10, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      { id: 'audit', label: '2. Технический аудит и Бенчмаркинг', shortLabel: 'Тех. аудит', winRate: 25, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      { id: 'tender', label: '3. ТКП и Тендерная подготовка', shortLabel: 'ТКП / Тендер', winRate: 45, color: 'border-cyan-200 bg-cyan-50/50 text-cyan-800' },
      { id: 'demo', label: '4. Выездная демо и Согласование NDA', shortLabel: 'Выездная демо', winRate: 60, color: 'border-purple-200 bg-purple-50/50 text-purple-800' },
      { id: 'contract', label: '5. Договор и Аванс', shortLabel: 'Договор и аванс', winRate: 80, color: 'border-amber-200 bg-amber-50/50 text-amber-800' },
      { id: 'logistics', label: '6. Логистика и Таможня', shortLabel: 'Логистика', winRate: 90, color: 'border-orange-200 bg-orange-50/50 text-orange-800' },
      { id: 'implementation', label: '7. Внедрение и Инструктаж', shortLabel: 'Внедрение', winRate: 95, color: 'border-teal-200 bg-teal-50/50 text-teal-800' },
      { id: 'closed_won', label: '8. Закрыто / Поставка выполнена', shortLabel: 'Закрыто / Успех', winRate: 100, color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800', isWon: true },
      { id: 'lost', label: 'Отменено / Отказ', shortLabel: 'Отказ / Архив', winRate: 0, color: 'border-rose-200 bg-rose-50/50 text-rose-800', isLost: true }
    ]
  },
  services: {
    id: 'services',
    name: 'Инжиниринг',
    icon: Settings,
    description: '3D-сканирование, реверс, постпроцессоры',
    accentColor: 'amber',
    stages: [
      { id: 'new', label: '1. Заявка из калькулятора', shortLabel: 'Заявка', winRate: 15, color: 'border-amber-200 bg-amber-50/50 text-amber-800' },
      { id: 'estimate', label: '2. Оценка трудоемкости инженером', shortLabel: 'Оценка', winRate: 35, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      { id: 'nda', label: '3. Утверждение методики и NDA', shortLabel: 'Методика / NDA', winRate: 60, color: 'border-purple-200 bg-purple-50/50 text-purple-800' },
      { id: 'implementation', label: '4. Выполнение работ (Сканы/Постпроцессор)', shortLabel: 'Реализация', winRate: 85, color: 'border-teal-200 bg-teal-50/50 text-teal-800' },
      { id: 'cross_sell', label: '5. Перевод в продажу оборудования', shortLabel: 'Кросс-продажа', winRate: 95, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      { id: 'completed', label: '6. Завершено / Сдача проекта', shortLabel: 'Сдано', winRate: 100, color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800', isWon: true },
      { id: 'lost', label: 'Отменено / Архив', shortLabel: 'Архив', winRate: 0, color: 'border-rose-200 bg-rose-50/50 text-rose-800', isLost: true }
    ]
  },
  support: {
    id: 'support',
    name: 'Сервис и ТО',
    icon: LifeBuoy,
    description: 'ТО КИМ, поверка, калибровка и ремонт',
    accentColor: 'emerald',
    stages: [
      { id: 'ticket', label: '1. Обращение / Заводской номер', shortLabel: 'Обращение', winRate: 20, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      { id: 'diagnostics', label: '2. Диагностика проблемы инженером', shortLabel: 'Диагностика', winRate: 45, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
      { id: 'maintenance', label: '3. ТО КИМ и калибровка', shortLabel: 'ТО КИМ', winRate: 75, color: 'border-amber-200 bg-amber-50/50 text-amber-800' },
      { id: 'resolution', label: '4. Решение обращения / Продление техподдержки', shortLabel: 'Решение', winRate: 90, color: 'border-teal-200 bg-teal-50/50 text-teal-800' },
      { id: 'closed_won', label: '5. Выполнено / Подписано', shortLabel: 'Выполнено', winRate: 100, color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800', isWon: true },
      { id: 'lost', label: 'Архив / Отклонено', shortLabel: 'Архив', winRate: 0, color: 'border-rose-200 bg-rose-50/50 text-rose-800', isLost: true }
    ]
  }
};

export interface StageActionRecommendation {
  action: string;
  timeframe: string;
  urgencyLabel: string;
  priority: 'high' | 'medium' | 'normal';
}

export const STAGE_RECOMMENDED_ACTIONS: Record<string, StageActionRecommendation> = {
  // Equipment stages
  lead: {
    action: 'Первичный контакт с ЛПР: квалификация проекта, определение бюджета, сроков поставки и ТЗ',
    timeframe: 'В течение 24 часов',
    urgencyLabel: 'Срочный контакт (24 ч.)',
    priority: 'high'
  },
  audit: {
    action: 'Проведение технического аудита чертежей/деталей, подбор конфигурации КИМ или 3D-сканера',
    timeframe: 'До 3 рабочих дней',
    urgencyLabel: 'Тех. аудит (до 3 дн.)',
    priority: 'high'
  },
  tender: {
    action: 'Подготовка официального ТКП, спецификации и тендерного пакета документов',
    timeframe: '2-4 рабочих дня',
    urgencyLabel: 'ТКП / Тендер (2-4 дн.)',
    priority: 'medium'
  },
  demo: {
    action: 'Организация выездной демонстрации на деталях заказчика или замеры в метрологическом зале',
    timeframe: 'В согласованную дату (до 5 дн.)',
    urgencyLabel: 'Демонстрация и NDA',
    priority: 'high'
  },
  contract: {
    action: 'Согласование условий договора поставки, счета на аванс и графика платежей',
    timeframe: 'В течение 3-5 рабочих дней',
    urgencyLabel: 'Договор и аванс',
    priority: 'high'
  },
  logistics: {
    action: 'Контроль отгрузки завода-изготовителя, экспедирование, таможенное оформление',
    timeframe: 'По графику логистики',
    urgencyLabel: 'Логистический контроль',
    priority: 'normal'
  },
  implementation: {
    action: 'Пусконаладочные работы КИМ, юстировка, калибровка и инструктаж операторов заказчика',
    timeframe: 'В течение 5 рабочих дней',
    urgencyLabel: 'ПНР и обучение',
    priority: 'high'
  },

  // Services stages
  new: {
    action: 'Обработка заявки из калькулятора, проверка CAD-файлов и контакт с заказчиком',
    timeframe: 'В течение 2-4 часов',
    urgencyLabel: 'Экспресс-связь (2-4 ч.)',
    priority: 'high'
  },
  estimate: {
    action: 'Инженерная оценка трудоемкости, расчет машинного времени и себестоимости работ',
    timeframe: '1-2 рабочих дня',
    urgencyLabel: 'Оценка трудоемкости',
    priority: 'high'
  },
  nda: {
    action: 'Подписание соглашения о конфиденциальности (NDA) и утверждение методики измерений',
    timeframe: '1-3 рабочих дня',
    urgencyLabel: 'Согласование NDA',
    priority: 'medium'
  },
  cross_sell: {
    action: 'Презентация результатов и подготовка предложения на приобретение собственного оборудования/ПО',
    timeframe: 'В течение 3 дней после замеров',
    urgencyLabel: 'Предложение по КИМ/ПО',
    priority: 'medium'
  },
  completed: {
    action: 'Подписание двустороннего акта сдачи-приемки работ и выставление закрывающих документов',
    timeframe: 'Завершено',
    urgencyLabel: 'Закрывающие документы',
    priority: 'normal'
  },

  // Support stages
  ticket: {
    action: 'Регистрация инцидента в CRM, проверка заводского номера КИМ и условий гарантии/сервиса',
    timeframe: 'В течение 2 часов',
    urgencyLabel: 'Регистрация заявки (до 2 ч.)',
    priority: 'high'
  },
  diagnostics: {
    action: 'Удаленная диагностика с инженером, сбор логов PolyWorks/контроллера, дефектная ведомость',
    timeframe: 'В течение 1 рабочего дня',
    urgencyLabel: 'Диагностика и логи',
    priority: 'high'
  },
  maintenance: {
    action: 'Регламентное ТО, метрологическая калибровка КИМ и поверка эталонной сферы',
    timeframe: 'По графику сервиса (до 10 дней)',
    urgencyLabel: 'Регламентное ТО',
    priority: 'high'
  },
  resolution: {
    action: 'Устранение неисправности, тестирование точности, протокол и согласование сервисного контракта',
    timeframe: '1-2 рабочих дня',
    urgencyLabel: 'Закрытие инцидента',
    priority: 'medium'
  },

  // Universal
  closed_won: {
    action: 'Сделка успешно завершена, контракт исполнен, оплата поступила на расчетный счет',
    timeframe: 'Завершено',
    urgencyLabel: 'Успешно закрыто',
    priority: 'normal'
  },
  lost: {
    action: 'Сделка переведена в архив. Анализ причин отказа для последующей работы',
    timeframe: 'Архив',
    urgencyLabel: 'В архиве',
    priority: 'normal'
  }
};

export interface ParsedStageHeader {
  stepNumber: string | null;
  title: string;
  subtitle: string | null;
  rawLabel: string;
}

export const formatStageHeader = (rawLabel: string): ParsedStageHeader => {
  const numMatch = rawLabel.match(/^(\d+)\.\s*(.+)$/);
  const stepNumber = numMatch ? numMatch[1] : null;
  const fullTitle = numMatch ? numMatch[2] : rawLabel;

  const parenMatch = fullTitle.match(/^(.+?)\s*\((.+)\)$/);
  if (parenMatch) {
    return {
      stepNumber,
      title: parenMatch[1].trim(),
      subtitle: parenMatch[2].trim(),
      rawLabel
    };
  }

  return {
    stepNumber,
    title: fullTitle.trim(),
    subtitle: null,
    rawLabel
  };
};

export const getStageTheme = (stage: FunnelStage) => {
  if (stage.isWon) {
    return {
      stripe: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
      percent: 'text-emerald-600 dark:text-emerald-400'
    };
  }
  if (stage.isLost) {
    return {
      stripe: 'bg-rose-500',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-700',
      percent: 'text-rose-600 dark:text-rose-400'
    };
  }
  if (stage.id.includes('lead') || stage.id.includes('new') || stage.id.includes('ticket')) {
    return {
      stripe: 'bg-blue-500',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      percent: 'text-blue-600 dark:text-blue-400'
    };
  }
  if (stage.id.includes('audit') || stage.id.includes('estimate') || stage.id.includes('diagnostics')) {
    return {
      stripe: 'bg-blue-500',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      percent: 'text-blue-600 dark:text-blue-400'
    };
  }
  if (stage.id.includes('tender') || stage.id.includes('nda')) {
    return {
      stripe: 'bg-cyan-500',
      badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      percent: 'text-cyan-600 dark:text-cyan-400'
    };
  }
  if (stage.id.includes('demo') || stage.id.includes('maintenance')) {
    return {
      stripe: 'bg-purple-500',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      percent: 'text-purple-600 dark:text-purple-400'
    };
  }
  if (stage.id.includes('contract')) {
    return {
      stripe: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      percent: 'text-amber-600 dark:text-amber-400'
    };
  }
  if (stage.id.includes('logistics') || stage.id.includes('cross_sell')) {
    return {
      stripe: 'bg-orange-500',
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      percent: 'text-orange-600 dark:text-orange-400'
    };
  }
  if (stage.id.includes('implementation') || stage.id.includes('resolution')) {
    return {
      stripe: 'bg-teal-500',
      badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      percent: 'text-teal-600 dark:text-teal-400'
    };
  }
  return {
    stripe: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    percent: 'text-blue-600 dark:text-blue-400'
  };
};

export type DealTermFilter = 
  | 'all'
  | 'up_to_3d'
  | 'up_to_10d'
  | 'up_to_30d'
  | 'up_to_45d'
  | 'up_to_1y'
  | 'over_1y'
  | 'attention';

export const getDealAgeInfo = (deal: ExtendedDeal) => {
  const now = Date.now();
  const created = new Date(deal.createdAt).getTime();
  const days = Math.max(0, Math.floor((now - created) / (1000 * 60 * 60 * 24)));
  
  let text = '';
  if (days === 0) {
    text = 'сегодня';
  } else if (days === 1) {
    text = '1 день';
  } else if (days < 30) {
    text = `${days} дн.`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    text = `${months} мес.`;
  } else {
    const years = (days / 365).toFixed(1);
    text = `${years} г.`;
  }

  return { days, text };
};

export const getDealNextAction = (deal: ExtendedDeal) => {
  // 1. Scheduled Equipment Verification Alert (ONLY for support/service contract funnel)
  if (deal.funnel === 'support' && deal.clientEquipment?.daysUntilVerification && deal.clientEquipment.daysUntilVerification <= 45) {
    return {
      action: `Плановая калибровка и поверка КИМ (зав. № ${deal.clientEquipment.serialNumber}): согласовать дату выезда инженера`,
      timeframe: `До поверки: ${deal.clientEquipment.daysUntilVerification} дн.`,
      urgency: 'critical' as const,
      urgencyLabel: 'Поверка КИМ'
    };
  }

  // 2. Custom Task Note in Timeline if logged by manager
  const taskEntry = deal.timeline?.find(t => 
    t.title.toLowerCase().includes('задача ответственного') || 
    t.title.toLowerCase().includes('поручение')
  );
  if (taskEntry && taskEntry.comment) {
    return {
      action: taskEntry.comment,
      timeframe: taskEntry.date,
      urgency: 'custom' as const,
      urgencyLabel: 'Личная задача'
    };
  }

  // 3. Stage Recommended Action
  const rec = STAGE_RECOMMENDED_ACTIONS[deal.stage] || {
    action: 'Контакт с заказчиком и актуализация текущего статуса проекта',
    timeframe: 'В ближайшие 2 рабочих дня',
    urgencyLabel: 'Текущий контакт',
    priority: 'normal' as const
  };

  const isClosed = deal.stage === 'lost' || deal.stage === 'closed_won' || deal.stage === 'completed';

  return {
    action: rec.action,
    timeframe: rec.timeframe,
    urgency: isClosed ? ('normal' as const) : ('actionable' as const),
    urgencyLabel: rec.urgencyLabel
  };
};

export interface CrmPanelProps {
  activeTab?: 'dashboard' | 'funnels' | 'analytics' | 'proposals' | 'contracts';
}

export const CrmPanel: React.FC<CrmPanelProps> = ({ activeTab = 'funnels' }) => {
  const { 
    showToast, 
    currentUser, 
    userPermissions, 
    authUsers,
    deals,
    setDeals: originalSetDeals,
    addDeal,
    updateDeal,
    deleteDeal,
    contracts,
    setContracts,
    commercialProposals: proposals,
    setCommercialProposals: setProposals,
    funnels,
    crmSettings,
    fleetDevices,
  } = useApp();

  const [isStageEditorOpen, setIsStageEditorOpen] = useState(false);
  const [isVatSettingsOpen, setIsVatSettingsOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  
  const activeFunnels = useMemo(() => {
    if (!funnels || funnels.length === 0) return CRM_FUNNELS;
    const dynamic: any = { ...CRM_FUNNELS };
    funnels.forEach(f => {
      dynamic[f.id] = {
        ...dynamic[f.id],
        ...f,
        stages: typeof f.stages === 'string' ? JSON.parse(f.stages) : f.stages
      };
    });
    return dynamic as Record<'services' | 'equipment' | 'support', FunnelConfig>;
  }, [funnels]);

  

  // Local interceptor to automatically sync complex setDeals manual operations with the backend
  const setDeals = (action: React.SetStateAction<ExtendedDeal[]>) => {
    if (typeof action === 'function') {
      const newDeals = action(deals);
      
      const added = newDeals.filter(nd => !deals.find(pd => pd.id === nd.id));
      const modified = newDeals.filter(nd => {
        const pd = deals.find(pd => pd.id === nd.id);
        return pd && pd !== nd;
      });
      const removed = deals.filter(pd => !newDeals.find(nd => nd.id === pd.id));

      let hasChanges = false;
      added.forEach(deal => { addDeal(deal); hasChanges = true; });
      modified.forEach(deal => { updateDeal(deal.id, deal); hasChanges = true; });
      removed.forEach(deal => { deleteDeal(deal.id); hasChanges = true; });

      // If no recognized mutations, just call original (fallback)
      if (!hasChanges) {
        originalSetDeals(action);
      }
    } else {
      originalSetDeals(action);
    }
  };

  const [isFullscreenDeal, setIsFullscreenDeal] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<ExtendedDeal | null>(null);
  const [activeFunnel, setActiveFunnel] = useState<'equipment' | 'services' | 'support'>('equipment');
  const [selectedDeal, setSelectedDeal] = useState<ExtendedDeal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Mobile-Optimized Layout States
  const [mobileLayoutMode, setMobileLayoutMode] = useState<'stage-list' | 'kanban-scroll'>(() => 
    typeof window !== 'undefined' && window.innerWidth < 1024 ? 'stage-list' : 'kanban-scroll'
  );
  const [mobileActiveStage, setMobileActiveStage] = useState<string>('');
  const [dealModalMobileTab, setDealModalMobileTab] = useState<'info' | 'spec' | 'timeline'>('info');

  // Dynamic Responsible Managers from User Management & Permissions
  const availableManagers = useMemo(() => {
    // Return all users who have staff roles ('superadmin', 'admin' or 'manager')
    const staffUsers = (authUsers || []).filter(u => u.role === 'superadmin' || u.role === 'admin' || u.role === 'manager');
    if (staffUsers.length === 0) {
      return [
        { value: 'Некрасов С.Ю.', label: 'Некрасов С.Ю. (Генеральный директор)', fullName: 'Некрасов Сергей Юрьевич', position: 'Генеральный директор' },
        { value: 'Скобелев А.С.', label: 'Скобелев А.С. (Инженер по внедрению CAD/CAM и постпроцессорам)', fullName: 'Скобелев Александр Сергеевич', position: 'Инженер по внедрению CAD/CAM и постпроцессорам' },
        { value: 'Ярыш И.В.', label: 'Ярыш И.В. (Инженер-метролог)', fullName: 'Ярыш Иван Владимирович', position: 'Инженер-метролог' },
        { value: 'Ярыш А.В.', label: 'Ярыш А.В. (Инженер по подбору оборудования и ПО)', fullName: 'Ярыш Александр Владимирович', position: 'Инженер по подбору оборудования и ПО' },
        { value: 'Морозов В.Г.', label: 'Морозов В.Г. (Руководитель КТО)', fullName: 'Морозов Владимир Георгиевич', position: 'Руководитель КТО' },
      ];
    }
    return [...staffUsers]
      .sort((a, b) => {
        if (a.role === 'superadmin') return -1;
        if (b.role === 'superadmin') return 1;
        return a.fullName.localeCompare(b.fullName);
      })
      .map(formatManagerOption);
  }, [authUsers]);

  // Modals
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);
  const [selectedLossReason, setSelectedLossReason] = useState(LOSS_REASONS[0]);
  const [customLossNote, setCustomLossNote] = useState('');

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnReason, setSelectedReturnReason] = useState(RETURN_REASONS[0]);
  const [customReturnNote, setCustomReturnNote] = useState('');

  // Project Documents Modals
  const [viewingDocument, setViewingDocument] = useState<{ doc: ProjectDocument; deal: ExtendedDeal } | null>(null);
  const [isAttachDocModalOpen, setIsAttachDocModalOpen] = useState(false);
  const [dealForProposal, setDealForProposal] = useState<ExtendedDeal | null>(null);

  // Specification state: editing, adding, and deleting
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemForm, setEditItemForm] = useState<{
    name: string;
    category: string;
    quantity: number;
    price: number;
    unit: string;
    paymentStatus: 'pending' | 'prepaid_50' | 'paid_100';
  }>({
    name: '',
    category: 'Услуги',
    quantity: 1,
    price: 0,
    unit: 'шт.',
    paymentStatus: 'pending'
  });

  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [newItemForm, setNewItemForm] = useState<{
    name: string;
    category: string;
    quantity: number;
    price: number;
    unit: string;
    paymentStatus: 'pending' | 'prepaid_50' | 'paid_100';
  }>({
    name: '',
    category: 'Услуги',
    quantity: 1,
    price: 150000,
    unit: 'шт.',
    paymentStatus: 'pending'
  });

  // State for equipment-driven service selection
  const [isFleetPickerOpen, setIsFleetPickerOpen] = useState(false);
  const [selectedFleetId, setSelectedFleetId] = useState<string>('');
  const [selectedFleetService, setSelectedFleetService] = useState<string>('inspection');
  const [selectedFleetSoftware, setSelectedFleetSoftware] = useState<string>('polyworks');

  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<string | null>(null);

  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [dealDisplayMode, setDealDisplayMode] = useState<'kanban' | 'list'>('kanban');
  const [isCompactKanban, setIsCompactKanban] = useState(false);
  const [collapsedStages, setCollapsedStages] = useState<string[]>([]);
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [isBatchStageModalOpen, setIsBatchStageModalOpen] = useState(false);
  const [isBatchManagerModalOpen, setIsBatchManagerModalOpen] = useState(false);
  const [batchTargetStage, setBatchTargetStage] = useState('');
  const [batchTargetManager, setBatchTargetManager] = useState('');

  const toggleCollapseStage = (stageId: string) => {
    setCollapsedStages(prev => 
      prev.includes(stageId) ? prev.filter(s => s !== stageId) : [...prev, stageId]
    );
  };
  const [newDealForm, setNewDealForm] = useState({
    companyId: '',
    companyName: '',
    customerName: '',
    customerPost: '',
    inn: '',
    kpp: '',
    address: '',
    ceoName: '',
    ceoPost: 'Генеральный директор',
    contactId: '',
    phone: '',
    email: '',
    serviceType: '',
    catalogSelection: '',
    estimatedPrice: 1500000,
    currency: 'RUB' as CurrencyCode,
    funnel: 'equipment' as 'equipment' | 'services' | 'support',
    details: '',
    equipmentSerial: '',
    responsibleManager: 'Скобелев А.С.',
  });
  const [newDealAttachedFile, setNewDealAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CRM Companies & Contacts in New Deal Modal
  const [crmCompanies, setCrmCompanies] = useState<CrmCompany[]>([]);
  const [crmContacts, setCrmContacts] = useState<CrmContact[]>([]);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isSearchingDadataDeal, setIsSearchingDadataDeal] = useState(false);
  const [dadataDealResults, setDadataDealResults] = useState<any[]>([]);
  const [dadataDealStatus, setDadataDealStatus] = useState<string | null>(null);
  const [selectedContactMode, setSelectedContactMode] = useState<'ceo' | 'crm_contact' | 'custom'>('custom');
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  // Quick Contact Creation on the fly state (for both selectedDeal card and newDeal modal)
  const [isAddingContactInlineInDeal, setIsAddingContactInlineInDeal] = useState(false);
  const [isEditingContactInlineInDeal, setIsEditingContactInlineInDeal] = useState(false);
  const [quickContactForm, setQuickContactForm] = useState({
    fullName: '',
    position: 'Главный метролог / Начальник ОТК',
    department: 'Отдел контроля геометрии и КИМ',
    workPhone: '',
    mobilePhone: '',
    email: '',
    isDecisionMaker: true,
    notes: '',
  });

  // Edit contact inline in selected deal state
  const [editDealContactForm, setEditDealContactForm] = useState({
    customerName: '',
    customerPost: '',
    phone: '',
    email: ''
  });

  // Reset quick contact form
  const resetQuickContactForm = () => {
    setQuickContactForm({
      fullName: '',
      position: 'Главный метролог / Начальник ОТК',
      department: 'Отдел контроля геометрии и КИМ',
      workPhone: '',
      mobilePhone: '',
      email: '',
      isDecisionMaker: true,
      notes: '',
    });
    setIsAddingContactInlineInDeal(false);
  };

  // Sync editDealContactForm when selectedDeal changes
  useEffect(() => {
    if (selectedDeal) {
      setEditDealContactForm({
        customerName: selectedDeal.customerName || '',
        customerPost: selectedDeal.customerPost || '',
        phone: selectedDeal.phone || '',
        email: selectedDeal.email || ''
      });
      setIsAddingContactInlineInDeal(false);
      setIsEditingContactInlineInDeal(false);
    }
  }, [selectedDeal?.id]);

  // Load CRM companies and contacts on mount / modal open
  useEffect(() => {
    const loadData = async () => {
      try {
        const [compRes, contRes] = await Promise.all([
          apiService.getCrmCompanies(),
          apiService.getCrmContacts()
        ]);
        if (compRes.success && Array.isArray(compRes.data)) {
          setCrmCompanies(compRes.data);
        }
        if (contRes.success && Array.isArray(contRes.data)) {
          setCrmContacts(contRes.data);
        }
      } catch (e) {
        console.warn('Error loading CRM companies/contacts:', e);
      }
    };
    loadData();
  }, [isNewDealModalOpen, selectedDeal?.id]);

  // Create contact on the fly for selectedDeal
  const handleCreateContactForSelectedDeal = async () => {
    if (!selectedDeal) return;
    if (!quickContactForm.fullName.trim()) {
      showToast('Укажите ФИО контактного лица');
      return;
    }

    try {
      const newContactData: Partial<CrmContact> = {
        fullName: quickContactForm.fullName.trim(),
        position: quickContactForm.position.trim(),
        department: quickContactForm.department.trim(),
        workPhone: quickContactForm.workPhone.trim(),
        mobilePhone: quickContactForm.mobilePhone.trim(),
        email: quickContactForm.email.trim(),
        isDecisionMaker: quickContactForm.isDecisionMaker,
        companyId: selectedDeal.companyId || undefined,
        companyName: selectedDeal.companyName || selectedDeal.customerName || 'Предприятие',
        notes: quickContactForm.notes.trim() || undefined,
        interactionHistory: [
          {
            id: `int-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            type: 'meeting',
            comment: `Создан на лету из карточки сделки ${selectedDeal.id}`,
            author: currentStaffObj?.value || 'Скобелев А.С.'
          }
        ]
      };

      const res = await apiService.saveCrmContact(newContactData);
      const createdContact = res.data || { 
        ...newContactData, 
        id: `cont-${Date.now()}`, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      };
      
      // Update local contacts
      setCrmContacts(prev => [...prev.filter(c => c.id !== createdContact.id), createdContact]);

      // Update the active deal
      const updatedFields: Partial<ExtendedDeal> = {
        contactId: createdContact.id,
        customerName: createdContact.fullName,
        customerPost: createdContact.position,
        phone: createdContact.workPhone || createdContact.mobilePhone || selectedDeal.phone,
        email: createdContact.email || selectedDeal.email,
        updatedAt: new Date().toISOString()
      };

      setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, ...updatedFields } : d));
      setSelectedDeal(prev => prev ? { ...prev, ...updatedFields } : null);
      
      resetQuickContactForm();
      showToast(`Контакт «${createdContact.fullName}» создан и привязан к сделке!`);
    } catch (e: any) {
      showToast(e?.message || 'Ошибка создания контакта');
    }
  };

  // Create contact on the fly for newDealForm
  const handleCreateContactForNewDeal = async () => {
    if (!quickContactForm.fullName.trim()) {
      showToast('Укажите ФИО контактного лица');
      return;
    }

    try {
      const newContactData: Partial<CrmContact> = {
        fullName: quickContactForm.fullName.trim(),
        position: quickContactForm.position.trim(),
        department: quickContactForm.department.trim(),
        workPhone: quickContactForm.workPhone.trim(),
        mobilePhone: quickContactForm.mobilePhone.trim(),
        email: quickContactForm.email.trim(),
        isDecisionMaker: quickContactForm.isDecisionMaker,
        companyId: newDealForm.companyId || undefined,
        companyName: newDealForm.companyName || 'Предприятие',
        notes: quickContactForm.notes.trim() || undefined,
        interactionHistory: []
      };

      const res = await apiService.saveCrmContact(newContactData);
      const createdContact = res.data || { 
        ...newContactData, 
        id: `cont-${Date.now()}`, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      };
      
      setCrmContacts(prev => [...prev.filter(c => c.id !== createdContact.id), createdContact]);

      setNewDealForm(prev => ({
        ...prev,
        contactId: createdContact.id,
        customerName: createdContact.fullName,
        customerPost: createdContact.position || 'Контактное лицо',
        phone: createdContact.workPhone || createdContact.mobilePhone || prev.phone,
        email: createdContact.email || prev.email
      }));
      setSelectedContactMode('crm_contact');
      resetQuickContactForm();
      showToast(`Контакт «${createdContact.fullName}» создан и выбран в сделку!`);
    } catch (e: any) {
      showToast(e?.message || 'Ошибка создания контакта');
    }
  };

  // Switch contact for selectedDeal
  const handleSelectContactForSelectedDeal = (contactIdValue: string) => {
    if (!selectedDeal) return;
    
    if (contactIdValue === '__ceo__') {
      const matchedComp = crmCompanies.find(c => c.id === selectedDeal.companyId || (selectedDeal.companyName && c.name.toLowerCase() === selectedDeal.companyName.toLowerCase()));
      const ceoName = matchedComp?.ceoName || selectedDeal.ceoName || selectedDeal.customerName;
      const ceoPost = matchedComp?.ceoPost || selectedDeal.ceoPost || 'Генеральный директор';
      const updatedFields: Partial<ExtendedDeal> = {
        contactId: '',
        customerName: ceoName,
        customerPost: ceoPost,
        updatedAt: new Date().toISOString()
      };
      setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, ...updatedFields } : d));
      setSelectedDeal(prev => prev ? { ...prev, ...updatedFields } : null);
      showToast(`Выбран руководитель: ${ceoName}`);
      return;
    }

    if (contactIdValue === '__custom__') {
      setIsEditingContactInlineInDeal(true);
      return;
    }

    const contact = crmContacts.find(c => c.id === contactIdValue);
    if (contact) {
      const updatedFields: Partial<ExtendedDeal> = {
        contactId: contact.id,
        customerName: contact.fullName,
        customerPost: contact.position || 'Контактное лицо',
        phone: contact.workPhone || contact.mobilePhone || selectedDeal.phone,
        email: contact.email || selectedDeal.email,
        updatedAt: new Date().toISOString()
      };
      setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, ...updatedFields } : d));
      setSelectedDeal(prev => prev ? { ...prev, ...updatedFields } : null);
      showToast(`Контакт переключен на: ${contact.fullName} (${contact.position})`);
    }
  };

  // Save inline edited contact for deal
  const handleSaveInlineContactForDeal = () => {
    if (!selectedDeal) return;
    if (!editDealContactForm.customerName.trim()) {
      showToast('Укажите ФИО контактного лица');
      return;
    }

    const updatedFields: Partial<ExtendedDeal> = {
      customerName: editDealContactForm.customerName.trim(),
      customerPost: editDealContactForm.customerPost.trim(),
      phone: editDealContactForm.phone.trim(),
      email: editDealContactForm.email.trim(),
      updatedAt: new Date().toISOString()
    };

    setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, ...updatedFields } : d));
    setSelectedDeal(prev => prev ? { ...prev, ...updatedFields } : null);
    setIsEditingContactInlineInDeal(false);
    showToast('Контактные данные сделки сохранены!');
  };

  // Handle DaData search for deal creation
  const handleSearchDadataForDeal = async (queryText?: string) => {
    const q = (queryText || newDealForm.companyName).trim();
    if (!q) return;
    setIsSearchingDadataDeal(true);
    setDadataDealStatus(null);
    try {
      const res = await apiService.searchCompanyByDadata(q);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setDadataDealResults(res.data);
        setIsCompanyDropdownOpen(true);
        setDadataDealStatus(`Найдено в ЕГРЮЛ: ${res.data.length}`);
      } else {
        setDadataDealResults([]);
        setDadataDealStatus(res.error || 'Организация не найдена в ЕГРЮЛ');
      }
    } catch (err: any) {
      setDadataDealStatus('Ошибка сервиса DaData');
    } finally {
      setIsSearchingDadataDeal(false);
    }
  };

  // Apply CRM company to new deal
  const selectCrmCompanyForDeal = (comp: CrmCompany) => {
    const relatedContacts = crmContacts.filter(c => c.companyId === comp.id);
    const hasCeo = Boolean(comp.ceoName);
    
    let initialCustomerName = comp.contactPerson || comp.ceoName || '';
    let initialCustomerPost = comp.ceoPost || 'Генеральный директор';
    let initialPhone = comp.phone || '';
    let initialEmail = comp.email || '';
    let initialContactId = '';

    if (relatedContacts.length > 0) {
      const primaryContact = relatedContacts.find(c => c.isDecisionMaker) || relatedContacts[0];
      initialCustomerName = primaryContact.fullName;
      initialCustomerPost = primaryContact.position || 'Контактное лицо';
      initialPhone = primaryContact.workPhone || primaryContact.mobilePhone || comp.phone || '';
      initialEmail = primaryContact.email || comp.email || '';
      initialContactId = primaryContact.id;
      setSelectedContactMode('crm_contact');
    } else if (hasCeo) {
      setSelectedContactMode('ceo');
    } else {
      setSelectedContactMode('custom');
    }

    setNewDealForm(prev => ({
      ...prev,
      companyId: comp.id,
      companyName: comp.name,
      inn: comp.inn,
      kpp: comp.kpp || '',
      address: comp.address || '',
      ceoName: comp.ceoName || '',
      ceoPost: comp.ceoPost || 'Генеральный директор',
      customerName: initialCustomerName,
      customerPost: initialCustomerPost,
      contactId: initialContactId,
      phone: initialPhone,
      email: initialEmail
    }));
    setIsCompanyDropdownOpen(false);
    setDadataDealResults([]);
  };

  // Apply DaData suggestion to new deal
  const selectDadataCompanyForDeal = (sug: any) => {
    const d = sug.data || {};
    const compName = sug.value || d.name?.short_with_opf || d.name?.full_with_opf || '';
    const leaderName = d.management?.name || (d.fio ? [d.fio.surname, d.fio.name, d.fio.patronymic].filter(Boolean).join(' ') : '');
    const leaderPost = d.management?.post || (d.fio ? 'Индивидуальный предприниматель' : 'Генеральный директор');
    const compPhone = d.phones?.[0]?.value || '';
    const compEmail = d.emails?.[0]?.value || '';
    const addressStr = d.address?.value || '';

    // Check if company already in CRM
    const matchedComp = crmCompanies.find(c => (d.inn && c.inn === d.inn) || (compName && c.name.toLowerCase() === compName.toLowerCase()));
    const relatedContacts = matchedComp ? crmContacts.filter(c => c.companyId === matchedComp.id) : [];

    let custName = leaderName;
    let custPost = leaderPost;
    let contId = '';
    let contMode: 'ceo' | 'crm_contact' | 'custom' = 'ceo';

    if (relatedContacts.length > 0) {
      const primaryContact = relatedContacts.find(c => c.isDecisionMaker) || relatedContacts[0];
      custName = primaryContact.fullName;
      custPost = primaryContact.position || 'Контактное лицо';
      contId = primaryContact.id;
      contMode = 'crm_contact';
    }

    setNewDealForm(prev => ({
      ...prev,
      companyId: matchedComp ? matchedComp.id : `comp-${Date.now()}`,
      companyName: compName,
      inn: d.inn || '',
      kpp: d.kpp || '',
      address: addressStr,
      ceoName: leaderName,
      ceoPost: leaderPost,
      customerName: custName,
      customerPost: custPost,
      contactId: contId,
      phone: compPhone || prev.phone,
      email: compEmail || prev.email
    }));
    setSelectedContactMode(contMode);
    setIsCompanyDropdownOpen(false);
    setDadataDealResults([]);
  };

  // Available contacts for currently selected company
  const availableDealContacts = useMemo(() => {
    if (!newDealForm.companyId && !newDealForm.companyName) return [];
    return crmContacts.filter(c => 
      (newDealForm.companyId && c.companyId === newDealForm.companyId) ||
      (newDealForm.companyName && c.companyName.toLowerCase() === newDealForm.companyName.toLowerCase())
    );
  }, [crmContacts, newDealForm.companyId, newDealForm.companyName]);

  // Check if deal with the same title already exists for the chosen company
  const duplicateExistingDeal = useMemo(() => {
    if (!isNewDealModalOpen) return null;
    
    const targetCompName = newDealForm.companyName?.trim();
    const targetTitle = (
      newDealForm.catalogSelection !== 'other' && newDealForm.catalogSelection
        ? newDealForm.catalogSelection
        : newDealForm.serviceType
    )?.trim();

    if (!targetCompName || !targetTitle) return null;

    const normalizeStr = (str?: string): string => {
      if (!str) return '';
      return str
        .toLowerCase()
        .replace(/[«»""''`„“]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const normTargetTitle = normalizeStr(targetTitle);
    const normTargetComp = normalizeStr(targetCompName);
    const targetInn = newDealForm.inn?.trim();
    const targetCompanyId = newDealForm.companyId?.trim();

    return deals.find(d => {
      // 1. Check company match
      let isSameComp = false;

      // Match by companyId if both have it
      if (targetCompanyId && d.companyId && targetCompanyId === d.companyId) {
        isSameComp = true;
      }
      // Match by INN if both have it and valid length
      else if (targetInn && d.inn && targetInn.length >= 8 && targetInn === d.inn.trim()) {
        isSameComp = true;
      }
      // Match by normalized company name
      else {
        const normDealComp = normalizeStr(d.companyName);
        if (normDealComp && normTargetComp) {
          if (normDealComp === normTargetComp) {
            isSameComp = true;
          } else {
            // Strip common OPF prefixes for comparison
            const cleanTarget = normTargetComp.replace(/^(ооо|зао|пао|ао|ип|нпо|фгуп)\s+/, '');
            const cleanDeal = normDealComp.replace(/^(ооо|зао|пао|ао|ип|нпо|фгуп)\s+/, '');
            if (cleanTarget.length >= 3 && cleanDeal.length >= 3 && cleanTarget === cleanDeal) {
              isSameComp = true;
            }
          }
        }
      }

      if (!isSameComp) return false;

      // 2. Check deal title / serviceType match
      const dealTitle = normalizeStr(d.title || d.serviceType);
      return dealTitle === normTargetTitle;
    }) || null;
  }, [
    isNewDealModalOpen,
    deals,
    newDealForm.companyName,
    newDealForm.companyId,
    newDealForm.inn,
    newDealForm.catalogSelection,
    newDealForm.serviceType
  ]);

  // Click outside listener for company dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Custom catalog dropdown state
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogFilterType, setCatalogFilterType] = useState('all');
  const catalogDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catalogDropdownRef.current && !catalogDropdownRef.current.contains(event.target as Node)) {
        setIsCatalogDropdownOpen(false);
      }
    };
    if (isCatalogDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCatalogDropdownOpen]);

  const filteredCatalogItems = useMemo(() => {
    if (newDealForm.funnel === 'services') {
      return SERVICES_DATA.filter(s => 
        s.title.toLowerCase().includes(catalogSearchQuery.toLowerCase())
      ).map(s => ({ id: s.id, name: s.title, type: 'service', brand: 'Услуги', category: 'service' }));
    } else {
      let filtered = PRODUCTS_DATA;
      if (catalogFilterType === 'hardware') filtered = filtered.filter(p => p.type === 'hardware');
      if (catalogFilterType === 'software') filtered = filtered.filter(p => p.type === 'software');
      if (catalogFilterType === 'scanners') filtered = filtered.filter(p => p.category === 'scanners');
      if (catalogFilterType === 'cmm') filtered = filtered.filter(p => p.category === 'cmm' || p.category === 'arms');

      if (catalogSearchQuery) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(catalogSearchQuery.toLowerCase()) || 
          (p.brand && p.brand.toLowerCase().includes(catalogSearchQuery.toLowerCase()))
        );
      }
      return filtered;
    }
  }, [newDealForm.funnel, catalogSearchQuery, catalogFilterType]);

  // Manager and Deal Term Filters in Funnels
  const [selectedManagerFilter, setSelectedManagerFilter] = useState<string>('all');
  const [dealTermFilter, setDealTermFilter] = useState<DealTermFilter>('all');
  
  // Quick task note assignment state inside deal modal
  const [taskNoteText, setTaskNoteText] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('До конца дня');

  // Helper to accurately match deal manager with target manager value or object
  const matchesManager = (dealManagerStr: string, targetVal: string) => {
    const dMgr = dealManagerStr.toLowerCase().trim();
    const tVal = targetVal.toLowerCase().trim();
    if (!dMgr || !tVal) return false;
    if (dMgr.includes(tVal)) return true;
    
    const targetObj = availableManagers.find(m => m.value.toLowerCase() === tVal);
    if (targetObj) {
      if (targetObj.fullName && dMgr.includes(targetObj.fullName.toLowerCase())) return true;
      const parts = (targetObj.fullName || targetObj.value).split(/\s+/);
      if (parts.length >= 2) {
        const lastName = parts[0].toLowerCase();
        const firstInitial = parts[1][0].toLowerCase();
        if (dMgr.includes(lastName) && dMgr.includes(firstInitial)) return true;
      }
    }
    return false;
  };

  // Count deals per manager in active funnel
  const managerDealsCount = useMemo(() => {
    const counts: Record<string, number> = {};
    deals.filter(d => d.funnel === activeFunnel).forEach(d => {
      const mgr = (d.responsibleManager || d.createdByManager || 'Не назначен').trim();
      const matched = availableManagers.find(m => matchesManager(mgr, m.value));
      const key = matched ? matched.value : mgr;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [deals, activeFunnel, availableManagers]);

  // Dynamic counts for each term gradation
  const termCounts = useMemo(() => {
    const baseDeals = deals.filter(deal => {
      if (deal.funnel !== activeFunnel) return false;
      if (selectedManagerFilter !== 'all') {
        const mgr = deal.responsibleManager || deal.createdByManager || '';
        return matchesManager(mgr, selectedManagerFilter);
      }
      return true;
    });

    const now = Date.now();
    let count3d = 0;
    let count10d = 0;
    let count30d = 0;
    let count45d = 0;
    let count1y = 0;
    let countOver1y = 0;
    let countAttention = 0;

    baseDeals.forEach(d => {
      const age = Math.max(0, Math.floor((now - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
      if (age <= 3) count3d++;
      if (age <= 10) count10d++;
      if (age <= 30) count30d++;
      if (age <= 45) count45d++;
      if (age <= 365) count1y++;
      if (age > 365) countOver1y++;

      if (d.stage !== 'lost' && d.stage !== 'closed_won' && d.stage !== 'completed') {
        const upd = new Date(d.updatedAt || d.createdAt).getTime();
        const idle = Math.floor((now - upd) / (1000 * 60 * 60 * 24));
        if (idle >= 4) countAttention++;
      }
    });

    return {
      all: baseDeals.length,
      up_to_3d: count3d,
      up_to_10d: count10d,
      up_to_30d: count30d,
      up_to_45d: count45d,
      up_to_1y: count1y,
      over_1y: countOver1y,
      attention: countAttention
    };
  }, [deals, activeFunnel, selectedManagerFilter]);

  // Current logged in user helper for Quick "My Deals" filter
  const currentStaffKey = useMemo(() => {
    if (!currentUser) return 'Скобелев';
    const lastName = currentUser.fullName?.trim().split(/\s+/)[0];
    return lastName || 'Скобелев';
  }, [currentUser]);

  const currentStaffObj = useMemo(() => {
    return availableManagers.find(m => 
      m.value.toLowerCase().includes(currentStaffKey.toLowerCase()) || 
      (m.fullName && m.fullName.toLowerCase().includes(currentStaffKey.toLowerCase()))
    ) || availableManagers[0];
  }, [availableManagers, currentStaffKey]);

  const isCurrentManagerFilterActive = selectedManagerFilter !== 'all' && (
    selectedManagerFilter.toLowerCase().includes(currentStaffKey.toLowerCase()) ||
    (currentStaffObj && selectedManagerFilter.toLowerCase() === currentStaffObj.value.toLowerCase())
  );

  const handleToggleMyDeals = () => {
    if (isCurrentManagerFilterActive) {
      setSelectedManagerFilter('all');
      showToast('Отображены сделки всех менеджеров');
    } else {
      const targetVal = currentStaffObj?.value || 'Скобелев А.С.';
      setSelectedManagerFilter(targetVal);
      showToast(`Включен фильтр ответственного: ${currentStaffObj?.value || targetVal}`);
    }
  };

  // Quick Action / Task assignment in deal modal
  const handleAssignTask = () => {
    if (!selectedDeal || !taskNoteText.trim()) return;
    const timeStr = new Date().toLocaleString('ru-RU');
    const newTimelineItem: TimelineEntry = {
      id: `task-${Date.now()}`,
      date: timeStr,
      title: `Задача ответственного (Срок: ${taskDeadline})`,
      author: currentUser?.fullName || selectedDeal.responsibleManager || 'Менеджер',
      type: 'comment',
      comment: taskNoteText.trim()
    };

    const updatedDeal: ExtendedDeal = {
      ...selectedDeal,
      timeline: [newTimelineItem, ...selectedDeal.timeline],
      updatedAt: new Date().toISOString()
    };

    setSelectedDeal(updatedDeal);
    updateDeal(updatedDeal.id, updatedDeal);
    setTaskNoteText('');
    showToast('Задача зафиксирована в плане действий ответственного');
  };

  // New timeline comment
  const [newComment, setNewComment] = useState('');

  // Load from DB on mount and merge
  useEffect(() => {
    fetchServerData();
  }, []);

  const fetchServerData = async () => {
    setLoading(true);
    try {
      const serverRfqs = await apiService.getServiceRequests();
      if (serverRfqs && serverRfqs.length > 0) {
        // Map any server RFQs to extended deals if not already present
        const mappedRfqs: ExtendedDeal[] = serverRfqs.map((rfq: any) => {
          let f: 'services' | 'equipment' | 'support' = 'services';
          if (rfq.serviceType?.toLowerCase().includes('top') || rfq.serviceType?.toLowerCase().includes('сканер') || rfq.serviceType?.toLowerCase().includes('оборудован')) {
            f = 'equipment';
          } else if (rfq.serviceType?.toLowerCase().includes('поверк') || rfq.serviceType?.toLowerCase().includes('тикет')) {
            f = 'support';
          }

          let stage = 'new';
          if (f === 'equipment') stage = rfq.status === 'completed' ? 'closed_won' : (rfq.status === 'in_progress' ? 'audit' : 'lead');
          else if (f === 'support') stage = rfq.status === 'completed' ? 'closed_won' : (rfq.status === 'in_progress' ? 'diagnostics' : 'ticket');
          else stage = rfq.status === 'completed' ? 'completed' : (rfq.status === 'in_progress' ? 'implementation' : 'new');

          return {
            id: rfq.id,
            customerName: rfq.customerName || 'Заказчик',
            companyName: rfq.companyName || 'ООО ПромТех',
            inn: '6312' + Math.floor(100000 + Math.random() * 900000),
            phone: rfq.phone || '+7 (846) 000-00-00',
            email: rfq.email || 'info@client.ru',
            funnel: f,
            stage: stage,
            serviceType: rfq.serviceType || 'Инженерные услуги',
            details: rfq.details || 'Заявка отправлена через форму обратной связи на сайте.',
            estimatedPrice: rfq.estimatedPrice || 650000,
            cadFormat: rfq.cadFormat || 'STEP',
            createdAt: rfq.createdAt || new Date().toISOString(),
            updatedAt: rfq.updatedAt || new Date().toISOString(),
            utm: { source: 'organic', medium: 'website', campaign: 'lead_form' },
            items: [
              { id: 'i1', name: rfq.serviceType || 'Инженерные услуги', category: 'Услуги', quantity: 1, price: rfq.estimatedPrice || 650000, paymentStatus: 'pending' }
            ],
            timeline: [
              { id: 't1', date: new Date(rfq.createdAt || Date.now()).toLocaleString('ru-RU'), title: 'Создание заявки на сайте', author: 'Система', type: 'system' }
            ],
            documents: [
              { id: 'd1', name: `ТКП_${rfq.id}.pdf`, type: 'proposal', size: '1.4 MB', date: new Date().toLocaleDateString('ru-RU') }
            ]
          };
        });

        // Merge keeping initials first without re-triggering interceptor
        originalSetDeals(prev => {
          const existingIds = new Set(prev.map(d => d.id));
          const newOnes = mappedRfqs.filter(m => !existingIds.has(m.id));
          if (newOnes.length === 0) return prev;
          const merged = [...prev, ...newOnes];
          const seen = new Set<string>();
          return merged.filter(d => {
            if (!d?.id || seen.has(d.id)) return false;
            seen.add(d.id);
            return true;
          });
        });
      }
    } catch (e) {
      console.warn('Could not sync DB deals', e);
    } finally {
      setLoading(false);
    }
  };

  // Funnel Data & Calculations
  const currentFunnelConfig = activeFunnels[activeFunnel];

  useEffect(() => {
    if (currentFunnelConfig?.stages?.length > 0) {
      if (!mobileActiveStage || !currentFunnelConfig.stages.some(s => s.id === mobileActiveStage)) {
        setMobileActiveStage(currentFunnelConfig.stages[0].id);
      }
    }
  }, [currentFunnelConfig, mobileActiveStage]);

  // Kanban Scroll State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [activeFunnel, deals]);

  const scrollBoard = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollToStage = (stageId: string) => {
    setMobileActiveStage(stageId);
    if (scrollContainerRef.current) {
      const el = document.getElementById(`kanban-stage-col-${stageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const filteredDeals = useMemo(() => {
    const seenDealIds = new Set<string>();
    const uniqueDeals = deals.filter(deal => {
      if (!deal?.id || seenDealIds.has(deal.id)) return false;
      seenDealIds.add(deal.id);
      return true;
    });

    return uniqueDeals.filter(deal => {
      // 1. Funnel Match
      if (deal.funnel !== activeFunnel) return false;

      // 2. Manager Filter
      if (selectedManagerFilter !== 'all') {
        const mgr = deal.responsibleManager || deal.createdByManager || '';
        if (!matchesManager(mgr, selectedManagerFilter)) return false;
      }

      // 3. Deal Term / Lifetime Filter (Градация сроков)
      if (dealTermFilter !== 'all') {
        const ageInDays = Math.max(0, Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
        if (dealTermFilter === 'up_to_3d') {
          if (ageInDays > 3) return false;
        } else if (dealTermFilter === 'up_to_10d') {
          if (ageInDays > 10) return false;
        } else if (dealTermFilter === 'up_to_30d') {
          if (ageInDays > 30) return false;
        } else if (dealTermFilter === 'up_to_45d') {
          if (ageInDays > 45) return false;
        } else if (dealTermFilter === 'up_to_1y') {
          if (ageInDays > 365) return false;
        } else if (dealTermFilter === 'over_1y') {
          if (ageInDays <= 365) return false;
        } else if (dealTermFilter === 'attention') {
          if (deal.stage === 'lost' || deal.stage === 'closed_won' || deal.stage === 'completed') {
            return false;
          }
          const updatedDate = new Date(deal.updatedAt || deal.createdAt).getTime();
          const daysWithoutContact = Math.floor((Date.now() - updatedDate) / (1000 * 60 * 60 * 24));
          if (daysWithoutContact < 4) return false;
        }
      }

      // 4. Search Query Filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        deal.id.toLowerCase().includes(q) ||
        deal.companyName?.toLowerCase().includes(q) ||
        deal.customerName.toLowerCase().includes(q) ||
        deal.clientEquipment?.serialNumber?.toLowerCase().includes(q) ||
        deal.serviceType?.toLowerCase().includes(q) ||
        (deal.responsibleManager && deal.responsibleManager.toLowerCase().includes(q)) ||
        (deal.createdByManager && deal.createdByManager.toLowerCase().includes(q))
      );
    });
  }, [deals, activeFunnel, selectedManagerFilter, dealTermFilter, searchQuery]);

  // Financial Metrics
  const pipelineStats = useMemo(() => {
    let totalVolume = 0;
    let weightedRevenue = 0;
    let activeDealsCount = 0;

    filteredDeals.forEach(deal => {
      const stageObj = currentFunnelConfig.stages.find(s => s.id === deal.stage);
      const winRate = stageObj ? stageObj.winRate : 0;
      totalVolume += deal.estimatedPrice || 0;
      weightedRevenue += ((deal.estimatedPrice || 0) * winRate) / 100;
      if (deal.stage !== 'lost') {
        activeDealsCount++;
      }
    });

    return {
      totalVolume,
      weightedRevenue: Math.round(weightedRevenue),
      activeDealsCount,
      totalDealsCount: filteredDeals.length
    };
  }, [filteredDeals, currentFunnelConfig]);

  // Role-based Access Control
  const canEditDeals = isAdmin || currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || !!userPermissions.canEditDeals;
  const canReopenClosedDeals = isAdmin || currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || !!userPermissions.canReopenClosedDeals;
  const canDeleteDeals = isAdmin || currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'manager' || !!userPermissions?.canDeleteDeals || !!userPermissions?.canEditDeals;
  const canExportReports = isAdmin || currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || !!userPermissions.canExportReports;

  const canChangeStage = (deal: ExtendedDeal) => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') return true;
    
    const stageConfig = currentFunnelConfig.stages.find(s => s.id === deal.stage);
    const isClosed = stageConfig && (stageConfig.isWon || stageConfig.isLost);
    if (isClosed) {
      return canReopenClosedDeals;
    }
    
    return canEditDeals;
  };

  // Export report
  const handleExportCsv = () => {
    if (!canExportReports) {
      showToast('У вас нет прав для экспорта аналитических отчетов');
      return;
    }
    const headers = [
      'ID сделки',
      'Воронка',
      'Компания',
      'Контактное лицо (ЛПР)',
      'Телефон',
      'Email',
      'Этап',
      'Сумма (₽)',
      'Вероятность',
      'Ответственный менеджер',
      'Что сделать (Задача)',
      'Срок выполнения',
      'Срок в воронке (дней)',
      'Дата создания'
    ];
    const rows = filteredDeals.map(d => {
      const stageObj = activeFunnels[d.funnel].stages.find(s => s.id === d.stage);
      const nextAction = getDealNextAction(d);
      const dealAge = getDealAgeInfo(d);
      return [
        d.id,
        activeFunnels[d.funnel].name,
        `"${(d.companyName || '').replace(/"/g, '""')}"`,
        `"${(d.customerName || '').replace(/"/g, '""')}"`,
        d.phone || '',
        d.email || '',
        stageObj?.label || d.stage,
        d.estimatedPrice || 0,
        `${stageObj?.winRate || 0}%`,
        `"${(d.responsibleManager || d.createdByManager || 'Не назначен').replace(/"/g, '""')}"`,
        `"${nextAction.action.replace(/"/g, '""')}"`,
        `"${nextAction.timeframe.replace(/"/g, '""')}"`,
        dealAge.days,
        d.createdAt
      ];
    });
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileSuffix = selectedManagerFilter !== 'all' ? selectedManagerFilter.replace(/\s+/g, '_') : 'all';
    link.download = `crm-${activeFunnel}-${fileSuffix}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Отчет по воронке «${currentFunnelConfig.name}» выгружен в CSV`);
  };

  // Delete deal
  const handleDeleteDeal = (dealId: string) => {
    if (!canDeleteDeals) {
      showToast('У вас нет прав для удаления сделок');
      return;
    }
    const target = deals.find(d => d.id === dealId) || (selectedDeal?.id === dealId ? selectedDeal : null);
    if (target) {
      setDealToDelete(target);
    } else {
      deleteDeal(dealId);
      if (selectedDeal?.id === dealId) setSelectedDeal(null);
      showToast('Сделка удалена');
    }
  };

  // Document Management Handlers
  const handleAddDocumentToDeal = (doc: ProjectDocument) => {
    if (!selectedDeal) return;
    const updatedDocs = [...(selectedDeal.documents || []), doc];
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    
    const newTimelineItem: TimelineEntry = {
      id: `tl-${Date.now()}`,
      date: timeStr,
      title: `Прикреплен документ: ${doc.name}`,
      author: currentUser?.fullName || 'Менеджер CRM',
      type: 'document',
      comment: `Категория: ${doc.type}, Размер: ${doc.size}`
    };

    const updatedDeal: ExtendedDeal = {
      ...selectedDeal,
      documents: updatedDocs,
      timeline: [newTimelineItem, ...selectedDeal.timeline],
      updatedAt: new Date().toISOString()
    };

    setSelectedDeal(updatedDeal);
    updateDeal(updatedDeal.id, updatedDeal);
    showToast(`Документ «${doc.name}» успешно прикреплен к сделке`);
  };

  const handleSaveProposalToDeal = (dealId: string, doc: ProjectDocument, proposalData: any) => {
    const targetDeal = deals.find(d => d.id === dealId) || (selectedDeal?.id === dealId ? selectedDeal : null);
    if (!targetDeal) return;

    const updatedDocs = [...(targetDeal.documents || []), doc];
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;

    const newTimelineItem: TimelineEntry = {
      id: `tl-${Date.now()}`,
      date: timeStr,
      title: `Сформировано официальное ТКП: № ${proposalData.number || doc.name}`,
      author: currentUser?.fullName || proposalData.assigneeName || 'Менеджер CRM',
      type: 'document',
      comment: `Сформировано ТКП на сумму ${(proposalData.budget || 0).toLocaleString('ru-RU')} ₽ (в т.ч. НДС 22%). Адресат: ${proposalData.ceoPost || 'Руководитель'} ${proposalData.ceoName || ''}. Режим поставки: ${proposalData.procurementType === '44fz' ? '44-ФЗ' : proposalData.procurementType === '223fz' ? '223-ФЗ' : 'Коммерческий'}. Вставлена гербовая печать и факсимиле.`
    };

    const updatedDeal: ExtendedDeal = {
      ...targetDeal,
      documents: updatedDocs,
      timeline: [newTimelineItem, ...targetDeal.timeline],
      updatedAt: new Date().toISOString()
    };

    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal(updatedDeal);
    }
    updateDeal(dealId, updatedDeal);
    showToast(`ТКП № ${proposalData.number || ''} сохранено в документы сделки`);
  };

  const handleDeleteDocumentFromDeal = (docId: string) => {
    if (!selectedDeal) return;
    const targetDoc = selectedDeal.documents.find(d => d.id === docId);
    const updatedDocs = selectedDeal.documents.filter(d => d.id !== docId);
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    
    const newTimelineItem: TimelineEntry = {
      id: `tl-${Date.now()}`,
      date: timeStr,
      title: `Удален документ: ${targetDoc?.name || docId}`,
      author: currentUser?.fullName || 'Менеджер CRM',
      type: 'comment',
    };

    const updatedDeal: ExtendedDeal = {
      ...selectedDeal,
      documents: updatedDocs,
      timeline: [newTimelineItem, ...selectedDeal.timeline],
      updatedAt: new Date().toISOString()
    };

    setSelectedDeal(updatedDeal);
    updateDeal(updatedDeal.id, updatedDeal);
    showToast(`Документ удален из проекта`);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, deal: ExtendedDeal) => {
    if (!canChangeStage(deal)) {
      e.preventDefault();
      showToast('У вас нет прав для изменения статуса этой заявки');
      return;
    }
    setDraggedDealId(deal.id);
    try {
      e.dataTransfer.setData('text/plain', deal.id);
      e.dataTransfer.setData('dealId', deal.id);
    } catch {}
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedDealId(null);
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    let dealId = '';
    try {
      dealId = e.dataTransfer.getData('dealId') || e.dataTransfer.getData('text/plain');
    } catch {}
    if (!dealId && draggedDealId) {
      dealId = draggedDealId;
    }

    setDraggedDealId(null);
    setDragOverStage(null);
    if (!dealId) return;
    
    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stage === targetStageId) return;
    
    // Check if user has permission
    if (!canChangeStage(deal)) {
      showToast('У вас нет прав для изменения статуса завершенной заявки');
      return;
    }
    
    if (targetStageId === 'lost') {
      setSelectedDeal(deal);
      setIsLossModalOpen(true);
      return;
    }
    
    handleStageChange(dealId, targetStageId);
    const targetStageObj = currentFunnelConfig.stages.find(s => s.id === targetStageId);
    showToast(`Заявка ${dealId} переведена на этап «${targetStageObj?.label || targetStageId}»`);
  };

  // Stage change handler
  const handleStageChange = (dealId: string, newStage: string) => {
    const targetStageObj = currentFunnelConfig.stages.find(s => s.id === newStage);
    if (!targetStageObj) return;

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const newTimelineEntry: TimelineEntry = {
          id: `t-${Date.now()}`,
          date: new Date().toLocaleString('ru-RU'),
          title: `Смена этапа: ${targetStageObj.label}`,
          author: 'Менеджер (CRM)',
          type: 'status_change',
          comment: `Вероятность закрытия: ${targetStageObj.winRate}%`
        };
        return {
          ...d,
          stage: newStage,
          updatedAt: new Date().toISOString(),
          timeline: [newTimelineEntry, ...d.timeline]
        };
      }
      return d;
    }));

    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal(prev => prev ? {
        ...prev,
        stage: newStage,
        updatedAt: new Date().toISOString(),
        timeline: [
          {
            id: `t-${Date.now()}`,
            date: new Date().toLocaleString('ru-RU'),
            title: `Смена этапа: ${targetStageObj.label}`,
            author: 'Менеджер (CRM)',
            type: 'status_change',
            comment: `Вероятность закрытия: ${targetStageObj.winRate}%`
          },
          ...prev.timeline
        ]
      } : null);
    }

    // Persist to server if it's an RFQ
    apiService.updateServiceRequestStatus(dealId, newStage);
    showToast(`Этап обновлен: ${targetStageObj.shortLabel || targetStageObj.label}`);
  };

  // Move to next stage quickly
  const handleNextStage = (deal: ExtendedDeal) => {
    const currentIndex = currentFunnelConfig.stages.findIndex(s => s.id === deal.stage);
    if (currentIndex >= 0 && currentIndex < currentFunnelConfig.stages.length - 2) {
      const nextStage = currentFunnelConfig.stages[currentIndex + 1];
      handleStageChange(deal.id, nextStage.id);
    }
  };

  // Confirm Loss
  const confirmDealLoss = () => {
    if (!selectedDeal) return;
    const finalReason = customLossNote ? `${selectedLossReason}: ${customLossNote}` : selectedLossReason;

    setDeals(prev => prev.map(d => {
      if (d.id === selectedDeal.id) {
        const newTimelineEntry: TimelineEntry = {
          id: `t-${Date.now()}`,
          date: new Date().toLocaleString('ru-RU'),
          title: 'Сделка отменена / Переведена в отказ',
          author: 'Менеджер (CRM)',
          type: 'status_change',
          comment: `Причина: ${finalReason}`
        };
        return {
          ...d,
          stage: 'lost',
          lossReason: finalReason,
          updatedAt: new Date().toISOString(),
          timeline: [newTimelineEntry, ...d.timeline]
        };
      }
      return d;
    }));

    if (selectedDeal) {
      setSelectedDeal(prev => prev ? {
        ...prev,
        stage: 'lost',
        lossReason: finalReason,
        updatedAt: new Date().toISOString(),
        timeline: [
          {
            id: `t-${Date.now()}`,
            date: new Date().toLocaleString('ru-RU'),
            title: 'Сделка отменена / Переведена в отказ',
            author: 'Менеджер (CRM)',
            type: 'status_change',
            comment: `Причина: ${finalReason}`
          },
          ...prev.timeline
        ]
      } : null);
    }

    setIsLossModalOpen(false);
    setCustomLossNote('');
    apiService.updateServiceRequestStatus(selectedDeal.id, 'rejected');
    showToast('Сделка переведена в статус отказа с фиксацией причины');
  };

  // Return to Work
  const confirmReturnToWork = () => {
    if (!selectedDeal) return;
    const finalReason = customReturnNote ? `${selectedReturnReason}: ${customReturnNote}` : selectedReturnReason;
    const firstActiveStage = currentFunnelConfig.stages[0].id;

    setDeals(prev => prev.map(d => {
      if (d.id === selectedDeal.id) {
        const newTimelineEntry: TimelineEntry = {
          id: `t-${Date.now()}`,
          date: new Date().toLocaleString('ru-RU'),
          title: 'Сделка возвращена в работу из архива',
          author: 'Главный инженер / Руководитель',
          type: 'return_to_work',
          comment: `Обоснование: ${finalReason}`
        };
        return {
          ...d,
          stage: firstActiveStage,
          returnReason: finalReason,
          lossReason: undefined,
          updatedAt: new Date().toISOString(),
          timeline: [newTimelineEntry, ...d.timeline]
        };
      }
      return d;
    }));

    if (selectedDeal) {
      setSelectedDeal(prev => prev ? {
        ...prev,
        stage: firstActiveStage,
        returnReason: finalReason,
        lossReason: undefined,
        updatedAt: new Date().toISOString(),
        timeline: [
          {
            id: `t-${Date.now()}`,
            date: new Date().toLocaleString('ru-RU'),
            title: 'Сделка возвращена в работу из архива',
            author: 'Главный инженер / Руководитель',
            type: 'return_to_work',
            comment: `Обоснование: ${finalReason}`
          },
          ...prev.timeline
        ]
      } : null);
    }

    setIsReturnModalOpen(false);
    setCustomReturnNote('');
    apiService.updateServiceRequestStatus(selectedDeal.id, 'open');
    showToast('Сделка успешно возвращена в активную воронку');
  };

  // Change Responsible Manager
  const handleResponsibleManagerChange = (dealId: string, newManager: string) => {
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    
    const newTimelineItem: TimelineEntry = {
      id: `tl-${Date.now()}`,
      date: timeStr,
      title: `Назначен ответственный: ${newManager}`,
      author: currentUser?.fullName || 'Администратор CRM',
      type: 'comment',
      comment: `Смена ответственного лица по сделке на ${newManager}`
    };

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          responsibleManager: newManager,
          timeline: [newTimelineItem, ...d.timeline],
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));

    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal(prev => prev ? {
        ...prev,
        responsibleManager: newManager,
        timeline: [newTimelineItem, ...prev.timeline],
        updatedAt: new Date().toISOString()
      } : null);
    }

    showToast(`Ответственным назначен: ${newManager}`);
  };

  // Clone / Duplicate Deal
  const handleCloneDeal = (deal: ExtendedDeal) => {
    const clonedId = `DEAL-${Date.now().toString().slice(-6)}`;
    const initialStage = activeFunnels[deal.funnel]?.stages[0]?.id || 'lead';
    const clonedDeal: ExtendedDeal = {
      ...deal,
      id: clonedId,
      companyName: deal.companyName ? `${deal.companyName} (Копия)` : deal.customerName,
      stage: initialStage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: `tl-clone-${Date.now()}`,
          date: new Date().toLocaleString('ru-RU'),
          title: `Создан дубликат из сделки ${deal.id}`,
          author: currentUser?.fullName || 'Менеджер CRM',
          type: 'system'
        },
        ...(deal.timeline || [])
      ]
    };
    addDeal(clonedDeal);
    setSelectedDeal(clonedDeal);
    showToast(`Создан дубликат сделки ${clonedId}`);
  };

  // Helper to resolve effective VAT rate for a deal
  const getDealEffectiveVatRate = (deal?: ExtendedDeal | null): number => {
    if (!deal) return 22;
    if (deal.vatMode === 'no_vat' || deal.vatMode === 'export_zero') return 0;
    if (deal.vatRate !== undefined && deal.vatRate !== null) return deal.vatRate;
    return crmSettings?.defaultVatRate ?? 22;
  };

  // Specification Items Handlers (Create, Edit, Delete, Recalculate)
  const handleStartEditItem = (item: DealItemSpec) => {
    if (!canEditDeals) {
      showToast('У вас нет прав на редактирование спецификации');
      return;
    }
    setIsAddingNewItem(false);
    setConfirmDeleteItemId(null);
    setEditingItemId(item.id);
    setEditItemForm({
      name: item.name || '',
      category: item.category || 'Инжиниринговые услуги',
      quantity: item.quantity || 1,
      price: item.price || 0,
      unit: item.unit || 'шт.',
      paymentStatus: item.paymentStatus || 'pending'
    });
  };

  const handleCancelEditItem = () => {
    setEditingItemId(null);
  };

  const handleSaveItem = (dealId: string, itemId: string) => {
    if (!selectedDeal) return;
    
    const qty = Math.max(1, Number(editItemForm.quantity) || 1);
    const prc = Math.max(0, Number(editItemForm.price) || 0);
    const unt = editItemForm.unit || 'шт.';
    const itemName = editItemForm.name.trim() || 'Позиция спецификации';
    const category = editItemForm.category || 'Инжиниринговые услуги';
    const paymentStatus = editItemForm.paymentStatus || 'pending';

    const updatedItems = (selectedDeal.items || []).map(it => {
      if (it.id === itemId) {
        return {
          ...it,
          name: itemName,
          category,
          quantity: qty,
          price: prc,
          unit: unt,
          paymentStatus
        };
      }
      return it;
    });

    const vRate = getDealEffectiveVatRate(selectedDeal);
    const totalWithoutVat = updatedItems.reduce((acc, it) => acc + (it.quantity * it.price), 0);
    const vatAmount = (selectedDeal.vatMode === 'no_vat' || selectedDeal.vatMode === 'export_zero') ? 0 : Math.round(totalWithoutVat * (vRate / 100));
    const newEstimatedPrice = totalWithoutVat + vatAmount;
    const curSym = getCurrencySymbol(selectedDeal.currency);

    const now = new Date();
    const timeStr = `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;

    const vatLabel = selectedDeal.vatMode === 'export_zero' 
      ? 'НДС 0% (Экспорт)' 
      : selectedDeal.vatMode === 'no_vat' 
      ? 'Без НДС' 
      : `в т.ч. НДС ${vRate}%`;

    const newTimelineItem: TimelineEntry = {
      id: `tl-${Date.now()}`,
      date: timeStr,
      title: `Обновлена позиция: ${itemName}`,
      author: currentUser?.fullName || 'Инженер CRM',
      type: 'comment',
      comment: `Изменены параметры спецификации: «${itemName}» (${qty} ${unt} по цене ${prc.toLocaleString('ru-RU')} ${curSym} без НДС, сумма: ${(qty * prc).toLocaleString('ru-RU')} ${curSym} без НДС). ИТОГО без НДС: ${totalWithoutVat.toLocaleString('ru-RU')} ${curSym}, ${vatLabel}: ${vatAmount.toLocaleString('ru-RU')} ${curSym}, ИТОГО с учетом НДС: ${newEstimatedPrice.toLocaleString('ru-RU')} ${curSym}.`
    };

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          items: updatedItems,
          estimatedPrice: newEstimatedPrice > 0 ? newEstimatedPrice : d.estimatedPrice,
          timeline: [newTimelineItem, ...d.timeline],
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));

    setSelectedDeal(prev => prev ? {
      ...prev,
      items: updatedItems,
      estimatedPrice: newEstimatedPrice > 0 ? newEstimatedPrice : prev.estimatedPrice,
      timeline: [newTimelineItem, ...prev.timeline],
      updatedAt: new Date().toISOString()
    } : null);

    setEditingItemId(null);
    showToast(`Позиция «${itemName}» успешно сохранена`);
  };

  const handleAddNewItem = (dealId: string) => {
    if (!selectedDeal) return;
    if (!newItemForm.name.trim()) {
      showToast('Укажите наименование позиции спецификации');
      return;
    }

    const qty = Math.max(1, Number(newItemForm.quantity) || 1);
    const prc = Math.max(0, Number(newItemForm.price) || 0);
    const unt = newItemForm.unit || 'шт.';
    const itemName = newItemForm.name.trim();
    const category = newItemForm.category || 'Инжиниринговые услуги';
    const paymentStatus = newItemForm.paymentStatus || 'pending';

    const newItem: DealItemSpec = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: itemName,
      category,
      quantity: qty,
      unit: unt,
      price: prc,
      paymentStatus
    };

    const updatedItems = [...(selectedDeal.items || []), newItem];
    const vRate = getDealEffectiveVatRate(selectedDeal);
    const totalWithoutVat = updatedItems.reduce((acc, it) => acc + (it.quantity * it.price), 0);
    const vatAmount = (selectedDeal.vatMode === 'no_vat' || selectedDeal.vatMode === 'export_zero') ? 0 : Math.round(totalWithoutVat * (vRate / 100));
    const newEstimatedPrice = totalWithoutVat + vatAmount;
    const curSym = getCurrencySymbol(selectedDeal.currency);

    const now = new Date();
    const timeStr = `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;

    const vatLabel = selectedDeal.vatMode === 'export_zero' 
      ? 'НДС 0% (Экспорт)' 
      : selectedDeal.vatMode === 'no_vat' 
      ? 'Без НДС' 
      : `в т.ч. НДС ${vRate}%`;

    const newTimelineItem: TimelineEntry = {
      id: `tl-${Date.now()}`,
      date: timeStr,
      title: `Добавлена позиция в спецификацию: ${itemName}`,
      author: currentUser?.fullName || 'Инженер CRM',
      type: 'comment',
      comment: `Добавлена позиция спецификации: «${itemName}» (${qty} ${unt} по цене ${prc.toLocaleString('ru-RU')} ${curSym} без НДС, сумма: ${(qty * prc).toLocaleString('ru-RU')} ${curSym} без НДС). ИТОГО без НДС: ${totalWithoutVat.toLocaleString('ru-RU')} ${curSym}, ${vatLabel}: ${vatAmount.toLocaleString('ru-RU')} ${curSym}, ИТОГО с учетом НДС: ${newEstimatedPrice.toLocaleString('ru-RU')} ${curSym}.`
    };

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          items: updatedItems,
          estimatedPrice: newEstimatedPrice > 0 ? newEstimatedPrice : d.estimatedPrice,
          timeline: [newTimelineItem, ...d.timeline],
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));

    setSelectedDeal(prev => prev ? {
      ...prev,
      items: updatedItems,
      estimatedPrice: newEstimatedPrice > 0 ? newEstimatedPrice : prev.estimatedPrice,
      timeline: [newTimelineItem, ...prev.timeline],
      updatedAt: new Date().toISOString()
    } : null);

    setIsAddingNewItem(false);
    setNewItemForm({
      name: '',
      category: 'Инжиниринговые услуги',
      quantity: 1,
      price: 150000,
      unit: 'шт.',
      paymentStatus: 'pending'
    });
    showToast(`Позиция «${itemName}» добавлена в спецификацию`);
  };

  const handleDeleteItem = (dealId: string, itemId: string) => {
    if (!selectedDeal) return;
    const itemToDelete = (selectedDeal.items || []).find(it => it.id === itemId);
    if (!itemToDelete) return;

    const updatedItems = (selectedDeal.items || []).filter(it => it.id !== itemId);
    const vRate = getDealEffectiveVatRate(selectedDeal);
    const totalWithoutVat = updatedItems.reduce((acc, it) => acc + (it.quantity * it.price), 0);
    const vatAmount = (selectedDeal.vatMode === 'no_vat' || selectedDeal.vatMode === 'export_zero') ? 0 : Math.round(totalWithoutVat * (vRate / 100));
    const newEstimatedPrice = totalWithoutVat + vatAmount;
    const curSym = getCurrencySymbol(selectedDeal.currency);

    const now = new Date();
    const timeStr = `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;

    const newTimelineItem: TimelineEntry = {
      id: `tl-${Date.now()}`,
      date: timeStr,
      title: `Удалена позиция: ${itemToDelete.name}`,
      author: currentUser?.fullName || 'Инженер CRM',
      type: 'comment',
      comment: `Позиция «${itemToDelete.name}» (${itemToDelete.quantity} ${itemToDelete.unit || 'шт.'} на сумму ${(itemToDelete.quantity * itemToDelete.price).toLocaleString('ru-RU')} ${curSym} без НДС) удалена из спецификации. ИТОГО с учетом НДС: ${newEstimatedPrice.toLocaleString('ru-RU')} ${curSym}.`
    };

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          items: updatedItems,
          estimatedPrice: newEstimatedPrice,
          timeline: [newTimelineItem, ...d.timeline],
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));

    setSelectedDeal(prev => prev ? {
      ...prev,
      items: updatedItems,
      estimatedPrice: newEstimatedPrice,
      timeline: [newTimelineItem, ...prev.timeline],
      updatedAt: new Date().toISOString()
    } : null);

    if (editingItemId === itemId) {
      setEditingItemId(null);
    }
    setConfirmDeleteItemId(null);
    showToast(`Позиция «${itemToDelete.name}» удалена из спецификации`);
  };

  const handleUpdateDealCurrency = (dealId: string, newCurrency: CurrencyCode) => {
    const curObj = CURRENCIES[newCurrency] || CURRENCIES.RUB;
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;

    const newTimelineItem: TimelineEntry = {
      id: `tl-${Date.now()}`,
      date: timeStr,
      title: `Изменена валюта расчетов: ${curObj.label}`,
      author: currentUser?.fullName || 'Инженер CRM',
      type: 'comment',
      comment: `Установлена валюта спецификации и расчетов по проекту: «${curObj.name}» (${curObj.symbol}, ${curObj.code}). Цены позиций без НДС и ИТОГО с учетом НДС исчисляются в данной валюте.`
    };

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          currency: newCurrency,
          timeline: [newTimelineItem, ...d.timeline],
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));

    setSelectedDeal(prev => prev ? {
      ...prev,
      currency: newCurrency,
      timeline: [newTimelineItem, ...prev.timeline],
      updatedAt: new Date().toISOString()
    } : null);

    showToast(`Валюта спецификации изменена на: ${curObj.label}`);
  };

  // Handle VAT Mode and Custom Rate update in Deal
  const handleUpdateDealVat = (
    dealId: string, 
    newVatMode: 'standard' | 'export_zero' | 'no_vat' | 'custom', 
    newVatRate?: number
  ) => {
    if (!selectedDeal) return;
    const effectiveRate = newVatMode === 'no_vat' || newVatMode === 'export_zero' 
      ? 0 
      : (newVatRate !== undefined ? newVatRate : (newVatMode === 'standard' ? (crmSettings?.defaultVatRate ?? 22) : 22));

    const totalWithoutVat = (selectedDeal.items || []).reduce((acc, it) => acc + (it.quantity * it.price), 0);
    const vatAmount = (newVatMode === 'no_vat' || newVatMode === 'export_zero') ? 0 : Math.round(totalWithoutVat * (effectiveRate / 100));
    const newEstimatedPrice = totalWithoutVat > 0 ? (totalWithoutVat + vatAmount) : selectedDeal.estimatedPrice;

    const modeLabels: Record<string, string> = {
      standard: `Стандартная ставка (${effectiveRate}%)`,
      export_zero: 'НДС 0% (Экспорт в страны СНГ / ЕАЭС / ст. 164 НК РФ)',
      no_vat: 'Без НДС (УСН / спецрежим)',
      custom: `Индивидуальная ставка (${effectiveRate}%)`
    };
    const modeLabel = modeLabels[newVatMode] || `НДС ${effectiveRate}%`;

    const now = new Date();
    const timeStr = `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;

    const newTimelineItem: TimelineEntry = {
      id: `tl-${Date.now()}`,
      date: timeStr,
      title: `Изменен режим НДС: ${modeLabel}`,
      author: currentUser?.fullName || 'Инженер / Бухгалтерия CRM',
      type: 'comment',
      comment: `Установлен режим налогообложения: ${modeLabel}. Пересчитана итоговая стоимость сделки.`
    };

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          vatMode: newVatMode,
          vatRate: effectiveRate,
          estimatedPrice: newEstimatedPrice,
          timeline: [newTimelineItem, ...d.timeline],
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));

    setSelectedDeal(prev => prev ? {
      ...prev,
      vatMode: newVatMode,
      vatRate: effectiveRate,
      estimatedPrice: newEstimatedPrice,
      timeline: [newTimelineItem, ...prev.timeline],
      updatedAt: new Date().toISOString()
    } : null);

    showToast(`Настройка НДС обновлена: ${modeLabel}`);
  };

  // Add Comment to Timeline
  const handleAddComment = () => {
    if (!selectedDeal || !newComment.trim()) return;

    const entry: TimelineEntry = {
      id: `t-${Date.now()}`,
      date: new Date().toLocaleString('ru-RU'),
      title: 'Инженерная / Коммерческая заметка',
      author: currentUser?.fullName || 'Инженер / Менеджер',
      type: 'comment',
      comment: newComment.trim()
    };

    setDeals(prev => prev.map(d => {
      if (d.id === selectedDeal.id) {
        return { ...d, timeline: [entry, ...d.timeline] };
      }
      return d;
    }));

    setSelectedDeal(prev => prev ? { ...prev, timeline: [entry, ...prev.timeline] } : null);
    setNewComment('');
    showToast('Заметка добавлена в историю сделки');
  };

  // Create New Deal
  const handleCreateNewDeal = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for duplicate deal with the same title for the selected company
    if (duplicateExistingDeal) {
      const dealTitle = (newDealForm.catalogSelection !== 'other' && newDealForm.catalogSelection ? newDealForm.catalogSelection : newDealForm.serviceType).trim();
      const stageObj = activeFunnels[duplicateExistingDeal.funnel]?.stages?.find(s => s.id === duplicateExistingDeal.stage);
      const stageLabel = stageObj?.label || duplicateExistingDeal.stage;
      
      alert(
        `Внимание! Сделка с таким наименованием уже существует для данной компании:\n\n` +
        `• Организация: ${duplicateExistingDeal.companyName || newDealForm.companyName}\n` +
        `• Наименование: ${dealTitle}\n` +
        `• Номер сделки: ${duplicateExistingDeal.id}\n` +
        `• Воронка: ${activeFunnels[duplicateExistingDeal.funnel]?.name || duplicateExistingDeal.funnel}\n` +
        `• Текущий этап: ${stageLabel}\n` +
        `• Ответственный: ${duplicateExistingDeal.responsibleManager || duplicateExistingDeal.createdByManager || 'Не назначен'}\n\n` +
        `Добавление дубликата заблокировано во избежание задвоения сделок в CRM. Измените наименование сделки или откройте существующую.`
      );
      showToast(`Ошибка: сделка «${dealTitle}» уже существует для выбранной компании (${duplicateExistingDeal.id})`);
      return;
    }

    const lowerType = (newDealForm.serviceType + ' ' + newDealForm.details).toLowerCase();
    const isScannerOrArm = lowerType.includes('сканер') || lowerType.includes('arm') || lowerType.includes('рука') || lowerType.includes('freescan') || lowerType.includes('мобильн');
    if (isScannerOrArm && lowerType.includes('topsolid')) {
      alert('Внимание: ПО «TopSolid 7» применяется для CAM/CAD мехобработки на станках с ЧПУ и не закупается для 3D-сканирования и измерений.\n\nДля сканеров и мобильных КИМ выберите метрологическое ПО PolyWorks|Inspector, PolyWorks|Modeler, Geomagic Design X / Control X или SHINING 3D Inspect.');
      return;
    }

    const newId = `СДЕЛКА-2026-${Math.floor(100 + Math.random() * 900)}`;
    const dealTitle = newDealForm.catalogSelection !== 'other' && newDealForm.catalogSelection ? newDealForm.catalogSelection : (newDealForm.serviceType || 'Поставка измерительной системы и ПО');

    const newDeal: ExtendedDeal = {
      id: newId,
      title: dealTitle,
      customerName: newDealForm.customerName || 'Новый клиент',
      customerPost: newDealForm.customerPost || undefined,
      companyName: newDealForm.companyName || 'ООО ПромИнжиниринг',
      companyId: newDealForm.companyId || undefined,
      contactId: newDealForm.contactId || undefined,
      inn: newDealForm.inn || '6312' + Math.floor(100000 + Math.random() * 900000),
      kpp: newDealForm.kpp || undefined,
      address: newDealForm.address || undefined,
      ceoName: newDealForm.ceoName || undefined,
      ceoPost: newDealForm.ceoPost || undefined,
      phone: newDealForm.phone || '+7 (846) 954-00-00',
      email: newDealForm.email || 'info@partner.ru',
      funnel: newDealForm.funnel,
      stage: activeFunnels[newDealForm.funnel].stages[0].id,
      serviceType: dealTitle,
      details: newDealForm.details || 'Первичный запрос через панель CRM.',
      estimatedPrice: Number(newDealForm.estimatedPrice) || 1200000,
      currency: newDealForm.currency || 'RUB',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByManager: currentUser ? currentUser.fullName : 'Скобелев А.С.',
      responsibleManager: newDealForm.responsibleManager || (currentUser ? currentUser.fullName : 'Скобелев А.С.'),
      clientEquipment: newDealForm.equipmentSerial ? {
        model: 'Mitutoyo / Shining3D',
        serialNumber: newDealForm.equipmentSerial,
        warrantyUntil: '2027-12-31',
        verificationDate: '2027-06-01',
        daysUntilVerification: 270
      } : undefined,
      utm: { source: 'crm_manual', medium: 'direct', campaign: 'sales_department' },
      items: [
        { id: 'i1', name: newDealForm.catalogSelection !== 'other' && newDealForm.catalogSelection ? newDealForm.catalogSelection : (newDealForm.serviceType || 'Оборудование / Услуга'), category: 'Основное', quantity: 1, price: Number(newDealForm.estimatedPrice) || 1200000, paymentStatus: 'pending' }
      ],
      timeline: [
        { id: 't1', date: new Date().toLocaleString('ru-RU'), title: 'Сделка создана вручную в CRM', author: currentUser?.fullName || 'Менеджер отдела продаж', type: 'system' }
      ],
      documents: newDealAttachedFile ? [
        { 
          id: `d_user_${Date.now()}`, 
          name: newDealAttachedFile.name, 
          type: newDealAttachedFile.name.endsWith('.pdf') ? 'proposal' : 'drawing', 
          size: `${(newDealAttachedFile.size / 1024 / 1024).toFixed(1)} MB`, 
          date: new Date().toLocaleDateString('ru-RU') 
        }
      ] : []
    };

    addDeal(newDeal);
    setActiveFunnel(newDealForm.funnel);
    setIsNewDealModalOpen(false);
    setNewDealForm({
      companyId: '',
      companyName: '',
      customerName: '',
      customerPost: '',
      inn: '',
      kpp: '',
      address: '',
      ceoName: '',
      ceoPost: 'Генеральный директор',
      contactId: '',
      phone: '',
      email: '',
      serviceType: '',
      catalogSelection: '',
      estimatedPrice: 1500000,
      currency: 'RUB',
      funnel: 'equipment',
      details: '',
      equipmentSerial: '',
      responsibleManager: currentUser?.fullName || 'Скобелев А.С.'
    });
    setNewDealAttachedFile(null);
    showToast(`Сделка ${newId} успешно зарегистрирована`);
  };

  return (
    <div className="space-y-6">
      {activeTab === 'funnels' && (
        <div className="space-y-6">
          {/* 1. Header & Consolidated Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Управление сделками и воронка продаж</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Канбан-доски процессов продаж оборудования, услуг и сервисного обслуживания
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsStageEditorOpen(true)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white text-indigo-800 dark:text-indigo-300 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Настройка этапов в воронках продаж"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Настройка этапов</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVatSettingsOpen(true)}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white text-emerald-900 dark:text-emerald-300 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Базовая ставка НДС (22%), расчет для экспорта (0%) и правила"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Ставка НДС ({crmSettings?.defaultVatRate ?? 22}%)</span>
                </button>
                <button
                  onClick={handleExportCsv}
                  className={`h-8 flex items-center gap-1.5 px-3 text-xs font-bold rounded-lg border transition-all shrink-0 cursor-pointer ${
                    canExportReports
                      ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 shadow-2xs'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                  title={canExportReports ? 'Экспорт воронки в CSV-файл' : 'Экспорт отключен'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Экспорт CSV</span>
                </button>
                <button
                  onClick={() => {
                    if (!canEditDeals) {
                      showToast('У вас нет прав для создания сделок');
                      return;
                    }
                    setIsNewDealModalOpen(true);
                  }}
                  className={`h-8 flex items-center gap-1.5 px-3.5 text-xs font-bold rounded-lg shadow-xs transition-all shrink-0 cursor-pointer ${
                    canEditDeals
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-98'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                  title={canEditDeals ? 'Создать новую сделку' : 'Создание сделок отключено администратором'}
                >
                  {canEditDeals ? <Plus className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Новая сделка</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Compact Interactive Funnel Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {(Object.keys(activeFunnels) as Array<keyof typeof activeFunnels>).map(key => {
              const funnel = activeFunnels[key as keyof typeof activeFunnels];
              const Icon = getFunnelIconComponent(funnel.icon);
              const isActive = activeFunnel === key;
              const count = deals.filter(d => d.funnel === key).length;
              const funnelVolume = deals
                .filter(d => d.funnel === key && d.stage !== 'lost')
                .reduce((acc, d) => acc + (d.estimatedPrice || 0), 0);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveFunnel(key)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/20' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-bold text-xs truncate">{funnel.name}</div>
                      <div className={`text-[11px] font-semibold truncate ${isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {funnelVolume > 0 ? `${(funnelVolume / 1000000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} млн ₽ в воронке` : '0 ₽'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 border ${
                    isActive ? 'bg-white text-blue-800 border-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. High-Density Stats Strip & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-3">
            {/* KPI Metric Strip (Read-Only) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800 text-xs">
              {/* Funnel Total Volume */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-lg">
                <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                  ₽
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {selectedManagerFilter !== 'all' ? 'Объем менеджера' : 'Объем воронки'}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate" title={`${pipelineStats.totalVolume.toLocaleString('ru-RU')} ₽`}>
                    {pipelineStats.totalVolume >= 1000000 
                      ? `${(pipelineStats.totalVolume / 1000000).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} млн ₽`
                      : `${pipelineStats.totalVolume.toLocaleString('ru-RU')} ₽`}
                  </div>
                </div>
              </div>

              {/* Weighted Forecast */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900 rounded-lg">
                <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Взвешенный прогноз
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-200 truncate" title={`${pipelineStats.weightedRevenue.toLocaleString('ru-RU')} ₽`}>
                    {pipelineStats.weightedRevenue >= 1000000 
                      ? `${(pipelineStats.weightedRevenue / 1000000).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} млн ₽`
                      : `${pipelineStats.weightedRevenue.toLocaleString('ru-RU')} ₽`}
                  </div>
                </div>
              </div>

              {/* Active Deals Count */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900 rounded-lg">
                <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  {pipelineStats.activeDealsCount}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    {selectedManagerFilter !== 'all' ? 'Сделок менеджера' : 'Активных сделок'}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 whitespace-nowrap">
                    {pipelineStats.activeDealsCount} <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">из {pipelineStats.totalDealsCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Unified Ergonomic Filter & Search Toolbar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              {/* Left: Filter Controls Group */}
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                {/* Manager Dropdown */}
                <div className="h-9 relative flex items-center bg-slate-50/90 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 transition-all text-xs">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0 mr-1.5" />
                  <select
                    id="crm-manager-filter-select"
                    value={selectedManagerFilter}
                    onChange={(e) => {
                      setSelectedManagerFilter(e.target.value);
                      if (e.target.value !== 'all') {
                        showToast(`Фильтр воронки: ${e.target.value}`);
                      } else {
                        showToast('Показаны сделки всех ответственных менеджеров');
                      }
                    }}
                    className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer pr-1 truncate max-w-[360px]"
                  >
                    <option value="all">Все менеджеры ({deals.filter(d => d.funnel === activeFunnel).length})</option>
                    {availableManagers.map((mgr, idx) => {
                      const count = managerDealsCount[mgr.value] || 0;
                      return (
                        <option key={`${mgr.value}_${idx}`} value={mgr.value}>
                          {mgr.label} [{count}]
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Quick "My Deals" Toggle */}
                <button
                  id="crm-my-deals-toggle-btn"
                  type="button"
                  onClick={handleToggleMyDeals}
                  className={`h-9 flex items-center gap-1.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer border shrink-0 ${
                    isCurrentManagerFilterActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs ring-2 ring-blue-400/30'
                      : 'bg-slate-50/90 hover:bg-slate-100 text-slate-700 hover:text-blue-700 border-slate-200'
                  }`}
                  title={isCurrentManagerFilterActive ? 'Сбросить фильтр и показать всех' : `Показать только мои сделки (${currentStaffObj?.value || 'Ответственный'})`}
                >
                  {isCurrentManagerFilterActive ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-white" />
                      <span>Мои сделки ({currentStaffObj?.value || 'Мои'})</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Мои сделки</span>
                    </>
                  )}
                </button>

                {/* Term Filter */}
                <div className="h-9 relative flex items-center bg-slate-50/90 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 transition-all text-xs">
                  <CalendarClock className="w-3.5 h-3.5 text-blue-600 shrink-0 mr-1.5" />
                  <select
                    id="crm-term-filter-select"
                    value={dealTermFilter}
                    onChange={(e) => {
                      const val = e.target.value as DealTermFilter;
                      setDealTermFilter(val);
                      if (val === 'all') {
                        showToast('Показаны сделки за все сроки');
                      } else if (val === 'attention') {
                        showToast('Фильтр: сделки, требующие внимания (>4 дн. без контакта)');
                      } else {
                        const labels: Record<string, string> = {
                          up_to_3d: 'до 3 дней',
                          up_to_10d: 'до 10 дней',
                          up_to_30d: 'до 1 месяца',
                          up_to_45d: 'до 45 дней',
                          up_to_1y: 'до 1 года',
                          over_1y: 'более 1 года',
                        };
                        showToast(`Фильтр по срокам: ${labels[val] || val}`);
                      }
                    }}
                    className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer pr-1 truncate max-w-[190px]"
                  >
                    <option value="all">Все сроки ({termCounts.all})</option>
                    <option value="up_to_3d">до 3 дней ({termCounts.up_to_3d})</option>
                    <option value="up_to_10d">до 10 дней ({termCounts.up_to_10d})</option>
                    <option value="up_to_30d">до 1 месяца ({termCounts.up_to_30d})</option>
                    <option value="up_to_45d">до 45 дней ({termCounts.up_to_45d})</option>
                    <option value="up_to_1y">до 1 года ({termCounts.up_to_1y})</option>
                    <option value="over_1y">более 1 года ({termCounts.over_1y})</option>
                    <option value="attention">⚠️ Внимание (&gt;4 дн) ({termCounts.attention})</option>
                  </select>
                </div>

                {/* Quick Reset Button if active */}
                {(selectedManagerFilter !== 'all' || dealTermFilter !== 'all' || searchQuery.trim() !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedManagerFilter('all');
                      setDealTermFilter('all');
                      setSearchQuery('');
                      showToast('Все фильтры сброшены');
                    }}
                    className="h-9 flex items-center gap-1 px-4 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all cursor-pointer shrink-0"
                    title="Сбросить все активные фильтры и поиск"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Сбросить</span>
                  </button>
                )}
              </div>

              {/* Right: View Mode Toggle & Search Box */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
                {/* Segmented Display Mode Switcher (Kanban vs Table) */}
                <div className="h-9 flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setDealDisplayMode('kanban');
                      showToast('Режим отображения: Канбан-доска');
                    }}
                    className={`h-full flex items-center gap-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      dealDisplayMode === 'kanban'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Отображение воронки в виде интерактивной Канбан-доски"
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Канбан</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDealDisplayMode('list');
                      showToast('Режим отображения: Табличный реестр сделок');
                    }}
                    className={`h-full flex items-center gap-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      dealDisplayMode === 'list'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Отображение воронки в виде компактной таблицы со всеми сделками"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Таблица</span>
                  </button>
                </div>

                {/* Compact Column Toggle (only in Kanban mode) */}
                {dealDisplayMode === 'kanban' && (
                  <button
                    id="crm-kanban-view-mode-btn"
                    type="button"
                    onClick={() => {
                      const next = !isCompactKanban;
                      setIsCompactKanban(next);
                      showToast(next ? 'Компактный вид колонок (270px)' : 'Стандартный вид колонок (320px)');
                    }}
                    className={`h-9 flex items-center gap-1.5 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer shrink-0 ${
                      isCompactKanban
                        ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-400/20 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                        : 'bg-slate-50/90 hover:bg-slate-100 text-slate-700 hover:text-blue-700 border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                    }`}
                    title={isCompactKanban ? 'Переключить на стандартный просторный вид колонок (320px)' : 'Переключить на компактный вид колонок (270px)'}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{isCompactKanban ? 'Компактные' : 'Стандартные'}</span>
                  </button>
                )}

                {/* Search Input */}
                <div className="relative flex-1 sm:w-52 md:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    id="crm-search-deals-input"
                    type="text"
                    placeholder="Поиск по сделке, ЛПР, №..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full pl-9 pr-7 text-xs font-medium bg-slate-50/90 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-500 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

      {/* Active Filter Compact Status (only shown if a filter is active) */}
      {(selectedManagerFilter !== 'all' || dealTermFilter !== 'all') && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-lg px-4.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
          <div className="flex flex-wrap items-center gap-2 text-blue-900">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 ring-2 ring-blue-200" />
            <span className="font-bold">Активный срез:</span>
            {selectedManagerFilter !== 'all' && (
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1 shadow-2xs">
                <UserCheck className="w-3 h-3" />
                {availableManagers.find(m => m.value.toLowerCase().includes(selectedManagerFilter.toLowerCase()))?.label || selectedManagerFilter}
              </span>
            )}
            {dealTermFilter !== 'all' && (
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border flex items-center gap-1 ${
                dealTermFilter === 'attention' 
                  ? 'bg-amber-100 text-amber-950 border-amber-300' 
                  : 'bg-blue-100 text-blue-950 border-blue-300'
              }`}>
                <CalendarClock className="w-3 h-3 text-blue-700" />
                {dealTermFilter === 'up_to_3d' && 'до 3 дней'}
                {dealTermFilter === 'up_to_10d' && 'до 10 дней'}
                {dealTermFilter === 'up_to_30d' && 'до 1 месяца'}
                {dealTermFilter === 'up_to_45d' && 'до 45 дней'}
                {dealTermFilter === 'up_to_1y' && 'до 1 года'}
                {dealTermFilter === 'over_1y' && 'более 1 года'}
                {dealTermFilter === 'attention' && '⚠️ Требуют внимания (>4 дн)'}
              </span>
            )}
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">
              Сделок в выборке: <strong className="text-slate-900">{pipelineStats.totalDealsCount}</strong> (активных: <strong className="text-emerald-700">{pipelineStats.activeDealsCount}</strong>) • Объем: <strong className="text-slate-900">{pipelineStats.totalVolume.toLocaleString('ru-RU')} ₽</strong>
            </span>
          </div>

          <button
            onClick={() => {
              setSelectedManagerFilter('all');
              setDealTermFilter('all');
              showToast('Фильтры сброшены: отображены все сделки компании');
            }}
            className="text-[11px] font-bold text-blue-700 hover:text-blue-950 underline hover:no-underline cursor-pointer transition-colors shrink-0 ml-auto"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* 2.5 Mobile Stage Carousel & View Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Этапы воронки:</span>
            </span>
            <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">
              ({currentFunnelConfig.stages.length} этапов)
            </span>
            <button
              type="button"
              onClick={() => setIsStageEditorOpen(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline cursor-pointer ml-1"
              title="Создать, удалить или отредактировать этапы воронки"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Настроить</span>
            </button>
          </div>

          {/* View Mode Toggle: Stage List vs Kanban */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMobileLayoutMode('stage-list')}
              className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                mobileLayoutMode === 'stage-list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-300 hover:text-gray-900'
              }`}
              title="Мобильный режим: детальный просмотр сделок выбранного этапа без горизонтальной прокрутки"
            >
              <List className="w-3.5 h-3.5" />
              <span>По этапам</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileLayoutMode('kanban-scroll')}
              className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                mobileLayoutMode === 'kanban-scroll'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-300 hover:text-gray-900'
              }`}
              title="Классическая канбан-доска со всеми колонками"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Канбан-доска</span>
            </button>
          </div>
        </div>

        {/* Scrollable Stage Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-1">
          {currentFunnelConfig.stages.map((stage) => {
            const stageDeals = filteredDeals.filter(d => {
              if (stage.id === 'lost') return d.stage === 'lost';
              if (stage.id === 'closed_won' || stage.id === 'completed') {
                return d.stage === 'closed_won' || d.stage === 'completed';
              }
              return d.stage === stage.id;
            });
            const isSelected = (mobileActiveStage || currentFunnelConfig.stages[0]?.id) === stage.id;
            const stageTheme = getStageTheme(stage);
            const stageHeader = formatStageHeader(stage.label);

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  scrollToStage(stage.id);
                }}
                className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-950 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-100 ring-2 ring-blue-400/30 shadow-xs'
                    : 'bg-slate-50 border-gray-200 text-slate-500 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${stageTheme.stripe}`} />
                <span className="truncate max-w-[140px] sm:max-w-none">
                  {stageHeader.stepNumber ? `${stageHeader.stepNumber}. ` : ''}{stage.shortLabel || stage.label}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-slate-500 dark:text-slate-200'
                }`}>
                  {stageDeals.length}
                </span>
                <span className={`text-[10px] font-medium hidden sm:inline ${stageTheme.percent}`}>
                  {stage.winRate}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3A. Mobile Stage List View (Single stage cards list for smartphone touchscreens) */}
      {mobileLayoutMode === 'stage-list' && (() => {
        const activeStageIndex = currentFunnelConfig.stages.findIndex(s => s.id === (mobileActiveStage || currentFunnelConfig.stages[0]?.id));
        const safeIdx = activeStageIndex >= 0 ? activeStageIndex : 0;
        const currentStage = currentFunnelConfig.stages[safeIdx];
        const prevStage = safeIdx > 0 ? currentFunnelConfig.stages[safeIdx - 1] : null;
        const nextStage = safeIdx < currentFunnelConfig.stages.length - 1 ? currentFunnelConfig.stages[safeIdx + 1] : null;

        const stageDeals = filteredDeals.filter(d => {
          if (currentStage.id === 'lost') return d.stage === 'lost';
          if (currentStage.id === 'closed_won' || currentStage.id === 'completed') {
            return d.stage === 'closed_won' || d.stage === 'completed';
          }
          return d.stage === currentStage.id;
        });

        const stageSum = stageDeals.reduce((sum, d) => sum + (d.estimatedPrice || 0), 0);
        const stageHeader = formatStageHeader(currentStage.label);
        const stageTheme = getStageTheme(currentStage);

        return (
          <div className="space-y-4 pb-28 sm:pb-8">
            {/* Active Stage Banner */}
            <div className="p-4 sm:p-5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {stageHeader.stepNumber ? (
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black shrink-0 mt-0.5 border ${stageTheme.badge}`}>
                      {stageHeader.stepNumber}
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight break-words">
                      {stageHeader.title}
                    </h3>
                    {stageHeader.subtitle && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {stageHeader.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${stageTheme.badge}`}>
                    {currentStage.winRate}% вероятность
                  </span>
                  <span className="text-xs font-black bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-700">
                    {stageDeals.length} сделок
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Объем сделок на этапе:</span>
                <span className="text-sm font-black text-gray-900 dark:text-white font-mono">
                  {stageSum.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            {/* List of Deals */}
            {stageDeals.length === 0 ? (
              <div className="p-8 bg-white dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">На этом этапе пока нет сделок</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {selectedManagerFilter !== 'all'
                    ? 'У выбранного менеджера нет сделок на этом этапе. Попробуйте сбросить фильтр.'
                    : 'Сделки появятся здесь при смене этапа или регистрации новых заявок.'}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  {nextStage && (
                    <button
                      type="button"
                      onClick={() => setMobileActiveStage(nextStage.id)}
                      className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Перейти к «{nextStage.shortLabel || nextStage.label}»
                    </button>
                  )}
                  {prevStage && (
                    <button
                      type="button"
                      onClick={() => setMobileActiveStage(prevStage.id)}
                      className="px-4.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      К «{prevStage.shortLabel || prevStage.label}»
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {stageDeals.map(deal => {
                  const dealAge = getDealAgeInfo(deal);
                  const isVerificationClose = deal.clientEquipment?.daysUntilVerification && deal.clientEquipment.daysUntilVerification <= 45;
                  const nextAction = getDealNextAction(deal);
                  const isAssignedToCurrentUser = !!(
                    currentUser && 
                    (deal.responsibleManager || deal.createdByManager || '').toLowerCase().includes(
                      (currentUser.fullName?.split(/\s+/)[0] || '---').toLowerCase()
                    )
                  );

                  return (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      className={`bg-white dark:bg-slate-900 border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer space-y-3 group shadow-[0_2px_8px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.14),0_4px_10px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.7)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.99] ${
                        deal.stage === 'lost'
                          ? 'border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20 border-l-4 border-l-rose-500'
                          : (currentStage.isWon 
                              ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500'
                              : `border-slate-300 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-400 ${
                                  deal.funnel === 'equipment' ? 'border-l-4 border-l-blue-600' :
                                  deal.funnel === 'services' ? 'border-l-4 border-l-teal-600' : 'border-l-4 border-l-amber-500'
                                }`
                            )
                      }`}
                    >
                      {/* Top: ID, Date, Age & Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-300 font-mono tracking-wider transition-colors">
                            {deal.id}
                          </span>
                          {isAssignedToCurrentUser && (
                            <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800 px-2 py-0.5 rounded-md shadow-2xs">
                              Моя сделка
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${
                            dealAge.days <= 3 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                              : dealAge.days <= 10
                              ? 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700'
                              : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}>
                            {dealAge.days <= 3 ? 'до 3 дн.' : dealAge.days <= 10 ? 'до 10 дн.' : dealAge.text}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {new Date(deal.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>

                      {/* Company & Client */}
                      <div>
                        <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {deal.companyName || deal.customerName}
                        </h4>
                        {deal.companyName && deal.customerName && (
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>ЛПР: {deal.customerName}</span>
                          </div>
                        )}
                      </div>

                      {/* Service / Equipment */}
                      <div className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/90 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
                        {deal.serviceType}
                      </div>

                      {/* Client Equipment Alert */}
                      {deal.clientEquipment && (
                        <div className="p-2 rounded-lg text-[11px] font-bold flex items-center justify-between bg-amber-50 text-amber-950 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700 shadow-2xs">
                          <span className="flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-amber-600" />
                            <span>Зав. № {deal.clientEquipment.serialNumber}</span>
                          </span>
                          {isVerificationClose && (
                            <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black">
                              Поверка: {deal.clientEquipment.daysUntilVerification} дн.
                            </span>
                          )}
                        </div>
                      )}

                      {/* Next Action */}
                      {deal.stage !== 'lost' && (
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 min-w-0 font-medium">
                            <CalendarClock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{nextAction.action}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0 font-bold">
                            {nextAction.timeframe}
                          </span>
                        </div>
                      )}

                      {/* Touch Contact Buttons (Min 44px height for mobile accessibility) */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {deal.phone ? (
                          <a
                            href={`tel:${deal.phone}`}
                            className="flex-1 min-h-[44px] px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-xs border border-emerald-300 hover:border-emerald-600 flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-sm active:scale-95 active:bg-emerald-700"
                            title={`Позвонить ${deal.phone}`}
                          >
                            <Phone className="w-4 h-4 text-emerald-600 group-hover/btn:text-white" />
                            <span>Позвонить</span>
                          </a>
                        ) : null}
                        {deal.email ? (
                          <a
                            href={`mailto:${deal.email}`}
                            className="flex-1 min-h-[44px] px-4 py-2 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-800 hover:text-white font-bold text-xs border border-sky-300 hover:border-sky-600 flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-sm active:scale-95 active:bg-sky-700"
                            title={`Написать на ${deal.email}`}
                          >
                            <Mail className="w-4 h-4 text-sky-600 group-hover/btn:text-white" />
                            <span>Email</span>
                          </a>
                        ) : null}
                      </div>

                      {/* Footer: Price & Quick Stage Transition Dropdown */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
                        <div className="text-xs sm:text-sm font-black text-slate-950 dark:text-white font-mono">
                          {deal.estimatedPrice ? formatCurrency(deal.estimatedPrice, deal.currency) : 'По запросу'}
                        </div>

                        {canChangeStage(deal) && currentStage.id !== 'lost' && !currentStage.isWon && (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={deal.stage}
                              onChange={(e) => handleStageChange(deal.id, e.target.value)}
                              className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all max-w-[150px] truncate shadow-2xs"
                              title="Изменить этап сделки"
                            >
                              {currentFunnelConfig.stages.map(stg => (
                                <option key={stg.id} value={stg.id}>
                                  {stg.shortLabel || stg.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleNextStage(deal)}
                              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-90 text-white transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-sm"
                              title="Перевести на следующий этап"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Stage Navigation Pager */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 flex items-center justify-between gap-3">
              {prevStage ? (
                <button
                  type="button"
                  onClick={() => setMobileActiveStage(prevStage.id)}
                  className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors cursor-pointer flex-1 justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="truncate">← {prevStage.shortLabel || prevStage.label}</span>
                </button>
              ) : (
                <div className="flex-1" />
              )}

              {nextStage ? (
                <button
                  type="button"
                  onClick={() => setMobileActiveStage(nextStage.id)}
                  className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer flex-1 justify-center shadow-xs"
                >
                  <span className="truncate">{nextStage.shortLabel || nextStage.label} →</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </div>
        );
      })()}

      {/* 3B. Kanban Board Horizontal View */}
      {mobileLayoutMode === 'kanban-scroll' && (
      <div className="relative group">
        {/* Left Scroll Button */}
        <button 
          onClick={() => scrollBoard('left')}
          disabled={!canScrollLeft}
          title="Прокрутить влево"
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-slate-300 dark:border-slate-700 shadow-lg shadow-slate-900/15 transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-blue-600 hover:border-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:border-blue-600 focus:outline-none flex items-center justify-center cursor-pointer ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100 text-slate-700 dark:text-slate-200'}`}
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
        </button>

        {/* Right Scroll Button */}
        <button 
          onClick={() => scrollBoard('right')}
          disabled={!canScrollRight}
          title="Прокрутить вправо"
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-slate-300 dark:border-slate-700 shadow-lg shadow-slate-900/15 transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-blue-600 hover:border-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:border-blue-600 focus:outline-none flex items-center justify-center cursor-pointer ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100 text-slate-700 dark:text-slate-200'}`}
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
        </button>

        {dealDisplayMode === 'kanban' ? (
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="bg-slate-200/70 dark:bg-slate-950/80 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-3 sm:p-5 min-h-[580px] overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory shadow-inner"
        >
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500 font-medium">Синхронизация данных CRM...</div>
        ) : (
          <div className="flex gap-4 min-w-max pb-4">
            {currentFunnelConfig.stages.map(stage => {
              const stageDeals = filteredDeals.filter(d => {
                if (stage.id === 'lost') return d.stage === 'lost';
                if (stage.id === 'closed_won' || stage.id === 'completed') {
                  return d.stage === 'closed_won' || d.stage === 'completed';
                }
                return d.stage === stage.id;
              });

              const stageSum = stageDeals.reduce((sum, d) => sum + (d.estimatedPrice || 0), 0);
              const isCollapsed = collapsedStages.includes(stage.id);
              const stageHeader = formatStageHeader(stage.label);
              const stageTheme = getStageTheme(stage);

              if (isCollapsed) {
                return (
                  <div
                    key={stage.id}
                    onClick={() => toggleCollapseStage(stage.id)}
                    className="w-12 shrink-0 bg-white dark:bg-slate-900 hover:bg-blue-50/70 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 rounded-xl p-2 flex flex-col items-center justify-between cursor-pointer transition-all group shadow-sm"
                    title={`Развернуть этап «${stage.label}» (${stageDeals.length} сделок)`}
                  >
                    <div className="flex flex-col items-center gap-2 pt-1">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollapseStage(stage.id);
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] font-black bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-100 group-hover:text-blue-900 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded-full">
                        {stageDeals.length}
                      </span>
                    </div>

                    <div className="[writing-mode:vertical-lr] rotate-180 font-bold text-xs text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 tracking-wide py-4 whitespace-normal">
                      {stage.shortLabel || stage.label}
                    </div>

                    <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 pb-1">
                      {stage.winRate}%
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={stage.id} 
                  id={`kanban-stage-col-${stage.id}`}
                  className={`${isCompactKanban ? 'w-[270px]' : 'w-[84vw] sm:w-[320px]'} shrink-0 snap-center flex flex-col gap-3 rounded-xl p-2 bg-slate-100/95 dark:bg-slate-900/90 border-2 border-slate-300/80 dark:border-slate-800 shadow-xs transition-all ${
                    dragOverStage === stage.id ? 'bg-blue-50 dark:bg-blue-950/40 ring-4 ring-blue-500/25 border-blue-500 border-dashed shadow-md' : 
                    draggedDealId ? 'bg-slate-200/50 dark:bg-slate-900/40' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Column Header */}
                  <div 
                    className={`relative overflow-hidden flex flex-col justify-between rounded-xl bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-all ${
                      isCompactKanban ? 'p-2 min-h-[68px]' : 'p-2.5 min-h-[74px]'
                    }`}
                    title={stage.label}
                  >
                    {/* Top Stage Accent Stripe */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${stageTheme.stripe}`} />

                    {/* Top Row: Stage Step Number + Title + Subtitle & Counters */}
                    <div className="flex items-start justify-between gap-1.5 pt-0.5">
                      <div className="flex items-start gap-1.5 flex-1 min-w-0">
                        {stageHeader.stepNumber ? (
                          <span className={`inline-flex items-center justify-center w-4.5 h-4.5 rounded text-[10px] font-black shrink-0 mt-0.5 border shadow-2xs ${stageTheme.badge}`}>
                            {stageHeader.stepNumber}
                          </span>
                        ) : null}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-slate-900 dark:text-white text-xs leading-tight whitespace-normal break-words">
                            {stageHeader.title}
                          </h4>
                          {stageHeader.subtitle && (
                            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5 whitespace-normal break-words">
                              ({stageHeader.subtitle})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action: Deal Counter Badge & Collapse Column Button */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span 
                          className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-1.5 py-0.2 rounded-full shadow-2xs"
                          title={`${stageDeals.length} сделок`}
                        >
                          {stageDeals.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCollapseStage(stage.id)}
                          className="w-4.5 h-4.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                          title="Свернуть колонку"
                          aria-label={`Свернуть этап ${stage.label}`}
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Win Probability & Stage Total Volume */}
                    <div className="flex items-center justify-between text-[10px] pt-1 mt-1 border-t border-slate-100 dark:border-slate-800 font-medium">
                      <span className={`flex items-center gap-0.5 font-bold ${stageTheme.percent}`}>
                        <Percent className="w-2.5 h-2.5 shrink-0" /> {stage.winRate}%
                      </span>
                      <span className="font-black text-slate-900 dark:text-slate-100 font-mono">
                        {stageSum >= 1_000_000 
                          ? `${(stageSum / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} млн ₽`
                          : stageSum > 0 
                            ? `${(stageSum / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} тыс. ₽` 
                            : '0 ₽'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Deals Cards Stack */}
                  <div className="flex flex-col gap-2 flex-1 min-h-[400px]">
                    {stageDeals.map(deal => {
                      const isVerificationClose = deal.clientEquipment?.daysUntilVerification && deal.clientEquipment.daysUntilVerification <= 45;
                      const isDraggable = canChangeStage(deal);
                      const nextAction = getDealNextAction(deal);
                      const dealAge = getDealAgeInfo(deal);
                      const isAssignedToCurrentUser = !!(
                        currentUser && 
                        (deal.responsibleManager || deal.createdByManager || '').toLowerCase().includes(
                          (currentUser.fullName?.split(/\s+/)[0] || '---').toLowerCase()
                        )
                      );

                      return (
                        <div 
                          key={deal.id}
                          onClick={() => setSelectedDeal(deal)}
                          draggable={isDraggable}
                          onDragStart={(e: any) => handleDragStart(e, deal)}
                          onDragEnd={handleDragEnd}
                          className={`bg-white dark:bg-slate-855 border-2 rounded-xl ${isCompactKanban ? 'p-2' : 'p-2.5 sm:p-3'} shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-150 ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} group relative ${
                            deal.stage === 'lost' 
                              ? 'border-rose-300 bg-rose-50/30 dark:border-rose-800 dark:bg-rose-950/20 border-l-4 border-l-rose-500 opacity-80' 
                              : (stage.isWon 
                                  ? 'border-emerald-400 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500' 
                                  : `border-slate-300 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-400 ${
                                      deal.funnel === 'equipment' ? 'border-l-4 border-l-blue-600' :
                                      deal.funnel === 'services' ? 'border-l-4 border-l-teal-600' : 'border-l-4 border-l-amber-500'
                                    }`
                                )
                          } ${draggedDealId === deal.id ? 'opacity-30 border-2 border-dashed border-blue-500 scale-[0.97] ring-4 ring-blue-400/25 shadow-none' : ''}`}
                        >
                          {/* Card Top: ID, Date, Age & "My Deal" Badge */}
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1">
                              <span 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard?.writeText(deal.id);
                                  showToast(`ID ${deal.id} скопирован в буфер`);
                                }}
                                className="text-[10px] font-black text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300 font-mono tracking-wider transition-colors cursor-copy"
                                title="Нажмите, чтобы скопировать ID сделки"
                              >
                                {deal.id}
                              </span>
                              {isAssignedToCurrentUser && (
                                <span className="text-[9px] font-black bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800 px-1 py-0.2 rounded shadow-2xs">
                                  Моя
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                {new Date(deal.createdAt).toLocaleDateString('ru-RU')}
                              </span>
                              <span 
                                className={`text-[9px] font-bold px-1 py-0.2 rounded border shadow-2xs ${
                                  dealAge.days <= 3 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700' 
                                    : dealAge.days <= 10
                                      ? 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700'
                                      : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                }`}
                                title={`Срок в воронке: ${dealAge.days} дн.`}
                              >
                                {dealAge.days <= 3 ? 'до 3 дн.' : dealAge.days <= 10 ? 'до 10 дн.' : dealAge.text}
                              </span>
                            </div>
                          </div>

                          {/* Company / Customer */}
                          <h5 className="font-black text-slate-900 dark:text-white text-xs sm:text-[13px] line-clamp-1 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors whitespace-normal break-words">
                            {deal.companyName || deal.customerName}
                          </h5>
                          {!isCompactKanban && deal.customerName && deal.companyName && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{deal.customerName}</span>
                            </div>
                          )}

                          {/* Task / Product */}
                          <div className="text-[11px] text-slate-700 dark:text-slate-200 mt-1 p-1.5 line-clamp-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/70 whitespace-normal break-words font-medium leading-tight">
                            {deal.serviceType}
                          </div>

                          {/* Serial or Equipment Alert Badge (ONLY in support funnel for equipment under service) */}
                          {deal.clientEquipment && deal.funnel === 'support' && (
                            <div className={`mt-1.5 p-1 rounded text-[10px] font-bold flex items-center gap-1.5 ${
                              isVerificationClose 
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700 shadow-2xs' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              <Wrench className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">№ {deal.clientEquipment.serialNumber}</span>
                              {isVerificationClose && (
                                <span className="ml-auto text-[9px] bg-amber-500 text-white px-1 py-0.2 rounded font-black shrink-0">
                                  Поверка: {deal.clientEquipment.daysUntilVerification} дн.
                                </span>
                              )}
                            </div>
                          )}

                          {/* Next Action: Что и когда сделать */}
                          {deal.stage !== 'lost' && !isCompactKanban && (
                            <div className={`mt-1.5 p-1.5 rounded-lg border transition-colors shadow-2xs ${
                              nextAction.urgency === 'critical'
                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-200'
                                : isAssignedToCurrentUser
                                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200'
                                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/70 text-slate-800 dark:text-slate-200'
                            }`}>
                              <div className="flex items-center justify-between gap-1 mb-0.5 font-bold uppercase tracking-wider text-[9px]">
                                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                  <CalendarClock className={`w-3 h-3 shrink-0 ${
                                    nextAction.urgency === 'critical' ? 'text-amber-600' : 'text-blue-600'
                                  }`} />
                                  <span>{nextAction.timeframe}</span>
                                </span>
                              </div>
                              <div className="line-clamp-1 leading-tight font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                                {nextAction.action}
                              </div>
                            </div>
                          )}

                          {/* Card Footer: Manager, Price & Quick Actions consolidated */}
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <div className="min-w-0 flex items-center gap-1.5 flex-1 pr-1.5">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 border ${
                                isAssignedToCurrentUser
                                  ? 'bg-blue-600 text-white border-blue-700'
                                  : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              }`}>
                                <UserCheck className="w-2.5 h-2.5" />
                              </div>
                              <span className="truncate text-[10px] text-slate-500 dark:text-slate-400 font-medium" title={deal.responsibleManager || 'Скобелев А.С.'}>
                                {(deal.responsibleManager || deal.createdByManager || 'Скобелев А.С.').split(/\s+/).slice(0, 2).join(' ')}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs font-black text-slate-900 dark:text-white font-mono whitespace-nowrap">
                                {deal.estimatedPrice ? formatCurrency(deal.estimatedPrice, deal.currency) : 'По запросу'}
                              </span>

                              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDealForProposal(deal);
                                  }}
                                  title="Сгенерировать ТКП (PDF)"
                                  className="p-1 rounded bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white transition-all cursor-pointer border border-blue-200 dark:border-blue-800 shadow-2xs"
                                >
                                  <FileText className="w-3 h-3" />
                                </button>

                                {stage.id !== 'lost' && !stage.isWon && isDraggable && (() => {
                                  const currentIndex = currentFunnelConfig.stages.findIndex(s => s.id === deal.stage);
                                  const nextStage = currentIndex >= 0 && currentIndex < currentFunnelConfig.stages.length - 2
                                    ? currentFunnelConfig.stages[currentIndex + 1]
                                    : null;
                                  if (!nextStage) return null;

                                  return (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleNextStage(deal);
                                      }}
                                      title={`Перевести на этап: «${nextStage.shortLabel || nextStage.label}»`}
                                      className="p-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-blue-600 dark:hover:text-white transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                                    >
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {stageDeals.length === 0 && (
                      <div className="h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-3 text-center text-xs text-slate-500 dark:text-slate-400 font-medium bg-white/60 dark:bg-slate-850/60 shadow-inner">
                        <CheckSquare className="w-5 h-5 text-slate-400 dark:text-slate-500 mb-1" />
                        <span className="font-bold">{selectedManagerFilter !== 'all' ? 'У выбранного менеджера нет сделок' : 'Нет сделок на этапе'}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {selectedManagerFilter !== 'all' ? 'Попробуйте сбросить фильтр ответственного' : 'Перетащите сделку сюда'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      ) : (
        /* Table (List View) Mode for High Data Density with Batch Operations */
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden relative">
          {/* Table Header Controls / Stats */}
          <div className="p-3 border-b border-gray-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">Всего в выборке: {filteredDeals.length}</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>Сумма: <strong className="text-slate-900 dark:text-white">{filteredDeals.reduce((sum, d) => sum + (d.estimatedPrice || 0), 0).toLocaleString('ru-RU')} ₽</strong></span>
              {selectedDealIds.length > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Выбрано: {selectedDealIds.length}</span>
                </>
              )}
            </div>

            {selectedDealIds.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setBatchTargetStage(currentFunnelConfig.stages[0]?.id || '');
                    setIsBatchStageModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Сменить этап</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBatchTargetManager('Скобелев А.С.');
                    setIsBatchManagerModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Назначить ответственного</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const dealsToExport = deals.filter(d => selectedDealIds.includes(d.id));
                    if (dealsToExport.length === 0) return;
                    const headers = ['ID', 'Дата', 'Контрагент', 'ИНН', 'Контакт', 'Телефон', 'Email', 'Сумма (руб)', 'Этап', 'Ответственный'];
                    const rows = dealsToExport.map(d => [
                      d.id,
                      (d as any).date || d.createdAt || '',
                      `"${(d.companyName || '').replace(/"/g, '""')}"`,
                      d.inn || '',
                      `"${(d.customerName || '').replace(/"/g, '""')}"`,
                      d.phone || '',
                      d.email || '',
                      d.estimatedPrice || 0,
                      d.stage || '',
                      `"${(d.responsibleManager || '').replace(/"/g, '""')}"`
                    ]);
                    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `crm_deals_export_${new Date().toISOString().slice(0, 10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    showToast(`Экспортировано ${dealsToExport.length} сделок в Excel (CSV)`);
                  }}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>В Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDealIds([])}
                  className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Сбросить
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap divide-y divide-gray-100 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filteredDeals.length > 0 && selectedDealIds.length === filteredDeals.length}
                      onChange={() => {
                        if (selectedDealIds.length === filteredDeals.length && filteredDeals.length > 0) {
                          setSelectedDealIds([]);
                        } else {
                          setSelectedDealIds(filteredDeals.map(d => d.id));
                        }
                      }}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title="Выбрать все сделки в таблице"
                    />
                  </th>
                  <th className="px-3 py-3">№ / Дата</th>
                  <th className="px-4 py-3">Контрагент (Предприятие)</th>
                  <th className="px-4 py-3">Контактное лицо</th>
                  <th className="px-4 py-3">Предмет сделки</th>
                  <th className="px-4 py-3 text-right">Сумма (₽)</th>
                  <th className="px-4 py-3">Этап воронки</th>
                  <th className="px-4 py-3 text-center">Вероятность</th>
                  <th className="px-4 py-3">Ответственный</th>
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-400 font-medium">
                      Сделок по выбранным фильтрам не найдено
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal) => {
                    const currentStageObj = currentFunnelConfig.stages.find(s => s.id === deal.stage) || currentFunnelConfig.stages[0];
                    const stageTheme = getStageTheme(currentStageObj);
                    const isSelected = selectedDealIds.includes(deal.id);
                    return (
                      <tr 
                        key={deal.id}
                        onClick={() => setSelectedDeal(deal)}
                        className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70 dark:bg-blue-950/40' : ''
                        }`}
                      >
                        <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedDealIds(prev =>
                                prev.includes(deal.id) ? prev.filter(x => x !== deal.id) : [...prev, deal.id]
                              );
                            }}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{deal.id}</span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{(deal as any).date || (deal.createdAt ? new Date(deal.createdAt).toLocaleDateString('ru-RU') : 'Недавно')}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white max-w-[220px] truncate" title={deal.companyName || deal.customerName}>
                            {deal.companyName || deal.customerName}
                          </div>
                          {deal.inn && <div className="text-[10px] text-slate-400 font-mono">ИНН: {deal.inn}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[160px]">{deal.customerName || '—'}</div>
                          {deal.phone && <div className="text-[10px] text-slate-400">{deal.phone}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-700 dark:text-slate-300 max-w-[200px] truncate font-medium" title={deal.serviceType || (deal as any).catalogSelection || '—'}>
                            {deal.serviceType || (deal as any).catalogSelection || 'Оборудование / Услуги'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {deal.estimatedPrice ? formatCurrency(deal.estimatedPrice, deal.currency) : 'По запросу'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${stageTheme.badge}`}>
                            {currentStageObj.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            {currentStageObj.winRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[140px]">{deal.responsibleManager || 'Не назначен'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedDeal(deal)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-300 rounded text-xs font-bold transition-colors cursor-pointer"
                              title="Открыть полную карточку сделки"
                            >
                              Открыть
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Batch Stage Modal */}
          {isBatchStageModalOpen && (
            <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 max-w-md w-full shadow-2xl border border-gray-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Сменить этап для {selectedDealIds.length} сделок
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Выберите целевой этап текущей воронки, на который будут переведены выбранные сделки.
                </p>
                <select
                  value={batchTargetStage}
                  onChange={(e) => setBatchTargetStage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white mb-5 focus:ring-2 focus:ring-blue-500"
                >
                  {currentFunnelConfig.stages.map(s => (
                    <option key={s.id} value={s.id}>{s.label} ({s.winRate}%)</option>
                  ))}
                </select>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBatchStageModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!batchTargetStage || selectedDealIds.length === 0) return;
                      setDeals(prev => prev.map(deal => {
                        if (selectedDealIds.includes(deal.id)) {
                          return { ...deal, stage: batchTargetStage, updatedAt: new Date().toISOString() };
                        }
                        return deal;
                      }));
                      showToast(`Этап обновлен для ${selectedDealIds.length} сделок`);
                      setSelectedDealIds([]);
                      setIsBatchStageModalOpen(false);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Применить этап
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Batch Manager Modal */}
          {isBatchManagerModalOpen && (
            <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 max-w-md w-full shadow-2xl border border-gray-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Назначить ответственного для {selectedDealIds.length} сделок
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Выберите специалиста или ведущего менеджера, который будет назначен ответственным.
                </p>
                <select
                  value={batchTargetManager}
                  onChange={(e) => setBatchTargetManager(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white mb-5 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Скобелев А.С.">Скобелев Александр Сергеевич (TopSolid / Постпроцессоры)</option>
                  <option value="Ярыш И.В.">Ярыш Иван Владимирович (PolyWorks / КИМ)</option>
                  <option value="Ярыш А.В.">Ярыш Александр Владимирович (3D-сканирование)</option>
                  <option value="Морозов В.Г.">Морозов Владимир Георгиевич (Оснастка / Штампы)</option>
                  <option value="Ковалёв Д.М.">Ковалёв Дмитрий Михайлович (Снабжение / Договоры)</option>
                </select>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBatchManagerModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!batchTargetManager || selectedDealIds.length === 0) return;
                      setDeals(prev => prev.map(deal => {
                        if (selectedDealIds.includes(deal.id)) {
                          return { ...deal, responsibleManager: batchTargetManager, updatedAt: new Date().toISOString() };
                        }
                        return deal;
                      }));
                      showToast(`Ответственный назначен для ${selectedDealIds.length} сделок`);
                      setSelectedDealIds([]);
                      setIsBatchManagerModalOpen(false);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Назначить менеджера
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
      )}
      </div>
      )}

      {/* 4. Full 3-Column Interactive Deal Modal */}
      {selectedDeal && (
        <div className={`fixed inset-0 z-[400] overflow-hidden bg-black/75 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-150 ${isFullscreenDeal ? "p-0" : "p-0 sm:p-2 md:p-4"}`}>
          <div className={`${isFullscreenDeal ? 'fixed inset-0 z-[401] w-screen h-screen rounded-none' : 'relative w-full max-w-[1440px] h-full max-h-[96vh] sm:max-h-[92vh] rounded-lg sm:rounded-lg'} bg-white shadow-xl border border-gray-200 overflow-hidden flex flex-col`}>
            
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between p-3.5 sm:p-5 border-b border-gray-100 bg-slate-50/95 backdrop-blur-sm shrink-0 shadow-2xs">
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 mb-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider rounded-lg">
                    {activeFunnels[selectedDeal.funnel]?.name || 'Сделка'}
                  </span>
                  <span className="text-xs font-bold text-gray-400">{selectedDeal.id}</span>
                  {selectedDeal.stage === 'lost' ? (
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full">
                      Отказ / Архив
                    </span>
                  ) : selectedDeal.stage === 'completed' || selectedDeal.stage === 'closed_won' ? (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      Успех (100%)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-full">
                      В работе
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-xl font-black text-gray-900 truncate">
                  {selectedDeal.companyName || selectedDeal.customerName}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCloneDeal(selectedDeal)}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 border border-slate-300"
                  title="Создать копию / дубликат данной сделки"
                >
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Дублировать</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDealForProposal(selectedDeal)}
                  className="px-2.5 py-1.5 sm:px-4.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
                  title="Сформировать официальное ТКП с расчетом НДС, условиями 44-ФЗ/223-ФЗ и факсимиле"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Сгенерировать ТКП</span>
                  <span className="sm:hidden">ТКП</span>
                </button>

                {canDeleteDeals && (
                  <button
                    type="button"
                    onClick={() => setDealToDelete(selectedDeal)}
                    className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    title="Удалить сделку из CRM"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden md:inline">Удалить сделку</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsFullscreenDeal(prev => !prev)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
                  title={isFullscreenDeal ? "Свернуть в окно" : "Развернуть на весь экран"}
                >
                  {isFullscreenDeal ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDeal(null);
                    setIsFullscreenDeal(false);
                  }}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors shrink-0 cursor-pointer"
                  title="Закрыть карточку сделки"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Mobile Section Tabs for Deal Modal (< lg) */}
            <div className="lg:hidden flex items-center border-b border-gray-200 bg-white px-4 py-2.5 gap-2 overflow-x-auto no-scrollbar shrink-0 shadow-2xs no-scrollbar">
              <button
                type="button"
                onClick={() => setDealModalMobileTab('info')}
                className={`flex-1 min-w-[110px] px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  dealModalMobileTab === 'info'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Клиент & ЛПР</span>
              </button>
              <button
                type="button"
                onClick={() => setDealModalMobileTab('timeline')}
                className={`flex-1 min-w-[125px] px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  dealModalMobileTab === 'timeline'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Этап & Таймлайн</span>
              </button>
              <button
                type="button"
                onClick={() => setDealModalMobileTab('spec')}
                className={`flex-1 min-w-[130px] px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  dealModalMobileTab === 'spec'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Спецификация</span>
                {selectedDeal.items?.length ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-900 font-black">
                    {selectedDeal.items.length}
                  </span>
                ) : null}
              </button>
            </div>

            {/* 3-Column Content Body: Balanced 4-4-4 Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
              
              {/* === COL 1: Клиент, ЛПР и параметры заявки (4 / 12) === */}
              <div className={`xl:col-span-4 space-y-4 ${dealModalMobileTab !== 'info' ? 'hidden lg:block' : 'block'}`}>
                {/* Client Card & Company Multi-Contacts Selector */}
                {(() => {
                  const matchingCompanyContacts = crmContacts.filter(c => 
                    (selectedDeal.companyId && c.companyId === selectedDeal.companyId) ||
                    (selectedDeal.companyName && c.companyName && c.companyName.toLowerCase() === selectedDeal.companyName.toLowerCase())
                  );
                  const matchedComp = crmCompanies.find(c => 
                    (selectedDeal.companyId && c.id === selectedDeal.companyId) ||
                    (selectedDeal.companyName && c.name.toLowerCase() === selectedDeal.companyName.toLowerCase())
                  );
                  const activeContact = crmContacts.find(c => c.id === selectedDeal.contactId) || matchingCompanyContacts.find(c => c.fullName === selectedDeal.customerName);
                  const isCurrentCeo = Boolean(matchedComp?.ceoName && selectedDeal.customerName === matchedComp.ceoName);

                  return (
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-3.5">
                      {/* Section Header */}
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" /> Клиент и контакты предприятия
                        </h4>
                        {!isAddingContactInlineInDeal && !isEditingContactInlineInDeal && (
                          <button
                            type="button"
                            onClick={() => {
                              resetQuickContactForm();
                              setIsAddingContactInlineInDeal(true);
                            }}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                            title="Создать новое контактное лицо и привязать к этой компании и сделке"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>+ Новый контакт на лету</span>
                          </button>
                        )}
                      </div>

                      {/* Organization Summary */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Организация (Заказчик)</span>
                          {matchingCompanyContacts.length > 0 && (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[9px] font-bold border border-emerald-200">
                              {matchingCompanyContacts.length} контакт(ов) в базе
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="truncate">{selectedDeal.companyName || 'Не указано'}</span>
                        </div>
                        {selectedDeal.inn && (
                          <div className="text-[11px] text-gray-500 flex items-center gap-2">
                            <span>ИНН: <strong className="font-mono text-gray-800">{selectedDeal.inn}</strong></span>
                            {selectedDeal.kpp && <span>КПП: <strong className="font-mono text-gray-800">{selectedDeal.kpp}</strong></span>}
                          </div>
                        )}
                      </div>

                      {/* On-the-Fly Contact Creation Form */}
                      {isAddingContactInlineInDeal && (
                        <div className="p-3.5 bg-blue-50/70 border-2 border-blue-300 rounded-lg space-y-2.5 animate-in fade-in zoom-in-98 duration-150 shadow-xs">
                          <div className="flex items-center justify-between border-b border-blue-200/80 pb-1.5">
                            <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                              <UserPlus className="w-3.5 h-3.5 text-blue-700" />
                              <span>Новый контакт для «{selectedDeal.companyName || 'Заказчика'}»</span>
                            </span>
                            <button
                              type="button"
                              onClick={resetQuickContactForm}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                ФИО контактного лица <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={quickContactForm.fullName}
                                onChange={(e) => setQuickContactForm(prev => ({ ...prev, fullName: e.target.value }))}
                                placeholder="Например: Иванов Сергей Петрович"
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold focus:border-blue-500 outline-none"
                                autoFocus
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                  Должность
                                </label>
                                <input
                                  type="text"
                                  value={quickContactForm.position}
                                  onChange={(e) => setQuickContactForm(prev => ({ ...prev, position: e.target.value }))}
                                  placeholder="Главный метролог / Инженер"
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:border-blue-500 outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                  Подразделение / Цех
                                </label>
                                <input
                                  type="text"
                                  value={quickContactForm.department}
                                  onChange={(e) => setQuickContactForm(prev => ({ ...prev, department: e.target.value }))}
                                  placeholder="ОТК / Лаборатория КИМ"
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:border-blue-500 outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                  Телефон
                                </label>
                                <input
                                  type="text"
                                  value={quickContactForm.workPhone}
                                  onChange={(e) => setQuickContactForm(prev => ({ ...prev, workPhone: e.target.value }))}
                                  placeholder="+7 (846) 200-00-00"
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:border-blue-500 outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  value={quickContactForm.email}
                                  onChange={(e) => setQuickContactForm(prev => ({ ...prev, email: e.target.value }))}
                                  placeholder="metrolog@zavod.ru"
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:border-blue-500 outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <label className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={quickContactForm.isDecisionMaker}
                                  onChange={(e) => setQuickContactForm(prev => ({ ...prev, isDecisionMaker: e.target.checked }))}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                                />
                                <span>⭐ Лицо, принимающее решения (ЛПР)</span>
                              </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200">
                              <button
                                type="button"
                                onClick={resetQuickContactForm}
                                className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-100 text-slate-600 text-xs font-bold rounded-md cursor-pointer"
                              >
                                Отмена
                              </button>
                              <button
                                type="button"
                                onClick={handleCreateContactForSelectedDeal}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Создать и привязать</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Inline Contact Editing Mode */}
                      {isEditingContactInlineInDeal && (
                        <div className="p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-lg space-y-2.5 animate-in fade-in zoom-in-98 duration-150 shadow-xs">
                          <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
                            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                              <span>Редактирование контактных данных сделки</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsEditingContactInlineInDeal(false)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                ФИО контактного лица
                              </label>
                              <input
                                type="text"
                                value={editDealContactForm.customerName}
                                onChange={(e) => setEditDealContactForm(prev => ({ ...prev, customerName: e.target.value }))}
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold focus:border-amber-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                Должность
                              </label>
                              <input
                                type="text"
                                value={editDealContactForm.customerPost}
                                onChange={(e) => setEditDealContactForm(prev => ({ ...prev, customerPost: e.target.value }))}
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:border-amber-500 outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                  Телефон
                                </label>
                                <input
                                  type="text"
                                  value={editDealContactForm.phone}
                                  onChange={(e) => setEditDealContactForm(prev => ({ ...prev, phone: e.target.value }))}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:border-amber-500 outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  value={editDealContactForm.email}
                                  onChange={(e) => setEditDealContactForm(prev => ({ ...prev, email: e.target.value }))}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:border-amber-500 outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                              <button
                                type="button"
                                onClick={() => setIsEditingContactInlineInDeal(false)}
                                className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-100 text-slate-600 text-xs font-bold rounded-md cursor-pointer"
                              >
                                Отмена
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveInlineContactForDeal}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Сохранить</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Contact Selection Dropdown (Multiple contacts of company + CEO + custom) */}
                      {!isAddingContactInlineInDeal && !isEditingContactInlineInDeal && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                              <span>Выбор контакта компании:</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsEditingContactInlineInDeal(true)}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                              title="Редактировать ФИО, телефон или email"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Редактировать</span>
                            </button>
                          </div>

                          <select
                            value={selectedDeal.contactId || (isCurrentCeo ? '__ceo__' : '__custom__')}
                            onChange={(e) => handleSelectContactForSelectedDeal(e.target.value)}
                            className="w-full p-2 text-xs bg-slate-50 border border-gray-300 rounded-lg font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                          >
                            {/* Option for CEO */}
                            {(matchedComp?.ceoName || selectedDeal.ceoName) && (
                              <option value="__ceo__">
                                👑 {matchedComp?.ceoName || selectedDeal.ceoName} — {matchedComp?.ceoPost || selectedDeal.ceoPost || 'Генеральный директор'} (Руководитель)
                              </option>
                            )}

                            {/* Options for Company Contacts */}
                            {matchingCompanyContacts.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.isDecisionMaker ? '⭐' : '👤'} {c.fullName} — {c.position || 'Контактное лицо'} {c.isDecisionMaker ? '[ЛПР]' : ''}
                              </option>
                            ))}

                            <option value="__custom__">
                              ✏️ {selectedDeal.customerName} — {selectedDeal.customerPost || 'Контакт'} (Текущий / Вручную)
                            </option>
                          </select>

                          {/* Active Contact Detail Card */}
                          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                  <span>{selectedDeal.customerName}</span>
                                  {activeContact?.isDecisionMaker && (
                                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-black border border-amber-200">
                                      ЛПР
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                                  {selectedDeal.customerPost || activeContact?.position || 'Контактное лицо'}
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-blue-100/80 space-y-1.5">
                              {selectedDeal.phone && (
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <a href={`tel:${selectedDeal.phone}`} className="hover:text-blue-600 font-medium truncate">
                                    {selectedDeal.phone}
                                  </a>
                                </div>
                              )}
                              {selectedDeal.email && (
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <a href={`mailto:${selectedDeal.email}`} className="hover:text-blue-600 font-medium truncate">
                                    {selectedDeal.email}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Responsible Manager Selector */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-600" /> Ответственный за сделку
                    </h4>
                    {canEditDeals && (
                      <span className="text-[10px] text-blue-600 font-semibold">Сменить</span>
                    )}
                  </div>

                  <select
                    value={selectedDeal.responsibleManager || selectedDeal.createdByManager || (availableManagers[0]?.value || 'Скобелев А.С.')}
                    onChange={(e) => handleResponsibleManagerChange(selectedDeal.id, e.target.value)}
                    disabled={!canEditDeals}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {availableManagers.map((mgr, idx) => (
                      <option key={`${mgr.value}_${idx}`} value={mgr.value}>
                        {mgr.label}
                      </option>
                    ))}
                  </select>

                  <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
                    <span>Автор заявки:</span>
                    <strong className="text-slate-500 font-medium">{selectedDeal.createdByManager || 'Скобелев А.С.'}</strong>
                  </div>
                </div>

                {/* Initial Task Specs */}
                <div className="bg-blue-50/50 p-4.5 rounded-lg border border-blue-100/90 shadow-2xs space-y-2.5">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" /> Исходный запрос
                  </h4>
                  <div className="text-xs font-bold text-blue-800">{selectedDeal.serviceType}</div>
                  <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed">
                    {selectedDeal.details}
                  </p>
                  {selectedDeal.cadFormat && (
                    <div className="text-[11px] text-blue-900 font-medium bg-blue-100/70 px-2.5 py-1 rounded-lg inline-block">
                      Формат CAD: <span className="font-bold">{selectedDeal.cadFormat}</span>
                    </div>
                  )}
                </div>

                {/* Customer Equipment Park */}
                {selectedDeal.clientEquipment && (
                  <div className="bg-white p-4.5 rounded-lg border border-gray-200 shadow-2xs space-y-2.5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-slate-500" /> Парк оборудования
                    </h4>
                    <div className="text-xs font-bold text-gray-900">{selectedDeal.clientEquipment.model}</div>
                    <div className="text-xs text-slate-500">Заводской №: <span className="font-mono font-bold text-gray-800">{selectedDeal.clientEquipment.serialNumber}</span></div>
                    <div className="text-xs text-slate-500">Метрологическая поверка: <span className="font-bold text-gray-800">{selectedDeal.clientEquipment.verificationDate}</span></div>
                    
                    {selectedDeal.clientEquipment.daysUntilVerification && selectedDeal.clientEquipment.daysUntilVerification <= 45 && selectedDeal.funnel === 'support' && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900 mt-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Плановая поверка КИМ</div>
                          <div>До окончания межповерочного интервала осталось {selectedDeal.clientEquipment.daysUntilVerification} дней.</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Marketing UTM Tags */}
                {selectedDeal.utm && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs text-xs space-y-2">
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Маркетинговый источник заявки
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Канал привлечения:</span>
                      <span className="font-bold text-gray-900">
                        {UTM_SOURCE_LABELS[selectedDeal.utm.source] || selectedDeal.utm.source}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Тип трафика:</span>
                      <span className="font-medium text-gray-800">
                        {UTM_MEDIUM_LABELS[selectedDeal.utm.medium] || selectedDeal.utm.medium}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Кампания:</span>
                      <span className="font-medium text-gray-800">
                        {UTM_CAMPAIGN_LABELS[selectedDeal.utm.campaign] || selectedDeal.utm.campaign}
                      </span>
                    </div>
                    {selectedDeal.utm.term && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">Поисковый запрос:</span>
                        <span className="font-mono font-bold text-blue-700">{selectedDeal.utm.term}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* === COL 2: Управление статусом, Вероятность, План и Таймлайн (4 / 12) === */}
              <div className={`xl:col-span-4 space-y-4 ${dealModalMobileTab !== 'timeline' ? 'hidden lg:block' : 'block'}`}>
                {/* Status & Probability Selector */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" /> Управление этапом
                    </h4>
                    {(() => {
                      const currentStageObj = activeFunnels[selectedDeal.funnel].stages.find(s => s.id === selectedDeal.stage);
                      return currentStageObj ? (
                        <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {currentStageObj.winRate}% вероятность
                        </span>
                      ) : null;
                    })()}
                  </div>

                  <select 
                    value={selectedDeal.stage}
                    onChange={(e) => handleStageChange(selectedDeal.id, e.target.value)}
                    disabled={!canChangeStage(selectedDeal)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {activeFunnels[selectedDeal.funnel].stages.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.winRate}%)
                      </option>
                    ))}
                  </select>

                  {/* Quick Action Buttons */}
                  {canChangeStage(selectedDeal) ? (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {selectedDeal.stage !== 'lost' && selectedDeal.stage !== 'closed_won' && selectedDeal.stage !== 'completed' && (
                        <button
                          onClick={() => handleNextStage(selectedDeal)}
                          className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                        >
                          <span>Следующий этап</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {selectedDeal.stage !== 'closed_won' && selectedDeal.stage !== 'completed' && selectedDeal.stage !== 'lost' && (
                        <button
                          onClick={() => {
                            const wonStage = selectedDeal.funnel === 'services' ? 'completed' : 'closed_won';
                            handleStageChange(selectedDeal.id, wonStage);
                          }}
                          className="flex items-center justify-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Успех (100%)</span>
                        </button>
                      )}

                      {selectedDeal.stage !== 'lost' ? (
                        <button
                          onClick={() => setIsLossModalOpen(true)}
                          className="flex items-center justify-center gap-1 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Отказ / Архив</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsReturnModalOpen(true)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Вернуть сделку в работу</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 text-xs font-medium text-gray-500 bg-slate-50 p-3 rounded-lg border border-gray-200">
                      У вас нет прав для изменения статуса этой сделки, так как она находится в статусе «Завершено» или «Отказ».
                    </div>
                  )}

                  {/* If Lost, show reason banner */}
                  {selectedDeal.stage === 'lost' && selectedDeal.lossReason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900">
                      <div className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Зафиксированная причина отказа:
                      </div>
                      <div className="mt-1">{selectedDeal.lossReason}</div>
                    </div>
                  )}

                  {/* If Returned, show return note */}
                  {selectedDeal.returnReason && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                      <div className="font-bold flex items-center gap-1">
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" /> Обоснование возврата в работу:
                      </div>
                      <div className="mt-1">{selectedDeal.returnReason}</div>
                    </div>
                  )}
                </div>

                {/* Budget & VAT Mode */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Бюджет проекта ({selectedDeal.currency || 'RUB'})</div>
                      <div className="text-lg font-black text-gray-900 font-mono">
                        {selectedDeal.estimatedPrice.toLocaleString('ru-RU')} {getCurrencySymbol(selectedDeal.currency)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        selectedDeal.vatMode === 'export_zero'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : selectedDeal.vatMode === 'no_vat'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {selectedDeal.vatMode === 'export_zero' 
                          ? 'НДС 0% (Экспорт)' 
                          : selectedDeal.vatMode === 'no_vat' 
                          ? 'Без НДС (УСН)' 
                          : `НДС ${getDealEffectiveVatRate(selectedDeal)}% включен`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Manager Action Plan & Task Scheduler: Что и когда сделать */}
                {(() => {
                  const dealNextAction = getDealNextAction(selectedDeal);
                  return (
                    <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-5 rounded-lg border border-blue-200 shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                          <CalendarClock className="w-4 h-4 text-blue-600" /> План действий ответственного
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${
                          dealNextAction.urgency === 'critical'
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {dealNextAction.timeframe}
                        </span>
                      </div>

                      {/* Current Action Guidance */}
                      <div className="p-3 bg-white rounded-lg border border-blue-100 text-xs text-gray-800 space-y-1 shadow-2xs">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                          Регламентное действие текущего этапа:
                        </div>
                        <div className="font-semibold text-gray-900 leading-snug">
                          {dealNextAction.action}
                        </div>
                      </div>

                      {/* Quick Task Dispatch Form - Ergonomic 2-row layout */}
                      {canEditDeals && (
                        <div className="pt-2.5 border-t border-blue-100/80 space-y-2">
                          <div className="text-[11px] font-bold text-blue-950 flex items-center justify-between">
                            <span>Зафиксировать поручение:</span>
                            <span className="text-[10px] text-gray-500 font-normal">
                              Ответственный: <strong className="text-gray-800">{selectedDeal.responsibleManager || 'Скобелев А.С.'}</strong>
                            </span>
                          </div>

                          <input
                            type="text"
                            placeholder="Например: Запросить чертежи CAD, согласовать выезд, выставить счет..."
                            value={taskNoteText}
                            onChange={(e) => setTaskNoteText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAssignTask()}
                            className="w-full px-4 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />

                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">Срок:</span>
                              <select
                                value={taskDeadline}
                                onChange={(e) => setTaskDeadline(e.target.value)}
                                className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg font-medium text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                              >
                                <option value="Сегодня">Сегодня</option>
                                <option value="До конца дня">До конца дня</option>
                                <option value="Завтра">Завтра</option>
                                <option value="В течение 24 часов">В течение 24 часов</option>
                                <option value="До 3 рабочих дней">До 3 рабочих дней</option>
                                <option value="До конца недели">До конца недели</option>
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={handleAssignTask}
                              disabled={!taskNoteText.trim()}
                              className="px-4.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>Поставить задачу</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Interactive Timeline */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-3.5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" /> История и заметки инженеров
                  </h4>

                  {/* Add Comment Input */}
                  {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'manager') ? (
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Добавить заметку по сделке..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        onClick={handleAddComment}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                        title="Отправить комментарий"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null}

                  {/* Timeline Stream */}
                  <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {selectedDeal.timeline.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-gray-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-500">{item.author}</span>
                          <span className="text-gray-400">{item.date}</span>
                        </div>
                        <div className="font-semibold text-gray-900">{item.title}</div>
                        {item.comment && (
                          <p className="text-slate-500 bg-white p-2 rounded-lg border border-gray-100 mt-1">
                            {item.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* === COL 3: Спецификация проекта и Документы (4 / 12) === */}
              <div className={`xl:col-span-4 space-y-4 ${dealModalMobileTab !== 'spec' ? 'hidden lg:block' : 'block'}`}>
                {/* Deal Items Spec */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-3.5">
                  {/* Specification Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          Спецификация проекта
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {selectedDeal.items?.length || 0} {selectedDeal.items?.length === 1 ? 'позиция' : (selectedDeal.items && selectedDeal.items.length >= 2 && selectedDeal.items.length <= 4) ? 'позиции' : 'позиций'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Currency selector for specification */}
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-gray-200" title="Выбор валюты спецификации">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Валюта:</label>
                        <select
                          value={selectedDeal.currency || 'RUB'}
                          disabled={!canEditDeals}
                          onChange={(e) => handleUpdateDealCurrency(selectedDeal.id, e.target.value as CurrencyCode)}
                          className="bg-transparent text-xs font-bold text-gray-800 cursor-pointer outline-none"
                        >
                          <option value="RUB">Рубли (₽)</option>
                          <option value="USD">Доллар США ($)</option>
                          <option value="EUR">Евро (€)</option>
                          <option value="CNY">Юани (¥)</option>
                        </select>
                      </div>

                      {/* VAT Mode & Rate selector for deal specification */}
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-gray-200" title="Режим и ставка НДС по сделке">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">НДС:</label>
                        <select
                          value={selectedDeal.vatMode === 'custom' ? `custom_${selectedDeal.vatRate ?? 22}` : (selectedDeal.vatMode || 'standard')}
                          disabled={!canEditDeals}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'standard') {
                              handleUpdateDealVat(selectedDeal.id, 'standard', crmSettings?.defaultVatRate ?? 22);
                            } else if (val === 'export_zero') {
                              handleUpdateDealVat(selectedDeal.id, 'export_zero', 0);
                            } else if (val === 'no_vat') {
                              handleUpdateDealVat(selectedDeal.id, 'no_vat', 0);
                            } else if (val === 'custom_20') {
                              handleUpdateDealVat(selectedDeal.id, 'custom', 20);
                            } else if (val === 'custom_10') {
                              handleUpdateDealVat(selectedDeal.id, 'custom', 10);
                            } else if (val === 'custom_prompt') {
                              const input = prompt('Введите произвольную ставку НДС в % (например: 5, 7, 10, 18, 20):', String(selectedDeal.vatRate ?? 20));
                              if (input !== null) {
                                const parsed = parseFloat(input);
                                if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                                  handleUpdateDealVat(selectedDeal.id, 'custom', parsed);
                                } else {
                                  showToast('Укажите корректный процент от 0 до 100');
                                }
                              }
                            }
                          }}
                          className="bg-transparent text-xs font-bold text-gray-800 cursor-pointer outline-none"
                        >
                          <option value="standard">НДС {crmSettings?.defaultVatRate ?? 22}% (РФ)</option>
                          <option value="custom_20">НДС 20%</option>
                          <option value="custom_10">НДС 10%</option>
                          <option value="export_zero">НДС 0% (Экспорт)</option>
                          <option value="no_vat">Без НДС (УСН)</option>
                          {selectedDeal.vatMode === 'custom' && selectedDeal.vatRate !== 20 && selectedDeal.vatRate !== 10 && (
                            <option value={`custom_${selectedDeal.vatRate}`}>НДС {selectedDeal.vatRate}% (Своя)</option>
                          )}
                          <option value="custom_prompt">⚙️ Другая ставка %...</option>
                        </select>
                      </div>

                      {canEditDeals && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewItem(!isAddingNewItem);
                            setEditingItemId(null);
                            setConfirmDeleteItemId(null);
                          }}
                          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                            isAddingNewItem 
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          }`}
                          title={isAddingNewItem ? 'Закрыть форму добавления' : 'Добавить новую позицию в спецификацию'}
                        >
                          {isAddingNewItem ? (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Отмена</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Позиция</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Add New Item Form (Inline) */}
                  {isAddingNewItem && canEditDeals && (
                    <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs space-y-3 shadow-2xs animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>Новая позиция спецификации</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewItem(false)}
                          className="text-gray-400 hover:text-slate-500 p-0.5 rounded cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Equipment-First Service Configurator (Наше оборудование в первую очередь!) */}
                      <div className="bg-white p-3 rounded-lg border border-blue-200/90 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                              Предоставление услуг из базы оборудования
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsFleetPickerOpen(!isFleetPickerOpen)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{isFleetPickerOpen ? 'Свернуть выбор оборудования' : 'Выбрать из базы оборудования'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFleetPickerOpen ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {isFleetPickerOpen && (
                          <div className="p-3 bg-slate-50/90 rounded-lg border border-slate-200/80 space-y-3 animate-in fade-in duration-150">
                            {/* Step 1: Equipment Selection (Primary) */}
                            <div>
                              <label className="text-[10px] font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                                1. Оборудование из парка «ДС-Инжиниринг» (Первоначально) *
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {fleetDevices && fleetDevices.length > 0 ? (
                                  fleetDevices.map(dev => {
                                    const isSelected = selectedFleetId === dev.id;
                                    return (
                                      <button
                                        key={dev.id}
                                        type="button"
                                        onClick={() => setSelectedFleetId(dev.id)}
                                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-blue-50 border-blue-500 shadow-2xs text-blue-950 font-bold'
                                            : 'bg-white border-slate-200 hover:border-blue-300 text-slate-700'
                                        }`}
                                      >
                                        <div className="text-[11px] font-bold leading-tight truncate">{dev.modelName}</div>
                                        <div className="text-[9.5px] text-slate-500 flex items-center gap-1 mt-0.5">
                                          <span>{dev.brand}</span>
                                          {dev.serialNumber && <span>• № {dev.serialNumber}</span>}
                                        </div>
                                        <div className="text-[9px] text-blue-600 font-semibold mt-0.5">
                                          Точность: {dev.accuracy || 'высокая'}
                                        </div>
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="text-[10px] text-slate-500 p-2">База оборудования загружается...</div>
                                )}
                              </div>
                            </div>

                            {/* Step 2: Service Type on this Equipment */}
                            <div>
                              <label className="text-[10px] font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                                2. Вид предоставляемой услуги на выбранном оборудовании *
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                {[
                                  { id: 'inspection', label: 'Контроль геометрии', price: 160000, desc: 'Протокол отклонений и допуски GD&T' },
                                  { id: 'scanning', label: '3D-сканирование', price: 180000, desc: 'Высокоточная оцифровка объекта' },
                                  { id: 'onsite', label: 'Выездной контроль', price: 170000, desc: 'На территории заказчика' },
                                  { id: 'arbitration', label: 'Арбитражные замеры', price: 210000, desc: 'В метрологической лаборатории' },
                                  { id: 'reverse', label: 'Реверс-инжиниринг', price: 240000, desc: 'Оцифровка + CAD-моделирование ЕСКД' },
                                  { id: 'to_service', label: 'ТО и калибровка', price: 150000, desc: 'Регламентное обслуживание прибора' }
                                ].map(srv => {
                                  const isSelected = selectedFleetService === srv.id;
                                  return (
                                    <button
                                      key={srv.id}
                                      type="button"
                                      onClick={() => setSelectedFleetService(srv.id)}
                                      className={`p-1.5 rounded-lg border text-left cursor-pointer transition-colors ${
                                        isSelected
                                          ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                                      }`}
                                    >
                                      <div className="text-[10px] font-bold leading-tight">{srv.label}</div>
                                      <div className={`text-[8.5px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                                        {srv.desc}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Step 3: Software for Analysis (Secondary / Вторично) */}
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wide">
                                3. Используемое ПО для обработки и отчетов (вторично, опционально)
                              </label>
                              <div className="flex flex-wrap gap-1">
                                {[
                                  { id: 'polyworks', label: 'PolyWorks|Inspector™' },
                                  { id: 'geomagic', label: 'Geomagic Control X' },
                                  { id: 'mcosmos', label: 'Mitutoyo MCOSMOS' },
                                  { id: 'topsolid', label: 'TopSolid 7 Design' },
                                  { id: 'none', label: 'Без указания ПО' }
                                ].map(sw => {
                                  const isSelected = selectedFleetSoftware === sw.id;
                                  return (
                                    <button
                                      key={sw.id}
                                      type="button"
                                      onClick={() => setSelectedFleetSoftware(sw.id)}
                                      className={`px-2 py-1 rounded-md text-[9.5px] font-medium border cursor-pointer transition-colors ${
                                        isSelected
                                          ? 'bg-slate-800 text-white border-slate-800'
                                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      {sw.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Apply Button from Equipment Configurator */}
                            <div className="pt-1 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const dev = fleetDevices?.find(d => d.id === selectedFleetId) || fleetDevices?.[0];
                                  const devName = dev ? dev.modelName : 'Оборудование «ДС-Инжиниринг»';
                                  const sn = dev?.serialNumber ? ` (зав. № ${dev.serialNumber})` : '';
                                  
                                  const serviceLabels: Record<string, { label: string; price: number; category: string }> = {
                                    inspection: { label: 'Контроль геометрии и протокол отклонений GD&T', price: 160000, category: 'Инжиниринговые услуги' },
                                    scanning: { label: '3D-сканирование и высокоточная оцифровка', price: 180000, category: 'Инжиниринговые услуги' },
                                    onsite: { label: 'Выездной контроль геометрии на территории заказчика', price: 170000, category: 'Инжиниринговые услуги' },
                                    arbitration: { label: 'Арбитражные измерения в метрологической лаборатории', price: 210000, category: 'Инжиниринговые услуги' },
                                    reverse: { label: 'Реверс-инжиниринг (оцифровка + CAD-модель ЕСКД)', price: 240000, category: 'Инжиниринговые услуги' },
                                    to_service: { label: 'Регламентное ТО, юстировка и калибровка', price: 150000, category: 'Техническое обслуживание' },
                                  };
                                  
                                  const srv = serviceLabels[selectedFleetService] || serviceLabels.inspection;
                                  
                                  const swText = selectedFleetSoftware && selectedFleetSoftware !== 'none'
                                    ? `, ПО: ${selectedFleetSoftware === 'polyworks' ? 'PolyWorks|Inspector™' : selectedFleetSoftware === 'geomagic' ? 'Geomagic Control X' : selectedFleetSoftware === 'mcosmos' ? 'Mitutoyo MCOSMOS' : 'TopSolid 7'}`
                                    : '';

                                  setNewItemForm(prev => ({
                                    ...prev,
                                    name: `${srv.label} на ${devName}${sn}${swText}`,
                                    category: srv.category,
                                    price: srv.price,
                                    unit: 'усл.'
                                  }));

                                  setIsFleetPickerOpen(false);
                                }}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Сформировать услугу по оборудованию</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quick Presets Dropdown (Полный каталог услуг и оборудования) */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">
                          Или выбрать типовую позицию из каталога
                        </label>
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            const presets: Record<string, { name: string; category: string; price: number; unit: string }> = {
                              // 1. Услуги на оборудовании компании (КИМ, сканеры, трекеры)
                              'eq_mitutoyo_ctrl': { name: 'Контроль геометрии на стационарной КИМ Mitutoyo CRYSTA-Apex S', category: 'Инжиниринговые услуги', price: 160000, unit: 'усл.' },
                              'eq_hexagon_arm_ctrl': { name: 'Контроль геометрии на мобильной КИМ Hexagon Absolute ARM 8520', category: 'Инжиниринговые услуги', price: 150000, unit: 'усл.' },
                              'eq_leica_ctrl': { name: 'Высокоточные измерения лазерным трекером Leica Absolute Tracker AT403', category: 'Инжиниринговые услуги', price: 220000, unit: 'усл.' },
                              'eq_scanline_scan': { name: '3D-сканирование лазерным 3D-сканером ScanLine EasyScan Omni / FreeScan OMNI', category: 'Инжиниринговые услуги', price: 180000, unit: 'усл.' },
                              'eq_hexagon_rs6_scan': { name: '3D-сканирование мобильной КИМ со сканером Hexagon RS6', category: 'Инжиниринговые услуги', price: 190000, unit: 'усл.' },
                              'eq_onsite_audit': { name: 'Выездной контроль геометрии и аудит оснастки у заказчика (Hexagon ARM)', category: 'Инжиниринговые услуги', price: 170000, unit: 'усл.' },
                              'eq_arbitration': { name: 'Арбитражные измерения в термостабильной лаборатории (Mitutoyo CRYSTA-Apex S)', category: 'Инжиниринговые услуги', price: 210000, unit: 'усл.' },
                              'eq_reverse_eng': { name: 'Реверс-инжиниринг деталей (оцифровка на оборудовании компании + CAD ЕСКД)', category: 'Инжиниринговые услуги', price: 240000, unit: 'усл.' },
                              'eq_cmm_prog': { name: 'Разработка измерительных программ для КИМ (MCOSMOS / PolyWorks)', category: 'Инжиниринговые услуги', price: 130000, unit: 'усл.' },
                              'eq_fai_report': { name: 'Контроль первого изделия (FAI) и метрологический отчет с картой отклонений', category: 'Инжиниринговые услуги', price: 145000, unit: 'усл.' },

                              // 2. Поставка измерительного оборудования
                              'cat_hexagon_8520': { name: 'Поставка портативной КИМ Hexagon Absolute ARM 8520 (контактный щуп)', category: 'Оборудование', price: 8400000, unit: 'шт.' },
                              'cat_hexagon_rs6': { name: 'Поставка мобильной КИМ Hexagon Absolute ARM 8520 со сканером RS6', category: 'Оборудование', price: 12800000, unit: 'шт.' },
                              'cat_mitutoyo_crysta': { name: 'Поставка стационарной мостовой КИМ Mitutoyo CRYSTA-Apex S', category: 'Оборудование', price: 14500000, unit: 'шт.' },
                              'cat_pmt_arm': { name: 'Поставка портативной измерительной руки PMT Arm серии Alpha (7 осей)', category: 'Оборудование', price: 4900000, unit: 'шт.' },
                              'cat_pmt_cmm': { name: 'Поставка стационарной КИМ PMT CMM серии Alpha', category: 'Оборудование', price: 7200000, unit: 'шт.' },
                              'cat_leica_at403': { name: 'Поставка лазерного трекера Leica Absolute Tracker AT403 (до 320 м)', category: 'Оборудование', price: 18200000, unit: 'шт.' },
                              'cat_scanline_omni': { name: 'Поставка ручного лазерного 3D-сканера ScanLine EasyScan Omni', category: 'Оборудование', price: 4200000, unit: 'шт.' },
                              'cat_shining_combo': { name: 'Поставка метрологического 3D-сканера Shining 3D FreeScan Combo', category: 'Оборудование', price: 3850000, unit: 'шт.' },
                              'cat_shining_ue': { name: 'Поставка лазерного 3D-сканера Shining 3D FreeScan UE', category: 'Оборудование', price: 3400000, unit: 'шт.' },
                              'cat_renishaw': { name: 'Комплект измерительных головок и датчиков Renishaw (PH10M/TP200)', category: 'Оборудование', price: 1250000, unit: 'компл.' },

                              // 3. Сервисное обслуживание, поверка и модернизация КИМ
                              'serv_cmm_to': { name: 'Регламентное ТО стационарной КИМ и калибровка лазерным интерферометром', category: 'Техническое обслуживание', price: 180000, unit: 'шт.' },
                              'serv_arm_to': { name: 'Регламентное ТО, юстировка и калибровка мобильной КИМ Hexagon / PMT', category: 'Техническое обслуживание', price: 150000, unit: 'шт.' },
                              'serv_arshin': { name: 'Метрологическая поверка средств измерений с внесением в ФГИС «АРШИН»', category: 'Метрология и поверка', price: 200000, unit: 'шт.' },
                              'serv_retrofit': { name: 'Модернизация (ретрофит) КИМ: контроллер Renishaw UCC + измерительная головка', category: 'Техническое обслуживание', price: 580000, unit: 'компл.' },
                              'serv_probe': { name: 'Замена, юстировка и калибровка измерительных датчиков Renishaw', category: 'Техническое обслуживание', price: 95000, unit: 'шт.' },
                              'serv_scanner': { name: 'Диагностика, калибровка по оптической мишени и юстировка 3D-сканера', category: 'Техническое обслуживание', price: 120000, unit: 'шт.' },

                              // 4. Программное обеспечение, постпроцессоры и обучение
                              'soft_topsolid': { name: 'Поставка лицензии TopSolid 7 Design & CAM (сквозной комплекс CAD/CAM/PDM)', category: 'Программное обеспечение', price: 850000, unit: 'лиц.' },
                              'soft_polyworks': { name: 'Лицензия ПО для КИМ PolyWorks|Inspector™ Standard', category: 'Программное обеспечение', price: 620000, unit: 'лиц.' },
                              'soft_geomagic_dx': { name: 'Лицензия ПО обратного инжиниринга Geomagic Design X', category: 'Программное обеспечение', price: 780000, unit: 'лиц.' },
                              'soft_geomagic_cx': { name: 'Лицензия ПО контроля геометрии Geomagic Control X', category: 'Программное обеспечение', price: 690000, unit: 'лиц.' },
                              'postproc_5axis': { name: 'Разработка индивидуального постпроцессора для 5-осевого станка ЧПУ (TopSolid)', category: 'Инжиниринговые услуги', price: 320000, unit: 'усл.' },
                              'postproc_turn_mill': { name: 'Разработка постпроцессора для токарно-фрезерного центра с противошпинделем', category: 'Инжиниринговые услуги', price: 280000, unit: 'усл.' },
                              'training_cmm': { name: 'Практический курс обучения операторов КИМ и инженеров-метрологов (36 ак. ч.)', category: 'Обучение и консалтинг', price: 140000, unit: 'компл.' },
                              'training_topsolid': { name: 'Курс обучения технологов-программистов ЧПУ в САПР TopSolid 7 (72 ак. ч.)', category: 'Обучение и консалтинг', price: 220000, unit: 'компл.' },

                              // 5. Проектирование и изготовление оснастки
                              'tool_mold': { name: 'Проектирование пресс-формы для литья под давлением (TopSolid\'Mold)', category: 'Инжиниринговые услуги', price: 190000, unit: 'усл.' },
                              'tool_die': { name: 'Проектирование вырубного / гибочного штампа (TopSolid\'Progress)', category: 'Инжиниринговые услуги', price: 160000, unit: 'усл.' },
                              'tool_fixture': { name: 'Проектирование и изготовление контрольного приспособления с паспортом точности', category: 'Оборудование', price: 210000, unit: 'компл.' }
                            };
                            const selected = presets[val];
                            if (selected) {
                              setNewItemForm(prev => ({
                                ...prev,
                                name: selected.name,
                                category: selected.category,
                                price: selected.price,
                                unit: selected.unit
                              }));
                            }
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                          defaultValue=""
                        >
                          <option value="" disabled>-- Выберите услугу или позицию оборудования --</option>
                          
                          <optgroup label="🔬 Услуги на оборудовании компании (парк КИМ, сканеров и трекеров)">
                            <option value="eq_mitutoyo_ctrl">Контроль геометрии на КИМ Mitutoyo CRYSTA-Apex S — 160 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="eq_hexagon_arm_ctrl">Контроль геометрии на мобильной КИМ Hexagon Absolute ARM 8520 — 150 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="eq_leica_ctrl">Высокоточные измерения лазерным трекером Leica AT403 — 220 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="eq_scanline_scan">3D-сканирование сканером ScanLine EasyScan Omni / FreeScan — 180 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="eq_hexagon_rs6_scan">3D-сканирование мобильной КИМ со сканером Hexagon RS6 — 190 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="eq_onsite_audit">Выездной контроль геометрии и аудит оснастки у заказчика — 170 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="eq_arbitration">Арбитражные измерения в лаборатории (Mitutoyo CRYSTA) — 210 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="eq_reverse_eng">Реверс-инжиниринг (оцифровка на оборудовании + CAD ЕСКД) — 240 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="eq_cmm_prog">Разработка измерительных программ для КИМ (MCOSMOS/PolyWorks) — 130 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="eq_fai_report">Контроль первого изделия (FAI) и карта отклонений GD&T — 145 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                          </optgroup>

                          <optgroup label="📦 Поставка измерительного оборудования (каталог)">
                            <option value="cat_hexagon_8520">Мобильная КИМ Hexagon Absolute ARM 8520 (щуп) — 8 400 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="cat_hexagon_rs6">Мобильная КИМ Hexagon ARM со сканером RS6 — 12 800 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="cat_mitutoyo_crysta">Стационарная КИМ Mitutoyo CRYSTA-Apex S — 14 500 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="cat_pmt_arm">Портативная измерительная рука PMT Arm Alpha (7 осей) — 4 900 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="cat_pmt_cmm">Стационарная КИМ PMT CMM серии Alpha — 7 200 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="cat_leica_at403">Лазерный трекер Leica Absolute Tracker AT403 — 18 200 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="cat_scanline_omni">Ручной лазерный 3D-сканер ScanLine EasyScan Omni — 4 200 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="cat_shining_combo">Метрологический 3D-сканер Shining 3D FreeScan Combo — 3 850 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="cat_shining_ue">Лазерный 3D-сканер Shining 3D FreeScan UE — 3 400 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="cat_renishaw">Комплект датчиков и щупов Renishaw (PH10M/TP200) — 1 250 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                          </optgroup>

                          <optgroup label="🛠️ Сервис, ТО, калибровка и поверка КИМ">
                            <option value="serv_cmm_to">Регламентное ТО стационарной КИМ и калибровка лазером — 180 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="serv_arm_to">Регламентное ТО, юстировка и калибровка мобильной КИМ — 150 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="serv_arshin">Метрологическая поверка в ФГИС «АРШИН» — 200 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="serv_retrofit">Ретрофит КИМ: контроллер Renishaw UCC + головка — 580 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="serv_probe">Замена, юстировка и калибровка датчиков Renishaw — 95 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="serv_scanner">Диагностика, калибровка и юстировка 3D-сканера — 120 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                          </optgroup>

                          <optgroup label="💻 Программное обеспечение, постпроцессоры и обучение">
                            <option value="soft_topsolid">Лицензия TopSolid 7 Design & Cam — 850 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="soft_polyworks">Лицензия PolyWorks|Inspector™ Standard — 620 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="soft_geomagic_dx">Лицензия Geomagic Design X (реверс-инжиниринг) — 780 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="soft_geomagic_cx">Лицензия Geomagic Control X (контроль геометрии) — 690 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="postproc_5axis">Разработка постпроцессора для 5-осевого станка ЧПУ — 320 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="postproc_turn_mill">Постпроцессор для токарно-фрезерного центра с ЧПУ — 280 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="training_cmm">Практический курс обучения операторов КИМ (36 ак. ч.) — 140 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="training_topsolid">Курс технологов-программистов TopSolid 7 (72 ак. ч.) — 220 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                          </optgroup>

                          <optgroup label="🏭 Проектирование и изготовление технологической оснастки">
                            <option value="tool_mold">Проектирование пресс-формы для литья пластмасс/металла — 190 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="tool_die">Проектирование вырубного / гибочного штампа — 160 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                            <option value="tool_fixture">Изготовление контрольного приспособления с паспортом точности — 210 000 {getCurrencySymbol(selectedDeal.currency)} (без НДС)</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Item Name */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          Наименование позиции *
                        </label>
                        <input
                          type="text"
                          placeholder="Например: Поставка измерительной руки Hexagon..."
                          value={newItemForm.name}
                          onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                        />
                      </div>

                      {/* Category Selector */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Категория позиции</label>
                        <select
                          value={newItemForm.category}
                          onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="Инжиниринговые услуги">Инжиниринговые услуги</option>
                          <option value="Оборудование">Оборудование и оснастка</option>
                          <option value="Программное обеспечение">Программное обеспечение</option>
                          <option value="Метрология и поверка">Метрология и поверка</option>
                          <option value="Техническое обслуживание">Техническое обслуживание (ТО)</option>
                          <option value="Обучение и консалтинг">Обучение и консалтинг</option>
                        </select>
                      </div>

                      {/* Quantity and Unit */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Количество</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={newItemForm.quantity}
                            onChange={(e) => setNewItemForm({ ...newItemForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Ед. изм.</label>
                          <select
                            value={newItemForm.unit}
                            onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="шт.">шт. (единиц)</option>
                            <option value="компл.">компл. (комплектов)</option>
                            <option value="усл.">усл. (услуга)</option>
                            <option value="час.">час. (часов)</option>
                            <option value="лиц.">лиц. (лицензий)</option>
                            <option value="деталь">деталь (деталей)</option>
                          </select>
                        </div>
                      </div>

                      {/* Unit Price (Without VAT) and Payment Status */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">
                            Цена за ед. без НДС ({getCurrencySymbol(selectedDeal.currency)})
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="5000"
                            value={newItemForm.price}
                            onChange={(e) => setNewItemForm({ ...newItemForm, price: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Статус оплаты</label>
                          <select
                            value={newItemForm.paymentStatus}
                            onChange={(e) => setNewItemForm({ ...newItemForm, paymentStatus: e.target.value as any })}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="pending">Ожидание</option>
                            <option value="prepaid_50">Аванс 50%</option>
                            <option value="paid_100">Оплачено 100%</option>
                          </select>
                        </div>
                      </div>

                      {/* Position Total Preview (Without VAT) */}
                      <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-blue-950 bg-blue-100/60 p-2 rounded-lg">
                        <span>Итого по позиции без НДС:</span>
                        <span className="text-blue-800 font-black">
                          {(newItemForm.quantity * newItemForm.price).toLocaleString('ru-RU')} {getCurrencySymbol(selectedDeal.currency)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingNewItem(false)}
                          className="px-2.5 py-1.5 bg-white border border-gray-300 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Отмена
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddNewItem(selectedDeal.id)}
                          className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Добавить в спецификацию</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-2.5">
                    {(!selectedDeal.items || selectedDeal.items.length === 0) && (
                      <div className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                        <p className="text-xs text-slate-500">Спецификация сделки пока не заполнена</p>
                        {canEditDeals && (
                          <button
                            type="button"
                            onClick={() => setIsAddingNewItem(true)}
                            className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Добавить первую позицию</span>
                          </button>
                        )}
                      </div>
                    )}

                    {selectedDeal.items?.map((item) => {
                      const isEditing = editingItemId === item.id;
                      const isConfirmingDelete = confirmDeleteItemId === item.id;
                      const itemUnit = item.unit || 'шт.';
                      const curSym = getCurrencySymbol(selectedDeal.currency);

                      if (isEditing) {
                        return (
                          <div key={item.id} className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-300 text-xs space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/70">
                              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                                <span>Редактирование позиции</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(selectedDeal.id, item.id)}
                                className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-100/70 rounded-lg transition-colors cursor-pointer"
                                title="Удалить позицию из спецификации"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Item Name */}
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">
                                Наименование позиции *
                              </label>
                              <input
                                type="text"
                                value={editItemForm.name}
                                onChange={(e) => setEditItemForm({ ...editItemForm, name: e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            {/* Category Selector */}
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">Категория</label>
                              <select
                                value={editItemForm.category}
                                onChange={(e) => setEditItemForm({ ...editItemForm, category: e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                <option value="Инжиниринговые услуги">Инжиниринговые услуги</option>
                                <option value="Оборудование">Оборудование и оснастка</option>
                                <option value="Программное обеспечение">Программное обеспечение</option>
                                <option value="Метрология и поверка">Метрология и поверка</option>
                                <option value="Техническое обслуживание">Техническое обслуживание (ТО)</option>
                                <option value="Обучение и консалтинг">Обучение и консалтинг</option>
                              </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Количество</label>
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={editItemForm.quantity}
                                  onChange={(e) => setEditItemForm({ ...editItemForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Ед. изм.</label>
                                <select
                                  value={editItemForm.unit}
                                  onChange={(e) => setEditItemForm({ ...editItemForm, unit: e.target.value })}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                  <option value="шт.">шт. (единиц)</option>
                                  <option value="компл.">компл. (комплектов)</option>
                                  <option value="усл.">усл. (услуга)</option>
                                  <option value="час.">час. (часов)</option>
                                  <option value="лиц.">лиц. (лицензий)</option>
                                  <option value="деталь">деталь (деталей)</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                                  Цена за ед. без НДС ({curSym})
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="5000"
                                  value={editItemForm.price}
                                  onChange={(e) => setEditItemForm({ ...editItemForm, price: Math.max(0, parseInt(e.target.value) || 0) })}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Статус оплаты</label>
                                <select
                                  value={editItemForm.paymentStatus}
                                  onChange={(e) => setEditItemForm({ ...editItemForm, paymentStatus: e.target.value as any })}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                  <option value="pending">Ожидание</option>
                                  <option value="prepaid_50">Аванс 50%</option>
                                  <option value="paid_100">Оплачено 100%</option>
                                </select>
                              </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-amber-950 bg-amber-100/70 p-2 rounded-lg">
                              <span>Итого по позиции без НДС:</span>
                              <span className="font-black text-amber-900">
                                {(editItemForm.quantity * editItemForm.price).toLocaleString('ru-RU')} {curSym}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(selectedDeal.id, item.id)}
                                className="flex items-center gap-1 text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Удалить</span>
                              </button>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleCancelEditItem}
                                  className="px-2.5 py-1 bg-white border border-gray-300 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                >
                                  Отмена
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveItem(selectedDeal.id, item.id)}
                                  className="flex items-center gap-1 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Сохранить</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={item.id} className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-50 border border-gray-200/80 text-xs space-y-2 transition-all group relative">
                          {/* Item Title & Actions */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 line-clamp-2 leading-snug">
                                {item.name}
                              </div>
                              {item.category && (
                                <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                                  {item.category}
                                </div>
                              )}
                            </div>
                            
                            {/* Action Buttons: Edit & Delete */}
                            {canEditDeals && (
                              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleStartEditItem(item)}
                                  title="Редактировать параметры позиции"
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100/70 rounded-lg transition-all cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteItemId(isConfirmingDelete ? null : item.id)}
                                  title="Удалить позицию"
                                  className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Delete Inline Confirmation */}
                          {isConfirmingDelete && (
                            <div className="my-2 p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between gap-2 text-rose-900 animate-in fade-in duration-150">
                              <span className="text-[11px] font-bold">Удалить позицию?</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(selectedDeal.id, item.id)}
                                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px] cursor-pointer transition-colors"
                                >
                                  Да, удалить
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteItemId(null)}
                                  className="px-2 py-0.5 bg-white border border-gray-200 text-slate-500 hover:bg-gray-100 rounded font-semibold text-[10px] cursor-pointer"
                                >
                                  Отмена
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Quantities, Unit & Payment status */}
                          <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-gray-100">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-900">{item.quantity} {itemUnit}</span>
                              <span className="text-gray-400">×</span>
                              <span className="font-medium text-slate-500">{item.price.toLocaleString('ru-RU')} {curSym} <span className="text-[10px] text-gray-400 font-normal">(без НДС)</span></span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                              item.paymentStatus === 'paid_100' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : (item.paymentStatus === 'prepaid_50' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200')
                            }`}>
                              {item.paymentStatus === 'paid_100' ? 'Оплачено 100%' : (item.paymentStatus === 'prepaid_50' ? 'Аванс 50%' : 'Ожидание')}
                            </span>
                          </div>

                          {/* Position Sum */}
                          <div className="text-[11px] flex items-center justify-between pt-1">
                            <span className="text-gray-500">Сумма позиции (без НДС):</span>
                            <span className="font-extrabold text-blue-900 font-mono">
                              {(item.quantity * item.price).toLocaleString('ru-RU')} {curSym}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Specification Total Summary Footer: 3 Required Lines */}
                  {selectedDeal.items && selectedDeal.items.length > 0 && (() => {
                    const vRate = getDealEffectiveVatRate(selectedDeal);
                    const isNoVat = selectedDeal.vatMode === 'no_vat';
                    const isExportZero = selectedDeal.vatMode === 'export_zero';

                    const totalWithoutVat = selectedDeal.items.reduce((acc, it) => acc + (it.quantity * it.price), 0);
                    const vatAmount = (isNoVat || isExportZero) ? 0 : Math.round(totalWithoutVat * (vRate / 100));
                    const totalWithVat = totalWithoutVat + vatAmount;
                    const curSym = getCurrencySymbol(selectedDeal.currency);

                    const vatLabel = isExportZero 
                      ? 'НДС 0% (Экспорт / ст. 164 НК РФ):' 
                      : isNoVat 
                      ? 'НДС (не облагается / УСН):' 
                      : `В том числе НДС ${vRate}%:`;

                    const totalLabel = isExportZero
                      ? 'ИТОГО с учетом НДС 0% (Экспорт):'
                      : isNoVat
                      ? 'ИТОГО (без НДС):'
                      : `ИТОГО с учетом НДС ${vRate}%:`;

                    return (
                      <div className="pt-3 border-t border-gray-200 space-y-2 bg-slate-50/90 -mx-5 -mb-5 p-4 rounded-b-2xl">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-bold text-slate-500">ИТОГО без НДС:</span>
                          <span className="font-bold text-gray-900 font-mono">
                            {totalWithoutVat.toLocaleString('ru-RU')} {curSym}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-semibold text-slate-500">{vatLabel}</span>
                          <span className="font-bold text-blue-700 font-mono">
                            {vatAmount > 0 ? `${vatAmount.toLocaleString('ru-RU')} ${curSym}` : `0 ${curSym}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="font-black text-gray-900">{totalLabel}</span>
                          <span className="font-black text-blue-900 text-base font-mono">
                            {totalWithVat.toLocaleString('ru-RU')} {curSym}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Documents & Files Attachment Block (Unified Light Theme) */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-600" /> Документы проекта
                    </h4>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                      {selectedDeal.documents?.length || 0}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    Коммерческие предложения, технические задания, подписанные NDA и сертификаты поверки.
                  </p>

                  <div className="space-y-2">
                    {selectedDeal.documents && selectedDeal.documents.length > 0 ? (
                      selectedDeal.documents.map(doc => (
                        <div 
                          key={doc.id}
                          onClick={() => setViewingDocument({ doc, deal: selectedDeal })}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-gray-200 transition-colors group cursor-pointer"
                          title="Нажмите для просмотра или печати документа"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              doc.type === 'proposal' ? 'bg-blue-100 text-blue-700' :
                              doc.type === 'nda' ? 'bg-emerald-100 text-emerald-700' :
                              doc.type === 'contract' ? 'bg-amber-100 text-amber-700' : 
                              doc.type === 'certificate' ? 'bg-teal-100 text-teal-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-gray-800 group-hover:text-blue-900 truncate">
                                {doc.name}
                              </div>
                              <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                                <span>{doc.size}</span>
                                <span>•</span>
                                <span>{doc.date}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0 transition-colors" />
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                        К сделке еще не прикреплены документы
                      </div>
                    )}
                  </div>

                  {/* Action buttons: Generate ТКП (PDF) & Attach */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDealForProposal(selectedDeal)}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Сформировать ТКП (PDF)</span>
                    </button>

                    <button
                      onClick={() => setIsAttachDocModalOpen(true)}
                      className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 text-xs font-bold rounded-lg border border-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Прикрепить существующий файл</span>
                    </button>
                  </div>
                </div>

                {/* Delete Deal Danger Zone */}
                {canDeleteDeals && (
                  <div className="pt-1">
                    <button
                      onClick={() => handleDeleteDeal(selectedDeal.id)}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Удалить сделку из CRM</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab: Commercial Proposals Registry */}
      {activeTab === 'proposals' && (
        <ProposalsRegistry
          proposals={proposals}
          setProposals={setProposals}
          deals={deals}
        />
      )}

      {/* Main Tab: Contracts Registry */}
      {activeTab === 'contracts' && (
        <ContractsRegistry
          contracts={contracts}
          setContracts={setContracts}
          deals={deals}
        />
      )}

      {/* Main Tab: Analytics & Conversion Funnel */}
      
      {activeTab === 'dashboard' && (
        <CrmDashboard />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsPipelineView
          deals={deals}
          funnelConfigs={activeFunnels}
        />
      )}

      {/* Main Tab: Email Integration & Outbox Log */}
      


      {/* 5. Loss / Cancellation Modal with Reasons */}
      {isLossModalOpen && selectedDeal && (
        <div className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-lg bg-rose-100">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900">Фиксация причины отказа</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Согласно правилам CRM, при переводе сделки <span className="font-bold text-gray-900">{selectedDeal.id}</span> в архив необходимо зафиксировать отраслевую причину отказа для аналитики.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Типовая причина:</label>
              <select 
                value={selectedLossReason}
                onChange={(e) => setSelectedLossReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                {LOSS_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Дополнительный комментарий менеджера:</label>
              <textarea
                rows={2}
                placeholder="Уточнения по конкурентам, ценообразованию..."
                value={customLossNote}
                onChange={(e) => setCustomLossNote(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setIsLossModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-gray-100 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmDealLoss}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-600/20"
              >
                Подтвердить отказ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Return to Work Modal */}
      {isReturnModalOpen && selectedDeal && (
        <div className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 rounded-lg bg-amber-100">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900">Возврат сделки в работу</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Возобновление работы по проекту <span className="font-bold text-gray-900">{selectedDeal.id}</span>. Перенос карточки из архива обратно в активную воронку.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Основание для возобновления:</label>
              <select 
                value={selectedReturnReason}
                onChange={(e) => setSelectedReturnReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {RETURN_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Заметка главного инженера:</label>
              <textarea
                rows={2}
                placeholder="Номер нового ТЗ, детали повторных переговоров..."
                value={customReturnNote}
                onChange={(e) => setCustomReturnNote(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-gray-100 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmReturnToWork}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-600/20"
              >
                Возобновить сделку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. New Deal Modal */}
      {isNewDealModalOpen && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto">
          <form onSubmit={handleCreateNewDeal} className="bg-white rounded-lg p-6 max-w-lg w-full shadow-sm border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Регистрация новой сделки
              </h3>
              <button 
                type="button" 
                onClick={() => setIsNewDealModalOpen(false)}
                className="text-gray-400 hover:text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Organization with CRM & DaData Auto-complete */}
            <div className="space-y-1.5" ref={companyDropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Организация (Заказчик)</span>
                  <span className="text-red-500">*</span>
                </label>
                {newDealForm.companyId && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                    ✓ Связано с базой
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      required
                      placeholder="Название компании или ИНН (например, ПАО «ОДК» или 6312004455)"
                      value={newDealForm.companyName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewDealForm(prev => ({ 
                          ...prev, 
                          companyName: val,
                          companyId: prev.companyName === val ? prev.companyId : ''
                        }));
                        if (val.length >= 2) {
                          setIsCompanyDropdownOpen(true);
                        }
                      }}
                      onFocus={() => {
                        if (crmCompanies.length > 0 || dadataDealResults.length > 0) {
                          setIsCompanyDropdownOpen(true);
                        }
                      }}
                      className="w-full p-2.5 pr-8 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                    {newDealForm.companyName && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewDealForm(prev => ({
                            ...prev,
                            companyId: '',
                            companyName: '',
                            inn: '',
                            kpp: '',
                            address: '',
                            ceoName: '',
                            ceoPost: 'Генеральный директор',
                            customerName: '',
                            customerPost: '',
                            contactId: '',
                            phone: '',
                            email: ''
                          }));
                          setDadataDealResults([]);
                          setSelectedContactMode('custom');
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600 p-0.5"
                        title="Очистить"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* DaData Search Button */}
                  <button
                    type="button"
                    onClick={() => handleSearchDadataForDeal()}
                    disabled={isSearchingDadataDeal || !newDealForm.companyName.trim()}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
                    title="Поиск реквизитов и руководства в ЕГРЮЛ через DaData"
                  >
                    {isSearchingDadataDeal ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>DaData / ЕГРЮЛ</span>
                  </button>
                </div>

                {/* Company Dropdown List (CRM & DaData) */}
                {isCompanyDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                    {/* 1. CRM Database matches */}
                    {crmCompanies.filter(c => 
                      !newDealForm.companyName.trim() ||
                      c.name.toLowerCase().includes(newDealForm.companyName.toLowerCase()) ||
                      (c.inn && c.inn.includes(newDealForm.companyName.trim()))
                    ).length > 0 && (
                      <div className="p-1">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 rounded flex items-center justify-between">
                          <span>🏢 Компании из базы CRM</span>
                          <span>{crmCompanies.length} в базе</span>
                        </div>
                        {crmCompanies
                          .filter(c => 
                            !newDealForm.companyName.trim() ||
                            c.name.toLowerCase().includes(newDealForm.companyName.toLowerCase()) ||
                            (c.inn && c.inn.includes(newDealForm.companyName.trim()))
                          )
                          .slice(0, 5)
                          .map((comp) => {
                            const contCount = crmContacts.filter(ct => ct.companyId === comp.id).length;
                            return (
                              <button
                                key={comp.id}
                                type="button"
                                onClick={() => selectCrmCompanyForDeal(comp)}
                                className="w-full text-left p-2.5 hover:bg-blue-50 rounded-lg transition-colors border-b border-gray-50 last:border-0 flex items-start justify-between gap-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-xs text-gray-900 truncate">{comp.name}</div>
                                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                    {comp.inn && <span>ИНН: {comp.inn}</span>}
                                    {comp.ceoName && <span>• Рук: {comp.ceoName}</span>}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                                    CRM
                                  </span>
                                  {contCount > 0 && (
                                    <div className="text-[9px] text-slate-400 mt-0.5">
                                      {contCount} конт.
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    )}

                    {/* 2. DaData suggestions */}
                    {dadataDealResults.length > 0 && (
                      <div className="p-1 border-t border-gray-100">
                        <div className="px-3 py-1 text-[10px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 rounded flex items-center justify-between">
                          <span>🌐 Найдено в ЕГРЮЛ (DaData)</span>
                          <span>{dadataDealResults.length}</span>
                        </div>
                        {dadataDealResults.map((sug, idx) => (
                          <button
                            key={`dadata_${idx}`}
                            type="button"
                            onClick={() => selectDadataCompanyForDeal(sug)}
                            className="w-full text-left p-2.5 hover:bg-blue-50 rounded-lg transition-colors border-b border-gray-50 last:border-0 flex items-start justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-gray-900 truncate">{sug.value}</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                {sug.data?.inn && <span>ИНН: {sug.data.inn}</span>}
                                {sug.data?.management?.name && <span>• Рук: {sug.data.management.name}</span>}
                              </div>
                            </div>
                            <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold shrink-0">
                              ЕГРЮЛ
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Footer / Manual option */}
                    <div className="p-2 bg-slate-50 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        {dadataDealStatus || 'Выберите из списка или введите данные вручную'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCompanyDropdownOpen(false)}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Готово
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Company Details Card */}
              {(newDealForm.inn || newDealForm.ceoName || newDealForm.address) && (
                <div className="p-2.5 bg-blue-50/60 border border-blue-200/80 rounded-lg text-xs space-y-1 text-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 text-[11px]">
                      {newDealForm.companyName}
                    </span>
                    {newDealForm.inn && (
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-blue-200 font-mono font-bold text-blue-900">
                        ИНН: {newDealForm.inn} {newDealForm.kpp ? `| КПП: ${newDealForm.kpp}` : ''}
                      </span>
                    )}
                  </div>
                  {newDealForm.ceoName && (
                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                      <span className="text-slate-400">Руководитель:</span>
                      <span className="font-semibold text-slate-800">{newDealForm.ceoName}</span>
                      <span className="text-slate-400">({newDealForm.ceoPost || 'Генеральный директор'})</span>
                    </div>
                  )}
                  {newDealForm.address && (
                    <div className="text-[10px] text-slate-500 truncate" title={newDealForm.address}>
                      {newDealForm.address}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Contact Person & Selector (CEO vs Company Contacts vs Custom) */}
            <div className="space-y-2 p-3 bg-slate-50/80 border border-gray-200 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Контактное лицо (Получатель / ЛПР)</span>
                  <span className="text-red-500">*</span>
                </label>
                
                {/* Mode Selector */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200 self-start sm:self-auto">
                  {newDealForm.ceoName && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContactMode('ceo');
                        setNewDealForm(prev => ({
                          ...prev,
                          customerName: prev.ceoName || prev.customerName,
                          customerPost: prev.ceoPost || 'Генеральный директор',
                          contactId: ''
                        }));
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                        selectedContactMode === 'ceo'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>👑 Руководитель</span>
                    </button>
                  )}

                  {availableDealContacts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContactMode('crm_contact');
                        const first = availableDealContacts[0];
                        if (first) {
                          setNewDealForm(prev => ({
                            ...prev,
                            customerName: first.fullName,
                            customerPost: first.position || 'Контактное лицо',
                            contactId: first.id,
                            phone: first.workPhone || first.mobilePhone || prev.phone,
                            email: first.email || prev.email
                          }));
                        }
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                        selectedContactMode === 'crm_contact'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      <span>Контакты ({availableDealContacts.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedContactMode('custom');
                      setNewDealForm(prev => ({ ...prev, contactId: '' }));
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      selectedContactMode === 'custom'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ✏️ Вручную
                  </button>
                </div>
              </div>

              {/* If CRM Contacts mode: Dropdown to pick from company contacts */}
              {selectedContactMode === 'crm_contact' && availableDealContacts.length > 0 && (
                <div className="p-2 bg-indigo-50/70 border border-indigo-200 rounded-lg space-y-1.5">
                  <label className="text-[10px] font-bold text-indigo-900 uppercase">
                    Выберите контактное лицо компании:
                  </label>
                  <select
                    value={newDealForm.contactId || availableDealContacts[0]?.id}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const cont = availableDealContacts.find(c => c.id === selId);
                      if (cont) {
                        setNewDealForm(prev => ({
                          ...prev,
                          contactId: cont.id,
                          customerName: cont.fullName,
                          customerPost: cont.position || 'Контактное лицо',
                          phone: cont.workPhone || cont.mobilePhone || prev.phone,
                          email: cont.email || prev.email
                        }));
                      }
                    }}
                    className="w-full p-2 text-xs bg-white border border-indigo-300 rounded-md font-bold text-indigo-950 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {availableDealContacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} — {c.position || 'Контакт'} {c.isDecisionMaker ? '★ ЛПР' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Contact Form Fields: Name, Post, Phone, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    ФИО контактного лица <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Иванов Сергей Викторович"
                    value={newDealForm.customerName}
                    onChange={(e) => setNewDealForm({...newDealForm, customerName: e.target.value})}
                    className="w-full p-2.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mt-0.5 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Должность
                  </label>
                  <input 
                    type="text"
                    placeholder="Главный метролог / Начальник цеха"
                    value={newDealForm.customerPost}
                    onChange={(e) => setNewDealForm({...newDealForm, customerPost: e.target.value})}
                    className="w-full p-2.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mt-0.5 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="+7 (846) 000-00-00"
                    value={newDealForm.phone}
                    onChange={(e) => setNewDealForm({...newDealForm, phone: e.target.value})}
                    className="w-full p-2.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mt-0.5 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email"
                    required
                    placeholder="contact@company.ru"
                    value={newDealForm.email}
                    onChange={(e) => setNewDealForm({...newDealForm, email: e.target.value})}
                    className="w-full p-2.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mt-0.5 font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Воронка продаж</label>
              <select
                value={newDealForm.funnel}
                onChange={(e) => setNewDealForm({...newDealForm, funnel: e.target.value as any})}
                className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1 font-bold"
              >
                <option value="equipment">Оборудование и ПО (КИМ, 3D-сканеры, PolyWorks, САПР TopSolid 7)</option>
                <option value="services">Услуги (3D-сканирование, реверс-инжиниринг, постпроцессоры ЧПУ)</option>
                <option value="support">Техподдержка и Техническое обслуживание (ТО КИМ, Поверка, Калибровка)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Ответственный менеджер / Инженер</label>
              <select
                value={newDealForm.responsibleManager || (availableManagers[0]?.value || 'Скобелев А.С.')}
                onChange={(e) => setNewDealForm({...newDealForm, responsibleManager: e.target.value})}
                className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1 font-semibold text-gray-900"
              >
                {availableManagers.map((mgr, idx) => (
                  <option key={`${mgr.value}_${idx}`} value={mgr.value}>
                    {mgr.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative" ref={catalogDropdownRef}>
              <label className="text-[11px] font-bold text-slate-500 uppercase">
                Наименование задачи / Оборудования <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <button
                  type="button"
                  onClick={() => setIsCatalogDropdownOpen(!isCatalogDropdownOpen)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-lg hover:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-left flex justify-between items-center"
                >
                  <span className={newDealForm.catalogSelection ? 'text-gray-900' : 'text-gray-500'}>
                    {newDealForm.catalogSelection === 'other' 
                      ? 'Другое / Ввести вручную...' 
                      : (newDealForm.catalogSelection || '-- Выберите из каталога --')}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isCatalogDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-gray-100 bg-slate-50/50">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Поиск по названию или бренду..."
                          value={catalogSearchQuery}
                          onChange={(e) => setCatalogSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      {newDealForm.funnel !== 'services' && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[
                            { id: 'all', label: 'Все' },
                            { id: 'hardware', label: 'Оборудование' },
                            { id: 'scanners', label: 'Сканеры' },
                            { id: 'cmm', label: 'КИМ' },
                            { id: 'software', label: 'ПО' }
                          ].map(f => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setCatalogFilterType(f.id)}
                              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                                catalogFilterType === f.id 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-white border border-gray-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto p-1">
                      {filteredCatalogItems.length === 0 ? (
                        <div className="p-3 text-center text-xs text-gray-500">Ничего не найдено</div>
                      ) : (
                        filteredCatalogItems.map((item: any) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setNewDealForm({ ...newDealForm, catalogSelection: item.name, serviceType: item.name });
                              setIsCatalogDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-slate-500 hover:bg-blue-50 rounded-lg flex items-center justify-between group"
                          >
                            <span className="font-semibold truncate pr-2">{item.name}</span>
                            {item.brand && <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">{item.brand}</span>}
                          </button>
                        ))
                      )}
                      
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setNewDealForm({ ...newDealForm, catalogSelection: 'other', serviceType: '' });
                            setIsCatalogDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Другое / Ввести вручную...
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {newDealForm.catalogSelection === 'other' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Укажите наименование вручную <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  required
                  placeholder="Например: Поставка КИМ Mitutoyo CRYSTA-Apex S + ПО PolyWorks"
                  value={newDealForm.serviceType}
                  onChange={(e) => setNewDealForm({...newDealForm, serviceType: e.target.value})}
                  className={`w-full p-2.5 text-xs rounded-lg focus:bg-white focus:ring-2 outline-none mt-1 ${
                    duplicateExistingDeal 
                      ? 'border-2 border-rose-400 bg-rose-50/50 focus:ring-rose-500' 
                      : 'bg-slate-50 border border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
            )}

            {/* Duplicate Deal Alert Card */}
            {duplicateExistingDeal && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs space-y-2 animate-in fade-in slide-in-from-top-1 text-rose-950 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Сделка с таким наименованием уже существует для данной компании!</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  В системе уже зарегистрирована аналогичная сделка для контрагента <strong>«{duplicateExistingDeal.companyName || newDealForm.companyName}»</strong>:
                </p>
                <div className="p-2.5 bg-white/95 rounded-lg border border-rose-200 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-1.5 shadow-2xs">
                  <div>
                    <span className="text-slate-500">ID сделки:</span> <strong className="font-mono text-rose-950">{duplicateExistingDeal.id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Воронка:</span> <span className="font-semibold text-slate-800">{activeFunnels[duplicateExistingDeal.funnel]?.name || duplicateExistingDeal.funnel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Этап:</span> <span className="font-semibold text-rose-900">{activeFunnels[duplicateExistingDeal.funnel]?.stages.find(s => s.id === duplicateExistingDeal.stage)?.label || duplicateExistingDeal.stage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Ответственный:</span> <span className="font-semibold text-slate-800">{duplicateExistingDeal.responsibleManager || duplicateExistingDeal.createdByManager || 'Не назначен'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <span className="text-[10px] text-rose-700 font-bold flex items-center gap-1">
                    <span>⛔ Добавление заблокировано во избежание дублирования</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewDealModalOpen(false);
                      setSelectedDeal(duplicateExistingDeal);
                      setActiveFunnel(duplicateExistingDeal.funnel);
                      showToast(`Открыта существующая сделка ${duplicateExistingDeal.id}`);
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Перейти к сделке {duplicateExistingDeal.id}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Ориентировочный бюджет ({getCurrencySymbol(newDealForm.currency)}) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number"
                  required
                  value={newDealForm.estimatedPrice}
                  onChange={(e) => setNewDealForm({...newDealForm, estimatedPrice: Number(e.target.value)})}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1 font-bold text-blue-700"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Валюта сделки</label>
                <select
                  value={newDealForm.currency}
                  onChange={(e) => setNewDealForm({...newDealForm, currency: e.target.value as CurrencyCode})}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1 font-bold text-gray-800"
                >
                  <option value="RUB">Рубли (₽)</option>
                  <option value="USD">Доллар США ($)</option>
                  <option value="EUR">Евро (€)</option>
                  <option value="CNY">Юани (¥)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Серийный номер станка/КИМ</label>
              <input 
                type="text"
                placeholder="SHN-CMB-2026 (опционально)"
                value={newDealForm.equipmentSerial}
                onChange={(e) => setNewDealForm({...newDealForm, equipmentSerial: e.target.value})}
                className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Детали и требования к точности</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setNewDealAttachedFile(e.target.files[0]);
                    }
                  }} 
                />
                {!newDealAttachedFile ? (
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    Добавить файл ТЗ
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-lg">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]" title={newDealAttachedFile.name}>{newDealAttachedFile.name}</span>
                    <button 
                      type="button" 
                      onClick={() => setNewDealAttachedFile(null)}
                      className="text-blue-500 hover:text-rose-600 ml-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <textarea 
                rows={3}
                placeholder="Габариты деталей, допуски, требования к пусконаладке..."
                value={newDealForm.details}
                onChange={(e) => setNewDealForm({...newDealForm, details: e.target.value})}
                className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsNewDealModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-gray-100 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={Boolean(duplicateExistingDeal)}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                  duplicateExistingDeal 
                    ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed shadow-none' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 cursor-pointer active:scale-95'
                }`}
                title={duplicateExistingDeal ? 'Сделка с таким наименованием уже существует для данной компании' : 'Создать сделку'}
              >
                {duplicateExistingDeal ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Дубликат сделки (заблокировано)</span>
                  </>
                ) : (
                  <span>Создать сделку</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Document Viewer & Stub Generator Modal */}
      {viewingDocument && (
        <CrmDocumentViewerModal
          document={viewingDocument.doc}
          deal={viewingDocument.deal}
          onClose={() => setViewingDocument(null)}
          onDeleteDocument={handleDeleteDocumentFromDeal}
          canDelete={canEditDeals}
        />
      )}

      {/* 7. Document Attachment Modal */}
      {isAttachDocModalOpen && selectedDeal && (
        <CrmAttachDocModal
          deal={selectedDeal}
          onClose={() => setIsAttachDocModalOpen(false)}
          onAddDocument={handleAddDocumentToDeal}
        />
      )}

      {/* 7.5. Interactive Commercial Proposal (ТКП) Generator Modal */}
      {dealForProposal && (
        <GenerateProposalModal
          isOpen={Boolean(dealForProposal)}
          deal={dealForProposal}
          onClose={() => setDealForProposal(null)}
          onSaveDocumentToDeal={handleSaveProposalToDeal}
        />
      )}

      {/* 8. Safe Delete Deal Confirmation Modal (No window.confirm, 100% iframe-safe) */}
      {dealToDelete && (
        <div className="fixed inset-0 z-[800] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900">Удаление сделки из CRM</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Вы действительно хотите безвозвратно удалить сделку <br />
                <strong className="text-gray-800">«{dealToDelete.companyName || dealToDelete.customerName}»</strong> ({dealToDelete.id})?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDealToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-500 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDeal(dealToDelete.id);
                  if (selectedDeal?.id === dealToDelete.id) {
                    setSelectedDeal(null);
                    setIsFullscreenDeal(false);
                  }
                  showToast(`Сделка ${dealToDelete.id} успешно удалена из CRM`);
                  setDealToDelete(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить сделку</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Sales Funnel Stages Editor Modal */}
      {isStageEditorOpen && (
        <FunnelStagesEditorModal
          initialFunnelId={activeFunnel}
          onClose={() => setIsStageEditorOpen(false)}
        />
      )}

      {/* 10. Global CRM VAT & Tax Settings Modal */}
      {isVatSettingsOpen && (
        <CrmVatSettingsModal
          onClose={() => setIsVatSettingsOpen(false)}
        />
      )}
    </div>
  );
};
