import React, { useState, useRef } from 'react';
import {
  Laptop,
  Plus,
  Edit3,
  Trash2,
  Search,
  Save,
  Download,
  Upload,
  Eye,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  FileCode,
  FileSpreadsheet,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ProductFaqItem } from '../../types';
import { RichTextEditor } from './RichTextEditor';

export const CmsSoftwareEditor: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, showToast, navigateTo } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState<'all' | 'topsolid' | 'polyworks' | 'geomagic' | 'shining3d-sw'>('all');
  const [editingProductId, setEditingProductId] = useState<string | null>('topsolid-7');

  // Form states
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('TopSolid SAS');
  const [formCategory, setFormCategory] = useState('topsolid');
  const [formCategoryLabel, setFormCategoryLabel] = useState('CAD / CAM / PDM');
  const [formBadge, setFormBadge] = useState('');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formPriceText, setFormPriceText] = useState('По запросу ТКП');
  const [formImage, setFormImage] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formOfficialUrl, setFormOfficialUrl] = useState('');
  const [formBrochureUrl, setFormBrochureUrl] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formFullDesc, setFormFullDesc] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Sys Reqs state
  const [sysOs, setSysOs] = useState('Windows 11 / 10 (64-bit Pro / Enterprise)');
  const [sysCpu, setSysCpu] = useState('Intel Core i7 / i9 (12th Gen+) или AMD Ryzen 7 / 9');
  const [sysRam, setSysRam] = useState('32 ГБ (рекомендуется 64 ГБ для тяжелых сборок)');
  const [sysGpu, setSysGpu] = useState('NVIDIA RTX 4070 / RTX A4000 (8+ ГБ VRAM, OpenGL 4.5)');
  const [sysDisk, setSysDisk] = useState('50 ГБ свободного места на быстром NVMe SSD');

  // FAQ state
  const [formFaq, setFormFaq] = useState<ProductFaqItem[]>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Gallery
  const [formGallery, setFormGallery] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  // All software products
  const softwareProducts = products.filter(
    (p) =>
      p.type === 'software' ||
      p.category === 'topsolid' ||
      p.category === 'polyworks' ||
      p.category === 'geomagic' ||
      p.category === 'shining3d-sw'
  );

  const filteredProducts = softwareProducts.filter((p) => {
    if (familyFilter !== 'all' && p.category !== familyFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Load editing product into form
  const handleSelectProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormBrand(prod.brand);
    setFormCategory(prod.category);
    setFormCategoryLabel(prod.categoryLabel || 'Программное обеспечение');
    setFormBadge(prod.badge || '');
    setFormPrice(prod.price ? String(prod.price) : '');
    setFormPriceText(prod.priceText || 'По запросу ТКП');
    setFormImage(prod.image || '');
    setFormVideoUrl(prod.videoUrl || '');
    setFormOfficialUrl(prod.officialUrl || '');
    setFormBrochureUrl(prod.brochureUrl || '');
    setFormShortDesc(prod.shortDescription || '');
    setFormFullDesc(prod.fullDescription || '');
    setFormFeatures(prod.features ? [...prod.features] : []);
    setFormGallery(prod.gallery ? [...prod.gallery] : []);
    setFormFaq(prod.faq ? [...prod.faq] : []);

    // Sys reqs
    if (prod.sysReqs) {
      setSysOs(prod.sysReqs['ОС'] || prod.sysReqs['Операционная система'] || 'Windows 11 / 10 (64-bit)');
      setSysCpu(prod.sysReqs['Процессор'] || prod.sysReqs['CPU'] || 'Intel Core i7 / i9 или AMD Ryzen');
      setSysRam(prod.sysReqs['Оперативная память'] || prod.sysReqs['RAM'] || '32 ГБ (рекомендуется 64 ГБ)');
      setSysGpu(prod.sysReqs['Видеокарта'] || prod.sysReqs['GPU'] || 'NVIDIA RTX с поддержкой OpenGL');
      setSysDisk(prod.sysReqs['Диск'] || prod.sysReqs['Накопитель'] || 'NVMe SSD 50 ГБ');
    }
  };

  // Load initial product if available
  React.useEffect(() => {
    if (editingProductId) {
      const target = softwareProducts.find((p) => p.id === editingProductId);
      if (target) {
        handleSelectProduct(target);
      } else if (softwareProducts.length > 0) {
        handleSelectProduct(softwareProducts[0]);
      }
    } else if (softwareProducts.length > 0) {
      handleSelectProduct(softwareProducts[0]);
    }
  }, []);

  const resetForm = () => {
    setEditingProductId(null);
    setFormName('');
    setFormBrand('TopSolid SAS');
    setFormCategory('topsolid');
    setFormCategoryLabel('CAD / CAM / PDM');
    setFormBadge('');
    setFormPrice('');
    setFormPriceText('По запросу ТКП');
    setFormImage('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1000');
    setFormVideoUrl('');
    setFormOfficialUrl('');
    setFormBrochureUrl('');
    setFormShortDesc('');
    setFormFullDesc('');
    setFormFeatures(['Параметрическое моделирование', 'Анализ точности', 'Генерация отчетов FAI']);
    setFormGallery([]);
    setFormFaq([]);
    setSysOs('Windows 11 / 10 (64-bit)');
    setSysCpu('Intel Core i7 / i9 или AMD Ryzen');
    setSysRam('32 ГБ');
    setSysGpu('NVIDIA RTX с поддержкой OpenGL');
    setSysDisk('NVMe SSD 50 ГБ');
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormFeatures([...formFeatures, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFormFeatures(formFeatures.filter((_, i) => i !== index));
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setFormGallery([...formGallery, newGalleryUrl.trim()]);
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryUrl = (index: number) => {
    setFormGallery(formGallery.filter((_, i) => i !== index));
  };

  const handleAddFaqItem = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
      showToast('Заполните вопрос и ответ');
      return;
    }
    setFormFaq([
      ...formFaq,
      {
        id: 'faq-' + Date.now(),
        question: newFaqQuestion.trim(),
        answer: newFaqAnswer.trim(),
        categoryTag: 'ПО'
      }
    ]);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  const handleRemoveFaqItem = (index: number) => {
    setFormFaq(formFaq.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!formName.trim()) {
      showToast('Введите наименование программного комплекса');
      return;
    }

    const sysReqsData: Record<string, string> = {
      'ОС': sysOs,
      'Процессор': sysCpu,
      'Оперативная память': sysRam,
      'Видеокарта': sysGpu,
      'Накопитель': sysDisk
    };

    const productPayload: Partial<Product> = {
      name: formName.trim(),
      brand: formBrand.trim(),
      type: 'software',
      category: formCategory,
      categoryLabel: formCategoryLabel.trim() || 'Программное обеспечение',
      badge: formBadge.trim() || undefined,
      price: formPrice ? Number(formPrice) : undefined,
      priceText: formPriceText.trim() || 'По запросу ТКП',
      image: formImage.trim() || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1000',
      videoUrl: formVideoUrl.trim() || undefined,
      officialUrl: formOfficialUrl.trim() || undefined,
      brochureUrl: formBrochureUrl.trim() || undefined,
      shortDescription: formShortDesc.trim(),
      fullDescription: formFullDesc.trim(),
      features: formFeatures,
      gallery: formGallery.length > 0 ? formGallery : undefined,
      sysReqs: sysReqsData,
      faq: formFaq.length > 0 ? formFaq : undefined
    };

    if (editingProductId) {
      updateProduct(editingProductId, productPayload);
      showToast(`Программный комплекс «${formName}» успешно обновлен`);
    } else {
      const newId = 'sw-' + formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('sw-' + Date.now());
      addProduct({
        id: newId,
        ...productPayload
      } as Product);
      setEditingProductId(newId);
      showToast(`Новый программный комплекс «${formName}» успешно добавлен`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить программный комплекс «${name}»?`)) {
      deleteProduct(id);
      showToast(`ПО «${name}» удалено`);
      if (editingProductId === id) {
        resetForm();
      }
    }
  };

  // Export / Import
  const handleExportSoftwareJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(softwareProducts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `software_catalog_ds_engineering_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Каталог ПО выгружен в JSON');
  };

  const handleImportSoftwareJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (item.id && item.name) {
              const existing = products.find((p) => p.id === item.id);
              if (existing) {
                updateProduct(item.id, item);
              } else {
                addProduct(item);
              }
            }
          });
          showToast(`Импортировано ${parsed.length} продуктов ПО`);
        }
      } catch (err) {
        alert('Ошибка при импорте JSON файла');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-xl p-6 text-white border border-blue-800/40 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Laptop className="w-4 h-4" />
            Управление разделами Программного Обеспечения (ПО)
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Редактор страниц CAD / CAM / Метрологии и Реверс-инжиниринга
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Настройка описаний, ключевых преимуществ, системных требований, видеообзоров, сертификатов и реестра FAQ для любого программного комплекса.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={jsonFileInputRef}
            onChange={handleImportSoftwareJson}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => jsonFileInputRef.current?.click()}
            className="px-4.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Импорт ПО (JSON)</span>
          </button>
          <button
            onClick={handleExportSoftwareJson}
            className="px-4.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Экспорт ПО (JSON)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Software Products List */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                Программы ({filteredProducts.length})
              </h3>
              <button
                onClick={resetForm}
                className="px-2.5 py-1 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 hover:bg-sky-100 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить ПО
              </button>
            </div>

            {/* Family Filters */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Все ПО' },
                { id: 'topsolid', label: 'TopSolid' },
                { id: 'polyworks', label: 'PolyWorks' },
                { id: 'geomagic', label: 'Geomagic' },
                { id: 'shining3d-sw', label: 'Shining 3D' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFamilyFilter(f.id as any)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    familyFilter === f.id
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию или бренду..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Product Cards List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => {
                const isSelected = editingProductId === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/50 shadow-xs'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                          {prod.category}
                        </span>
                        {prod.badge && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {prod.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {prod.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {prod.brand} • {prod.priceText || 'По запросу ТКП'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo('software', prod.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Просмотреть страницу на сайте"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(prod.id, prod.name);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Удалить программный комплекс"
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

        {/* Right Column: Active Software Form Editor */}
        <div className="xl:col-span-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Header with preview & save */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  {editingProductId ? 'Редактирование программного комплекса' : 'Создание нового программного продукта'}
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {formName || 'Новое ПО'}
                </h3>
                {editingProductId && (
                  <div className="text-xs text-slate-400 mt-0.5">
                    Системный ID: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">{editingProductId}</code>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {editingProductId && (
                  <button
                    onClick={() => navigateTo('software', editingProductId)}
                    className="px-4.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Открыть на сайте</span>
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-sky-600/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить в базу</span>
                </button>
              </div>
            </div>

            {/* Section 1: Base Parameters */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-sky-600" />
                1. Основные параметры и идентификация
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Наименование ПО *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Например: TopSolid 7 CAD/CAM или PolyWorks|Inspector"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Разработчик / Бренд *</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="Например: TopSolid SAS (Франция), InnovMetric (Канада)"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Семейство / Категория</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="topsolid">TopSolid 7 (CAD/CAM/PDM)</option>
                    <option value="polyworks">PolyWorks (Метрология и КИМ)</option>
                    <option value="geomagic">Geomagic (Design X / Control X)</option>
                    <option value="shining3d-sw">Shining 3D Software (EXModel / Inspect)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Подпись направления</label>
                  <input
                    type="text"
                    value={formCategoryLabel}
                    onChange={(e) => setFormCategoryLabel(e.target.value)}
                    placeholder="CAD / CAM / PDM комплекс"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Бейдж / Статус</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="PTB Class 1 / Контроль GD&T / LiveTransfer™"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Отображение цены / Условия поставки</label>
                  <input
                    type="text"
                    value={formPriceText}
                    onChange={(e) => setFormPriceText(e.target.value)}
                    placeholder="По запросу ТКП / Бессрочные лицензии и аренда"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Официальный сайт разработчика (URL)</label>
                  <input
                    type="text"
                    value={formOfficialUrl}
                    onChange={(e) => setFormOfficialUrl(e.target.value)}
                    placeholder="https://www.topsolid.com/ru"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Descriptions */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                2. Инженерные описания и позиционирование
              </h4>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Краткое описание (для каталога и сниппетов)</label>
                <textarea
                  rows={2}
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="Краткое описание назначения программного продукта..."
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Полное техническое описание (с поддержкой HTML, WYSIWYG и Markdown)</label>
                <RichTextEditor
                  content={formFullDesc}
                  onChange={setFormFullDesc}
                  minHeight="min-h-[160px]"
                />
              </div>
            </div>

            {/* Section 3: Media */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                3. Медиаматериалы, видео и галерея интерфейса
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Главное изображение (URL)</label>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  {formImage && (
                    <div className="mt-2 h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950">
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Видеообзор / Демонстрация (YouTube / RuTube URL)</label>
                  <input
                    type="text"
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-500 space-y-1">
                    <div className="font-bold text-slate-700 dark:text-slate-300">Поддерживаемые форматы:</div>
                    <div>Прямые ссылки на YouTube (watch?v= или embed), RuTube, VK Видео или MP4 поток.</div>
                  </div>
                </div>
              </div>

              {/* Gallery Items */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Дополнительные скриншоты интерфейса (Галерея)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="URL скриншота интерфейса..."
                    className="flex-1 p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Добавить
                  </button>
                </div>

                {formGallery.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {formGallery.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-20 bg-slate-950">
                        <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveGalleryUrl(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                          title="Удалить скриншот"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Key Features (Dynamic list) */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  4. Ключевые технологические возможности ({formFeatures.length})
                </h4>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  placeholder="Добавить пункт возможностей (нажмите Enter)..."
                  className="flex-1 p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Добавить
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {formFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                      title="Удалить пункт"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: System Requirements */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-600" />
                5. Рекомендуемые системные требования рабочей станции
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Операционная система (ОС)</label>
                  <input
                    type="text"
                    value={sysOs}
                    onChange={(e) => setSysOs(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Процессор (CPU)</label>
                  <input
                    type="text"
                    value={sysCpu}
                    onChange={(e) => setSysCpu(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Оперативная память (RAM)</label>
                  <input
                    type="text"
                    value={sysRam}
                    onChange={(e) => setSysRam(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Видеокарта (GPU)</label>
                  <input
                    type="text"
                    value={sysGpu}
                    onChange={(e) => setSysGpu(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Дисковое пространство / Накопитель</label>
                  <input
                    type="text"
                    value={sysDisk}
                    onChange={(e) => setSysDisk(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Product FAQ */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                6. База вопросов и ответов (FAQ) для продукта ({formFaq.length})
              </h4>

              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="Вопрос инженера (например: Возможен ли сетевой режим лицензирования?)"
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <textarea
                  rows={2}
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  placeholder="Ответ технического эксперта..."
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddFaqItem}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Добавить в FAQ
                </button>
              </div>

              {formFaq.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formFaq.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 relative group"
                    >
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white pr-6">
                        {item.question}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                        {item.answer}
                      </div>
                      <button
                        onClick={() => handleRemoveFaqItem(idx)}
                        className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        title="Удалить вопрос"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-400">
                Все изменения мгновенно синхронизируются с каталогом и карточками на сайте.
              </div>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm shadow-sky-600/30 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingProductId ? 'Сохранить изменения в ПО' : 'Создать программный комплекс'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
