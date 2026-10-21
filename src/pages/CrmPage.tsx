import React, { useState, useEffect } from 'react';
import { usePageVisits } from '../hooks/usePageVisits';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  LogIn, 
  ArrowLeft,
  LayoutDashboard,
  PieChart,
  Building2,
  FileText,
  Calendar,
  Briefcase,
  Wrench,
  MessageSquare,
  TrendingUp,
  Settings,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  Users,
  CheckCircle2,
  Clock,
  Bell,
  RefreshCw,
  FolderOpen,
  BookOpen
} from 'lucide-react';

// CRM Core Modules
import { CrmPanel } from '../components/crm/CrmPanel';
import { ContactCenterTab } from '../components/crm/ContactCenterTab';
import { ProposalsRegistry } from '../components/crm/ProposalsRegistry';
import { ManagerTasksTab } from '../components/crm/ManagerTasksTab';
import { ContractsRegistry } from '../components/crm/ContractsRegistry';
import { CrmDashboard } from '../components/crm/CrmDashboard';
import { ArshinVerificationSchedule } from '../components/crm/ArshinVerificationSchedule';
import { CompanyFleetRegistry } from '../components/crm/CompanyFleetRegistry';
import { MetrologyReportsRegistry } from '../components/crm/MetrologyReportsRegistry';
import { CertificatesRegistry } from '../components/crm/CertificatesRegistry';
import { CrmAdminView } from '../components/CrmAdminView';
import { BotSettingsView } from '../components/crm/BotSettingsView';
import { NotificationSettingsView } from '../components/notifications/NotificationSettingsView';
import { EmailSettingsView } from '../components/crm/EmailSettingsView';
import { CrmManualView } from '../components/crm/CrmManualView';
import { CrmRealtimeLogsView } from '../components/crm/CrmRealtimeLogsView';
import { AssetsManagerView } from '../components/crm/AssetsManagerView';
import { CrmTaxVatSettingsView } from '../components/crm/CrmTaxVatSettingsView';
import { DadataSettingsView } from '../components/crm/DadataSettingsView';
import { CrmDocumentationModal } from '../components/crm/CrmDocumentationModal';
import { PriceListsRegistry } from '../components/crm/PriceListsRegistry';
import { GenerateProposalModal } from '../components/crm/GenerateProposalModal';
import { TkpTzGeneratorView } from '../components/crm/TkpTzGeneratorView';
import { TelephonyCallsTab } from '../components/crm/TelephonyCallsTab';
import { PriceItem } from '../data/priceListsData';
import { Tag, PhoneCall, Wand2 } from 'lucide-react';

export type CrmMainTab = 
  | 'funnels' 
  | 'companies' 
  | 'proposals' 
  | 'pricelists'
  | 'tasks' 
  | 'contracts' 
  | 'certificates'
  | 'metrology' 
  | 'training'
  | 'communications' 
  | 'telephony'
  | 'dashboard' 
  | 'analytics' 
  | 'settings'
  | 'tkp-tz-generator';

export type MetrologySubTab = 'arshin-schedule' | 'fleet' | 'reports';
export type SettingsSubTab = 'taxes' | 'dadata' | 'bot' | 'notifications' | 'email' | 'manual' | 'logs' | 'assets';

