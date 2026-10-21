/**
 * УТИЛИТА ДИНАМИЧЕСКОЙ ГЕНЕРАЦИИ SITEMAP.XML ДЛЯ «ДС-ИНЖИНИРИНГ»
 * 
 * Формирует полный индекс страниц сайта на основе определений в коде и CMS:
 * - Все основные страницы и лендинги (/main, /software, /hardware, /services, /about, /knowledge, /news, /contacts, /calculator)
 * - Все категории продукции ПО (TopSolid, PolyWorks, Geomagic, Shining 3D)
 * - Все категории измерительного оборудования (портативные КИМ, 3D-сканеры, стационарные КИМ, трекеры, датчики)
 * - Все страницы программных продуктов (/software/:id)
 * - Все страницы измерительного оборудования (/hardware/:id)
 * - Все страницы инжиниринговых услуг (/services/:id)
 * - Все страницы новостей и статей базы знаний (/news/:id, /knowledge#id)
 * - Все пользовательские страницы CMS (/page/:slug)
 */

import { Product, ServiceItem, Article, KnowledgeItem, CustomPage, PageId } from '../types';
import { PRODUCTS_DATA, SERVICES_DATA, NEWS_ARTICLES, KNOWLEDGE_BASE_ITEMS } from '../data/mockData';
import { REAL_SERVICES } from '../data/services';

export const BASE_SITE_URL = 'https://ds-engineering.ru';

export type SitemapChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: SitemapChangeFreq;
  priority: string;
  title: string;
  category: string;
  sectionType: 'static' | 'product_category' | 'software' | 'hardware' | 'service' | 'knowledge' | 'news' | 'cms';
}

export interface SitemapGeneratorOptions {
  baseUrl?: string;
  currentDate?: string;
  products?: Product[];
  services?: ServiceItem[];
  articles?: Article[];
  knowledgeBase?: KnowledgeItem[];
  customPages?: CustomPage[];
  includeCategories?: boolean;
}

export interface SitemapSummary {
  totalUrls: number;
  bySection: Record<string, number>;
  generatedAt: string;
  baseUrl: string;
}

/**
 * Категории программного обеспечения
 */
export const SOFTWARE_CATEGORIES = [
  { id: 'all', slug: 'all', title: 'Все программное обеспечение CAD/CAM/PDM', priority: '0.9', freq: 'weekly' as const },
  { id: 'topsolid', slug: 'topsolid', title: 'TopSolid 7 — Интегрированная CAD/CAM/PDM система', priority: '0.9', freq: 'weekly' as const },
  { id: 'polyworks', slug: 'polyworks', title: 'PolyWorks|Inspector — ПО координатной метрологии и GD&T', priority: '0.9', freq: 'weekly' as const },
  { id: 'geomagic', slug: 'geomagic', title: 'Geomagic Design X / Control X — ПО реверс-инжиниринга и контроля', priority: '0.85', freq: 'weekly' as const },
  { id: 'shining3d', slug: 'shining3d', title: 'Shining 3D Software — ПО для 3D-сканирования и оцифровки', priority: '0.85', freq: 'weekly' as const },
];

/**
 * Категории измерительного оборудования
 */
export const HARDWARE_CATEGORIES = [
  { id: 'all', slug: 'all', title: 'Все измерительное оборудование и КИМ', priority: '0.9', freq: 'weekly' as const },
  { id: 'portable-cmm', slug: 'portable-cmm', title: 'Портативные КИМ типа «рука» PMT Alpha Arm', priority: '0.9', freq: 'weekly' as const },
  { id: '3d-scanners', slug: '3d-scanners', title: 'Оптические и синие лазерные 3D-сканеры (ФГИС «АРШИН»)', priority: '0.9', freq: 'weekly' as const },
  { id: 'stationary-cmm', slug: 'stationary-cmm', title: 'Стационарные КИМ Mitutoyo (метро-зал «Жигулевская долина»)', priority: '0.85', freq: 'weekly' as const },
  { id: 'laser-trackers', slug: 'laser-trackers', title: 'Лазерные трекеры и системы крупногабаритных измерений', priority: '0.85', freq: 'weekly' as const },
  { id: 'accessories', slug: 'accessories', title: 'Датчики, щупы Renishaw и эталонная метрологическая оснастка', priority: '0.8', freq: 'monthly' as const },
];

