import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  FileText,
  Printer,
  ShieldCheck,
  Sparkles,
  Gauge,
  Clock,
  Layers,
  FileBadge,
  UserCheck,
  ChevronRight,
  Copy,
  Check,
  HelpCircle,
  ExternalLink,
  Edit3,
  Trash2,
  RefreshCw,
  Sliders,
  History,
  GitCompare,
  ArrowRight,
  Info,
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { CRM_DOC_VERSIONS, CrmDocVersion } from '../../data/crmDocumentationVersions';

export interface CrmDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'arshin' | 'intervals' | 'proposals' | 'assets' | 'tasks' | 'diff';
  initialVersion?: string;
}

export const CrmDocumentationModal: React.FC<CrmDocumentationModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'arshin',
  initialVersion = 'v2.9.130'
}) => {
  const [activeTab, setActiveTab] = useState<'arshin' | 'intervals' | 'proposals' | 'assets' | 'tasks' | 'diff'>(initialTab);
  const [selectedVersionCode, setSelectedVersionCode] = useState<string>(initialVersion);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDocVersion = CRM_DOC_VERSIONS.find(v => v.version === selectedVersionCode) || CRM_DOC_VERSIONS[0];
  const latestDocVersion = CRM_DOC_VERSIONS.find(v => v.isCurrent) || CRM_DOC_VERSIONS[0];
  const isViewingArchivedVersion = !currentDocVersion.isCurrent;

  const handleCopyText = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const tabs = [
    {
      id: 'arshin' as const,
      title: 'График поверки СИ',
      subtitle: 'ФГИС «АРШИН» и редактирование',
      icon: Gauge,
      badge: currentDocVersion.modules.arshin.statusBadge.split(' ')[0]
    },
    {
      id: 'intervals' as const,
      title: 'Мониторинг интервалов',
      subtitle: 'МПИ, предупреждения и статусы',
      icon: Clock,
      badge: 'Метрология'
    },
    {
      id: 'proposals' as const,
      title: 'Редактор КП',
      subtitle: 'Верхняя печать и компактный футер',
      icon: FileText,
      badge: selectedVersionCode
    },
    {
      id: 'assets' as const,
      title: 'Логотипы и Печати',
      subtitle: 'Управление медиа-активами',
      icon: FileBadge,
      badge: 'Ассеты'
    },
    {
      id: 'tasks' as const,
      title: 'Задачи в CRM',
      subtitle: 'Виджет дашборда и календарь',
      icon: Calendar,
      badge: 'Операции'
    },
    {
      id: 'diff' as const,
      title: 'Сравнение версий',
      subtitle: 'Что изменилось между релизами',
      icon: GitCompare,
      badge: 'Diff'
    }
  ];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#002244] via-[#1E3A8A] to-[#2563EB] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 shadow-xs">
              <BookOpen className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Документация и Регламенты CRM
                </h2>
                {currentDocVersion.isCurrent ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {currentDocVersion.version} (Актуальная)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1">
                    <History className="w-3 h-3" />
                    {currentDocVersion.version} (Архивная)
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Интерактивное руководство по поверкам СИ, МПИ, редактору коммерческих предложений и цифровым активам
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Version Selector Dropdown */}
            <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/20">
              <span className="text-[11px] font-bold text-blue-200 px-2 flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-300" />
                Версия:
              </span>
              <select
                value={selectedVersionCode}
                onChange={(e) => setSelectedVersionCode(e.target.value)}
                className="bg-blue-950/80 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 border border-blue-400/30 focus:outline-hidden focus:ring-1 focus:ring-amber-400 cursor-pointer"
              >
                {CRM_DOC_VERSIONS.map((v) => (
                  <option key={v.version} value={v.version} className="bg-slate-900 text-white">
                    {v.version} {v.isCurrent ? '(Актуальная)' : `(${v.releaseDate})`}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Закрыть документацию"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Archived Version Warning Banner if user selected old version */}
        {isViewingArchivedVersion && (
          <div className="bg-amber-500/15 dark:bg-amber-500/20 border-b border-amber-500/40 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Внимание:</strong> Вы просматриваете архивную редакцию инструкций (<strong>{currentDocVersion.title}</strong> от {currentDocVersion.releaseDate}). Некоторые элементы интерфейса могли измениться.
              </span>
            </div>
            <button
              onClick={() => setSelectedVersionCode(latestDocVersion.version)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <span>Перейти к актуальной {latestDocVersion.version}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Search & Tabs bar */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 px-4 py-3 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.title}</span>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black ${
                      isActive ? 'bg-white text-blue-900' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по регламенту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-800 dark:text-slate-200">
          
          {/* TAB: DIFF (Сравнение версий) */}
          {activeTab === 'diff' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl border border-blue-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-white/10 rounded-lg shrink-0 mt-0.5">
                    <GitCompare className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">
                      История версий и сравнительный анализ изменений
                    </h3>
                    <p className="text-xs text-blue-200">
                      Сравнение ключевых изменений между версиями: v2.8.0 (Базовый релиз) ➔ v2.9.120 (Архив) ➔ v2.9.130 (Актуальная)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(
                      `Ключевые изменения в CRM (v2.9.130):\n1. Печать КП перенесена в верхнюю панель заголовка\n2. Полные права супер-админа на редактирование/удаление записей графика СИ\n3. Блокировка выбора просроченных СИ в метрологических отчетах\n4. Функция «Заменить файл» в менеджере ассетов с сохранением системного ID\n5. Виджет задач на сегодня перенесен в CRM-дашборд`,
                      'diff_summary'
                    )}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedSection === 'diff_summary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Скопировать Changelog</span>
                  </button>
                </div>
              </div>

              {/* Version Comparison Cards */}
              <div className="space-y-4">
                {CRM_DOC_VERSIONS.map((ver) => (
                  <div 
                    key={ver.version}
                    className={`p-5 rounded-xl border transition-all ${
                      ver.isCurrent 
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-sm' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                          ver.isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {ver.version}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {ver.title}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({ver.releaseDate})
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedVersionCode(ver.version);
                          setActiveTab('arshin');
                        }}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Открыть документацию {ver.version}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 mb-3 leading-relaxed">
                      {ver.summary}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
                      {ver.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-100/70 dark:bg-slate-800/60 rounded-lg text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <span className="text-slate-700 dark:text-slate-300">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Module Diff Table */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  Сравнительная таблица модулей (Было в v2.9.120 ➔ Стало в v2.9.130):
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3 rounded-l-lg">Модуль CRM</th>
                        <th className="p-3 text-amber-700 dark:text-amber-300">Старая версия (v2.9.120)</th>
                        <th className="p-3 rounded-r-lg text-emerald-700 dark:text-emerald-300">Актуальная версия (v2.9.130)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      <tr>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">Редактор КП (Печать и разметка)</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">Кнопка «Печать» в нижнем футере, требовала прокрутки; дублирование кнопок внизу; номер КП разбивался на 2 строки.</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/30 dark:bg-emerald-950/20">Кнопка «Печать» в верхней панели заголовка; компактный блок исполнителя; номер КП строго в 1 строку.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">График поверки СИ</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">Только режим просмотра; правка данных требовала ручного доступа в базу или изменения настроек парка.</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/30 dark:bg-emerald-950/20">Супер-админ может редактировать любые параметры прямо в таблице и безопасно удалять списанные СИ.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">Мониторинг МПИ</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">Пассивная индикация цветом без проверки при формировании измерительных отчетов.</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/30 dark:bg-emerald-950/20">Автоматическая блокировка выбора просроченного прибора при составлении метрологического протокола.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">Логотипы и Печати (Ассеты)</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">Только загрузка нового файла; при замене печати менялся ID, требовалась ручная правка кода.</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/30 dark:bg-emerald-950/20">Функция «Заменить файл» с сохранением ID: моментальное обновление факсимиле во всех ТКП и договорах.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">Оперативные задачи менеджеров</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">Виджет находился в боковом меню клиентского Личного кабинета (/account).</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/30 dark:bg-emerald-950/20">Виджет «Мои задачи на сегодня» перенесен в CRM-дашборд рядом с мониторингом поверок.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: График поверки СИ и ФГИС «АРШИН» */}
          {activeTab === 'arshin' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {currentDocVersion.modules.arshin.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {currentDocVersion.modules.arshin.lead}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyText(
                    `График поверки СИ ООО «ДС-Инжиниринг» (${selectedVersionCode}):\n- ${currentDocVersion.modules.arshin.rights}\n- ${currentDocVersion.modules.arshin.protectionNotice}`,
                    'arshin_summary'
                  )}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  {copiedSection === 'arshin_summary' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'arshin_summary' ? 'Скопировано!' : 'Копировать регламент'}</span>
                </button>
              </div>

              {/* Rights and Security Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    <Edit3 className="w-4 h-4" />
                    <h4>Права доступа к модулю</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {currentDocVersion.modules.arshin.rights}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <h4>Метрологический контроль</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {currentDocVersion.modules.arshin.protectionNotice}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <Sliders className="w-4 h-4" />
                    <h4>Специфика версии {selectedVersionCode}</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {currentDocVersion.modules.arshin.keyDifferences || 'Стандартный регламент версии.'}
                  </p>
                </div>
              </div>

              {/* Step by step workflow */}
              <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Порядок работы с реестром поверок СИ:
                </h4>
                <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal pl-5 leading-relaxed">
                  {currentDocVersion.modules.arshin.verificationWorkflow.map((step, idx) => (
                    <li key={idx}>
                      <span dangerouslySetInnerHTML={{ __html: step }} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: Мониторинг межповерочных интервалов (МПИ) */}
          {activeTab === 'intervals' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {currentDocVersion.modules.intervals.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {currentDocVersion.modules.intervals.lead}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyText(
                    `Формула расчета даты очередной поверки:\n${currentDocVersion.modules.intervals.formula}`,
                    'intervals_formula'
                  )}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  {copiedSection === 'intervals_formula' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'intervals_formula' ? 'Формула скопирована!' : 'Скопировать формулу'}</span>
                </button>
              </div>

              {/* Formula & Rule Card */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl border border-indigo-900 shadow-md space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Математическая модель расчета поверки
                </div>
                <div className="p-3 bg-white/10 rounded-lg font-mono text-sm border border-white/10 text-emerald-300">
                  {currentDocVersion.modules.intervals.formula}
                </div>
              </div>

              {/* Status Thresholds */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Цветовая градация и шкала готовности приборов:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentDocVersion.modules.intervals.statusRules.map((rule, i) => (
                    <div 
                      key={i} 
                      className={`p-4 rounded-xl border space-y-2 shadow-xs ${
                        rule.color === 'emerald'
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                          : rule.color === 'amber'
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                          : rule.color === 'rose'
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${
                          rule.color === 'emerald' ? 'bg-emerald-500' : rule.color === 'amber' ? 'bg-amber-500' : rule.color === 'rose' ? 'bg-rose-500' : 'bg-slate-500'
                        }`} />
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                          {rule.status}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {rule.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Редактор КП */}
          {activeTab === 'proposals' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-sky-600 text-white rounded-lg shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {currentDocVersion.modules.proposals.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {currentDocVersion.modules.proposals.lead}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyText(
                    `Стандарты оформления ТКП ООО «ДС-Инжиниринг» (${selectedVersionCode}):\n- Расположение печати: ${currentDocVersion.modules.proposals.printButtonLocation}\n- Номер КП: ${currentDocVersion.modules.proposals.outgoingNumberFormat}`,
                    'proposals_summary'
                  )}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  {copiedSection === 'proposals_summary' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'proposals_summary' ? 'Скопировано!' : 'Копировать стандарт'}</span>
                </button>
              </div>

              {/* Layout Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentDocVersion.modules.proposals.layoutFeatures.map((feat, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <h4>{feat.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary table of key metrics */}
              <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer className="w-4 h-4 text-sky-600" />
                  Спецификация разметки в версии {selectedVersionCode}:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 text-[11px] block">Кнопка «Печать»:</span>
                    <strong className="text-slate-900 dark:text-white">{currentDocVersion.modules.proposals.printButtonLocation}</strong>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 text-[11px] block">Нижний блок:</span>
                    <strong className="text-slate-900 dark:text-white">{currentDocVersion.modules.proposals.bottomBlockLayout}</strong>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 text-[11px] block">Формат номера:</span>
                    <strong className="text-slate-900 dark:text-white">{currentDocVersion.modules.proposals.outgoingNumberFormat}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Логотипы и Печати (Ассеты) */}
          {activeTab === 'assets' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                    <FileBadge className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {currentDocVersion.modules.assets.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {currentDocVersion.modules.assets.lead}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyText(
                    `Регламент управления медиа-активами (${selectedVersionCode}):\n${currentDocVersion.modules.assets.replacementWorkflow}`,
                    'assets_workflow'
                  )}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  {copiedSection === 'assets_workflow' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'assets_workflow' ? 'Скопировано!' : 'Копировать регламент'}</span>
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentDocVersion.modules.assets.features.map((feat, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <h4>{feat.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Replacement Workflow note */}
              <div className="p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4" />
                  Порядок обновления корпоративной графики:
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentDocVersion.modules.assets.replacementWorkflow}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: Задачи в CRM */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-600 text-white rounded-lg shrink-0 mt-0.5">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {currentDocVersion.modules.tasks.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {currentDocVersion.modules.tasks.lead}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyText(
                    `Регламент оперативных задач (${selectedVersionCode}):\nРасположение: ${currentDocVersion.modules.tasks.location}`,
                    'tasks_summary'
                  )}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  {copiedSection === 'tasks_summary' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'tasks_summary' ? 'Скопировано!' : 'Копировать регламент'}</span>
                </button>
              </div>

              {/* Tasks details */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  Локация и особенности размещения:
                </h4>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-800 dark:text-amber-200 font-semibold">
                  {currentDocVersion.modules.tasks.location}
                </div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc pl-5 leading-relaxed pt-2">
                  {currentDocVersion.modules.tasks.features.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span>
              Редакция документации: <strong>{currentDocVersion.version}</strong> от {currentDocVersion.releaseDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('diff')}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>История и сравнение версий</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Закрыть справочник
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
