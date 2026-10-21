import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Database, 
  MessageSquare, 
  PhoneCall, 
  Bell, 
  Clock, 
  Filter, 
  Search,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Zap,
  HardDrive,
  RotateCcw
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';

interface RealtimeLogEntry {
  id: string;
  timestamp: string;
  category: 'CRM_REQUEST' | 'ENGINEER_CHAT' | 'MANAGER_REPLY' | 'DB_PERSISTENCE' | 'NOTIFICATION' | 'ERROR';
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  action: string;
  summary: string;
  requestId?: string;
  sessionId?: string;
  dbStatus?: 'SAVED_POSTGRESQL' | 'SAVED_DISK' | 'SAVED_MEMORY' | 'DB_FALLBACK';
  details?: Record<string, any>;
  durationMs?: number;
}

export function CrmRealtimeLogsView() {
  const { resetCrmDatabase, isAdmin, showToast } = useApp();
  const [logs, setLogs] = useState<RealtimeLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await apiService.getRealtimeLogs(
        selectedCategory === 'all' ? undefined : selectedCategory,
        80
      );
      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch realtime diagnostic logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedCategory]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 2500);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedCategory]);

  const handleClear = async () => {
    if (window.confirm('Очистить оперативный журнал диагностических логов?')) {
      await apiService.clearRealtimeLogs();
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (selectedLevel !== 'all' && log.level !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSummary = log.summary?.toLowerCase().includes(q);
      const matchAction = log.action?.toLowerCase().includes(q);
      const matchReqId = log.requestId?.toLowerCase().includes(q);
      const matchSessionId = log.sessionId?.toLowerCase().includes(q);
      const matchDetails = log.details ? JSON.stringify(log.details).toLowerCase().includes(q) : false;
      return matchSummary || matchAction || matchReqId || matchSessionId || matchDetails;
    }
    return true;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'CRM_REQUEST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900">
            <PhoneCall className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Заявка / Звонок
          </span>
        );
      case 'ENGINEER_CHAT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900">
            <MessageSquare className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Онлайн-инженер
          </span>
        );
      case 'MANAGER_REPLY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900">
            <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            Ответ инженера
          </span>
        );
      case 'DB_PERSISTENCE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900">
            <Database className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            База данных (PostgreSQL)
          </span>
        );
      case 'NOTIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-900">
            <Bell className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            Уведомление
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900">
            <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
            Сбой
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {category}
          </span>
        );
    }
  };

  const getDbStatusBadge = (status?: string) => {
    if (!status) return null;
    switch (status) {
      case 'SAVED_POSTGRESQL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Database className="w-3 h-3 text-emerald-600" />
            PostgreSQL DB: OK
          </span>
        );
      case 'SAVED_DISK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-300">
            <HardDrive className="w-3 h-3 text-slate-500" />
            JSON Storage: OK
          </span>
        );
      case 'SAVED_MEMORY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-100 text-sky-800 border border-sky-300">
            RAM Store: OK
          </span>
        );
      case 'DB_FALLBACK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            DB Fallback (Память/Диск)
          </span>
        );
      default:
        return null;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'WARN':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Журнал входящих данных и синхронизации с БД</h3>
              <p className="text-xs text-gray-500">
                Детальный аудит доставки сообщений от инженера, заявок из калькулятора и фиксации записей в PostgreSQL в реальном времени
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer bg-slate-50 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 transition-colors">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" 
            />
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
              Live-обновление (2.5c)
            </span>
          </label>

          <button 
            onClick={fetchLogs}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-gray-100 text-slate-500 rounded-lg text-xs font-semibold border border-gray-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>

          <button 
            onClick={handleClear}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold border border-red-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Очистить</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              disabled={isResetting}
              onClick={async () => {
                if (!confirm('ВНИМАНИЕ: Сбросить базу данных CRM к заводским эталонам?\n\nДействие восстановит эталонные демонстрационные сделки, договоры, ТКП и парк оборудования.')) return;
                if (!confirm('Подтвердите повторно: все несохраненные локальные изменения сделок будут заменены эталонами.')) return;
                setIsResetting(true);
                await resetCrmDatabase();
                setIsResetting(false);
                showToast('База данных CRM успешно восстановлена к эталонам');
                fetchLogs();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-300 transition-colors cursor-pointer disabled:opacity-50"
              title="Сброс и восстановление заводских эталонов CRM (только для администраторов)"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-amber-600 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Восстановление...' : 'Сброс к эталонам'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по тексту сообщения, ID запроса, сессии или клиенту..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-gray-200 rounded-lg text-xs px-4 py-2 font-medium text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Все категории событий</option>
            <option value="CRM_REQUEST">Входящие заявки и звонки (CRM)</option>
            <option value="ENGINEER_CHAT">Онлайн-инженер (Чат)</option>
            <option value="MANAGER_REPLY">Ответы инженера/менеджера</option>
            <option value="DB_PERSISTENCE">Синхронизация с БД (PostgreSQL)</option>
            <option value="NOTIFICATION">Оповещения и рассылки</option>
            <option value="ERROR">Ошибки и сбои</option>
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-50 border border-gray-200 rounded-lg text-xs px-4 py-2 font-medium text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Все уровни важности</option>
            <option value="INFO">Инфо (INFO)</option>
            <option value="SUCCESS">Успешно (SUCCESS)</option>
            <option value="WARN">Предупреждения (WARN)</option>
            <option value="ERROR">Ошибки (ERROR)</option>
          </select>
        </div>
      </div>

      {/* Logs Stream List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-gray-200 flex items-center justify-center text-gray-400 mx-auto mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-800">Журнал событий пуст или не найдены совпадения</p>
            <p className="text-xs text-gray-500 mt-1">
              Отправьте тестовое сообщение в чат «Онлайн-инженер» или оформите заявку на звонок, чтобы увидеть событие в реальном времени.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const dateFormatted = new Date(log.timestamp).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                fractionalSecondDigits: 3
              });

              return (
                <div 
                  key={log.id} 
                  className={`p-4 transition-colors hover:bg-slate-50/80 ${log.level === 'ERROR' ? 'bg-red-50/30' : log.level === 'WARN' ? 'bg-amber-50/20' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5">
                        {getLevelIcon(log.level)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono font-semibold text-gray-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {dateFormatted}
                          </span>
                          {getCategoryBadge(log.category)}
                          {getDbStatusBadge(log.dbStatus)}
                          {log.requestId && (
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                              {log.requestId}
                            </span>
                          )}
                          {log.sessionId && (
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                              {log.sessionId}
                            </span>
                          )}
                          {log.durationMs !== undefined && (
                            <span className="text-[11px] font-mono text-gray-400">
                              ⚡ {log.durationMs}ms
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-medium text-gray-900 leading-relaxed break-words">
                          {log.summary}
                        </p>

                        <div className="text-[11px] text-gray-500 mt-1 font-mono flex items-center gap-2">
                          <span className="text-gray-400">Действие:</span>
                          <span className="font-semibold text-slate-500">{log.action}</span>
                        </div>
                      </div>
                    </div>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors shrink-0"
                      >
                        <span>JSON Данные</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {isExpanded && log.details && (
                    <div className="mt-3 pt-3 border-t border-gray-100 pl-7">
                      <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto no-scrollbar leading-relaxed border border-slate-800 shadow-inner">
                        <div className="text-gray-400 mb-1 flex items-center justify-between">
                          <span>📦 Структурированные входящие данные / Payload:</span>
                          <span className="text-emerald-400">Live Telemetry</span>
                        </div>
                        <pre className="text-emerald-300">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3.5 flex items-center gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
        <p>
          Все входящие запросы клиентов автоматически валидируются, реплицируются в базу данных PostgreSQL и дублируются в кольцевой оперативный буфер сервера для моментального мониторинга.
        </p>
      </div>
    </div>
  );
}
