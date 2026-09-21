import React, { useState, useMemo } from 'react';
import { 
  Type, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Search, 
  ExternalLink, 
  Check, 
  Sparkles, 
  Home, 
  Building2, 
  Phone, 
  Wrench, 
  Layers, 
  PanelBottom, 
  HelpCircle,
  FileJson,
  Eye,
  ArrowRight,
  ShieldCheck,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  DEFAULT_SITE_TEXTS, 
  SITE_TEXTS_METADATA, 
  SiteTextsData, 
  SiteTextMetaCategory 
} from '../../data/defaultSiteTexts';

interface CmsSiteTextsTabProps {
  onNavigateToSite?: () => void;
}

export const CmsSiteTextsTab: React.FC<CmsSiteTextsTabProps> = ({ onNavigateToSite }) => {
  const { 
    siteTexts, 
    textConstants, 
    textConstantsRecords, 
    textConstantsLoading, 
    textConstantsSource, 
    refreshTextConstants, 
    updateSiteTexts, 
    resetSiteTexts, 
    importSiteTexts, 
    showToast, 
    navigateTo 
  } = useApp();

  const [formData, setFormData] = useState<SiteTextsData>(() => JSON.parse(JSON.stringify(siteTexts || DEFAULT_SITE_TEXTS)));
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [previewSection, setPreviewSection] = useState<keyof SiteTextsData | null>('home');

  // Keep local form in sync if context changes from outside
  React.useEffect(() => {
    if (siteTexts) {
      setFormData(JSON.parse(JSON.stringify(siteTexts)));
    }
  }, [siteTexts]);

  const handleFieldChange = (category: keyof SiteTextsData, key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [key]: value,
      },
    }));
  };

  const handleResetSingleField = (category: keyof SiteTextsData, key: string) => {
    const defaultValue = (DEFAULT_SITE_TEXTS[category] as any)?.[key] || '';
    handleFieldChange(category, key, defaultValue);
    showToast(`Поле «${key}» сброшено к исходному значению`);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const success = await updateSiteTexts(formData);
      if (success) {
        showToast('Все текстовые константы успешно сохранены в базе данных!');
      } else {
        showToast('Ошибка при сохранении текстовых констант.');
      }
    } catch (err) {
      console.error(err);
      showToast('Ошибка при сохранении данных.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAll = async () => {
    setIsSaving(true);
    try {
      const success = await resetSiteTexts();
      if (success) {
        setFormData(JSON.parse(JSON.stringify(DEFAULT_SITE_TEXTS)));
        showToast('Все тексты успешно сброшены к значениям по умолчанию!');
      }
    } catch (err) {
      console.error(err);
      showToast('Ошибка при сбросе данных.');
    } finally {
      setIsSaving(false);
      setShowResetConfirm(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ds_engineering_site_texts_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Файл с текстами успешно экспортирован');
  };

  const handleImportJson = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      const success = await importSiteTexts(parsed);
      if (success) {
        setFormData(parsed);
        setShowImportModal(false);
        setImportJsonText('');
        showToast('Текстовые константы успешно импортированы!');
      } else {
        showToast('Не удалось импортировать данные');
      }
    } catch (err) {
      showToast('Некорректный формат JSON файла');
    }
  };

  // Filter categories and fields based on search & active tab
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return SITE_TEXTS_METADATA.filter(cat => {
      if (activeCategory !== 'all' && cat.id !== activeCategory) {
        return false;
      }
      return true;
    }).map(cat => {
      if (!q) return cat;

      const filteredFields = cat.fields.filter(f => {
        const val = String((formData[cat.id] as any)?.[f.key] || '').toLowerCase();
        return (
          f.label.toLowerCase().includes(q) ||
          f.key.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          val.includes(q)
        );
      });

      return {
        ...cat,
        fields: filteredFields,
      };
    }).filter(cat => cat.fields.length > 0);
  }, [searchQuery, activeCategory, formData]);

  const getCategoryIcon = (catId: keyof SiteTextsData) => {
    switch (catId) {
      case 'home': return <Home className="w-4 h-4 text-blue-600" />;
      case 'about': return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'contacts': return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'services': return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'catalogs': return <Layers className="w-4 h-4 text-purple-600" />;
      case 'footer': return <PanelBottom className="w-4 h-4 text-slate-500" />;
      default: return <Type className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Info */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-md border border-blue-800/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Глобальные константы и контент системных страниц</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Редактирование текстов, лозунгов и реквизитов сайта
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Правьте заголовки страниц, описания услуг, ключевые цифры опыта и контакты без изменения программного кода и без риска сломать 3D-просмотрщики или адаптивную верстку. Все изменения сохраняются в базу данных.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Сохранить тексты</span>
            </button>
            <button
              onClick={handleExportJson}
              className="px-4.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              title="Экспорт всех текстовых констант в JSON"
            >
              <Download className="w-4 h-4" />
              <span>Экспорт JSON</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              title="Импорт текстовых констант из JSON"
            >
              <Upload className="w-4 h-4" />
              <span>Импорт</span>
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4.5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              title="Сброс всех полей к начальным значениям"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Сброс</span>
            </button>
          </div>
        </div>
      </div>

      {/* SQL & API Persistence Notice */}
      <div className="bg-slate-50 border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-700 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl mt-0.5 shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900">СУБД PostgreSQL 17 + REST API</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-mono text-[11px] font-bold">таблица text_constants</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-mono text-[11px] font-bold">GET /api/text-constants</span>
              {textConstantsSource === 'database_table' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-300/60 rounded-md font-semibold text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  БД активна (PostgreSQL)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-800 border border-amber-300/60 rounded-md font-semibold text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Резервный кэш
                </span>
              )}
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md font-mono text-[11px] font-bold">
                {textConstantsRecords.length > 0 ? `${textConstantsRecords.length} констант в БД` : `${Object.keys(textConstants).length} констант`}
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Все текстовые поля сайта сохраняются в таблице <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-900">text_constants</code> и синхронизируются с локальным кэшем <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-900">data/site_texts.json</code> для отказоустойчивости при недоступности или перезагрузке базы данных.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={async () => {
              setIsRefreshing(true);
              try {
                await refreshTextConstants();
                showToast('Данные текстовых констант успешно синхронизированы с БД!');
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing || textConstantsLoading}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
            title="Перезагрузить актуальные константы из таблицы text_constants"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'Синхронизация...' : 'Обновить из БД'}</span>
          </button>
          <a
            href="/api/text-constants"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-blue-600 border border-blue-200 font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            title="Открыть JSON эндпоинт констант"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Открыть API</span>
          </a>
        </div>
      </div>

      {/* Filter and Navigation Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1 md:pb-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-500 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Все разделы
          </button>
          {SITE_TEXTS_METADATA.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.title}</span>
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[240px] md:w-72 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или тексту..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-500 text-xs font-bold p-0.5"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Categories & Field Editors */}
      <form onSubmit={handleSave} className="space-y-6">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 space-y-3">
            <Search className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">Ничего не найдено</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              По запросу «{searchQuery}» текстовых констант не найдено. Попробуйте изменить формулировку или выберите другой раздел.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl text-xs hover:bg-blue-100 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          filteredCategories.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 space-y-5">
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    {getCategoryIcon(cat.id)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{cat.title}</h3>
                    <p className="text-xs text-gray-500">{cat.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (cat.id === 'home') navigateTo('home');
                      else if (cat.id === 'about') navigateTo('about');
                      else if (cat.id === 'contacts') navigateTo('contacts');
                      else if (cat.id === 'services') navigateTo('services');
                      else if (cat.id === 'catalogs') navigateTo('hardware');
                      else navigateTo('home');
                    }}
                    className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-blue-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Открыть на сайте</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Category Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.fields.map(field => {
                  const currentValue = (formData[cat.id] as any)?.[field.key] ?? '';
                  const defaultValue = (DEFAULT_SITE_TEXTS[cat.id] as any)?.[field.key] ?? '';
                  const isModified = currentValue !== defaultValue;
                  const isFullWidth = field.multiline || currentValue.length > 80;

                  return (
                    <div 
                      key={field.key} 
                      className={`p-4 rounded-xl border transition-all ${
                        isModified 
                          ? 'bg-amber-50/40 border-amber-200 ring-1 ring-amber-200/50' 
                          : 'bg-slate-50/70 border-gray-200 hover:border-gray-300'
                      } ${isFullWidth ? 'md:col-span-2' : ''}`}
                    >
                      {/* Field Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-gray-900">
                              {field.label}
                            </label>
                            {isModified && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                                Изменено
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {field.description} • <code className="text-[10px] font-mono text-blue-600">{cat.id}.{field.key}</code>
                          </div>
                        </div>

                        {isModified && (
                          <button
                            type="button"
                            onClick={() => handleResetSingleField(cat.id, field.key)}
                            title="Сбросить к значению по умолчанию"
                            className="p-1 text-gray-400 hover:text-amber-700 hover:bg-amber-100 rounded-md transition-colors text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span className="text-[10px]">Сбросить</span>
                          </button>
                        )}
                      </div>

                      {/* Input Control */}
                      {field.multiline ? (
                        <textarea
                          rows={Math.min(6, Math.max(2, Math.ceil(currentValue.length / 70)))}
                          value={currentValue}
                          onChange={(e) => handleFieldChange(cat.id, field.key, e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden transition-all leading-relaxed"
                          placeholder={`Введите ${field.label.toLowerCase()}...`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => handleFieldChange(cat.id, field.key, e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden transition-all"
                          placeholder={`Введите ${field.label.toLowerCase()}...`}
                        />
                      )}

                      {/* Characters count */}
                      <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400">
                        <span>Символов: {currentValue.length}</span>
                        {isModified && (
                          <span className="text-amber-700 font-medium">Значение по умолчанию отличается</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Bottom Save Bar */}
        <div className="sticky bottom-6 z-20 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Все изменения сохраняются в БД PostgreSQL и синхронизируются со страницами сайта.</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Check className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>Сохранить все изменения</span>
            </button>
          </div>
        </div>
      </form>

      {/* JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
                <FileJson className="w-5 h-5 text-blue-600" />
                <span>Импорт текстовых констант</span>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-slate-500 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Вставьте валидный JSON-объект структуры <code className="text-blue-600 font-mono">SiteTextsData</code> (полученный ранее через кнопку «Экспорт JSON»).
            </p>

            <textarea
              rows={10}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{\n  "home": {\n    "heroTitle": "..."\n  }\n}'
              className="w-full px-4 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono text-[11px] text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-500 font-semibold text-xs rounded-xl transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleImportJson}
                disabled={!importJsonText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                Применить импорт
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-sm space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Сбросить все тексты к значениям по умолчанию?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Все пользовательские изменения заголовков, показателей и контактных данных будут заменены на стандартные заводские константы. Это действие нельзя отменить.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-500 font-semibold text-xs rounded-xl transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Да, сбросить все тексты
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
