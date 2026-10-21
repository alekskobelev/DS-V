import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  Layers, 
  Box, 
  Wrench, 
  FileText, 
  ArrowRight, 
  SlidersHorizontal, 
  Gauge, 
  TrendingUp, 
  Calculator,
  ChevronRight,
  ExternalLink,
  Tag
} from 'lucide-react';
import { PRODUCTS_DATA, SERVICES_DATA } from '../../data/mockData';
import { Product, ServiceItem, PageId } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { useSearchAnalytics } from '../../hooks/useSearchAnalytics';

export type GlobalSearchFilter = 'all' | 'hardware' | 'software' | 'services';

export interface GlobalSearchProps {
  mode?: 'dropdown' | 'modal' | 'inline';
  placeholder?: string;
  autoFocus?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  onSelect?: (item: { type: 'hardware' | 'software' | 'service'; id: string; name: string }) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  mode = 'dropdown',
  placeholder = 'Поиск по оборудованию, ПО и услугам (TopSolid, PolyWorks, КИМ, 3D-сканеры)...',
  autoFocus = false,
  isOpen = true,
  onClose,
  className = '',
  onSelect
}) => {
  const { navigateTo, openConfiguratorModal, openRoiCalculatorModal } = useApp();
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<GlobalSearchFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearches();
  const {
    trackSearch,
    trackSearchDebounced,
    trackSearchResultClick,
    trackSearchFilterChange,
    trackSearchCleared,
  } = useSearchAnalytics();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const cleanQuery = query.toLowerCase().trim();

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (!cleanQuery && activeFilter === 'all') return [];
    return PRODUCTS_DATA.filter((p) => {
      if (activeFilter === 'services') return false;
      if (activeFilter === 'hardware' && p.type !== 'hardware') return false;
      if (activeFilter === 'software' && p.type !== 'software') return false;

      if (!cleanQuery) return true;

      const nameMatch = p.name.toLowerCase().includes(cleanQuery);
      const descMatch = (p.shortDescription || '').toLowerCase().includes(cleanQuery) || 
                        (p.fullDescription || '').toLowerCase().includes(cleanQuery);
      const brandMatch = (p.brand || '').toLowerCase().includes(cleanQuery);
      const categoryMatch = (p.category || '').toLowerCase().includes(cleanQuery);
      const specsMatch = Array.isArray(p.specs)
        ? p.specs.some((s: any) => (s.label || '').toLowerCase().includes(cleanQuery) || (s.value || '').toLowerCase().includes(cleanQuery))
        : Object.entries(p.specs || {}).some(([k, v]) => k.toLowerCase().includes(cleanQuery) || String(v).toLowerCase().includes(cleanQuery));

      return nameMatch || descMatch || brandMatch || categoryMatch || specsMatch;
    });
  }, [cleanQuery, activeFilter]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    if (!cleanQuery && activeFilter === 'all') return [];
    if (activeFilter === 'hardware' || activeFilter === 'software') return [];

    return SERVICES_DATA.filter((s) => {
      if (!cleanQuery) return true;

      const titleMatch = s.title.toLowerCase().includes(cleanQuery);
      const shortDescMatch = (s.shortDesc || '').toLowerCase().includes(cleanQuery);
      const fullDescMatch = (s.fullDesc || '').toLowerCase().includes(cleanQuery);
      const resultsMatch = (s.deliverables || []).some((r) => r.toLowerCase().includes(cleanQuery));
      const equipmentMatch = (s.equipmentUsed || []).some((eq) => eq.toLowerCase().includes(cleanQuery));

      return titleMatch || shortDescMatch || fullDescMatch || resultsMatch || equipmentMatch;
    });
  }, [cleanQuery, activeFilter]);

  const totalResultsCount = filteredProducts.length + filteredServices.length;

  // Flattened items for keyboard navigation
  const allResults = useMemo(() => {
    const list: Array<{
      type: 'product' | 'service';
      item: Product | ServiceItem;
    }> = [];
    filteredProducts.forEach((p) => list.push({ type: 'product', item: p }));
    filteredServices.forEach((s) => list.push({ type: 'service', item: s }));
    return list;
  }, [filteredProducts, filteredServices]);

  // Keyboard navigation (Up/Down/Enter/Esc)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (cleanQuery) {
        trackSearch(cleanQuery, totalResultsCount, activeFilter, 'enter');
      }
      if (selectedIndex >= 0 && selectedIndex < allResults.length) {
        const selected = allResults[selectedIndex];
        handleSelectItem(selected.type, selected.item);
      } else if (cleanQuery && allResults.length > 0) {
        const first = allResults[0];
        handleSelectItem(first.type, first.item);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (onClose) onClose();
      else setIsFocused(false);
    }
  };

  const handleSelectItem = (type: 'product' | 'service', item: Product | ServiceItem) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
      const itemName = 'name' in item ? item.name : item.title;
      trackSearchResultClick(
        { id: item.id, name: itemName, type: type === 'product' ? (item as Product).type : 'service' },
        query.trim(),
        selectedIndex >= 0 ? selectedIndex : undefined,
        activeFilter
      );
    }

    if (onSelect) {
      if (type === 'product') {
        const p = item as Product;
        onSelect({ type: p.type === 'software' ? 'software' : 'hardware', id: p.id, name: p.name });
      } else {
        const s = item as ServiceItem;
        onSelect({ type: 'service', id: s.id, name: s.title });
      }
    } else {
      if (type === 'product') {
        const p = item as Product;
        navigateTo(p.type === 'software' ? 'software' : 'hardware', p.id);
      } else {
        const s = item as ServiceItem;
        navigateTo('services', s.id);
      }
    }

    if (onClose) {
      onClose();
    }
    setIsFocused(false);
  };

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.trim()})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 rounded-xs px-0.5 font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const showDropdown = isFocused || mode === 'modal' || cleanQuery.length > 0;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Bar Input Container */}
      <div
        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all duration-200 ${
          isDark
            ? 'bg-slate-900/90 border-slate-700/80 text-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
            : 'bg-white border-slate-200 text-slate-900 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
        }`}
      >
        <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setSelectedIndex(-1);
            trackSearchDebounced(val, totalResultsCount, activeFilter);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 bg-transparent text-xs sm:text-sm font-medium outline-none placeholder:text-slate-400 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              trackSearchCleared(query);
              setQuery('');
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Очистить"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
          >
            ESC
          </button>
        )}
      </div>

      {/* Category Tabs Filter */}
      {showDropdown && (
        <div
          className={`mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs`}
        >
          <button
            type="button"
            onClick={() => {
              setActiveFilter('all');
              trackSearchFilterChange('all', query);
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Все {cleanQuery ? `(${totalResultsCount})` : ''}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilter('hardware');
              trackSearchFilterChange('hardware', query);
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'hardware'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-amber-500" />
            <span>Оборудование {cleanQuery ? `(${filteredProducts.filter(p => p.type === 'hardware').length})` : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilter('software');
              trackSearchFilterChange('software', query);
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'software'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>ПО {cleanQuery ? `(${filteredProducts.filter(p => p.type === 'software').length})` : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilter('services');
              trackSearchFilterChange('services', query);
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'services'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-500" />
            <span>Услуги {cleanQuery ? `(${filteredServices.length})` : ''}</span>
          </button>
        </div>
      )}

      {/* Dropdown Results Box */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={`${
            mode === 'dropdown'
              ? 'absolute top-full left-0 right-0 mt-2 z-50 shadow-2xl'
              : 'relative mt-2'
          } rounded-2xl border p-2 sm:p-3 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar transition-all ${
            isDark
              ? 'bg-slate-900 border-slate-700/80 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}
        >
          {/* Quick empty query: Recent Searches & Presets */}
          {!cleanQuery && (
            <div className="space-y-3 p-2">
              {recentSearches.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Недавние поисковые запросы</span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-blue-500 hover:underline cursor-pointer"
                    >
                      Очистить
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setQuery(term);
                          inputRef.current?.focus();
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{term}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(term);
                          }}
                          className="hover:text-red-500 text-slate-400"
                        >
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Category Shortcuts */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Популярные разделы каталога
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('3D-сканер');
                      setActiveFilter('hardware');
                    }}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                      isDark ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700' : 'bg-slate-50 hover:bg-blue-50 border-slate-200'
                    }`}
                  >
                    <Box className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">3D-сканеры и КИМ</div>
                      <div className="text-[10px] text-slate-400">ScanLine, Shining 3D, PMT</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuery('TopSolid');
                      setActiveFilter('software');
                    }}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                      isDark ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700' : 'bg-slate-50 hover:bg-blue-50 border-slate-200'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">CAD/CAM TopSolid 7</div>
                      <div className="text-[10px] text-slate-400">ЧПУ, PDM и проектирование</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                      navigateTo('glossary');
                    }}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer sm:col-span-2 ${
                      isDark ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700' : 'bg-slate-50 hover:bg-blue-50 border-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400">Технический глоссарий инженера</div>
                      <div className="text-[10px] text-slate-400">GD&T, ISO 1101, кинематика станков, постпроцессоры, B-Rep, MPE</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results: Products */}
          {filteredProducts.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1 flex items-center justify-between">
                <span>Продукция ({filteredProducts.length})</span>
                <span className="text-[10px] text-blue-500 font-normal">Оборудование и ПО</span>
              </div>
              <div className="space-y-1">
                {filteredProducts.map((prod, idx) => {
                  const isSoftware = prod.type === 'software';
                  const isSelected = selectedIndex === idx;

                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleSelectItem('product', prod)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/80 dark:bg-blue-950/40'
                          : isDark
                          ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50/50 hover:bg-blue-50/60 border-slate-100 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Thumbnail / Icon */}
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden ${
                            isSoftware
                              ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-600'
                              : 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800 text-amber-600'
                          }`}
                        >
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : isSoftware ? (
                            <Layers className="w-5 h-5" />
                          ) : (
                            <Box className="w-5 h-5" />
                          )}
                        </div>

                        {/* Text details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs truncate text-slate-900 dark:text-white">
                              {highlightMatch(prod.name, cleanQuery)}
                            </span>
                            {prod.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {prod.badge}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              {prod.brand}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {highlightMatch(prod.shortDescription, cleanQuery)}
                          </p>
                        </div>
                      </div>

                      {/* Right action tag */}
                      <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-blue-500">
                        <span className="text-[10px] hidden sm:inline font-bold">
                          {isSoftware ? 'ПО' : 'Оборудование'}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results: Services */}
          {filteredServices.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1 flex items-center justify-between">
                <span>Инжиниринговые услуги ({filteredServices.length})</span>
                <span className="text-[10px] text-emerald-500 font-normal">Метрология и ЧПУ</span>
              </div>
              <div className="space-y-1">
                {filteredServices.map((service, idx) => {
                  const serviceIndex = filteredProducts.length + idx;
                  const isSelected = selectedIndex === serviceIndex;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleSelectItem('service', service)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/80 dark:bg-emerald-950/40'
                          : isDark
                          ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50/50 hover:bg-emerald-50/60 border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 shrink-0">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs truncate text-slate-900 dark:text-white">
                              {highlightMatch(service.title, cleanQuery)}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              Услуга
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {highlightMatch(service.shortDesc, cleanQuery)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-slate-400">
                        <span className="text-[10px] hidden sm:inline font-bold">Смета</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zero Results State */}
          {cleanQuery && totalResultsCount === 0 && (
            <div className="p-8 text-center space-y-2 text-slate-400">
              <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                По запросу «{query}» ничего не найдено
              </div>
              <p className="text-[11px] max-w-xs mx-auto">
                Попробуйте изменить формулировку (например: <em>TopSolid, 3D-сканирование, КИМ Mitutoyo, PolyWorks</em>).
              </p>
            </div>
          )}

          {/* Interactive Calculators & Presets Footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-2">
            <span className="hidden sm:inline">Навигация: ↑/↓ выбор, Enter переход, Esc закрыть</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  openConfiguratorModal();
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Конфигуратор СИ</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  openRoiCalculatorModal();
                }}
                className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <TrendingUp className="w-3 h-3" />
                <span>ROI-калькулятор</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
