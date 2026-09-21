import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  SlidersHorizontal,
  Trash2,
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
  Download,
  Printer,
  Share2,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Search,
  Maximize2,
  Minimize2,
  Sparkles,
  Info,
  Target,
  Compass,
  Scan,
  Cpu,
  ShieldCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  PhoneCall,
  BarChart3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { PRODUCTS_DATA } from '../../data/mockData';
import { buildCategorizedSpecs, exportComparisonToExcel, SpecCategory } from '../../utils/compareUtils';
import { ProductPickerModal } from './ProductPickerModal';
import { HardwareComparisonChart } from '../common/HardwareComparisonChart';

export const CompareDrawer: React.FC = () => {
  const {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isCompareDrawerOpen,
    setIsCompareDrawerOpen,
    openContactModal,
    navigateTo,
    showToast,
  } = useApp();

  // Internal slots state: fixed 3 slots [Slot 0, Slot 1, Slot 2]
  const [slotProducts, setSlotProducts] = useState<(Product | null)[]>([null, null, null]);
  const [onlyDifferences, setOnlyDifferences] = useState<boolean>(false);
  const [paramSearch, setParamSearch] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showChartSection, setShowChartSection] = useState<boolean>(true);
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    overview: true,
    metrology: true,
    dimensions: true,
    optics: true,
    software: true,
    environment: true,
    general: true,
  });

  // Synchronize slots with AppContext compareList
  useEffect(() => {
    const slots: (Product | null)[] = [null, null, null];
    compareList.slice(0, 3).forEach((prod, idx) => {
      slots[idx] = prod;
    });
    setSlotProducts(slots);
  }, [compareList]);

  // Handle Escape key to close
  useEffect(() => {
    if (isCompareDrawerOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && pickerSlotIndex === null) {
          setIsCompareDrawerOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isCompareDrawerOpen, pickerSlotIndex, setIsCompareDrawerOpen]);

  // Active products count
  const activeCount = useMemo(() => {
    return slotProducts.filter((p): p is Product => p !== null).length;
  }, [slotProducts]);

  // Build categorized specs for current products
  const categories = useMemo(() => {
    return buildCategorizedSpecs(slotProducts);
  }, [slotProducts]);

  // Filtered categories according to "onlyDifferences" and "paramSearch"
  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => {
        const filteredRows = cat.rows.filter((row) => {
          if (onlyDifferences && !row.isDifferent) return false;
          if (paramSearch.trim()) {
            const q = paramSearch.toLowerCase();
            const matchLabel = row.label.toLowerCase().includes(q);
            const matchValues = row.values.some((v) => v && v.toLowerCase().includes(q));
            if (!matchLabel && !matchValues) return false;
          }
          return true;
        });
        return {
          ...cat,
          rows: filteredRows,
        };
      })
      .filter((cat) => cat.rows.length > 0);
  }, [categories, onlyDifferences, paramSearch]);

  // Count total differences
  const totalDifferencesCount = useMemo(() => {
    let count = 0;
    categories.forEach((cat) => {
      cat.rows.forEach((row) => {
        if (row.isDifferent) count++;
      });
    });
    return count;
  }, [categories]);

  // Set product into specific slot
  const handleSelectProduct = (product: Product, slotIndex: number) => {
    const currentActive = slotProducts.filter((p): p is Product => p !== null && p.id !== product.id);
    const newSlots: (Product | null)[] = [...slotProducts];
    
    // If this product was in another slot, remove it from that slot first
    const existingIndex = newSlots.findIndex((p) => p?.id === product.id);
    if (existingIndex !== -1 && existingIndex !== slotIndex) {
      newSlots[existingIndex] = null;
    }

    newSlots[slotIndex] = product;
    setSlotProducts(newSlots);

    // Sync back to AppContext
    const validProducts = newSlots.filter((p): p is Product => p !== null);
    // Directly replace compare list via clear and batch add
    clearCompare();
    validProducts.forEach((p) => addToCompare(p));
    showToast(`«${product.name}» добавлен в слот ${slotIndex + 1}`);
  };

  // Remove product from a slot
  const handleRemoveFromSlot = (slotIndex: number) => {
    const prod = slotProducts[slotIndex];
    if (prod) {
      removeFromCompare(prod.id);
      const newSlots = [...slotProducts];
      newSlots[slotIndex] = null;
      setSlotProducts(newSlots);
    }
  };

  // Apply a 3-product preset
  const handleApplyPreset = (products: Product[]) => {
    clearCompare();
    products.slice(0, 3).forEach((p) => addToCompare(p));
    const newSlots: (Product | null)[] = [null, null, null];
    products.slice(0, 3).forEach((p, i) => {
      newSlots[i] = p;
    });
    setSlotProducts(newSlots);
    showToast('Комплект моделей загружен в сравнительную таблицу');
  };

  // Export to Excel handler
  const handleExportExcel = () => {
    if (activeCount === 0) {
      showToast('Добавьте хотя бы один товар для экспорта');
      return;
    }
    exportComparisonToExcel(slotProducts, categories);
    showToast('Сравнительная спецификация экспортирована в Excel');
  };

  // Share comparison link
  const handleShare = () => {
    const ids = slotProducts.filter((p): p is Product => p !== null).map((p) => p.id);
    if (ids.length === 0) {
      showToast('Добавьте товары для формирования ссылки');
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('compare', ids.join(','));
    navigator.clipboard.writeText(url.toString());
    showToast('Ссылка на сравнительную таблицу скопирована в буфер обмена');
  };

  // Print comparison
  const handlePrint = () => {
    window.print();
  };

  // Category icons mapper
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Target':
        return <Target className="w-4 h-4 text-emerald-600" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-blue-600" />;
      case 'Scan':
        return <Scan className="w-4 h-4 text-amber-600" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-purple-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-teal-600" />;
      case 'Info':
        return <Info className="w-4 h-4 text-indigo-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <>
      {/* Floating Bottom Bar (visible on catalog/site when items are in compare list and drawer is closed) */}
      {!isCompareDrawerOpen && activeCount > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1E3A8A] text-white px-4.5 sm:px-5 py-3 rounded-xl shadow-sm border border-blue-600/50 flex items-center justify-between gap-3 sm:gap-6 animate-in slide-in-from-bottom-5 w-[calc(100%-1.5rem)] sm:w-auto max-w-xl backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {activeCount}/3
            </div>
            <div className="text-xs min-w-0">
              <div className="font-bold text-white flex items-center gap-2">
                <span>Сравнение товаров ({activeCount} из 3)</span>
                <span className="text-[10px] bg-blue-600/80 text-blue-100 px-2 py-0.5 rounded-full font-semibold">
                  {activeCount === 3 ? 'Все слоты заполнены' : `Свободно слотов: ${3 - activeCount}`}
                </span>
              </div>
              <div className="text-[11px] text-blue-200 truncate max-w-[260px] sm:max-w-xs mt-0.5">
                {slotProducts
                  .filter((p): p is Product => p !== null)
                  .map((p) => p.name)
                  .join(' • ')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCompareDrawerOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Сравнить ({activeCount})</span>
            </button>
            <button
              onClick={clearCompare}
              className="p-2 text-blue-200 hover:text-red-300 transition-colors rounded-lg hover:bg-white/10"
              title="Очистить список сравнения"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Comparative Interface Modal / Fullscreen Drawer */}
      {isCompareDrawerOpen && (
        <div
          onClick={() => setIsCompareDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 lg:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-slate-900 shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${
              isFullscreen
                ? 'fixed inset-0 rounded-none w-full h-full z-50'
                : 'w-full max-w-[1440px] h-full sm:max-h-[95vh] sm:rounded-xl border border-gray-200 dark:border-slate-800'
            }`}
          >
            {/* 1. Header Toolbar */}
            <div className="bg-[#1E3A8A] text-white p-4 md:px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Сравнительный анализ параметров оборудования и ПО
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 bg-blue-700 text-amber-300 font-bold rounded-full border border-blue-600">
                      {activeCount} из 3 моделей
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 hidden sm:block truncate">
                    Сопоставление метрологических характеристик, диапазонов, погрешностей и комплектаций «ДС-Инжиниринг»
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Export Excel */}
                <button
                  onClick={handleExportExcel}
                  disabled={activeCount === 0}
                  className="px-2.5 sm:px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Экспорт спецификации в Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Excel</span>
                </button>

                {/* Print / PDF */}
                <button
                  onClick={handlePrint}
                  disabled={activeCount === 0}
                  className="p-2 sm:px-4 sm:py-1.5 text-xs bg-blue-800/60 hover:bg-blue-800 text-blue-100 hover:text-white rounded-xl transition-colors font-medium border border-blue-700/60 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  title="Распечатать или сохранить в PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Печать</span>
                </button>

                {/* Share Link */}
                <button
                  onClick={handleShare}
                  disabled={activeCount === 0}
                  className="p-2 sm:px-4 sm:py-1.5 text-xs bg-blue-800/60 hover:bg-blue-800 text-blue-100 hover:text-white rounded-xl transition-colors font-medium border border-blue-700/60 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  title="Поделиться ссылкой на сравнение"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Поделиться</span>
                </button>

                {/* Clear all */}
                {activeCount > 0 && (
                  <button
                    onClick={clearCompare}
                    className="p-2 sm:px-4 sm:py-1.5 text-xs text-rose-200 hover:text-white bg-rose-900/40 hover:bg-rose-900/80 rounded-xl transition-colors font-medium border border-rose-800/40 flex items-center gap-1.5 cursor-pointer"
                    title="Очистить все слоты"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Очистить</span>
                  </button>
                )}

                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors hidden sm:flex cursor-pointer"
                  title={isFullscreen ? 'Свернуть в окно' : 'Развернуть на весь экран'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsCompareDrawerOpen(false)}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. Interactive Controls Sub-Bar (Difference Filter, Param Search) */}
            <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                {/* Recharts Chart Toggle */}
                <button
                  id="compare-chart-toggle-btn"
                  onClick={() => setShowChartSection(!showChartSection)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    showChartSection
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-300 dark:border-slate-700'
                  }`}
                  title="Показать / скрыть диаграмму метрологических параметров"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Диаграмма Recharts</span>
                </button>

                {/* Only Differences Toggle */}
                <button
                  onClick={() => setOnlyDifferences(!onlyDifferences)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    onlyDifferences
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-300 dark:border-slate-700'
                  }`}
                >
                  {onlyDifferences ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Только различия</span>
                  {totalDifferencesCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        onlyDifferences ? 'bg-white text-amber-600' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {totalDifferencesCount}
                    </span>
                  )}
                </button>

                {/* Parameter Search Filter */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={paramSearch}
                    onChange={(e) => setParamSearch(e.target.value)}
                    placeholder="Фильтр характеристик..."
                    className="pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-44 sm:w-60"
                  />
                  {paramSearch && (
                    <button
                      onClick={() => setParamSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status helper text */}
              <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-2">
                <span>Колонок для сравнения: <strong className="text-slate-800 dark:text-slate-200">3 слота</strong></span>
                {activeCount < 3 && (
                  <button
                    onClick={() => {
                      const firstEmpty = slotProducts.findIndex((p) => p === null);
                      setPickerSlotIndex(firstEmpty !== -1 ? firstEmpty : 0);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Добавить еще модель
                  </button>
                )}
              </div>
            </div>

            {/* 3. Main Scrollable Matrix Area */}
            <div className="flex-1 overflow-y-auto overflow-x-auto no-scrollbar p-4 sm:p-6 space-y-6">
              {/* Product Headers Row (Sticky or Fixed 3 Slots Grid) */}
              <div className="min-w-[760px]">
                <div className="grid grid-cols-4 gap-4 items-stretch">
                  {/* Left Label Cell */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-gray-200 dark:border-slate-700 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                        Выбор оборудования
                      </span>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm mt-1">
                        Сравниваемые модели
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Выберите до трех позиций из каталога для сопоставления технических параметров
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-700">
                      {activeCount > 0 && (
                        <button
                          onClick={() => {
                            const selectedNames = slotProducts
                              .filter((p): p is Product => p !== null)
                              .map((p) => p.name)
                              .join(', ');
                            setIsCompareDrawerOpen(false);
                            openContactModal({
                              title: 'Запрос сводного КП на сравниваемые модели',
                              defaultProduct: selectedNames,
                              formType: 'quote',
                            });
                          }}
                          className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Запросить сводное КП</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3 Product Slots */}
                  {[0, 1, 2].map((slotIdx) => {
                    const product = slotProducts[slotIdx];

                    if (product) {
                      return (
                        <div
                          key={slotIdx}
                          className="bg-white dark:bg-slate-800/90 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-900/60 shadow-sm flex flex-col justify-between relative group hover:border-blue-400 dark:hover:border-blue-500 transition-all"
                        >
                          {/* Slot Tag & Remove Button */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Слот {slotIdx + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setPickerSlotIndex(slotIdx)}
                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Заменить товар в этом слоте"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveFromSlot(slotIdx)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Удалить из сравнения"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Product Image */}
                          <div className="w-full h-32 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden mb-3 border border-gray-100 dark:border-slate-700 flex items-center justify-center p-2 relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                              }}
                              className="h-full object-contain"
                            />
                            {product.badge && (
                              <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white shadow-2xs">
                                {product.badge}
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          <div>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                              {product.brand}
                            </span>
                            <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm mt-0.5 leading-snug line-clamp-2">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold rounded border border-blue-100 dark:border-blue-900/40">
                                {product.categoryLabel}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                {product.price || 'По запросу'}
                              </span>
                            </div>
                          </div>

                          {/* CTAs */}
                          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 space-y-1.5">
                            <button
                              onClick={() => {
                                setIsCompareDrawerOpen(false);
                                openContactModal({
                                  title: `Запрос КП на ${product.name}`,
                                  defaultProduct: product.name,
                                  formType: 'quote',
                                });
                              }}
                              className="w-full py-1.5 px-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-xs cursor-pointer"
                            >
                              Запросить КП
                            </button>
                            <button
                              onClick={() => {
                                setIsCompareDrawerOpen(false);
                                navigateTo(product.category === 'software' ? 'software' : 'hardware', product.id);
                              }}
                              className="w-full py-1 px-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>Карточка товара</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Empty Slot Card
                    return (
                      <div
                        key={slotIdx}
                        onClick={() => setPickerSlotIndex(slotIdx)}
                        className="bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 rounded-xl p-5 border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[260px]"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-slate-700 group-hover:border-blue-600 flex items-center justify-center shadow-xs transition-all mb-3">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">
                          + Добавить товар в Слот {slotIdx + 1}
                        </span>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 max-w-[180px] leading-relaxed">
                          Нажмите, чтобы выбрать модель из каталога оборудования и ПО
                        </p>
                        <span className="mt-4 px-4 py-1 bg-white dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white border border-gray-200 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs">
                          Выбрать позицию
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 3.5. Recharts Metrology Visual Comparison Section */}
                {showChartSection && activeCount > 0 && (
                  <div className="mt-6 mb-2">
                    <HardwareComparisonChart
                      products={slotProducts}
                      onSelectSlot={(slotIdx) => setPickerSlotIndex(slotIdx)}
                    />
                  </div>
                )}

                {/* 4. Specifications Categories & Parameters Table */}
                {activeCount === 0 ? (
                  <div className="mt-8 bg-slate-50 dark:bg-slate-850 rounded-xl p-10 text-center border border-gray-200 dark:border-slate-800">
                    <SlidersHorizontal className="w-12 h-12 text-blue-500 mx-auto mb-3 opacity-60" />
                    <h4 className="font-bold text-gray-800 dark:text-slate-100 text-base">Список сравнения пуст</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                      Добавьте от 2 до 3 товаров в слоты выше или воспользуйтесь готовыми инженерными наборами
                    </p>
                    <button
                      onClick={() => setPickerSlotIndex(0)}
                      className="mt-4 px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Открыть каталог для выбора</span>
                    </button>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="mt-8 bg-slate-50 dark:bg-slate-850 rounded-xl p-8 text-center border border-gray-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                      По выбранным фильтрам параметров ничего не найдено.
                    </p>
                    <button
                      onClick={() => {
                        setOnlyDifferences(false);
                        setParamSearch('');
                      }}
                      className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-xs font-bold cursor-pointer"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                ) : (
                  <div className="mt-8 space-y-6">
                    {filteredCategories.map((category) => {
                      const isExpanded = expandedCategories[category.id] !== false;

                      return (
                        <div
                          key={category.id}
                          className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-2xs"
                        >
                          {/* Category Header Accordion Toggle */}
                          <button
                            onClick={() =>
                              setExpandedCategories((prev) => ({
                                ...prev,
                                [category.id]: !isExpanded,
                              }))
                            }
                            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-750 px-4 py-3 flex items-center justify-between text-left transition-colors border-b border-gray-200 dark:border-slate-700 cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              {renderCategoryIcon(category.iconName)}
                              <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                                {category.title}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold rounded-full border border-gray-200 dark:border-slate-700">
                                {category.rows.length}
                              </span>
                            </div>
                            <div className="text-gray-400 dark:text-slate-500">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </button>

                          {/* Category Spec Rows */}
                          {isExpanded && (
                            <div className="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
                              {category.rows.map((row) => (
                                <div
                                  key={row.key}
                                  className={`grid grid-cols-4 gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors items-center ${
                                    row.isDifferent ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                                  }`}
                                >
                                  {/* Param Label */}
                                  <div className="font-medium text-slate-600 dark:text-slate-400 pr-2 flex items-center gap-1.5">
                                    <span>{row.label}</span>
                                    {row.isDifferent && (
                                      <span
                                        className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                                        title="Значения различаются"
                                      />
                                    )}
                                  </div>

                                  {/* Slot 1 Value */}
                                  <div className="font-mono text-[11px] text-gray-900 dark:text-slate-200 break-words">
                                    {slotProducts[0] ? (
                                      row.values[0] !== undefined && row.values[0] !== '' ? (
                                        <span className={row.isDifferent ? 'font-semibold text-blue-900 dark:text-blue-300' : ''}>
                                          {row.values[0]}
                                        </span>
                                      ) : (
                                        <span className="text-gray-300 dark:text-slate-600">—</span>
                                      )
                                    ) : (
                                      <span className="text-gray-300 dark:text-slate-600 italic text-[10px]">слот не выбран</span>
                                    )}
                                  </div>

                                  {/* Slot 2 Value */}
                                  <div className="font-mono text-[11px] text-gray-900 dark:text-slate-200 break-words">
                                    {slotProducts[1] ? (
                                      row.values[1] !== undefined && row.values[1] !== '' ? (
                                        <span className={row.isDifferent ? 'font-semibold text-blue-900 dark:text-blue-300' : ''}>
                                          {row.values[1]}
                                        </span>
                                      ) : (
                                        <span className="text-gray-300 dark:text-slate-600">—</span>
                                      )
                                    ) : (
                                      <span className="text-gray-300 dark:text-slate-600 italic text-[10px]">слот не выбран</span>
                                    )}
                                  </div>

                                  {/* Slot 3 Value */}
                                  <div className="font-mono text-[11px] text-gray-900 dark:text-slate-200 break-words">
                                    {slotProducts[2] ? (
                                      row.values[2] !== undefined && row.values[2] !== '' ? (
                                        <span className={row.isDifferent ? 'font-semibold text-blue-900 dark:text-blue-300' : ''}>
                                          {row.values[2]}
                                        </span>
                                      ) : (
                                        <span className="text-gray-300 dark:text-slate-600">—</span>
                                      )
                                    ) : (
                                      <span className="text-gray-300 dark:text-slate-600 italic text-[10px]">слот не выбран</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Features Comparison Block */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-slate-700">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                          Ключевые преимущества и конструктивные особенности
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 p-4">
                        <div className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                          Список функциональных преимуществ:
                        </div>
                        {[0, 1, 2].map((slotIdx) => {
                          const prod = slotProducts[slotIdx];
                          if (!prod) {
                            return (
                              <div key={slotIdx} className="text-gray-300 dark:text-slate-600 italic text-xs">
                                —
                              </div>
                            );
                          }
                          return (
                            <div key={slotIdx} className="space-y-1.5 text-xs">
                              {prod.features && prod.features.length > 0 ? (
                                prod.features.map((feat, i) => (
                                  <div key={i} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <span className="leading-snug">{feat}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-400 dark:text-slate-500 text-[11px]">Базовая комплектация</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Sticky Footer Action Bar */}
            <div className="bg-slate-50 dark:bg-slate-850 p-4 md:px-6 border-t border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-gray-500 dark:text-slate-400 text-center sm:text-left">
                Нужна инженерная консультация по подбору КИМ или ПО? Звоните: <strong className="text-slate-800 dark:text-slate-200">+7 (846) 954-02-92</strong> или оформите заявку
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsCompareDrawerOpen(false)}
                  className="w-1/2 sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Вернуться на сайт
                </button>
                <button
                  onClick={() => {
                    const selectedNames = slotProducts
                      .filter((p): p is Product => p !== null)
                      .map((p) => p.name)
                      .join(', ');
                    setIsCompareDrawerOpen(false);
                    openContactModal({
                      title: 'Запрос расчёта на сравнение моделей',
                      defaultProduct: selectedNames || 'Сравнение оборудования',
                      formType: 'quote',
                    });
                  }}
                  className="w-1/2 sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <span>Получить коммерческое предложение</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Selection Modal */}
      {pickerSlotIndex !== null && (
        <ProductPickerModal
          isOpen={pickerSlotIndex !== null}
          onClose={() => setPickerSlotIndex(null)}
          targetSlotIndex={pickerSlotIndex}
          currentProducts={slotProducts}
          onSelectProduct={handleSelectProduct}
          onApplyPreset={handleApplyPreset}
        />
      )}
    </>
  );
};
