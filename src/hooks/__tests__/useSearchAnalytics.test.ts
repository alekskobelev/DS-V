import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useSearchAnalytics, 
  sendYandexMetricaEvent, 
  logSearchAnalyticsEvent,
  getSearchAnalyticsLogs,
  clearSearchAnalyticsLogs,
  DEFAULT_YANDEX_METRICA_ID 
} from '../useSearchAnalytics';

describe('useSearchAnalytics Hook & Yandex Metrika Integration', () => {
  let mockYm: any;

  beforeEach(() => {
    vi.useFakeTimers();
    clearSearchAnalyticsLogs();
    mockYm = vi.fn();
    (window as any).ym = mockYm;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as any).ym;
  });

  it('should send events to Yandex.Metrika with reachGoal and params', () => {
    const success = sendYandexMetricaEvent(DEFAULT_YANDEX_METRICA_ID, 'test_goal', { query: 'TopSolid' });
    expect(success).toBe(true);
    expect(mockYm).toHaveBeenCalledWith(DEFAULT_YANDEX_METRICA_ID, 'reachGoal', 'test_goal', { query: 'TopSolid' });
    expect(mockYm).toHaveBeenCalledWith(DEFAULT_YANDEX_METRICA_ID, 'params', {
      search_event: {
        action: 'test_goal',
        query: 'TopSolid',
      },
    });
  });

  it('should handle missing window.ym gracefully without throwing', () => {
    delete (window as any).ym;
    const success = sendYandexMetricaEvent(DEFAULT_YANDEX_METRICA_ID, 'test_goal', { query: 'PMT' });
    expect(success).toBe(false);
  });

  it('should track manual search query execution', () => {
    const onTrack = vi.fn();
    const { result } = renderHook(() => useSearchAnalytics({ onTrack }));

    act(() => {
      result.current.trackSearch('FreeScan UE', 5, 'hardware', 'enter');
    });

    expect(result.current.lastTrackedQuery).toBe('FreeScan UE');
    expect(onTrack).toHaveBeenCalledTimes(1);
    expect(onTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'search_query',
        params: expect.objectContaining({
          query: 'FreeScan UE',
          resultsCount: 5,
          filter: 'hardware',
          trigger: 'enter',
        }),
      })
    );

    expect(mockYm).toHaveBeenCalledWith(
      DEFAULT_YANDEX_METRICA_ID,
      'reachGoal',
      'search_query',
      expect.objectContaining({ query: 'FreeScan UE', resultsCount: 5 })
    );
    expect(mockYm).toHaveBeenCalledWith(
      DEFAULT_YANDEX_METRICA_ID,
      'reachGoal',
      'SEARCH_QUERY',
      expect.objectContaining({ query: 'FreeScan UE', resultsCount: 5 })
    );
  });

  it('should debounce search queries when typing', () => {
    const onTrack = vi.fn();
    const { result } = renderHook(() => useSearchAnalytics({ onTrack, debounceMs: 400 }));

    act(() => {
      result.current.trackSearchDebounced('Pol', 2, 'software');
      result.current.trackSearchDebounced('Poly', 2, 'software');
      result.current.trackSearchDebounced('PolyWorks', 2, 'software');
    });

    // Before timer fires, no event should be emitted
    expect(onTrack).not.toHaveBeenCalled();

    // Fast-forward timers
    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(onTrack).toHaveBeenCalledTimes(1);
    expect(onTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'search_query',
        params: expect.objectContaining({
          query: 'PolyWorks',
          resultsCount: 2,
          filter: 'software',
          trigger: 'debounce',
        }),
      })
    );
  });

  it('should track search result click with position and item metadata', () => {
    const onTrack = vi.fn();
    const { result } = renderHook(() => useSearchAnalytics({ onTrack }));

    act(() => {
      result.current.trackSearchResultClick(
        { id: 'topsolid-7', name: 'TopSolid 7 CAM', type: 'software' },
        'topsolid',
        0,
        'software'
      );
    });

    expect(onTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'search_result_click',
        params: expect.objectContaining({
          query: 'topsolid',
          itemId: 'topsolid-7',
          itemName: 'TopSolid 7 CAM',
          itemType: 'software',
          position: 0,
          filter: 'software',
        }),
      })
    );
  });

  it('should track filter changes and search clear events', () => {
    const onTrack = vi.fn();
    const { result } = renderHook(() => useSearchAnalytics({ onTrack }));

    act(() => {
      result.current.trackSearchFilterChange('services', '3D сканирование');
    });

    expect(onTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'search_filter_changed',
        params: expect.objectContaining({
          filter: 'services',
          query: '3D сканирование',
        }),
      })
    );

    act(() => {
      result.current.trackSearchCleared('3D сканирование');
    });

    expect(onTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'search_cleared',
        params: expect.objectContaining({
          query: '3D сканирование',
        }),
      })
    );
  });

  it('should persist search events in local analytics log for audit', () => {
    logSearchAnalyticsEvent({
      action: 'search_query',
      params: { query: 'Renishaw', filter: 'hardware' },
      timestamp: new Date().toISOString(),
    });

    const logs = getSearchAnalyticsLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].params.query).toBe('Renishaw');

    clearSearchAnalyticsLogs();
    expect(getSearchAnalyticsLogs().length).toBe(0);
  });
});
