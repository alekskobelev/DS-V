import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Database, 
  History, 
  TrendingUp, 
  Search, 
  RefreshCw, 
  Download,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Layout,
  Laptop,
  HardDrive,
  Wrench,
  Boxes,
  Activity,
  Server,
  Settings,
  Bell,
  Code
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DocItem {
  id: string;
  title: string;
  fileName: string;
  icon: React.ElementType;
  badge?: string;
  description: string;
}

const DOCS_LIST: DocItem[] = [
  {
    id: 'user_manual',
    title: 'Инструкция по эксплуатации',
    fileName: 'USER_MANUAL.md',
    icon: BookOpen,
    badge: 'v2.9.59 (54 раздела)',
    description: 'Исчерпывающее руководство по модулям CMS, CRM, калькулятору, каталогу, SQL-таблице text_constants, DaData/ТКП, АРШИН и боту МАКС',
  },
  {
    id: 'site_passport',
    title: 'Паспорт сайта',
    fileName: 'SITE_PASSPORT.md',
    icon: ShieldCheck,
    badge: 'v2.9.59-PROD',
    description: 'Технические спецификации, стек технологий, архитектура СУБД PostgreSQL 17, безопасность и соответствие 152-ФЗ / ГОСТ',
  },
  {
    id: 'database_deployment',
    title: 'Развертывание БД',
    fileName: 'DATABASE_DEPLOYMENT.md',
    icon: Database,
    badge: 'PostgreSQL 17 & Drizzle',
    description: 'Инструкции по СУБД, миграциям Drizzle ORM, REST API /api/text-constants, отказоустойчивости и резервным копиям',
  },
  {
    id: 'changelog',
    title: 'История изменений',
    fileName: 'CHANGELOG.md',
    icon: History,
    badge: 'v1.5.22',
    description: 'Хронологический журнал всех обновлений, версий и доработок портала',
  },
  {
    id: 'business_analytics',
    title: 'Бизнес-аналитика',
    fileName: 'BUSINESS_ANALYTICS.md',
    icon: TrendingUp,
    badge: 'KPI & Воронки',
    description: 'Конверсионные воронки, целевая аудитория, ценообразование, нормативно-правовая база и регламенты',
  },
  {
    id: 'readme',
    title: 'Реестр документации',
    fileName: 'README.md',
    icon: FileText,
    badge: 'Быстрый старт',
    description: 'Архитектурный обзор, оглавление и правила ведения проектных файлов',
  },
  {
    id: 'project_migration',
    title: 'Промпт для переезда (Migration)',
    fileName: 'PROJECT_MIGRATION_PROMPT.md',
    icon: Sparkles,
    badge: 'Промпт для нового чата',
    description: 'Готовый мастер-промпт и архитектурный бриф для переноса проекта в новый чат-бот без потери контекста',
  },
  {
    id: 'ai_migration_guide',
    title: 'Глубокий системный гайд (AI Guide)',
    fileName: 'AI_MIGRATION_GUIDE.md',
    icon: Sparkles,
    badge: 'Для настройки AI',
    description: 'Комплексный системный промпт с описанием структуры базы данных, API, системы оповещений МАКС/Telegram и гибридного хранилища',
  },
];

const QUICK_CHAPTERS = [
  { label: 'Все разделы', query: '' },
  { label: '№54 Панель управления CMS', query: '54. Оптимизированная панель управления CMS' },
  { label: '№53 Поверки ФГИС «АРШИН»', query: '53. Мониторинг поверок ФГИС' },
  { label: '№52 DaData и ТКП 44-ФЗ', query: '52. Интеграция с DaData' },
  { label: '№51 Сервисные заявки', query: '51. Модуль службы технической поддержки' },
  { label: '№50 Ключи HASP / Sentinel', query: '50. Электронные лицензии' },
  { label: '№49 Договоры и спецификации', query: '49. Модуль договоров' },
  { label: '№48 Пакет переноса', query: '48. Пакет переноса проекта' },
  { label: '№47 Дашборд CRM (30 лет)', query: '47. Инженерный дашборд CRM' },
  { label: '№46 Бот МАКС', query: '46. Интеграция официального бота в Российском мессенджере МАКС' },
  { label: '№44 Таблица text_constants', query: '44. Реляционная таблица text_constants' },
  { label: '№41 3D WebGL и GD&T', query: '41. Интерактивный 3D WebGL' },
  { label: '№26 CRM и сделки', query: '26. CRM-система' },
  { label: '№1 Конструктор страниц', query: '1. Визуальный редактор' },
];

