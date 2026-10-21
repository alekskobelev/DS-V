import React, { useState, useMemo, useEffect } from 'react';
import {
  SlidersHorizontal,
  Trash2,
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
  Printer,
  Share2,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Search,
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
  ChevronRight,
  ArrowLeft,
  X,
  Info,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { PRODUCTS_DATA } from '../data/mockData';
import { buildCategorizedSpecs, exportComparisonToExcel, SpecCategory } from '../utils/compareUtils';
import { ProductPickerModal } from '../components/modals/ProductPickerModal';
import { HardwareComparisonChart } from '../components/common/HardwareComparisonChart';

export const ComparePage: React.FC = () => {
  const {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    openContactModal,
    navigateTo,
    showToast,
  } = useApp();

  // Internal slots state: up to 4 slots [Slot 0, Slot 1, Slot 2, Slot 3]
  const [slotProducts, setSlotProducts] = useState<(Product | null)[]>([null, null, null, null]);
  const [onlyDifferences, setOnlyDifferences] = useState<boolean>(false);
  const [paramSearch, setParamSearch] = useState<string>('');
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
    const slots: (Product | null)[] = [null, null, null, null];
    compareList.slice(0, 4).forEach((prod, idx) => {
      slots[idx] = prod;
    });
    setSlotProducts(slots);
  }, [compareList]);

  // Synchronize URL parameters (?compare=id1,id2,id3,id4)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const compareParam = url.searchParams.get('compare');
      if (compareParam && compareList.length === 0) {
        const ids = compareParam.split(',').map((s) => s.trim()).filter(Boolean);
        const prods = ids
          .map((id) => PRODUCTS_DATA.find((p) => p.id === id))
          .filter((p): p is Product => Boolean(p));

        if (prods.length > 0) {
          prods.slice(0, 4).forEach((p) => addToCompare(p));
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

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
    const newSlots: (Product | null)[] = [...slotProducts];

    // If this product was in another slot, clear that slot first
    const existingIndex = newSlots.findIndex((p) => p?.id === product.id);
    if (existingIndex !== -1 && existingIndex !== slotIndex) {
      newSlots[existingIndex] = null;
    }

    newSlots[slotIndex] = product;
    setSlotProducts(newSlots);

    // Sync back to AppContext
    const validProducts = newSlots.filter((p): p is Product => p !== null);
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

  // Apply preset
  const handleApplyPreset = (products: Product[]) => {
    clearCompare();
    products.slice(0, 4).forEach((p) => addToCompare(p));
    const newSlots: (Product | null)[] = [null, null, null, null];
    products.slice(0, 4).forEach((p, i) => {
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
        return <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Scan':
        return <Scan className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Info':
        return <Info className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  // Popular Presets
  const popularPresets = useMemo(() => {
    const findProd = (id: string) => PRODUCTS_DATA.find((p) => p.id === id);
    return [
      {
        id: 'scanners',
        title: '3D-сканеры (Метрологические)',
        desc: 'ScanLine Omni vs Shining FreeScan Combo vs MetraSCAN 3D',
        items: [
          findProd('eq-scanline-easyscan-omni') || PRODUCTS_DATA.find((p) => p.name.includes('Omni')),
          findProd('shining-freescan-combo') || PRODUCTS_DATA.find((p) => p.name.includes('Combo')),
          PRODUCTS_DATA.find((p) => p.category === 'scanners' && !p.name.includes('Omni') && !p.name.includes('Combo')),
        ].filter((p): p is Product => Boolean(p)),
      },
      {
        id: 'arms',
        title: 'Портативные КИМ и Трекеры',
        desc: 'Leica AT403 vs Hexagon ARM 8520 vs PMT Alpha',
        items: [
          findProd('leica-at403') || PRODUCTS_DATA.find((p) => p.name.includes('AT403') || p.id.includes('at403')),
          findProd('hexagon-absolute-arm-8520') || PRODUCTS_DATA.find((p) => p.name.includes('Hexagon') || p.name.includes('8520')),
          PRODUCTS_DATA.find((p) => p.category === 'arms' || p.categoryLabel.includes('рука')),
        ].filter((p): p is Product => Boolean(p)),
      },
      {
        id: 'software',
        title: 'Контроль геометрии и CAD/CAM',
        desc: 'TopSolid 7 vs PolyWorks|Inspector vs Geomagic Control X',
        items: [
          PRODUCTS_DATA.find((p) => p.id === 'topsolid-7' || p.name.includes('TopSolid 7')),
          PRODUCTS_DATA.find((p) => p.id === 'polyworks-inspector' || p.name.includes('PolyWorks')),
          PRODUCTS_DATA.find((p) => p.id === 'geomagic-control-x' || p.name.includes('Geomagic')),
        ].filter((p): p is Product => Boolean(p)),
      },
    ];
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-20">
      {/* 1. Page Header & Breadcrumbs */}
      <section className="bg-linear-to-b from-[#1E3A8A] to-[#172554] text-white pt-8 pb-10 border-b border-blue-900/60 print:hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-xs text-blue-200 mb-4" aria-label="Хлебные крошки">
            <button
              onClick={() => navigateTo('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Главная
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-blue-300/60" />
            <span className="text-white font-medium">Сравнение товаров</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Метрологический сопоставительный анализ
                </span>
                <span className="text-xs text-blue-200">
                  Заполнено слотов: <strong className="text-white font-bold">{activeCount} из 4</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Сравнение оборудования и программного обеспечения
              </h1>
              <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
                Интерактивное сопоставление технических характеристик, точности (MPE), оптических сенсоров,
                габаритов и функциональных возможностей КИМ, 3D-сканеров и комплексов CAD/CAM.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={handleExportExcel}
                disabled={activeCount === 0}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                title="Экспорт сравнительной спецификации в Microsoft Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Экспорт Excel</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={activeCount === 0}
                className="px-4 py-2.5 bg-blue-800/80 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-blue-100 hover:text-white font-semibold rounded-xl text-xs transition-colors border border-blue-700/80 flex items-center gap-2 cursor-pointer"
                title="Распечатать таблицу на листе A4 или сохранить в PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Печать A4 / PDF</span>
              </button>

              <button
                onClick={handleShare}
                disabled={activeCount === 0}
                className="px-4 py-2.5 bg-blue-800/80 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-blue-100 hover:text-white font-semibold rounded-xl text-xs transition-colors border border-blue-700/80 flex items-center gap-2 cursor-pointer"
                title="Скопировать постоянную ссылку на это сравнение"
              >
                <Share2 className="w-4 h-4" />
                <span>Поделиться</span>
              </button>

              {activeCount > 0 && (
                <button
                  onClick={clearCompare}
                  className="px-3 py-2.5 bg-rose-900/40 hover:bg-rose-900/80 text-rose-200 hover:text-white font-medium rounded-xl text-xs transition-colors border border-rose-800/50 flex items-center gap-1.5 cursor-pointer"
                  title="Очистить все слоты"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Очистить</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Engineering Presets Bar */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-slate-800 shadow-2xs mb-6 print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                  Готовые комплекты для экспресс-сравнения
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  Загрузите типовой набор моделей для быстрого анализа характеристик
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {popularPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.items)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{preset.title}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Interactive Toolbar: Filter, Search, Chart Toggle */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-800 shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            {/* Chart Toggle */}
            <button
              id="compare-page-chart-toggle"
              onClick={() => setShowChartSection(!showChartSection)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                showChartSection
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-300 dark:border-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Метрологическая диаграмма</span>
            </button>

            {/* Only Differences Toggle */}
            <button
              onClick={() => setOnlyDifferences(!onlyDifferences)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                onlyDifferences
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-300 dark:border-slate-700'
              }`}
            >
              {onlyDifferences ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>Только различия</span>
              {totalDifferencesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    onlyDifferences
                      ? 'bg-white text-amber-600'
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {totalDifferencesCount}
                </span>
              )}
            </button>

            {/* Expand / Collapse All */}
            <button
              onClick={() => {
                const anyCollapsed = Object.values(expandedCategories).some((v) => !v);
                const nextState: Record<string, boolean> = {};
                categories.forEach((c) => {
                  nextState[c.id] = anyCollapsed;
                });
                setExpandedCategories(nextState);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {Object.values(expandedCategories).some((v) => !v) ? 'Развернуть все категории' : 'Свернуть все'}
            </button>
          </div>

          {/* Search Specs */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={paramSearch}
              onChange={(e) => setParamSearch(e.target.value)}
              placeholder="Поиск по параметрам (точность, лазер...)"
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            {paramSearch && (
              <button
                onClick={() => setParamSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </section>

        {/* 4. Visual Metrology Chart Section (Radar & Bar) */}
        {showChartSection && activeCount > 0 && (
          <section className="mb-6 print:hidden">
            <HardwareComparisonChart
              products={slotProducts}
              onSelectSlot={(slotIdx) => setPickerSlotIndex(slotIdx)}
            />
          </section>
        )}

        {/* 5. Product Slots Cards Row */}
        <section className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((slotIdx) => {
              const product = slotProducts[slotIdx];

              if (product) {
                return (
                  <div
                    key={slotIdx}
                    className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border-2 border-blue-200 dark:border-blue-900/60 shadow-sm flex flex-col justify-between relative group hover:border-blue-500 transition-all print:border-gray-300 print:shadow-none"
                  >
                    {/* Top Slot Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Слот {slotIdx + 1}
                      </span>
                      <div className="flex items-center gap-1 print:hidden">
                        <button
                          onClick={() => setPickerSlotIndex(slotIdx)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Заменить модель"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromSlot(slotIdx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Удалить из сравнения"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="w-full h-36 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden mb-3 border border-gray-100 dark:border-slate-700/80 flex items-center justify-center p-2 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                        }}
                        className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.badge && (
                        <span className="absolute bottom-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white shadow-xs">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1 mb-4">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                        {product.brand}
                      </span>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold rounded border border-blue-100 dark:border-blue-900/40">
                          {product.categoryLabel}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {product.price || 'По запросу'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-1.5 print:hidden">
                      <button
                        onClick={() =>
                          openContactModal({
                            title: `Запрос коммерческого предложения: ${product.name}`,
                            defaultProduct: product.name,
                            formType: 'quote',
                          })
                        }
                        className="w-full py-2 px-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs text-center cursor-pointer"
                      >
                        Запросить КП
                      </button>
                      <button
                        onClick={() =>
                          navigateTo(product.category === 'software' ? 'software' : 'hardware', product.id)
                        }
                        className="w-full py-1.5 px-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Карточка товара</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              }

              // Empty slot placeholder
              return (
                <div
                  key={slotIdx}
                  onClick={() => setPickerSlotIndex(slotIdx)}
                  className="bg-white/60 dark:bg-slate-900/40 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[300px] print:hidden"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-slate-700 flex items-center justify-center shadow-xs transition-all mb-3">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-600">
                    + Добавить в Слот {slotIdx + 1}
                  </span>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 max-w-[180px] leading-relaxed">
                    Выберите позицию из каталога оборудования или ПО
                  </p>
                  <span className="mt-4 px-3.5 py-1.5 bg-white dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-2xs">
                    Выбрать модель
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. Comparative Specifications Table */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mb-12">
          {activeCount === 0 ? (
            <div className="p-12 text-center">
              <SlidersHorizontal className="w-12 h-12 text-blue-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Таблица сравнения пока пуста
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Выберите от 2 до 4 моделей оборудования или программного обеспечения для детального
                сопоставления характеристик и параметров.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setPickerSlotIndex(0)}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Открыть каталог для выбора</span>
                </button>
                {popularPresets[0] && (
                  <button
                    onClick={() => handleApplyPreset(popularPresets[0].items)}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors border border-gray-200 dark:border-slate-700 cursor-pointer"
                  >
                    Загрузить комплект «3D-сканеры»
                  </button>
                )}
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-300">
                По выбранным параметрам поиска совпадений не обнаружено.
              </p>
              <button
                onClick={() => {
                  setOnlyDifferences(false);
                  setParamSearch('');
                }}
                className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
              >
                Сбросить условия фильтрации
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[860px]">
                {/* Sticky Header Row */}
                <div className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800/95 backdrop-blur-xs border-b border-gray-200 dark:border-slate-700 grid grid-cols-5 p-3 text-xs font-bold text-gray-700 dark:text-slate-200 items-center">
                  <div className="pr-4 uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                    Характеристика / Параметр
                  </div>
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const prod = slotProducts[slotIdx];
                    return (
                      <div key={slotIdx} className="px-2 truncate">
                        {prod ? (
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="truncate font-bold text-blue-900 dark:text-blue-300" title={prod.name}>
                              {prod.name}
                            </span>
                            <button
                              onClick={() => handleRemoveFromSlot(slotIdx)}
                              className="text-gray-400 hover:text-red-500 shrink-0 p-0.5 print:hidden cursor-pointer"
                              title="Удалить"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-slate-600 italic text-[11px]">
                            Слот {slotIdx + 1} (пусто)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Categories and Rows */}
                <div className="divide-y divide-gray-200 dark:divide-slate-800">
                  {filteredCategories.map((cat) => {
                    const isExpanded = expandedCategories[cat.id] !== false;

                    return (
                      <div key={cat.id} className="bg-white dark:bg-slate-900 compare-category-block">
                        {/* Accordion Category Header */}
                        <button
                          onClick={() =>
                            setExpandedCategories((prev) => ({
                              ...prev,
                              [cat.id]: !isExpanded,
                            }))
                          }
                          className="w-full bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 flex items-center justify-between transition-colors border-y border-gray-200 dark:border-slate-800 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            {renderCategoryIcon(cat.iconName)}
                            <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                              {cat.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-gray-200 dark:border-slate-700">
                              {cat.rows.length}
                            </span>
                          </div>
                          <div className="text-gray-400 dark:text-slate-500">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {/* Category Rows */}
                        {isExpanded && (
                          <div className="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
                            {cat.rows.map((row) => (
                              <div
                                key={row.key}
                                className={`grid grid-cols-5 p-3 items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                                  row.isDifferent ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                                }`}
                              >
                                {/* Param Label */}
                                <div className="font-medium text-slate-700 dark:text-slate-300 pr-3 flex items-center gap-2">
                                  <span>{row.label}</span>
                                  {row.isDifferent && (
                                    <span
                                      className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                                      title="Значения различаются"
                                    />
                                  )}
                                </div>

                                {/* 4 Product Slots Values */}
                                {[0, 1, 2, 3].map((slotIdx) => {
                                  const prod = slotProducts[slotIdx];
                                  const val = row.values[slotIdx];

                                  return (
                                    <div key={slotIdx} className="px-2 font-mono text-[11px] text-gray-900 dark:text-slate-200 break-words">
                                      {prod ? (
                                        val !== undefined && val !== '' ? (
                                          <span className={row.isDifferent ? 'font-semibold text-blue-900 dark:text-blue-300' : ''}>
                                            {val}
                                          </span>
                                        ) : (
                                          <span className="text-gray-300 dark:text-slate-600">—</span>
                                        )
                                      ) : (
                                        <span className="text-gray-300 dark:text-slate-600 italic text-[10px]">
                                          —
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Key Features Side-by-side Section */}
                  <div className="bg-white dark:bg-slate-900 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                        Функциональные преимущества и конструктивные особенности
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-3 pt-2">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Ключевые преимущества:
                      </div>
                      {[0, 1, 2, 3].map((slotIdx) => {
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
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span className="leading-snug text-[11px]">{feat}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 dark:text-slate-500 text-[11px]">
                                Стандартная комплектация поставки
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 7. Bottom Call-To-Action Consultation Block */}
        <section className="bg-linear-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Инженерная экспертиза «ДС-Инжиниринг»
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Нужна помощь в выборе оптимальной измерительной системы или ПО?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-blue-200 leading-relaxed">
              Наши ведущие метрологи и инженеры проведут аудит ваших чертежей, требований к допускам (GD&T)
              и подберут решение с гарантией окупаемости и точности.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => {
                const selectedNames = slotProducts
                  .filter((p): p is Product => p !== null)
                  .map((p) => p.name)
                  .join(', ');
                openContactModal({
                  title: 'Запрос сводного КП на сравниваемые модели',
                  defaultProduct: selectedNames || 'Сравнение оборудования',
                  formType: 'quote',
                });
              }}
              className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Запросить сводный расчет КП</span>
            </button>
            <button
              onClick={() => navigateTo('contacts')}
              className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-colors border border-white/20 text-center cursor-pointer"
            >
              Связаться с отделом
            </button>
          </div>
        </section>
      </main>

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
    </div>
  );
};

export default ComparePage;
