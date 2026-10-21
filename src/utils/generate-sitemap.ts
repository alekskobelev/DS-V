/**
 * Скрипт генерации статического файла sitemap.xml для «ДС-Инжиниринг»
 * 
 * Итерируется по массивам PRODUCTS_DATA и SERVICES_DATA, статическим маршрутам,
 * категориям оборудования и ПО, статьям и базе знаний для генерации sitemap.xml.
 */

import fs from 'fs';
import path from 'path';
import { PRODUCTS_DATA, SERVICES_DATA, NEWS_ARTICLES, KNOWLEDGE_BASE_ITEMS } from '../data/mockData';

export const BASE_SITE_URL = 'https://ds-engineering.ru';

export interface SitemapUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  category?: string;
  title?: string;
}

export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Генерирует XML-содержимое для sitemap.xml на основе PRODUCTS_DATA и SERVICES_DATA
 */
export function generateSitemapXmlContent(options: { baseUrl?: string; date?: string } = {}): string {
  const baseUrl = (options.baseUrl || BASE_SITE_URL).replace(/\/+$/, '');
  const today = options.date || new Date().toISOString().split('T')[0];
  const entries: SitemapUrlEntry[] = [];
  const seen = new Set<string>();

  const add = (entry: SitemapUrlEntry) => {
    if (!seen.has(entry.loc)) {
      seen.add(entry.loc);
      entries.push(entry);
    }
  };

  // 1. Основные статические разделы портала
  const staticRoutes = [
    { path: '/main', priority: '1.0', freq: 'daily' as const, title: 'Главная страница портала' },
    { path: '/software', priority: '0.9', freq: 'weekly' as const, title: 'Каталог ПО CAD/CAM/PDM' },
    { path: '/hardware', priority: '0.9', freq: 'weekly' as const, title: 'Каталог измерительного оборудования и КИМ' },
    { path: '/services', priority: '0.9', freq: 'weekly' as const, title: 'Инжиниринговые услуги' },
    { path: '/calculator', priority: '0.85', freq: 'weekly' as const, title: 'Калькулятор стоимости услуг' },
    { path: '/about', priority: '0.8', freq: 'monthly' as const, title: 'О компании «ДС-Инжиниринг»' },
    { path: '/knowledge', priority: '0.8', freq: 'weekly' as const, title: 'База знаний и ГОСТ' },
    { path: '/news', priority: '0.8', freq: 'weekly' as const, title: 'Новости и пресс-центр' },
    { path: '/contacts', priority: '0.8', freq: 'monthly' as const, title: 'Контакты и офисы' },
    { path: '/sitemap', priority: '0.7', freq: 'weekly' as const, title: 'Карта сайта' },
  ];

  staticRoutes.forEach(r => {
    add({
      loc: `${baseUrl}${r.path}`,
      lastmod: today,
      changefreq: r.freq,
      priority: r.priority,
      title: r.title
    });
  });

  // 2. Категории программного обеспечения и оборудования
  const productCategories = [
    { path: '/software?category=topsolid', priority: '0.85', freq: 'weekly' as const, title: 'TopSolid 7 CAD/CAM' },
    { path: '/software?category=polyworks', priority: '0.85', freq: 'weekly' as const, title: 'PolyWorks|Inspector' },
    { path: '/software?category=geomagic', priority: '0.85', freq: 'weekly' as const, title: 'Geomagic Design X' },
    { path: '/software?category=shining3d', priority: '0.85', freq: 'weekly' as const, title: 'Shining 3D Software' },
    { path: '/hardware?category=portable-cmm', priority: '0.85', freq: 'weekly' as const, title: 'Портативные КИМ-руки PMT' },
    { path: '/hardware?category=3d-scanners', priority: '0.85', freq: 'weekly' as const, title: '3D-сканеры Shining 3D / ScanLine' },
    { path: '/hardware?category=stationary-cmm', priority: '0.85', freq: 'weekly' as const, title: 'Стационарные КИМ Mitutoyo' },
    { path: '/hardware?category=laser-trackers', priority: '0.85', freq: 'weekly' as const, title: 'Лазерные трекеры' },
    { path: '/hardware?category=accessories', priority: '0.8', freq: 'monthly' as const, title: 'Щупы и датчики Renishaw' },
  ];

  productCategories.forEach(c => {
    add({
      loc: `${baseUrl}${c.path}`,
      lastmod: today,
      changefreq: c.freq,
      priority: c.priority,
      title: c.title
    });
  });

  // 3. Итерация по PRODUCTS_DATA (ПО и Оборудование)
  if (Array.isArray(PRODUCTS_DATA)) {
    PRODUCTS_DATA.forEach(p => {
      const section = p.type === 'software' ? 'software' : 'hardware';
      add({
        loc: `${baseUrl}/${section}/${encodeURIComponent(p.id)}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.85',
        title: p.name
      });
    });
  }

  // 4. Итерация по SERVICES_DATA (Инжиниринговые услуги)
  if (Array.isArray(SERVICES_DATA)) {
    SERVICES_DATA.forEach(s => {
      add({
        loc: `${baseUrl}/services/${encodeURIComponent(s.id)}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.85',
        title: s.title
      });
    });
  }

  // 5. Пресс-центр и новости (NEWS_ARTICLES)
  if (Array.isArray(NEWS_ARTICLES)) {
    NEWS_ARTICLES.forEach(n => {
      const artDate = n.date && !isNaN(new Date(n.date).getTime())
        ? new Date(n.date).toISOString().split('T')[0]
        : today;
      add({
        loc: `${baseUrl}/news/${encodeURIComponent(n.id)}`,
        lastmod: artDate,
        changefreq: 'monthly',
        priority: '0.75',
        title: n.title
      });
    });
  }

  // 6. База знаний и методики измерений (KNOWLEDGE_BASE_ITEMS)
  if (Array.isArray(KNOWLEDGE_BASE_ITEMS)) {
    KNOWLEDGE_BASE_ITEMS.forEach(k => {
      add({
        loc: `${baseUrl}/knowledge#${encodeURIComponent(k.id)}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.7',
        title: k.title
      });
    });
  }

  // Построение форматированного XML
  const rows = entries.map(e => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${escapeXml(e.lastmod)}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${rows}
</urlset>\n`;
}

/**
 * Записывает сгенерированный sitemap.xml на диск (в директорию public/ и dist/ для статического хостинга)
 */
export function generateSitemapFile(customDestinations?: string[]): {
  success: boolean;
  totalEntries: number;
  writtenPaths: string[];
} {
  const xml = generateSitemapXmlContent();
  const rootDir = process.cwd();
  
  const defaultDestinations = [
    path.join(rootDir, 'public', 'sitemap.xml'),
    path.join(rootDir, 'dist', 'sitemap.xml')
  ];

  const targetPaths = customDestinations && customDestinations.length > 0
    ? customDestinations
    : defaultDestinations;

  const writtenPaths: string[] = [];

  for (const targetPath of targetPaths) {
    try {
      const targetDir = path.dirname(targetPath);
      if (fs.existsSync(targetDir) || targetDir.endsWith('public')) {
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.writeFileSync(targetPath, xml, 'utf-8');
        writtenPaths.push(targetPath);
      }
    } catch (err) {
      console.warn(`[sitemap-generator] Предупреждение при записи sitemap в ${targetPath}:`, err);
    }
  }

  return {
    success: writtenPaths.length > 0,
    totalEntries: (xml.match(/<url>/g) || []).length,
    writtenPaths
  };
}

// Автоматический запуск при прямом вызове из CLI (npx tsx src/utils/generate-sitemap.ts)
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('generate-sitemap')) {
  try {
    const res = generateSitemapFile();
    console.log(`[sitemap-generator] sitemap.xml успешно сгенерирован (${res.totalEntries} URL):`, res.writtenPaths);
  } catch (e) {
    console.error('[sitemap-generator] Ошибка генерации sitemap.xml:', e);
  }
}