export const CrmPage: React.FC = () => {
  usePageVisits('crm');
  const { currentUser, isAdmin, userPermissions, navigateTo, deals, crmSettings } = useApp();
  
  const hasCrmAccess = !!currentUser && (
    isAdmin || 
    !!userPermissions?.canAccessCrm || 
    currentUser.role === 'superadmin' || 
    currentUser.role === 'admin' || 
    currentUser.role === 'manager'
  );

  // Restore active tab from sessionStorage or default to 'funnels'
  const [activeTab, setActiveTab] = useState<CrmMainTab>(() => {
    try {
      const saved = sessionStorage.getItem('ds_crm_active_tab');
      if (saved && ['funnels', 'companies', 'proposals', 'tkp-tz-generator', 'pricelists', 'tasks', 'contracts', 'certificates', 'metrology', 'communications', 'telephony', 'dashboard', 'analytics', 'settings'].includes(saved)) {
        return saved as CrmMainTab;
      }
    } catch {}
    return 'funnels';
  });

  const [metrologyTab, setMetrologyTab] = useState<MetrologySubTab>('arshin-schedule');
  const [settingsTab, setSettingsTab] = useState<SettingsSubTab>('bot');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [crmQuickSearch, setCrmQuickSearch] = useState('');
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedPriceItemForProposal, setSelectedPriceItemForProposal] = useState<PriceItem | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('ds_crm_active_tab', activeTab);
    } catch {}
  }, [activeTab]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Listen to custom tab navigation events
  useEffect(() => {
    const handleCustomNav = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.tab) {
        setActiveTab(detail.tab);
      }
    };
    window.addEventListener('crm:navigate-tab', handleCustomNav);
    return () => window.removeEventListener('crm:navigate-tab', handleCustomNav);
  }, []);

  // Calculate live badge counts
  const activeDealsCount = (deals || []).filter(d => d.stage !== 'closed_won' && d.stage !== 'lost').length;
  const proposalsCount = (deals || []).filter(d => (d as any).proposal || (d as any).proposalId).length;

  if (!hasCrmAccess) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Доступ к CRM ограничен</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Единая рабочая среда управления воронкой, сделками, контрагентами и задачами предназначена исключительно для уполномоченных менеджеров и инженеров компании «ДС‑Инжиниринг».
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => navigateTo('account')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Войти в личный кабинет сотрудника</span>
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Вернуться на главную страницу</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Top Professional Header Bar */}
      <div className="bg-gradient-to-r from-[#002244] via-[#1E3A8A] to-[#2563EB] text-white py-3.5 sm:py-4 px-4 sm:px-6 lg:px-8 shadow-md border-b border-blue-900/60 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1 w-full lg:w-auto">
            {/* Zero-pill clean engineering metadata */}
            <div className="flex items-center gap-2 text-xs text-blue-200 flex-wrap">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Единая среда CRM</span>
              </span>
              <span aria-hidden="true" className="text-blue-400">·</span>
              <span className="text-blue-100 font-medium">
                {currentUser?.fullName} ({currentUser?.position || 'Инженер / Менеджер'})
              </span>
            </div>
            
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Единая среда CRM & Управление проектами</span>
            </h1>
          </div>

          {/* Quick External Actions & Settings */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            {isAdmin && (
              <button
                onClick={() => navigateTo('account')}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Настройки прав доступа и системные параметры"
              >
                <Settings className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Настройки</span>
              </button>
            )}
            <button
              onClick={() => navigateTo('home')}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-200 shrink-0" />
              <span>На сайт</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs Bar */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          
          {/* Mobile Quick Dropdown */}
          <div className="lg:hidden flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 shrink-0">Раздел CRM:</span>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as CrmMainTab)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="Продажи и клиенты">
                  <option value="funnels">📊 Воронка и Сделки ({activeDealsCount})</option>
                  <option value="companies">🏢 Контрагенты и ЛПР</option>
                  <option value="proposals">📄 ТКП и Расчеты ({proposalsCount})</option>
                  <option value="pricelists">🏷️ Прайс-листы (Оборудование/ПО/Услуги)</option>
                </optgroup>
                <optgroup label="Исполнение и Сертификаты">
                  <option value="contracts">💼 Договоры</option>
                  <option value="certificates">📜 Свидетельства и Сертификаты</option>
                  <option value="metrology">🔧 Метрология и АРШИН</option>
                  <option value="dashboard">📈 Сводный Дашборд</option>
                  <option value="analytics">📊 Аналитика KPI</option>
                </optgroup>
                <optgroup label="Операционная деятельность">
                  <option value="tasks">📅 Задачи и Календарь</option>
                  <option value="telephony">📞 Телефония & SIP-звонки</option>
                  <option value="communications">💬 Коммуникации</option>
                  <option value="training">🎓 Обучение & Регламенты</option>
                  <option value="settings">⚙️ Настройки CRM</option>
                </optgroup>
              </select>
            </div>

            {/* Horizontal Swipeable Chips on Mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-2 px-2 touch-pan-x">
              {[
                { id: 'funnels' as const, label: 'Воронка', icon: PieChart, count: activeDealsCount },
                { id: 'companies' as const, label: 'Контрагенты', icon: Building2 },
                { id: 'proposals' as const, label: 'ТКП и Расчеты', icon: FileText, count: proposalsCount },
                { id: 'pricelists' as const, label: 'Прайс-листы', icon: Tag },
                { id: 'contracts' as const, label: 'Договоры', icon: Briefcase },
                { id: 'certificates' as const, label: 'Сертификаты', icon: Award },
                { id: 'metrology' as const, label: 'АРШИН', icon: Wrench },
                { id: 'dashboard' as const, label: 'Дашборд', icon: LayoutDashboard },
                { id: 'analytics' as const, label: 'KPI', icon: TrendingUp },
                { id: 'tasks' as const, label: 'Задачи', icon: Calendar },
                { id: 'telephony' as const, label: 'Телефония', icon: PhoneCall },
                { id: 'communications' as const, label: 'Связь', icon: MessageSquare },
                { id: 'training' as const, label: 'Обучение & Регламенты', icon: BookOpen },
                { id: 'settings' as const, label: 'Настройки', icon: Settings },
              ].map((tabItem) => {
                const Icon = tabItem.icon;
                const isActive = activeTab === tabItem.id;
                return (
                  <button
                    key={tabItem.id}
                    type="button"
                    onClick={() => setActiveTab(tabItem.id)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tabItem.label}</span>
                    {typeof tabItem.count === 'number' && tabItem.count > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white text-blue-900' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {tabItem.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Grouped Navigation (>= lg screens) - Wrap Multiline Bar */}
          <div className="hidden lg:flex flex-wrap items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
            {/* Segment 1: Продажи */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 px-1.5 flex items-center gap-1 shrink-0 whitespace-nowrap">
                <PieChart className="w-3 h-3" />
                <span>Продажи:</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('funnels')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'funnels'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <span>Воронка & Сделки</span>
                {activeDealsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === 'funnels' ? 'bg-white text-blue-900' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {activeDealsCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('companies')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'companies'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Контрагенты</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('proposals')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'proposals'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>ТКП и Расчеты</span>
                {proposalsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === 'proposals' ? 'bg-white text-blue-900' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {proposalsCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pricelists')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'pricelists'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Прайс-листы</span>
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 shrink-0 mx-1 hidden sm:block" />

            {/* Segment 2: Исполнение */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-1.5 flex items-center gap-1 shrink-0 whitespace-nowrap">
                <Briefcase className="w-3 h-3" />
                <span>Исполнение:</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('contracts')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'contracts'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <span>Договоры</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('certificates')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'certificates'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Сертификаты</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('metrology')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'metrology'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Метрология</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Дашборд</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>KPI</span>
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 shrink-0 mx-1 hidden sm:block" />

            {/* Segment 3: Операции */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 px-1.5 flex items-center gap-1 shrink-0 whitespace-nowrap">
                <Calendar className="w-3 h-3" />
                <span>Операции:</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'tasks'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <span>Задачи</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('telephony')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'telephony'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                <span>Телефония</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('communications')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'communications'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Связь</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('training')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'training'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Обучение & Регламенты</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Настройки</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Sub-navigation for Metrology */}
      {activeTab === 'metrology' && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 py-2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Разделы метрологии:</span>
            <button
              type="button"
              onClick={() => setMetrologyTab('arshin-schedule')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                metrologyTab === 'arshin-schedule'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              График поверок ФГИС «АРШИН»
            </button>
            <button
              type="button"
              onClick={() => setMetrologyTab('fleet')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                metrologyTab === 'fleet'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Парк оборудования заказчиков
            </button>
            <button
              type="button"
              onClick={() => setMetrologyTab('reports')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                metrologyTab === 'reports'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Протоколы измерений и GD&T
            </button>
          </div>
        </div>
      )}

      {/* Secondary Sub-navigation for Settings */}
      {activeTab === 'settings' && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 py-2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Конфигурация:</span>
            <button
              type="button"
              onClick={() => setSettingsTab('dadata')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                settingsTab === 'dadata'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>DaData API (ЕГРЮЛ)</span>
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('bot')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                settingsTab === 'bot'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Телеграм-бот и Уведомления
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('taxes')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                settingsTab === 'taxes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Ставки НДС и Налоги
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('notifications')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                settingsTab === 'notifications'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Push-уведомления
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('email')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                settingsTab === 'email'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Корпоративная Почта
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('logs')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                settingsTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Логи системы
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('assets')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                settingsTab === 'assets'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Активы
            </button>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* 1. Funnels & Kanban Pipeline */}
        {activeTab === 'funnels' && (
          <div className="animate-in fade-in duration-200">
            <CrmPanel activeTab="funnels" />
          </div>
        )}

        {/* 2. Companies & Contacts */}
        {activeTab === 'companies' && (
          <div className="animate-in fade-in duration-200">
            <ContactCenterTab />
          </div>
        )}

        {/* 3. Commercial Proposals */}
        {activeTab === 'proposals' && (
          <div className="animate-in fade-in duration-200">
            <ProposalsRegistry 
              deals={deals} 
              onOpenTkpTzGenerator={() => setActiveTab('tkp-tz-generator')}
            />
          </div>
        )}

        {/* 3.1 Full-Screen TKP & TZ Generator (Мастер и Сплит-редактор) */}
        {activeTab === 'tkp-tz-generator' && (
          <div className="animate-in fade-in duration-200">
            <TkpTzGeneratorView onBack={() => setActiveTab('proposals')} />
          </div>
        )}

        {/* 3.5 Price Lists Registry (Equipment, Software, Services, Accessories) */}
        {activeTab === 'pricelists' && (
          <div className="animate-in fade-in duration-200">
            <PriceListsRegistry 
              onOpenProposalWithItem={(item) => {
                setSelectedPriceItemForProposal(item);
                setIsProposalModalOpen(true);
              }}
              currentManagerName={currentUser?.fullName || 'Некрасов С.Ю.'}
            />
          </div>
        )}

        {/* 4. Manager Tasks & Calendar */}
        {activeTab === 'tasks' && (
          <div className="animate-in fade-in duration-200">
            <ManagerTasksTab />
          </div>
        )}

        {/* 5. Contracts & Deliveries */}
        {activeTab === 'contracts' && (
          <div className="animate-in fade-in duration-200">
            <ContractsRegistry />
          </div>
        )}

        {/* 5.5 Certificates Module (Extracted) */}
        {activeTab === 'certificates' && (
          <div className="animate-in fade-in duration-200">
            <CertificatesRegistry />
          </div>
        )}

        {/* 6. Metrology Hub */}
        {activeTab === 'metrology' && (
          <div className="animate-in fade-in duration-200">
            {metrologyTab === 'arshin-schedule' && (
              <ArshinVerificationSchedule onBackToCrm={() => setActiveTab('funnels')} />
            )}
            {metrologyTab === 'fleet' && (
              <CompanyFleetRegistry />
            )}
            {metrologyTab === 'reports' && (
              <MetrologyReportsRegistry />
            )}
          </div>
        )}

        {/* 7. Training Center & Regulations */}
        {activeTab === 'training' && (
          <div className="animate-in fade-in duration-200">
            <CrmManualView onNavigateToTab={(tab: string) => {
              if (['funnels', 'companies', 'proposals', 'tasks', 'contracts', 'certificates', 'metrology', 'analytics', 'dashboard', 'communications'].includes(tab)) {
                setActiveTab(tab as CrmMainTab);
              }
            }} />
          </div>
        )}

        {/* 8. Communications Hub */}
        {activeTab === 'communications' && (
          <div className="animate-in fade-in duration-200">
            <CrmAdminView />
          </div>
        )}

        {/* 8.5 Telephony & SIP Calls */}
        {activeTab === 'telephony' && (
          <div className="animate-in fade-in duration-200">
            <TelephonyCallsTab />
          </div>
        )}

        {/* 9. Unified Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-200">
            <CrmDashboard 
              onNavigateToSchedule={() => {
                setActiveTab('metrology');
                setMetrologyTab('arshin-schedule');
              }}
              onNavigateToTasks={() => {
                setActiveTab('tasks');
              }}
            />
          </div>
        )}

        {/* 10. Analytics & Conversion */}
        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-200">
            <CrmPanel activeTab="analytics" />
          </div>
        )}

        {/* 11. Settings & Knowledge */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-200">
            {settingsTab === 'dadata' && <DadataSettingsView />}
            {settingsTab === 'taxes' && <CrmTaxVatSettingsView />}
            {settingsTab === 'bot' && <BotSettingsView />}
            {settingsTab === 'notifications' && <NotificationSettingsView />}
            {settingsTab === 'email' && <EmailSettingsView />}
            {settingsTab === 'manual' && <CrmManualView onNavigateToTab={() => {}} />}
            {settingsTab === 'logs' && <CrmRealtimeLogsView />}
            {settingsTab === 'assets' && <AssetsManagerView />}
          </div>
        )}
      </div>

      {/* CRM Interactive Documentation Modal */}
      <CrmDocumentationModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        initialTab="proposals"
      />

      {/* Standalone Proposal Generator Modal from Price Lists / Deals */}
      <GenerateProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => {
          setIsProposalModalOpen(false);
          setSelectedPriceItemForProposal(null);
        }}
        initialPriceItem={selectedPriceItemForProposal}
        currentManagerName={currentUser?.fullName || 'Некрасов С.Ю.'}
      />
    </div>
  );
};

export default CrmPage;
