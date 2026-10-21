import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Tag,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  ChevronDown,
  ChevronRight,
  Database,
  ShieldCheck,
  Package,
  Wrench,
  Terminal,
  Sparkles,
  HelpCircle,
  X,
  Save,
  Calendar,
  User,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Sliders,
  Check,
  Zap,
  Calculator,
  Building2,
  Gift,
  BadgePercent,
  ArrowRight,
  ArrowUpDown
} from 'lucide-react';
import {
  PriceService,
  DEFAULT_PRICE_CATEGORIES,
  handleFirestoreError,
  OperationType
} from '../../services/PriceService';
import {
  PriceItem,
  PriceCategory,
  PriceHistoryRecord,
  PriceDiscountRule,
  PriceDiscountConfig,
  DEFAULT_DISCOUNT_RULES,
  calculateItemEconomics,
  calculateDiscountForItem,
  INDUSTRIAL_PRICE_LIST
} from '../../data/priceListsData';
import {
  exportPriceListToExcel,
  exportPriceListToCsv,
  exportPriceListMultiSectionCsv,
  exportPriceListPerCategoryCsv,
  ExportFilterSortOptions
} from '../../utils/priceListExcelExporter';
import { PriceListCsvImportModal } from './PriceListCsvImportModal';

export interface PriceListManagerProps {
  onSelectForProposal?: (item: PriceItem) => void;
  readOnly?: boolean;
  className?: string;
}

type SortField = 'name' | 'sku' | 'category' | 'priceRub' | 'costPriceRub' | 'marginPercent' | 'currentVersion';
type SortDirection = 'asc' | 'desc';
type MainTab = 'catalog' | 'discounts';

