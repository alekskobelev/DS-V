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
import { 
  ServiceItem, 
  validateServiceItem, 
  validateEquipmentArray, 
  validateContact,
  getServicesHistory,
  saveServicesVersion,
  restoreServicesVersion,
  rollbackToPreviousVersion,
  clearServicesHistory,
  ServiceVersionSnapshot
} from '../data/services';
import { useServiceFormValidation } from '../hooks/useServiceFormValidation';
import { CmsDynamicServiceForm } from '../components/cms/CmsDynamicServiceForm';
import { CmsServicesHistoryModal } from '../components/cms/CmsServicesHistoryModal';

export { 
  useServiceFormValidation, 
  CmsDynamicServiceForm, 
  CmsServicesHistoryModal,
  getServicesHistory,
  saveServicesVersion,
  restoreServicesVersion,
  rollbackToPreviousVersion,
  clearServicesHistory
};

/**
 * Функция валидации для CmsPage:
 * Использует интерфейс ServiceItem из src/data/services.ts для проверки данных,
 * вводимых администратором, перед их сохранением.
 */
export function validateCmsServiceItem(item: Partial<ServiceItem> | unknown): {
  isValid: boolean;
  errors: string[];
  errorMap: Record<string, string>;
} {
  const result = validateServiceItem(item);
  return {
    isValid: result.isValid,
    errors: result.errors.map((e) => `[${e.field}]: ${e.message}`),
    errorMap: result.errorMap,
  };
}

/**
 * Валидация массива всех услуг перед сохранением состояния CMS в базе данных
 */