// Interactive CMS Quick Guide items with quick jump
const CMS_MODULES_GUIDE = [
  {
    id: 'pages',
    title: 'Конструктор страниц (Pages Builder)',
    category: 'Контент',
    icon: Layout,
    desc: 'Редактирование 12 основных системных разделов и создание неограниченного числа кастомных страниц с блоками Hero, Features, Text, CTA и предпросмотром.',
  },
  {
    id: 'site_texts',
    title: 'Текстовые константы БД (text_constants)',
    category: 'Контент / База данных',
    icon: Database,
    desc: 'Редактирование слоганов, преимуществ, телефонных номеров и заголовков сайта, хранящихся напрямую в реляционной таблице PostgreSQL text_constants.',
  },
  {
    id: 'models3d',
    title: '3D-Модели и карты отклонений GD&T',
    category: 'Контент / WebGL',
    icon: Boxes,
    desc: 'Загрузка и привязка моделей в формате GLB/GLTF/OBJ с интерактивными метрологическими точками контроля, аннотациями и цветовыми полями погрешностей.',
  },
  {
    id: 'news',
    title: 'Новости, статьи и База знаний ГОСТ',
    category: 'Контент / База знаний',
    icon: BookOpen,
    desc: 'Публикация пресс-релизов компании, обзоров обновлений САПР TopSolid/PolyWorks и регламентов базы знаний (ГОСТ Р ИСО 10360, ГОСТ Р 53464).',
  },
  {
    id: 'contacts',
    title: 'Контакты, филиалы и реквизиты',
    category: 'Контент / Организация',
    icon: FileText,
    desc: 'Юридические данные компании (ИНН, ОГРН, КПП, банковские счета), адреса офисов в Самаре и Тольятти, режим работы и телефоны технической поддержки.',
  },
  {
    id: 'software',
    title: 'Каталог ПО CAD/CAM/PDM/CAE',
    category: 'Каталог',
    icon: Laptop,
    desc: 'Управление линейкой программного обеспечения: TopSolid 7, PolyWorks, Geomagic Design X/Control X, модули, цены, скриншоты и системные требования.',
  },
  {
    id: 'catalog',
    title: 'Каталог КИМ и оптических сканеров',
    category: 'Каталог',
    icon: HardDrive,
    desc: 'Управление измерительными машинами, портативными манипуляторами, лазерными сканерами, техническими характеристиками и паспортами точности.',
  },
  {
    id: 'services',
    title: 'Услуги и параметры калькулятора',
    category: 'Каталог / Услуги',
    icon: Wrench,
    desc: 'Настройка метрологических услуг: 3D-контроль геометрии, реверс-инжиниринг, разработка постпроцессоров ЧПУ, базовые ставки и коэффициенты сложности.',
  },
  {
    id: 'seo',
    title: 'SEO, OpenGraph и смарт-баннеры',
    category: 'SEO & Аналитика',
    icon: Search,
    desc: 'Управление поисковой оптимизацией, микроразметкой Schema.org, мета-тегами для соцсетей (VK, Telegram) и промо-баннерами в верхней части сайта.',
  },
  {
    id: 'analytics',
    title: 'Посещаемость страниц (usePageVisits)',
    category: 'SEO & Аналитика',
    icon: Activity,
    desc: 'Аналитика популярности страниц, просмотров разделов каталога и услуг, экспорт статистики в формате JSON.',
  },
  {
    id: 'infrastructure',
    title: 'Инфраструктура, VPS и MinIO S3',
    category: 'Инфраструктура / Сервер',
    icon: Server,
    desc: 'Настройка подключения к облачному VPS, локальному NAS ASUSTOR/TrueNAS и бакету S3 cad-models-3d для тяжелых полигональных сеток.',
  },
  {
    id: 'qa_backend',
    title: 'Контроль качества DoD и API контракты',
    category: 'Инфраструктура / QA',
    icon: ShieldCheck,
    desc: 'Автоматический запуск тестов критериев приемки (DoD), валидация REST API endpoints и стресс-тестирование граничных условий калькулятора.',
  },
  {
    id: 'notifications',
    title: 'Оповещения, Telegram и бот МАКС',
    category: 'Инфраструктура / CRM',
    icon: Bell,
    desc: 'Настройка каналов уведомлений менеджеров при поступлении новых заявок через формы сайта, расчеты калькулятора и генератор ТКП.',
  },
  {
    id: 'backup',
    title: 'Резервные копии и экспорт JSON',
    category: 'Инфраструктура / DRP',
    icon: Download,
    desc: 'Полный снимок базы данных сайта в один файл JSON, загрузка резервной копии и пошаговые инструкции запуска проекта на автономном компьютере.',
  },
];

