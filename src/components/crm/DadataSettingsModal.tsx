import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  HelpCircle
} from 'lucide-react';
import { apiService } from '../../services/apiService';

interface DadataSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

export const DadataSettingsModal: React.FC<DadataSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved
}) => {
  if (!isOpen) return null;

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

  // Load current settings status on mount
  useEffect(() => {
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
            text: 'Ключ успешно проверен и сохранен!',
            details: verifyRes.message || 'Сервис поиска организаций по ИНН/ОГРН работает в штатном режиме.'
          });
          setCurrentStatus({
            isConfigured: true,
            hasSecret: Boolean(secretKey.trim() || currentStatus?.hasSecret),
            maskedKey: apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : currentStatus?.maskedKey || null
          });
          if (onSettingsSaved) {
            onSettingsSaved();
          }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Настройки интеграции DaData API</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono">
                  ЕГРЮЛ / ИНН
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Автозаполнение реквизитов контрагентов по ИНН и ОГРН
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleTestAndSave} className="p-5 space-y-4">
          
          {/* Current Status banner */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${currentStatus?.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-slate-300 font-medium">Статус токена:</span>
              <span className={`font-bold ${currentStatus?.isConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                {currentStatus?.isConfigured ? 'Настроен' : 'Не задан'}
              </span>
            </div>
            {currentStatus?.maskedKey && (
              <span className="font-mono text-slate-400 text-[11px]">
                {currentStatus.maskedKey}
              </span>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                API-ключ DaData (API Token) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="f9d8ee50... (40 символов)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Секретный ключ (Secret Key) <span className="text-slate-500 font-normal">(опционально)</span>
              </label>
              <input
                type="password"
                placeholder="Секретный ключ для стандартизации (если есть)"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Info & Instructions for 403 / Suggestions */}
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs text-purple-200/90 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-purple-300">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Где взять рабочий ключ DaData:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-purple-200/70">
              1. Зарегистрируйтесь или войдите в личный кабинет на{' '}
              <a 
                href="https://dadata.ru/profile/#info" 
                target="_blank" 
                rel="noreferrer" 
                className="text-purple-400 underline hover:text-purple-300 inline-flex items-center gap-0.5 font-medium"
              >
                dadata.ru <ExternalLink className="w-3 h-3 inline" />
              </a>.<br />
              2. <strong>Обязательно подтвердите адрес электронной почты</strong> (без этого DaData отключает подсказки с ошибкой 403 Forbidden).<br />
              3. Скопируйте API-токен из раздела «Настройки» и вставьте в поле выше.
            </p>
          </div>

          {/* Result Message */}
          {resultMsg && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              resultMsg.type === 'success' 
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' 
                : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
            }`}>
              {resultMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-0.5">
                <div className="font-bold">{resultMsg.text}</div>
                {resultMsg.details && (
                  <div className="text-[11px] opacity-80 font-mono leading-tight">{resultMsg.details}</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Закрыть
            </button>
            <button
              type="submit"
              disabled={isChecking || isSaving}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              {isChecking || isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isChecking ? 'Проверка связи...' : 'Сохранение...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Проверить и сохранить</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
