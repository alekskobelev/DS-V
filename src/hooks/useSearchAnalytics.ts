import { useEffect, useRef, useCallback, useState } from 'react';

export const DEFAULT_YANDEX_METRICA_ID = 112028524;

export interface SearchAnalyticsParams {
  query: string;
  resultsCount?: number;
  filter?: string;
  trigger?: 'enter' | 'click' | 'debounce' | 'suggest' | 'manual';
  position?: number;
  itemId?: string;
  itemName?: string;
  itemType?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface SearchAnalyticsEvent {
  action: 'search_query' | 'search_result_click' | 'search_cleared' | 'search_filter_changed';
  params: SearchAnalyticsParams;
  timestamp: string;
}

export interface UseSearchAnalyticsOptions {
  /**
   * Идентификатор счетчика Яндекс.Метрики (по умолчанию из VITE_YANDEX_METRICA_ID или 112028524)
   */
  counterId?: number | string;
  /**
   * Минимальная длина поискового запроса для автоматического трекинга
   * @default 2
   */
  minQueryLength?: number;
  /**
   * Время дебаунса для автоматической отправки при вводе (мс)
   * @default 600
   */
  debounceMs?: number;
  /**
   * Включен ли трекинг
   * @default true
   */
  enabled?: boolean;
  /**
   * Колбэк при отправке события аналитики (для тестов или отладки)
   */
  onTrack?: (event: SearchAnalyticsEvent) => void;
}

const LOCAL_STORAGE_ANALYTICS_KEY = 'ds_search_analytics_log_v1';
const MAX_LOGGED_EVENTS = 50;

/**
 * Безопасный вызов Яндекс.Метрики с передачей параметров цели и визита
 */
export function sendYandexMetricaEvent(
  counterId: number,
  action: string,
  params: Record<string, any>
): boolean {
  if (typeof window === 'undefined') return false;

  const win = window as any;
  if (typeof win.ym === 'function') {
    try {
      // 1. Отправка цели (reachGoal)
      win.ym(counterId, 'reachGoal', action, params);

      // 2. Отправка параметров визита (params)
      win.ym(counterId, 'params', {
        search_event: {
          action,
          ...params,
        },
      });

      return true;
    } catch (err) {
      console.warn(`[SearchAnalytics] Ошибка отправки события в Яндекс.Метрику (ID: ${counterId}):`, err);
      return false;
    }
  }

  return false;
}

/**
 * Сохраняет последние события поиска в локальный лог (для CRM / CMS аудита)
 */
export function logSearchAnalyticsEvent(event: SearchAnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ANALYTICS_KEY);
    const list: SearchAnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    list.unshift(event);
    if (list.length > MAX_LOGGED_EVENTS) {
      list.length = MAX_LOGGED_EVENTS;
    }
    localStorage.setItem(LOCAL_STORAGE_ANALYTICS_KEY, JSON.stringify(list));
  } catch {
    // Игнорируем ошибки квоты localStorage
  }
}

/**
 * Получить историю зарегистрированных событий поиска
 */
export function getSearchAnalyticsLogs(): SearchAnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ANALYTICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Очистить локальный лог событий поиска
 */
export function clearSearchAnalyticsLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_ANALYTICS_KEY);
  } catch {
    // ignore
  }
}

/**
 * Хук `useSearchAnalytics` для интеграции поисковой активности пользователей с Яндекс.Метрикой.
 * 
 * Отслеживает:
 * - Поисковые запросы (`search_query` / `SEARCH_QUERY`)
 * - Переходы по результатам поиска (`search_result_click` / `SEARCH_CLICK`)
 * - Переключение категорийных фильтров поиска (`search_filter_changed`)
 * - Очистку строки поиска (`search_cleared`)
 */
