import React, { useMemo, useEffect } from 'react';
import { ShieldCheck, Award, Layers, HelpCircle, Laptop, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Scrollspy } from '../components/common/Scrollspy';
import { SoftwareOverviewSubView } from '../components/software/SoftwareOverviewSubView';
import { SoftwareProductDetail } from '../components/software/SoftwareProductDetail';
import { SoftwareCategoryNav } from '../components/software/SoftwareCategoryNav';
import { Product } from '../types';

export const SoftwarePage: React.FC = () => {
  const {
    products,
    selectedProduct,
    setSelectedProduct,
    activeCategory,
    setActiveCategory,
    navigateTo,
    openContactModal,
    siteTexts
  } = useApp();

  const softwareProducts = useMemo(() => {
    return products.filter((p) => p.type === 'software');
  }, [products]);

  // Determine current active sub-category
  const normalizedCategory = useMemo(() => {
    if (!activeCategory || activeCategory === 'all') return 'all';
    const cat = activeCategory.toLowerCase();
    if (cat === 'shining3d') return 'shining3d-sw';
    return cat;
  }, [activeCategory]);

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    navigateTo('software', product.id);
  };

  const handleBackToSubView = () => {
    setSelectedProduct(null);
    if (normalizedCategory && normalizedCategory !== 'all') {
      navigateTo('software', normalizedCategory);
    } else {
      navigateTo('software');
    }
  };

  // Scrollspy sections tailored per view
  const scrollSections = useMemo(() => {
    if (selectedProduct) {
      return [];
    }
    return [
      { id: 'software-hero', label: 'Главный баннер' },
      { id: 'software-nav', label: 'Категории ПО' },
      { id: 'software-highlights', label: 'Преимущества внедрения' },
      { id: 'software-catalog', label: 'Каталог программ' },
      { id: 'software-faq', label: 'Вопросы и ответы' },
    ];
  }, [selectedProduct]);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [normalizedCategory, selectedProduct?.id]);

  const categoryTitles: Record<string, { title: string; subtitle: string; badge: string }> = {
    topsolid: {
      title: 'TopSolid 7 — Сквозная цифровая CAD/CAM/PDM система',
      subtitle: 'Официальная поставка лицензий, разработка кинематических 3D-моделей и постпроцессоров для 2D–5D ЧПУ, внедрение PDM и обучение технологов.',
      badge: 'CAD / CAM / PDM комплексы',
    },
    polyworks: {
      title: 'PolyWorks — Универсальная платформа 3D-метрологии',
      subtitle: 'Мировой эталон метрологического контроля для КИМ, измерительных рук, лазерных трекеров и 3D-сканеров. Сертификация PTB Class 1.',
      badge: '3D-Метрология и КИМ',
    },
    geomagic: {
      title: 'Geomagic — Реверс-инжиниринг и контроль качества',
      subtitle: 'Программные комплексы Design X и Control X для прямого параметрического построения твердотельных CAD-моделей и инспекции по сканам.',
      badge: 'Реверс-инжиниринг и FAI',
    },
    'shining3d-sw': {
      title: 'Программное обеспечение Shining 3D',
      subtitle: 'Специализированные решения EXModel Pro и SHINING 3D Inspect для работы с 3D-сканерами, извлечения геометрии и контроля точности.',
      badge: 'ПО Shining 3D',
    },
  };

  return (
    <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {scrollSections.length > 0 && <Scrollspy sections={scrollSections} />}
      
      {/* If a specific software product is selected -> Render Standard Unified Detail View */}
      {selectedProduct && selectedProduct.type === 'software' ? (
        <SoftwareProductDetail product={selectedProduct} onBack={handleBackToSubView} />
      ) : (
        <>
          {/* Unified Corporate Header Banner */}
          {normalizedCategory === 'all' ? (
            <div
              id="software-hero"
              className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#2563EB] text-white p-5 sm:p-6 lg:p-8 rounded-xl shadow-sm relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-8 scroll-mt-24"
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="max-w-2xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{siteTexts.catalogs.softwareBadge || 'Инженерные компетенции и цифровое производство с 1995 года'}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {siteTexts.catalogs.softwareTitle || 'Программное обеспечение для проектирования, производства и 3D-контроля'}
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                  {siteTexts.catalogs.softwareSubtitle || 'Официальный интегратор TopSolid 7 (CAD/CAM/PDM), универсальной метрологической платформы PolyWorks, комплексов реверс-инжиниринга Geomagic и софта Shining 3D. Поставка лицензий, разработка постпроцессоров ЧПУ, верификация траекторий и обучение персонала.'}
                </p>
                
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                  <button
                    onClick={() =>
                      openContactModal({
                        title: 'Подбор программного комплекса под задачи производства',
                        defaultProduct: 'Программное обеспечение',
                        formType: 'consult',
                      })
                    }
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Подобрать комплекс под задачи
                  </button>
                  <button
                    onClick={() =>
                      openContactModal({
                        title: 'Заказ демонстрации ПО на деталях предприятия',
                        defaultProduct: 'Программное обеспечение',
                        formType: 'demo',
                      })
                    }
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Заказать демонстрацию ПО
                  </button>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                  <div className="px-4 py-1.5 bg-white/10 rounded-xl flex items-center gap-1.5 font-medium border border-white/10">
                    <span className="font-bold text-amber-300">4 платформы</span> в каталоге
                  </div>
                  <div className="px-4 py-1.5 bg-white/10 rounded-xl flex items-center gap-1.5 font-medium border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Сертификаты PTB Class 1
                  </div>
                  <div className="px-4 py-1.5 bg-white/10 rounded-xl flex items-center gap-1.5 font-medium border border-white/10">
                    <Award className="w-3.5 h-3.5 text-blue-300" /> Разработка постпроцессоров ЧПУ
                  </div>
                </div>
              </div>

              {/* Visual Image Card */}
              <div className="w-full lg:w-80 xl:w-96 shrink-0 relative z-10">
                <div className="relative rounded-xl overflow-hidden shadow-sm border border-white/20 bg-blue-950/60 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
                  <img
                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80"
                    alt="Инженерное программное обеспечение CAD/CAM/PDM и метрология"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 text-xs">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>TopSolid 7 • PolyWorks • Geomagic</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                    <div className="text-[11px] text-blue-200 mt-0.5">
                      Лицензии • Постпроцессоры • Обучение инженеров
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Subcategory Header Banner */
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[11px] font-bold">
                  <span>{categoryTitles[normalizedCategory]?.badge}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {categoryTitles[normalizedCategory]?.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
                  {categoryTitles[normalizedCategory]?.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    openContactModal({
                      title: `Запрос демо-доступа: ${categoryTitles[normalizedCategory]?.badge}`,
                      defaultProduct: categoryTitles[normalizedCategory]?.badge,
                      formType: 'demo',
                    })
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Заказать демо
                </button>
                <button
                  onClick={() => navigateTo('software')}
                  className="px-4.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Все ПО</span>
                </button>
              </div>
            </div>
          )}

          {/* Category Navigation Tabs */}
          <div id="software-nav" className="scroll-mt-24">
            <SoftwareCategoryNav currentCategory={normalizedCategory} />
          </div>

          {/* Unified Catalog View with Category Filtering */}
          <SoftwareOverviewSubView
            products={softwareProducts}
            currentCategory={normalizedCategory}
            onOpenDetail={handleOpenDetail}
          />
        </>
      )}
    </div>
  );
};
