import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import { runSystemHealthCheck } from './services/healthCheckService.ts';

// Globally suppress ResizeObserver, benign sandbox WebSocket, and transient fetch errors
const suppressBenignErrors = () => {
  const isBenign = (msg: string) => {
    return (
      msg.includes('ResizeObserver') ||
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('Failed to fetch') ||
      msg.includes('Network request failed') ||
      msg.includes('NetworkError') ||
      msg.includes('mc.yandex.ru')
    );
  };

  window.addEventListener('error', (e) => {
    const message = e.message || e.error?.message || '';
    if (isBenign(message)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reasonStr = e.reason?.message || String(e.reason || '');
    if (isBenign(reasonStr)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });

  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    const fullMsg = String(message || '') + ' ' + String(error?.message || '');
    if (isBenign(fullMsg)) {
      return true;
    }
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };
};
suppressBenignErrors();

// In development, unregister any stale service worker and clear caches to prevent chunk desync
if (import.meta.env.DEV && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
  if ('caches' in window) {
    caches.keys().then((keys) => {
      for (const key of keys) {
        caches.delete(key);
      }
    });
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );

  // Mark application bundle as mounted successfully for the index.html health monitor
  (window as any).__APP_MOUNTED__ = true;
  (window as any).__DS_APP_MOUNT_TIME__ = Date.now();

  // Run async health check in background
  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => {
      runSystemHealthCheck().catch(() => {});
    });
  } else {
    setTimeout(() => {
      runSystemHealthCheck().catch(() => {});
    }, 1000);
  }
}

