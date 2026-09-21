import React, { useEffect } from 'react';

/**
 * Интеграция Яндекс.Метрики (ID: 112028524)
 * Активируется через переменную окружения VITE_YANDEX_METRICA_ID или ID по умолчанию.
 * Поддерживает инициализацию и виртуальные хиты при SPA-навигации.
 */
export const YandexMetrica: React.FC = () => {
  const metricaId = Number(import.meta.env.VITE_YANDEX_METRICA_ID || '112028524');

  useEffect(() => {
    // В режиме разработки, в тестовой песочнице Google Cloud Run или на localhost отключаем внешнюю метрику
    const isLocalOrSandbox = 
      import.meta.env.DEV || 
      typeof window === 'undefined' ||
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.run.app');

    if (!metricaId || isLocalOrSandbox) {
      return;
    }

    try {
      (function(m: any, e: any, t: any, r: any, i: any, k?: any, a?: any){
        m[i] = m[i] || function(...args: any[]){ (m[i].a = m[i].a || []).push(args); };
        m[i].l = 1 * (new Date() as any);
        for (let j = 0; j < e.scripts.length; j++) {
          if (e.scripts[j].src === r) { return; }
        }
        k = e.createElement(t);
        a = e.getElementsByTagName(t)[0];
        k.async = 1;
        k.src = r;
        k.onerror = () => {
          // Игнорируем сетевые ошибки блокировщиков рекламы и песочниц
        };
        a?.parentNode?.insertBefore(k, a);
      })(window, document, "script", `https://mc.yandex.ru/metrika/tag.js?id=${metricaId}`, "ym");

      if (typeof (window as any).ym === 'function') {
        (window as any).ym(metricaId, "init", {
          ssr: true,
          webvisor: true,
          clickmap: true,
          ecommerce: "dataLayer",
          referrer: document.referrer,
          url: location.href,
          accurateTrackBounce: true,
          trackLinks: true
        });
      }
    } catch (err) {
      console.warn('Yandex.Metrica initialization skipped:', err);
    }

    // SPA-хиты при смене hash/страниц
    const handleLocationChange = () => {
      if (typeof (window as any).ym === 'function' && metricaId) {
        try {
          (window as any).ym(metricaId, 'hit', window.location.href, {
            title: document.title,
            referrer: document.referrer
          });
        } catch {
          // Игнорируем возможные сетевые ограничения
        }
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [metricaId]);

  return null;
};


