import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Layers, 
  FileText, 
  FileCheck2, 
  TrendingUp, 
  Mail, 
  LifeBuoy, 
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Search,
  CheckCircle2,
  ArrowRight,
  Clock,
  AlertTriangle,
  HelpCircle,
  Send,
  KeyRound,
  Cpu,
  Building2,
  UserCheck,
  CheckSquare,
  Sparkles,
  ExternalLink,
  Lock,
  RefreshCw,
  FileSignature,
  Percent,
  Wrench,
  Settings,
  Filter,
  Copy,
  Info,
  PhoneCall,
  FileSpreadsheet,
  Truck,
  Headphones,
  Bell,
  Volume2,
  Zap,
  Users,
  Calendar,
  Gauge,
  FileBadge,
  ClipboardCheck,
  Briefcase,
  UserCog,
  History,
  Award,
  Check
} from 'lucide-react';

export interface CrmManualViewProps {
  onNavigateToTab?: (tab: string) => void;
  onNavigateAccountTab?: (tab: string) => void;
}

export const CrmManualView: React.FC<CrmManualViewProps> = ({ 
  onNavigateToTab, 
  onNavigateAccountTab 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'notifications_guide': true,
    'workflow_overview': true,
    'crm_funnels': true,
    'contact_center': true,
    'manager_tasks': false,
    'proposals_registry': false,
    'contracts_registry': false,
    'fleet_registry': false,
    'metrology_reports': false,
    'certificates_registry': false,
    'analytics_pipeline': false,
    'email_yandex': false,
    'support_tickets': false,
    'licenses_dongles': false,
    'user_management': false,
    'bot_settings': false,
    'checklists': false,
    'faq': false
  });

  const navigate = (tab: string) => {
    if (onNavigateAccountTab) {
      onNavigateAccountTab(tab);
    } else if (onNavigateToTab) {
      onNavigateToTab(tab);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    setExpandedSections({
      'notifications_guide': true,
      'workflow_overview': true,
      'crm_funnels': true,
      'contact_center': true,
      'manager_tasks': true,
      'proposals_registry': true,
      'contracts_registry': true,
      'fleet_registry': true,
      'metrology_reports': true,
      'certificates_registry': true,
      'analytics_pipeline': true,
      'email_yandex': true,
      'support_tickets': true,
      'licenses_dongles': true,
      'user_management': true,
      'bot_settings': true,
      'checklists': true,
      'faq': true
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      'notifications_guide': false,
      'workflow_overview': false,
      'crm_funnels': false,
      'contact_center': false,
      'manager_tasks': false,
      'proposals_registry': false,
      'contracts_registry': false,
      'fleet_registry': false,
      'metrology_reports': false,
      'certificates_registry': false,
      'analytics_pipeline': false,
      'email_yandex': false,
      'support_tickets': false,
      'licenses_dongles': false,
      'user_management': false,
      'bot_settings': false,
      'checklists': false,
      'faq': false
    });
  };

  // Auto-expand when searching or filtering by category
  useEffect(() => {
    if (activeCategory !== 'all' || searchQuery.trim()) {
      expandAll();
    }
  }, [activeCategory, searchQuery]);

  const categories = [
    { id: 'all', label: 'Все регламенты', icon: BookOpen },
    { id: 'notifications', label: 'Оповещения & SLA', icon: Bell },
    { id: 'pipeline', label: 'Сквозной процесс B2B', icon: TrendingUp },
    { id: 'crm', label: 'Сделки & Воронки', icon: Layers },
    { id: 'contacts', label: 'Клиенты & ЛПР', icon: Users },
    { id: 'tasks', label: 'Календарь & Задачи', icon: Calendar },
    { id: 'kp', label: 'Реестр ТКП', icon: FileText },
    { id: 'contracts', label: 'Договоры & Проекты', icon: FileSignature },
    { id: 'fleet', label: 'Парк приборов СИ', icon: Gauge },
    { id: 'metrology', label: 'Метрологические отчеты', icon: ClipboardCheck },
    { id: 'certificates', label: 'Свидетельства поверки', icon: FileBadge },
    { id: 'analytics', label: 'Аналитика & KPI', icon: Percent },
    { id: 'email', label: 'Почта Яндекс 360', icon: Mail },
    { id: 'support', label: 'Техподдержка', icon: LifeBuoy },
    { id: 'licenses', label: 'Лицензии & Ключи', icon: KeyRound },
    { id: 'users', label: 'Пользователи & Роли', icon: UserCog },
    { id: 'checklists', label: 'Чек-листы & FAQ', icon: CheckSquare },
  ];

  const isMatch = (keywords: string) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return keywords.toLowerCase().includes(query);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-lg p-6 sm:p-8 text-white shadow-sm relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Регламенты и стандарты работы ООО «ДС-Инжиниринг» • Версия 2026 г.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Единый регламент & Инструкции CRM
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Официальное руководство для менеджеров проектов, инженеров-метрологов и кураторов. Стандарты ведения сделок, базы ЛПР, формирования ТКП, контроля поверок во ФГИС «АРШИН» и регламентного обслуживания оборудования.
            </p>
          </div>

          {/* Quick Stats or Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={expandAll}
              className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <ChevronDown className="w-4 h-4" />
              <span>Развернуть все</span>
            </button>
            <button 
              onClick={collapseAll}
              className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <ChevronRight className="w-4 h-4" />
              <span>Свернуть все</span>
            </button>
          </div>
        </div>

        {/* Search bar inside header */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Быстрый поиск по регламентам (например: SLA, 5 минут, ЛПР, поверка, АРШИН, ТКП, аванс, договор, тикет)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Очистить
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Category Filters Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                isActive 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20' 
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Accordion Content Sections */}
      <div className="space-y-4">

        {/* 1. SECTION: Многоканальные оповещения и SLA дежурного инженера */}
        {(activeCategory === 'all' || activeCategory === 'notifications') && isMatch('оповещения звонки sla телеграм telegram бот звук pop-up live реакция норматив 5 минут') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('notifications_guide')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-red-50/70 to-rose-50/50 hover:bg-red-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-600 text-white rounded-lg shadow-xs">
                  <Bell className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-slate-900 text-base sm:text-lg">
                      Многоканальные Оповещения и Норматив SLA дежурного инженера
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider border border-red-200">
                      SLA: до 5–15 мин
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Live Pop-up со звуковым сигналом, Telegram-бот, шлюз Яндекс 360 и регламент первичного контакта
                  </p>
                </div>
              </div>
              {expandedSections['notifications_guide'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['notifications_guide'] && (
              <div className="p-6 border-t border-slate-100 space-y-5 text-sm text-slate-700 leading-relaxed">
                <div className="bg-red-50/80 p-4 rounded-lg border border-red-200 flex items-start gap-3 text-xs text-red-950">
                  <Clock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Критический норматив реагирования (SLA):</strong> Время первого контакта с клиентом при поступлении заявки на обратный звонок или расчете в онлайн-калькуляторе составляет <strong>не более 5–15 минут</strong> в рабочее время (с 08:30 до 18:00 МСК).
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Volume2 className="w-4 h-4 text-rose-600" />
                      <span>1. Живой экранный звонок (Live Pop-up)</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">
                      При заказе звонка на сайте во вкладке CRM у всех авторизованных менеджеров всплывает карточка звонка с синтезом звукового гонга (Web Audio).
                    </p>
                    <div className="text-[11px] font-semibold text-rose-700">Действие: нажать «Принять в работу» и набрать клиента.</div>
                  </div>

                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Send className="w-4 h-4 text-blue-600" />
                      <span>2. Telegram-бот дежурного инженера</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">
                      Все лиды мгновенно дублируются в служебный канал Telegram через бота. Сообщение содержит телефон, имя, организацию и прикрепленные файлы чертежей.
                    </p>
                    <div className="text-[11px] font-semibold text-blue-700">Скорость доставки: менее 0.8 сек.</div>
                  </div>

                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Mail className="w-4 h-4 text-amber-600" />
                      <span>3. Корпоративный шлюз Яндекс 360</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">
                      Письмо-уведомление с детальной спецификацией параметров сканирования или КИМ падает на общую диспетчерскую почту компании.
                    </p>
                    <div className="text-[11px] font-semibold text-amber-700">Фиксация: резервное копирование заявки.</div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate('notifications')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Настроить каналы в «Оповещения и каналы»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('email')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer border border-slate-200 transition-colors"
                  >
                    <span>Настройки почты Яндекс 360</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. SECTION: Сквозной регламент продаж B2B */}
        {(activeCategory === 'all' || activeCategory === 'pipeline') && isMatch('регламент b2b этапы процесс воронка продажи куратор инженер ответственность') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('workflow_overview')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 hover:bg-blue-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Сквозной регламент продаж B2B & Зоны ответственности
                  </h2>
                  <p className="text-xs text-slate-500">
                    5 ключевых этапов сделки от входящего запроса до ПНР, поверки КИМ и сервисного контракта SMA
                  </p>
                </div>
              </div>
              {expandedSections['workflow_overview'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['workflow_overview'] && (
              <div className="p-6 border-t border-slate-100 space-y-6 text-sm text-slate-700 leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 flex flex-col justify-between">
                    <div>
                      <span className="font-black text-blue-900 text-[11px] block uppercase mb-1">Этап 1</span>
                      <strong className="text-slate-900 block mb-1">Лид & Квалификация</strong>
                      <p className="text-slate-500 text-[11px]">Первичный звонок (до 15 мин), сбор исходных данных, ИНН, контактов ЛПР.</p>
                    </div>
                    <span className="text-[10px] text-blue-700 font-bold mt-2">Win Rate: 10%</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-200 flex flex-col justify-between">
                    <div>
                      <span className="font-black text-indigo-900 text-[11px] block uppercase mb-1">Этап 2</span>
                      <strong className="text-slate-900 block mb-1">Технический аудит</strong>
                      <p className="text-slate-500 text-[11px]">Анализ чертежей, точности (мкм), станков ЧПУ, демо TopSolid / PolyWorks.</p>
                    </div>
                    <span className="text-[10px] text-indigo-700 font-bold mt-2">Win Rate: 35%</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-cyan-50/60 border border-cyan-200 flex flex-col justify-between">
                    <div>
                      <span className="font-black text-cyan-900 text-[11px] block uppercase mb-1">Этап 3</span>
                      <strong className="text-slate-900 block mb-1">Спецификация & ТКП</strong>
                      <p className="text-slate-500 text-[11px]">Принцип Equipment-First: подбор оборудования, расчет опций с НДС.</p>
                    </div>
                    <span className="text-[10px] text-cyan-700 font-bold mt-2">Win Rate: 60%</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 flex flex-col justify-between">
                    <div>
                      <span className="font-black text-amber-900 text-[11px] block uppercase mb-1">Этап 4</span>
                      <strong className="text-slate-900 block mb-1">Договор & Аванс</strong>
                      <p className="text-slate-500 text-[11px]">Согласование спецификации, назначение куратора, контроль оплаты аванса.</p>
                    </div>
                    <span className="text-[10px] text-amber-700 font-bold mt-2">Win Rate: 80%</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between">
                    <div>
                      <span className="font-black text-emerald-900 text-[11px] block uppercase mb-1">Этап 5</span>
                      <strong className="text-slate-900 block mb-1">ПНР & Исполнение</strong>
                      <p className="text-slate-500 text-[11px]">Поставка, монтаж, поверка по ГОСТ Р ИСО 10360 (АРШИН), подписанный Акт.</p>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold mt-2">Win Rate: 100%</span>
                  </div>
                </div>

                {/* Roles Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>Зона ответственности Менеджера по продажам:</span>
                    </h4>
                    <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4">
                      <li>Быстрая реакция на новый лид (норматив до 15 минут).</li>
                      <li>Ведение карточки клиента и актуализация базы ЛПР в Contact Center.</li>
                      <li>Формирование и отправка официального ТКП с номером КП-2026/XXX.</li>
                      <li>Контроль графика оплат (аванс 50/70%, финальный расчет).</li>
                      <li>Постановка напоминаний и задач в модуле «Календарь и задачи».</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-blue-600" />
                      <span>Зона ответственности Ведущего инженера / Куратора:</span>
                    </h4>
                    <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4">
                      <li>Технический аудит 3D CAD моделей деталей, чертежей и допусков GD&T.</li>
                      <li>Проведение демонстраций TopSolid 7 и PolyWorks на образцах заказчика.</li>
                      <li>Разработка и отладка кинематических постпроцессоров для станков ЧПУ.</li>
                      <li>Проведение ПНР, калибровка КИМ, обучение технологов и операторов.</li>
                      <li>Оформление официальных метрологических отчетов и протоколов измерений.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. SECTION: CRM-система и Воронки */}
        {(activeCategory === 'all' || activeCategory === 'crm') && isMatch('сделки воронки kanban канбан этапы win rate lost отказ карточка спецификация') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('crm_funnels')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-amber-50/70 to-orange-50/50 hover:bg-amber-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-lg shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    CRM-система и Воронки продаж (Kanban)
                  </h2>
                  <p className="text-xs text-slate-500">
                    3 специализированные воронки, ведение карточки сделки, расчет маржи и фиксация отказов (Lost Deal)
                  </p>
                </div>
              </div>
              {expandedSections['crm_funnels'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['crm_funnels'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Вкладка <strong>«Сделки и воронка»</strong> — основной рабочий инструмент менеджера. Все проекты разделены на 3 специализированных потока:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/40 space-y-1.5">
                    <strong className="text-blue-900 block font-bold">1. Оборудование и ПО (8 этапов)</strong>
                    <p className="text-slate-500">Поставка координатно-измерительных машин, 3D-сканеров, лазерных трекеров, лицензий PolyWorks и САПР TopSolid 7.</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 space-y-1.5">
                    <strong className="text-amber-900 block font-bold">2. Инжиниринговые услуги (6 этапов)</strong>
                    <p className="text-slate-500">3D-сканирование на выезде, реверс-инжиниринг деталей, разработка постпроцессоров ЧПУ, проектирование оснастки.</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                    <strong className="text-emerald-900 block font-bold">3. Техподдержка и Сервис (5 этапов)</strong>
                    <p className="text-slate-500">Регламентное ТО измерительных рук, периодическая поверка КИМ по ГОСТ Р ИСО 10360, продление подписок SMA.</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase">Обязательные правила работы с карточкой сделки:</h4>
                  <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
                    <li><strong>Drag & Drop:</strong> перемещайте карточку слева направо по мере закрытия этапов. Win Rate рассчитывается автоматически.</li>
                    <li><strong>Принцип Equipment-First:</strong> при формировании спецификации в первую очередь указывайте задействованное оборудование из парка приборов.</li>
                    <li><strong>Таймлайн заметок:</strong> любой контакт с клиентом (звонок, отправка чертежей, выезд) фиксируется новой заметкой в истории.</li>
                    <li><strong>Причина отказа (Lost Deal):</strong> при срыве сделки карточка перемещается в «Отказ / Архив» с обязательным указанием причины (Цена, Выбор конкурента, Заморозка бюджета, Сроки) и развернутым комментарием.</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('funnels')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Перейти в модуль «Сделки и воронка»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. SECTION: База предприятий, клиентов и ЛПР (Contact Center) - НОВОЕ! */}
        {(activeCategory === 'all' || activeCategory === 'contacts') && isMatch('клиенты предприятия лпр контакты инн база contact center директор главный метролог технолог') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('contact_center')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-50/70 to-teal-50/50 hover:bg-blue-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    База клиентов и ЛПР (Contact Center)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Учет промышленных предприятий, ИНН, филиалов, контактов Главных метрологов, технологов и директоров по закупкам
                  </p>
                </div>
              </div>
              {expandedSections['contact_center'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['contact_center'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Модуль <strong>«Клиенты и ЛПР»</strong> (`ContactCenterTab`) предназначен для долгосрочного накопления информации о промышленных контрагентах, заводах и ключевых лицах, принимающих решения.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 uppercase flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Карточка предприятия (Контрагента):</span>
                    </h4>
                    <ul className="text-slate-500 space-y-1.5 list-disc pl-4">
                      <li><strong>Юридические реквизиты:</strong> Полное наименование (ПАО, АО, ООО), ИНН, КПП, ОГРН, фактический адрес производства.</li>
                      <li><strong>Отраслевая классификация:</strong> ОПК и Авиастроение, Автомобилестроение, Тяжелое машиностроение, Металлообработка, Приборостроение.</li>
                      <li><strong>Парк оборудования заказчика:</strong> установленные КИМ, станки с ЧПУ (стойки Fanuc, Heidenhain, Siemens), используемые САПР.</li>
                      <li><strong>История взаимоотношений:</strong> перечень заключенных договоров, выданных лицензий и сформированных ТКП.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 uppercase flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>Учет лиц, принимающих решения (ЛПР):</span>
                    </h4>
                    <ul className="text-slate-500 space-y-1.5 list-disc pl-4">
                      <li><strong>Должность и статус:</strong> Главный инженер, Главный метролог, Главный технолог, Нач. ОТК, Директор по закупкам.</li>
                      <li><strong>Прямые контакты:</strong> рабочий мобильный телефон, добавочный внутренний номер, корпоративный email, Telegram.</li>
                      <li><strong>Связка со сделками:</strong> ЛПР автоматически подтягивается в карточку сделки, ТКП и договор в 1 клик.</li>
                      <li><strong>Экспорт в Excel:</strong> возможность выгрузки адресной базы для официальных рассылок или выездных презентаций.</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('contact-center')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Открыть базу «Клиенты и ЛПР»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. SECTION: Календарь и персональные задачи менеджера - НОВОЕ! */}
        {(activeCategory === 'all' || activeCategory === 'tasks') && isMatch('календарь задачи дедлайны чек-лист планирование звонок день неделя менеджер') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('manager_tasks')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-purple-50/70 to-indigo-50/50 hover:bg-purple-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600 text-white rounded-lg shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Календарь и Персональные задачи менеджера
                  </h2>
                  <p className="text-xs text-slate-500">
                    Управление рабочим временем, дедлайны по сделкам, контрольные звонки, выездные встречи и чек-листы выполнения
                  </p>
                </div>
              </div>
              {expandedSections['manager_tasks'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['manager_tasks'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Модуль <strong>«Календарь и задачи»</strong> (`ManagerTasksTab`) исключает забытые звонки, срывы сроков отправки ТКП и утерю договоренностей с промышленными заказчиками.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-purple-50/50 rounded-lg border border-purple-200 space-y-1.5">
                    <strong className="text-purple-950 font-bold block">1. Календарные режимы</strong>
                    <p className="text-slate-500">Переключение видов: Месяц, Неделя, День и Таблица. Наглядный обзор запланированных выездов инженеров, онлайн-демонстраций ПО и дедлайнов по оплатам.</p>
                  </div>
                  <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200 space-y-1.5">
                    <strong className="text-blue-950 font-bold block">2. Привязка к сделкам</strong>
                    <p className="text-slate-500">Каждая задача связывается с конкретной сделкой или контрагентом. Выполнение задачи мгновенно фиксируется в таймлайне проекта.</p>
                  </div>
                  <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-1.5">
                    <strong className="text-emerald-950 font-bold block">3. Чек-листы внутри задач</strong>
                    <p className="text-slate-500">Возможность разбивать крупные поручения (например: «Подготовка к выезду на завод») на подзадачи с поэтапными галочками выполнения.</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase">Регламент работы с задачами:</h4>
                  <ul className="text-slate-700 space-y-1 list-disc pl-4">
                    <li>Ни одна активная сделка не должна оставаться без запланированного следующего действия более 3 рабочих дней.</li>
                    <li>Просроченные задачи подсвечиваются ярким красным бейджем и требуют первоочередного закрытия в начале рабочего дня.</li>
                    <li>В правой боковой панели CRM постоянно отображается виджет «Мои задачи на сегодня».</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('tasks')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Перейти в «Календарь и задачи»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. SECTION: Реестр КП */}
        {(activeCategory === 'all' || activeCategory === 'kp') && isMatch('реестр кп коммерческое предложение ткп ндс 20% 22% спецификация шаблоны polyworks topsolid') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('proposals_registry')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-cyan-50/70 to-blue-50/50 hover:bg-cyan-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-600 text-white rounded-lg shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Реестр КП (Коммерческие предложения)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Генерация официальных КП вида КП-2026/XXX, авто-расчет НДС, мультивалютность и экспорт в PDF
                  </p>
                </div>
              </div>
              {expandedSections['proposals_registry'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['proposals_registry'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Модуль <strong>«Реестр ТКП»</strong> позволяет в считанные минуты формировать юридически и технически безупречные коммерческие предложения с фирменной символикой «ДС-Инжиниринг».
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-cyan-50/50 p-4 rounded-lg border border-cyan-200 space-y-2">
                    <h4 className="font-bold text-cyan-950 uppercase flex items-center gap-2">
                      <Percent className="w-4 h-4 text-cyan-700" />
                      <span>Финансовый блок и НДС:</span>
                    </h4>
                    <ul className="text-cyan-900 space-y-1.5 list-disc pl-4">
                      <li>Цены позиций вносятся <strong>без НДС</strong> с автоматическим расчетом ставки налога.</li>
                      <li>Блок «ИТОГО» строго рассчитывает 3 обязательные строки: ИТОГО без НДС, сумму налога НДС и ИТОГО с учетом НДС.</li>
                      <li>Поддерживаются валюты расчетов: Рубли (₽ RUB), Доллары ($ USD), Евро (€ EUR), Юани (¥ CNY).</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200 space-y-2">
                    <h4 className="font-bold text-blue-950 uppercase flex items-center gap-2">
                      <FileSignature className="w-4 h-4 text-blue-700" />
                      <span>Инженерные шаблоны ТКП:</span>
                    </h4>
                    <ul className="text-blue-900 space-y-1.5 list-disc pl-4">
                      <li><strong>PolyWorks & КИМ:</strong> акцент на точностные характеристики, аттестацию PTB и ФГИС «АРШИН».</li>
                      <li><strong>TopSolid 7 & CAM:</strong> акцент на кинематику ЧПУ, 5-осевую обработку и постпроцессоры.</li>
                      <li><strong>Услуги 3D-сканирования:</strong> этапы реверс-инжиниринга, форматы STEP/IGES, допуски формы.</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('proposals')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Открыть «Реестр ТКП»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. SECTION: Реестр Договоров и Проекты */}
        {(activeCategory === 'all' || activeCategory === 'contracts') && isMatch('договоры проекты куратор аванс оплата акты сдача-приемка лк клиент') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('contracts_registry')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50/70 to-teal-50/50 hover:bg-emerald-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-lg shadow-xs">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Реестр Договоров и Проекты
                  </h2>
                  <p className="text-xs text-slate-500">
                    Юридическое сопровождение, назначение кураторов, контроль графика платежей и синхронизация с ЛК Заказчика
                  </p>
                </div>
              </div>
              {expandedSections['contracts_registry'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['contracts_registry'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  После акцепта коммерческого предложения проект переходит в <strong>«Реестр Договоров»</strong>. Система контролирует все юридические обязательства компании:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Куратор проекта:</span>
                    Обязательное назначение профильного инженера («Скобелев А.С.», «Ярыш И.В.», «Морозов В.Г.»). Контакты куратора видны заказчику в Личном кабинете.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Финансовый контроль:</span>
                    Сумма договора, контроль предоплаты (аванс 50% или 70%), фиксация факта поступления финального платежа.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Акты сдачи-приемки:</span>
                    Загрузка двусторонних сканов Актов с синими печатями или отметками ЭДО (Диадок/СБИС).
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Синхронизация с ЛК клиента:</span>
                    Все загруженные сканы документов мгновенно отображаются в Личном кабинете заказчика.
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('contracts')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Перейти в «Реестр Договоров»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. SECTION: Парк приборов и средств измерений (Fleet Registry) - НОВОЕ! */}
        {(activeCategory === 'all' || activeCategory === 'fleet') && isMatch('парк приборов средства измерений си ким сканеры трекеры поверка аршин дислокация') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('fleet_registry')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-teal-50/70 to-emerald-50/50 hover:bg-teal-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-600 text-white rounded-lg shadow-xs">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Парк приборов и Средств измерений компании (СИ)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Учет координатно-измерительных машин, 3D-сканеров, трекеров, контроль сроков поверки во ФГИС «АРШИН»
                  </p>
                </div>
              </div>
              {expandedSections['fleet_registry'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['fleet_registry'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Раздел <strong>«Применяемое оборудование»</strong> (`CompanyFleetRegistry`) обеспечивает строгий метрологический учет парка измерительных систем «ДС-Инжиниринг»:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">Mitutoyo CRYSTA-Apex S (Япония)</strong>
                    <p className="text-slate-500">Стационарная высокоточная КИМ. Зав. № MIT-APEX-9106-JP. Погрешность MPE: от 1.7 мкм. Дислокация: Метрологический зал Тольятти.</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">Hexagon Absolute ARM 8520 + RS6</strong>
                    <p className="text-slate-500">Портативная измерительная рука с лазерным 3D-сканером. Зав. № 8520-7A-4491-RU. Погрешность: 0.02 мм. Выездные замеры у заказчиков.</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">Leica Absolute Tracker AT403</strong>
                    <p className="text-slate-500">Лазерный трекер для крупногабаритных объектов до 160 м. Зав. № AT403-9120-CH. Дислокация: Выездные аудиты ОПК и авиастроения.</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">ScanLine EasyScan Omni</strong>
                    <p className="text-slate-500">Оптический 3D-сканер синего света для пресс-форм и штампов. Зав. № SL-OMNI-2025-084. Точность: до 0.015 мм.</p>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-1.5">
                  <h4 className="font-bold uppercase flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Контроль поверок по ФГИС «АРШИН» (Росстандарт):</span>
                  </h4>
                  <p>
                    Система автоматически отслеживает даты окончания поверок. За 45 и 30 дней до окончания срока прибор подсвечивается янтарным цветом, и метрологу формируется задача на отправку в ЦСМ/ВНИИМС. Применение неповеренных приборов в официальных отчетах блокируется.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('fleet')}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Перейти в «Применяемое оборудование»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9. SECTION: Реестр метрологических отчетов - НОВОЕ! */}
        {(activeCategory === 'all' || activeCategory === 'metrology') && isMatch('метрологические отчеты протоколы 3d контроль gd&t отклонения чертежи excel') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('metrology_reports')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 hover:bg-blue-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-lg shadow-xs">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Реестр метрологических отчетов и Протоколов 3D-контроля
                  </h2>
                  <p className="text-xs text-slate-500">
                    Выдача протоколов измерений, цветовые карты отклонений GD&T, связка с СИ и экспорт в Excel
                  </p>
                </div>
              </div>
              {expandedSections['metrology_reports'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['metrology_reports'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Модуль <strong>«Метрологические отчеты»</strong> (`MetrologyReportsRegistry`) предназначен для регистрации официальных результатов лазерного 3D-сканирования, инспекции геометрии в PolyWorks и обмеров на КИМ:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <strong className="text-slate-900 block font-bold">Алгоритм регистрации отчета:</strong>
                    <ol className="text-slate-500 space-y-1.5 list-decimal pl-4">
                      <li>Нажмите «+ Создать отчет» в реестре отчетов.</li>
                      <li>Выберите контрагента и контактное лицо из базы CRM.</li>
                      <li>Выберите прибор из парка (заводской номер и номер свидетельства АРШИН подтянутся автоматически).</li>
                      <li>Укажите инженера-метролога, проводившего замеры.</li>
                      <li>Прикрепите PDF-протокол контроля и архив цветовых карт отклонений.</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <strong className="text-slate-900 block font-bold">Стандарты оформления:</strong>
                    <ul className="text-slate-500 space-y-1.5 list-disc pl-4">
                      <li>Все протоколы формируются с указанием допуска по ГОСТ Р ИСО 10360.</li>
                      <li>Отчеты мгновенно синхронизируются с Личным кабинетом заказчика.</li>
                      <li>Доступен пакетный экспорт реестра отчетов в Microsoft Excel (`.xlsx`).</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('metrology-reports')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Перейти в «Метрологические отчеты»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 10. SECTION: Реестр свидетельств и сертификатов поверки - НОВОЕ! */}
        {(activeCategory === 'all' || activeCategory === 'certificates') && isMatch('свидетельства сертификаты поверка аршин росстандарт аттестация калибровка') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('certificates_registry')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50/70 to-cyan-50/50 hover:bg-emerald-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-lg shadow-xs">
                  <FileBadge className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Свидетельства и Сертификаты поверки
                  </h2>
                  <p className="text-xs text-slate-500">
                    Электронный архив свидетельств о поверке СИ, прямые ссылки на ФГИС «АРШИН» и метрологическая аттестация
                  </p>
                </div>
              </div>
              {expandedSections['certificates_registry'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['certificates_registry'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Модуль <strong>«Свидетельства и сертификаты»</strong> (`CertificatesRegistry`) хранит официальные метрологические документы для предъявления аудиторам СМК и заказчикам военного и авиационного профиля.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <strong className="text-slate-900 block font-bold">Верификация в ФГИС «АРШИН»:</strong>
                    <p className="text-slate-500">
                      Каждое свидетельство содержит уникальный номер записи в Федеральном информационном фонде по обеспечению единства измерений. Заказчик может проверить подлинность поверки в один клик.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <strong className="text-slate-900 block font-bold">Сертификаты программного обеспечения:</strong>
                    <p className="text-slate-500">
                      В реестре зафиксированы международные и российские сертификаты аттестации расчетных алгоритмов PolyWorks (сертификат PTB Class 1 — наивысший класс точности).
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('certificates')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Открыть «Свидетельства и сертификаты»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 11. SECTION: Аналитика и Воронка продаж */}
        {(activeCategory === 'all' || activeCategory === 'analytics') && isMatch('аналитика воронка конверсия recharts kpi потерянные сделки причины срыва utm') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('analytics_pipeline')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-purple-50/70 to-indigo-50/50 hover:bg-purple-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600 text-white rounded-lg shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Сквозная Аналитика и Показатели конверсии (Recharts)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Оценка конверсии по каналам лидогенерации, средний чек, взвешенный доход и диаграммы причин отказов
                  </p>
                </div>
              </div>
              {expandedSections['analytics_pipeline'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['analytics_pipeline'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Модуль <strong>«Аналитика и KPI»</strong> (`CrmAnalyticsDashboard.tsx`) визуализирует бизнес-показатели предприятия с помощью интерактивных графиков библиотеки Recharts:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-purple-50/50 rounded-lg border border-purple-200 space-y-1">
                    <span className="font-bold text-purple-950 block">Взвешенный прогноз (Weighted Revenue):</span>
                    <p className="text-slate-500">Сумма всех сделок с учетом математической вероятности закрытия этапа (Win Rate).</p>
                  </div>
                  <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200 space-y-1">
                    <span className="font-bold text-blue-950 block">Источники трафика:</span>
                    <p className="text-slate-500">Анализ эффективности: Калькулятор стоимости, Чат-виджет «Онлайн-инженер», прямые RFQ со страниц услуг.</p>
                  </div>
                  <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200 space-y-1">
                    <span className="font-bold text-amber-950 block">Причины срыва (Loss Reasons):</span>
                    <p className="text-slate-500">Гистограмма отказов позволяет вовремя корректировать ценообразование и аргументацию ТКП.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('analytics')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Перейти в модуль «Аналитика и KPI»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 12. SECTION: Корпоративная Почта (Яндекс 360) */}
        {(activeCategory === 'all' || activeCategory === 'email') && isMatch('почта яндекс 360 smtp ssl пароль приложения отправка писем outbox шаблоны') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('email_yandex')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-50/70 to-sky-50/50 hover:bg-blue-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Корпоративная Почта (Яндекс 360 SMTP)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Инструкция по генерации 16-значного Пароля приложения Яндекс ID, SSL 465, шаблоны писем и журнал Outbox
                  </p>
                </div>
              </div>
              {expandedSections['email_yandex'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['email_yandex'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <div className="bg-amber-50 p-5 rounded-lg border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 font-black text-amber-950 text-sm">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Пошаговая инструкция: получение «Пароля приложения» в Яндекс:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-amber-200">
                      <div className="font-bold text-amber-900 mb-1">Шаг 1. Профиль Яндекс ID</div>
                      <p className="text-slate-500">Перейдите на страницу безопасности: <strong>id.yandex.ru/security</strong></p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-amber-200">
                      <div className="font-bold text-amber-900 mb-1">Шаг 2. Пароли приложений</div>
                      <p className="text-slate-500">В блоке доступа нажмите «Пароли приложений».</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-amber-200">
                      <div className="font-bold text-amber-900 mb-1">Шаг 3. Тип «Почта»</div>
                      <p className="text-slate-500">Выберите тип «Почта (IMAP/SMTP)», укажите имя «CRM ДС-Инжиниринг».</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-amber-200">
                      <div className="font-bold text-amber-900 mb-1">Шаг 4. Ввод в CRM</div>
                      <p className="text-slate-500">Вставьте полученный 16-значный пароль во вкладке «Настройки почты».</p>
                    </div>
                  </div>

                  <p className="text-xs text-amber-900 font-semibold mt-2">
                    ⚠️ Внимание: Обычный пароль от аккаунта Яндекс не подходит по требованиям безопасности Яндекс 360.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('email')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Перейти во вкладку «Настройки почты»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 13. SECTION: Заявки в техподдержку (Тикеты) */}
        {(activeCategory === 'all' || activeCategory === 'support') && isMatch('техподдержка тикеты сервис sla серийный номер оборудование ремонт инцидент') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('support_tickets')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-teal-50/70 to-emerald-50/50 hover:bg-teal-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-600 text-white rounded-lg shadow-xs">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Заявки в техподдержку (B2B Сервис & Тикеты)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Регламент инцидентов, привязка к серийным номерам оборудования, уровни критичности SLA и закрытие
                  </p>
                </div>
              </div>
              {expandedSections['support_tickets'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['support_tickets'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block mb-1">1. Серийный номер прибора</strong>
                    <p className="text-slate-500">Обязательно указывайте точную модель и заводской номер измерительной машины или ключа HASP.</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block mb-1">2. Уровни SLA</strong>
                    <p className="text-slate-500">Критический (остановка станка/КИМ) — ответ до 1 часа; Высокий — до 4 часов; Стандартный — до 24 часов.</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block mb-1">3. Конвертация в услуги</strong>
                    <p className="text-slate-500">Если требуется негарантийный ремонт, тикет в 1 клик переводится в сделку воронки услуг.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('tickets')}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Открыть «Техподдержка»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 14. SECTION: Лицензии и ключи защиты */}
        {(activeCategory === 'all' || activeCategory === 'licenses') && isMatch('лицензии ключи защиты hasp wibu topsolid polyworks подписка maintenance dongle') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('licenses_dongles')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-indigo-50/70 to-blue-50/50 hover:bg-blue-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Лицензии и Ключи защиты (TopSolid, PolyWorks, КИМ)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Учет аппаратных ключей HASP/Wibu, контроль дат окончания подписки Maintenance, прикрепление файлов .v2c
                  </p>
                </div>
              </div>
              {expandedSections['licenses_dongles'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['licenses_dongles'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200">
                    <strong className="text-blue-950 block mb-1">Dongle ID (USB-ключи):</strong>
                    <p className="text-slate-500">Фиксация номеров аппаратных электронных ключей с привязкой к конкретному станку или рабочему месту технолога.</p>
                  </div>
                  <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200">
                    <strong className="text-blue-950 block mb-1">Контроль Maintenance (SMA):</strong>
                    <p className="text-slate-500">За 60 и 30 дней до окончания срока подписки система ставит задачу менеджеру на предложение продления.</p>
                  </div>
                  <div className="p-3.5 bg-teal-50/50 rounded-lg border border-teal-200">
                    <strong className="text-teal-950 block mb-1">Файлы лицензий в ЛК:</strong>
                    <p className="text-slate-500">Прикрепление файлов лицензий (.lic, .v2c) для оперативного скачивания клиентом при переустановке ОС.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('licenses')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Открыть «Лицензии и ключи ПО»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 15. SECTION: Пользователи, роли и справочник должностей - НОВОЕ! */}
        {(activeCategory === 'all' || activeCategory === 'users') && isMatch('пользователи роли права должности company_positions администратор суперадмин rbac') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('user_management')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-blue-50/60 hover:bg-blue-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-800 text-white rounded-lg shadow-xs">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Пользователи, Права доступа и Справочник должностей
                  </h2>
                  <p className="text-xs text-slate-500">
                    Разграничение ролей (RBAC), добавление сотрудников, синхронизация должностей с PostgreSQL
                  </p>
                </div>
              </div>
              {expandedSections['user_management'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['user_management'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <strong className="text-slate-900 block font-bold">Ролевая модель доступа (RBAC):</strong>
                    <ul className="text-slate-500 space-y-1.5 list-disc pl-4">
                      <li><strong>Суперадминистратор / Администратор:</strong> полный доступ к CRM, CMS, управлению аккаунтами и базе данных.</li>
                      <li><strong>Менеджер / Ведущий инженер:</strong> доступ к воронкам, сделкам, ТКП, договорам, парку приборов и тикетам.</li>
                      <li><strong>Клиент (Заказчик):</strong> изолированный доступ только к своим договорам, лицензиям и отчетам.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <strong className="text-slate-900 block font-bold">Справочник должностей компании:</strong>
                    <ul className="text-slate-500 space-y-1.5 list-disc pl-4">
                      <li>Должности хранятся в реляционной таблице `company_positions` в PostgreSQL.</li>
                      <li>При добавлении сотрудника администратор выбирает должность из списка либо создает новую в 1 клик.</li>
                      <li>Должность автоматически выводится в карточках сделок, договорах и печатных бланках.</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('users')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Перейти в «Пользователи и права»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 16. SECTION: База ответов Онлайн-Инженера (Чат-бот) */}
        {(activeCategory === 'all' || activeCategory === 'checklists') && isMatch('бот чат ии ai онлайн инженер база ответов ключевые слова') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('bot_settings')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-purple-50/70 to-pink-50/50 hover:bg-purple-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600 text-white rounded-lg shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    База ответов Онлайн-Инженера (Чат-бот)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Управление сценариями консультаций, ключевыми словами и быстрыми кнопками навигации виртуального помощника
                  </p>
                </div>
              </div>
              {expandedSections['bot_settings'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['bot_settings'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Во вкладке <strong>«Ответы ИИ-чата»</strong> администраторы и ведущие инженеры настраивают базу знаний виджета на сайте:
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4">
                  <li><strong>Ключевые слова:</strong> задаются через запятую (например: <code>постпроцессор, topsolid, калибровка ким, погрешность</code>).</li>
                  <li><strong>Текст ответа:</strong> развернутый экспертный комментарий с рекомендацией решения.</li>
                  <li><strong>Кнопка действия:</strong> указание `PageId` для мгновенного предложения перейти в нужный раздел каталога или калькулятора.</li>
                </ul>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('bot-settings')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Настроить сценарии в «Ответы ИИ-чата»</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 17. SECTION: Операционные Чек-листы менеджера */}
        {(activeCategory === 'all' || activeCategory === 'checklists') && isMatch('чек-лист памятка проверка лид кп договор сдача проекта') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('checklists')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50/70 to-blue-50/50 hover:bg-emerald-100/50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-lg shadow-xs">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Операционные Чек-листы менеджера
                  </h2>
                  <p className="text-xs text-slate-500">
                    Контрольные списки для самопроверки перед отправкой ТКП, заключением договора и сдачей ПНР
                  </p>
                </div>
              </div>
              {expandedSections['checklists'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['checklists'] && (
              <div className="p-6 border-t border-slate-100 space-y-4 text-sm text-slate-700 leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Чек-лист: Отправка коммерческого предложения (ТКП):</span>
                    </h4>
                    <ul className="text-xs space-y-1.5 text-slate-700">
                      <li className="flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5 rounded text-blue-600" readOnly checked />
                        <span>Уточнены контактные данные ЛПР (Главный метролог / Главный технолог).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5 rounded text-blue-600" readOnly checked />
                        <span>Применен принцип Equipment-First (выбрано оборудование из парка компании).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5 rounded text-blue-600" readOnly checked />
                        <span>Проверен расчет НДС и срок действия предложения (30 календарных дней).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5 rounded text-blue-600" readOnly checked />
                        <span>Сформирован официальный PDF-бланк и отправлен клиенту через шлюз Яндекс 360.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Чек-лист: Закрытие договора и сдача проекта:</span>
                    </h4>
                    <ul className="text-xs space-y-1.5 text-slate-700">
                      <li className="flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5 rounded text-blue-600" readOnly checked />
                        <span>Подписан двусторонний Акт сдачи-приемки выполненных работ (ЭДО или оригинал).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5 rounded text-blue-600" readOnly checked />
                        <span>Подтверждено поступление 100% оплаты по контракту.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5 rounded text-blue-600" readOnly checked />
                        <span>Скан акта и свидетельства ФГИС «АРШИН» прикреплены к карточке договора.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5 rounded text-blue-600" readOnly checked />
                        <span>Сделка переведена в статус «Успешно реализовано», создана запись о гарантии.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 18. SECTION: FAQ / Часто задаваемые вопросы */}
        {(activeCategory === 'all' || activeCategory === 'checklists') && isMatch('faq вопросы пароль ошибка яндекс отказ права поверка восстановить') && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection('faq')}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-slate-100 hover:bg-slate-100 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-800 text-white rounded-lg shadow-xs">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    Частые вопросы и Нестандартные ситуации (FAQ)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ошибки отправки почты, возобновление сделок из архива, смена куратора и проверка поверок
                  </p>
                </div>
              </div>
              {expandedSections['faq'] ? (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>

            {expandedSections['faq'] && (
              <div className="p-6 border-t border-slate-100 space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    Вопрос: Письмо не отправляется, возникает ошибка SMTP authentication failed.
                  </span>
                  <p className="text-slate-500">
                    <strong>Ответ:</strong> Вы ввели обычный пароль от почты вместо пароля приложения. Перейдите в Яндекс ID → Безопасность → Пароли приложений → сгенерируйте пароль типа «Почта» и вставьте его в настройки CRM.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    Вопрос: Клиент вернулся через полгода после заморозки бюджета. Как восстановить сделку?
                  </span>
                  <p className="text-slate-500">
                    <strong>Ответ:</strong> Откройте колонку «Отказ / Архив», найдите сделку и нажмите «Вернуть в работу». Укажите причину реактивации, прикрепите обновленные требования и переместите карточку на активный этап.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    Вопрос: Как передать контракт другому ведущему инженеру при отпуске куратора?
                  </span>
                  <p className="text-slate-500">
                    <strong>Ответ:</strong> В карточке договора выберите нового сотрудника из выпадающего списка кураторов. Изменение автоматически отразится в Личном кабинете клиента с обновленным контактным телефоном.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    Вопрос: Система предупреждает, что у прибора истекает срок поверки во ФГИС «АРШИН».
                  </span>
                  <p className="text-slate-500">
                    <strong>Ответ:</strong> За 30 дней до окончания поверки прибор требует плановой отправки в ЦСМ. Для срочных выездов используйте дублирующий проверенный прибор из реестра «Применяемое оборудование».
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('faq')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Перейти в расширенную Базу знаний & FAQ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
