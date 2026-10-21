import React, { useState } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  Code,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Database,
  Terminal,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CmsBackupTab: React.FC = () => {
  const {
    exportAllDataJSON,
    importDataJSON,
    resetToDefaultData,
    resetCrmDatabase,
    showToast
  } = useApp();

  const [importJsonText, setImportJsonText] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isResettingCrm, setIsResettingCrm] = useState(false);

  const handleDownloadBackup = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ds-engineering-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Резервная копия сайта успешно экспортирована (.json)');
  };

  const handleApplyImport = () => {
    if (!importJsonText.trim()) {
      showToast('Вставьте JSON-код для импорта');
      return;
    }
    const success = importDataJSON(importJsonText);
    if (success) {
      setImportJsonText('');
      showToast('Данные успешно импортированы и восстановлены!');
    } else {
      showToast('Ошибка импорта: некорректная структура JSON');
    }
  };

  const handleResetData = () => {
    if (confirm('Сбросить все данные CMS к начальным заводским значениям? Текущие изменения будут удалены.')) {
      resetToDefaultData();
      showToast('Данные CMS сброшены к исходным');
    }
  };

  const handleResetCrmDb = async () => {
    if (!confirm('Сбросить всю базу данных CRM и Личного кабинета к начальному состоянию?\n\nБудут восстановлены заводские эталоны договоров, счетов, коммерческих предложений, обращений клиентов, парка оборудования и лицензий ООО «ДС-Инжиниринг».')) {
      return;
    }
    setIsResettingCrm(true);
    const ok = await resetCrmDatabase();
    setIsResettingCrm(false);
  };

  const copyBash = () => {
    const text = `git clone https://github.com/ds-engineering/ds-engineering-platform.git\ncd ds-engineering-platform\nnpm install\nnpm run dev`;
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    showToast('Команды запуска скопированы в буфер');
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Целостность и аварийное восстановление (DRP)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Резервные копии, перенос контента и экспорт базы данных
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Экспорт полного состояния сайта (страницы, товары, услуги, контакты, тексты) в открытый формат JSON для мгновенного развертывания на любом сервере или локальной рабочей станции.
          </p>
        </div>

        <button
          onClick={handleDownloadBackup}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Скачать полный бэкап (.json)</span>
        </button>
      </div>

      {/* Quick backup / restore panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <Download className="w-5 h-5 text-emerald-600" />
              <span>Экспорт контента сайта (.json)</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Скачивает весь контент сайта (включая все созданные страницы, отредактированные тексты, товары, номенклатуру КИМ, статьи базы знаний и контакты) в один файл <code>.json</code>.
            </p>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Автономность и независимость</span>
              </div>
              <p>Файл бэкапа не зависит от облачных провайдеров и может быть развернут в изолированном контуре предприятия.</p>
            </div>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors mt-4"
          >
            <Download className="w-4 h-4" />
            <span>Скачать ds-engineering-backup.json</span>
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <Upload className="w-5 h-5 text-blue-600" />
            <span>Импорт контента из JSON</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Вставьте содержимое JSON-файла ниже для восстановления структуры сайта:
          </p>
          <div className="space-y-3">
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{"software": [...], "equipment": [...], "pages": [...] }'
              className="w-full p-2.5 text-[11px] rounded-xl border border-gray-300 font-mono focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleApplyImport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Применить импорт
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs rounded-xl border border-rose-200 transition-colors"
              >
                Сброс к исходным
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CRM & Client Cabinet Database Reset Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl p-6 border border-amber-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-md">
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>База данных CRM и Личного кабинета клиентов</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Полный сброс реестра договоров, коммерческих предложений, обращений и сделок
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              Сбрасывает все текущие и измененные записи CRM (сделки, коммерческие предложения, реестр договоров, сервисные заявки техподдержки, реестр лицензий, парк оборудования КИМ и клиентские заказы) к исходным заводским эталонам ООО «ДС-Инжиниринг».
            </p>
          </div>

          <button
            onClick={handleResetCrmDb}
            disabled={isResettingCrm}
            className="px-5 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isResettingCrm ? 'animate-spin' : ''}`} />
            <span>{isResettingCrm ? 'Сброс базы CRM...' : 'Сбросить базу данных CRM и Кабинета'}</span>
          </button>
        </div>
      </div>

      {/* Local Launch Step-by-Step Guide */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-1">
              <Code className="w-3.5 h-3.5" />
              <span>Пошаговая инструкция</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Как запустить сайт и CMS на локальном компьютере или сервере
            </h3>
            <p className="text-xs text-gray-500">
              Все файлы проекта полностью автономны и готовы к запуску в любой ОС (Windows, macOS, Linux, Ubuntu 22.04/24.04).
            </p>
          </div>

          <button
            onClick={copyBash}
            className="px-4.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedScript ? 'Скопировано!' : 'Скопировать команды'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="font-bold text-gray-900 text-sm">Установка Node.js</h4>
            <p className="text-slate-500 leading-relaxed">
              Установите Node.js версии 20+ LTS с официального сайта <code>nodejs.org</code>. Менеджер пакетов <code>npm</code> установится автоматически.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="font-bold text-gray-900 text-sm">Установка зависимостей</h4>
            <p className="text-slate-500 leading-relaxed">
              В терминале выполните команду <code>npm install</code>. Будут установлены React 18, Vite, Three.js, Lucide Icons и Express.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="font-bold text-gray-900 text-sm">Запуск dev-сервера</h4>
            <p className="text-slate-500 leading-relaxed">
              Запустите проект командой <code>npm run dev</code>. Откройте в браузере <code>http://localhost:3000</code>.
            </p>
          </div>
        </div>

        {/* Bash Code Block */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-1.5">
          <div className="text-slate-400 text-[10px]"># Быстрый старт в консоли:</div>
          <div>git clone https://github.com/ds-engineering/ds-engineering-platform.git</div>
          <div>cd ds-engineering-platform</div>
          <div>npm install</div>
          <div className="text-emerald-400 font-bold">npm run dev</div>
        </div>
      </div>
    </div>
  );
};
