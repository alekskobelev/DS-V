import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import { runSystemHealthCheck, checkAllApiEndpoints } from './services/healthCheckService.ts';

console.log('[BOOT] [1/5] src/main.tsx module loaded');

// Mount React immediately
const rootElement = document.getElementById('root');
console.log('[BOOT] [2/5] #root element check:', rootElement ? 'FOUND' : 'NOT FOUND');

if (rootElement) {
  try {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  } catch (_e) {}

  console.log('[BOOT] [3/5] Creating React root & rendering App...');
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
  console.log('[BOOT] [4/5] root.render() executed');

  try {
    (window as any).__APP_MOUNTED__ = true;
    (window as any).__DS_APP_MOUNT_TIME__ = Date.now();
  } catch (_e) {}
} else {
  console.error('[BOOT] [CRITICAL] #root element missing in document body!');
}

// Global safety handler for benign sandbox / iframe warnings
try {
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
} catch (_e) {}

// Background non-blocking service cleanup and healthcheck
try {
  if (import.meta.env.DEV && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations?.().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
} catch (_e) {}

// Async non-blocking background health check & API endpoint availability audit
setTimeout(() => {
  try {
    runSystemHealthCheck().catch(() => {});
    checkAllApiEndpoints().catch(() => {});
  } catch (_e) {}
}, 2000);


