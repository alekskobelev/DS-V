import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  FileText,
  Sliders,
  Building,
  Coins,
  Check
} from 'lucide-react';
import { VerificationResult, VerificationIssue } from '../../../utils/proposalVerifier';

interface ProposalVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: VerificationResult;
  onFixIssue: (targetTab: 'requisites' | 'spec' | 'terms' | 'images' | 'tz' | 'sign') => void;
  isDark?: boolean;
}

export const ProposalVerifierModal: React.FC<ProposalVerifierModalProps> = ({
  isOpen,
  onClose,
  result,
  onFixIssue,
  isDark = false
}) => {
  if (!isOpen) return null;

  const scoreColor = result.score >= 90 
    ? 'text-emerald-500' 
    : result.score >= 70 
    ? 'text-amber-500' 
    : 'text-rose-500';

  const scoreBg = result.score >= 90
    ? (isDark ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-emerald-50 border-emerald-200')
    : result.score >= 70
    ? (isDark ? 'bg-amber-950/40 border-amber-800/60' : 'bg-amber-50 border-amber-200')
    : (isDark ? 'bg-rose-950/40 border-rose-800/60' : 'bg-rose-50 border-rose-200');

  return (
    <div className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Верификатор качества КП
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono uppercase tracking-wider">
                  Аудит 100%
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Автоматическая проверка коммерческого предложения на соответствие регламентам
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quality Score Hero Card */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${scoreBg}`}>
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center shrink-0">
                <div className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${scoreColor}`}>
                  {result.score}%
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold flex items-center gap-1.5">
                  {result.isReadyToSend ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>КП полностью готово к отправке Заказчику</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Требуется доработка параметров</span>
                    </>
                  )}
                </div>
                <p className="text-xs opacity-80 leading-relaxed">
                  {result.isReadyToSend
                    ? 'Все обязательные реквизиты, спецификация, финансовые расчеты НДС и подписи проверены.'
                    : `Обнаружено ${result.errorsCount} блокирующих ошибок и ${result.warningsCount} рекомендаций.`}
                </p>
              </div>
            </div>

            {/* Counter Badges */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-center px-3 py-1.5 rounded-lg bg-black/10 dark:bg-black/40 border border-black/10">
                <div className="text-xs font-bold text-rose-500 font-mono">{result.errorsCount}</div>
                <div className="text-[9px] opacity-70">Ошибок</div>
              </div>
              <div className="text-center px-3 py-1.5 rounded-lg bg-black/10 dark:bg-black/40 border border-black/10">
                <div className="text-xs font-bold text-amber-500 font-mono">{result.warningsCount}</div>
                <div className="text-[9px] opacity-70">Замечаний</div>
              </div>
              <div className="text-center px-3 py-1.5 rounded-lg bg-black/10 dark:bg-black/40 border border-black/10">
                <div className="text-xs font-bold text-emerald-500 font-mono">{result.passedChecksCount}</div>
                <div className="text-[9px] opacity-70">Пройдено</div>
              </div>
            </div>
          </div>

          {/* Issues List (Errors and Warnings) */}
          {result.issues.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Замечания для устранения ({result.issues.length})</span>
              </div>

              <div className="space-y-2">
                {result.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                      issue.type === 'error'
                        ? (isDark ? 'bg-rose-950/30 border-rose-800/60' : 'bg-rose-50/80 border-rose-200')
                        : issue.type === 'warning'
                        ? (isDark ? 'bg-amber-950/20 border-amber-800/50' : 'bg-amber-50/80 border-amber-200')
                        : (isDark ? 'bg-blue-950/20 border-blue-800/50' : 'bg-blue-50/80 border-blue-200')
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {issue.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      ) : issue.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      )}

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold leading-snug">{issue.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-semibold ${
                            issue.type === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {issue.categoryLabel}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-80 leading-relaxed">
                          {issue.description}
                        </p>
                      </div>
                    </div>

                    {issue.fixActionLabel && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onFixIssue(issue.targetTab);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0"
                      >
                        <span>{issue.fixActionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passed Checks */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Успешно пройденные проверки ({result.passedChecks.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.passedChecks.map((check) => (
                <div
                  key={check.id}
                  className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs ${
                    isDark ? 'bg-slate-800/50 border-slate-700/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{check.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-5 py-3 border-t flex items-center justify-between gap-3 shrink-0 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="text-xs opacity-70">
            Регламент деловой переписки «ДС-Инжиниринг»
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