export function useSearchAnalytics(options: UseSearchAnalyticsOptions = {}) {
  const {
    counterId = Number(import.meta.env.VITE_YANDEX_METRICA_ID || DEFAULT_YANDEX_METRICA_ID),
    minQueryLength = 2,
    debounceMs = 600,
    enabled = true,
    onTrack,
  } = options;

  const numericCounterId = Number(counterId) || DEFAULT_YANDEX_METRICA_ID;
  const [lastTrackedQuery, setLastTrackedQuery] = useState<string | null>(null);
  const [isMetricaLoaded, setIsMetricaLoaded] = useState<boolean>(() => {
    return typeof window !== 'undefined' && typeof (window as any).ym === 'function';
  });

  const lastSentQueryRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Проверка готовности window.ym
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof (window as any).ym === 'function') {
      setIsMetricaLoaded(true);
    } else {
      const interval = setInterval(() => {
        if (typeof (window as any).ym === 'function') {
          setIsMetricaLoaded(true);
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  /**
   * Отправка произвольного события
   */
  const emitEvent = useCallback(
    (action: SearchAnalyticsEvent['action'], params: SearchAnalyticsParams) => {
      if (!enabled) return;

      const event: SearchAnalyticsEvent = {
        action,
        params: {
          ...params,
          timestamp: params.timestamp || new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      // 1. Отправка в Яндекс.Метрику
      sendYandexMetricaEvent(numericCounterId, action, event.params);

      // 2. Дублирование с верхнеуровневым стандартизированным именем цели (ГОСТ/Метрика)
      const uppercaseAction = action.toUpperCase();
      sendYandexMetricaEvent(numericCounterId, uppercaseAction, event.params);

      // 3. Локальный аудит
      logSearchAnalyticsEvent(event);

      // 4. Колбэк
      if (onTrack) {
        try {
          onTrack(event);
        } catch (e) {
          console.error('[SearchAnalytics] Ошибка в onTrack колбэке:', e);
        }
      }
    },
    [enabled, numericCounterId, onTrack]
  );

  /**
   * Фиксация выполненного поискового запроса
   */
  const trackSearch = useCallback(
    (
      query: string,
      resultsCount?: number,
      filter: string = 'all',
      trigger: SearchAnalyticsParams['trigger'] = 'manual',
      metadata?: Record<string, any>
    ) => {
      const clean = (query || '').trim();
      if (!clean || clean.length < minQueryLength) return;

      // Избегаем повторной отправки одинакового запроса подряд
      if (lastSentQueryRef.current.toLowerCase() === clean.toLowerCase() && trigger === 'debounce') {
        return;
      }

      lastSentQueryRef.current = clean;
      setLastTrackedQuery(clean);

      emitEvent('search_query', {
        query: clean,
        resultsCount,
        filter,
        trigger,
        metadata,
      });
    },
    [minQueryLength, emitEvent]
  );

  /**
   * Дебаунс-трекинг при вводе текста пользователем в поисковую строку
   */
  const trackSearchDebounced = useCallback(
    (query: string, resultsCount?: number, filter: string = 'all') => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const clean = (query || '').trim();
      if (!clean || clean.length < minQueryLength) return;

      debounceTimerRef.current = setTimeout(() => {
        trackSearch(clean, resultsCount, filter, 'debounce');
      }, debounceMs);
    },
    [debounceMs, minQueryLength, trackSearch]
  );

  /**
   * Трекинг клика по найденному элементу в выдаче (товару, услуге, странице)
   */
  const trackSearchResultClick = useCallback(
    (
      item: { id: string; name: string; type?: string },
      query: string,
      position?: number,
      filter: string = 'all'
    ) => {
      const clean = (query || '').trim();
      emitEvent('search_result_click', {
        query: clean,
        itemId: item.id,
        itemName: item.name,
        itemType: item.type || 'unknown',
        position,
        filter,
        trigger: 'click',
      });
    },
    [emitEvent]
  );

  /**
   * Трекинг смены категорийного фильтра
   */
  const trackSearchFilterChange = useCallback(
    (newFilter: string, currentQuery: string = '') => {
      emitEvent('search_filter_changed', {
        query: (currentQuery || '').trim(),
        filter: newFilter,
        trigger: 'click',
      });
    },
    [emitEvent]
  );

  /**
   * Трекинг очистки строки поиска
   */
  const trackSearchCleared = useCallback(
    (previousQuery: string = '') => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      lastSentQueryRef.current = '';
      const clean = (previousQuery || '').trim();
      if (clean) {
        emitEvent('search_cleared', {
          query: clean,
          trigger: 'click',
        });
      }
    },
    [emitEvent]
  );

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    counterId: numericCounterId,
    isMetricaLoaded,
    lastTrackedQuery,
    trackSearch,
    trackSearchDebounced,
    trackSearchResultClick,
    trackSearchFilterChange,
    trackSearchCleared,
  };
}

export default useSearchAnalytics;
