import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  Home, 
  ArrowLeft, 
  History, 
  Clock, 
  Trash2, 
  Share2, 
  Check, 
  ExternalLink,
  Tag,
  Layers,
  Box,
  FileText,
  BookOpen,
  Wrench,
  Sparkles,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageId, NavigationHistoryItem } from '../../types';
import { getRoutePath } from '../../utils/routes';
import { 
  getSoftwareCategoryLabel, 
  getHardwareCategoryLabel, 
  getKnowledgeCategoryLabel, 
  getPageTitle, 
  formatTimeAgo 
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

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const {
    isAdmin,
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
    clearNavigationHistory,
    showToast,
  } = useApp();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const historyDropdownRef = useRef<HTMLDivElement>(null);
  const historyButtonRef = useRef<HTMLButtonElement>(null);

  // Close history dropdown on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        historyDropdownRef.current &&
        !historyDropdownRef.current.contains(e.target as Node) &&
        historyButtonRef.current &&
        !historyButtonRef.current.contains(e.target as Node)
      ) {
        setIsHistoryOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsHistoryOpen(false);
      }
    };

    if (isHistoryOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHistoryOpen]);

  // Compute previous navigation history item (for Back button)
  const previousHistoryItem = useMemo<NavigationHistoryItem | null>(() => {
    if (!navigationHistory || navigationHistory.length < 2) return null;
    // Current item is at index 0, previous is at index 1
    return navigationHistory[1] || null;
  }, [navigationHistory]);

  // Dynamic hierarchy resolution based on current application state
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

    // If custom items are passed explicitly via props, use them
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

    // If on home, return just the Home crumb
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
              id: `kb-cat-${selectedKnowledgeItem.category}`,
              name: getKnowledgeCategoryLabel(selectedKnowledgeItem.category),
              href: getRoutePath('knowledge'),
              page: 'knowledge',
              category: selectedKnowledgeItem.category,
            });
          }
          base.push({
            id: `kb-item-${selectedKnowledgeItem.id}`,
            name: selectedKnowledgeItem.title,
            href: getRoutePath('knowledge'),
            page: 'knowledge',
            detailId: selectedKnowledgeItem.id,
            badge: 'Статья',
            isCurrent: true,
          });
        } else if (selectedKnowledgeCategory && selectedKnowledgeCategory !== 'all') {
          base.push(knowledgeCrumb);
          base.push({
            id: `kb-cat-${selectedKnowledgeCategory}`,
            name: getKnowledgeCategoryLabel(selectedKnowledgeCategory),
            href: getRoutePath('knowledge'),
            page: 'knowledge',
            category: selectedKnowledgeCategory,
            badge: 'Раздел знаний',
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
          name: 'Пресс-центр и события',
          href: getRoutePath('news'),
          page: 'news',
        };

        if (selectedArticle) {
          base.push(newsCrumb);
          if (selectedArticle.category) {
            base.push({
              id: `news-cat-${selectedArticle.category}`,
              name: selectedArticle.category,
              href: getRoutePath('news'),
              page: 'news',
            });
          }
          base.push({
            id: `article-${selectedArticle.id}`,
            name: selectedArticle.title,
            href: getRoutePath('news', selectedArticle.id),
            page: 'news',
            detailId: selectedArticle.id,
            badge: 'Новость',
            isCurrent: true,
          });
        } else {
          newsCrumb.isCurrent = true;
          base.push(newsCrumb);
        }
        break;
      }

      case 'about': {
        base.push({
          id: 'about',
          name: 'О компании «ДС‑Инжиниринг»',
          href: getRoutePath('about'),
          page: 'about',
          isCurrent: true,
        });
        break;
      }

      case 'contacts': {
        base.push({
          id: 'contacts',
          name: 'Контакты и филиалы',
          href: getRoutePath('contacts'),
          page: 'contacts',
          isCurrent: true,
        });
        break;
      }

      case 'account': {
        base.push({
          id: 'account',
          name: isAdmin ? 'Личный кабинет администратора' : 'Личный кабинет заказчика',
          href: getRoutePath('account'),
          page: 'account',
          badge: isAdmin ? 'Админ' : 'Клиент',
          isCurrent: true,
        });
        break;
      }

      case 'cms': {
        base.push({
          id: 'cms',
          name: 'Панель управления (CMS)',
          href: getRoutePath('cms'),
          page: 'cms',
          badge: 'CMS',
          isCurrent: true,
        });
        break;
      }

      case 'crm': {
        base.push({
          id: 'crm',
          name: 'Система управления сделками (CRM)',
          href: getRoutePath('crm'),
          page: 'crm',
          badge: 'CRM',
          isCurrent: true,
        });
        break;
      }

      case 'notfound': {
        base.push({
          id: 'notfound',
          name: 'Страница не найдена',
          href: getRoutePath('notfound'),
          page: 'notfound',
          badge: '404',
          isCurrent: true,
        });
        break;
      }

      default: {
        if (currentPage.startsWith('custom-')) {
          const customPage = customPages.find((p) => p.id === currentPage);
          base.push({
            id: currentPage,
            name: customPage ? customPage.title : 'Информационный раздел',
            href: `/page/${currentPage.replace('custom-', '')}`,
            page: currentPage,
            badge: 'Страница',
            isCurrent: true,
          });
        } else {
          base.push({
            id: currentPage,
            name: getPageTitle(currentPage, isAdmin),
            href: getRoutePath(currentPage),
            page: currentPage,
            isCurrent: true,
          });
        }
        break;
      }
    }

    return base;
  }, [
    items,
    currentPage,
    selectedProduct,
    activeCategory,
    selectedServiceId,
    services,
    selectedArticle,
    selectedKnowledgeItem,
    selectedKnowledgeCategory,
    customPages,
    isAdmin,
  ]);

  // Inject Schema.org BreadcrumbList microdata into document head
  useEffect(() => {
    if (!breadcrumbs || breadcrumbs.length === 0) return;

    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        item: crumb.href.startsWith('http')
          ? crumb.href
          : `https://ds-engineering.ru${crumb.href}`,
      })),
    };

    let script = document.getElementById('schema-breadcrumbs') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'schema-breadcrumbs';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLdData);

    return () => {
      const el = document.getElementById('schema-breadcrumbs');
      if (el) el.remove();
    };
  }, [breadcrumbs]);

  // Click on a breadcrumb item
  const handleCrumbClick = (crumb: InternalBreadcrumb, e: React.MouseEvent) => {
    e.preventDefault();
    if (crumb.isCurrent) return;

    if (crumb.page === 'home') {
      setSelectedProduct(null);
      setSelectedArticle(null);
      setSelectedServiceId(null);
      setSelectedKnowledgeItem(null);
      setSelectedKnowledgeCategory(null);
      setActiveCategory(null);
      navigateTo('home');
      return;
    }

    if (crumb.category && (crumb.page === 'software' || crumb.page === 'hardware')) {
      setSelectedProduct(null);
      setActiveCategory(crumb.category);
      navigateTo(crumb.page);
      return;
    }

    if (crumb.page === 'software' || crumb.page === 'hardware') {
      setSelectedProduct(null);
      setActiveCategory(null);
      navigateTo(crumb.page);
      return;
    }

    if (crumb.page === 'services') {
      setSelectedServiceId(null);
      navigateTo('services');
      return;
    }

    if (crumb.page === 'knowledge') {
      setSelectedKnowledgeItem(null);
      if (crumb.category) {
        setSelectedKnowledgeCategory(crumb.category);
      } else {
        setSelectedKnowledgeCategory(null);
      }
      navigateTo('knowledge');
      return;
    }

    if (crumb.page === 'news') {
      setSelectedArticle(null);
      navigateTo('news');
      return;
    }

    if (crumb.page) {
      navigateTo(crumb.page, crumb.detailId);
    }
  };

  // Smart Back navigation: prioritizes previous history entry
  const handleBack = () => {
    if (previousHistoryItem) {
      if (previousHistoryItem.page === 'home') {
        setSelectedProduct(null);
        setSelectedArticle(null);
        setSelectedServiceId(null);
        setSelectedKnowledgeItem(null);
        setSelectedKnowledgeCategory(null);
        setActiveCategory(null);
        navigateTo('home');
      } else if (previousHistoryItem.page === 'software' || previousHistoryItem.page === 'hardware') {
        if (previousHistoryItem.detailId) {
          navigateTo(previousHistoryItem.page, previousHistoryItem.detailId);
        } else if (previousHistoryItem.category) {
          setSelectedProduct(null);
          setActiveCategory(previousHistoryItem.category);
          navigateTo(previousHistoryItem.page);
        } else {
          setSelectedProduct(null);
          setActiveCategory(null);
          navigateTo(previousHistoryItem.page);
        }
      } else if (previousHistoryItem.page === 'knowledge') {
        if (previousHistoryItem.detailId) {
          navigateTo('knowledge', previousHistoryItem.detailId);
        } else if (previousHistoryItem.category) {
          setSelectedKnowledgeItem(null);
          setSelectedKnowledgeCategory(previousHistoryItem.category);
          navigateTo('knowledge');
        } else {
          setSelectedKnowledgeItem(null);
          setSelectedKnowledgeCategory(null);
          navigateTo('knowledge');
        }
      } else {
        navigateTo(previousHistoryItem.page, previousHistoryItem.detailId);
      }
    } else {
      // Fallback
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      } else {
        navigateTo('home');
      }
    }
  };

  // Jump to a history item from dropdown
  const handleHistoryJump = (item: NavigationHistoryItem) => {
    setIsHistoryOpen(false);
    if (item.page === 'home') {
      setSelectedProduct(null);
      setSelectedArticle(null);
      setSelectedServiceId(null);
      setSelectedKnowledgeItem(null);
      setSelectedKnowledgeCategory(null);
      setActiveCategory(null);
      navigateTo('home');
    } else if (item.page === 'software' || item.page === 'hardware') {
      if (item.detailId) {
        navigateTo(item.page, item.detailId);
      } else if (item.category) {
        setSelectedProduct(null);
        setActiveCategory(item.category);
        navigateTo(item.page);
      } else {
        setSelectedProduct(null);
        setActiveCategory(null);
        navigateTo(item.page);
      }
    } else if (item.page === 'knowledge') {
      if (item.detailId) {
        navigateTo('knowledge', item.detailId);
      } else if (item.category) {
        setSelectedKnowledgeItem(null);
        setSelectedKnowledgeCategory(item.category);
        navigateTo('knowledge');
      } else {
        setSelectedKnowledgeItem(null);
        setSelectedKnowledgeCategory(null);
        navigateTo('knowledge');
      }
    } else {
      navigateTo(item.page, item.detailId);
    }
  };

  // Copy current URL
  const handleCopyLink = () => {
    try {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast('Ссылка на раздел скопирована в буфер обмена');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      showToast('Не удалось скопировать ссылку');
    }
  };

  // Helper for badge color
  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'ПО':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Оборудование':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Услуга':
      case 'Калькулятор':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Статья':
      case 'База знаний':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Новость':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const isHomeOnly = currentPage === 'home' && (!items || items.length === 0);

  return (
    <motion.nav
      id="site-breadcrumbs-bar"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Навигация по разделам сайта (хлебные крошки)"
      className="bg-slate-50/90 dark:bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 py-2 text-xs text-slate-600 dark:text-slate-400 font-normal transition-colors relative z-20 shadow-2xs"
    >
      <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Left Side: Back button + Breadcrumb trail */}
        <div className="flex items-center min-w-0 gap-2 sm:gap-3 overflow-hidden">
          {/* Smart "Назад" Button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={isHomeOnly && !previousHistoryItem}
            title={
              previousHistoryItem
                ? `Вернуться назад: «${previousHistoryItem.title}»`
                : 'Вернуться на предыдущую страницу'
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
              isHomeOnly && !previousHistoryItem
                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
                : 'bg-white dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700/80 shadow-2xs'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline font-semibold">Назад</span>
          </button>

          {/* Vertical subtle divider */}
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 shrink-0 hidden xs:block" />

          {/* Breadcrumb List with horizontal smooth scrolling */}
          <div className="overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap min-w-0 py-0.5 mask-gradient-r">
            <ol
              itemScope
              itemType="https://schema.org/BreadcrumbList"
              className="flex items-center gap-1.5 list-none m-0 p-0"
            >
              {breadcrumbs.map((crumb, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === breadcrumbs.length - 1;

                return (
                  <li
                    key={crumb.id || idx}
                    itemProp="itemListElement"
                    itemScope
                    itemType="https://schema.org/ListItem"
                    className="inline-flex items-center gap-1.5 shrink-0"
                  >
                    {/* Visual Separator */}
                    {!isFirst && (
                      <ChevronRight
                        className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 select-none"
                        aria-hidden="true"
                      />
                    )}

                    {isLast ? (
                      <span
                        itemProp="name"
                        aria-current="page"
                        className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white cursor-default select-text"
                        title={crumb.name}
                      >
                        {isFirst && (
                          <Home
                            className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <span className="max-w-[200px] sm:max-w-[320px] md:max-w-[450px] truncate">
                          {crumb.name}
                        </span>
                        {crumb.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase shrink-0 ${getBadgeStyle(
                              crumb.badge
                            )}`}
                          >
                            {crumb.badge}
                          </span>
                        )}
                      </span>
                    ) : (
                      <a
                        itemProp="item"
                        href={crumb.href}
                        onClick={(e) => handleCrumbClick(crumb, e)}
                        className="group inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm"
                        title={crumb.name}
                      >
                        {isFirst && (
                          <Home
                            className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors"
                            aria-hidden="true"
                          />
                        )}
                        <span
                          itemProp="name"
                          className="max-w-[140px] sm:max-w-[200px] truncate group-hover:underline underline-offset-2"
                        >
                          {crumb.name}
                        </span>
                      </a>
                    )}

                    <meta itemProp="position" content={String(idx + 1)} />
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Right Side: Navigation History & Copy Link Actions */}
        <div className="flex items-center gap-1.5 shrink-0 relative">
          {/* Quick Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            title="Скопировать ссылку на текущую страницу"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Navigation History Dropdown Button */}
          <div className="relative">
            <button
              ref={historyButtonRef}
              type="button"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              aria-expanded={isHistoryOpen}
              aria-haspopup="true"
              title="История просмотров и недавних переходов"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                isHistoryOpen
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-slate-200 dark:border-slate-700/80 shadow-2xs'
              }`}
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline font-semibold">История</span>
              {navigationHistory.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isHistoryOpen
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {navigationHistory.length}
                </span>
              )}
            </button>

            {/* Floating Navigation History Dropdown Popover */}
            <AnimatePresence>
              {isHistoryOpen && (
                <motion.div
                  ref={historyDropdownRef}
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700/90 overflow-hidden z-50 text-slate-700 dark:text-slate-200"
                >
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Недавние переходы ({navigationHistory.length})
                      </span>
                    </div>
                    {navigationHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={clearNavigationHistory}
                        title="Очистить историю просмотров"
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Очистить</span>
                      </button>
                    )}
                  </div>

                  {/* History Items List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                    {navigationHistory.length === 0 ? (
                      <div className="p-6 text-center space-y-2">
                        <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          История переходов пуста
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                          Переходите по разделам ПО, каталогу КИМ, услугам и статьям базы знаний — они сохранятся здесь для быстрого возврата.
                        </p>
                      </div>
                    ) : (
                      navigationHistory.map((item, idx) => {
                        const isCurrent =
                          item.page === currentPage &&
                          (item.detailId
                            ? item.detailId === (selectedProduct?.id || selectedArticle?.id || selectedServiceId || selectedKnowledgeItem?.id)
                            : true);

                        return (
                          <button
                            key={item.id || idx}
                            type="button"
                            onClick={() => handleHistoryJump(item)}
                            className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition-colors cursor-pointer group ${
                              isCurrent ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                            }`}
                          >
                            <span
                              className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 border uppercase tracking-wider ${getBadgeStyle(
                                item.badge
                              )}`}
                            >
                              {item.badge || 'Раздел'}
                            </span>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`text-xs font-semibold truncate block group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                                    isCurrent
                                      ? 'text-blue-700 dark:text-blue-300'
                                      : 'text-slate-800 dark:text-slate-100'
                                  }`}
                                >
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 ml-1">
                                  {formatTimeAgo(item.timestamp)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-mono">
                                {item.path || `/${item.page}`}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  {navigationHistory.length > 0 && (
                    <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-850/80 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
                      <span>Кликните для мгновенного перехода</span>
                      <button
                        type="button"
                        onClick={() => setIsHistoryOpen(false)}
                        className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Закрыть
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
