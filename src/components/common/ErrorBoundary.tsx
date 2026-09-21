import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Phone, Mail, ChevronDown, ChevronUp, Wrench } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  isCheckingApi: boolean;
  apiStatus: string | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    isCheckingApi: false,
    apiStatus: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
      isCheckingApi: false,
      apiStatus: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[DS-HealthMonitor] ErrorBoundary caught runtime exception:', error, errorInfo);
    
    // Automatically perform a quick backend health ping for diagnostics
    this.checkBackendHealth();
  }

  checkBackendHealth = async () => {
    this.setState({ isCheckingApi: true });
    try {
      const startTime = performance.now();
      const res = await fetch('/api/health', { method: 'GET', cache: 'no-store' });
      const elapsed = Math.round(performance.now() - startTime);
      if (res.ok) {
        const data = await res.json();
        this.setState({
          isCheckingApi: false,
          apiStatus: `Сервер доступен (HTTP ${res.status}, ${elapsed}мс, БД: ${data.storageBackend || 'OK'})`,
        });
      } else {
        this.setState({
          isCheckingApi: false,
          apiStatus: `Сервер вернул статус HTTP ${res.status}`,
        });
      }
    } catch (err) {
      this.setState({
        isCheckingApi: false,
        apiStatus: `Сервер недоступен (${err instanceof Error ? err.message : 'Сетевой сбой'})`,
      });
    }
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleClearCacheAndReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
      sessionStorage.clear();
    } catch (e) {
      console.warn('Cache clear error:', e);
    }
    window.location.href = '/main';
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.history.pushState(null, '', '/main');
    window.location.href = '/main';
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-xl w-full bg-slate-800/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-xs">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white tracking-tight">«ДС-Инжиниринг»</h1>
                  <p className="text-xs text-slate-400 font-mono">Монитор стабильности системы</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Техническое обслуживание
              </span>
            </div>

            {/* Notification message */}
            <div className="space-y-2 text-left">
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                Сервис восстанавливает рабочее состояние
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Инженерный портал зафиксировал сбой при отрисовке интерфейса. Выполняется автоматическая диагностика модулей. Пожалуйста, обновите страницу или перейдите на главную.
              </p>
            </div>

            {/* Health status bar */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/70 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-slate-400">Статус бэкенда:</span>
                <span className="text-slate-200 font-mono text-[11px]">
                  {this.state.isCheckingApi ? 'Опрос API...' : (this.state.apiStatus || 'Проверка подключения...')}
                </span>
              </div>
              <button
                type="button"
                onClick={this.checkBackendHealth}
                className="text-blue-400 hover:text-blue-300 text-[11px] font-medium underline underline-offset-2 ml-2 transition-colors cursor-pointer"
              >
                Повторить тест
              </button>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-medium rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Перезагрузить страницу</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 active:scale-[0.98] text-slate-200 font-medium rounded-xl text-xs sm:text-sm transition-all border border-slate-600/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>На главную страницу</span>
              </button>
            </div>

            {/* Quick Cache Reset Action */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 transition-colors cursor-pointer"
              >
                Очистить кэш модулей и перезагрузить
              </button>
            </div>

            {/* Diagnostics collapsible */}
            <div className="border-t border-slate-700/60 pt-3">
              <button
                type="button"
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-300 py-1 transition-colors cursor-pointer"
              >
                <span className="font-mono text-[11px]">Технический журнал диагностики</span>
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-3 bg-slate-950/90 rounded-lg text-left text-xs font-mono text-rose-300 border border-slate-800 space-y-2 overflow-x-auto max-h-44">
                  <div>
                    <span className="text-slate-500">Ошибка: </span>
                    <span>{this.state.error?.message || String(this.state.error)}</span>
                  </div>
                  {this.state.error?.stack && (
                    <div className="text-[11px] text-slate-400 whitespace-pre-wrap leading-tight">
                      {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div className="text-[10px] text-slate-500 whitespace-pre-wrap leading-tight">
                      <span className="text-slate-600">Стек компонентов:</span>
                      {this.state.errorInfo.componentStack.split('\n').slice(0, 4).join('\n')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Emergency Contacts Footer */}
            <div className="border-t border-slate-700/60 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <a href="tel:+78469540292" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>+7 (846) 954-02-92</span>
              </a>
              <a href="mailto:info@ds-enginering.ru" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>info@ds-enginering.ru</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}



