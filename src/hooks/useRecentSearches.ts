import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ds_recent_searches';
const MAX_RECENT_ITEMS = 3;

export function useRecentSearches(customKey = STORAGE_KEY, maxItems = MAX_RECENT_ITEMS) {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(customKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, maxItems);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    return [];
  });

  // Sync from localStorage if updated elsewhere
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === customKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.slice(0, maxItems));
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [customKey, maxItems]);

  const addRecentSearch = useCallback(
    (query: string) => {
      const clean = query.trim();
      if (!clean || clean.length < 2) return;

      setRecentSearches((prev) => {
        // Remove existing duplicate (case-insensitive) and prepend new query
        const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
        const updated = [clean, ...filtered].slice(0, maxItems);
        try {
          localStorage.setItem(customKey, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save recent search to localStorage', e);
        }
        return updated;
      });
    },
    [customKey, maxItems]
  );

  const removeRecentSearch = useCallback(
    (queryToRemove: string) => {
      setRecentSearches((prev) => {
        const updated = prev.filter((item) => item.toLowerCase() !== queryToRemove.toLowerCase());
        try {
          localStorage.setItem(customKey, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to remove recent search from localStorage', e);
        }
        return updated;
      });
    },
    [customKey]
  );

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(customKey);
    } catch (e) {
      console.error('Failed to clear recent searches from localStorage', e);
    }
  }, [customKey]);

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}
