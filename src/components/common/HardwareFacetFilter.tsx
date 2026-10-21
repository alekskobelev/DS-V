import React from 'react';
import {
  SlidersHorizontal,
  Gauge,
  Box,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import {
  AccuracyTier,
  FormFactor,
  ACCURACY_TIER_CONFIG,
  FORM_FACTOR_CONFIG,
} from '../../utils/hardwareMetrology.ts';

export interface HardwareFacetFilterProps {
  selectedAccuracy: AccuracyTier[];
  onChangeAccuracy: (tiers: AccuracyTier[]) => void;
  selectedFormFactors: FormFactor[];
  onChangeFormFactors: (factors: FormFactor[]) => void;
  onlyGostReestr: boolean;
  onChangeOnlyGostReestr: (onlyGost: boolean) => void;
  onResetAll: () => void;

  // Counts calculated across the relevant set
  accuracyCounts: Record<AccuracyTier, number>;
  formFactorCounts: Record<FormFactor, number>;
  gostReestrCount: number;
  totalFilteredCount: number;
  totalAvailableCount: number;

  // Collapsible view state
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const HardwareFacetFilter: React.FC<HardwareFacetFilterProps> = ({
  selectedAccuracy,
  onChangeAccuracy,
  selectedFormFactors,
  onChangeFormFactors,
  onlyGostReestr,
  onChangeOnlyGostReestr,
  onResetAll,
  accuracyCounts,
  formFactorCounts,
  gostReestrCount,
  totalFilteredCount,
  totalAvailableCount,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const hasActiveFilters =
    selectedAccuracy.length > 0 ||
    selectedFormFactors.length > 0 ||
    onlyGostReestr;

  const toggleAccuracy = (tier: AccuracyTier) => {
    if (selectedAccuracy.includes(tier)) {
      onChangeAccuracy(selectedAccuracy.filter((t) => t !== tier));
    } else {
      onChangeAccuracy([...selectedAccuracy, tier]);
    }
  };

  const toggleFormFactor = (factor: FormFactor) => {
    if (selectedFormFactors.includes(factor)) {
      onChangeFormFactors(selectedFormFactors.filter((f) => f !== factor));
    } else {
      onChangeFormFactors([...selectedFormFactors, factor]);
    }
  };

  const activeFiltersCount =
    selectedAccuracy.length +
    selectedFormFactors.length +
    (onlyGostReestr ? 1 : 0);

  return (
    <div
      id="hardware-facet-filter-panel"
      className="bg-white rounded-xl border border-gray-200 shadow-xs mb-6 overflow-hidden transition-all duration-200"
    >
      {/* Panel Top Header Bar */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-2xs shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                Фильтрация по параметрам
              </h3>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[11px] font-bold shadow-2xs">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Показано: <span className="font-semibold text-gray-800">{totalFilteredCount}</span> из {totalAvailableCount} моделей
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          {hasActiveFilters && (
            <button
              id="facet-reset-button"
              type="button"
              onClick={onResetAll}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer shadow-2xs"
              title="Сбросить все параметры фильтрации"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить фильтры</span>
            </button>
          )}

          {onToggleCollapse && (
            <button
              id="facet-toggle-collapse-button"
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-white rounded-xl border border-gray-200 transition-colors cursor-pointer"
              title={isCollapsed ? 'Развернуть панель фильтров' : 'Свернуть панель фильтров'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Filter Blocks Container */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* БЛОК 1: ТОЧНОСТЬ (ПОГРЕШНОСТЬ) */}
            <div id="filter-block-accuracy" className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-blue-600 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Точность (погрешность)
                  </h4>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">Класс точности</span>
              </div>

              <div className="space-y-1.5">
                {/* 1.1 Сверхточные (до 0,01 мм) */}
                <label
                  htmlFor="facet-accuracy-ultra"
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none group ${
                    selectedAccuracy.includes('ultra')
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900 shadow-2xs'
                      : 'border-transparent hover:border-gray-200 hover:bg-slate-50/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        id="facet-accuracy-ultra"
                        checked={selectedAccuracy.includes('ultra')}
                        onChange={() => toggleAccuracy('ultra')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors cursor-pointer"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-medium tracking-tight whitespace-nowrap block">
                        {ACCURACY_TIER_CONFIG.ultra.label}
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate">
                        КИМ и оптические микросканеры (до 10 мкм)
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 transition-colors ${
                      selectedAccuracy.includes('ultra')
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-700'
                    }`}
                  >
                    {accuracyCounts.ultra}
                  </span>
                </label>

                {/* 1.2 Высокоточные (0,01 мм — 0,05 мм) */}
                <label
                  htmlFor="facet-accuracy-high"
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none group ${
                    selectedAccuracy.includes('high')
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900 shadow-2xs'
                      : 'border-transparent hover:border-gray-200 hover:bg-slate-50/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        id="facet-accuracy-high"
                        checked={selectedAccuracy.includes('high')}
                        onChange={() => toggleAccuracy('high')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors cursor-pointer"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-medium tracking-tight whitespace-nowrap block">
                        {ACCURACY_TIER_CONFIG.high.label}
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate">
                        Лазерные сканеры, руки и трекеры
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 transition-colors ${
                      selectedAccuracy.includes('high')
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-700'
                    }`}
                  >
                    {accuracyCounts.high}
                  </span>
                </label>

                {/* 1.3 Базовые (от 0,05 мм и выше) */}
                <label
                  htmlFor="facet-accuracy-basic"
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none group ${
                    selectedAccuracy.includes('basic')
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900 shadow-2xs'
                      : 'border-transparent hover:border-gray-200 hover:bg-slate-50/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        id="facet-accuracy-basic"
                        checked={selectedAccuracy.includes('basic')}
                        onChange={() => toggleAccuracy('basic')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors cursor-pointer"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-medium tracking-tight whitespace-nowrap block">
                        {ACCURACY_TIER_CONFIG.basic.label}
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate">
                        Универсальные системы и дальномерные сканеры
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 transition-colors ${
                      selectedAccuracy.includes('basic')
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-700'
                    }`}
                  >
                    {accuracyCounts.basic}
                  </span>
                </label>
              </div>
            </div>

            {/* БЛОК 2: ФОРМ-ФАКТОР */}
            <div id="filter-block-formfactor" className="space-y-3 md:pl-6 pt-4 md:pt-0">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-blue-600 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Форм-фактор
                  </h4>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">Конструктив</span>
              </div>

              <div className="space-y-1.5">
                {/* 2.1 Стационарные */}
                <label
                  htmlFor="facet-formfactor-stationary"
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none group ${
                    selectedFormFactors.includes('stationary')
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900 shadow-2xs'
                      : 'border-transparent hover:border-gray-200 hover:bg-slate-50/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        id="facet-formfactor-stationary"
                        checked={selectedFormFactors.includes('stationary')}
                        onChange={() => toggleFormFactor('stationary')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors cursor-pointer"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-medium tracking-tight whitespace-nowrap block">
                        {FORM_FACTOR_CONFIG.stationary.label}
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate">
                        Мостовые КИМ, столы, настольные сканеры
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 transition-colors ${
                      selectedFormFactors.includes('stationary')
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-700'
                    }`}
                  >
                    {formFactorCounts.stationary}
                  </span>
                </label>

                {/* 2.2 Портативные */}
                <label
                  htmlFor="facet-formfactor-portable"
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none group ${
                    selectedFormFactors.includes('portable')
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900 shadow-2xs'
                      : 'border-transparent hover:border-gray-200 hover:bg-slate-50/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        id="facet-formfactor-portable"
                        checked={selectedFormFactors.includes('portable')}
                        onChange={() => toggleFormFactor('portable')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors cursor-pointer"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-medium tracking-tight whitespace-nowrap block">
                        {FORM_FACTOR_CONFIG.portable.label}
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate">
                        Ручные сканеры, мобильные руки, трекеры
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 transition-colors ${
                      selectedFormFactors.includes('portable')
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-700'
                    }`}
                  >
                    {formFactorCounts.portable}
                  </span>
                </label>
              </div>
            </div>

            {/* БЛОК 3: МЕТРОЛОГИЧЕСКИЙ СТАТУС */}
            <div id="filter-block-metrology" className="space-y-3 md:pl-6 pt-4 md:pt-0">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Метрологический статус
                  </h4>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Госреестр СИ
                </span>
              </div>

              <div>
                <label
                  htmlFor="facet-metrology-gost"
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none group ${
                    onlyGostReestr
                      ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950 shadow-2xs'
                      : 'border-gray-200 bg-slate-50/40 hover:bg-emerald-50/20 hover:border-emerald-200 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        onlyGostReestr
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold tracking-tight leading-tight">
                        Только приборы из Госреестра СИ РФ
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                        Поверка по ГОСТ Р / ISO 10360 (ФГИС «АРШИН»)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                        onlyGostReestr
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-gray-200 text-slate-500 group-hover:border-emerald-300 group-hover:text-emerald-700'
                      }`}
                    >
                      {gostReestrCount}
                    </span>

                    {/* Interactive Toggle Switch */}
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        id="facet-metrology-gost"
                        checked={onlyGostReestr}
                        onChange={(e) => onChangeOnlyGostReestr(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 shadow-2xs"></div>
                    </div>
                  </div>
                </label>

                {/* Certified guarantee note */}
                <div className="mt-2.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-gray-100 flex items-center gap-2 text-[11px] text-gray-500">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Поставка с первичной поверкой и свидетельством</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE FILTER CHIPS STRIP */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 text-[11px] font-medium mr-1">
                Активные фильтры:
              </span>

              {selectedAccuracy.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => toggleAccuracy(tier)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <span>{ACCURACY_TIER_CONFIG[tier].label}</span>
                  <X className="w-3 h-3 text-blue-600" />
                </button>
              ))}

              {selectedFormFactors.map((factor) => (
                <button
                  key={factor}
                  type="button"
                  onClick={() => toggleFormFactor(factor)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <span>{FORM_FACTOR_CONFIG[factor].label}</span>
                  <X className="w-3 h-3 text-indigo-600" />
                </button>
              ))}

              {onlyGostReestr && (
                <button
                  type="button"
                  onClick={() => onChangeOnlyGostReestr(false)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Госреестр СИ РФ</span>
                  <X className="w-3 h-3 text-emerald-600" />
                </button>
              )}

              <button
                type="button"
                onClick={onResetAll}
                className="ml-auto text-blue-600 hover:text-blue-800 text-[11px] font-bold underline cursor-pointer"
              >
                Очистить всё
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
