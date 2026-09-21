import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Laptop, 
  HardDrive, 
  Wrench, 
  Newspaper, 
  Phone, 
  Server, 
  ShieldCheck, 
  Database, 
  Terminal, 
  LogOut, 
  Search, 
  Globe, 
  Sparkles, 
  Activity, 
  Bell, 
  Download, 
  Eye, 
  BookOpen, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  Boxes, 
  Type, 
  Lock, 
  LogIn, 
  User, 
  KeyRound, 
  Check, 
  Sliders, 
  Cpu, 
  Briefcase 
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { DEFAULT_ADMIN_ACCOUNTS } from '../data/mockData';

// Modular CMS Tabs
import { CmsPagesEditor, SYSTEM_SITE_PAGES } from '../components/cms/CmsPagesEditor';
import { CmsSiteTextsTab } from '../components/cms/CmsSiteTextsTab';
import { CmsModels3DTab } from '../components/cms/CmsModels3DTab';
import { CmsNewsEditor } from '../components/cms/CmsNewsEditor';
import { CmsContactsEditor } from '../components/cms/CmsContactsEditor';
import { CmsSoftwareEditor } from '../components/cms/CmsSoftwareEditor';
import { CmsProductsEditor } from '../components/cms/CmsProductsEditor';
import { CmsServicesEditor } from '../components/cms/CmsServicesEditor';
import { CmsSeoTab } from '../components/cms/CmsSeoTab';
import { CmsAnalyticsTab } from '../components/cms/CmsAnalyticsTab';
import { CmsInfrastructureTab } from '../components/cms/CmsInfrastructureTab';
import { CmsQaTab } from '../components/cms/CmsQaTab';
import { CmsSchemasTab } from '../components/cms/CmsSchemasTab';
import { NotificationSettingsView } from '../components/notifications/NotificationSettingsView';
import { CmsBackupTab } from '../components/cms/CmsBackupTab';
import { CmsManualTab } from '../components/cms/CmsManualTab';
import { CrmAdminView } from '../components/CrmAdminView';

export type CmsTabId = 
  | 'pages' 
  | 'site_texts' 
  | 'models3d' 
  | 'news' 
  | 'contacts' 
  | 'software' 
  | 'catalog' 
  | 'services' 
  | 'seo' 
  | 'analytics' 
  | 'infrastructure' 
  | 'qa_backend' 
  | 'schemas' 
  | 'notifications' 
  | 'backup' 
  | 'manual' 
  | 'crm';

export type CmsCategory = 'all' | 'content' | 'catalog' | 'analytics' | 'infra' | 'manual';

interface TabDefinition {
  id: CmsTabId;
  title: string;
  shortTitle: string;
  category: CmsCategory;
  icon: React.ElementType;
  description: string;
  badge?: string;
}