/**
 * Основные статические разделы портала
 */
export const STATIC_PAGES = [
  { path: '/main', title: 'Главная страница портала «ДС-Инжиниринг»', priority: '1.0', changefreq: 'daily' as const, category: 'Главная' },
  { path: '/software', title: 'Каталог программного обеспечения (CAD/CAM/PDM/CMM)', priority: '0.9', changefreq: 'weekly' as const, category: 'Каталог ПО' },
  { path: '/hardware', title: 'Каталог измерительного оборудования и КИМ', priority: '0.9', changefreq: 'weekly' as const, category: 'Каталог оборудования' },
  { path: '/services', title: 'Инжиниринговые услуги, 3D-сканирование и контроль геометрии', priority: '0.9', changefreq: 'weekly' as const, category: 'Услуги' },
  { path: '/calculator', title: 'Онлайн-калькулятор стоимости инжиниринговых услуг', priority: '0.85', changefreq: 'weekly' as const, category: 'Калькулятор' },
  { path: '/about', title: 'О компании «ДС-Инжиниринг» (опыт с 1995 г., филиалы)', priority: '0.8', changefreq: 'monthly' as const, category: 'О компании' },
  { path: '/knowledge', title: 'База знаний, стандарты ГОСТ Р 53442 и метрологические руководства', priority: '0.8', changefreq: 'weekly' as const, category: 'База знаний' },
  { path: '/news', title: 'Пресс-центр, новости машиностроения и метрологии', priority: '0.8', changefreq: 'weekly' as const, category: 'Новости' },
  { path: '/contacts', title: 'Контакты, адреса офисов (Самара, Тольятти) и реквизиты', priority: '0.8', changefreq: 'monthly' as const, category: 'Контакты' },
  { path: '/sitemap', title: 'Интерактивная карта сайта (HTML Sitemap)', priority: '0.7', changefreq: 'weekly' as const, category: 'Навигация' }
];

/**
 * Экранирование спецсимволов для XML
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Построение массива всех URL для Sitemap на основе структуры сайта
 */
