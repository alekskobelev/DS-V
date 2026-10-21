import React, { useState, useMemo, useEffect } from 'react';
import { 
  Tag, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Upload,
  Copy, 
  Check, 
  Layers, 
  Cpu, 
  Wrench, 
  Package, 
  Truck,
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Building2,
  DollarSign,
  HelpCircle,
  Info,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  History,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import { INDUSTRIAL_PRICE_LIST, PriceItem, PriceHistoryRecord, calculateItemEconomics } from '../../data/priceListsData';
import { PriceListCsvImportModal } from './PriceListCsvImportModal';

interface PriceListsRegistryProps {
  onOpenProposalWithItem: (item: PriceItem) => void;
  currentManagerName?: string;
  canManagePrices?: boolean;
}

export const PriceListsRegistry: React.FC<PriceListsRegistryProps> = ({
  onOpenProposalWithItem,
  currentManagerName = 'Некрасов С.Ю.',
  canManagePrices = true
}) => {
  const [items, setItems] = useState<PriceItem[]>(INDUSTRIAL_PRICE_LIST);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'name' | 'price_asc' | 'price_desc' | 'margin_desc' | 'cost_desc'>('popular');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [showCostPrice, setShowCostPrice] = useState<boolean>(true);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PriceItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Price History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<PriceItem | null>(null);
  const [historyList, setHistoryList] = useState<PriceHistoryRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showNewVersionForm, setShowNewVersionForm] = useState(false);
  const [newVersionCost, setNewVersionCost] = useState<number>(0);
  const [newVersionSale, setNewVersionSale] = useState<number>(0);
  const [newVersionReason, setNewVersionReason] = useState<string>('Плановая индексация цен');
  const [newVersionNotes, setNewVersionNotes] = useState<string>('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<PriceItem>>({
    category: 'software',
    categoryLabel: 'Программное ПО',
    unit: 'шт.',
    vatRate: 22,
    maxDiscountPercent: 15,
    inStock: true,
    leadTimeDays: 3,
    warrantyMonths: 12,
    costPriceRub: 0,
    priceRub: 0,
    isPopular: false,
    isActive: true
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch from REST API on mount
  const fetchPriceItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/crm/price-items');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
      }
    } catch (err) {
      console.warn('API fetch fallback to default price list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceItems();
  }, []);

  const categories = [
    { id: 'all', label: 'Все позиции', icon: Layers, count: items.length },
    { id: 'software', label: 'Программное ПО', icon: Cpu, count: items.filter(i => i.category === 'software').length },
    { id: 'hardware', label: 'Оборудование СИ', icon: Package, count: items.filter(i => i.category === 'hardware').length },
    { id: 'services', label: 'Инжиниринговые услуги', icon: Wrench, count: items.filter(i => i.category === 'services').length },
    { id: 'accessories', label: 'Оснастка и допоборудование', icon: Tag, count: items.filter(i => i.category === 'accessories').length },
    { id: 'non_core_services', label: 'Непрофильные услуги', icon: Truck, count: items.filter(i => i.category === 'non_core_services').length },
  ];

  // Subcategories of selected category
  const availableSubCategories = useMemo(() => {
    if (selectedCategory === 'all') return [];
    const subs = new Set<string>();
    items.filter(i => i.category === selectedCategory).forEach(i => {
      if (i.subCategory) subs.add(i.subCategory);
    });
    return Array.from(subs);
  }, [items, selectedCategory]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSubCategory = selectedSubCategory === 'all' || item.subCategory === selectedSubCategory;
      const matchesStock = !inStockOnly || item.inStock;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.manufacturer.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(query)) ||
        (item.notes && item.notes.toLowerCase().includes(query));

      return matchesCategory && matchesSubCategory && matchesStock && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'popular') {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return a.name.localeCompare(b.name, 'ru');
      }
      if (sortBy === 'price_asc') return a.priceRub - b.priceRub;
      if (sortBy === 'price_desc') return b.priceRub - a.priceRub;
      if (sortBy === 'margin_desc') {
        const margA = a.marginPercent || calculateItemEconomics(a.costPriceRub, a.priceRub).marginPercent;
        const margB = b.marginPercent || calculateItemEconomics(b.costPriceRub, b.priceRub).marginPercent;
        return margB - margA;
      }
      if (sortBy === 'cost_desc') return b.costPriceRub - a.costPriceRub;
      return a.name.localeCompare(b.name, 'ru');
    });
  }, [items, selectedCategory, selectedSubCategory, searchQuery, sortBy, inStockOnly]);

  // Financial statistics for current filtered catalog
  const catalogStats = useMemo(() => {
    const totalCount = filteredItems.length;
    let totalSaleRub = 0;
    let totalCostRub = 0;
    let totalStockCount = 0;

    filteredItems.forEach(i => {
      totalSaleRub += i.priceRub;
      totalCostRub += (i.costPriceRub || 0);
      if (i.inStock) totalStockCount++;
    });

    const avgMargin = totalSaleRub > 0 ? Math.round(((totalSaleRub - totalCostRub) / totalSaleRub) * 1000) / 10 : 0;

    return {
      totalCount,
      totalSaleRub,
      totalCostRub,
      totalStockCount,
      avgMargin
    };
  }, [filteredItems]);

  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku).then(() => {
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 2000);
    });
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const category = selectedCategory !== 'all' ? selectedCategory as any : 'hardware';
    const catLabel = categories.find(c => c.id === category)?.label || 'Оборудование СИ';
    setFormData({
      id: `price-${category.slice(0, 3)}-${Date.now()}`,
      sku: `DS-${category.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category,
      categoryLabel: catLabel,
      subCategory: '',
      manufacturer: 'ДС-Инжиниринг',
      description: '',
      unit: category === 'software' ? 'лицензия' : category === 'services' ? 'услуга' : 'комплект',
      costPriceRub: 0,
      priceRub: 0,
      vatRate: 22,
      maxDiscountPercent: 15,
      inStock: true,
      leadTimeDays: 3,
      warrantyMonths: 12,
      supplierName: '',
      notes: '',
      isPopular: false,
      isActive: true
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (item: PriceItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsEditModalOpen(true);
  };

  const handleOpenHistoryModal = async (item: PriceItem) => {
    setSelectedHistoryItem(item);
    setNewVersionCost(item.costPriceRub || 0);
    setNewVersionSale(item.priceRub || 0);
    setNewVersionReason('Плановая индексация цен');
    setNewVersionNotes('');
    setShowNewVersionForm(false);
    setIsHistoryModalOpen(true);
    setIsHistoryLoading(true);

    try {
      const res = await fetch(`/api/crm/price-items/${item.id}/history`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setHistoryList(data.history);
        }
      }
    } catch (err) {
      console.warn('History fetch error:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSaveNewPriceVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHistoryItem) return;
    if (!newVersionSale) {
      alert('Укажите новую цену продажи');
      return;
    }

    try {
      const res = await fetch(`/api/crm/price-items/${selectedHistoryItem.id}/change-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          costPriceRub: newVersionCost,
          priceRub: newVersionSale,
          changeReason: newVersionReason,
          changedByManagerName: currentManagerName,
          notes: newVersionNotes
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setItems(prev => prev.map(i => i.id === selectedHistoryItem.id ? data.item : i));
          setSelectedHistoryItem(data.item);
          if (data.version) {
            setHistoryList(prev => [data.version, ...prev]);
          }
          setShowNewVersionForm(false);
          showToast(`Цена [${data.item.sku}] успешно изменена до v${data.item.currentVersion}`);
        }
      }
    } catch (err) {
      console.error('Error changing price version:', err);
      showToast('Ошибка создания новой версии цены');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || formData.priceRub === undefined) {
      alert('Заполните обязательные поля: Артикул (SKU), Наименование и Цена продажи.');
      return;
    }

    try {
      const econ = calculateItemEconomics(Number(formData.costPriceRub) || 0, Number(formData.priceRub) || 0);
      const payload = {
        ...formData,
        costPriceRub: Number(formData.costPriceRub) || 0,
        priceRub: Number(formData.priceRub) || 0,
        marginPercent: econ.marginPercent,
        markupPercent: econ.markupPercent
      };

      if (editingItem) {
        // Update
        const res = await fetch(`/api/crm/price-items/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const resData = await res.json();
          setItems(prev => prev.map(i => i.id === editingItem.id ? resData.item : i));
          showToast(`Позиция ${payload.sku} успешно обновлена`);
        } else {
          // Local fallback
          setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...payload } as PriceItem : i));
          showToast(`Позиция обновлена локально`);
        }
      } else {
        // Create
        const res = await fetch('/api/crm/price-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const resData = await res.json();
          setItems(prev => [resData.item, ...prev]);
          showToast(`Позиция ${payload.sku} успешно добавлена в прайс-лист`);
        } else {
          // Local fallback
          const newItem = { ...payload, id: `price-local-${Date.now()}` } as PriceItem;
          setItems(prev => [newItem, ...prev]);
          showToast(`Позиция добавлена локально`);
        }
      }

      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error('Save price item error:', err);
      showToast('Ошибка сохранения позиции');
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/crm/price-items/${itemToDelete.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
        showToast(`Позиция ${itemToDelete.sku} удалена`);
      } else {
        setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
        showToast(`Позиция удалена`);
      }
    } catch (err) {
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      showToast(`Позиция удалена`);
    } finally {
      setItemToDelete(null);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Сбросить весь прайс-лист к эталонной номенклатуре компании ООО «ДС-Инжиниринг»?')) {
      return;
    }
    try {
      const res = await fetch('/api/crm/price-items/reset-defaults', { method: 'POST' });
      if (res.ok) {
        setItems([...INDUSTRIAL_PRICE_LIST]);
        showToast('Прайс-лист сброшен к заводским эталонным значениям');
      } else {
        setItems([...INDUSTRIAL_PRICE_LIST]);
        showToast('Прайс-лист сброшен');
      }
    } catch (err) {
      setItems([...INDUSTRIAL_PRICE_LIST]);
      showToast('Прайс-лист сброшен');
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Артикул',
      'Категория',
      'Подкатегория',
      'Наименование',
      'Производитель',
      'Ед. изм.',
      'Себестоимость закупки (руб)',
      'Цена продажи без НДС (руб)',
      'Ставка НДС %',
      'Сумма НДС 22% (руб)',
      'Итого с НДС 22% (руб)',
      'Маржинальность %',
      'Макс. скидка %',
      'Наличие',
      'Срок поставки (дни)',
      'Гарантия (мес)'
    ];

    const rows = filteredItems.map(item => {
      const vatAmount = Math.round(item.priceRub * (item.vatRate / 100));
      const totalWithVat = item.priceRub + vatAmount;
      const econ = calculateItemEconomics(item.costPriceRub, item.priceRub);

      return [
        `"${item.sku}"`,
        `"${item.categoryLabel}"`,
        `"${item.subCategory || ''}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.manufacturer}"`,
        `"${item.unit}"`,
        item.costPriceRub || 0,
        item.priceRub,
        `${item.vatRate}%`,
        vatAmount,
        totalWithVat,
        `${econ.marginPercent}%`,
        `${item.maxDiscountPercent}%`,
        `"${item.inStock ? 'В наличии' : 'Под заказ'}"`,
        item.leadTimeDays,
        item.warrantyMonths || 12
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DS_Engineering_PriceList_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Прайс-лист успешно экспортирован в CSV (Excel)');
  };

  const handleImportJson = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        alert('Данные должны быть массивом JSON объектов номенклатуры.');
        return;
      }
      const res = await fetch('/api/crm/price-items/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsed, mode: 'merge' })
      });
      if (res.ok) {
        await fetchPriceItems();
        setIsImportModalOpen(false);
        setImportJsonText('');
        showToast('Импорт успешно завершен!');
      } else {
        alert('Ошибка импорта на сервере.');
      }
    } catch (err: any) {
      alert('Ошибка парсинга JSON: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-top-4 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Прайс-лист и Справочник номенклатуры
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    НДС 22%
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Управление базовыми ценами, себестоимостью, пределом скидок и интеграция с ТКП и сделками CRM
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCostPrice(!showCostPrice)}
              title={showCostPrice ? "Скрыть закупочную себестоимость" : "Показать закупочную себестоимость"}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                showCostPrice 
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {showCostPrice ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showCostPrice ? 'Закупка видна' : 'Закупка скрыта'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Экспорт в CSV</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Массовый импорт и обновление номенклатуры из CSV / Excel"
            >
              <Upload className="w-3.5 h-3.5 text-blue-500" />
              <span>Импорт CSV</span>
            </button>

            <button
              onClick={handleResetDefaults}
              title="Сбросить к корпоративным эталонам"
              className="p-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {canManagePrices && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Добавить позицию</span>
              </button>
            )}
          </div>
        </div>

        {/* Financial KPI Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Позиций в выборке</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">{catalogStats.totalCount} шт.</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">В наличии на складе</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{catalogStats.totalStockCount} поз.</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Средняя маржинальность</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">{catalogStats.avgMargin}%</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Базовая ставка НДС</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">22% (РФ)</span>
          </div>
        </div>
      </div>

      {/* 5 Main Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedSubCategory('all');
              }}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate">{cat.label}</div>
                <div className={`text-[10px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                  {cat.count} поз.
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subcategories Filter Pills (if present) */}
      {availableSubCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold px-2">Подкатегории:</span>
          <button
            onClick={() => setSelectedSubCategory('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedSubCategory === 'all'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Все
          </button>
          {availableSubCategories.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubCategory(sub)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedSubCategory === sub
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по наименованию, артикулу (SKU), вендору, характеристикам..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* In Stock Toggle */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
              inStockOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Только в наличии</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Сортировка прайс-листа"
              className="bg-transparent border-none focus:outline-none text-xs font-semibold cursor-pointer"
            >
              <option value="popular">По популярности</option>
              <option value="name">По алфавиту (А–Я)</option>
              <option value="price_asc">Цена (сначала дешевле)</option>
              <option value="price_desc">Цена (сначала дороже)</option>
              <option value="margin_desc">По маржинальности</option>
              <option value="cost_desc">По себестоимости закупки</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Артикул / Позиция</th>
                <th className="py-3 px-3">Категория / Бренд</th>
                {showCostPrice && (
                  <th className="py-3 px-3 text-right">Закупка (Себестоимость)</th>
                )}
                <th className="py-3 px-3 text-right">Продажа без НДС</th>
                <th className="py-3 px-3 text-right">Итого с НДС 22%</th>
                {showCostPrice && (
                  <th className="py-3 px-3 text-center">Маржа / Наценка</th>
                )}
                <th className="py-3 px-3 text-center">Скидка / Наличие</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={showCostPrice ? 8 : 6} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-sm">Позиции по заданным фильтрам не найдены</p>
                    <p className="text-xs mt-1">Попробуйте изменить категорию или поисковый запрос</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const vatAmount = Math.round(item.priceRub * (item.vatRate / 100));
                  const totalWithVat = item.priceRub + vatAmount;
                  const econ = calculateItemEconomics(item.costPriceRub, item.priceRub);
                  const isMarginGood = econ.marginPercent >= 40;
                  const isMarginMedium = econ.marginPercent >= 25 && econ.marginPercent < 40;

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* SKU & Name */}
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => handleCopySku(item.sku)}
                            title="Скопировать артикул"
                            className="mt-0.5 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/60 hover:text-blue-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedSku === item.sku ? (
                              <Check className="w-2.5 h-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 opacity-60" />
                            )}
                            <span>{item.sku}</span>
                          </button>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{item.name}</span>
                              {item.isPopular && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  ХИТ
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                            {item.notes && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 italic mt-0.5 flex items-center gap-1">
                                <Info className="w-2.5 h-2.5" />
                                <span>{item.notes}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Manufacturer */}
                      <td className="py-3 px-3 align-top">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 inline-block">
                            {item.categoryLabel}
                          </span>
                          {item.subCategory && (
                            <div className="text-[10px] text-slate-400 pl-1">{item.subCategory}</div>
                          )}
                          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 pl-1">
                            {item.manufacturer}
                          </div>
                        </div>
                      </td>

                      {/* Cost Price (Purchasing) */}
                      {showCostPrice && (
                        <td className="py-3 px-3 text-right align-top font-mono">
                          <div className="font-semibold text-slate-700 dark:text-slate-300">
                            {item.costPriceRub ? item.costPriceRub.toLocaleString('ru-RU') : '0'} ₽
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {item.supplierName || 'Поставщик'}
                          </div>
                        </td>
                      )}

                      {/* Sale Price (Without VAT) */}
                      <td className="py-3 px-3 text-right align-top font-mono">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.priceRub.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          за {item.unit}
                        </div>
                      </td>

                      {/* Total with 22% VAT */}
                      <td className="py-3 px-3 text-right align-top font-mono">
                        <div className="font-bold text-blue-600 dark:text-blue-400">
                          {totalWithVat.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          в т.ч. НДС {vatAmount.toLocaleString('ru-RU')} ₽
                        </div>
                      </td>

                      {/* Margin & Markup */}
                      {showCostPrice && (
                        <td className="py-3 px-3 text-center align-top">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold font-mono ${
                            isMarginGood 
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : isMarginMedium
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {econ.marginPercent}%
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            +{econ.markupPercent}%
                          </div>
                        </td>
                      )}

                      {/* Max Discount & Stock */}
                      <td className="py-3 px-3 text-center align-top">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.inStock
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.inStock ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span>{item.inStock ? 'На складе' : `${item.leadTimeDays} раб. дн.`}</span>
                          </span>

                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            Скидка до {item.maxDiscountPercent}%
                          </div>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenProposalWithItem(item)}
                            title="Создать ТКП с этой позицией"
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {canManagePrices && (
                            <>
                              <button
                                onClick={() => handleOpenHistoryModal(item)}
                                title={`История версий цен (v${item.currentVersion || 1})`}
                                className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <History className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-mono font-bold">v{item.currentVersion || 1}</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditModal(item)}
                                title="Редактировать позицию"
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setItemToDelete(item)}
                                title="Удалить позицию"
                                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-500 border border-slate-200 dark:border-slate-700 hover:border-rose-300 transition-colors cursor-pointer"
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

      {/* MODAL: ADD / EDIT PRICE ITEM */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {editingItem ? 'Редактирование номенклатурной позиции' : 'Добавление новой позиции в прайс-лист'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Артикул (SKU) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="MIT-CA-V9106"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Категория номенклатуры *
                  </label>
                  <select
                    value={formData.category || 'software'}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      const catLabel = categories.find(c => c.id === cat)?.label || 'Оборудование';
                      setFormData({ ...formData, category: cat, categoryLabel: catLabel });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="software">1. Программное ПО (CAD/CAM/Metrology)</option>
                    <option value="hardware">2. Оборудование СИ (КИМ, 3D-сканеры, трекеры)</option>
                    <option value="services">3. Инжиниринговые услуги (ЦЗЛ, реверс, ЧПУ)</option>
                    <option value="accessories">4. Оснастка и допоборудование (щупы, сферы, ПК)</option>
                    <option value="non_core_services">5. Непрофильные услуги (доставка, такелаж, обучение)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Подкатегория / Направление
                  </label>
                  <input
                    type="text"
                    value={formData.subCategory || ''}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    placeholder="Например: Стационарные КИМ, Постпроцессоры"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Производитель / Бренд *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer || ''}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="Mitutoyo, TopSolid SAS, ДС-Инжиниринг"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Полное наименование для ТКП *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Координатно-измерительная машина PMT Future Plus (серия 9106)..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Описание комплектации и технических характеристик
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Диапазон измерений, точность MPEE, комплектация, тип лицензии..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Financial Box: Cost Price, Markup, Sale Price, VAT */}
              <div className="bg-blue-50/60 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-800/80 space-y-3">
                <div className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center justify-between">
                  <span>Финансово-ценовой блок и себестоимость</span>
                  <span className="text-[10px] font-normal text-blue-700 dark:text-blue-400">НДС 22% по умолчанию</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Закупка / Себестоимость (₽)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.costPriceRub ?? 0}
                      onChange={(e) => setFormData({ ...formData, costPriceRub: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Продажа без НДС (₽) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formData.priceRub ?? 0}
                      onChange={(e) => setFormData({ ...formData, priceRub: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-blue-600 dark:text-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Единица измерения
                    </label>
                    <input
                      type="text"
                      value={formData.unit || 'шт.'}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="шт., компл., лиц."
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Economics Calculation Result */}
                {(() => {
                  const econ = calculateItemEconomics(Number(formData.costPriceRub) || 0, Number(formData.priceRub) || 0);
                  const vatAmount = Math.round((Number(formData.priceRub) || 0) * 0.22);
                  const totalWithVat = (Number(formData.priceRub) || 0) + vatAmount;

                  return (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200/60 dark:border-blue-800/40 text-[11px]">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Маржинальность:</span>{' '}
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{econ.marginPercent}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Наценка:</span>{' '}
                        <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">+{econ.markupPercent}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 dark:text-slate-400">С НДС 22%:</span>{' '}
                        <span className="font-bold text-slate-900 dark:text-white font-mono">{totalWithVat.toLocaleString('ru-RU')} ₽</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Delivery & Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Макс. скидка менеджера (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={formData.maxDiscountPercent ?? 15}
                    onChange={(e) => setFormData({ ...formData, maxDiscountPercent: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Срок поставки (раб. дней)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.leadTimeDays ?? 3}
                    onChange={(e) => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Гарантия (месяцев)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.warrantyMonths ?? 12}
                    onChange={(e) => setFormData({ ...formData, warrantyMonths: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Поставщик / Контакт вендора
                  </label>
                  <input
                    type="text"
                    value={formData.supplierName || ''}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    placeholder="Например: Mitutoyo Europe / Oqton Channel"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Заметки для менеджеров (конфиденциально)
                  </label>
                  <input
                    type="text"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Условия спецскидок, бонусные опции..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Checkboxes: Stock & Popular */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.inStock)}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>В наличии на складе в РФ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isPopular)}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Отметить как Хит продаж (Топ)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
                >
                  {editingItem ? 'Сохранить изменения' : 'Добавить позицию'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Удалить позицию из прайс-листа?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Вы уверены, что хотите удалить позицию <span className="font-semibold text-slate-900 dark:text-white">[{itemToDelete.sku}] {itemToDelete.name}</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRICE VERSION HISTORY */}
      {isHistoryModalOpen && selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>История версий цен</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      [{selectedHistoryItem.sku}]
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                    {selectedHistoryItem.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Current Active Price Card */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 dark:from-indigo-950/30 dark:to-blue-950/30 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                    Текущая активная цена (Версия v{selectedHistoryItem.currentVersion || 1})
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {selectedHistoryItem.priceRub.toLocaleString('ru-RU')} ₽ <span className="text-xs font-sans text-slate-500">без НДС</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>Закупка: <b>{(selectedHistoryItem.costPriceRub || 0).toLocaleString('ru-RU')} ₽</b></span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Маржа: {selectedHistoryItem.marginPercent || calculateItemEconomics(selectedHistoryItem.costPriceRub, selectedHistoryItem.priceRub).marginPercent}%
                    </span>
                  </div>
                </div>

                {canManagePrices && (
                  <button
                    onClick={() => setShowNewVersionForm(!showNewVersionForm)}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showNewVersionForm ? 'Скрыть форму' : 'Изменить цену (v+1)'}</span>
                  </button>
                )}
              </div>

              {/* Form to create a new price version with explicit reason */}
              {showNewVersionForm && (
                <form onSubmit={handleSaveNewPriceVersion} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Фиксация новой версии цены (v{(selectedHistoryItem.currentVersion || 1) + 1})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Новая себестоимость закупки (₽)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={newVersionCost}
                        onChange={(e) => setNewVersionCost(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Новая цена продажи без НДС (₽) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={newVersionSale}
                        onChange={(e) => setNewVersionSale(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-indigo-600 dark:text-indigo-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Официальная причина изменения цены *
                    </label>
                    <input
                      type="text"
                      required
                      value={newVersionReason}
                      onChange={(e) => setNewVersionReason(e.target.value)}
                      placeholder="Индексация прайса вендора Mitutoyo, курсовая корректировка, сезонная скидка..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Внутренний комментарий / Примечание менеджера
                    </label>
                    <input
                      type="text"
                      value={newVersionNotes}
                      onChange={(e) => setNewVersionNotes(e.target.value)}
                      placeholder="Согласовано с генеральным директором..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowNewVersionForm(false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                    >
                      Сохранить новую версию v{(selectedHistoryItem.currentVersion || 1) + 1}
                    </button>
                  </div>
                </form>
              )}

              {/* Version History Timeline Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Хронология версий и изменений ({historyList.length})</span>
                  {isHistoryLoading && <span className="text-[10px] text-slate-400">Загрузка...</span>}
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {historyList.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      История версий формируется автоматически при изменениях цен
                    </div>
                  ) : (
                    historyList.map(hist => {
                      const isActive = !hist.validTo;
                      const econ = calculateItemEconomics(hist.costPriceRub, hist.priceRub);

                      return (
                        <div 
                          key={hist.id} 
                          className={`p-3.5 text-xs transition-colors ${
                            isActive ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                                isActive 
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}>
                                v{hist.versionNumber} {isActive ? '• АКТИВНАЯ' : ''}
                              </span>
                              <span className="text-slate-400 text-[10px] flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(hist.validFrom).toLocaleDateString('ru-RU')}
                              </span>
                            </div>

                            <div className="text-right font-mono">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {hist.priceRub.toLocaleString('ru-RU')} ₽
                              </span>
                              <span className="text-[10px] text-slate-400 ml-2">
                                (Закупка: {hist.costPriceRub.toLocaleString('ru-RU')} ₽, Маржа: {econ.marginPercent}%)
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                            <div className="font-medium text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                              <span>Причина:</span>
                              <span className="font-normal text-slate-800 dark:text-slate-200">{hist.changeReason}</span>
                            </div>
                            {hist.notes && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Комментарий: {hist.notes}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>Ответственный менеджер: {hist.changedByManagerName}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CSV IMPORT MODAL */}
      <PriceListCsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(result) => {
          fetchPriceItems();
          showToast(`Импорт успешно завершен: добавлено +${result.addedCount}, обновлено ${result.updatedCount} (всего обработано ${result.totalCount} поз.)`);
        }}
        currentItems={items}
        isDark={true}
      />
    </div>
  );
};