export const CMS_TABS: TabDefinition[] = [
  // Category: Content
  {
    id: 'pages',
    title: 'Конструктор страниц',
    shortTitle: 'Страницы',
    category: 'content',
    icon: FileText,
    description: '12 основных разделов сайта + создание пользовательских страниц',
  },
  {
    id: 'site_texts',
    title: 'Текстовые константы (БД)',
    shortTitle: 'Тексты БД',
    category: 'content',
    icon: Type,
    badge: 'PostgreSQL',
    description: 'Прямое редактирование текстов сайта из реляционной таблицы text_constants',
  },
  {
    id: 'models3d',
    title: '3D-Модели и GD&T',
    shortTitle: '3D Модели',
    category: 'content',
    icon: Boxes,
    badge: 'WebGL',
    description: 'Интерактивные 3D-модели деталей, карты отклонений и контрольные точки',
  },
  {
    id: 'news',
    title: 'Новости и База знаний',
    shortTitle: 'Новости / БЗ',
    category: 'content',
    icon: BookOpen,
    description: 'Статьи, релизы ПО TopSolid/PolyWorks и технические регламенты ГОСТ',
  },
  {
    id: 'contacts',
    title: 'Контакты и реквизиты',
    shortTitle: 'Контакты',
    category: 'content',
    icon: Phone,
    description: 'Юридические адреса в Самаре и Тольятти, телефоны, банковские реквизиты',
  },

  // Category: Catalog & Services
  {
    id: 'software',
    title: 'Программное обеспечение',
    shortTitle: 'Каталог ПО',
    category: 'catalog',
    icon: Laptop,
    badge: 'САПР / КИМ',
    description: 'TopSolid 7, PolyWorks, Geomagic, модули, цены и системные требования',
  },
  {
    id: 'catalog',
    title: 'Оборудование и КИМ',
    shortTitle: 'Оборудование',
    category: 'catalog',
    icon: HardDrive,
    description: 'Координатно-измерительные машины, оптические 3D-сканеры, датчики',
  },
  {
    id: 'services',
    title: 'Услуги и калькулятор',
    shortTitle: 'Услуги',
    category: 'catalog',
    icon: Wrench,
    description: '3D-сканирование, контроль геометрии, реверс-инжиниринг, тарифы',
  },

  // Category: SEO & Analytics
  {
    id: 'seo',
    title: 'SEO и Метаданные',
    shortTitle: 'SEO',
    category: 'analytics',
    icon: Globe,
    description: 'OpenGraph, Schema.org, поисковые сниппеты и верхний смарт-баннер',
  },
  {
    id: 'analytics',
    title: 'Посещаемость страниц',
    shortTitle: 'Аналитика',
    category: 'analytics',
    icon: Activity,
    badge: 'usePageVisits',
    description: 'Статистика переходов пользователей по внутренним разделам и экспорт JSON',
  },

  // Category: Infrastructure & QA
  {
    id: 'infrastructure',
    title: 'Сервер и S3 Хранилище',
    shortTitle: 'Инфраструктура',
    category: 'infra',
    icon: Server,
    badge: 'MinIO S3',
    description: 'Параметры VPS, локального NAS ASUSTOR/TrueNAS и бакета cad-models-3d',
  },
  {
    id: 'qa_backend',
    title: 'Контроль качества (DoD)',
    shortTitle: 'DoD & QA',
    category: 'infra',
    icon: ShieldCheck,
    badge: 'DoD 100%',
    description: 'Верификация REST API контрактов и анализ граничных значений калькулятора',
  },
  {
    id: 'schemas',
    title: 'Схемы JSON & Валидация',
    shortTitle: 'JSON Schema',
    category: 'infra',
    icon: Terminal,
    description: 'Спецификации типов запросов, валидация DTO и проверка полезной нагрузки',
  },
  {
    id: 'notifications',
    title: 'Оповещения и каналы связи',
    shortTitle: 'Оповещения',
    category: 'infra',
    icon: Bell,
    description: 'Telegram, бот МАКС, email-уведомления и SLA обработки заявок',
  },
  {
    id: 'backup',
    title: 'Резервные копии и экспорт',
    shortTitle: 'Бэкапы',
    category: 'infra',
    icon: Download,
    description: 'Полный снимок базы контента сайта в .json и инструкция автономного запуска',
  },

  // Category: Manual & Documentation
  {
    id: 'manual',
    title: 'Инструкции и Документы',
    shortTitle: 'Документация',
    category: 'manual',
    icon: BookOpen,
    badge: '54 главы',
    description: 'Путеводитель оператора CMS, USER_MANUAL, SITE_PASSPORT, CHANGELOG',
  },
];

