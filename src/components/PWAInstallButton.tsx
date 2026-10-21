import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const [showIOSGuide, setShowIOSGuide] = React.useState(false);

  let pwa;
  try {
    pwa = usePWAInstall();
  } catch (e) {
    console.warn('[PWAInstallButton] Unable to load PWA hook:', e);
    return null;
  }

  const { isInstallable, isInstalled, isIOS, install } = pwa;

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
      >
        <Download className="w-4 h-4" />
        Установить приложение
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-medium text-slate-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Установить на iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
              <button 
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-slate-500 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Установка на iPhone / iPad</h3>
              <p className="mt-4 text-sm text-slate-500 dark:text-gray-300 space-y-2">
                <span className="block">1. Нажмите кнопку <strong>Поделиться</strong> в панели Safari (квадрат со стрелкой вверх).</span>
                <span className="block">2. Прокрутите вниз и выберите <strong>На экран «Домой»</strong>.</span>
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
              >
                Понятно
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export default PWAInstallButton;