interface CmsManualTabProps {
  onNavigateTab?: (tabId: string) => void;
}

export const CmsManualTab: React.FC<CmsManualTabProps> = ({ onNavigateTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'guide' | 'docs'>('guide');
  const [selectedDocId, setSelectedDocId] = useState<string>('user_manual');
  const [docContent, setDocContent] = useState<string>('Загрузка документации...');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [guideSearch, setGuideSearch] = useState<string>('');

  const currentDoc = DOCS_LIST.find((d) => d.id === selectedDocId) || DOCS_LIST[0];

  const fetchDoc = (fileName: string) => {
    setLoading(true);
    fetch(`/api/docs/${fileName}`)
      .then((res) => {
        if (!res.ok) throw new Error('File not found');
        return res.text();
      })
      .then((text) => {
        setDocContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching doc:', err);
        setDocContent(
          `# Ошибка загрузки документа\n\nНе удалось загрузить файл \`${fileName}\`. Убедитесь, что сервер Express запущен и директория \`/docs\` доступна.`
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    if (activeSubTab === 'docs') {
      fetchDoc(currentDoc.fileName);
    }
  }, [selectedDocId, activeSubTab]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(docContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filteredGuideModules = CMS_MODULES_GUIDE.filter(
    (m) =>
      !guideSearch.trim() ||
      m.title.toLowerCase().includes(guideSearch.toLowerCase()) ||
      m.desc.toLowerCase().includes(guideSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(guideSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Sub-tab Switcher */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Инженерная база знаний и документация портала</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Справочник оператора CMS и официальная документация
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Руководство по администрированию сайта, архитектуре базы данных PostgreSQL 17, интеграциям с DaData, АРШИН, ботом МАКС и регламентам ГОСТ.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`px-4.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'guide'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-500 hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Путеводитель по CMS (16 разделов)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('docs')}
            className={`px-4.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'docs'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-500 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Официальные Markdown-документы</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: INTERACTIVE CMS GUIDE */}
      {activeSubTab === 'guide' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Модули системы ({filteredGuideModules.length})
              </span>
              <span className="text-xs text-gray-400">• Нажмите «Перейти в раздел» для мгновенного перехода</span>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={guideSearch}
                onChange={(e) => setGuideSearch(e.target.value)}
                placeholder="Поиск по инструкции или модулю..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredGuideModules.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-slate-500">
                        {item.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-400">ID: {item.id}</span>
                    <button
                      onClick={() => onNavigateTab && onNavigateTab(item.id)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Перейти в раздел</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MARKDOWN DOCUMENTS VIEWER */}
      {activeSubTab === 'docs' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Documents Selector (4 cols) */}
          <div className="xl:col-span-4 space-y-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Реестр документов
                </span>
                <span className="text-[10px] text-gray-400 font-mono">/docs/</span>
              </div>

              <div className="space-y-1.5">
                {DOCS_LIST.map((doc) => {
                  const Icon = doc.icon;
                  const isSelected = selectedDocId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600/20'
                          : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50 bg-white'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-950' : 'text-gray-900'}`}>
                            {doc.title}
                          </span>
                          {doc.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-800 rounded shrink-0">
                              {doc.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{doc.fileName}</p>
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-snug">{doc.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick chapters navigation (for User Manual) */}
            {selectedDocId === 'user_manual' && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs space-y-2.5">
                <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block">
                  Быстрый переход по главам
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CHAPTERS.map((ch, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchQuery(ch.query)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                        searchQuery === ch.query
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 hover:bg-gray-200 text-slate-500'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Document Viewer (8 cols) */}
          <div className="xl:col-span-8 space-y-4">
            {/* Viewer Toolbar */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">{currentDoc.title}</h3>
                  <span className="text-[10px] text-gray-400 font-mono">{currentDoc.fileName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Search in document */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск в документе..."
                    className="pl-7 pr-2.5 py-1 text-xs rounded-lg border border-gray-200 w-44 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={() => fetchDoc(currentDoc.fileName)}
                  title="Обновить"
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleCopyText}
                  title="Скопировать Markdown"
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Скопировано' : 'Копировать'}</span>
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([docContent], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = currentDoc.fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  title="Скачать файл"
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs min-h-[600px] max-h-[850px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-xs font-semibold">Загрузка документа...</p>
                </div>
              ) : (
                <div className="markdown-body prose prose-xs max-w-none text-gray-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {docContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
