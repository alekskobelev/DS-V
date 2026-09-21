import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Layers, Search, SlidersHorizontal, ArrowRight, Cpu, ShieldCheck, Workflow, Box, CheckCircle2, HelpCircle, ChevronDown, ChevronUp, Sparkles, ExternalLink, Wrench, GraduationCap, FileCode, Check
} from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { SoftwareProductCard } from './SoftwareProductCard';

interface SoftwareOverviewSubViewProps {
  products: Product[];
  currentCategory?: string;
  onOpenDetail?: (product: Product) => void;
}

const GENERAL_SOFTWARE_FAQ = [
  {
    q: 'Какое программное обеспечение выбрать под конкретные задачи предприятия?',
    a: 'Выбор определяется технологическими задачами: для сквозного 3D-проектирования изделий, оснастки, пресс-форм и создания управляющих программ станков с ЧПУ (2D–5D) применяется система TopSolid 7; для метрологического контроля и работы с КИМ, руками и трекерами — PolyWorks|Inspector™; для параметрического построения твердотельных CAD-моделей по полигональным сеткам — Geomagic Design X и EXModel Pro; для автоматизированного контроля геометрии и отчетов FAI — Geomagic Control X и SHINING 3D Inspect.',
  },
  {
    q: 'Предоставляются ли полнофункциональные демонстрационные лицензии для тестирования?',
    a: 'Да. «ДС‑Инжиниринг» предоставляет временные полнофункциональные лицензии сроком от 14 до 30 дней, а также организует выездные технические демонстрации и тестовую обработку или контрольные замеры реальных деталей заказчика.',
  },
  {
    q: 'Входят ли обучение инженеров и разработка постпроцессоров в договор поставки?',
    a: 'Да. Мы обеспечиваем полный комплекс внедрения: разработку индивидуальных постпроцессоров и кинематических 3D-моделей станков с ЧПУ, верификацию траекторий, а также очный инструктаж конструкторов, технологов-программистов и контролеров ОТК с выдачей сертификатов.',
  },
  {
    q: 'Какие типы лицензирования поддерживаются (локальные / сетевые)?',
    a: 'Все программные комплексы поставляются как с локальной привязкой к рабочему месту (Node-locked программный ключ или USB-донгл), так и с плавающими сетевыми лицензиями (Floating / Network) для гибкого распределения рабочих мест между сотрудниками проектных и технологических бюро.',
  },
];

export const SoftwareOverviewSubView: React.FC<SoftwareOverviewSubViewProps> = ({
  products,
  currentCategory = 'all',
  onOpenDetail,
}) => {
  const { navigateTo, openContactModal } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDirection, setSelectedDirection] = useState<'all' | 'cad-cam' | 'reverse' | 'metrology'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'name-asc' | 'name-desc'>('default');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const softwareProducts = useMemo(() => {
    return products.filter((p) => p.type === 'software');
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    softwareProducts.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  }, [softwareProducts]);

  const filteredProducts = useMemo(() => {
    return softwareProducts
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
        
        // Category filtering
        let matchesCategory = true;
        const cat = p.category?.toLowerCase() || '';
        const id = p.id.toLowerCase();
        
        if (currentCategory && currentCategory !== 'all') {
          if (currentCategory === 'topsolid') {
            matchesCategory = cat === 'topsolid' || id.includes('topsolid');
          } else if (currentCategory === 'polyworks') {
            matchesCategory = cat === 'polyworks' || id.includes('polyworks');
          } else if (currentCategory === 'geomagic') {
            matchesCategory = cat === 'geomagic' || id.includes('geomagic') || id.includes('design-x') || id.includes('control-x');
          } else if (currentCategory === 'shining3d-sw' || currentCategory === 'shining3d') {
            matchesCategory = cat === 'shining3d-sw' || cat === 'shining3d' || id.includes('shining3d') || id.includes('exmodel');
          }
        }

        // Direction sub-filter
        let matchesDirection = true;
        if (selectedDirection === 'cad-cam') {
          matchesDirection = id.includes('topsolid');
        } else if (selectedDirection === 'reverse') {
          // Strictly Reverse Engineering software: Geomagic Design X, Shining 3D EXModel
          matchesDirection = id.includes('design-x') || id.includes('exmodel');
        } else if (selectedDirection === 'metrology') {
          // Metrology & Inspection & GD&T: PolyWorks Inspector, Geomagic Control X, Shining 3D Inspect
          matchesDirection = id.includes('polyworks') || id.includes('control-x') || id.includes('inspect');
        }

        return matchesSearch && matchesBrand && matchesCategory && matchesDirection;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [softwareProducts, searchQuery, selectedBrand, selectedDirection, currentCategory, sortBy]);

  const handleProductClick = (product: Product) => {
    if (onOpenDetail) {
      onOpenDetail(product);
    } else {
      navigateTo('software', product.id);
    }
  };

  return (
    <div className="space-y-10">
      {/* Quick Highlights Grid */}
      <section id="software-highlights" className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs scroll-mt-24">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">Внедрение и обучение</div>
          <div className="text-slate-500 dark:text-slate-300 mt-1 text-xs">Очный инструктаж технологов и написание постпроцессоров ЧПУ</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Сертификат PTB Class 1</div>
          <div className="text-slate-500 dark:text-slate-300 mt-1 text-xs">Высший класс точности алгоритмов PolyWorks и Shining 3D</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="font-bold text-purple-600 dark:text-purple-400 text-sm">Сетевые лицензии</div>
          <div className="text-slate-500 dark:text-slate-300 mt-1 text-xs">Гибкое распределение рабочих мест в заводской сети</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">Реверс-инжиниринг</div>
          <div className="text-slate-500 dark:text-slate-300 mt-1 text-xs">Параметрическое твердотельное моделирование по сканам</div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="space-y-6 scroll-mt-24" id="software-catalog">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="relative w-full md:w-96 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск ПО (например, 'PolyWorks' или 'ЧПУ')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:text-white"
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
            {currentCategory === 'all' && (
              <select
                value={selectedDirection}
                onChange={(e) => setSelectedDirection(e.target.value as any)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer dark:text-white appearance-none min-w-[150px]"
              >
                <option value="all">Все направления</option>
                <option value="cad-cam">CAD / CAM / PDM</option>
                <option value="metrology">Метрология и КИМ</option>
                <option value="reverse">Реверс-инжиниринг</option>
              </select>
            )}

            {brands.length > 1 && (
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer dark:text-white appearance-none min-w-[140px]"
              >
                <option value="all">Все бренды</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Catalog Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <SoftwareProductCard key={p.id} product={p} onOpenDetail={handleProductClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Layers className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">ПО не найдено</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Попробуйте изменить параметры поиска или сбросить фильтры, чтобы увидеть доступные программные комплексы.
            </p>
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs scroll-mt-24" id="software-faq">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Частые вопросы по лицензированию и внедрению ПО</span>
        </h3>
        <div className="space-y-3">
          {GENERAL_SOFTWARE_FAQ.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm pr-4">
                    {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-slate-500 dark:text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
