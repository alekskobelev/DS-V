import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FeatureList } from '../components/common/FeatureList';
import { Scrollspy } from '../components/common/Scrollspy';
//, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Box,
  Zap,
  Compass, 
  Scan, 
  SlidersHorizontal, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  ChevronLeft,
  ShieldCheck, 
  Settings2, 
  Check,
  Phone,
  Search,
  LayoutGrid,
  List,
  Layers,
  Table as TableIcon,
  Sparkles,
  Cpu,
  Target,
  Printer,
  ChevronRight,
  HelpCircle,
  Award,
  Filter,
  Download,
  Info,
  ExternalLink,
  Globe,
  PhoneCall,
  Mail,
  FileText,
  FileCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Tag,
  Link2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { copyToClipboard } from '../utils/clipboard';
import { PRODUCTS_DATA } from '../data/mockData';
import { Product } from '../types';
import { ProductGallery } from '../components/common/ProductGallery';
import { ProductFaqSection } from '../components/common/ProductFaqSection';
import { HardwareFacetFilter } from '../components/common/HardwareFacetFilter';
import { ProductDetailLayout } from '../components/common/ProductDetailLayout';
import { generatePrintableHTML } from '../utils/printProductSpec';
import {
  getProductMetrology,
  AccuracyTier,
  FormFactor,
  ACCURACY_TIER_CONFIG,
  FORM_FACTOR_CONFIG,
} from '../utils/hardwareMetrology';
import { motion } from 'motion/react';
import { useSEO } from '../hooks/useSEO';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { RecentSearchesDropdown } from '../components/common/RecentSearchesDropdown';

// Helper to determine scanner technology: 'laser' | 'optical' | 'hybrid' | null
export const getScannerTechnology = (p: Product): 'laser' | 'optical' | 'hybrid' | null => {
  if (p.technology) return p.technology;
  if (p.type !== 'hardware') return null;
  const isScanner = p.category === 'scanners' || p.category.includes('scanner') || p.categoryLabel.toLowerCase().includes('сканер') || p.id.includes('scan');
  if (!isScanner) return null;

  const id = p.id.toLowerCase();
  const name = p.name.toLowerCase();
  const fullText = (p.name + ' ' + (p.badge || '') + ' ' + p.shortDescription + ' ' + p.fullDescription + ' ' + (p.features ? p.features.join(' ') : '') + ' ' + JSON.stringify(p.specs || {})).toLowerCase();

  // 1. Hybrid: Combo, HX, H, Einstar, Libre, ProNova, VCSEL + Laser
  if (
    id.includes('combo') ||
    id.includes('hx') ||
    id.includes('libre') ||
    id.includes('pronova') ||
    name.includes('combo') ||
    name.includes('hx') ||
    name.includes('einstar') ||
    name.includes('einscan h') ||
    fullText.includes('vcsel') ||
    fullText.includes('гибрид') ||
    (fullText.includes('лазер') && (fullText.includes('инфракрас') || fullText.includes('vcsel') || fullText.includes('ir')))
  ) {
    return 'hybrid';
  }

  // 2. Optical structured light: EinScan SE, SP, Pro HD, Pro 2X, AutoScan, Transcan, OptimScan, SmartScan, StereoScan, PrimeScan
  if (
    id.includes('einscan-se') ||
    id.includes('einscan-sp') ||
    id.includes('einscan-pro') ||
    id.includes('transcan') ||
    id.includes('optimscan') ||
    id.includes('smartscan') ||
    id.includes('stereoscan') ||
    id.includes('primescan') ||
    id.includes('autoscan') ||
    name.includes('pro hd') ||
    name.includes('pro 2x') ||
    name.includes('se v2') ||
    name.includes('sp v2') ||
    name.includes('transcan') ||
    name.includes('optimscan') ||
    name.includes('smartscan') ||
    name.includes('stereoscan') ||
    name.includes('primescan') ||
    name.includes('autoscan') ||
    fullText.includes('структурированн') ||
    fullText.includes('led подсвет') ||
    fullText.includes('белый свет')
  ) {
    return 'optical';
  }

  // 3. Laser lines: FreeScan UE, EasyScan UE, TRIO, AS1, StaticScan, RobotScan, TrackerScan Pro S/W
  return 'laser';
};

