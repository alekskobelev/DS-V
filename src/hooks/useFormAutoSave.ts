import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseFormAutoSaveOptions<T> {
  formKey: string;
  formData: T;
  onRestore?: (savedData: T) => void;
  intervalMs?: number; // default 30000 (30 seconds)
  enabled?: boolean;
}

export interface UseFormAutoSaveReturn<T> {
  lastSavedAt: string | null;
  hasDraft: boolean;
  saveDraft: () => void;
  clearDraft: () => void;
  restoreDraft: () => T | null;
  statusText: string | null;
}

export function useFormAutoSave<T extends Record<string, any>>({
  formKey,
  formData,
  onRestore,
  intervalMs = 30000,
  enabled = true
}: UseFormAutoSaveOptions<T>): UseFormAutoSaveReturn<T> {
  const storageKey = `ds_crm_draft_${formKey}`;
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Check if draft exists on mount/formKey change
  useEffect(() => {
    if (!formKey || !enabled) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.data && parsed.timestamp) {
          setHasDraft(true);
          const date = new Date(parsed.timestamp);
          const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSavedAt(timeStr);
        }
      } else {
        setHasDraft(false);
      }
    } catch (e) {
      console.error('Error checking auto-save draft:', e);
    }
  }, [formKey, enabled, storageKey]);

  // Save draft logic
  const saveDraft = useCallback(() => {
    if (!formKey || !enabled) return;
    try {
      const currentData = formDataRef.current;
      if (!currentData || Object.keys(currentData).length === 0) return;

      const payload = {
        data: currentData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedAt(timeStr);
      setHasDraft(true);
      setStatusText(`Черновик сохранен в ${timeStr}`);

      // Reset status text after 3 seconds
      setTimeout(() => {
        setStatusText(null);
      }, 3000);
    } catch (e) {
      console.error('Error saving auto-save draft:', e);
    }
  }, [formKey, enabled, storageKey]);

  // Clear draft logic
  const clearDraft = useCallback(() => {
    if (!formKey) return;
    try {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
      setLastSavedAt(null);
      setStatusText(null);
    } catch (e) {
      console.error('Error clearing auto-save draft:', e);
    }
  }, [formKey, storageKey]);

  // Restore draft logic
  const restoreDraft = useCallback((): T | null => {
    if (!formKey) return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data) {
        if (onRestore) {
          onRestore(parsed.data);
        }
        setStatusText('Черновик восстановлен');
        setTimeout(() => setStatusText(null), 3000);
        return parsed.data;
      }
    } catch (e) {
      console.error('Error restoring draft:', e);
    }
    return null;
  }, [formKey, storageKey, onRestore]);

  // Interval timer (30 seconds)
  useEffect(() => {
    if (!enabled || !formKey) return;

    const timer = setInterval(() => {
      saveDraft();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [enabled, formKey, intervalMs, saveDraft]);

  // Save on window blur or page hide
  useEffect(() => {
    if (!enabled || !formKey) return;

    const handleWindowBlur = () => {
      saveDraft();
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleWindowBlur);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleWindowBlur);
    };
  }, [enabled, formKey, saveDraft]);

  return {
    lastSavedAt,
    hasDraft,
    saveDraft,
    clearDraft,
    restoreDraft,
    statusText
  };
}