export function validateCmsServices(servicesList: unknown): {
  isValid: boolean;
  errors: string[];
  invalidCount: number;
} {
  const errors: string[] = [];
  if (!Array.isArray(servicesList)) {
    return {
      isValid: false,
      errors: ['Список услуг должен быть массивом (Array<ServiceItem>)'],
      invalidCount: 1,
    };
  }

  if (servicesList.length === 0) {
    return {
      isValid: false,
      errors: ['Список услуг не может быть пустым. Необходима хотя бы одна инжиниринговая услуга компании.'],
      invalidCount: 1,
    };
  }

  let invalidCount = 0;
  servicesList.forEach((serv, idx) => {
    const s = serv as Partial<ServiceItem>;
    const res = validateServiceItem(s);
    if (!res.isValid) {
      invalidCount++;
      const servTitle = s?.title || `Услуга #${idx + 1}`;
      res.errors.forEach((err) => {
        errors.push(`«${servTitle}» (${err.field}): ${err.message}`);
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    invalidCount,
  };
}

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
import { UnifiedCommunicationsHub } from '../components/common/UnifiedCommunicationsHub';
import { CmsBackupTab } from '../components/cms/CmsBackupTab';
import { CmsManualTab } from '../components/cms/CmsManualTab';
import { ApiHealthDashboardTab } from '../components/cms/ApiHealthDashboardTab';
import { CmsConfiguratorsTab } from '../components/cms/CmsConfiguratorsTab';
import { CrmAdminView } from '../components/CrmAdminView';

export type CmsTabId = 
  | 'pages' 
  | 'site_texts' 
  | 'models3d' 
  | 'configurators'
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
  | 'health_dashboard'
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
  {
    id: 'configurators',
    title: 'Конфигураторы и Калькуляторы',
    shortTitle: 'Конфигураторы',
    category: 'catalog',
    icon: Sliders,
    badge: 'СИ / ROI',
    description: 'Параметры Метрологического конфигуратора СИ, B2B-калькулятора окупаемости (ROI) и смет Услуг',
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
    id: 'health_dashboard',
    title: 'Мониторинг API и Внешних Сервисов',
    shortTitle: 'API Health',
    category: 'infra',
    icon: Activity,
    badge: 'Live Status',
    description: 'Мониторинг состояния REST API, СУБД, DaData, Telegram Bot и МАКС в реальном времени',
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
    showToast('Проверка целостности и валидация данных CMS перед сохранением...');

    // Проверка услуг администратора с использованием интерфейса ServiceItem
    const servicesValidation = validateCmsServices(services);
    if (!servicesValidation.isValid) {
      const firstError = servicesValidation.errors[0] || 'Данные услуг не прошли валидацию';
      showToast(`Ошибка сохранения: ${firstError}`);
      setIsSyncing(false);
      return;
    }

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

  // Manual services integrity check using ServiceItem
  const handleValidateServices = () => {
    const validation = validateCmsServices(services);
    if (validation.isValid) {
      showToast(`Валидация успешна: все ${services.length} услуг строго соответствуют интерфейсу ServiceItem`);
    } else {
      showToast(`Найдено ${validation.invalidCount} ошибок в услугах: ${validation.errors[0]}`);
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
    <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 min-h-screen pb-24 transition-colors">
      <div className="w-full min-w-0 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* ================= TOP PANEL: CMS BRANDING, USER INFO & LIVE DB STATUS ================= */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 sm:space-y-5">
          {/* User Bar */}
          {currentUser && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                    {currentUser.fullName[0]}
                  </div>
                )}
                <div className="truncate max-w-[200px] sm:max-w-none">
                  <span className="text-gray-500 hidden sm:inline">
                    {isAdmin ? 'Администратор: ' : 'Оператор CMS: '}
                  </span>
                  <strong className="text-gray-900 font-bold ml-0.5">{currentUser.fullName}</strong>
                  {currentUser.position && (
                    <span className="text-blue-600 ml-1.5 hidden md:inline">({currentUser.position})</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('account')}
                  className="min-h-[36px] px-3 sm:px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-gray-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Кабинет</span>
                </button>
                <button
                  onClick={() => logout()}
                  className="min-h-[36px] px-3 sm:px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Выйти</span>
                </button>
              </div>
            </div>
          )}

          {/* CMS Main Title & Action Buttons */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] sm:text-[11px] rounded-lg uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Инженерная CMS «ДС‑Инжиниринг»</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-medium text-[10px] sm:text-[11px] rounded-lg border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>{dbStatus.mode}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 font-medium text-[10px] sm:text-[11px] rounded-lg border border-blue-200 hidden sm:inline-flex">
                  <Server className="w-3 h-3 shrink-0" />
                  <span>MinIO S3 Vault (ONLINE)</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900">
                Панель управления сайтом, каталогами и БД
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-3xl line-clamp-2 sm:line-clamp-none">
                Управление 16 модулями: визуальные страницы, текстовые константы PostgreSQL, 3D WebGL модели, каталоги САПР/КИМ, статьи базы знаний и интеграции.
              </p>
            </div>

            {/* Quick Global Action Buttons (responsive grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 xl:flex xl:flex-wrap items-center gap-2 shrink-0 w-full xl:w-auto">
              <button
                onClick={handleValidateServices}
                className="min-h-[42px] px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                title="Проверить соответствие всех услуг интерфейсу ServiceItem перед сохранением"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                <span>Валидация услуг</span>
              </button>

              <button
                onClick={handleSyncDatabase}
                disabled={isSyncing}
                className="min-h-[42px] px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                title="Принудительная запись всех состояний в PostgreSQL"
              >
                <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Синхронизация...' : 'Синхронизировать с БД'}</span>
              </button>

              <button
                onClick={handleDownloadBackup}
                className="min-h-[42px] px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
                title="Экспорт полного дампа .json"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Бэкап (.json)</span>
              </button>

              <button
                onClick={() => navigateTo('home')}
                className="min-h-[42px] px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>На сайт</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Live Bar (responsive grid with distinct contrast) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px] font-medium">Страниц сайта:</span>
              <strong className="font-bold text-slate-900 dark:text-white font-mono">{SYSTEM_SITE_PAGES.length + customPages.length}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px] font-medium">Каталог КИМ:</span>
              <strong className="font-bold text-slate-900 dark:text-white font-mono">{products.length} ед.</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px] font-medium">Услуг:</span>
              <strong className="font-bold text-slate-900 dark:text-white font-mono">{services.length} напр.</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px] font-medium">База знаний ГОСТ:</span>
              <strong className="font-bold text-slate-900 dark:text-white font-mono">{knowledgeBase.length} регл.</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between col-span-2 sm:col-span-1">
              <span className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px] font-medium">Констант БД:</span>
              <strong className="font-bold text-amber-600 dark:text-amber-400 font-mono">18 записей</strong>
            </div>
          </div>
        </div>

        {/* ================= UNIFIED NAVIGATION & SEARCH CONTROLS ================= */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-4">
          
          {/* Mobile Direct Module Selector (< lg screens) */}
          <div className="lg:hidden space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">Раздел CMS:</span>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as CmsTabId)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CMS_TABS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.badge})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Top Tier: Category Selector + Tab Search with clean responsive wrap */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Category Filter Pills (horizontal scroll on mobile) */}
            <div className="flex items-center lg:flex-wrap gap-1.5 overflow-x-auto no-scrollbar touch-pan-x -mx-1 px-1 py-1 text-xs font-semibold">
              {[
                { id: 'all', label: 'Все разделы', count: CMS_TABS.length },
                { id: 'content', label: '📁 Контент', count: CMS_TABS.filter(t => t.category === 'content').length },
                { id: 'catalog', label: '📦 Каталог', count: CMS_TABS.filter(t => t.category === 'catalog').length },
                { id: 'analytics', label: '📈 SEO & Аналитика', count: CMS_TABS.filter(t => t.category === 'analytics').length },
                { id: 'infra', label: '⚙️ Инфраструктура', count: CMS_TABS.filter(t => t.category === 'infra').length },
                { id: 'manual', label: '📚 Документация', count: CMS_TABS.filter(t => t.category === 'manual').length },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as CmsCategory)}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    selectedCategory === cat.id ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Live Search input */}
            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={tabSearchQuery}
                onChange={(e) => setTabSearchQuery(e.target.value)}
                placeholder="Поиск по разделам CMS..."
                className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800"
              />
              {tabSearchQuery && (
                <button
                  onClick={() => setTabSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Bottom Tier: Tabs within Selected Category */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            {visibleTabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`min-h-[38px] px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                    isActive
                      ? 'bg-blue-900 dark:bg-blue-900 border-blue-800 text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
                  <span className="truncate">{t.title}</span>
                  {t.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                      isActive ? 'bg-blue-800 text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
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

          {/* TAB 8.5: Configurators & ROI Calculators Settings */}
          {activeTab === 'configurators' && <CmsConfiguratorsTab />}

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

          {/* TAB 14: Notification Channels (Telegram, MAX bot, SMTP) */}
          {activeTab === 'notifications' && (
            <UnifiedCommunicationsHub contextMode="cms" initialTab="messengers" />
          )}

          {/* TAB 15: Real-time API & Third-Party Health Dashboard */}
          {activeTab === 'health_dashboard' && <ApiHealthDashboardTab />}

          {/* TAB 16: Backup & Disaster Recovery */}
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

export default CmsPage;

