import { describe, it, expect } from 'vitest';
import { 
  buildDynamicSitemapUrls, 
  generateSitemapXml, 
  getSitemapSummary,
  STATIC_PAGES,
  SOFTWARE_CATEGORIES,
  HARDWARE_CATEGORIES,
  BASE_SITE_URL
} from '../sitemapGenerator';
import { PRODUCTS_DATA, NEWS_ARTICLES, KNOWLEDGE_BASE_ITEMS } from '../../data/mockData';
import { REAL_SERVICES } from '../../data/services';

describe('Sitemap Generator Tests', () => {
  it('should generate complete list of URLs containing all site sections', () => {
    const urls = buildDynamicSitemapUrls({
      baseUrl: 'https://ds-engineering.ru',
      includeCategories: true
    });

    expect(urls.length).toBeGreaterThan(30);

    // Verify all static pages are included
    STATIC_PAGES.forEach((sp) => {
      const found = urls.some((u) => u.loc === `https://ds-engineering.ru${sp.path}`);
      expect(found).toBe(true);
    });

    // Verify software categories
    SOFTWARE_CATEGORIES.forEach((sc) => {
      const expectedPath = sc.slug === 'all' ? '/software' : `/software?category=${sc.slug}`;
      const found = urls.some((u) => u.loc === `https://ds-engineering.ru${expectedPath}`);
      expect(found).toBe(true);
    });

    // Verify hardware categories
    HARDWARE_CATEGORIES.forEach((hc) => {
      const expectedPath = hc.slug === 'all' ? '/hardware' : `/hardware?category=${hc.slug}`;
      const found = urls.some((u) => u.loc === `https://ds-engineering.ru${expectedPath}`);
      expect(found).toBe(true);
    });

    // Verify all software products
    const softProducts = PRODUCTS_DATA.filter(p => p.type === 'software');
    softProducts.forEach((p) => {
      const found = urls.some((u) => u.loc.includes(`/software/${encodeURIComponent(p.id)}`));
      expect(found).toBe(true);
    });

    // Verify all hardware products
    const hardProducts = PRODUCTS_DATA.filter(p => p.type === 'hardware');
    hardProducts.forEach((p) => {
      const found = urls.some((u) => u.loc.includes(`/hardware/${encodeURIComponent(p.id)}`));
      expect(found).toBe(true);
    });

    // Verify all service pages
    REAL_SERVICES.forEach((s) => {
      const found = urls.some((u) => u.loc.includes(`/services/${encodeURIComponent(s.id)}`));
      expect(found).toBe(true);
    });
  });

  it('should generate valid XML compliant with sitemaps.org schema', () => {
    const urls = buildDynamicSitemapUrls();
    const xml = generateSitemapXml(urls);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain('</urlset>');
    expect(xml).toContain('<loc>https://ds-engineering.ru/main</loc>');
    expect(xml).toContain('<changefreq>daily</changefreq>');
    expect(xml).toContain('<priority>1.0</priority>');

    // Check XML escaping
    expect(xml).not.toContain('&category='); // Should be &amp;category=
  });

  it('should calculate accurate sitemap summary and statistics', () => {
    const urls = buildDynamicSitemapUrls();
    const summary = getSitemapSummary(urls);

    expect(summary.totalUrls).toBe(urls.length);
    expect(summary.bySection.static).toBe(STATIC_PAGES.length);
    expect(summary.bySection.product_category).toBe(SOFTWARE_CATEGORIES.length + HARDWARE_CATEGORIES.length - 2); // 'all' paths match static /software and /hardware
    expect(summary.bySection.service).toBe(REAL_SERVICES.length);
    expect(summary.bySection.software).toBeGreaterThan(0);
    expect(summary.bySection.hardware).toBeGreaterThan(0);
  });

  it('should support dynamic CMS custom pages', () => {
    const customPages = [
      {
        id: 'custom-metrology-center',
        title: 'Метрологический центр',
        description: 'Лаборатория поверки',
        updatedAt: '2026-10-01'
      } as any
    ];

    const urls = buildDynamicSitemapUrls({ customPages });
    const foundCustom = urls.some((u) => u.loc.includes('/page/metrology-center'));
    expect(foundCustom).toBe(true);
  });
});
