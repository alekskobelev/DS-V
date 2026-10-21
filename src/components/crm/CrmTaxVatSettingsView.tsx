import React, { useState, useMemo } from 'react';
import { 
  Percent, 
  Globe, 
  ShieldCheck, 
  HelpCircle, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  Search, 
  Layers, 
  FileCheck, 
  ExternalLink,
  Calculator,
  Download,
  Info,
  X,
  Building2,
  Receipt
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  CrmTaxSettings, 
  VatCountryOverride, 
  VatCategoryOverride, 
  DEFAULT_COUNTRY_VAT_OVERRIDES, 
  DEFAULT_CATEGORY_VAT_OVERRIDES,
  DEFAULT_CRM_TAX_SETTINGS
} from '../../data/mockCrmData';

export const CrmTaxVatSettingsView: React.FC = () => {
  const { crmSettings, updateCrmSettings, showToast } = useApp();

  // Local draft state
  const [draftSettings, setDraftSettings] = useState<CrmTaxSettings>(() => {
    return {
      ...DEFAULT_CRM_TAX_SETTINGS,
      ...crmSettings,
      countryOverrides: Array.isArray(crmSettings?.countryOverrides) && crmSettings.countryOverrides.length > 0
        ? JSON.parse(JSON.stringify(crmSettings.countryOverrides))
        : JSON.parse(JSON.stringify(DEFAULT_COUNTRY_VAT_OVERRIDES)),
      categoryOverrides: Array.isArray(crmSettings?.categoryOverrides) && crmSettings.categoryOverrides.length > 0
        ? JSON.parse(JSON.stringify(crmSettings.categoryOverrides))
        : JSON.parse(JSON.stringify(DEFAULT_CATEGORY_VAT_OVERRIDES))
    };
  });

  const [countrySearch, setCountrySearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Country Rule Modal State
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [editingCountryRule, setEditingCountryRule] = useState<VatCountryOverride | null>(null);
  const [countryFormName, setCountryFormName] = useState('');
  const [countryFormCode, setCountryFormCode] = useState('');
  const [countryFormRate, setCountryFormRate] = useState<number>(0);
  const [countryFormIsExport, setCountryFormIsExport] = useState<boolean>(true);
  const [countryFormLegalReason, setCountryFormLegalReason] = useState('');
  const [countryFormCurrency, setCountryFormCurrency] = useState('RUB');
  const [countryFormNotes, setCountryFormNotes] = useState('');

  // Category Rule Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryRule, setEditingCategoryRule] = useState<VatCategoryOverride | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormTarget, setCatFormTarget] = useState('equipment');
  const [catFormRate, setCatFormRate] = useState<number>(22);
  const [catFormIsExempt, setCatFormIsExempt] = useState(false);
  const [catFormLegalReason, setCatFormLegalReason] = useState('');
  const [catFormNotes, setCatFormNotes] = useState('');

  // Interactive Tax Simulator State
  const [simAmount, setSimAmount] = useState<number>(1000000);
  const [simCountry, setSimCountry] = useState<string>('Казахстан');
  const [simCategory, setSimCategory] = useState<string>('equipment');

  const baseVatPresets = [
    { rate: 22, label: '22% (Стандарт РФ 2026)', desc: 'Действующая основная ставка НДС в РФ', badge: 'Стандарт', color: 'blue' },
    { rate: 20, label: '20% (Прежний норматив)', desc: 'Ставка до налоговой корректировки', badge: 'Архив', color: 'slate' },
    { rate: 10, label: '10% (Льготная ставка)', desc: 'Отдельные научные и медицинские изделия', badge: 'Льгота', color: 'emerald' },
    { rate: 0, label: '0% (Освобождение / Экспорт)', desc: 'ВЭД, экспортные операции и спецрежимы', badge: 'Экспорт / 0%', color: 'amber' },
  ];

  // Helper to mark changes
  const updateDraft = (updates: Partial<CrmTaxSettings>) => {
    setDraftSettings(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  // Save changes to AppContext and backend
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCrmSettings(draftSettings);
      setHasChanges(false);
      showToast(`Настройки налогообложения и ставки НДС (${draftSettings.defaultVatRate}%) успешно сохранены`);
    } catch (e) {
      showToast('Ошибка при сохранении настроек НДС');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default presets
  const handleResetToDefaults = () => {
    if (window.confirm('Восстановить базовые эталонные настройки НДС: 22% (РФ) и 0% (Экспорт в ЕАЭС/СНГ)?')) {
      setDraftSettings(JSON.parse(JSON.stringify(DEFAULT_CRM_TAX_SETTINGS)));
      setHasChanges(true);
      showToast('Параметры сброшены к нормативным значениям (22% / 0% Экспорт)');
    }
  };

  // Filtered country rules
  const filteredCountryRules = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return draftSettings.countryOverrides;
    return draftSettings.countryOverrides.filter(
      r => r.country.toLowerCase().includes(q) || 
           r.code.toLowerCase().includes(q) || 
           r.legalReason.toLowerCase().includes(q) ||
           (r.notes && r.notes.toLowerCase().includes(q))
    );
  }, [draftSettings.countryOverrides, countrySearch]);

  // Country Rule Handlers
  const handleOpenAddCountryModal = () => {
    setEditingCountryRule(null);
    setCountryFormName('');
    setCountryFormCode('');
    setCountryFormRate(0);
    setCountryFormIsExport(true);
    setCountryFormLegalReason('ст. 164 НК РФ, Приложение № 18 к Договору о ЕАЭС');
    setCountryFormCurrency('RUB');
    setCountryFormNotes('');
    setIsCountryModalOpen(true);
  };

  const handleOpenEditCountryModal = (rule: VatCountryOverride) => {
    setEditingCountryRule(rule);
    setCountryFormName(rule.country);
    setCountryFormCode(rule.code);
    setCountryFormRate(rule.vatRate);
    setCountryFormIsExport(rule.isExport);
    setCountryFormLegalReason(rule.legalReason);
    setCountryFormCurrency(rule.currency || 'RUB');
    setCountryFormNotes(rule.notes || '');
    setIsCountryModalOpen(true);
  };

  const handleSaveCountryRule = () => {
    if (!countryFormName.trim()) {
      alert('Укажите наименование страны');
      return;
    }

    const newRule: VatCountryOverride = {
      id: editingCountryRule ? editingCountryRule.id : `vat-${Date.now()}`,
      country: countryFormName.trim(),
      code: countryFormCode.trim().toUpperCase() || 'XX',
      vatRate: Number(countryFormRate) || 0,
      isExport: countryFormIsExport,
      legalReason: countryFormLegalReason.trim() || 'ст. 164 НК РФ',
      enabled: editingCountryRule ? editingCountryRule.enabled : true,
      currency: countryFormCurrency.trim() || 'RUB',
      notes: countryFormNotes.trim()
    };

    let updatedRules: VatCountryOverride[];
    if (editingCountryRule) {
      updatedRules = draftSettings.countryOverrides.map(r => r.id === editingCountryRule.id ? newRule : r);
    } else {
      updatedRules = [...draftSettings.countryOverrides, newRule];
    }

    updateDraft({ countryOverrides: updatedRules });
    setIsCountryModalOpen(false);
    showToast(`Правило для страны «${newRule.country}» сохранено (${newRule.vatRate}%)`);
  };

  const handleDeleteCountryRule = (id: string, countryName: string) => {
    if (window.confirm(`Удалить правило переопределения ставки НДС для страны «${countryName}»?`)) {
      const updated = draftSettings.countryOverrides.filter(r => r.id !== id);
      updateDraft({ countryOverrides: updated });
      showToast(`Правило для страны «${countryName}» удалено`);
    }
  };

  const handleToggleCountryRule = (id: string) => {
    const updated = draftSettings.countryOverrides.map(r => {
      if (r.id === id) return { ...r, enabled: !r.enabled };
      return r;
    });
    updateDraft({ countryOverrides: updated });
  };

  // Category Rule Handlers
  const handleOpenAddCategoryModal = () => {
    setEditingCategoryRule(null);
    setCatFormName('');
    setCatFormTarget('equipment');
    setCatFormRate(22);
    setCatFormIsExempt(false);
    setCatFormLegalReason('п. 3 ст. 164 НК РФ');
    setCatFormNotes('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (rule: VatCategoryOverride) => {
    setEditingCategoryRule(rule);
    setCatFormName(rule.categoryName);
    setCatFormTarget(rule.targetCategory);
    setCatFormRate(rule.vatRate);
    setCatFormIsExempt(rule.isExempt);
    setCatFormLegalReason(rule.legalReason);
    setCatFormNotes(rule.notes || '');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategoryRule = () => {
    if (!catFormName.trim()) {
      alert('Укажите наименование категории');
      return;
    }

    const newRule: VatCategoryOverride = {
      id: editingCategoryRule ? editingCategoryRule.id : `vat-cat-${Date.now()}`,
      categoryName: catFormName.trim(),
      targetCategory: catFormTarget,
      vatRate: Number(catFormRate) || 0,
      isExempt: catFormIsExempt,
      legalReason: catFormLegalReason.trim() || 'ст. 164 НК РФ',
      enabled: editingCategoryRule ? editingCategoryRule.enabled : true,
      notes: catFormNotes.trim()
    };

    let updatedList: VatCategoryOverride[];
    if (editingCategoryRule) {
      updatedList = draftSettings.categoryOverrides.map(c => c.id === editingCategoryRule.id ? newRule : c);
    } else {
      updatedList = [...draftSettings.categoryOverrides, newRule];
    }

    updateDraft({ categoryOverrides: updatedList });
    setIsCategoryModalOpen(false);
    showToast(`Правило для категории «${newRule.categoryName}» сохранено`);
  };

  const handleDeleteCategoryRule = (id: string, name: string) => {
    if (window.confirm(`Удалить правило для категории «${name}»?`)) {
      const updated = draftSettings.categoryOverrides.filter(c => c.id !== id);
      updateDraft({ categoryOverrides: updated });
      showToast(`Правило для категории «${name}» удалено`);
    }
  };

  const handleToggleCategoryRule = (id: string) => {
    const updated = draftSettings.categoryOverrides.map(c => {
      if (c.id === id) return { ...c, enabled: !c.enabled };
      return c;
    });
    updateDraft({ categoryOverrides: updated });
  };

  // Export Settings as JSON file
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(draftSettings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ds_crm_tax_vat_settings_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Конфигурация налогов выгружена в JSON');
  };

  // Live Simulation Calculation
  const simulationResult = useMemo(() => {
    let resolvedRate = draftSettings.defaultVatRate;
    let ruleSource = 'Базовая ставка НДС компании';
    let isExport = false;
    let legalGround = 'п. 3 ст. 164 НК РФ';

    // 1. Country Override Check
    const matchedCountry = draftSettings.countryOverrides.find(
      c => c.enabled && (c.country.toLowerCase() === simCountry.toLowerCase() || c.code.toLowerCase() === simCountry.toLowerCase())
    );

    if (matchedCountry) {
      resolvedRate = matchedCountry.vatRate;
      isExport = matchedCountry.isExport;
      ruleSource = `Правило страны: ${matchedCountry.country} (${matchedCountry.code})`;
      legalGround = matchedCountry.legalReason;
    } else if (simCountry !== 'Россия' && draftSettings.exportZeroRateEnabled) {
      resolvedRate = draftSettings.exportVatRate ?? 0;
      isExport = true;
      ruleSource = 'Международный экспорт (по умолчанию 0%)';
      legalGround = 'пп. 1 п. 1 ст. 164 НК РФ';
    }

    // 2. Category Exemption Check (e.g. Russian Software)
    const matchedCategory = draftSettings.categoryOverrides.find(
      cat => cat.enabled && cat.targetCategory === simCategory
    );
    if (matchedCategory && matchedCategory.isExempt) {
      resolvedRate = matchedCategory.vatRate;
      ruleSource = `Освобождение по категории: ${matchedCategory.categoryName}`;
      legalGround = matchedCategory.legalReason;
    }

    const subtotal = simAmount;
    const vatSum = Math.round(subtotal * (resolvedRate / 100));
    const total = subtotal + vatSum;

    return {
      subtotal,
      resolvedRate,
      vatSum,
      total,
      isExport,
      ruleSource,
      legalGround
    };
  }, [draftSettings, simAmount, simCountry, simCategory]);

  const activeCountriesCount = draftSettings.countryOverrides.filter(r => r.enabled).length;
  const activeCategoriesCount = draftSettings.categoryOverrides.filter(r => r.enabled).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Action Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Управление ставками НДС и налоговым режимом
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Базовая ставка: {draftSettings.defaultVatRate}%
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Экспорт: {draftSettings.exportVatRate}% (ст. 164 НК РФ)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Административная панель задания базовой ставки НДС (22%), правил нулевой ставки для внешнеэкономического экспорта (ЕАЭС/СНГ) и товарных льгот
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportJson}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Выгрузить правила в формате JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Экспорт JSON</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить к 22%</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 active:scale-98 animate-pulse'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Сохранение...' : hasChanges ? 'Сохранить изменения *' : 'Сохранено'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Базовая ставка (РФ)</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{draftSettings.defaultVatRate}%</div>
            <div className="text-[11px] text-blue-600 font-medium">Основной внутренний рынок</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-black">
            %
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Экспортный тариф</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{draftSettings.exportVatRate}%</div>
            <div className="text-[11px] text-emerald-600 font-medium">ст. 164 НК РФ / ЕАЭС</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Правила по странам</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{activeCountriesCount} из {draftSettings.countryOverrides.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Активных переопределений</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Товарные льготы</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{activeCategoriesCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">Реестр ПО и др. (ст. 149)</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid Section 1 & 2: Base Rate + Export Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Base VAT Rate Card (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-black text-sm">
                1
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                  Базовая ставка НДС компании (РФ)
                </h3>
                <p className="text-xs text-slate-500">Применяется по умолчанию для всех сделок и расчетов</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {/* Input Value */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Значение базовой ставки (%):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={draftSettings.defaultVatRate}
                    onChange={(e) => updateDraft({ defaultVatRate: Number(e.target.value) || 0 })}
                    className="w-full h-12 pl-4 pr-12 text-xl font-black bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white focus:border-blue-600 outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-lg text-slate-400">
                    %
                  </div>
                </div>
              </div>

              {/* Presets List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Быстрый выбор пресета:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {baseVatPresets.map((p) => {
                    const isSelected = draftSettings.defaultVatRate === p.rate;
                    return (
                      <button
                        key={p.rate}
                        type="button"
                        onClick={() => updateDraft({ defaultVatRate: p.rate })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs">{p.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {p.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          {p.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Legal Notice Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Нормативное соответствие:</span>
            </div>
            <p className="leading-relaxed">
              Согласно Налоговому кодексу РФ (п. 3 ст. 164 НК РФ), базовая ставка НДС 22% применяется при реализации измерительного оборудования, сервисных услуг и сканирования резидентам РФ.
            </p>
          </div>
        </div>

        {/* Right Column: International Export Overrides Card (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-black text-sm">
              2
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                Международный экспорт и ставка 0% (ВЭД / ЕАЭС / СНГ)
              </h3>
              <p className="text-xs text-slate-500">Автоматическое применение льготной ставки для зарубежных поставок</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Primary Export Toggle */}
            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={draftSettings.exportZeroRateEnabled}
                onChange={(e) => updateDraft({ exportZeroRateEnabled: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div className="space-y-1">
                <div className="font-bold text-xs text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Включить нулевую ставку (0% НДС) для экспортных контрактов</span>
                </div>
                <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                  При оформлении сделок с нерезидентами РФ и покупателями из Казахстана, Беларуси, Узбекистана, Армении, Кыргызстана и др. стран автоматически устанавливается ставка <strong>0% НДС</strong> (ст. 164 НК РФ).
                </p>
              </div>
            </label>

            {/* Export Sub-options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftSettings.autoDetectCountryRate}
                  onChange={(e) => updateDraft({ autoDetectCountryRate: e.target.checked })}
                  className="mt-0.5 w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                />
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Автоопределение по стране
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Автоматически подтягивать ставку при выборе страны в реквизитах сделки
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftSettings.allowVatOverride}
                  onChange={(e) => updateDraft({ allowVatOverride: e.target.checked })}
                  className="mt-0.5 w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                />
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Разрешить ручной выбор
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Менеджеры могут корректировать ставку в карточке ТКП и калькуляторе
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftSettings.showVatBreakdownInProposals}
                  onChange={(e) => updateDraft({ showVatBreakdownInProposals: e.target.checked })}
                  className="mt-0.5 w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                />
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Детализация в ТКП и PDF
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Отображать строки «Без НДС», «Сумма НДС» и «Итого» в печатных формах
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftSettings.requireExportDocuments}
                  onChange={(e) => updateDraft({ requireExportDocuments: e.target.checked })}
                  className="mt-0.5 w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                />
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Контроль документов ВЭД
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Напоминать о подтверждении 0% ставки в ФНС в течение 180 дней
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Country-Specific Override Rules Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                Таблица переопределений ставок по странам ({draftSettings.countryOverrides.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Индивидуальные ставки НДС, валюта контракта и ссылки на нормативные акты для каждой юрисдикции
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск страны..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-44 sm:w-56 h-9 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={handleOpenAddCountryModal}
              className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить страну</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-3">Страна / Код</th>
                <th className="p-3">Ставка НДС</th>
                <th className="p-3">Тип операции</th>
                <th className="p-3">Нормативное основание</th>
                <th className="p-3">Валюта</th>
                <th className="p-3 text-center">Статус</th>
                <th className="p-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCountryRules.map((rule) => {
                return (
                  <tr key={rule.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{rule.country}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                          {rule.code}
                        </span>
                      </div>
                      {rule.notes && (
                        <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">{rule.notes}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black ${
                        rule.vatRate === 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : rule.vatRate === 22
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {rule.vatRate === 0 ? '0% (Экспорт)' : `${rule.vatRate}%`}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                      {rule.isExport ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          <span>Экспорт ВЭД</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 font-bold">Внутренний рынок РФ</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 max-w-xs text-[11px] leading-tight">
                      {rule.legalReason}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-600 dark:text-slate-300">
                      {rule.currency || 'RUB'}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleCountryRule(rule.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors cursor-pointer ${
                          rule.enabled
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {rule.enabled ? 'Активно' : 'Отключено'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCountryModal(rule)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Редактировать правило"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCountryRule(rule.id, rule.country)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Удалить правило"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Category Overrides (e.g. Software & Education) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                Переопределения по товарным категориям и видам услуг ({draftSettings.categoryOverrides.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Специальные налоговые режимы: реестр отечественного ПО Минцифры (0% Без НДС) и др.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddCategoryModal}
            className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить категорию</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {draftSettings.categoryOverrides.map((cat) => {
            return (
              <div 
                key={cat.id} 
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">{cat.categoryName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      cat.isExempt
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {cat.isExempt ? 'Без НДС (0%)' : `${cat.vatRate}%`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    <strong>Основание:</strong> {cat.legalReason}
                  </div>
                  {cat.notes && (
                    <div className="text-[10px] text-slate-400 mt-1">{cat.notes}</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => handleToggleCategoryRule(cat.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors cursor-pointer ${
                      cat.enabled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.enabled ? 'Активно' : 'Отключено'}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditCategoryModal(cat)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategoryRule(cat.id, cat.categoryName)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 5: Interactive VAT Sandbox / Simulation Tool */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-blue-900/60 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-blue-800/50">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-white">
              Интерактивный симулятор расчета налога (Tax Sandbox)
            </h3>
            <p className="text-xs text-blue-200">
              Проверьте, как система автоматически применит базовую ставку, правила экспорта или льготы в режиме реального времени
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1">
              Сумма спецификации (₽ без НДС):
            </label>
            <input
              type="number"
              min="0"
              step="10000"
              value={simAmount}
              onChange={(e) => setSimAmount(Number(e.target.value) || 0)}
              className="w-full h-10 px-3 bg-white/10 border border-blue-400/30 rounded-xl text-white font-bold text-sm focus:border-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1">
              Страна регистрации Заказчика:
            </label>
            <select
              value={simCountry}
              onChange={(e) => setSimCountry(e.target.value)}
              className="w-full h-10 px-3 bg-slate-800 border border-blue-400/30 rounded-xl text-white font-bold text-xs focus:border-blue-400 outline-none"
            >
              <option value="Россия">Россия (РФ)</option>
              <option value="Казахстан">Казахстан (ЕАЭС — 0% НДС)</option>
              <option value="Беларусь">Беларусь (ЕАЭС — 0% НДС)</option>
              <option value="Узбекистан">Узбекистан (СНГ — 0% НДС)</option>
              <option value="Армения">Армения (ЕАЭС — 0% НДС)</option>
              <option value="Кыргызстан">Кыргызстан (ЕАЭС — 0% НДС)</option>
              <option value="Китай">Китай (Международный экспорт)</option>
              <option value="Турция">Турция (Международный экспорт)</option>
              <option value="ОАЭ">ОАЭ (Международный экспорт)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1">
              Категория товара / услуги:
            </label>
            <select
              value={simCategory}
              onChange={(e) => setSimCategory(e.target.value)}
              className="w-full h-10 px-3 bg-slate-800 border border-blue-400/30 rounded-xl text-white font-bold text-xs focus:border-blue-400 outline-none"
            >
              <option value="equipment">Контрольно-измерительное оборудование и КИМ</option>
              <option value="software">Программное обеспечение (Реестр отечественного ПО)</option>
              <option value="services">Услуги 3D-сканирования и реверс-инжиниринга</option>
              <option value="support">Сервисное обслуживание и калибровка КИМ</option>
              <option value="training">Обучение операторов КИМ</option>
            </select>
          </div>
        </div>

        {/* Calculation Result Card */}
        <div className="p-4 rounded-xl bg-blue-900/40 border border-blue-700/60 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
          <div>
            <div className="text-[10px] text-blue-300 font-bold uppercase">Сумма без НДС</div>
            <div className="text-base font-extrabold text-white mt-0.5">{simulationResult.subtotal.toLocaleString('ru-RU')} ₽</div>
          </div>

          <div>
            <div className="text-[10px] text-blue-300 font-bold uppercase">Примененная ставка</div>
            <div className="text-base font-black text-amber-300 mt-0.5">
              {simulationResult.resolvedRate}% {simulationResult.isExport ? '(Экспорт)' : ''}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-blue-300 font-bold uppercase">Сумма налога (НДС)</div>
            <div className="text-base font-extrabold text-white mt-0.5">{simulationResult.vatSum.toLocaleString('ru-RU')} ₽</div>
          </div>

          <div className="bg-blue-600/60 p-3 rounded-lg border border-blue-400/40 text-right sm:text-left">
            <div className="text-[10px] text-blue-100 font-bold uppercase">ИТОГО К ОПЛАТЕ</div>
            <div className="text-lg font-black text-white">{simulationResult.total.toLocaleString('ru-RU')} ₽</div>
          </div>

          <div className="sm:col-span-4 text-[11px] text-blue-200 border-t border-blue-800/40 pt-2 flex flex-wrap items-center justify-between gap-2">
            <span><strong>Источник правила:</strong> {simulationResult.ruleSource}</span>
            <span className="font-mono text-[10px] bg-blue-950/80 px-2 py-0.5 rounded border border-blue-700/40">
              {simulationResult.legalGround}
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Add/Edit Country Rule */}
      {isCountryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>{editingCountryRule ? 'Редактировать правило для страны' : 'Новое правило ставки для страны'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCountryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Наименование страны *</label>
                  <input
                    type="text"
                    value={countryFormName}
                    onChange={(e) => setCountryFormName(e.target.value)}
                    placeholder="Например: Казахстан"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Код ISO</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={countryFormCode}
                    onChange={(e) => setCountryFormCode(e.target.value)}
                    placeholder="KZ"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold uppercase outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ставка НДС (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={countryFormRate}
                    onChange={(e) => setCountryFormRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Валюта контракта</label>
                  <input
                    type="text"
                    value={countryFormCurrency}
                    onChange={(e) => setCountryFormCurrency(e.target.value)}
                    placeholder="RUB / KZT"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={countryFormIsExport}
                  onChange={(e) => setCountryFormIsExport(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Классифицировать операцию как международный экспорт (ВЭД)
                </span>
              </label>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Нормативное обоснование</label>
                <input
                  type="text"
                  value={countryFormLegalReason}
                  onChange={(e) => setCountryFormLegalReason(e.target.value)}
                  placeholder="ст. 164 НК РФ, Протокол ЕАЭС"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Инженерно-юридические примечания</label>
                <textarea
                  rows={2}
                  value={countryFormNotes}
                  onChange={(e) => setCountryFormNotes(e.target.value)}
                  placeholder="Особенности подтверждения вывоза или таможенного декларирования..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCountryModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveCountryRule}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                Сохранить правило
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Category Rule */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>{editingCategoryRule ? 'Редактировать товарную категорию' : 'Новое правило для категории'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Наименование категории / товара *</label>
                <input
                  type="text"
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  placeholder="ПО из реестра Минцифры"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Тип воронки</label>
                  <select
                    value={catFormTarget}
                    onChange={(e) => setCatFormTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold outline-none"
                  >
                    <option value="equipment">Оборудование</option>
                    <option value="software">Программное обеспечение</option>
                    <option value="services">Инжиниринговые услуги</option>
                    <option value="support">Сервис и ТО</option>
                    <option value="training">Обучение</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ставка НДС (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={catFormRate}
                    onChange={(e) => setCatFormRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={catFormIsExempt}
                  onChange={(e) => setCatFormIsExempt(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Освобождение от уплаты НДС (ст. 149 НК РФ / Без НДС)
                </span>
              </label>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Нормативное обоснование</label>
                <input
                  type="text"
                  value={catFormLegalReason}
                  onChange={(e) => setCatFormLegalReason(e.target.value)}
                  placeholder="пп. 26 п. 2 ст. 149 НК РФ"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Примечания</label>
                <textarea
                  rows={2}
                  value={catFormNotes}
                  onChange={(e) => setCatFormNotes(e.target.value)}
                  placeholder="Условия применения льготы..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveCategoryRule}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                Сохранить категорию
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
