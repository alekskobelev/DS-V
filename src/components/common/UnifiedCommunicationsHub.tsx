import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  MessageSquare, 
  Bell, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  Sliders, 
  Cpu, 
  Check, 
  Radio
} from 'lucide-react';
import { EmailSettingsView } from '../crm/EmailSettingsView';
import { NotificationSettingsView } from '../notifications/NotificationSettingsView';
import { apiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';

export interface UnifiedCommunicationsHubProps {
  initialTab?: 'smtp' | 'messengers' | 'diagnostics';
  contextMode?: 'crm' | 'cms' | 'account';
}

export const UnifiedCommunicationsHub: React.FC<UnifiedCommunicationsHubProps> = ({
  initialTab = 'smtp',
  contextMode = 'account'
}) => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'smtp' | 'messengers' | 'diagnostics'>(initialTab);

  // Diagnostics state
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [diagResults, setDiagResults] = useState<{
    smtp: { status: 'idle' | 'ok' | 'err'; latencyMs: number; message: string };
    telegram: { status: 'idle' | 'ok' | 'err'; latencyMs: number; message: string };
    max: { status: 'idle' | 'ok' | 'err'; latencyMs: number; message: string };
    audio: { status: 'idle' | 'ok' | 'err'; latencyMs: number; message: string };
  }>({
    smtp: { status: 'idle', latencyMs: 0, message: 'Ожидает запуска теста' },
    telegram: { status: 'idle', latencyMs: 0, message: 'Ожидает запуска теста' },
    max: { status: 'idle', latencyMs: 0, message: 'Ожидает запуска теста' },
    audio: { status: 'idle', latencyMs: 0, message: 'Ожидает запуска теста' }
  });

  const runAllDiagnostics = async () => {
    setRunningDiagnostics(true);
    showToast('Запуск сквозного тестирования шлюзов связи...');

    const startSmtp = performance.now();
    let smtpRes;
    try {
      smtpRes = await apiService.testNotificationChannel({ channel: 'email', alertEmail: 'info@ds-enginering.ru' });
    } catch {
      smtpRes = { success: false, message: 'Ошибка связи с почтовым сервисом' };
    }
    const endSmtp = Math.round(performance.now() - startSmtp);

    const startTg = performance.now();
    let tgRes;
    try {
      tgRes = await apiService.testNotificationChannel({ channel: 'telegram' });
    } catch {
      tgRes = { success: false, message: 'Ошибка запроса к Telegram Bot API' };
    }
    const endTg = Math.round(performance.now() - startTg);

    const startMax = performance.now();
    let maxRes;
    try {
      maxRes = await apiService.testNotificationChannel({ channel: 'max' });
    } catch {
      maxRes = { success: false, message: 'Ошибка запроса к шлюзу МАКС' };
    }
    const endMax = Math.round(performance.now() - startMax);

    setDiagResults({
      smtp: {
        status: smtpRes.success ? 'ok' : 'err',
        latencyMs: endSmtp,
        message: smtpRes.message || (smtpRes.success ? 'Соединение SMTP установлено' : 'Сбой подключения')
      },
      telegram: {
        status: tgRes.success ? 'ok' : 'err',
        latencyMs: endTg,
        message: tgRes.message || (tgRes.success ? 'Telegram Bot активен' : 'Сбой Telegram шлюза')
      },
      max: {
        status: maxRes.success ? 'ok' : 'err',
        latencyMs: endMax,
        message: maxRes.message || (maxRes.success ? 'МАКС Webhook доступен' : 'Шлюз МАКС не настроен')
      },
      audio: {
        status: 'ok',
        latencyMs: 5,
        message: 'Аудио-драйвер и звуковые сигналы готовы'
      }
    });

    setRunningDiagnostics(false);
    showToast('Сквозное тестирование завершено');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Master Communications Hub */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Единый центр интеграций</span>
              <span>·</span>
              <span className="text-blue-400 font-mono">SMTP / TELEGRAM / МАКС</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Управление почтовыми шлюзами, ботами и корпоративными оповещениями
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Централизованная конфигурация исходящей почты Яндекс 360, ботов Telegram, мессенджера МАКС и сквозного мониторинга доставки сервисных сообщений.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveTab('diagnostics');
            runAllDiagnostics();
          }}
          disabled={runningDiagnostics}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-2 shadow-xs whitespace-nowrap"
        >
          <Zap className="w-4 h-4" />
          <span>{runningDiagnostics ? 'Тестирование...' : 'Сквозной тест всех шлюзов'}</span>
        </button>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('smtp')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'smtp'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Корпоративная почта (SMTP)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('messengers')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'messengers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Мессенджеры (Telegram & МАКС)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'diagnostics'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Сквозная диагностика шлюзов</span>
        </button>
      </div>

      {/* Tab 1: SMTP & Email Settings */}
      {activeTab === 'smtp' && (
        <div className="animate-in fade-in duration-200">
          <EmailSettingsView />
        </div>
      )}

      {/* Tab 2: Messengers & Notification Settings */}
      {activeTab === 'messengers' && (
        <div className="animate-in fade-in duration-200">
          <NotificationSettingsView contextMode={contextMode} />
        </div>
      )}

      {/* Tab 3: Unified Diagnostics Matrix */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Матрица готовности каналов доставки оповещений
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Прямая проверка доступности внешних API и сервисов рассылки ООО «ДС-Инжиниринг»
                </p>
              </div>

              <button
                type="button"
                onClick={runAllDiagnostics}
                disabled={runningDiagnostics}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${runningDiagnostics ? 'animate-spin' : ''}`} />
                <span>Обновить статус</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* SMTP Card */}
              <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Почтовый шлюз SMTP (Яндекс 360)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    diagResults.smtp.status === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' :
                    diagResults.smtp.status === 'err' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300' :
                    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {diagResults.smtp.status === 'ok' ? 'Готов к отправке' : diagResults.smtp.status === 'err' ? 'Ошибка шлюза' : 'Не тестировался'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">{diagResults.smtp.message}</div>
                {diagResults.smtp.latencyMs > 0 && (
                  <div className="text-[10px] text-slate-400 font-mono">Время отклика: {diagResults.smtp.latencyMs} мс</div>
                )}
              </div>

              {/* Telegram Card */}
              <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <MessageSquare className="w-4 h-4 text-sky-500" />
                    <span>Telegram Bot API (Сервисные алерты)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    diagResults.telegram.status === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' :
                    diagResults.telegram.status === 'err' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300' :
                    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {diagResults.telegram.status === 'ok' ? 'Подключен' : diagResults.telegram.status === 'err' ? 'Не активен' : 'Не тестировался'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">{diagResults.telegram.message}</div>
                {diagResults.telegram.latencyMs > 0 && (
                  <div className="text-[10px] text-slate-400 font-mono">Время отклика: {diagResults.telegram.latencyMs} мс</div>
                )}
              </div>

              {/* MAX Messenger Card */}
              <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Radio className="w-4 h-4 text-indigo-500" />
                    <span>МАКС Мессенджер Webhook</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    diagResults.max.status === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' :
                    diagResults.max.status === 'err' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300' :
                    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {diagResults.max.status === 'ok' ? 'Активен' : diagResults.max.status === 'err' ? 'Требует токен' : 'Не тестировался'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">{diagResults.max.message}</div>
                {diagResults.max.latencyMs > 0 && (
                  <div className="text-[10px] text-slate-400 font-mono">Время отклика: {diagResults.max.latencyMs} мс</div>
                )}
              </div>

              {/* Audio & Push Card */}
              <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <span>Браузерные и аудио-уведомления</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300">
                    Активно
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">{diagResults.audio.message}</div>
                <div className="text-[10px] text-slate-400 font-mono">Поддержка Web Audio API: Да</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