export function buildDynamicSitemapUrls(options: SitemapGeneratorOptions = {}): SitemapUrl[] {
  const baseUrl = (options.baseUrl || BASE_SITE_URL).replace(/\/+$/, '');
  const today = options.currentDate || new Date().toISOString().split('T')[0];
  const includeCategories = options.includeCategories !== false;

  const productsList = options.products && options.products.length > 0 ? options.products : PRODUCTS_DATA;
  const servicesList = options.services && options.services.length > 0 ? options.services : REAL_SERVICES;
  const articlesList = options.articles && options.articles.length > 0 ? options.articles : NEWS_ARTICLES;
  const knowledgeList = options.knowledgeBase && options.knowledgeBase.length > 0 ? options.knowledgeBase : KNOWLEDGE_BASE_ITEMS;
  const customPagesList = options.customPages || [];

  const urls: SitemapUrl[] = [];
  const seenLocs = new Set<string>();

  const addUrl = (entry: SitemapUrl) => {
    if (!seenLocs.has(entry.loc)) {
      seenLocs.add(entry.loc);
      urls.push(entry);
    }
  };

  // 1. Статические разделы
  STATIC_PAGES.forEach((page) => {
    addUrl({
      loc: `${baseUrl}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
      title: page.title,
      category: page.category,
      sectionType: 'static'
    });
  });

  // 2. Категории ПО (с query-параметрами фильтрации)
  if (includeCategories) {
    SOFTWARE_CATEGORIES.forEach((cat) => {
      const path = cat.slug === 'all' ? '/software' : `/software?category=${cat.slug}`;
      addUrl({
        loc: `${baseUrl}${path}`,
        lastmod: today,
        changefreq: cat.freq,
        priority: cat.priority,
        title: cat.title,
        category: 'Категории ПО',
        sectionType: 'product_category'
      });
    });

    // 3. Категории оборудования
    HARDWARE_CATEGORIES.forEach((cat) => {
      const path = cat.slug === 'all' ? '/hardware' : `/hardware?category=${cat.slug}`;
      addUrl({
        loc: `${baseUrl}${path}`,
        lastmod: today,
        changefreq: cat.freq,
        priority: cat.priority,
        title: cat.title,
        category: 'Категории оборудования',
        sectionType: 'product_category'
      });
    });
  }

  // 4. Программные продукты (Software Details)
  productsList.filter((p) => p.type === 'software').forEach((p) => {
    addUrl({
      loc: `${baseUrl}/software/${encodeURIComponent(p.id)}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.85',
      title: `${p.name} — ${p.categoryLabel || 'CAD/CAM комплекс'}`,
      category: 'Программное обеспечение',
      sectionType: 'software'
    });
  });

  // 5. Измерительное оборудование (Hardware Details)
  productsList.filter((p) => p.type === 'hardware').forEach((p) => {
    addUrl({
      loc: `${baseUrl}/hardware/${encodeURIComponent(p.id)}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.85',
      title: `${p.name} (${p.brand || 'Измерительная система'})`,
      category: 'Измерительное оборудование',
      sectionType: 'hardware'
    });
  });

  // 6. Инжиниринговые услуги (Services Details)
  servicesList.forEach((s) => {
    addUrl({
      loc: `${baseUrl}/services/${encodeURIComponent(s.id)}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.85',
      title: s.title,
      category: s.category || 'Инжиниринговые услуги',
      sectionType: 'service'
    });
  });

  // 7. Новости и статьи
  articlesList.forEach((a) => {
    const articleDate = a.date && !isNaN(new Date(a.date).getTime()) 
      ? new Date(a.date).toISOString().split('T')[0] 
      : today;

    addUrl({
      loc: `${baseUrl}/news/${encodeURIComponent(a.id)}`,
      lastmod: articleDate,
      changefreq: 'monthly',
      priority: '0.75',
      title: a.title,
      category: 'Пресс-центр и новости',
      sectionType: 'news'
    });
  });

  // 8. База знаний и методики
  knowledgeList.forEach((k) => {
    addUrl({
      loc: `${baseUrl}/knowledge#${encodeURIComponent(k.id)}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.7',
      title: k.title,
      category: k.category || 'База знаний',
      sectionType: 'knowledge'
    });
  });

  // 9. Пользовательские страницы CMS
  customPagesList.forEach((cp) => {
    const slug = cp.id.startsWith('custom-') ? cp.id.replace('custom-', '') : cp.id;
    addUrl({
      loc: `${baseUrl}/page/${encodeURIComponent(slug)}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.7',
      title: cp.title || cp.menuTitle || 'Информационная страница',
      category: 'Страницы CMS',
      sectionType: 'cms'
    });
  });

  return urls;
}

/**
 * Генерация валидного XML документа Sitemap по стандарту Sitemaps.org
 */
export function generateSitemapXml(urls: SitemapUrl[]): string {
  const xmlEntries = urls.map((u) => {
    return `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${escapeXml(u.lastmod)}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmlEntries}
</urlset>`;
}

/**
 * Получение сводной аналитики по структуре sitemap
 */
export function getSitemapSummary(urls: SitemapUrl[], baseUrl: string = BASE_SITE_URL): SitemapSummary {
  const bySection: Record<string, number> = {};
  urls.forEach((u) => {
    bySection[u.sectionType] = (bySection[u.sectionType] || 0) + 1;
  });

  return {
    totalUrls: urls.length,
    bySection,
    generatedAt: new Date().toISOString(),
    baseUrl
  };
}

/**
 * Скачивание сгенерированного файла sitemap.xml в браузере
 */
export function downloadSitemapXmlFile(
  filename: string = 'sitemap.xml',
  options: SitemapGeneratorOptions = {}
): { success: boolean; totalUrls: number } {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { success: false, totalUrls: 0 };
  }

  try {
    const urls = buildDynamicSitemapUrls(options);
    const xmlContent = generateSitemapXml(urls);

    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, totalUrls: urls.length };
  } catch (err) {
    console.error('Ошибка скачивания sitemap.xml:', err);
    return { success: false, totalUrls: 0 };
  }
}

export const generateSitemapUrls = buildDynamicSitemapUrls;
