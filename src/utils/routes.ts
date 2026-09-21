import { PageId } from '../types';
import { PRODUCTS_DATA, SERVICES_DATA } from '../data/mockData';

export interface ParsedRoute {
  page: PageId;
  detailId?: string;
  scrollTo?: string;
}

/**
 * Mapping between PageId and primary canonical URI path.
 * Per user requirements:
 *   Главная: /main
 *   Программное обеспечение: /software
 *   Оборудование: /hardware
 *   Услуги: /services
 *   О компании: /about
 *   База знаний: /knowledge
 *   Новости: /news
 *   Контакты: /contacts
 *   Личный кабинет: /account
 *   Калькулятор услуг: /calculator
 *   CRM (для менеджеров): /crm
 *   CMS (панель управления): /cms
 */
export const PAGE_PATHS: Record<string, string> = {
  home: '/main',
  software: '/software',
  hardware: '/hardware',
  services: '/services',
  about: '/about',
  knowledge: '/knowledge',
  news: '/news',
  contacts: '/contacts',
  account: '/account',
  crm: '/crm',
  cms: '/cms',
  sitemap: '/sitemap',
  notfound: '/notfound',
};

/**
 * Generates the clean URI pathname for a given page and optional detail ID.
 */
export function getRoutePath(page: PageId, detailId?: string): string {
  if (page === 'home') {
    return '/main';
  }
  if (page === 'software') {
    return detailId ? `/software/${encodeURIComponent(detailId)}` : '/software';
  }
  if (page === 'hardware') {
    return detailId ? `/hardware/${encodeURIComponent(detailId)}` : '/hardware';
  }
  if (page === 'services') {
    return detailId ? `/services/${encodeURIComponent(detailId)}` : '/services';
  }
  if (page === 'news') {
    return detailId ? `/news/${encodeURIComponent(detailId)}` : '/news';
  }
  if (page === 'knowledge') {
    return detailId ? `/knowledge/${encodeURIComponent(detailId)}` : '/knowledge';
  }
  if (page.startsWith('custom-')) {
    const slug = page.replace('custom-', '');
    return `/page/${encodeURIComponent(slug)}`;
  }
  return PAGE_PATHS[page] || `/${page}`;
}

/**
 * Generates absolute canonical URL for SEO
 */
export function getCanonicalUrl(page: PageId, detailId?: string): string {
  const path = getRoutePath(page, detailId);
  return `https://ds-engineering.ru${path}`;
}

/**
 * Parses the current browser location (pathname + hash) into a structured route.
 */
export function parseCurrentLocation(): ParsedRoute {
  if (typeof window === 'undefined') {
    return { page: 'home' };
  }
  return parseUrl(window.location.pathname, window.location.hash);
}

/**
 * Parses a given pathname and optional hash into a structured route.
 */
