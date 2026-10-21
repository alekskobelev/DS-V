import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PAGE_PATHS,
  getRoutePath,
  getCanonicalUrl,
  parseUrl,
  parseCurrentLocation,
  updateBrowserUrl
} from '../routes';
import { PRODUCTS_DATA, SERVICES_DATA } from '../../data/mockData';
import { PageId } from '../../types';

describe('Route Utility Tests (src/utils/routes.ts)', () => {
  describe('PAGE_PATHS mapping', () => {
    it('defines primary canonical URI paths for all standard pages', () => {
      expect(PAGE_PATHS.home).toBe('/main');
      expect(PAGE_PATHS.software).toBe('/software');
      expect(PAGE_PATHS.hardware).toBe('/hardware');
      expect(PAGE_PATHS.services).toBe('/services');
      expect(PAGE_PATHS.about).toBe('/about');
      expect(PAGE_PATHS.knowledge).toBe('/knowledge');
      expect(PAGE_PATHS.news).toBe('/news');
      expect(PAGE_PATHS.contacts).toBe('/contacts');
      expect(PAGE_PATHS.account).toBe('/account');
      expect(PAGE_PATHS.crm).toBe('/crm');
      expect(PAGE_PATHS.cms).toBe('/cms');
      expect(PAGE_PATHS.sitemap).toBe('/sitemap');
      expect(PAGE_PATHS.notfound).toBe('/notfound');
    });
  });

  describe('getRoutePath', () => {
    it('returns /main for home page', () => {
      expect(getRoutePath('home')).toBe('/main');
    });

    it('returns section paths without detailId', () => {
      expect(getRoutePath('software')).toBe('/software');
      expect(getRoutePath('hardware')).toBe('/hardware');
      expect(getRoutePath('services')).toBe('/services');
      expect(getRoutePath('news')).toBe('/news');
      expect(getRoutePath('knowledge')).toBe('/knowledge');
      expect(getRoutePath('about')).toBe('/about');
      expect(getRoutePath('contacts')).toBe('/contacts');
      expect(getRoutePath('account')).toBe('/account');
      expect(getRoutePath('crm')).toBe('/crm');
      expect(getRoutePath('cms')).toBe('/cms');
    });

    it('returns properly formatted paths with detailId', () => {
      expect(getRoutePath('software', 'topsolid-7')).toBe('/software/topsolid-7');
      expect(getRoutePath('hardware', 'pmt-alpha-arm')).toBe('/hardware/pmt-alpha-arm');
      expect(getRoutePath('services', '3d-scanning')).toBe('/services/3d-scanning');
      expect(getRoutePath('news', 'article-2026')).toBe('/news/article-2026');
      expect(getRoutePath('knowledge', 'gost-iso-1101')).toBe('/knowledge/gost-iso-1101');
    });

    it('url-encodes detailId with special characters', () => {
      expect(getRoutePath('software', 'cad/cam tools')).toBe('/software/cad%2Fcam%20tools');
    });

    it('handles custom CMS pages (custom-slug)', () => {
      expect(getRoutePath('custom-privacy-policy' as PageId)).toBe('/page/privacy-policy');
      expect(getRoutePath('custom-quality-management' as PageId)).toBe('/page/quality-management');
    });

    it('falls back to mapped page or /page for other strings', () => {
      expect(getRoutePath('sitemap')).toBe('/sitemap');
      expect(getRoutePath('unknown-page' as PageId)).toBe('/unknown-page');
    });
  });

  describe('getCanonicalUrl', () => {
    it('generates absolute HTTPS URL for main domain', () => {
      expect(getCanonicalUrl('home')).toBe('https://ds-engineering.ru/main');
      expect(getCanonicalUrl('software')).toBe('https://ds-engineering.ru/software');
      expect(getCanonicalUrl('hardware')).toBe('https://ds-engineering.ru/hardware');
      expect(getCanonicalUrl('services')).toBe('https://ds-engineering.ru/services');
    });

    it('generates absolute HTTPS URL for detail items', () => {
      expect(getCanonicalUrl('software', 'polyworks')).toBe('https://ds-engineering.ru/software/polyworks');
      expect(getCanonicalUrl('hardware', 'freescan-ue')).toBe('https://ds-engineering.ru/hardware/freescan-ue');
      expect(getCanonicalUrl('services', 'reverse-engineering')).toBe('https://ds-engineering.ru/services/reverse-engineering');
    });

    it('generates absolute HTTPS URL for custom CMS pages', () => {
      expect(getCanonicalUrl('custom-terms-of-service' as PageId)).toBe('https://ds-engineering.ru/page/terms-of-service');
    });
  });

  describe('parseUrl', () => {
    it('parses root and homepage aliases to home', () => {
      expect(parseUrl('/')).toEqual({ page: 'home' });
      expect(parseUrl('/main')).toEqual({ page: 'home' });
      expect(parseUrl('/home')).toEqual({ page: 'home' });
      expect(parseUrl('/index.html')).toEqual({ page: 'home' });
      expect(parseUrl('/index')).toEqual({ page: 'home' });
    });

    it('handles trailing slashes cleanly', () => {
      expect(parseUrl('/software/')).toEqual({ page: 'software', detailId: undefined });
      expect(parseUrl('/hardware/')).toEqual({ page: 'hardware', detailId: undefined });
      expect(parseUrl('/services/')).toEqual({ page: 'services', detailId: undefined });
    });

    it('parses calculator shortcuts with scrollTo target', () => {
      expect(parseUrl('/calculator')).toEqual({ page: 'services', scrollTo: 'service-calculator' });
      expect(parseUrl('/service-calculator')).toEqual({ page: 'services', scrollTo: 'service-calculator' });
      expect(parseUrl('/services/calculator')).toEqual({ page: 'services', scrollTo: 'service-calculator' });
      expect(parseUrl('/services/service-calculator')).toEqual({ page: 'services', scrollTo: 'service-calculator' });
    });

    it('parses software routes and synonyms', () => {
      expect(parseUrl('/software')).toEqual({ page: 'software', detailId: undefined });
      expect(parseUrl('/po')).toEqual({ page: 'software', detailId: undefined });
      expect(parseUrl('/cad-cam')).toEqual({ page: 'software', detailId: undefined });
      expect(parseUrl('/software/topsolid-7')).toEqual({ page: 'software', detailId: 'topsolid-7' });
      expect(parseUrl('/po/geomagic-design-x')).toEqual({ page: 'software', detailId: 'geomagic-design-x' });
    });

    it('parses hardware routes and synonyms', () => {
      expect(parseUrl('/hardware')).toEqual({ page: 'hardware', detailId: undefined });
      expect(parseUrl('/equipment')).toEqual({ page: 'hardware', detailId: undefined });
      expect(parseUrl('/oborudovanie')).toEqual({ page: 'hardware', detailId: undefined });
      expect(parseUrl('/hardware/pmt-alpha-arm')).toEqual({ page: 'hardware', detailId: 'pmt-alpha-arm' });
      expect(parseUrl('/equipment/freescan-combo')).toEqual({ page: 'hardware', detailId: 'freescan-combo' });
    });

    it('parses services routes and synonyms', () => {
      expect(parseUrl('/services')).toEqual({ page: 'services', detailId: undefined });
      expect(parseUrl('/uslugi')).toEqual({ page: 'services', detailId: undefined });
      expect(parseUrl('/services/3d-scanning')).toEqual({ page: 'services', detailId: '3d-scanning' });
    });

    it('parses knowledge, news, about, contacts, account, crm, cms, sitemap', () => {
      expect(parseUrl('/about')).toEqual({ page: 'about' });
      expect(parseUrl('/about-us')).toEqual({ page: 'about' });
      expect(parseUrl('/company')).toEqual({ page: 'about' });

      expect(parseUrl('/knowledge')).toEqual({ page: 'knowledge', detailId: undefined });
      expect(parseUrl('/knowledge-base')).toEqual({ page: 'knowledge', detailId: undefined });
      expect(parseUrl('/baza-znaniy')).toEqual({ page: 'knowledge', detailId: undefined });
      expect(parseUrl('/knowledge/gost-r-53442')).toEqual({ page: 'knowledge', detailId: 'gost-r-53442' });

      expect(parseUrl('/news')).toEqual({ page: 'news', detailId: undefined });
      expect(parseUrl('/articles')).toEqual({ page: 'news', detailId: undefined });
      expect(parseUrl('/press')).toEqual({ page: 'news', detailId: undefined });
      expect(parseUrl('/news/release-2026')).toEqual({ page: 'news', detailId: 'release-2026' });

      expect(parseUrl('/contacts')).toEqual({ page: 'contacts' });
      expect(parseUrl('/contact')).toEqual({ page: 'contacts' });

      expect(parseUrl('/account')).toEqual({ page: 'account' });
      expect(parseUrl('/profile')).toEqual({ page: 'account' });
      expect(parseUrl('/lk')).toEqual({ page: 'account' });

      expect(parseUrl('/crm')).toEqual({ page: 'crm' });
      expect(parseUrl('/cms')).toEqual({ page: 'cms' });
      expect(parseUrl('/admin')).toEqual({ page: 'cms' });

      expect(parseUrl('/sitemap')).toEqual({ page: 'sitemap' });
      expect(parseUrl('/karta-sayta')).toEqual({ page: 'sitemap' });
      expect(parseUrl('/site-map')).toEqual({ page: 'sitemap' });
    });

    it('parses custom CMS pages /page/:slug', () => {
      expect(parseUrl('/page/privacy-policy')).toEqual({ page: 'custom-privacy-policy' });
      expect(parseUrl('/page/iso-certificates')).toEqual({ page: 'custom-iso-certificates' });
    });

    it('resolves direct product IDs in root segment', () => {
      const firstSoft = PRODUCTS_DATA.find(p => p.type === 'software');
      if (firstSoft) {
        expect(parseUrl(`/${firstSoft.id}`)).toEqual({
          page: 'software',
          detailId: firstSoft.id
        });
      }

      const firstHard = PRODUCTS_DATA.find(p => p.type === 'hardware');
      if (firstHard) {
        expect(parseUrl(`/${firstHard.id}`)).toEqual({
          page: 'hardware',
          detailId: firstHard.id
        });
      }
    });

    it('resolves direct service IDs in root segment', () => {
      const firstSrv = SERVICES_DATA[0];
      if (firstSrv) {
        expect(parseUrl(`/${firstSrv.id}`)).toEqual({
          page: 'services',
          detailId: firstSrv.id
        });
      }
    });

    it('resolves hash fragment navigation when pathname is root', () => {
      expect(parseUrl('/', '#software')).toEqual({ page: 'software' });
      expect(parseUrl('/main', '#hardware')).toEqual({ page: 'hardware' });
      expect(parseUrl('/home', '#calculator')).toEqual({ page: 'services', scrollTo: 'service-calculator' });
      expect(parseUrl('/', '#contacts')).toEqual({ page: 'contacts' });
      expect(parseUrl('/', '#about')).toEqual({ page: 'about' });
      expect(parseUrl('/', '#custom-gdpr')).toEqual({ page: 'custom-gdpr' });
    });

    it('returns notfound for unknown routes without valid hash', () => {
      expect(parseUrl('/random-unknown-endpoint-xyz')).toEqual({ page: 'notfound' });
      expect(parseUrl('/api-not-a-client-route')).toEqual({ page: 'notfound' });
    });
  });

  describe('parseCurrentLocation and updateBrowserUrl', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });

    it('parses current window.location pathname and hash', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/software/topsolid-7',
          hash: ''
        },
        writable: true,
      });

      const route = parseCurrentLocation();
      expect(route).toEqual({
        page: 'software',
        detailId: 'topsolid-7'
      });
    });

    it('calls pushState when updating browser URL', () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState');
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/main',
          hash: ''
        },
        writable: true,
      });

      updateBrowserUrl('software', 'topsolid-7', false);
      expect(pushStateSpy).toHaveBeenCalledWith(
        { page: 'software', detailId: 'topsolid-7' },
        '',
        '/software/topsolid-7'
      );
    });

    it('calls replaceState when replace argument is true', () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/main',
          hash: ''
        },
        writable: true,
      });

      updateBrowserUrl('hardware', 'pmt-arm', true);
      expect(replaceStateSpy).toHaveBeenCalledWith(
        { page: 'hardware', detailId: 'pmt-arm' },
        '',
        '/hardware/pmt-arm'
      );
    });

    it('does not invoke history API if currentPath matches targetPath', () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState');
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/software/topsolid-7',
          hash: ''
        },
        writable: true,
      });

      updateBrowserUrl('software', 'topsolid-7', false);
      expect(pushStateSpy).not.toHaveBeenCalled();
      expect(replaceStateSpy).not.toHaveBeenCalled();
    });
  });
});