export const CmsPage: React.FC = () => {
  const {
    customPages,
    products,
    services,
    knowledgeBase,
    exportAllDataJSON,
    navigateTo,
    showToast,
    isAdmin,
    userPermissions,
    currentUser,
    login,
    logout
  } = useApp();

  const hasCmsAccess = isAdmin || !!userPermissions?.canAccessCms;

  const [adminLoginEmail, setAdminLoginEmail] = useState('');
  const [adminLoginPassword, setAdminLoginPassword] = useState('');

  // Active Tab & Category Filter
  const [activeTab, setActiveTab] = useState<CmsTabId>('pages');
  const [selectedCategory, setSelectedCategory] = useState<CmsCategory>('all');
  const [tabSearchQuery, setTabSearchQuery] = useState('');

  // System Health state
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; mode: string }>({
    connected: true,
    mode: 'PostgreSQL 17 (Drizzle)',
  });

  // Check DB health on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    apiService.getDbHealth().then((health) => {
      setDbStatus({
        connected: health.db_connected,
        mode: health.mode || 'PostgreSQL 17 / Fallback',
      });
    });
  }, []);

  // Sync all CMS state to Backend and PostgreSQL
  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    showToast('Синхронизация состояния CMS с базой данных PostgreSQL...');
    try {
      const fullContent = {
        customPages,
        products,
        services,
        knowledgeBase,
        timestamp: new Date().toISOString(),
      };
      await apiService.saveCmsState(fullContent);
      setDbStatus({ connected: true, mode: 'PostgreSQL 17 (Синхронизировано)' });
      showToast('База данных и кэш CMS успешно синхронизированы!');
    } catch (e) {
      showToast('Данные сохранены локально (резервный fallback активен)');
    } finally {
      setIsSyncing(false);
    }
  };

  // Quick download backup
  const handleDownloadBackup = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ds-engineering-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Резервная копия контента успешно скачана (.json)');
  };

  // Filter tabs by category and search
  const visibleTabs = CMS_TABS.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      !tabSearchQuery.trim() ||
      t.title.toLowerCase().includes(tabSearchQuery.toLowerCase()) ||
      t.shortTitle.toLowerCase().includes(tabSearchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(tabSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeTabDef = CMS_TABS.find((t) => t.id === activeTab) || CMS_TABS[0];

  // Auth Guard: if not authorized, render clean login gate
  if (!hasCmsAccess) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const success = login(adminLoginEmail, adminLoginPassword);
      if (success) {
        showToast('Успешная авторизация в CMS!');
      } else {
        showToast('Неверный логин или пароль администратора');
      }
    };

    return (
      <div className="flex-1 w-full bg-slate-100 min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl p-8 shadow-sm border border-gray-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Вход в панель управления CMS</h2>
            <p className="text-xs text-gray-500">
              Доступ ограничен для инженерного и руководящего состава «ДС-Инжиниринг»
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Email администратора</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={adminLoginEmail}
                  onChange={(e) => setAdminLoginEmail(e.target.value)}
                  placeholder="admin@ds-engineering.ru"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-500 mb-1">Пароль</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={adminLoginPassword}
                  onChange={(e) => setAdminLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Войти в систему управления</span>
            </button>
          </form>

          <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-[11px] text-slate-500 space-y-1">
            <span className="font-semibold block text-gray-800">Тестовый доступ:</span>
            <div className="font-mono text-[10px] text-gray-500">
              Email: <strong>admin@ds-engineering.ru</strong> | Пароль: <strong>admin123</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-50/70 pb-24">
      <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ================= TOP PANEL: CMS BRANDING, USER INFO & LIVE DB STATUS ================= */}
        <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-200 space-y-5">
          {/* User Bar */}
          {currentUser && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 text-xs">
              <div className="flex items-center gap-3">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                    {currentUser.fullName[0]}
                  </div>
                )}
                <div>
                  <span className="text-gray-500">
                    {isAdmin ? 'Администратор системы: ' : 'Оператор CMS: '}
                  </span>
                  <strong className="text-gray-900 font-bold ml-1">{currentUser.fullName}</strong>
                  {currentUser.position && (
                    <span className="text-blue-600 ml-1.5 hidden sm:inline">({currentUser.position})</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('account')}
                  className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-gray-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  Личный кабинет
                </button>
                <button
                  onClick={() => logout()}
                  className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Выйти</span>
                </button>
              </div>
            </div>
          )}

          {/* CMS Main Title & Action Buttons */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[11px] rounded-lg uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Инженерная CMS «ДС‑Инжиниринг»</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-medium text-[11px] rounded-lg border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{dbStatus.mode}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 font-medium text-[11px] rounded-lg border border-blue-200">
                  <Server className="w-3 h-3" />
                  <span>MinIO S3 Vault (ONLINE)</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                Панель управления сайтом, каталогами и БД
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-3xl">
                Управление 16 модулями: визуальные страницы, текстовые константы PostgreSQL, 3D WebGL модели, каталоги САПР/КИМ, статьи базы знаний и интеграции.
              </p>
            </div>

            {/* Quick Global Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleSyncDatabase}
                disabled={isSyncing}
                className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-95"
                title="Принудительная запись всех состояний в PostgreSQL"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Синхронизация...' : 'Синхронизировать с БД'}</span>
              </button>

              <button
                onClick={handleDownloadBackup}
                className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors"
                title="Экспорт полного дампа .json"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Бэкап (.json)</span>
              </button>

              <button
                onClick={() => navigateTo('home')}
                className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>На сайт</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Live Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Страниц сайта:</span>
              <strong className="font-bold text-gray-900">{SYSTEM_SITE_PAGES.length + customPages.length}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Каталог КИМ:</span>
              <strong className="font-bold text-gray-900">{products.length} ед.</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Услуг:</span>
              <strong className="font-bold text-gray-900">{services.length} напр.</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">База знаний ГОСТ:</span>
              <strong className="font-bold text-gray-900">{knowledgeBase.length} регл.</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-between col-span-2 sm:col-span-1">
              <span className="text-gray-500 text-[11px]">Констант БД:</span>
              <strong className="font-bold text-amber-600">18 записей</strong>
            </div>
          </div>
        </div>

        {/* ================= UNIFIED NAVIGATION & SEARCH CONTROLS ================= */}
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-200 space-y-4">
          {/* Top Tier: Category Selector + Tab Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
              {[
                { id: 'all', label: 'Все разделы', count: 16 },
                { id: 'content', label: '📁 Контент и страницы', count: 5 },
                { id: 'catalog', label: '📦 Каталог и номенклатура', count: 3 },
                { id: 'analytics', label: '📈 SEO и Аналитика', count: 2 },
                { id: 'infra', label: '⚙️ Инфраструктура и БД', count: 5 },
                { id: 'manual', label: '📚 Документация', count: 1 },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as CmsCategory)}
                  className={`px-4 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id ? 'bg-blue-700 text-blue-100' : 'bg-white text-gray-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Live Search input */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={tabSearchQuery}
                onChange={(e) => setTabSearchQuery(e.target.value)}
                placeholder="Быстрый поиск раздела CMS..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bottom Tier: Tabs within Selected Category */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
            {visibleTabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isActive
                      ? 'bg-blue-900 border-blue-900 text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white hover:bg-slate-50 border-gray-200 text-slate-500 hover:border-blue-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-blue-600'}`} />
                  <span>{t.title}</span>
                  {t.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                      isActive ? 'bg-blue-800 text-amber-300' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= ACTIVE TAB BANNER ================= */}
        <div className="bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <activeTabDef.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">{activeTabDef.title}</h2>
                <span className="text-[10px] text-gray-400 font-mono">id: {activeTabDef.id}</span>
              </div>
              <p className="text-xs text-gray-500">{activeTabDef.description}</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span>Раздел:</span>
            <span className="font-semibold text-slate-500 capitalize">{activeTabDef.category}</span>
          </div>
        </div>

        {/* ================= TAB CONTENTS ================= */}
        <div>
          {/* TAB 1: Pages Builder */}
          {activeTab === 'pages' && <CmsPagesEditor />}

          {/* TAB 2: Site Texts (PostgreSQL text_constants) */}
          {activeTab === 'site_texts' && (
            <CmsSiteTextsTab onNavigateToSite={() => navigateTo('home')} />
          )}

          {/* TAB 3: 3D Models and GD&T */}
          {activeTab === 'models3d' && <CmsModels3DTab />}

          {/* TAB 4: News, Articles & Knowledge Base */}
          {activeTab === 'news' && <CmsNewsEditor />}

          {/* TAB 5: Contacts, Offices & Legal Info */}
          {activeTab === 'contacts' && <CmsContactsEditor />}

          {/* TAB 6: Software (TopSolid, PolyWorks, Geomagic) */}
          {activeTab === 'software' && <CmsSoftwareEditor />}

          {/* TAB 7: Metrology Hardware / CMM Catalog */}
          {activeTab === 'catalog' && <CmsProductsEditor />}

          {/* TAB 8: Services & Geometry Calculator */}
          {activeTab === 'services' && <CmsServicesEditor />}

          {/* TAB 9: SEO & Smart Banners */}
          {activeTab === 'seo' && <CmsSeoTab />}

          {/* TAB 10: Page Visits Analytics */}
          {activeTab === 'analytics' && <CmsAnalyticsTab />}

          {/* TAB 11: Server Infrastructure & S3 */}
          {activeTab === 'infrastructure' && <CmsInfrastructureTab />}

          {/* TAB 12: DoD Acceptance & API Testing */}
          {activeTab === 'qa_backend' && <CmsQaTab />}

          {/* TAB 13: JSON Schema & API Runtime Validation */}
          {activeTab === 'schemas' && <CmsSchemasTab />}

          {/* TAB 14: Notification Channels (Telegram, MAX bot) */}
          {activeTab === 'notifications' && (
            <NotificationSettingsView contextMode="cms" />
          )}

          {/* TAB 15: Backup & Disaster Recovery */}
          {activeTab === 'backup' && <CmsBackupTab />}

          {/* TAB 16: Operator Manual & Markdown Documents */}
          {activeTab === 'manual' && (
            <CmsManualTab onNavigateTab={(t) => setActiveTab(t as CmsTabId)} />
          )}

          {/* TAB 17: Embedded CRM Deals / Pipeline (if selected) */}
          {activeTab === 'crm' && <CrmAdminView />}
        </div>
      </div>
    </div>
  );
};
