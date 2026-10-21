import React, { useState, useRef } from 'react';
import { 
  Plus, Edit3, Trash2, Search, Save, Package, Download, Upload, 
  FileSpreadsheet, ShieldCheck, CheckCircle2, RefreshCw, Layers, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { RichTextEditor } from './RichTextEditor';
import { FileUploadField } from '../common/FileUploadField';

export const CmsProductsEditor: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, showToast } = useApp();
  const [prodSearchQuery, setProdSearchQuery] = useState('');
  const [prodTypeFilter, setProdTypeFilter] = useState<'all' | 'software' | 'hardware'>('all');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('TopSolid SAS');
  const [newProdCategory, setNewProdCategory] = useState('software');
  const [newProdPrice, setNewProdPrice] = useState<string>('');
  const [newProdPriceText, setNewProdPriceText] = useState<string>('По запросу ТКП');
  const [newProdShortDesc, setNewProdShortDesc] = useState('');
  const [newProdFullDesc, setNewProdFullDesc] = useState('');
  const [newProdBadge, setNewProdBadge] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdBrochureUrl, setNewProdBrochureUrl] = useState('');
  const [newProdFeatures, setNewProdFeatures] = useState('');
  const [newProdSpecs, setNewProdSpecs] = useState<Array<{ key: string; value: string }>>([
    { key: 'Погрешность MPEe', value: 'от 0.015 мм' },
    { key: 'Диапазон измерений', value: 'до 4.5 м' }
  ]);

  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredProducts = products.filter(p => {
    if (prodTypeFilter !== 'all' && p.type !== prodTypeFilter) return false;
    if (prodSearchQuery && !p.name.toLowerCase().includes(prodSearchQuery.toLowerCase()) && !p.brand.toLowerCase().includes(prodSearchQuery.toLowerCase())) return false;
    return true;
  });

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Удалить продукт ${name} из каталога?`)) {
      deleteProduct(id);
      showToast(`Продукт ${name} удален`);
      if (editingProductId === id) {
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setEditingProductId(null);
    setNewProdName('');
    setNewProdBrand('TopSolid SAS');
    setNewProdCategory('software');
    setNewProdPrice('');
    setNewProdPriceText('По запросу ТКП');
    setNewProdShortDesc('');
    setNewProdFullDesc('');
    setNewProdBadge('');
    setNewProdImage('');
    setNewProdBrochureUrl('');
    setNewProdFeatures('');
    setNewProdSpecs([
      { key: 'Погрешность MPEe', value: 'от 0.015 мм' },
      { key: 'Диапазон измерений', value: 'до 4.5 м' }
    ]);
  };

  const handleEdit = (prod: Product) => {
    setEditingProductId(prod.id);
    setNewProdName(prod.name);
    setNewProdBrand(prod.brand);
    setNewProdCategory(prod.category);
    setNewProdPrice(prod.price ? String(prod.price) : '');
    setNewProdPriceText(prod.priceText || 'По запросу ТКП');
    setNewProdShortDesc(prod.shortDescription || '');
    setNewProdFullDesc(prod.fullDescription || '');
    setNewProdBadge(prod.badge || '');
    setNewProdImage(prod.image || (prod.gallery && prod.gallery[0]) || '');
    setNewProdBrochureUrl(prod.brochureUrl || '');
    setNewProdFeatures(prod.features ? prod.features.join('\n') : '');
    if (prod.specs && typeof prod.specs === 'object') {
      setNewProdSpecs(Object.entries(prod.specs).map(([key, value]) => ({ key, value })));
    } else {
      setNewProdSpecs([]);
    }
  };

  const handleAddSpec = () => {
    setNewProdSpecs(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setNewProdSpecs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, field: 'key' | 'value', val: string) => {
    setNewProdSpecs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const handleSave = () => {
    if (!newProdName.trim()) {
      showToast('Введите наименование продукта');
      return;
    }

    const specsObj: Record<string, string> = {};
    newProdSpecs.forEach(s => {
      if (s.key.trim()) {
        specsObj[s.key.trim()] = s.value.trim();
      }
    });

    const featuresList = newProdFeatures.split('\n').map(f => f.trim()).filter(Boolean);

    const data: Partial<Product> = {
      name: newProdName.trim(),
      brand: newProdBrand.trim(),
      category: newProdCategory,
      type: newProdCategory.includes('software') || newProdCategory === 'topsolid' || newProdCategory === 'polyworks' || newProdCategory === 'geomagic' ? 'software' : 'hardware',
      price: newProdPrice ? Number(newProdPrice) : undefined,
      priceText: newProdPriceText,
      shortDescription: newProdShortDesc,
      fullDescription: newProdFullDesc,
      badge: newProdBadge || undefined,
      image: newProdImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1000',
      gallery: [newProdImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1000'],
      brochureUrl: newProdBrochureUrl || undefined,
      specs: specsObj,
      features: featuresList.length > 0 ? featuresList : ['Гарантия 12 месяцев', 'Бесплатное обучение операторов', 'Техподдержка в РФ']
    };

    if (editingProductId) {
      updateProduct(editingProductId, data);
      showToast(`Продукт «${newProdName}» успешно обновлен`);
    } else {
      const newId = 'prod-' + Date.now();
      addProduct({
        id: newId,
        categoryLabel: newProdCategory,
        ...data
      } as Product);
      showToast(`Новый продукт «${newProdName}» добавлен в каталог`);
    }
    resetForm();
  };

  // Export Catalog to CSV (Excel format)
  const handleExportCsv = () => {
    const headers = ['ID', 'Тип', 'Бренд', 'Наименование', 'Категория', 'Цена (руб)', 'Статус цены', 'Бейдж', 'Краткое описание'];
    const rows = products.map(p => [
      `"${p.id}"`,
      `"${p.type}"`,
      `"${p.brand}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.price || ''}"`,
      `"${p.priceText || ''}"`,
      `"${p.badge || ''}"`,
      `"${(p.shortDescription || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Прайс_лист_ДС_Инжиниринг_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Прайс-лист успешно экспортирован в CSV (Excel)');
  };

  // Import Catalog from CSV/JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (item.id && item.name) {
                const existing = products.find(p => p.id === item.id);
                if (existing) {
                  updateProduct(item.id, item);
                } else {
                  addProduct(item);
                }
              }
            });
            showToast(`Успешно импортировано ${parsed.length} позиций из JSON`);
          }
        } else {
          // Parse CSV
          const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
          if (lines.length > 1) {
            let count = 0;
            // Skip header
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(';').map(c => c.replace(/^"|"$/g, '').trim());
              if (cols.length >= 4) {
                const [id, type, brand, name, category, price, priceText, badge, shortDesc] = cols;
                if (name) {
                  const existing = products.find(p => p.id === id);
                  const prodData: Partial<Product> = {
                    name,
                    brand: brand || 'ДС-Инжиниринг',
                    type: (type === 'hardware' || type === 'software') ? type : 'hardware',
                    category: category || 'scanners',
                    price: price ? Number(price) : undefined,
                    priceText: priceText || 'По запросу ТКП',
                    badge: badge || undefined,
                    shortDescription: shortDesc || ''
                  };

                  if (existing) {
                    updateProduct(id, prodData);
                  } else {
                    addProduct({
                      id: id || 'imp-' + Date.now() + '-' + i,
                      categoryLabel: category || 'Каталог',
                      specs: {},
                      features: [],
                      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1000'],
                      ...prodData
                    } as Product);
                  }
                  count++;
                }
              }
            }
            showToast(`Успешно загружено и обновлено ${count} позиций номенклатуры из прайса!`);
          }
        }
      } catch (err) {
        alert('Ошибка при чтении файла прайс-листа. Проверьте структуру CSV или JSON.');
      }
    };
    reader.readAsText(file, 'UTF-8');
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Action Ribbon */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
            Массовый импорт и экспорт номенклатуры каталога
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={csvFileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.json"
            className="hidden"
          />
          <button
            onClick={() => csvFileInputRef.current?.click()}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Загрузить прайс (CSV/JSON)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Выгрузить каталог в Excel (CSV)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Products List & Filters */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                Каталог ({products.length})
              </h3>
              <button
                onClick={resetForm}
                className="px-2.5 py-1 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-blue-100 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить товар
              </button>
            </div>

            {/* Type selector */}
            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'Все' },
                { id: 'hardware', label: 'Оборудование' },
                { id: 'software', label: 'ПО' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setProdTypeFilter(t.id as any)}
                  className={`px-4 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    prodTypeFilter === t.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={prodSearchQuery}
                onChange={e => setProdSearchQuery(e.target.value)}
                placeholder="Поиск по наименованию, бренду..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredProducts.map(prod => {
                const isCurrent = editingProductId === prod.id;
                return (
                  <div
                    key={prod.id}
                    className={`p-3 border rounded-xl flex justify-between items-center transition-all ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {prod.brand} • {prod.priceText || (prod.price ? (typeof prod.price === 'number' ? `${prod.price.toLocaleString('ru-RU')} ₽` : `${prod.price} ₽`) : 'По запросу')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="p-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        title="Редактировать карточку"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-1.5 text-rose-600 bg-rose-50 dark:bg-rose-900/40 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        title="Удалить позицию"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Right Column: Active Item Editor */}
        <div className="xl:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {editingProductId ? 'Редактирование карточки товара' : 'Создание нового продукта'}
              </h3>
              {editingProductId && (
                <span className="text-xs text-slate-400">ID: {editingProductId}</span>
              )}
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Наименование *</label>
                  <input
                    type="text"
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    placeholder="Например: TopSolid 7'Cam или FreeScan Combo"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Бренд / Производитель *</label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={e => setNewProdBrand(e.target.value)}
                    placeholder="Например: TopSolid SAS, SHINING 3D, InnovMetric"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Категория</label>
                  <select
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="topsolid">TopSolid 7 (CAD/CAM/PDM)</option>
                    <option value="polyworks">PolyWorks (Метрология)</option>
                    <option value="geomagic">Geomagic (Design X / Control X)</option>
                    <option value="shining3d-sw">Shining 3D Software</option>
                    <option value="scanners">3D-сканеры (Лазерные и оптические)</option>
                    <option value="arms">Измерительные руки (КИМ)</option>
                    <option value="trackers">Лазерные трекеры</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Цена числовая (₽)</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(e.target.value)}
                    placeholder="Оставьте пустым для запроса ТКП"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Отображение цены</label>
                  <input
                    type="text"
                    value={newProdPriceText}
                    onChange={e => setNewProdPriceText(e.target.value)}
                    placeholder="По запросу ТКП"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Бейдж / Отметка</label>
                <input
                  type="text"
                  value={newProdBadge}
                  onChange={e => setNewProdBadge(e.target.value)}
                  placeholder="Внесен в Госреестр СИ РФ / Хит продаж / Импортозамещение"
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FileUploadField 
                  label="Изображение товара" 
                  value={newProdImage} 
                  onChange={setNewProdImage} 
                  type="image"
                  placeholder="https://... или /images/products/scanner.png" 
                />
                <FileUploadField 
                  label="Брошюра / Спецификация (PDF)" 
                  value={newProdBrochureUrl} 
                  onChange={setNewProdBrochureUrl} 
                  type="document"
                  helperText="Файл паспорта или ТКП для скачивания"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Краткое описание</label>
                <textarea
                  rows={2}
                  value={newProdShortDesc}
                  onChange={e => setNewProdShortDesc(e.target.value)}
                  placeholder="Краткое назначение для списка и карточек..."
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Полное инженерное описание (с поддержкой HTML, WYSIWYG и Markdown)</label>
                <RichTextEditor
                  content={newProdFullDesc}
                  onChange={setNewProdFullDesc}
                  minHeight="min-h-[160px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Ключевые преимущества / особенности (по 1 в строке)</label>
                <textarea
                  rows={2}
                  value={newProdFeatures}
                  onChange={e => setNewProdFeatures(e.target.value)}
                  placeholder="Гарантия 12 месяцев&#10;Сертификат СИ РФ&#10;Обучение инженеров"
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Dynamic Technical Specifications */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wide">
                    Технические характеристики ({newProdSpecs.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить параметр</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newProdSpecs.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                        placeholder="Параметр (напр. «Погрешность»)"
                        className="w-1/2 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs font-medium"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        placeholder="Значение (напр. «0.020 мм»)"
                        className="w-1/2 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded cursor-pointer"
                        title="Удалить строку"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {editingProductId && (
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Отмена
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProductId ? 'Сохранить изменения' : 'Добавить продукт'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
