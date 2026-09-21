import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  FileCode, 
  Layers, 
  Cpu, 
  Wrench, 
  BookOpen, 
  Newspaper, 
  Building2, 
  Globe, 
  Sparkles,
  ArrowRight,
  Filter,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRODUCTS_DATA, SERVICES_DATA, KNOWLEDGE_BASE_ITEMS, NEWS_ARTICLES } from '../data/mockData';
import { PageId } from '../types';
import { getRoutePath, getCanonicalUrl } from '../utils/routes';

interface SitemapEntry {
  id: string;
  title: string;
  category: 'main' | 'software' | 'hardware' | 'services' | 'knowledge' | 'news' | 'cms';
  categoryLabel: string;
  path: string;
  canonicalUrl: string;
  pageId: PageId;
  detailId?: string;
  priority: string;
  changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  description?: string;
  badge?: string;
}

export const SitemapPage: React.FC = () => {
  const { navigateTo, customPages, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Generate complete sitemap entries
  const allEntries = useMemo<SitemapEntry[]>(() => {
    const list: SitemapEntry[] = [];

    // 1. Main Static Pages
    const mainPages: Array<{ id: PageId; title: string; priority: string; freq: SitemapEntry['changeFreq']; desc: string }> = [
      { id: 'home', title: 'Главная страница портала', priority: '1.0', freq: 'daily', desc: 'Центральная страница: 30 лет опыта в CAD/CAM и метрологии, ключевые компетенции и новинки.' },
      { id: 'software', title: 'Каталог программного обеспечения (CAD/CAM/PDM)', priority: '0.9', freq: 'weekly', desc: 'Комплексные САПР решения: TopSolid 7, PolyWorks, Shining 3D, Geomagic.' },
      { id: 'hardware', title: 'Каталог измерительного оборудования и КИМ', priority: '0.9', freq: 'weekly', desc: 'Портативные и стационарные КИМ, 3D-сканеры, лазерные трекеры и датчики Renishaw.' },
      { id: 'services', title: 'Инжиниринговые услуги и метрологический контроль', priority: '0.9', freq: 'weekly', desc: '3D-сканирование, реверс-инжиниринг в STEP, контроль геометрии по CAD, постпроцессоры.' },
      { id: 'about', title: 'О компании «ДС-Инжиниринг» (История с 1995 года)', priority: '0.8', freq: 'monthly', desc: 'Структура компании, филиалы в Самаре и Тольятти, официальные дилерские статусы.' },
      { id: 'knowledge', title: 'База знаний, ГОСТы и методики измерений', priority: '0.8', freq: 'weekly', desc: 'Стандарты GD&T, руководства по CAD/CAM, методики поверки КИМ по ISO 10360.' },
      { id: 'news', title: 'Пресс-центр, новости машиностроения и релизы ПО', priority: '0.8', freq: 'weekly', desc: 'События, отраслевые выставки, новые версии софта и метрологического оборудования.' },
      { id: 'contacts', title: 'Контакты, демонстрационные залы и реквизиты', priority: '0.8', freq: 'monthly', desc: 'Адреса центрального офиса в Самаре и метрологической лаборатории в Тольятти.' },
    ];

    mainPages.forEach((p) => {
      list.push({
        id: `main-${p.id}`,
        title: p.title,
        category: 'main',
        categoryLabel: 'Главные разделы',
        path: getRoutePath(p.id),
        canonicalUrl: getCanonicalUrl(p.id),
        pageId: p.id,
        priority: p.priority,
        changeFreq: p.freq,
        description: p.desc,
      });
    });

    // 2. Software Products
    const softwareProducts = PRODUCTS_DATA.filter((p) => p.type === 'software');
    softwareProducts.forEach((p) => {
      list.push({
        id: `soft-${p.id}`,
        title: `${p.name} — ${p.categoryLabel}`,
        category: 'software',
        categoryLabel: 'Программное обеспечение',
        path: getRoutePath('software', p.id),
        canonicalUrl: getCanonicalUrl('software', p.id),
        pageId: 'software',
        detailId: p.id,
        priority: '0.85',
        changeFreq: 'weekly',
        description: p.shortDescription || p.fullDescription?.slice(0, 140),
        badge: p.brand,
      });
    });

    // 3. Hardware Products
    const hardwareProducts = PRODUCTS_DATA.filter((p) => p.type === 'hardware');
    hardwareProducts.forEach((p) => {
      list.push({
        id: `hard-${p.id}`,
        title: `${p.name} (${p.brand})`,
        category: 'hardware',
        categoryLabel: 'Измерительное оборудование',
        path: getRoutePath('hardware', p.id),
        canonicalUrl: getCanonicalUrl('hardware', p.id),
        pageId: 'hardware',
        detailId: p.id,
        priority: '0.85',
        changeFreq: 'weekly',
        description: p.shortDescription || p.fullDescription?.slice(0, 140),
        badge: p.brand,
      });
    });

    // 4. Services
    SERVICES_DATA.forEach((s) => {
      list.push({
        id: `srv-${s.id}`,
        title: s.title,
        category: 'services',
        categoryLabel: 'Инжиниринговые услуги',
        path: getRoutePath('services', s.id),
        canonicalUrl: getCanonicalUrl('services', s.id),
        pageId: 'services',
        detailId: s.id,
        priority: '0.85',
        changeFreq: 'monthly',
        description: (s.shortDesc || s.fullDesc)?.slice(0, 140),
        badge: s.basePriceText,
      });
    });

    // 5. Knowledge Base
    KNOWLEDGE_BASE_ITEMS.forEach((k) => {
      list.push({
        id: `know-${k.id}`,
        title: k.title,
        category: 'knowledge',
        categoryLabel: 'База знаний и ГОСТ',
        path: `/knowledge#${k.id}`,
        canonicalUrl: `https://ds-engineering.ru/knowledge#${k.id}`,
        pageId: 'knowledge',
        detailId: k.id,
        priority: '0.7',
        changeFreq: 'monthly',
        description: (k.summary || k.content)?.slice(0, 140),
        badge: k.category,
      });
    });

    // 6. News
    NEWS_ARTICLES.forEach((n) => {
      list.push({
        id: `news-${n.id}`,
        title: n.title,
        category: 'news',
        categoryLabel: 'Новости и события',
        path: getRoutePath('news', n.id),
        canonicalUrl: getCanonicalUrl('news', n.id),
        pageId: 'news',
        detailId: n.id,
        priority: '0.75',
        changeFreq: 'monthly',
        description: (n.preview || (Array.isArray(n.content) ? n.content[0] : n.content))?.slice(0, 140),
        badge: n.date,
      });
    });

    // 7. Dynamic CMS Pages
    if (customPages && customPages.length > 0) {
      customPages.forEach((cp) => {
        list.push({
          id: `cms-${cp.id}`,
          title: cp.title,
          category: 'cms',
          categoryLabel: 'CMS Страницы',
          path: getRoutePath(cp.id as PageId),
          canonicalUrl: getCanonicalUrl(cp.id as PageId),
          pageId: cp.id as PageId,
          priority: '0.7',
          changeFreq: 'weekly',
          description: cp.description || 'Пользовательская информационная страница портала.',
          badge: 'CMS',
        });
      });
    }

    return list;
  }, [customPages]);

  // Filtered list
  const filteredEntries = useMemo(() => {
    return allEntries.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.title.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    });
  }, [allEntries, selectedCategory, searchQuery]);

  // Category counts
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {
      all: allEntries.length,
      main: 0,
      software: 0,
      hardware: 0,
      services: 0,
      knowledge: 0,
      news: 0,
      cms: 0,
    };
    allEntries.forEach((e) => {
      if (stats[e.category] !== undefined) {
        stats[e.category]++;
      }
    });
    return stats;
  }, [allEntries]);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(id);
    showToast('Ссылка скопирована в буфер обмена');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCopySitemapXml = () => {
    const xmlUrl = 'https://ds-engineering.ru/sitemap.xml';
    navigator.clipboard.writeText(xmlUrl);
    showToast('URL карты сайта sitemap.xml скопирован!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1.5">
              <button 
                onClick={() => navigateTo('home')} 
                className="hover:text-blue-600 transition-colors"
              >
                Главная
              </button>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Карта сайта (Sitemap)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Compass className="w-7 h-7 text-blue-600 shrink-0" />
              <span>Карта сайта и реестр страниц</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Полный структурированный каталог разделов, программного обеспечения, измерительного оборудования, 
              инжиниринговых услуг и базы знаний компании «ДС-Инжиниринг».
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <FileCode className="w-4 h-4" />
              <span>Открыть sitemap.xml</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
            <button
              onClick={handleCopySitemapXml}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Скопировать URL XML</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { key: 'all', label: 'Все страницы', icon: Globe, count: categoryStats.all, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { key: 'main', label: 'Основные', icon: Building2, count: categoryStats.main, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
            { key: 'software', label: 'ПО CAD/CAM', icon: Layers, count: categoryStats.software, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            { key: 'hardware', label: 'Оборудование', icon: Cpu, count: categoryStats.hardware, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
            { key: 'services', label: 'Услуги', icon: Wrench, count: categoryStats.services, color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { key: 'knowledge', label: 'База знаний', icon: BookOpen, count: categoryStats.knowledge, color: 'text-purple-600 bg-purple-50 border-purple-200' },
            { key: 'news', label: 'Пресс-центр', icon: Newspaper, count: categoryStats.news, color: 'text-rose-600 bg-rose-50 border-rose-200' },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-sm bg-white' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`p-1.5 rounded-lg text-xs ${cat.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-base font-bold text-slate-900">{cat.count}</span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-2 truncate">
                  {cat.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Search and Category Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск страницы, раздела или модели..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end text-xs text-slate-500">
            <span>
              Показано: <strong className="text-slate-800">{filteredEntries.length}</strong> из {allEntries.length}
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:underline font-medium"
              >
                Сбросить поиск
              </button>
            )}
          </div>
        </div>

        {/* Sitemap Table / Grid */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Раздел / Заголовок страницы</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Категория</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Канонический URL</th>
                  <th className="py-3.5 px-4 text-center">Приоритет</th>
                  <th className="py-3.5 px-4 text-center hidden lg:table-cell">Обновление</th>
                  <th className="py-3.5 px-4 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    {/* Title & Description */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => {
                            if (item.category === 'knowledge' && item.detailId) {
                              navigateTo('knowledge');
                              setTimeout(() => {
                                const el = document.getElementById(item.detailId!);
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }, 150);
                            } else {
                              navigateTo(item.pageId, item.detailId);
                            }
                          }}
                          className="font-semibold text-slate-900 group-hover:text-blue-600 text-left transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                              {item.badge}
                            </span>
                          )}
                        </button>
                        {item.description && (
                          <span className="text-xs text-slate-500 line-clamp-1 max-w-lg">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        item.category === 'main' ? 'bg-indigo-50 text-indigo-700' :
                        item.category === 'software' ? 'bg-emerald-50 text-emerald-700' :
                        item.category === 'hardware' ? 'bg-cyan-50 text-cyan-700' :
                        item.category === 'services' ? 'bg-amber-50 text-amber-700' :
                        item.category === 'knowledge' ? 'bg-purple-50 text-purple-700' :
                        item.category === 'news' ? 'bg-rose-50 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.categoryLabel}
                      </span>
                    </td>

                    {/* Canonical URL Path */}
                    <td className="py-3.5 px-4 hidden sm:table-cell font-mono text-xs text-slate-600 max-w-xs truncate">
                      <span title={item.canonicalUrl}>{item.path}</span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                        {item.priority}
                      </span>
                    </td>

                    {/* Change Frequency */}
                    <td className="py-3.5 px-4 text-center hidden lg:table-cell text-xs text-slate-500 whitespace-nowrap">
                      {item.changeFreq === 'daily' ? 'Ежедневно' :
                       item.changeFreq === 'weekly' ? 'Еженедельно' :
                       item.changeFreq === 'monthly' ? 'Ежемесячно' : item.changeFreq}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCopy(item.canonicalUrl, item.id)}
                          title="Скопировать URL"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          {copiedUrl === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (item.category === 'knowledge' && item.detailId) {
                              navigateTo('knowledge');
                              setTimeout(() => {
                                const el = document.getElementById(item.detailId!);
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }, 150);
                            } else {
                              navigateTo(item.pageId, item.detailId);
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>Перейти</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="py-12 px-4 text-center">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-700">Страницы не найдены</div>
              <p className="text-xs text-slate-500 mt-1">Попробуйте изменить поисковый запрос или фильтр категорий.</p>
            </div>
          )}
        </div>

        {/* Technical Specification Box for Search Crawlers */}
        <div className="bg-slate-900 text-slate-300 rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>Техническая информация для поисковых роботов (Яндекс.Вебмастер / Google Search Console)</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              HTTP 200 OK • Content-Type: application/xml
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Файл <code>sitemap.xml</code> генерируется динамически бэкенд-сервером на основе актуальной номенклатуры оборудования, 
            каталога программных комплексов TopSolid 7, PolyWorks, Shining 3D, Geomagic и опубликованных страниц CMS. 
            Канонический адрес хоста: <code>https://ds-engineering.ru</code>. Индексация разрешена директивой <code>Allow: /</code> в <code>robots.txt</code>.
          </p>
        </div>

      </div>
    </div>
  );
};
