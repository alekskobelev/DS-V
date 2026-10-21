import React, { useState, useMemo } from 'react';
import { X, Search, Check, SlidersHorizontal, ArrowRight, Filter } from 'lucide-react';
import { PRODUCTS_DATA } from '../../data/mockData';
import { Product } from '../../types';

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlotIndex: number;
  currentProducts: (Product | null)[];
  onSelectProduct: (product: Product, slotIndex: number) => void;
  onApplyPreset?: (products: Product[]) => void;
}

export const ProductPickerModal: React.FC<ProductPickerModalProps> = ({
  isOpen,
  onClose,
  targetSlotIndex,
  currentProducts,
  onSelectProduct,
  onApplyPreset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'hardware' | 'software'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Popular comparison presets for 1-click comparison
  const presets = useMemo(() => {
    const findProd = (id: string) => PRODUCTS_DATA.find((p) => p.id === id);
    return [
      {
        id: 'scanners-top',
        title: '3D-сканеры (Метрологический класс)',
        desc: 'ScanLine Omni vs Shining 3D FreeScan Combo vs MetraSCAN 3D',
        products: [
          findProd('eq-scanline-easyscan-omni') || PRODUCTS_DATA.find((p) => p.name.includes('Omni')),
          findProd('shining-freescan-combo') || PRODUCTS_DATA.find((p) => p.name.includes('Combo')),
          PRODUCTS_DATA.find((p) => p.category === 'scanners' && !p.name.includes('Omni') && !p.name.includes('Combo')),
        ].filter((p): p is Product => Boolean(p)),
      },
      {
        id: 'arms-trackers',
        title: 'Портативные КИМ и Лазерные трекеры',
        desc: 'Hexagon ARM 8520 vs Leica AT403 vs PMT Arm Alpha',
        products: [
          findProd('leica-at403') || PRODUCTS_DATA.find((p) => p.name.includes('AT403') || p.id.includes('at403')),
          findProd('hexagon-absolute-arm-8520') || PRODUCTS_DATA.find((p) => p.name.includes('Hexagon') || p.name.includes('8520')),
          PRODUCTS_DATA.find((p) => p.category === 'arms' || p.categoryLabel.includes('рука')),
        ].filter((p): p is Product => Boolean(p)),
      },
      {
        id: 'cmm-stationary',
        title: 'Координатно-измерительные системы и калибровка',
        desc: 'ScanLine TrackerScan Pro vs PMT Alpha Arm vs Renishaw Equator 300',
        products: [
          findProd('scanline-trackerscan-pronova') || PRODUCTS_DATA.find((p) => p.id.includes('trackerscan')),
          PRODUCTS_DATA.find((p) => p.id.includes('pmt') || p.name.includes('PMT')),
          PRODUCTS_DATA.find((p) => p.id.includes('equator') || p.name.includes('Equator')),
        ].filter((p): p is Product => Boolean(p)),
      },
      {
        id: 'software-inspect',
        title: 'Программное обеспечение контроля геометрии и CAD/CAM',
        desc: 'TopSolid 7 vs PolyWorks|Inspector vs Geomagic Control X',
        products: [
          PRODUCTS_DATA.find((p) => p.id === 'topsolid-7' || p.name.includes('TopSolid 7')),
          PRODUCTS_DATA.find((p) => p.id === 'polyworks-inspector' || p.name.includes('PolyWorks')),
          PRODUCTS_DATA.find((p) => p.id === 'geomagic-control-x' || p.name.includes('Geomagic')),
        ].filter((p): p is Product => Boolean(p)),
      },
    ].filter((preset) => preset.products.length >= 2);
  }, []);

  // Categories list
  const categories = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    PRODUCTS_DATA.forEach((p) => {
      const cat = p.category || 'other';
      const label = p.categoryLabel || p.category;
      if (!map.has(cat)) {
        map.set(cat, { label, count: 0 });
      }
      map.get(cat)!.count++;
    });
    return Array.from(map.entries()).map(([id, data]) => ({
      id,
      label: data.label,
      count: data.count,
    }));
  }, []);

  // Brands list
  const brands = useMemo(() => {
    const set = new Set<string>();
    PRODUCTS_DATA.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return PRODUCTS_DATA.filter((p) => {
      if (productTypeFilter === 'hardware' && p.type === 'software') return false;
      if (productTypeFilter === 'software' && p.type !== 'software') return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchDesc = (p.shortDescription || '').toLowerCase().includes(q);
        const matchSpecs = JSON.stringify(p.specs || {}).toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchDesc && !matchSpecs) return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedBrand, productTypeFilter]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl max-h-[90vh] shadow-sm flex flex-col overflow-hidden border border-gray-200 dark:border-slate-800"
      >
        {/* Modal Header */}
        <div className="bg-[#1E3A8A] text-white p-4 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Выбор товара для сравнения</h3>
                <span className="text-xs px-2.5 py-0.5 bg-amber-500 text-white font-bold rounded-full">
                  Слот {targetSlotIndex + 1} из {currentProducts.length}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Выберите оборудование или программное обеспечение из каталога «ДС-Инжиниринг»
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-gray-200 dark:border-slate-800 space-y-3 shrink-0">
          {/* Product Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl w-fit text-xs font-semibold">
            <button
              onClick={() => {
                setProductTypeFilter('all');
                setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                productTypeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Все позиции
            </button>
            <button
              onClick={() => {
                setProductTypeFilter('hardware');
                setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                productTypeFilter === 'hardware'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Оборудование (Hardware)
            </button>
            <button
              onClick={() => {
                setProductTypeFilter('software');
                setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                productTypeFilter === 'software'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Программное обеспечение (Software)
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по модели, бренду (ScanLine, Hexagon, Leica, Mitutoyo, TopSolid)..."
                className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-500 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shrink-0 cursor-pointer"
            >
              <option value="all">Все бренды ({brands.length})</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
              }`}
            >
              Все категории ({PRODUCTS_DATA.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                }`}
              >
                {c.label} ({c.count})
              </button>
            ))}
          </div>
        </div>

        {/* Ready Presets Bar (shown if onApplyPreset is available and slots are mostly empty) */}
        {onApplyPreset && currentProducts.filter(Boolean).length <= 1 && (
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/60 p-3 md:px-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Готовые комплекты для сравнения инженеров (1 клик):
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onApplyPreset(preset.products);
                    onClose();
                  }}
                  className="p-2 bg-white dark:bg-slate-900 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white rounded-xl border border-blue-200 dark:border-blue-900/80 text-left transition-all shadow-2xs group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-white block leading-tight">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-slate-400 group-hover:text-blue-100 line-clamp-1 mt-0.5">
                      {preset.desc}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 group-hover:text-amber-300 mt-1.5 flex items-center gap-1">
                    Сравнить 3 модели <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400">
              <Filter className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-medium text-slate-700 dark:text-slate-300">Товары по запросу не найдены</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Попробуйте изменить поисковую фразу или сбросить фильтры</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedBrand('all');
                }}
                className="mt-3 px-4 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors cursor-pointer"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredProducts.map((product) => {
                const isAlreadySelected = currentProducts.some((p) => p?.id === product.id);
                const selectedSlotNum = currentProducts.findIndex((p) => p?.id === product.id);

                return (
                  <div
                    key={product.id}
                    className={`rounded-xl p-3.5 border transition-all flex flex-col justify-between relative group ${
                      isAlreadySelected
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-400/50'
                        : 'bg-white dark:bg-slate-800/80 border-gray-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Thumbnail & Badges */}
                      <div className="w-full h-28 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden mb-2.5 border border-gray-100 dark:border-slate-700 flex items-center justify-center p-2 relative">
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
                          <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white shadow-2xs">
                            {product.badge}
                          </span>
                        )}
                        {isAlreadySelected && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1 shadow-xs">
                            <Check className="w-2.5 h-2.5" /> В слоте {selectedSlotNum + 1}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                        {product.brand}
                      </span>
                      <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm mt-0.5 line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {product.shortDescription}
                      </p>

                      {/* Quick specs preview */}
                      {product.specs && Object.keys(product.specs).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700/80 space-y-0.5">
                          {Object.entries(product.specs)
                            .slice(0, 2)
                            .map(([k, v]) => (
                              <div key={k} className="text-[10px] text-slate-500 dark:text-slate-400 flex justify-between gap-1">
                                <span className="text-gray-400 dark:text-slate-500 truncate max-w-[110px]">{k}:</span>
                                <span className="font-medium text-gray-800 dark:text-slate-200 text-right truncate max-w-[130px]">{v}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-gray-900 dark:text-white">
                        {product.price || 'По запросу'}
                      </span>
                      <button
                        onClick={() => {
                          onSelectProduct(product, targetSlotIndex);
                          onClose();
                        }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isAlreadySelected
                            ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900'
                            : 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {isAlreadySelected ? 'Заменить' : `Выбрать в слот ${targetSlotIndex + 1}`}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-850 p-3 sm:p-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between shrink-0 text-xs text-gray-500 dark:text-slate-400">
          <span>Найдено моделей: <strong className="text-slate-800 dark:text-slate-200">{filteredProducts.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
