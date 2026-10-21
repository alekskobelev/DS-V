import React, { useMemo, useState } from 'react';
import { 
  ChevronRight, 
  Home, 
  ArrowLeft, 
  Share2, 
  Check, 
  Tag,
  Layers,
  Box,
  FileText,
  BookOpen,
  Wrench
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageId, NavigationHistoryItem } from '../../types';
import { getRoutePath } from '../../utils/routes';
import { 
  getSoftwareCategoryLabel, 
  getHardwareCategoryLabel, 
  getKnowledgeCategoryLabel, 
  getPageTitle 
} from '../../utils/navigationLabels';

export interface BreadcrumbItemProp {
  label: string;
  page?: PageId;
  id?: string;
  category?: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItemProp[];
  className?: string;
  showBackButton?: boolean;
  showShareButton?: boolean;
}

interface InternalBreadcrumb {
  id: string;
  name: string;
  href: string;
  page?: PageId;
  detailId?: string;
  category?: string;
  badge?: string;
  isCurrent?: boolean;
}

/**
 * Breadcrumbs (Хлебные крошки) — компонент навигации в src/components/common/Breadcrumbs.tsx
 * Динамически отражает текущий маршрут и положение пользователя в иерархии сайта:
 * - Главная страница
 * - Разделы каталога (ПО, Оборудование, Услуги, База знаний, Новости, Контакты, О компании, CRM, CMS)
 * - Категорийные срезы и фильтры
 * - Детальные карточки продуктов, услуг, статей базы знаний и новостей
 * - Пользовательские страницы CMS
 * - Поддержка микроразметки Schema.org (BreadcrumbList)
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items,
  className = '',
  showBackButton = true,
  showShareButton = true
}) => {
  const {
    currentPage,
    navigateTo,
    selectedProduct,
    setSelectedProduct,
    selectedArticle,
    setSelectedArticle,
    selectedServiceId,
    setSelectedServiceId,
    selectedKnowledgeItem,
    setSelectedKnowledgeItem,
    selectedKnowledgeCategory,
    setSelectedKnowledgeCategory,
    activeCategory,
    setActiveCategory,
    services,
    customPages,
    navigationHistory,
    showToast,
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);

  // Определение предыдущего шага в истории переходов
  const previousHistoryItem = useMemo<NavigationHistoryItem | null>(() => {
    if (!navigationHistory || navigationHistory.length < 2) return null;
    return navigationHistory[1] || null;
  }, [navigationHistory]);

  // Динамическое построение цепочки хлебных крошек
  const breadcrumbs = useMemo<InternalBreadcrumb[]>(() => {
    const base: InternalBreadcrumb[] = [
      {
        id: 'home',
        name: 'Главная',
        href: getRoutePath('home'),
        page: 'home',
        isCurrent: currentPage === 'home' && (!items || items.length === 0),
      },
    ];

    // Если переданы кастомные элементы через props
    if (items && items.length > 0) {
      items.forEach((item, idx) => {
        const isLast = idx === items.length - 1;
        base.push({
          id: `custom-${idx}`,
          name: item.label,
          href: item.href || (item.page ? getRoutePath(item.page, item.id) : ''),
          page: item.page,
          detailId: item.id,
          category: item.category,
          isCurrent: isLast,
        });
      });
      return base;
    }

    // Если мы на главной, цепочка состоит из одного элемента
    if (currentPage === 'home') {
      return base;
    }

    switch (currentPage) {
      case 'software': {
        const softwareCrumb: InternalBreadcrumb = {
          id: 'software',
          name: 'Каталог ПО',
          href: getRoutePath('software'),
          page: 'software',
        };

        if (selectedProduct && selectedProduct.type === 'software') {
          base.push(softwareCrumb);
          if (selectedProduct.category) {
            base.push({
              id: `sw-cat-${selectedProduct.category}`,
              name: selectedProduct.categoryLabel || getSoftwareCategoryLabel(selectedProduct.category),
              href: getRoutePath('software'),
              page: 'software',
              category: selectedProduct.category,
            });
          }
          base.push({
            id: `prod-${selectedProduct.id}`,
            name: selectedProduct.name,
            href: getRoutePath('software', selectedProduct.id),
            page: 'software',
            detailId: selectedProduct.id,
            badge: 'ПО',
            isCurrent: true,
          });
        } else if (activeCategory && activeCategory !== 'all') {
          base.push(softwareCrumb);
          base.push({
            id: `sw-cat-${activeCategory}`,
            name: getSoftwareCategoryLabel(activeCategory),
            href: getRoutePath('software'),
            page: 'software',
            category: activeCategory,
            badge: 'Раздел ПО',
            isCurrent: true,
          });
        } else {
          softwareCrumb.isCurrent = true;
          base.push(softwareCrumb);
        }
        break;
      }

      case 'hardware': {
        const hardwareCrumb: InternalBreadcrumb = {
          id: 'hardware',
          name: 'Измерительное оборудование',
          href: getRoutePath('hardware'),
          page: 'hardware',
        };

        if (selectedProduct && selectedProduct.type === 'hardware') {
          base.push(hardwareCrumb);
          if (selectedProduct.category) {
            base.push({
              id: `hw-cat-${selectedProduct.category}`,
              name: selectedProduct.categoryLabel || getHardwareCategoryLabel(selectedProduct.category),
              href: getRoutePath('hardware'),
              page: 'hardware',
              category: selectedProduct.category,
            });
          }
          base.push({
            id: `prod-${selectedProduct.id}`,
            name: selectedProduct.name,
            href: getRoutePath('hardware', selectedProduct.id),
            page: 'hardware',
            detailId: selectedProduct.id,
            badge: 'Оборудование',
            isCurrent: true,
          });
        } else if (activeCategory && activeCategory !== 'all') {
          base.push(hardwareCrumb);
          base.push({
            id: `hw-cat-${activeCategory}`,
            name: getHardwareCategoryLabel(activeCategory),
            href: getRoutePath('hardware'),
            page: 'hardware',
            category: activeCategory,
            badge: 'Тип оборудования',
            isCurrent: true,
          });
        } else {
          hardwareCrumb.isCurrent = true;
          base.push(hardwareCrumb);
        }
        break;
      }

      case 'services': {
        const servicesCrumb: InternalBreadcrumb = {
          id: 'services',
          name: 'Инжиниринговые услуги',
          href: getRoutePath('services'),
          page: 'services',
        };

        if (selectedServiceId) {
          base.push(servicesCrumb);
          const foundService = services.find((s) => s.id === selectedServiceId);
          const isCalc = selectedServiceId === 'calculator' || selectedServiceId === 'service-calculator';
          base.push({
            id: `service-${selectedServiceId}`,
            name: isCalc ? 'Онлайн-калькулятор стоимости' : (foundService ? foundService.title : 'Детализация услуги'),
            href: isCalc ? '/calculator' : getRoutePath('services', selectedServiceId),
            page: 'services',
            detailId: selectedServiceId,
            badge: isCalc ? 'Калькулятор' : 'Услуга',
            isCurrent: true,
          });
        } else {
          servicesCrumb.isCurrent = true;
          base.push(servicesCrumb);
        }
        break;
      }

      case 'knowledge': {
        const knowledgeCrumb: InternalBreadcrumb = {
          id: 'knowledge',
          name: 'База знаний и статьи',
          href: getRoutePath('knowledge'),
          page: 'knowledge',
        };

        if (selectedKnowledgeItem) {
          base.push(knowledgeCrumb);
          if (selectedKnowledgeItem.category) {
            base.push({
              id: `know-cat-${selectedKnowledgeItem.category}`,
              name: getKnowledgeCategoryLabel(selectedKnowledgeItem.category),
              href: getRoutePath('knowledge'),
              page: 'knowledge',
              category: selectedKnowledgeItem.category,
            });
          }
          base.push({
            id: `know-${selectedKnowledgeItem.id}`,
            name: selectedKnowledgeItem.title,
            href: getRoutePath('knowledge', selectedKnowledgeItem.id),
            page: 'knowledge',
            detailId: selectedKnowledgeItem.id,
            badge: 'Методика',
            isCurrent: true,
          });
        } else if (selectedKnowledgeCategory && selectedKnowledgeCategory !== 'all') {
          base.push(knowledgeCrumb);
          base.push({
            id: `know-cat-${selectedKnowledgeCategory}`,
            name: getKnowledgeCategoryLabel(selectedKnowledgeCategory),
            href: getRoutePath('knowledge'),
            page: 'knowledge',
            category: selectedKnowledgeCategory,
            badge: 'Тематика',
            isCurrent: true,
          });
        } else {
          knowledgeCrumb.isCurrent = true;
          base.push(knowledgeCrumb);
        }
        break;
      }

      case 'news': {
        const newsCrumb: InternalBreadcrumb = {
          id: 'news',
          name: 'Пресс-центр',
          href: getRoutePath('news'),
          page: 'news',
        };

        if (selectedArticle) {
          base.push(newsCrumb);
          base.push({
            id: `article-${selectedArticle.id}`,
            name: selectedArticle.title,
            href: getRoutePath('news', selectedArticle.id),
            page: 'news',
            detailId: selectedArticle.id,
            badge: 'Статья',
            isCurrent: true,
          });
        } else {
          newsCrumb.isCurrent = true;
          base.push(newsCrumb);
        }
        break;
      }

      case 'about':
      case 'contacts':
      case 'account':
      case 'cms':
      case 'crm':
      case 'sitemap': {
        base.push({
          id: currentPage,
          name: getPageTitle(currentPage),
          href: getRoutePath(currentPage),
          page: currentPage,
          isCurrent: true,
        });
        break;
      }

      default: {
        if (currentPage.startsWith('custom-')) {
          const customPage = customPages.find((cp) => cp.id === currentPage);
          if (customPage) {
            base.push({
              id: customPage.id,
              name: customPage.title || customPage.menuTitle,
              href: `/page/${customPage.slug}`,
              page: currentPage,
              badge: 'Раздел',
              isCurrent: true,
            });
          } else {
            base.push({
              id: currentPage,
              name: 'Пользовательский раздел',
              href: `#${currentPage}`,
              page: currentPage,
              isCurrent: true,
            });
          }
        }
        break;
      }
    }

    return base;
  }, [
    items,
    currentPage,
    selectedProduct,
    selectedArticle,
    selectedKnowledgeItem,
    selectedKnowledgeCategory,
    selectedServiceId,
    activeCategory,
    services,
    customPages,
  ]);

  // Не рендерим крошки на главной странице, если не переданы кастомные элементы
  if (currentPage === 'home' && (!items || items.length === 0)) {
    return null;
  }

  // Обработчик клика по хлебной крошке
  const handleCrumbClick = (e: React.MouseEvent, crumb: InternalBreadcrumb) => {
    e.preventDefault();
    if (crumb.isCurrent) return;

    if (crumb.page === 'home') {
      navigateTo('home');
    } else if (crumb.page === 'software') {
      if (crumb.detailId) {
        navigateTo('software', crumb.detailId);
      } else if (crumb.category) {
        setSelectedProduct(null);
        setActiveCategory(crumb.category);
        navigateTo('software');
      } else {
        setSelectedProduct(null);
        setActiveCategory('all');
        navigateTo('software');
      }
    } else if (crumb.page === 'hardware') {
      if (crumb.detailId) {
        navigateTo('hardware', crumb.detailId);
      } else if (crumb.category) {
        setSelectedProduct(null);
        setActiveCategory(crumb.category);
        navigateTo('hardware');
      } else {
        setSelectedProduct(null);
        setActiveCategory('all');
        navigateTo('hardware');
      }
    } else if (crumb.page === 'services') {
      if (crumb.detailId) {
        navigateTo('services', crumb.detailId);
      } else {
        setSelectedServiceId(null);
        navigateTo('services');
      }
    } else if (crumb.page === 'knowledge') {
      if (crumb.detailId) {
        navigateTo('knowledge', crumb.detailId);
      } else if (crumb.category) {
        setSelectedKnowledgeItem(null);
        setSelectedKnowledgeCategory(crumb.category);
        navigateTo('knowledge');
      } else {
        setSelectedKnowledgeItem(null);
        setSelectedKnowledgeCategory('all');
        navigateTo('knowledge');
      }
    } else if (crumb.page === 'news') {
      if (crumb.detailId) {
        navigateTo('news', crumb.detailId);
      } else {
        setSelectedArticle(null);
        navigateTo('news');
      }
    } else if (crumb.page) {
      navigateTo(crumb.page);
    }
  };

  // Обработчик кнопки «Назад»
  const handleBackClick = () => {
    if (previousHistoryItem) {
      if (previousHistoryItem.detailId) {
        navigateTo(previousHistoryItem.page, previousHistoryItem.detailId);
      } else {
        navigateTo(previousHistoryItem.page);
      }
    } else if (breadcrumbs.length > 1) {
      const parentCrumb = breadcrumbs[breadcrumbs.length - 2];
      handleCrumbClick({ preventDefault: () => {} } as React.MouseEvent, parentCrumb);
    } else {
      navigateTo('home');
    }
  };

  // Копирование ссылки на текущую страницу
  const handleShareClick = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      if (showToast) {
        showToast('Ссылка на раздел скопирована в буфер обмена');
      }
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Построение структурированных данных Schema.org (BreadcrumbList)
  const schemaBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.href.startsWith('http') ? crumb.href : `https://ds-engineering.ru${crumb.href}`,
    })),
  };

  return (
    <nav 
      aria-label="Навигация по разделам (Хлебные крошки)" 
      className={`w-full bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md sticky top-16 z-20 transition-colors duration-200 ${className}`}
    >
      {/* Schema.org Microdata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbs) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left: Interactive Crumb Chain */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 min-w-0">
          {showBackButton && (
            <button
              type="button"
              onClick={handleBackClick}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 font-medium cursor-pointer"
              title="Вернуться на предыдущий уровень"
              aria-label="Назад"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Назад</span>
            </button>
          )}

          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const isHome = idx === 0;

            return (
              <React.Fragment key={crumb.id || idx}>
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 select-none" />
                )}

                {isLast ? (
                  <span
                    className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[320px] md:max-w-[450px] shrink-0 flex items-center gap-1.5"
                    aria-current="page"
                    title={crumb.name}
                  >
                    {crumb.badge && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-700/50">
                        {crumb.badge}
                      </span>
                    )}
                    <span className="truncate">{crumb.name}</span>
                  </span>
                ) : (
                  <a
                    href={crumb.href}
                    onClick={(e) => handleCrumbClick(e, crumb)}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors shrink-0 truncate max-w-[150px] sm:max-w-[220px]"
                    title={`Перейти в раздел «${crumb.name}»`}
                  >
                    {isHome && <Home className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />}
                    <span className="truncate">{crumb.name}</span>
                  </a>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Quick Utility Actions (Share / Copy link) */}
        {showShareButton && (
          <div className="flex items-center gap-1 shrink-0 pl-2">
            <button
              type="button"
              onClick={handleShareClick}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="Скопировать прямую ссылку на данный раздел"
              aria-label="Поделиться"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">Скопировано</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Поделиться</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Breadcrumbs;
