import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Server,
  Zap,
  ShieldCheck,
  Send,
  MessageSquare,
  Database,
  HardDrive,
  Mail,
  Search,
  Download,
  Terminal,
  ExternalLink,
  Laptop,
  Check,
  Globe,
  Sliders,
  Play
} from 'lucide-react';
import {
  runSystemHealthCheck,
  checkAllApiEndpoints,
  checkThirdPartyServices,
  SystemHealthReport,
  ApiEndpointCheckResult,
  ThirdPartyServiceCheckResult
} from '../../services/healthCheckService';
import { useApp } from '../../context/AppContext';

export const ApiHealthDashboardTab: React.FC = () => {
  const { showToast } = useApp();
  const [systemReport, setSystemReport] = useState<SystemHealthReport | null>(null);
  const [endpointResults, setEndpointResults] = useState<ApiEndpointCheckResult[]>([]);
  const [thirdPartyResults, setThirdPartyResults] = useState<ThirdPartyServiceCheckResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastScanTimestamp, setLastScanTimestamp] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ok' | 'issues'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(15);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const runAllDiagnostics = useCallback(async () => {
    setIsLoading(true);
    try {
      const [healthReport, endpoints, thirdParty] = await Promise.all([
        runSystemHealthCheck(),
        checkAllApiEndpoints(),
        checkThirdPartyServices(),
      ]);

      setSystemReport(healthReport);
      setEndpointResults(endpoints);
      setThirdPartyResults(thirdParty);
      setLastScanTimestamp(new Date().toLocaleTimeString('ru-RU'));
      setRefreshCountdown(15);
    } catch (err) {
      console.error('[ApiHealthDashboard] Diagnostic scan failed:', err);
      showToast('Сбой выполнения диагностики API и сервисов');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    runAllDiagnostics();
  }, [runAllDiagnostics]);

  // Auto-refresh timer loop
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          runAllDiagnostics();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, runAllDiagnostics]);

  const handleTestSingleEndpoint = async (endpoint: string, name: string) => {
    setTestingEndpoint(endpoint);
    try {
      const startTime = performance.now();
      const res = await fetch(endpoint, { cache: 'no-store' });
      const latency = Math.round(performance.now() - startTime);

      setEndpointResults((prev) =>
        prev.map((item) =>
          item.endpoint === endpoint
            ? {
                ...item,
                status: res.status,
                ok: res.ok,
                latencyMs: latency,
                error: res.ok ? undefined : `HTTP ${res.status}`,
              }
            : item
        )
      );
      showToast(`Проверка ${name}: ${res.ok ? '✅ Доступен' : '❌ Ошибка ' + res.status} (${latency} мс)`);
    } catch (err) {
      showToast(`Сбой сети при запросе ${name}`);
    } finally {
      setTestingEndpoint(null);
    }
  };

  const handleExportHealthReportJson = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      systemReport,
      thirdPartyServices: thirdPartyResults,
      apiEndpoints: endpointResults,
      summary: {
        totalEndpoints: endpointResults.length,
        operationalEndpoints: endpointResults.filter((e) => e.ok).length,
        failedEndpoints: endpointResults.filter((e) => !e.ok).length,
        avgLatencyMs: Math.round(
          endpointResults.reduce((acc, e) => acc + e.latencyMs, 0) / (endpointResults.length || 1)
        ),
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-health-report-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Полный отчёт диагностики экпортирован в JSON!');
  };

  // Calculations
  const totalEndpointsCount = endpointResults.length;
  const okEndpointsCount = endpointResults.filter((e) => e.ok).length;
  const failedEndpointsCount = totalEndpointsCount - okEndpointsCount;
  const avgLatency = Math.round(
    endpointResults.reduce((sum, e) => sum + e.latencyMs, 0) / (totalEndpointsCount || 1)
  );

  const fastEndpointsCount = endpointResults.filter((e) => e.ok && e.latencyMs < 60).length;
  const normalEndpointsCount = endpointResults.filter((e) => e.ok && e.latencyMs >= 60 && e.latencyMs < 180).length;
  const slowEndpointsCount = endpointResults.filter((e) => e.ok && e.latencyMs >= 180).length;

  const isOverallHealthy = failedEndpointsCount === 0 && systemReport?.status === 'healthy';

  const getLatencyTier = (latencyMs: number, ok: boolean) => {
    if (!ok) {
      return {
        label: 'Сбой сети',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        barColor: 'bg-rose-500',
        dotColor: 'bg-rose-500',
        ringColor: 'ring-rose-200/80',
        speedIcon: '❌',
        quality: 'Недоступен',
      };
    }
    if (latencyMs < 60) {
      return {
        label: 'Мгновенно (<60мс)',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        barColor: 'bg-emerald-500',
        dotColor: 'bg-emerald-500',
        ringColor: 'ring-emerald-200/80',
        speedIcon: '⚡',
        quality: 'Отлично',
      };
    }
    if (latencyMs < 180) {
      return {
        label: 'Норма (60–180мс)',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        barColor: 'bg-blue-500',
        dotColor: 'bg-blue-500',
        ringColor: 'ring-blue-200/80',
        speedIcon: '🚀',
        quality: 'Норма',
      };
    }
    return {
      label: 'Замедлен (>180мс)',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      barColor: 'bg-amber-500',
      dotColor: 'bg-amber-500',
      ringColor: 'ring-amber-200/80',
      speedIcon: '⚠️',
      quality: 'Задержка',
    };
  };

  const filteredEndpoints = endpointResults.filter((e) => {
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'ok'
        ? e.ok
        : !e.ok;

    const matchesQuery =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.endpoint.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Real-Time Health Monitoring System</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <span>Панель мониторинга API и внешних сервисов</span>
              {isOverallHealthy ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Все системы работают нормально
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Обнаружены предупреждения ({failedEndpointsCount})
                </span>
              )}
            </h2>
            <p className="text-blue-100/80 text-xs max-w-3xl leading-relaxed">
              Непрерывный контроль состояния REST API, времени отклика, доступности базы данных PostgreSQL, NAS-хранилища 
              и интеграций с внешними сервисами (DaData, Telegram Bot, МАКС Мессенджер, SMTP) на основе диагностик <code className="text-blue-300 font-mono">healthCheckService</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                autoRefreshEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/20'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {autoRefreshEnabled ? `Автообновление (${refreshCountdown}с)` : 'Автообновление выкл.'}
              </span>
            </button>

            <button
              onClick={runAllDiagnostics}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Сканирование...' : 'Запустить сканирование'}</span>
            </button>

            <button
              onClick={handleExportHealthReportJson}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-blue-300" />
              <span>Экспорт JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>REST API Эндпоинты</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-2">
            <span>{okEndpointsCount} / {totalEndpointsCount}</span>
            <span className="text-xs font-semibold text-emerald-600">
              {Math.round((okEndpointsCount / (totalEndpointsCount || 1)) * 100)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {failedEndpointsCount === 0 ? 'Все эндпоинты отвечают 200 OK' : `Сбоев: ${failedEndpointsCount}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Интеграции и Сервисы</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-2">
            <span>{thirdPartyResults.filter((t) => t.status === 'operational').length} / {thirdPartyResults.length}</span>
            <span className="text-xs font-semibold text-blue-600">Активны</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            DaData, Telegram, МАКС, СУБД, NAS, SMTP
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Средняя задержка (Latency)</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-1.5">
            <span>{avgLatency}</span>
            <span className="text-xs font-semibold text-slate-500">мс</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Высокая скорость отклика
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Клиентская среда</span>
            <Laptop className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate mt-1">
            WebGL {systemReport?.client.webglSupported ? '✅ 3D OK' : '❌ Нет'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {systemReport?.client.screenWidth}×{systemReport?.client.screenHeight} px (DPR {systemReport?.client.dpr})
          </p>
        </div>
      </div>

      {/* SECTION 1: Third-Party & Infrastructure Integration Status */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Статус внешних сервисов и интеграций (DaData, Telegram, МАКС, СУБД)
              </h3>
              <p className="text-xs text-slate-500">
                Мониторинг сетевых шлюзов, API-токенов и каналов мгновенных оповещений
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Обновлено: {lastScanTimestamp || 'загрузка...'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {thirdPartyResults.map((service) => {
            const isOp = service.status === 'operational';
            const isNotConfig = service.status === 'not_configured';
            const tier = getLatencyTier(service.latencyMs, isOp || isNotConfig);
            const progressPercent = Math.min(100, Math.max(8, (service.latencyMs / 300) * 100));

            return (
              <div
                key={service.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between gap-3 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center justify-center">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isOp ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-pulse' : isNotConfig ? 'bg-blue-400 ring-4 ring-blue-100' : 'bg-amber-500 ring-4 ring-amber-100'
                          }`}
                        />
                      </div>
                      {service.id === 'dadata' && <Search className="w-4 h-4 text-purple-600 ml-1" />}
                      {service.id === 'telegram' && <Send className="w-4 h-4 text-sky-500 ml-1" />}
                      {service.id === 'max' && <MessageSquare className="w-4 h-4 text-emerald-600 ml-1" />}
                      {service.id === 'postgres' && <Database className="w-4 h-4 text-blue-600 ml-1" />}
                      {service.id === 'nas' && <HardDrive className="w-4 h-4 text-indigo-600 ml-1" />}
                      {service.id === 'smtp' && <Mail className="w-4 h-4 text-amber-600 ml-1" />}
                      <span className="font-bold text-slate-900 text-xs truncate">{service.name}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1 ${
                        isOp
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isNotConfig
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {isOp ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      {isOp ? 'Работает' : isNotConfig ? 'Не настроен' : 'Предупреждение'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                    {service.details}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-500 flex items-center gap-1">
                      <span>{tier.speedIcon}</span>
                      <span>Отклик:</span>
                      <strong className="text-slate-800">{service.latencyMs} мс</strong>
                    </span>
                    {service.endpoint && (
                      <span className="text-slate-400 font-mono text-[10px] truncate max-w-[130px]" title={service.endpoint}>
                        {service.endpoint.replace('https://', '')}
                      </span>
                    )}
                  </div>
                  {/* Visual Response Time Progress Bar */}
                  <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${tier.barColor}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: REST API Endpoints Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Матрица доступности REST API эндпоинтов ({okEndpointsCount} из {totalEndpointsCount} OK)
              </h3>
              <p className="text-xs text-slate-500">
                Детальная проверка времени отклика, визуальные индикаторы задержки и коды ответа
              </p>
            </div>
          </div>

          {/* Filter & Search controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по пути..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 sm:w-56"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  filterStatus === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Все ({totalEndpointsCount})
              </button>
              <button
                onClick={() => setFilterStatus('ok')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  filterStatus === 'ok' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Доступны ({okEndpointsCount})
              </button>
              {failedEndpointsCount > 0 && (
                <button
                  onClick={() => setFilterStatus('issues')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    filterStatus === 'issues' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Сбои ({failedEndpointsCount})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Latency Speed Distribution Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="text-slate-600 font-medium">Мгновенно (&lt;60мс):</span>
            <span className="font-bold text-emerald-700 font-mono ml-auto">{fastEndpointsCount} эндпоинтов</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200" />
            <span className="text-slate-600 font-medium">Норма (60–180мс):</span>
            <span className="font-bold text-blue-700 font-mono ml-auto">{normalEndpointsCount} эндпоинтов</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <span className="text-slate-600 font-medium">Замедлен (&gt;180мс):</span>
            <span className="font-bold text-amber-700 font-mono ml-auto">{slowEndpointsCount} эндпоинтов</span>
          </div>
        </div>

        {/* Table of endpoints */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3 w-32">Статус / Индикатор</th>
                <th className="py-3 px-3">Эндпоинт (Route)</th>
                <th className="py-3 px-3">Описание сервиса</th>
                <th className="py-3 px-3 text-center">HTTP Код</th>
                <th className="py-3 px-3 text-right w-56">Время отклика (Шкала &amp; Задержка)</th>
                <th className="py-3 px-3 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEndpoints.map((ep) => {
                const tier = getLatencyTier(ep.latencyMs, ep.ok);
                const progressPercent = Math.min(100, Math.max(8, (ep.latencyMs / 250) * 100));

                return (
                  <tr key={ep.endpoint} className="hover:bg-slate-50/80 transition-colors">
                    {/* Visual Status Indicator Dot & Badge */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center shrink-0">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${tier.dotColor} ring-4 ${tier.ringColor} ${
                              ep.ok ? 'animate-pulse' : ''
                            }`}
                          />
                        </div>
                        {ep.ok ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Доступен
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold text-[10px]">
                            <XCircle className="w-3 h-3 text-rose-600" /> Ошибка
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-slate-200/80 text-slate-700 rounded text-[9px] font-mono">
                          {ep.endpoint.includes('dadata') || ep.endpoint.includes('test') ? 'POST' : 'GET'}
                        </span>
                        <span>{ep.endpoint}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {ep.name}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          ep.ok
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {ep.status === 0 ? 'OFFLINE' : ep.status}
                      </span>
                    </td>

                    {/* Visual Progress Bar & Response Time Metrics */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex flex-col gap-1 items-end">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${tier.color}`}>
                            {tier.speedIcon} {tier.quality}
                          </span>
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {ep.latencyMs} мс
                          </span>
                        </div>
                        {/* Graphical Progress Bar */}
                        <div className="w-36 bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${tier.barColor}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleTestSingleEndpoint(ep.endpoint, ep.name)}
                        disabled={testingEndpoint === ep.endpoint}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-lg transition-all border border-slate-200 flex items-center gap-1 ml-auto disabled:opacity-50"
                      >
                        <Play className={`w-3 h-3 ${testingEndpoint === ep.endpoint ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                        <span>{testingEndpoint === ep.endpoint ? 'Тест...' : 'Проверить'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Client Runtime Diagnostics */}
      {systemReport && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Параметры клиентской среды и времени аптайма</h3>
              <p className="text-xs text-slate-500">Системные показатели браузера оператора и сервера</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-slate-500 mb-1">Аптайм клиентской сессии:</div>
              <div className="font-bold text-slate-900 font-mono">
                {Math.round(systemReport.uptimeMs / 1000)} сек ({Math.round(systemReport.uptimeMs / 60000)} мин)
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-slate-500 mb-1">Серверное хранилище:</div>
              <div className="font-bold text-slate-900">
                {systemReport.api.storageBackend || 'PostgreSQL + Fallback'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-slate-500 mb-1">Время сервера:</div>
              <div className="font-bold text-slate-900 font-mono">
                {systemReport.api.serverTime ? new Date(systemReport.api.serverTime).toLocaleTimeString('ru-RU') : 'Синхронизировано'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