export function parseUrl(pathname: string, hash = ''): ParsedRoute {
  const cleanPath = (pathname || '/').trim();
  const normalized = cleanPath === '/' ? '/' : cleanPath.replace(/\/+$/, '');
  const cleanHash = (hash || '').replace(/^#\/?/, '').trim();

  // 1. Root or /main or /home -> Home page
  if (normalized === '/' || normalized === '/main' || normalized === '/home') {
    if (cleanHash) {
      const resolvedFromHash = resolveHash(cleanHash);
      if (resolvedFromHash) return resolvedFromHash;
    }
    return { page: 'home' };
  }

  // 2. Split path segments: e.g. /software/topsolid-7 -> ['software', 'topsolid-7']
  const segments = normalized.split('/').filter(Boolean);
  const rootSegment = segments[0]?.toLowerCase() || '';
  const subSegment = segments[1] ? decodeURIComponent(segments[1]) : undefined;

  // 3. Calculator shortcut route: /calculator
  if (rootSegment === 'calculator' || rootSegment === 'service-calculator') {
    return { page: 'services', scrollTo: 'service-calculator' };
  }

  // 4. Software route: /software or /software/:id
  if (rootSegment === 'software' || rootSegment === 'po' || rootSegment === 'cad-cam') {
    return { page: 'software', detailId: subSegment };
  }

  // 5. Hardware route: /hardware or /equipment or /oborudovanie or /hardware/:id
  if (rootSegment === 'hardware' || rootSegment === 'equipment' || rootSegment === 'oborudovanie') {
    return { page: 'hardware', detailId: subSegment };
  }

  // 6. Services route: /services or /services/:id
  if (rootSegment === 'services' || rootSegment === 'uslugi') {
    if (subSegment === 'calculator' || subSegment === 'service-calculator') {
      return { page: 'services', scrollTo: 'service-calculator' };
    }
    return { page: 'services', detailId: subSegment };
  }

  // 7. About route: /about or /about-us or /company
  if (rootSegment === 'about' || rootSegment === 'about-us' || rootSegment === 'company') {
    return { page: 'about' };
  }

  // 8. Knowledge base route: /knowledge or /knowledge-base or /baza-znaniy
  if (rootSegment === 'knowledge' || rootSegment === 'knowledge-base' || rootSegment === 'baza-znaniy') {
    return { page: 'knowledge', detailId: subSegment };
  }

  // 9. News route: /news or /articles or /press or /news/:id
  if (rootSegment === 'news' || rootSegment === 'articles' || rootSegment === 'press') {
    return { page: 'news', detailId: subSegment };
  }

  // 10. Contacts route: /contacts or /contact
  if (rootSegment === 'contacts' || rootSegment === 'contact') {
    return { page: 'contacts' };
  }

  // 11. Account route: /account or /profile or /lk
  if (rootSegment === 'account' || rootSegment === 'profile' || rootSegment === 'lk') {
    return { page: 'account' };
  }

  // 12. CRM route: /crm
  if (rootSegment === 'crm') {
    return { page: 'crm' };
  }

  // 13. CMS route: /cms or /admin
  if (rootSegment === 'cms' || rootSegment === 'admin') {
    return { page: 'cms' };
  }

  // 14. Sitemap route: /sitemap or /karta-sayta
  if (rootSegment === 'sitemap' || rootSegment === 'karta-sayta' || rootSegment === 'site-map') {
    return { page: 'sitemap' };
  }

  // 15. Custom page: /page/:slug
  if (rootSegment === 'page' && subSegment) {
    return { page: `custom-${subSegment}` as PageId };
  }

  // 15. Check if rootSegment itself is a product ID or service ID directly
  const foundProd = PRODUCTS_DATA.find((p) => p.id.toLowerCase() === rootSegment);
  if (foundProd) {
    return {
      page: foundProd.type === 'software' ? 'software' : 'hardware',
      detailId: foundProd.id,
    };
  }

  const foundSrv = SERVICES_DATA.find((s) => s.id.toLowerCase() === rootSegment);
  if (foundSrv) {
    return { page: 'services', detailId: foundSrv.id };
  }

  // 16. Fallback to hash if present
  if (cleanHash) {
    const fromHash = resolveHash(cleanHash);
    if (fromHash) return fromHash;
  }

  // 17. Unknown route -> Not found
  return { page: 'notfound' };
}

function resolveHash(rawHash: string): ParsedRoute | null {
  const h = rawHash.toLowerCase();
  if (h === 'home' || h === 'main') return { page: 'home' };
  if (h === 'software') return { page: 'software' };
  if (h === 'hardware' || h === 'equipment') return { page: 'hardware' };
  if (h === 'services') return { page: 'services' };
  if (h === 'calculator' || h === 'service-calculator') return { page: 'services', scrollTo: 'service-calculator' };
  if (h === 'about') return { page: 'about' };
  if (h === 'knowledge' || h === 'knowledge-base') return { page: 'knowledge' };
  if (h === 'news' || h === 'articles') return { page: 'news' };
  if (h === 'contacts') return { page: 'contacts' };
  if (h === 'account') return { page: 'account' };
  if (h === 'crm') return { page: 'crm' };
  if (h === 'cms') return { page: 'cms' };
  if (h === 'sitemap' || h === 'karta-sayta') return { page: 'sitemap' };
  if (h.startsWith('custom-')) return { page: h as PageId };

  const prod = PRODUCTS_DATA.find((p) => p.id.toLowerCase() === h);
  if (prod) {
    return {
      page: prod.type === 'software' ? 'software' : 'hardware',
      detailId: prod.id,
    };
  }
  const srv = SERVICES_DATA.find((s) => s.id.toLowerCase() === h);
  if (srv) {
    return { page: 'services', detailId: srv.id };
  }
  return null;
}

/**
 * Updates browser address bar path using HTML5 History API without reloading the page.
 */
export function updateBrowserUrl(page: PageId, detailId?: string, replace = false): void {
  if (typeof window === 'undefined') return;

  const targetPath = getRoutePath(page, detailId);
  const currentPath = window.location.pathname;

  if (currentPath !== targetPath) {
    if (replace) {
      window.history.replaceState({ page, detailId }, '', targetPath);
    } else {
      window.history.pushState({ page, detailId }, '', targetPath);
    }
  }
}
