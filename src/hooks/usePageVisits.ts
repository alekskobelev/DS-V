import { useState, useEffect, useCallback } from 'react';
import { PageVisitStat, PageId } from '../types';

const STORAGE_KEY = 'ds_engineering_page_visits_v2';

// Standard internal page meta
const STANDARD_PAGE_METADATA: Record<string, { title: string; category: PageVisitStat['category']; path: string }> = {
  home: { title: 'Главная страница', category: 'main', path: '/' },
  software: { title: 'Программное обеспечение', category: 'catalog', path: '/#software' },
  hardware: { title: 'Измерительное оборудование', category: 'catalog', path: '/#hardware' },
  services: { title: 'Услуги и инжиниринг', category: 'services', path: '/#services' },
  knowledge: { title: 'База знаний и ГОСТы', category: 'info', path: '/#knowledge' },
  news: { title: 'Новости', category: 'info', path: '/#news' },
  about: { title: 'О компании', category: 'info', path: '/#about' },
  contacts: { title: 'Контакты', category: 'info', path: '/#contacts' },
  account: { title: 'Личный кабинет', category: 'info', path: '/#account' },
};

const INITIAL_VISIT_STATS: PageVisitStat[] = [
  { pageId: 'home', title: 'Главная страница', category: 'main', path: '/', visitCount: 3240, lastVisited: new Date().toISOString(), firstVisited: '2026-01-15T08:00:00.000Z' },
  { pageId: 'software', title: 'Программное обеспечение', category: 'catalog', path: '/#software', visitCount: 2180, lastVisited: new Date(Date.now() - 1000 * 60 * 12).toISOString(), firstVisited: '2026-01-15T08:30:00.000Z' },
  { pageId: 'services', title: 'Услуги и инжиниринг', category: 'services', path: '/#services', visitCount: 1850, lastVisited: new Date(Date.now() - 1000 * 60 * 25).toISOString(), firstVisited: '2026-01-15T09:00:00.000Z' },
  { pageId: 'hardware', title: 'Измерительное оборудование', category: 'catalog', path: '/#hardware', visitCount: 1420, lastVisited: new Date(Date.now() - 1000 * 60 * 45).toISOString(), firstVisited: '2026-01-15T09:15:00.000Z' },
  { pageId: 'knowledge', title: 'База знаний и ГОСТы', category: 'info', path: '/#knowledge', visitCount: 950, lastVisited: new Date(Date.now() - 1000 * 60 * 120).toISOString(), firstVisited: '2026-01-16T10:00:00.000Z' },
  { pageId: 'news', title: 'Новости', category: 'info', path: '/#news', visitCount: 890, lastVisited: new Date(Date.now() - 1000 * 60 * 150).toISOString(), firstVisited: '2026-01-16T11:00:00.000Z' },
  { pageId: 'about', title: 'О компании', category: 'info', path: '/#about', visitCount: 720, lastVisited: new Date(Date.now() - 1000 * 60 * 180).toISOString(), firstVisited: '2026-01-16T12:00:00.000Z' },
  { pageId: 'contacts', title: 'Контакты', category: 'info', path: '/#contacts', visitCount: 650, lastVisited: new Date(Date.now() - 1000 * 60 * 200).toISOString(), firstVisited: '2026-01-16T13:00:00.000Z' },
  { pageId: 'account', title: 'Личный кабинет', category: 'info', path: '/#account', visitCount: 420, lastVisited: new Date(Date.now() - 1000 * 60 * 300).toISOString(), firstVisited: '2026-01-17T09:00:00.000Z' },
];

/**
 * Custom React hook that logs page visit frequency to local storage
 * and calculates frequency metrics and ranking for CMS / Analytics.
 */
export function usePageVisits(autoLogPageId?: PageId | string, pageTitle?: string) {
  const [stats, setStats] = useState<PageVisitStat[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read page visit stats from localStorage', e);
    }
    return INITIAL_VISIT_STATS;
  });

  // Save to localStorage when stats update
  const persistStats = useCallback((updated: PageVisitStat[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save page visit stats to localStorage', e);
    }
  }, []);

  // Method to log/increment page visit
  const logVisit = useCallback(
    (pageId: string, customTitle?: string, category?: PageVisitStat['category']) => {
      if (!pageId) return;

      setStats((prevStats) => {
        const meta = STANDARD_PAGE_METADATA[pageId] || {
          title: customTitle || (pageId.startsWith('custom-') ? `Страница ${pageId.replace('custom-', '')}` : pageId),
          category: category || (pageId.startsWith('custom-') ? 'custom' : 'main'),
          path: `/#${pageId}`,
        };

        const existingIndex = prevStats.findIndex((item) => item.pageId === pageId);
        const nowIso = new Date().toISOString();

        let updated: PageVisitStat[];
        if (existingIndex >= 0) {
          updated = [...prevStats];
          const existing = updated[existingIndex];
          updated[existingIndex] = {
            ...existing,
            title: customTitle || existing.title || meta.title,
            visitCount: existing.visitCount + 1,
            lastVisited: nowIso,
          };
        } else {
          const newStat: PageVisitStat = {
            pageId,
            title: customTitle || meta.title,
            category: category || meta.category,
            path: meta.path,
            visitCount: 1,
            lastVisited: nowIso,
            firstVisited: nowIso,
          };
          updated = [...prevStats, newStat];
        }

        // Sort descending by visitCount
        updated.sort((a, b) => b.visitCount - a.visitCount);
        persistStats(updated);
        return updated;
      });
    },
    [persistStats]
  );

  // Auto-log whenever active pageId changes
  useEffect(() => {
    if (autoLogPageId) {
      logVisit(autoLogPageId, pageTitle);
    }
  }, [autoLogPageId, pageTitle, logVisit]);

  // Reset all visit stats
  const resetVisits = useCallback(() => {
    const resetData = INITIAL_VISIT_STATS.map((s) => ({
      ...s,
      visitCount: 0,
      lastVisited: new Date().toISOString(),
    }));
    setStats(resetData);
    persistStats(resetData);
  }, [persistStats]);

  // Total visits calculation
  const totalVisits = stats.reduce((acc, curr) => acc + curr.visitCount, 0);

  // Sorted list of pages
  const sortedPages = [...stats].sort((a, b) => b.visitCount - a.visitCount);

  // Most visited page
  const mostVisitedPage = sortedPages[0] || null;

  // Export as formatted JSON
  const exportVisitsJSON = useCallback(() => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalVisits,
        pagesCount: stats.length,
        data: sortedPages,
      },
      null,
      2
    );
  }, [stats, sortedPages, totalVisits]);

  return {
    pageVisits: sortedPages,
    totalVisits,
    mostVisitedPage,
    logVisit,
    resetVisits,
    exportVisitsJSON,
  };
}
