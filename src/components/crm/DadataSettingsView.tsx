import React, { useState, useEffect } from 'react';
import { 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  Shield, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Sparkles,
  HelpCircle,
  Building2,
  Search,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { apiService } from '../../services/apiService';

export const DadataSettingsView: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<{
    isConfigured: boolean;
    hasSecret: boolean;
    maskedKey: string | null;
  } | null>(null);

  const [resultMsg, setResultMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    details?: string;
  } | null>(null);

  // Live test search state
  const [testQuery, setTestQuery] = useState('6312000219');
  const [isTestingSearch, setIsTestingSearch] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testSearchError, setTestSearchError] = useState<string | null>(null);

  const loadStatus = () => {
    fetch('/api/dadata/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentStatus({
            isConfigured: data.isConfigured,
            hasSecret: data.hasSecret,
            maskedKey: data.maskedKey
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() && !currentStatus?.isConfigured) {
      setResultMsg({
        type: 'error',
        text: 'Пожалуйста, введите API-ключ DaData'
      });
      return;
    }

    setIsChecking(true);
    setResultMsg(null);

    try {
      // 1. Verify key live against DaData
      const verifyRes = await apiService.verifyDadataKey(apiKey.trim(), secretKey.trim());

      if (verifyRes.valid) {
        // 2. Save if valid
        setIsSaving(true);
        const saveRes = await apiService.saveDadataSettings(apiKey.trim(), secretKey.trim());
        if (saveRes.success) {
          setResultMsg({
            type: 'success',
            text: 'Ключ DaData успешно проверен и сохранен!',
            details: verifyRes.message || 'Сервис поиска организаций по ИНН/ОГРН работает в штатном режиме.'
          });
          loadStatus();
          setApiKey('');
          setSecretKey('');
        } else {
          setResultMsg({
            type: 'error',
            text: 'Ключ валиден, но не удалось сохранить настройки на сервере',
            details: saveRes.message
          });
        }
      } else {
        setResultMsg({
          type: 'error',
          text: 'Ошибка валидации ключа DaData',
          details: verifyRes.error || 'Проверьте токен или статус опции SUGGESTIONS на dadata.ru'
        });
      }
    } catch (err: any) {
      setResultMsg({
        type: 'error',
        text: 'Ошибка сетевого запроса к DaData',
        details: err?.message
      });
    } finally {
      setIsChecking(false);
      setIsSaving(false);
    }
  };

  const handleRunTestSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery || testQuery).trim();
    if (!q) return;
    if (overrideQuery) setTestQuery(overrideQuery);
    setIsTestingSearch(true);
    setTestSearchError(null);
    setTestResults([]);

    try {
      const res = await apiService.searchCompanyByDadata(q);
      if (res.data && res.data.length > 0) {
        setTestResults(res.data);
      } else {
        setTestSearchError(res.error || 'Организаций по данному запросу не найдено. Проверьте правильность ИНН или название компании.');
      }
    } catch (err: any) {
      setTestSearchError(err?.message || 'Сбой выполнения запроса к API');
    } finally {
      setIsTestingSearch(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-xs">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Интеграция DaData API (ЕГРЮЛ / ИНН)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  v4.1
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Автоматический поиск и заполнение реквизитов контрагентов по ИНН, ОГРН и названию в Генераторе ТКП и карточках CRM
              </p>
            </div>
          </div>

          {/* Current Status Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${currentStatus?.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Статус сервиса:</span>
              <span className={`font-bold ${currentStatus?.isConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {currentStatus?.isConfigured ? `Активен (${currentStatus.maskedKey || 'Ключ сохранен'})` : 'Ключ не настроен'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Параметры авторизации DaData</span>
        </h3>

        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* API Key */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                API-ключ (API Token) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder={currentStatus?.maskedKey ? `Текущий: ${currentStatus.maskedKey}` : 'Вставьте 40-значный токен с dadata.ru'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Получите токен в личном кабинете <a href="https://dadata.ru/profile/#info" target="_blank" rel="noreferrer" className="text-purple-600 dark:text-purple-400 underline font-medium">dadata.ru/profile</a>
              </p>
            </div>

            {/* Secret Key */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Секретный ключ (Secret Key) <span className="text-slate-400 font-normal">(опционально)</span>
              </label>
              <input
                type="password"
                placeholder={currentStatus?.hasSecret ? '•••••••••••••••• (Сохранен)' : 'Необязательно для стандартного поиска'}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Используется для расширенной валидации и стандартизации адресов
              </p>
            </div>
          </div>

          {/* Feedback message */}
          {resultMsg && (
            <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              resultMsg.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}>
              {resultMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-sm">{resultMsg.text}</div>
                {resultMsg.details && (
                  <div className="text-[11px] opacity-90 font-mono leading-relaxed">{resultMsg.details}</div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isChecking || isSaving}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50"
            >
              {isChecking || isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isChecking ? 'Проверка связи с DaData...' : 'Сохранение настроек...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Проверить и сохранить ключ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Test Sandbox Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Тестовый поиск по ИНН / ОГРН / Названию</span>
          </h3>
          <span className="text-[11px] text-slate-400">Прямой опрос шлюза `/api/dadata/party`</span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Введите ИНН (например, 6312000219 для ПАО «ОДК-Кузнецов») или название..."
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunTestSearch()}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
            />
          </div>
          <button
            type="button"
            onClick={() => handleRunTestSearch()}
            disabled={isTestingSearch}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isTestingSearch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Найти</span>
          </button>
        </div>

        {/* Quick Test Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400">Быстрый тест:</span>
          <button
            type="button"
            onClick={() => handleRunTestSearch('6319031396')}
            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 font-mono text-[10.5px] border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
          >
            6319031396 (АО «Авиаагрегат»)
          </button>
          <button
            type="button"
            onClick={() => handleRunTestSearch('6312000219')}
            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 font-mono text-[10.5px] border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
          >
            6312000219 (ПАО «ОДК-Кузнецов»)
          </button>
          <button
            type="button"
            onClick={() => handleRunTestSearch('6325000570')}
            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 font-mono text-[10.5px] border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
          >
            6325000570 (АО «Тяжмаш»)
          </button>
          <button
            type="button"
            onClick={() => handleRunTestSearch('6312025587')}
            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 font-mono text-[10.5px] border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
          >
            6312025587 (ООО «ДС-Инжиниринг»)
          </button>
        </div>

        {/* Test Search Results */}
        {testResults.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Найдено организаций: {testResults.length}</span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {testResults.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs"
                >
                  <div className="font-bold text-slate-900 dark:text-white">
                    {item.value || item.data?.name?.full_with_opf}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <div><span className="font-semibold text-slate-700 dark:text-slate-300">ИНН:</span> {item.data?.inn || '—'}</div>
                    <div><span className="font-semibold text-slate-700 dark:text-slate-300">КПП:</span> {item.data?.kpp || '—'}</div>
                    <div><span className="font-semibold text-slate-700 dark:text-slate-300">ОГРН:</span> {item.data?.ogrn || '—'}</div>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Адрес:</span> {item.data?.address?.value || item.unrestricted_value}
                  </div>
                  {item.data?.management?.name && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Руководитель:</span> {item.data.management.post ? `${item.data.management.post} ` : ''}{item.data.management.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {testSearchError && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{testSearchError}</span>
          </div>
        )}
      </div>

      {/* Instructions & FAQ */}
      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Частые вопросы и решение проблемы «403 Forbidden»:</span>
        </div>
        <ul className="list-disc list-inside space-y-1.5 text-[11px] pl-1 leading-relaxed">
          <li>
            <strong>Почему возникает ошибка «403 Forbidden»?</strong> На сервисе DaData функция подсказок («SUGGESTIONS») отключается, если в аккаунте <u>не подтвержден email</u> при регистрации. Зайдите на dadata.ru и перейдите по ссылке из письма с подтверждением.
          </li>
          <li>
            <strong>Где используется API?</strong> В Генераторе ТКП при вводе названия или ИНН компании заказчика поля (КПП, ОГРН, Юридический адрес, ФИО директора и должность) заполняются в 1 клик.
          </li>
          <li>
            <strong>Что если ключ не задан?</strong> Генератор автоматически переключается на встроенную локальную базу проверенных предприятий РФ и сохраняет возможность ручного ввода любых реквизитов.
          </li>
        </ul>
      </div>
    </div>
  );
};