export const HardwarePage: React.FC = () => {
  const { 
    products,
    customPages,
    selectedProduct, 
    setSelectedProduct,
    addToCompare, 
    isInCompare, 
    openContactModal,
    activeCategory,
    setActiveCategory,
    siteTexts,
    navigateTo
  } = useApp();

  const hardwareProducts = useMemo(() => {
    return products.filter((p) => p.type === 'hardware');
  }, [products]);

  // Main Category Tab Filter
  const [filterCat, setFilterCat] = useState<string>(activeCategory || 'all');
  // Selected Brand Filter
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  
  // Faceted Parameters Filter States
  const [selectedAccuracy, setSelectedAccuracy] = useState<AccuracyTier[]>([]);
  const [selectedFormFactors, setSelectedFormFactors] = useState<FormFactor[]>([]);
  const [onlyGostReestr, setOnlyGostReestr] = useState<boolean>(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(true);

  // Close filter panel by default on mobile to prevent blocking content above the fold
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsFilterPanelOpen(false);
    }
  }, []);

  const handleResetFacets = useCallback(() => {
    setSelectedAccuracy([]);
    setSelectedFormFactors([]);
    setOnlyGostReestr(false);
  }, []);

  const activeFacetsCount = useMemo(() => {
    return (
      selectedAccuracy.length +
      selectedFormFactors.length +
      (onlyGostReestr ? 1 : 0)
    );
  }, [selectedAccuracy, selectedFormFactors, onlyGostReestr]);

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearches();
  // View mode: 'grouped' | 'grid' | 'table'
  const [viewMode, setViewMode] = useState<'grouped' | 'grid' | 'table'>('grouped');

  // Print Specification Modal State
  const [printProduct, setPrintProduct] = useState<Product | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleOpenPrintModal = (product: Product) => {
    setPrintProduct(product);
    setIsPrintModalOpen(true);
  };

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setPrintProduct(null);
  };

  const handlePrintDirectWindow = (product: Product) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePrintableHTML(product));
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  const handleOpenNewTabDocument = (product: Product) => {
    const docWindow = window.open('', '_blank');
    if (docWindow) {
      docWindow.document.write(generatePrintableHTML(product));
      docWindow.document.close();
      docWindow.focus();
    }
  };

  const handleDownloadHTML = (product: Product) => {
    const htmlContent = generatePrintableHTML(product);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Specification_${product.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [detailProduct, setDetailProduct] = useState<Product | null>(
    selectedProduct?.type === 'hardware' ? selectedProduct : null
  );

  useEffect(() => {
    if (selectedProduct && selectedProduct.type === 'hardware') {
      setDetailProduct(selectedProduct);
    } else if (!selectedProduct) {
      setDetailProduct(null);
    }
  }, [selectedProduct]);

  const baseTitle = 'Измерительное оборудование и КИМ | ДС-Инжиниринг';
  const baseDesc = 'Каталог координатно-измерительных машин (КИМ), мобильных сканеров, портативных рук (Arm), оптических трекеров и щуповых систем.';

  useSEO({
    title: detailProduct?.metaTitle || detailProduct?.name || baseTitle,
    description: detailProduct?.metaDescription || detailProduct?.shortDescription || baseDesc,
    keywords: detailProduct?.metaKeywords?.join(', ') || 'КИМ, стационарные КИМ, мобильные КИМ, 3D сканеры, лазерные трекеры, оптические измерительные систем',
  });

  const detailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (detailProduct && detailRef.current) {
      // Scroll with an offset to account for the sticky header if any
      const y = detailRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [detailProduct]);

  useEffect(() => {
    if (selectedProduct && selectedProduct.type === 'hardware') {
      setDetailProduct(selectedProduct);
      if (selectedProduct.category) {
        const brandStr = (selectedProduct.brand || '').toLowerCase();
        if (brandStr.includes('scanline')) {
          setFilterCat('scanline');
        } else if (brandStr.includes('shining')) {
          setFilterCat('shining');
        } else if (brandStr.includes('hexagon') && selectedProduct.category === 'scanners') {
          setFilterCat('hexagon');
        } else {
          setFilterCat(selectedProduct.category);
        }
      }
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (activeCategory) {
      if (activeCategory === 'scanline' || activeCategory === 'brand-scanline') {
        setFilterCat('brand-scanline');
        setSelectedBrand('scanline');
      } else if (activeCategory.startsWith('brand-')) {
        setSelectedBrand(activeCategory.replace('brand-', ''));
        setFilterCat('all');
      } else {
        setFilterCat(activeCategory);
        setSelectedBrand('all');
      }
    }
  }, [activeCategory]);

  useEffect(() => {
    if (detailProduct) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseDetail();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [detailProduct]);

  // Categories definitions - Including ScanLine Russian 3D Scanners and Metrology
  const CATEGORIES = useMemo(() => [
    {
      id: 'all',
      label: 'Всё оборудование',
      shortLabel: 'Всё',
      count: hardwareProducts.length,
      icon: Box,
      filter: () => true,
    },
    {
      id: 'brand-scanline',
      label: '🇷🇺 3D-сканеры ScanLine (Отечественная разработка)',
      shortLabel: '🇷🇺 3D-сканеры ScanLine',
      count: hardwareProducts.filter(p => (p.brand?.toLowerCase().includes('scanline') || p.id.startsWith('scanline') || p.id.startsWith('eq-scanline'))).length,
      icon: ShieldCheck,
      filter: (p: Product) => Boolean(p.brand?.toLowerCase().includes('scanline') || p.id.startsWith('scanline') || p.id.startsWith('eq-scanline')),
    },
    {
      id: 'tech-laser',
      label: '🔴 Лазерная технология (Лазерные 3D-сканеры)',
      shortLabel: '🔴 Лазерная технология',
      count: hardwareProducts.filter(p => getScannerTechnology(p) === 'laser').length,
      icon: Zap,
      filter: (p: Product) => getScannerTechnology(p) === 'laser',
    },
    {
      id: 'tech-optical',
      label: '🔵 Оптический подсвет (LED / Структурированный свет)',
      shortLabel: '🔵 Оптический подсвет',
      count: hardwareProducts.filter(p => getScannerTechnology(p) === 'optical').length,
      icon: Scan,
      filter: (p: Product) => getScannerTechnology(p) === 'optical',
    },
    {
      id: 'tech-hybrid',
      label: '🟣 Оптический гибрид (Лазер + VCSEL / LED)',
      shortLabel: '🟣 Оптический гибрид',
      count: hardwareProducts.filter(p => getScannerTechnology(p) === 'hybrid').length,
      icon: Sparkles,
      filter: (p: Product) => getScannerTechnology(p) === 'hybrid',
    },
    {
      id: 'tech-cmm',
      label: 'Стационарные координатно-измерительные машины',
      shortLabel: '🔵 Стационарные КИМ',
      count: hardwareProducts.filter(p => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm')).length,
      icon: Cpu,
      filter: (p: Product) => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm'),
    },
    {
      id: 'tech-mobile',
      label: 'Мобильные КИМ (Измерительные руки)',
      shortLabel: '🟢 Мобильные КИМ',
      count: hardwareProducts.filter(p => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm')).length,
      icon: Compass,
      filter: (p: Product) => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm'),
    },
    {
      id: 'tech-trackers',
      label: 'Лазерные трекеры (до 160 метров)',
      shortLabel: '🔵 Лазерные трекеры',
      count: hardwareProducts.filter(p => p.type === 'hardware' && p.category === 'trackers').length,
      icon: Target,
      filter: (p: Product) => p.type === 'hardware' && p.category === 'trackers',
    },
    {
      id: 'tech-other',
      label: 'Оснастка, 3D-печать (SLM) и датчики',
      shortLabel: 'Оснастка и 3D-печать',
      count: hardwareProducts.filter(p => p.type === 'hardware' && (p.category === 'renishaw' || p.category === 'printers')).length,
      icon: Settings2,
      filter: (p: Product) => p.type === 'hardware' && (p.category === 'renishaw' || p.category === 'printers'),
    },
  ], [hardwareProducts]);

  // Base products filtered by Category, Brand, and Search (before facets)
  const baseCategoryProducts = useMemo(() => {
    return hardwareProducts.filter((prod) => {
      // 1. Category filter
      if (filterCat !== 'all') {
        if (filterCat === 'brand-scanline' || filterCat === 'scanline') {
          const isScanline = (prod.brand?.toLowerCase().includes('scanline') || prod.id.startsWith('scanline') || prod.id.startsWith('eq-scanline'));
          if (!isScanline) return false;
        } else {
          const catDef = CATEGORIES.find(c => c.id === filterCat);
          if (catDef && !catDef.filter(prod)) {
            return false;
          }
        }
      }

      // 2. Brand filter
      if (selectedBrand !== 'all') {
        const prodBrand = (prod.brand || '').toLowerCase();
        const prodId = (prod.id || '').toLowerCase();
        if (selectedBrand === 'scanline' && !(prodBrand.includes('scanline') || prodId.startsWith('scanline') || prodId.startsWith('eq-scanline'))) return false;
        if (selectedBrand === 'shining' && !(prodBrand.includes('shining') || prodId.startsWith('shining') || prodId.startsWith('freescan') || prodId.startsWith('eq-shining') || prodId.startsWith('eq-freescan'))) return false;
        if (selectedBrand === 'pmt' && !prodBrand.includes('pmt')) return false;
        if (selectedBrand === 'hexagon' && !(prodBrand.includes('hexagon') || prodBrand.includes('leica') || prodId.startsWith('hexagon') || prodId.startsWith('primescan') || prodId.startsWith('stereoscan') || prodId.startsWith('smartscan') || prodId.startsWith('eq-hexagon'))) return false;
        if (selectedBrand === 'renishaw' && !prodBrand.includes('renishaw')) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (prod.name || '').toLowerCase().includes(q);
        const matchBrand = (prod.brand || '').toLowerCase().includes(q);
        const matchDesc = prod.shortDescription?.toLowerCase().includes(q) || prod.fullDescription?.toLowerCase().includes(q);
        const matchBadge = prod.badge?.toLowerCase().includes(q);
        const matchSpecs = prod.specs ? Object.values(prod.specs).some(v => typeof v === 'string' && v.toLowerCase().includes(q)) : false;
        if (!matchName && !matchBrand && !matchDesc && !matchBadge && !matchSpecs) {
          return false;
        }
      }

      return true;
    });
  }, [hardwareProducts, filterCat, selectedBrand, searchQuery, CATEGORIES]);

  // Dynamic facet counts based on current category/brand/search context
  const facetCounts = useMemo(() => {
    const accuracyCounts: Record<AccuracyTier, number> = { ultra: 0, high: 0, basic: 0 };
    const formFactorCounts: Record<FormFactor, number> = { stationary: 0, portable: 0 };
    let gostReestrCount = 0;

    for (const prod of baseCategoryProducts) {
      const metrology = getProductMetrology(prod);
      accuracyCounts[metrology.accuracyTier]++;
      formFactorCounts[metrology.formFactor]++;
      if (metrology.isGostReestr) {
        gostReestrCount++;
      }
    }

    return { accuracyCounts, formFactorCounts, gostReestrCount };
  }, [baseCategoryProducts]);

  // Filtered products list based on category, brand, search, and facets
  const filteredProducts = useMemo(() => {
    return baseCategoryProducts.filter((prod) => {
      const metrology = getProductMetrology(prod);

      // Facet 1: Accuracy (погрешность)
      if (selectedAccuracy.length > 0) {
        if (!selectedAccuracy.includes(metrology.accuracyTier)) {
          return false;
        }
      }

      // Facet 2: Form factor (форм-фактор)
      if (selectedFormFactors.length > 0) {
        if (!selectedFormFactors.includes(metrology.formFactor)) {
          return false;
        }
      }

      // Facet 3: Metrological status (Госреестр СИ РФ)
      if (onlyGostReestr) {
        if (!metrology.isGostReestr) {
          return false;
        }
      }

      return true;
    });
  }, [baseCategoryProducts, selectedAccuracy, selectedFormFactors, onlyGostReestr]);

  // Grouped products for the 'grouped' view
  const groupedSections = useMemo(() => {
    return CATEGORIES.filter(c => c.id !== 'all').map(cat => {
      const items = filteredProducts.filter(cat.filter);
      return {
        ...cat,
        items
      };
    }).filter(group => group.items.length > 0);
  }, [CATEGORIES, filteredProducts]);

  const handleOpenDetail = (prod: Product) => {
    setDetailProduct(prod);
    setSelectedProduct(prod);
    navigateTo('hardware', prod.id);
  };

  const handleCloseDetail = () => {
    setDetailProduct(null);
    setSelectedProduct(null);
    navigateTo('hardware');
  };

  const scrollSections = [
    { id: 'hardware-hero', label: 'Оборудование' },
    { id: 'hardware-filters', label: 'Фильтры и категории' },
    { id: 'hardware-catalog', label: 'Каталог моделей' },
    { id: 'hardware-cta', label: 'Демонстрация' },
  ];

  return (
    <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      {detailProduct ? (
        <ProductDetailLayout product={detailProduct} onBack={handleCloseDetail} />
      ) : (
        <>
          <Scrollspy sections={scrollSections} />
          {/* Header Banner */}
          <div id="hardware-hero" className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#2563EB] text-white p-5 sm:p-6 lg:p-8 rounded-xl shadow-sm relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
            <div className="max-w-2xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{siteTexts.catalogs.hardwareBadge || 'Официальные поставки • Гарантия и сервис в РФ • Поверка по ГОСТ/ISO'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {siteTexts.catalogs.hardwareTitle || 'Каталог промышленного метрологического оборудования'}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                {siteTexts.catalogs.hardwareSubtitle || 'Полный спектр высокоточного измерительного оборудования: координатно-измерительные машины PMT, лазерные и оптические 3D-сканеры ScanLine, ручные 3D-сканеры Shining 3D, мобильные КИМ Hexagon Absolute Arm, лазерные трекеры Leica и измерительные системы ScanLine.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <div className="px-4 py-1.5 bg-white/10 rounded-xl flex items-center gap-1.5 font-medium border border-white/10">
                  <span className="font-bold text-amber-300">78 моделей</span> в каталоге
                </div>
                <div className="px-4 py-1.5 bg-white/10 rounded-xl flex items-center gap-1.5 font-medium border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Внесено в Госреестр СИ РФ
                </div>
                <div className="px-4 py-1.5 bg-white/10 rounded-xl flex items-center gap-1.5 font-medium border border-white/10">
                  <Award className="w-3.5 h-3.5 text-blue-300" /> Сертифицированный СЦ
                </div>
              </div>
            </div>

            {/* Visual Image Card */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0 relative z-10">
              <div className="relative rounded-xl overflow-hidden shadow-sm border border-white/20 bg-blue-950/60 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
                <img 
                  src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80" 
                  alt="Координатно-измерительные машины и 3D-сканеры" 
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 text-xs">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>КИМ PMT • Hexagon ARM • Shining 3D</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  </div>
                  <div className="text-[11px] text-blue-200 mt-0.5">
                    Точность от 0.001 мм • Поверка и сервис в РФ
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Main Category Filter Tabs */}
      <div id="hardware-filters" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Категории оборудования:</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Показано: <strong className="text-blue-600 dark:text-blue-400">{filteredProducts.length}</strong> из {hardwareProducts.length} моделей
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-2 text-xs sm:text-sm w-full">
          {CATEGORIES.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = filterCat === tab.id;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => {
                  setFilterCat(tab.id);
                  setActiveCategory(tab.id === 'all' ? null : tab.id);
                  if (tab.id === 'brand-scanline') {
                    setSelectedBrand('scanline');
                  }
                }}
                className={`px-4.5 py-2.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition-all flex items-center gap-2 border cursor-pointer ${
                  isActive
                    ? 'bg-[#2563EB] text-white font-semibold border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                <span>{tab.shortLabel} ({tab.count})</span>
              </motion.button>
            );
          })}
        </div>

        {/* Quick Brand Filter Chips Bar (Mobile & Desktop) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-1 scrollbar-none">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0 mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Бренд:
          </span>
          {[
            { id: 'all', label: 'Все бренды' },
            { id: 'scanline', label: '🇷🇺 ScanLine (Россия)', highlight: true, count: 26 },
            { id: 'shining', label: '🇨🇳 Shining 3D', count: 33 },
            { id: 'pmt', label: 'PMT Arm & CMM', count: 10 },
            { id: 'hexagon', label: '🔷 Hexagon & Leica', count: 17 },
            { id: 'renishaw', label: 'Renishaw', count: 10 },
          ].map((b) => {
            const isBrandActive = selectedBrand === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setSelectedBrand(b.id);
                  if (b.id === 'scanline') {
                    setFilterCat('brand-scanline');
                    setActiveCategory('brand-scanline');
                  } else if (filterCat === 'brand-scanline') {
                    setFilterCat('all');
                    setActiveCategory(null);
                  }
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all border cursor-pointer flex items-center gap-1.5 ${
                  isBrandActive
                    ? b.id === 'scanline'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-bold ring-2 ring-amber-300/40'
                      : 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                    : b.highlight
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{b.label}</span>
                {b.count && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isBrandActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {b.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Search & View Mode Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по названию, модели, точности (напр. Einstar, TrackerScan, 50 линий, 0.02 мм)..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                addRecentSearch(searchQuery);
              }
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-gray-100/70 dark:hover:bg-slate-700/70 focus:bg-white dark:focus:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Recent searches dropdown */}
          {isSearchFocused && recentSearches.length > 0 && (
            <RecentSearchesDropdown
              searches={recentSearches}
              onSelect={(term) => {
                setSearchQuery(term);
                addRecentSearch(term);
              }}
              onRemove={removeRecentSearch}
              onClear={clearRecentSearches}
            />
          )}
        </div>

        {/* Filters and View Mode Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Filter Panel Toggle Button */}
          <button
            type="button"
            id="toolbar-filter-toggle"
            onClick={() => setIsFilterPanelOpen(prev => !prev)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeFacetsCount > 0
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-slate-100/70 dark:hover:bg-slate-700'
            }`}
            title="Панель параметров точности, форм-фактора и реестра СИ"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Параметры</span>
            {activeFacetsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {activeFacetsCount}
              </span>
            )}
            {isFilterPanelOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Brand Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">Бренд:</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Все бренды</option>
              <option value="scanline">ScanLine (Россия)</option>
              <option value="shining">Shining 3D (Китай)</option>
              <option value="pmt">PMT Arm & CMM</option>
              <option value="hexagon">Hexagon & Leica</option>
              <option value="renishaw">Renishaw</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'grouped'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Группировка по сериям с заголовками"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">По группам</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Сетка карточек"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Плитка</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Таблица характеристик"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Таблица</span>
            </button>
          </div>
        </div>
      </div>

      {/* Faceted Filter Panel */}
      <HardwareFacetFilter
        selectedAccuracy={selectedAccuracy}
        onChangeAccuracy={setSelectedAccuracy}
        selectedFormFactors={selectedFormFactors}
        onChangeFormFactors={setSelectedFormFactors}
        onlyGostReestr={onlyGostReestr}
        onChangeOnlyGostReestr={setOnlyGostReestr}
        onResetAll={handleResetFacets}
        accuracyCounts={facetCounts.accuracyCounts}
        formFactorCounts={facetCounts.formFactorCounts}
        gostReestrCount={facetCounts.gostReestrCount}
        totalFilteredCount={filteredProducts.length}
        totalAvailableCount={baseCategoryProducts.length}
        isCollapsed={!isFilterPanelOpen}
        onToggleCollapse={() => setIsFilterPanelOpen(prev => !prev)}
      />

      {/* No results notice */}
      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-200 space-y-4">
          <Info className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">Оборудование не найдено</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            По вашему запросу «{searchQuery}» ничего не найдено. Попробуйте сбросить фильтры или ввести другое название.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBrand('all');
              setFilterCat('all');
              handleResetFacets();
            }}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Сбросить все фильтры
          </button>
        </div>
      )}

      <div id="hardware-catalog">
      {/* VIEW MODE 1: GROUPED SECTIONS (Recommended for 78 models) */}
      {viewMode === 'grouped' && filteredProducts.length > 0 && (
        <div className="space-y-6">
          {groupedSections.map((section) => (
            <div key={section.id} className="space-y-4">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-blue-600/20 dark:border-blue-500/20 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                    {(section as any).flag || <section.icon className="w-4 h-4 snap-section" />}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{section.label}</span>
                      <span className="text-xs px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold rounded-full border border-blue-200 dark:border-blue-800">
                        {section.items.length} моделей
                      </span>
                    </h2>
                  </div>
                </div>
                {(section as any).badge && (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-1 rounded-full self-start sm:self-auto border border-gray-200 dark:border-slate-700">
                    {(section as any).badge}
                  </span>
                )}
              </div>

              {/* Grid of items in this section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {section.items.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    prod={prod}
                    onOpenDetail={handleOpenDetail}
                    isInCompare={isInCompare(prod.id)}
                    onAddToCompare={() => addToCompare(prod)}
                    onOpenQuote={() =>
                      openContactModal({
                        title: `Запрос КП на ${prod.name}`,
                        defaultProduct: prod.name,
                        formType: 'quote',
                      })
                    }
                    onOpenDemo={() =>
                      openContactModal({
                        title: `Заказ демо-версии ${prod.name}`,
                        defaultProduct: prod.name,
                        formType: 'demo',
                      })
                    }
                    onOpenBrochure={() =>
                      openContactModal({
                        title: `Запрос брошюры: ${prod.name}`,
                        defaultProduct: prod.name,
                        formType: 'brochure',
                      })
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 2: FLAT GRID */}
      {viewMode === 'grid' && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              prod={prod}
              onOpenDetail={handleOpenDetail}
              isInCompare={isInCompare(prod.id)}
              onAddToCompare={() => addToCompare(prod)}
              onOpenQuote={() =>
                openContactModal({
                  title: `Запрос КП на ${prod.name}`,
                  defaultProduct: prod.name,
                  formType: 'quote',
                })
              }
              onOpenDemo={() =>
                openContactModal({
                  title: `Заказ демо-версии ${prod.name}`,
                  defaultProduct: prod.name,
                  formType: 'demo',
                })
              }
              onOpenBrochure={() =>
                openContactModal({
                  title: `Запрос брошюры: ${prod.name}`,
                  defaultProduct: prod.name,
                  formType: 'brochure',
                })
              }
            />
          ))}
        </div>
      )}

      {/* VIEW MODE 3: COMPARISON SPECS TABLE */}
      {viewMode === 'table' && filteredProducts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Модель / Бренд</th>
                  <th className="py-3 px-4">Категория</th>
                  <th className="py-3 px-4">Ключевая точность</th>
                  <th className="py-3 px-4">Скорость / Поле / Датчик</th>
                  <th className="py-3 px-4">Особенность</th>
                  <th className="py-3 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredProducts.map((prod) => {
                  const specsList = prod.specs ? Object.entries(prod.specs) : [];
                  const accuracySpec = specsList.find(([k]) => k.toLowerCase().includes('точность') || k.toLowerCase().includes('погрешность'))?.[1] || specsList[0]?.[1] || '—';
                  const speedSpec = specsList.find(([k]) => k.toLowerCase().includes('скорость') || k.toLowerCase().includes('диапазон') || k.toLowerCase().includes('источник') || k.toLowerCase().includes('поле'))?.[1] || specsList[1]?.[1] || '—';

                  return (
                    <motion.tr 
                      key={prod.id} 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div 
                          onClick={() => handleOpenDetail(prod)}
                          className="font-bold text-slate-900 dark:text-white text-xs cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                        >
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{prod.brand}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                        {prod.categoryLabel}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                        {typeof accuracySpec === 'string' ? accuracySpec.replace(/([0-9])(мм|мкм)/gi, '$1 $2') : accuracySpec}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {typeof speedSpec === 'string' ? speedSpec.replace(/([0-9])(мм|мкм)/gi, '$1 $2') : speedSpec}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          {prod.badge ? (
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-md font-semibold text-[10px] border border-blue-200 dark:border-blue-800">
                              {prod.badge}
                            </span>
                          ) : null}
                          {getProductMetrology(prod).isGostReestr && (
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md font-semibold text-[10px] border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Госреестр СИ</span>
                            </span>
                          )}
                          {!prod.badge && !getProductMetrology(prod).isGostReestr && (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(prod)}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-[11px] transition-colors shadow-xs cursor-pointer"
                          >
                            Инфо
                          </button>
                          <button
                            onClick={() => addToCompare(prod)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                              isInCompare(prod.id)
                                ? 'bg-amber-500 border-amber-500 text-white'
                                : 'border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                            title="Сравнить"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              openContactModal({
                                title: `Заказ демо-версии ${prod.name}`,
                                defaultProduct: prod.name,
                                formType: 'demo',
                              })
                            }
                            className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold rounded-lg text-[11px] border border-amber-200 dark:border-amber-800/60 transition-colors cursor-pointer"
                          >
                            Демо
                          </button>
                          <button
                            onClick={() =>
                              openContactModal({
                                title: `Запрос КП на ${prod.name}`,
                                defaultProduct: prod.name,
                                formType: 'quote',
                              })
                            }
                            className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg text-[11px] border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer"
                          >
                            КП
                          </button>
                          {prod.brochureUrl && (
                            <a
                              href={prod.brochureUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-slate-800 hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Скачать брошюру"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* Bottom CTA Banner */}
      <div id="hardware-cta" className="bg-gradient-to-r from-gray-900 to-blue-950 text-white p-8 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-amber-400 tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Не уверены, какое оборудование выбрать?</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            Закажите тестовое сканирование вашей детали или выездную демонстрацию
          </h3>
          <p className="text-xs sm:text-sm text-gray-300">
            Наши инженеры проведут демонстрацию на вашем производстве или в нашем метрологическом центре в Самаре, подготовят метрологический отчет и подберут оптимальную комплектацию КИМ или 3D-сканера.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={() => openContactModal({ title: 'Заказ демонстрации оборудования', formType: 'demo' })}
            className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all whitespace-nowrap"
          >
            Заказать демонстрацию
          </button>
          <button
            onClick={() => openContactModal({ title: 'Консультация инженера-метролога', formType: 'consultation' })}
            className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap border border-white/20"
          >
            Консультация эксперта
          </button>
        </div>
      </div>

      {/* FAQ SECTION */}
      {filteredProducts.length > 0 && (
        <ProductFaqSection
          faqs={filteredProducts.flatMap(p => p.faq || [])}
          title={
            filterCat === 'all'
              ? 'База знаний по 3D-оборудованию и метрологии'
              : 'Часто задаваемые вопросы по категории'
          }
          subtitle="Технические аспекты, совместимость, поверка и калибровка от инженеров ДС‑Инжиниринг"
        />
      )}
        </>
      )}

      {/* Printable Specification Interactive Modal */}
      {isPrintModalOpen && printProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-slate-100/90 dark:bg-slate-900/90 text-slate-900 dark:text-white flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-600/30 border border-blue-200 dark:border-blue-400/40 flex items-center justify-center shrink-0">
                  <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Официальный паспорт оборудования</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{printProduct.name} • {printProduct.brand}</p>
                </div>
              </div>
              <button
                onClick={handleClosePrintModal}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Buttons Toolbar */}
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Выберите действие:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handlePrintDirectWindow(printProduct)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Печать / Сохранить в PDF</span>
                </button>
                <button
                  onClick={() => handleOpenNewTabDocument(printProduct)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Открыть в новой вкладке ↗</span>
                </button>
                <button
                  onClick={() => handleDownloadHTML(printProduct)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Скачать .HTML</span>
                </button>
              </div>
            </div>

            {/* Printable Preview Sheet Container */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100/70 dark:bg-slate-950/70">
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-sm max-w-3xl mx-auto text-slate-900 text-xs leading-relaxed font-sans space-y-6">
                {/* Printable Header */}
                <div className="flex justify-between items-start border-b-2 border-blue-900 pb-4">
                  <div>
                    <div className="text-lg sm:text-xl font-extrabold text-blue-900 tracking-tight">ООО «ДС‑Инжиниринг»</div>
                    <div className="text-[11px] text-slate-500 font-semibold">Промышленная метрология • 3D-сканирование • КИМ • Оборудование</div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <strong>Тел:</strong> +7 (495) 120-42-88<br />
                    <strong>Email:</strong> info@ds-eng.ru<br />
                    <strong>Сайт:</strong> www.ds-eng.ru
                  </div>
                </div>

                <div className="text-center bg-slate-100 p-2 rounded-lg font-bold text-slate-900 uppercase tracking-wide text-xs">
                  Официальный технический паспорт и спецификация оборудования
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-blue-900">{printProduct.name}</h1>
                  <div className="text-xs text-slate-500 mt-1">
                    Бренд: <strong>{printProduct.brand}</strong> | Категория: <strong>{printProduct.categoryLabel}</strong> | Код: <code>{printProduct.id}</code>
                  </div>
                  <p className="mt-3 text-xs text-slate-700 leading-relaxed text-justify">
                    {printProduct.fullDescription}
                  </p>
                </div>

                {/* Specs Table Render inside preview */}
                {printProduct.dualModeSpecs ? (
                  <div className="space-y-3">
                    <h4 className="font-bold uppercase text-blue-900 text-xs tracking-wider">
                      Технические и метрологические характеристики:
                    </h4>
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-800 text-white">
                            <th className="p-2.5 font-bold w-1/3">Характеристика / Параметр</th>
                            <th className="p-2.5 font-bold text-center w-1/3 bg-blue-900 text-blue-100">
                              {printProduct.dualModeSpecs.modeTitle1 || 'Лазерное сканирование'}
                            </th>
                            <th className="p-2.5 font-bold text-center w-1/3 bg-blue-900 text-blue-100">
                              {printProduct.dualModeSpecs.modeTitle2 || 'Инфракрасное сканирование (VCSEL)'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {printProduct.dualModeSpecs.rows.map((r, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="p-2.5 font-bold text-slate-800 border-r border-gray-200">{r.label}</td>
                              {r.singleVal ? (
                                <td colSpan={2} className="p-2.5 text-center bg-blue-50/40 font-medium">{r.singleVal}</td>
                              ) : (
                                <>
                                  <td className="p-2.5 text-center font-mono bg-blue-50/20 border-r border-gray-200">{r.laserVal || '—'}</td>
                                  <td className="p-2.5 text-center font-mono bg-blue-50/20">{r.irVal || '—'}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : printProduct.specs ? (
                  <div className="space-y-3">
                    <h4 className="font-bold uppercase text-blue-900 text-xs tracking-wider">
                      Технические характеристики:
                    </h4>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(printProduct.specs).map(([k, v], i) => (
                            <tr key={k} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="p-2.5 font-bold text-slate-800 w-2/5 border-r border-gray-200">{k}</td>
                              <td className="p-2.5 font-mono text-slate-900">{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {/* Features */}
                <div>
                  <h4 className="font-bold uppercase text-blue-900 text-xs tracking-wider mb-2">
                    Преимущества и комплектация:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                    {printProduct.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                {/* Footer stamp */}
                <div className="pt-4 border-t border-gray-200 flex justify-between items-end text-[10px] text-slate-500">
                  <div>
                    <span className="font-bold text-blue-900 border border-dashed border-blue-900 px-4 py-1 rounded-md inline-block mb-1">
                      МЕТРОЛОГИЧЕСКИЙ КОНТРОЛЬ ДС‑ИНЖИНИРИНГ — ПОВЕРЕНО
                    </span>
                    <div>Официальная гарантия производителя: 24 месяца в РФ.</div>
                  </div>
                  <div className="text-right">
                    Инжиниринговый центр «ДС‑Инжиниринг»<br />
                    Документ сформирован автоматически
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted Clean Product Card Component
interface ProductCardProps {
  prod: Product;
  onOpenDetail: (prod: Product) => void;
  isInCompare: boolean;
  onAddToCompare: () => void;
  onOpenQuote: () => void;
  onOpenDemo: () => void;
  onOpenBrochure: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  prod,
  onOpenDetail,
  isInCompare,
  onAddToCompare,
  onOpenQuote,
  onOpenDemo,
  onOpenBrochure,
}) => {
  const { showToast } = useApp();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== 'undefined' ? `${window.location.origin}/hardware/${prod.id}` : `/hardware/${prod.id}`;
    await copyToClipboard(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    showToast('Ссылка на товар скопирована');
  };

  const metrology = getProductMetrology(prod);

  // Extract and prioritize key technical specs for clear visual presentation
  const keySpecs = useMemo(() => {
    if (!prod.specs) return [];
    const entries = Object.entries(prod.specs);
    const prioritizedKeywords = ['точность', 'погрешность', 'источник', 'режим', 'скорость', 'поле', 'диапазон', 'подключ', 'интерфейс'];

    const sorted = [...entries].sort(([a], [b]) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const aIdx = prioritizedKeywords.findIndex(pk => aLower.includes(pk));
      const bIdx = prioritizedKeywords.findIndex(pk => bLower.includes(pk));
      const scoreA = aIdx === -1 ? 99 : aIdx;
      const scoreB = bIdx === -1 ? 99 : bIdx;
      return scoreA - scoreB;
    });

    return sorted.slice(0, 3);
  }, [prod.specs]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex flex-col justify-between group"
    >
      {/* Product Image & Badges */}
      <div className="relative bg-slate-50 dark:bg-slate-800/80 overflow-hidden aspect-[16/10]">
        <img
          src={prod.image}
          alt={`${prod.name} — ${prod.categoryLabel} ${prod.brand} от ДС-Инжиниринг`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onClick={() => onOpenDetail(prod)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
        />
        
        {/* Top Badges Bar with generous spacing */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          {prod.badge ? (
            <span className="px-2.5 py-1 bg-blue-600/95 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm line-clamp-1 max-w-[70%] pointer-events-auto">
              {prod.badge}
            </span>
          ) : (
            <div />
          )}

          <span className="px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs text-slate-800 dark:text-slate-100 text-[10px] sm:text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 pointer-events-auto">
            {prod.brand}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {prod.categoryLabel}
            </span>
            {prod.technologyLabel && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {prod.technologyLabel}
              </span>
            )}
          </div>

          <h3 
            onClick={() => onOpenDetail(prod)}
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug cursor-pointer line-clamp-2 hover:underline"
            title={prod.name}
          >
            {prod.name}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {prod.shortDescription}
          </p>

          {/* Key Specifications Table - Spacious, Legible & Well Padded */}
          {keySpecs.length > 0 && (
            <div className="mt-3.5 bg-slate-50/90 dark:bg-slate-800/60 rounded-xl p-3 sm:p-3.5 border border-slate-200/70 dark:border-slate-800 space-y-2">
              {keySpecs.map(([k, v]) => (
                <div key={k} className="flex items-start justify-between text-xs gap-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0 max-w-[48%]">
                    {k}:
                  </span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold text-right break-words">
                    {typeof v === 'string' ? v.replace(/([0-9])(мм|мкм)/gi, '$1 $2') : v}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Metrology & State Register Badge */}
          <div className="pt-2 flex items-center justify-between gap-2 text-xs">
            <span className={`inline-flex items-center gap-1.5 font-medium ${metrology.isGostReestr ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${metrology.isGostReestr ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[11px] sm:text-xs">{metrology.isGostReestr ? 'Госреестр СИ РФ • Поверка' : 'Метрологический контроль'}</span>
            </span>
            <span className="text-blue-700 dark:text-blue-300 font-mono font-bold text-[11px] bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 shrink-0">
              {ACCURACY_TIER_CONFIG[metrology.accuracyTier].range}
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar with clear mobile & desktop ergonomics */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenDetail(prod)}
              className="flex-1 py-2.5 px-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all text-center shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Подробнее</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenQuote}
              className="py-2.5 px-3 sm:px-3.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold rounded-xl text-xs border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer shrink-0"
              title="Запросить коммерческое предложение"
            >
              Запрос КП
            </button>

            <button
              onClick={onOpenDemo}
              className="py-2.5 px-3 sm:px-3.5 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold rounded-xl text-xs border border-amber-200 dark:border-amber-800/60 transition-colors cursor-pointer shrink-0"
              title="Заказать демонстрацию оборудования"
            >
              Демо
            </button>
          </div>

          {/* Secondary Utility Row: Compare, Copy Link, Brochure */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <button
              onClick={onAddToCompare}
              className={`flex-1 py-2 px-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                isInCompare
                  ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
              title="Добавить в сравнение характеристик"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isInCompare ? 'В сравнении' : 'Сравнить'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                isCopied
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
              title="Скопировать прямую ссылку на товар"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopied ? 'Скопировано' : 'Ссылка'}</span>
            </button>

            {prod.brochureUrl ? (
              <a
                href={prod.brochureUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                title="Скачать брошюру / паспорт"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Буклет</span>
              </a>
            ) : (
              <button
                onClick={onOpenBrochure}
                className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                title="Запросить буклет оборудования"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Буклет</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