export const PriceListManager: React.FC<PriceListManagerProps> = ({
  onSelectForProposal,
  readOnly = false,
  className = ''
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<MainTab>('catalog');

  // State from Firestore
  const [items, setItems] = useState<PriceItem[]>([]);
  const [categories, setCategories] = useState<PriceCategory[]>(DEFAULT_PRICE_CATEGORIES);
  const [discountRules, setDiscountRules] = useState<PriceDiscountRule[]>(DEFAULT_DISCOUNT_RULES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [error, setError] = useState<string>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Filters and UI state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedItemType, setSelectedItemType] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'on_order'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [hideCostPrice, setHideCostPrice] = useState<boolean>(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('sku');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modals state for items
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [historyModalItem, setHistoryModalItem] = useState<PriceItem | null>(null);
  const [itemHistoryList, setItemHistoryList] = useState<PriceHistoryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [previewItem, setPreviewItem] = useState<PriceItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal state for Discount Rules
  const [editingDiscountRule, setEditingDiscountRule] = useState<PriceDiscountRule | null>(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState<boolean>(false);
  const [deleteDiscountRuleId, setDeleteDiscountRuleId] = useState<string | null>(null);

  // Interactive Discount Calculator / Simulator State
  const [calcItemId, setCalcItemId] = useState<string>('');
  const [calcQuantity, setCalcQuantity] = useState<number>(1);

  // New Version Form within History Modal
  const [newVersionCost, setNewVersionCost] = useState<number>(0);
  const [newVersionSale, setNewVersionSale] = useState<number>(0);
  const [newVersionReason, setNewVersionReason] = useState<string>('Плановая индексация цен');
  const [newVersionNotes, setNewVersionNotes] = useState<string>('');
  const [isSavingVersion, setIsSavingVersion] = useState<boolean>(false);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [isExportConfigModalOpen, setIsExportConfigModalOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'excel_multisheet' | 'csv_multisection' | 'csv_per_category' | 'csv_flat'>('excel_multisheet');
  const [exportSortField, setExportSortField] = useState<'sku' | 'name' | 'category' | 'priceRub' | 'costPriceRub' | 'marginPercent'>('sku');
  const [exportSortDir, setExportSortDir] = useState<'asc' | 'desc'>('asc');
  const [exportCategory, setExportCategory] = useState<string>('all');
  const [exportStock, setExportStock] = useState<'all' | 'in_stock' | 'on_order'>('all');
  const [exportIncludeEconomics, setExportIncludeEconomics] = useState<boolean>(true);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Subscribe to Firestore in real-time
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    let unsubItems: (() => void) | null = null;
    let unsubCategories: (() => void) | null = null;
    let unsubDiscounts: (() => void) | null = null;

    try {
      unsubItems = PriceService.subscribeToPriceItems((fetchedItems) => {
        setItems(fetchedItems);
        setIsLoading(false);
        setIsLiveConnected(true);
      });

      unsubCategories = PriceService.subscribeToCategories((fetchedCategories) => {
        if (fetchedCategories && fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        }
      });

      unsubDiscounts = PriceService.subscribeToDiscountRules((fetchedRules) => {
        if (fetchedRules && fetchedRules.length > 0) {
          setDiscountRules(fetchedRules);
        }
      });
    } catch (err: any) {
      console.warn('[PriceListManager] Error setting up real-time subscriptions, falling back to one-shot fetch:', err);
      PriceService.getAllPriceItems()
        .then((fetchedItems) => {
          setItems(fetchedItems);
          setIsLoading(false);
        })
        .catch((e) => {
          console.error('[PriceListManager] One-shot fetch failed:', e);
          setError('Ошибка подключения к Firestore. Отображаются резервные данные.');
          setItems(INDUSTRIAL_PRICE_LIST);
          setIsLoading(false);
        });

      PriceService.getDiscountRules()
        .then((rules) => {
          if (rules && rules.length > 0) setDiscountRules(rules);
        })
        .catch(() => {});
    }

    return () => {
      if (unsubItems) unsubItems();
      if (unsubCategories) unsubCategories();
      if (unsubDiscounts) unsubDiscounts();
    };
  }, []);

  // 2. Handle Seeding Firestore Data
  const handleSeedData = async (force: boolean = false) => {
    try {
      setIsSeeding(true);
      const result = await PriceService.seedInitialData(force);
      showToast(`Инициализировано ${result.itemsSeeded} позиций, ${result.discountRulesSeeded || 4} правил скидок и ${result.categoriesSeeded} категорий в Firestore`, 'success');
      const refreshed = await PriceService.getAllPriceItems();
      setItems(refreshed);
      const refreshedRules = await PriceService.getDiscountRules();
      setDiscountRules(refreshedRules);
    } catch (err: any) {
      console.error('Seed error:', err);
      showToast('Ошибка при инициализации базы данных Firestore: ' + (err.message || String(err)), 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // 3. Open History Modal & fetch history
  const handleOpenHistory = async (item: PriceItem) => {
    setHistoryModalItem(item);
    setNewVersionCost(item.costPriceRub);
    setNewVersionSale(item.priceRub);
    setNewVersionReason('Плановая индексация цен «ДС-Инжиниринг»');
    setNewVersionNotes('');
    setIsLoadingHistory(true);

    try {
      const history = await PriceService.getPriceHistory(item.id);
      setItemHistoryList(history);
    } catch (err) {
      console.error('Failed to load history:', err);
      showToast('Не удалось загрузить историю версий цен', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 4. Save new price version
  const handleSavePriceVersion = async () => {
    if (!historyModalItem) return;
    if (newVersionSale <= 0) {
      showToast('Цена продажи должна быть больше 0 руб.', 'error');
      return;
    }

    try {
      setIsSavingVersion(true);
      await PriceService.recordPriceVersion(historyModalItem.id, {
        costPriceRub: Number(newVersionCost) || 0,
        priceRub: Number(newVersionSale) || 0,
        partnerPriceRub: Math.round(Number(newVersionSale) * 0.9),
        changeReason: newVersionReason,
        changedByManagerName: 'Менеджер «ДС-Инжиниринг»',
        notes: newVersionNotes
      });

      await PriceService.updatePriceItem(historyModalItem.id, {
        costPriceRub: Number(newVersionCost) || 0,
        priceRub: Number(newVersionSale) || 0,
        partnerPriceRub: Math.round(Number(newVersionSale) * 0.9),
      }, {
        changeReason: newVersionReason,
        managerName: 'Менеджер «ДС-Инжиниринг»'
      });

      const updatedHistory = await PriceService.getPriceHistory(historyModalItem.id);
      setItemHistoryList(updatedHistory);

      showToast(`Новая редакция цены успешно зафиксирована!`, 'success');
    } catch (err: any) {
      console.error('Error saving price version:', err);
      showToast('Ошибка при фиксации версии цен: ' + (err.message || String(err)), 'error');
    } finally {
      setIsSavingVersion(false);
    }
  };

  // 5. Delete Item
  const handleDeleteItem = async (id: string) => {
    try {
      await PriceService.deletePriceItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setDeleteConfirmId(null);
      showToast('Позиция успешно удалена из каталога', 'success');
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast('Ошибка при удалении позиции: ' + (err.message || String(err)), 'error');
    }
  };

  // 6. Save Item (Create or Update)
  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const sku = String(formData.get('sku') || '').trim();
    const name = String(formData.get('name') || '').trim();
    const category = String(formData.get('category') || 'hardware') as any;
    const subCategory = String(formData.get('subCategory') || '').trim();
    const manufacturer = String(formData.get('manufacturer') || '').trim();
    const unit = String(formData.get('unit') || 'шт.').trim();
    const costPriceRub = Number(formData.get('costPriceRub')) || 0;
    const priceRub = Number(formData.get('priceRub')) || 0;
    const vatRate = Number(formData.get('vatRate')) || 22;
    const maxDiscountPercent = Number(formData.get('maxDiscountPercent')) || 15;
    const inStock = formData.get('inStock') === 'on';
    const leadTimeDays = Number(formData.get('leadTimeDays')) || 0;
    const description = String(formData.get('description') || '').trim();
    const notes = String(formData.get('notes') || '').trim();

    // Discount config on the item itself
    const discountType = String(formData.get('discountType') || 'none');
    const discountVal = Number(formData.get('discountValue')) || 0;
    const discountDesc = String(formData.get('discountDesc') || '').trim();

    let discount: PriceDiscountConfig | undefined = undefined;
    if (discountType === 'percent' && discountVal > 0) {
      discount = {
        type: 'percent',
        value: discountVal,
        description: discountDesc || undefined
      };
    } else if (discountType === 'fixed_rub' && discountVal > 0) {
      discount = {
        type: 'fixed_rub',
        value: discountVal,
        description: discountDesc || undefined
      };
    }

    if (!sku || !name || priceRub <= 0) {
      showToast('Заполните обязательные поля (Артикул, Наименование, Цена продажи > 0)', 'error');
      return;
    }

    const catObj = categories.find((c) => c.slug === category || c.id === category);
    const categoryLabel = catObj?.name || (
      category === 'software' ? 'Программное обеспечение' :
      category === 'hardware' ? 'Оборудование' :
      category === 'services' ? 'Инжиниринговые услуги' :
      category === 'accessories' ? 'Оснастка и щупы' : 'Сопутствующие услуги'
    );

    try {
      if (editingItem) {
        await PriceService.updatePriceItem(editingItem.id, {
          sku,
          name,
          category,
          categoryLabel,
          subCategory,
          manufacturer,
          unit,
          costPriceRub,
          priceRub,
          vatRate,
          maxDiscountPercent,
          discount: discount || null as any,
          inStock,
          leadTimeDays,
          description,
          notes
        }, {
          changeReason: 'Обновление параметров номенклатурной карточки в UI',
          managerName: 'Менеджер «ДС-Инжиниринг»'
        });
        showToast('Позиция успешно обновлена в Firestore', 'success');
      } else {
        await PriceService.createPriceItem({
          sku,
          name,
          category,
          categoryLabel,
          subCategory,
          manufacturer,
          unit,
          costPriceRub,
          priceRub,
          vatRate,
          maxDiscountPercent,
          discount,
          inStock,
          leadTimeDays,
          description,
          notes,
          isActive: true
        });
        showToast('Новая позиция успешно добавлена в каталог Firestore', 'success');
      }

      setIsCreateModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error('Save item error:', err);
      showToast('Ошибка сохранения позиции: ' + (err.message || String(err)), 'error');
    }
  };

  // 7. Save Discount Rule
  const handleSaveDiscountRule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get('name') || '').trim();
    const scope = String(formData.get('scope') || 'global') as 'global' | 'category' | 'product';
    const targetCategoryId = String(formData.get('targetCategoryId') || '');
    const targetItemId = String(formData.get('targetItemId') || '');
    const discountType = String(formData.get('discountType') || 'percent') as 'percent' | 'fixed_rub';
    const discountValue = Number(formData.get('discountValue')) || 0;
    const minOrderQuantity = Number(formData.get('minOrderQuantity')) || 1;
    const minOrderAmountRub = Number(formData.get('minOrderAmountRub')) || 0;
    const description = String(formData.get('description') || '').trim();
    const isActive = formData.get('isActive') === 'on';

    if (!name || discountValue <= 0) {
      showToast('Укажите название правила и величину скидки больше 0', 'error');
      return;
    }

    let targetCategoryLabel: string | undefined = undefined;
    if (scope === 'category' && targetCategoryId) {
      const c = categories.find(cat => cat.slug === targetCategoryId || cat.id === targetCategoryId);
      targetCategoryLabel = c ? c.name : targetCategoryId;
    }

    let targetItemName: string | undefined = undefined;
    if (scope === 'product' && targetItemId) {
      const p = items.find(item => item.id === targetItemId || item.sku === targetItemId);
      targetItemName = p ? p.name : targetItemId;
    }

    try {
      const saved = await PriceService.saveDiscountRule({
        id: editingDiscountRule ? editingDiscountRule.id : undefined,
        name,
        scope,
        targetCategoryId: scope === 'category' ? targetCategoryId : undefined,
        targetCategoryLabel: scope === 'category' ? targetCategoryLabel : undefined,
        targetItemId: scope === 'product' ? targetItemId : undefined,
        targetItemName: scope === 'product' ? targetItemName : undefined,
        discountType,
        discountValue,
        minOrderQuantity,
        minOrderAmountRub: minOrderAmountRub > 0 ? minOrderAmountRub : undefined,
        description,
        isActive
      });

      setDiscountRules(prev => {
        const exists = prev.some(r => r.id === saved.id);
        if (exists) {
          return prev.map(r => r.id === saved.id ? saved : r);
        }
        return [saved, ...prev];
      });

      setIsDiscountModalOpen(false);
      setEditingDiscountRule(null);
      showToast('Правило скидки успешно сохранено в Firestore', 'success');
    } catch (err: any) {
      console.error('Error saving discount rule:', err);
      showToast('Ошибка при сохранении правила скидки: ' + (err.message || String(err)), 'error');
    }
  };

  // 8. Delete Discount Rule
  const handleDeleteDiscountRule = async (id: string) => {
    try {
      await PriceService.deleteDiscountRule(id);
      setDiscountRules(prev => prev.filter(r => r.id !== id));
      setDeleteDiscountRuleId(null);
      showToast('Правило скидки удалено', 'success');
    } catch (err: any) {
      console.error('Error deleting discount rule:', err);
      showToast('Ошибка при удалении правила скидки: ' + (err.message || String(err)), 'error');
    }
  };

  // 9. Toggle Discount Rule active state
  const handleToggleRuleActive = async (rule: PriceDiscountRule) => {
    try {
      const updated = { ...rule, isActive: !rule.isActive };
      await PriceService.saveDiscountRule(updated);
      setDiscountRules(prev => prev.map(r => r.id === rule.id ? updated : r));
      showToast(`Правило «${rule.name}» ${updated.isActive ? 'активировано' : 'приостановлено'}`, 'info');
    } catch (err: any) {
      console.error('Toggle rule error:', err);
      showToast('Не удалось изменить статус правила', 'error');
    }
  };

  // 10. Filtered items list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Subcategory filter
      if (selectedSubCategory !== 'all' && item.subCategory !== selectedSubCategory) {
        return false;
      }
      // Item type filter
      if (selectedItemType !== 'all' && item.itemType !== selectedItemType) {
        return false;
      }
      // Stock filter
      if (stockFilter === 'in_stock' && !item.inStock) return false;
      if (stockFilter === 'on_order' && item.inStock) return false;
      // Status filter
      if (statusFilter === 'active' && item.isActive === false) return false;
      if (statusFilter === 'archived' && item.isActive !== false) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchSku = item.sku?.toLowerCase().includes(query);
        const matchName = item.name?.toLowerCase().includes(query);
        const matchManuf = item.manufacturer?.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        const matchNotes = item.notes?.toLowerCase().includes(query);
        if (!matchSku && !matchName && !matchManuf && !matchDesc && !matchNotes) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedCategory, selectedSubCategory, selectedItemType, stockFilter, statusFilter, searchQuery]);

  // 11. Sorted items
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'marginPercent') {
        const econA = calculateItemEconomics(a.costPriceRub, a.priceRub);
        const econB = calculateItemEconomics(b.costPriceRub, b.priceRub);
        valA = econA.marginPercent;
        valB = econB.marginPercent;
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB, 'ru')
          : valB.localeCompare(valA, 'ru');
      } else {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
    });
    return list;
  }, [filteredItems, sortField, sortDirection]);

  // Available subcategories for selected category
  const availableSubCategories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (selectedCategory === 'all' || item.category === selectedCategory) {
        if (item.subCategory) set.add(item.subCategory);
      }
    });
    return Array.from(set).sort();
  }, [items, selectedCategory]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = items.length;
    const inStockCount = items.filter((i) => i.inStock).length;
    let totalSaleValue = 0;
    let totalCostValue = 0;

    items.forEach((i) => {
      totalSaleValue += i.priceRub || 0;
      totalCostValue += i.costPriceRub || 0;
    });

    const avgMargin = totalSaleValue > 0
      ? Math.round(((totalSaleValue - totalCostValue) / totalSaleValue) * 1000) / 10
      : 0;

    const activeDiscountsCount = discountRules.filter(r => r.isActive).length;

    return {
      totalCount,
      inStockCount,
      onOrderCount: totalCount - inStockCount,
      avgMargin,
      totalCatalogValue: totalSaleValue,
      activeDiscountsCount
    };
  }, [items, discountRules]);

  // 1. Export full Multi-sheet Excel workbook with category tabs & auto-filters
  const handleExportFullExcel = () => {
    if (items.length === 0) {
      showToast('Нет данных для экспорта', 'error');
      return;
    }
    setIsExportMenuOpen(false);
    exportPriceListToExcel(items, discountRules, !hideCostPrice);
    showToast('Многостраничная книга Excel (.XLS) с автофильтрами успешно выгружена', 'success');
  };

  // 2. Export multi-section CSV with separate sheet sections
  const handleExportMultiSectionCsv = () => {
    if (items.length === 0) {
      showToast('Нет данных для экспорта', 'error');
      return;
    }
    setIsExportMenuOpen(false);
    exportPriceListMultiSectionCsv(items, discountRules, {
      sortField: sortField as any,
      sortDirection: sortDirection,
      includeEconomics: !hideCostPrice
    });
    showToast('Многостраничный CSV с разбивкой по разделам успешно сформирован', 'success');
  };

  // 3. Export separate CSV per each category sheet
  const handleExportPerCategoryCsv = async () => {
    if (items.length === 0) {
      showToast('Нет данных для экспорта', 'error');
      return;
    }
    setIsExportMenuOpen(false);
    showToast('Формирование отдельных файлов CSV по разделам...', 'info');
    await exportPriceListPerCategoryCsv(items, discountRules, {
      sortField: sortField as any,
      sortDirection: sortDirection,
      includeEconomics: !hideCostPrice
    });
    showToast('Файлы CSV по разделам прайс-листа успешно выгружены', 'success');
  };

  // 4. Export currently filtered and sorted items as CSV
  const handleExportFilteredCsv = () => {
    if (sortedItems.length === 0) {
      showToast('Нет данных для экспорта с учетом активных фильтров', 'error');
      return;
    }
    setIsExportMenuOpen(false);
    exportPriceListToCsv(sortedItems, discountRules, undefined, {
      includeEconomics: !hideCostPrice
    });
    showToast(`Экспортировано ${sortedItems.length} поз. в файл CSV`, 'success');
  };

  // 5. Execute custom configured export from modal
  const handleExecuteConfiguredExport = async () => {
    if (items.length === 0) {
      showToast('Нет данных для экспорта', 'error');
      return;
    }

    const opts: ExportFilterSortOptions = {
      sortField: exportSortField,
      sortDirection: exportSortDir,
      categoryFilter: exportCategory,
      stockFilter: exportStock,
      includeEconomics: exportIncludeEconomics
    };

    setIsExportConfigModalOpen(false);

    try {
      if (exportFormat === 'excel_multisheet') {
        exportPriceListToExcel(items, discountRules, exportIncludeEconomics, undefined, opts);
        showToast('Книга Excel со всеми разделами на отдельных листах выгружена', 'success');
      } else if (exportFormat === 'csv_multisection') {
        exportPriceListMultiSectionCsv(items, discountRules, opts);
        showToast('Многостраничный CSV с разделами успешно сохранен', 'success');
      } else if (exportFormat === 'csv_per_category') {
        showToast('Выгрузка файлов CSV по разделам...', 'info');
        await exportPriceListPerCategoryCsv(items, discountRules, opts);
        showToast('Файлы CSV по разделам успешно сохранены', 'success');
      } else {
        exportPriceListToCsv(items, discountRules, undefined, opts);
        showToast('Таблица CSV с выбранными фильтрами и сортировкой выгружена', 'success');
      }
    } catch (err: any) {
      console.error('Export error:', err);
      showToast('Ошибка при экспорте: ' + (err.message || String(err)), 'error');
    }
  };

  // Helper formatting money
  const formatRub = (val: number) => {
    return (val || 0).toLocaleString('ru-RU') + ' ₽';
  };

  // Handle Sort Toggle
  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Selected item for simulator
  const simulatedItem = useMemo(() => {
    if (!calcItemId) return items[0] || null;
    return items.find(i => i.id === calcItemId || i.sku === calcItemId) || items[0] || null;
  }, [items, calcItemId]);

  const simulatedDiscount = useMemo(() => {
    if (!simulatedItem) return null;
    const result = calculateDiscountForItem(simulatedItem, discountRules, calcQuantity);
    const econ = calculateItemEconomics(simulatedItem.costPriceRub, result.finalPriceRub);
    const totalWithoutVat = result.finalPriceRub * calcQuantity;
    const totalWithVat = Math.round(totalWithoutVat * 1.22);
    const totalSaved = result.discountAmountRub * calcQuantity;
    return {
      ...result,
      econ,
      totalWithoutVat,
      totalWithVat,
      totalSaved
    };
  }, [simulatedItem, discountRules, calcQuantity]);

  return (
    <div className={`flex flex-col gap-5 w-full ${className}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium border animate-in slide-in-from-top duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : toastMessage.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800'
              : 'bg-blue-950 text-blue-200 border-blue-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 hover:opacity-75 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Main Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Прейскурант и Номенклатурный справочник
              </h1>
              {isLiveConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Firestore Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Резервный режим
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Управление оборудованием, ПО, сервисными работами, тарифными сетками и скидками «ДС-Инжиниринг»
            </p>
          </div>
        </div>

        {/* Action Buttons & Tabs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportMenuOpen(prev => !prev)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              title="Экспорт прейскуранта в Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Экспорт прейскуранта</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsExportMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-88 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 flex items-center justify-between">
                    <span>ВАРИАНТЫ ЭКСПОРТА ПРАЙСА</span>
                    <span className="text-[10px] text-blue-400 font-semibold">{items.length} поз.</span>
                  </div>

                  {/* 1. Multi-sheet Excel */}
                  <button
                    type="button"
                    onClick={handleExportFullExcel}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                        <span>Книга Excel (.XLS)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">Листы + Автофильтр</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Каждый раздел на отдельном листе: Оборудование КИМ, ПО, Услуги, Оснастка, Сервис
                      </p>
                    </div>
                  </button>

                  {/* 2. Multi-section CSV */}
                  <button
                    type="button"
                    onClick={handleExportMultiSectionCsv}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-500/20">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 flex items-center gap-1.5">
                        <span>Многостраничный CSV</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">По разделам</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Единый файл с четким делением на листы-разделы, заголовками и суммами
                      </p>
                    </div>
                  </button>

                  {/* 3. Per-category separate CSVs */}
                  <button
                    type="button"
                    onClick={handleExportPerCategoryCsv}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-cyan-500/20">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center gap-1.5">
                        <span>Пакет CSV по разделам</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold">5 файлов</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Отдельные файлы CSV для каждого раздела с персональной нумерацией
                      </p>
                    </div>
                  </button>

                  {/* 4. Filtered flat CSV */}
                  <button
                    type="button"
                    onClick={handleExportFilteredCsv}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-500/20">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-300 flex items-center gap-1.5">
                        <span>Текущий список (CSV)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-semibold">{sortedItems.length} поз.</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Выгрузка таблицы с учетом текущих фильтров и сортировки
                      </p>
                    </div>
                  </button>

                  {/* 5. Custom configured export */}
                  <div className="pt-1 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        setIsExportConfigModalOpen(true);
                      }}
                      className="w-full p-2 rounded-xl text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 border border-indigo-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Настроить сортировку и фильтры экспорта...</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {!readOnly && (
            <>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Массовый импорт и обновление базы оборудования из CSV / Excel"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Импорт CSV</span>
              </button>

              <button
                type="button"
                onClick={() => handleSeedData(false)}
                disabled={isSeeding}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                title="Инициализировать базу Firestore стандартными данными 2026"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'Загрузка...' : 'Синхронизация Firestore'}</span>
              </button>

              {activeTab === 'catalog' ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить позицию</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingDiscountRule(null);
                    setIsDiscountModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Создать правило скидки</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Каталог номенклатуры и цены</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 text-white font-mono">
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('discounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'discounts'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BadgePercent className="w-4 h-4 text-emerald-400" />
          <span>Правила скидок и Спецпредложения</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
            {discountRules.filter(r => r.isActive).length} акт.
          </span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Всего позиций</div>
            <div className="text-xl font-bold text-white font-mono mt-0.5">{stats.totalCount}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">В наличии / На складе</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{stats.inStockCount}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Средняя маржинальность</div>
            <div className="text-xl font-bold text-indigo-400 font-mono mt-0.5">{stats.avgMargin}%</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Правила скидок</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">{stats.activeDiscountsCount} активных</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <BadgePercent className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: CATALOG AND PRICES                                             */}
      {/* ===================================================================== */}
      {activeTab === 'catalog' && (
        <div className="flex flex-col gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubCategory('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Все категории ({items.length})
            </button>

            {categories.map((cat) => {
              const count = items.filter((i) => i.category === cat.slug || i.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.slug || cat.id);
                    setSelectedSubCategory('all');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === (cat.slug || cat.id)
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-70 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search, Secondary Filters and Cost Visibility Toggle */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по артикулу, наименованию оборудования, производителю или характеристикам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {availableSubCategories.length > 0 && (
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Все подкатегории</option>
                  {availableSubCategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              )}

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Все статусы склада</option>
                <option value="in_stock">Только в наличии</option>
                <option value="on_order">Под заказ / транзит</option>
              </select>

              {/* Hide/Show Cost Price */}
              <button
                type="button"
                onClick={() => setHideCostPrice((prev) => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  hideCostPrice
                    ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                }`}
                title={hideCostPrice ? 'Показать себестоимость и маржу' : 'Скрыть себестоимость от клиента'}
              >
                {hideCostPrice ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                <span>{hideCostPrice ? 'Себестоимость скрыта' : 'Себестоимость видна'}</span>
              </button>
            </div>
          </div>

          {/* Catalog Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3.5 cursor-pointer hover:text-white" onClick={() => handleSortToggle('sku')}>
                      <div className="flex items-center gap-1">
                        <span>Артикул</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </div>
                    </th>
                    <th className="py-3 px-3.5 cursor-pointer hover:text-white" onClick={() => handleSortToggle('name')}>
                      <div className="flex items-center gap-1">
                        <span>Наименование и Бренд</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </div>
                    </th>
                    <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSortToggle('category')}>
                      <div className="flex items-center gap-1">
                        <span>Категория</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center">Наличие</th>
                    {!hideCostPrice && (
                      <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSortToggle('costPriceRub')}>
                        <div className="flex items-center justify-end gap-1">
                          <span>Закупка (руб)</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                        </div>
                      </th>
                    )}
                    <th className="py-3 px-3.5 text-right cursor-pointer hover:text-white" onClick={() => handleSortToggle('priceRub')}>
                      <div className="flex items-center justify-end gap-1">
                        <span>Цена без НДС</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center">Скидка / Акция</th>
                    <th className="py-3 px-3.5 text-right">Спеццена с НДС 22%</th>
                    {!hideCostPrice && (
                      <th className="py-3 px-3 text-center cursor-pointer hover:text-white" onClick={() => handleSortToggle('marginPercent')}>
                        <div className="flex items-center justify-center gap-1">
                          <span>Маржа / Наценка</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                        </div>
                      </th>
                    )}
                    <th className="py-3 px-2.5 text-center">Версия</th>
                    <th className="py-3 px-3 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                          <span>Загрузка позиций прайс-листа из Firestore...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedItems.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <Package className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <div>Позиции не найдены по заданным фильтрам.</div>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                            setSelectedSubCategory('all');
                          }}
                          className="mt-2 text-xs text-blue-400 hover:underline cursor-pointer"
                        >
                          Сбросить фильтры
                        </button>
                      </td>
                    </tr>
                  ) : (
                    sortedItems.map((item) => {
                      const econ = calculateItemEconomics(item.costPriceRub, item.priceRub);
                      const discCalc = calculateDiscountForItem(item, discountRules, 1);
                      const finalPriceWithVat = Math.round(discCalc.finalPriceRub * 1.22);
                      const hasDiscount = discCalc.discountAmountRub > 0;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* SKU */}
                          <td className="py-3 px-3.5 font-mono text-xs text-blue-400 font-semibold whitespace-nowrap">
                            <span>{item.sku}</span>
                          </td>

                          {/* Name & Manufacturer */}
                          <td className="py-3 px-3.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-1">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="text-slate-300 font-medium">{item.manufacturer}</span>
                                {item.unit && <span>• {item.unit}</span>}
                                {item.subCategory && (
                                  <span className="text-slate-500">({item.subCategory})</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              {item.categoryLabel || item.category}
                            </span>
                          </td>

                          {/* Stock Status */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {item.inStock ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                В наличии
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                {item.leadTimeDays ? `${item.leadTimeDays} дн.` : 'Заказ'}
                              </span>
                            )}
                          </td>

                          {/* Cost Price */}
                          {!hideCostPrice && (
                            <td className="py-3 px-3 text-right font-mono text-xs text-slate-400 whitespace-nowrap">
                              {formatRub(item.costPriceRub)}
                            </td>
                          )}

                          {/* Base Sale Price */}
                          <td className="py-3 px-3.5 text-right font-mono text-xs font-bold text-white whitespace-nowrap">
                            {hasDiscount ? (
                              <div>
                                <span className="line-through text-slate-500 text-[10.5px] block">
                                  {formatRub(item.priceRub)}
                                </span>
                                <span className="text-emerald-400">
                                  {formatRub(discCalc.finalPriceRub)}
                                </span>
                              </div>
                            ) : (
                              <span>{formatRub(item.priceRub)}</span>
                            )}
                          </td>

                          {/* Discount Indicator */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {hasDiscount ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <BadgePercent className="w-3 h-3 text-emerald-400" />
                                <span>-{discCalc.discountPercent}%</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-600">—</span>
                            )}
                          </td>

                          {/* Price with VAT 22% */}
                          <td className="py-3 px-3.5 text-right font-mono text-xs font-bold text-slate-200 whitespace-nowrap">
                            {formatRub(finalPriceWithVat)}
                          </td>

                          {/* Margin / Markup */}
                          {!hideCostPrice && (
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <div className="flex flex-col items-center">
                                <span
                                  className={`text-xs font-bold ${
                                    econ.marginPercent >= 30
                                      ? 'text-emerald-400'
                                      : econ.marginPercent >= 15
                                      ? 'text-blue-400'
                                      : 'text-amber-400'
                                  }`}
                                >
                                  {econ.marginPercent}%
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  нац. {econ.markupPercent}%
                                </span>
                              </div>
                            </td>
                          )}

                          {/* Version Badge & History trigger */}
                          <td className="py-3 px-2.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenHistory(item)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/25 transition-colors cursor-pointer"
                              title="Посмотреть историю версий цен позиции"
                            >
                              <Clock className="w-2.5 h-2.5" />
                              <span>v{item.currentVersion || 1}</span>
                            </button>
                          </td>

                          {/* Action buttons */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPreviewItem(item)}
                                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Быстрый просмотр"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {onSelectForProposal && (
                                <button
                                  type="button"
                                  onClick={() => onSelectForProposal(item)}
                                  className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                                  title="Вставить в Коммерческое предложение (ТКП)"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {!readOnly && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingItem(item);
                                      setIsCreateModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="Редактировать позицию"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(item.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="Удалить из каталога"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: DISCOUNT RULES & SPECIAL OFFERS                                 */}
      {/* ===================================================================== */}
      {activeTab === 'discounts' && (
        <div className="flex flex-col gap-5">
          {/* Rules Header & Top Actions */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-emerald-400" />
                Действующие правила скидок и тарифные условия
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Автоматически применяются к спецификациям ТКП и прайс-листу по категориям, позициям и объему
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingDiscountRule(null);
                setIsDiscountModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Создать правило</span>
            </button>
          </div>

          {/* Discount Rules Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discountRules.map((rule) => (
              <div
                key={rule.id}
                className={`border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  rule.isActive
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                        rule.discountType === 'percent'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}>
                        <Percent className="w-3.5 h-3.5" />
                        {rule.discountType === 'percent' ? `Скидка ${rule.discountValue}%` : `Скидка ${formatRub(rule.discountValue)}`}
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300">
                        {rule.scope === 'category' ? `Категория: ${rule.targetCategoryLabel || rule.targetCategoryId}` :
                         rule.scope === 'product' ? `Продукт: ${rule.targetItemName || rule.targetItemId}` :
                         'Глобальная скидка'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleRuleActive(rule)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                        rule.isActive
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {rule.isActive ? 'Активно' : 'Отключено'}
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">
                    {rule.name}
                  </h3>

                  {rule.description && (
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      {rule.description}
                    </p>
                  )}

                  {/* Conditions */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    {rule.minOrderQuantity && rule.minOrderQuantity > 1 && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Package className="w-3 h-3 text-blue-400" />
                        Мин. заказ: <strong>{rule.minOrderQuantity} шт.</strong>
                      </span>
                    )}
                    {rule.minOrderAmountRub && rule.minOrderAmountRub > 0 && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        Мин. сумма: <strong>{formatRub(rule.minOrderAmountRub)}</strong>
                      </span>
                    )}
                    {(!rule.minOrderQuantity || rule.minOrderQuantity <= 1) && (!rule.minOrderAmountRub || rule.minOrderAmountRub <= 0) && (
                      <span className="text-slate-400">Без ограничений по минимальному объему</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800/80 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDiscountRule(rule);
                      setIsDiscountModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Редактировать правило"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteDiscountRuleId(rule.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Удалить правило"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Discount Simulator */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Интерактивный симулятор расчета скидок прейскуранта
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Выберите позицию каталога:
                </label>
                <select
                  value={calcItemId}
                  onChange={(e) => setCalcItemId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.sku} — {item.name} ({formatRub(item.priceRub)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Количество (объем заказа):
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Источник примененной скидки:
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {simulatedDiscount?.appliedRule ? simulatedDiscount.appliedRule.name : (simulatedDiscount?.source === 'item_direct' ? 'Прямая скидка позиции' : 'Базовый прейскурант (без скидки)')}
                  </span>
                </div>
              </div>
            </div>

            {simulatedDiscount && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[11px] text-slate-400">Базовая цена позиции</div>
                  <div className="text-base font-bold text-slate-300 font-mono mt-0.5">
                    {formatRub(simulatedItem.priceRub)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Эффективная скидка</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                    -{simulatedDiscount.discountPercent}% ({formatRub(simulatedDiscount.discountAmountRub)} / ед.)
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Сумма заказа ({calcQuantity} шт.)</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {formatRub(simulatedDiscount.totalWithoutVat)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Экономия Заказчика</div>
                  <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                    {formatRub(simulatedDiscount.totalSaved)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREATE / EDIT DISCOUNT RULE                                    */}
      {/* ===================================================================== */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <BadgePercent className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {editingDiscountRule ? 'Редактирование правила скидки' : 'Создание нового правила скидки'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDiscountModalOpen(false);
                  setEditingDiscountRule(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscountRule} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Название правила / промо-акции <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingDiscountRule?.name || ''}
                  placeholder="например, Спецпредложение на пакетное ПО PolyWorks"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Область действия (Scope)
                  </label>
                  <select
                    name="scope"
                    defaultValue={editingDiscountRule?.scope || 'category'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="category">По категории номенклатуры</option>
                    <option value="product">По конкретному продукту/услуге</option>
                    <option value="global">Глобальная скидка на весь заказ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Категория (если выбрано по категории)
                  </label>
                  <select
                    name="targetCategoryId"
                    defaultValue={editingDiscountRule?.targetCategoryId || 'software'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug || c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Продукт (если выбрано по конкретному товару)
                </label>
                <select
                  name="targetItemId"
                  defaultValue={editingDiscountRule?.targetItemId || (items[0]?.id || '')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Не выбрано --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.sku} — {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Тип скидки
                  </label>
                  <select
                    name="discountType"
                    defaultValue={editingDiscountRule?.discountType || 'percent'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="percent">Процентная скидка (%)</option>
                    <option value="fixed_rub">Фиксированная скидка в рублях (₽)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Величина скидки (% или руб) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    required
                    min="1"
                    defaultValue={editingDiscountRule?.discountValue || 10}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Мин. объем заказа (шт)
                  </label>
                  <input
                    type="number"
                    name="minOrderQuantity"
                    min="1"
                    defaultValue={editingDiscountRule?.minOrderQuantity || 1}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Мин. сумма заказа (руб)
                  </label>
                  <input
                    type="number"
                    name="minOrderAmountRub"
                    min="0"
                    defaultValue={editingDiscountRule?.minOrderAmountRub || 0}
                    placeholder="0 — без порога"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Описание и маркетинговые условия
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingDiscountRule?.description || ''}
                  placeholder="Условия предоставления скидки и согласования с руководством..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ruleActive"
                  name="isActive"
                  defaultChecked={editingDiscountRule ? editingDiscountRule.isActive : true}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                />
                <label htmlFor="ruleActive" className="text-xs text-slate-300 cursor-pointer">
                  Правило активно и применяется в коммерческих предложениях
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsDiscountModalOpen(false);
                    setEditingDiscountRule(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить правило</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREATE / EDIT PRODUCT (ITEM)                                   */}
      {/* ===================================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  {editingItem ? 'Редактирование номенклатурной позиции' : 'Создание новой позиции прайс-листа'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Артикул (SKU) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    required
                    defaultValue={editingItem?.sku || ''}
                    placeholder="MIT-CA-V9106"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Производитель / Бренд
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    defaultValue={editingItem?.manufacturer || ''}
                    placeholder="Mitutoyo, Leica, PolyWorks..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Наименование номенклатуры <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingItem?.name || ''}
                  placeholder="Полное наименование оборудования или инжиниринговой услуги"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Категория
                  </label>
                  <select
                    name="category"
                    defaultValue={editingItem?.category || 'hardware'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug || c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Подкатегория
                  </label>
                  <input
                    type="text"
                    name="subCategory"
                    defaultValue={editingItem?.subCategory || ''}
                    placeholder="КИМ, Сканеры, CAM..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Единица измерения
                  </label>
                  <input
                    type="text"
                    name="unit"
                    defaultValue={editingItem?.unit || 'шт.'}
                    placeholder="шт., компл., лиц."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Себестоимость (руб)
                  </label>
                  <input
                    type="number"
                    name="costPriceRub"
                    min="0"
                    defaultValue={editingItem?.costPriceRub || 0}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Цена продажи без НДС (руб) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="priceRub"
                    required
                    min="1"
                    defaultValue={editingItem?.priceRub || 0}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Предельная скидка менеджера (%)
                  </label>
                  <input
                    type="number"
                    name="maxDiscountPercent"
                    min="0"
                    max="50"
                    defaultValue={editingItem?.maxDiscountPercent || 15}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Direct Discount Configuration on Item */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <BadgePercent className="w-4 h-4" />
                  <span>Индивидуальная скидка на позицию (промо / акция)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Тип скидки</label>
                    <select
                      name="discountType"
                      defaultValue={
                        editingItem?.discount
                          ? (typeof editingItem.discount === 'number' ? 'percent' : editingItem.discount.type)
                          : 'none'
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="none">Без скидки</option>
                      <option value="percent">Процентная скидка (%)</option>
                      <option value="fixed_rub">Фиксированная скидка (₽)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Значение скидки</label>
                    <input
                      type="number"
                      name="discountValue"
                      min="0"
                      defaultValue={
                        editingItem?.discount
                          ? (typeof editingItem.discount === 'number' ? editingItem.discount : editingItem.discount.value)
                          : 0
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Обоснование скидки</label>
                    <input
                      type="text"
                      name="discountDesc"
                      defaultValue={
                        editingItem?.discount && typeof editingItem.discount === 'object'
                          ? (editingItem.discount.description || '')
                          : ''
                      }
                      placeholder="Акции поставщика, комплект..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="itemInStock"
                    name="inStock"
                    defaultChecked={editingItem ? editingItem.inStock : true}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="itemInStock" className="text-xs text-slate-300 cursor-pointer">
                    Товар в наличии на складе в Самаре
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Срок поставки под заказ (дней)
                  </label>
                  <input
                    type="number"
                    name="leadTimeDays"
                    min="0"
                    defaultValue={editingItem?.leadTimeDays || 3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Техническое описание и комплектация
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingItem?.description || ''}
                  placeholder="Параметры точности, Госреестр СИ, диапазон измерений..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить в Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: PRICE VERSION HISTORY TIMELINE & REVERSION FORM                */}
      {/* ===================================================================== */}
      {historyModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    История версий цен: {historyModalItem.sku}
                  </h3>
                  <p className="text-xs text-slate-400">{historyModalItem.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalItem(null)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
              {/* Form to record a new version */}
              {!readOnly && (
                <div className="bg-slate-950 border border-indigo-900/40 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Зафиксировать новую редакцию цен (v{(historyModalItem.currentVersion || 1) + 1})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Новая себестоимость (руб)</label>
                      <input
                        type="number"
                        min="0"
                        value={newVersionCost}
                        onChange={(e) => setNewVersionCost(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Новая цена продажи без НДС (руб)</label>
                      <input
                        type="number"
                        min="1"
                        value={newVersionSale}
                        onChange={(e) => setNewVersionSale(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Причина изменения цен</label>
                    <input
                      type="text"
                      value={newVersionReason}
                      onChange={(e) => setNewVersionReason(e.target.value)}
                      placeholder="Индексация цен поставщика, смена курса..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={isSavingVersion}
                      onClick={handleSavePriceVersion}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingVersion ? 'Фиксация...' : 'Утвердить новую версию цены'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Version History List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Аудит версий и хронология изменений ({itemHistoryList.length})
                </h4>

                {isLoadingHistory ? (
                  <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Загрузка истории версий...</span>
                  </div>
                ) : itemHistoryList.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    История изменений цен пока пуста. Текущая цена установлена в редакции v1.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {itemHistoryList.map((record) => (
                      <div
                        key={record.id}
                        className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 font-mono">
                              v{record.versionNumber}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {formatRub(record.priceRub)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              (себестоимость: {formatRub(record.costPriceRub)}, маржа: {record.marginPercent}%)
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            <strong>Причина:</strong> {record.changeReason}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Изменил: {record.changedByManagerName} • {new Date(record.createdAt).toLocaleString('ru-RU')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirm Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Удалить позицию?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Вы уверены, что хотите удалить эту позицию из прейскуранта Firestore? Это действие необратимо.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Discount Rule Confirm Dialog */}
      {deleteDiscountRuleId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Удалить правило скидки?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Вы уверены, что хотите удалить данное правило скидок из базы данных Firestore?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteDiscountRuleId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDiscountRule(deleteDiscountRuleId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Configuration & Filter/Sort Modal */}
      {isExportConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Настройка экспорта прейскуранта</h3>
                  <p className="text-xs text-slate-400">
                    Выберите формат, разделение по листам, сортировку и критерии фильтрации
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportConfigModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Формат выгрузки и структура листов:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Excel Multisheet */}
                <div
                  onClick={() => setExportFormat('excel_multisheet')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    exportFormat === 'excel_multisheet'
                      ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${exportFormat === 'excel_multisheet' ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-white">Книга Excel (.XLS)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Каждый раздел на отдельном листе с автофильтрами и формулами
                  </p>
                </div>

                {/* CSV Multisection */}
                <div
                  onClick={() => setExportFormat('csv_multisection')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    exportFormat === 'csv_multisection'
                      ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className={`w-4 h-4 ${exportFormat === 'csv_multisection' ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-white">Многостраничный CSV</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Единый CSV с разделением на секции-листы с заголовками и суммами
                  </p>
                </div>

                {/* CSV Per Category */}
                <div
                  onClick={() => setExportFormat('csv_per_category')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    exportFormat === 'csv_per_category'
                      ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className={`w-4 h-4 ${exportFormat === 'csv_per_category' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-white">Пакет CSV по разделам</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Отдельный CSV файл для каждого раздела прайса
                  </p>
                </div>

                {/* Flat CSV */}
                <div
                  onClick={() => setExportFormat('csv_flat')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    exportFormat === 'csv_flat'
                      ? 'bg-blue-950/40 border-blue-500/60 ring-1 ring-blue-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Download className={`w-4 h-4 ${exportFormat === 'csv_flat' ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-white">Сводная таблица CSV</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Сплошная таблица без разбивки на разделы
                  </p>
                </div>
              </div>
            </div>

            {/* Sorting Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Сортировка по полю:</label>
                <select
                  value={exportSortField}
                  onChange={(e) => setExportSortField(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="sku">Артикул (SKU)</option>
                  <option value="name">Наименование оборудования / услуги</option>
                  <option value="category">Категория / Раздел</option>
                  <option value="priceRub">Базовая цена продажи (руб)</option>
                  <option value="costPriceRub">Себестоимость закупки (руб)</option>
                  <option value="marginPercent">Маржинальность (%)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Порядок сортировки:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportSortDir('asc')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-colors cursor-pointer ${
                      exportSortDir === 'asc'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    По возрастанию ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportSortDir('desc')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-colors cursor-pointer ${
                      exportSortDir === 'desc'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    По убыванию ↓
                  </button>
                </div>
              </div>
            </div>

            {/* Filtering Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Раздел номенклатуры:</label>
                <select
                  value={exportCategory}
                  onChange={(e) => setExportCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Все разделы прайса (полный каталог)</option>
                  <option value="hardware">1. Оборудование КИМ и 3D</option>
                  <option value="software">2. Программное обеспечение (CAD/CAM)</option>
                  <option value="services">3. Инжиниринговые услуги</option>
                  <option value="accessories">4. Оснастка и щупы Renishaw</option>
                  <option value="non_core_services">5. Сервис и калибровка (АРШИН)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Статус наличия:</label>
                <select
                  value={exportStock}
                  onChange={(e) => setExportStock(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Все позиции (в наличии и под заказ)</option>
                  <option value="in_stock">Только в наличии на складе</option>
                  <option value="on_order">Только поставляемые под заказ</option>
                </select>
              </div>
            </div>

            {/* Economics Checkbox */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/60">
                <input
                  type="checkbox"
                  checked={exportIncludeEconomics}
                  onChange={(e) => setExportIncludeEconomics(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Включать колонки себестоимости закупки и маржинальности (%)
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Снимите флажок, если прайс-лист выгружается для внешней отправки клиентам или контрагентам
                  </span>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsExportConfigModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleExecuteConfiguredExport}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Сформировать и скачать</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <PriceListCsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={async (result) => {
          showToast(`Импорт CSV успешно завершен: +${result.addedCount} новых, ${result.updatedCount} обновлено (всего ${result.totalCount} поз.)`, 'success');
          try {
            const refreshed = await PriceService.getAllPriceItems();
            if (refreshed && refreshed.length > 0) {
              setItems(refreshed);
            }
          } catch (e) {
            console.warn('Refresh notice:', e);
          }
        }}
        currentItems={items}
        isDark={true}
      />
    </div>
  );
};

export default PriceListManager;
