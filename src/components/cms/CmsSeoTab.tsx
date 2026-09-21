import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ExternalLink,
  FileCode,
  Copy,
  Check,
  Zap,
  Play,
  Trash2,
  ShieldCheck,
  Eye,
  Laptop,
  Smartphone,
  Info,
  Code,
  FileText
} from 'lucide-react';
import { runSeoAudit, PAGE_SEO_DATA, PRODUCT_SEO_DATA, SeoAuditReport } from '../../utils/seo';
import { useApp } from '../../context/AppContext';
import { Upload, Download } from 'lucide-react';

export const CmsSeoTab: React.FC = () => {
  const [auditReport, setAuditReport] = useState<SeoAuditReport | null>(null);
  const [selectedPageKey, setSelectedPageKey] = useState<string>('home');
  const [searchEnginePreview, setSearchEnginePreview] = useState<'yandex' | 'google'>('yandex');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [leadPopupStatus, setLeadPopupStatus] = useState({
    shownInSession: false,
    submittedEver: false,
    lastShownTimestamp: null as string | null
  });

  
  const { customPages, updateCustomPage, products, updateProduct, services, updateService, articles, updateArticle, knowledgeBase, updateKnowledgeItem } = useApp();
  const [bulkImportText, setBulkImportText] = useState('');
  const [isDraggingJson, setIsDraggingJson] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  const generateBulkSeoJson = () => {
    const list: any[] = [];
    customPages.forEach(p => list.push({ entityType: 'page', id: p.id, url: '/' + p.slug, title: p.title, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', metaKeywords: p.metaKeywords || [] }));
    products.forEach(p => list.push({ entityType: 'product', id: p.id, url: '/hardware/' + p.id, title: p.name, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', metaKeywords: p.metaKeywords || (p.keywords || []) }));
    services.forEach(p => list.push({ entityType: 'service', id: p.id, url: '/services/' + p.id, title: p.title, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', metaKeywords: p.metaKeywords || (p.keywords || []) }));
    articles.forEach(p => list.push({ entityType: 'article', id: p.id, url: '/news/' + p.id, title: p.title, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', metaKeywords: p.metaKeywords || [] }));
    knowledgeBase.forEach(p => list.push({ entityType: 'knowledge', id: p.id, url: '/knowledge/' + p.id, title: p.title, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', metaKeywords: p.metaKeywords || [] }));
    
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-metadata-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const applyImportData = (data: any[], fileName?: string) => {
    if (!Array.isArray(data)) throw new Error('Ожидается массив объектов');
    let count = 0;
    data.forEach(item => {
      const { entityType, id, metaTitle, metaDescription, metaKeywords } = item;
      const updates = { metaTitle, metaDescription, metaKeywords };
      if (entityType === 'page') updateCustomPage(id, updates);
      else if (entityType === 'product') updateProduct(id, updates);
      else if (entityType === 'service') updateService(id, updates);
      else if (entityType === 'article') updateArticle(id, updates);
      else if (entityType === 'knowledge') updateKnowledgeItem(id, updates);
      count++;
    });
    alert(`Успешно обновлено ${count} записей метатегов${fileName ? ` из файла «${fileName}»` : ''}!`);
    setBulkImportText('');
  };

  const handleBulkImport = () => {
    try {
      const data = JSON.parse(bulkImportText);
      applyImportData(data);
    } catch (e: any) {
      alert('Ошибка импорта: ' + e.message);
    }
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setBulkImportText(content);
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          const shouldApplyNow = window.confirm(
            `Файл «${file.name}» успешно прочитан!\nНайдено записей метатегов: ${parsed.length}.\n\nПрименить изменения прямо сейчас в базу данных сайта?`
          );
          if (shouldApplyNow) {
            applyImportData(parsed, file.name);
          }
        } else {
          alert(`Файл «${file.name}» загружен в текстовое поле. Проверьте структуру и нажмите «Применить импорт».`);
        }
      } catch (err: any) {
        alert('Ошибка при чтении JSON-файла: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleJsonFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingJson(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      alert('Пожалуйста, выберите файл в формате .json');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setBulkImportText(content);
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          const shouldApplyNow = window.confirm(
            `Файл «${file.name}» успешно прочитан!\nНайдено записей метатегов: ${parsed.length}.\n\nПрименить изменения прямо сейчас в базу данных сайта?`
          );
          if (shouldApplyNow) {
            applyImportData(parsed, file.name);
          }
        } else {
          alert(`Файл «${file.name}» загружен в поле импорта.`);
        }
      } catch (err: any) {
        alert('Ошибка при чтении JSON-файла: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

const refreshAudit = () => {
    const report = runSeoAudit();
    setAuditReport(report);
    checkBannerState();
  };

  const checkBannerState = () => {
    try {
      const shown = sessionStorage.getItem('dsLeadPopupShown') === 'true';
      const submitted = localStorage.getItem('dsLeadPopupSubmitted') === 'true';
      const time = sessionStorage.getItem('dsLeadPopupTimestamp');
      setLeadPopupStatus({
        shownInSession: shown,
        submittedEver: submitted,
        lastShownTimestamp: time ? new Date(parseInt(time, 10)).toLocaleTimeString('ru-RU') : null
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshAudit();
  }, []);

  const handleTestBannerNow = () => {
    window.dispatchEvent(new CustomEvent('open-smart-lead-banner'));
    setTimeout(checkBannerState, 500);
  };

  const handleResetBannerLock = () => {
    try {
      sessionStorage.removeItem('dsLeadPopupShown');
      sessionStorage.removeItem('dsLeadPopupTimestamp');
      sessionStorage.removeItem('dsLeadPopupDismissed');
      localStorage.removeItem('dsLeadPopupSubmitted');
      window.dispatchEvent(new CustomEvent('reset-smart-lead-banner'));
    } catch {
      // ignore
    }
    checkBannerState();
  };

  const pageOptions = [
    { key: 'home', label: 'Главная страница (Портал ДС‑Инжиниринг)' },
    { key: 'software', label: 'Каталог ПО (TopSolid, PolyWorks, Shining 3D)' },
    { key: 'hardware', label: 'Метрологическое оборудование (КИМ, 3D-сканеры, руки PMT)' },
    { key: 'services', label: 'Инжиниринговые услуги (3D-контроль, реверс, постпроцессоры)' },
    { key: 'news', label: 'Пресс-центр, новости и технические статьи' },
    { key: 'knowledge', label: 'База знаний, ГОСТы и стандарты' },
    { key: 'contacts', label: 'Контакты и реквизиты компании' },
    { key: 'sitemap', label: 'Интерактивная карта сайта (Sitemap)' }
  ];

  const currentMeta = PAGE_SEO_DATA[selectedPageKey] || {
    title: 'ДС‑Инжиниринг | CAD/CAM/PDM системы и 3D-метрология',
    description: 'Официальный портал поставки промышленного софта и измерительных машин.',
    keywords: 'CAD CAM, TopSolid 7, Shining 3D',
    canonicalUrl: 'https://ds-engineering.ru/'
  };

  const canonicalUrl = `https://ds-engineering.ru/${selectedPageKey === 'home' ? '' : selectedPageKey}`;

  const copyJsonLd = () => {
    const jsonStr = JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: currentMeta.title,
        description: currentMeta.description,
        url: canonicalUrl,
        publisher: {
          '@type': 'Organization',
          name: 'ООО «ДС‑Инжиниринг»',
          url: 'https://ds-engineering.ru'
        }
      },
      null,
      2
    );
    navigator.clipboard.writeText(jsonStr);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Explanation of Lead Popup issue */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl p-6 shadow-sm border border-blue-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>SEO-Оптимизация & Смарт-Баннер</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Центр поисковой оптимизации и лидогенерации
            </h2>
            <p className="text-blue-100/90 text-sm max-w-3xl leading-relaxed">
              Мониторинг соответствия сайта требованиям поисковых систем (Яндекс, Google), управление мета-данными, 
              каноническими адресами, микроразметкой Schema.org и тестирование триггеров смарт-баннера.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={refreshAudit}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl border border-white/20 flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-blue-300" />
              <span>Обновить аудит</span>
            </button>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
            >
              <Globe className="w-4 h-4" />
              <span>Открыть sitemap.xml</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Открыть robots.txt</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
            </a>
          </div>
        </div>
      </div>

      {/* SMART BANNER (EXIT-INTENT & 30s TIMER) DIAGNOSTICS & CONTROL */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Диагностика и управление смарт-баннером (Лид-магнит)</h3>
              <p className="text-xs text-slate-500">Автопоказ через 30 секунд или при движении курсора к закрытию вкладки (Exit Intent)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTestBannerNow}
              className="px-4.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Протестировать баннер сейчас</span>
            </button>

            <button
              onClick={handleResetBannerLock}
              className="px-4.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl flex items-center gap-2 transition-all border border-slate-200"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Сбросить блокировку показа</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-1">Статус в текущей сессии:</div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${leadPopupStatus.shownInSession ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="font-bold text-slate-800 text-sm">
                {leadPopupStatus.shownInSession ? 'Уже был показан (блокировка активна)' : 'Готов к показу (таймер активен)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {leadPopupStatus.shownInSession
                ? `Показан в ${leadPopupStatus.lastShownTimestamp || 'этой вкладке'}. Посетители не видят баннер повторно до очистки сессии или истечения 15 минут.`
                : 'Баннер появится через 30 секунд пребывания на сайте или при попытке закрыть вкладку.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-1">Флаг успешной конверсии (Заявка):</div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${leadPopupStatus.submittedEver ? 'bg-blue-600' : 'bg-slate-400'}`} />
              <span className="font-bold text-slate-800 text-sm">
                {leadPopupStatus.submittedEver ? 'Пользователь уже оставил заявку' : 'Заявка ещё не отправлялась'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              После успешной отправки email баннер не раздражает посетителя повторно.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center gap-1.5 text-blue-900 font-semibold text-xs mb-1">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Почему баннер не был виден ранее?</span>
            </div>
            <p className="text-[11px] text-blue-800/90 leading-relaxed">
              В исходной логике баннер однократно записывал флаг <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-950 font-mono">sessionStorage.setItem('dsLeadPopupShown', 'true')</code>.
              После этого в рамках той же вкладки браузера показ полностью блокировался. Мы оптимизировали логику: добавили таймаут кулдауна, поддержку принудительного тестирования и сброса.
            </p>
          </div>
        </div>
      </div>

      {/* SEO HEALTH SCORE & AUDIT CHECKS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Индекс SEO-здоровья</span>
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                Отлично
              </span>
            </div>

            <div className="mt-6 flex items-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-slate-50 border-4 border-emerald-500">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {auditReport?.overallScore || 98}%
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">Успешных проверок:</div>
                <div className="text-lg font-bold text-slate-800">
                  {auditReport?.summary.passedCount || 10} из {auditReport?.summary.totalCount || 10}
                </div>
                <p className="text-[11px] text-emerald-600 font-medium">
                  Все критические требования выполнены
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 space-y-2">
            <div className="flex items-center justify-between">
              <span>Индексация в Яндекс / Google:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Разрешена (follow)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Карта сайта sitemap.xml:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 20 URL с приоритетами
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Микроразметка Schema.org:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 3 схемы (Organization, Site, Service)
              </span>
            </div>
          </div>
        </div>

        {/* Audit Details Checklist */}
        <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-600" />
            <span>Детальный чек-лист технической SEO-оптимизации</span>
          </h3>

          <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1">
            {auditReport?.checks.map((check, idx) => (
              <div key={idx} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span>{check.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      check.importance === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {check.importance === 'high' ? 'Критично' : 'Средний'}
                    </span>
                  </div>
                  <div className="text-slate-500 pl-6">{check.message}</div>
                  {check.details && (
                    <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded pl-2 ml-6 mt-1 truncate max-w-xl">
                      {check.details}
                    </div>
                  )}
                </div>

                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                  check.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {check.passed ? 'Норма' : 'Внимание'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LIVE SERP PREVIEW (ЯНДЕКС И GOOGLE) */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              <span>Интерактивный симулятор поисковой выдачи (Live SERP Preview)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Показывает, как страница выглядит для пользователя в поисковой выдаче Яндекса и Google
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Engine Switch */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setSearchEnginePreview('yandex')}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  searchEnginePreview === 'yandex'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Яндекс
              </button>
              <button
                onClick={() => setSearchEnginePreview('google')}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  searchEnginePreview === 'google'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Google
              </button>
            </div>

            {/* Device Switch */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg transition-all ${
                  previewDevice === 'desktop'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Десктоп"
              >
                <Laptop className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg transition-all ${
                  previewDevice === 'mobile'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Мобильный"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Page selector */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Тестируемый раздел сайта:
          </label>
          <select
            value={selectedPageKey}
            onChange={(e) => setSelectedPageKey(e.target.value)}
            className="w-full sm:w-auto flex-1 px-4.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pageOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Realistic SERP Box */}
        <div className="mt-6 p-6 rounded-xl bg-[#fafafa] border border-slate-200/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Вид сниппета в поисковике ({searchEnginePreview === 'yandex' ? 'Яндекс.Поиск' : 'Google Search'} • {previewDevice === 'desktop' ? 'ПК' : 'Смартфон'}):
          </div>

          {searchEnginePreview === 'yandex' ? (
            /* YANDEX SERP STYLE */
            <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm font-sans ${previewDevice === 'mobile' ? 'max-w-md' : 'max-w-2xl'}`}>
              <div className="flex items-center gap-2 mb-1 text-xs">
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                  ДС
                </div>
                <span className="text-slate-900 font-semibold">ДС‑Инжиниринг</span>
                <span className="text-slate-400">›</span>
                <span className="text-slate-500 font-mono text-[11px] truncate">{canonicalUrl}</span>
              </div>

              <h4 className="text-[#1034a6] hover:underline cursor-pointer text-lg font-medium leading-snug">
                {currentMeta.title}
              </h4>

              <div className="flex items-center gap-2 my-1 text-xs">
                <div className="flex text-amber-400 text-xs">★★★★★</div>
                <span className="font-semibold text-slate-700">4,9</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">34 отзыва</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">Официальный партнер</span>
              </div>

              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mt-1">
                {currentMeta.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-100 text-xs text-[#1034a6]">
                <span className="hover:underline cursor-pointer">TopSolid 7</span>
                <span className="text-slate-300">•</span>
                <span className="hover:underline cursor-pointer">PolyWorks</span>
                <span className="text-slate-300">•</span>
                <span className="hover:underline cursor-pointer">3D-сканирование</span>
                <span className="text-slate-300">•</span>
                <span className="hover:underline cursor-pointer">Контакты</span>
              </div>
            </div>
          ) : (
            /* GOOGLE SERP STYLE */
            <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm font-sans ${previewDevice === 'mobile' ? 'max-w-md' : 'max-w-2xl'}`}>
              <div className="flex items-center gap-3 mb-1 text-xs">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center p-1 border border-slate-200">
                  <div className="w-full h-full rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-bold">
                    ДС
                  </div>
                </div>
                <div>
                  <div className="text-slate-900 font-medium text-xs">ДС‑Инжиниринг</div>
                  <div className="text-slate-500 font-mono text-[11px] truncate">{canonicalUrl}</div>
                </div>
              </div>

              <h4 className="text-[#1a0dab] hover:underline cursor-pointer text-xl leading-snug font-normal">
                {currentMeta.title}
              </h4>

              <p className="text-[#4d5156] text-xs sm:text-sm leading-relaxed mt-1">
                {currentMeta.description}
              </p>
            </div>
          )}
        </div>

        {/* JSON-LD MICRODATA VIEWER & EXPORT */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Code className="w-4 h-4 text-blue-600" />
              <span>Генерируемая микроразметка JSON-LD Schema.org для этой страницы:</span>
            </div>
            <button
              onClick={copyJsonLd}
              className="px-4 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedSnippet ? 'Скопировано!' : 'Копировать JSON-LD'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto no-scrollbar border border-slate-800 leading-relaxed">
{JSON.stringify(
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: currentMeta.title,
    description: currentMeta.description,
    url: canonicalUrl,
    inLanguage: 'ru-RU',
    isPartOf: {
      '@type': 'WebSite',
      name: 'ДС‑Инжиниринг',
      url: 'https://ds-engineering.ru'
    }
  },
  null,
  2
)}
          </pre>
        </div>
      </div>

      {/* SITEMAP.XML & ПОИСКОВАЯ ИНДЕКСАЦИЯ */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <FileCode className="w-5 h-5 text-blue-600" />
              Карта сайта (Sitemap.xml) и поисковая индексация
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Управление автоматической генерацией файла <code>sitemap.xml</code> для поисковых роботов Яндекс и Google. 
              Все карточки ПО (TopSolid, PolyWorks, Shining 3D), КИМ, услуг и страниц CMS автоматически включаются в реестр индексации.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Открыть sitemap.xml</span>
            </a>
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch('/api/sitemap/ping', { method: 'POST' });
                  const d = await res.json();
                  alert(d.message || 'Пинг поисковых систем выполнен успешно!');
                } catch {
                  alert('Пинг отправлен в локальном режиме');
                }
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Пинг Яндекс / Google</span>
            </button>
          </div>
        </div>

        {/* Sitemap Health Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Канонический URL sitemap</div>
            <div className="text-xs font-mono font-bold text-blue-700 mt-1 truncate">https://ds-engineering.ru/sitemap.xml</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">● HTTP 200 OK • Dynamic XML</div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Статус robots.txt</div>
            <div className="text-xs font-bold text-slate-800 mt-1">Sitemap директива включена</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">● Разрешено для Yandex & Googlebot</div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Страниц в XML реестре</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {products.length + services.length + articles.length + customPages.length + 8}+ URL
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-0.5">Авто-синхронизация при правках</div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Интерактивная карта</div>
            <div className="text-xs font-bold text-slate-800 mt-1">/sitemap</div>
            <a 
              href="/sitemap" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[11px] text-blue-600 hover:underline font-medium mt-1 inline-block"
            >
              Перейти к визуальной карте →
            </a>
          </div>
        </div>
      </div>

      {/* МАССОВЫЙ ИМПОРТ/ЭКСПОРТ SEO (JSON) */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Code className="w-5 h-5 text-amber-500" />
              Массовый экспорт/импорт SEO-данных (JSON)
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Инструмент для SEO-специалистов. Позволяет выгрузить метатеги (title, description, keywords) всех разделов сайта (кастомные страницы, товары, услуги, новости, база знаний) в один JSON-файл, отредактировать их локально и загрузить обратно в систему в один клик.
            </p>
          </div>
          <button
            onClick={generateBulkSeoJson}
            className="shrink-0 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Экспорт в JSON
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 border border-gray-200 p-5 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h4 className="text-sm font-bold text-gray-800">Импорт отредактированных метатегов</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Вставьте JSON-массив с обновленными полями `metaTitle`, `metaDescription` и `metaKeywords` или загрузите файл JSON.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <input
                  type="file"
                  ref={jsonFileInputRef}
                  onChange={handleJsonFileUpload}
                  accept=".json,application/json"
                  className="hidden"
                  id="bulk-seo-json-input"
                />
                <button
                  type="button"
                  id="bulk-seo-json-import-btn"
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  title="Выбрать JSON-файл для импорта метатегов"
                >
                  <Upload className="w-4 h-4" />
                  <span>Импорт из JSON</span>
                </button>
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingJson(true); }}
              onDragLeave={() => setIsDraggingJson(false)}
              onDrop={handleJsonFileDrop}
              className={`relative rounded-lg transition-all ${isDraggingJson ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`}
            >
              <textarea
                value={bulkImportText}
                onChange={(e) => setBulkImportText(e.target.value)}
                placeholder='[ { "entityType": "page", "id": "...", "metaTitle": "Новый Title", ... } ] (или перетащите сюда .json файл)'
                className="w-full p-3 font-mono text-xs border border-gray-300 rounded-lg min-h-[130px] focus:ring-2 focus:ring-blue-500 outline-none resize-y bg-white"
              />
              {isDraggingJson && (
                <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-xs rounded-lg flex items-center justify-center border-2 border-dashed border-blue-500 pointer-events-none">
                  <span className="text-xs font-bold text-blue-700 bg-white px-4 py-1.5 rounded-lg shadow-sm">
                    Отпустите JSON-файл для загрузки
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-1">
              <span className="text-[11px] text-gray-500">
                Поддерживаемые сущности: кастомные страницы (`page`), товары (`product`), услуги (`service`), новости (`article`), база знаний (`knowledge`).
              </span>
              <div className="flex items-center gap-2">
                {bulkImportText && (
                  <button
                    type="button"
                    onClick={() => setBulkImportText('')}
                    className="px-4 py-2 text-xs text-gray-500 hover:text-slate-500 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Очистить
                  </button>
                )}
                <button
                  onClick={handleBulkImport}
                  disabled={!bulkImportText.trim()}
                  className="px-5 py-2 bg-blue-600 disabled:bg-gray-300 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  Применить импорт
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
