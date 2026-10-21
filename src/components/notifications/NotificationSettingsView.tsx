import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Mail, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  RefreshCw, 
  Save, 
  Play, 
  Smartphone, 
  Globe, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Clock, 
  MessageSquare, 
  PhoneCall, 
  Check, 
  Layers, 
  Zap, 
  Copy,
  Sliders
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { NotificationSettings, ManagerNotificationItem } from '../../types';
import { playNotificationChime } from '../../utils/audioAlert';
import { useApp } from '../../context/AppContext';

export interface NotificationSettingsViewProps {
  contextMode?: 'crm' | 'cms' | 'account';
}

export const NotificationSettingsView: React.FC<NotificationSettingsViewProps> = ({ contextMode = 'crm' }) => {
  const { showToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showMaxToken, setShowMaxToken] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'templates' | 'sla' | 'logs'>('channels');
  
  // Settings state
  const [settings, setSettings] = useState<NotificationSettings>({
    browserPopup: true,
    soundAlert: true,
    soundVolume: 0.5,
    telegramEnabled: false,
    telegramBotToken: '',
    telegramChatId: '',
    telegramTemplate: '',
    emailEnabled: true,
    alertEmail: 'info@ds-enginering.ru, alekskobelev2025@gmail.com',
    emailSubjectPrefix: '[ДС-Инжиниринг CRM]',
    maxEnabled: false,
    maxWebhookUrl: '',
    maxBotToken: '',
    maxChatId: '',
    notifyOnCallback: true,
    notifyOnConsultation: true,
    notifyOnChatLead: true,
    notifyOnTicket: true,
    slaCallbackMinutes: 5,
    workingHoursStart: '09:00',
    workingHoursEnd: '19:00'
  });

  // Test states
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ channel: string; success: boolean; message: string } | null>(null);
  const [checkingMax, setCheckingMax] = useState(false);
  const [registeringMaxWebhook, setRegisteringMaxWebhook] = useState(false);
  const [maxBotInfo, setMaxBotInfo] = useState<{ botName?: string; username?: string } | null>(null);
  
  // Live notifications log
  const [recentNotifications, setRecentNotifications] = useState<ManagerNotificationItem[]>([]);
  const [simulating, setSimulating] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [settingsRes, liveRes] = await Promise.all([
        apiService.getNotificationSettings(),
        apiService.getLiveNotifications()
      ]);

      if (settingsRes.success && settingsRes.settings) {
        setSettings(settingsRes.settings);
      }
      if (liveRes.success && liveRes.notifications) {
        setRecentNotifications(liveRes.notifications);
      }
    } catch (e) {
      console.warn('Failed to load notification settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiService.saveNotificationSettings(settings);
      if (res.success) {
        showToast('Настройки каналов оповещения сохранены!');
      } else {
        showToast(res.message || 'Ошибка сохранения настроек');
      }
    } catch (e) {
      showToast('Сетевая ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleTestChannel = async (channel: 'telegram' | 'email' | 'max' | 'popup') => {
    setTestingChannel(channel);
    setTestResult(null);

    if (channel === 'popup') {
      if (settings.soundAlert) {
        playNotificationChime(0.5);
      }
    }

    try {
      const res = await apiService.testNotificationChannel({
        channel,
        telegramBotToken: settings.telegramBotToken,
        telegramChatId: settings.telegramChatId,
        alertEmail: settings.alertEmail,
        maxWebhookUrl: settings.maxWebhookUrl,
        maxBotToken: settings.maxBotToken,
        maxChatId: settings.maxChatId
      });

      setTestResult({
        channel,
        success: res.success,
        message: res.message || (res.success ? 'Тест выполнен успешно!' : 'Ошибка тестирования канала')
      });

      if (res.success) {
        showToast(`Канал ${channel.toUpperCase()} проверен успешно!`);
        // Refresh notifications list to show the new test item
        const liveRes = await apiService.getLiveNotifications();
        if (liveRes.success && liveRes.notifications) {
          setRecentNotifications(liveRes.notifications);
        }
      } else {
        showToast(res.message || 'Тест не пройден');
      }
    } catch (e: any) {
      setTestResult({
        channel,
        success: false,
        message: e?.message || 'Сетевая ошибка при тестировании'
      });
    } finally {
      setTestingChannel(null);
    }
  };

  const handleCheckMaxBot = async () => {
    setCheckingMax(true);
    try {
      const res = await apiService.checkMaxBotConnection(settings.maxBotToken);
      if (res.success) {
        setMaxBotInfo({
          botName: res.botName || 'Бот ДС-Инжиниринг',
          username: res.username
        });
        showToast(res.message || 'Подключение к API МАКС успешно подтверждено!');
      } else {
        showToast(res.message || 'Ошибка проверки токена МАКС-бота');
      }
    } catch (e: any) {
      showToast(e?.message || 'Сетевая ошибка при проверке API МАКС');
    } finally {
      setCheckingMax(false);
    }
  };

  const handleRegisterMaxWebhook = async () => {
    setRegisteringMaxWebhook(true);
    try {
      const res = await apiService.registerMaxWebhook(settings.maxWebhookUrl, settings.maxBotToken);
      if (res.success) {
        showToast(res.message || 'Webhook для интерактивного чат-бота МАКС зарегистрирован!');
      } else {
        showToast(res.message || 'Не удалось зарегистрировать Webhook МАКС');
      }
    } catch (e: any) {
      showToast(e?.message || 'Ошибка регистрации Webhook МАКС');
    } finally {
      setRegisteringMaxWebhook(false);
    }
  };

  const handleSimulateIncomingCall = async () => {
    setSimulating(true);
    try {
      const res = await apiService.simulateCustomerRequest({
        customerName: 'Алексей Петрович Кузнецов',
        companyName: 'ПАО «ОДК-Кузнецов» (Самара)',
        phone: '+7 (927) 200-45-77',
        topic: 'КИМ PMT Arm и внедрение САПР TopSolid 7',
        preferredTime: 'В течение 10-15 минут (срочно)',
        comment: 'Требуется подбор портальной КИМ и разработка постпроцессора 5D'
      });

      if (res.success) {
        showToast('Имитация звонка выполнена! Оповещение отправлено.');
        if (settings.soundAlert) {
          playNotificationChime(0.5);
        }
        // Update recent notifications list
        const liveRes = await apiService.getLiveNotifications();
        if (liveRes.success && liveRes.notifications) {
          setRecentNotifications(liveRes.notifications);
        }
      }
    } catch (e) {
      showToast('Ошибка симуляции');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Загрузка настроек каналов оповещения...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Save */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Zap className="w-4 h-4" />
            Интеграции и мгновенная диспетчеризация
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Каналы оперативных уведомлений менеджеров
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Настройте, куда дежурным инженерам и руководителю поступают запросы клиентов:
            всплывающее окно на сайте со звуком, бот в Telegram, корпоративная почта или мессенджер MAX.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateIncomingCall}
            disabled={simulating}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            title="Проверить всю цепочку: симулировать звонок клиента прямо сейчас"
          >
            <Play className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Имитация...' : 'Имитировать звонок'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Сохранение...' : 'Сохранить настройки'}</span>
          </button>
        </div>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('channels')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'channels'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Каналы доставки (4)</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Шаблоны и тексты</span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'sla'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Регламент и SLA (5 мин)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Журнал обращений ({recentNotifications.length})</span>
        </button>
      </div>

      {/* TAB 1: CHANNELS */}
      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARD 1: ВСПЛЫВАЮЩИЕ ОКНА НА САЙТЕ И ЗВУК */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 font-bold">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Всплывающее окно на сайте (Live Pop-up)</h3>
                    <p className="text-xs text-slate-500">Мгновенный баннер и звуковой сигнал в браузере</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.browserPopup}
                    onChange={(e) => setSettings({ ...settings, browserPopup: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-500">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {settings.soundAlert ? (
                        <Volume2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-400" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">Звуковой сигнал оповещения</div>
                        <div className="text-xs text-slate-500">Мягкий двухтональный гонг при новой заявке</div>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.soundAlert}
                        onChange={(e) => setSettings({ ...settings, soundAlert: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {settings.soundAlert && (
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-500 font-medium">Громкость: {Math.round((settings.soundVolume || 0.5) * 100)}%</span>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={settings.soundVolume || 0.5}
                        onChange={(e) => setSettings({ ...settings, soundVolume: parseFloat(e.target.value) })}
                        className="w-32 accent-blue-600"
                      />
                    </div>
                  )}
                </div>

                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                  💡 Окно отображается в правом верхнем углу экрана для дежурного сотрудника, показывает имя клиента, телефон с кнопкой звонка в один клик и желаемое время связи.
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => playNotificationChime(settings.soundVolume || 0.5)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Проверить звук</span>
              </button>

              <button
                onClick={() => handleTestChannel('popup')}
                disabled={testingChannel === 'popup'}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{testingChannel === 'popup' ? 'Запуск...' : 'Показать тестовое окно'}</span>
              </button>
            </div>
          </div>

          {/* CARD 2: TELEGRAM BOT INTEGRATION («ДС-ИНЖИНИРИНГ») */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 font-bold">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Telegram-бот («ДС-Инжиниринг»)</h3>
                      {settings.telegramTokenFromEnv && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          .ENV АКТИВЕН
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Мгновенные оповещения дежурным инженерам и менеджерам в Telegram</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.telegramEnabled}
                    onChange={(e) => setSettings({ ...settings, telegramEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {settings.telegramTokenFromEnv && (
                <div className="mt-3 p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold">API-токен Telegram-бота подключен из переменной окружения:</span>
                    <code className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-900 rounded font-mono text-[11px]">TELEGRAM_BOT_TOKEN</code>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Telegram Bot Token
                    </label>
                    {settings.telegramTokenFromEnv && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Управляется сервером (.env)
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={settings.telegramTokenFromEnv ? (settings.telegramMaskedToken || '••••••••••••••••') : settings.telegramBotToken}
                      onChange={(e) => !settings.telegramTokenFromEnv && setSettings({ ...settings, telegramBotToken: e.target.value })}
                      disabled={settings.telegramTokenFromEnv}
                      placeholder="123456789:ABCdefGHIjklmnOPQRstuvwXYZ"
                      className={`w-full text-xs font-mono px-4 py-2 pr-9 border rounded-lg focus:outline-none ${
                        settings.telegramTokenFromEnv 
                          ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                          : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800'
                      }`}
                    />
                    {!settings.telegramTokenFromEnv && (
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-500"
                      >
                        {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  {settings.telegramTokenFromEnv && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Токен безопасно скрыт. Для обновления измените переменную <code>TELEGRAM_BOT_TOKEN</code> в файле .env.
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Telegram Chat ID (ID пользователя, группы или канала)
                    </label>
                    {settings.telegramChatIdFromEnv && (
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        из TELEGRAM_CHAT_ID
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settings.telegramChatId}
                    onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                    placeholder="Например: 987654321 или -1001234567890"
                    className="w-full text-xs font-mono px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                <div className="p-2.5 bg-sky-50/70 rounded-xl border border-sky-200/60 text-[11px] text-sky-900 leading-relaxed space-y-1">
                  <div>
                    ✈️ <strong>Telegram-бот:</strong> Принимает все входящие обращения (RFQ, обратный звонок, онлайн-чат, сервисные заявки).
                  </div>
                  <div>
                    💡 Переменные окружения: <code>TELEGRAM_BOT_TOKEN</code> и <code>TELEGRAM_CHAT_ID</code> имеют высший приоритет.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {(settings.telegramTokenFromEnv || settings.telegramBotToken) && (settings.telegramChatId || settings.telegramEffectiveChatId) ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Telegram-бот настроен
                  </span>
                ) : (
                  <span className="text-slate-400">Требуется указать токен и Chat ID</span>
                )}
              </div>

              <button
                onClick={() => handleTestChannel('telegram')}
                disabled={testingChannel === 'telegram'}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testingChannel === 'telegram' ? 'Отправка...' : 'Тест Telegram-бота'}</span>
              </button>
            </div>
          </div>

          {/* CARD 3: EMAIL NOTIFICATIONS */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 font-bold">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Email-оповещения</h3>
                    <p className="text-xs text-slate-500">Корпоративная рассылка на почту менеджеров</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email-адреса получателей (через запятую)
                  </label>
                  <input
                    type="text"
                    value={settings.alertEmail}
                    onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                    placeholder="info@ds-enginering.ru, manager@ds-enginering.ru"
                    className="w-full text-xs font-mono px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnCallback}
                      onChange={(e) => setSettings({ ...settings, notifyOnCallback: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Обратный звонок</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnConsultation}
                      onChange={(e) => setSettings({ ...settings, notifyOnConsultation: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Заявка на расчет / КИМ</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnChatLead}
                      onChange={(e) => setSettings({ ...settings, notifyOnChatLead: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Чат онлайн-инженера</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnTicket}
                      onChange={(e) => setSettings({ ...settings, notifyOnTicket: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Сервисная заявка</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Шлюз: Яндекс 360 (smtp.yandex.ru)
              </span>

              <button
                onClick={() => handleTestChannel('email')}
                disabled={testingChannel === 'email'}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{testingChannel === 'email' ? 'Отправка...' : 'Тест Email'}</span>
              </button>
            </div>
          </div>

          {/* CARD 4: RUSSIAN MESSENGER MAX (МАКС-БОТ И КОРПОРАТИВНЫЙ ШЛЮЗ) */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Российский мессенджер МАКС (МАКС-бот)</h3>
                      {(settings.maxTokenFromEnv || settings.maxWebhookFromEnv) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          .ENV АКТИВЕН
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Официальный отечественный бот и корпоративный шлюз мгновенных оповещений</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maxEnabled}
                    onChange={(e) => setSettings({ ...settings, maxEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {(settings.maxTokenFromEnv || settings.maxWebhookFromEnv) && (
                <div className="mt-3 p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold">Параметры МАКС-бота подключены из переменных окружения:</span>
                    <code className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-900 rounded font-mono text-[11px]">
                      {[settings.maxTokenFromEnv && 'MAX_BOT_TOKEN', settings.maxChatIdFromEnv && 'MAX_CHAT_ID', settings.maxWebhookFromEnv && 'MAX_WEBHOOK_URL'].filter(Boolean).join(' / ')}
                    </code>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                {/* MAX Bot Token */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      MAX Bot Token (API-токен бота в мессенджере МАКС)
                    </label>
                    {settings.maxTokenFromEnv && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Управляется сервером (.env)
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showMaxToken ? 'text' : 'password'}
                      value={settings.maxTokenFromEnv ? (settings.maxMaskedToken || '••••••••••••••••') : (settings.maxBotToken || '')}
                      onChange={(e) => !settings.maxTokenFromEnv && setSettings({ ...settings, maxBotToken: e.target.value })}
                      disabled={settings.maxTokenFromEnv}
                      placeholder="Токен бота в мессенджере МАКС (например: max_sec_...)"
                      className={`w-full text-xs font-mono px-4 py-2 pr-9 border rounded-lg focus:outline-none ${
                        settings.maxTokenFromEnv 
                          ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                          : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-purple-500 focus:bg-white text-slate-800'
                      }`}
                    />
                    {!settings.maxTokenFromEnv && (
                      <button
                        type="button"
                        onClick={() => setShowMaxToken(!showMaxToken)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-500"
                      >
                        {showMaxToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  {settings.maxTokenFromEnv && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Токен скрыт. Для обновления измените переменную <code>MAX_BOT_TOKEN</code> в файле .env.
                    </p>
                  )}
                </div>

                {/* MAX Chat ID */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      MAX Chat ID / Канал (ID чата или канала в мессенджере МАКС)
                    </label>
                    {settings.maxChatIdFromEnv && (
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        из MAX_CHAT_ID
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settings.maxChatId || ''}
                    onChange={(e) => setSettings({ ...settings, maxChatId: e.target.value })}
                    placeholder="Например: 12003456 или @ds_engineering_leads"
                    className="w-full text-xs font-mono px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>

                {/* MAX Webhook URL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Webhook URL (HTTP POST Endpoint для входящих событий)
                    </label>
                    {settings.maxWebhookFromEnv && (
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        из MAX_WEBHOOK_URL
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    value={settings.maxWebhookUrl || ''}
                    onChange={(e) => setSettings({ ...settings, maxWebhookUrl: e.target.value })}
                    placeholder="https://ваш-домен.ru/api/notifications/max/webhook"
                    className="w-full text-xs font-mono px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>

                {/* Quick Diagnostics & Webhook Registration */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCheckMaxBot}
                    disabled={checkingMax}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>{checkingMax ? 'Проверка API...' : 'Проверить токен (dev.max.ru)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRegisterMaxWebhook}
                    disabled={registeringMaxWebhook}
                    className="px-4 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{registeringMaxWebhook ? 'Регистрация...' : 'Зарегистрировать Webhook'}</span>
                  </button>
                </div>

                {/* Bot Profile Status Info */}
                {maxBotInfo && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <strong>Подключено:</strong> {maxBotInfo.botName} {maxBotInfo.username ? `(@${maxBotInfo.username})` : ''}
                    </div>
                  </div>
                )}

                {/* Step by step instruction */}
                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/60 text-[11px] text-purple-900 leading-relaxed space-y-1.5">
                  <div className="font-bold flex items-center gap-1">
                    <span>🇷🇺 Инструкция по запуску бота в мессенджере МАКС:</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                    <li>
                      Зарегистрируйте бота в кабинете разработчика <strong>dev.max.ru</strong> или через системного администратора МАКС.
                    </li>
                    <li>
                      Скопируйте <strong>Bot Token</strong> и вставьте его выше (или укажите в переменной <code>MAX_BOT_TOKEN</code>).
                    </li>
                    <li>
                      Откройте бота в мессенджере МАКС и отправьте команду <code>/start</code>. Укажите числовой <strong>Chat ID</strong>.
                    </li>
                    <li>
                      Нажмите <strong>«Зарегистрировать Webhook»</strong> для автоматического приема заявок и ответов чат-бота!
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {(settings.maxTokenFromEnv || settings.maxBotToken || settings.maxWebhookUrl || settings.maxWebhookFromEnv) ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    МАКС-бот настроен
                  </span>
                ) : (
                  <span className="text-slate-400">Требуется указать токен/Chat ID или Webhook</span>
                )}
              </div>

              <button
                onClick={() => handleTestChannel('max')}
                disabled={testingChannel === 'max'}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{testingChannel === 'max' ? 'Отправка...' : 'Тест МАКС-бот'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: TEMPLATES & TEXTS */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              Шаблоны Email-уведомлений
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Префикс темы почтовых писем
              </label>
              <input
                type="text"
                value={settings.emailSubjectPrefix || '[ДС-Инжиниринг CRM]'}
                onChange={(e) => setSettings({ ...settings, emailSubjectPrefix: e.target.value })}
                placeholder="[ДС-Инжиниринг CRM]"
                className="w-full text-xs px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Отображается в теме каждого письма перед типом заявки и именем клиента
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-semibold text-slate-900 block">Доступные теги автоподстановки:</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-indigo-700">&#123;customerName&#125;</span>
                <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-indigo-700">&#123;phone&#125;</span>
                <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-indigo-700">&#123;companyName&#125;</span>
                <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-indigo-700">&#123;topic&#125;</span>
                <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-indigo-700">&#123;callId&#125;</span>
                <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-indigo-700">&#123;preferredTime&#125;</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-600" />
              Пример карточки Telegram / МАКС-бота
            </h3>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed border border-slate-800 shadow-inner">
              <p className="text-amber-400 font-bold">📞 СРОЧНЫЙ ЗАКАЗ ОБРАТНОГО ЗВОНКА</p>
              <p className="text-slate-400">🏢 «ДС-Инжиниринг» — CRM Оповещение</p>
              <p className="mt-2">👤 <b>Клиент:</b> Виктор Николаевич Савельев</p>
              <p>🏢 <b>Компания:</b> АО «Салют-Авиа»</p>
              <p>📱 <b>Телефон:</b> <span className="text-sky-300">+7 (927) 700-11-22</span></p>
              <p>⏱ <b>Желаемое время:</b> В течение 10-15 минут (срочно)</p>
              <p>🎯 <b>Тема:</b> КИМ и измерительные руки PMT</p>
              <p>🆔 <b>Номер в CRM:</b> CALL-2026-804</p>
            </div>
            <p className="text-[11px] text-slate-500">
              Формат карточки идентичен для Telegram Bot API и Российского мессенджера МАКС.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: SLA & SCHEDULE */}
      {activeTab === 'sla' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Нормативы реагирования (SLA)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Целевое время первого контакта по звонку
              </label>
              <select
                value={settings.slaCallbackMinutes || 5}
                onChange={(e) => setSettings({ ...settings, slaCallbackMinutes: parseInt(e.target.value) })}
                className="w-full text-xs px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold text-slate-800"
              >
                <option value={3}>3 минуты (Максимально оперативно)</option>
                <option value={5}>5 минут (Корпоративный стандарт «ДС-Инжиниринг»)</option>
                <option value={10}>10 минут (Стандарт для сложных КИМ)</option>
                <option value={15}>15 минут (Расширенный интервал)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Начало рабочего дня (МСК)
                </label>
                <input
                  type="time"
                  value={settings.workingHoursStart || '09:00'}
                  onChange={(e) => setSettings({ ...settings, workingHoursStart: e.target.value })}
                  className="w-full text-xs px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Окончание рабочего дня (МСК)
                </label>
                <input
                  type="time"
                  value={settings.workingHoursEnd || '19:00'}
                  onChange={(e) => setSettings({ ...settings, workingHoursEnd: e.target.value })}
                  className="w-full text-xs px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl p-6 border border-blue-100 shadow-sm space-y-3 text-xs text-blue-900 leading-relaxed">
            <h4 className="font-bold text-sm text-blue-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              Регламент дежурного инженера при звонке
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-slate-700">
              <li><strong>Перезвонить в течение {settings.slaCallbackMinutes || 5} минут:</strong> Нажмите «Позвонить сейчас» прямо во всплывающем окне или скопируйте номер.</li>
              <li><strong>Идентифицировать потребность:</strong> Модель КИМ, задачи контроля точности или САПР TopSolid 7.</li>
              <li><strong>Взять лид в CRM:</strong> Карточка сделки и задача создаются автоматически, переведите этап в «Квалификация / ТЗ».</li>
              <li><strong>Зафиксировать итог:</strong> Оставьте комментарий в карточке сделки для истории взаимоотношений.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Test Result Banner */}
      {testResult && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in duration-200 ${
          testResult.success 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {testResult.success ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div className="text-sm font-medium">
            <strong>[{testResult.channel.toUpperCase()}]:</strong> {testResult.message}
          </div>
        </div>
      )}

      {/* LOGS TAB OR RECENT PREVIEW */}
      {(activeTab === 'logs' || recentNotifications.length > 0) && (
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                {activeTab === 'logs' ? 'Полный журнал входящих обращений и статусы доставки' : 'Последние поступившие обращения'}
              </h3>
              <p className="text-xs text-slate-500">
                Фиксация моментальных каналов доставки (Всплывающее окно, Telegram, Email, MAX Webhook)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await apiService.markAllNotificationsRead();
                  fetchSettings();
                }}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Отметить все как прочитанные
              </button>
            </div>
          </div>

          {recentNotifications.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              Запросов пока не поступало. Нажмите «Имитировать звонок», чтобы проверить работу.
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Время</th>
                    <th className="py-2.5 px-4">Тип</th>
                    <th className="py-2.5 px-4">Клиент</th>
                    <th className="py-2.5 px-4">Телефон</th>
                    <th className="py-2.5 px-4">Организация / Тема</th>
                    <th className="py-2.5 px-4">Статус каналов</th>
                    <th className="py-2.5 px-4 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeTab === 'logs' ? recentNotifications : recentNotifications.slice(0, 5)).map((n) => (
                    <tr key={n.id} className={`hover:bg-slate-50/80 transition-colors ${!n.read ? 'bg-amber-50/30' : ''}`}>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        <div className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {n.type === 'callback' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            <PhoneCall className="w-3 h-3" />
                            Звонок
                          </span>
                        ) : n.type === 'chat_lead' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800">
                            <MessageSquare className="w-3 h-3" />
                            Чат
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                            <Layers className="w-3 h-3" />
                            Заявка
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {n.customerName}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-blue-600">
                        <a href={`tel:${n.phone.replace(/\D/g, '')}`} className="hover:underline">
                          {n.phone}
                        </a>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-500">
                        <div className="font-medium text-slate-800 truncate">{n.companyName || '—'}</div>
                        <div className="text-[11px] text-slate-500 truncate">{n.topic}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span 
                            title="Всплывающее окно" 
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              n.channels.popup === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            Pop-up
                          </span>
                          <span 
                            title="Telegram" 
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              n.channels.telegram === 'sent' ? 'bg-sky-100 text-sky-800' : 
                              n.channels.telegram === 'failed' ? 'bg-rose-100 text-rose-800' : 
                              'bg-slate-100 text-slate-400'
                            }`}
                          >
                            TG
                          </span>
                          <span 
                            title="Email" 
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              n.channels.email === 'sent' ? 'bg-indigo-100 text-indigo-800' : 
                              n.channels.email === 'failed' ? 'bg-rose-100 text-rose-800' : 
                              'bg-slate-100 text-slate-400'
                            }`}
                          >
                            Email
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <a
                          href={`tel:${n.phone.replace(/\D/g, '')}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Набрать</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
